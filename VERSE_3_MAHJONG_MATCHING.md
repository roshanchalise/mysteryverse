# Verse 3: Mahjong Tile Matching Game

## Overview
This document contains the complete implementation of a traditional Mahjong tile matching game for verse 3. Players must clear the board by matching identical tiles in pairs.

## Game Rules

### Objective
Clear all 48 tiles from the 6x8 board by matching identical pairs to unlock the verse.

### Gameplay
- Click on two identical tiles to remove them from the board
- A tile is "free" (clickable) only if it has an open left OR right side
- Tiles with neighbors on both sides cannot be selected
- Match all tiles to win and unlock the verse

### Winning Condition
Successfully match all 24 pairs (48 tiles total) to complete the game.

## Mahjong Tiles Used

The game uses 24 different traditional Mahjong Unicode characters:
- **Characters**: 🀈 🀪 ◉ 🀧 🀀 🀃 🀧 🀂 🀨 🀤 🀌 🀅 🀋 🀏 🀨 🀏 🀪 🀩 🀎 🀦 🀐 🀌 🀎 🀇
- **Pairs**: Each tile appears exactly twice on the board
- **Total**: 48 tiles (24 pairs) arranged on a 6x8 grid

## Game Features

### Core Mechanics
1. **Tile Freedom Rules**: Mahjong-style freedom (left OR right side must be open)
2. **Visual Feedback**: Selected tiles highlighted in gold
3. **Coordinate System**: Columns A-H, Rows 1-6 for precise tile identification
4. **Match Validation**: Only identical tiles can be matched
5. **Dynamic Reshuffling**: Board reshuffles after each match for continuous challenge

### Visual Design
- Clean grid layout with labeled rows and columns
- Traditional Mahjong tile symbols
- Golden highlighting for selected tiles
- Real-time tile counter display
- Status messages for player feedback

### Technical Implementation
- React functional component with hooks
- localStorage persistence - game continues after browser refresh
- Coordinate-based tile identification
- Automatic game state validation
- Responsive design for various screen sizes

## Board Layout

```
    A  B  C  D  E  F  G  H
1   🀈 🀪 ◉ 🀧 🀀 🀃 🀧 🀂
2   🀨 🀤 🀌 🀅 🀋 🀏 🀨 🀏
3   🀪 🀩 🀎 🀦 🀐 🀌 🀎 🀇
4   🀤 🀁 🀐 🀦 🀆 🀆 🀈 🀇
5   🀍 🀃 🀀 🀁 🀂 🀩 🀊 [..]
6   🀋 🀉 🀉 ◉ 🀍 🀥 🀅 🀊
```
*Note: Actual layout is randomly shuffled each game*

## Game Flow

1. **Start**: 48 tiles randomly distributed on 6x8 grid
2. **Selection**: Click first tile (must be free)
3. **Matching**: Click second tile of same type
4. **Validation**: If tiles match and both are free, remove them
5. **Reshuffle**: Remaining tiles randomly redistribute
6. **Continue**: Repeat until all tiles are cleared
7. **Victory**: All tiles matched - verse unlocked!

## Tile Freedom Rules

A tile is considered "free" and clickable when:
- **Left side open**: No tile directly to the left, OR
- **Right side open**: No tile directly to the right

Examples:
- Corner tiles: Always free (at least one open side)
- Edge tiles: Usually free (one side against border)
- Center tiles: Free only if left OR right neighbor is missing

## Game States

- **Playing**: Normal gameplay, tiles can be selected and matched
- **Won**: All tiles cleared successfully
- **Lost**: No valid moves available (rare due to reshuffling)

## Error Handling

- **Invalid Selection**: Non-free tiles cannot be selected
- **Mismatched Tiles**: Different tile types show error message
- **No Valid Moves**: Automatic board reshuffle ensures playability
- **Persistence**: Game state saved automatically, recovers from crashes

## Technical Specifications

### Board Generation
- 24 unique Mahjong tiles × 2 copies = 48 total tiles
- Random shuffle algorithm ensures fair distribution
- Guaranteed solvable board (reshuffling prevents deadlocks)

### Tile Matching Logic
```javascript
if (firstTile === secondTile && bothTilesFree) {
    removeTiles();
    reshuffleBoard();
}
```

### Persistence Features
- Storage key: `mahjong-verse3-state`
- Saves: Board state, selected tiles, message, tiles remaining
- Auto-recovery: Continues from exact point after browser refresh
- Cleanup: Clears saved state on game completion

## Integration Instructions

### File Structure
```
frontend/src/
├── components/
│   └── MahjongGame.jsx
└── styles/
    └── (uses Tailwind CSS classes)
```

### Usage
```javascript
import MahjongGame from './components/MahjongGame';

<MahjongGame
  onComplete={() => console.log('Verse 3 unlocked!')}
  onGameStateChange={(board) => console.log('Board updated')}
  ref={gameRef}
/>
```

This Mahjong tile matching game provides an authentic tile-matching experience with modern web technology, serving as an engaging puzzle for verse 3 of the mystery verse challenge.