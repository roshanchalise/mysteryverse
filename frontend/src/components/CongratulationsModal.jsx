import { useEffect, useState } from 'react';

const CongratulationsModal = ({
  isOpen,
  onClose,
  verseTitle,
  verseNumber,
  isGameComplete = false
}) => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className={`bg-gray-800 rounded-lg border-2 border-mystery-gold transform transition-all duration-300 max-w-md w-full ${
        showModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-mystery-gold to-yellow-600 text-gray-900 p-4 rounded-t-lg text-center">
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="text-2xl font-bold font-title">
            {isGameComplete ? 'GAME COMPLETE!' : 'VERSE SOLVED!'}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
          <div className="text-6xl mb-4 animate-bounce">
            {isGameComplete ? '🏆' : '✅'}
          </div>

          <h3 className="text-xl font-semibold text-mystery-gold mb-2">
            Congratulations!
          </h3>

          <p className="text-gray-300 mb-4">
            You have successfully completed<br/>
            <span className="text-mystery-gold font-semibold">
              Verse {verseNumber}: {verseTitle}
            </span>
          </p>

          {isGameComplete ? (
            <div className="bg-gradient-to-r from-mystery-gold/20 to-yellow-600/20 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-300">
                Excellent work solving all the puzzles!
              </p>
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-4">
              Well done! Your puzzle-solving skills are impressive!
            </div>
          )}

          <div className="text-sm text-gray-400 mb-4">
            Click below to return to the dashboard and continue your journey!
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-700 px-4 py-3 rounded-b-lg text-center">
          <button
            onClick={() => {
              setShowModal(false);
              setTimeout(onClose, 300);
            }}
            className="text-mystery-gold hover:text-yellow-400 transition-colors text-sm font-medium"
          >
            Continue to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CongratulationsModal;