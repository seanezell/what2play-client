import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function GamePicker() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);
  const [picking, setPicking] = useState(false);
  const [pickedGame, setPickedGame] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const result = await apiCall(ENDPOINTS.LIST_GROUPS);
      setGroups(result.groups || []);
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePick = async () => {
    if (!selectedGroup) return;

    try {
      setPicking(true);
      setError(null);
      setPickedGame(null);
      const result = await apiCall(ENDPOINTS.PICK_GAME, {
        method: 'POST',
        body: JSON.stringify({ group_id: selectedGroup }),
      });
      setPickedGame(result);
    } catch (err) {
      console.error('Failed to pick game:', err);
      setError(err.message || 'Failed to pick a game');
    } finally {
      setPicking(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="bg-slate-800 p-6 rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-white">🎮 What 2 Play</h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}

      {pickedGame && (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-6 py-4 rounded text-center">
          <div className="text-lg font-bold mb-2">🎉 Time to play:</div>
          <div className="text-2xl font-bold">{pickedGame.game_name || pickedGame.name}</div>
          {pickedGame.platform && (
            <div className="text-sm mt-2 opacity-80">{pickedGame.platform}</div>
          )}
        </div>
      )}

      {groups.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          Create a group first to pick a game!
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Select a Group</label>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a group...</option>
              {groups.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.group_name || 'Unnamed Group'} ({group.members?.length || 0} members)
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handlePick}
            disabled={!selectedGroup || picking}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 font-bold text-lg"
          >
            {picking ? 'Picking...' : '🎲 Pick a Game!'}
          </button>
        </div>
      )}
    </div>
  );
}
