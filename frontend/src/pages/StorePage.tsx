import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, CreditCard, ShieldCheck, Star, ExternalLink, Share2, Check, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { useCatalog } from '../hooks/useCatalog';
import { isShopLive } from '../lib/shops';
import { formatViews } from '../lib/util';
import { useWishlist } from '../hooks/useWishlist';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { Product, Shop } from '../types';
import { ContactLinks, hasContactChannels } from '../components/ContactLinks';
import { NearbyHotspots } from '../components/NearbyHotspots';
import { StoreLocationMap } from '../components/StoreLocationMap';
import { StoreReviews } from '../components/StoreReviews';
import { Avatar } from '../components/Avatar';
import { fetchPublicProfile, trackStoreView, fetchShopBySlugOrId, fetchProductsForShop } from '../lib/store';
import { PublicProfile } from '../types';
import { nearbyHotspots } from '../lib/geo';
import { ReportButton } from '../components/ReportButton';
import { ProductCard } from '../components/ProductCard';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { LanguageToggle } from '../components/LanguageToggle';
import { Footer } from '../components/Footer';

export const StorePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { shops, products, loading } = useCatalog();
  const { language, t, translateShopType } = useLanguage();
  const { savedProductIds, toggleSave } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeLandmark, setActiveLandmark] = useState<string | null>(null);
  const [ownerProfile, setOwnerProfile] = useState<PublicProfile | null>(null);
  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Match by slug, falling back to id so shareable links work even before the
  // slug migration has been applied (shop ids are already slug-like).
  const catalogShop = useMemo<Shop | undefined>(
    () => shops.find((s) => s.slug === slug || s.id === slug),
    [shops, slug],
  );

  // A store that isn't in the public catalog (subscription inactive / pending)
  // is still reachable by direct link and by its owner previewing it — fetch it
  // directly in that case so the page renders with a clear "not visible" notice.
  const [fallbackShop, setFallbackShop] = useState<Shop | null>(null);
  const [fallbackProducts, setFallbackProducts] = useState<Product[]>([]);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    if (catalogShop || !slug || loading) { setResolving(false); return; }
    let cancelled = false;
    setResolving(true);
    (async () => {
      try {
        const s = await fetchShopBySlugOrId(slug);
        if (cancelled) return;
        setFallbackShop(s);
        if (s) {
          const p = await fetchProductsForShop(s.id).catch(() => [] as Product[]);
          if (!cancelled) setFallbackProducts(p);
        }
      } catch {
        if (!cancelled) setFallbackShop(null);
      } finally {
        if (!cancelled) setResolving(false);
      }
    })();
    return () => { cancelled = true; };
  }, [catalogShop, slug, loading]);

  const shop = catalogShop ?? fallbackShop ?? undefined;

  const shopProducts = useMemo(() => {
    if (!shop) return [];
    if (catalogShop) return products.filter((p) => p.ownerShopId === shop.id || p.storeIds.includes(shop.id));
    return fallbackProducts;
  }, [products, shop, catalogShop, fallbackProducts]);

  // Shared between the landmark list and the map so clicks line up.
  const nearbySpots = useMemo(
    () => (shop ? nearbyHotspots(shop.lat, shop.lng, { maxKm: 15, limit: 4 }) : []),
    [shop],
  );

  const focusLandmark = (id: string) => {
    setActiveLandmark(id);
    mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  // Record a store-page view whenever a (different) store is opened. This is the
  // signal behind the merchant's view analytics. Fire-and-forget; dedup lives in
  // trackStoreView so StrictMode's double-invoke doesn't double-count.
  useEffect(() => {
    if (shop?.id) trackStoreView(shop.id, 'store_page');
  }, [shop?.id]);

  // Who runs this store (public-safe name + avatar). Fails quietly pre-migration.
  useEffect(() => {
    const ownerId = shop?.ownerId;
    if (!ownerId) { setOwnerProfile(null); return; }
    let cancelled = false;
    fetchPublicProfile(ownerId)
      .then((p) => { if (!cancelled) setOwnerProfile(p); })
      .catch(() => { if (!cancelled) setOwnerProfile(null); });
    return () => { cancelled = true; };
  }, [shop?.ownerId]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be blocked; ignore */
    }
  };

  const Header = (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#E8DEC8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="AngkorCraft" className="w-9 h-9 object-contain" />
          <div className="font-heading font-black text-2xl text-[#134E4A] tracking-tighter">
            ANGKOR<span className="text-[#FF914D]">CRAFT</span>
          </div>
        </Link>
        <LanguageToggle />
      </div>
    </header>
  );

  if (loading || resolving) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        {Header}
        <div className="flex-1 flex items-center justify-center text-[#8C7A70]">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
        {Header}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 gap-3">
          <AlertTriangle className="w-10 h-10 text-[#FF914D]" />
          <h1 className="text-xl font-bold text-[#134E4A]">{t('storeNotFound')}</h1>
          <p className="text-sm text-[#8C7A70] max-w-sm">{t('storeNotFoundDesc')}</p>
          <Link to="/" className="mt-2 inline-flex items-center gap-1.5 bg-[#134E4A] text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
            <ArrowLeft className="w-4 h-4" /> {t('backToMarketplace')}
          </Link>
        </div>
        <Footer onNavigate={(page) => window.location.assign(`/#${page}`)} onOpenCurrencyConverter={() => window.location.assign('/')} />
      </div>
    );
  }

  const mapHref = shop.googleMapsUrl || (shop.lat && shop.lng ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}` : null);
  const description = localized(shop.description, shop.descriptionKh, language);
  const underReview = shop.moderationStatus === 'flagged' || shop.moderationStatus === 'pending';
  const notLive = !isShopLive(shop);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">
      {Header}

      <main className="flex-1">
        {/* Cover */}
        <div className="relative h-52 sm:h-72 bg-[#F2EDE4]">
          {shop.image ? (
            <img src={shop.image} alt={shop.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#134E4A]/20 font-bold uppercase tracking-widest">AngkorCraft</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute top-4 left-4">
            <Link to="/#locations" className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur text-[#134E4A] text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-white transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> {t('backToMarketplace')}
            </Link>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 relative pb-16">
          {/* Header card */}
          <div className="bg-white rounded-3xl border border-[#E8DEC8] shadow-sm p-5 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1.5">
                  <span className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.2em] bg-[#FF914D]/10 px-2 py-0.5 rounded-full">
                    {translateShopType(shop.type)}
                  </span>
                  {shop.isVerified && (
                    <span className="bg-[#134E4A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#F5C542]" /> {t('verifiedAuthentic')}
                    </span>
                  )}
                </div>
                <h1 className="font-sans text-2xl sm:text-3xl font-extrabold text-[#134E4A] leading-tight">
                  {language === 'kh' ? shop.khmerName || shop.name : shop.name}
                </h1>
                {(language === 'kh' ? shop.name : shop.khmerName) && (
                  <p className="text-sm text-[#8C7A70] mt-0.5">{language === 'kh' ? shop.name : shop.khmerName}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-sm flex-wrap">
                  <span className="inline-flex items-center gap-1 font-bold text-[#2D2926]">
                    <Star className="w-4 h-4 fill-[#FF914D] text-[#FF914D]" /> {shop.rating}
                    <span className="text-[#8C7A70] font-normal">({shop.reviewCount})</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-[#2D2926]" title={t('storeViewsLabel')}>
                    <Eye className="w-4 h-4 text-[#FF914D]" /> {formatViews(shop.viewCount)}
                    <span className="text-[#8C7A70] font-normal">{t('viewsWord')}</span>
                  </span>
                  {(shop.city || shop.region) && (
                    <span className="inline-flex items-center gap-1 text-[#5C4D44]">
                      <MapPin className="w-4 h-4 text-[#FF914D]" /> {shop.city || shop.region}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 bg-[#FF914D] hover:bg-[#F07A33] text-white text-sm font-semibold px-4 py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? t('linkCopied') : t('shareStore')}
                </button>
                {mapHref && (
                  <a href={mapHref} target="_blank" rel="noopener noreferrer" onClick={() => trackStoreView(shop.id, 'directions')} className="inline-flex items-center gap-1.5 border border-[#E8DEC8] hover:border-[#FF914D] text-[#134E4A] text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                    <MapPin className="w-4 h-4" /> {t('mapBtn')}
                  </a>
                )}
              </div>
            </div>

            {underReview && (
              <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span><strong>{t('underReview')}.</strong> {t('underReviewDesc')}</span>
              </div>
            )}

            {notLive && (
              <div className="mt-4 flex items-start gap-2 bg-[#FFF3E9] border border-[#FF914D]/40 text-[#8a4b1e] text-xs rounded-xl p-3">
                <EyeOff className="w-4 h-4 shrink-0 mt-0.5 text-[#FF914D]" />
                <span><strong>{t('storeHiddenTitle')}.</strong> {t('storeHiddenDesc')}</span>
              </div>
            )}

            {description && <p className="mt-4 text-sm text-[#5C4D44] leading-relaxed max-w-3xl">{description}</p>}

            {/* Who runs this store */}
            {ownerProfile && (ownerProfile.fullName || ownerProfile.avatarUrl) && (
              <div className="mt-4 flex items-center gap-2.5">
                <Avatar name={ownerProfile.fullName} src={ownerProfile.avatarUrl} size={36} />
                <div className="text-sm leading-tight">
                  <div className="text-[11px] font-semibold text-[#8C7A70] uppercase tracking-wide">{t('runBy')}</div>
                  <div className="font-bold text-[#134E4A]">{ownerProfile.fullName || '—'}</div>
                </div>
              </div>
            )}

            {/* Quick facts */}
            <div className="mt-5 grid sm:grid-cols-3 gap-3">
              <div className="flex items-start gap-2.5 bg-[#FAF7F2] rounded-xl p-3.5">
                <MapPin className="w-4 h-4 text-[#FF914D] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="text-xs font-semibold text-[#8C7A70] uppercase tracking-wide">{t('directionsLabel')}</div>
                  <div className="text-[#134E4A]">{shop.address || '—'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-[#FAF7F2] rounded-xl p-3.5">
                <Clock className="w-4 h-4 text-[#134E4A] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="text-xs font-semibold text-[#8C7A70] uppercase tracking-wide">{t('openingHours')}</div>
                  <div className="text-[#134E4A]">{shop.openingHours || '—'}</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-[#FAF7F2] rounded-xl p-3.5">
                <CreditCard className="w-4 h-4 text-[#FF914D] shrink-0 mt-0.5" />
                <div className="text-sm min-w-0">
                  <div className="text-xs font-semibold text-[#8C7A70] uppercase tracking-wide">{t('acceptedPayments')}</div>
                  <div className="text-[#134E4A] truncate">{shop.paymentMethods?.join(' · ') || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Nearby tourist landmarks (auto-derived from the shop's pin) */}
          {shop.lat && shop.lng && nearbySpots.length > 0 ? (
            <section className="mt-6 rounded-3xl border border-[#FF914D]/30 bg-gradient-to-br from-[#FFF6EF] to-[#FDF0E6] shadow-[0_2px_16px_rgba(255,145,77,0.10)] p-5 sm:p-7">
              <div className="grid lg:grid-cols-2 gap-5 items-stretch">
                <NearbyHotspots
                  shop={shop}
                  variant="full"
                  spots={nearbySpots}
                  onSelect={focusLandmark}
                  activeId={activeLandmark}
                />
                <div ref={mapSectionRef} className="min-h-[300px]">
                  <StoreLocationMap
                    shop={shop}
                    hotspots={nearbySpots}
                    focusId={activeLandmark}
                    className="h-full min-h-[300px] w-full"
                  />
                </div>
              </div>
            </section>
          ) : null}

          {/* Contact */}
          {(hasContactChannels(shop) || shop.contactNote) && (
            <section className="mt-6 bg-white rounded-3xl border border-[#E8DEC8] shadow-sm p-5 sm:p-7">
              <h2 className="font-sans text-lg font-bold text-[#134E4A] mb-1">{t('contactTitle')}</h2>
              {shop.contactNote && <p className="text-sm text-[#5C4D44] mb-4">{shop.contactNote}</p>}
              <ContactLinks shop={shop} variant="full" onChannelClick={() => trackStoreView(shop.id, 'contact')} />
            </section>
          )}

          {/* Products */}
          <section className="mt-6">
            <h2 className="font-sans text-lg font-bold text-[#134E4A] mb-3 px-1">{t('productsBtn')} <span className="text-[#8C7A70] font-normal">({shopProducts.length})</span></h2>
            {shopProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E8DEC8] p-8 text-center text-sm text-[#8C7A70]">{t('noProductsYet')}</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {shopProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onSelectProduct={setSelectedProduct}
                    isSaved={savedProductIds.includes(p.id)}
                    onToggleSave={(id, e) => { e.stopPropagation(); toggleSave(id); }}
                    shopCount={1}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Ratings & reviews */}
          <StoreReviews shopId={shop.id} />

          {/* Report */}
          <div className="mt-8 flex justify-center">
            <ReportButton targetType="shop" targetId={shop.id} targetName={shop.name} variant="text" />
          </div>
        </div>
      </main>

      <Footer onNavigate={(page) => window.location.assign(`/#${page}`)} onOpenCurrencyConverter={() => window.location.assign('/')} />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          allShops={shops}
          onClose={() => setSelectedProduct(null)}
          isSaved={savedProductIds.includes(selectedProduct.id)}
          onToggleSave={toggleSave}
          onSelectShopOnMap={() => { /* map lives on the locations page */ }}
        />
      )}
    </div>
  );
};
