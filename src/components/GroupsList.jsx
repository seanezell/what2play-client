import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import CreateGroup from './CreateGroup';

export default function GroupsList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const result = await apiCall(ENDPOINTS.LIST_GROUPS);
      setGroups(result.groups || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (group) => {
    const groupName = group.group_name || 'this group';
    if (!confirm(`Are you sure you want to delete "${groupName}"?`)) return;
    
    try {
      await apiCall(`${ENDPOINTS.DELETE_GROUP}${group.group_id}`, {
        method: 'DELETE',
      });
      loadGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
    }
  };

  if (loading) return <div className="text-white">Loading groups...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="bg-slate-800 p-4 rounded-lg">
        <h3 className="text-xl font-bold text-white mb-4">Create New Group</h3>
        <CreateGroup onGroupCreated={loadGroups} />
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">My Groups</h2>
          <span className="text-slate-400">{groups.length} groups</span>
        </div>
        
        {groups.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No groups created yet. Create your first group above!
          </div>
        ) : (
          <div className="grid gap-3">
            {groups.map((group) => (
              <div key={group.group_id} className="bg-slate-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{group.group_name || 'Unnamed Group'}</h3>
                  <div className="text-sm text-slate-400">
                    {group.members?.length || 0} members
                    {group.last_pick && ` • Last pick: ${group.last_pick.game_name || 'Unknown'}`}
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(group)}
                  className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
