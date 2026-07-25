import React, { useState, useEffect } from 'react';
import { PageType, Product, Shop, ProductCategory } from './types';
import { MOCK_GUIDES } from './data/mockData';
import { useCatalog } from './hooks/useCatalog';
import { useWishlist } from './hooks/useWishlist';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { LocationsPage } from './pages/LocationsPage';
import { GuidePage } from './pages/GuidePage';
import { SavedPage } from './pages/SavedPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CurrencyConverter } from './components/CurrencyConverter';
import { BottomNav } from './components/BottomNav';

export default function PublicSite() {
  const { products, shops, loading } = useCatalog();
  const { savedProductIds, toggleSave, clearSaved } = useWishlist();

  const [currentPage, setCurrentPage] = useState<PageType>(() => {
    const hash = window.location.hash.replace('#', '') as PageType;
    return ['home', 'products', 'locations', 'guide', 'saved'].includes(hash) ? hash : 'home';
  });

  useEffect(() => {
    window.location.hash = currentPage;
  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as PageType;
      if (['home', 'products', 'locations', 'guide', 'saved'].includes(hash)) {
        setCurrentPage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [filterShopId, setFilterShopId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState<boolean>(false);

  // Scroll to top on page change
  const handleNavigate = (page: PageType) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSave(productId);
  };

  const handleSelectShopOnMap = (shop: Shop) => {
    setSelectedShopId(shop.id);
  };

  const handleViewShopProducts = (shopId: string) => {
    setFilterShopId(shopId);
    setCurrentPage('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#2C221E] antialiased">
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        savedCount={savedProductIds.length}
        onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 pb-20 md:pb-0">
        {loading && (
          <div className="max-w-7xl mx-auto px-4 py-20 text-center text-[#8C7A70]">
            <div className="inline-block w-8 h-8 border-3 border-[#FF914D]/30 border-t-[#FF914D] rounded-full animate-spin mb-4" />
            <p className="text-sm font-medium">Loading authentic Cambodian crafts…</p>
          </div>
        )}

        {!loading && currentPage === 'home' && (
          <HomePage
            products={products}
            shops={shops}
            onNavigate={handleNavigate}
            onSelectProduct={setSelectedProduct}
            onSelectShopOnMap={handleSelectShopOnMap}
            onViewShopProducts={handleViewShopProducts}
            savedProductIds={savedProductIds}
            onToggleSave={handleToggleSave}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
          />
        )}

        {!loading && currentPage === 'products' && (
          <ProductsPage
            products={products}
            onSelectProduct={setSelectedProduct}
            savedProductIds={savedProductIds}
            onToggleSave={handleToggleSave}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            filterShopId={filterShopId}
            onClearShopFilter={() => setFilterShopId(null)}
          />
        )}

        {!loading && currentPage === 'locations' && (
          <LocationsPage
            shops={shops}
            selectedShopId={selectedShopId}
            onSelectShop={handleSelectShopOnMap}
            onViewShopProducts={handleViewShopProducts}
          />
        )}

        {!loading && currentPage === 'guide' && (
          <GuidePage
            guides={MOCK_GUIDES}
            onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
          />
        )}

        {!loading && currentPage === 'saved' && (
          <SavedPage
            savedProductIds={savedProductIds}
            allProducts={products}
            allShops={shops}
            onNavigate={handleNavigate}
            onSelectProduct={setSelectedProduct}
            onToggleSave={handleToggleSave}
            onSelectShopOnMap={(s) => {
              handleSelectShopOnMap(s);
              handleNavigate('locations');
            }}
            onClearSaved={clearSaved}
          />
        )}
      </main>

      <Footer
        onNavigate={handleNavigate}
        onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
      />

      <ProductDetailModal
        product={selectedProduct}
        allShops={shops}
        onClose={() => setSelectedProduct(null)}
        isSaved={selectedProduct ? savedProductIds.includes(selectedProduct.id) : false}
        onToggleSave={handleToggleSave}
        onSelectShopOnMap={(s) => {
          handleSelectShopOnMap(s);
          handleNavigate('locations');
        }}
      />

      <CurrencyConverter
        isOpen={isCurrencyConverterOpen}
        onClose={() => setIsCurrencyConverterOpen(false)}
      />

      {/* Mobile bottom tab bar */}
      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} savedCount={savedProductIds.length} />
    </div>
  );
}
