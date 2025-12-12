import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { X, Users, Plus, Trash2 } from "lucide-react";
import * as api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

interface ManageStudentGroupsModalProps {
  isOpen: boolean;
  student: api.Student;
  onClose: () => void;
  onSuccess: () => void;
}

interface RoomMembership {
  member_id: number;
  room_id: number;
  room_name: string;
  room_code: string;
  status: string;
  joined_at: string;
}

export default function ManageStudentGroupsModal({ isOpen, student, onClose, onSuccess }: ManageStudentGroupsModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [toasts, setToasts] = useState<any[]>([]);
  const { success, error } = useToast({ toasts, setToasts });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allRooms, setAllRooms] = useState<api.Room[]>([]);
  const [currentMemberships, setCurrentMemberships] = useState<RoomMembership[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, student.id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rooms, memberships] = await Promise.all([
        api.getRooms(),
        loadStudentMemberships(),
      ]);
      setAllRooms(rooms);
    } catch (err) {
      console.error("Failed to load data:", err);
      error(t("students.groups.loadError", "فشل تحميل المجموعات"));
    } finally {
      setLoading(false);
    }
  };

  const loadStudentMemberships = async (): Promise<RoomMembership[]> => {
    // TODO: Replace with actual API call when backend endpoint is ready
    // For now, we'll use the rooms endpoint to check memberships
    try {
      const rooms = await api.getRooms();
      const memberships: RoomMembership[] = [];
      
      // This is a workaround - ideally we'd have an endpoint like:
      // GET /dashboard/students/{student_id}/rooms
      // For now, we'll return empty array and populate on room details page
      
      setCurrentMemberships(memberships);
      return memberships;
    } catch (err) {
      console.error("Failed to load student memberships:", err);
      return [];
    }
  };

  const handleAddToRoom = async () => {
    if (!selectedRoomId) return;

    try {
      setSaving(true);
      await api.addStudentToRoom(selectedRoomId, student.id);
      
      // Reload memberships
      await loadStudentMemberships();
      setSelectedRoomId(null);
      
      success(t("students.groups.addSuccess", "تمت إضافة الطالب إلى المجموعة"));
    } catch (err: any) {
      console.error("Failed to add student to room:", err);
      error(err.message || t("students.groups.addError", "فشلت إضافة الطالب"));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveFromRoom = async (membership: RoomMembership) => {
    try {
      setSaving(true);
      await api.removeStudentFromRoom(membership.room_id, membership.member_id);
      
      // Reload memberships
      await loadStudentMemberships();
      
      success(t("students.groups.removeSuccess", "تمت إزالة الطالب من المجموعة"));
    } catch (err: any) {
      console.error("Failed to remove student from room:", err);
      error(err.message || t("students.groups.removeError", "فشلت إزالة الطالب"));
    } finally {
      setSaving(false);
    }
  };

  const availableRooms = allRooms.filter(
    room => !currentMemberships.some(m => m.room_id === room.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-primary-800">
              <Users size={24} className="inline mr-2" />
              {t("students.groups.title", "إدارة مجموعات الطالب")}
            </h2>
            <p className="text-sm text-grey mt-1">
              {student.full_name} ({student.student_code})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-grey hover:text-primary-800 transition-colors"
            disabled={saving}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 180px)" }}>
          {/* Add to Group Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-primary-800 mb-3">
              <Plus size={18} className="inline mr-1" />
              {t("students.groups.addToGroup", "إضافة إلى مجموعة")}
            </h3>
            
            <div className={`flex gap-2 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
              <select
                value={selectedRoomId || ""}
                onChange={(e) => setSelectedRoomId(e.target.value ? Number(e.target.value) : null)}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 ${isRTL ? "text-right" : "text-left"}`}
                disabled={availableRooms.length === 0 || saving}
              >
                <option value="">
                  {availableRooms.length === 0
                    ? t("students.groups.noAvailableRooms", "لا توجد مجموعات متاحة")
                    : t("students.groups.selectRoom", "اختر مجموعة")}
                </option>
                {availableRooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={handleAddToRoom}
                disabled={!selectedRoomId || saving}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? t("common.loading", "...") : t("students.groups.add", "إضافة")}
              </button>
            </div>
          </div>

          {/* Current Memberships */}
          <div>
            <h3 className="font-semibold text-primary-800 mb-3">
              {t("students.groups.currentGroups", "المجموعات الحالية")} ({currentMemberships.length})
            </h3>

            {loading ? (
              <div className="text-center py-8 text-grey">
                {t("common.loading", "جاري التحميل...")}
              </div>
            ) : currentMemberships.length === 0 ? (
              <div className="text-center py-8 text-grey bg-gray-50 rounded-lg">
                {t("students.groups.noMemberships", "الطالب غير منضم لأي مجموعة")}
              </div>
            ) : (
              <div className="space-y-2">
                {currentMemberships.map((membership) => (
                  <div
                    key={membership.member_id}
                    className={`flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 ${isRTL ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div className={isRTL ? "text-right" : "text-left"}>
                      <p className="font-medium text-primary-800">{membership.room_name}</p>
                      <p className="text-sm text-grey">
                        {t("students.groups.joined", "انضم")}: {new Date(membership.joined_at).toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : "fr-FR")}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveFromRoom(membership)}
                      disabled={saving}
                      className="text-red-600 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      title={t("students.groups.remove", "إزالة")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end p-6 border-t border-gray-200 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <button
            onClick={onSuccess}
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t("common.close", "إغلاق")}
          </button>
        </div>
      </div>
    </div>
  );
}
