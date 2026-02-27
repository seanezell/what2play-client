import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function RecentGamesPicked({ limit = 5 }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentGames = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`${ENDPOINTS.TOP_LISTS}?type=recent&limit=${limit}`, {
          method: 'GET',
        });
        setGames(response.items || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch recent games:', err);
        setError('Failed to load recent games');
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentGames();
  }, [limit]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if date is today
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // Check if date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Otherwise show date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">⏱️ Recently Picked</h3>
        <div className="text-slate-400 text-center py-4">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">⏱️ Recently Picked</h3>
        <div className="text-red-400 text-center py-4">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800 p-6 rounded-lg">
      <h3 className="text-xl font-bold text-white mb-4">⏱️ Recently Picked</h3>
      {games.length === 0 ? (
        <div className="text-slate-400 text-center py-4">No recent picks</div>
      ) : (
        <div className="space-y-3">
          {games.map((game) => (
            <div key={`${game.game_id}-${game.picked_date}`} className="p-3 bg-slate-700 rounded hover:bg-slate-600 transition">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium truncate">{game.game_name}</div>
                  <div className="text-slate-400 text-sm mt-1">
                    <span className="text-blue-300">{game.group_name}</span>
                    <span className="mx-2 text-slate-500">•</span>
                    <span className="text-slate-500">{formatDate(game.picked_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
