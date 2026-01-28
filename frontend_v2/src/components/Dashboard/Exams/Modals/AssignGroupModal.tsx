import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as api from "../../../../services/api";

interface GroupData {
  id: string;
  name: string;
  studentsCount: number;
}

interface AssignGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (groupIds: string[]) => void;
  templateName: string;
}

export default function AssignGroupModal({
  isOpen,
  onClose,
  onConfirm,
  templateName,
}: AssignGroupModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  
  // State for API data
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [, setLoading] = useState(false);
  
  // Load groups when modal opens
  useEffect(() => {
    if (isOpen) {
      loadGroups();
    }
  }, [isOpen]);
  
  async function loadGroups() {
    try {
      setLoading(true);
      const rooms = await api.getRooms();
      setGroups(rooms.map(r => ({
        id: r.id.toString(),
        name: r.name,
        studentsCount: 0,
      })));
    } catch (err) {
      console.error('Failed to load groups:', err);
    } finally {
      setLoading(false);
    }
  }
  
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedGroups(new Set());
      setSearchQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleGroup = (groupId: string) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(groupId)) {
      newSelected.delete(groupId);
    } else {
      newSelected.add(groupId);
    }
    setSelectedGroups(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedGroups.size === filteredGroups.length) {
      setSelectedGroups(new Set());
    } else {
      setSelectedGroups(new Set(filteredGroups.map((g) => g.id)));
    }
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedGroups));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full flex flex-col max-h-[80vh] ${isRTL ? "text-right" : "text-left"}`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div>
            <h2 className="text-xl font-bold text-primary-800">
              {t("templates.assignModal.title", "تعيين القالب لمجموعة")}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {t("templates.assignModal.subtitle", "اختر المجموعات التي تريد تعيين \"{{name}}\" إليها", { name: templateName })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("templates.assignModal.searchPlaceholder", "البحث عن مجموعة...")}
              className={`
                w-full px-4 py-2.5 border border-gray-300 rounded-xl outline-none
                focus:border-primary-500 transition-colors
                ${isRTL ? "pr-10 text-right" : "pl-10"}
              `}
            />
            <svg
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 ${isRTL ? "right-3" : "left-3"}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Select All */}
        <div className={`px-4 py-3 border-b border-gray-100 ${isRTL ? "text-right" : ""}`}>
          <button
            onClick={handleSelectAll}
            className={`flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 ${isRTL ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`
                w-5 h-5 rounded border-2 flex items-center justify-center transition-all
                ${selectedGroups.size === filteredGroups.length && filteredGroups.length > 0
                  ? "border-primary-500 bg-primary-500"
                  : "border-gray-400"
                }
              `}
            >
              {selectedGroups.size === filteredGroups.length && filteredGroups.length > 0 && (
                <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                  <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            {t("templates.assignModal.selectAll", "تحديد الكل")} ({selectedGroups.size}/{filteredGroups.length})
          </button>
        </div>

        {/* Groups List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              onClick={() => handleToggleGroup(group.id)}
              className={`
                flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                ${selectedGroups.has(group.id)
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 hover:border-primary-300 bg-white"
                }
                ${isRTL ? "flex-row-reverse" : ""}
              `}
            >
              {/* Checkbox */}
              <div
                className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                  ${selectedGroups.has(group.id)
                    ? "border-primary-500 bg-primary-500"
                    : "border-gray-400"
                  }
                `}
              >
                {selectedGroups.has(group.id) && (
                  <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              {/* Group Info */}
              <div className="flex-1">
                <p className="font-semibold text-primary-800">{group.name}</p>
                <p className="text-sm text-gray-500">
                  {group.studentsCount} {t("templates.assignModal.students", "طالب")}
                </p>
              </div>

              {/* Group Icon */}
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between p-4 border-t border-gray-200 ${isRTL ? "flex-row-reverse" : ""}`}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            {t("common.cancel", "إلغاء")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedGroups.size === 0}
            className={`
              px-6 py-2.5 bg-primary-500 text-white rounded-xl font-medium
              hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
            {t("templates.assignModal.assign", "تعيين")} ({selectedGroups.size})
          </button>
        </div>
      </div>
    </div>
  );
}
