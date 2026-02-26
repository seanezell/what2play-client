import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import EditGameModal from './EditGameModal';

export default function GamesList() {
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
    return new Set(friendGames.map(g => g.name.toLowerCase()));
  };

  const getSortedGames = () => {
    if (!selectedFriend) return games;
    const commonGames = getCommonGames();
    return [...games].sort((a, b) => {
      const aCommon = commonGames.has(a.name.toLowerCase());
      const bCommon = commonGames.has(b.name.toLowerCase());
      if (aCommon && !bCommon) return -1;
      if (!aCommon && bCommon) return 1;
      return 0;
    });
  };

  const getFriendGameWeight = (gameName) => {
    const friendGame = friendGames.find(g => g.name.toLowerCase() === gameName.toLowerCase());
    return friendGame?.weight;
  };

  const renderWeightBar = (myWeight, friendWeight = null) => {
    const myColor = myWeight <= 3 ? 'bg-red-500' : myWeight <= 7 ? 'bg-yellow-500' : 'bg-green-500';
    
    if (friendWeight === null) {
      return (
        <div className="flex items-center gap-1">
          <div className="flex h-4 w-24 bg-slate-700 rounded overflow-hidden">
            <div className={`${myColor} transition-all`} style={{ width: `${myWeight * 10}%` }}></div>
          </div>
          <span className="text-xs text-slate-400">{myWeight}</span>
        </div>
      );
    }

    const friendColor = friendWeight <= 3 ? 'bg-red-400' : friendWeight <= 7 ? 'bg-yellow-400' : 'bg-green-400';
    return (
      <div className="flex items-center gap-1">
        <div className="flex h-4 w-24 bg-slate-700 rounded overflow-hidden">
          <div className={`${myColor} transition-all`} style={{ width: `${myWeight * 10}%` }}></div>
          <div className={`${friendColor} transition-all`} style={{ width: `${friendWeight * 10}%` }}></div>
        </div>
        <span className="text-xs text-slate-400">{myWeight}/{friendWeight}</span>
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
      setFriends(result.friends || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    }
  };

  const loadFriendGames = async (friendId) => {
    try {
      const result = await apiCall(`${ENDPOINTS.LIST_FRIENDS_GAMES}?user_id=${friendId}`);
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

  return (
    <div className="space-y-4">
      {friends.length > 0 && (
        <div className="bg-slate-800 p-4 rounded-lg">
          <label className="block text-white mb-2 text-sm font-medium">Compare with Friend</label>
          <div className="flex items-center gap-4">
            <select
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
              <span className="text-slate-400 text-sm whitespace-nowrap">
                {commonCount} in common
              </span>
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
            const visibility = game.visibility || 'friends';
            const isCommon = commonGames.has(game.name.toLowerCase());
            const friendWeight = getFriendGameWeight(game.name);
            const isGrayedOut = selectedFriend && !isCommon;
            
            return (
              <div 
                key={game.game_id} 
                className={`bg-slate-800 p-4 rounded-lg flex justify-between items-center transition-opacity ${
                  isGrayedOut ? 'opacity-40' : 'opacity-100'
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-white font-medium">{game.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                      {platformIcons[game.platform] || '🎮'} {game.platform}
                    </span>
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                      {visibilityIcons[visibility]} {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                    </span>
                    {renderWeightBar(game.weight, friendWeight)}
                  </div>
                </div>
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