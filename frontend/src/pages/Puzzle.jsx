import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../config/api';
import { playClickSound } from '../utils/audio';
import CongratulationsModal from '../components/CongratulationsModal';

function Puzzle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [verse, setVerse] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [currentPuzzleAnswer, setCurrentPuzzleAnswer] = useState(null);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [congratsData, setCongratsData] = useState({ isGameComplete: false });
  const punchAudioRef = useRef(null);
  const fishingAudioRef = useRef(null);

  useEffect(() => {
    fetchVerse();
  }, [id]);

  // Cleanup audio when component unmounts or verse changes
  useEffect(() => {
    return () => {
      // Pause and reset audio when leaving the component
      if (punchAudioRef.current) {
        punchAudioRef.current.pause();
        punchAudioRef.current.currentTime = 0;
      }
      if (fishingAudioRef.current) {
        fishingAudioRef.current.pause();
        fishingAudioRef.current.currentTime = 0;
      }
    };
  }, [id]); // Re-run when verse ID changes

  const fetchVerse = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/game/verse/${id}`);
      const verseData = response.data.verse;
      setVerse(verseData);
      setCurrentPuzzleAnswer(verseData.answer);

      // If verse is solved, load the stored answer for review
      if (verseData.isSolved) {
        const storedAnswer = localStorage.getItem(`verse-${verseData.orderIndex}-answer`);
        if (storedAnswer) {
          setAnswer(storedAnswer);
        }

        // Show completion message for solved verses
        if (verseData.orderIndex === 1) {
          setFeedback("A wave of understanding washes over Arthur. 'Of course!' he exclaims, leaping to his feet, a wide grin spreading across his face. 'It was right here all along! The key to laughter isn't a single word or action, but the perfect delivery, the unexpected twist... the PUNCHLINE!'");
          setFeedbackType('success');
        } else if (verseData.orderIndex === 2) {
          setFeedback("That's it! STREAM! You've helped Leo bridge the gap between old and new. He and Zara are now happily watching 'Cyber Voyager' in glorious HD. Adapting to change can be an upgrade!");
          setFeedbackType('success');
        } else if (verseData.orderIndex === 3) {
          setFeedback("The flame brightens when divided! You have understood the Titan's wisdom. The answer is SHARE. A burden is halved when another helps to carry it. Your path forward is illuminated.");
          setFeedbackType('success');
        }
      } else {
        // Clear answer field for unsolved verses
        setAnswer('');
      }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;

    // Form submission - global handler will play click sound

    try {
      setSubmitting(true);
      const response = await api.post(`/api/game/verse/${id}/submit`, {
        answer: answer.trim(),
        currentPuzzleAnswer: currentPuzzleAnswer
      });

      const { correct, message, gameComplete, alreadySolved } = response.data;

      if (correct) {
        setFeedbackType('success');
        setFeedback(message);

        // Store the correct answer for review purposes
        localStorage.setItem(`verse-${verse.orderIndex}-answer`, answer.trim());

        setAnswer('');

        if (!alreadySolved) {
          // Mark that progress was updated for dashboard refresh
          sessionStorage.setItem('mysteryverse-progress-updated', Date.now().toString());

          // Show congratulations modal
          setCongratsData({
            isGameComplete: gameComplete,
            verseTitle: verse.title,
            verseNumber: verse.orderIndex
          });
          setShowCongratulations(true);
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

  // Handle congratulations modal close
  const handleCongratulationsClose = () => {
    setShowCongratulations(false);
    navigate('/dashboard', { state: { refreshProgress: true } });
  };

  // Check puzzle types
  const isHumorHelixPuzzle = verse && verse.orderIndex === 1;
  const isAnalogSunsetPuzzle = verse && verse.orderIndex === 2;
  const isTitanGiftPuzzle = verse && verse.orderIndex === 3;

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

              {/* The Humor Helix Puzzle */}
              {isHumorHelixPuzzle && (
                <div className="space-y-6">
                  {/* Two Image Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Boxing Glove Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 1</h4>
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => {
                          if (!punchAudioRef.current) {
                            punchAudioRef.current = new Audio('/sounds/verse 5/punch sound.wav');
                          }
                          const audio = punchAudioRef.current;
                          if (audio.paused) {
                            audio.play().catch(err => console.error('Failed to play sound:', err));
                          } else {
                            audio.pause();
                          }
                        }}
                      >
                        <img
                          src="/images/verse 5/punch image.jpeg"
                          alt="Boxing Glove Clue - Click to play/pause sound"
                          className="w-full h-48 object-contain rounded"
                        />
                      </div>
                    </div>

                    {/* Fishing Scene Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 2</h4>
                      <div
                        className="cursor-pointer transform transition-transform hover:scale-105"
                        onClick={() => {
                          if (!fishingAudioRef.current) {
                            fishingAudioRef.current = new Audio('/sounds/verse 5/fishing reel sound.wav');
                          }
                          const audio = fishingAudioRef.current;
                          if (audio.paused) {
                            audio.play().catch(err => console.error('Failed to play sound:', err));
                          } else {
                            audio.pause();
                          }
                        }}
                      >
                        <img
                          src="/images/verse 5/fishing image.jpeg"
                          alt="Fishing Scene Clue - Click to play/pause sound"
                          className="w-full h-48 object-contain rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Answer Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Answer
                      </label>
                      <div className="flex justify-center gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={answer[index] || ''}
                            onChange={(e) => {
                              const newAnswer = answer.split('');
                              newAnswer[index] = e.target.value.toUpperCase();
                              const updatedAnswer = newAnswer.join('').slice(0, 9);
                              setAnswer(updatedAnswer);

                              // Auto-focus next input if current is filled
                              if (e.target.value && index < 8) {
                                const nextInput = e.target.parentElement.children[index + 1];
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace to go to previous input
                              if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                const prevInput = e.target.parentElement.children[index - 1];
                                if (prevInput) prevInput.focus();
                              }
                            }}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-mystery-gold/30 bg-gray-800 text-mystery-gold rounded focus:border-mystery-gold focus:outline-none transition-colors"
                            disabled={submitting || verse.isSolved}
                          />
                        ))}
                      </div>
                      <p className="text-center text-sm text-gray-400 mb-2">
                        What's the key to perfect comedy timing?
                      </p>
                    </div>

                    {feedback && (
                      <div className={`text-center p-3 rounded-md ${
                        feedback.includes('Correct') || feedback.includes('already solved') || feedback.includes('wave of understanding') || feedback.includes('PUNCHLINE')
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-red-900/50 text-red-300'
                      }`}>
                        {feedback}
                      </div>
                    )}

                    {!verse.isSolved && (
                      <button
                        type="submit"
                        disabled={submitting || !answer.trim()}
                        className="w-full btn btn-primary"
                      >
                        {submitting ? 'Checking...' : 'Submit Answer'}
                      </button>
                    )}

                  </form>
                </div>
              )}

              {/* The Analog Sunset Puzzle */}
              {isAnalogSunsetPuzzle && (
                <div className="space-y-6">
                  {/* Two Image Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* DVD Player Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 1</h4>
                      <div className="cursor-pointer transform transition-transform hover:scale-105">
                        <img
                          src="/images/verse 2/dvd_player.jpeg"
                          alt="Dusty DVD Player with NO DISC error"
                          className="w-full h-48 object-contain rounded"
                        />
                      </div>
                    </div>

                    {/* Smart TV Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 2</h4>
                      <div className="cursor-pointer transform transition-transform hover:scale-105">
                        <img
                          src="/images/verse 2/smart_tv.jpeg"
                          alt="Smart TV displaying YouTube interface"
                          className="w-full h-48 object-contain rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Answer Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Answer
                      </label>
                      <div className="flex justify-center gap-2 mb-4">
                        {[0, 1, 2, 3, 4, 5].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={answer[index] || ''}
                            onChange={(e) => {
                              const newAnswer = answer.split('');
                              newAnswer[index] = e.target.value.toUpperCase();
                              const updatedAnswer = newAnswer.join('').slice(0, 6);
                              setAnswer(updatedAnswer);

                              // Auto-focus next input if current is filled
                              if (e.target.value && index < 5) {
                                const nextInput = e.target.parentElement.children[index + 1];
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace to go to previous input
                              if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                const prevInput = e.target.parentElement.children[index - 1];
                                if (prevInput) prevInput.focus();
                              }
                            }}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-mystery-gold/30 bg-gray-800 text-mystery-gold rounded focus:border-mystery-gold focus:outline-none transition-colors"
                            disabled={submitting || verse.isSolved}
                          />
                        ))}
                      </div>
                      <p className="text-center text-sm text-gray-400 mb-2">
                        How do we bridge the gap between old and new technology?
                      </p>
                    </div>

                    {feedback && (
                      <div className={`text-center p-3 rounded-md ${
                        feedback.includes('Correct') || feedback.includes('already solved') || feedback.includes('STREAM')
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-red-900/50 text-red-300'
                      }`}>
                        {feedback}
                      </div>
                    )}

                    {!verse.isSolved && (
                      <button
                        type="submit"
                        disabled={submitting || !answer.trim()}
                        className="w-full btn btn-primary"
                      >
                        {submitting ? 'Checking...' : 'Submit Answer'}
                      </button>
                    )}

                  </form>
                </div>
              )}

              {/* The Titan's Gift Puzzle */}
              {isTitanGiftPuzzle && (
                <div className="space-y-6">
                  {/* Two Image Sections */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Atlas Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 1</h4>
                      <div className="cursor-pointer transform transition-transform hover:scale-105">
                        <img
                          src="/images/verse 3/atlas_statue.jpg"
                          alt="Titan Atlas holding the celestial sphere - representing an immense burden carried alone"
                          className="w-full h-48 object-cover rounded"
                        />
                      </div>
                    </div>

                    {/* Venn Diagram Image Section */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-mystery-gold/20">
                      <h4 className="text-center text-mystery-gold mb-3 font-semibold">Visual Clue 2</h4>
                      <div className="cursor-pointer transform transition-transform hover:scale-105">
                        <img
                          src="/images/verse 3/venn_diagram_common_ground.jpg"
                          alt="Venn diagram showing Common Ground - representing shared space and connection"
                          className="w-full h-48 object-cover rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Answer Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Your Answer
                      </label>
                      <div className="flex justify-center gap-2 mb-4">
                        {[0, 1, 2, 3, 4].map((index) => (
                          <input
                            key={index}
                            type="text"
                            maxLength="1"
                            value={answer[index] || ''}
                            onChange={(e) => {
                              const newAnswer = answer.split('');
                              newAnswer[index] = e.target.value.toUpperCase();
                              const updatedAnswer = newAnswer.join('').slice(0, 5);
                              setAnswer(updatedAnswer);

                              // Auto-focus next input if current is filled
                              if (e.target.value && index < 4) {
                                const nextInput = e.target.parentElement.children[index + 1];
                                if (nextInput) nextInput.focus();
                              }
                            }}
                            onKeyDown={(e) => {
                              // Handle backspace to go to previous input
                              if (e.key === 'Backspace' && !e.target.value && index > 0) {
                                const prevInput = e.target.parentElement.children[index - 1];
                                if (prevInput) prevInput.focus();
                              }
                            }}
                            className="w-12 h-12 text-center text-xl font-bold border-2 border-mystery-gold/30 bg-gray-800 text-mystery-gold rounded focus:border-mystery-gold focus:outline-none transition-colors"
                            disabled={submitting || verse.isSolved}
                          />
                        ))}
                      </div>
                      <p className="text-center text-sm text-gray-400 mb-2">
                        What single word unlocks the secret to easing such a burden?
                      </p>
                    </div>

                    {feedback && (
                      <div className={`text-center p-3 rounded-md ${
                        feedback.includes('Correct') || feedback.includes('already solved') || feedback.includes('SHARE') || feedback.includes('flame brightens')
                          ? 'bg-green-900/50 text-green-300'
                          : 'bg-red-900/50 text-red-300'
                      }`}>
                        {feedback}
                      </div>
                    )}

                    {!verse.isSolved && (
                      <button
                        type="submit"
                        disabled={submitting || !answer.trim()}
                        className="w-full btn btn-primary"
                      >
                        {submitting ? 'Checking...' : 'Submit Answer'}
                      </button>
                    )}

                  </form>
                </div>
              )}

            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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

      {/* Congratulations Modal */}
      <CongratulationsModal
        isOpen={showCongratulations}
        onClose={handleCongratulationsClose}
        verseTitle={congratsData.verseTitle}
        verseNumber={congratsData.verseNumber}
        isGameComplete={congratsData.isGameComplete}
      />
    </div>
  );
}

export default Puzzle;