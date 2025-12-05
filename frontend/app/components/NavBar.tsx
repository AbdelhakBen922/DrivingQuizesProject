import { useState } from "react";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "react-i18next";

const NavBar = ({ dark }: { dark: boolean }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const textColor = dark ? "text-white" : "text-primary-800";
    const linkColor = dark ? "text-white" : "text-primary-800";
    const mobileBg = dark ? "bg-black/80" : "bg-white/90";
    const iconColor = dark ? "text-white" : "text-primary-800";

    return (
        <header className={`z-10 bg-transparent top-0 flex items-center h-[12vh] w-full px-6 md:px-24`}>
            
            {/* Logo */}
            <h3 className={`${textColor} text-2xl font-bold`}>Logo</h3>

            {/* Desktop Menu */}
            <nav className="hidden md:block mx-12">
                <ul className="flex flex-row gap-6">
                    <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="/">{t('nav.home')}</a></li>
                    <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="/select-quiz">{t('nav.quiz')}</a></li>
                    <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="#">{t('nav.learn')}</a></li>
                    <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="#">{t('nav.qa')}</a></li>
                </ul>
            </nav>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-6 ml-auto">
                <LanguageToggle dark={dark} />
                <button className="btn-primary">
                    {t('nav.login')}
                </button>
            </div>

            {/* Mobile Hamburger */}
            <button
                className={`md:hidden ml-auto text-3xl ${iconColor}`}
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            {/* Mobile Dropdown Menu */}
            {open && (
                <div className={`absolute top-[12vh] left-0 w-full ${mobileBg} backdrop-blur-lg md:hidden flex flex-col items-center gap-4 py-6`}>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.home')}</a>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.quiz')}</a>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.learn')}</a>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.qa')}</a>

                    <LanguageToggle dark={dark} />
                    <button className="btn-primary mt-2">
                        {t('nav.login')}
                    </button>
                </div>
            )}
        </header>
    );
};

export default NavBar;
