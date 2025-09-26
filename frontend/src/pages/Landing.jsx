import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="mb-12">
          <h1 className="font-title text-6xl md:text-8xl font-bold text-mystery-gold mb-6">
            Mystery Verse
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Embark on a journey through enigmatic puzzles and cryptic riddles. 
            Each verse holds a secret waiting to be unlocked.
          </p>
          <div className="w-24 h-1 bg-mystery-gold mx-auto mb-8"></div>
          <p className="text-lg text-gray-400 mb-12">
            Test your wit, challenge your mind, and unravel the mysteries within.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link to="/login" className="btn-primary w-full sm:w-auto min-w-[200px]">
            Enter the Verse
          </Link>
          <Link to="/register" className="btn-secondary w-full sm:w-auto min-w-[200px]">
            Begin Your Journey
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-mystery-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🧩</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Complex Puzzles</h3>
            <p className="text-gray-400">Each verse presents unique challenges that will test your problem-solving skills.</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-mystery-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📈</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Progressive Difficulty</h3>
            <p className="text-gray-400">Unlock verses sequentially as you prove your mastery of each challenge.</p>
          </div>
          
          <div className="card">
            <div className="w-12 h-12 bg-mystery-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-400">Monitor your journey and see how far you've come in the Mystery Verse.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;