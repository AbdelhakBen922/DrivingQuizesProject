import { http, HttpResponse } from "msw";

const API_BASE_URL = "http://localhost:8000";

// Mock data
export const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
};

export const mockStudent = {
  id: 1,
  student_code: "STU001",
  full_name: "Test Student",
};

export const mockDashboardStats = {
  total_rooms: 5,
  total_students: 50,
  upcoming_quizzes: 3,
  active_quizzes: 2,
};

export const mockRooms = [
  {
    id: 1,
    school_id: 1,
    name: "Room A",
    description: "Test room",
    room_type: "a",
    created_at: "2025-01-01T00:00:00Z",
    updated_at: "2025-01-01T00:00:00Z",
    deleted_at: null,
  },
];

// MSW Handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/api/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    
    if (body.email === "test@example.com" && body.password === "password123") {
      return HttpResponse.json({
        access_token: "mock_token_12345",
        token_type: "bearer",
      });
    }
    
    return HttpResponse.json(
      { detail: "Invalid credentials" },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/auth/student/login`, async ({ request }) => {
    const body = (await request.json()) as { student_code: string; password: string };
    
    if (body.student_code === "STU001" && body.password === "password123") {
      return HttpResponse.json({
        access_token: "mock_student_token_12345",
        token_type: "bearer",
      });
    }
    
    return HttpResponse.json(
      { detail: "Invalid student credentials" },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/api/auth/register`, async ({ request }) => {
    const body = (await request.json()) as { email: string };
    
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        { detail: "Email already registered" },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      access_token: "mock_token_new_user",
      token_type: "bearer",
    });
  }),

  // Dashboard endpoints
  http.get(`${API_BASE_URL}/api/dashboard/stats`, () => {
    return HttpResponse.json(mockDashboardStats);
  }),

  // Rooms endpoints
  http.get(`${API_BASE_URL}/api/rooms`, () => {
    return HttpResponse.json(mockRooms);
  }),

  http.get(`${API_BASE_URL}/api/rooms/:id`, ({ params }) => {
    const room = mockRooms.find((r) => r.id === Number(params.id));
    if (room) {
      return HttpResponse.json({
        room,
        students: [],
        quizzes: [],
      });
    }
    return HttpResponse.json({ detail: "Room not found" }, { status: 404 });
  }),

  http.post(`${API_BASE_URL}/api/rooms`, async ({ request }) => {
    const body = (await request.json()) as { name: string };
    return HttpResponse.json({
      id: 2,
      school_id: 1,
      name: body.name,
      description: null,
      room_type: "a",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    });
  }),

  // Quiz endpoints
  http.get(`${API_BASE_URL}/api/quizzes`, () => {
    return HttpResponse.json([]);
  }),

  // User profile
  http.get(`${API_BASE_URL}/api/users/me`, () => {
    return HttpResponse.json(mockUser);
  }),
];

export default handlers;
