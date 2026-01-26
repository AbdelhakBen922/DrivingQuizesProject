import { useTranslation } from 'react-i18next';

export default function LanguageToggle({ dark }: { dark: boolean }) {
  const { i18n } = useTranslation();
  const lang = i18n.language === 'ar' ? 'AR' : 'FR';

  const toggleLanguage = () => {
    const newLang = lang === 'AR' ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <div
      onClick={toggleLanguage}
      className={`
        relative flex w-24 cursor-pointer select-none items-center justify-between 
        rounded-full border px-2 py-1 text-sm transition-colors duration-300
        ${dark ? "text-white border-white" : "text-primary-800 border-primary-800"}
      `}
    >
      <span className={`${lang === 'AR' ? 'font-bold' : ''}`}>AR</span>
      <span className={`${lang === 'FR' ? 'font-bold' : ''}`}>FR</span>

      <div
        className={`
          absolute top-0 left-0 h-full w-1/2 rounded-full transition-all duration-300
          ${lang === 'AR' ? "translate-x-full" : "translate-x-0"}
          ${dark ? "bg-white" : "bg-primary-800"}
        `}
      ></div>
    </div>
  );
}
