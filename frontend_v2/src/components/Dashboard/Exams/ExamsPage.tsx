import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import StatsCard from "../Groups/StatsCard";
import SearchBar from "../Groups/SearchBar";
import FilterSelect from "../Groups/FilterSelect";
import Table from "../Groups/Table";
import type { ColumnProps } from "../Groups/Table";
import SortableHeader from "../Groups/SortableHeader";
import type { SortDirection } from "../Groups/SortableHeader";
import EditWarningModal from "./Modals/EditWarningModal";
import AssignExamModal from "./Modals/AssignExamModal";
import StartExamModal from "./Modals/StartExamModal";
import StopExamModal from "./Modals/StopExamModal";
import EditExamOptionsModal from "./Modals/EditExamOptionsModal";
import RescheduleExamModal from "./Modals/RescheduleExamModal";
import DeleteExamModal from "./Modals/DeleteExamModal";
import * as api from "../../../services/api";
import { getTopics } from "../../../data/mockData";
import { toast } from "react-hot-toast";

interface ExamData {
    id: string;
    name: string;
    group: string;
    startDate: string;
    endDate: string;
    topic: string;
    status: "active" | "closed" | "scheduled";
}

export default function ExamsPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const isRTL = i18n.language === 'ar';

    // State for API data
    const [exams, setExams] = useState<api.Quiz[]>([]);
    const [stats, setStats] = useState<api.DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const topics = getTopics();

    // Load data from API
    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [quizzesData, statsData] = await Promise.all([
                api.getQuizzes(),
                api.getDashboardStats()
            ]);
            setExams(quizzesData);
            setStats(statsData);
        } catch (err) {
            console.error('Failed to load exams:', err);
        } finally {
            setLoading(false);
        }
    }

    // Transform exams to display format
    const mockExams: ExamData[] = exams.map(exam => {
        const now = new Date();
        const startDate = exam.starts_at ? new Date(exam.starts_at) : null;
        const endDate = exam.ends_at ? new Date(exam.ends_at) : null;
        
        let status: "active" | "closed" | "scheduled" = "active";
        
        if (endDate && endDate < now) {
            status = "closed";
        } else if (startDate && startDate > now) {
            status = "scheduled";
        } else {
            status = "active";
        }
        
        return {
            id: exam.id.toString(),
            name: exam.title,
            group: 'N/A',
            startDate: exam.starts_at ? exam.starts_at.split('T')[0] : '-',
            endDate: exam.ends_at ? exam.ends_at.split('T')[0] : '-',
            topic: topics[0]?.nameFr || t('exams.no_topic', 'لا يوجد موضوع'),
            status,
        };
    });

    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [filterValue, setFilterValue] = useState(t('exams.all_topics', 'جميع المواضيع'));
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(null);
    
    // Modal States
    const [editWarningModalOpen, setEditWarningModalOpen] = useState(false);
    const [assignExamModalOpen, setAssignExamModalOpen] = useState(false);
    const [startExamModalOpen, setStartExamModalOpen] = useState(false);
    const [stopExamModalOpen, setStopExamModalOpen] = useState(false);
    const [editOptionsModalOpen, setEditOptionsModalOpen] = useState(false);
    const [rescheduleModalOpen, setRescheduleModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState<ExamData | null>(null);

    // Filter Options - generate from topics
    const filterOptions = [
        t('exams.all_topics', 'جميع المواضيع'),
        ...topics.map(topic => isRTL ? topic.nameAr : topic.nameFr)
    ];

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
    let filteredExams = mockExams.filter((exam) => {
        const matchesSearch = (exam.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exam.group || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (exam.topic || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterValue === t('exams.all_topics', 'جميع المواضيع') || exam.topic === filterValue;
        return matchesSearch && matchesFilter;
    });

    if (sortColumn && sortDirection) {
        filteredExams = [...filteredExams].sort((a, b) => {
            let aVal: any = a[sortColumn as keyof ExamData];
            let bVal: any = b[sortColumn as keyof ExamData];

            if (sortColumn === 'startDate' || sortColumn === 'endDate') {
                aVal = new Date(aVal as string).getTime();
                bVal = new Date(bVal as string).getTime();
            }

            if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
            if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }

    // Status Badge Component
    const StatusBadge = ({ status }: { status: ExamData['status'] }) => {
        const statusConfig = {
            active: {
                bg: 'bg-green/10',
                text: 'text-green',
                label: t('exams.status.active', 'نشط'),
            },
            closed: {
                bg: 'bg-red/10',
                text: 'text-red',
                label: t('exams.status.closed', 'مغلق'),
            },
            scheduled: {
                bg: 'bg-yellow/10',
                text: 'text-yellow',
                label: t('exams.status.scheduled', 'مبرمج'),
            },
        };

        const config = statusConfig[status];
        return (
            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold ${config.bg} ${config.text}`}>
                {config.label}
            </span>
        );
    };

    // Handle Actions
    const handleAssignExam = () => {
        setAssignExamModalOpen(true);
    };

    const handleAssignExamConfirm = async (data: {
        examName: string;
        groupId: string;
        startDate: Date;
        endDate: Date;
        templateId: string;
    }) => {
        try {
            await api.createDashboardQuiz({
                title_ar: data.examName,
                title_fr: data.examName,
                template_id: parseInt(data.templateId),
                room_id: parseInt(data.groupId),
                starts_at: data.startDate.toISOString(),
                ends_at: data.endDate.toISOString(),
                is_public: false,
                settings: {
                    vehicle_type: 'car',
                    mode: 'exam',
                    question_count: 10,
                    randomize_questions: true,
                    randomize_choices: true,
                    passing_score: 70,
                    review_allowed: false,
                },
            });
            // Refresh the exams list
            loadData();
        } catch (err) {
            console.error('Failed to assign exam:', err);
        }
    };

    const handleViewStats = (exam: ExamData) => {
        console.log('View stats:', exam.id);
        // TODO: Navigate to stats page - keeping empty for now
    };

    const handleEditExam = (exam: ExamData) => {
        // Show edit options modal for all exams
        setSelectedExam(exam);
        setEditOptionsModalOpen(true);
    };

    const handleReschedule = () => {
        setEditOptionsModalOpen(false);
        setRescheduleModalOpen(true);
    };

    const handleEditQuestions = () => {
        setEditOptionsModalOpen(false);
        if (selectedExam) {
            navigate(`/dashboard/templates/create?editExam=${selectedExam.id}`);
        }
    };

    const handleDeleteExamOption = () => {
        setEditOptionsModalOpen(false);
        setDeleteModalOpen(true);
    };

    const handleRescheduleConfirm = async (startDate: Date, endDate: Date) => {
        if (!selectedExam) return;
        
        try {
            await api.updateQuiz(parseInt(selectedExam.id), {
                starts_at: startDate.toISOString(),
                ends_at: endDate.toISOString(),
            });
            
            toast.success(t('exams.modals.reschedule.success', 'تم إعادة جدولة الاختبار بنجاح'));
            setRescheduleModalOpen(false);
            setSelectedExam(null);
            loadData();
        } catch (err) {
            console.error('Failed to reschedule exam:', err);
            toast.error(t('exams.modals.reschedule.error', 'فشل إعادة جدولة الاختبار'));
        }
    };

    const handleDeleteExam = async () => {
        if (!selectedExam) return;
        
        try {
            await api.deleteQuiz(parseInt(selectedExam.id));
            
            toast.success(t('exams.modals.delete_exam.success', 'تم حذف الاختبار بنجاح'));
            setDeleteModalOpen(false);
            setSelectedExam(null);
            loadData();
        } catch (err) {
            console.error('Failed to delete exam:', err);
            toast.error(t('exams.modals.delete_exam.error', 'فشل حذف الاختبار'));
        }
    };

    const navigateToEditExam = (exam: ExamData) => {
        navigate(`/dashboard/templates/create?editExam=${exam.id}`);
    };

    const handleToggleExamStatus = (exam: ExamData) => {
        setSelectedExam(exam);
        
        if (exam.status === "scheduled" || exam.status === "closed") {
            // Show start modal for scheduled or closed exams (can restart)
            setStartExamModalOpen(true);
        } else if (exam.status === "active") {
            // Show stop modal for active exams
            setStopExamModalOpen(true);
        }
    };

    const handleStartExam = async () => {
        if (!selectedExam) return;
        
        try {
            const now = new Date();
            const updateData: { starts_at: string; ends_at?: string } = {
                starts_at: now.toISOString(),
            };
            
            // If restarting a closed exam, set ends_at to 24 hours from now
            if (selectedExam.status === "closed") {
                const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
                updateData.ends_at = tomorrow.toISOString();
            }
            
            await api.updateQuiz(parseInt(selectedExam.id), updateData);
            
            toast.success(t('exams.modals.start_exam.success', 'تم بدء الاختبار بنجاح'));
            setStartExamModalOpen(false);
            setSelectedExam(null);
            // Refresh the exams list
            loadData();
        } catch (err) {
            console.error('Failed to start exam:', err);
            toast.error(t('exams.modals.start_exam.error', 'فشل بدء الاختبار'));
        }
    };

    const handleStopExam = async () => {
        if (!selectedExam) return;
        
        try {
            // Set ends_at to now to close the exam
            await api.updateQuiz(parseInt(selectedExam.id), {
                ends_at: new Date().toISOString(),
            });
            
            toast.success(t('exams.modals.stop_exam.success', 'تم إيقاف الاختبار بنجاح'));
            setStopExamModalOpen(false);
            setSelectedExam(null);
            // Refresh the exams list
            loadData();
        } catch (err) {
            console.error('Failed to stop exam:', err);
            toast.error(t('exams.modals.stop_exam.error', 'فشل إيقاف الاختبار'));
        }
    };

    // Table Columns
    const columns: ColumnProps<ExamData>[] = [
        {
            key: "name",
            label: (
                <SortableHeader
                    label={t('exams.table.exam_name', 'اسم الاختبار')}
                    sortable={true}
                    currentSort={sortColumn === 'name' ? sortDirection : null}
                    onSort={() => handleSort('name')}
                />
            ),
            type: "text",
        },
        {
            key: "group",
            label: t('exams.table.group', 'المجموعة'),
            type: "text",
        },
        {
            key: "startDate",
            label: (
                <SortableHeader
                    label={t('exams.table.start_date', 'تاريخ البداية')}
                    sortable={true}
                    currentSort={sortColumn === 'startDate' ? sortDirection : null}
                    onSort={() => handleSort('startDate')}
                />
            ),
            type: "text",
            render: (item) => (
                <span>
                    {isRTL
                        ? new Date(item.startDate).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date(item.startDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            ),
        },
        {
            key: "endDate",
            label: (
                <SortableHeader
                    label={t('exams.table.end_date', 'تاريخ النهاية')}
                    sortable={true}
                    currentSort={sortColumn === 'endDate' ? sortDirection : null}
                    onSort={() => handleSort('endDate')}
                />
            ),
            type: "text",
            render: (item) => (
                <span>
                    {isRTL
                        ? new Date(item.endDate).toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
                        : new Date(item.endDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
            ),
        },
        {
            key: "topic",
            label: t('exams.table.topic', 'الموضوع'),
            type: "text",
        },
        {
            key: "status",
            label: t('exams.table.status', 'الحالة'),
            render: (item) => <StatusBadge status={item.status} />,
        },
        {
            key: "actions",
            label: t('exams.table.actions', 'الإجراءات'),
            type: "actions",
            render: (item) => (
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row justify-end' : 'flex-row'}`}>
                    <button
                        onClick={() => handleViewStats(item)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title={t('exams.actions.view_stats', 'عرض الإحصائيات')}
                    >
                        <img
                            src="/assets/icons/dashboard/exams/Chart_Bar_Vertical_01.svg"
                            alt="stats"
                            className="w-5 h-5 min-w-5"
                        />
                    </button>
                    <button
                        onClick={() => handleEditExam(item)}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                        title={t('exams.actions.edit', 'تعديل')}
                    >
                        <img
                            src="/assets/icons/dashboard/exams/Edit_Pencil_01.svg"
                            alt="edit"
                            className="w-5 h-5 min-w-5"
                        />
                    </button>
                    <button
                        onClick={() => handleToggleExamStatus(item)}
                        className={`p-2 rounded-lg transition-colors group ${
                            item.status === "active" 
                                ? "hover:bg-red-50" 
                                : "hover:bg-green-50"
                        }`}
                        title={item.status === "active" 
                            ? t('exams.actions.stop', 'إيقاف') 
                            : t('exams.actions.start', 'تشغيل')
                        }
                    >
                        <img
                            src={item.status === "active" 
                                ? "/assets/icons/dashboard/exams/Timer_Close.svg"
                                : "/assets/icons/dashboard/exams/Timer_Add.svg"
                            }
                            alt={item.status === "active" ? "stop" : "start"}
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
                    {t('exams.title', 'إدارة الإمتحانات')}
                </h1>
            </div>

            {/* Stats Cards */}
            {loading || !stats ? (
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">{t('common.loading', 'جاري التحميل...')}</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <StatsCard
                        icon="/assets/icons/dashboard/exams/Send_green.svg"
                        label={t('exams.stats.current_exams', 'الإمتحانات الجارية')}
                        value={(stats?.active_quizzes ?? 0).toString()}
                        bgColor="bg-green/10"
                    />
                    <StatsCard
                        icon="/assets/icons/dashboard/exams/Calendar_red.svg"
                        label={t('exams.stats.scheduled_exams', 'الإمتحانات المبرمجة')}
                        value={(stats?.upcoming_quizzes ?? 0).toString()}
                        bgColor="bg-red/10"
                    />
                    <StatsCard
                        icon="/assets/icons/dashboard/exams/template.svg"
                        label={t('exams.stats.templates', 'عدد القوالب')}
                        value="0"
                        bgColor="bg-primary-100"
                    />
                </div>
            )}

           
            {/* Exams Section */}
            <div className="mb-6">
                <div className="flex flex-row items-center justify-between pl-6">

                <h2 className="text-xl sm:text-2xl font-black text-primary-800 mb-4">
                    {t('exams.exams_list', 'الإمتحانات')}
                </h2>
                 {/* Assign Exam Button */}
            <div className="mb-6">
                <button
                    onClick={handleAssignExam}
                    className="btn-primary w-full sm:w-auto"
                    >
                    {t('exams.assign_exam', 'تعيين إمتحان')}
                </button>
            </div>
                    </div>


                {/* Search and Filter */}
                <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6`}>
                    <SearchBar
                        placeholder={t('exams.search_placeholder', 'البحث عن امتحان')}
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
                <Table<ExamData>
                    columns={columns}
                    data={filteredExams}
                    rowKey="id"
                />
            </div>

            {/* Templates Section */}
            <div className="flex flex-row items-center justify-between pl-6">
                <div className="mb-6">
                    <h2 className="text-xl font-black sm:text-2xl  text-primary-800 mb-4">
                        {t('exams.templates_list', 'القوالب')}
                    </h2>
                    <div className={`flex items-center gap-2 p-4 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                        <img
                            src="/assets/icons/dashboard/exams/Info.svg"
                            alt="info"
                            className="w-5 h-5 flex-shrink-0"
                        />
                        <p className="text-sm text-grey">
                            {t('exams.templates_info', 'قم بإنشاء قوالب قابلة لإعادة الاستعمال')}
                        </p>
                    </div>
                </div>
                <div className="py-auto">
                    <button
                        onClick={() => navigate('/dashboard/templates')}
                        className="btn-primary w-full sm:w-auto mt-4"
                    >
                        {t('exams.create_template', 'إنشاء قالب')}
                    </button>
                </div>
            </div>

            {/* Edit Warning Modal */}
            <EditWarningModal
                isOpen={editWarningModalOpen}
                onClose={() => setEditWarningModalOpen(false)}
                onConfirm={() => selectedExam && navigateToEditExam(selectedExam)}
                examName={selectedExam?.name || ""}
            />

            {/* Assign Exam Modal */}
            <AssignExamModal
                isOpen={assignExamModalOpen}
                onClose={() => setAssignExamModalOpen(false)}
                onConfirm={handleAssignExamConfirm}
            />

            {/* Start Exam Modal */}
            <StartExamModal
                isOpen={startExamModalOpen}
                onClose={() => {
                    setStartExamModalOpen(false);
                    setSelectedExam(null);
                }}
                onConfirm={handleStartExam}
                examName={selectedExam?.name || ""}
            />

            {/* Stop Exam Modal */}
            <StopExamModal
                isOpen={stopExamModalOpen}
                onClose={() => {
                    setStopExamModalOpen(false);
                    setSelectedExam(null);
                }}
                onConfirm={handleStopExam}
                examName={selectedExam?.name || ""}
            />

            {/* Edit Exam Options Modal */}
            <EditExamOptionsModal
                isOpen={editOptionsModalOpen}
                onClose={() => {
                    setEditOptionsModalOpen(false);
                    setSelectedExam(null);
                }}
                onReschedule={handleReschedule}
                onEditQuestions={handleEditQuestions}
                onDelete={handleDeleteExamOption}
                examName={selectedExam?.name || ""}
                examStatus={selectedExam?.status || "scheduled"}
            />

            {/* Reschedule Exam Modal */}
            <RescheduleExamModal
                isOpen={rescheduleModalOpen}
                onClose={() => {
                    setRescheduleModalOpen(false);
                    setSelectedExam(null);
                }}
                onConfirm={handleRescheduleConfirm}
                examName={selectedExam?.name || ""}
                currentStartDate={selectedExam?.startDate}
                currentEndDate={selectedExam?.endDate}
            />

            {/* Delete Exam Modal */}
            <DeleteExamModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false);
                    setSelectedExam(null);
                }}
                onConfirm={handleDeleteExam}
                examName={selectedExam?.name || ""}
            />
        </div>
    );
}
