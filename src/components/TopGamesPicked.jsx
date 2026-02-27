import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function TopGamesPicked({ limit = 5 }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopGames = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`${ENDPOINTS.TOP_LISTS}?type=top&limit=${limit}`, {
          method: 'GET',
        });
        setGames(response.items || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch top games:', err);
        setError('Failed to load top games');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopGames();
  }, [limit]);

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">🏆 Top Games Picked</h3>
        <div className="text-slate-400 text-center py-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">🏆 Top Games Picked</h3>
        <div className="text-red-400 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">🏆 Top Games Picked</h3>
      {games.length === 0 ? (
        <div className="text-slate-400 text-center py-4">No games yet</div>
      ) : (
        <div className="space-y-3">
          {games.map((game, index) => (
            <div key={game.game_id} className="flex items-center justify-between p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-slate-400 font-mono text-sm font-bold w-6">#{index + 1}</span>
                <span className="text-white font-medium truncate">{game.name}</span>
              </div>
              <span className="text-blue-400 font-bold ml-2 flex-shrink-0">{game.pick_count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
