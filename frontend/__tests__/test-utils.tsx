import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { AuthProvider } from "~/contexts/AuthContext";

// Custom render that wraps with providers
interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withAuth?: boolean;
}

export function renderWithProviders(
  ui: React.ReactElement,
  { withAuth = true, ...options }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    if (withAuth) {
      return <AuthProvider>{children}</AuthProvider>;
    }
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from testing-library
export * from "@testing-library/react";
export { renderWithProviders as render };
