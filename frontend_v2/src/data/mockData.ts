/**
 * =============================================================================
 * MOCK DATA SERVICE
 * =============================================================================
 * This file contains all mock data that simulates backend responses.
 * Each function represents an API endpoint that will be implemented in the backend.
 * 
 * BACKEND ENDPOINTS SUMMARY:
 * 
 * === DASHBOARD STATS ===
 * GET /api/dashboard/stats
 *   Returns: { totalGroups, totalStudents, totalTemplates, activeExams, scheduledExams, closedExams, averagePassRate }
 * 
 * === GROUPS ===
 * GET    /api/groups                    - List all groups with pagination
 * GET    /api/groups/:id                - Get group details
 * POST   /api/groups                    - Create new group
 *   Body: { name, description, classType }
 *   Returns: Group with auto-generated roomCode
 * PUT    /api/groups/:id                - Update group
 *   Body: { name?, description?, classType? }
 * DELETE /api/groups/:id                - Delete group
 * GET    /api/groups/:id/students       - List students in a group
 * POST   /api/groups/:id/students       - Add student to group
 *   Body: { studentId }
 * DELETE /api/groups/:id/students/:sid  - Remove student from group
 * GET    /api/groups/:id/lessons        - Get lessons progress for group
 * POST   /api/groups/:id/assign-quiz    - Assign quiz to group
 *   Body: { quizTemplateId, startDate, endDate }
 * GET    /api/groups/:id/stats          - Get group statistics
 *   Returns: { studentCount, averageGrade, totalExams, progressRate }
 * 
 * === STUDENTS ===
 * GET    /api/students                  - List all students with pagination
 * GET    /api/students/:id              - Get student details
 * PUT    /api/students/:id              - Update student
 *   Body: { firstName?, lastName?, email?, phone?, dateOfBirth? }
 * DELETE /api/students/:id              - Delete student
 * 
 * === TEMPLATES ===
 * GET    /api/templates                 - List all templates
 * GET    /api/templates/:id             - Get template with questions
 * POST   /api/templates                 - Create new template
 *   Body: { name, description, topic, classType, questionsCount, timeLimit }
 *   Returns: Created template
 * PUT    /api/templates/:id             - Update template
 *   Body: { name?, description?, topic?, questionsCount?, timeLimit?, passingScore? }
 * DELETE /api/templates/:id             - Delete template
 * POST   /api/templates/:id/assign      - Assign template to groups
 *   Body: { groupIds[], startDate, endDate }
 * GET    /api/templates/:id/questions   - Get template questions
 * 
 * === EXAMS (QUIZ INSTANCES) ===
 * GET    /api/exams                     - List all exams
 * GET    /api/exams/:id                 - Get exam details
 * POST   /api/exams                     - Create exam from template
 *   Body: { name, templateId, groupId, startDate, endDate }
 *   Returns: Created exam with status="scheduled"
 * PUT    /api/exams/:id                 - Update exam
 *   Body: { name?, startDate?, endDate?, status? }
 * DELETE /api/exams/:id                 - Delete exam
 * POST   /api/exams/:id/start           - Start exam (change status to active)
 * POST   /api/exams/:id/stop            - Stop exam (change status to closed)
 * GET    /api/exams/:id/stats           - Get exam statistics
 *   Returns: { participantsCount, completedCount, averageScore, passRate }
 * GET    /api/exams/:id/results         - Get exam results for all students
 *   Returns: Array of { studentId, studentName, score, grade, completedAt }
 * 
 * === QUESTIONS ===
 * GET    /api/questions                 - List all questions (question bank)
 *   Query: ?topic=&difficulty=&type=&page=&limit=
 * GET    /api/questions/:id             - Get question details
 * POST   /api/questions                 - Create new question
 *   Body: { type, questionText, image?, answers[], points, timeLimit, topic, difficulty, explanation? }
 * PUT    /api/questions/:id             - Update question
 *   Body: Same as POST
 * DELETE /api/questions/:id             - Delete question
 * 
 * === TOPICS ===
 * GET    /api/topics                    - List all topics/categories
 *   Returns: Array of { id, name, nameAr, nameFr, questionsCount, order }
 * 
 * === CLASSES ===
 * GET    /api/classes                   - List all license classes (A, B, C, D, E)
 *   Returns: Array of { id, code, name, nameAr, nameFr, description }
 * 
 * === SETTINGS ===
 * GET    /api/settings/school           - Get school information
 *   Returns: { id, name, email, phone, address }
 * PUT    /api/settings/school           - Update school information
 *   Body: { name?, email?, phone?, address? }
 * GET    /api/settings/owner            - Get owner information
 *   Returns: { id, firstName, lastName, email, phone, avatar }
 * PUT    /api/settings/owner            - Update owner information
 *   Body: { firstName?, lastName?, email?, phone?, avatar? }
 * POST   /api/settings/owner/avatar     - Upload owner avatar
 *   Body: FormData with 'avatar' file
 *   Returns: { avatar: "url/to/image" }
 * =============================================================================
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface DashboardStats {
  totalGroups: number;
  totalStudents: number;
  totalTemplates: number;
  activeExams: number;
  scheduledExams: number;
  closedExams: number;
  averagePassRate: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  roomCode: string;
  classType: string; // License class: A, B, C, D, E
  currentTopic: string;
  studentCount: number;
  progress: number; // Overall group progress 0-100
  status: "active" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  groupId: string;
  groupName: string;
  progress: number; // Overall progress 0-100
  averageGrade: number; // Average exam grade 0-20
  totalExamsTaken: number;
  joinedAt: string;
  lastActiveAt: string;
  status: "active" | "inactive";
}

export interface Template {
  id: string;
  name: string;
  description: string;
  questionsCount: number;
  classType: string; // License class
  topic: string;
  difficulty: "very_easy" | "easy" | "medium" | "hard" | "very_hard";
  timeLimit: number; // in minutes
  passingScore: number; // minimum score to pass (0-100)
  randomizeQuestions: boolean;
  randomizeAnswers: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  usageCount: number; // How many times this template was used
}

export interface Question {
  id: string;
  type: "single" | "multiple" | "T_F";
  questionText: string;
  image: string | null;
  answers: Answer[];
  points: number;
  timeLimit: number; // seconds
  topic: string;
  difficulty: "very_easy" | "easy" | "medium" | "hard" | "very_hard";
  explanation: string | null;
  createdAt: string;
}

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Exam {
  id: string;
  name: string;
  templateId: string;
  templateName: string;
  groupId: string;
  groupName: string;
  topic: string;
  questionsCount: number;
  timeLimit: number;
  startDate: string;
  endDate: string;
  status: "active" | "closed" | "scheduled";
  participantsCount: number;
  completedCount: number;
  averageScore: number;
  passRate: number;
  createdAt: string;
}

export interface Lesson {
  id: string;
  name: string;
  topic: string;
  completedStudents: number;
  totalStudents: number;
  averageProgress: number;
  averageGrade: number;
  order: number;
}

export interface Topic {
  id: string;
  name: string;
  nameAr: string;
  nameFr: string;
  questionsCount: number;
  order: number;
}

export interface LicenseClass {
  id: string;
  code: string; // A, B, C, D, E
  name: string;
  nameAr: string;
  nameFr: string;
  description: string;
}

export interface SchoolInfo {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface OwnerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar: string | null;
}

// ============================================================================
// MOCK DATA
// ============================================================================

// License Classes
export const MOCK_LICENSE_CLASSES: LicenseClass[] = [
  { id: "1", code: "A", name: "Motorcycle", nameAr: "صنف أ - دراجات نارية", nameFr: "Catégorie A - Motocycles", description: "Motorcycles" },
  { id: "2", code: "B", name: "Light Vehicle", nameAr: "صنف ب - سيارات خفيفة", nameFr: "Catégorie B - Véhicules légers", description: "Cars up to 3.5 tons" },
  { id: "3", code: "C", name: "Heavy Vehicle", nameAr: "صنف ت - سيارات ثقيلة", nameFr: "Catégorie C - Poids lourds", description: "Trucks over 3.5 tons" },
  { id: "4", code: "D", name: "Bus", nameAr: "صنف د - حافلات", nameFr: "Catégorie D - Autobus", description: "Buses and coaches" },
  { id: "5", code: "E", name: "Trailer", nameAr: "صنف هـ - مقطورات", nameFr: "Catégorie E - Remorques", description: "Trailers" },
];

// School & Owner Settings
export let MOCK_SCHOOL_INFO: SchoolInfo = {
  id: "school-001",
  name: "مدرسة سيدي عبد الله",
  email: "info@school.com",
  phone: "+213667341234",
  address: "سيدي عبد الله - العاصمة ياخو",
};

export let MOCK_OWNER_INFO: OwnerInfo = {
  id: "owner-001",
  firstName: "علاء",
  lastName: "سليماني",
  email: "info@school.com",
  phone: "+966 50 123-4567",
  avatar: "/assets/images/owner-avatar.jpg",
};

// Topics
export const MOCK_TOPICS: Topic[] = [
  { id: "1", name: "Traffic Priorities", nameAr: "أولويات المرور", nameFr: "Priorités de circulation", questionsCount: 45, order: 1 },
  { id: "2", name: "Road Signs", nameAr: "إشارات الطريق", nameFr: "Signalisation routière", questionsCount: 120, order: 2 },
  { id: "3", name: "Road Rules", nameAr: "قواعد الطريق", nameFr: "Règles de la route", questionsCount: 80, order: 3 },
  { id: "4", name: "Driving Basics", nameAr: "أساسيات القيادة", nameFr: "Bases de la conduite", questionsCount: 35, order: 4 },
  { id: "5", name: "Speed Limits", nameAr: "السرعات", nameFr: "Limitations de vitesse", questionsCount: 25, order: 5 },
  { id: "6", name: "Traffic Congestion", nameAr: "الإزدحام المروري", nameFr: "Embouteillages", questionsCount: 20, order: 6 },
  { id: "7", name: "Road Safety", nameAr: "السلامة المرورية", nameFr: "Sécurité routière", questionsCount: 55, order: 7 },
  { id: "8", name: "Parking Rules", nameAr: "قواعد الوقوف", nameFr: "Règles de stationnement", questionsCount: 30, order: 8 },
  { id: "9", name: "Night Driving", nameAr: "القيادة الليلية", nameFr: "Conduite de nuit", questionsCount: 15, order: 9 },
  { id: "10", name: "Real Scenarios", nameAr: "سيناريوهات حقيقية", nameFr: "Scénarios réels", questionsCount: 60, order: 10 },
];

// Groups
export const MOCK_GROUPS: Group[] = [
  {
    id: "grp-001",
    name: "المجموعة 01",
    description: "مجموعة صباحية للتدريب على القيادة الأساسية",
    roomCode: "8oc882",
    classType: "B",
    currentTopic: "أولويات المرور",
    studentCount: 23,
    progress: 67,
    status: "active",
    createdAt: "2025-01-15T08:00:00Z",
    updatedAt: "2025-12-08T14:30:00Z",
  },
  {
    id: "grp-002",
    name: "المجموعة 02",
    description: "مجموعة مسائية - دراجات نارية",
    roomCode: "7xk291",
    classType: "A",
    currentTopic: "إشارات الطريق",
    studentCount: 18,
    progress: 45,
    status: "active",
    createdAt: "2025-02-20T10:00:00Z",
    updatedAt: "2025-12-07T16:00:00Z",
  },
  {
    id: "grp-003",
    name: "المجموعة 03",
    description: "مجموعة متقدمة - سيارات ثقيلة",
    roomCode: "9pl442",
    classType: "C",
    currentTopic: "قواعد الطريق",
    studentCount: 15,
    progress: 82,
    status: "active",
    createdAt: "2025-03-10T09:00:00Z",
    updatedAt: "2025-12-09T11:00:00Z",
  },
  {
    id: "grp-004",
    name: "المجموعة 04",
    description: "مجموعة نهاية الأسبوع",
    roomCode: "6nm113",
    classType: "B",
    currentTopic: "السلامة المرورية",
    studentCount: 28,
    progress: 34,
    status: "active",
    createdAt: "2025-04-05T08:30:00Z",
    updatedAt: "2025-12-06T09:00:00Z",
  },
  {
    id: "grp-005",
    name: "المجموعة 05",
    description: "مجموعة مكثفة - دورة سريعة",
    roomCode: "5rt774",
    classType: "B",
    currentTopic: "الوقوف والركن",
    studentCount: 20,
    progress: 91,
    status: "active",
    createdAt: "2025-05-12T07:00:00Z",
    updatedAt: "2025-12-09T08:00:00Z",
  },
  {
    id: "grp-006",
    name: "المجموعة 06",
    description: "مجموعة حافلات",
    roomCode: "4jk556",
    classType: "D",
    currentTopic: "القيادة الليلية",
    studentCount: 12,
    progress: 56,
    status: "active",
    createdAt: "2025-06-01T10:00:00Z",
    updatedAt: "2025-12-05T15:00:00Z",
  },
  {
    id: "grp-007",
    name: "المجموعة 07",
    description: "مجموعة مقطورات",
    roomCode: "3bh887",
    classType: "E",
    currentTopic: "سيناريوهات حقيقية",
    studentCount: 8,
    progress: 23,
    status: "active",
    createdAt: "2025-07-20T09:00:00Z",
    updatedAt: "2025-12-08T10:00:00Z",
  },
];

// Students
export const MOCK_STUDENTS: Student[] = [
  // Group 1 Students
  { id: "std-001", firstName: "شفوان", lastName: "زكرياء", email: "chetouane.zakaria@gmail.com", phone: "+213550123456", groupId: "grp-001", groupName: "المجموعة 01", progress: 78, averageGrade: 15.5, totalExamsTaken: 8, joinedAt: "2025-01-15T08:00:00Z", lastActiveAt: "2025-12-09T10:30:00Z", status: "active" },
  { id: "std-002", firstName: "عبد الحق", lastName: "بن بوزيان", email: "abdelhak.benbouziane@gmail.com", phone: "+213551234567", groupId: "grp-001", groupName: "المجموعة 01", progress: 92, averageGrade: 17.8, totalExamsTaken: 10, joinedAt: "2025-01-16T09:00:00Z", lastActiveAt: "2025-12-09T11:00:00Z", status: "active" },
  { id: "std-003", firstName: "أكرم", lastName: "صديق", email: "akram.seddik@gmail.com", phone: "+213552345678", groupId: "grp-001", groupName: "المجموعة 01", progress: 65, averageGrade: 14.2, totalExamsTaken: 7, joinedAt: "2025-01-17T10:00:00Z", lastActiveAt: "2025-12-08T16:00:00Z", status: "active" },
  { id: "std-004", firstName: "محمد", lastName: "بلقاسم", email: "mohamed.belkacem@gmail.com", phone: "+213553456789", groupId: "grp-001", groupName: "المجموعة 01", progress: 45, averageGrade: 12.0, totalExamsTaken: 5, joinedAt: "2025-01-20T08:30:00Z", lastActiveAt: "2025-12-07T14:00:00Z", status: "active" },
  { id: "std-005", firstName: "ياسين", lastName: "حمداني", email: "yassine.hamdani@gmail.com", phone: "+213554567890", groupId: "grp-001", groupName: "المجموعة 01", progress: 88, averageGrade: 16.5, totalExamsTaken: 9, joinedAt: "2025-01-22T09:00:00Z", lastActiveAt: "2025-12-09T09:00:00Z", status: "active" },
  
  // Group 2 Students
  { id: "std-006", firstName: "كريم", lastName: "بوعلام", email: "karim.boualam@gmail.com", phone: "+213555678901", groupId: "grp-002", groupName: "المجموعة 02", progress: 56, averageGrade: 13.5, totalExamsTaken: 6, joinedAt: "2025-02-20T10:00:00Z", lastActiveAt: "2025-12-08T11:00:00Z", status: "active" },
  { id: "std-007", firstName: "أمين", lastName: "مراد", email: "amine.mourad@gmail.com", phone: "+213556789012", groupId: "grp-002", groupName: "المجموعة 02", progress: 34, averageGrade: 11.0, totalExamsTaken: 4, joinedAt: "2025-02-21T11:00:00Z", lastActiveAt: "2025-12-06T15:00:00Z", status: "active" },
  { id: "std-008", firstName: "رضا", lastName: "بن عمر", email: "reda.benomar@gmail.com", phone: "+213557890123", groupId: "grp-002", groupName: "المجموعة 02", progress: 72, averageGrade: 15.0, totalExamsTaken: 7, joinedAt: "2025-02-25T09:00:00Z", lastActiveAt: "2025-12-09T08:00:00Z", status: "active" },
  
  // Group 3 Students
  { id: "std-009", firstName: "سمير", lastName: "قادري", email: "samir.kadri@gmail.com", phone: "+213558901234", groupId: "grp-003", groupName: "المجموعة 03", progress: 95, averageGrade: 18.5, totalExamsTaken: 12, joinedAt: "2025-03-10T09:00:00Z", lastActiveAt: "2025-12-09T07:00:00Z", status: "active" },
  { id: "std-010", firstName: "نور الدين", lastName: "العربي", email: "noureddine.arabi@gmail.com", phone: "+213559012345", groupId: "grp-003", groupName: "المجموعة 03", progress: 81, averageGrade: 16.0, totalExamsTaken: 10, joinedAt: "2025-03-12T10:00:00Z", lastActiveAt: "2025-12-08T12:00:00Z", status: "active" },
];

// Templates
export const MOCK_TEMPLATES: Template[] = [
  {
    id: "tpl-001",
    name: "الاختبار النهائي - صنف ب",
    description: "اختبار شامل يغطي جميع المواضيع الأساسية لرخصة القيادة صنف ب",
    questionsCount: 40,
    classType: "B",
    topic: "شامل",
    difficulty: "medium",
    timeLimit: 45,
    passingScore: 70,
    randomizeQuestions: true,
    randomizeAnswers: true,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-11-15T10:00:00Z",
    createdBy: "admin",
    usageCount: 156,
  },
  {
    id: "tpl-002",
    name: "اختبار إشارات الطريق",
    description: "اختبار متخصص في إشارات المرور والعلامات الطرقية",
    questionsCount: 30,
    classType: "B",
    topic: "إشارات الطريق",
    difficulty: "hard",
    timeLimit: 30,
    passingScore: 75,
    randomizeQuestions: true,
    randomizeAnswers: false,
    createdAt: "2025-02-20T09:00:00Z",
    updatedAt: "2025-10-20T14:00:00Z",
    createdBy: "admin",
    usageCount: 89,
  },
  {
    id: "tpl-003",
    name: "إمتحان المحاكاة",
    description: "محاكاة للامتحان الرسمي مع نفس الشروط والوقت",
    questionsCount: 40,
    classType: "B",
    topic: "سيناريوهات حقيقية",
    difficulty: "very_hard",
    timeLimit: 40,
    passingScore: 80,
    randomizeQuestions: true,
    randomizeAnswers: true,
    createdAt: "2025-03-15T10:00:00Z",
    updatedAt: "2025-12-01T09:00:00Z",
    createdBy: "admin",
    usageCount: 234,
  },
  {
    id: "tpl-004",
    name: "الإمتحان التمهيدي",
    description: "اختبار أساسي للمبتدئين يغطي أساسيات القيادة",
    questionsCount: 20,
    classType: "B",
    topic: "أساسيات القيادة",
    difficulty: "easy",
    timeLimit: 20,
    passingScore: 60,
    randomizeQuestions: false,
    randomizeAnswers: false,
    createdAt: "2025-04-10T08:30:00Z",
    updatedAt: "2025-09-25T11:00:00Z",
    createdBy: "admin",
    usageCount: 312,
  },
  {
    id: "tpl-005",
    name: "إمتحان السرعات والمسافات",
    description: "اختبار حول حدود السرعة ومسافات الأمان",
    questionsCount: 25,
    classType: "B",
    topic: "السرعات",
    difficulty: "very_easy",
    timeLimit: 25,
    passingScore: 65,
    randomizeQuestions: true,
    randomizeAnswers: true,
    createdAt: "2025-05-05T09:00:00Z",
    updatedAt: "2025-08-15T10:00:00Z",
    createdBy: "admin",
    usageCount: 178,
  },
  {
    id: "tpl-006",
    name: "اختبار أولويات المرور",
    description: "اختبار متقدم في قواعد الأولوية والتقاطعات",
    questionsCount: 35,
    classType: "B",
    topic: "أولويات المرور",
    difficulty: "hard",
    timeLimit: 35,
    passingScore: 75,
    randomizeQuestions: true,
    randomizeAnswers: true,
    createdAt: "2025-06-01T08:00:00Z",
    updatedAt: "2025-11-30T16:00:00Z",
    createdBy: "admin",
    usageCount: 145,
  },
  {
    id: "tpl-007",
    name: "اختبار الدراجات النارية",
    description: "اختبار خاص برخصة الدراجات النارية صنف أ",
    questionsCount: 30,
    classType: "A",
    topic: "شامل",
    difficulty: "medium",
    timeLimit: 30,
    passingScore: 70,
    randomizeQuestions: true,
    randomizeAnswers: true,
    createdAt: "2025-07-10T10:00:00Z",
    updatedAt: "2025-10-10T12:00:00Z",
    createdBy: "admin",
    usageCount: 67,
  },
  {
    id: "tpl-008",
    name: "اختبار السيارات الثقيلة",
    description: "اختبار متخصص للمركبات الثقيلة صنف ت",
    questionsCount: 45,
    classType: "C",
    topic: "شامل",
    difficulty: "very_hard",
    timeLimit: 50,
    passingScore: 80,
    randomizeQuestions: true,
    randomizeAnswers: false,
    createdAt: "2025-08-20T09:00:00Z",
    updatedAt: "2025-11-05T14:00:00Z",
    createdBy: "admin",
    usageCount: 45,
  },
];

// Exams (Quiz Instances)
export const MOCK_EXAMS: Exam[] = [
  {
    id: "exam-001",
    name: "اختبار أولويات المرور - الأسبوع 1",
    templateId: "tpl-006",
    templateName: "اختبار أولويات المرور",
    groupId: "grp-001",
    groupName: "المجموعة 01",
    topic: "أولويات المرور",
    questionsCount: 35,
    timeLimit: 35,
    startDate: "2025-12-09T08:00:00Z",
    endDate: "2025-12-09T18:00:00Z",
    status: "active",
    participantsCount: 23,
    completedCount: 18,
    averageScore: 72.5,
    passRate: 78,
    createdAt: "2025-12-08T10:00:00Z",
  },
  {
    id: "exam-002",
    name: "اختبار إشارات الطريق - الجزء 1",
    templateId: "tpl-002",
    templateName: "اختبار إشارات الطريق",
    groupId: "grp-001",
    groupName: "المجموعة 01",
    topic: "إشارات الطريق",
    questionsCount: 30,
    timeLimit: 30,
    startDate: "2025-12-01T08:00:00Z",
    endDate: "2025-12-01T18:00:00Z",
    status: "closed",
    participantsCount: 23,
    completedCount: 23,
    averageScore: 68.3,
    passRate: 65,
    createdAt: "2025-11-30T14:00:00Z",
  },
  {
    id: "exam-003",
    name: "الاختبار التمهيدي - مجموعة 2",
    templateId: "tpl-004",
    templateName: "الإمتحان التمهيدي",
    groupId: "grp-002",
    groupName: "المجموعة 02",
    topic: "أساسيات القيادة",
    questionsCount: 20,
    timeLimit: 20,
    startDate: "2025-12-15T09:00:00Z",
    endDate: "2025-12-15T17:00:00Z",
    status: "scheduled",
    participantsCount: 18,
    completedCount: 0,
    averageScore: 0,
    passRate: 0,
    createdAt: "2025-12-07T11:00:00Z",
  },
  {
    id: "exam-004",
    name: "إمتحان المحاكاة النهائي",
    templateId: "tpl-003",
    templateName: "إمتحان المحاكاة",
    groupId: "grp-003",
    groupName: "المجموعة 03",
    topic: "سيناريوهات حقيقية",
    questionsCount: 40,
    timeLimit: 40,
    startDate: "2025-12-10T08:00:00Z",
    endDate: "2025-12-10T20:00:00Z",
    status: "scheduled",
    participantsCount: 15,
    completedCount: 0,
    averageScore: 0,
    passRate: 0,
    createdAt: "2025-12-05T09:00:00Z",
  },
  {
    id: "exam-005",
    name: "اختبار السرعات - مراجعة",
    templateId: "tpl-005",
    templateName: "إمتحان السرعات والمسافات",
    groupId: "grp-004",
    groupName: "المجموعة 04",
    topic: "السرعات",
    questionsCount: 25,
    timeLimit: 25,
    startDate: "2025-11-25T08:00:00Z",
    endDate: "2025-11-25T16:00:00Z",
    status: "closed",
    participantsCount: 28,
    completedCount: 26,
    averageScore: 81.2,
    passRate: 92,
    createdAt: "2025-11-23T10:00:00Z",
  },
  {
    id: "exam-006",
    name: "اختبار الدراجات - مجموعة 2",
    templateId: "tpl-007",
    templateName: "اختبار الدراجات النارية",
    groupId: "grp-002",
    groupName: "المجموعة 02",
    topic: "شامل",
    questionsCount: 30,
    timeLimit: 30,
    startDate: "2025-12-09T14:00:00Z",
    endDate: "2025-12-09T22:00:00Z",
    status: "active",
    participantsCount: 18,
    completedCount: 8,
    averageScore: 74.0,
    passRate: 75,
    createdAt: "2025-12-08T16:00:00Z",
  },
];

// Lessons for group details
export const MOCK_LESSONS: Lesson[] = [
  { id: "lsn-001", name: "مقدمة في قواعد المرور", topic: "أساسيات القيادة", completedStudents: 22, totalStudents: 23, averageProgress: 95, averageGrade: 16.5, order: 1 },
  { id: "lsn-002", name: "إشارات التحذير", topic: "إشارات الطريق", completedStudents: 21, totalStudents: 23, averageProgress: 91, averageGrade: 15.8, order: 2 },
  { id: "lsn-003", name: "إشارات الإلزام", topic: "إشارات الطريق", completedStudents: 20, totalStudents: 23, averageProgress: 87, averageGrade: 15.2, order: 3 },
  { id: "lsn-004", name: "إشارات المنع", topic: "إشارات الطريق", completedStudents: 19, totalStudents: 23, averageProgress: 82, averageGrade: 14.8, order: 4 },
  { id: "lsn-005", name: "قواعد الأولوية", topic: "أولويات المرور", completedStudents: 17, totalStudents: 23, averageProgress: 74, averageGrade: 14.2, order: 5 },
  { id: "lsn-006", name: "التقاطعات", topic: "أولويات المرور", completedStudents: 15, totalStudents: 23, averageProgress: 65, averageGrade: 13.5, order: 6 },
  { id: "lsn-007", name: "الدوارات", topic: "أولويات المرور", completedStudents: 12, totalStudents: 23, averageProgress: 52, averageGrade: 12.8, order: 7 },
  { id: "lsn-008", name: "السرعات المحددة", topic: "السرعات", completedStudents: 10, totalStudents: 23, averageProgress: 43, averageGrade: 12.0, order: 8 },
  { id: "lsn-009", name: "مسافات الأمان", topic: "السلامة المرورية", completedStudents: 8, totalStudents: 23, averageProgress: 35, averageGrade: 11.5, order: 9 },
  { id: "lsn-010", name: "قواعد الوقوف والتوقف", topic: "قواعد الوقوف", completedStudents: 5, totalStudents: 23, averageProgress: 22, averageGrade: 10.8, order: 10 },
];

// Sample Questions for templates
export const MOCK_QUESTIONS: Question[] = [
  {
    id: "q-001",
    type: "single",
    questionText: "إلى ماذا تشير هذه العلامة؟",
    image: "/assets/images/signs/stop.png",
    answers: [
      { id: "a-001-1", text: "توقف إلزامي", isCorrect: true },
      { id: "a-001-2", text: "أفضلية المرور", isCorrect: false },
      { id: "a-001-3", text: "ممنوع الدخول", isCorrect: false },
      { id: "a-001-4", text: "نهاية الأولوية", isCorrect: false },
    ],
    points: 2,
    timeLimit: 30,
    topic: "إشارات الطريق",
    difficulty: "easy",
    explanation: "علامة التوقف الإلزامي (STOP) تعني أنه يجب على السائق التوقف تماماً والتأكد من خلو الطريق قبل المتابعة.",
    createdAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "q-002",
    type: "multiple",
    questionText: "أي من الحالات التالية يُمنع فيها التجاوز؟",
    image: null,
    answers: [
      { id: "a-002-1", text: "عند التقاطعات", isCorrect: true },
      { id: "a-002-2", text: "على الخط المتواصل", isCorrect: true },
      { id: "a-002-3", text: "على الطريق السريع", isCorrect: false },
      { id: "a-002-4", text: "بالقرب من معابر المشاة", isCorrect: true },
    ],
    points: 3,
    timeLimit: 45,
    topic: "قواعد الطريق",
    difficulty: "medium",
    explanation: "يُمنع التجاوز في عدة حالات منها: التقاطعات، الخط المتواصل، معابر المشاة، والمنعطفات.",
    createdAt: "2025-01-12T09:00:00Z",
  },
  {
    id: "q-003",
    type: "T_F",
    questionText: "يمكن للسائق تجاوز السرعة المحددة في حالات الطوارئ.",
    image: null,
    answers: [
      { id: "a-003-1", text: "صحيح", isCorrect: false },
      { id: "a-003-2", text: "خطأ", isCorrect: true },
    ],
    points: 1,
    timeLimit: 20,
    topic: "السرعات",
    difficulty: "easy",
    explanation: "لا يُسمح بتجاوز السرعة المحددة تحت أي ظرف. سيارات الطوارئ لها استثناءات خاصة.",
    createdAt: "2025-01-15T10:00:00Z",
  },
  {
    id: "q-004",
    type: "single",
    questionText: "ما هي مسافة الأمان المطلوبة داخل المدينة؟",
    image: null,
    answers: [
      { id: "a-004-1", text: "متران على الأقل", isCorrect: false },
      { id: "a-004-2", text: "ثانيتان من الزمن", isCorrect: true },
      { id: "a-004-3", text: "خمسة أمتار", isCorrect: false },
      { id: "a-004-4", text: "عشرة أمتار", isCorrect: false },
    ],
    points: 2,
    timeLimit: 30,
    topic: "السلامة المرورية",
    difficulty: "medium",
    explanation: "مسافة الأمان داخل المدينة تُقاس بالزمن وليس بالمسافة، وهي ثانيتان على الأقل.",
    createdAt: "2025-01-18T08:30:00Z",
  },
  {
    id: "q-005",
    type: "single",
    questionText: "في هذا التقاطع، من له الأولوية؟",
    image: "/assets/images/scenarios/intersection1.png",
    answers: [
      { id: "a-005-1", text: "السيارة الحمراء", isCorrect: false },
      { id: "a-005-2", text: "السيارة الزرقاء", isCorrect: true },
      { id: "a-005-3", text: "السيارة البيضاء", isCorrect: false },
      { id: "a-005-4", text: "الشاحنة", isCorrect: false },
    ],
    points: 3,
    timeLimit: 45,
    topic: "أولويات المرور",
    difficulty: "hard",
    explanation: "السيارة القادمة من اليمين لها الأولوية في التقاطعات غير المنظمة.",
    createdAt: "2025-01-20T09:00:00Z",
  },
];

// ============================================================================
// API SIMULATION FUNCTIONS
// ============================================================================

/**
 * GET /api/dashboard/stats
 */
export const getDashboardStats = (): DashboardStats => {
  const activeExams = MOCK_EXAMS.filter(e => e.status === "active").length;
  const scheduledExams = MOCK_EXAMS.filter(e => e.status === "scheduled").length;
  const closedExams = MOCK_EXAMS.filter(e => e.status === "closed").length;
  const totalStudents = MOCK_GROUPS.reduce((sum, g) => sum + g.studentCount, 0);
  const avgPassRate = MOCK_EXAMS.filter(e => e.status === "closed").reduce((sum, e) => sum + e.passRate, 0) / closedExams || 0;

  return {
    totalGroups: MOCK_GROUPS.length,
    totalStudents,
    totalTemplates: MOCK_TEMPLATES.length,
    activeExams,
    scheduledExams,
    closedExams,
    averagePassRate: Math.round(avgPassRate),
  };
};

/**
 * GET /api/groups
 */
export const getGroups = (): Group[] => MOCK_GROUPS;

/**
 * GET /api/groups/:id
 */
export const getGroupById = (id: string): Group | undefined => 
  MOCK_GROUPS.find(g => g.id === id);

/**
 * GET /api/groups/:id/students
 */
export const getGroupStudents = (groupId: string): Student[] => 
  MOCK_STUDENTS.filter(s => s.groupId === groupId);

/**
 * GET /api/groups/:id/lessons
 */
export const getGroupLessons = (groupId: string): Lesson[] => MOCK_LESSONS;

/**
 * GET /api/students
 */
export const getStudents = (): Student[] => MOCK_STUDENTS;

/**
 * GET /api/students/:id
 */
export const getStudentById = (id: string): Student | undefined =>
  MOCK_STUDENTS.find(s => s.id === id);

/**
 * GET /api/templates
 */
export const getTemplates = (): Template[] => MOCK_TEMPLATES;

/**
 * GET /api/templates/:id
 */
export const getTemplateById = (id: string): Template | undefined =>
  MOCK_TEMPLATES.find(t => t.id === id);

/**
 * GET /api/templates/:id/questions
 */
export const getTemplateQuestions = (templateId: string): Question[] => MOCK_QUESTIONS;

/**
 * POST /api/templates
 * Create a new template
 */
export const createTemplate = (data: {
  name: string;
  description: string;
  topic: string;
  classType: string;
  questionsCount: number;
  timeLimit: number;
}): Template => {
  const newTemplate: Template = {
    id: `template-${Date.now()}`,
    name: data.name,
    description: data.description,
    topic: data.topic,
    classType: data.classType,
    questionsCount: data.questionsCount,
    difficulty: "medium", // Default difficulty
    timeLimit: data.timeLimit,
    passingScore: 70, // Default passing score
    randomizeQuestions: false,
    randomizeAnswers: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "current-user",
    usageCount: 0,
  };
  MOCK_TEMPLATES.push(newTemplate);
  return newTemplate;
};

/**
 * GET /api/exams
 */
export const getExams = (): Exam[] => MOCK_EXAMS;

/**
 * GET /api/exams/:id
 */
export const getExamById = (id: string): Exam | undefined =>
  MOCK_EXAMS.find(e => e.id === id);

/**
 * POST /api/exams
 * Create a new exam from a template
 */
export const createExam = (data: {
  name: string;
  templateId: string;
  groupId: string;
  startDate: Date;
  endDate: Date;
}): Exam => {
  const template = getTemplateById(data.templateId);
  const group = getGroupById(data.groupId);
  const studentsInGroup = getGroupStudents(data.groupId);
  
  const newExam: Exam = {
    id: `exam-${Date.now()}`,
    name: data.name,
    templateId: data.templateId,
    templateName: template?.name || "Unknown Template",
    groupId: data.groupId,
    groupName: group?.name || "Unknown Group",
    topic: template?.topic || "General",
    questionsCount: template?.questionsCount || 0,
    timeLimit: template?.timeLimit || 30,
    startDate: data.startDate.toISOString(),
    endDate: data.endDate.toISOString(),
    status: "scheduled",
    participantsCount: studentsInGroup.length,
    completedCount: 0,
    averageScore: 0,
    passRate: 0,
    createdAt: new Date().toISOString(),
  };
  MOCK_EXAMS.push(newExam);
  return newExam;
};

/**
 * GET /api/topics
 */
export const getTopics = (): Topic[] => MOCK_TOPICS;

/**
 * GET /api/classes
 */
export const getLicenseClasses = (): LicenseClass[] => MOCK_LICENSE_CLASSES;

/**
 * Calculate stats for a specific group
 */
export const getGroupStats = (groupId: string) => {
  const group = getGroupById(groupId);
  const students = getGroupStudents(groupId);
  const groupExams = MOCK_EXAMS.filter(e => e.groupId === groupId);
  
  if (!group) return null;

  const avgGrade = students.length > 0 
    ? students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length 
    : 0;

  return {
    studentCount: students.length,
    averageGrade: avgGrade.toFixed(1),
    totalExams: groupExams.length,
    progressRate: group.progress,
  };
};

// ============================================================================
// SETTINGS API FUNCTIONS
// ============================================================================

/**
 * GET /api/settings/school
 */
export const getSchoolInfo = (): SchoolInfo => MOCK_SCHOOL_INFO;

/**
 * PUT /api/settings/school
 */
export const updateSchoolInfo = (data: Partial<SchoolInfo>): SchoolInfo => {
  MOCK_SCHOOL_INFO = { ...MOCK_SCHOOL_INFO, ...data };
  return MOCK_SCHOOL_INFO;
};

/**
 * GET /api/settings/owner
 */
export const getOwnerInfo = (): OwnerInfo => MOCK_OWNER_INFO;

/**
 * PUT /api/settings/owner
 */
export const updateOwnerInfo = (data: Partial<OwnerInfo>): OwnerInfo => {
  MOCK_OWNER_INFO = { ...MOCK_OWNER_INFO, ...data };
  return MOCK_OWNER_INFO;
};
