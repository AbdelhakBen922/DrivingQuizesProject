import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface AnswerOptionProps {
  id: string;
  text: string;
  isCorrect: boolean;
  isMultiple?: boolean;
  isTrueFalse?: boolean;
  onTextChange: (text: string) => void;
  onCorrectChange: () => void;
  onDelete: () => void;
}

export default function AnswerOption({
  id,
  text,
  isCorrect,
  isMultiple = false,
  isTrueFalse = false,
  onTextChange,
  onCorrectChange,
  onDelete,
}: AnswerOptionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-3 p-2 rounded-xl transition-all
        ${isCorrect 
          ? "bg-primary-500" 
          : "bg-gray-50 border border-gray-200"
        }
        flex-row-reverse
      `}
    >
      {/* Delete Button - Hidden for True/False */}
      {!isTrueFalse && (
        <button
          onClick={onDelete}
          className={`
            p-2 rounded-lg transition-colors
            ${isCorrect 
              ? "hover:bg-primary-600 text-white" 
              : "hover:bg-red-50 text-red"
            }
          `}
        >
          <img
            src="/assets/icons/create_exam/Trash_Full.svg"
            alt="delete"
            className={`w-5 h-5 ${isCorrect ? "brightness-0 invert" : ""}`}
          />
        </button>
      )}

      {/* Text Input */}
      <input
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        disabled={isTrueFalse}
        placeholder=""
        className={`
          flex-1 px-4 py-2 rounded-lg bg-transparent outline-none
          ${isCorrect 
            ? "text-white placeholder-white/70" 
            : "text-gray-700 placeholder-gray-400"
          }
          ${isTrueFalse ? "cursor-not-allowed" : ""}
          ${isRTL ? "text-right" : "text-left"}
        `}
      />

      {/* Radio/Checkbox for selecting correct answer */}
      <button
        onClick={onCorrectChange}
        className={`
          flex items-center gap-2 px-3 py-1 rounded-lg transition-colors
          ${isCorrect 
            ? "text-white" 
            : "text-gray-500 hover:text-primary-500"
          }
          ${isRTL ? "flex-row-reverse" : "flex-row-reverse"}
        `}
      >
        <span className={`text-sm ${isCorrect ? "text-white" : "text-gray-600"}`}>
          {text || t('createTemplate.defaultAnswerLabel', isRTL ? 'خيار' : 'Option')}
        </span>
        {isMultiple ? (
          // Checkbox for multiple choice
          <div
            className={`
              w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${isCorrect 
                ? "border-white bg-white" 
                : "border-gray-400"
              }
            `}
          >
            {isCorrect && (
              <svg className="w-3 h-3 text-primary-500" viewBox="0 0 12 12" fill="none">
                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
        ) : (
          // Radio button for single choice and T_F
          <div
            className={`
              w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
              ${isCorrect 
                ? "border-white bg-white" 
                : "border-gray-400"
              }
            `}
          >
            {isCorrect && (
              <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
            )}
          </div>
        )}
      </button>

      {/* Drag Handle */}
      <button 
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing"
      >
        <img
          src="/assets/icons/create_exam/elipsis-double-v-alt.svg"
          alt="drag"
          className={`w-4 h-4 ${isCorrect ? "brightness-0 invert opacity-70" : "opacity-50"}`}
        />
      </button>
    </div>
  );
}
