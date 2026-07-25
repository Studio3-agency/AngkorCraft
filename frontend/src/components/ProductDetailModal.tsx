import React from 'react';
import { Product, Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { X, MapPin, ShieldCheck, Sparkles, Heart, Star, Clock, CreditCard, ExternalLink, BookOpen, Layers } from 'lucide-react';
import { ReportButton } from './ReportButton';

interface ProductDetailModalProps {
  product: Product | null;
  allShops: Shop[];
  onClose: () => void;
  isSaved: boolean;
  onToggleSave: (productId: string, e: React.MouseEvent) => void;
  onSelectShopOnMap: (shop: Shop) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allShops,
  onClose,
  isSaved,
  onToggleSave,
  onSelectShopOnMap
}) => {
  const { t, language, translateCategory, translateRegion, translateShopType } = useLanguage();

  if (!product) return null;

  // Filter exact physical shops that carry this item
  const verifiedShops = allShops.filter(shop => product.storeIds.includes(shop.id));

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#FAF7F2] rounded-3xl border border-[#E8DEC8] shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Sticky Header */}
        <div className="bg-[#134E4A] text-white p-4 sm:p-5 flex items-center justify-between shrink-0 border-b border-[#F5C542]/30">
          <div className="flex items-center gap-2">
            <span className="bg-[#FF914D] text-white text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wider">
              {translateCategory(product.category)}
            </span>
            <span className="text-xs text-[#F5C542] font-semibold hidden sm:inline">
              {t('regionOfOrigin')}: {translateRegion(product.region)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <ReportButton
              targetType="product"
              targetId={product.id}
              targetName={product.title}
              variant="icon"
              className="!text-white/80 hover:!text-white bg-white/10 hover:!bg-white/20"
            />
            <button
              onClick={(e) => onToggleSave(product.id, e)}
              className={`p-2 rounded-full transition-colors cursor-pointer ${
                isSaved ? 'bg-[#FF914D] text-white' : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-8 space-y-8 overflow-y-auto">
          
          {/* Hero Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden bg-[#F2EDE4] aspect-4/3 border border-[#E8DEC8] shadow-xs">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.title || 'Unnamed Product'} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#134E4A]/30">
                  <span className="text-sm font-bold uppercase tracking-wider">No Image</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 right-3 bg-[#134E4A]/90 backdrop-blur-md text-white p-3 rounded-2xl text-xs flex items-center justify-between border border-white/10">
                <div>
                  <div className="font-bold text-[#F5C542]">{product.priceRange}</div>
                  <div className="text-xs text-white/70">{t('priceRange')}: {product.priceLevel}</div>
                </div>
                <div className="flex items-center gap-1 font-bold text-white">
                  <Star className="w-3.5 h-3.5 fill-[#F5C542] text-[#F5C542]" />
                  <span>{product.rating}</span>
                  <span className="text-white/70 font-normal">({product.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Info Summary */}
            <div className="space-y-4">
              <div>
                <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#2D2926] leading-tight mb-1">
                  {language === 'kh' ? (product.khmerTitle || 'ទំនិញមិនមានឈ្មោះ') : (product.title || 'Unnamed Product')}
                </h1>
                <div className="text-base text-[#FF914D] font-semibold mb-3">
                  {language === 'kh' ? (product.title || 'Unnamed Product') : (product.khmerTitle || 'ទំនិញមិនមានឈ្មោះ')}
                </div>
                <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed font-sans">
                  {localized(product.description, product.descriptionKh, language) || <span className="italic opacity-60">No description provided.</span>}
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {product.isGiCertified && (
                  <span className="bg-[#134E4A] text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs border border-[#F5C542]/30">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F5C542]" />
                    Official PGI Certification
                  </span>
                )}
                {product.isHandmade && (
                  <span className="bg-[#FF914D] text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                    100% Traditional Handcraft
                  </span>
                )}
              </div>

              {/* Artisan & Material Meta */}
              <div className="bg-white p-4 rounded-2xl border border-[#E8DEC8] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7A70] font-medium flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#FF914D]" />
                    {language === 'kh' ? 'វត្ថុធាតុដើម:' : 'Raw Material:'}
                  </span>
                  <span className="font-bold text-[#2D2926]">{product.material || <span className="italic opacity-60 font-normal">Not specified</span>}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#8C7A70] font-medium flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#134E4A]" />
                    {language === 'kh' ? 'សមាគមសិប្បករ:' : 'Artisan Guild:'}
                  </span>
                  <span className="font-bold text-[#2D2926] text-right">{product.artisanGroup || <span className="italic opacity-60 font-normal">Not specified</span>}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cultural Heritage & Story */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8DEC8] shadow-xs space-y-3">
            <h2 className="font-sans font-bold text-xl text-[#134E4A] flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF914D]"></span>
              {t('culturalStory')}
            </h2>
            <p className="text-xs sm:text-sm text-[#5C4D44] leading-relaxed italic border-l-2 border-[#FF914D] pl-4 py-1">
              {localized(product.culturalStory, product.culturalStoryKh, language) ? `"${localized(product.culturalStory, product.culturalStoryKh, language)}"` : "No cultural story provided."}
            </p>
          </div>

          {/* Authenticity Verification Tips for Tourists */}
          <div className="bg-[#FF914D]/10 p-6 rounded-2xl border border-[#FF914D]/20 space-y-3">
            <h2 className="font-sans font-bold text-lg text-[#FF914D] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#FF914D]" />
              {t('keyAuthenticityTips')}
            </h2>
            <ul className="space-y-2 text-xs text-[#5C4D44]">
              {product.authenticTips && product.authenticTips.length > 0 ? (
                product.authenticTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF914D] shrink-0 mt-1.5"></span>
                    <span>{tip}</span>
                  </li>
                ))
              ) : (
                <li className="italic opacity-60">No authenticity tips provided.</li>
              )}
            </ul>
          </div>

          {/* Exact Physical Store Locations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-sans font-bold text-xl text-[#134E4A] flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#FF914D]" />
                  {t('whereToBuySavedItems').replace('{count}', verifiedShops.length.toString())}
                </h2>
                <p className="text-xs text-[#5C4D44]">{t('shopDirectoryDesc')}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedShops.map(shop => (
                <div key={shop.id} className="bg-white p-4 rounded-2xl border border-[#E8DEC8] space-y-3 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-sans font-bold text-base text-[#2D2926] leading-tight">
                          {language === 'kh' ? (shop.khmerName || 'ហាងមិនមានឈ្មោះ') : (shop.name || 'Unnamed Shop')}
                        </h3>
                        <div className="text-xs text-[#134E4A] font-semibold">{language === 'kh' ? (shop.name || 'Unnamed Shop') : (shop.khmerName || 'ហាងមិនមានឈ្មោះ')}</div>
                      </div>
                      <span className="bg-[#FF914D]/10 text-[#FF914D] text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {translateShopType(shop.type)}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C4D44] line-clamp-2 my-2">{shop.address || <span className="italic opacity-60">Address not specified</span>}</p>

                    <div className="space-y-1 text-xs text-[#5C4D44]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#134E4A]" />
                        <span>{shop.openingHours || <span className="italic opacity-60">Hours not specified</span>}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-[#FF914D]" />
                        <span>{shop.paymentMethods && shop.paymentMethods.length > 0 ? shop.paymentMethods.join(', ') : <span className="italic opacity-60">Not specified</span>}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#134E4A]/10 flex items-center gap-2">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectShopOnMap(shop);
                      }}
                      className="flex-1 bg-[#134E4A] hover:bg-[#0f3d3a] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#F5C542]" />
                      <span>{language === 'kh' ? 'មើលលើផែនទី' : 'View on Map'}</span>
                    </button>

                    {!!(shop.googleMapsUrl || (shop.lat && shop.lng)) && (
                      <a
                        href={shop.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-[#F2EDE4] hover:bg-[#E8DEC8] text-[#134E4A] rounded-full transition-colors border border-[#134E4A]/10"
                        title="Google Maps Navigation"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

