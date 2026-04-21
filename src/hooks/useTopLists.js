import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

/**
 * Fetches `/lists/games` with ?type= recent | top
 * @param {string} errorMessage - User-visible message on failure
 */
export function useTopLists(type, limit, errorMessage = 'Failed to load') {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`${ENDPOINTS.TOP_LISTS}?type=${encodeURIComponent(type)}&limit=${limit}`, {
          method: 'GET',
        });
        setGames(response.items || []);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch top lists (${type}):`, err);
        setError(errorMessage);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [type, limit, errorMessage]);

  return { games, loading, error };
}
