// Background music utility using HTML5 Audio
import backgroundMusicFile from '../assets/background-music.mp3';

let audioElement = null;
let musicState = {
  isPlaying: false,
  volume: 0.1,
  isInitialized: false
};

// Create audio element and set up background music
const createBackgroundMusic = () => {
  try {
    if (audioElement) {
      return true; // Already created
    }
    
    audioElement = new Audio(backgroundMusicFile);
    audioElement.loop = true;
    audioElement.volume = musicState.volume;
    
    // Handle audio events
    audioElement.addEventListener('canplaythrough', () => {
      musicState.isInitialized = true;
    });
    
    audioElement.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      musicState.isInitialized = false;
    });
    
    audioElement.addEventListener('ended', () => {
      // This shouldn't happen with loop=true, but just in case
      if (musicState.isPlaying) {
        audioElement.play();
      }
    });
    
    return true;
    
  } catch (error) {
    console.error('Failed to create background music:', error);
    return false;
  }
};

// Start background music
export const startBackgroundMusic = async () => {
  if (musicState.isPlaying) return true;
  
  try {
    // Create audio element if not exists
    if (!audioElement) {
      createBackgroundMusic();
    }
    
    // Wait for audio to be ready
    if (!musicState.isInitialized) {
      await new Promise((resolve, reject) => {
        const checkReady = () => {
          if (audioElement.readyState >= 3) { // HAVE_FUTURE_DATA
            resolve();
          } else {
            setTimeout(checkReady, 100);
          }
        };
        checkReady();
        
        // Timeout after 5 seconds
        setTimeout(() => reject(new Error('Audio load timeout')), 5000);
      });
    }
    
    await audioElement.play();
    musicState.isPlaying = true;
    return true;
    
  } catch (error) {
    console.error('Failed to start background music:', error);
    return false;
  }
};

// Stop background music
export const stopBackgroundMusic = () => {
  if (!audioElement || !musicState.isPlaying) return;
  
  try {
    audioElement.pause();
    audioElement.currentTime = 0;
    musicState.isPlaying = false;
  } catch (error) {
    console.error('Error stopping background music:', error);
  }
};

// Set volume (0.0 to 1.0)
export const setBackgroundMusicVolume = (volume) => {
  const clampedVolume = Math.max(0, Math.min(1, volume));
  musicState.volume = clampedVolume;
  
  if (audioElement) {
    audioElement.volume = clampedVolume;
  }
};

// Toggle music on/off
export const toggleBackgroundMusic = async () => {
  if (musicState.isPlaying) {
    stopBackgroundMusic();
    return false;
  } else {
    const started = await startBackgroundMusic();
    return started;
  }
};

// Check if music is playing
export const isBackgroundMusicPlaying = () => {
  return musicState.isPlaying;
};