import { Shop } from '../types';

/**
 * A shop counts as actively boosted (featured) only while its boost window is
 * open — i.e. it's flagged featured AND featured_until is in the future.
 * An expired or missing boost date means it is no longer featured.
 */
export function isBoostActive(shop: Shop): boolean {
  if (!shop.isFeatured || !shop.featuredUntil) return false;
  return new Date(shop.featuredUntil).getTime() > Date.now();
}

/**
 * Whether a store is LIVE to the public. Two independent gates:
 *   1. Approval (`status === 'approved'`) — an admin allowed its content.
 *   2. Subscription — the merchant is paying to be listed.
 * A shop with no `status` field is static mock data (always live). Approval
 * lets content onto the platform; the subscription decides visibility.
 */
export function isShopLive(shop: Shop): boolean {
  const approved = shop.status === undefined || shop.status === 'approved';
  const subscribed =
    shop.subscriptionStatus === undefined ||
    shop.subscriptionStatus === 'active' ||
    shop.subscriptionStatus === 'trial';
  return approved && subscribed;
}

/**
 * Popularity = rating scaled by how many reviews back it up, so a 5.0 with 3
 * reviews doesn't outrank a 4.8 with 900. (Simple review-weighted score.)
 */
export function popularityScore(shop: Shop): number {
  return (shop.rating || 0) * Math.log10((shop.reviewCount || 0) + 10);
}

export type ShopSort = 'popular' | 'rating' | 'reviews' | 'newest' | 'name' | 'verified';

export const SHOP_SORTS: { value: ShopSort; tk: string }[] = [
  { value: 'popular', tk: 'sortPopular' },
  { value: 'rating', tk: 'sortRating' },
  { value: 'reviews', tk: 'sortReviews' },
  { value: 'newest', tk: 'sortNewest' },
  { value: 'name', tk: 'sortName' },
  { value: 'verified', tk: 'sortVerified' },
];

function comparator(sort: ShopSort): (a: Shop, b: Shop) => number {
  switch (sort) {
    case 'rating':
      return (a, b) => b.rating - a.rating || popularityScore(b) - popularityScore(a);
    case 'reviews':
      return (a, b) => (b.reviewCount || 0) - (a.reviewCount || 0);
    case 'newest':
      return (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    case 'name':
      return (a, b) => (a.name || '').localeCompare(b.name || '');
    case 'verified':
      return (a, b) => Number(b.isVerified) - Number(a.isVerified) || popularityScore(b) - popularityScore(a);
    case 'popular':
    default:
      return (a, b) => popularityScore(b) - popularityScore(a);
  }
}

/**
 * Sort shops by the chosen key. When `boostFirst` is on, actively-boosted shops
 * float to the top (that's what "boosting" buys) before the chosen order.
 */
export function sortShops(shops: Shop[], sort: ShopSort, boostFirst = true): Shop[] {
  const cmp = comparator(sort);
  return [...shops].sort((a, b) => {
    if (boostFirst) {
      const ba = isBoostActive(a);
      const bb = isBoostActive(b);
      if (ba !== bb) return ba ? -1 : 1;
    }
    return cmp(a, b);
  });
}

/**
 * Shops eligible for the homepage "Featured" strip: only those with an active
 * boost, ranked by popularity. No boost → not featured (returns empty).
 */
export function featuredShops(shops: Shop[], limit = 12): Shop[] {
  return sortShops(shops.filter(isBoostActive), 'popular', false).slice(0, limit);
}
