function ProgressBar({ progress, currentVerse, totalVerses }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-medium text-mystery-gold">
          {progress}%
        </span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <span>Verse {currentVerse - 1} of {totalVerses} completed</span>
        <span>{totalVerses - (currentVerse - 1)} remaining</span>
      </div>
    </div>
  );
}

export default ProgressBar;