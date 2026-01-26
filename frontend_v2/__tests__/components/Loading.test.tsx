import React from 'react';
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Loading from "~/components/Loading";

describe("Loading component", () => {
  it("should render the loading spinner", () => {
    const { container } = render(<Loading />);
    
    // Check that the container is rendered
    expect(container.firstChild).toBeInTheDocument();
    
    // Check for the spinner (svg from lucide-react)
    const spinner = container.querySelector("svg");
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass("animate-spin");
  });

  it("should have default background class", () => {
    const { container } = render(<Loading />);
    
    expect(container.firstChild).toHaveClass("bg-primary-25");
  });

  it("should apply custom className", () => {
    const { container } = render(<Loading className="custom-loading-class" />);
    
    expect(container.firstChild).toHaveClass("custom-loading-class");
  });

  it("should maintain base classes with custom className", () => {
    const { container } = render(<Loading className="mt-4" />);
    
    expect(container.firstChild).toHaveClass("size-full");
    expect(container.firstChild).toHaveClass("bg-primary-25");
    expect(container.firstChild).toHaveClass("mt-4");
  });

  it("should have correctly sized spinner icon", () => {
    const { container } = render(<Loading />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveAttribute("width", "64");
    expect(spinner).toHaveAttribute("height", "64");
  });

  it("should have correct spinner color class", () => {
    const { container } = render(<Loading />);
    
    const spinner = container.querySelector("svg");
    expect(spinner).toHaveClass("text-primary-800");
  });
});
