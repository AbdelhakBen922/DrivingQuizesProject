import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Modal from "~/components/Modal/Modal";

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

describe("Modal component", () => {
  let originalOverflow: string;

  beforeEach(() => {
    originalOverflow = document.body.style.overflow;
  });

  afterEach(() => {
    document.body.style.overflow = originalOverflow;
  });

  it("should not render when isOpen is false", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.queryByText("Modal content")).not.toBeInTheDocument();
  });

  it("should render when isOpen is true", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(screen.getByText("Modal content")).toBeInTheDocument();
  });

  it("should call onClose when clicking overlay", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    );

    // Click the overlay (parent element)
    const overlay = screen.getByText("Modal content").parentElement?.parentElement;
    if (overlay) {
      await user.click(overlay);
    }

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not call onClose when clicking modal content", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    );

    await user.click(screen.getByText("Modal content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should not close on overlay click when closeOnOverlayClick is false", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
        <div>Modal content</div>
      </Modal>
    );

    const overlay = screen.getByText("Modal content").parentElement?.parentElement;
    if (overlay) {
      await user.click(overlay);
    }

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should close on Escape key press", () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("should not close on Escape when closeOnEscape is false", () => {
    const onClose = vi.fn();
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
        <div>Modal content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: "Escape" });

    expect(onClose).not.toHaveBeenCalled();
  });

  it("should render with small size", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} size="sm">
        <div>Small modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("Small modal").parentElement;
    expect(modalContent).toHaveClass("max-w-md");
  });

  it("should render with medium size (default)", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Medium modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("Medium modal").parentElement;
    expect(modalContent).toHaveClass("max-w-lg");
  });

  it("should render with large size", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} size="lg">
        <div>Large modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("Large modal").parentElement;
    expect(modalContent).toHaveClass("max-w-2xl");
  });

  it("should render with xl size", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} size="xl">
        <div>XL modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("XL modal").parentElement;
    expect(modalContent).toHaveClass("max-w-4xl");
  });

  it("should apply custom className", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} className="custom-modal-class">
        <div>Custom class modal</div>
      </Modal>
    );

    const modalContent = screen.getByText("Custom class modal").parentElement;
    expect(modalContent).toHaveClass("custom-modal-class");
  });

  it("should prevent body scroll when open", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  it("should restore body scroll when closed", () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");

    rerender(
      <Modal isOpen={false} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("unset");
  });

  it("should restore body scroll on unmount", () => {
    const { unmount } = render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal content</div>
      </Modal>
    );

    expect(document.body.style.overflow).toBe("hidden");

    unmount();

    expect(document.body.style.overflow).toBe("unset");
  });

  it("should have backdrop blur effect", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <div>Modal with backdrop</div>
      </Modal>
    );

    const overlay = screen.getByText("Modal with backdrop").parentElement?.parentElement;
    expect(overlay).toHaveClass("backdrop-blur-sm");
  });

  it("should render children correctly", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <header>Header</header>
        <main>Main content</main>
        <footer>Footer</footer>
      </Modal>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Main content")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });
});
