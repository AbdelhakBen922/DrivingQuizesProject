import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import SearchBar from "../Groups/SearchBar";
import FilterSelect from "../Groups/FilterSelect";
import Table from "../Groups/Table";
import type { ColumnProps } from "../Groups/Table";
import SortableHeader from "../Groups/SortableHeader";
import type { SortDirection } from "../Groups/SortableHeader";
import DeleteConfirmModal from "./Modals/DeleteConfirmModal";
import AssignTemplateToGroupModal from "./Modals/AssignTemplateToGroupModal";
import * as api from "../../../services/api";
import { getTopics, getLicenseClasses } from "../../../data/mockData";
import { toast } from "react-hot-toast";

interface TemplateData {
  id: string;
  name: string;
  questionsCount: number;
  createdAt: string;
  class: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "very_hard" | "very_easy";
}

export default function TemplatesPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();

  // State for API data
  const [templates, setTemplates] = useState<api.QuizTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const topics = getTopics();
  const licenseClasses = getLicenseClasses();

  // Load templates from API
  useEffect(() => {
    loadTemplates();
  }, []);

  async function loadTemplates() {
    try {
      setLoading(true);
      const data = await api.getQuizTemplates();
      setTemplates(data);
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  }

  // Transform templates to display format
  const mockTemplates: TemplateData[] = templates.map(tpl => ({
    id: tpl.id.toString(),
    name: tpl.title,
    questionsCount: tpl.question_count || 0,
    createdAt: tpl.created_at.split('T')[0],
    class: isRTL 
      ? licenseClasses.find(c => c.code === 'B')?.nameAr.split(' - ')[0] || 'صنف B'
      : licenseClasses.find(c => c.code === 'B')?.nameFr.split(' - ')[0] || 'Catégorie B',
    topic: tpl.description || topics[0]?.nameFr || t('templates.no_topic', 'لا يوجد موضوع'),
    difficulty: (tpl.difficulty?.toLowerCase() || 'medium') as "easy" | "medium" | "hard" | "very_hard" | "very_easy",
  }));

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState(t('templates.all_topics', 'جميع المواضيع'));
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(null);

  // Filter Options - generate from topics
  const filterOptions = useMemo(() => [
    t('templates.all_topics', 'جميع المواضيع'),
    ...topics.map(topic => isRTL ? topic.nameAr : topic.nameFr)
  ], [topics, isRTL, t]);

  // Sorting Logic
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Filter and Sort Data
  let filteredTemplates = mockTemplates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterValue === t('templates.all_topics', 'جميع المواضيع') || template.topic === filterValue;
    return matchesSearch && matchesFilter;
  });

  if (sortColumn && sortDirection) {
    filteredTemplates = [...filteredTemplates].sort((a, b) => {
      let aVal: any = a[sortColumn as keyof TemplateData];
      let bVal: any = b[sortColumn as keyof TemplateData];
      
      if (sortColumn === 'createdAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Difficulty Badge Component
  const DifficultyBadge = ({ difficulty }: { difficulty: TemplateData['difficulty'] }) => {
    const difficultyConfig = {
      very_easy: {
        bg: 'bg-green/10',
        text: 'text-green',
        label: t('templates.difficulty.very_easy', 'سهل جدا'),
      },
      easy: {
        bg: 'bg-green/10',
        text: 'text-green',
        label: t('templates.difficulty.easy', 'سهل'),
      },
      medium: {
        bg: 'bg-yellow/10',
        text: 'text-yellow',
        label: t('templates.difficulty.medium', 'متوسط'),
      },
      hard: {
        bg: 'bg-red/10',
        text: 'text-red',
        label: t('templates.difficulty.hard', 'صعب'),
      },
      very_hard: {
        bg: 'bg-red/10',
        text: 'text-red',
        label: t('templates.difficulty.very_hard', 'صعب جدا'),
      },
    };

    const config = difficultyConfig[difficulty];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  // Handle Actions
  const handleCreateTemplate = () => {
    navigate('/dashboard/templates/create');
  };

  const handleBack = () => {
    navigate('/dashboard/exams');
  };

  const handleSendTemplate = (template: TemplateData) => {
    setSelectedTemplate(template);
    setAssignModalOpen(true);
  };

  const handleEditTemplate = (template: TemplateData) => {
    // Navigate to create page with template data (edit mode)
    navigate(`/dashboard/templates/create?edit=${template.id}`);
  };

  const handleDeleteTemplate = (template: TemplateData) => {
    setSelectedTemplate(template);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedTemplate) {
      try {
        await api.deleteQuizTemplate(parseInt(selectedTemplate.id));
        setDeleteModalOpen(false);
        setSelectedTemplate(null);
        loadTemplates(); // Refresh the list
      } catch (err: any) {
        // If template is linked to quizzes, try force delete
        if (err.message?.includes('linked to existing quizzes')) {
          try {
            await api.deleteQuizTemplate(parseInt(selectedTemplate.id), true);
            setDeleteModalOpen(false);
            setSelectedTemplate(null);
            loadTemplates();
          } catch (forceErr) {
            console.error('Failed to force delete template:', forceErr);
          }
        } else {
          console.error('Failed to delete template:', err);
        }
      }
    }
  };

  const handleConfirmAssign = async (data: {
    groupId: string;
    startDate: Date;
    endDate: Date;
    examName: string;
  }) => {
    if (!selectedTemplate) return;
    
    try {
      await api.createDashboardQuiz({
        title: data.examName,
        template_id: parseInt(selectedTemplate.id),
        room_id: parseInt(data.groupId),
        starts_at: data.startDate.toISOString(),
        ends_at: data.endDate.toISOString(),
        is_public: false,
        settings: {
          vehicle_type: 'car',
          mode: 'exam',
          question_count: selectedTemplate.questionsCount,
          randomize_questions: true,
          randomize_choices: true,
          passing_score: 70,
          review_allowed: false,
        },
      });
      
      toast.success(t('templates.assignModal.success', 'تم تعيين القالب بنجاح'));
      setAssignModalOpen(false);
      setSelectedTemplate(null);
    } catch (err) {
      console.error('Failed to assign template:', err);
      toast.error(t('templates.assignModal.error', 'فشل تعيين القالب'));
    }
  };

  // Table Columns
  const columns: ColumnProps<TemplateData>[] = [
    {
      key: "name",
      label: t('templates.table.name', 'اسم القالب'),
      type: "text",
    },
    {
      key: "questionsCount",
      label: (
        <SortableHeader
          label={t('templates.table.questions', 'الأسئلة')}
          sortable={true}
          currentSort={sortColumn === 'questionsCount' ? sortDirection : null}
          onSort={() => handleSort('questionsCount')}
        />
      ),
      type: "text",
    },
    {
      key: "createdAt",
      label: (
        <SortableHeader
          label={t('templates.table.created_at', 'تاريخ الإنشاء')}
          sortable={true}
          currentSort={sortColumn === 'createdAt' ? sortDirection : null}
          onSort={() => handleSort('createdAt')}
        />
      ),
      type: "text",
      render: (item) => (
        <span>
          {isRTL 
            ? new Date(item.createdAt).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(item.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: "class",
      label: t('templates.table.class', 'الصنف'),
      type: "text",
    },
    {
      key: "topic",
      label: t('templates.table.topic', 'الموضوع'),
      type: "text",
    },
    {
      key: "difficulty",
      label: (
        <SortableHeader
          label={t('templates.table.difficulty', 'الصعوبة')}
          sortable={true}
          currentSort={sortColumn === 'difficulty' ? sortDirection : null}
          onSort={() => handleSort('difficulty')}
        />
      ),
      render: (item) => <DifficultyBadge difficulty={item.difficulty} />,
    },
    {
      key: "actions",
      label: t('templates.table.actions', 'الإجراءات'),
      type: "actions",
      render: (item) => (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
          <button
            onClick={() => handleSendTemplate(item)}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
            title={t('templates.actions.send', 'إرسال')}
          >
            <img 
              src="/assets/icons/dashboard/exams/Send_green.svg" 
              alt="send" 
              className="w-5 h-5 min-w-5"
            />
          </button>
          <button
            onClick={() => handleEditTemplate(item)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title={t('templates.actions.edit', 'تعديل')}
          >
            <img 
              src="/assets/icons/dashboard/exams/Edit_Pencil_01.svg" 
              alt="edit" 
              className="w-5 h-5 min-w-5"
            />
          </button>
          <button
            onClick={() => handleDeleteTemplate(item)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title={t('templates.actions.delete', 'حذف')}
          >
            <img 
              src="/assets/icons/dashboard/groups/trash.svg" 
              alt="delete" 
              className="w-5 h-5 min-w-5"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={`flex-1 bg-gray-50 p-4 sm:p-6 lg:p-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary-800 mb-2">
          {t('templates.title', 'القوالب')}
        </h1>
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
          <img 
            src="/assets/icons/dashboard/exams/Info.svg" 
            alt="info" 
            className="w-5 h-5 flex-shrink-0"
          />
          <p className="text-sm text-grey">
            {t('templates.subtitle', 'قم بإنشاء قوالب قابلة لإعادة الاستعمال')}
          </p>
        </div>
      </div>

      {/* Create Template Button */}
      <div className="mb-6">
        <button
          onClick={handleCreateTemplate}
          className="btn-primary w-full sm:w-auto"
        >
          {t('templates.create_template', 'إنشاء قالب')}
        </button>
      </div>

      {/* Search and Filter */}
      <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6`}>
        <SearchBar
          placeholder={t('templates.search_placeholder', 'البحث عن قالب')}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <FilterSelect
          options={filterOptions}
          value={filterValue}
          onChange={setFilterValue}
        />
      </div>

      {/* Table */}
      <Table<TemplateData>
        columns={columns}
        data={filteredTemplates}
        rowKey="id"
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        itemName={selectedTemplate?.name || ""}
        itemType="template"
      />

      {/* Assign Template to Group Modal */}
      <AssignTemplateToGroupModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onConfirm={handleConfirmAssign}
        templateName={selectedTemplate?.name || ""}
        templateId={selectedTemplate?.id || ""}
      />
    </div>
  );
}
