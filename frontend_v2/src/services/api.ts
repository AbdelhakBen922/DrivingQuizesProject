/**
 * =============================================================================
 * API SERVICE
 * =============================================================================
 * This file contains all API call functions for the backend.
 * Replace mockData imports with these functions when connecting to the backend.
 * 
 * BASE_URL should be set via environment variable in production
 * =============================================================================
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

// =============================================================================
// TYPES (should match backend schemas)
// =============================================================================

export interface ApiError {
  detail: string;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface StudentLoginRequest {
  student_code: string;
  password: string;
}

export interface QuickCodeRequest {
  student_code: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  school_name: string;
  owner_name: string;
  email: string;
  phone: string;
  password: string;
}

// Dashboard Stats
export interface DashboardStats {
  total_rooms: number;
  total_students: number;
  upcoming_quizzes: number;
  active_quizzes: number;
}

// Dashboard Overview Types
export interface DashboardOverviewMetrics {
  total_rooms: number;
  total_students: number;
  upcoming_quizzes: number;
  active_quizzes: number;
}

export interface DashboardExamResultPoint {
  month: string;
  average_score: number;
  attempt_count: number;
}

export interface DashboardRoomProgress {
  room_id: number;
  room_name: string;
  completion_percent: number;
}

export interface DashboardRecentRegistration {
  student_id: number;
  full_name: string;
  room_name: string | null;
  created_at: string;
}

export interface DashboardTopStudent {
  student_id: number;
  full_name: string;
  average_score: number;
  attempt_count: number;
}

export interface DashboardOverviewResponse {
  metrics: DashboardOverviewMetrics;
  exam_results: DashboardExamResultPoint[];
  study_progress: DashboardRoomProgress[];
  recent_registrations: DashboardRecentRegistration[];
  top_students: DashboardTopStudent[];
}

export interface DashboardStatsResponse {
  total_groups: number;
  total_students: number;
  total_instructors: number;
  active_exams: number;
}

// Rooms (Groups)
export interface Room {
  id: number;
  school_id: number;
  name: string;
  description: string | null;
  room_type: 'a' | 'b' | 'c' | 'd';
  created_by_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface RoomCreateRequest {
  name: string;
  description?: string | null;
  room_type?: 'a' | 'b' | 'c' | 'd';
}

export interface RoomUpdateRequest {
  name?: string;
  description?: string | null;
  room_type?: 'a' | 'b' | 'c' | 'd';
}

export interface RoomDetail {
  room: Room;
  students: RoomStudentSummary[];
  quizzes: RoomQuizSummary[];
}

export interface RoomStudentSummary {
  membership_id: number;
  student_id: number | null;
  full_name: string | null;
  student_code: string | null;
  email: string | null;
  status: string;
  joined_at: string;
  left_at: string | null;
}

export interface RoomQuizSummary {
  quiz_id: number;
  quiz_title: string;
  template_name: string | null;
  starts_at: string | null;
  ends_at: string | null;
  deleted_at: string | null;
}

// Students
// Students
export interface Student {
  id: number;
  school_id: number;
  full_name: string;
  student_code: string;
  password_hash: string;
  dob: string | null;
  national_id: string | null;
  phone: string | null;
  email: string | null;
  profile_data: Record<string, any>;
  created_by_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface StudentCreateRequest {
  full_name: string;
  student_code: string;
  password: string;
  dob?: string | null;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  profile_data?: Record<string, any> | null;
}

export interface StudentUpdateRequest {
  full_name?: string;
  student_code?: string;
  password?: string;
  dob?: string | null;
  national_id?: string | null;
  phone?: string | null;
  email?: string | null;
  profile_data?: Record<string, any> | null;
}

export interface StudentWithRooms extends Student {
  rooms: Array<{
    room_id: number;
    room_name: string;
    room_code: string;
    status: string;
    joined_at: string;
  }>;
}

// Room Members
export interface RoomMemberAddRequest {
  student_id: number;
}

export interface RoomMember {
  id: number;
  room_id: number;
  student_id: number | null;
  joined_at: string | null;
  left_at: string | null;
  status: 'active' | 'left' | 'removed';
}

// Quizzes/Exams
export interface Quiz {
  id: number;
  school_id: number | null;
  template_id: number | null;
  room_id: number | null;
  setting_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_by_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// Quiz Templates
export interface QuizTemplate {
  id: number;
  school_id: number | null;
  title: string;
  description: string | null;
  topic_id: number | null;
  difficulty: 'easy' | 'medium' | 'hard';
  default_duration_sec: number | null;
  settings: Record<string, unknown>;
  is_public: boolean;
  created_by_id: number | null;
  question_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface QuestionChoice {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
  position: number;
}

export interface QuestionWithChoicesRead {
  id: number;
  text: string;
  image_url: string | null;
  category: 'sign' | 'rule' | 'priority' | 'speed' | 'safety' | 'mechanics';
  type: 'single_choice' | 'multiple_choice';
  difficulty: 'easy' | 'medium' | 'hard';
  is_required: boolean;
  score: number;
  explanation: string | null;
  tags: Record<string, unknown>;
  version: number;
  school_id: number | null;
  author_id: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  choices: QuestionChoice[];
}

export interface QuestionChoiceInput {
  text_ar: string;
  text_fr: string;
  is_correct: boolean;
  position?: number;
}

export interface QuestionWithChoicesCreate {
  text_ar: string;
  text_fr: string;
  image_url?: string | null;
  category: 'sign' | 'rule' | 'priority' | 'speed' | 'safety' | 'mechanics';
  type?: 'single_choice' | 'multiple_choice';
  difficulty?: 'easy' | 'medium' | 'hard';
  is_required?: boolean;
  score?: number;
  explanation?: string | null;
  tags?: Record<string, unknown>;
  version?: number;
  choices: QuestionChoiceInput[];
}

export interface QuizTemplateQuestionWithQuestion {
  id: number;
  template_id: number;
  question_id: number;
  position: number | null;
  duration_sec: number | null;
  is_required: boolean;
  randomize_options: boolean;
  estimation_time_seconds: number | null;
  question: QuestionWithChoicesRead;
}

export interface QuizTemplateDetail extends Omit<QuizTemplate, 'question_count'> {
  questions: QuizTemplateQuestionWithQuestion[];
}

export interface QuizTemplateQuestionInput {
  question_id?: number;
  question?: QuestionWithChoicesCreate;
  position?: number;
  duration_sec?: number | null;
  is_required?: boolean;
  randomize_options?: boolean;
  estimation_time_seconds?: number | null;
}

export interface QuizTemplateCreateRequest {
  title: string;
  description?: string | null;
  topic_id?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  default_duration_sec?: number | null;
  settings?: Record<string, unknown>;
  is_public?: boolean;
  questions: QuizTemplateQuestionInput[];
}

export interface QuizTemplateUpdateRequest {
  title?: string;
  description?: string | null;
  topic_id?: number | null;
  difficulty?: 'easy' | 'medium' | 'hard';
  default_duration_sec?: number | null;
  settings?: Record<string, unknown>;
  is_public?: boolean;
  questions?: QuizTemplateQuestionInput[];
}

// Quiz Settings for creating exams
export interface QuizSettingCreate {
  vehicle_type?: 'car' | 'motorcycle' | 'truck' | 'bus';
  mode?: 'training' | 'exam' | 'practice';
  question_count?: number;
  randomize_questions?: boolean;
  randomize_choices?: boolean;
  passing_score?: number;
  review_allowed?: boolean;
}

// Dashboard Quiz Create (for assigning exams)
export interface DashboardQuizCreateRequest {
  title_ar: string;
  title_fr: string;
  description?: string | null;
  template_id: number;
  room_id: number;
  starts_at?: string | null;
  ends_at?: string | null;
  is_public?: boolean;
  settings: QuizSettingCreate;
}

// Settings
export interface DashboardSchoolInfo {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface DashboardOwnerInfo {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url: string | null;
}

export interface DashboardSettingsResponse {
  school: DashboardSchoolInfo;
  owner: DashboardOwnerInfo;
}

export interface DashboardSchoolUpdate {
  name: string;
  email: string;
  address: string;
  phone: string;
}

export interface DashboardOwnerUpdate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  avatar_url?: string | null;
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

let authToken: string | null = null;

export function setAuthToken(token: string) {
  authToken = token;
  localStorage.setItem("auth_token", token);
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem("auth_token");
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem("auth_token");
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "An error occurred",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

// =============================================================================
// AUTH API
// =============================================================================

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/dashboard/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Login failed",
    }));
    throw new Error(error.detail);
  }

  const result = await response.json();
  setAuthToken(result.access_token);
  return result;
}

export async function register(data: RegisterRequest): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/dashboard/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Registration failed",
    }));
    throw new Error(error.detail);
  }
}

export function logout() {
  clearAuthToken();
}

export async function studentLogin(data: StudentLoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/student/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Student login failed",
    }));
    throw new Error(error.detail);
  }

  const result = await response.json();
  setAuthToken(result.access_token);
  return result;
}

export async function quickCodeEntry(studentCode: string): Promise<LoginResponse> {
  // For quick code entry, we use a temporary password or guest mode
  // This creates a session without full authentication
  const response = await fetch(`${API_BASE_URL}/student/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      student_code: studentCode,
      password: "", // Empty password for guest mode - backend should handle this
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Invalid student code",
    }));
    throw new Error(error.detail);
  }

  const result = await response.json();
  setAuthToken(result.access_token);
  return result;
}

/**
 * Get student dashboard overview stats
 */
export async function getStudentDashboardOverview(): Promise<{
  total_quizzes: number;
  completed_quizzes: number;
  pending_quizzes: number;
  average_score: number;
  student_name: string;
  student_code: string;
}> {
  const response = await fetch(`${API_BASE_URL}/student/dashboard/overview`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to load dashboard",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Get assigned quizzes for student
 */
export async function getAssignedQuizzes(): Promise<Array<{
  quiz_id: number;
  title: string;
  description: string | null;
  room_name: string;
  due_date: string | null;
  time_limit_minutes: number | null;
  total_questions: number;
  status: "not_started" | "in_progress" | "completed";
  best_score: number | null;
  attempts_count: number;
  max_attempts: number | null;
}>> {
  const response = await fetch(`${API_BASE_URL}/student/dashboard/quizzes/assigned`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to load quizzes",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

export function getUserType(): string | null {
  return localStorage.getItem("userType");
}

/**
 * Start a new quiz attempt
 */
export async function startQuiz(quizId: number, lang: string = "fr"): Promise<{
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  attempt_number: number;
  total_questions: number;
  questions: Array<{
    id: number;
    text: string;
    image_url: string | null;
    choices: Array<{
      id: number;
      text: string;
      position: number;
    }>;
    answered_choice_id: number | null;
    duration_sec: number | null;
  }>;
}> {
  const response = await fetch(`${API_BASE_URL}/student/quiz/${quizId}/start?lang=${lang}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to start quiz",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Start a training quiz session with random questions
 */
export async function startTrainingQuiz(
  questionCount: number = 10,
  vehicleType: string = "car",
  lang: string = "fr"
): Promise<{
  attempt_id: number;
  quiz_id: number;
  quiz_title: string;
  attempt_number: number;
  total_questions: number;
  questions: Array<{
    id: number;
    text: string;
    image_url: string | null;
    choices: Array<{
      id: number;
      text: string;
      position: number;
    }>;
    answered_choice_id: number | null;
    duration_sec: number | null;
  }>;
}> {
  const response = await fetch(`${API_BASE_URL}/student/quiz/training/start?lang=${lang}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify({
      question_count: questionCount,
      vehicle_type: vehicleType,
    }),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to start training quiz",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}


/**
 * Submit an answer for a question
 */
export async function submitQuizAnswer(
  quizId: number,
  data: { question_id: number; choice_id: number }
): Promise<{ success: boolean; message: string; is_correct: boolean }> {
  const response = await fetch(`${API_BASE_URL}/student/quiz/${quizId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to submit answer",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Finish quiz and get results
 */
export async function finishQuiz(quizId: number): Promise<{
  attempt_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  passed: boolean;
}> {
  const response = await fetch(`${API_BASE_URL}/student/quiz/${quizId}/finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to finish quiz",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

/**
 * Get quiz review with correct answers
 */
export async function getQuizReview(quizId: number, attemptId: number, lang: string = "fr"): Promise<{
  attempt_id: number;
  quiz_title: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  percentage: number;
  passed: boolean;
  questions: Array<{
    id: number;
    text: string;
    image_url: string | null;
    student_answer_choice_id: number | null;
    correct_choice_id: number;
    is_correct: boolean;
    choices: Array<{
      id: number;
      text: string;
      position: number;
    }>;
  }>;
}> {
  const response = await fetch(
    `${API_BASE_URL}/student/quiz/${quizId}/review/${attemptId}?lang=${lang}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAuthToken()}`,
      },
    }
  );

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Failed to get quiz review",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

// =============================================================================
// DASHBOARD OVERVIEW API
// =============================================================================

export async function getDashboardStats(): Promise<DashboardStats> {
  return fetchAPI<DashboardStats>("/dashboard/overview/stats");
}

export async function getDashboardOverview(): Promise<DashboardOverviewResponse> {
  return fetchAPI<DashboardOverviewResponse>("/dashboard/overview/");
}

export async function getDashboardStatsDetailed(): Promise<DashboardStatsResponse> {
  return fetchAPI<DashboardStatsResponse>("/dashboard/overview/stats");
}

// =============================================================================
// ROOMS (GROUPS) API
// =============================================================================

export async function getRooms(): Promise<Room[]> {
  return fetchAPI<Room[]>("/dashboard/rooms/");
}

export async function getRoomDetail(roomId: number): Promise<RoomDetail> {
  return fetchAPI<RoomDetail>(`/dashboard/rooms/${roomId}`);
}

export async function createRoom(data: RoomCreateRequest): Promise<Room> {
  return fetchAPI<Room>("/dashboard/rooms/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRoom(
  roomId: number,
  data: RoomUpdateRequest
): Promise<Room> {
  return fetchAPI<Room>(`/dashboard/rooms/${roomId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRoom(roomId: number): Promise<void> {
  return fetchAPI<void>(`/dashboard/rooms/${roomId}`, {
    method: "DELETE",
  });
}

export async function addStudentToRoom(
  roomId: number,
  studentId: number
): Promise<void> {
  return fetchAPI<void>(`/dashboard/rooms/${roomId}/members`, {
    method: "POST",
    body: JSON.stringify({ student_id: studentId }),
  });
}

export async function removeStudentFromRoom(
  roomId: number,
  membershipId: number
): Promise<void> {
  return fetchAPI<void>(`/dashboard/rooms/${roomId}/members/${membershipId}`, {
    method: "DELETE",
  });
}

export async function assignQuizToRoom(
  roomId: number,
  quizId: number
): Promise<Quiz> {
  return fetchAPI<Quiz>(`/dashboard/rooms/${roomId}/assign-quiz`, {
    method: "POST",
    body: JSON.stringify({ quiz_id: quizId }),
  });
}

// =============================================================================
// STUDENTS API
// =============================================================================

export async function listStudents(params?: {
  limit?: number;
  offset?: number;
  search?: string;
}): Promise<Student[]> {
  const queryParams = new URLSearchParams();
  if (params?.limit) queryParams.append("limit", params.limit.toString());
  if (params?.offset) queryParams.append("offset", params.offset.toString());
  if (params?.search) queryParams.append("search", params.search);

  const url = `/dashboard/students/${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
  return fetchAPI<Student[]>(url);
}

export async function getStudent(studentId: number): Promise<Student> {
  return fetchAPI<Student>(`/dashboard/students/${studentId}`);
}

export async function createStudent(
  data: StudentCreateRequest
): Promise<Student> {
  return fetchAPI<Student>("/dashboard/students/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateStudent(
  studentId: number,
  data: StudentUpdateRequest
): Promise<Student> {
  return fetchAPI<Student>(`/dashboard/students/${studentId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteStudent(studentId: number): Promise<void> {
  return fetchAPI<void>(`/dashboard/students/${studentId}`, {
    method: "DELETE",
  });
}

export async function getStudentRooms(studentId: number): Promise<RoomMember[]> {
  // This would need a backend endpoint - for now we'll query through rooms
  return fetchAPI<RoomMember[]>(`/dashboard/students/${studentId}/rooms`);
}


// =============================================================================
// QUIZZES/EXAMS API
// =============================================================================

export async function getQuizzes(): Promise<Quiz[]> {
  return fetchAPI<Quiz[]>("/dashboard/quizzes/");
}

export async function getQuiz(quizId: number): Promise<Quiz> {
  return fetchAPI<Quiz>(`/dashboard/quizzes/${quizId}`);
}

export async function createDashboardQuiz(data: DashboardQuizCreateRequest): Promise<Quiz> {
  return fetchAPI<Quiz>("/dashboard/quizzes/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteQuiz(quizId: number): Promise<void> {
  return fetchAPI<void>(`/dashboard/quizzes/${quizId}`, {
    method: "DELETE",
  });
}

export async function updateQuiz(quizId: number, data: Partial<{
  title?: string;
  description?: string;
  starts_at?: string;
  ends_at?: string;
  is_public?: boolean;
  room_id?: number;
  template_id?: number;
}>): Promise<Quiz> {
  return fetchAPI<Quiz>(`/dashboard/quizzes/${quizId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// QUIZ TEMPLATES API
// =============================================================================

export async function getQuizTemplates(): Promise<QuizTemplate[]> {
  return fetchAPI<QuizTemplate[]>("/dashboard/templates/");
}

export async function getDefaultQuizTemplates(): Promise<QuizTemplate[]> {
  return fetchAPI<QuizTemplate[]>("/dashboard/templates/defaults");
}

export async function getQuizTemplate(templateId: number): Promise<QuizTemplateDetail> {
  return fetchAPI<QuizTemplateDetail>(`/dashboard/templates/${templateId}`);
}

export async function createQuizTemplate(
  data: QuizTemplateCreateRequest
): Promise<QuizTemplate> {
  return fetchAPI<QuizTemplate>("/dashboard/templates/", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateQuizTemplate(
  templateId: number,
  data: QuizTemplateUpdateRequest
): Promise<QuizTemplate> {
  return fetchAPI<QuizTemplate>(`/dashboard/templates/${templateId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteQuizTemplate(templateId: number, force: boolean = false): Promise<void> {
  const url = force 
    ? `/dashboard/templates/${templateId}?force=true`
    : `/dashboard/templates/${templateId}`;
  return fetchAPI<void>(url, {
    method: "DELETE",
  });
}

// =============================================================================
// SETTINGS API
// =============================================================================

export async function getDashboardSettings(): Promise<DashboardSettingsResponse> {
  return fetchAPI<DashboardSettingsResponse>("/dashboard/settings/");
}

export async function updateSchoolSettings(
  data: DashboardSchoolUpdate
): Promise<DashboardSchoolInfo> {
  return fetchAPI<DashboardSchoolInfo>("/dashboard/settings/school", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateOwnerSettings(
  data: DashboardOwnerUpdate
): Promise<DashboardOwnerInfo> {
  return fetchAPI<DashboardOwnerInfo>("/dashboard/settings/owner", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadOwnerAvatar(file: File): Promise<{ avatar_url: string }> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch(`${API_BASE_URL}/dashboard/settings/owner/avatar`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Avatar upload failed",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}

export async function uploadQuestionImage(file: File): Promise<{ image_url: string }> {
  const token = getAuthToken();
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_BASE_URL}/dashboard/questions/upload-image`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const error: ApiError = await response.json().catch(() => ({
      detail: "Image upload failed",
    }));
    throw new Error(error.detail);
  }

  return response.json();
}
