import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import QuizTimer from "~/components/Quiz/QuizTimer";

describe("QuizTimer component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render with correct initial time", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={120} onTimeExpired={onTimeExpired} isActive={true} />
    );

    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("should not render when durationSec is null", () => {
    const onTimeExpired = vi.fn();
    const { container } = render(
      <QuizTimer durationSec={null} onTimeExpired={onTimeExpired} isActive={true} />
    );

    expect(container.firstChild).toBeNull();
  });

  it("should countdown when active", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={60} onTimeExpired={onTimeExpired} isActive={true} />
    );

    expect(screen.getByText("01:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByText("00:59")).toBeInTheDocument();
  });

  it("should not countdown when inactive", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={60} onTimeExpired={onTimeExpired} isActive={false} />
    );

    expect(screen.getByText("01:00")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should still show 01:00 because timer is not active
    expect(screen.getByText("01:00")).toBeInTheDocument();
  });

  it("should call onTimeExpired when time reaches zero", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={3} onTimeExpired={onTimeExpired} isActive={true} />
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onTimeExpired).toHaveBeenCalledTimes(1);
  });

  it("should show low time warning style when 30 seconds or less", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={30} onTimeExpired={onTimeExpired} isActive={true} />
    );

    const timerContainer = screen.getByText("00:30").parentElement;
    expect(timerContainer).toHaveClass("bg-red-100");
    expect(timerContainer).toHaveClass("text-red-700");
  });

  it("should show normal style when more than 30 seconds", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={60} onTimeExpired={onTimeExpired} isActive={true} />
    );

    const timerContainer = screen.getByText("01:00").parentElement;
    expect(timerContainer).toHaveClass("bg-blue-100");
    expect(timerContainer).toHaveClass("text-blue-700");
  });

  it("should transition to warning style during countdown", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={32} onTimeExpired={onTimeExpired} isActive={true} />
    );

    // Initially should have normal style (32 seconds > 30)
    let timerContainer = screen.getByText("00:32").parentElement;
    expect(timerContainer).toHaveClass("bg-blue-100");

    // Advance to 30 seconds
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should now have warning style
    timerContainer = screen.getByText("00:30").parentElement;
    expect(timerContainer).toHaveClass("bg-red-100");
  });

  it("should display clock icon", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={60} onTimeExpired={onTimeExpired} isActive={true} />
    );

    // The Clock icon from lucide-react should be rendered
    const timerContainer = screen.getByText("01:00").parentElement;
    expect(timerContainer?.querySelector("svg")).toBeInTheDocument();
  });

  it("should format time with leading zeros", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={65} onTimeExpired={onTimeExpired} isActive={true} />
    );

    expect(screen.getByText("01:05")).toBeInTheDocument();
  });

  it("should reset timer when durationSec prop changes", () => {
    const onTimeExpired = vi.fn();
    const { rerender } = render(
      <QuizTimer durationSec={60} onTimeExpired={onTimeExpired} isActive={true} />
    );

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText("00:50")).toBeInTheDocument();

    // Change duration
    rerender(
      <QuizTimer durationSec={120} onTimeExpired={onTimeExpired} isActive={true} />
    );

    expect(screen.getByText("02:00")).toBeInTheDocument();
  });

  it("should stop at zero and not go negative", () => {
    const onTimeExpired = vi.fn();
    render(
      <QuizTimer durationSec={2} onTimeExpired={onTimeExpired} isActive={true} />
    );

    // Advance past the duration
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Timer should have called onTimeExpired
    expect(onTimeExpired).toHaveBeenCalledTimes(1);
    
    // Time should show 00:00
    expect(screen.getByText("00:00")).toBeInTheDocument();
  });
});
