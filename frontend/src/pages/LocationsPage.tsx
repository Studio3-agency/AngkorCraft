import React, { useState } from 'react';
import { Shop, Region } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ShopCard } from '../components/ShopCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { MapPin, Search, Filter, ShieldCheck, Compass, Store } from 'lucide-react';

interface LocationsPageProps {
  shops: Shop[];
  selectedShopId?: string | null;
  onSelectShop: (shop: Shop) => void;
  onViewShopProducts: (shopId: string) => void;
}

export const LocationsPage: React.FC<LocationsPageProps> = ({
  shops,
  selectedShopId,
  onSelectShop,
  onViewShopProducts
}) => {
  const { t, translateRegion, translateShopType } = useLanguage();

  const [selectedRegion, setSelectedRegion] = useState<Region>('All Regions');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const regions: Region[] = ['All Regions', 'Siem Reap', 'Phnom Penh', 'Kampot', 'Battambang'];
  const shopTypes = ['All', 'Traditional Market', 'Social Enterprise', 'Artisan Workshop', 'Craft Co-op', 'Organic Farm', 'Night Market'];

  const filteredShops = shops.filter(shop => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = shop.name.toLowerCase().includes(q);
      const matchAddress = shop.address.toLowerCase().includes(q);
      const matchCity = shop.city.toLowerCase().includes(q);
      const matchKhmer = shop.khmerName.includes(q);
      if (!matchName && !matchAddress && !matchCity && !matchKhmer) return false;
    }

    if (selectedRegion !== 'All Regions' && shop.region !== selectedRegion) return false;
    if (selectedType !== 'All' && shop.type !== selectedType) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.25em]">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('verifiedPhysicalLocations')}</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('shopDirectoryTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('shopDirectoryDesc')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-[#D4AF37] space-y-1">
          <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>{t('verifiedPhysicalLocations')}</span>
          </div>
          <p className="text-[10px] text-[#F2EDE4]/80">{t('mapDirectionsDesc')}</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BF5A36]" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full pl-9 pr-3 py-2 text-xs text-[#2D2926] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
            />
          </div>

          {/* Region Selector */}
          <div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as Region)}
              className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full px-4 py-2 text-xs text-[#2D2926] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#134E4A]"
            >
              {regions.map(r => (
                <option key={r} value={r}>{translateRegion(r)}</option>
              ))}
            </select>
          </div>

          {/* Venue Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full px-4 py-2 text-xs text-[#2D2926] font-bold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-[#134E4A]"
            >
              {shopTypes.map(st => (
                <option key={st} value={st}>{st === 'All' ? translateRegion('All Regions').split(' ')[0] + ' ' + t('category') : translateShopType(st)}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Split View: Interactive Map & Shop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Leaflet Map Sticky Column */}
        <div className="lg:col-span-6 order-2 lg:order-1 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#2D2926] font-bold uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-[#BF5A36]">
              <Compass className="w-4 h-4 text-[#BF5A36]" />
              {t('fullScreenInteractiveMap')}
            </span>
            <span className="text-[10px] text-[#8C7A70]">{t('mapDirectionsDesc')}</span>
          </div>

          <InteractiveMap 
            shops={filteredShops} 
            selectedShopId={selectedShopId}
            onSelectShop={onSelectShop}
            className="h-[480px] lg:h-[600px] w-full"
          />
        </div>

        {/* Shop Cards Scroll Column */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5C4D44] font-bold uppercase tracking-wider px-1">
            <span>{t('showingCount').replace('{count}', filteredShops.length.toString())}</span>
            <span>{t('sortedByPopularity')}</span>
          </div>

          <div className="space-y-4">
            {filteredShops.map(shop => (
              <div 
                key={shop.id}
                className={`transition-all ${
                  selectedShopId === shop.id ? 'ring-2 ring-[#BF5A36] rounded-2xl shadow-lg' : ''
                }`}
              >
                <ShopCard
                  shop={shop}
                  onSelectShopOnMap={onSelectShop}
                  onViewShopProducts={onViewShopProducts}
                />
              </div>
            ))}

            {filteredShops.length === 0 && (
              <div className="bg-white p-10 rounded-3xl border border-[#E8DEC8] text-center space-y-3">
                <Store className="w-12 h-12 text-[#BF5A36] mx-auto" />
                <h3 className="font-sans font-bold text-lg text-[#2D2926]">
                  {t('noShopsFound')}
                </h3>
                <p className="text-xs text-[#5C4D44]">
                  {t('noShopsDesc')}
                </p>
                <button
                  onClick={() => {
                    setSelectedRegion('All Regions');
                    setSelectedType('All');
                    setSearchQuery('');
                  }}
                  className="bg-[#134E4A] hover:bg-[#0f3d3a] text-white px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider"
                >
                  {t('reset')}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

