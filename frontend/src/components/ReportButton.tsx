import React, { useState } from 'react';
import { Flag, X, Loader2, ShieldCheck } from 'lucide-react';
import { reportContent } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  targetType: 'product' | 'shop';
  targetId: string;
  targetName?: string;
  /** 'icon' = small flag button (cards); 'text' = labeled button (detail views). */
  variant?: 'icon' | 'text';
  className?: string;
}

const REASONS = [
  { key: 'inappropriate', tk: 'reportReasonInappropriate' },
  { key: 'counterfeit', tk: 'reportReasonCounterfeit' },
  { key: 'scam', tk: 'reportReasonScam' },
  { key: 'offensive', tk: 'reportReasonOffensive' },
  { key: 'spam', tk: 'reportReasonSpam' },
  { key: 'other', tk: 'reportReasonOther' },
] as const;

export const ReportButton: React.FC<Props> = ({ targetType, targetId, targetName, variant = 'icon', className }) => {
  const { t } = useLanguage();
  const { session } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [note, setNote] = useState('');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError(t('reportPickReason'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await reportContent({
        targetType,
        targetId,
        reason,
        note,
        reporterId: session?.user?.id ?? null,
        reporterEmail: email || session?.user?.email || '',
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit');
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    setOpen(false);
    // reset after the modal closes
    setTimeout(() => {
      setReason('');
      setNote('');
      setEmail('');
      setDone(false);
      setError(null);
    }, 200);
  };

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={openModal}
          title={t('reportBtn')}
          aria-label={t('reportBtn')}
          className={`p-2 text-[#8C7A70] hover:text-[#FF914D] hover:bg-[#F2EDE4] rounded-full transition-colors cursor-pointer ${className ?? ''}`}
        >
          <Flag className="w-4 h-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C7A70] hover:text-[#FF914D] cursor-pointer ${className ?? ''}`}
        >
          <Flag className="w-3.5 h-3.5" />
          {t('reportBtn')}
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-3" onClick={close}>
          <div
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#F2EDE4]">
              <h2 className="font-sans text-lg font-bold text-[#134E4A] flex items-center gap-2">
                <Flag className="w-4.5 h-4.5 text-[#FF914D]" /> {t('reportTitle')}
              </h2>
              <button onClick={close} className="p-1.5 hover:bg-[#F2EDE4] rounded-lg cursor-pointer">
                <X className="w-5 h-5 text-[#8C7A70]" />
              </button>
            </div>

            {done ? (
              <div className="px-6 py-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-[#134E4A]/10 flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7 text-[#134E4A]" />
                </div>
                <h3 className="font-bold text-[#134E4A]">{t('reportThanksTitle')}</h3>
                <p className="text-sm text-[#5C4D44]">{t('reportThanks')}</p>
                <button onClick={close} className="mt-2 bg-[#134E4A] text-white text-sm font-semibold px-6 py-2.5 rounded-xl cursor-pointer">
                  {t('cancel')}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="px-6 py-5 space-y-4">
                {targetName && <p className="text-xs text-[#8C7A70] -mt-1">“{targetName}”</p>}
                <p className="text-sm text-[#5C4D44]">{t('reportSubtitle')}</p>
                <div className="space-y-2">
                  {REASONS.map((r) => (
                    <label
                      key={r.key}
                      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-colors ${
                        reason === r.key ? 'border-[#FF914D] bg-[#FF914D]/8' : 'border-[#E8DEC8] hover:border-[#FF914D]/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.key}
                        checked={reason === r.key}
                        onChange={() => setReason(r.key)}
                        className="accent-[#FF914D]"
                      />
                      <span className="text-sm font-medium text-[#2D2926]">{t(r.tk)}</span>
                    </label>
                  ))}
                </div>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={t('reportDetailsPlaceholder')}
                  className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
                />
                {!session && (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('reportEmailOptional')}
                    className="w-full bg-[#FAF7F2] border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
                  />
                )}
                {error && <p className="text-xs text-red-600">{error}</p>}
                <button
                  type="submit"
                  disabled={busy}
                  className="w-full flex items-center justify-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-60 text-white text-sm font-bold py-3 rounded-xl cursor-pointer"
                >
                  {busy && <Loader2 className="w-4 h-4 animate-spin" />}
                  {t('reportSubmit')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
