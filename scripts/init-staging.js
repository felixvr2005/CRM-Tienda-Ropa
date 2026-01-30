/*
 * scripts/init-staging.js
 * Idempotent initialization script for staging: creates default product types and shipping config.
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_KEY=... node scripts/init-staging.js
 */

const fetch = require('node-fetch');

async function upsertConfig(supabaseUrl, serviceKey, key, value) {
  const res = await fetch(`${supabaseUrl}/rest/v1/settings?clave=eq.${encodeURIComponent(key)}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' }
  });
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log(`config ${key} exists`);
    return;
  }
  const insert = await fetch(`${supabaseUrl}/rest/v1/settings`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ clave: key, valor: String(value), tipo: 'number', descripcion: 'Auto-created by init-staging', categoria: 'shipping' })
  });
  if (!insert.ok) {
    console.error('Failed to insert config', await insert.text());
  } else {
    console.log(`Created config ${key}`);
  }
}

async function ensureProductType(supabaseUrl, serviceKey, slug, name, sizeType, availableSizes) {
  const res = await fetch(`${supabaseUrl}/rest/v1/product_types?slug=eq.${encodeURIComponent(slug)}`, {
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Accept: 'application/json' }
  });
  const data = await res.json();
  if (Array.isArray(data) && data.length > 0) {
    console.log(`product_type ${slug} exists`);
    return;
  }
  const insert = await fetch(`${supabaseUrl}/rest/v1/product_types`, {
    method: 'POST',
    headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug, size_type: sizeType, available_sizes: availableSizes })
  });
  if (!insert.ok) console.error('Failed to create product_type', await insert.text());
  else console.log(`Created product_type ${slug}`);
}

(async function main(){
  const supabaseUrl = process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
    process.exit(1);
  }

  await upsertConfig(supabaseUrl, serviceKey, 'free_shipping_threshold', 100);
  await upsertConfig(supabaseUrl, serviceKey, 'standard_shipping_cost', 4.95);
  await upsertConfig(supabaseUrl, serviceKey, 'express_shipping_cost', 9.95);

  await ensureProductType(supabaseUrl, serviceKey, 'zapato', 'Zapato', 'shoe', ['35','36','37','38','39','40','41','42','43','44','45','46']);

  console.log('Staging init finished');
})();
