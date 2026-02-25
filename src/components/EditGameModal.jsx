import { useState } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS, PLATFORMS } from '../constants';

export default function EditGameModal({ game, onClose, onSave }) {
  const [formData, setFormData] = useState({
    platform: game.platform,
    weight: game.weight,
    visibility: game.visibility || 'friends',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiCall(`${ENDPOINTS.UPDATE_GAME}/${game.game_id}`, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      onSave();
    } catch (error) {
      console.error('Failed to update game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Edit Game</h3>
        
        <div className="mb-4">
          <span className="text-slate-400 text-sm">Game Name</span>
          <div className="text-white font-medium">{game.name}</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-1">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white"
            >
              {PLATFORMS.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-1">Weight (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              className="w-full p-2 rounded bg-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-white mb-1">Visibility</label>
            <select
              value={formData.visibility}
              onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white"
            >
              <option value="public">Public</option>
              <option value="friends">Friends</option>
              <option value="private">Private</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}