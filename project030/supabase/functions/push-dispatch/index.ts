// PROJECT 030 · 推播派送（由 pg_cron 每 5 分鐘透過 pg_net 呼叫）
// 需要的 secrets：CRON_SECRET、VAPID_PUBLIC_KEY、VAPID_PRIVATE_KEY、VAPID_SUBJECT（mailto:...）
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';
import webpush from 'npm:web-push@3.6.7';

const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com', Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) return new Response('forbidden', { status: 403 });
  const { data: items, error } = await sb.rpc('push_claim', { max_items: 50 });
  if (error) return new Response(error.message, { status: 500 });
  let sent = 0;
  for (const n of items ?? []) {
    const gone: string[] = [];
    let ok = false;
    for (const sub of n.subs) {
      try {
        await webpush.sendNotification(sub, JSON.stringify({ title: n.title, body: n.body, tag: `p030-${n.id}`, url: n.day && n.day <= 10 ? `./index.html#/zone/${n.day}` : './index.html#/inbox' }), { TTL: 3600 * 6 });
        ok = true;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) gone.push(sub.endpoint);
      }
    }
    await sb.rpc('push_mark', { nid: n.id, ok, gone });
    if (ok) sent++;
  }
  return Response.json({ claimed: items?.length ?? 0, sent });
});
