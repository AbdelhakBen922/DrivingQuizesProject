import React from 'react';
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "~/components/ui/button";

describe("Button component", () => {
  it("should render with default variant and size", () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("bg-primary");
  });

  it("should render with destructive variant", () => {
    render(<Button variant="destructive">Delete</Button>);
    
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive");
  });

  it("should render with outline variant", () => {
    render(<Button variant="outline">Outline</Button>);
    
    const button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("border");
  });

  it("should render with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    
    const button = screen.getByRole("button", { name: /secondary/i });
    expect(button).toHaveClass("bg-secondary");
  });

  it("should render with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    
    const button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveClass("hover:bg-accent");
  });

  it("should render with link variant", () => {
    render(<Button variant="link">Link</Button>);
    
    const button = screen.getByRole("button", { name: /link/i });
    expect(button).toHaveClass("underline-offset-4");
  });

  it("should render with small size", () => {
    render(<Button size="sm">Small</Button>);
    
    const button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-8");
  });

  it("should render with large size", () => {
    render(<Button size="lg">Large</Button>);
    
    const button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("h-10");
  });

  it("should render with icon size", () => {
    render(<Button size="icon">🔍</Button>);
    
    const button = screen.getByRole("button");
    expect(button).toHaveClass("size-9");
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("should handle click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<Button disabled onClick={handleClick}>Disabled</Button>);
    
    const button = screen.getByRole("button", { name: /disabled/i });
    await user.click(button);
    
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should apply custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    
    const button = screen.getByRole("button", { name: /custom/i });
    expect(button).toHaveClass("custom-class");
  });

  it("should forward ref correctly", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>With Ref</Button>);
    
    expect(ref).toHaveBeenCalled();
  });

  it("should render as child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );
    
    const link = screen.getByRole("link", { name: /link button/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("should have correct data-slot attribute", () => {
    render(<Button>Slot Test</Button>);
    
    const button = screen.getByRole("button", { name: /slot test/i });
    expect(button).toHaveAttribute("data-slot", "button");
  });
});
