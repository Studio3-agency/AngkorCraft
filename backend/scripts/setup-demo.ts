/**
 * Creates the three demo accounts and a sample "pending" merchant store so the
 * investor demo has something to click through immediately.
 *
 *   npm run setup-demo
 *
 * Idempotent: re-running reuses existing accounts instead of erroring.
 * Requires the tables to exist (run schema.sql first) and SUPABASE_* in .env.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const PASSWORD = 'Demo1234!';
const ACCOUNTS = [
  { email: 'customer@angkorcraft.demo', fullName: 'Dara Shopper', role: 'customer' as const },
  { email: 'merchant@angkorcraft.demo', fullName: 'Sophea Weaver', role: 'merchant' as const },
  { email: 'admin@angkorcraft.demo', fullName: 'Rithy Admin', role: 'admin' as const },
];

async function findUserByEmail(email: string): Promise<string | null> {
  // listUsers is paginated; the demo project is tiny so page 1 is plenty.
  const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  return data.users.find((u) => u.email === email)?.id ?? null;
}

async function ensureUser(email: string, fullName: string, role: string): Promise<string> {
  let id = await findUserByEmail(email);
  if (!id) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: fullName, role: role === 'admin' ? 'customer' : role },
    });
    if (error) throw error;
    id = data.user.id;
    console.log(`  ✓ created ${role.padEnd(8)} ${email}`);
  } else {
    console.log(`  • exists  ${role.padEnd(8)} ${email}`);
  }
  if (role === 'admin') {
    // The signup trigger clamps self-assigned admin, and protect_profile_role
    // blocks role changes made without an auth context. Delete + re-insert the
    // profile (INSERT isn't guarded) to set admin cleanly. Safe: admins own nothing.
    await supabase.from('profiles').delete().eq('id', id);
    await supabase.from('profiles').insert({ id, role: 'admin', full_name: fullName });
  } else {
    // customer/merchant role is already correct from the signup trigger; just
    // keep the name in sync. (Never delete these — a merchant profile owns a shop.)
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', id);
  }
  return id;
}

async function main() {
  console.log('Setting up demo accounts…');
  const ids: Record<string, string> = {};
  for (const acct of ACCOUNTS) {
    ids[acct.role] = await ensureUser(acct.email, acct.fullName, acct.role);
  }

  // Sample pending store owned by the merchant, so the admin approval queue and
  // the merchant portal both have something to show.
  const merchantId = ids.merchant;
  const shopId = 'sophea-silk-studio';
  console.log('Creating sample pending merchant store…');
  await supabase.from('shops').upsert(
    {
      id: shopId,
      owner_id: merchantId,
      name: 'Sophea Silk Studio',
      khmer_name: 'ស្ទូឌីយោសូត្រសុភា',
      type: 'Artisan Workshop',
      region: 'Siem Reap',
      city: 'Siem Reap',
      address: 'Wat Bo Road, Siem Reap',
      lat: 13.3565,
      lng: 103.8598,
      opening_hours: '9:00 AM - 7:00 PM',
      payment_methods: ['Cash (USD/KHR)', 'ABA Pay'],
      phone: '+855 12 987 654',
      rating: 4.7,
      review_count: 23,
      image_url: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?auto=format&fit=crop&w=800&q=80',
      description: 'A small family weaving studio producing hand-loomed golden silk scarves and traditional krama.',
      description_kh: 'ស្ទូឌីយោត្បាញសូត្រគ្រួសារតូចមួយ ដែលផលិតកន្សែងសូត្រមាសត្បាញដៃ និងក្រមាបុរាណ។',
      is_verified: false,
      status: 'pending',
      subscription_status: 'inactive',
      is_featured: false,
      vertical: 'artisan',
    },
    { onConflict: 'id' },
  );

  await supabase.from('products').upsert(
    [
      {
        id: 'sophea-golden-scarf',
        owner_id: merchantId,
        owner_shop_id: shopId,
        title: 'Hand-loomed Golden Silk Scarf',
        khmer_title: 'កន្សែងសូត្រមាស',
        category: 'Textiles & Silk',
        region: 'Siem Reap',
        price_usd: 38,
        price_range: '$30 - $45',
        price_level: '$$',
        rating: 4.8,
        review_count: 12,
        image_url: 'https://images.unsplash.com/photo-1606760227091-3dd850d97f1d?auto=format&fit=crop&w=800&q=80',
        description: 'Naturally dyed golden silk scarf, hand-loomed over four days.',
        description_kh: 'កន្សែងសូត្រមាសជ្រលក់ពណ៌ធម្មជាតិ ត្បាញដោយដៃរយៈពេលបួនថ្ងៃ។',
        cultural_story: 'Woven on a traditional wooden frame loom using techniques passed down three generations.',
        cultural_story_kh: 'ត្បាញលើកីឈើបុរាណ ដោយប្រើបច្ចេកទេសបន្តវេនបីជំនាន់។',
        store_ids: [shopId],
        tags: ['Hand Loomed', '100% Silk', 'Natural Dyes'],
        is_handmade: true,
        artisan_group: 'Sophea Family Weavers',
        material: '100% Cambodian Golden Silk',
        vertical: 'artisan',
      },
      {
        id: 'sophea-krama',
        owner_id: merchantId,
        owner_shop_id: shopId,
        title: 'Traditional Cotton Krama',
        khmer_title: 'ក្រមាកប្បាស',
        category: 'Textiles & Silk',
        region: 'Siem Reap',
        price_usd: 12,
        price_range: '$8 - $15',
        price_level: '$',
        rating: 4.6,
        review_count: 8,
        image_url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=800&q=80',
        description: 'The iconic Cambodian checkered scarf, woven from soft local cotton.',
        description_kh: 'ក្រមាខ្មែរដ៏ល្បី ត្បាញពីអំបោះកប្បាសក្នុងស្រុកទន់។',
        cultural_story: 'The krama is worn every day across Cambodia — for sun, style, and a hundred practical uses.',
        cultural_story_kh: 'ក្រមាត្រូវបានពាក់ជារៀងរាល់ថ្ងៃទូទាំងកម្ពុជា — សម្រាប់ការពារកម្ដៅថ្ងៃ ម៉ូដ និងការប្រើប្រាស់ជាច្រើន។',
        store_ids: [shopId],
        tags: ['Hand Loomed', 'Cotton'],
        is_handmade: true,
        artisan_group: 'Sophea Family Weavers',
        material: '100% Cotton',
        vertical: 'artisan',
      },
    ],
    { onConflict: 'id' },
  );

  console.log('\nDemo ready. ✅  All accounts use password:  ' + PASSWORD);
  console.log('  Customer: customer@angkorcraft.demo');
  console.log('  Merchant: merchant@angkorcraft.demo   (owns a PENDING store to approve)');
  console.log('  Admin:    admin@angkorcraft.demo');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
