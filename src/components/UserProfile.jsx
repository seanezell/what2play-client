import { useState, useEffect } from 'react';
import { apiCall } from '../api';
import { ENDPOINTS, PLATFORMS } from '../constants';

export default function UserProfile({ profile, onClose, onProfileUpdated }) {
  const [formData, setFormData] = useState({
    username: '',
    real_name: '',
    preferred_platform: '',
  });
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'unavailable'
  const [usernameMessage, setUsernameMessage] = useState('');
  const [originalUsername, setOriginalUsername] = useState('');

  // Populate form with existing profile
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        real_name: profile.real_name || '',
        preferred_platform: profile.preferred_platform || '',
      });
      setOriginalUsername(profile.username || '');
    }
  }, [profile]);

  // Check username availability on blur
  const checkUsername = async (username) => {
    if (!username || username === originalUsername) {
      setUsernameStatus(null);
      setUsernameMessage('');
      return;
    }

    setUsernameStatus('checking');
    try {
      const response = await apiCall(ENDPOINTS.CHECK_USERNAME, {
        method: 'POST',
        body: JSON.stringify({ username }),
      });

      if (response.available) {
        setUsernameStatus('available');
        setUsernameMessage('Available');
      } else {
        setUsernameStatus('unavailable');
        setUsernameMessage('Already in use');
      }
    } catch (error) {
      console.error('Failed to check username:', error);
      setUsernameStatus('unavailable');
      setUsernameMessage('Error checking availability');
    }
  };

  const handleUsernameBlur = () => {
    checkUsername(formData.username);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username if it changed
    if (formData.username !== originalUsername && usernameStatus !== 'available') {
      alert('Please ensure username is available before submitting');
      return;
    }

    setLoading(true);
    try {
      await apiCall(ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        body: JSON.stringify(formData),
      });
      onProfileUpdated(formData);
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-6">Profile Settings</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleUsernameBlur}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="Choose a username"
            />
            {usernameStatus && (
              <div className={`mt-2 flex items-center text-sm ${usernameStatus === 'available' ? 'text-green-400' : 'text-red-400'}`}>
                {usernameStatus === 'checking' && <span className="animate-spin mr-2">⏳</span>}
                {usernameStatus === 'available' && <span className="mr-2">✓</span>}
                {usernameStatus === 'unavailable' && <span className="mr-2">✗</span>}
                {usernameStatus === 'checking' ? 'Checking availability...' : usernameMessage}
              </div>
            )}
          </div>

          {/* Real Name Field */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Real Name
            </label>
            <input
              type="text"
              name="real_name"
              value={formData.real_name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
              placeholder="Your real name"
            />
          </div>

          {/* Preferred Platform Dropdown */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Preferred Platform
            </label>
            <select
              name="preferred_platform"
              value={formData.preferred_platform}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="">Select a platform</option>
              {PLATFORMS.map(platform => (
                <option key={platform} value={platform}>
                  {platform}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 mt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Profile'}
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
