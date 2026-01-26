import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useToast } from "~/hooks/useToast";
import type { ToastItem } from "~/hooks/useToast";

describe("useToast hook", () => {
  let toasts: ToastItem[];
  let setToasts: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    toasts = [];
    setToasts = vi.fn((updater) => {
      if (typeof updater === "function") {
        toasts = updater(toasts);
      } else {
        toasts = updater;
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should add a toast with default type", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.addToast("Test message");
    });

    expect(setToasts).toHaveBeenCalled();
    const lastCall = setToasts.mock.calls[0][0];
    expect(lastCall).toHaveLength(1);
    expect(lastCall[0].message).toBe("Test message");
    expect(lastCall[0].type).toBe("info");
  });

  it("should add a success toast", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.success("Success message");
    });

    const lastCall = setToasts.mock.calls[0][0];
    expect(lastCall[0].message).toBe("Success message");
    expect(lastCall[0].type).toBe("success");
  });

  it("should add an error toast", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.error("Error message");
    });

    const lastCall = setToasts.mock.calls[0][0];
    expect(lastCall[0].message).toBe("Error message");
    expect(lastCall[0].type).toBe("error");
  });

  it("should add a warning toast", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.warning("Warning message");
    });

    const lastCall = setToasts.mock.calls[0][0];
    expect(lastCall[0].message).toBe("Warning message");
    expect(lastCall[0].type).toBe("warning");
  });

  it("should add an info toast", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.info("Info message");
    });

    const lastCall = setToasts.mock.calls[0][0];
    expect(lastCall[0].message).toBe("Info message");
    expect(lastCall[0].type).toBe("info");
  });

  it("should auto-remove toast after duration", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.addToast("Auto-remove test", "info", 3000);
    });

    // Fast-forward past the duration
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // setToasts should have been called for removal
    expect(setToasts).toHaveBeenCalledTimes(2); // Once for add, once for remove
  });

  it("should not auto-remove toast when duration is 0", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.addToast("Persistent toast", "info", 0);
    });

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Should only be called once (for adding)
    expect(setToasts).toHaveBeenCalledTimes(1);
  });

  it("should manually remove a toast", () => {
    const existingToast: ToastItem = {
      id: "test-id-123",
      message: "Test",
      type: "info",
    };
    toasts = [existingToast];

    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    act(() => {
      result.current.removeToast("test-id-123");
    });

    expect(setToasts).toHaveBeenCalled();
  });

  it("should return unique toast IDs", () => {
    const { result } = renderHook(() => useToast({ toasts, setToasts }));

    let id1: string = "";
    let id2: string = "";

    act(() => {
      id1 = result.current.addToast("First");
    });

    act(() => {
      id2 = result.current.addToast("Second");
    });

    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });
});
