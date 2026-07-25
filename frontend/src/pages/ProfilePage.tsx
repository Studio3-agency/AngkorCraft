import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { updateMyProfile } from '../lib/store';
import { ImageUpload } from '../components/ImageUpload';
import { Avatar } from '../components/Avatar';
import { LanguageToggle } from '../components/LanguageToggle';
import { Footer } from '../components/Footer';

export const ProfilePage: React.FC = () => {
  const { session, profile, loading, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const [fullName, setFullName] = useState(profile?.fullName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep local state in sync once the profile finishes loading.
  React.useEffect(() => {
    if (profile) {
      setFullName(profile.fullName ?? '');
      setBio(profile.bio ?? '');
      setAvatarUrl(profile.avatarUrl ?? '');
    }
  }, [profile]);

  if (!loading && !session) return <Navigate to="/login" replace />;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile(session.user.id, { fullName, bio, avatarUrl });
      await refreshProfile();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DEC8]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="AngkorCraft" className="w-9 h-9 object-contain" />
            <span className="font-heading font-black text-2xl text-[#134E4A] tracking-tighter">
              ANGKOR<span className="text-[#FF914D]">CRAFT</span>
            </span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#8C7A70] hover:text-[#FF914D] mb-6">
          <ArrowLeft className="w-4 h-4" /> {t('backToMarketplace')}
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <Avatar name={fullName} src={avatarUrl} size={64} />
          <div>
            <h1 className="font-sans text-2xl font-extrabold text-[#134E4A]">{t('myAccount')}</h1>
            <p className="text-sm text-[#8C7A70]">{t('accountSubtitle')}</p>
          </div>
        </div>

        <form onSubmit={save} className="bg-white rounded-3xl border border-[#E8DEC8] shadow-sm p-5 sm:p-7 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('profilePhoto')}</label>
            <ImageUpload
              value={avatarUrl}
              publicId={null}
              folder="angkorcraft/avatars"
              onChange={(url) => setAvatarUrl(url)}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('displayName')}</label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
              placeholder={t('displayName')}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('bioLabel')}</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
              placeholder={t('bioPlaceholder')}
            />
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white text-sm font-bold px-6 py-3 rounded-xl cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : null}
            {saved ? t('profileSaved') : t('saveProfile')}
          </button>
        </form>
      </main>

      <Footer onNavigate={(page) => window.location.assign(`/#${page}`)} onOpenCurrencyConverter={() => window.location.assign('/')} />
    </div>
  );
};
