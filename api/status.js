const PRODUCTS = [
  { name: 'PropertyVitals', url: 'https://www.propertyvitals.com.au' },
  { name: 'WhatCanIBuild', url: 'https://whatcanibuild.com.au' },
  { name: 'ClearOffer', url: 'https://clearoffer.com.au' },
  // ZoneIQ removed — deprecated
  // SubdivideIQ removed — parked
];

async function checkProduct(product) {
  const start = Date.now();
  try {
    const res = await fetch(product.url, {
      signal: AbortSignal.timeout(10000),
      redirect: 'follow',
    });
    const ms = Date.now() - start;
    const status = !res.ok ? 'red' : ms > 3000 ? 'amber' : 'green';
    return { name: product.name, url: product.url, status, ms, code: res.status };
  } catch (e) {
    const ms = Date.now() - start;
    return { name: product.name, url: product.url, status: 'red', ms, error: e.message };
  }
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Access-Control-Allow-Origin', '*');
  const results = await Promise.all(PRODUCTS.map(checkProduct));
  res.json({ results, checked: new Date().toISOString() });
};
