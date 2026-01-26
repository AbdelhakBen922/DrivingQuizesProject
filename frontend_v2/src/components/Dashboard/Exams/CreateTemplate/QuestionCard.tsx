import { useTranslation } from "react-i18next";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuestionCardProps {
  id: string;
  index: number;
  title: string;
  type: "single" | "multiple" | "T_F";
  isActive?: boolean;
  onClick: () => void;
  onDelete?: () => void;
}

export default function QuestionCard({
  id,
  index,
  title,
  type,
  isActive = false,
  onClick,
  onDelete,
}: QuestionCardProps) {
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

  const getTypeLabel = () => {
    switch (type) {
      case "single":
        return t("createTemplate.questionTypes.single", "وحيد الإختيار");
      case "multiple":
        return t("createTemplate.questionTypes.multiple", "متعدد الإختيارات");
      case "T_F":
        return t("createTemplate.trueFalse", "صح/خطأ");
      default:
        return "";
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`
        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all
        ${isActive 
          ? "bg-primary-100 border-2 border-primary-500" 
          : "bg-white border border-gray-200 hover:border-primary-300"
        }
        ${isRTL ? "flex-row" : "flex-row"}
      `}
    >
      {/* Drag Handle */}
      <button 
        {...attributes}
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/assets/icons/create_exam/elipsis-double-v-alt.svg"
          alt="drag"
          className="w-4 h-4 opacity-50"
        />
      </button>

      {/* Question Number */}
      <span className="text-primary-800 font-bold text-lg min-w-[24px]">
        {index}
      </span>

      {/* Question Info */}
      <div className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}>
        <p className="text-sm font-medium text-primary-800 truncate">
          {title}
        </p>
        <span className="text-xs text-gray-500">
          {getTypeLabel()}
        </span>
      </div>

      {/* More Options */}
      {onDelete && (
        <button 
          className="p-1 hover:bg-gray-100 rounded-lg"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <img
            src="/assets/icons/create_exam/Trash_Full.svg"
            alt="delete"
            className="w-4 h-4 opacity-50"
          />
        </button>
      )}
    </div>
  );
}
