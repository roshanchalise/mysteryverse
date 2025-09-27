import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../config/api';
import ProgressBar from '../components/ProgressBar';
import VerseCard from '../components/VerseCard';
import { playClickSound } from '../utils/audio';

function Dashboard() {
  const [verses, setVerses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();

  useEffect(() => {
    fetchData();
    
    // Auto-start music when dashboard loads after login/register
    const hasJustLoggedIn = sessionStorage.getItem('mysteryverse-just-logged-in');
    if (hasJustLoggedIn) {
      sessionStorage.removeItem('mysteryverse-just-logged-in');
      
      // Attempt to start music immediately
      import('../utils/backgroundMusic.js').then(async ({ startBackgroundMusic, setBackgroundMusicVolume }) => {
        const musicPreference = localStorage.getItem('mysteryverse-music-enabled');
        
        if (musicPreference !== 'false') {
          try {
            const started = await startBackgroundMusic();
            if (started) {
              // Always set volume to 0.1 (10%)
              setBackgroundMusicVolume(0.1);
              localStorage.setItem('mysteryverse-music-enabled', 'true');
            }
          } catch (error) {
            console.log('Auto-start music blocked by browser, will start on first interaction');
          }
        }
      }).catch(() => {
        console.log('Background music module not available');
      });
    }

    // Add global click handler to trigger background music on any dashboard interaction
    const handleGlobalClick = async () => {
      // Import background music functions dynamically
      import('../utils/backgroundMusic.js').then(async ({ startBackgroundMusic, isBackgroundMusicPlaying, setBackgroundMusicVolume }) => {
        const token = localStorage.getItem('token');
        const musicPreference = localStorage.getItem('mysteryverse-music-enabled');
        
        // Only trigger if user is authenticated and music is not disabled
        if (token && !isBackgroundMusicPlaying() && musicPreference !== 'false') {
          try {
            const started = await startBackgroundMusic();
            if (started) {
              // Always set volume to 0.1 (10%)
              setBackgroundMusicVolume(0.1);
              localStorage.setItem('mysteryverse-music-enabled', 'true');
            }
            if (musicPreference === null) {
              localStorage.setItem('mysteryverse-music-enabled', 'true');
            }
          } catch (error) {
            console.log('Failed to start background music on click');
          }
        }
      }).catch(() => {
        // Silently fail if background music module not available
      });
    };

    // Add click listener to document
    document.addEventListener('click', handleGlobalClick);
    document.addEventListener('keydown', handleGlobalClick);

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleGlobalClick);
    };
  }, []);

  // Refresh data when returning from a puzzle (location change)
  useEffect(() => {
    // Only refetch if we're not in the initial load
    if (!loading) {
      fetchData();
    }
  }, [location.pathname]);

  // Refresh data when returning from completing a verse
  useEffect(() => {
    if (location.state?.refreshProgress) {
      fetchData();
      // Clear the state to prevent repeated refreshes
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Check for progress updates on dashboard focus/load
  useEffect(() => {
    const checkProgressUpdate = () => {
      const lastUpdate = sessionStorage.getItem('mysteryverse-progress-updated');
      const lastCheck = sessionStorage.getItem('mysteryverse-progress-checked');

      if (lastUpdate && lastUpdate !== lastCheck) {
        fetchData();
        sessionStorage.setItem('mysteryverse-progress-checked', lastUpdate);
      }
    };

    // Check immediately
    checkProgressUpdate();

    // Check when window gains focus (user returns from another tab)
    const handleFocus = () => checkProgressUpdate();
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [versesResponse, progressResponse] = await Promise.all([
        api.get('/api/game/verses'),
        api.get('/api/game/progress')
      ]);

      setVerses(versesResponse.data.verses);
      setProgress(progressResponse.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystery-gold mx-auto mb-4"></div>
          <p className="text-gray-300">Loading your journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button onClick={() => { fetchData(); }} className="btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-mystery-gold mb-4">
            Your Journey
          </h1>
          <p className="text-gray-300 text-lg">
            Explore all mysteries at your own pace
          </p>
        </div>

        {/* Progress Section */}
        {progress && (
          <div className="card mb-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6 text-center">Progress Overview</h2>
            <ProgressBar
              progress={progress.progressPercentage}
              currentVerse={progress.currentVerse}
              totalVerses={progress.totalVerses}
              solvedVerses={progress.solvedVerses}
            />

            {progress.solvedVerses === progress.totalVerses ? (
              <div className="mt-6 text-center bg-gradient-to-r from-mystery-gold/20 to-mystery-gold/10 rounded-lg p-6 border border-mystery-gold/30">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-mystery-gold mb-3 font-title">
                  VICTORY ACHIEVED!
                </h2>
                <p className="text-mystery-gold font-semibold text-lg mb-2">
                  Congratulations, Puzzle Master!
                </p>
                <p className="text-gray-300 text-sm">
                  You have successfully completed all verses of the Mystery Verse!<br/>
                  Your wit, persistence, and skill have unlocked every secret.<br/>
                  You are truly a master of puzzles and riddles!
                </p>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <p className="text-gray-300 mb-3">
                  All verses are available - choose any to begin or continue!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Verses Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold mb-6 text-center">All Verses</h2>
          
          {verses.length === 0 ? (
            <div className="text-center text-gray-400">
              <div className="text-6xl mb-4">📚</div>
              <p>No verses available yet. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {verses.map((verse) => (
                <VerseCard key={verse.id} verse={verse} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;