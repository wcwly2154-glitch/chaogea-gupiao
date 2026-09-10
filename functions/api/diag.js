// 临时诊断接口：探测 env 中 REFRESH_KV 是否生效
export async function onRequestGet({ request, env }) {
  let kvVal = 'NOT_READ';
  try {
    if (env && env.REFRESH_KV) {
      kvVal = (await env.REFRESH_KV.get('refresh_state')) || 'EMPTY';
    } else {
      kvVal = 'REFRESH_KV_UNDEFINED';
    }
  } catch (e) {
    kvVal = 'ERR:' + e.message;
  }
  const out = {
    envKeys: env ? Object.keys(env) : [],
    kv: kvVal,
  };
  return new Response(JSON.stringify(out), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
