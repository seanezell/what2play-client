import { useEffect, useState } from 'react';
import { login, logout, handleCallback, getUser, isAuthenticated } from './auth';
import Navigation from './components/Navigation';
import AddGame from './components/AddGame';
import GamesList from './components/GamesList';
import { Friends, Groups } from './components/Placeholders';

function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('games');
  const [refreshGames, setRefreshGames] = useState(0);

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

  const handleGameAdded = () => {
    setRefreshGames(prev => prev + 1);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          user={user} 
          onLogout={logout} 
        />
        
        <main className="max-w-6xl mx-auto p-6">
          {activeTab === 'games' && (
            <div className="space-y-6">
              <AddGame onGameAdded={handleGameAdded} />
              <GamesList key={refreshGames} />
            </div>
          )}
          {activeTab === 'friends' && <Friends />}
          {activeTab === 'groups' && <Groups />}
        </main>
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
