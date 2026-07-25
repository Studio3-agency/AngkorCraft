import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import {
  ShoppingBag,
  MapPin,
  BookOpen,
  Heart,
  Menu,
  X,
  Compass,
  Search,
  Banknote,
  Globe,
  User,
  LogOut,
  LayoutDashboard,
  Store
} from 'lucide-react';

interface NavbarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  savedCount: number;
  onOpenCurrencyConverter: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  onNavigate,
  savedCount,
  onOpenCurrencyConverter,
  searchQuery,
  onSearchChange
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { language, toggleLanguage, t } = useLanguage();
  const { session, profile, role, signOut } = useAuth();
  const { rate } = useCurrency();
  const navigate = useNavigate();

  const portalPath = role === 'admin' ? '/admin' : role === 'merchant' ? '/merchant' : null;
  const firstName = profile?.fullName?.split(' ')[0] || 'Account';

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    setMobileMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const navItems: { id: PageType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('navHome'), icon: <Compass className="w-4 h-4" /> },
    { id: 'products', label: t('navProducts'), icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'locations', label: t('navShops'), icon: <MapPin className="w-4 h-4" /> },
    { id: 'guide', label: t('navGuide'), icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FDF8F3]/90 backdrop-blur-md border-b border-[#BF5A36]/10 shadow-xs">
      {/* Top Banner Notice (desktop only — keeps mobile clean) */}
      <div className="hidden sm:block bg-[#134E4A] text-white py-1.5 px-4 text-xs border-b border-[#D4AF37]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-medium min-w-0">
            <span className="bg-[#D4AF37] text-black text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest shrink-0">{t('touristTip')}</span>
            <span className="truncate text-white/90">{t('supportArtisans')}</span>
          </div>
          <button 
            onClick={onOpenCurrencyConverter}
            className="hidden sm:flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-[#D4AF37] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all cursor-pointer border border-[#D4AF37]/30"
          >
            <Banknote className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>${1} = {rate.toLocaleString()} {language === 'kh' ? '៛' : 'KHR'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo / Brand */}
          <button 
            onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} 
            className="flex items-center gap-3 group text-left cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full shadow-lg overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
              <img src="/logo.png" alt="AngkorCraft" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-2xl tracking-tight text-[#134E4A] !font-['Poppins',sans-serif]">
                ANGKOR<span className="text-[#BF5A36]">CRAFT</span>
              </div>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-xs font-semibold uppercase tracking-widest text-[#134E4A]/80">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-2 py-2 border-b-2 transition-all cursor-pointer ${
                    isActive 
                      ? 'text-[#BF5A36] border-[#BF5A36] font-bold' 
                      : 'border-transparent text-[#134E4A]/70 hover:text-[#BF5A36]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Action Buttons: Search, Language Switcher & Saved Items */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick search input on desktop */}
            <div className="hidden lg:relative lg:block w-44 xl:w-52">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BF5A36]" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (currentPage !== 'products') onNavigate('products');
                }}
                className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full pl-9 pr-3 py-2 text-xs text-[#2D2926] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#BF5A36] transition-all"
              />
            </div>

            {/* Language Toggle EN / KH Button */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 bg-[#F2EDE4] hover:bg-[#E8DEC8] border border-[#134E4A]/20 px-3 py-2 rounded-full text-xs font-bold transition-all cursor-pointer text-[#134E4A] shadow-2xs"
              title={language === 'en' ? 'Switch to Khmer (ខ្មែរ)' : 'Switch to English'}
              aria-label="Toggle language EN or KH"
            >
              <Globe className="w-3.5 h-3.5 text-[#BF5A36]" />
              <span className={language === 'en' ? 'text-[#BF5A36] font-extrabold' : 'text-[#8C7A70]'}>EN</span>
              <span className="text-[#8C7A70]/40 font-normal">/</span>
              <span className={language === 'kh' ? 'text-[#BF5A36] font-bold font-sans' : 'text-[#8C7A70]'}>ខ្មែរ</span>
            </button>

            <button
              onClick={() => onNavigate('saved')}
              className={`hidden md:flex relative items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                currentPage === 'saved'
                  ? 'bg-[#BF5A36] text-white shadow-md'
                  : 'bg-[#134E4A] text-white hover:bg-[#0f3d3a] shadow-xs'
              }`}
              title={t('navWishlist')}
            >
              <Heart className={`w-3.5 h-3.5 shrink-0 ${savedCount > 0 ? 'fill-[#D4AF37] text-[#D4AF37]' : ''}`} />
              <span>{t('navWishlist')}</span>
              {savedCount > 0 && (
                <span className="bg-[#D4AF37] text-black text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Account / Login */}
            {!session ? (
              <Link
                to="/login"
                className="hidden sm:flex items-center gap-1.5 border border-[#134E4A]/20 hover:border-[#BF5A36] hover:text-[#BF5A36] px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#134E4A] transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <User className="w-3.5 h-3.5 shrink-0" />
                <span>{t('logIn')}</span>
              </Link>
            ) : (
              <div className="relative hidden sm:block shrink-0">
                <button
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 bg-[#F2EDE4] hover:bg-[#E8DEC8] border border-[#134E4A]/20 px-3 py-2 rounded-full text-xs font-bold text-[#134E4A] transition-all cursor-pointer whitespace-nowrap"
                >
                  <span className="w-5 h-5 bg-[#BF5A36] text-white rounded-full flex items-center justify-center text-[10px] uppercase shrink-0">
                    {firstName.charAt(0)}
                  </span>
                  <span className="max-w-[80px] truncate">{firstName}</span>
                </button>
                {accountMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-[#E8DEC8] py-1.5 z-50">
                      <div className="px-3 py-2 border-b border-[#F2EDE4]">
                        <div className="text-xs font-bold text-[#134E4A] truncate">{profile?.fullName || t('navAccount')}</div>
                        <div className="text-[10px] text-[#8C7A70] uppercase tracking-wider">{role}</div>
                      </div>
                      {portalPath && (
                        <Link
                          to={portalPath}
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#134E4A] hover:bg-[#F2EDE4] cursor-pointer"
                        >
                          {role === 'admin' ? <LayoutDashboard className="w-3.5 h-3.5 shrink-0" /> : <Store className="w-3.5 h-3.5 shrink-0" />}
                          {role === 'admin' ? t('adminDashboardNav') : t('myStore')}
                        </Link>
                      )}
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-[#BF5A36] hover:bg-[#F2EDE4] cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 shrink-0" />
                        {t('signOut')}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Hamburger Toggle (kept for tablet; phones use the bottom nav) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="hidden sm:inline-flex md:hidden p-2 text-[#134E4A] hover:bg-[#F2EDE4] rounded-full transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF7F2] border-b border-[#E8DEC8] px-4 pt-3 pb-6 space-y-3">
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BF5A36]" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (currentPage !== 'products') onNavigate('products');
              }}
              className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-xl pl-9 pr-3 py-2 text-sm text-[#2D2926] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                    isActive 
                      ? 'bg-[#BF5A36] text-white shadow-xs' 
                      : 'bg-[#F2EDE4] text-[#2D2926] hover:bg-[#E8DEC8]'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Language Switcher in Mobile Drawer */}
          <div className="pt-1 flex items-center justify-between bg-[#F2EDE4] p-3 rounded-xl border border-[#134E4A]/10">
            <span className="text-xs font-bold text-[#134E4A] flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#BF5A36]" />
              <span>Language / ភាសា</span>
            </span>
            <button
              onClick={toggleLanguage}
              className="bg-[#BF5A36] text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs"
            >
              {language === 'en' ? 'Switch to ខ្មែរ (KH)' : 'Switch to English (EN)'}
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                onOpenCurrencyConverter();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between bg-[#134E4A] text-white px-4 py-2.5 rounded-xl text-xs font-semibold"
            >
              <div className="flex items-center gap-2">
                <Banknote className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('converterTitle')}</span>
              </div>
              <span className="text-[#D4AF37] font-mono">${1} = {rate.toLocaleString()} KHR</span>
            </button>
          </div>

          {/* Account controls */}
          <div className="pt-1">
            {!session ? (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 border border-[#134E4A]/20 text-[#134E4A] px-4 py-2.5 rounded-xl text-sm font-bold"
              >
                <User className="w-4 h-4" />
                {t('logInSignUp')}
              </Link>
            ) : (
              <div className="space-y-2">
                {portalPath && (
                  <Link
                    to={portalPath}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-2 bg-[#F2EDE4] text-[#134E4A] px-4 py-2.5 rounded-xl text-sm font-bold"
                  >
                    {role === 'admin' ? <LayoutDashboard className="w-4 h-4" /> : <Store className="w-4 h-4" />}
                    {role === 'admin' ? t('adminDashboardNav') : t('myStore')}
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 text-[#BF5A36] px-4 py-2.5 rounded-xl text-sm font-bold border border-[#BF5A36]/30"
                >
                  <LogOut className="w-4 h-4" />
                  {t('signOut')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

