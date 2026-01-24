import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function GamesList() {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          No games added yet. Add your first game below!
        </div>
      ) : (
        <div className="grid gap-3">
          {games.map((game, index) => (
            <div key={index} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
              <div>
                <h3 className="text-white font-medium">{game.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <span>{game.platform}</span>
                  <span>Weight: {game.weight}/10</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                  Edit
                </button>
                <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}