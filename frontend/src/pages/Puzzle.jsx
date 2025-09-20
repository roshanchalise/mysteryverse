import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { playClickSound } from '../utils/audio';
import MahjongGame from '../components/MahjongGame';
import SimonGame from '../components/SimonGame';
import SymbolMatchingGame from '../components/SymbolMatchingGame';
import UltraHardSymbolGame from '../components/UltraHardSymbolGame';

function Puzzle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showClues, setShowClues] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentPuzzleAnswer, setCurrentPuzzleAnswer] = useState(null);
  const mahjongGameRef = useRef(null);
  const simonGameRef = useRef(null);
  const symbolMatchingGameRef = useRef(null);
  const ultraHardSymbolGameRef = useRef(null);

  useEffect(() => {
    fetchVerse();
  }, [id]);

  const fetchVerse = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/game/verse/${id}`);
      setVerse(response.data.verse);
      setCurrentPuzzleAnswer(response.data.verse.answer);
    } catch (error) {
      console.error('Failed to fetch verse:', error);
      if (error.response?.status === 403) {
        setFeedback('This verse is not unlocked yet!');
        setFeedbackType('error');
      } else if (error.response?.status === 404) {
        setFeedback('Verse not found!');
        setFeedbackType('error');
      } else {
        setFeedback('Failed to load verse');
        setFeedbackType('error');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchNewPuzzle = async () => {
    try {
      setSubmitting(true);

      if (verse && verse.orderIndex === 1) {
        // For Simon game, trigger the game's reset function via ref
        if (simonGameRef.current) {
          simonGameRef.current.resetGame();
        }
        setFeedback('New Simon game started!');
        setFeedbackType('success');

        // Clear success message after 2 seconds
        setTimeout(() => {
          setFeedback('');
          setFeedbackType('');
        }, 2000);
        return;
      }

      if (verse && verse.orderIndex === 2) {
        // For Symbol Matching game, trigger the game's reset function via ref
        if (symbolMatchingGameRef.current) {
          symbolMatchingGameRef.current.resetGame();
        }
        setFeedback('New symbol matching game started!');
        setFeedbackType('success');

        // Clear success message after 2 seconds
        setTimeout(() => {
          setFeedback('');
          setFeedbackType('');
        }, 2000);
        return;
      }

      if (verse && verse.orderIndex === 3) {
        // For Mahjong, trigger the game's reset function via ref
        if (mahjongGameRef.current) {
          mahjongGameRef.current.resetGame();
        }
        setFeedback('New Mahjong board generated!');
        setFeedbackType('success');

        // Clear success message after 2 seconds
        setTimeout(() => {
          setFeedback('');
          setFeedbackType('');
        }, 2000);
        return;
      }
      
      const response = await axios.get(`/api/game/verse/${id}/new-puzzle`);
      
      // For other verses, update the puzzle content
      const newVerse = response.data.verse;
      setVerse(newVerse);
      setCurrentPuzzleAnswer(newVerse.answer);
      setAnswer('');
      setFeedback('New puzzle generated!');
      setFeedbackType('success');
      
      // Clear success message after 2 seconds
      setTimeout(() => {
        setFeedback('');
        setFeedbackType('');
      }, 2000);
    } catch (error) {
      console.error('Failed to fetch new puzzle:', error);
      setFeedbackType('error');
      setFeedback('Failed to generate new puzzle');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    // Form submission - global handler will play click sound

    try {
      setSubmitting(true);
      const response = await axios.post(`/api/game/verse/${id}/submit`, {
        answer: answer.trim(),
        currentPuzzleAnswer: currentPuzzleAnswer
      });

      const { correct, message, gameComplete, alreadySolved } = response.data;

      if (correct) {
        setFeedbackType('success');
        setFeedback(message);
        setAnswer('');
        
        if (!alreadySolved) {
          // Update verse status
          setTimeout(() => {
            if (gameComplete) {
              navigate('/dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 2000);
        }
      } else {
        setFeedbackType('error');
        setFeedback(message);
      }
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setFeedbackType('error');
      setFeedback('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Mahjong game completion
  const handleGameComplete = async () => {
    if (gameCompleted) return; // Prevent multiple submissions
    
    setGameCompleted(true);
    
    try {
      setSubmitting(true);
      const response = await axios.post(`/api/game/verse/${id}/submit`, {
        answer: 'COMPLETE'
      });

      const { correct, message, gameComplete, alreadySolved } = response.data;

      if (correct) {
        setFeedbackType('success');
        setFeedback(message);
        
        if (!alreadySolved) {
          setTimeout(() => {
            if (gameComplete) {
              navigate('/dashboard');
            } else {
              navigate('/dashboard');
            }
          }, 3000);
        }
      } else {
        setFeedbackType('error');
        setFeedback(message);
      }
    } catch (error) {
      console.error('Failed to submit game completion:', error);
      setFeedbackType('error');
      setFeedback('Failed to submit completion');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle game state changes (for debugging or additional features)
  const handleGameStateChange = (boardState) => {
    // Could be used for saving game state, analytics, etc.
    console.log('Game state updated');
  };

  // Check puzzle types
  const isSimonPuzzle = verse && verse.orderIndex === 1;
  const isSymbolMatchingPuzzle = verse && verse.orderIndex === 2;
  const isMahjongPuzzle = verse && verse.orderIndex === 3;
  const isUltraHardSymbolPuzzle = verse && verse.orderIndex === 4;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystery-gold mx-auto mb-4"></div>
          <p className="text-gray-300">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (!verse) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">❌</div>
          <p className="text-red-400 text-lg mb-4">{feedback || 'Puzzle not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div></div>
          <div className="text-right">
            <h1 className="font-title text-2xl font-bold text-mystery-gold">
              Verse {verse.orderIndex}
            </h1>
            <div className="flex items-center justify-end mt-1">
              {verse.isSolved ? (
                <span className="flex items-center text-green-400 text-sm">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Solved
                </span>
              ) : (
                <span className="flex items-center text-mystery-gold text-sm">
                  <span className="w-2 h-2 bg-mystery-gold rounded-full mr-2 animate-pulse"></span>
                  Active
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Puzzle Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Puzzle */}
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h2 className="text-3xl font-bold mb-6 text-center font-title">
                {verse.title}
              </h2>
              
              <div className="prose prose-invert max-w-none mb-6">
                <p className="text-lg leading-relaxed whitespace-pre-line">
                  {verse.description}
                </p>
              </div>

              {/* Interactive Game or Answer Form */}
              {isSimonPuzzle ? (
                <SimonGame
                  ref={simonGameRef}
                  onComplete={handleGameComplete}
                />
              ) : isSymbolMatchingPuzzle ? (
                <SymbolMatchingGame
                  ref={symbolMatchingGameRef}
                  onComplete={handleGameComplete}
                />
              ) : isMahjongPuzzle ? (
                <MahjongGame
                  ref={mahjongGameRef}
                  onComplete={handleGameComplete}
                  onGameStateChange={handleGameStateChange}
                />
              ) : isUltraHardSymbolPuzzle ? (
                <UltraHardSymbolGame
                  ref={ultraHardSymbolGameRef}
                  onComplete={handleGameComplete}
                />
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="answer" className="block text-sm font-medium mb-2">
                      Your Answer
                    </label>
                    <input
                      type="text"
                      id="answer"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      className="input-field"
                      placeholder="Enter your answer..."
                      disabled={submitting}
                      autoComplete="off"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !answer.trim()}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Checking...
                      </div>
                    ) : (
                      'Submit Answer'
                    )}
                  </button>
                </form>
              )}

              {/* Feedback */}
              {feedback && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  feedbackType === 'success' 
                    ? 'bg-green-500 bg-opacity-20 border-green-500 text-green-200' 
                    : 'bg-red-500 bg-opacity-20 border-red-500 text-red-200'
                }`}>
                  <div className="flex items-center">
                    <span className="text-xl mr-2">
                      {feedbackType === 'success' ? '🎉' : '❌'}
                    </span>
                    {feedback}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Clues */}
            {verse.clues && (
              <div className="card">
                <button
                  onClick={() => { setShowClues(!showClues); }}
                  className="w-full text-left flex items-center justify-between mb-4"
                >
                  <h3 className="text-lg font-semibold">Clues</h3>
                  <span className="text-mystery-gold">
                    {showClues ? '−' : '+'}
                  </span>
                </button>
                
                {showClues && (
                  <div className="text-gray-300 whitespace-pre-line">
                    {verse.clues}
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">💡 Tips</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li>• Read the puzzle carefully</li>
                <li>• Think outside the box</li>
                <li>• Pay attention to word play</li>
                <li>• Consider multiple interpretations</li>
                <li>• Take breaks if stuck</li>
              </ul>
            </div>

            {/* Status */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Verse:</span>
                  <span className="text-mystery-gold">#{verse.orderIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className={verse.isSolved ? 'text-green-400' : 'text-mystery-gold'}>
                    {verse.isSolved ? 'Solved' : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Puzzle;