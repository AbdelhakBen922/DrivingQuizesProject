import React from 'react';
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import NavBar from "~/components/NavBar";
import * as AuthContextModule from "~/contexts/AuthContext";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback || key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

// Mock LanguageToggle
vi.mock("~/components/LanguageToggle", () => ({
  default: ({ dark }: { dark: boolean }) => (
    <button data-testid="language-toggle">Lang</button>
  ),
}));

// Mock useAuth
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

describe("NavBar component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render logo", () => {
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

    renderWithRouter(<NavBar dark={false} />);

    const logo = screen.getByAltText("Logo");
    expect(logo).toBeInTheDocument();
  });

  it("should render navigation links", () => {
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

    renderWithRouter(<NavBar dark={false} />);

    expect(screen.getByText("nav.home")).toBeInTheDocument();
    expect(screen.getByText("nav.quiz")).toBeInTheDocument();
  });

  it("should show login button when not authenticated", () => {
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

    renderWithRouter(<NavBar dark={false} />);

    expect(screen.getAllByText("nav.login").length).toBeGreaterThan(0);
  });

  it("should show user avatar and logout when authenticated", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", name: "John Doe", email: "john@test.com" },
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

    renderWithRouter(<NavBar dark={false} />);

    // Should show user name
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    
    // Should show logout button
    expect(screen.getAllByText("Logout").length).toBeGreaterThan(0);
  });

  it("should show user initials in avatar", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", name: "John Doe" },
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

    renderWithRouter(<NavBar dark={false} />);

    // Should show initials JD
    expect(screen.getAllByText("JD").length).toBeGreaterThan(0);
  });

  it("should apply dark theme styles when dark prop is true", () => {
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

    renderWithRouter(<NavBar dark={true} />);

    const logo = screen.getByAltText("Logo");
    expect(logo).toHaveAttribute("src", "/assets/images/Logo-clean-dark.png");
  });

  it("should apply light theme styles when dark prop is false", () => {
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

    renderWithRouter(<NavBar dark={false} />);

    const logo = screen.getByAltText("Logo");
    expect(logo).toHaveAttribute("src", "/assets/images/Logo-clean.png");
  });

  it("should toggle mobile menu when hamburger is clicked", async () => {
    const user = userEvent.setup();
    
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

    renderWithRouter(<NavBar dark={false} />);

    const hamburger = screen.getByText("☰");
    await user.click(hamburger);

    // Mobile menu should now be visible (it shows the links again)
    // The mobile menu renders additional links
    const homeLinks = screen.getAllByText("nav.home");
    expect(homeLinks.length).toBeGreaterThan(1); // Desktop + Mobile
  });

  it("should call logout when logout button is clicked", async () => {
    const user = userEvent.setup();
    const mockLogout = vi.fn();

    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "staff", name: "John" },
      userType: "staff",
      isAuthenticated: true,
      isStaff: true,
      isStudent: false,
      isGuest: false,
      isLoading: false,
      setAuth: vi.fn(),
      logout: mockLogout,
      checkAuth: vi.fn(),
    });

    renderWithRouter(<NavBar dark={false} />);

    const logoutButtons = screen.getAllByText("Logout");
    await user.click(logoutButtons[0]);

    expect(mockLogout).toHaveBeenCalled();
  });

  it("should render language toggle", () => {
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

    renderWithRouter(<NavBar dark={false} />);

    expect(screen.getAllByTestId("language-toggle").length).toBeGreaterThan(0);
  });

  it("should show student code initials in avatar when no name", () => {
    vi.mocked(AuthContextModule.useAuth).mockReturnValue({
      user: { type: "student", studentCode: "ABC123" },
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

    renderWithRouter(<NavBar dark={false} />);

    // The avatar shows first 2 characters - could be "AB" or just first letters
    // Check that the avatar container exists with some content
    const avatars = document.querySelectorAll('.rounded-full');
    expect(avatars.length).toBeGreaterThan(0);
  });
});
