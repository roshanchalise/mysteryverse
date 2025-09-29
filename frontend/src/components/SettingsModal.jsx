import { useState, useEffect } from 'react';
import api from '../config/api';
import { playClickSound } from '../utils/audio';
import {
  setBackgroundMusicVolume,
  isBackgroundMusicPlaying,
  toggleBackgroundMusic
} from '../utils/backgroundMusic';

function SettingsModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sound settings state
  const [soundSettings, setSoundSettings] = useState({
    musicEnabled: false,
    clicksEnabled: true
  });


  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  useEffect(() => {
    if (profile?.id) {
      loadSoundSettings();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await api.get('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const loadSoundSettings = () => {
    if (!profile?.id) return;

    const musicKey = `mysteryverse-music-enabled-${profile.id}`;
    const clicksKey = `mysteryverse-clicks-enabled-${profile.id}`;

    const musicEnabled = localStorage.getItem(musicKey) === 'true';
    const clicksEnabled = localStorage.getItem(clicksKey) !== 'false';

    setSoundSettings({
      musicEnabled,
      clicksEnabled
    });
  };


  const handleSoundSettingChange = async (setting, value) => {
    const newSettings = { ...soundSettings, [setting]: value };
    setSoundSettings(newSettings);

    // Apply changes immediately
    if (!profile?.id) return;

    if (setting === 'musicEnabled') {
      const musicKey = `mysteryverse-music-enabled-${profile.id}`;
      localStorage.setItem(musicKey, value.toString());
      if (value !== isBackgroundMusicPlaying()) {
        await toggleBackgroundMusic();
      }
      // Always set volume to 0.1 when enabling music
      if (value) {
        setBackgroundMusicVolume(0.1);
      }
    } else if (setting === 'clicksEnabled') {
      const clicksKey = `mysteryverse-clicks-enabled-${profile.id}`;
      localStorage.setItem(clicksKey, value.toString());
    }
  };


  if (!isOpen) return null;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'sound', label: 'Sound', icon: '🔊' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60] p-4">
      <div className="bg-mystery-purple bg-opacity-95 backdrop-blur-sm border border-mystery-gold border-opacity-30 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-mystery-gold border-opacity-20">
          <h2 className="text-2xl font-bold text-mystery-gold">Settings</h2>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-gray-400 hover:text-white text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-mystery-gold border-opacity-20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-mystery-gold bg-mystery-gold bg-opacity-10 border-b-2 border-mystery-gold'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded text-red-300 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 rounded text-green-300 text-sm">
              {success}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Profile Settings</h3>
              
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mystery-gold mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading profile...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-600">
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Username
                    </label>
                    <span className="text-mystery-gold text-lg font-semibold">
                      {profile?.username}
                    </span>
                  </div>
                </div>
              )}

              {profile && (
                <div className="mt-6 p-4 bg-gray-800 bg-opacity-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Account Info</h4>
                  <p className="text-xs text-gray-400">
                    Member since: {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sound Tab */}
          {activeTab === 'sound' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Sound Settings</h3>

              {/* Background Music */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Background Music</h4>
                    <p className="text-gray-400 text-sm">Mystery Verse Puzzle Adventure Loop</p>
                  </div>
                  <button
                    onClick={() => {
                      handleSoundSettingChange('musicEnabled', !soundSettings.musicEnabled);
                    }}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      soundSettings.musicEnabled 
                        ? 'bg-mystery-gold text-white hover:bg-opacity-80' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {soundSettings.musicEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

              </div>

              {/* Clicks Sound */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-medium">Clicks Sound</h4>
                    <p className="text-gray-400 text-sm">Button and interface click sounds</p>
                  </div>
                  <button
                    onClick={() => {
                      handleSoundSettingChange('clicksEnabled', !soundSettings.clicksEnabled);
                    }}
                    className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                      soundSettings.clicksEnabled 
                        ? 'bg-mystery-gold text-white hover:bg-opacity-80' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                    }`}
                  >
                    {soundSettings.clicksEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #e94560;
          cursor: pointer;
          border: 2px solid #1a1a2e;
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #e94560;
          cursor: pointer;
          border: 2px solid #1a1a2e;
        }
      `}</style>
    </div>
  );
}

export default SettingsModal;