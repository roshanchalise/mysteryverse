// Import pen clicking sound MP3
import clickSoundFile from '../assets/pen-clicking.mp3';

// Audio utility for click sounds
export const playClickSound = () => {
  // Always trigger background music start regardless of click sound setting
  triggerBackgroundMusicStart();
  
  // Check if clicks sound is enabled
  const clicksEnabled = localStorage.getItem('mysteryverse-clicks-enabled') !== 'false';
  if (!clicksEnabled) return;

  // Play the MP3 click sound
  try {
    const audio = new Audio(clickSoundFile);
    audio.volume = 0.2; // Set a reasonable volume level
    audio.play().catch(() => {
      // Silently fail if audio can't play (e.g., browser restrictions)
    });
    
  } catch (error) {
    // Fallback: visual feedback in console if audio fails
    console.log('Click!');
  }
};

// Helper function to trigger background music
const triggerBackgroundMusicStart = () => {
  // Only start background music if user is authenticated
  const token = localStorage.getItem('token');
  if (!token) {
    return; // Don't start music on login/register pages
  }
  
  // Import background music functions dynamically to avoid circular dependencies
  import('./backgroundMusic.js').then(async ({ startBackgroundMusic, isBackgroundMusicPlaying, setBackgroundMusicVolume }) => {
    const musicPreference = localStorage.getItem('mysteryverse-music-enabled');
    
    // Start music if not playing and user hasn't disabled it
    if (!isBackgroundMusicPlaying() && musicPreference !== 'false') {
      const started = await startBackgroundMusic();
      if (started) {
        // Always set volume to 0.1 (10%)
        setBackgroundMusicVolume(0.1);
        localStorage.setItem('mysteryverse-music-enabled', 'true');
      }
      if (musicPreference === null) {
        localStorage.setItem('mysteryverse-music-enabled', 'true');
      }
    }
  }).catch(() => {
    // Silently fail if background music module not available
  });
};

// Alternative click sound with different tone (uses same MP3 file)
export const playButtonSound = () => {
  // Always trigger background music start regardless of click sound setting
  triggerBackgroundMusicStart();
  
  // Check if clicks sound is enabled
  const clicksEnabled = localStorage.getItem('mysteryverse-clicks-enabled') !== 'false';
  if (!clicksEnabled) return;

  // Play the same MP3 click sound
  try {
    const audio = new Audio(clickSoundFile);
    audio.volume = 0.2; // Set a reasonable volume level
    audio.play().catch(() => {
      // Silently fail if audio can't play (e.g., browser restrictions)
    });
    
  } catch (error) {
    // Fallback: visual feedback in console if audio fails
    console.log('Button click!');
  }
};