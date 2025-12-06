import { useState } from "react";
import { useTranslation } from "react-i18next";
import StatsCard from "./StatsCard";
import SearchBar from "./SearchBar";
import FilterSelect from "./FilterSelect";
import Table from "./Table";
import type { ColumnProps } from "./Table";
import { Modal, ModalHeader, ModalBody, ModalFooter, FormField } from "../../Modal";
import SortableHeader from "./SortableHeader";
import type { SortDirection } from "./SortableHeader";

interface GroupData {
  id: string;
  name: string;
  createdAt: string;
  roomCode: string;
  class: string;
  topic: string;
  progress: number;
}

export default function GroupsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState(t('groups.all_classes'));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [formData, setFormData] = useState({
    groupName: "",
    studentCount: 25,
    class: t('groups.modal.class_b'),
    description: "",
  });

  // Mock Data
  const mockGroups: GroupData[] = [
    {
      id: "1",
      name: "المجموعة 01",
      createdAt: "2025-06-19",
      roomCode: "8oc882",
      class: t('groups.modal.class_b'),
      topic: "أولويات المرور",
      progress: 23,
    },
    {
      id: "2",
      name: "المجموعة 02",
      createdAt: "2025-05-15",
      roomCode: "7xk291",
      class: t('groups.modal.class_a'),
      topic: "إشارات المرور",
      progress: 67,
    },
    {
      id: "3",
      name: "المجموعة 03",
      createdAt: "2025-07-10",
      roomCode: "9pl442",
      class: t('groups.modal.class_c'),
      topic: "قواعد الطريق",
      progress: 45,
    },
    {
      id: "4",
      name: "المجموعة 04",
      createdAt: "2025-04-22",
      roomCode: "6nm113",
      class: t('groups.modal.class_b'),
      topic: "السلامة المرورية",
      progress: 89,
    },
    {
      id: "5",
      name: "المجموعة 05",
      createdAt: "2025-08-03",
      roomCode: "5rt774",
      class: t('groups.modal.class_a'),
      topic: "الوقوف والركن",
      progress: 12,
    },
    {
      id: "6",
      name: "المجموعة 06",
      createdAt: "2025-03-18",
      roomCode: "4jk556",
      class: t('groups.modal.class_c'),
      topic: "الملاحة الحضرية",
      progress: 34,
    },
    {
      id: "7",
      name: "المجموعة 07",
      createdAt: "2025-09-25",
      roomCode: "3bh887",
      class: t('groups.modal.class_b'),
      topic: "القيادة الليلية",
      progress: 78,
    },
  ];

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
            <img src="/assets/icons/dashboard/groups/Copy.svg" alt="copy" className="w-4 h-4" />
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
              className="w-5 h-5"
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
              className="w-5 h-5"
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
              className="w-5 h-5"
            />
          </button>
        </div>
      ),
    },
  ];

  // Handlers
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    // TODO: Add toast notification
    console.log('Code copied:', code);
  };

  const handleAssignQuiz = (groupId: string) => {
    console.log('Assign quiz to group:', groupId);
    // TODO: Open modal to assign quiz
  };

  const handleDeleteGroup = (groupId: string) => {
    console.log('Delete group:', groupId);
    // TODO: Show confirmation dialog
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

  const handleSubmitCreate = () => {
    console.log('Creating group with data:', formData);
    // TODO: API call to create group
    setIsCreateModalOpen(false);
    // Reset form
    setFormData({
      groupName: "",
      studentCount: 25,
      class: t('groups.modal.class_b'),
      description: "",
    });
  };

  const handleEditGroup = (groupId: string) => {
    const group = mockGroups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
      setFormData({
        groupName: group.name,
        studentCount: 25, // Mock data doesn't have this field
        class: group.class,
        description: "", // Mock data doesn't have this field
      });
      setIsEditModalOpen(true);
    }
  };

  const handleSubmitEdit = () => {
    console.log('Updating group:', selectedGroup?.id, 'with data:', formData);
    // TODO: API call to update group
    setIsEditModalOpen(false);
    setSelectedGroup(null);
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
    <div className={`flex-1 bg-gray-50 p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header Section */}
      <div className="flex flex-row justify-between items-center mb-6 px-2">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-800 mb-2">
          {t('groups.title')}
        </h1>
        <p className="text-grey text-lg">
          {t('groups.subtitle')}
        </p>
      </div>
         {/* Create Group Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateGroup}
          className="btn-primary"
        >
          {t('groups.create_group')}
        </button>
      </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatsCard
          icon="/assets/icons/dashboard/groups/Vector.svg"
          label={t('groups.stats.groups_count')}
          value="13"
          bgColor="bg-green/10"
        />
        <StatsCard
          icon="/assets/icons/dashboard/groups/one-person.svg"
          label={t('groups.stats.students_count')}
          value="256"
          bgColor="bg-red/10"
        />
        <StatsCard
          icon="/assets/icons/dashboard/groups/graphup.svg"
          label={t('groups.stats.progress_rate')}
          value="68%"
          bgColor="bg-primary-100"
        />
    
      </div>

   
      {/* Search and Filter */}
      <div className={`flex flex-col sm:flex-row gap-4 mb-6 ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
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
        <h2 className="text-xl font-bold text-primary-800">
          {t('groups.all_groups')} ({filteredGroups.length})
        </h2>
        <p className="text-grey text-sm mt-1">
          {t('groups.manage_description')}
        </p>
      </div>

      {/* Table */}
      <Table<GroupData>
        columns={columns}
        data={filteredGroups}
        rowKey="id"
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
          >
            {t('groups.modal.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmitCreate}
          >
            {t('groups.modal.add_group')}
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
          >
            {t('groups.modal.cancel')}
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmitEdit}
          >
            {t('groups.modal.update_group')}
          </button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
