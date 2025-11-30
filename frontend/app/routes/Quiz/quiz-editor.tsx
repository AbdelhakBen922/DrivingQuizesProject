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

// Helper function to create 1 empty choice
const createEmptyChoices = (): Choice[] => {
  return [
    { id: `${Date.now()}-1`, text: '', isCorrect: false },
  ];
};

const QuizEditor = () => {
  const [quizName, setQuizName] = useState('Name of the quizz');
  const [lastEdited, setLastEdited] = useState('Just now');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(434);
  const [isResizing, setIsResizing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);

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

  const addExistingQuestion = (question: Question) => {
    const newNumber = questions.length + 1;
    const newQuestion: Question = {
      ...question,
      number: newNumber,
    };
    setQuestions((prev) => {
      const updated = [...prev, newQuestion];
      // Renumber all questions to ensure sequential numbering
      return updated.map((q, index) => ({ ...q, number: index + 1 }));
    });
    setSelectedQuestionId(newQuestion.id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      // Set min and max width constraints
      if (newWidth >= 300 && newWidth <= 800) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const desktop = width >= 1024;
      setIsDesktop(desktop);
      setWindowWidth(width);
      if (desktop) {
        setIsSidebarOpen(false);
      }
    };
    
    // Set initial state
    if (typeof window !== 'undefined') {
      handleResize();
    }
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Mobile sidebar toggle button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="lg:hidden fixed top-20 left-4 z-50 p-2 rounded-lg bg-white border shadow-md"
          style={{ borderColor: 'var(--color-gray-300)' }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 5H17M3 10H17M3 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Sidebar */}
        {(isDesktop || isSidebarOpen) && (
          <div 
            className={`
              lg:relative inset-y-0 left-0 z-40 sidebar-wrapper
              transform transition-all duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0 fixed sidebar-open' : '-translate-x-full lg:translate-x-0 lg:relative'}
              ${!isSidebarOpen && !isDesktop ? 'w-0' : ''}
            `}
            style={{ 
              backgroundColor: 'var(--color-sidebar-bg)',
              width: isDesktop 
                ? `${sidebarWidth}px` 
                : isSidebarOpen && windowWidth > 0 && windowWidth < 1024
                  ? `${Math.max(280, Math.min(434, windowWidth * 0.4))}px`
                  : isSidebarOpen
                    ? '100%'
                    : '0',
              maxWidth: isDesktop ? 'none' : (isSidebarOpen ? '434px' : '0'),
              minWidth: isDesktop ? 'none' : (isSidebarOpen ? '280px' : '0'),
              height: isDesktop ? '1000px' : (isSidebarOpen ? '100vh' : '100%'),
              flexShrink: !isSidebarOpen && !isDesktop ? 0 : undefined
            }}
          >
            <div className="relative h-full w-full">
              <QuestionsSidebar
                questions={questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={(id) => {
                  setSelectedQuestionId(id);
                  // Don't close sidebar on mobile - keep it open
                }}
                onAddQuestion={addQuestion}
                onDeleteQuestion={deleteQuestion}
                onReorderQuestions={reorderQuestions}
              />
              {/* Resize handle - only on desktop */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  setIsResizing(true);
                }}
                className="hidden lg:block absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-300 transition-colors z-10"
                style={{ backgroundColor: isResizing ? 'var(--color-blue)' : 'transparent' }}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto bg-white w-full lg:w-auto">
          {selectedQuestion ? (
            <QuestionEditor
              question={selectedQuestion}
              onUpdate={(updates) => updateQuestion(selectedQuestionId!, updates)}
              onAddExistingQuestion={addExistingQuestion}
              currentQuestionIds={questions.map((q) => q.id)}
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

