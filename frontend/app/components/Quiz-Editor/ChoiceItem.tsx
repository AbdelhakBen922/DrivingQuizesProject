import React from 'react';
import type { Choice } from '~/routes/Quiz/quiz-editor';

type ChoiceItemProps = {
  choice: Choice;
  index: number;
  isSelected: boolean;
  onUpdate: (updates: Partial<Choice>) => void;
  onDelete: () => void;
  onToggleCorrect: () => void;
  canDelete?: boolean; // Whether this choice can be deleted (minimum 2 choices required)
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
    <div
      onClick={onToggleCorrect}
      className={`
        flex items-center gap-3 p-4 rounded-xl border transition-all cursor-pointer
        ${
          isSelected
            ? 'bg-primary-50'
            : 'bg-white border-light-grey'
        }
      `}
      style={isSelected 
        ? { borderColor: 'var(--color-blue)' }
        : { borderColor: 'var(--color-light-grey)' }}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--color-primary-200)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.borderColor = 'var(--color-light-grey)';
        }
      }}
    >
      {/* Drag handle */}
      <div 
        className="cursor-move text-grey flex-shrink-0"
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-600)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-grey)'}
        onClick={(e) => e.stopPropagation()}
      >
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

      {/* Radio button */}
      <div
        className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 pointer-events-none
          ${isSelected ? '' : 'border-grey'}
        `}
        style={isSelected 
          ? { borderColor: 'var(--color-blue)', backgroundColor: 'var(--color-blue)' }
          : {}}
      >
        {isSelected && (
          <div className="w-2 h-2 bg-white rounded-full" />
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
        style={{ color: 'var(--color-text-dark)' }}
      />

      {/* Delete button */}
      {canDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-2 hover:bg-red-50 rounded-lg transition-colors text-grey hover:text-red-500 flex-shrink-0 opacity-70 hover:opacity-100"
          aria-label="Delete choice"
          title="Delete this choice"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 5L15 15M15 5L5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ChoiceItem;

