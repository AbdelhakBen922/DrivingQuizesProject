import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// Get saved language before initialization
const savedLanguage = typeof window !== 'undefined' 
  ? localStorage.getItem('i18nextLng') 
  : null;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  // Dynamically fetch translation files from public directory
  .use(
    resourcesToBackend((language: string, namespace: string) => 
      fetch(`/locales/${language}/${namespace}.json`).then((res) => res.json())
    )
  )
  .init({
    lng: savedLanguage || undefined, // Set initial language from localStorage
    fallbackLng: 'fr',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
