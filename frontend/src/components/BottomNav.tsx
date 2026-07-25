import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, MapPin, BookOpen, Heart, User } from 'lucide-react';
import { PageType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

interface BottomNavProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  savedCount: number;
}

/**
 * Mobile-only bottom tab bar (hidden on md+). Big tap targets, one clear
 * destination each — the simple, familiar pattern non-technical users expect.
 */
export const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate, savedCount }) => {
  const { t } = useLanguage();
  const { session, role } = useAuth();
  const navigate = useNavigate();

  const goAccount = () => {
    if (!session) navigate('/login');
    else if (role === 'admin') navigate('/admin');
    else if (role === 'merchant') navigate('/merchant');
    else onNavigate('saved'); // customer: account area = their wishlist for now
  };

  const items: { key: string; label: string; icon: React.ReactNode; onClick: () => void; active: boolean; badge?: number }[] = [
    { key: 'home', label: t('tabHome'), icon: <Home className="w-5 h-5" />, onClick: () => onNavigate('home'), active: currentPage === 'home' },
    { key: 'locations', label: t('tabShops'), icon: <MapPin className="w-5 h-5" />, onClick: () => onNavigate('locations'), active: currentPage === 'locations' },
    { key: 'guide', label: t('tabGuide'), icon: <BookOpen className="w-5 h-5" />, onClick: () => onNavigate('guide'), active: currentPage === 'guide' },
    { key: 'saved', label: t('tabSaved'), icon: <Heart className="w-5 h-5" />, onClick: () => onNavigate('saved'), active: currentPage === 'saved', badge: savedCount },
    { key: 'account', label: t('tabAccount'), icon: <User className="w-5 h-5" />, onClick: goAccount, active: false },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8DEC8]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid grid-cols-5">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={item.onClick}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2 cursor-pointer transition-colors ${
              item.active ? 'text-[#BF5A36]' : 'text-[#8C7A70]'
            }`}
          >
            <span className="relative">
              {item.icon}
              {item.badge ? (
                <span className="absolute -top-1.5 -right-2 bg-[#BF5A36] text-white text-[9px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              ) : null}
            </span>
            <span className="text-[10px] font-semibold leading-none whitespace-nowrap">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};
