import React, { useState } from 'react';
import TextAreaField from '../ui/TextAreaField';
import DropdownField from '../ui/DropdownField';
import type { Question, Choice } from '~/routes/Quiz/quiz-editor';
import ChoiceItem from './ChoiceItem';

type QuestionEditorProps = {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
};

const QuestionEditor = ({ question, onUpdate }: QuestionEditorProps) => {
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [usedSuggestions, setUsedSuggestions] = useState<Set<string>>(new Set());

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
    // Prevent deleting if there are only 2 choices (minimum required)
    if (question.choices.length <= 2) {
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
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary-800">Edit the Question</h1>
        <button className="font-medium text-sm" style={{ color: 'var(--color-blue)' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-primary-800)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-blue)'}>
          Add Existing Question &gt;
        </button>
      </div>

      {/* Question Type Selector */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-light-grey">
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
        <div className="flex-1 min-w-0">
          <DropdownField
            value={question.type}
            options={questionTypes}
            onChange={(value) => onUpdate({ type: value as Question['type'] })}
          />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-grey whitespace-nowrap">Required</span>
          <button
            onClick={() => onUpdate({ required: !question.required })}
            className={`
              w-11 h-6 rounded-full transition-colors relative flex-shrink-0
              ${question.required ? '' : 'bg-gray-300'}
            `}
            style={question.required ? { backgroundColor: 'var(--color-blue)' } : {}}
          >
            <div
              className={`
                absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm
                ${question.required ? 'translate-x-5' : 'translate-x-0.5'}
              `}
            />
          </button>
        </div>
        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors flex-shrink-0">
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

      {/* Question Input and Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left side - Question and Suggestions */}
        <div className="lg:col-span-2 space-y-4">
          <TextAreaField
            label={`Question ${question.number} ${question.required ? '*' : ''}`}
            value={question.text}
            onChange={(value) => onUpdate({ text: value })}
            placeholder="Enter your question here..."
            rows={6}
          />

          {/* Quick Suggestions */}
          {availableSuggestions.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-dark)' }}>
                Quick suggestions
              </p>
              <div className="flex flex-wrap gap-2">
                {availableSuggestions.slice(0, 3).map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      onUpdate({ text: suggestion });
                      setUsedSuggestions((prev) => new Set(prev).add(suggestion));
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 rounded-lg transition-colors"
                    style={{ color: 'var(--color-text-dark)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
                      e.currentTarget.style.color = 'var(--color-text-dark)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-gray-100)';
                      e.currentTarget.style.color = 'var(--color-text-primary)';
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Image */}
        <div className="lg:col-span-1">
          {question.image ? (
            <div className="relative">
              <img
                src={question.image}
                alt="Question"
                className="w-full h-64 object-cover rounded-xl border border-light-grey"
              />
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => setShowImageUpload(true)}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
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
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50"
                  aria-label="Delete image"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-red-500"
                  >
                    <path
                      d="M12 4L4 12M4 4L12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <button 
                className="absolute bottom-2 right-2 p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
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
              onClick={() => setShowImageUpload(true)}
              className="w-full h-64 border-2 border-dashed border-light-grey rounded-xl flex items-center justify-center cursor-pointer transition-colors bg-gray-50"
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--color-blue)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--color-light-grey)'}
            >
              <div className="text-center">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-2 text-grey"
                >
                  <path
                    d="M24 8V40M8 24H40"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                <p className="text-sm text-grey">Add Image</p>
              </div>
              {showImageUpload && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Choices Section */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
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
          <h3 className="text-lg font-semibold text-primary-800">Choices</h3>
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
              canDelete={question.choices.length > 2}
            />
          ))}
        </div>

        <button
          onClick={handleAddChoice}
          className="mt-4 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
          style={{ color: 'var(--color-blue)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--color-primary-50)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          + add option
        </button>
      </div>

      {/* Bottom Settings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="form-label mb-2 block">Randomize Order</label>
          <DropdownField
            value={
              question.randomizeOrder
                ? 'Randomize choices'
                : 'Keep Choices in current order'
            }
            options={orderOptions}
            onChange={(value) =>
              onUpdate({ randomizeOrder: value === 'Randomize choices' })
            }
          />
        </div>
        <div>
          <label className="form-label mb-2 block">Estimation Time</label>
          <div className="relative">
            <input
              type="number"
              value={question.estimatedTime}
              onChange={(e) =>
                onUpdate({ estimatedTime: parseInt(e.target.value) || 0 })
              }
              className="form-field pr-10"
              placeholder="2"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-grey text-sm">
              Mins
            </span>
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-12 top-1/2 -translate-y-1/2 text-grey pointer-events-none"
            >
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M10 6V10L12 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div>
          <label className="form-label mb-2 block">Mark as point</label>
          <div className="relative">
            <input
              type="number"
              value={question.points}
              onChange={(e) =>
                onUpdate({ points: parseInt(e.target.value) || 0 })
              }
              className="form-field pr-10"
              placeholder="3"
            />
            <svg
              width="18"
              height="18"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-grey pointer-events-none"
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
  );
};

export default QuestionEditor;

