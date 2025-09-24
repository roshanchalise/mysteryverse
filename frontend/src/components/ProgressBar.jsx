function ProgressBar({ progress, currentVerse, totalVerses, solvedVerses }) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-medium text-mystery-gold">
          {solvedVerses}/{totalVerses}
        </span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
        <span>Verses completed: {solvedVerses}</span>
        <span>{totalVerses - solvedVerses} remaining</span>
      </div>
    </div>
  );
}

export default ProgressBar;