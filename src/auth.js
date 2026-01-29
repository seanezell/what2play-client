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

  const tokens = await response.json();
  localStorage.setItem('idToken', tokens.id_token);
  localStorage.setItem('accessToken', tokens.access_token);
  return tokens;
};

export const getUser = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return null;
  
  const payload = JSON.parse(atob(idToken.split('.')[1]));
  return {
    name: payload.name || payload.email || payload['cognito:username'],
    email: payload.email,
  };
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return true;
    // exp is in seconds since epoch
    return Date.now() >= payload.exp * 1000;
  } catch (e) {
    console.error('Failed to parse token for expiry check', e);
    return true;
  }
};

export const isAuthenticated = () => {
  const idToken = localStorage.getItem('idToken');
  if (!idToken) return false;
  return !isTokenExpired(idToken);
};

export const getIdToken = () => localStorage.getItem('idToken');
export const getAccessToken = () => localStorage.getItem('accessToken');
