import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';
import CreateGroup from './CreateGroup';
import GroupDetail from './GroupDetail';

export default function GroupsList({ profile }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

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
              <div
                key={group.group_id}
                onClick={() => setSelectedGroup(group)}
                className="bg-slate-800 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-slate-700 transition-colors"
              >
                <div>
                  <h3 className="text-white font-medium">{group.group_name || 'Unnamed Group'}</h3>
                  <div className="text-sm text-slate-400">
                    {group.members?.length || 0} members
                    {group.last_pick && ` • Last pick: ${group.last_pick.game_name || 'Unknown'}`}
                  </div>
                </div>
                <span className="text-slate-400 text-sm">View →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedGroup && (
        <GroupDetail
          group={selectedGroup}
          profile={profile}
          onClose={() => setSelectedGroup(null)}
          onGroupUpdated={() => { loadGroups(); }}
          onGroupDeleted={() => { setSelectedGroup(null); loadGroups(); }}
        />
      )}
    </div>
  );
}
