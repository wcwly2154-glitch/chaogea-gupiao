// Cloudflare Pages Function: 交易日志云端单一数据源（录入页写入 → 守护进程拉回本地 trades.json → 自动化读取）
const SECRET = 'chaogea-refresh-2026';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

// GET：录入页读取当前交易记录（无需密钥）
export async function onRequestGet({ env }) {
  const raw = await env.REFRESH_KV.get('trades_sync');
  if (!raw) return json({ trades: [], updatedAt: 0 });
  try {
    return json(JSON.parse(raw));
  } catch (e) {
    return json({ trades: [], updatedAt: 0 });
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
    trades: b.trades || [],
    updatedAt: Date.now()
  };
  await env.REFRESH_KV.put('trades_sync', JSON.stringify(data));
  return json({ ok: true, updatedAt: data.updatedAt });
}
