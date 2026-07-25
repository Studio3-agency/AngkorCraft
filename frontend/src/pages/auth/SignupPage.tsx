import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, AlertCircle, CheckCircle2, ShoppingBag, Store } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AuthLayout } from './AuthLayout';
import { PhoneInput } from '../../components/PhoneInput';
import { PasswordInput } from '../../components/PasswordInput';

type Role = 'customer' | 'merchant';

export const SignupPage: React.FC = () => {
  const { signUp, session, role: currentRole, isConfigured } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  // If signup created a live session (email confirmation disabled), route on.
  useEffect(() => {
    if (!session || !currentRole) return;
    if (currentRole === 'merchant') navigate('/merchant', { replace: true });
    else if (currentRole === 'admin') navigate('/admin', { replace: true });
    else navigate('/', { replace: true });
  }, [session, currentRole, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUp({ email: email.trim(), password, fullName: fullName.trim(), role, phone: phone.trim() });
      // If no session appeared, Supabase is requiring email confirmation.
      setTimeout(() => {
        setNeedsConfirmation(true);
        setSubmitting(false);
      }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signUpFailed'));
      setSubmitting(false);
    }
  };

  if (needsConfirmation && !session) {
    return (
      <AuthLayout
        title={t('almostThere')}
        subtitle={t('confirmEmailSubtitle')}
        footer={
          <Link to="/login" className="text-[#FF914D] font-semibold hover:underline">
            {t('backToSignIn')}
          </Link>
        }
      >
        <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-4">
          <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
          <p>
            {t('confirmationSent', { email })}
            <span className="block mt-2 text-xs text-emerald-700/80">{t('confirmationHint')}</span>
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title={t('createYourAccount')}
      subtitle={t('joinSubtitle')}
      footer={
        <>
          {t('alreadyHaveAccount')}{' '}
          <Link to="/login" className="text-[#FF914D] font-semibold hover:underline">
            {t('signInBtn')}
          </Link>
        </>
      }
    >
      {!isConfigured && (
        <div className="mb-4 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{t('supabaseNotConfigured')}</span>
        </div>
      )}

      {error && (
        <div className="mb-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg p-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {([
          { key: 'customer', label: t('roleShopper'), desc: t('roleShopperDesc'), icon: ShoppingBag },
          { key: 'merchant', label: t('roleSeller'), desc: t('roleSellerDesc'), icon: Store },
        ] as const).map(({ key, label, desc, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setRole(key)}
            className={`flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
              role === key
                ? 'border-[#FF914D] bg-[#FF914D]/5'
                : 'border-[#E8DEC8] hover:border-[#FF914D]/40'
            }`}
          >
            <Icon className={`w-5 h-5 ${role === key ? 'text-[#FF914D]' : 'text-[#8C7A70]'}`} />
            <span className="text-sm font-bold text-[#134E4A]">{label}</span>
            <span className="text-[11px] text-[#8C7A70]">{desc}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
        <div>
          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('fullNameLabel')}</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF914D]" />
            <input
              type="text"
              required
              autoComplete="off"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
              placeholder={t('fullNameLabel')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('emailLabel')}</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF914D]" />
            <input
              type="email"
              required
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl pl-10 pr-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">
            {t('phoneLabel')} <span className="text-[#8C7A70] font-normal">({t('optional')})</span>
          </label>
          <PhoneInput value={phone} onChange={setPhone} placeholder="12 345 678" />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('passwordLabel')}</label>
          <PasswordInput
            value={password}
            onChange={setPassword}
            required
            minLength={6}
            autoComplete="new-password"
            placeholder={t('passwordMinHint')}
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !isConfigured}
          className="w-full bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
        >
          {submitting ? t('creatingAccount') : role === 'merchant' ? t('createSellerAccount') : t('createShopperAccount')}
        </button>
      </form>
    </AuthLayout>
  );
};
