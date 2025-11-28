import React, { useState, useEffect } from 'react';
import QuizEditorHeader from '~/components/Quiz-Editor/QuizEditorHeader';
import QuestionsSidebar from '~/components/Quiz-Editor/QuestionsSidebar';
import QuestionEditor from '~/components/Quiz-Editor/QuestionEditor';

export type Question = {
  id: string;
  number: number;
  text: string;
  type: 'Multiple Choice' | 'True/False' | 'Short Answer';
  required: boolean;
  image?: string;
  choices: Choice[];
  estimatedTime: number; // in minutes
  points: number;
  randomizeOrder: boolean;
};

export type Choice = {
  id: string;
  text: string;
  isCorrect: boolean;
};

// Helper function to create 2 empty choices
const createEmptyChoices = (): Choice[] => {
  return [
    { id: `${Date.now()}-1`, text: '', isCorrect: false },
    { id: `${Date.now()}-2`, text: '', isCorrect: false },
  ];
};

const QuizEditor = () => {
  const [quizName, setQuizName] = useState('Name of the quizz');
  const [lastEdited, setLastEdited] = useState('Just now');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId);

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  };

  const addQuestion = () => {
    const newNumber = questions.length + 1;
    const newQuestion: Question = {
      id: `question-${Date.now()}-${Math.random()}`,
      number: newNumber,
      text: '',
      type: 'Multiple Choice',
      required: true,
      choices: createEmptyChoices(),
      estimatedTime: 2,
      points: 3,
      randomizeOrder: false,
    };
    setQuestions((prev) => {
      const updated = [...prev, newQuestion];
      // Renumber all questions to ensure sequential numbering
      return updated.map((q, index) => ({ ...q, number: index + 1 }));
    });
    setSelectedQuestionId(newQuestion.id);
  };

  const deleteQuestion = (questionId: string) => {
    const wasSelected = selectedQuestionId === questionId;
    const deletedIndex = questions.findIndex((q) => q.id === questionId);
    
    // Calculate the new questions array with renumbering
    const filtered = questions.filter((q) => q.id !== questionId);
    const renumbered = filtered.map((q, index) => ({ ...q, number: index + 1 }));
    
    // Update questions state
    setQuestions(renumbered);
    
    // Update selected question if the deleted one was selected
    if (wasSelected) {
      if (renumbered.length > 0) {
        // Try to select the question at the same position, or the first one
        const newSelected = renumbered[deletedIndex] || renumbered[0];
        setSelectedQuestionId(newSelected.id);
      } else {
        setSelectedQuestionId(null);
      }
    }
  };

  const reorderQuestions = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...questions];
    const [moved] = newQuestions.splice(fromIndex, 1);
    newQuestions.splice(toIndex, 0, moved);
    setQuestions(
      newQuestions.map((q, index) => ({ ...q, number: index + 1 }))
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <QuizEditorHeader
        quizName={quizName}
        lastEdited={lastEdited}
        onQuizNameChange={setQuizName}
        onPublish={() => console.log('Publishing quiz...')}
        onPreview={() => console.log('Previewing quiz...')}
        onSettings={() => console.log('Opening settings...')}
      />
      <div className="flex flex-1 overflow-hidden">
        <QuestionsSidebar
          questions={questions}
          selectedQuestionId={selectedQuestionId}
          onSelectQuestion={setSelectedQuestionId}
          onAddQuestion={addQuestion}
          onDeleteQuestion={deleteQuestion}
          onReorderQuestions={reorderQuestions}
        />
        <div className="flex-1 overflow-y-auto bg-white">
          {selectedQuestion ? (
            <QuestionEditor
              question={selectedQuestion}
              onUpdate={(updates) => updateQuestion(selectedQuestionId!, updates)}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-grey text-lg mb-4">No questions yet</p>
                <button
                  onClick={addQuestion}
                  className="btn-primary"
                >
                  Add Your First Question
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;

