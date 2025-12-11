import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import StatsCard from "./StatsCard";
import SearchBar from "./SearchBar";
import FilterSelect from "./FilterSelect";
import Table from "./Table";
import type { ColumnProps } from "./Table";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormField } from "../../Modal";
import SortableHeader from "./SortableHeader";
import type { SortDirection } from "./SortableHeader";
import { ToastContainer } from "../../Toast";
import { useToast } from "../../../hooks/useToast";
import type { ToastItem } from "../../../hooks/useToast";
import AssignQuizToGroupModal from "./Modals/AssignQuizToGroupModal";
import * as api from "../../../services/api";
import { getLicenseClasses } from "../../../data/mockData";

interface GroupData {
  id: string;
  name: string;
  createdAt: string;
  roomCode: string;
  class: string;
  roomType: 'a' | 'b' | 'c' | 'd';
  topic: string;
  description: string;
  progress: number;
}

export default function GroupsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const { success, error: showError } = useToast({ toasts, setToasts });

  // State for API data
  const [groups, setGroups] = useState<api.Room[]>([]);
  const [stats, setStats] = useState<api.DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);
  const licenseClasses = getLicenseClasses();

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [roomsData, statsData] = await Promise.all([
        api.getRooms(),
        api.getDashboardStats()
      ]);
      setGroups(roomsData);
      setStats(statsData);
    } catch (err: any) {
      showError(err.message || t('common.loadError', 'فشل تحميل البيانات'));
    } finally {
      setLoading(false);
    }
  }

  // Transform groups to display format
  const mockGroups: GroupData[] = groups.map(g => ({
    id: g.id.toString(),
    name: g.name,
    createdAt: g.created_at.split('T')[0],
    roomCode: `GRP-${g.id.toString().padStart(4, '0')}`,
    roomType: g.room_type || 'b',
    class: isRTL 
      ? licenseClasses.find(c => c.code === (g.room_type || 'b').toUpperCase())?.nameAr.split(' - ')[0] || 'صنف B'
      : licenseClasses.find(c => c.code === (g.room_type || 'b').toUpperCase())?.nameFr.split(' - ')[0] || 'Catégorie B',
    topic: g.description || t('groups.no_topic', 'لا يوجد موضوع'),
    description: g.description || '',
    progress: 0,
  }));

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState(t('groups.all_classes'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignQuizModalOpen, setIsAssignQuizModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [formData, setFormData] = useState({
    groupName: "",
    studentCount: 25,
    class: t('groups.modal.class_b'),
    description: "",
  });

  // Filter options
  const filterOptions = [
    t('groups.all_classes'),
    t('groups.modal.class_a'),
    t('groups.modal.class_b'),
    t('groups.modal.class_c'),
  ];

  // Sorting handlers
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      // Cycle through: asc -> desc -> null
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Table columns
  const columns: ColumnProps<GroupData>[] = [
    {
      key: "name",
      label: t('groups.table.group'),
      type: "text",
    },
    {
      key: "createdAt",
      label: (
        <SortableHeader
          label={t('groups.table.creation_date')}
          sortable={true}
          singleArrow={true}
          currentSort={sortColumn === 'createdAt' ? sortDirection : null}
          onSort={() => handleSort('createdAt')}
        />
      ),
      type: "date",
      render: (item) => {
        const date = new Date(item.createdAt);
        return (
          <span className="text-grey">
            {isRTL 
              ? date.toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
              : date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        );
      },
    },
    {
      key: "roomCode",
      label: t('groups.table.room_code'),
      type: "badge",
      render: (item) => (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-primary-100 text-primary-800">
            {item.roomCode}
          </span>
          <button
            onClick={() => handleCopyCode(item.roomCode)}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            title={isRTL ? 'نسخ الكود' : 'Copier le code'}
          >
            <img src="/assets/icons/dashboard/groups/Copy.svg" alt="copy" className="w-4 h-4 max-w-4" />
          </button>
        </div>
      ),
    },
    {
      key: "class",
      label: (
        <SortableHeader
          label={t('groups.table.class')}
          filterIcon={true}
          onFilter={() => {
            // TODO: Open class filter modal
            console.log('Filter by class');
          }}
        />
      ),
      type: "text",
    },
    {
      key: "topic",
      label: t('groups.table.topic'),
      type: "text",
    },
    {
      key: "progress",
      label: (
        <SortableHeader
          label={t('groups.table.progress')}
          sortable={true}
          currentSort={sortColumn === 'progress' ? sortDirection : null}
          onSort={() => handleSort('progress')}
        />
      ),
      type: "percent",
    },
    {
      key: "actions",
      label: t('groups.table.actions'),
      type: "actions",
      render: (item) => (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
          <button
            onClick={() => handleAssignQuiz(item.id)}
            className="p-2 hover:bg-primary-50 rounded-lg transition-colors group"
            title={isRTL ? 'تعيين اختبار' : 'Assigner un quiz'}
          >
            <img 
              src="/assets/icons/dashboard/groups/add.svg" 
              alt="assign quiz" 
              className="w-5 h-5 max-w-5"
            />
          </button>
          <button
            onClick={() => handleEditGroup(item.id)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title={isRTL ? 'تعديل' : 'Modifier'}
          >
            <img 
              src="/assets/icons/dashboard/groups/Edit_Pencil_01.svg" 
              alt="edit" 
              className="w-5 h-5 max-w-5"
            />
          </button>
          <button
            onClick={() => handleDeleteGroup(item.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title={isRTL ? 'حذف' : 'Supprimer'}
          >
            <img 
              src="/assets/icons/dashboard/groups/trash.svg" 
              alt="delete" 
              className="w-5 h-5 max-w-5"
            />
          </button>
        </div>
      ),
    },
  ];

  // Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    success(t('groups.code_copied', 'تم نسخ الكود بنجاح'));
  };

  const handleAssignQuiz = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setIsAssignQuizModalOpen(true);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      setGroupToDelete(group);
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      setIsSubmitting(true);
      await api.deleteRoom(parseInt(groupToDelete.id));
      success(t('groups.delete_success', 'تم حذف المجموعة بنجاح'));
      setIsDeleteModalOpen(false);
      setGroupToDelete(null);
      loadData(); // Refresh the list
    } catch (err: any) {
      showError(err.message || t('groups.delete_error', 'فشل حذف المجموعة'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGroup = () => {
    setFormData({
      groupName: "",
      studentCount: 25,
      class: t('groups.modal.class_b'),
      description: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleSubmitCreate = async () => {
    if (!formData.groupName.trim()) {
      showError(t('groups.name_required', 'اسم المجموعة مطلوب'));
      return;
    }

    try {
      setIsSubmitting(true);
      // Map class selection to room_type
      const roomTypeMap: Record<string, 'a' | 'b' | 'c' | 'd'> = {
        [t('groups.modal.class_a')]: 'a',
        [t('groups.modal.class_b')]: 'b',
        [t('groups.modal.class_c')]: 'c',
      };
      
      await api.createRoom({
        name: formData.groupName,
        description: formData.description || null,
        room_type: roomTypeMap[formData.class] || 'b',
      });
      
      success(t('groups.create_success', 'تم إنشاء المجموعة بنجاح'));
      setIsCreateModalOpen(false);
      setFormData({
        groupName: "",
        studentCount: 25,
        class: t('groups.modal.class_b'),
        description: "",
      });
      loadData(); // Refresh the list
    } catch (err: any) {
      showError(err.message || t('groups.create_error', 'فشل إنشاء المجموعة'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditGroup = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setFormData({
        groupName: group.name,
        studentCount: 25,
        class: group.class,
        description: group.description,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedGroup || !formData.groupName.trim()) {
      showError(t('groups.name_required', 'اسم المجموعة مطلوب'));
      return;
    }

    try {
      setIsSubmitting(true);
      // Map class selection to room_type
      const roomTypeMap: Record<string, 'a' | 'b' | 'c' | 'd'> = {
        [t('groups.modal.class_a')]: 'a',
        [t('groups.modal.class_b')]: 'b',
        [t('groups.modal.class_c')]: 'c',
      };
      
      await api.updateRoom(parseInt(selectedGroup.id), {
        name: formData.groupName,
        description: formData.description || null,
        room_type: roomTypeMap[formData.class] || 'b',
      });
      
      success(t('groups.update_success', 'تم تحديث المجموعة بنجاح'));
      setIsEditModalOpen(false);
      setSelectedGroup(null);
      loadData(); // Refresh the list
    } catch (err: any) {
      showError(err.message || t('groups.update_error', 'فشل تحديث المجموعة'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and sort data
  let filteredGroups = mockGroups.filter((group) => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterValue === t('groups.all_classes') || group.class === filterValue;
    return matchesSearch && matchesFilter;
  });

  // Apply sorting
  if (sortColumn && sortDirection) {
    filteredGroups = [...filteredGroups].sort((a, b) => {
      let aValue: any = a[sortColumn as keyof GroupData];
      let bValue: any = b[sortColumn as keyof GroupData];

      // Handle different data types
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Date sorting (ISO format YYYY-MM-DD)
      if (sortColumn === 'createdAt') {
        const dateA = new Date(aValue).getTime();
        const dateB = new Date(bValue).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      return 0;
    });
  }

  return (
    <>
      <ToastContainer toasts={toasts} onRemove={(id) => setToasts(prev => prev.filter(t => t.id !== id))} />
      <div className={`flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
          {t('groups.title')}
        </h1>
        <p className="text-grey text-base sm:text-lg">
          {t('groups.subtitle')}
        </p>
      </div>

      {/* Create Group Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateGroup}
          className="btn-primary w-full sm:w-auto"
        >
          {t('groups.create_group')}
        </button>
      </div>

      {/* Stats Cards */}
      {loading || !stats ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">{t('common.loading', 'جاري التحميل...')}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            icon="/assets/icons/dashboard/groups/multi-person.svg"
            label={t('groups.stats.groups_count')}
            value={(stats?.total_rooms ?? 0).toString()}
            bgColor="bg-green/10"
          />
          <StatsCard
            icon="/assets/icons/dashboard/groups/one-person.svg"
            label={t('groups.stats.students_count')}
            value={(stats?.total_students ?? 0).toString()}
            bgColor="bg-red/10"
          />
          <StatsCard
            icon="/assets/icons/dashboard/groups/graphup.svg"
            label={t('groups.stats.progress_rate')}
            value={mockGroups.length > 0 ? `${Math.round(mockGroups.reduce((sum, g) => sum + g.progress, 0) / mockGroups.length)}%` : '0%'}
            bgColor="bg-primary-100"
          />
        </div>
      )}

   
      {/* Search and Filter */}
      <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 `}>
        <SearchBar
          placeholder={t('groups.search_placeholder')}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          options={filterOptions}
          value={filterValue}
          onChange={setFilterValue}
        />
      </div>

      {/* Groups Count Header */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-primary-800">
          {t('groups.all_groups')} ({filteredGroups.length})
        </h2>
        <p className="text-grey text-xs sm:text-sm mt-1">
          {t('groups.manage_description')}
        </p>
      </div>

      {/* Table */}
      <Table<GroupData>
        columns={columns}
        data={filteredGroups}
        rowKey="id"
        onRowClick={(group) => navigate(`/dashboard/groups/${group.id}`)}
      />

      {/* Create Group Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="md"
      >
        <ModalHeader
          title={t('groups.modal.create_title')}
          subtitle={t('groups.modal.create_subtitle')}
          onClose={() => setIsCreateModalOpen(false)}
          type="standard"
        />

        <ModalBody>
          <FormField
            label={t('groups.modal.group_name')}
            name="groupName"
            type="text"
            placeholder={t('groups.modal.group_name_placeholder')}
            value={formData.groupName}
            onChange={(val) => setFormData({ ...formData, groupName: val })}
            required
          />

          <FormField
            label={t('groups.modal.student_count')}
            name="studentCount"
            type="number"
            placeholder="25"
            value={formData.studentCount}
            onChange={(val) => setFormData({ ...formData, studentCount: val })}
            required
          />

          <FormField
            label={t('groups.modal.class')}
            name="class"
            type="select"
            options={[
              t('groups.modal.class_a'),
              t('groups.modal.class_b'),
              t('groups.modal.class_c'),
            ]}
            value={formData.class}
            onChange={(val) => setFormData({ ...formData, class: val })}
            required
          />

          <FormField
            label={t('groups.modal.description')}
            name="description"
            type="textarea"
            placeholder={t('groups.modal.description_placeholder')}
            rows={4}
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
          />
        </ModalBody>

        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => setIsCreateModalOpen(false)}
            disabled={isSubmitting}
          >
            {t('groups.modal.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmitCreate}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving', 'جاري الحفظ...') : t('groups.modal.add_group')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        size="md"
      >
        <ModalHeader
          title={t('groups.modal.edit_title')}
          subtitle={t('groups.modal.edit_subtitle')}
          onClose={() => setIsEditModalOpen(false)}
          type="standard"
        />

        <ModalBody>
          <FormField
            label={t('groups.modal.group_name')}
            name="groupName"
            type="text"
            placeholder={t('groups.modal.group_name_placeholder')}
            value={formData.groupName}
            onChange={(val) => setFormData({ ...formData, groupName: val })}
            required
          />

          <FormField
            label={t('groups.modal.student_count')}
            name="studentCount"
            type="number"
            placeholder="25"
            value={formData.studentCount}
            onChange={(val) => setFormData({ ...formData, studentCount: val })}
            required
          />

          <FormField
            label={t('groups.modal.class')}
            name="class"
            type="select"
            options={[
              t('groups.modal.class_a'),
              t('groups.modal.class_b'),
              t('groups.modal.class_c'),
            ]}
            value={formData.class}
            onChange={(val) => setFormData({ ...formData, class: val })}
            required
          />

          <FormField
            label={t('groups.modal.description')}
            name="description"
            type="textarea"
            placeholder={t('groups.modal.description_placeholder')}
            rows={4}
            value={formData.description}
            onChange={(val) => setFormData({ ...formData, description: val })}
          />
        </ModalBody>

        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => setIsEditModalOpen(false)}
            disabled={isSubmitting}
          >
            {t('groups.modal.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmitEdit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.saving', 'جاري الحفظ...') : t('groups.modal.update_group')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        size="sm"
      >
        <ModalHeader
          title={t('groups.modal.delete_title', 'حذف المجموعة')}
          subtitle={t('groups.modal.delete_subtitle', 'هل أنت متأكد من حذف هذه المجموعة؟')}
          onClose={() => setIsDeleteModalOpen(false)}
          type="standard"
        />

        <ModalBody>
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <img 
                src="/assets/icons/dashboard/groups/trash.svg" 
                alt="delete" 
                className="w-8 h-8"
              />
            </div>
            <p className="text-gray-600">
              {t('groups.modal.delete_warning', 'سيتم حذف المجموعة')} <strong>{groupToDelete?.name}</strong> {t('groups.modal.delete_warning_end', 'نهائياً. هذا الإجراء لا يمكن التراجع عنه.')}
            </p>
          </div>
        </ModalBody>

        <ModalFooter>
          <button
            className="btn-secondary"
            onClick={() => setIsDeleteModalOpen(false)}
            disabled={isSubmitting}
          >
            {t('groups.modal.cancel')}
          </button>
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            onClick={handleConfirmDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? t('common.deleting', 'جاري الحذف...') : t('groups.modal.confirm_delete', 'حذف')}
          </button>
        </ModalFooter>
      </Modal>

      {/* Assign Quiz Modal */}
      {selectedGroup && (
        <AssignQuizToGroupModal
          isOpen={isAssignQuizModalOpen}
          onClose={() => {
            setIsAssignQuizModalOpen(false);
            setSelectedGroup(null);
          }}
          groupId={parseInt(selectedGroup.id)}
          groupName={selectedGroup.name}
          onSuccess={() => {
            success(t('groups.assignQuiz.success', 'تم تعيين الامتحان بنجاح'));
            loadData();
          }}
        />
      )}
      </div>
    </>
  );
}
