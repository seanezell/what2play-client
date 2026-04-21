import { decodeJwtPayload } from './utils/jwt';

const config = {
  domain: import.meta.env.VITE_COGNITO_DOMAIN,
  clientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  redirectUri: import.meta.env.VITE_COGNITO_REDIRECT_URI,
};

export const login = () => {
  const authUrl = `https://${config.domain}/login?client_id=${config.clientId}&response_type=code&scope=email+openid+profile&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
  window.location.href = authUrl;
};

export const logout = () => {
  localStorage.removeItem('idToken');
  localStorage.removeItem('accessToken');
  const logoutUrl = `https://${config.domain}/logout?client_id=${config.clientId}&logout_uri=${encodeURIComponent(config.redirectUri)}`;
  window.location.href = logoutUrl;
};

export const handleCallback = async (code) => {
  const tokenUrl = `https://${config.domain}/oauth2/token`;
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code,
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  });

  const text = await response.text();
  if (!response.ok) {
    let detail = text;
    try {
      const errJson = JSON.parse(text);
      detail = errJson.error_description || errJson.error || text;
    } catch {
      /* use raw text */
    }
    throw new Error(detail || `Token exchange failed (${response.status})`);
  }

  let tokens;
  try {
    tokens = JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid token response from Cognito');
  }

  if (!tokens.id_token || !tokens.access_token) {
    throw new Error('Token response missing id_token or access_token');
  }

  localStorage.setItem('idToken', tokens.id_token);
  localStorage.setItem('accessToken', tokens.access_token);
  return tokens;
};

export const getUser = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return null;

  const payload = decodeJwtPayload(idToken);
  if (!payload) return null;

  return {
    name: payload.name || payload.email || payload['cognito:username'],
    email: payload.email,
  };
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  const payload = decodeJwtPayload(token);
  if (!payload || payload.exp == null) return true;
  return Date.now() >= payload.exp * 1000;
};

export const isAuthenticated = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return false;
  return !isTokenExpired(idToken);
};

export const getIdToken = () => localStorage.getItem('idToken');
export const getAccessToken = () => localStorage.getItem('accessToken');

export const getCurrentUserId = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return null;
  const payload = decodeJwtPayload(idToken);
  return payload?.sub || null;
};
