import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import { getCurrentUserId } from '../auth';

const weightColor = (w) => w <= 3 ? 'text-red-400' : w <= 7 ? 'text-yellow-400' : 'text-green-400';
const weightBg = (w) => w <= 3 ? 'bg-red-900/40' : w <= 7 ? 'bg-yellow-900/40' : 'bg-green-900/40';

function Avatar({ member, size = 'sm' }) {
  const dim = size === 'sm' ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm';
  return member.avatar_url ? (
    <img src={member.avatar_url} alt={member.username} className={`${dim} rounded-full object-cover`} />
  ) : (
    <div className={`${dim} rounded-full bg-slate-600 flex items-center justify-center text-white font-bold`}>
      {member.username.charAt(0).toUpperCase()}
    </div>
  );
}

export default function GroupDetail({ group, profile, onClose, onGroupUpdated, onGroupDeleted }) {
  const currentUserId = getCurrentUserId();
  const [members, setMembers] = useState(group.members || []);
  const [groupName, setGroupName] = useState(group.group_name || '');
  const [pickableGames, setPickableGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [sortCol, setSortCol] = useState('avg');
  const [sortDir, setSortDir] = useState('desc');
  const [editingName, setEditingName] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (currentMembers = members) => {
    try {
      setLoading(true);
      const [gameResults, friendsResult] = await Promise.all([
        Promise.all(currentMembers.map(m =>
          m.user_id === currentUserId
            ? apiCall(ENDPOINTS.LIST_GAMES)
            : apiCall(`${ENDPOINTS.LIST_FRIENDS_GAMES}?user_id=${m.user_id}`)
        )),
        apiCall(ENDPOINTS.LIST_FRIENDS),
      ]);

      setFriends(friendsResult.friends || []);

      const friendMap = Object.fromEntries((friendsResult.friends || []).map(f => [f.user_id, f]));
      setMembers(currentMembers.map(m => ({
        ...m,
        avatar_url: m.user_id === currentUserId ? (profile?.avatar_url || null) : (friendMap[m.user_id]?.avatar_url || null),
      })));

      const memberGameMaps = gameResults.map(r =>
        Object.fromEntries((r.games || []).map(g => [g.game_id.toLowerCase(), g]))
      );

      if (memberGameMaps.length === 0) { setPickableGames([]); return; }

      const [first, ...rest] = memberGameMaps;
      const intersection = Object.keys(first).filter(id => rest.every(m => id in m));

      setPickableGames(intersection.map(gameId => {
        const weights = memberGameMaps.map(m => m[gameId]?.weight ?? 5);
        const avg = weights.reduce((a, b) => a + b, 0) / weights.length;
        return {
          game_id: gameId,
          name: first[gameId]?.name || gameId,
          weights,
          avg: Math.round(avg * 10) / 10,
        };
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (col) => {
    if (sortCol === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCol(col);
      setSortDir('desc');
    }
  };

  const sortedGames = [...pickableGames].sort((a, b) => {
    let aVal, bVal;
    if (sortCol === 'avg') { aVal = a.avg; bVal = b.avg; }
    else if (sortCol === 'name') { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase(); }
    else { aVal = a.weights[sortCol] ?? 0; bVal = b.weights[sortCol] ?? 0; }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const sortIndicator = (col) => sortCol === col ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const handleSaveName = async () => {
    if (!groupName.trim()) return;
    try {
      setSaving(true);
      await apiCall(`${ENDPOINTS.UPDATE_GROUP}${group.group_id}`, {
        method: 'PUT',
        body: JSON.stringify({ group_name: groupName.trim() }),
      });
      setEditingName(false);
      onGroupUpdated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    const updated = members.filter(m => m.user_id !== userId);
    try {
      setSaving(true);
      await apiCall(`${ENDPOINTS.UPDATE_GROUP}${group.group_id}`, {
        method: 'PUT',
        body: JSON.stringify({ members: updated }),
      });
      setMembers(updated);
      onGroupUpdated();
      await loadData(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMember = async (friend) => {
    const updated = [...members, { user_id: friend.user_id, username: friend.username }];
    try {
      setSaving(true);
      await apiCall(`${ENDPOINTS.UPDATE_GROUP}${group.group_id}`, {
        method: 'PUT',
        body: JSON.stringify({ members: updated }),
      });
      setMembers(updated);
      onGroupUpdated();
      await loadData(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${group.group_name || 'this group'}"? This cannot be undone.`)) return;
    try {
      await apiCall(`${ENDPOINTS.DELETE_GROUP}${group.group_id}`, { method: 'DELETE' });
      onGroupDeleted();
    } catch (err) {
      setError(err.message);
    }
  };

  const friendsNotInGroup = friends.filter(f => !members.some(m => m.user_id === f.user_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-slate-800 rounded-lg w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  className="px-2 py-1 bg-slate-700 text-white rounded border border-slate-500 focus:outline-none focus:border-blue-500 text-xl font-bold"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={saving} className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                  Save
                </button>
                <button onClick={() => { setGroupName(group.group_name); setEditingName(false); }} className="px-3 py-1 bg-slate-600 text-white rounded text-sm hover:bg-slate-500">
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{groupName || 'Unnamed Group'}</h2>
                <button onClick={() => setEditingName(true)} className="text-slate-400 hover:text-white text-sm">✏️</button>
              </div>
            )}
            <p className="text-slate-400 text-sm mt-1">{members.length} members · {pickableGames.length} games in common</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">✕</button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded text-sm">{error}</div>
        )}

        {/* Game Table */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">Pickable Games</h3>
            <span className="text-xs text-slate-500">Games every member has · click column to sort</span>
          </div>

          {loading ? (
            <div className="text-slate-400 py-8 text-center">Loading games...</div>
          ) : pickableGames.length === 0 ? (
            <div className="text-slate-400 py-8 text-center">No games in common across all members.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th
                      className="text-left py-2 pr-4 text-slate-400 font-medium cursor-pointer hover:text-white whitespace-nowrap"
                      onClick={() => handleSort('name')}
                    >
                      Game{sortIndicator('name')}
                    </th>
                    {members.map((m, i) => (
                      <th
                        key={m.user_id}
                        className="py-2 px-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                        onClick={() => handleSort(i)}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <Avatar member={m} />
                          <span className="text-xs whitespace-nowrap">{m.username}{sortIndicator(i)}</span>
                        </div>
                      </th>
                    ))}
                    <th
                      className="py-2 px-3 text-slate-400 font-medium cursor-pointer hover:text-white"
                      onClick={() => handleSort('avg')}
                    >
                      Avg{sortIndicator('avg')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedGames.map(game => (
                    <tr key={game.game_id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="py-2 pr-4 text-white">{game.name}</td>
                      {game.weights.map((w, i) => (
                        <td key={i} className="py-2 px-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${weightBg(w)} ${weightColor(w)}`}>
                            {w}
                          </span>
                        </td>
                      ))}
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${weightBg(game.avg)} ${weightColor(game.avg)}`}>
                          {game.avg}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Management */}
        <div className="px-6 pb-6 border-t border-slate-700 pt-4 space-y-4">
          <h3 className="text-white font-medium">Manage Members</h3>

          <div className="space-y-2">
            {members.map(m => (
              <div key={m.user_id} className="flex items-center justify-between bg-slate-700/50 px-3 py-2 rounded">
                <div className="flex items-center gap-2">
                  <Avatar member={m} size="sm" />
                  <span className="text-white text-sm">{m.username}</span>
                  {m.user_id === group.owner_id && <span className="text-xs text-slate-400">(owner)</span>}
                </div>
                {m.user_id !== currentUserId && m.user_id !== group.owner_id && (
                  <button
                    onClick={() => handleRemoveMember(m.user_id)}
                    disabled={saving}
                    className="text-xs px-2 py-1 bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>

          {friendsNotInGroup.length > 0 && (
            <select
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500 text-sm"
              value=""
              onChange={e => {
                const friend = friends.find(f => f.user_id === e.target.value);
                if (friend) handleAddMember(friend);
              }}
            >
              <option value="" disabled>Add a friend...</option>
              {friendsNotInGroup.map(f => (
                <option key={f.user_id} value={f.user_id}>{f.username}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-700 text-white rounded text-sm hover:bg-red-600"
          >
            Delete Group
          </button>
        </div>
      </div>
    </div>
  );
}
