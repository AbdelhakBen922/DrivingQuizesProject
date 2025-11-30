import React, { useState, useEffect, useRef } from 'react';
import { useRef as useSidebarRef } from 'react';
import TextAreaField from '../ui/TextAreaField';
import DropdownField from '../ui/DropdownField';
import EstimationTimeField from '../ui/EstimationTimeField';
import type { Question, Choice } from '~/routes/Quiz/quiz-editor';
import ChoiceItem from './ChoiceItem';
import ExistingQuestionsModal from './ExistingQuestionsModal';

type QuestionEditorProps = {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
  onAddExistingQuestion?: (question: Question) => void;
  currentQuestionIds?: string[];
};

const QuestionEditor = ({ question, onUpdate, onAddExistingQuestion, currentQuestionIds = [] }: QuestionEditorProps) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());
  const [showExistingQuestionsModal, setShowExistingQuestionsModal] = useState(false);
  const [showRandomizeDropdown, setShowRandomizeDropdown] = useState(false);
  const randomizeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (randomizeDropdownRef.current && !randomizeDropdownRef.current.contains(event.target as Node)) {
        setShowRandomizeDropdown(false);
      }
    };
    if (showRandomizeDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showRandomizeDropdown]);

  const allQuickSuggestions = [
    'What Does this Sign Mean',
    'Select the Right Priority',
    'What Should you do in this case',
    'Identify the correct action',
    'What is the meaning of this sign',
    'Choose the appropriate response',
    'What does this traffic sign indicate',
    'Select the best answer',
  ];

  // Filter out used suggestions
  const availableSuggestions = allQuickSuggestions.filter(
    (suggestion) => !usedSuggestions.has(suggestion)
  );

  const questionTypes = ['Multiple Choice', 'True/False', 'Short Answer'];
  const orderOptions = ['Keep Choices in current order', 'Randomize choices'];

  const handleAddChoice = () => {
    const newChoice: Choice = {
      id: `${Date.now()}`,
      text: '',
      isCorrect: false,
    };
    onUpdate({
      choices: [...question.choices, newChoice],
    });
  };

  const handleUpdateChoice = (choiceId: string, updates: Partial<Choice>) => {
    onUpdate({
      choices: question.choices.map((c) =>
        c.id === choiceId ? { ...c, ...updates } : c
      ),
    });
  };

  const handleDeleteChoice = (choiceId: string) => {
    // Prevent deleting if there is only 1 choice (minimum required)
    if (question.choices.length <= 1) {
      return;
    }
    onUpdate({
      choices: question.choices.filter((c) => c.id !== choiceId),
    });
  };

  const handleToggleCorrect = (choiceId: string) => {
    // If setting this as correct, unset others
    const updatedChoices = question.choices.map((c) => ({
      ...c,
      isCorrect: c.id === choiceId ? !c.isCorrect : false,
    }));
    onUpdate({ choices: updatedChoices });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ image: reader.result as string });
        setShowImageUpload(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto min-w-0 overflow-x-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--color-text-dark)' }}>Edit the Question</h1>
        <button 
          className="font-medium text-sm transition-colors whitespace-nowrap" 
          style={{ color: 'var(--color-blue)' }} 
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} 
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-blue)'}
          onClick={() => setShowExistingQuestionsModal(true)}
        >
          Add Existing Question &gt;
        </button>
      </div>

      {/* Bordered Content Container */}
      <div className="p-4 sm:p-6 border rounded-2xl" style={{ borderColor: '#333333', borderWidth: '1px' }}>
        {/* Question Type Selector */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border" style={{ backgroundColor: 'var(--color-gray-50)', borderColor: 'var(--color-light-grey)' }}>
        <div className="cursor-move text-grey flex-shrink-0" onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-blue)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-grey)'}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="5" cy="5" r="1" fill="currentColor" />
            <circle cx="15" cy="5" r="1" fill="currentColor" />
            <circle cx="5" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
            <circle cx="5" cy="15" r="1" fill="currentColor" />
            <circle cx="15" cy="15" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="flex-shrink-0" style={{ width: '237.75px' }}>
          <DropdownField
            value={question.type}
            options={questionTypes}
            onChange={(value) => onUpdate({ type: value as Question['type'] })}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <span className="text-sm whitespace-nowrap" style={{ color: 'var(--color-text-dark)' }}>Required</span>
          <button
            onClick={() => onUpdate({ required: !question.required })}
            className={`
              w-11 h-6 rounded-full transition-colors relative flex-shrink-0
            `}
            style={question.required ? { backgroundColor: 'var(--color-green)' } : { backgroundColor: 'var(--color-gray-300)' }}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 rounded-full transition-transform shadow-sm
                ${question.required ? 'translate-x-5' : 'translate-x-0.5'}
              `}
              style={{ backgroundColor: 'var(--color-white)' }}
            />
          </button>
        </div>
        <button className="p-2 rounded-lg transition-colors flex-shrink-0"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-200)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-grey"
          >
            <circle cx="10" cy="5" r="1.5" fill="currentColor" />
            <circle cx="10" cy="10" r="1.5" fill="currentColor" />
            <circle cx="10" cy="15" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Horizontal separator line */}
      <div className="mb-4 sm:mb-6" style={{ borderTop: '1px solid #000000' }}></div>

      {/* Question Input and Image */}
      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-6 sm:mb-8 min-w-0">
        {/* Left side - Question and Suggestions */}
        <div 
          className="min-w-0 relative w-full" 
          style={{ 
            width: '100%',
            maxWidth: '577px'
          }}
        >
          {/* Question Number - Outside the colored div */}
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-dark)' }}>
            QUESTION {question.number} {question.required ? '*' : ''}
          </h2>
          
          <div 
            className="space-y-3 sm:space-y-4 w-full" 
            style={{ 
              backgroundColor: 'var(--color-sidebar-bg)',
              width: '100%',
              maxWidth: '577px',
              minHeight: '300px',
              padding: '0.5rem', // sm padding
              borderRadius: '0.25rem', // xs border-radius
              gap: '10px'
            }}
          >
            <div className="w-full" style={{ maxWidth: '100%', overflow: 'hidden' }}>
              <div className="question-textarea-desktop" style={{ width: '100%', maxWidth: '100%' }}>
                <TextAreaField
                  value={question.text}
                  onChange={(value) => onUpdate({ text: value })}
                  placeholder="Enter your question here..."
                  rows={8}
                  customBackground="var(--color-white)"
                  customTextSize="sm:1.125rem"
                  showInfoIcon={false}
                  dashedBorder={true}
                  resizable={true}
                />
              </div>
            </div>

            {/* Quick Suggestions */}
            {availableSuggestions.length > 0 && (
              <div className="w-full">
                <p className="text-sm font-semibold mb-2 sm:mb-3" style={{ color: 'var(--color-text-dark)' }}>
                  Quick suggestions
                </p>
                <div className="flex flex-col" style={{ gap: '7.5px' }}>
                  {availableSuggestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        onUpdate({ text: suggestion });
                        setUsedSuggestions((prev) => new Set(prev).add(suggestion));
                      }}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-colors text-left w-full"
                      style={{ 
                        color: index === 0 ? 'var(--color-grey)' : 'var(--color-text-dark)', 
                        backgroundColor: index === 0 ? 'var(--color-gray-200)' : 'var(--color-white)',
                        border: '1px solid var(--color-gray-300)',
                        opacity: 1
                      }}
                      onMouseEnter={(e) => {
                        if (index !== 0) {
                          e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (index !== 0) {
                          e.currentTarget.style.backgroundColor = 'var(--color-white)';
                        }
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Image */}
        <div className="flex-shrink-0 w-full lg:w-[277px] mt-4 lg:mt-10 transition-all duration-300">
          {question.image ? (
            <div className="relative question-image-desktop">
              <img
                src={question.image}
                alt="Question"
                className="w-full object-contain border transition-all duration-300"
                style={{ 
                  height: 'auto',
                  minHeight: '150px',
                  width: '100%',
                  borderRadius: '0.25rem', // xs
                  paddingTop: '0.25rem', // xs
                  borderColor: 'var(--color-light-grey)'
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="p-2 rounded-lg shadow-md transition-colors"
                  style={{ backgroundColor: 'var(--color-white)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
                  aria-label="Refresh image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-grey"
                  >
                    <path
                      d="M8 2.66667V13.3333M2.66667 8H13.3333"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => onUpdate({ image: undefined })}
                  className="p-2 rounded-lg shadow-md transition-colors"
                  style={{ backgroundColor: 'var(--color-white)' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-red-50)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
                  aria-label="Delete image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: 'var(--color-red-500)' }}
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
              <button 
                className="absolute bottom-2 right-2 p-2 rounded-lg shadow-md transition-colors"
                style={{ backgroundColor: 'var(--color-white)' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-gray-50)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-white)'}
                aria-label="Zoom image"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-grey"
                >
                  <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path
                    d="M10 6V10L12.5 12.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              {showImageUpload && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute top-2 left-2 text-sm"
                />
              )}
            </div>
          ) : (
            <div
              className="border-2 border-dashed flex flex-col cursor-pointer transition-all duration-300 relative w-full question-image-desktop"
              style={{ 
                height: 'auto',
                minHeight: '150px',
                width: '100%',
                padding: '1rem',
                paddingTop: '0.25rem', // xs
                borderRadius: '0.25rem', // xs
                borderColor: 'var(--color-light-grey)',
                backgroundColor: 'var(--color-gray-50)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-light-grey)'}
            >
              {/* Main content area - centered */}
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-3">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 48 48"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ color: 'var(--color-grey)' }}
                  >
                    <path
                      d="M24 8V40M8 24H40"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                  <p 
                    className="text-sm"
                    style={{ color: 'var(--color-grey)' }}
                  >
                    Add Image
                  </p>
                </div>
              </div>
              
              {/* File chooser button at the bottom */}
              <div className="flex justify-center mt-auto">
                <label
                  htmlFor="image-upload-input"
                  className="cursor-pointer inline-block px-4 py-2 rounded text-sm font-medium transition-colors"
                  style={{
                    backgroundColor: 'var(--color-gray-400)',
                    color: 'var(--color-white)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-gray-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-gray-400)';
                  }}
                >
                  Aucun fichier choisi
                </label>
                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Choices Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-2 mb-3 sm:mb-4">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'var(--color-blue)' }}
          >
            <path
              d="M16.6667 4L7.5 13.3333L3.33333 9.16667"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <h3 className="text-base sm:text-lg font-semibold" style={{ color: 'var(--color-text-dark)' }}>Choices</h3>
        </div>

        <div className="space-y-3">
          {question.choices.map((choice, index) => (
            <ChoiceItem
              key={choice.id}
              choice={choice}
              index={index}
              isSelected={choice.isCorrect}
              onUpdate={(updates) => handleUpdateChoice(choice.id, updates)}
              onDelete={() => handleDeleteChoice(choice.id)}
              onToggleCorrect={() => handleToggleCorrect(choice.id)}
              canDelete={question.choices.length > 1}
            />
          ))}
        </div>

        <button
          onClick={handleAddChoice}
          className="mt-4 px-6 py-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
          style={{ 
            border: '1px dashed var(--color-gray-300)',
            backgroundColor: 'var(--color-white)',
            color: 'var(--color-grey)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gray-400)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-gray-300)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ color: 'var(--color-grey)' }}
          >
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>add option</span>
        </button>
      </div>

      {/* Horizontal separator line */}
      <div className="my-4 sm:my-6" style={{ borderTop: '1px solid #000000' }}></div>

      {/* Bottom Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="w-full sm:max-w-[280px]">
          <label className="form-label mb-2 block" style={{ color: 'var(--color-text-dark)' }}>Randomize Order</label>
          <div className="relative" ref={randomizeDropdownRef}>
            <div
              onClick={() => setShowRandomizeDropdown(!showRandomizeDropdown)}
              className="flex items-center justify-between rounded-lg cursor-pointer"
              style={{ 
                backgroundColor: 'var(--color-gray-200)', 
                border: '1px solid var(--color-gray-300)',
                padding: '0.5rem 1rem',
                minHeight: '2.5rem'
              }}
            >
              <span style={{ color: 'var(--color-text-dark)' }}>
                {question.randomizeOrder ? 'Randomize choices' : 'Keep Choices in current order'}
              </span>
              <div className="flex items-center gap-2">
                <div className="h-6 w-px" style={{ backgroundColor: 'var(--color-gray-300)' }}></div>
                <img
                  src="/assets/icons/down.svg"
                  className={`h-4 w-4 transition-transform ${showRandomizeDropdown ? 'rotate-180' : ''}`}
                  style={{ filter: 'brightness(0) saturate(100%) invert(20%) sepia(30%) saturate(2000%) hue-rotate(210deg) brightness(0.9) contrast(1.1)' }}
                />
              </div>
            </div>
            {showRandomizeDropdown && (
              <div
                className="absolute z-10 w-full rounded-xl border shadow-lg mt-1"
                style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-gray-300)' }}
              >
                {orderOptions.map((opt) => (
                  <div
                    key={opt}
                    onClick={() => {
                      onUpdate({ randomizeOrder: opt === 'Randomize choices' });
                      setShowRandomizeDropdown(false);
                    }}
                    className="px-4 cursor-pointer transition flex items-center"
                    style={{ 
                      height: '2.5rem',
                      backgroundColor: 'var(--color-gray-200)',
                      color: 'var(--color-text-dark)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-200)';
                    }}
                  >
                    {opt}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="w-full sm:max-w-[200px]">
          <EstimationTimeField
            value={question.estimatedTime}
            onChange={(value) => onUpdate({ estimatedTime: value })}
            placeholder="2"
          />
        </div>
        <div className="w-full sm:max-w-[200px]">
          <label className="form-label mb-2 block" style={{ color: 'var(--color-text-dark)' }}>Mark as point</label>
          <div className="relative flex items-center rounded-lg" style={{ 
            backgroundColor: 'var(--color-gray-200)', 
            border: '1px solid var(--color-gray-300)',
            minHeight: '2.5rem'
          }}>
            <input
              type="number"
              value={question.points}
              onChange={(e) =>
                onUpdate({ points: parseInt(e.target.value) || 0 })
              }
              className="w-full bg-transparent border-none outline-none pl-4 pr-10 py-2 text-sm"
              style={{ color: 'var(--color-text-dark)' }}
              placeholder="3"
            />
            {/* Vertical separator between value and star icon */}
            <div className="absolute top-1/2 -translate-y-1/2 h-2/3 w-px pointer-events-none" style={{ right: '35px', backgroundColor: '#000000' }}></div>
            {/* Yellow star icon inside the form field */}
            <div className="absolute right-3 flex items-center pointer-events-none">
              <svg
                width="16"
                height="16"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: 'var(--color-yellow)' }}
              >
                <path
                  d="M10 2L12.5 7.5L18.5 8.5L14 12.5L15 18.5L10 15.5L5 18.5L6 12.5L1.5 8.5L7.5 7.5L10 2Z"
                  fill="currentColor"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Existing Questions Modal */}
      {onAddExistingQuestion && (
        <ExistingQuestionsModal
          isOpen={showExistingQuestionsModal}
          onClose={() => setShowExistingQuestionsModal(false)}
          onSelectQuestion={onAddExistingQuestion}
          currentQuestionIds={currentQuestionIds}
        />
      )}
    </div>
  );
};

export default QuestionEditor;

