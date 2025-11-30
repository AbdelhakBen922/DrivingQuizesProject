import React, { useState } from 'react';
import type { Question } from '~/routes/Quiz/quiz-editor';

type ExistingQuestionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestion: (question: Question) => void;
  currentQuestionIds: string[]; // IDs of questions already in the quiz
};

// Mock existing questions - in a real app, this would come from an API
const mockExistingQuestions: Question[] = [
  {
    id: 'existing-1',
    number: 1,
    text: 'What does a red traffic light mean?',
    type: 'Multiple Choice',
    required: true,
    choices: [
      { id: 'c1', text: 'Stop', isCorrect: true },
      { id: 'c2', text: 'Slow down', isCorrect: false },
      { id: 'c3', text: 'Proceed with caution', isCorrect: false },
      { id: 'c4', text: 'Speed up', isCorrect: false },
    ],
    estimatedTime: 2,
    points: 3,
    randomizeOrder: false,
  },
  {
    id: 'existing-2',
    number: 2,
    text: 'What should you do when approaching a roundabout?',
    type: 'Multiple Choice',
    required: true,
    choices: [
      { id: 'c5', text: 'Yield to traffic already in the roundabout', isCorrect: true },
      { id: 'c6', text: 'Enter immediately', isCorrect: false },
      { id: 'c7', text: 'Stop completely', isCorrect: false },
      { id: 'c8', text: 'Honk your horn', isCorrect: false },
    ],
    estimatedTime: 3,
    points: 5,
    randomizeOrder: true,
  },
  {
    id: 'existing-3',
    number: 3,
    text: 'You must always stop at a stop sign.',
    type: 'True/False',
    required: true,
    choices: [
      { id: 'c9', text: 'True', isCorrect: true },
      { id: 'c10', text: 'False', isCorrect: false },
    ],
    estimatedTime: 1,
    points: 2,
    randomizeOrder: false,
  },
  {
    id: 'existing-4',
    number: 4,
    text: 'What is the speed limit in a school zone?',
    type: 'Multiple Choice',
    required: true,
    choices: [
      { id: 'c11', text: '20 mph', isCorrect: false },
      { id: 'c12', text: '25 mph', isCorrect: true },
      { id: 'c13', text: '30 mph', isCorrect: false },
      { id: 'c14', text: '35 mph', isCorrect: false },
    ],
    estimatedTime: 2,
    points: 3,
    randomizeOrder: false,
  },
  {
    id: 'existing-5',
    number: 5,
    text: 'When should you use your turn signals?',
    type: 'Short Answer',
    required: true,
    choices: [
      { id: 'c15', text: 'Before changing lanes or turning', isCorrect: true },
    ],
    estimatedTime: 2,
    points: 4,
    randomizeOrder: false,
  },
];

const ExistingQuestionsModal = ({
  isOpen,
  onClose,
  onSelectQuestion,
  currentQuestionIds,
}: ExistingQuestionsModalProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter questions that aren't already in the quiz
  const availableQuestions = mockExistingQuestions.filter(
    (q) => !currentQuestionIds.includes(q.id)
  );

  // Filter by search term
  const filteredQuestions = availableQuestions.filter((q) =>
    q.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectQuestion = (question: Question) => {
    // Create a new question with a new ID to avoid conflicts
    const newQuestion: Question = {
      ...question,
      id: `question-${Date.now()}-${Math.random()}`,
      number: 0, // Will be renumbered by parent
    };
    onSelectQuestion(newQuestion);
    onClose();
    setSearchTerm('');
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        style={{ backgroundColor: 'var(--color-white)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'var(--color-light-grey)' }}>
          <h2 className="text-xl font-bold" style={{ color: 'var(--color-text-dark)' }}>
            Add Existing Question
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-100)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Close"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: 'var(--color-grey)' }}
            >
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--color-light-grey)' }}>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border outline-none transition-all"
            style={{
              borderColor: 'var(--color-light-grey)',
              color: 'var(--color-text-dark)',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-blue)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--color-light-grey)'}
          />
        </div>

        {/* Questions List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--color-grey)' }}>
                {searchTerm
                  ? 'No questions found matching your search.'
                  : 'No available questions to add.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className="p-4 rounded-lg border cursor-pointer transition-all hover:bg-gray-50"
                  style={{
                    borderColor: 'var(--color-light-grey)',
                    backgroundColor: 'var(--color-white)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-blue)';
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--color-light-grey)';
                    e.currentTarget.style.backgroundColor = 'var(--color-white)';
                  }}
                  onClick={() => handleSelectQuestion(question)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-dark)' }}>
                        {question.text}
                      </p>
                      <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-grey)' }}>
                        <span>{question.type}</span>
                        <span>•</span>
                        <span>{question.choices.length} choices</span>
                        <span>•</span>
                        <span>{question.points} points</span>
                        <span>•</span>
                        <span>{question.estimatedTime} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExistingQuestionsModal;

