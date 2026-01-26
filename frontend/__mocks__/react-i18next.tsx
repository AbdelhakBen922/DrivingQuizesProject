import { vi } from "vitest";

// Mock i18next translation function
export const useTranslation = vi.fn(() => ({
  t: (key: string, defaultValue?: string) => defaultValue || key,
  i18n: {
    language: "en",
    changeLanguage: vi.fn(),
    dir: vi.fn(() => "ltr"),
  },
}));

// Mock Trans component
export const Trans = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

// Mock withTranslation HOC
export const withTranslation = () => (Component: React.ComponentType) => Component;

// Mock initReactI18next
export const initReactI18next = {
  type: "3rdParty",
  init: vi.fn(),
};

export default {
  useTranslation,
  Trans,
  withTranslation,
  initReactI18next,
};
