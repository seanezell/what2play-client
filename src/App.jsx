import { useEffect, useState } from 'react';
import { login, logout, handleCallback, getUser, isAuthenticated } from './auth';
import { apiCall } from './api';
import { ENDPOINTS } from './constants';
import { normalizeProfile } from './utils/profile';
import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import AddGame from './components/AddGame';
import GamesList from './components/GamesList';
import UserProfile from './components/UserProfile';
import FriendsList from './components/FriendsList';
import GroupsList from './components/GroupsList';
import LandingPage from './components/LandingPage';

function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'dashboard');
  const [refreshGames, setRefreshGames] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      handleCallback(code)
        .then(() => {
          window.history.replaceState({}, document.title, '/');
          const userData = getUser();
          setUser(userData);
          fetchProfile();
        })
        .catch((err) => {
          console.error('OAuth callback failed:', err);
          window.history.replaceState({}, document.title, '/');
        });
    } else if (isAuthenticated()) {
      const userData = getUser();
      setUser(userData);
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const profileData = await apiCall(ENDPOINTS.GET_PROFILE);

      const normalized = normalizeProfile(profileData);
      setProfile(normalized);
      
      // Force profile setup if username is missing
      if (normalized?.username.startsWith('user_')) {
        setShowProfileModal(true);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem('activeTab', tab);
  };

  const handleGameAdded = () => {
    setRefreshGames(prev => prev + 1);
  };

  const handleProfileUpdated = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  if (user) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={handleTabChange} 
          user={user}
          profile={profile}
          onLogout={logout} 
          onProfileClick={() => setShowProfileModal(true)}
        />
        
        <main className="max-w-6xl mx-auto p-6">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'games' && (
            <div className="space-y-6">
              <AddGame onGameAdded={handleGameAdded} />
              <GamesList key={refreshGames} profile={profile} />
            </div>
          )}
          {activeTab === 'friends' && <FriendsList />}
          {activeTab === 'groups' && <GroupsList profile={profile} />}
        </main>

        {showProfileModal && (
          <UserProfile
            profile={profile}
            onClose={() => {
              // Only allow closing if username is set
              if (profile?.username) {
                setShowProfileModal(false);
              }
            }}
            onProfileUpdated={handleProfileUpdated}
            required={profile?.username.startsWith('user_')}
          />
        )}
      </div>
    );
  }

  return (
    <LandingPage 
      onLogin={login}
      onSignup={login}
    />
  );
}

export default App;
