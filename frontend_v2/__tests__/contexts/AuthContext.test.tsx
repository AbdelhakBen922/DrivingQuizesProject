import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "~/contexts/AuthContext";
import type { AuthUser } from "~/contexts/AuthContext";

// Test component to access auth context
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="user-type">{auth.userType || "null"}</span>
      <span data-testid="is-authenticated">
        {auth.isAuthenticated ? "true" : "false"}
      </span>
      <span data-testid="is-staff">{auth.isStaff ? "true" : "false"}</span>
      <span data-testid="is-student">{auth.isStudent ? "true" : "false"}</span>
      <span data-testid="is-guest">{auth.isGuest ? "true" : "false"}</span>
      <span data-testid="is-loading">{auth.isLoading ? "true" : "false"}</span>
      <button
        onClick={() =>
          auth.setAuth({ type: "staff", email: "test@test.com", name: "Test" })
        }
      >
        Login Staff
      </button>
      <button
        onClick={() =>
          auth.setAuth({ type: "student", studentCode: "STU001" })
        }
      >
        Login Student
      </button>
      <button onClick={() => auth.setAuth({ type: "guest" })}>
        Login Guest
      </button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should provide default unauthenticated state", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user-type").textContent).toBe("null");
    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
  });

  it("should set staff auth correctly", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Staff").click();
    });

    expect(screen.getByTestId("user-type").textContent).toBe("staff");
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("is-staff").textContent).toBe("true");
    expect(screen.getByTestId("is-student").textContent).toBe("false");
  });

  it("should set student auth correctly", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Student").click();
    });

    expect(screen.getByTestId("user-type").textContent).toBe("student");
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
    expect(screen.getByTestId("is-student").textContent).toBe("true");
    expect(screen.getByTestId("is-staff").textContent).toBe("false");
  });

  it("should set guest auth correctly", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Guest").click();
    });

    expect(screen.getByTestId("user-type").textContent).toBe("guest");
    expect(screen.getByTestId("is-guest").textContent).toBe("true");
  });

  it("should logout and clear state", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    // Login first
    act(() => {
      screen.getByText("Login Staff").click();
    });

    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");

    // Then logout
    act(() => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("is-authenticated").textContent).toBe("false");
    expect(screen.getByTestId("user-type").textContent).toBe("null");
  });

  it("should persist user type to localStorage on login", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Staff").click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("userType", "staff");
  });

  it("should persist student code to localStorage", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Student").click();
    });

    expect(localStorage.setItem).toHaveBeenCalledWith("studentCode", "STU001");
  });

  it("should clear localStorage on logout", async () => {
    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    act(() => {
      screen.getByText("Login Staff").click();
    });

    act(() => {
      screen.getByText("Logout").click();
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith("auth_token");
    expect(localStorage.removeItem).toHaveBeenCalledWith("userType");
    expect(localStorage.removeItem).toHaveBeenCalledWith("studentCode");
  });

  it("should throw error when useAuth is used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleSpy.mockRestore();
  });

  it("should restore auth from localStorage on mount", async () => {
    // Pre-set localStorage values
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation(
      (key: string) => {
        if (key === "auth_token") return "mock_token";
        if (key === "userType") return "staff";
        return null;
      }
    );

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("is-loading").textContent).toBe("false");
    });

    expect(screen.getByTestId("user-type").textContent).toBe("staff");
    expect(screen.getByTestId("is-authenticated").textContent).toBe("true");
  });
});
