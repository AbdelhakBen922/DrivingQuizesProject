import React, { useState, useEffect } from 'react';
import type { Question } from '~/routes/Quiz/quiz-editor';

type QuestionsSidebarProps = {
  questions: Question[];
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string | null) => void;
  onAddQuestion: () => void;
  onDeleteQuestion: (id: string) => void;
  onReorderQuestions: (fromIndex: number, toIndex: number) => void;
};

const QuestionsSidebar = ({
  questions,
  selectedQuestionId,
  onSelectQuestion,
  onAddQuestion,
  onDeleteQuestion,
  onReorderQuestions,
}: QuestionsSidebarProps) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const handleToggleDropdown = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    setOpenDropdownId(openDropdownId === questionId ? null : questionId);
  };

  const handleDelete = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    onDeleteQuestion(questionId);
    setOpenDropdownId(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenDropdownId(null);
    };
    
    if (openDropdownId) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdownId]);

  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  const currentQuestionNumber = selectedQuestion?.number || 0;

  return (
    <aside data-questions-sidebar className="w-full border-r border-light-grey flex flex-col flex-shrink-0 h-full" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
      {/* Header */}
      <div className="h-14 sm:h-16 px-4 sm:px-6 border-b flex items-center justify-between flex-shrink-0 sidebar-header" style={{ borderColor: 'var(--color-white-opacity-20)' }}>
        <h2 className="text-xs sm:text-sm font-normal sidebar-title" style={{ color: 'var(--color-grey)' }}>
          QUESTIONS ({currentQuestionNumber})
        </h2>
        <button
          onClick={onAddQuestion}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors flex-shrink-0 sidebar-add-button"
          style={{ 
            backgroundColor: 'var(--color-white)', 
            border: '1px solid var(--color-grey)',
            color: 'var(--color-grey)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-primary-800)';
            e.currentTarget.style.color = 'var(--color-primary-800)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-grey)';
            e.currentTarget.style.color = 'var(--color-grey)';
          }}
          aria-label="Add question"
        >
          <svg
            width="14"
            height="14"
            className="sm:w-4 sm:h-4"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-4">
        {questions.map((question) => (
          <div key={question.id} data-question-item className="flex items-center gap-2 mb-2">
            {/* Braille icon - outside the question div, centered vertically */}
            <div className="flex-shrink-0 hidden sm:block sidebar-braille-icon" style={{ color: 'var(--color-primary-800)' }}>
              <svg
                width="14"
                height="20"
                viewBox="0 0 20 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Left column squares */}
                <rect x="2" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
                <rect x="2" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
                <rect x="2" y="18" width="6" height="6" rx="1.5" fill="currentColor" />
                {/* Right column squares */}
                <rect x="12" y="2" width="6" height="6" rx="1.5" fill="currentColor" />
                <rect x="12" y="10" width="6" height="6" rx="1.5" fill="currentColor" />
                <rect x="12" y="18" width="6" height="6" rx="1.5" fill="currentColor" />
              </svg>
            </div>

            <div
              onClick={() => onSelectQuestion(question.id)}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 rounded-lg cursor-pointer transition-colors relative question-item-card"
              style={{ 
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: 'var(--color-grey)', 
                backgroundColor: 'var(--color-sidebar-bg)'
              }}
            >
              <div className="flex items-start gap-2 sm:gap-3">
                {/* Question number circle - light grey background with dark blue number */}
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0"
                style={{ 
                  backgroundColor: 'var(--color-gray-300)',
                  color: 'var(--color-primary-800)'
                }}
              >
                {question.number}
              </div>

              {/* Question content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium truncate mb-1" style={{ color: 'var(--color-primary-800)' }}>
                  {question.text || `Question ${question.number}`}
                </p>
                <span className="text-xs" style={{ color: 'var(--color-gray-400)' }}>{question.type}</span>
              </div>
            </div>

            {/* Three dots options icon - bottom right, shows dropdown menu */}
            <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
              <button
                onClick={(e) => handleToggleDropdown(e, question.id)}
                className="p-1 rounded transition-colors relative"
                style={{ color: 'var(--color-primary-800)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-white-opacity-20)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="More options"
              >
                <svg
                  width="14"
                  height="14"
                  className="sm:w-4 sm:h-4"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ color: 'var(--color-primary-800)' }}
                >
                  <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                  <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                  <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                </svg>
              </button>
              
              {/* Dropdown menu */}
              {openDropdownId === question.id && (
                <div 
                  className="absolute right-0 bottom-full mb-2 border rounded-lg shadow-lg z-10 min-w-[120px]"
                  style={{ 
                    backgroundColor: 'var(--color-white)', 
                    borderColor: 'var(--color-light-grey)' 
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => handleDelete(e, question.id)}
                    className="w-full px-4 py-2 text-left text-sm rounded-lg transition-colors"
                    style={{ color: 'var(--color-red-500)' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-red-50)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default QuestionsSidebar;

