import { useState, useEffect } from 'react';
import { 
  startBackgroundMusic, 
  stopBackgroundMusic, 
  toggleBackgroundMusic,
  isBackgroundMusicPlaying,
  setBackgroundMusicVolume 
} from '../utils/backgroundMusic';

function MusicControl() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.1);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsPlaying(isBackgroundMusicPlaying());
    
    // Remember user's music preference
    const musicPreference = localStorage.getItem('mysteryverse-music-enabled');
    const volumePreference = localStorage.getItem('mysteryverse-music-volume');
    
    if (volumePreference) {
      const savedVolume = parseFloat(volumePreference);
      setVolume(savedVolume);
    }
    
    // Auto-start music function
    const startMusic = async () => {
      // Only auto-start if user previously had music enabled or is new user
      if (musicPreference === 'true' || musicPreference === null) { // Default to enabled
        try {
          const started = await startBackgroundMusic();
          if (started) {
            setIsPlaying(true);
            setBackgroundMusicVolume(volumePreference ? parseFloat(volumePreference) : volume);
            localStorage.setItem('mysteryverse-music-enabled', 'true');
          }
        } catch (error) {
          console.error('Failed to start music:', error);
        }
      }
    };

    // Check if we're on the dashboard page and try to start music immediately
    const isDashboardPage = window.location.pathname === '/dashboard';
    const hasJustLoggedIn = sessionStorage.getItem('mysteryverse-just-logged-in');
    
    if (isDashboardPage && hasJustLoggedIn) {
      // Clear the login flag
      sessionStorage.removeItem('mysteryverse-just-logged-in');
      
      // Try to start music immediately (some browsers may still require interaction)
      try {
        startMusic();
      } catch (error) {
        console.log('Auto-start blocked, will start on first interaction');
      }
    }

    // Fallback: Start music on any user interaction
    const handleUserInteraction = async () => {
      // Only start if music is not already playing and user hasn't disabled it
      if (!isBackgroundMusicPlaying() && musicPreference !== 'false') {
        await startMusic();
      }
    };

    // Listen for clicks and keypresses continuously
    document.addEventListener('click', handleUserInteraction);
    document.addEventListener('keydown', handleUserInteraction);

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
    };
  }, [volume]);

  const handleToggleMusic = async () => {
    const playing = await toggleBackgroundMusic();
    setIsPlaying(playing);
    
    // Save user preference
    localStorage.setItem('mysteryverse-music-enabled', playing.toString());
    
    if (playing) {
      setBackgroundMusicVolume(volume);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setBackgroundMusicVolume(newVolume);
    
    // Save volume preference
    localStorage.setItem('mysteryverse-music-volume', newVolume.toString());
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Main music toggle button */}
      <div className="relative">
        <button
          onClick={() => setShowControls(!showControls)}
          className="bg-mystery-purple bg-opacity-90 backdrop-blur-sm border border-mystery-gold border-opacity-30 rounded-full p-3 hover:bg-opacity-100 transition-all duration-300 shadow-lg"
          title="Music Controls"
          data-music-control
        >
          <span className="text-mystery-gold text-xl">
            {isPlaying ? '🎵' : '🔇'}
          </span>
        </button>

        {/* Expanded controls */}
        {showControls && (
          <div className="absolute bottom-16 right-0 bg-mystery-purple bg-opacity-95 backdrop-blur-sm border border-mystery-gold border-opacity-30 rounded-lg p-4 shadow-xl min-w-[200px]">
            <div className="space-y-3">
              {/* Play/Stop Button */}
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Background Music</span>
                <button
                  onClick={handleToggleMusic}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    isPlaying 
                      ? 'bg-mystery-gold text-white hover:bg-opacity-80' 
                      : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                  }`}
                >
                  {isPlaying ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Volume Slider */}
              {isPlaying && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-xs">Volume</span>
                    <span className="text-mystery-gold text-xs">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}

              {/* Info */}
              <div className="text-xs text-gray-400 pt-2 border-t border-gray-600">
                Mystery Verse Puzzle Adventure Loop
              </div>
            </div>
          </div>
        )}
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

export default MusicControl;