import React from 'react';
import { Link } from 'react-router';

type QuizEditorHeaderProps = {
  quizName: string;
  lastEdited: string;
  onQuizNameChange: (name: string) => void;
  onPublish: () => void;
  onPreview: () => void;
  onSettings: () => void;
};

const QuizEditorHeader = ({
  quizName,
  lastEdited,
  onQuizNameChange,
  onPublish,
  onPreview,
  onSettings,
}: QuizEditorHeaderProps) => {
  return (
    <header className="h-16 border-b px-6 flex items-center justify-between sticky top-0 z-10 relative"
      style={{ borderColor: 'var(--color-light-grey)', backgroundColor: 'var(--color-white)' }}>
      {/* Left side - Back button and last edited */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link
          to="/select-quiz"
          className="transition-colors flex-shrink-0"
          style={{ color: 'var(--color-blue)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-blue)'}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 18L9 12L15 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <span className="text-sm text-grey whitespace-nowrap">Edited {lastEdited}</span>
      </div>

      {/* Center - Quiz name */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 min-w-0 max-w-md">
        <input
          type="text"
          value={quizName}
          onChange={(e) => onQuizNameChange(e.target.value)}
          className="text-base font-medium bg-transparent border-none outline-none focus:ring-2 focus:ring-primary-200 rounded px-2 py-1 min-w-0 text-center"
          style={{ color: 'var(--color-text-dark)' }}
          placeholder="Name of the quizz"
        />
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-grey flex-shrink-0"
        >
          <path
            d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2ZM10 16C6.68629 16 4 13.3137 4 10C4 6.68629 6.68629 4 10 4C13.3137 4 16 6.68629 16 10C16 13.3137 13.3137 16 10 16Z"
            fill="currentColor"
          />
          <path
            d="M10 6C9.44772 6 9 6.44772 9 7V9C9 9.55228 9.44772 10 10 10C10.5523 10 11 9.55228 11 9V7C11 6.44772 10.5523 6 10 6Z"
            fill="currentColor"
          />
          <path
            d="M10 11C9.44772 11 9 11.4477 9 12V13C9 13.5523 9.44772 14 10 14C10.5523 14 11 13.5523 11 13V12C11 11.4477 10.5523 11 10 11Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Settings icon */}
        <button
          onClick={onSettings}
          className="w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-grey"
          style={{ '--hover-bg': 'var(--color-primary-50)', '--hover-text': 'var(--color-blue)' } as React.CSSProperties}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
            e.currentTarget.style.color = 'var(--color-blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '';
          }}
          aria-label="Settings"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.6667 10C16.6667 9.16667 16.6667 8.33333 16.525 7.525M16.6667 10C16.6667 10.8333 16.6667 11.6667 16.525 12.475M16.6667 10H18.3333M10 3.33333C10.8333 3.33333 11.6667 3.33333 12.475 3.475M10 3.33333C9.16667 3.33333 8.33333 3.33333 7.525 3.475M10 3.33333V1.66667M3.33333 10C3.33333 9.16667 3.33333 8.33333 3.475 7.525M3.33333 10C3.33333 10.8333 3.33333 11.6667 3.475 12.475M3.33333 10H1.66667M10 16.6667C10.8333 16.6667 11.6667 16.6667 12.475 16.525M10 16.6667C9.16667 16.6667 8.33333 16.6667 7.525 16.525M10 16.6667V18.3333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Preview button */}
        <button
          onClick={onPreview}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          style={{ color: 'var(--color-blue)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 3.33333C5.83333 3.33333 2.275 6.25833 1.66667 10C2.275 13.7417 5.83333 16.6667 10 16.6667C14.1667 16.6667 17.725 13.7417 18.3333 10C17.725 6.25833 14.1667 3.33333 10 3.33333ZM10 15C7.24167 15 5 12.7583 5 10C5 7.24167 7.24167 5 10 5C12.7583 5 15 7.24167 15 10C15 12.7583 12.7583 15 10 15ZM10 6.66667C8.15833 6.66667 6.66667 8.15833 6.66667 10C6.66667 11.8417 8.15833 13.3333 10 13.3333C11.8417 13.3333 13.3333 11.8417 13.3333 10C13.3333 8.15833 11.8417 6.66667 10 6.66667Z"
              fill="currentColor"
            />
          </svg>
          <span>Preview</span>
        </button>

        {/* Publish button */}
        <button
          onClick={onPublish}
          className="font-semibold rounded-lg px-6 py-2 transition-colors text-sm whitespace-nowrap"
          style={{ backgroundColor: 'var(--color-blue)', color: 'var(--color-white)' }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-primary-600)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-blue)'}
        >
          Publish
        </button>
      </div>
    </header>
  );
};

export default QuizEditorHeader;

