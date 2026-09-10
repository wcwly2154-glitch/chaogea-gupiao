// Cloudflare Pages Function: 接收网页按钮的一次性刷新信号，写入 KV
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
  const state = {
    pending: true,
    requestedAt: Date.now(),
    source: body.source || 'web',
  };
  await env.REFRESH_KV.put('refresh_state', JSON.stringify(state));
  return json({ ok: true, state });
}

// 也允许 GET 触发（方便手动 curl 测试，同样需 secret）
export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('secret') !== SECRET) {
    return json({ error: 'unauthorized' }, 403);
  }
  const state = {
    pending: true,
    requestedAt: Date.now(),
    source: 'get',
  };
  await env.REFRESH_KV.put('refresh_state', JSON.stringify(state));
  return json({ ok: true, state });
}

// v2: 首页版块重构后强制 Functions 重新打包（清理旧诊断路由缓存）

// v2: 首页版块重构后强制 Functions 重新打包（清理旧诊断路由缓存）
