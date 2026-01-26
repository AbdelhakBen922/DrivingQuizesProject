import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import Toast from "~/components/Toast/Toast";

// Mock react-i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("Toast component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render with success type", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-1"
        message="Success message"
        type="success"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Success message")).toBeInTheDocument();
  });

  it("should render with error type", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-2"
        message="Error message"
        type="error"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Error message")).toBeInTheDocument();
  });

  it("should render with warning type", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-3"
        message="Warning message"
        type="warning"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Warning message")).toBeInTheDocument();
  });

  it("should render with info type", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-4"
        message="Info message"
        type="info"
        onClose={onClose}
      />
    );

    expect(screen.getByText("Info message")).toBeInTheDocument();
  });

  it("should auto-close after default duration (3000ms)", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-5"
        message="Auto close test"
        type="info"
        onClose={onClose}
      />
    );

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).toHaveBeenCalledWith("test-5");
  });

  it("should auto-close after custom duration", () => {
    const onClose = vi.fn();
    render(
      <Toast
        id="test-6"
        message="Custom duration"
        type="info"
        duration={5000}
        onClose={onClose}
      />
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onClose).toHaveBeenCalledWith("test-6");
  });

  it("should have correct success styling classes", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-7"
        message="Success"
        type="success"
        onClose={onClose}
      />
    );

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass("bg-green/10");
  });

  it("should have correct error styling classes", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-8"
        message="Error"
        type="error"
        onClose={onClose}
      />
    );

    const toastElement = container.firstChild as HTMLElement;
    expect(toastElement).toHaveClass("bg-red/10");
  });

  it("should render icon for each type", () => {
    const onClose = vi.fn();
    const { container } = render(
      <Toast
        id="test-9"
        message="With icon"
        type="success"
        onClose={onClose}
      />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("should clear timeout on unmount", () => {
    const onClose = vi.fn();
    const { unmount } = render(
      <Toast
        id="test-10"
        message="Unmount test"
        type="info"
        onClose={onClose}
      />
    );

    // Unmount before timeout fires
    unmount();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // onClose should not have been called because component unmounted
    expect(onClose).not.toHaveBeenCalled();
  });
});
