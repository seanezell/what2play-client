import { useState } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS, PLATFORMS } from '../constants';

export default function AddGame() {
  const [formData, setFormData] = useState({
    game_name: '',
    platform: 'PC',
    weight: 10,
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await apiCall(ENDPOINTS.ADD_GAME, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      setResponse(result);
    } catch (error) {
      setResponse({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-800 p-6 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Add Game</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-white mb-1">Name</label>
          <input
            type="text"
            value={formData.game_name}
            onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
            className="w-full p-2 rounded bg-slate-700 text-white"
            required
          />
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add Game'}
        </button>
      </form>

      {response && (
        <div className="mt-4 p-3 bg-slate-700 rounded">
          <h3 className="text-white font-bold mb-2">Response:</h3>
          <pre className="text-green-400 text-sm overflow-auto">
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}