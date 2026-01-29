import { useState } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS } from '../constants';

export default function GameSelectionModal({ suggestions, platform, weight, onClose, onGameAdded }) {
  const [selectedGame, setSelectedGame] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedGame) return;
    
    setLoading(true);
    try {
      await apiCall(ENDPOINTS.ADD_GAME, {
        method: 'POST',
        body: JSON.stringify({
          game_name: selectedGame.name,
          steam_appid: selectedGame.steam_appid,
          platform,
          weight,
        }),
      });
      onGameAdded();
      onClose();
    } catch (error) {
      console.error('Failed to add game:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-4">Select Game</h3>
        <p className="text-slate-300 mb-4">Multiple games found. Please select the correct one:</p>
        
        <div className="space-y-2 mb-6">
          {suggestions.map((game) => {
            const isSelected = selectedGame?.steam_appid === game.steam_appid;
            return (
              <label
                key={game.steam_appid}
                className={`flex items-center p-3 rounded cursor-pointer border-2 transition-colors ${
                  isSelected
                    ? 'border-blue-500 bg-slate-700'
                    : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="game"
                  value={game.steam_appid}
                  onChange={() => setSelectedGame(game)}
                  className="sr-only"
                />

                <div className="flex items-center">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 transition-colors ${
                      isSelected ? 'border-blue-500' : 'border-slate-500'
                    } border-2 bg-transparent`}
                    >
                    {isSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                  </div>
                  <span className="text-white font-medium">{game.name}</span>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleConfirm}
            disabled={!selectedGame || loading}
            className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Selected Game'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}