// Cloudflare Pages Function: 本地守护进程完成刷新后回写完成状态
const SECRET = 'chaogea-refresh-2026';

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'bad json' }, 400);
  }
  if (body.secret !== SECRET) {
    return json({ error: 'unauthorized' }, 403);
  }
  const raw = await env.REFRESH_KV.get('refresh_state');
  let s = raw ? JSON.parse(raw) : { pending: false };
  s.pending = false;
  s.lastCompletedAt = Date.now();
  s.lastRequestedAt = s.requestedAt || s.lastRequestedAt || null;
  await env.REFRESH_KV.put('refresh_state', JSON.stringify(s));
  return json({ ok: true });
}
