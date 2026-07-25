import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AuthLayout } from './AuthLayout';
import { PasswordInput } from '../../components/PasswordInput';

export const LoginPage: React.FC = () => {
  const { signIn, session, role, isConfigured } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Redirect once we know the role after a successful sign-in. Wait for the
  // profile/role to load first, otherwise we'd bounce everyone to home.
  useEffect(() => {
    if (!session || !role) return;
    const from = (location.state as { from?: string } | null)?.from;
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'merchant') navigate('/merchant', { replace: true });
    else navigate(from && from !== '/login' ? from : '/', { replace: true });
  }, [session, role, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('signInFailed'));
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title={t('welcomeBack')}
      subtitle={t('signInToAccount')}
      footer={
        <>
          {t('dontHaveAccount')}{' '}
          <Link to="/signup" className="text-[#FF914D] font-semibold hover:underline">
            {t('createOne')}
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

      <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
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
          <label className="block text-xs font-semibold text-[#134E4A] mb-1.5">{t('passwordLabel')}</label>
          <PasswordInput value={password} onChange={setPassword} required autoComplete="current-password" placeholder="••••••••" />
        </div>

        <button
          type="submit"
          disabled={submitting || !isConfigured}
          className="w-full flex items-center justify-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          {submitting ? t('signingIn') : t('signInBtn')}
        </button>
      </form>
    </AuthLayout>
  );
};
