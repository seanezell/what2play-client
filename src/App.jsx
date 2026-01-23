import { useEffect, useState } from 'react';
import { login, logout, handleCallback, getUser, isAuthenticated } from './auth';
import AddGame from './components/AddGame';

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

  if (user) {
    return (
      <div className="min-h-screen bg-slate-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-white">What 2 Play</h1>
            <div className="flex items-center gap-4">
              <span className="text-green-400">Welcome, {user.name}!</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
          <AddGame />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">What 2 Play</h1>
        <p className="text-xl text-slate-400 mb-4">Coming Soon</p>
        <button
          onClick={login}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default App;
