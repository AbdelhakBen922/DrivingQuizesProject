import React from 'react';
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
  return (
    <aside className="w-80 border-r border-light-grey flex flex-col flex-shrink-0" style={{ backgroundColor: 'var(--color-sidebar-bg)' }}>
      {/* Header */}
      <div className="h-16 px-6 border-b border-white/20 flex items-center justify-between flex-shrink-0">
        <h2 className="font-bold text-white text-base">
          QUESTIONS ({questions.length})
        </h2>
        <button
          onClick={onAddQuestion}
          className="w-8 h-8 flex items-center justify-center text-white rounded-lg transition-colors flex-shrink-0"
          style={{ backgroundColor: 'var(--color-blue)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-blue)'}
          aria-label="Add question"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto">
        {questions.map((question) => (
          <div
            key={question.id}
            onClick={() => onSelectQuestion(question.id)}
            className={`
              px-6 py-4 border-b border-white/20 cursor-pointer transition-colors
              ${
                selectedQuestionId === question.id
                  ? 'bg-white/20 border-l-4'
                  : 'hover:bg-white/10'
              }
            `}
            style={selectedQuestionId === question.id ? { borderLeftColor: 'var(--color-blue)' } : {}}
          >
            <div className="flex items-start gap-3">
              {/* Drag handle */}
              <div className="mt-1 cursor-move text-white/70 hover:text-white flex-shrink-0">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="4" cy="4" r="1" fill="currentColor" />
                  <circle cx="12" cy="4" r="1" fill="currentColor" />
                  <circle cx="4" cy="8" r="1" fill="currentColor" />
                  <circle cx="12" cy="8" r="1" fill="currentColor" />
                  <circle cx="4" cy="12" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                </svg>
              </div>

              {/* Question number circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                  ${
                    selectedQuestionId === question.id
                      ? 'text-white'
                      : 'bg-primary-100 text-primary-800'
                  }
                `}
                style={selectedQuestionId === question.id ? { backgroundColor: 'var(--color-blue)' } : {}}
              >
                {question.number}
              </div>

              {/* Question content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate`} style={{ color: 'var(--color-text-dark)' }}>
                  {question.text || `Question ${question.number}`}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="flex-shrink-0"
                    style={{ color: 'var(--color-text-dark)' }}
                  >
                    <path
                      d="M13.3333 4L6 11.3333L2.66667 8"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="text-xs" style={{ color: 'var(--color-text-dark)' }}>{question.type}</span>
                </div>
              </div>

              {/* More options */}
              <div className="relative group flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    // TODO: Show dropdown menu
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="More options"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-white/70"
                  >
                    <circle cx="10" cy="5" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="10" r="1.5" fill="currentColor" />
                    <circle cx="10" cy="15" r="1.5" fill="currentColor" />
                  </svg>
                </button>
                {/* Dropdown menu */}
                <div className="absolute right-0 top-full mt-1 bg-white border border-light-grey rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteQuestion(question.id);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 rounded-t-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default QuestionsSidebar;

