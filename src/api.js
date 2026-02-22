import { API_BASE_URL } from './constants';
import { isTokenExpired, getIdToken, logout, login } from './auth';

export const apiCall = async (endpoint, options = {}) => {
  const token = getIdToken();

  // If token exists but is expired, force re-login
  if (token && isTokenExpired(token)) {
    localStorage.removeItem('idToken');
    localStorage.removeItem('accessToken');
    // redirect to login flow
    try {
      login();
    } catch (e) {
      console.error('Error redirecting to login:', e);
      // fallback to logout which will also clear tokens and redirect
      logout();
    }
    throw new Error('Authentication expired');
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.error || `API call failed: ${response.status} ${response.statusText}`;
    throw new Error(errorMessage);
  }
  
  return response.json();
};