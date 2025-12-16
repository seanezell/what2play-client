import { useEffect, useState } from 'react';
import { login, logout, handleCallback, getUser, isAuthenticated } from './auth';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code).then(() => {
        window.history.replaceState({}, document.title, '/');
        setUser(getUser());
      });
    } else if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">What 2 Play</h1>
        {user ? (
          <>
            <p className="text-xl text-green-400 mb-4">Welcome, {user.name}!</p>
            <button
              onClick={logout}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <p className="text-xl text-slate-400 mb-4">Coming Soon</p>
            <button
              onClick={login}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Login
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
