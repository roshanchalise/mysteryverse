import { useState, useCallback, useEffect, forwardRef, useImperativeHandle } from 'react';
import '../styles/symbolmatching.css';

const SymbolMatchingGame = forwardRef(({ onComplete }, ref) => {
  const symbolsBase = [
    { id: 1, symbol: '☯', name: 'Yin Yang', unicode: '☯' },
    { id: 2, symbol: '🕉', name: 'Om (Aum)', unicode: '🕉' },
    { id: 3, symbol: '☥', name: 'Ankh', unicode: '☥' },
    { id: 4, symbol: '🪬', name: 'Hamsa', unicode: '🪬' },
    { id: 5, symbol: '⚕', name: 'Caduceus', unicode: '⚕' },
    { id: 6, symbol: '⚜', name: 'Fleur-de-lis', unicode: '⚜' },
    { id: 7, symbol: '🔱', name: 'Triskele', unicode: '🔱' },
    { id: 8, symbol: '😇', name: 'Aureola', unicode: '😇' },
    { id: 9, symbol: '🔺', name: 'Valknut', unicode: '🔺' },
    { id: 10, symbol: '👁', name: 'The All-Seeing Eye', unicode: '👁' }
  ];

  const meaningsBase = [
    { id: 1, text: 'The complementary and interdependent nature of opposing forces.' },
    { id: 2, text: 'The primordial sound and original vibration of the universe.' },
    { id: 3, text: 'A key to eternal life and divine knowledge.' },
    { id: 4, text: 'Protection from negative energy and the promise of good fortune.' },
    { id: 5, text: 'A symbol of trade, communication, and negotiation.' },
    { id: 6, text: 'A symbol of French heritage, purity, and royalty.' },
    { id: 7, text: 'The cyclical nature of existence and the interconnectedness of three realms.' },
    { id: 8, text: 'The divine or sacred essence of a person or object.' },
    { id: 9, text: 'The mysteries of life and death, and the power of a specific Norse god.' },
    { id: 10, text: 'The watchful and all-knowing presence of a higher power.' }
  ];

  // Shuffle arrays to make them asymmetrical
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Load saved game state from localStorage
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('symbol-matching-verse2-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          symbols: parsed.symbols || shuffleArray(symbolsBase),
          meanings: parsed.meanings || shuffleArray(meaningsBase),
          matches: parsed.matches || {},
          gameCompleted: parsed.gameCompleted || false
        };
      }
    } catch (error) {
      console.warn('Failed to load symbol matching game state:', error);
    }

    return {
      symbols: shuffleArray(symbolsBase),
      meanings: shuffleArray(meaningsBase),
      matches: {},
      gameCompleted: false
    };
  };

  const initialState = loadGameState();
  const [symbols, setSymbols] = useState(initialState.symbols);
  const [meanings, setMeanings] = useState(initialState.meanings);
  const [matches, setMatches] = useState(initialState.matches);
  const [draggedSymbol, setDraggedSymbol] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted);

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const gameState = {
        symbols,
        meanings,
        matches,
        gameCompleted
      };
      localStorage.setItem('symbol-matching-verse2-state', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save symbol matching game state:', error);
    }
  }, [symbols, meanings, matches, gameCompleted]);

  // Reset game function exposed to parent
  useImperativeHandle(ref, () => ({
    resetGame: () => {
      // Clear saved game state
      localStorage.removeItem('symbol-matching-verse2-state');

      const newSymbols = shuffleArray(symbolsBase);
      const newMeanings = shuffleArray(meaningsBase);

      setMatches({});
      setDraggedSymbol(null);
      setFeedback({ message: '', type: '' });
      setGameCompleted(false);
      setSymbols(newSymbols);
      setMeanings(newMeanings);
    }
  }));

  const handleDragStart = (e, symbol) => {
    if (matches[symbol.id]) return; // Don't allow dragging if already matched
    setDraggedSymbol(symbol);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, meaning) => {
    e.preventDefault();

    if (!draggedSymbol) return;

    // Check if this meaning already has a match
    const existingMatch = Object.values(matches).find(match => match.meaningId === meaning.id);
    if (existingMatch) {
      setFeedback({ message: 'This meaning is already matched!', type: 'warning' });
      setDraggedSymbol(null);
      return;
    }

    // Check if the match is correct
    if (draggedSymbol.id === meaning.id) {
      const newMatches = {
        ...matches,
        [draggedSymbol.id]: {
          symbolId: draggedSymbol.id,
          meaningId: meaning.id,
          symbol: draggedSymbol,
          meaning: meaning
        }
      };

      setMatches(newMatches);
      setFeedback({ message: `Correct! ${draggedSymbol.name} matched successfully!`, type: 'success' });

      // Check if game is completed
      if (Object.keys(newMatches).length === symbols.length) {
        setTimeout(() => {
          setGameCompleted(true);
          setFeedback({ message: '🎉 All symbols matched! Verse unlocked! 🎉', type: 'victory' });
          // Clear saved game state on completion
          localStorage.removeItem('symbol-matching-verse2-state');
          if (onComplete) {
            onComplete();
          }
        }, 1000);
      }
    } else {
      setFeedback({ message: 'Incorrect match. Try again!', type: 'error' });
    }

    setDraggedSymbol(null);

    // Clear feedback after 3 seconds
    setTimeout(() => {
      if (!gameCompleted) {
        setFeedback({ message: '', type: '' });
      }
    }, 3000);
  };

  const getMatchedSymbolForMeaning = (meaningId) => {
    return Object.values(matches).find(match => match.meaningId === meaningId);
  };

  const isSymbolMatched = (symbolId) => {
    return matches[symbolId] !== undefined;
  };

  const progress = (Object.keys(matches).length / symbols.length) * 100;

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  return (
    <div className="symbol-matching-container">
      <div className="game-content-wrapper">
        <div className="game-status-section">
          <h3 className="game-title">Ancient Symbol Matching</h3>
          <div className="progress-info">
            <span className="progress-text">
              {Object.keys(matches).length} / {symbols.length} symbols matched
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {feedback.message && (
          <div className={`feedback-message feedback-${feedback.type}`}>
            {feedback.message}
          </div>
        )}

        <div className="game-board">
        {/* Symbols Grid */}
        <div className="symbols-section">
          <h4 className="section-title">Symbols</h4>
          <div className="symbols-grid">
            {symbols.map((symbol) => (
              <div
                key={symbol.id}
                className={`symbol-item ${isSymbolMatched(symbol.id) ? 'matched' : ''} ${
                  draggedSymbol?.id === symbol.id ? 'dragging' : ''
                }`}
                draggable={!isSymbolMatched(symbol.id)}
                onDragStart={(e) => handleDragStart(e, symbol)}
                title={symbol.name}
              >
                <div className="symbol-display">
                  {symbol.symbol}
                </div>
                <div className="symbol-name">
                  {symbol.name}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meanings Grid */}
        <div className="meanings-section">
          <h4 className="section-title">Meanings</h4>
          <div className="meanings-grid">
            {meanings.map((meaning) => {
              const matchedSymbol = getMatchedSymbolForMeaning(meaning.id);
              return (
                <div
                  key={meaning.id}
                  className={`meaning-item ${matchedSymbol ? 'has-match' : ''}`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, meaning)}
                >
                  {matchedSymbol && (
                    <div className="matched-symbol">
                      {matchedSymbol.symbol.symbol}
                    </div>
                  )}
                  <div className="meaning-text">
                    {meaning.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

        <div className="game-instructions">
          <p>
            <strong>Instructions:</strong> Drag each symbol from the left to its correct meaning on the right.
            Match all symbols to unlock the verse!
          </p>
        </div>
      </div>
    </div>
  );
});

SymbolMatchingGame.displayName = 'SymbolMatchingGame';

export default SymbolMatchingGame;