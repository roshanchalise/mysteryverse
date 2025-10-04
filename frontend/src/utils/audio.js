// Import pen clicking sound MP3
import clickSoundFile from '../assets/pen-clicking.mp3';
// Import right answer sound MP3
import rightAnswerSoundFile from '../assets/right-answer.mp3';
// Import wrong answer sound MP3
import wrongAnswerSoundFile from '../assets/wrong-answer.mp3';

// Helper function to get current user ID from token
const getCurrentUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // JWT tokens have 3 parts separated by dots
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.userId;
  } catch (error) {
    return null;
  }
};

// Audio utility for click sounds
export const playClickSound = () => {
  // Always trigger background music start regardless of click sound setting
  triggerBackgroundMusicStart();

  // Check if clicks sound is enabled
  const userId = getCurrentUserId();
  const clicksKey = userId ? `mysteryverse-clicks-enabled-${userId}` : 'mysteryverse-clicks-enabled';
  const clicksEnabled = localStorage.getItem(clicksKey) !== 'false';
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
    const userId = getCurrentUserId();
    const musicKey = userId ? `mysteryverse-music-enabled-${userId}` : 'mysteryverse-music-enabled';
    const musicPreference = localStorage.getItem(musicKey);
    
    // Start music if not playing and user hasn't disabled it
    if (!isBackgroundMusicPlaying() && musicPreference !== 'false') {
      const started = await startBackgroundMusic();
      if (started) {
        // Always set volume to 0.1 (10%)
        setBackgroundMusicVolume(0.1);
        localStorage.setItem(musicKey, 'true');
      }
      if (musicPreference === null) {
        localStorage.setItem(musicKey, 'true');
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
  const userId = getCurrentUserId();
  const clicksKey = userId ? `mysteryverse-clicks-enabled-${userId}` : 'mysteryverse-clicks-enabled';
  const clicksEnabled = localStorage.getItem(clicksKey) !== 'false';
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

// Play right answer sound
export const playCorrectAnswerSound = () => {
  // Check if clicks sound is enabled
  const userId = getCurrentUserId();
  const clicksKey = userId ? `mysteryverse-clicks-enabled-${userId}` : 'mysteryverse-clicks-enabled';
  const clicksEnabled = localStorage.getItem(clicksKey) !== 'false';
  if (!clicksEnabled) return;

  // Play the right answer MP3 sound
  try {
    const audio = new Audio(rightAnswerSoundFile);
    audio.volume = 0.3; // Set a slightly higher volume for celebration
    audio.play().catch(() => {
      // Silently fail if audio can't play (e.g., browser restrictions)
    });

  } catch (error) {
    // Fallback: visual feedback in console if audio fails
    console.log('Correct answer!');
  }
};

// Play wrong answer sound
export const playWrongAnswerSound = () => {
  // Check if clicks sound is enabled
  const userId = getCurrentUserId();
  const clicksKey = userId ? `mysteryverse-clicks-enabled-${userId}` : 'mysteryverse-clicks-enabled';
  const clicksEnabled = localStorage.getItem(clicksKey) !== 'false';
  if (!clicksEnabled) return;

  // Play the wrong answer MP3 sound
  try {
    const audio = new Audio(wrongAnswerSoundFile);
    audio.volume = 0.3; // Set a reasonable volume level
    audio.play().catch(() => {
      // Silently fail if audio can't play (e.g., browser restrictions)
    });

  } catch (error) {
    // Fallback: visual feedback in console if audio fails
    console.log('Wrong answer!');
  }
};