import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import '../styles/simongame.css';

const SimonGame = forwardRef(({ onComplete }, ref) => {
  // Load saved game state from localStorage
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('simon-verse1-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          winStreak: parsed.winStreak || 0,
          currentRound: parsed.currentRound || 1,
          pattern: parsed.pattern || [],
          playerInput: parsed.playerInput || [],
          gameActive: parsed.gameActive || false,
          message: parsed.message || { text: 'Click "Start Game" to begin the ultimate Simon challenge!', type: 'info' },
          timeLeft: 0 // Always reset timeout on load
        };
      }
    } catch (error) {
      console.warn('Failed to load Simon game state:', error);
    }

    return {
      winStreak: 0,
      currentRound: 1,
      pattern: [],
      playerInput: [],
      gameActive: false,
      message: { text: 'Click "Start Game" to begin the ultimate Simon challenge!', type: 'info' },
      timeLeft: 0
    };
  };

  const initialState = loadGameState();
  const [winStreak, setWinStreak] = useState(initialState.winStreak);
  const [currentRound, setCurrentRound] = useState(initialState.currentRound);
  const [pattern, setPattern] = useState(initialState.pattern);
  const [playerInput, setPlayerInput] = useState(initialState.playerInput);
  const [isPlayingSequence, setIsPlayingSequence] = useState(false);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [gameActive, setGameActive] = useState(initialState.gameActive);
  const [message, setMessage] = useState(initialState.message);
  const [timeLeft, setTimeLeft] = useState(initialState.timeLeft);

  const inputTimeoutRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Difficulty settings
  const baseSpeed = 400;
  const speedDecrease = 50;
  const basePatternLength = 5;
  const patternIncrease = 1;
  const inputWindow = 2000;
  const distractionDelay = 500;
  const distractionDuration = 100;

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const gameState = {
        winStreak,
        currentRound,
        pattern,
        playerInput,
        gameActive,
        message
      };
      localStorage.setItem('simon-verse1-state', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save Simon game state:', error);
    }
  }, [winStreak, currentRound, pattern, playerInput, gameActive, message]);

  // Reset game function exposed to parent
  useImperativeHandle(ref, () => ({
    resetGame: () => {
      handleReset();
    }
  }));

  useEffect(() => {
    return () => {
      // Cleanup on unmount
    };
  }, []);

  const getCurrentSpeed = useCallback(() => {
    const speeds = [400, 350, 300, 300, 300];
    return speeds[currentRound - 1] || 300;
  }, [currentRound]);

  const getCurrentPatternLength = useCallback(() => {
    return basePatternLength + (currentRound - 1) * patternIncrease;
  }, [currentRound]);

  const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
  };

  const setGameMessage = (text, type = 'info') => {
    setMessage({ text, type });
  };

  const generateNewPattern = () => {
    const patternLength = getCurrentPatternLength();
    const newPattern = [];
    for (let i = 0; i < patternLength; i++) {
      newPattern.push(Math.floor(Math.random() * 4));
    }
    setPattern(newPattern);
    setPlayerInput([]);
  };

  const flashButton = async (buttonIndex, duration = 200) => {
    const button = document.getElementById(`simon-btn-${buttonIndex}`);
    if (button) {
      button.classList.add('flash');
      await sleep(duration);
      button.classList.remove('flash');
    }
  };

  const showDistraction = async () => {
    let distractionButton;
    do {
      distractionButton = Math.floor(Math.random() * 4);
    } while (pattern.includes(distractionButton) && pattern.length < 4);

    const button = document.getElementById(`simon-btn-${distractionButton}`);
    if (button) {
      button.classList.add('distraction-flash');
      await sleep(distractionDuration);
      button.classList.remove('distraction-flash');
    }
  };

  const playSequence = async () => {
    setIsPlayingSequence(true);
    setGameMessage('Watch the pattern carefully...', 'info');

    const speed = getCurrentSpeed();

    for (let i = 0; i < pattern.length; i++) {
      await sleep(speed);
      await flashButton(pattern[i], speed / 2);
    }

    setIsPlayingSequence(false);
    startPlayerTurn();
  };


  const startPlayerTurn = () => {
    setIsWaitingForInput(true);
    setGameMessage('Your turn! Click the pattern...', 'warning');
  };

  const handleButtonClick = (buttonIndex) => {
    if (!isWaitingForInput || isPlayingSequence) return;

    const newPlayerInput = [...playerInput, buttonIndex];
    setPlayerInput(newPlayerInput);

    // Flash the clicked button
    flashButton(buttonIndex, 100);

    // Check if input matches
    const currentIndex = newPlayerInput.length - 1;
    if (newPlayerInput[currentIndex] !== pattern[currentIndex]) {
      handleMistake('Wrong button! Starting over...');
      return;
    }

    // Check if pattern is complete
    if (newPlayerInput.length === pattern.length) {
      handleSuccess();
    }
  };

  const handleSuccess = async () => {
    setIsWaitingForInput(false);
    const newWinStreak = winStreak + 1;
    setWinStreak(newWinStreak);

    if (newWinStreak >= 5) {
      handleVictory();
    } else {
      const newRound = currentRound + 1;
      setCurrentRound(newRound);
      setGameActive(false);
      setGameMessage(`Round ${currentRound} complete! Click "Start Game" to continue.`, 'success');
    }
  };

  const handleMistake = async (errorMessage) => {
    setIsWaitingForInput(false);
    setWinStreak(0);
    setCurrentRound(1);
    setGameActive(false);

    setGameMessage(errorMessage, 'error');

    await sleep(2000);
    setGameMessage('Click "Start Game" to try again!', 'info');
  };

  const handleVictory = () => {
    setGameActive(false);
    setGameMessage('🎉 VERSE UNLOCKED! You have mastered the Simon challenge! 🎉', 'victory');

    // Clear saved game state on completion
    localStorage.removeItem('simon-verse1-state');

    // Add pulse animation to all buttons
    document.querySelectorAll('.simon-button').forEach(button => {
      button.classList.add('pulse');
    });

    setTimeout(() => {
      document.querySelectorAll('.simon-button').forEach(button => {
        button.classList.remove('pulse');
      });
    }, 3000);

    // Notify parent component
    if (onComplete) {
      onComplete();
    }
  };

  const handleStart = () => {
    setGameActive(true);
    setGameMessage('Get ready...', 'info');

    setTimeout(() => {
      generateNewPattern();
    }, 1000);
  };

  const handleReset = () => {
    // Clear saved game state
    localStorage.removeItem('simon-verse1-state');

    setGameActive(false);
    setIsPlayingSequence(false);
    setIsWaitingForInput(false);
    setWinStreak(0);
    setCurrentRound(1);
    setPattern([]);
    setPlayerInput([]);

    setGameMessage('Click "Start Game" to begin the ultimate Simon challenge!', 'info');
  };

  // Watch for pattern changes to trigger sequence playback
  useEffect(() => {
    if (pattern.length > 0 && gameActive) {
      playSequence();
    }
  }, [pattern]);

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  const buttonColors = ['green', 'red', 'yellow', 'blue'];
  const buttonLabels = ['GREEN', 'RED', 'YELLOW', 'BLUE'];

  return (
    <div className="simon-game-container">

      <div className="simon-stats">
        <div className="simon-stat">
          <div className="simon-stat-label">Win Streak</div>
          <div className="simon-stat-value">{winStreak}</div>
        </div>
        <div className="simon-stat">
          <div className="simon-stat-label">Round</div>
          <div className="simon-stat-value">{currentRound}</div>
        </div>
        <div className="simon-stat">
          <div className="simon-stat-label">Pattern Length</div>
          <div className="simon-stat-value">{getCurrentPatternLength()}</div>
        </div>
      </div>

      <div className="simon-progress-bar">
        <div className="simon-progress-fill" style={{ width: `${(winStreak / 5) * 100}%` }}></div>
      </div>

      <div className="simon-board">
        {buttonColors.map((color, index) => (
          <button
            key={index}
            id={`simon-btn-${index}`}
            className={`simon-button simon-${color}`}
            onClick={() => handleButtonClick(index)}
            disabled={!isWaitingForInput || isPlayingSequence}
          >
            {buttonLabels[index]}
          </button>
        ))}
      </div>

      <div className="simon-controls">
        <button
          className="simon-control-btn"
          onClick={handleStart}
          disabled={gameActive}
        >
          {winStreak > 0 ? `Continue Round ${currentRound}` : 'Start Game'}
        </button>
        <button
          className="simon-control-btn"
          onClick={handleReset}
        >
          Reset
        </button>
      </div>

      <div className={`simon-message simon-${message.type}`}>
        {message.text}
      </div>
    </div>
  );
});

SimonGame.displayName = 'SimonGame';

export default SimonGame;