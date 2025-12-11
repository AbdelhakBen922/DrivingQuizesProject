import { Link, useLocation, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import * as api from "../../services/api";

interface NavItem {
  key: string;
  iconPath: string;
  path: string;
}

export default function Sidebar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [isOpen, setIsOpen] = useState(false);

  // State for school and owner info
  const [schoolInfo, setSchoolInfo] = useState<api.DashboardSchoolInfo | null>(null);
  const [ownerInfo, setOwnerInfo] = useState<api.DashboardOwnerInfo | null>(null);

  // Load settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await api.getDashboardSettings();
        setSchoolInfo(settings.school);
        setOwnerInfo(settings.owner);
      } catch (err) {
        console.error('Failed to load settings:', err);
      }
    }
    loadSettings();
  }, []);

  const navItems: NavItem[] = [
    { key: 'home', iconPath: '/assets/icons/dashboard/sidebar/House_01.svg', path: '/dashboard' },
    { key: 'groups', iconPath: '/assets/icons/dashboard/sidebar/Users_Group.svg', path: '/dashboard/groups' },
    { key: 'learning', iconPath: '/assets/icons/dashboard/sidebar/Book_Open.svg', path: '/dashboard/learning' },
    { key: 'quizzes', iconPath: '/assets/icons/dashboard/sidebar/Select_Multiple.svg', path: '/dashboard/quizzes' },
    { key: 'settings', iconPath: '/assets/icons/dashboard/sidebar/Settings.svg', path: '/dashboard/settings' },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`lg:hidden fixed top-4 z-50 p-2 bg-primary-300 text-white rounded-lg ${
          isRTL ? 'right-4' : 'left-4'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 backdrop-blur-sm bg-black/30 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 h-screen
          w-64 bg-white shadow-lg z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
          lg:translate-x-0
          ${isRTL ? 'right-0' : 'left-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-primary-800">
              {t('dashboard.title', 'Dashboard')}
            </h2>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl
                  transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-primary-100 text-primary-800 font-semibold'
                    : 'text-grey hover:bg-primary-25'
                  }
                  ${isRTL ? 'flex-row-reverse' : 'flex-row'}
                `}
              >
                <img 
                  src={item.iconPath} 
                  alt={item.key}
                  className="w-6 h-6"
                />
                <span className="text-lg">{t(`dashboard.nav.${item.key}`, item.key)}</span>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className={`p-4 border-t border-gray-200`}>
            {schoolInfo && ownerInfo ? (
              <div className={`flex items-center gap-3 p-3 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-12 h-12 rounded-full bg-primary-300 overflow-hidden flex items-center justify-center text-white font-bold text-lg">
                  {ownerInfo.avatar_url ? (
                    <img
                      src={ownerInfo.avatar_url}
                      alt={`${ownerInfo.first_name} ${ownerInfo.last_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).parentElement!.innerHTML = `${ownerInfo.first_name[0]}${ownerInfo.last_name[0]}`;
                      }}
                    />
                  ) : (
                    `${ownerInfo.first_name[0]}${ownerInfo.last_name[0]}`
                  )}
                </div>
                <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                  <p className="font-semibold text-primary-800">
                    {schoolInfo.name}
                  </p>
                  <p className="text-sm text-grey">
                    {ownerInfo.first_name} {ownerInfo.last_name}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center p-3">
                {t('common.loading', 'جاري التحميل...')}
              </div>
            )}
            <button 
              onClick={() => {
                api.logout();
                navigate('/login');
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 text-red rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            >
              <img 
                src="/assets/icons/dashboard/sidebar/Logout.svg" 
                alt="logout"
                className="w-5 h-5"
              />
              <span className="font-semibold">{t('dashboard.logout', 'تسجيل الخروج')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
