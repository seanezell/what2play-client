import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function CreateGroup({ onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const result = await apiCall(ENDPOINTS.LIST_FRIENDS);
      setFriends(result.friends || []);
    } catch (err) {
      console.error('Failed to load friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedFriends.length === 0) return;

    try {
      setCreating(true);
      setError(null);
      await apiCall(ENDPOINTS.CREATE_GROUP, {
        method: 'POST',
        body: JSON.stringify({
          group_name: groupName || undefined,
          member_ids: selectedFriends,
        }),
      });
      setGroupName('');
      setSelectedFriends([]);
      onGroupCreated();
    } catch (err) {
      console.error('Failed to create group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div className="text-white">Loading friends...</div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-2 rounded">
          {error}
        </div>
      )}
      
      <div>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="Group name (optional)"
          maxLength={50}
          className="w-full px-4 py-2 bg-slate-800 text-white rounded border border-slate-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-4 text-slate-400">
          Add friends first to create a group
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <h3 className="text-white font-medium">Select Friends ({selectedFriends.length}/10)</h3>
            <div className="grid gap-2 max-h-60 overflow-y-auto">
              {friends.map((friend) => {
                const username = friend.username || friend.user_id.split('#')[1];
                return (
                  <label
                    key={friend.user_id}
                    className="flex items-center gap-3 bg-slate-800 p-3 rounded-lg cursor-pointer hover:bg-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.user_id)}
                      onChange={() => toggleFriend(friend.user_id)}
                      disabled={!selectedFriends.includes(friend.user_id) && selectedFriends.length >= 10}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{username}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={creating || selectedFriends.length === 0}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-slate-600"
          >
            {creating ? 'Creating...' : 'Create Group'}
          </button>
        </>
      )}
    </form>
  );
}
