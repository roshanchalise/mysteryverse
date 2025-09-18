# Verse 2: Symbol Matching Challenge

## Overview
This document contains the complete implementation of a React-based symbol matching game for verse 2. Players must correctly match 10 ancient symbols with their corresponding meanings through drag and drop interactions.

## Game Rules

### Objective
Match all 10 symbols with their correct meanings to unlock the verse.

### Gameplay
- Drag symbols from the left grid to their corresponding meanings on the right
- Correct matches will lock in place with visual feedback
- Incorrect matches will return to original position
- Complete all matches to win and unlock the verse

## Symbols and Meanings

1. **Yin Yang** - The complementary and interdependent nature of opposing forces.
2. **Om (Aum)** - The primordial sound and original vibration of the universe.
3. **Ankh** - A key to eternal life and divine knowledge.
4. **Hamsa** - Protection from negative energy and the promise of good fortune.
5. **Caduceus** - A symbol of trade, communication, and negotiation.
6. **Fleur-de-lis** - A symbol of French heritage, purity, and royalty.
7. **Triskele** - The cyclical nature of existence and the interconnectedness of three realms.
8. **Aureola** - The divine or sacred essence of a person or object.
9. **Valknut** - The mysteries of life and death, and the power of a specific Norse god.
10. **The All-Seeing Eye** - The watchful and all-knowing presence of a higher power.

## Complete React Implementation

### SymbolMatchingGame.jsx
```jsx
import { useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import '../styles/symbolmatching.css';

const SymbolMatchingGame = forwardRef(({ onComplete }, ref) => {
  const symbols = [
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

  const meanings = [
    { id: 1, text: 'Symbolizes the duality and interconnectedness of opposing forces' },
    { id: 2, text: 'A sacred sound and spiritual icon in Hinduism, Buddhism, and Jainism' },
    { id: 3, text: 'An ancient Egyptian hieroglyphic symbol representing life' },
    { id: 4, text: 'A palm-shaped amulet providing protection against the evil eye' },
    { id: 5, text: 'A staff with two snakes, often used as a symbol of medicine' },
    { id: 6, text: 'A stylized lily symbol, associated with French royalty' },
    { id: 7, text: 'A Celtic symbol representing eternity, cycles of life, and motion' },
    { id: 8, text: 'A radiant light haloing divine or sacred figures' },
    { id: 9, text: 'A Norse symbol of three interlocked triangles, associated with Odin' },
    { id: 10, text: 'An eye surrounded by rays, representing divine providence' }
  ];

  const [matches, setMatches] = useState({});
  const [draggedSymbol, setDraggedSymbol] = useState(null);
  const [feedback, setFeedback] = useState({ message: '', type: '' });
  const [gameCompleted, setGameCompleted] = useState(false);

  // Reset game function exposed to parent
  useImperativeHandle(ref, () => ({
    resetGame: () => {
      setMatches({});
      setDraggedSymbol(null);
      setFeedback({ message: '', type: '' });
      setGameCompleted(false);
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

  return (
    <div className="symbol-matching-container">
      <div className="game-header">
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
  );
});

SymbolMatchingGame.displayName = 'SymbolMatchingGame';

export default SymbolMatchingGame;
```

### symbolmatching.css
```css
.symbol-matching-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.game-header {
  text-align: center;
  margin-bottom: 20px;
}

.game-title {
  font-size: 1.8em;
  color: #ffd700;
  margin-bottom: 15px;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.progress-text {
  font-size: 1.1em;
  color: #cccccc;
  font-weight: 500;
}

.progress-bar {
  width: 300px;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.feedback-message {
  text-align: center;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: bold;
  font-size: 1.1em;
}

.feedback-success {
  background: rgba(76, 175, 80, 0.2);
  border: 1px solid #4caf50;
  color: #4caf50;
}

.feedback-error {
  background: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  color: #f44336;
}

.feedback-warning {
  background: rgba(255, 152, 0, 0.2);
  border: 1px solid #ff9800;
  color: #ff9800;
}

.feedback-victory {
  background: rgba(255, 215, 0, 0.2);
  border: 1px solid #ffd700;
  color: #ffd700;
  font-size: 1.3em;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.game-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.3em;
  color: #ffd700;
  text-align: center;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.symbols-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.symbols-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

.symbol-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  cursor: grab;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.2);
  user-select: none;
}

.symbol-item:hover:not(.matched) {
  background: rgba(255, 255, 255, 0.15);
  border-color: #ffd700;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.symbol-item.dragging {
  opacity: 0.7;
  transform: scale(0.95);
}

.symbol-item.matched {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
  cursor: default;
  opacity: 0.7;
}

.symbol-display {
  font-size: 2.5em;
  margin-bottom: 8px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.symbol-name {
  font-size: 0.9em;
  color: #cccccc;
  font-weight: 500;
}

.meanings-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.meanings-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.meaning-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 15px;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  min-height: 80px;
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
}

.meaning-item:hover {
  border-color: #ffd700;
  background: rgba(255, 255, 255, 0.12);
}

.meaning-item.has-match {
  background: rgba(76, 175, 80, 0.15);
  border: 2px solid #4caf50;
}

.matched-symbol {
  font-size: 2em;
  min-width: 50px;
  text-align: center;
  flex-shrink: 0;
}

.meaning-text {
  flex: 1;
  font-size: 0.95em;
  line-height: 1.4;
  color: #e0e0e0;
}

.game-instructions {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid #2196f3;
  border-radius: 10px;
  padding: 15px;
  text-align: center;
}

.game-instructions p {
  margin: 0;
  color: #90caf9;
  font-size: 0.95em;
  line-height: 1.5;
}

/* Responsive Design */
@media (max-width: 768px) {
  .game-board {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .symbols-grid {
    grid-template-columns: 1fr;
  }

  .symbol-display {
    font-size: 2em;
    height: 50px;
  }

  .symbol-name {
    font-size: 0.85em;
  }

  .meaning-text {
    font-size: 0.9em;
  }

  .progress-bar {
    width: 250px;
  }
}

@media (max-width: 480px) {
  .symbol-matching-container {
    padding: 15px;
  }

  .game-title {
    font-size: 1.5em;
  }

  .symbol-display {
    font-size: 1.8em;
    height: 45px;
  }

  .matched-symbol {
    font-size: 1.5em;
    min-width: 40px;
  }

  .progress-bar {
    width: 200px;
  }
}

/* Drag and Drop Effects */
@media (pointer: coarse) {
  .symbol-item {
    cursor: pointer;
  }
}

.symbol-item:active {
  cursor: grabbing;
}

/* Animation for successful matches */
@keyframes matchSuccess {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

.meaning-item.has-match {
  animation: matchSuccess 0.5s ease;
}

/* Pulse animation for completed game */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.feedback-victory {
  animation: pulse 2s infinite;
}
```

## Integration Instructions

### 1. File Structure
```
frontend/src/
├── components/
│   └── SymbolMatchingGame.jsx
└── styles/
    └── symbolmatching.css
```

### 2. Implementation Steps

1. **Create Component Files**: Save the JSX and CSS code in the respective files
2. **Import in Puzzle.jsx**: Add the component to the puzzle page routing
3. **Update Database**: Modify seed data for verse 2 to reflect the symbol matching game
4. **Test Functionality**: Verify drag and drop works across different devices

### 3. Game Features

- **Drag and Drop Interface**: Intuitive symbol matching
- **Visual Feedback**: Clear success/error messages
- **Progress Tracking**: Real-time completion percentage
- **localStorage Persistence**: Game continues after browser refresh
- **Responsive Design**: Works on desktop and mobile
- **Accessibility**: Keyboard navigation support
- **Match Validation**: Prevents duplicate matches
- **Victory Condition**: All symbols must be correctly matched

### 4. Educational Value

This game teaches players about ancient symbols from various cultures:
- **Eastern Philosophy**: Yin Yang, Om
- **Ancient Egypt**: Ankh
- **Middle Eastern Culture**: Hamsa
- **Medical Symbols**: Caduceus
- **European Heraldry**: Fleur-de-lis
- **Celtic Tradition**: Triskele
- **Christian Iconography**: Aureola
- **Norse Mythology**: Valknut
- **Esoteric Symbols**: All-Seeing Eye

The symbol matching game provides both entertainment and cultural education, making it an ideal puzzle for verse 2 of the mystery verse challenge.