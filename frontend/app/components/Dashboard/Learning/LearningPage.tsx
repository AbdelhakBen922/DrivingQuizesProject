import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import SearchBar from "../Groups/SearchBar";
import FilterSelect from "../Groups/FilterSelect";
import Table from "../Groups/Table";
import type { ColumnProps } from "../Groups/Table";
import SortableHeader from "../Groups/SortableHeader";
import type { SortDirection } from "../Groups/SortableHeader";
import { BookOpen, Plus, ArrowLeft } from "lucide-react";

interface ModuleData {
  id: string;
  name: string;
  lessonsCount: number;
  createdAt: string;
  category: string;
  status: "draft" | "published";
}

export default function LearningPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const navigate = useNavigate();

  // Mock data for now - will be replaced with API calls
  const [modules, setModules] = useState<ModuleData[]>([
    {
      id: "1",
      name: isRTL ? "قواعد المرور الأساسية" : "Règles de circulation de base",
      lessonsCount: 12,
      createdAt: "2024-01-15",
      category: isRTL ? "قانون المرور" : "Code de la route",
      status: "published",
    },
    {
      id: "2",
      name: isRTL ? "السلامة على الطريق" : "Sécurité routière",
      lessonsCount: 8,
      createdAt: "2024-01-20",
      category: isRTL ? "السلامة" : "Sécurité",
      status: "published",
    },
    {
      id: "3",
      name: isRTL ? "إشارات المرور" : "Panneaux de signalisation",
      lessonsCount: 15,
      createdAt: "2024-02-01",
      category: isRTL ? "قانون المرور" : "Code de la route",
      status: "draft",
    },
  ]);

  const [loading, setLoading] = useState(false);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterValue, setFilterValue] = useState(t('learningManagement.filters.allCategories', 'Toutes les catégories'));
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Filter Options
  const filterOptions = useMemo(() => [
    t('learningManagement.filters.allCategories', 'Toutes les catégories'),
    isRTL ? "قانون المرور" : "Code de la route",
    isRTL ? "السلامة" : "Sécurité",
    isRTL ? "الميكانيكا" : "Mécanique",
  ], [isRTL, t]);

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
  let filteredModules = modules.filter((module) => {
    const matchesSearch = module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         module.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterValue === t('learningManagement.filters.allCategories', 'Toutes les catégories') || 
                         module.category === filterValue;
    return matchesSearch && matchesFilter;
  });

  if (sortColumn && sortDirection) {
    filteredModules = [...filteredModules].sort((a, b) => {
      const aValue = a[sortColumn as keyof ModuleData];
      const bValue = b[sortColumn as keyof ModuleData];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      return 0;
    });
  }

  // Status Badge Component
  const StatusBadge = ({ status }: { status: "draft" | "published" }) => {
    const config = {
      draft: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: t('learningManagement.status.draft', 'Brouillon')
      },
      published: {
        bg: "bg-green-100",
        text: "text-green-800",
        label: t('learningManagement.status.published', 'Publié')
      },
    };

    const currentConfig = config[status];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${currentConfig.bg} ${currentConfig.text}`}>
        {currentConfig.label}
      </span>
    );
  };

  // Handle Actions
  const handleCreateModule = () => {
    navigate('/dashboard/learning/create');
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleAssignModule = (module: ModuleData) => {
    // TODO: Open assign modal
    console.log('Assign module:', module);
  };

  const handleEditModule = (module: ModuleData) => {
    navigate(`/dashboard/learning/create?edit=${module.id}`);
  };

  const handleDeleteModule = (module: ModuleData) => {
    // TODO: Open delete confirmation modal
    console.log('Delete module:', module);
  };

  // Table Columns
  const columns: ColumnProps<ModuleData>[] = [
    {
      key: "name",
      label: t('learningManagement.table.name', 'Nom du module'),
      type: "text",
    },
    {
      key: "lessonsCount",
      label: t('learningManagement.table.lessonsCount', 'Nombre de leçons'),
      type: "text",
    },
    {
      key: "category",
      label: t('learningManagement.table.category', 'Catégorie'),
      type: "text",
    },
    {
      key: "createdAt",
      label: t('learningManagement.table.createdAt', 'Date de création'),
      type: "date",
      render: (item) => (
        <span>
          {isRTL 
            ? new Date(item.createdAt).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
            : new Date(item.createdAt).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      ),
    },
    {
      key: "status",
      label: t('learningManagement.table.status', 'Statut'),
      type: "badge",
      render: (module) => <StatusBadge status={module.status} />,
    },
    {
      key: "actions",
      label: t('learningManagement.table.actions', 'Actions'),
      type: "actions",
      render: (item) => (
        <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse justify-end' : 'flex-row'}`}>
          <button
            onClick={() => handleAssignModule(item)}
            className="p-2 hover:bg-green-50 rounded-lg transition-colors group"
            title={t('learningManagement.actions.assign', 'Assigner')}
          >
            <img 
              src="/assets/icons/dashboard/exams/Send_green.svg" 
              alt="assign" 
              className="w-5 h-5 min-w-5"
            />
          </button>
          <button
            onClick={() => handleEditModule(item)}
            className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
            title={t('learningManagement.actions.edit', 'Modifier')}
          >
            <img 
              src="/assets/icons/dashboard/exams/Edit_Pencil_01.svg" 
              alt="edit" 
              className="w-5 h-5 min-w-5"
            />
          </button>
          <button
            onClick={() => handleDeleteModule(item)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
            title={t('learningManagement.actions.delete', 'Supprimer')}
          >
            <img 
              src="/assets/icons/create_exam/Trash_Full.svg" 
              alt="delete" 
              className="w-5 h-5 min-w-5"
            />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5 w-full h-full p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={t('common.back', 'Retour')}
          >
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              {t('learningManagement.title', 'Gestion des Modules')}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {t('learningManagement.subtitle', 'Créez et gérez vos modules de formation')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCreateModule}
          className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-5 h-5" />
          {t('learningManagement.createModule', 'Créer un Module')}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('learningManagement.stats.totalModules', 'Total des modules')}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{modules.length}</p>
            </div>
            <div className="p-3 bg-primary-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('learningManagement.stats.published', 'Modules publiés')}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {modules.filter(m => m.status === 'published').length}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{t('learningManagement.stats.totalLessons', 'Total des leçons')}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {modules.reduce((sum, m) => sum + m.lessonsCount, 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('learningManagement.searchPlaceholder', 'Rechercher un module...')}
          />
        </div>
        <div className="w-full md:w-64">
          <FilterSelect
            value={filterValue}
            options={filterOptions}
            onChange={setFilterValue}
          />
        </div>
      </div>

      {/* Modules Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <BookOpen className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-semibold">
              {searchQuery || filterValue !== t('learningManagement.filters.allCategories', 'Toutes les catégories')
                ? t('learningManagement.noResults', 'Aucun résultat')
                : t('learningManagement.noModules', 'Aucun module')}
            </p>
            {!searchQuery && filterValue === t('learningManagement.filters.allCategories', 'Toutes les catégories') && (
              <p className="text-sm text-gray-400 mt-2">
                {t('learningManagement.createFirst', 'Créez votre premier module de formation')}
              </p>
            )}
          </div>
        ) : (
          <Table
            data={filteredModules as any}
            columns={columns as any}
            rowKey="id"
          />
        )}
      </div>
    </div>
  );
}
