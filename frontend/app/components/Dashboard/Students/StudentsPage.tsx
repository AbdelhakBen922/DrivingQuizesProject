import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Users, UserPlus, Search, Mail, Phone, Calendar } from "lucide-react";
import * as api from "../../../services/api";
import { useToast } from "../../../hooks/useToast";
import CreateStudentModal from "./CreateStudentModal";
import EditStudentModal from "./EditStudentModal";
import ManageStudentGroupsModal from "./ManageStudentGroupsModal";
import DeleteConfirmModal from "../Exams/Modals/DeleteConfirmModal";

interface StudentWithRooms extends api.Student {
  rooms?: string[]; // Room names the student belongs to
  roomCount?: number;
}

export default function StudentsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [toasts, setToasts] = useState<any[]>([]);
  const { success, error } = useToast({ toasts, setToasts });

  const [students, setStudents] = useState<StudentWithRooms[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithRooms[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithRooms | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newThisMonth: 0,
  });

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, students]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const [data, allRooms] = await Promise.all([
        api.listStudents({ limit: 100 }),
        api.getRooms()
      ]);
      
      // Enhance with room membership data
      const studentsWithRooms: StudentWithRooms[] = await Promise.all(
        data.map(async (student) => {
          try {
            const memberships = await api.getStudentRooms(student.id);
            console.log(`Student ${student.id} (${student.full_name}) memberships:`, memberships);
            const roomNames = memberships
              .map((m: any) => {
                const room = allRooms.find((r: any) => r.id === m.room_id);
                return room?.name || "";
              })
              .filter(Boolean);
            
            return {
              ...student,
              rooms: roomNames,
              roomCount: memberships.length,
            };
          } catch (err) {
            // If membership endpoint fails, return with empty rooms
            console.error(`Failed to load memberships for student ${student.id}:`, err);
            return {
              ...student,
              rooms: [],
              roomCount: 0,
            };
          }
        })
      );

      setStudents(studentsWithRooms);
      setFilteredStudents(studentsWithRooms);

      // Calculate stats
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();

      setStats({
        totalStudents: data.length,
        activeStudents: data.filter(s => !s.deleted_at).length,
        newThisMonth: data.filter(s => {
          const createdDate = new Date(s.created_at);
          return createdDate.getMonth() === thisMonth && createdDate.getFullYear() === thisYear;
        }).length,
      });
    } catch (err) {
      console.error("Failed to load students:", err);
      error(t("students.loadError", "فشل تحميل الطلاب"));
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(query) ||
        student.student_code.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.phone?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    loadStudents();
    success(t("students.createSuccess", "تم إنشاء الطالب بنجاح"));
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
    loadStudents();
    success(t("students.updateSuccess", "تم تحديث الطالب بنجاح"));
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;

    try {
      await api.deleteStudent(selectedStudent.id);
      setShowDeleteModal(false);
      setSelectedStudent(null);
      loadStudents();
      success(t("students.deleteSuccess", "تم حذف الطالب بنجاح"));
    } catch (err) {
      console.error("Failed to delete student:", err);
      error(t("students.deleteError", "فشل حذف الطالب"));
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(i18n.language === "ar" ? "ar-DZ" : "fr-FR");
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
        <div className={isRTL ? "text-right" : "text-left"}>
          <h1 className="text-2xl font-bold text-primary-800">
            {t("students.title", "إدارة الطلاب")}
          </h1>
          <p className="text-grey mt-1">
            {t("students.subtitle", "قم بإدارة طلابك ومجموعاتهم")}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <UserPlus size={20} />
          {t("students.createStudent", "إضافة طالب")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-grey text-sm">{t("students.stats.total", "إجمالي الطلاب")}</p>
              <p className="text-2xl font-bold text-primary-800 mt-1">{stats.totalStudents}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-grey text-sm">{t("students.stats.active", "الطلاب النشطون")}</p>
              <p className="text-2xl font-bold text-primary-800 mt-1">{stats.activeStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
            <div className={isRTL ? "text-right" : "text-left"}>
              <p className="text-grey text-sm">{t("students.stats.newMonth", "جديد هذا الشهر")}</p>
              <p className="text-2xl font-bold text-primary-800 mt-1">{stats.newThisMonth}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserPlus className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 shadow-md">
        <div className={`flex items-center gap-4 ${isRTL ? "flex-row-reverse" : "flex-row"}`}>
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 text-grey ${
                isRTL ? "right-3" : "left-3"
              }`}
              size={20}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("students.searchPlaceholder", "البحث عن طالب...")}
              className={`w-full border border-gray-300 rounded-lg py-2 ${
                isRTL ? "pr-10 text-right" : "pl-10 text-left"
              } focus:outline-none focus:border-primary-500`}
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.name", "الاسم")}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.code", "الرمز")}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.contact", "معلومات الاتصال")}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.dob", "تاريخ الميلاد")}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.groups", "المجموعات")}
                </th>
                <th className={`px-6 py-3 text-sm font-semibold text-primary-800 ${isRTL ? "text-right" : "text-left"}`}>
                  {t("students.table.actions", "الإجراءات")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-grey">
                    {t("common.loading", "جاري التحميل...")}
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-grey">
                    {searchQuery
                      ? t("students.noResults", "لا توجد نتائج")
                      : t("students.noStudents", "لا يوجد طلاب")}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold">
                          {student.full_name.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="font-medium text-primary-800">{student.full_name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-grey ${isRTL ? "text-right" : "text-left"}`}>
                      {student.student_code}
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="space-y-1">
                        {student.email && (
                          <div className="flex items-center gap-2 text-sm text-grey">
                            <Mail size={14} />
                            {student.email}
                          </div>
                        )}
                        {student.phone && (
                          <div className="flex items-center gap-2 text-sm text-grey">
                            <Phone size={14} />
                            {student.phone}
                          </div>
                        )}
                        {!student.email && !student.phone && <span className="text-sm text-grey">-</span>}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm text-grey ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {formatDate(student.dob)}
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-sm ${isRTL ? "text-right" : "text-left"}`}>
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowGroupsModal(true);
                        }}
                        className="text-primary-500 hover:text-primary-600 font-medium"
                      >
                        {student.roomCount || 0} {t("students.table.groupsCount", "مجموعات")}
                      </button>
                    </td>
                    <td className={`px-6 py-4 ${isRTL ? "text-right" : "text-left"}`}>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          {t("common.edit", "تعديل")}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStudent(student);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          {t("common.delete", "حذف")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateStudentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedStudent && (
        <EditStudentModal
          isOpen={showEditModal}
          student={selectedStudent}
          onClose={() => {
            setShowEditModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}

      {showGroupsModal && selectedStudent && (
        <ManageStudentGroupsModal
          isOpen={showGroupsModal}
          student={selectedStudent}
          onClose={() => {
            setShowGroupsModal(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            setShowGroupsModal(false);
            setSelectedStudent(null);
            loadStudents();
          }}
        />
      )}

      {showDeleteModal && selectedStudent && (
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          itemName={selectedStudent.full_name}
          itemType="template"
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedStudent(null);
          }}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
