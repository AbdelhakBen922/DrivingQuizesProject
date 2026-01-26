import React from 'react';
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute, PublicRoute } from "~/components/ProtectedRoute";
import * as AuthContextModule from "~/contexts/AuthContext";

// Mock the useAuth hook
vi.mock("~/contexts/AuthContext", async () => {
  const actual = await vi.importActual("~/contexts/AuthContext");
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

// Helper to render with Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<MemoryRouter>{component}</MemoryRouter>);
};

describe("ProtectedRoute component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state while checking auth", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      userType: null,
      isAuthenticated: false,
      isStaff: false,
      isStudent: false,
      isGuest: false,
      isLoading: true,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff"]}>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Protected content")).not.toBeInTheDocument();
  });

  it("should redirect to home when not authenticated", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      userType: null,
      isAuthenticated: false,
      isStaff: false,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff"]}>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
    });
  });

  it("should redirect to custom path when not authenticated", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      userType: null,
      isAuthenticated: false,
      isStaff: false,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff"]} redirectTo="/login">
        <div>Protected content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
    });
  });

  it("should render children when user is authenticated and allowed", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", email: "test@test.com" },
      userType: "staff",
      isAuthenticated: true,
      isStaff: true,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff"]}>
        <div>Protected content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  it("should redirect staff to dashboard when accessing student route", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", email: "test@test.com" },
      userType: "staff",
      isAuthenticated: true,
      isStaff: true,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["student"]}>
        <div>Student only content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
    });
  });

  it("should redirect student to student dashboard when accessing staff route", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "student", studentCode: "STU001" },
      userType: "student",
      isAuthenticated: true,
      isStaff: false,
      isStudent: true,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff"]}>
        <div>Staff only content</div>
      </ProtectedRoute>
    );

    await waitFor(() => {
    });
  });

  it("should allow multiple user types", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "student", studentCode: "STU001" },
      userType: "student",
      isAuthenticated: true,
      isStaff: false,
      isStudent: true,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["staff", "student"]}>
        <div>Shared content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Shared content")).toBeInTheDocument();
  });

  it("should allow guest access when permitted", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "guest" },
      userType: "guest",
      isAuthenticated: true,
      isStaff: false,
      isStudent: false,
      isGuest: true,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <ProtectedRoute allowedUserTypes={["guest", "student"]}>
        <div>Guest allowed content</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Guest allowed content")).toBeInTheDocument();
  });
});

describe("PublicRoute component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading state while checking auth", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      userType: null,
      isAuthenticated: false,
      isStaff: false,
      isStudent: false,
      isGuest: false,
      isLoading: true,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <PublicRoute>
        <div>Public content</div>
      </PublicRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should render children when user is not authenticated", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: null,
      userType: null,
      isAuthenticated: false,
      isStaff: false,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <PublicRoute>
        <div>Public content</div>
      </PublicRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Public content")).toBeInTheDocument();
    });
  });

  it("should redirect staff to dashboard when authenticated", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", email: "test@test.com" },
      userType: "staff",
      isAuthenticated: true,
      isStaff: true,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <PublicRoute>
        <div>Login page</div>
      </PublicRoute>
    );

    await waitFor(() => {
    });
  });

  it("should redirect student to student dashboard when authenticated", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "student", studentCode: "STU001" },
      userType: "student",
      isAuthenticated: true,
      isStaff: false,
      isStudent: true,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <PublicRoute>
        <div>Login page</div>
      </PublicRoute>
    );

    await waitFor(() => {
    });
  });

  it("should not redirect when redirectAuthenticated is false", async () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", email: "test@test.com" },
      userType: "staff",
      isAuthenticated: true,
      isStaff: true,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });

    renderWithRouter(
      <PublicRoute redirectAuthenticated={false}>
        <div>Always visible</div>
      </PublicRoute>
    );

    await waitFor(() => {
      expect(screen.getByText("Always visible")).toBeInTheDocument();
    });
  });
});
