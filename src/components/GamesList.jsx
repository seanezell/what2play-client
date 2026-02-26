import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import EditGameModal from './EditGameModal';

export default function GamesList() {
  const [games, setGames] = useState([]);
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

  const getWeightColor = (weight) => {
    if (weight <= 3) return 'bg-red-600';
    if (weight <= 7) return 'bg-yellow-600';
    return 'bg-green-600';
  };

  useEffect(() => {
    loadGames();
  }, []);

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

  return (
    <div className="space-y-4">
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
          {games.map((game) => {
            const visibility = game.visibility || 'friends';
            return (
              <div key={game.game_id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{game.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                      {platformIcons[game.platform] || '🎮'} {game.platform}
                    </span>
                    <span className={`px-2 py-1 ${getWeightColor(game.weight)} text-white text-xs rounded`}>
                      Weight: {game.weight}/10
                    </span>
                    <span className="px-2 py-1 bg-slate-700 text-white text-xs rounded flex items-center gap-1">
                      {visibilityIcons[visibility]} {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                    </span>
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