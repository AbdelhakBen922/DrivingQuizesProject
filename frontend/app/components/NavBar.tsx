import { useState } from "react";
import { Link } from "react-router";
import LanguageToggle from "./LanguageToggle";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/contexts/AuthContext";

const NavBar = ({ dark }: { dark: boolean }) => {
    const { t } = useTranslation();
    const { user, isAuthenticated, logout } = useAuth();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        // Force full page reload to clear all state
        window.location.href = "/";
    };

    const textColor = dark ? "text-white" : "text-primary-800";
    const linkColor = dark ? "text-white" : "text-primary-800";
    const mobileBg = dark ? "bg-black/80" : "bg-white/90";
    const iconColor = dark ? "text-white" : "text-primary-800";

    return (
        <header className={`z-10 bg-transparent top-0 flex items-center justify-between h-[12vh] w-full px-6 md:px-24`}>

            {/* Left side: Logo + main links */}
            <div className="flex items-center gap-8">
                {/* Logo */}
                <Link to="/" className={`${textColor} text-2xl font-bold`}>Logo</Link>

                {/* Desktop Menu */}
                <nav className="hidden md:block">
                    <ul className="flex flex-row gap-6">
                        <li><Link className={`fancy-link text-xl font-semibold ${linkColor}`} to="/">{t('nav.home')}</Link></li>
                        <li><Link className={`fancy-link text-xl font-semibold ${linkColor}`} to="/select-quiz">{t('nav.quiz')}</Link></li>
                        <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="#">{t('nav.learn')}</a></li>
                        <li><a className={`fancy-link text-xl font-semibold ${linkColor}`} href="#">{t('nav.qa')}</a></li>
                    </ul>
                </nav>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
                <LanguageToggle dark={dark} />
                {isAuthenticated ? (
                    <div className="flex items-center gap-3">
                        {user?.name && (
                            <span className={`text-sm font-semibold ${textColor}`}>{user.name}</span>
                        )}
                        <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold uppercase">
                            {(user?.name || user?.studentCode || "?")
                                .split(" ")
                                .filter(Boolean)
                                .map(part => part[0])
                                .join("")
                                .slice(0, 2)}
                        </div>
                        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600">
                            {t('nav.logout', 'Logout')}
                        </button>
                    </div>
                ) : (
                    <Link to="/login" className="btn-primary">
                        {t('nav.login')}
                    </Link>
                )}
            </div>

            {/* Mobile Hamburger */}
            <button
                className={`md:hidden text-3xl ${iconColor}`}
                onClick={() => setOpen(!open)}
            >
                ☰
            </button>

            {/* Mobile Dropdown Menu */}
            {open && (
                <div className={`absolute top-[12vh] left-0 w-full ${mobileBg} backdrop-blur-lg md:hidden flex flex-col items-center gap-4 py-6`}>
                    <Link className={`fancy-link text-xl ${linkColor}`} to="/">{t('nav.home')}</Link>
                    <Link className={`fancy-link text-xl ${linkColor}`} to="/select-quiz">{t('nav.quiz')}</Link>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.learn')}</a>
                    <a className={`fancy-link text-xl ${linkColor}`} href="#">{t('nav.qa')}</a>

                    <LanguageToggle dark={dark} />
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold uppercase">
                                {(user?.name || user?.studentCode || "?")
                                    .split(" ")
                                    .filter(Boolean)
                                    .map(part => part[0])
                                    .join("")
                                    .slice(0, 2)}
                            </div>
                            <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-600">
                                {t('nav.logout', 'Logout')}
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="btn-primary mt-2">
                            {t('nav.login')}
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
};

export default NavBar;
