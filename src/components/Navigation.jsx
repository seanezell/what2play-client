import { useState, useEffect, useRef } from 'react';

export default function Navigation({ activeTab, setActiveTab, user, profile, onLogout, onProfileClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

  const tabs = [
    { id: 'games', label: 'Games', icon: '🎮' },
    { id: 'friends', label: 'Friends', icon: '👥' },
    { id: 'groups', label: 'Groups', icon: '🎯' },
  ];

  return (
    <nav className="bg-slate-800 border-b border-slate-700">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-white">What 2 Play</h1>
            <div className="flex space-x-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-slate-300">Welcome, {profile.username}!</span>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-3 py-1 bg-slate-700 text-white rounded hover:bg-slate-600 text-sm transition-colors"
              >
                ⚙️ Settings
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-700 rounded-lg shadow-lg z-50 border border-slate-600">
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-t-lg transition-colors text-sm"
                  >
                    Profile
                  </button>
                  <button
                    onClick={onLogout}
                    className="block w-full text-left px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-600 rounded-b-lg transition-colors text-sm border-t border-slate-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}