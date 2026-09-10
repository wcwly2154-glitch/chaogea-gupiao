// Cloudflare Pages Function: 持仓数据云端单一数据源（录入页写入 → 首页实时读取）
const SECRET = 'chaogea-refresh-2026';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

// GET：首页读取当前持仓（无需密钥，持仓非敏感但含成本，仅域名内使用）
export async function onRequestGet({ env }) {
  const raw = await env.REFRESH_KV.get('holdings_sync');
  if (!raw) return json({ holdings: [], watch: [], updatedAt: 0 });
  try {
    return json(JSON.parse(raw));
  } catch (e) {
    return json({ holdings: [], watch: [], updatedAt: 0 });
  }
}

// POST：录入页保存时写入（需密钥）
export async function onRequestPost({ request, env }) {
  let b;
  try {
    b = await request.json();
  } catch (e) {
    return json({ error: 'bad json' }, 400);
  }
  if (b.secret !== SECRET) return json({ error: 'unauthorized' }, 403);
  const data = {
    holdings: b.holdings || [],
    watch: b.watch || [],
    updatedAt: Date.now()
  };
  await env.REFRESH_KV.put('holdings_sync', JSON.stringify(data));
  return json({ ok: true, updatedAt: data.updatedAt });
}
