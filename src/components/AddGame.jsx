import { useState } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS, PLATFORMS } from '../constants';
import GameSelectionModal from './GameSelectionModal';

export default function AddGame({ onGameAdded }) {
  const [formData, setFormData] = useState({
    game_name: '',
    platform: 'PC',
    weight: 10,
  });
  const [loading, setLoading] = useState(false);
  const [showSelection, setShowSelection] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await apiCall(ENDPOINTS.ADD_GAME, {
        method: 'POST',
        body: JSON.stringify(formData),
      });
      
      if (result.requires_confirmation && result.suggestions) {
        setSuggestions(result.suggestions);
        setShowSelection(true);
      } else {
        // Game added successfully
        setFormData({ game_name: '', platform: 'PC', weight: 10 });
        if (onGameAdded) onGameAdded();
      }
    } catch (error) {
      console.error('Failed to add game:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGameAdded = () => {
    setFormData({ game_name: '', platform: 'PC', weight: 10 });
    if (onGameAdded) onGameAdded();
  };

  const handleSelectionClose = () => {
    setShowSelection(false);
    setSuggestions([]);
  };

  return (
    <>
      <div className="bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-bold text-white mb-4">Add New Game</h2>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-white mb-1 text-sm">Name</label>
            <input
              type="text"
              value={formData.game_name}
              onChange={(e) => setFormData({ ...formData, game_name: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-1 text-sm">Platform</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              className="w-full p-2 rounded bg-slate-700 text-white text-sm"
            >
              {PLATFORMS.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white mb-1 text-sm">Weight (1-10)</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseInt(e.target.value) })}
              className="w-full p-2 rounded bg-slate-700 text-white text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {loading ? 'Adding...' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
      
      {showSelection && (
        <GameSelectionModal
          suggestions={suggestions}
          platform={formData.platform}
          weight={formData.weight}
          onClose={handleSelectionClose}
          onGameAdded={handleGameAdded}
        />
      )}
    </>
  );
}