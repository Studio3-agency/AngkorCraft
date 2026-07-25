import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Loader2, Trash2 } from 'lucide-react';
import { Review } from '../types';
import { fetchReviews, upsertReview, deleteReview } from '../lib/store';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Avatar } from './Avatar';

/** Interactive 1–5 star picker. */
const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="p-0.5 cursor-pointer"
          aria-label={`${n} star`}
        >
          <Star className={`w-7 h-7 transition-colors ${n <= (hover || value) ? 'fill-[#FF914D] text-[#FF914D]' : 'text-[#D8CFC0]'}`} />
        </button>
      ))}
    </div>
  );
};

const Stars: React.FC<{ rating: number; size?: string }> = ({ rating, size = 'w-4 h-4' }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} className={`${size} ${n <= Math.round(rating) ? 'fill-[#FF914D] text-[#FF914D]' : 'text-[#D8CFC0]'}`} />
    ))}
  </div>
);

export const StoreReviews: React.FC<{ shopId: string }> = ({ shopId }) => {
  const { t, language } = useLanguage();
  const { session, profile } = useAuth();
  const userId = session?.user?.id;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const list = await fetchReviews(shopId);
      setReviews(list);
      const mine = list.find((r) => r.userId === userId);
      if (mine) { setRating(mine.rating); setComment(mine.comment); }
    } catch {
      /* table may not exist until the migration runs; fail quietly */
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [shopId, userId]);

  const myReview = reviews.find((r) => r.userId === userId);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || rating < 1) return;
    setBusy(true);
    try {
      await upsertReview({
        shopId,
        userId,
        authorName: profile?.fullName || session?.user?.email?.split('@')[0] || 'Shopper',
        authorAvatar: profile?.avatarUrl || '',
        rating,
        comment: comment.trim(),
      });
      await load();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to post review');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!myReview || !confirm(t('deleteReviewConfirm'))) return;
    setBusy(true);
    try {
      await deleteReview(myReview.id);
      setRating(0); setComment('');
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mt-6 bg-white rounded-3xl border border-[#E8DEC8] shadow-sm p-5 sm:p-7">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h2 className="font-sans text-lg font-bold text-[#134E4A]">{t('ratingsAndReviews')}</h2>
        {reviews.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-[#134E4A]">{avg.toFixed(1)}</span>
            <div>
              <Stars rating={avg} />
              <div className="text-[11px] text-[#8C7A70]">{t('reviewsCount').replace('{n}', String(reviews.length))}</div>
            </div>
          </div>
        )}
      </div>

      {/* Write / edit review */}
      {userId ? (
        <form onSubmit={submit} className="bg-[#FAF7F2] border border-[#E8DEC8] rounded-2xl p-4 sm:p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Avatar name={profile?.fullName} src={profile?.avatarUrl} size={36} />
            <div className="text-sm font-semibold text-[#134E4A]">{myReview ? t('editYourReview') : t('writeAReview')}</div>
          </div>
          <div className="mb-3">
            <div className="text-xs font-semibold text-[#8C7A70] mb-1">{t('yourRating')}</div>
            <StarInput value={rating} onChange={setRating} />
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('reviewCommentPlaceholder')}
            className="w-full bg-white border border-[#E8DEC8] rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
          />
          <div className="flex items-center gap-2 mt-3">
            <button
              type="submit"
              disabled={busy || rating < 1}
              className="inline-flex items-center gap-2 bg-[#FF914D] hover:bg-[#F07A33] disabled:opacity-50 text-white text-sm font-bold px-5 py-2.5 rounded-xl cursor-pointer"
            >
              {busy && <Loader2 className="w-4 h-4 animate-spin" />}
              {myReview ? t('updateReview') : t('submitReview')}
            </button>
            {myReview && (
              <button type="button" onClick={remove} disabled={busy} className="p-2.5 text-[#8C7A70] hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer" title={t('deleteReviewConfirm')}>
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>
      ) : (
        <Link to="/login" className="inline-block mb-6 text-sm font-semibold text-[#FF914D] hover:underline">
          {t('signInToReview')} →
        </Link>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="py-6 text-center text-[#8C7A70]"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-[#8C7A70] py-2">{t('noReviewsYet')}</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="flex gap-3">
              <Avatar name={r.authorName} src={r.authorAvatar} size={40} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-[#134E4A]">{r.authorName || 'Shopper'}</span>
                  <Stars rating={r.rating} size="w-3.5 h-3.5" />
                  <span className="text-[11px] text-[#8C7A70]">
                    {new Date(r.createdAt).toLocaleDateString(language === 'kh' ? 'km-KH' : 'en-US')}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-[#5C4D44] mt-0.5">{r.comment}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
