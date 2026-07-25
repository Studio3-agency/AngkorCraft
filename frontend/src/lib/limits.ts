// Realistic caps for the current (free-tier) database. Generous enough for a
// real small merchant with a few branches, bounded enough that thousands of
// sellers won't blow up storage. Bump these when the plan is upgraded — the
// same numbers are enforced at the DB level (see the quotas migration).
export const MAX_STORES_PER_MERCHANT = 5;
export const MAX_PRODUCTS_PER_STORE = 60;

// Upper bound on rows pulled into a single public catalog fetch, so a huge
// catalog never gets loaded all at once in the browser.
export const CATALOG_FETCH_LIMIT = 500;
