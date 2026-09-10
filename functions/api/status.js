// Cloudflare Pages Function: 本地守护进程轮询此接口读取当前刷新信号
function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' }
  });
}

export async function onRequestGet({ env }) {
  const raw = await env.REFRESH_KV.get('refresh_state');
  let state = { pending: false };
  if (raw) {
    try {
      state = JSON.parse(raw);
    } catch (e) {
      state = { pending: false };
    }
  }
  return json(state);
}
