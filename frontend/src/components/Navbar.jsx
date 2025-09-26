import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SettingsModal from './SettingsModal';
import { playClickSound } from '../utils/audio';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <nav className="bg-mystery-purple bg-opacity-90 backdrop-blur-sm border-b border-mystery-gold border-opacity-20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                to="/dashboard" 
                className="font-title text-2xl font-bold text-mystery-gold hover:text-opacity-80 transition-colors"
              >
                Mystery Verse
              </Link>
            </div>

            <div className="flex items-center space-x-6">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/dashboard' 
                    ? 'bg-mystery-gold text-white' 
                    : 'text-gray-300 hover:text-mystery-gold'
                }`}
              >
                Dashboard
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-300">
                  Welcome, <span className="text-mystery-gold font-medium">{user?.username}</span>
                </span>
                
                <button
                  onClick={() => {
                    setShowSettings(true);
                  }}
                  className="text-gray-300 hover:text-mystery-gold transition-colors p-1 rounded"
                  title="Settings"
                >
                  <span className="text-lg">⚙️</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="text-gray-300 hover:text-mystery-gold text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Settings Modal - Rendered outside nav to avoid z-index issues */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </>
  );
}

export default Navbar;