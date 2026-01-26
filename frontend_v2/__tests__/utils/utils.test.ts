import { describe, it, expect } from "vitest";
import { cn } from "~/lib/utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("px-4", "py-2");
    expect(result).toBe("px-4 py-2");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    const result = cn("base-class", isActive && "active-class");
    expect(result).toBe("base-class active-class");
  });

  it("should filter out falsy values", () => {
    const result = cn("base", false, null, undefined, "valid");
    expect(result).toBe("base valid");
  });

  it("should merge Tailwind classes correctly (last wins)", () => {
    const result = cn("px-4", "px-8");
    expect(result).toBe("px-8");
  });

  it("should handle empty input", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle array of classes", () => {
    const result = cn(["class1", "class2"]);
    expect(result).toBe("class1 class2");
  });

  it("should handle object notation", () => {
    const result = cn({
      "bg-red-500": true,
      "bg-blue-500": false,
      "text-white": true,
    });
    expect(result).toBe("bg-red-500 text-white");
  });

  it("should merge conflicting Tailwind utilities", () => {
    // tailwind-merge should keep the last conflicting class
    const result = cn("text-sm", "text-lg");
    expect(result).toBe("text-lg");
  });

  it("should handle complex mixed inputs", () => {
    const variant = "primary";
    const result = cn(
      "base-button",
      variant === "primary" && "bg-blue-500",
      variant === "secondary" && "bg-gray-500",
      { "cursor-pointer": true, "cursor-not-allowed": false }
    );
    expect(result).toBe("base-button bg-blue-500 cursor-pointer");
  });
});
