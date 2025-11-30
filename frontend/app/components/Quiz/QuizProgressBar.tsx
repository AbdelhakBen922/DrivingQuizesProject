type QuizProgressBarProps = {
  currentQuestion: number;
  totalQuestions: number;
  progressColor?: string;
  onBack?: () => void;
  onFlag?: () => void;
  onMenu?: () => void;
};

const QuizProgressBar = ({ 
  currentQuestion, 
  totalQuestions, 
  progressColor = "bg-primary-500",
  onBack, 
  onFlag, 
  onMenu 
}: QuizProgressBarProps) => {
  return (
    <div className="px-4 py-6 max-w-4xl w-full mx-auto">
      <div className="flex items-center gap-4">
        {/* Back Button */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary-800 bg-primary-100 rounded-2xl px-2 py-1 hover:bg-primary-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        
        {/* Progress Bar */}
        <div className="flex-1 flex items-center gap-2">
          <span className="text-sm text-primary-800 font-medium">
            {currentQuestion}/{totalQuestions}
          </span>
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressColor} transition-all duration-300`}
              style={{ width: `${(currentQuestion / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Flag and Menu Buttons */}
        <div className="flex gap-2">
          <button 
            onClick={onFlag}
            className="p-2 text-primary-800 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors"
          >
            <img src="/assets/icons/flag.svg" alt="Report Problem"  className="w-5 h-5"/>
          </button>
          <button 
            onClick={onMenu}
            className="p-2 text-primary-800 bg-primary-100 rounded-lg hover:bg-primary-200 transition-colors"
          >
            <img src="/assets/icons/threedots.svg" alt="Menu" className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizProgressBar;
