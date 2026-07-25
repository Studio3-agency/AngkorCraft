import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, ExternalLink, Loader2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export interface PortalNavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  end?: boolean;
}

interface PortalShellProps {
  kicker: string; // e.g. "Admin Console" / "Merchant Portal"
  headerTitle: string;
  headerSubtitle?: string;
  navItems: PortalNavItem[];
  loading?: boolean;
  children: React.ReactNode;
}

/**
 * Responsive shell for the admin & merchant portals.
 * - Phone: compact top header + fixed bottom tab bar (big tap targets).
 * - md+  : classic left sidebar.
 * Keeps a visible language switch so a Khmer-only merchant is never stuck.
 */
export const PortalShell: React.FC<PortalShellProps> = ({
  kicker,
  headerTitle,
  headerSubtitle,
  navItems,
  loading,
  children,
}) => {
  const { signOut } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const navigate = useNavigate();

  const doSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sidebarLink = (item: PortalNavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
          isActive ? 'bg-[#BF5A36] text-white' : 'text-[#134E4A]/80 hover:bg-[#F2EDE4]'
        }`
      }
    >
      <item.icon className="w-4 h-4" />
      {item.label}
    </NavLink>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C221E] md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 bg-white border-r border-[#E8DEC8] flex-col p-4 sticky top-0 h-screen">
        <div className="font-heading font-bold text-lg text-[#134E4A] px-2 mb-1">
          ANGKOR<span className="text-[#BF5A36]">CRAFT</span>
        </div>
        <nav className="space-y-1 flex-1">{navItems.map(sidebarLink)}</nav>
        <div className="border-t border-[#F2EDE4] pt-3 space-y-1">
          <button
            onClick={toggleLanguage}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#134E4A]/80 hover:bg-[#F2EDE4] cursor-pointer"
          >
            <Globe className="w-4 h-4" /> {language === 'en' ? 'ខ្មែរ' : 'English'}
          </button>
          <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#134E4A]/80 hover:bg-[#F2EDE4]">
            <ExternalLink className="w-4 h-4" /> {t('viewSite')}
          </Link>
          <button
            onClick={doSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-[#BF5A36] hover:bg-[#F2EDE4] cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 pb-20 md:pb-0">
        <header className="bg-white border-b border-[#E8DEC8] px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="min-w-0">
            <div className="md:hidden font-heading font-bold text-sm text-[#134E4A]">
              ANGKOR<span className="text-[#BF5A36]">CRAFT</span>
            </div>
            <h1 className="font-sans text-lg sm:text-xl font-bold text-[#134E4A] truncate">{headerTitle}</h1>
            {headerSubtitle && <p className="text-xs text-[#8C7A70] truncate">{headerSubtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {loading && <Loader2 className="w-5 h-5 text-[#BF5A36] animate-spin" />}
            {/* Mobile language toggle */}
            <button
              onClick={toggleLanguage}
              className="md:hidden flex items-center gap-1 bg-[#F2EDE4] border border-[#134E4A]/15 px-2.5 py-1.5 rounded-full text-xs font-bold text-[#134E4A] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-[#BF5A36]" />
              {language === 'en' ? 'ខ្មែរ' : 'EN'}
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-8">{children}</div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DEC8]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-0.5 py-2 cursor-pointer transition-colors ${
                  isActive ? 'text-[#BF5A36]' : 'text-[#8C7A70]'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold leading-none text-center px-1">{item.label}</span>
            </NavLink>
          ))}
          <button
            onClick={doSignOut}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[#BF5A36] cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-semibold leading-none">{t('signOut')}</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
