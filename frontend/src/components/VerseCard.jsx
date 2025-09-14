import { Link } from 'react-router-dom';

function VerseCard({ verse }) {
  const { id, title, orderIndex, isUnlocked, isSolved } = verse;

  return (
    <div className={`card transition-all duration-200 ${
      isUnlocked ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : 'opacity-60 cursor-not-allowed'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">
          Verse {orderIndex}
        </h3>
        <div className="flex items-center space-x-2">
          {isSolved ? (
            <span className="flex items-center text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Solved
            </span>
          ) : isUnlocked ? (
            <span className="flex items-center text-mystery-gold text-sm">
              <span className="w-2 h-2 bg-mystery-gold rounded-full mr-2 animate-pulse"></span>
              Available
            </span>
          ) : (
            <span className="flex items-center text-gray-500 text-sm">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              Locked
            </span>
          )}
        </div>
      </div>

      <h4 className="text-lg font-medium mb-3 text-gray-200">{title}</h4>

      <div className="flex justify-between items-center">
        {isUnlocked ? (
          <Link 
            to={`/verse/${id}`}
            className="btn-primary flex-1 text-center"
            onClick={() => {}}
          >
            {isSolved ? 'Review' : 'Solve Puzzle'}
          </Link>
        ) : (
          <button className="btn-secondary flex-1 cursor-not-allowed opacity-50" disabled>
            Locked
          </button>
        )}
      </div>
    </div>
  );
}

export default VerseCard;