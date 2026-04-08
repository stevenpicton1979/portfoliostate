/**
 * Vercel cron job — runs every 30 minutes.
 * Checks all products, posts Slack alerts on state transitions.
 * State is tracked via @vercel/kv (optional — gracefully degrades if not configured).
 */

const PRODUCTS = [
  { name: 'WhatCanIBuild', url: 'https://whatcanibuild.com.au' },
  { name: 'ZoneIQ', url: 'https://zoneiq.com.au' },
  { name: 'ClearOffer', url: 'https://clearoffer.com.au' },
  { name: 'SubdivideIQ', url: 'https://subdivide.whatcanibuild.com.au' },
];

const SLACK_CHANNEL = '#claude-alerts';

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

async function postSlack(text) {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;
  await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel: SLACK_CHANNEL, text }),
  });
}

function aestTimestamp() {
  return new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Brisbane',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

module.exports = async (req, res) => {
  // Vercel cron sends GET with a secret header; verify if configured
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && req.headers['authorization'] !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const results = await Promise.all(PRODUCTS.map(checkProduct));

  // Try to load KV for state tracking (graceful degradation if not configured)
  let kv = null;
  try {
    const mod = await import('@vercel/kv');
    kv = mod.kv;
  } catch {
    // KV not installed or not configured — run without state tracking
  }

  const ts = aestTimestamp();
  const alerts = [];

  for (const r of results) {
    const key = `health:${r.name}`;
    const prev = kv ? await kv.get(key) : null;
    const isDown = r.status === 'red';
    const wasDown = prev === 'red';

    if (isDown && !wasDown) {
      const msg = `🚨 ${r.name} is down — ${ts}`;
      await postSlack(msg);
      alerts.push(msg);
    } else if (!isDown && wasDown) {
      const msg = `✅ ${r.name} is back up — ${ts}`;
      await postSlack(msg);
      alerts.push(msg);
    }

    if (kv) await kv.set(key, r.status, { ex: 3600 }); // expire after 1 hour as a safety net
  }

  res.json({ results, alerts, checked: new Date().toISOString(), kvEnabled: !!kv });
};
