import React from 'react';
import type { Choice } from '~/routes/Quiz/quiz-editor';

type ChoiceItemProps = {
  choice: Choice;
  index: number;
  isSelected: boolean;
  onUpdate: (updates: Partial<Choice>) => void;
  onDelete: () => void;
  onToggleCorrect: () => void;
  canDelete?: boolean; // Whether this choice can be deleted (minimum 1 choice required)
};

const ChoiceItem = ({
  choice,
  index,
  isSelected,
  onUpdate,
  onDelete,
  onToggleCorrect,
  canDelete = true,
}: ChoiceItemProps) => {
  return (
    <div className="flex items-center gap-3">
      {/* Main form container */}
      <div
        onClick={onToggleCorrect}
        className={`
          flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer flex-1
        `}
        style={isSelected 
          ? { backgroundColor: 'var(--color-blue)', borderColor: 'var(--color-blue)' }
          : { backgroundColor: 'var(--color-white)', borderColor: 'var(--color-primary-200)' }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = 'var(--color-primary-200)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.borderColor = 'var(--color-primary-200)';
          }
        }}
      >
        {/* Radio button */}
        <div
          className={`
            w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 pointer-events-none
            ${isSelected ? '' : 'border-grey'}
          `}
          style={isSelected 
            ? { borderColor: 'var(--color-white)', backgroundColor: 'var(--color-white)' }
            : {}}
        >
          {isSelected && (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--color-blue)' }} />
          )}
        </div>

        {/* Choice text input */}
        <input
          type="text"
          value={choice.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          placeholder={`Option ${index + 1}`}
          className={`
            flex-1 bg-transparent border-none outline-none text-sm
            placeholder:text-grey focus:ring-2 focus:ring-primary-200 rounded px-2 py-1 min-w-0 cursor-text
          `}
          style={{ color: isSelected ? 'var(--color-white)' : 'var(--color-text-dark)' }}
        />
      </div>

      {/* Icons outside the form */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Braille icon - first */}
        <div className="flex-shrink-0 p-1.5 rounded flex items-center justify-center" style={{ backgroundColor: 'var(--color-gray-200)' }}>
          <svg
            width="14"
            height="20"
            viewBox="0 0 20 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Left column dots */}
            <circle cx="6" cy="6" r="2.5" fill="var(--color-primary-800)" />
            <circle cx="6" cy="14" r="2.5" fill="var(--color-primary-800)" />
            <circle cx="6" cy="22" r="2.5" fill="var(--color-primary-800)" />
            {/* Right column dots */}
            <circle cx="14" cy="6" r="2.5" fill="var(--color-primary-800)" />
            <circle cx="14" cy="14" r="2.5" fill="var(--color-primary-800)" />
            <circle cx="14" cy="22" r="2.5" fill="var(--color-primary-800)" />
          </svg>
        </div>

        {/* Delete button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canDelete) {
              onDelete();
            }
          }}
          className="p-1.5 rounded transition-colors flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--color-primary-50)',
            color: 'var(--color-red)',
            opacity: canDelete ? 1 : 0.5,
            cursor: canDelete ? 'pointer' : 'not-allowed'
          }}
          disabled={!canDelete}
          onMouseEnter={(e) => {
            if (canDelete) {
              e.currentTarget.style.backgroundColor = 'var(--color-primary-100)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
          }}
          aria-label="Delete choice"
          title={canDelete ? "Delete this choice" : "Cannot delete - minimum 1 choice required"}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 11V17M14 11V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChoiceItem;

