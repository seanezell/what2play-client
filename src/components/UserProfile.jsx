import { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiCall } from '../api';
import { ENDPOINTS, PLATFORMS } from '../constants';

export default function UserProfile({ profile, onClose, onProfileUpdated, required = false }) {
  const [formData, setFormData] = useState({
    username: '',
    real_name: '',
    preferred_platform: '',
    avatar_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
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
        avatar_url: profile.avatar_url || '',
      });
      setOriginalUsername(profile.username || '');
    }
  }, [profile]);

  // Check if username matches the default pattern from Lambda
  const isDefaultUsername = (username) => {
    return username.startsWith('user_');
  };

  // Check username availability on blur
  const checkUsername = async (username) => {
    if (!username || username === originalUsername) {
      setUsernameStatus(null);
      setUsernameMessage('');
      return;
    }

    // Check for default username pattern
    if (isDefaultUsername(username)) {
      setUsernameStatus('unavailable');
      setUsernameMessage('Please choose a real username');
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

    // If editing the username, clear previous availability state
    if (name === 'username') {
      setUsernameStatus(null);
      setUsernameMessage('');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      alert('Only PNG files are allowed');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);

      // Step 1: Get presigned URL
      const { upload_url, avatar_url } = await apiCall(ENDPOINTS.UPLOAD_AVATAR, {
        method: 'POST',
        body: JSON.stringify({ action: 'get-upload-url' }),
      });

      // Step 2: Upload directly to S3
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': 'image/png' },
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // Step 3: Save avatar_url to profile immediately
      await apiCall(ENDPOINTS.UPDATE_PROFILE, {
        method: 'PUT',
        body: JSON.stringify({ username: formData.username, avatar_url }),
      });

      setFormData(prev => ({ ...prev, avatar_url }));
      onProfileUpdated({ ...profile, avatar_url });
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      alert('Failed to upload avatar');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate username if it changed
    if (!formData.username) {
      alert('Username is required');
      return;
    }

    // Reject default username pattern
    if (isDefaultUsername(formData.username)) {
      alert('Please choose a real username instead of using the default format');
      return;
    }

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
    <Modal>
      <div className="bg-slate-800 p-6 rounded-lg w-96 max-w-full mx-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {required ? 'Complete Your Profile' : 'Profile Settings'}
        </h3>
        {required && (
          <p className="text-slate-400 text-sm mb-4">Please set a username to continue</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Upload */}
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Avatar
            </label>
            <div className="flex items-center gap-4">
              {formData.avatar_url && (
                <img
                  src={formData.avatar_url}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <input
                  type="file"
                  accept=".png,image/png"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer disabled:opacity-50"
                />
                <p className="text-xs text-slate-500 mt-1">PNG only, max 5MB</p>
              </div>
            </div>
            {uploading && (
              <div className="text-sm text-blue-400 mt-2">Uploading...</div>
            )}
          </div>

          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-slate-300 text-sm font-medium mb-2">
              Username {required && <span className="text-red-400">*</span>}
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleUsernameBlur}
              required={required}
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
            <label htmlFor="real_name" className="block text-slate-300 text-sm font-medium mb-2">
              Real Name
            </label>
            <input
              id="real_name"
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
            <label htmlFor="preferred_platform" className="block text-slate-300 text-sm font-medium mb-2">
              Preferred Platform
            </label>
            <select
              id="preferred_platform"
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
            {(() => {
              const usernameNotEmpty = (formData.username || '').trim() !== '';
              const usernameNotDefault = !isDefaultUsername(formData.username);
              const usernameValid = formData.username === originalUsername || usernameStatus === 'available';
              const canSubmit = usernameNotEmpty && usernameNotDefault && usernameValid && !loading;
              return (
                <>
                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ${canSubmit ? '' : 'opacity-60 cursor-not-allowed'}`}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </button>
                  {!required && (
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </form>
      </div>
    </Modal>
  );
}
