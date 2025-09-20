import { useState, useEffect, useCallback, forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import '../styles/ultrahardSymbol.css';

// Version number to track game configuration changes
const GAME_VERSION = '1.0';

// Define symbol types outside component to prevent recreation
const SYMBOL_TYPES = [
  { id: 'A', name: 'Normal', class: 'symbol-script-a-normal', unicode: 'a' },
  { id: 'B', name: 'Short', class: 'symbol-script-a-short', unicode: 'a' },
  { id: 'C', name: 'Bold', class: 'symbol-script-a-bold', unicode: 'a' },
  { id: 'D', name: 'Slanted', class: 'symbol-script-a-slanted', unicode: 'a' },
  { id: 'E', name: 'Compressed', class: 'symbol-script-a-compressed', unicode: 'a' }
];

const UltraHardSymbolGame = forwardRef(({ onComplete }, ref) => {
  const initialized = useRef(false);

  // Load saved game state from localStorage or create new game
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('ultrahard-verse4-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        // Check if saved state is from current game version
        if (parsed.version === GAME_VERSION) {
          return {
            grid: parsed.grid || [],
            selectedSymbols: new Set(parsed.selectedSymbols || []),
            clearedSets: new Set(parsed.clearedSets || []),
            feedback: parsed.feedback || { message: '', type: '' },
            gameCompleted: parsed.gameCompleted || false,
            setProgress: parsed.setProgress || { A: 0, B: 0, C: 0, D: 0, E: 0 },
            version: GAME_VERSION
          };
        } else {
          // Clear old version data
          localStorage.removeItem('ultrahard-verse4-state');
        }
      }
    } catch (error) {
      console.warn('Failed to load saved game state:', error);
    }
    return {
      grid: [],
      selectedSymbols: new Set(),
      clearedSets: new Set(),
      feedback: { message: '', type: '' },
      gameCompleted: false,
      setProgress: { A: 0, B: 0, C: 0, D: 0, E: 0 },
      version: GAME_VERSION
    };
  };

  const initialState = loadGameState();
  const [grid, setGrid] = useState(initialState.grid);
  const [selectedSymbols, setSelectedSymbols] = useState(initialState.selectedSymbols);
  const [clearedSets, setClearedSets] = useState(initialState.clearedSets);
  const [feedback, setFeedback] = useState(initialState.feedback);
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted);
  const [setProgress, setSetProgress] = useState(initialState.setProgress);

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const gameState = {
        grid,
        selectedSymbols: Array.from(selectedSymbols),
        clearedSets: Array.from(clearedSets),
        feedback,
        gameCompleted,
        setProgress,
        version: GAME_VERSION
      };
      localStorage.setItem('ultrahard-verse4-state', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }, [grid, selectedSymbols, clearedSets, feedback, gameCompleted, setProgress]);

  // Generate winning sets (5 of each type) - using useMemo to prevent recreation
  const winningSets = useMemo(() => {
    const sets = {};
    SYMBOL_TYPES.forEach(type => {
      sets[type.id] = new Set();
    });
    return sets;
  }, []);

  // Initialize grid with symbols - stable function
  const initializeGrid = useCallback(() => {
    const newGrid = [];
    const positions = Array.from({ length: 100 }, (_, i) => i);

    // Clear winningSets before regenerating
    SYMBOL_TYPES.forEach(type => {
      winningSets[type.id].clear();
    });

    // Shuffle positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Place 5 winning symbols of each type (25 total)
    let positionIndex = 0;
    SYMBOL_TYPES.forEach(type => {
      for (let i = 0; i < 5; i++) {
        const position = positions[positionIndex++];
        winningSets[type.id].add(position);
        newGrid[position] = {
          type: type.id,
          class: type.class,
          unicode: type.unicode,
          isWinning: true,
          position
        };
      }
    });

    // Fill remaining 75 positions with decoy symbols
    // Create an expanded set of decoy variations to avoid exact matches with winning symbols
    for (let i = positionIndex; i < 100; i++) {
      const position = positions[i];
      const randomType = SYMBOL_TYPES[Math.floor(Math.random() * SYMBOL_TYPES.length)];

      // Create slight variations for decoy symbols to make them visually different
      const decoyVariations = [
        'symbol-script-a-normal-decoy',
        'symbol-script-a-short-decoy',
        'symbol-script-a-bold-decoy',
        'symbol-script-a-slanted-decoy',
        'symbol-script-a-compressed-decoy'
      ];

      newGrid[position] = {
        type: randomType.id + '-decoy',
        class: decoyVariations[Math.floor(Math.random() * decoyVariations.length)],
        unicode: randomType.unicode,
        isWinning: false,
        position
      };
    }

    setGrid(newGrid);
  }, []); // No dependencies - this function is stable

  // Try Again function - reshuffles grid but keeps progress
  const handleTryAgain = () => {
    // Clear saved game state
    localStorage.removeItem('ultrahard-verse4-state');

    // Reset only the grid and selections, keep progress
    setSelectedSymbols(new Set());
    setFeedback({ message: 'Grid reshuffled! New symbol positions generated.', type: 'success' });

    // Generate new grid with same progress
    initializeGrid();

    // Clear success message after 2 seconds
    setTimeout(() => {
      setFeedback({ message: '', type: '' });
    }, 2000);
  };

  // Reset game function for external use
  useImperativeHandle(ref, () => ({
    resetGame: () => {
      localStorage.removeItem('ultrahard-verse4-state');
      setSelectedSymbols(new Set());
      setClearedSets(new Set());
      setFeedback({ message: '', type: '' });
      setGameCompleted(false);
      setSetProgress({ A: 0, B: 0, C: 0, D: 0, E: 0 });
      initialized.current = false;
      initializeGrid();
    }
  }));

  // Initialize game on mount - only once
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      if (grid.length === 0) {
        initializeGrid();
      }
    }
  }, []); // Empty dependency - only run once on mount

  // Save game state whenever it changes
  useEffect(() => {
    if (initialized.current) {
      saveGameState();
    }
  }, [saveGameState]);

  // Handle symbol click
  const handleSymbolClick = (position) => {
    if (gameCompleted || selectedSymbols.has(position)) return;

    const symbol = grid[position];
    if (!symbol) return;

    // Check if this is a winning symbol
    if (symbol.isWinning && winningSets[symbol.type]?.has(position)) {
      // Correct selection
      const newSelected = new Set([...selectedSymbols, position]);
      setSelectedSymbols(newSelected);

      // Update progress for this symbol type
      const newProgress = { ...setProgress };
      newProgress[symbol.type]++;
      setSetProgress(newProgress);

      // Check if set is complete
      if (newProgress[symbol.type] === 5) {
        const newClearedSets = new Set([...clearedSets, symbol.type]);
        setClearedSets(newClearedSets);

        setFeedback({
          message: `Set ${symbol.type} cleared! (${newClearedSets.size}/5 sets complete)`,
          type: 'success'
        });

        // Check if game is won
        if (newClearedSets.size === 5) {
          setTimeout(() => {
            setGameCompleted(true);
            setFeedback({
              message: '🎉 INCREDIBLE! All sets cleared! Verse unlocked! 🎉',
              type: 'victory'
            });
            // Clear saved game state on completion
            localStorage.removeItem('ultrahard-verse4-state');
            if (onComplete) {
              onComplete();
            }
          }, 1000);
        }
      } else {
        setFeedback({
          message: `Correct! ${symbol.type}: ${newProgress[symbol.type]}/5`,
          type: 'success'
        });
      }
    } else {
      // Incorrect selection
      setFeedback({
        message: 'Not a target symbol. Keep searching...',
        type: 'error'
      });
    }

    // Clear feedback after 2 seconds
    setTimeout(() => {
      if (!gameCompleted) {
        setFeedback({ message: '', type: '' });
      }
    }, 2000);
  };

  // Calculate overall progress
  const totalProgress = Object.values(setProgress).reduce((sum, count) => sum + count, 0);
  const progressPercentage = (totalProgress / 25) * 100;

  return (
    <div className="ultra-hard-symbol-container">
      <div className="game-header">
        <h3 className="game-title">Ultra-Hard Symbol Matching</h3>
        <div className="difficulty-badge">Difficulty: 10/10</div>

        <div className="progress-section">
          <div className="overall-progress">
            <span className="progress-text">
              Overall Progress: {totalProgress}/25 symbols found
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="set-progress">
            {SYMBOL_TYPES.map(type => (
              <div key={type.id} className="set-counter">
                <div className={`symbol-indicator`}>
                  <div className={type.class}>
                    <span className="symbol-content">{type.unicode}</span>
                  </div>
                </div>
                <span className={`count ${clearedSets.has(type.id) ? 'completed' : ''}`}>
                  {setProgress[type.id]}/5
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={`feedback-message ${feedback.type ? `feedback-${feedback.type}` : 'feedback-empty'}`}>
        {feedback.message || '\u00A0'}
      </div>

      <div className="symbol-grid">
        {grid.map((symbol, index) => (
          <div
            key={index}
            className={`symbol-cell ${symbol.class} ${
              selectedSymbols.has(index) ? 'selected' : ''
            } ${
              symbol.isWinning && winningSets[symbol.type]?.has(index) &&
              selectedSymbols.has(index) ? 'winning-selected' : ''
            }`}
            onClick={() => handleSymbolClick(index)}
            title={`Position ${index + 1}`}
          >
            <span className="symbol-content">{symbol.unicode}</span>
          </div>
        ))}
      </div>

      {/* Try Again Button */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleTryAgain}
          className="px-6 py-3 bg-mystery-gold hover:bg-opacity-80 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={gameCompleted}
        >
          🔄 Try Again (Reshuffle Grid)
        </button>
      </div>

    </div>
  );
});

UltraHardSymbolGame.displayName = 'UltraHardSymbolGame';

export default UltraHardSymbolGame;