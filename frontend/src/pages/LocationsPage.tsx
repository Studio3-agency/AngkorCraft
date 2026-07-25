import React, { useState, useEffect } from 'react';
import { Shop, Region } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ShopListItem } from '../components/ShopListItem';
import { InteractiveMap } from '../components/InteractiveMap';
import { CustomSelect } from '../components/CustomSelect';
import { sortShops, SHOP_SORTS, ShopSort } from '../lib/shops';
import { useUserLocation } from '../hooks/useUserLocation';
import { MapPin, Search, ArrowUpDown, ShieldCheck, Compass, Store, ChevronLeft, ChevronRight } from 'lucide-react';

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
  const { location: userLocation, request: locateUser } = useUserLocation();

  const [selectedRegion, setSelectedRegion] = useState<Region>('All Regions');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<ShopSort>('popular');
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

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

  // Boosted shops surface first, then the chosen sort order.
  const sortedShops = sortShops(filteredShops, sortBy, true);

  // Paginate the listing (the map still shows every filtered shop).
  const totalPages = Math.max(1, Math.ceil(sortedShops.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageShops = sortedShops.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Reset to the first page whenever the filters, sort, or page size change.
  useEffect(() => { setPage(1); }, [searchQuery, selectedRegion, selectedType, sortBy, pageSize]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#F5C542]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5C542] uppercase tracking-[0.25em]">
            <MapPin className="w-4 h-4 text-[#F5C542]" />
            <span>{t('verifiedPhysicalLocations')}</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('shopDirectoryTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('shopDirectoryDesc')}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-xs text-[#F5C542] space-y-1">
          <div className="font-bold flex items-center gap-1.5 uppercase tracking-wider text-xs">
            <ShieldCheck className="w-4 h-4 text-[#F5C542]" />
            <span>{t('verifiedPhysicalLocations')}</span>
          </div>
          <p className="text-xs text-[#F2EDE4]/80">{t('mapDirectionsDesc')}</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E8DEC8] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#FF914D]" />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full pl-9 pr-3 py-2 text-xs text-[#2D2926] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#FF914D]"
            />
          </div>

          {/* Region Selector */}
          <div>
            <CustomSelect
              value={selectedRegion}
              onChange={(val) => setSelectedRegion(val as Region)}
              options={regions.map(r => ({ label: translateRegion(r), value: r }))}
            />
          </div>

          {/* Venue Type Selector */}
          <div>
            <CustomSelect
              value={selectedType}
              onChange={(val) => setSelectedType(val)}
              options={shopTypes.map(st => ({ label: st === 'All' ? translateRegion('All Regions').split(' ')[0] + ' ' + t('category') : translateShopType(st), value: st }))}
            />
          </div>

          {/* Sort Selector */}
          <div>
            <CustomSelect
              value={sortBy}
              onChange={(val) => setSortBy(val as ShopSort)}
              options={SHOP_SORTS.map(s => ({ label: t(s.tk), value: s.value }))}
              icon={<ArrowUpDown className="w-3.5 h-3.5 text-[#FF914D]" />}
            />
          </div>

        </div>
      </div>

      {/* Split View: Interactive Map & Shop Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Leaflet Map Sticky Column */}
        <div className="lg:col-span-6 order-2 lg:order-1 lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#2D2926] font-bold uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5 text-[#FF914D]">
              <Compass className="w-4 h-4 text-[#FF914D]" />
              {t('fullScreenInteractiveMap')}
            </span>
            <span className="text-xs text-[#8C7A70]">{t('mapDirectionsDesc')}</span>
          </div>

          <InteractiveMap
            shops={sortedShops}
            selectedShopId={selectedShopId}
            onSelectShop={onSelectShop}
            userLocation={userLocation}
            onLocate={locateUser}
            className="h-[480px] lg:h-[600px] w-full"
          />
        </div>

        {/* Shop Cards Scroll Column */}
        <div className="lg:col-span-6 order-1 lg:order-2 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#5C4D44] font-bold uppercase tracking-wider px-1">
            <span>{t('showingCount').replace('{count}', sortedShops.length.toString())}</span>
            <div className="flex items-center gap-1.5 normal-case tracking-normal">
              <span className="text-[#8C7A70]">{t('perPageShow')}</span>
              <CustomSelect
                value={String(pageSize)}
                onChange={(val) => setPageSize(Number(val))}
                options={[10, 50, 100].map((n) => ({ label: String(n), value: String(n) }))}
              />
            </div>
          </div>

          {/* Compact rows so 3–4 stores are visible at once; scrolls on its own. */}
          <div className="space-y-3 lg:max-h-[620px] lg:overflow-y-auto lg:pr-1">
            {pageShops.map(shop => (
              <div
                key={shop.id}
                className={`transition-all rounded-2xl ${
                  selectedShopId === shop.id ? 'ring-2 ring-[#FF914D] shadow-lg' : ''
                }`}
              >
                <ShopListItem
                  shop={shop}
                  onSelectShopOnMap={onSelectShop}
                />
              </div>
            ))}

            {sortedShops.length === 0 && (
              <div className="bg-white p-10 rounded-3xl border border-[#E8DEC8] text-center space-y-3">
                <Store className="w-12 h-12 text-[#FF914D] mx-auto" />
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

          {/* Pagination — browse stores without the map */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#E8DEC8] text-[#134E4A] hover:border-[#FF914D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> {t('prevPage')}
              </button>
              <span className="text-xs font-semibold text-[#8C7A70]">
                {t('pageXofY').replace('{c}', String(currentPage)).replace('{t}', String(totalPages))}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold border border-[#E8DEC8] text-[#134E4A] hover:border-[#FF914D] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {t('nextPage')} <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

