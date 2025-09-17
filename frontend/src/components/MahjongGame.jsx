import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';

// Mahjong tile Unicode characters (24 unique symbols)
const MAHJONG_TILES = [
  '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇', '🀈', '🀉', '🀊', '🀋',
  '🀌', '🀍', '🀎', '🀏', '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗'
];

// Generate board using guaranteed solvable method
const generateBoard = () => {
  return generateOptimalBoard();
};

// Generate board with fixed layout to ensure consistent experience
const generateOptimalBoard = () => {
  const board = [];

  // Initialize empty board
  for (let row = 0; row < 6; row++) {
    board[row] = [];
    for (let col = 0; col < 8; col++) {
      board[row][col] = {
        tile: '',
        visible: true,
        row,
        col
      };
    }
  }

  // Fixed, carefully designed solvable layout
  // This ensures all players get the same challenge
  const fixedLayout = [
    ['🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', '🀇'],
    ['🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏'],
    ['🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗'],
    ['🀗', '🀖', '🀕', '🀔', '🀓', '🀒', '🀑', '🀐'],
    ['🀏', '🀎', '🀍', '🀌', '🀋', '🀊', '🀉', '🀈'],
    ['🀇', '🀆', '🀅', '🀄', '🀃', '🀂', '🀁', '🀀']
  ];

  // Place tiles according to fixed layout
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      board[row][col].tile = fixedLayout[row][col];
    }
  }

  return board;
};

// Shuffle array in place
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};

// Check if a tile is "free" (can be selected)
const isTileFree = (board, row, col) => {
  if (!board[row] || !board[row][col] || !board[row][col].visible) {
    return false;
  }
  
  // Check left and right sides
  const hasLeftNeighbor = col > 0 && board[row][col - 1] && board[row][col - 1].visible;
  const hasRightNeighbor = col < 7 && board[row][col + 1] && board[row][col + 1].visible;
  
  // Tile is free if at least one side (left OR right) is open
  return !hasLeftNeighbor || !hasRightNeighbor;
};

// Check for valid moves remaining
const hasValidMoves = (board) => {
  const freeTiles = [];
  
  // Find all free tiles
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col].visible && isTileFree(board, row, col)) {
        freeTiles.push({ row, col, tile: board[row][col].tile });
      }
    }
  }
  
  // Check if any two free tiles match
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (freeTiles[i].tile === freeTiles[j].tile) {
        return true;
      }
    }
  }
  
  return false;
};

const MahjongGame = forwardRef(({ onComplete, onGameStateChange }, ref) => {
  // Load saved game state from localStorage or create new game
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('mahjong-verse3-state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          board: parsed.board || generateBoard(),
          selectedTiles: parsed.selectedTiles || [],
          message: parsed.message || 'Select two matching tiles to remove them from the board.',
          gameStatus: parsed.gameStatus || 'playing',
          tilesRemaining: parsed.tilesRemaining || 48
        };
      }
    } catch (error) {
      console.warn('Failed to load saved game state:', error);
    }
    return {
      board: generateBoard(),
      selectedTiles: [],
      message: 'Select two matching tiles to remove them from the board.',
      gameStatus: 'playing',
      tilesRemaining: 48
    };
  };

  const initialState = loadGameState();
  const [board, setBoard] = useState(initialState.board);
  const [selectedTiles, setSelectedTiles] = useState(initialState.selectedTiles);
  const [message, setMessage] = useState(initialState.message);
  const [gameStatus, setGameStatus] = useState(initialState.gameStatus);
  const [tilesRemaining, setTilesRemaining] = useState(initialState.tilesRemaining);

  // Save game state to localStorage
  const saveGameState = useCallback(() => {
    try {
      const gameState = {
        board,
        selectedTiles,
        message,
        gameStatus,
        tilesRemaining
      };
      localStorage.setItem('mahjong-verse3-state', JSON.stringify(gameState));
    } catch (error) {
      console.warn('Failed to save game state:', error);
    }
  }, [board, selectedTiles, message, gameStatus, tilesRemaining]);

  // Convert row/col to coordinate string (A1, B2, etc.)
  const getCoordinateString = (row, col) => {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  };

  // Smart reshuffle: prioritize placing pairs where at least one will be accessible
  const reshuffleRemainingTiles = (currentBoard) => {
    const remainingTiles = [];
    const visiblePositions = [];
    
    // Collect remaining tiles and their positions
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        if (currentBoard[row][col].visible) {
          remainingTiles.push(currentBoard[row][col].tile);
          visiblePositions.push({ row, col });
        }
      }
    }
    
    // Count tile pairs
    const tileCounts = {};
    remainingTiles.forEach(tile => {
      tileCounts[tile] = (tileCounts[tile] || 0) + 1;
    });
    
    // Create pairs array
    const pairs = [];
    Object.entries(tileCounts).forEach(([tile, count]) => {
      for (let i = 0; i < Math.floor(count / 2); i++) {
        pairs.push(tile);
      }
    });
    
    // Sort positions by accessibility (free positions first)
    visiblePositions.sort((a, b) => {
      const aFree = isTileFree(currentBoard, a.row, a.col);
      const bFree = isTileFree(currentBoard, b.row, b.col);
      
      // Prioritize corner positions, then edges, then inner
      const getPositionPriority = (pos) => {
        const { row, col } = pos;
        if ((row === 0 || row === 5) && (col === 0 || col === 7)) return 3; // corners
        if (row === 0 || row === 5 || col === 0 || col === 7) return 2; // edges
        return 1; // inner
      };
      
      const aPriority = getPositionPriority(a);
      const bPriority = getPositionPriority(b);
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      return bFree - aFree;
    });
    
    // Create new board
    const newBoard = currentBoard.map(boardRow => [...boardRow]);
    
    // Clear all visible positions first
    visiblePositions.forEach(pos => {
      newBoard[pos.row][pos.col].tile = '';
    });
    
    // Place pairs strategically
    let positionIndex = 0;
    pairs.forEach(tile => {
      // Place first tile of pair in best available position
      if (positionIndex < visiblePositions.length) {
        const pos1 = visiblePositions[positionIndex];
        newBoard[pos1.row][pos1.col].tile = tile;
        positionIndex++;
      }
      
      // Place second tile of pair in next best position
      if (positionIndex < visiblePositions.length) {
        const pos2 = visiblePositions[positionIndex];
        newBoard[pos2.row][pos2.col].tile = tile;
        positionIndex++;
      }
    });
    
    return newBoard;
  };

  // Check game state
  const checkGameState = useCallback((currentBoard) => {
    const remaining = currentBoard.flat().filter(cell => cell.visible).length;
    setTilesRemaining(remaining);
    
    if (remaining === 0) {
      setGameStatus('won');
      setMessage('🎉 Congratulations! All tiles cleared! The harmony is restored.');
      // Clear saved game state on completion
      localStorage.removeItem('mahjong-verse3-state');
      onComplete();
      return;
    }
    
    if (!hasValidMoves(currentBoard)) {
      // Auto-reshuffle to ensure continued playability
      const reshuffledBoard = reshuffleRemainingTiles(currentBoard);
      
      // Check if reshuffle created valid moves
      if (hasValidMoves(reshuffledBoard)) {
        setBoard(reshuffledBoard);
        setMessage('🔄 No valid moves found! Tiles have been reshuffled to continue the game.');
        setGameStatus('playing');
        return;
      } else {
        // Even after reshuffle, no moves available (very rare)
        setGameStatus('lost');
        setMessage('💀 No valid moves possible even after reshuffle. This is extremely rare! Try a new game.');
        return;
      }
    }
    
    setGameStatus('playing');
  }, [onComplete]);

  // Handle tile selection
  const handleTileClick = (row, col) => {
    if (gameStatus !== 'playing') return;
    
    const tile = board[row][col];
    if (!tile.visible) return;
    
    if (!isTileFree(board, row, col)) {
      setMessage(`❌ Tile at ${getCoordinateString(row, col)} is not free! It must have at least one open side (left or right).`);
      return;
    }
    
    // Check if tile is already selected
    const isAlreadySelected = selectedTiles.some(selected => 
      selected.row === row && selected.col === col
    );
    
    if (isAlreadySelected) {
      // Deselect tile
      setSelectedTiles(selectedTiles.filter(selected => 
        !(selected.row === row && selected.col === col)
      ));
      setMessage('Tile deselected. Choose tiles to match.');
      return;
    }
    
    const newSelectedTiles = [...selectedTiles, { row, col, tile: tile.tile }];
    
    if (newSelectedTiles.length === 1) {
      setSelectedTiles(newSelectedTiles);
      setMessage(`Selected ${getCoordinateString(row, col)} (${tile.tile}). Choose a matching tile.`);
    } else if (newSelectedTiles.length === 2) {
      const [first, second] = newSelectedTiles;
      
      if (first.tile === second.tile) {
        // Matching tiles - remove them
        const newBoard = board.map(boardRow => [...boardRow]);
        newBoard[first.row][first.col].visible = false;
        newBoard[second.row][second.col].visible = false;
        
        setBoard(newBoard);
        setSelectedTiles([]);
        setMessage(`✅ Match found! ${getCoordinateString(first.row, first.col)} and ${getCoordinateString(second.row, second.col)} removed.`);
        
        setTimeout(() => {
          checkGameState(newBoard);
          onGameStateChange(newBoard);
        }, 500);
      } else {
        // Not matching
        setSelectedTiles([]);
        setMessage(`❌ ${getCoordinateString(first.row, first.col)} (${first.tile}) and ${getCoordinateString(second.row, second.col)} (${second.tile}) don't match. Try again.`);
      }
    }
  };

  // Reset game
  const resetGame = () => {
    // Clear saved game state
    localStorage.removeItem('mahjong-verse3-state');

    const newBoard = generateBoard();
    setBoard(newBoard);
    setSelectedTiles([]);
    setMessage('New game started! Select two matching tiles.');
    setGameStatus('playing');
    setTilesRemaining(48);
    onGameStateChange(newBoard);
  };

  // Expose resetGame function through ref
  useImperativeHandle(ref, () => ({
    resetGame
  }));

  // Check if tile is selected
  const isTileSelected = (row, col) => {
    return selectedTiles.some(selected => selected.row === row && selected.col === col);
  };

  // Save game state whenever it changes
  useEffect(() => {
    saveGameState();
  }, [saveGameState]);

  // Initial game state check
  useEffect(() => {
    checkGameState(board);
    onGameStateChange(board);
  }, [checkGameState, board, onGameStateChange]);

  return (
    <div className="mahjong-game">
      {/* Game Status */}
      <div className="mb-6 text-center">
        <div className="mb-2">
          <span className="text-mystery-gold font-bold">Tiles Remaining: {tilesRemaining}/48</span>
        </div>
        <div className={`p-3 rounded-lg text-sm ${
          message.includes('❌') ? 'bg-red-500 bg-opacity-20 text-red-300' :
          message.includes('✅') ? 'bg-green-500 bg-opacity-20 text-green-300' :
          message.includes('🎉') ? 'bg-yellow-500 bg-opacity-20 text-yellow-300' :
          'bg-blue-500 bg-opacity-20 text-blue-300'
        }`}>
          {message}
        </div>
      </div>

      {/* Game Board */}
      <div className="game-board mb-6">
        {/* Column headers */}
        <div className="flex mb-2">
          <div className="w-8"></div>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="w-12 h-8 flex items-center justify-center text-mystery-gold font-bold">
              {String.fromCharCode(65 + i)}
            </div>
          ))}
        </div>
        
        {/* Board rows */}
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex mb-1">
            {/* Row header */}
            <div className="w-8 h-12 flex items-center justify-center text-mystery-gold font-bold">
              {rowIndex + 1}
            </div>
            
            {/* Tiles */}
            {row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`w-12 h-12 border border-gray-600 flex items-center justify-center cursor-pointer text-2xl transition-all duration-200 ${
                  !cell.visible ? 'bg-gray-800 border-gray-700' :
                  !isTileFree(board, rowIndex, colIndex) ? 'bg-gray-700 opacity-50 cursor-not-allowed' :
                  isTileSelected(rowIndex, colIndex) ? 'bg-mystery-gold bg-opacity-30 border-mystery-gold' :
                  'bg-gray-900 hover:bg-gray-700 border-gray-500'
                }`}
                onClick={() => handleTileClick(rowIndex, colIndex)}
                title={cell.visible ? `${getCoordinateString(rowIndex, colIndex)} - ${cell.tile}` : ''}
              >
                {cell.visible ? cell.tile : ''}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Controls */}
      <div className="flex justify-center mt-4">
        <button
          onClick={resetGame}
          className="px-4 py-2 bg-mystery-gold hover:bg-opacity-80 text-white rounded-lg font-medium transition-colors"
        >
          Try Again
        </button>
      </div>

      {/* Game Rules */}
      <div className="mt-6 text-sm text-gray-400">
        <p><strong>Rules:</strong> Click on two matching tiles to remove them. A tile is "free" (clickable) only if it has an open left OR right side with no adjacent tile.</p>
        <p><strong>Coordinates:</strong> Columns A-H, Rows 1-6. Selected tiles are highlighted in gold.</p>
      </div>
    </div>
  );
});

MahjongGame.displayName = 'MahjongGame';

export default MahjongGame;