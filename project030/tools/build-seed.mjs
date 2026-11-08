// 由 supabase/content/levels.mjs 產生種子 migration
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { levels as baseLevels, symbols } from '../supabase/content/levels.mjs';
import { stages } from '../supabase/content/stages.mjs';

// 套用每日三關（stages.mjs）到主線內容
export const levels = baseLevels.map((l) => {
  const st = stages[l.day];
  if (!st) return l;
  const config = { ...l.config, steps: st.steps, ...(st.scene ? { scene: { ...l.config.scene, ...st.scene } } : {}) };
  if (st.variant_steps && config.variants) config.variants = config.variants.map((v) => (st.variant_steps[v.id] ? { ...v, steps: st.variant_steps[v.id] } : v));
  return { ...l, config, secrets: { ...(l.secrets || {}), ...(st.secrets || {}) } };
});

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const q = (v) => (v === null || v === undefined ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const j = (v) => (v === null || v === undefined ? 'null' : `${q(JSON.stringify(v))}::jsonb`);

let sql = '-- 由 tools/build-seed.mjs 自動產生。部署後請以管理後台修改內容。\n\n';
for (const s of symbols) {
  sql += `insert into public.symbols (id, key, name, digit, lore) values (${s.id}, ${q(s.key)}, ${q(s.name)}, ${s.digit}, ${j(s.lore)}) on conflict (id) do nothing;\n`;
}
sql += '\n';
for (const l of levels) {
  const secrets = { ...(l.secrets || {}), ...(l.alt_secrets || {}) };
  sql += `insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (${l.day}, ${q(l.code)}, ${q(l.title)}, ${q(l.subtitle)}, ${j(l.config)}, ${j(l.alternate)}, ${j(secrets)}, ${j(l.on_complete || {})}, ${j(l.on_alternate_complete || {})}, ${j(l.on_missed || {})})
on conflict (day) do nothing;\n\n`;
}
sql += `update public.finale_config set
  hunt = ${j([{ title: '最後的座標', clue: '（請在管理後台設定第一段提示）', location_hint: '', code: '' }])},
  final_title = '檔案狀態：持續更新中',
  final_body = '（請在管理後台設定最終訊息）'
where id = 1 and hunt = '[]'::jsonb;\n`;

if (process.argv[2] !== '--no-write') {
  const out = join(root, 'supabase/migrations/20261107000005_seed.sql');
  writeFileSync(out, sql);
  console.log('wrote', out, sql.length, 'bytes');
}
