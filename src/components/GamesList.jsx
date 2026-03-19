import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import EditGameModal from './EditGameModal';

export default function GamesList({ profile }) {
  const [games, setGames] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState('');
  const [friendGames, setFriendGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGame, setEditingGame] = useState(null);

  const platformIcons = {
    'PC': '🖥️',
  };

  const visibilityIcons = {
    'public': '🌐',
    'friends': '👥',
    'private': '🔒',
  };

  const getCommonGames = () => {
    if (!selectedFriend || friendGames.length === 0) return new Set();
    const myGameIds = new Set(games.map(g => g.game_id.toLowerCase()));
    return new Set(friendGames.filter(g => myGameIds.has(g.game_id.toLowerCase())).map(g => g.game_id.toLowerCase()));
  };

  const getSortedGames = () => {
    if (!selectedFriend) return games.map(g => ({ ...g, isMine: true }));
    
    const commonGames = getCommonGames();
    const myGameIds = new Set(games.map(g => g.game_id.toLowerCase()));
    
    // Common games
    const commonMyGames = games
      .filter(g => commonGames.has(g.game_id.toLowerCase()))
      .map(g => ({ ...g, isMine: true }));
    
    // Friend-only games (not in my list)
    const friendOnlyGames = friendGames
      .filter(g => !myGameIds.has(g.game_id.toLowerCase()))
      .map(g => ({ ...g, isMine: false, name: g.game_id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }));
    
    // My non-common games
    const myOnlyGames = games
      .filter(g => !commonGames.has(g.game_id.toLowerCase()))
      .map(g => ({ ...g, isMine: true }));
    
    return [...commonMyGames, ...friendOnlyGames, ...myOnlyGames];
  };

  const getFriendGameWeight = (gameId) => {
    const friendGame = friendGames.find(g => g.game_id.toLowerCase() === gameId.toLowerCase());
    return friendGame?.weight;
  };

  const weightToColor = (weight) => {
    if (weight <= 3) return 'bg-red-500';
    if (weight <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderWeightBar = (myWeight, friendWeight = null, isFriendOnly = false) => {
    // Simple bar for solo view and friend-only games
    if (friendWeight === null || isFriendOnly) {
      const weight = isFriendOnly ? friendWeight : myWeight;
      const color = weightToColor(weight);
      return (
        <div className="flex items-center gap-1">
          <div className="flex h-4 w-24 bg-slate-700 rounded overflow-hidden">
            <div className={`${color} transition-all`} style={{ width: `${weight * 10}%` }}></div>
          </div>
          <span className="text-xs text-slate-400">{weight}</span>
        </div>
      );
    }

    const selectedFriendData = friends.find(f => f.user_id === selectedFriend);
    const friendAvatar = selectedFriendData?.avatar_url;
    const friendInitial = selectedFriendName.charAt(0).toUpperCase();
    const sameWeight = myWeight === friendWeight;

    const myLeftPct = ((myWeight - 1) / 9) * 100;
    const friendLeftPct = ((friendWeight - 1) / 9) * 100;

    return (
      <div className="flex flex-col w-56 mt-1">
        {/* Pins row */}
        <div className="relative h-12">
          {/* My pin - white border, offset down when same weight */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${myLeftPct}%`, transform: 'translateX(-50%)', zIndex: 20, top: sameWeight ? '10px' : '0px' }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white bg-slate-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                : <span>{profile?.username?.charAt(0).toUpperCase() || 'Me'}</span>
              }
            </div>
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-white" />
          </div>

          {/* Friend pin - blue border, always on top */}
          <div
            className="absolute flex flex-col items-center"
            style={{ left: `${friendLeftPct}%`, transform: 'translateX(-50%)', zIndex: 30, top: '0px' }}
          >
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-blue-400 bg-slate-500 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {friendAvatar
                ? <img src={friendAvatar} alt="" className="w-full h-full object-cover" />
                : <span>{friendInitial}</span>
              }
            </div>
            <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-400" />
          </div>
        </div>

        {/* Color bar */}
        <div className="relative h-5 rounded overflow-hidden flex">
          <div className="bg-red-500" style={{ width: '30%' }} />
          <div className="bg-yellow-500" style={{ width: '40%' }} />
          <div className="bg-green-500" style={{ width: '30%' }} />
        </div>

        {/* Weight numbers */}
        <div className="relative h-5">
          <span
            className="absolute text-xs text-white font-medium"
            style={{ left: `${myLeftPct}%`, transform: 'translateX(-50%)', top: '2px' }}
          >
            {myWeight}
          </span>
          {!sameWeight && (
            <span
              className="absolute text-xs text-blue-300 font-medium"
              style={{ left: `${friendLeftPct}%`, transform: 'translateX(-50%)', top: '2px' }}
            >
              {friendWeight}
            </span>
          )}
        </div>
      </div>
    );
  };

  useEffect(() => {
    loadGames();
    loadFriends();
  }, []);

  useEffect(() => {
    if (selectedFriend) {
      loadFriendGames(selectedFriend);
    } else {
      setFriendGames([]);
    }
  }, [selectedFriend]);

  const loadGames = async () => {
    try {
      setLoading(true);
      const result = await apiCall(ENDPOINTS.LIST_GAMES);
      console.log('Loaded my games:', JSON.stringify(result));
      setGames(result.games || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      const result = await apiCall(ENDPOINTS.LIST_FRIENDS);
      console.log(`Loaded friend data: ${JSON.stringify(result)}`);
      setFriends(result.friends || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const loadFriendGames = async (friendId) => {
    try {
      console.log(`Loading games for friend ID: ${friendId}`);
      const result = await apiCall(`${ENDPOINTS.LIST_FRIENDS_GAMES}?user_id=${friendId}`);
      console.log(`Loaded friend games: ${JSON.stringify(result)}`);
      setFriendGames(result.games || []);
    } catch (err) {
      console.error('Failed to load friend games:', err);
      setFriendGames([]);
    }
  };

  const handleDelete = async (game) => {
    if (!confirm(`Are you sure you want to delete "${game.name}"?`)) return;
    
    try {
      await apiCall(`${ENDPOINTS.DELETE_GAME}/${game.game_id}`, {
        method: 'DELETE',
      });
      loadGames();
    } catch (err) {
      console.error('Failed to delete game:', err);
    }
  };

  const handleEditSave = () => {
    setEditingGame(null);
    loadGames();
  };

  if (loading) return <div className="text-white">Loading games...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  const commonGames = getCommonGames();
  const sortedGames = getSortedGames();
  const commonCount = selectedFriend ? Array.from(commonGames).length : 0;
  const selectedFriendName = selectedFriend 
    ? (friends.find(f => f.user_id === selectedFriend)?.username || friends.find(f => f.user_id === selectedFriend)?.user_id.split('#')[1] || 'Friend')
    : '';

  return (
    <div className="space-y-4">
      {friends.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg">
          <label htmlFor="ddFriendComparison" className="block text-white mb-2 text-sm font-medium">
            Compare with Friend
          </label>
          <div className="flex items-center gap-4">
            <select
              id='ddFriendComparison'
              value={selectedFriend}
              onChange={(e) => setSelectedFriend(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:outline-none focus:border-blue-500"
            >
              <option value="">Select a friend...</option>
              {friends.map((friend) => {
                const username = friend.username || friend.user_id.split('#')[1];
                return (
                  <option key={friend.user_id} value={friend.user_id}>
                    {username} ({friend.game_count || 0} games)
                  </option>
                );
              })}
            </select>
            {selectedFriend && (
              <>
                <span className="text-slate-400 text-sm whitespace-nowrap">
                  {commonCount} in common
                </span>
                <button
                  onClick={() => setSelectedFriend('')}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
                  title="Clear comparison"
                >
                  ✕ Clear
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">My Games</h2>
        <span className="text-slate-400">{games.length} games</span>
      </div>
      
      {games.length === 0 ? (
        <div className="text-center py-8 text-slate-400">
          No games added yet. Add your first game above!
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedGames.map((game) => {
            const isFriendOnly = !game.isMine;
            const visibility = game.visibility || 'friends';
            const isCommon = !isFriendOnly && commonGames.has(game.game_id.toLowerCase());
            const friendWeight = !isFriendOnly ? getFriendGameWeight(game.game_id) : null;
            const isGrayedOut = selectedFriend && !isCommon && !isFriendOnly;
            
            return (
              <div 
                key={game.game_id} 
                className={`p-4 rounded-lg flex justify-between items-center transition-opacity ${
                  isFriendOnly ? 'bg-blue-900/20 border border-blue-700/50' : 'bg-slate-800'
                } ${
                  isGrayedOut ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{game.name}</h3>
                    {isFriendOnly && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">{selectedFriendName}'s Game</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                      {platformIcons[game.platform] || '🎮'} {game.platform}
                    </span>
                    {!isFriendOnly && (
                      <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                        {visibilityIcons[visibility]} {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                      </span>
                    )}
                    {isFriendOnly ? renderWeightBar(null, game.weight, true) : renderWeightBar(game.weight, friendWeight)}
                  </div>
                </div>
                {!isFriendOnly && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => setEditingGame(game)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(game)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {editingGame && (
        <EditGameModal
          game={editingGame}
          onClose={() => setEditingGame(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}