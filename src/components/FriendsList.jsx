import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import FriendsSearch from './FriendsSearch';

export default function FriendsList() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const result = await apiCall(ENDPOINTS.LIST_FRIENDS);
      setFriends(result.friends || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (friend) => {
    if (!confirm(`Are you sure you want to remove "${friend.username}"?`)) return;
    
    try {
      await apiCall(`${ENDPOINTS.REMOVE_FRIEND}${friend.user_id}`, {
        method: 'DELETE',
      });
      loadFriends();
    } catch (err) {
      console.error('Failed to remove friend:', err);
    }
  };

  if (loading) return <div className="text-white">Loading friends...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <FriendsSearch onFriendAdded={loadFriends} />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Friends</h2>
          <span className="text-slate-400">{friends.length} friends</span>
        </div>
        
        {friends.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No friends added yet. Search for friends above!
          </div>
        ) : (
          <div className="grid gap-3">
            {friends.map((friend) => (
              <div key={friend.user_id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{friend.username}</h3>
                  {friend.real_name && (
                    <div className="text-sm text-slate-400">{friend.real_name}</div>
                  )}
                </div>
                <button 
                  onClick={() => handleRemove(friend)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
