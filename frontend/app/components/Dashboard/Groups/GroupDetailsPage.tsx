import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import StatsCard from "./StatsCard";
import { ToastContainer } from "../../Toast";
import { useToast } from "../../../hooks/useToast";
import type { ToastItem } from "../../../hooks/useToast";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormField } from "../../Modal";
import * as api from "../../../services/api";
import { getLicenseClasses } from "../../../data/mockData";

type TabType = "overview" | "students" | "learning" | "settings";

interface StudentData {
  id: string;
  name: string;
  email: string;
  joinDate: string;
  progress: number;
  advancement: number;
}

interface LessonData {
  id: string;
  name: string;
  completedStudents: number;
  totalStudents: number;
  averageProgress: number;
  averageGrade: number;
}

interface GroupDetailsData {
  id: string;
  name: string;
  class: string;
  status: string;
  studentCount: number;
  description: string;
  roomCode: string;
  averageGrade: string;
  totalExams: number;
  progressRate: number;
}

export default function GroupDetailsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { groupId } = useParams();
  const navigate = useNavigate();
  
  // State for API data
  const [groupDetails, setGroupDetails] = useState<api.RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const licenseClasses = getLicenseClasses();
  
  // Load group details
  useEffect(() => {
    if (groupId) {
      loadGroupDetails();
    }
  }, [groupId]);
  
  async function loadGroupDetails() {
    try {
      setLoading(true);
      const data = await api.getRoomDetail(parseInt(groupId!));
      setGroupDetails(data);
      console.log(data);
    } catch (err) {
      console.error('Failed to load group details:', err);
      navigate('/dashboard/groups');
    } finally {
      setLoading(false);
    }
  }
  
  // Transform to display format using API data
  const groupData: GroupDetailsData | null = groupDetails ? {
    id: groupDetails.room.id.toString(),
    name: groupDetails.room.name,
    class: isRTL 
      ? licenseClasses.find(c => c.code === 'B')?.nameAr.split(' - ')[0] || 'صنف B'
      : licenseClasses.find(c => c.code === 'B')?.nameFr.split(' - ')[0] || 'Catégorie B',
    status: isRTL ? "نشطة" : "Actif",
    studentCount: groupDetails.students?.length || 0,
    description: groupDetails.room.description || "",
    roomCode: `GRP-${groupDetails.room.id.toString().padStart(4, '0')}`,
    averageGrade: "0.0",
    totalExams: groupDetails.quizzes?.length || 0,
    progressRate: 0,
  } : null;
  
  const mockStudents: StudentData[] = groupDetails?.students?.map(s => ({
    id: s.membership_id.toString(),
    name: s.full_name || 'N/A',
    email: s.email || 'N/A',
    joinDate: s.joined_at.split('T')[0],
    progress: 0,
    advancement: 0,
  })) || [];
    
  const mockLessons: LessonData[] = [];
  
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [lessonSort, setLessonSort] = useState<'name' | 'progress' | 'grade'>('name');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteGroupModalOpen, setIsDeleteGroupModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [isDeleteLessonModalOpen, setIsDeleteLessonModalOpen] = useState(false);
  const [isEditLessonModalOpen, setIsEditLessonModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentData | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<StudentData | null>(null);
  const [lessonToDelete, setLessonToDelete] = useState<LessonData | null>(null);
  const [lessonToEdit, setLessonToEdit] = useState<LessonData | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [editFormData, setEditFormData] = useState({
    groupName: "",
    studentCount: 0,
    class: "",
    status: "",
    description: "",
  });
  const [editStudentFormData, setEditStudentFormData] = useState({
    name: "",
    email: "",
  });
  const [editLessonFormData, setEditLessonFormData] = useState({
    name: "",
  });
  const { success, error } = useToast({ toasts, setToasts });

  // Filter students based on search
  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleDeleteStudent = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      setStudentToDelete(student);
      setIsDeleteStudentModalOpen(true);
    }
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      console.log('Deleting student:', studentToDelete.id);
      // TODO: API call to delete student
      success(t('groups.details.students.deleted_success', 'تم حذف الطالب بنجاح'));
      setIsDeleteStudentModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleEditStudent = (studentId: string) => {
    const student = mockStudents.find(s => s.id === studentId);
    if (student) {
      setStudentToEdit(student);
      setEditStudentFormData({
        name: student.name,
        email: student.email,
      });
      setIsEditStudentModalOpen(true);
    }
  };

  const confirmEditStudent = () => {
    if (studentToEdit) {
      console.log('Updating student:', studentToEdit.id, editStudentFormData);
      success(t('groups.details.students.edit_success', 'تم تحديث الطالب بنجاح'));
      setIsEditStudentModalOpen(false);
      setStudentToEdit(null);
    }
  };

  const handleDeleteLesson = (lessonId: string) => {
    const lesson = mockLessons.find(l => l.id === lessonId);
    if (lesson) {
      setLessonToDelete(lesson);
      setIsDeleteLessonModalOpen(true);
    }
  };

  const confirmDeleteLesson = () => {
    if (lessonToDelete) {
      console.log('Deleting lesson:', lessonToDelete.id);
      success(t('groups.details.learning.deleted_success', 'تم حذف الدرس بنجاح'));
      setIsDeleteLessonModalOpen(false);
      setLessonToDelete(null);
    }
  };

  const handleEditLesson = (lessonId: string) => {
    const lesson = mockLessons.find(l => l.id === lessonId);
    if (lesson) {
      setLessonToEdit(lesson);
      setEditLessonFormData({
        name: lesson.name,
      });
      setIsEditLessonModalOpen(true);
    }
  };

  const confirmEditLesson = () => {
    if (lessonToEdit) {
      console.log('Updating lesson:', lessonToEdit.id, editLessonFormData);
      success(t('groups.details.learning.edit_success', 'تم تحديث الدرس بنجاح'));
      setIsEditLessonModalOpen(false);
      setLessonToEdit(null);
    }
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: t('groups.details.tabs.overview', 'نظرة عامة') },
    { key: "students", label: t('groups.details.tabs.students', 'الطلاب') },
    { key: "learning", label: t('groups.details.tabs.learning', 'التعلّم') },
    { key: "settings", label: t('groups.details.tabs.settings', 'الإعدادات') },
  ];

  const handleEdit = () => {
    if (!groupData) return;
    setEditFormData({
      groupName: groupData.name,
      studentCount: groupData.studentCount,
      class: groupData.class,
      status: groupData.status,
      description: groupData.description,
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    console.log('Saving edits:', editFormData);
    // TODO: API call to update group
    success(t('groups.details.edit_success', 'تم تحديث المجموعة بنجاح'));
    setIsEditModalOpen(false);
  };

  const handleDeleteGroup = () => {
    setIsDeleteGroupModalOpen(true);
  };

  const confirmDeleteGroup = () => {
    if (!groupData) return;
    if (deletePassword === groupData.roomCode) {
      console.log('Deleting group:', groupId);
      // TODO: API call to delete group
      success(t('groups.details.deleted_success', 'تم حذف المجموعة بنجاح'));
      setIsDeleteGroupModalOpen(false);
      setDeletePassword("");
      navigate('/dashboard/groups');
    } else {
      error(t('groups.details.delete_error', 'كلمة السر غير صحيحة'));
    }
  };

  const handleBack = () => {
    navigate('/dashboard/groups');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">{t('common.loading', 'جاري التحميل...')}</div>
      </div>
    );
  }

  if (!groupData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">{t('common.notFound', 'المجموعة غير موجودة')}</div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      
      {/* Edit Group Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} size="md">
        <ModalHeader
          title={t('groups.details.edit_modal.title', 'تعديل معلومات المجموعة')}
          subtitle={t('groups.details.edit_modal.subtitle', 'قم بتغيير معلومات المجموعة')}
          onClose={() => setIsEditModalOpen(false)}
          type="standard"
        />
        <ModalBody>
          <FormField
            label={t('groups.details.edit_modal.group_name', 'اسم المجموعة')}
            name="groupName"
            value={editFormData.groupName}
            onChange={(val) => setEditFormData({ ...editFormData, groupName: val })}
            placeholder={t('groups.details.edit_modal.group_name_placeholder', 'المجموعة 10')}
          />
          <FormField
            label={t('groups.details.edit_modal.student_count', 'عدد التلاميذ')}
            name="studentCount"
            type="number"
            value={editFormData.studentCount}
            onChange={(val) => setEditFormData({ ...editFormData, studentCount: val })}
            placeholder="23"
          />
          <FormField
            label={t('groups.details.edit_modal.class', 'الصنف')}
            name="class"
            type="select"
            value={editFormData.class}
            onChange={(val) => setEditFormData({ ...editFormData, class: val })}
            options={[
              t('groups.modal.class_a'),
              t('groups.modal.class_b'),
              t('groups.modal.class_c'),
            ]}
          />
          <FormField
            label={t('groups.details.edit_modal.status', 'الحالة')}
            name="status"
            type="select"
            value={editFormData.status}
            onChange={(val) => setEditFormData({ ...editFormData, status: val })}
            options={[
              t('groups.details.edit_modal.status_open', 'مفتوحة'),
              t('groups.details.edit_modal.status_closed', 'مغلقة'),
            ]}
          />
          <FormField
            label={t('groups.details.edit_modal.description', 'وصف المجموعة')}
            name="description"
            type="textarea"
            value={editFormData.description}
            onChange={(val) => setEditFormData({ ...editFormData, description: val })}
            placeholder={t('groups.details.edit_modal.description_placeholder', 'كان ضم روسيا للقرم رسالة تحذير من المدرسة الواقعية مما سوف يأتي...')}
            rows={4}
          />
        </ModalBody>
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => setIsEditModalOpen(false)}
          >
            {t('groups.details.edit_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSaveEdit}
          >
            {t('groups.details.edit_modal.save', 'حفظ التغييرات')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Group Modal */}
      <Modal isOpen={isDeleteGroupModalOpen} onClose={() => setIsDeleteGroupModalOpen(false)} size="sm">
        <ModalHeader
          title={t('groups.details.delete_modal.title', 'هل أنت متأكد من حذف المجموعة ؟')}
          subtitle={t('groups.details.delete_modal.subtitle', 'بمجرد تأكيد الحذف لن تتمكن من استرجاع المجموعة !')}
          onClose={() => setIsDeleteGroupModalOpen(false)}
          type="error"
        />
        <ModalBody>
          <FormField
            label={t('groups.details.delete_modal.password_label', 'أدخل كلمة السّر')}
            name="deletePassword"
            type="text"
            value={deletePassword}
            onChange={(val) => setDeletePassword(val)}
            placeholder={t('groups.details.delete_modal.password_placeholder', 'كلمة السر')}
          />
        </ModalBody>
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => {
              setIsDeleteGroupModalOpen(false);
              setDeletePassword("");
            }}
          >
            {t('groups.details.delete_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-danger"
            onClick={confirmDeleteGroup}
          >
            {t('groups.details.delete_modal.delete', 'حذف المجموعة')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Student Modal */}
      <Modal isOpen={isDeleteStudentModalOpen} onClose={() => setIsDeleteStudentModalOpen(false)} size="sm">
        <ModalHeader
          title={t('groups.details.students.delete_modal.title', 'حذف الطالب {name} ؟').replace('{name}', studentToDelete?.name || '')}
          subtitle={t('groups.details.students.delete_modal.subtitle', 'بمجرد تأكيد الحذف لن تتمكن من استرجاع معلومات الطالب !')}
          onClose={() => setIsDeleteStudentModalOpen(false)}
          type="error"
        />
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => {
              setIsDeleteStudentModalOpen(false);
              setStudentToDelete(null);
            }}
          >
            {t('groups.details.students.delete_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-danger"
            onClick={confirmDeleteStudent}
          >
            {t('groups.details.students.delete_modal.delete', 'حذف الطالب')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Student Modal */}
      <Modal isOpen={isEditStudentModalOpen} onClose={() => setIsEditStudentModalOpen(false)} size="md">
        <ModalHeader
          title={t('groups.details.students.edit_modal.title', 'تعديل معلومات الطالب')}
          subtitle={t('groups.details.students.edit_modal.subtitle', 'قم بتحديث معلومات الطالب')}
          onClose={() => setIsEditStudentModalOpen(false)}
          type="standard"
        />
        <ModalBody className="">
          <FormField
            label={t('groups.details.students.edit_modal.name', 'اسم الطالب')}
            name="studentName"
            value={editStudentFormData.name}
            onChange={(val) => setEditStudentFormData({ ...editStudentFormData, name: val })}
            placeholder={t('groups.details.students.edit_modal.name_placeholder', 'شفوان زكرياء')}
          />
          <FormField
            label={t('groups.details.students.edit_modal.email', 'البريد الإلكتروني')}
            name="studentEmail"
            type="text"
            value={editStudentFormData.email}
            onChange={(val) => setEditStudentFormData({ ...editStudentFormData, email: val })}
            placeholder={t('groups.details.students.edit_modal.email_placeholder', 'student@example.com')}
          />
        </ModalBody>
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => {
              setIsEditStudentModalOpen(false);
              setStudentToEdit(null);
            }}
          >
            {t('groups.details.students.edit_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-primary"
            onClick={confirmEditStudent}
          >
            {t('groups.details.students.edit_modal.save', 'حفظ التغييرات')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Lesson Modal */}
      <Modal isOpen={isDeleteLessonModalOpen} onClose={() => setIsDeleteLessonModalOpen(false)} size="sm" className="bg-red-200">
        <ModalHeader
          title={t('groups.details.learning.delete_modal.title', 'حذف الدرس {name} ؟').replace('{name}', lessonToDelete?.name || '')}
          subtitle={t('groups.details.learning.delete_modal.subtitle', 'بمجرد تأكيد الحذف لن تتمكن من استرجاع معلومات الدرس !')}
          onClose={() => setIsDeleteLessonModalOpen(false)}
          type="standard"
        />
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => {
              setIsDeleteLessonModalOpen(false);
              setLessonToDelete(null);
            }}
          >
            {t('groups.details.learning.delete_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-danger"
            onClick={confirmDeleteLesson}
          >
            {t('groups.details.learning.delete_modal.delete', 'حذف الدرس')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Lesson Modal */}
      <Modal isOpen={isEditLessonModalOpen} onClose={() => setIsEditLessonModalOpen(false)} size="md">
        <ModalHeader
          title={t('groups.details.learning.edit_modal.title', 'تعديل معلومات الدرس')}
          subtitle={t('groups.details.learning.edit_modal.subtitle', 'قم بتحديث معلومات الدرس')}
          onClose={() => setIsEditLessonModalOpen(false)}
          type="standard"
        />
        <ModalBody>
          <FormField
            label={t('groups.details.learning.edit_modal.name', 'اسم الدرس')}
            name="lessonName"
            value={editLessonFormData.name}
            onChange={(val) => setEditLessonFormData({ ...editLessonFormData, name: val })}
            placeholder={t('groups.details.learning.edit_modal.name_placeholder', 'علامات الطريق')}
          />
        </ModalBody>
        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => {
              setIsEditLessonModalOpen(false);
              setLessonToEdit(null);
            }}
          >
            {t('groups.details.learning.edit_modal.cancel', 'إلغاء')}
          </button>
          <button
            className="btn-primary"
            onClick={confirmEditLesson}
          >
            {t('groups.details.learning.edit_modal.save', 'حفظ التغييرات')}
          </button>
        </ModalFooter>
      </Modal>

      <div className={`flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {loading || !groupData ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">{t('common.loading', 'جاري التحميل...')}</div>
        </div>
      ) : (
        <>
      {/* Header with Back Button */}
      <div className="mb-6 sm:mb-8">
        <button
          onClick={handleBack}
          className={`flex items-center  group gap-2 text-gray-500 hover:text-primary-800 transition-colors mb-4 cursor-pointer ${isRTL ? 'flex-row' : 'flex-row'}`}
        >
          <img
            src="/assets/icons/dashboard/groups/arrow_down_table.svg"
            alt="back"
            className={`w-4 h-4 group-hover:hidden ${isRTL ? 'rotate-90' : '-rotate-90'}`}
          />
           <img
            src="/assets/icons/dashboard/groups/arrow_down.svg"
            alt="back"
            className={`w-4 h-4 hidden group-hover:block ${isRTL ? 'rotate-90' : '-rotate-90'}`}
          />
          <span className="text-md font-medium">{t('groups.details.back', 'رجوع')}</span>
        </button>
        
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
          {groupData.name}
        </h1>
        <p className="text-grey text-base sm:text-lg">
          {t('groups.details.subtitle', 'قم بإدارة المجموعة والطلاب')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard
          icon="/assets/icons/dashboard/groups/multi-person.svg"
          label={t('groups.details.stats.student_count', 'عدد الطلاب')}
          value={groupData.studentCount.toString()}
          bgColor="bg-green/10"
        />
        <StatsCard
          icon="/assets/icons/dashboard/groups/graphup.svg"
          label={t('groups.details.stats.progress_rate', 'معدل التقدّم')}
          value={`${groupData.progressRate}%`}
          bgColor="bg-primary-100"
        />
        <StatsCard
          icon="/assets/icons/dashboard/groups/checkbox_yellow.svg"
          label={t('groups.details.stats.total_exams', 'إجمالي الإمتحانات')}
          value={groupData.totalExams.toString()}
          bgColor="bg-yellow/10"
        />
        <StatsCard
          icon="/assets/icons/dashboard/groups/edit_red.svg"
          label={t('groups.details.stats.average_grade', 'متوسط الدرجات')}
          value={groupData.averageGrade}
          bgColor="bg-red/10"
        />
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className={`flex gap-1 sm:gap-2 flex-row overflow-x-auto`}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`
                px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold whitespace-nowrap
                transition-all duration-200 border-b-2
                ${activeTab === tab.key
                  ? 'text-primary-800 border-primary-800'
                  : 'text-grey border-transparent hover:text-primary-600'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="bg-primary-25 rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-primary-800">
              {t('groups.details.group_info', 'معلومات المجموعة')}
            </h2>
            <button
              onClick={handleEdit}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base text-grey bg-gray-50 cursor-pointer hover:bg-gray-200 rounded-lg transition-colors ${isRTL ? 'flex-row' : 'flex-row'}`}
            >
              <img
                src="/assets/icons/dashboard/groups/edit_gray.svg"
                alt="edit"
                className="w-4 h-4 sm:w-5 sm:h-5"
              />
              <span className="font-semibold">{t('groups.details.edit', 'تعديل')}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Group Name */}
            <div>
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.group_name', 'اسم المجموعة')}
              </label>
              <p className="text-base sm:text-lg font-medium text-primary-800">
                {groupData.name}
              </p>
            </div>

            {/* Class */}
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.class', 'الصف')}
              </label>
              <p className="text-base sm:text-lg font-medium text-primary-800">
                {groupData.class}
              </p>
            </div>

            {/* Status */}
            <div>
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.status', 'الحالة')}
              </label>
              <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold bg-red/10 text-red">
                {groupData.status}
              </span>
            </div>

            {/* Student Count */}
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.student_count', 'عدد التلاميذ')}
              </label>
              <p className="text-base sm:text-lg font-medium text-primary-800">
                {groupData.studentCount}
              </p>
            </div>

            {/* Room Code */}
            <div className="">
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.room_code', 'كود الغرفة')}
              </label>
              <div className={`flex items-center gap-3 flex-row`}>
                <div className="flex items-center gap-2 px-4 py-2 bg-primary-25 rounded-lg">
                  <span className="text-lg font-bold text-primary-800">{groupData.roomCode}</span>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(groupData.roomCode);
                    success(t('groups.details.code_copied', 'تم نسخ الكود بنجاح'));
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t('groups.details.copy_code', 'نسخ الكود')}
                >
                  <img
                    src="/assets/icons/dashboard/groups/Copy.svg"
                    alt="copy"
                    className="w-5 h-5"
                  />
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-lg font-semibold text-grey mb-2">
                {t('groups.details.fields.description', 'وصف المجموعة')}
              </label>
              <p className="text-base text-primary-800 leading-relaxed p-4 bg-primary-25 rounded-lg">
                {groupData.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === "students" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder={t('groups.details.students.search_placeholder', 'البحث عن طالب')}
                className={`
                  w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl
                  text-grey placeholder-gray-400 outline-none
                  focus:border-primary-300 focus:ring-2 focus:ring-primary-100
                  transition-all duration-200
                  ${isRTL ? 'text-right pr-4 pl-12' : 'text-left pl-4 pr-12'}
                `}
              />
              <img
                src="/assets/icons/dashboard/groups/search.svg"
                alt="search"
                className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-grey ${isRTL ? 'left-4' : 'right-4'}`}
              />
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.name', 'الاسم')}
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.join_date', 'تاريخ الانضمام')}
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.email', 'البريد الإلكتروني')}
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.progress', 'التقدم')}
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.advancement', 'التعدّل')}
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.students.table.actions', 'الإجراءات')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className={`px-4 py-4 text-grey font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {student.name}
                    </td>
                    <td className={`px-4 py-4 text-grey ${isRTL ? 'text-right' : 'text-left'}`}>
                      {isRTL 
                        ? new Date(student.joinDate).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date(student.joinDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className={`px-4 py-4 text-grey ${isRTL ? 'text-right' : 'text-left'}`}>
                      {student.email}
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-grey min-w-[40px]">{student.progress}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                          <div
                            className="bg-primary-300 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-grey min-w-[40px]">{student.advancement}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                          <div
                            className="bg-primary-300 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${student.advancement}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row justify-end' : 'flex-row'}`}>
                        <button
                          onClick={() => handleEditStudent(student.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('groups.details.students.edit', 'تعديل')}
                        >
                          <img
                            src="/assets/icons/dashboard/groups/Edit_Pencil_01.svg"
                            alt="edit"
                            className="w-5 h-5 min-w-5"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('groups.details.students.delete', 'حذف')}
                        >
                          <img
                            src="/assets/icons/dashboard/groups/trash.svg"
                            alt="delete"
                            className="w-5 h-5 min-w-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-grey">
                {t('groups.details.students.no_results', 'لا توجد نتائج')}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "learning" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {/* Lessons Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button 
                      onClick={() => setLessonSort('name')}
                      className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}
                    >
                      {t('groups.details.learning.table.lesson', 'الدرس')}
                      <img 
                        src="/assets/icons/dashboard/groups/arrow_down_table.svg" 
                        alt="sort"
                        className={`w-3 h-3 transition-transform ${lessonSort === 'name' ? '' : 'opacity-50'}`}
                      />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button 
                      onClick={() => setLessonSort('progress')}
                      className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}
                    >
                      {t('groups.details.learning.table.completed_students', 'عدد الطلاب المكملين')}
                      <img 
                        src="/assets/icons/dashboard/groups/arrow_down_table.svg" 
                        alt="sort"
                        className={`w-3 h-3 transition-transform ${lessonSort === 'progress' ? '' : 'opacity-50'}`}
                      />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button 
                      onClick={() => setLessonSort('progress')}
                      className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}
                    >
                      {t('groups.details.learning.table.progress', 'التقدم')}
                      <img 
                        src="/assets/icons/dashboard/groups/arrow_down_table.svg" 
                        alt="sort"
                        className={`w-3 h-3 transition-transform ${lessonSort === 'progress' ? '' : 'opacity-50'}`}
                      />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    <button 
                      onClick={() => setLessonSort('grade')}
                      className={`flex items-center gap-2 ${isRTL ? 'flex-row' : 'flex-row'}`}
                    >
                      {t('groups.details.learning.table.average_grade', 'متوسط الدرجات')}
                      <img 
                        src="/assets/icons/dashboard/groups/arrow_down_table.svg" 
                        alt="sort"
                        className={`w-3 h-3 transition-transform ${lessonSort === 'grade' ? '' : 'opacity-50'}`}
                      />
                    </button>
                  </th>
                  <th className={`px-4 py-3 text-sm font-semibold text-grey uppercase ${isRTL ? 'text-right' : 'text-left'}`}>
                    {t('groups.details.learning.table.actions', 'الإجراءات')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockLessons.map((lesson) => (
                  <tr key={lesson.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className={`px-4 py-4 text-grey font-medium ${isRTL ? 'text-right' : 'text-left'}`}>
                      {lesson.name}
                    </td>
                    <td className={`px-4 py-4 text-grey ${isRTL ? 'text-right' : 'text-left'}`}>
                      {lesson.completedStudents}
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-grey min-w-[40px]">{lesson.averageProgress}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                          <div
                            className="bg-primary-300 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.averageProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <span className="text-sm font-semibold text-grey min-w-[40px]">{lesson.averageGrade}%</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[100px]">
                          <div
                            className="bg-primary-300 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${lesson.averageGrade}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className={`px-4 py-4 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-2 ${isRTL ? 'flex-row justify-end' : 'flex-row'}`}>
                        <button
                          onClick={() => handleEditLesson(lesson.id)}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('groups.details.learning.edit', 'تعديل')}
                        >
                          <img
                            src="/assets/icons/dashboard/groups/Edit_Pencil_01.svg"
                            alt="edit"
                            className="w-5 h-5 min-w-5"
                          />
                        </button>
                        <button
                          onClick={() => handleDeleteLesson(lesson.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('groups.details.learning.delete', 'حذف')}
                        >
                          <img
                            src="/assets/icons/dashboard/groups/trash.svg"
                            alt="delete"
                            className="w-5 h-5 min-w-5"
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {mockLessons.length === 0 && (
              <div className="text-center py-12 text-grey">
                {t('groups.details.learning.no_lessons', 'لا توجد دروس')}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-primary-800 mb-4">
            {t('groups.details.tabs.settings', 'الإعدادات')}
          </h2>
          <p className="text-grey">
            {t('groups.details.settings_placeholder', 'إعدادات المجموعة سيتم عرضها هنا')}
          </p>
        </div>
      )}
        </>
      )}
      </div>
    </>
  );
}