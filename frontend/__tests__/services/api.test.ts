import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as api from "~/services/api";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to create mock response
function createMockResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  } as Response);
}

beforeEach(() => {
  vi.clearAllMocks();
  api.clearAuthToken();
  localStorage.clear();
});

afterEach(() => {
  api.clearAuthToken();
  localStorage.clear();
});

describe("API Service - Auth Token Management", () => {
  it("should set auth token in memory and localStorage", () => {
    api.setAuthToken("test_token_123");

    expect(api.getAuthToken()).toBe("test_token_123");
    expect(localStorage.setItem).toHaveBeenCalledWith("auth_token", "test_token_123");
  });

  it("should get auth token from memory", () => {
    api.setAuthToken("memory_token");

    const token = api.getAuthToken();

    expect(token).toBe("memory_token");
  });

  it("should get auth token from localStorage when memory is empty", () => {
    // Simulate token in localStorage but not in memory
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValueOnce("stored_token");
    api.clearAuthToken();

    api.getAuthToken();

    expect(localStorage.getItem).toHaveBeenCalledWith("auth_token");
  });

  it("should clear auth token from memory and localStorage", () => {
    api.setAuthToken("token_to_clear");
    api.clearAuthToken();

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });

  it("should return true for isAuthenticated when token exists", () => {
    api.setAuthToken("valid_token");

    expect(api.isAuthenticated()).toBe(true);
  });

  it("should return false for isAuthenticated when no token", () => {
    api.clearAuthToken();

    expect(api.isAuthenticated()).toBe(false);
  });

  it("should logout and clear token", () => {
    api.setAuthToken("session_token");
    api.logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
  });
});

describe("API Service - Login", () => {
  it("should login successfully with valid credentials", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        access_token: "mock_token_12345",
        token_type: "bearer",
      })
    );

    const result = await api.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result).toHaveProperty("access_token");
    expect(result.token_type).toBe("bearer");
    expect(api.getAuthToken()).toBe("mock_token_12345");
  });

  it("should throw error with invalid credentials", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ detail: "Invalid credentials" }, false, 401)
    );

    await expect(
      api.login({
        email: "wrong@example.com",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid credentials");
  });

  it("should store token after successful login", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        access_token: "mock_token_12345",
        token_type: "bearer",
      })
    );

    await api.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      "auth_token",
      "mock_token_12345"
    );
  });

  it("should call correct endpoint with correct data", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        access_token: "token",
        token_type: "bearer",
      })
    );

    await api.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard/auth/login"),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          email: "test@example.com",
          password: "password123",
        }),
      })
    );
  });
});

describe("API Service - Student Login", () => {
  it("should login student successfully with valid credentials", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        access_token: "student_token_123",
        token_type: "bearer",
      })
    );

    const result = await api.studentLogin({
      student_code: "STU001",
      password: "password123",
    });

    expect(result).toHaveProperty("access_token");
    expect(result.token_type).toBe("bearer");
  });

  it("should throw error with invalid student credentials", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ detail: "Invalid student credentials" }, false, 401)
    );

    await expect(
      api.studentLogin({
        student_code: "INVALID",
        password: "wrongpassword",
      })
    ).rejects.toThrow("Invalid student credentials");
  });

  it("should call correct student login endpoint", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        access_token: "token",
        token_type: "bearer",
      })
    );

    await api.studentLogin({
      student_code: "STU001",
      password: "password123",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/student/auth/login"),
      expect.any(Object)
    );
  });
});

describe("API Service - Registration", () => {
  it("should register successfully with valid data", async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}));

    await expect(
      api.register({
        school_name: "Test School",
        owner_name: "Test Owner",
        email: "new@example.com",
        phone: "1234567890",
        password: "password123",
      })
    ).resolves.not.toThrow();
  });

  it("should throw error when email already exists", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({ detail: "Email already registered" }, false, 400)
    );

    await expect(
      api.register({
        school_name: "Test School",
        owner_name: "Test Owner",
        email: "existing@example.com",
        phone: "1234567890",
        password: "password123",
      })
    ).rejects.toThrow("Email already registered");
  });

  it("should call correct register endpoint", async () => {
    mockFetch.mockResolvedValueOnce(createMockResponse({}));

    await api.register({
      school_name: "Test School",
      owner_name: "Test Owner",
      email: "new@example.com",
      phone: "1234567890",
      password: "password123",
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/dashboard/auth/register"),
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});

describe("API Service - Dashboard", () => {
  beforeEach(() => {
    api.setAuthToken("valid_token");
  });

  it("should fetch dashboard stats", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        total_rooms: 5,
        total_students: 50,
        upcoming_quizzes: 3,
        active_quizzes: 2,
      })
    );

    const stats = await api.getDashboardStats();

    expect(stats).toHaveProperty("total_rooms");
    expect(stats).toHaveProperty("total_students");
    expect(stats).toHaveProperty("upcoming_quizzes");
    expect(stats).toHaveProperty("active_quizzes");
  });

  it("should include auth header in request", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        total_rooms: 5,
        total_students: 50,
        upcoming_quizzes: 3,
        active_quizzes: 2,
      })
    );

    await api.getDashboardStats();

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer valid_token",
        }),
      })
    );
  });
});

describe("API Service - Rooms", () => {
  beforeEach(() => {
    api.setAuthToken("valid_token");
  });

  it("should fetch rooms list", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse([
        { id: 1, name: "Room A", school_id: 1 },
        { id: 2, name: "Room B", school_id: 1 },
      ])
    );

    const rooms = await api.getRooms();

    expect(Array.isArray(rooms)).toBe(true);
    expect(rooms.length).toBeGreaterThan(0);
    expect(rooms[0]).toHaveProperty("id");
    expect(rooms[0]).toHaveProperty("name");
  });

  it("should fetch room detail", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        room: { id: 1, name: "Room A" },
        students: [],
        quizzes: [],
      })
    );

    const detail = await api.getRoomDetail(1);

    expect(detail).toHaveProperty("room");
    expect(detail).toHaveProperty("students");
    expect(detail).toHaveProperty("quizzes");
    expect(detail.room.id).toBe(1);
  });

  it("should create a new room", async () => {
    mockFetch.mockResolvedValueOnce(
      createMockResponse({
        id: 3,
        name: "New Test Room",
        school_id: 1,
      })
    );

    const newRoom = await api.createRoom({
      name: "New Test Room",
      description: "A test room",
    });

    expect(newRoom).toHaveProperty("id");
    expect(newRoom.name).toBe("New Test Room");
  });
});

describe("API Service - Error Handling", () => {
  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await expect(
      api.login({
        email: "error@test.com",
        password: "trigger_error",
      })
    ).rejects.toThrow();
  });

  it("should handle JSON parse errors", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("Invalid JSON")),
    } as Response);

    await expect(
      api.login({
        email: "error@test.com",
        password: "trigger_error",
      })
    ).rejects.toThrow();
  });
});

describe("API Service - Type Exports", () => {
  it("should export LoginRequest type", () => {
    const request: api.LoginRequest = {
      email: "test@test.com",
      password: "password",
    };
    expect(request).toBeDefined();
  });

  it("should export StudentLoginRequest type", () => {
    const request: api.StudentLoginRequest = {
      student_code: "STU001",
      password: "password",
    };
    expect(request).toBeDefined();
  });

  it("should export RegisterRequest type", () => {
    const request: api.RegisterRequest = {
      school_name: "School",
      owner_name: "Owner",
      email: "email@test.com",
      phone: "1234567890",
      password: "password",
    };
    expect(request).toBeDefined();
  });

  it("should export Room type", () => {
    const room: api.Room = {
      id: 1,
      school_id: 1,
      name: "Room",
      description: null,
      room_type: "a",
      created_by_id: null,
      created_at: "2025-01-01",
      updated_at: "2025-01-01",
      deleted_at: null,
    };
    expect(room).toBeDefined();
  });
});
