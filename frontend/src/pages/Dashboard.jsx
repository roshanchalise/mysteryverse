import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProgressBar from '../components/ProgressBar';
import VerseCard from '../components/VerseCard';
import { playClickSound } from '../utils/audio';

function Dashboard() {
  const [verses, setVerses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [versesResponse, progressResponse] = await Promise.all([
        axios.get('/api/game/verses'),
        axios.get('/api/game/progress')
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

  const currentVerse = verses.find(v => !v.isSolved && v.isUnlocked);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-mystery-gold mb-4">
            Your Journey
          </h1>
          <p className="text-gray-300 text-lg">
            Unravel the mysteries, one verse at a time
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
            />
            
            {progress.progressPercentage === 100 ? (
              <div className="mt-6 text-center">
                <div className="text-4xl mb-2">🎉</div>
                <p className="text-mystery-gold font-semibold">
                  Congratulations! You've completed all verses!
                </p>
              </div>
            ) : currentVerse && (
              <div className="mt-6 text-center">
                <p className="text-gray-300 mb-3">Currently working on:</p>
                <p className="text-mystery-gold font-semibold text-lg">
                  {currentVerse.title}
                </p>
                <Link 
                  to={`/verse/${currentVerse.id}`}
                  className="btn-primary mt-3 inline-block"
                  onClick={() => {}}
                >
                  Continue Puzzle
                </Link>
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