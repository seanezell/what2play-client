import { useState } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function FriendsSearch({ onFriendAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setSearching(true);
      const result = await apiCall(`${ENDPOINTS.SEARCH_FRIENDS}?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults(result.users || []);
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (user) => {
    try {
      await apiCall(`${ENDPOINTS.ADD_FRIEND}${user.user_id}`, {
        method: 'POST',
      });
      setSearchResults(searchResults.filter(u => u.user_id !== user.user_id));
      onFriendAdded();
    } catch (err) {
      console.error('Failed to add friend:', err);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for friends by username..."
          className="flex-1 px-4 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={searching}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-slate-600"
        >
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-white font-medium">Search Results</h3>
          <div className="grid gap-2">
            {searchResults.map((user) => (
              <div key={user.user_id} className="bg-slate-800 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-white">{user.username}</div>
                  {user.real_name && (
                    <div className="text-sm text-slate-400">{user.real_name}</div>
                  )}
                </div>
                <button
                  onClick={() => handleAddFriend(user)}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Add Friend
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
