-- PROJECT 030 · 一次性安裝檔：整份貼到 Supabase → SQL Editor → Run
-- 由 migrations/*.sql 合併產生

-- ===== migrations/20261107000001_schema.sql =====
-- PROJECT 030 · 資料庫結構
-- 所有遊戲狀態只能經由 SECURITY DEFINER RPC 修改；玩家不能直接寫入任何遊戲資料表。

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public;

-- ───────────────────────── 全域設定 ─────────────────────────
create table public.settings (
  id                 int primary key default 1 check (id = 1),
  birthday           date not null default (current_date + 11),
  tz                 text not null default 'Asia/Taipei',
  pending_reminder   time not null default '20:00',
  expiring_reminder  time not null default '22:30',
  daily_reminder_cap int  not null default 2,
  updated_at         timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ───────────────────────── 身分 ─────────────────────────
create table public.admins (
  user_id    uuid primary key references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create table public.admin_emails (email text primary key);
create table public.allowed_players (
  email      text primary key,
  note       text,
  created_at timestamptz not null default now()
);

-- 遊戲檔案：正式玩家每個帳號一份；管理者可另建 is_test 測試檔案（與正式進度完全隔離）
create table public.profiles (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  is_test    boolean not null default false,
  label      text,
  sim_offset interval,              -- 僅測試檔案使用：模擬時間 = now() + sim_offset
  created_at timestamptz not null default now()
);
create unique index profiles_one_real_per_user on public.profiles (user_id) where not is_test;

-- ───────────────────────── 內容（管理者可編輯） ─────────────────────────
create table public.levels (
  day                   int primary key check (day between 1 and 11),   -- 11 = 生日終章
  code                  text not null,
  title                 text not null,
  subtitle              text,
  open_at               timestamptz,          -- 自訂開放時間（null = 當日 00:00 Asia/Taipei）
  close_at              timestamptz,          -- 自訂截止（不含）（null = 次日 00:00）
  config                jsonb not null default '{}',   -- 主線：場景、步驟、變體（不含答案）
  alternate             jsonb,                         -- 逾期後的替代路線（null = 只會 MISSED）
  secrets               jsonb not null default '{}',   -- 答案 / 提示 / 揭露內容（玩家永遠讀不到）
  ar_fallback           jsonb not null default '{}',   -- {"step_id": true} 管理者啟用 AR 備用驗證
  on_complete           jsonb not null default '{}',
  on_alternate_complete jsonb not null default '{}',
  on_missed             jsonb not null default '{}',
  updated_at            timestamptz not null default now()
);

create table public.symbols (
  id     int primary key check (id between 1 and 10),
  key    text not null unique,
  name   text not null,
  digit  int  not null check (digit between 0 and 9),
  lore   jsonb not null default '[]'      -- [{"from_day":1,"text":"..."}] 分階段揭露
);

-- 終章現實尋寶（只存在資料庫，生日當天才會由 RPC 回傳）
create table public.finale_config (
  id          int primary key default 1 check (id = 1),
  hunt        jsonb not null default '[]',   -- [{"title","clue","location_hint","code"}]
  final_title text,
  final_body  text,
  updated_at  timestamptz not null default now()
);
insert into public.finale_config (id) values (1) on conflict do nothing;

-- ───────────────────────── 玩家狀態 ─────────────────────────
create table public.player_levels (
  profile_id   uuid not null references public.profiles on delete cascade,
  day          int  not null references public.levels on delete cascade,
  status       text not null default 'LOCKED'
               check (status in ('LOCKED','AVAILABLE','IN_PROGRESS','COMPLETED','MISSED','ALTERNATE')),
  outcome      text check (outcome in ('ON_TIME','ALTERNATE')),
  variant      text,
  started_at   timestamptz,
  completed_at timestamptz,
  missed_at    timestamptz,              -- 一旦寫入永不清除：時間不可逆
  data         jsonb not null default '{"done":{},"attempts":{},"hints":{},"reveals":{},"started":{}}',
  primary key (profile_id, day)
);

create table public.flags (
  profile_id uuid not null references public.profiles on delete cascade,
  key        text not null,
  value      jsonb not null default 'true',
  source     text,
  set_at     timestamptz not null default now(),
  primary key (profile_id, key)
);

create table public.inventory (
  profile_id  uuid not null references public.profiles on delete cascade,
  item_key    text not null,
  kind        text not null check (kind in ('symbol','item','shard','sample')),
  name        text,
  description text,
  data        jsonb not null default '{}',
  source_day  int,
  acquired_at timestamptz not null default now(),
  primary key (profile_id, item_key)
);

create table public.event_log (
  id         bigserial primary key,
  profile_id uuid not null references public.profiles on delete cascade,
  at         timestamptz not null,
  type       text not null,
  day        int,
  payload    jsonb not null default '{}'
);
create index on public.event_log (profile_id, at);

create table public.observations (
  profile_id uuid not null references public.profiles on delete cascade,
  day        int  not null,
  action     text not null check (action in ('explore','preserve','adjust','rest')),
  at         timestamptz not null,
  primary key (profile_id, day)
);

create table public.evidence (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles on delete cascade,
  day          int  not null,
  step_id      text not null,
  kind         text not null check (kind in ('photo','audio','text','choice','scan','code')),
  storage_path text,
  text_content text,
  payload      jsonb not null default '{}',
  status       text not null default 'PENDING_REVIEW'
               check (status in ('SUBMITTED','PENDING_REVIEW','APPROVED','NEEDS_MORE','OVERDUE','REPLACED')),
  on_time      boolean not null default true,
  submitted_at timestamptz not null,
  reviewed_at  timestamptz,
  reviewer     uuid,
  review_note  text
);
create index on public.evidence (profile_id, day);
create index on public.evidence (status);

create table public.notifications (
  id          bigserial primary key,
  profile_id  uuid not null references public.profiles on delete cascade,
  type        text not null check (type in ('NEW_MISSION','MISSION_PENDING','MISSION_EXPIRING','MISSION_MISSED','SPECIAL_EVENT')),
  dedupe_key  text not null,
  day         int,
  title       text not null,
  body        text not null,
  created_at  timestamptz not null,
  read_at     timestamptz,
  push_status text not null default 'inapp' check (push_status in ('inapp','queued','sending','sent','failed','skipped')),
  pushed_at   timestamptz,
  unique (profile_id, dedupe_key)
);

create table public.notification_prefs (
  profile_id   uuid primary key references public.profiles on delete cascade,
  push_enabled boolean not null default true,
  types        jsonb not null default '{"NEW_MISSION":true,"MISSION_PENDING":true,"MISSION_EXPIRING":true,"MISSION_MISSED":true,"SPECIAL_EVENT":true}',
  quiet_start  time default '23:30',
  quiet_end    time default '08:00',
  updated_at   timestamptz not null default now()
);

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

create table public.portrait_gift (
  profile_id    uuid primary key references public.profiles on delete cascade,
  unlocked_via  text not null,           -- mirror / shards / admin
  unlocked_at   timestamptz not null,
  choice        jsonb not null default '{}',
  reference_paths text[] not null default '{}',
  invitation_no text not null default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  saved_at      timestamptz
);

create table public.finale_progress (
  profile_id      uuid primary key references public.profiles on delete cascade,
  definition      text,
  skipped         boolean not null default false,
  defined_at      timestamptz,
  hunt_index      int not null default 0,
  hunt_done_at    timestamptz
);

-- ───────────────────────── 永久紀錄保護 ─────────────────────────
-- event_log 不可修改；只有在清除「測試檔案」時才允許刪除。
create or replace function private.guard_event_log() returns trigger language plpgsql as $$
begin
  if tg_op = 'UPDATE' then
    raise exception 'P030_EVENT_LOG_IMMUTABLE';
  end if;
  if coalesce(current_setting('p030.purge_test', true), '') <> 'on' then
    raise exception 'P030_EVENT_LOG_IMMUTABLE';
  end if;
  return old;
end $$;
create trigger event_log_guard before update or delete on public.event_log
  for each row execute function private.guard_event_log();

-- missed_at 一旦寫入不可回寫（測試檔案重置除外）
create or replace function private.guard_missed() returns trigger language plpgsql as $$
begin
  if old.missed_at is not null and (new.missed_at is distinct from old.missed_at)
     and coalesce(current_setting('p030.purge_test', true), '') <> 'on' then
    raise exception 'P030_TIME_IS_IRREVERSIBLE';
  end if;
  return new;
end $$;
create trigger player_levels_guard before update on public.player_levels
  for each row execute function private.guard_missed();

-- ───────────────────────── RLS ─────────────────────────
alter table public.settings            enable row level security;
alter table public.admins              enable row level security;
alter table public.admin_emails        enable row level security;
alter table public.allowed_players     enable row level security;
alter table public.profiles            enable row level security;
alter table public.levels              enable row level security;
alter table public.symbols             enable row level security;
alter table public.finale_config       enable row level security;
alter table public.player_levels       enable row level security;
alter table public.flags               enable row level security;
alter table public.inventory           enable row level security;
alter table public.event_log           enable row level security;
alter table public.observations        enable row level security;
alter table public.evidence            enable row level security;
alter table public.notifications       enable row level security;
alter table public.notification_prefs  enable row level security;
alter table public.push_subscriptions  enable row level security;
alter table public.portrait_gift       enable row level security;
alter table public.finale_progress     enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- 管理者：內容表與玩家資料表可透過 API 直接讀寫（受 RLS 保護，不是靠前端隱藏）
create policy admin_all on public.settings           for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.admins             for select using (public.is_admin());
create policy admin_all on public.admin_emails       for select using (public.is_admin());
create policy admin_all on public.allowed_players    for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.levels             for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.symbols            for all using (public.is_admin()) with check (public.is_admin());
create policy admin_all on public.finale_config      for all using (public.is_admin()) with check (public.is_admin());
create policy admin_read on public.player_levels     for select using (public.is_admin());
create policy admin_read on public.flags             for select using (public.is_admin());
create policy admin_read on public.inventory         for select using (public.is_admin());
create policy admin_read on public.event_log         for select using (public.is_admin());
create policy admin_read on public.observations      for select using (public.is_admin());
create policy admin_read on public.evidence          for select using (public.is_admin());
create policy admin_read on public.notifications     for select using (public.is_admin());
create policy admin_read on public.portrait_gift     for select using (public.is_admin());
create policy admin_read on public.finale_progress   for select using (public.is_admin());

-- 玩家：只能讀自己的檔案列；其他一律透過 RPC
create policy own_profiles on public.profiles for select using (user_id = auth.uid() or public.is_admin());
create policy own_settings on public.settings for select using (auth.uid() is not null);

-- 函式權限：預設不開放，逐一授權
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema private revoke execute on functions from public;

-- ===== migrations/20261107000002_engine.sql =====
-- PROJECT 030 · 伺服器端遊戲引擎
-- 時間、狀態轉換、故事分支、養成樣本全部在這裡以資料庫紀錄判定。

-- ───────────────────────── 基礎工具 ─────────────────────────
create or replace function private.norm(x text) returns text
language sql immutable as $$
  select lower(regexp_replace(coalesce(x, ''), '[\s\-_,，、。.·・:：/]+', '', 'g'));
$$;

create or replace function private.settings() returns public.settings
language sql stable as $$ select * from public.settings where id = 1; $$;

create or replace function private.game_now(p uuid) returns timestamptz
language sql stable as $$
  select case when pr.is_test and pr.sim_offset is not null then now() + pr.sim_offset else now() end
  from public.profiles pr where pr.id = p;
$$;

-- 生日前 10 天 = 第 1 天；第 11 天 = 生日當天（終章）
create or replace function private.start_date() returns date
language sql stable as $$ select birthday - 10 from public.settings where id = 1; $$;

create or replace function private.game_day(t timestamptz) returns int
language sql stable as $$
  select ((t at time zone s.tz)::date - (s.birthday - 10)) + 1 from public.settings s where s.id = 1;
$$;

create or replace function private.level_window(p_day int, out open_at timestamptz, out close_at timestamptz)
language plpgsql stable as $$
declare s public.settings; l public.levels; d date;
begin
  s := private.settings();
  select * into l from public.levels where day = p_day;
  d := s.birthday - 10 + (p_day - 1);
  open_at := coalesce(l.open_at, (d::timestamp) at time zone s.tz);
  if p_day = 11 then
    close_at := coalesce(l.close_at, 'infinity'::timestamptz);
  else
    close_at := coalesce(l.close_at, ((d + 1)::timestamp) at time zone s.tz);   -- 不含；等同當日 23:59:59.999
  end if;
end $$;

create or replace function private.assert_profile(p uuid) returns public.profiles
language plpgsql stable as $$
declare r public.profiles;
begin
  select * into r from public.profiles where id = p;
  if r.id is null or r.user_id is distinct from auth.uid() then
    raise exception 'P030_FORBIDDEN' using errcode = '42501';
  end if;
  return r;
end $$;

create or replace function private.assert_admin() returns void
language plpgsql stable as $$
begin
  if not exists (select 1 from public.admins where user_id = auth.uid()) then
    raise exception 'P030_ADMIN_ONLY' using errcode = '42501';
  end if;
end $$;

create or replace function private.log(p uuid, t timestamptz, typ text, d int, payload jsonb default '{}')
returns void language sql as $$
  insert into public.event_log (profile_id, at, type, day, payload) values (p, t, typ, d, coalesce(payload, '{}'));
$$;

-- ───────────────────────── 通知 ─────────────────────────
create or replace function private.notify(p uuid, t timestamptz, typ text, dedupe text, d int, title text, body text)
returns boolean language plpgsql as $$
declare pr public.profiles; prefs public.notification_prefs; st text := 'inapp'; n int;
begin
  select * into pr from public.profiles where id = p;
  select * into prefs from public.notification_prefs where profile_id = p;
  if not pr.is_test
     and coalesce(prefs.push_enabled, true)
     and coalesce((prefs.types ->> typ)::boolean, true)
     and exists (select 1 from public.push_subscriptions where profile_id = p) then
    st := 'queued';
  end if;
  insert into public.notifications (profile_id, type, dedupe_key, day, title, body, created_at, push_status)
  values (p, typ, dedupe, d, title, body, t, st)
  on conflict (profile_id, dedupe_key) do nothing;
  get diagnostics n = row_count;
  return n > 0;
end $$;

-- ───────────────────────── 統計（不是評分，只是條件來源） ─────────────────────────
create or replace function private.sample_state(p uuid) returns jsonb
language plpgsql stable as $$
declare
  o record; prev int; gap int;
  lum numeric := 10; branch numeric := 10; shell numeric := 10; depth numeric := 10;
  drift numeric := 0; rhythm numeric := 0;
  streak int := 0; max_streak int := 0; total int := 0; breaks int := 0;
  hist jsonb := '[]'; scars jsonb := '[]';
  today int; dormant int := 0; base text; modifier text := ''; form text; stage int;
  mx numeric; mn numeric;
begin
  for o in select * from public.observations where profile_id = p order by day loop
    total := total + 1;
    if prev is not null and o.day - prev > 1 then
      gap := o.day - prev - 1;
      breaks := breaks + 1;
      drift := drift + 9 * gap;
      scars := scars || jsonb_build_object('day', o.day, 'gap', gap);
      streak := 1;
    else
      streak := streak + 1;
      if streak >= 2 then rhythm := rhythm + 6; end if;
    end if;
    max_streak := greatest(max_streak, streak);
    case o.action
      when 'explore'  then branch := branch + 14; drift := drift + 3; lum := lum + 2;
      when 'preserve' then shell  := shell + 14;  depth := depth + 2;
      when 'adjust'   then lum    := lum + 14;    rhythm := rhythm + 3; branch := branch + 2;
      when 'rest'     then depth  := depth + 14;  shell := shell + 3;
    end case;
    hist := hist || jsonb_build_object('day', o.day, 'action', o.action, 'streak', streak);
    prev := o.day;
  end loop;

  today := private.game_day(private.game_now(p));
  if prev is not null and today - prev > 1 then dormant := least(today, 11) - prev - 1; end if;
  if prev is not null and dormant > 0 then streak := 0; end if;

  mx := greatest(lum, branch, shell, depth);
  mn := least(lum, branch, shell, depth);
  if total = 0 then base := '未觀測'; form := '未觀測樣本';
  elsif mx - mn < 8 and total >= 3 then base := '未定形';
  elsif mx = branch then base := '岔形';
  elsif mx = lum then base := '燈形';
  elsif mx = shell then base := '年輪形';
  else base := '深根形';
  end if;
  if total > 0 then
    if rhythm >= 36 then modifier := '節律';
    elsif drift >= 27 then modifier := '漂流';
    elsif breaks >= 1 then modifier := '斷續';
    end if;
    form := case when modifier = '' then base else modifier || '・' || base end;
  end if;
  stage := case when total = 0 then 0 when total <= 2 then 1 when total <= 5 then 2 when total <= 8 then 3 else 4 end;

  return jsonb_build_object(
    'params', jsonb_build_object('lum', lum, 'branch', branch, 'shell', shell, 'depth', depth, 'drift', drift, 'rhythm', rhythm),
    'history', hist, 'scars', scars, 'streak', streak, 'max_streak', max_streak,
    'total', total, 'breaks', breaks, 'dormant', dormant,
    'base', base, 'modifier', modifier, 'form', form, 'stage', stage,
    'seed', ('x' || substr(md5(p::text), 1, 8))::bit(32)::int
  );
end $$;

create or replace function private.stats(p uuid) returns jsonb
language sql stable as $$
  with s as (select private.sample_state(p) j)
  select jsonb_build_object(
    'consistency', (select count(*) from public.player_levels where profile_id = p and outcome = 'ON_TIME')
                   + (select (j ->> 'max_streak')::int from s),
    'ontime',      (select count(*) from public.player_levels where profile_id = p and outcome = 'ON_TIME'),
    'completed',   (select count(*) from public.player_levels where profile_id = p and status = 'COMPLETED'),
    'missed',      (select count(*) from public.player_levels where profile_id = p and missed_at is not null),
    'missed_days', (select coalesce(jsonb_agg(day order by day), '[]') from public.player_levels where profile_id = p and missed_at is not null),
    'exploration', (select count(*) from public.inventory where profile_id = p and (data ->> 'hidden')::boolean),
    'choices',     (select coalesce(jsonb_object_agg(key, value), '{}') from public.flags where profile_id = p and key like 'choice:%'),
    'observations',(select (j ->> 'total')::int from s),
    'streak',      (select (j ->> 'streak')::int from s),
    'max_streak',  (select (j ->> 'max_streak')::int from s),
    'breaks',      (select (j ->> 'breaks')::int from s),
    'sample_form', (select j ->> 'form' from s)
  );
$$;

-- ───────────────────────── 條件判斷（故事分支引擎） ─────────────────────────
create or replace function private.eval_cond(p uuid, c jsonb) returns boolean
language plpgsql stable as $$
declare x jsonb; v jsonb; n numeric;
begin
  if c is null or c = 'null'::jsonb or c = '{}'::jsonb then return true; end if;
  if c ? 'all' then
    for x in select * from jsonb_array_elements(c -> 'all') loop
      if not private.eval_cond(p, x) then return false; end if;
    end loop;
    return true;
  end if;
  if c ? 'any' then
    for x in select * from jsonb_array_elements(c -> 'any') loop
      if private.eval_cond(p, x) then return true; end if;
    end loop;
    return false;
  end if;
  if c ? 'not' then return not private.eval_cond(p, c -> 'not'); end if;
  if c ? 'flag' then
    select value into v from public.flags where profile_id = p and key = c ->> 'flag';
    if c ? 'eq' then return v is not null and v = c -> 'eq'; end if;
    return v is not null and v not in ('false'::jsonb, 'null'::jsonb, '0'::jsonb, '""'::jsonb);
  end if;
  if c ? 'missed' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'missed')::int and missed_at is not null);
  end if;
  if c ? 'ontime' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'ontime')::int and outcome = 'ON_TIME');
  end if;
  if c ? 'done' then
    return exists (select 1 from public.player_levels where profile_id = p and day = (c ->> 'done')::int and status = 'COMPLETED');
  end if;
  if c ? 'item' then
    return exists (select 1 from public.inventory where profile_id = p and item_key = c ->> 'item');
  end if;
  if c ? 'stat' then
    n := (private.stats(p) ->> (c ->> 'stat'))::numeric;
    return n is not null
       and (not c ? 'gte' or n >= (c ->> 'gte')::numeric)
       and (not c ? 'lte' or n <= (c ->> 'lte')::numeric);
  end if;
  if c ? 'form' then return private.sample_state(p) ->> 'base' = c ->> 'form'; end if;
  raise exception 'P030_BAD_CONDITION %', c::text;
end $$;

-- ───────────────────────── 效果套用 ─────────────────────────
create or replace function private.apply_effects(p uuid, t timestamptz, eff jsonb, d int, source text)
returns jsonb language plpgsql as $$
declare k text; v jsonb; it jsonb; sym public.symbols; gained jsonb := '[]'; ikey text; echo boolean;
begin
  if eff is null or eff = '{}'::jsonb then return gained; end if;

  if eff ? 'symbol' then
    select * into sym from public.symbols where id = (eff ->> 'symbol')::int;
    echo := coalesce((eff ->> 'echo')::boolean, false);
    ikey := 'sym:' || sym.id || case when echo then ':echo' else '' end;
    insert into public.inventory (profile_id, item_key, kind, name, description, data, source_day, acquired_at)
    values (p, ikey, 'symbol', case when echo then '殘響・' || sym.name else sym.name end,
            case when echo then '原本的符號沒有留下來，留下來的是它的回聲。' else null end,
            jsonb_build_object('symbol', sym.id, 'echo', echo), d, t)
    on conflict do nothing;
    if found then gained := gained || jsonb_build_object('kind','symbol','key',ikey,'symbol',sym.id,'echo',echo,'name',sym.name,'digit',sym.digit); end if;
  end if;

  for it in select * from jsonb_array_elements(coalesce(eff -> 'items', '[]')) loop
    insert into public.inventory (profile_id, item_key, kind, name, description, data, source_day, acquired_at)
    values (p, it ->> 'key', coalesce(it ->> 'kind', 'item'), it ->> 'name', it ->> 'desc', coalesce(it -> 'data', '{}'), d, t)
    on conflict do nothing;
    if found then gained := gained || jsonb_build_object('kind','item','key',it->>'key','name',it->>'name','desc',it->>'desc'); end if;
  end loop;

  for it in select * from jsonb_array_elements(coalesce(eff -> 'remove_items', '[]')) loop
    delete from public.inventory where profile_id = p and item_key = it #>> '{}';
    if found then
      perform private.log(p, t, 'ITEM_LOST', d, jsonb_build_object('item', it #>> '{}', 'source', source));
      gained := gained || jsonb_build_object('kind','lost','key', it #>> '{}');
    end if;
  end loop;

  for k, v in select * from jsonb_each(coalesce(eff -> 'flags', '{}')) loop
    insert into public.flags (profile_id, key, value, source, set_at) values (p, k, v, source, t)
    on conflict on constraint flags_pkey do update set value = excluded.value, source = excluded.source, set_at = excluded.set_at;
  end loop;

  -- 只在尚未設定時寫入（例如：玩家已做出的選擇不會被系統覆寫）
  for k, v in select * from jsonb_each(coalesce(eff -> 'flags_default', '{}')) loop
    insert into public.flags (profile_id, key, value, source, set_at) values (p, k, v, source, t)
    on conflict on constraint flags_pkey do nothing;
  end loop;

  if eff ->> 'gift' = 'portrait' then
    insert into public.portrait_gift (profile_id, unlocked_via, unlocked_at) values (p, source, t) on conflict do nothing;
    if found then
      perform private.notify(p, t, 'SPECIAL_EVENT', 'GIFT:portrait', d, '影像校正邀請函',
        '鏡面系統發出了一封邀請函。它需要你親自決定，影像中的你應該是什麼樣子。');
      gained := gained || jsonb_build_object('kind','gift','key','portrait');
    end if;
  end if;

  if eff ? 'notify' then
    perform private.notify(p, t, 'SPECIAL_EVENT', 'FX:' || source || ':' || coalesce(eff #>> '{notify,key}', md5(eff::text)), d,
                           eff #>> '{notify,title}', eff #>> '{notify,body}');
  end if;
  return gained;
end $$;

-- ───────────────────────── 狀態轉換（時間不可逆） ─────────────────────────
create or replace function private.mark_missed(p uuid, d int, at_t timestamptz) returns void
language plpgsql as $$
declare l public.levels; pl public.player_levels; new_status text;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'COMPLETED' or pl.missed_at is not null then return; end if;
  -- 逾期：永久記錄，原路線進度封存，開啟替代路線（若有）
  new_status := case when l.alternate is not null then 'ALTERNATE' else 'MISSED' end;
  update public.player_levels
     set missed_at = at_t, status = new_status, variant = null,
         data = jsonb_build_object('done','{}'::jsonb,'attempts','{}'::jsonb,'hints','{}'::jsonb,
                                   'reveals','{}'::jsonb,'started','{}'::jsonb,'main_archive', pl.data)
   where profile_id = p and day = d;
  update public.evidence set status = 'OVERDUE'
   where profile_id = p and day = d and status = 'NEEDS_MORE';
  perform private.log(p, at_t, 'MISSED', d,
    jsonb_build_object('title', l.title, 'had_started', pl.started_at is not null, 'route', new_status));
  perform private.apply_effects(p, at_t, l.on_missed, d, 'missed:' || d);
  perform private.notify(p, at_t, 'MISSION_MISSED', 'MISSED:' || d, d,
    coalesce(l.on_missed #>> '{message,title}', '訊號中斷'),
    coalesce(l.on_missed #>> '{message,body}', '某個區域在你離開時關上了。紀錄已保存，但它不會再以原本的樣子出現。'));
end $$;

create or replace function private.refresh(p uuid) returns void
language plpgsql as $$
declare t timestamptz; l public.levels; w record; pl public.player_levels;
begin
  t := private.game_now(p);
  for l in select * from public.levels order by day loop
    insert into public.player_levels (profile_id, day) values (p, l.day) on conflict do nothing;
    select * into pl from public.player_levels where profile_id = p and day = l.day for update;
    select * into w from private.level_window(l.day);

    if pl.status = 'COMPLETED' or pl.missed_at is not null then continue; end if;
    if t < w.open_at then continue; end if;

    if t >= w.close_at then
      perform private.mark_missed(p, l.day, w.close_at);
    elsif pl.status = 'LOCKED' then
      update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = l.day;
    end if;
  end loop;
end $$;

-- ───────────────────────── 關卡解析 ─────────────────────────
create or replace function private.route_config(l public.levels, pl public.player_levels) returns jsonb
language sql stable as $$
  select case when pl.missed_at is not null then l.alternate else l.config end;
$$;

-- 回傳實際生效的場景與步驟（變體 + 步驟條件皆依資料判斷）
create or replace function private.resolve(p uuid, l public.levels, pl public.player_levels) returns jsonb
language plpgsql stable as $$
declare cfg jsonb; v jsonb; scene jsonb; intro jsonb; steps jsonb; s jsonb; out_steps jsonb := '[]';
        hs jsonb; out_hs jsonb := '[]';
begin
  cfg := private.route_config(l, pl);
  scene := coalesce(cfg -> 'scene', '{}');
  intro := cfg -> 'intro';
  steps := coalesce(cfg -> 'steps', '[]');
  if pl.variant is not null and pl.variant <> 'base' then
    select x into v from jsonb_array_elements(coalesce(cfg -> 'variants', '[]')) x where x ->> 'id' = pl.variant;
    if v is not null then
      scene := scene || coalesce(v -> 'scene', '{}');
      intro := coalesce(v -> 'intro', intro);
      steps := coalesce(v -> 'steps', steps);
    end if;
  end if;
  for s in select * from jsonb_array_elements(steps) loop
    if private.eval_cond(p, s -> 'when') then
      out_steps := out_steps || (s - 'when');
    end if;
  end loop;
  for hs in select * from jsonb_array_elements(coalesce(scene -> 'hotspots', '[]')) loop
    if private.eval_cond(p, hs -> 'when') then out_hs := out_hs || (hs - 'when'); end if;
  end loop;
  scene := jsonb_set(scene, '{hotspots}', out_hs);
  return jsonb_build_object('scene', scene, 'intro', intro, 'steps', out_steps);
end $$;

-- 第 9 天「回放」：以玩家自己的資料動態建立卡片與正確順序
create or replace function private.timeline_cards(p uuid, upto int) returns jsonb
language plpgsql stable as $$
declare d int; card jsonb; cards jsonb := '[]'; ev record; pl public.player_levels; lv public.levels; inv record;
begin
  for d in 1..upto loop
    select * into pl from public.player_levels where profile_id = p and day = d;
    select * into lv from public.levels where day = d;
    if pl.status = 'COMPLETED' then
      select * into ev from public.evidence where profile_id = p and day = d and kind in ('text','photo','audio')
        and status <> 'REPLACED' order by submitted_at desc limit 1;
      select * into inv from public.inventory where profile_id = p and source_day = d and kind = 'symbol' limit 1;
      card := jsonb_build_object('id', md5(p::text || ':card:' || d), 'kind', coalesce(ev.kind, 'symbol'),
        'text', case when ev.kind = 'text' then left(ev.text_content, 60) else null end,
        'path', case when ev.kind in ('photo','audio') then ev.storage_path else null end,
        'symbol', (inv.data ->> 'symbol')::int, 'echo', coalesce((inv.data ->> 'echo')::boolean, false),
        'scene', lv.config #>> '{scene,theme}');
    else
      card := jsonb_build_object('id', md5(p::text || ':card:' || d), 'kind', 'void', 'text', null);
    end if;
    cards := cards || card;
  end loop;
  return cards;
end $$;

create or replace function private.public_step(p uuid, l public.levels, pl public.player_levels, s jsonb) returns jsonb
language plpgsql stable as $$
declare out jsonb := s; sid text := s ->> 'id'; src jsonb; t timestamptz; ev jsonb;
begin
  out := out || jsonb_build_object(
    'done', (pl.data -> 'done') ? sid,
    'reveal', pl.data #> array['reveals', sid],
    'hints', coalesce(pl.data #> array['hints', sid], '[]'),
    'hint_available', jsonb_array_length(coalesce(l.secrets #> array[sid, 'hints'], '[]')) > jsonb_array_length(coalesce(pl.data #> array['hints', sid], '[]')),
    'attempts', coalesce((pl.data #>> array['attempts', sid])::int, 0));
  if s ->> 'type' = 'ar' then
    out := out || jsonb_build_object('fallback_enabled', coalesce((l.ar_fallback ->> sid)::boolean, false));
  end if;
  if s ->> 'type' = 'timeline' then
    select coalesce(jsonb_agg(c order by md5(c ->> 'id' || 'shuffle')), '[]') into src
      from jsonb_array_elements(private.timeline_cards(p, coalesce((s ->> 'upto')::int, 8))) c;
    out := out || jsonb_build_object('cards', src);
  end if;
  if s ? 'inject_evidence_day' then
    select jsonb_build_object('kind', kind, 'text', text_content, 'path', storage_path) into ev
      from public.evidence where profile_id = p and day = (s ->> 'inject_evidence_day')::int
       and kind in ('text','photo','audio') and status <> 'REPLACED' order by submitted_at desc limit 1;
    out := out || jsonb_build_object('injected', coalesce(ev, '{"kind":"void"}'::jsonb));
  end if;
  if s ->> 'type' = 'evidence' then
    select jsonb_agg(jsonb_build_object('id', id, 'kind', e.kind, 'status', e.status, 'note', e.review_note,
                                        'submitted_at', e.submitted_at, 'text', e.text_content, 'path', e.storage_path) order by submitted_at)
      into ev from public.evidence e where profile_id = p and day = l.day and step_id = sid;
    out := out || jsonb_build_object('submissions', coalesce(ev, '[]'));
  end if;
  if s ->> 'type' = 'wait' then
    out := out || jsonb_build_object('started_at', pl.data #> array['started', sid]);
  end if;
  return out;
end $$;

create or replace function private.level_view(p uuid, d int) returns jsonb
language plpgsql stable as $$
declare l public.levels; pl public.player_levels; w record; r jsonb; steps jsonb := '[]'; s jsonb;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into w from private.level_window(d);
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    steps := steps || private.public_step(p, l, pl, s);
  end loop;
  return jsonb_build_object(
    'day', d, 'code', l.code, 'title', l.title, 'subtitle', l.subtitle,
    'status', pl.status, 'outcome', pl.outcome, 'variant', pl.variant,
    'route', case when pl.missed_at is not null then 'alternate' else 'main' end,
    'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' else null end,
    'missed_at', pl.missed_at, 'started_at', pl.started_at, 'completed_at', pl.completed_at,
    'open_at', w.open_at, 'close_at', case when w.close_at = 'infinity' then null else w.close_at end,
    'scene', r -> 'scene', 'intro', r -> 'intro', 'steps', steps,
    'found', coalesce(pl.data -> 'found', '{}'),
    'server_now', private.game_now(p));
end $$;

-- ───────────────────────── 玩家 RPC ─────────────────────────
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; allowed boolean; prof jsonb;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  allowed := adm or exists (select 1 from public.allowed_players where lower(email) = em);
  if allowed and not adm then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid;
  return jsonb_build_object('is_admin', adm, 'allowed', allowed, 'email', em, 'profiles', prof);
end $$;

create or replace function private.state(p uuid) returns jsonb
language plpgsql stable as $$
declare t timestamptz; s public.settings; lv jsonb; inv jsonb; d int; ev jsonb; w record;
begin
  t := private.game_now(p);
  s := private.settings();
  d := private.game_day(t);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', l.day,
      'code', case when pl.status = 'LOCKED' then null else l.code end,
      'title', case when pl.status = 'LOCKED' then null else l.title end,
      'status', pl.status, 'outcome', pl.outcome, 'missed_at', pl.missed_at, 'completed_at', pl.completed_at,
      'open_at', (private.level_window(l.day)).open_at,
      'close_at', nullif((private.level_window(l.day)).close_at, 'infinity'),
      'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' end
    ) order by l.day), '[]') into lv
    from public.levels l join public.player_levels pl on pl.day = l.day and pl.profile_id = p;
  select coalesce(jsonb_agg(jsonb_build_object(
      'key', i.item_key, 'kind', i.kind, 'name', i.name, 'description', i.description, 'data', i.data,
      'source_day', i.source_day, 'acquired_at', i.acquired_at,
      'digit', case when i.kind = 'symbol' then sy.digit end,
      'lore', case when i.kind = 'symbol' then (select coalesce(jsonb_agg(x ->> 'text'), '[]') from jsonb_array_elements(sy.lore) x where (x ->> 'from_day')::int <= d) end
    ) order by i.acquired_at), '[]') into inv
    from public.inventory i left join public.symbols sy on sy.id = (i.data ->> 'symbol')::int
   where i.profile_id = p;
  select coalesce(jsonb_agg(jsonb_build_object('at', e.at, 'type', e.type, 'day', e.day, 'payload', e.payload) order by e.at desc), '[]')
    into ev from (select * from public.event_log where profile_id = p order by at desc limit 80) e;
  return jsonb_build_object(
    'server_now', t, 'real_now', now(), 'tz', s.tz, 'birthday', s.birthday, 'start_date', s.birthday - 10,
    'game_day', d, 'levels', lv, 'inventory', inv, 'events', ev,
    'sample', private.sample_state(p),
    'observed_today', exists (select 1 from public.observations where profile_id = p and day = d),
    'stats', private.stats(p),
    'unread', (select count(*) from public.notifications where profile_id = p and read_at is null and created_at <= t),
    'portrait', (select jsonb_build_object('unlocked_via', unlocked_via, 'saved', saved_at is not null) from public.portrait_gift where profile_id = p),
    'finale', (select jsonb_build_object('defined', defined_at is not null, 'hunt_index', hunt_index, 'hunt_done', hunt_done_at is not null)
               from public.finale_progress where profile_id = p),
    'is_test', (select is_test from public.profiles where id = p));
end $$;

create or replace function public.get_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  return private.state(p);
end $$;

create or replace function public.open_level(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; cfg jsonb; v jsonb; vid text := 'base';
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  if l.day is null then raise exception 'P030_NO_SUCH_LEVEL'; end if;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'LOCKED' then raise exception 'P030_LOCKED' using errcode = 'P0001'; end if;

  if pl.variant is null and pl.status <> 'MISSED' then
    cfg := private.route_config(l, pl);
    for v in select * from jsonb_array_elements(coalesce(cfg -> 'variants', '[]')) loop
      if private.eval_cond(p, v -> 'when') then vid := v ->> 'id'; exit; end if;
    end loop;
    update public.player_levels set variant = vid where profile_id = p and day = d;
    perform private.log(p, t, 'ROUTE', d, jsonb_build_object('variant', vid, 'route', case when pl.missed_at is null then 'main' else 'alternate' end));
  end if;
  if pl.status = 'AVAILABLE' then
    update public.player_levels set status = 'IN_PROGRESS', started_at = t where profile_id = p and day = d;
    perform private.log(p, t, 'STARTED', d, '{}');
  elsif pl.status = 'ALTERNATE' and pl.started_at is null then
    update public.player_levels set started_at = t where profile_id = p and day = d;
  end if;
  return private.level_view(p, d);
end $$;

create or replace function private.complete_level(p uuid, d int, t timestamptz) returns jsonb
language plpgsql as $$
declare l public.levels; pl public.player_levels; eff jsonb; gained jsonb; outc text;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  outc := case when pl.missed_at is null then 'ON_TIME' else 'ALTERNATE' end;
  update public.player_levels set status = 'COMPLETED', outcome = outc, completed_at = t where profile_id = p and day = d;
  eff := case when outc = 'ON_TIME' then l.on_complete else l.on_alternate_complete end;
  gained := private.apply_effects(p, t, eff, d, case when outc = 'ON_TIME' then 'complete:' else 'alternate:' end || d);
  perform private.log(p, t, 'COMPLETED', d, jsonb_build_object('outcome', outc, 'gained', gained));
  return jsonb_build_object('outcome', outc, 'gained', gained, 'epilogue',
    case when outc = 'ON_TIME' then l.config -> 'epilogue' else l.alternate -> 'epilogue' end);
end $$;

create or replace function private.check_completion(p uuid, d int, t timestamptz) returns jsonb
language plpgsql as $$
declare l public.levels; pl public.player_levels; r jsonb; s jsonb;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status = 'COMPLETED' then return null; end if;
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    if not coalesce((s ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (s ->> 'id')) then
      return null;
    end if;
  end loop;
  return private.complete_level(p, d, t);
end $$;

create or replace function private.find_step(p uuid, l public.levels, pl public.player_levels, sid text, out step jsonb, out prior_ok boolean)
language plpgsql stable as $$
declare r jsonb; s jsonb;
begin
  prior_ok := true;
  r := private.resolve(p, l, pl);
  for s in select * from jsonb_array_elements(r -> 'steps') loop
    if s ->> 'id' = sid then step := s; return; end if;
    if not coalesce((s ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (s ->> 'id')) then
      prior_ok := false;
    end if;
  end loop;
end $$;

create or replace function private.load_active(p uuid, d int) returns void
language plpgsql as $$
declare st text;
begin
  select status into st from public.player_levels where profile_id = p and day = d for update;
  if st is null or st in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  if st = 'COMPLETED' then raise exception 'P030_ALREADY_COMPLETED'; end if;
end $$;

create or replace function public.submit_step(p uuid, d int, step_id text, answer jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare
  t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; sec jsonb;
  ok boolean := false; ans text; expected jsonb; att int; msg text; mode text; local_t time; s public.settings;
  cards jsonb; exp_order text; sel text; completion jsonb; reveal jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null then raise exception 'P030_NO_SUCH_STEP'; end if;
  if (pl.data -> 'done') ? step_id then return jsonb_build_object('correct', true, 'already', true); end if;
  if not prior_ok then raise exception 'P030_STEP_ORDER'; end if;

  -- 特定時段任務
  if st ? 'window' then
    s := private.settings();
    local_t := (t at time zone s.tz)::time;
    if local_t < (st #>> '{window,from}')::time or local_t > (st #>> '{window,to}')::time then
      return jsonb_build_object('correct', false, 'message', coalesce(st #>> '{window,closed_text}', '這個機關現在沒有反應。'));
    end if;
  end if;

  sec := l.secrets -> step_id;
  ans := answer ->> 'value';

  case st ->> 'type'
    when 'story', 'observe_hint', 'archive' then ok := true;
    when 'choice' then
      sel := answer ->> 'option';
      if not exists (select 1 from jsonb_array_elements(st -> 'options') o where o ->> 'id' = sel) then
        raise exception 'P030_BAD_OPTION';
      end if;
      ok := true;
      insert into public.flags (profile_id, key, value, source, set_at)
      values (p, 'choice:' || (st ->> 'flag'), to_jsonb(sel), 'day:' || d, t)
      on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
      insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
      values (p, d, step_id, 'choice', jsonb_build_object('option', sel), 'APPROVED', pl.missed_at is null, t);
      perform private.log(p, t, 'CHOICE', d, jsonb_build_object('flag', st ->> 'flag', 'option', sel));
    when 'ar' then
      if (answer ->> 'target') is not null and (answer ->> 'target')::int = (st ->> 'target')::int then
        ok := true; mode := 'scan';
      elsif (answer ->> 'code') is not null and coalesce((l.ar_fallback ->> step_id)::boolean, false)
            and private.norm(answer ->> 'code') = private.norm(sec ->> 'fallback') then
        ok := true; mode := 'fallback';
      elsif (answer ->> 'code') is not null and not coalesce((l.ar_fallback ->> step_id)::boolean, false) then
        raise exception 'P030_FALLBACK_DISABLED';
      end if;
      if ok then
        insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
        values (p, d, step_id, 'scan', jsonb_build_object('mode', mode, 'target', answer -> 'target'), 'APPROVED', pl.missed_at is null, t);
        perform private.log(p, t, 'SCAN', d, jsonb_build_object('mode', mode, 'target', answer -> 'target'));
      end if;
    when 'wait' then
      if pl.data #> array['started', step_id] is null then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'started', true, 'message', st ->> 'start_text');
      end if;
      ok := t >= (pl.data #>> array['started', step_id])::timestamptz + make_interval(secs => (st ->> 'seconds')::int);
      if not ok then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'message', coalesce(st ->> 'early_text', '太快了。重新開始等待。'));
      end if;
    when 'timeline' then
      cards := private.timeline_cards(p, coalesce((st ->> 'upto')::int, 8));
      select string_agg(c ->> 'id', ',' order by ord) into exp_order from jsonb_array_elements(cards) with ordinality x(c, ord);
      ok := private.norm(ans) = private.norm(exp_order);
    when 'observe' then
      ok := exists (select 1 from public.observations where profile_id = p and day = private.game_day(t));
      if not ok then return jsonb_build_object('correct', false, 'message', '培養艙尚未記錄今天的觀測。'); end if;
    when 'evidence' then
      raise exception 'P030_USE_SUBMIT_EVIDENCE';
    else
      expected := sec -> 'answer';
      if expected is null then raise exception 'P030_STEP_HAS_NO_ANSWER %', step_id; end if;
      if jsonb_typeof(expected) = 'array' then
        ok := exists (select 1 from jsonb_array_elements_text(expected) e where private.norm(e) = private.norm(ans));
      else
        ok := private.norm(expected #>> '{}') = private.norm(ans);
      end if;
  end case;

  if not ok then
    att := coalesce((pl.data #>> array['attempts', step_id])::int, 0) + 1;
    update public.player_levels set data = jsonb_set(data, array['attempts', step_id], to_jsonb(att)) where profile_id = p and day = d;
    msg := coalesce(sec ->> 'wrong', '沒有反應。');
    return jsonb_build_object('correct', false, 'attempts', att, 'message', msg);
  end if;

  reveal := sec -> 'reveal';
  update public.player_levels
     set data = jsonb_set(jsonb_set(data, array['done', step_id], to_jsonb(t)), array['reveals', step_id], coalesce(reveal, 'null'))
   where profile_id = p and day = d;
  perform private.apply_effects(p, t, sec -> 'grant', d, 'step:' || d || ':' || step_id);
  completion := private.check_completion(p, d, t);
  return jsonb_build_object('correct', true, 'reveal', reveal, 'success_text', sec ->> 'success',
                            'completed', completion is not null, 'completion', completion, 'mode', mode);
end $$;

create or replace function public.explore(p uuid, d int, spot text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; r jsonb; sec jsonb; gained jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  r := private.resolve(p, l, pl);
  if not exists (select 1 from jsonb_array_elements(r #> '{scene,hotspots}') h where h ->> 'id' = spot) then
    raise exception 'P030_NO_SUCH_SPOT';
  end if;
  sec := l.secrets -> 'hotspots' -> spot;
  if (pl.data -> 'found') ? spot then return jsonb_build_object('text', sec ->> 'text', 'already', true); end if;
  update public.player_levels set data = jsonb_set(data, array['found', spot], to_jsonb(t))
   where profile_id = p and day = d;
  gained := private.apply_effects(p, t, sec -> 'grant', d, 'explore:' || d || ':' || spot);
  perform private.log(p, t, 'EXPLORE', d, jsonb_build_object('spot', spot, 'gained', gained));
  return jsonb_build_object('text', sec ->> 'text', 'gained', gained);
end $$;

create or replace function public.request_hint(p uuid, d int, step_id text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; used jsonb; all_h jsonb; nxt jsonb;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  used := coalesce(pl.data #> array['hints', step_id], '[]');
  all_h := coalesce(l.secrets #> array[step_id, 'hints'], '[]');
  if jsonb_array_length(used) >= jsonb_array_length(all_h) then
    return jsonb_build_object('hint', null, 'hints', used);
  end if;
  nxt := all_h -> jsonb_array_length(used);
  used := used || nxt;
  update public.player_levels set data = jsonb_set(data, array['hints', step_id], used) where profile_id = p and day = d;
  perform private.log(p, t, 'HINT', d, jsonb_build_object('step', step_id, 'n', jsonb_array_length(used)));
  return jsonb_build_object('hint', nxt, 'hints', used);
end $$;

create or replace function public.submit_evidence(p uuid, d int, step_id text, kind text, path text, content text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; eid uuid; completion jsonb;
        last_status text;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  select * into l from public.levels where day = d;
  if pl.status in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null or st ->> 'type' <> 'evidence' then raise exception 'P030_NO_SUCH_STEP'; end if;
  if not (st -> 'kinds') ? kind then raise exception 'P030_BAD_EVIDENCE_KIND'; end if;

  select e.status into last_status from public.evidence e
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status <> 'REPLACED'
   order by e.submitted_at desc limit 1;
  if pl.status = 'COMPLETED' and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_COMPLETED'; end if;
  if (pl.data -> 'done') ? step_id and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_SUBMITTED'; end if;
  if not prior_ok and not ((pl.data -> 'done') ? step_id) then raise exception 'P030_STEP_ORDER'; end if;

  if kind in ('photo', 'audio') then
    if path is null or split_part(path, '/', 1) <> p::text then raise exception 'P030_BAD_PATH'; end if;
  elsif kind = 'text' then
    if length(trim(coalesce(content, ''))) = 0 then raise exception 'P030_EMPTY_TEXT'; end if;
    path := null;
  end if;

  update public.evidence e set status = 'REPLACED'
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status = 'NEEDS_MORE';
  insert into public.evidence (profile_id, day, step_id, kind, storage_path, text_content, status, on_time, submitted_at)
  values (p, d, step_id, kind, path, left(content, 4000), 'PENDING_REVIEW', pl.missed_at is null, t)
  returning id into eid;
  perform private.log(p, t, 'EVIDENCE', d, jsonb_build_object('kind', kind, 'step', step_id, 'id', eid));
  if not ((pl.data -> 'done') ? step_id) then
    update public.player_levels set data = jsonb_set(data, array['done', step_id], to_jsonb(t)) where profile_id = p and day = d;
    completion := private.check_completion(p, d, t);
  end if;
  return jsonb_build_object('id', eid, 'status', 'PENDING_REVIEW', 'completed', completion is not null, 'completion', completion);
end $$;

create or replace function public.observe(p uuid, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; d int;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  d := private.game_day(t);
  if d < 1 or d > 11 then raise exception 'P030_OUTSIDE_GAME'; end if;
  if action not in ('explore', 'preserve', 'adjust', 'rest') then raise exception 'P030_BAD_ACTION'; end if;
  insert into public.observations (profile_id, day, action, at) values (p, d, action, t);
  insert into public.inventory (profile_id, item_key, kind, name, description, source_day, acquired_at)
  values (p, 'sample:030', 'sample', '030號未知樣本', '來源不明。它會記得你如何觀測它。', d, t) on conflict do nothing;
  perform private.log(p, t, 'OBSERVE', d, jsonb_build_object('action', action));
  return private.sample_state(p);
exception when unique_violation then
  raise exception 'P030_ALREADY_OBSERVED';
end $$;

-- ───────────────────────── 通知 RPC ─────────────────────────
create or replace function public.list_notifications(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  return (select coalesce(jsonb_agg(to_jsonb(n) - 'profile_id' - 'dedupe_key' order by created_at desc), '[]')
            from (select * from public.notifications where profile_id = p and created_at <= t order by created_at desc limit 100) n);
end $$;

create or replace function public.mark_notifications_read(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  update public.notifications set read_at = now() where profile_id = p and read_at is null;
end $$;

create or replace function public.get_prefs(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.notification_prefs (profile_id) values (p) on conflict do nothing;
  return (select to_jsonb(n) - 'profile_id' || jsonb_build_object('subscriptions', (select count(*) from public.push_subscriptions where profile_id = p))
            from public.notification_prefs n where profile_id = p);
end $$;

create or replace function public.save_prefs(p uuid, prefs jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.notification_prefs (profile_id) values (p) on conflict do nothing;
  update public.notification_prefs set
    push_enabled = coalesce((prefs ->> 'push_enabled')::boolean, push_enabled),
    types = case when prefs ? 'types' then types || (prefs -> 'types') else types end,
    quiet_start = case when prefs ? 'quiet_start' then nullif(prefs ->> 'quiet_start', '')::time else quiet_start end,
    quiet_end = case when prefs ? 'quiet_end' then nullif(prefs ->> 'quiet_end', '')::time else quiet_end end,
    updated_at = now()
  where profile_id = p;
  return public.get_prefs(p);
end $$;

create or replace function public.save_push_subscription(p uuid, sub jsonb) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  insert into public.push_subscriptions (profile_id, endpoint, p256dh, auth)
  values (p, sub ->> 'endpoint', sub #>> '{keys,p256dh}', sub #>> '{keys,auth}')
  on conflict (endpoint) do update set profile_id = excluded.profile_id, p256dh = excluded.p256dh, auth = excluded.auth;
end $$;

create or replace function public.delete_push_subscription(p uuid, endpoint text) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  delete from public.push_subscriptions s where s.profile_id = p and s.endpoint = delete_push_subscription.endpoint;
end $$;

-- ───────────────────────── 生日禮物一：形象照 ─────────────────────────
create or replace function public.get_portrait(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  return (select to_jsonb(g) - 'profile_id' from public.portrait_gift g where profile_id = p);
end $$;

create or replace function public.save_portrait(p uuid, choice jsonb, refs text[]) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  if not exists (select 1 from public.portrait_gift where profile_id = p) then raise exception 'P030_GIFT_LOCKED'; end if;
  if exists (select 1 from unnest(coalesce(refs, '{}')) r where split_part(r, '/', 1) <> p::text) then raise exception 'P030_BAD_PATH'; end if;
  update public.portrait_gift set choice = coalesce(save_portrait.choice, '{}'), reference_paths = coalesce(refs, '{}'), saved_at = t
   where profile_id = p;
  perform private.log(p, t, 'PORTRAIT_SAVED', null, coalesce(save_portrait.choice, '{}'));
  return public.get_portrait(p);
end $$;

-- ───────────────────────── 終章 ─────────────────────────
create or replace function private.assert_finale_open(p uuid) returns void
language plpgsql stable as $$
begin
  if private.game_now(p) < (private.level_window(11)).open_at then raise exception 'P030_FINALE_LOCKED'; end if;
end $$;

create or replace function public.finale_archive(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare days jsonb; lines jsonb := '[]'; ln jsonb; cfg jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  perform private.assert_finale_open(p);
  select coalesce(jsonb_agg(jsonb_build_object(
      'day', l.day, 'code', l.code, 'title', l.title, 'status', pl.status, 'outcome', pl.outcome,
      'missed_at', pl.missed_at, 'completed_at', pl.completed_at,
      'route_title', case when pl.missed_at is not null then l.alternate ->> 'route_title' end,
      'evidence', (select coalesce(jsonb_agg(jsonb_build_object('kind', e.kind, 'text', e.text_content, 'path', e.storage_path,
                                                               'status', e.status, 'payload', e.payload, 'on_time', e.on_time) order by e.submitted_at), '[]')
                     from public.evidence e where e.profile_id = p and e.day = l.day and e.status <> 'REPLACED'),
      'symbols', (select coalesce(jsonb_agg(jsonb_build_object('key', i.item_key, 'name', i.name, 'data', i.data)), '[]')
                    from public.inventory i where i.profile_id = p and i.source_day = l.day and i.kind = 'symbol')
    ) order by l.day), '[]') into days
    from public.levels l join public.player_levels pl on pl.profile_id = p and pl.day = l.day
   where l.day <= 10;
  select config into cfg from public.levels where day = 11;
  for ln in select * from jsonb_array_elements(coalesce(cfg -> 'monologue', '[]')) loop
    if private.eval_cond(p, ln -> 'when') then lines := lines || to_jsonb(ln ->> 'text'); end if;
  end loop;
  return jsonb_build_object('days', days, 'sample', private.sample_state(p), 'stats', private.stats(p),
    'monologue', lines, 'progress', (select to_jsonb(f) - 'profile_id' from public.finale_progress f where profile_id = p),
    'portrait', (select jsonb_build_object('unlocked_via', unlocked_via, 'choice', choice) from public.portrait_gift where profile_id = p),
    'choices', (private.stats(p) -> 'choices'));
end $$;

create or replace function public.submit_definition(p uuid, definition text, skipped boolean) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  insert into public.finale_progress (profile_id) values (p) on conflict do nothing;
  update public.finale_progress
     set definition = case when submit_definition.skipped then null else left(trim(submit_definition.definition), 2000) end,
         skipped = coalesce(submit_definition.skipped, false), defined_at = t
   where profile_id = p;
  perform private.log(p, t, 'DEFINED', 11, jsonb_build_object('skipped', coalesce(submit_definition.skipped, false)));
  -- 讓使用者的檔案永遠保持「持續更新中」：可以一再改寫
  return jsonb_build_object('lines', jsonb_build_array('定義權限已移交本人。', '檔案狀態：持續更新中。'));
end $$;

create or replace function public.finale_hunt(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare fp public.finale_progress; fc public.finale_config; steps jsonb := '[]'; i int; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  select * into fp from public.finale_progress where profile_id = p;
  if fp.defined_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
  select * into fc from public.finale_config where id = 1;
  n := jsonb_array_length(fc.hunt);
  for i in 0 .. least(fp.hunt_index, n - 1) loop
    steps := steps || jsonb_build_object('index', i, 'title', fc.hunt -> i ->> 'title', 'clue', fc.hunt -> i ->> 'clue',
      'location_hint', fc.hunt -> i ->> 'location_hint', 'needs_code', coalesce(fc.hunt -> i ->> 'code', '') <> '',
      'done', i < fp.hunt_index);
  end loop;
  return jsonb_build_object('steps', steps, 'total', n, 'index', fp.hunt_index, 'done', fp.hunt_done_at is not null,
    'final_title', case when fp.hunt_done_at is not null or n = 0 then fc.final_title end,
    'final_body', case when fp.hunt_done_at is not null or n = 0 then fc.final_body end);
end $$;

create or replace function public.submit_hunt(p uuid, idx int, code text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; fp public.finale_progress; fc public.finale_config; expected text; n int;
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  t := private.game_now(p);
  select * into fp from public.finale_progress where profile_id = p for update;
  if fp.defined_at is null then raise exception 'P030_DEFINE_FIRST'; end if;
  select * into fc from public.finale_config where id = 1;
  n := jsonb_array_length(fc.hunt);
  if idx <> fp.hunt_index or idx >= n then raise exception 'P030_HUNT_ORDER'; end if;
  expected := fc.hunt -> idx ->> 'code';
  if coalesce(expected, '') <> '' and private.norm(expected) <> private.norm(code) then
    return jsonb_build_object('correct', false, 'message', '這不是這裡的密碼。');
  end if;
  update public.finale_progress set hunt_index = idx + 1, hunt_done_at = case when idx + 1 >= n then t end where profile_id = p;
  perform private.log(p, t, 'HUNT', 11, jsonb_build_object('index', idx));
  if idx + 1 >= n then
    update public.player_levels set status = 'COMPLETED', outcome = 'ON_TIME', completed_at = t where profile_id = p and day = 11 and status <> 'COMPLETED';
  end if;
  return jsonb_build_object('correct', true) || public.finale_hunt(p);
end $$;

-- ===== migrations/20261107000003_admin_cron.sql =====
-- PROJECT 030 · 管理者、測試模式、通知排程、權限

-- ───────────────────────── 管理者 RPC ─────────────────────────
create or replace function public.admin_overview() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare out jsonb; pr record;
begin
  perform private.assert_admin();
  for pr in select id from public.profiles loop perform private.refresh(pr.id); end loop;
  select jsonb_build_object(
    'settings', (select to_jsonb(s) from public.settings s where id = 1),
    'server_now', now(),
    'game_day', private.game_day(now()),
    'profiles', (select coalesce(jsonb_agg(jsonb_build_object(
        'id', pf.id, 'is_test', pf.is_test, 'label', pf.label,
        'email', (select email from auth.users u where u.id = pf.user_id),
        'game_now', private.game_now(pf.id), 'game_day', private.game_day(private.game_now(pf.id)),
        'levels', (select jsonb_agg(jsonb_build_object('day', day, 'status', status, 'outcome', outcome, 'variant', variant, 'missed_at', missed_at) order by day)
                     from public.player_levels where profile_id = pf.id),
        'stats', private.stats(pf.id),
        'sample', private.sample_state(pf.id) - 'history'
      ) order by pf.is_test, pf.created_at), '[]') from public.profiles pf),
    'pending_evidence', (select count(*) from public.evidence where status = 'PENDING_REVIEW'),
    'allowed_players', (select coalesce(jsonb_agg(to_jsonb(a)), '[]') from public.allowed_players a)
  ) into out;
  return out;
end $$;

create or replace function public.admin_profile_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  perform private.refresh(p);
  return private.state(p) || jsonb_build_object(
    'flags', (select coalesce(jsonb_object_agg(key, value), '{}') from public.flags where profile_id = p),
    'events_full', (select coalesce(jsonb_agg(to_jsonb(e) - 'profile_id' order by at), '[]') from public.event_log e where profile_id = p),
    'notifications', (select coalesce(jsonb_agg(to_jsonb(n) - 'profile_id' order by created_at desc), '[]') from public.notifications n where profile_id = p),
    'finale_progress', (select to_jsonb(f) from public.finale_progress f where profile_id = p),
    'portrait', (select to_jsonb(g) from public.portrait_gift g where profile_id = p));
end $$;

create or replace function public.admin_list_evidence(filter_status text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  return (select coalesce(jsonb_agg(to_jsonb(e) || jsonb_build_object(
            'profile_label', pf.label, 'is_test', pf.is_test, 'level_title', l.title) order by e.submitted_at desc), '[]')
            from public.evidence e join public.profiles pf on pf.id = e.profile_id join public.levels l on l.day = e.day
           where (filter_status is null or e.status = filter_status) and e.kind in ('photo','audio','text'));
end $$;

create or replace function public.admin_review_evidence(eid uuid, new_status text, note text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare e public.evidence; t timestamptz;
begin
  perform private.assert_admin();
  if new_status not in ('APPROVED', 'NEEDS_MORE', 'PENDING_REVIEW') then raise exception 'P030_BAD_STATUS'; end if;
  select * into e from public.evidence where id = eid for update;
  if e.id is null then raise exception 'P030_NOT_FOUND'; end if;
  t := private.game_now(e.profile_id);
  update public.evidence set status = new_status, review_note = note, reviewed_at = now(), reviewer = auth.uid() where id = eid;
  perform private.log(e.profile_id, t, 'REVIEW', e.day, jsonb_build_object('evidence', eid, 'status', new_status));
  if new_status = 'APPROVED' then
    insert into public.flags (profile_id, key, value, source, set_at) values (e.profile_id, 'evidence_ok:' || e.day, 'true', 'review', t)
    on conflict (profile_id, key) do update set value = 'true', set_at = excluded.set_at;
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':ok', e.day, '樣本比對完成',
      '你提交的紀錄已通過比對，已歸檔至第 ' || e.day || ' 區。');
  elsif new_status = 'NEEDS_MORE' then
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':more', e.day, '紀錄需要補充',
      coalesce(nullif(note, ''), '系統無法辨識這份紀錄。請在區域關閉前補充。'));
  end if;
  return to_jsonb(e) || jsonb_build_object('status', new_status);
end $$;

create or replace function public.admin_delete_evidence(eid uuid) returns text
language plpgsql security definer set search_path = public, private as $$
declare pth text; e public.evidence;
begin
  perform private.assert_admin();
  delete from public.evidence where id = eid returning * into e;
  if e.id is null then raise exception 'P030_NOT_FOUND'; end if;
  perform private.log(e.profile_id, now(), 'EVIDENCE_DELETED', e.day, jsonb_build_object('evidence', eid, 'kind', e.kind));
  return e.storage_path;
end $$;

create or replace function public.admin_trigger_event(target uuid, title text, body text, effects jsonb) returns int
language plpgsql security definer set search_path = public, private as $$
declare pr record; n int := 0; t timestamptz; k text := md5(random()::text || clock_timestamp()::text);
begin
  perform private.assert_admin();
  for pr in select id from public.profiles where (target is null and not is_test) or id = target loop
    t := private.game_now(pr.id);
    perform private.apply_effects(pr.id, t, coalesce(effects, '{}'), private.game_day(t), 'admin_event');
    perform private.notify(pr.id, t, 'SPECIAL_EVENT', 'ADMIN:' || k, private.game_day(t), title, body);
    perform private.log(pr.id, t, 'SPECIAL_EVENT', private.game_day(t), jsonb_build_object('title', title, 'effects', effects));
    n := n + 1;
  end loop;
  return n;
end $$;

create or replace function public.admin_grant_portrait(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  perform private.apply_effects(p, private.game_now(p), '{"gift":"portrait"}', null, 'admin');
end $$;

create or replace function public.admin_set_ar_fallback(d int, step_id text, enabled boolean) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  update public.levels set ar_fallback = ar_fallback || jsonb_build_object(step_id, enabled), updated_at = now() where day = d;
  return (select ar_fallback from public.levels where day = d);
end $$;

create or replace function public.admin_export() returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_admin();
  return jsonb_build_object(
    'exported_at', now(),
    'settings', (select to_jsonb(s) from public.settings s),
    'levels', (select jsonb_agg(to_jsonb(l) order by day) from public.levels l),
    'symbols', (select jsonb_agg(to_jsonb(s) order by id) from public.symbols s),
    'finale_config', (select to_jsonb(f) from public.finale_config f),
    'allowed_players', (select coalesce(jsonb_agg(to_jsonb(a)), '[]') from public.allowed_players a),
    'profiles', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.profiles x),
    'player_levels', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.player_levels x),
    'flags', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.flags x),
    'inventory', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.inventory x),
    'event_log', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.event_log x),
    'observations', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.observations x),
    'evidence', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.evidence x),
    'notifications', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.notifications x),
    'portrait_gift', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.portrait_gift x),
    'finale_progress', (select coalesce(jsonb_agg(to_jsonb(x)), '[]') from public.finale_progress x));
end $$;

-- ───────────────────────── 測試模式（只作用於 is_test 檔案） ─────────────────────────
create or replace function private.assert_test(p uuid) returns void
language plpgsql stable as $$
begin
  perform private.assert_admin();
  if not exists (select 1 from public.profiles where id = p and is_test and user_id = auth.uid()) then
    raise exception 'P030_NOT_A_TEST_PROFILE' using errcode = '42501';
  end if;
end $$;

create or replace function public.admin_create_test_profile(label text, sim_at timestamptz) returns uuid
language plpgsql security definer set search_path = public, private as $$
declare pid uuid;
begin
  perform private.assert_admin();
  insert into public.profiles (user_id, is_test, label, sim_offset)
  values (auth.uid(), true, coalesce(nullif(label, ''), '測試檔案'), case when sim_at is null then null else sim_at - now() end)
  returning id into pid;
  perform private.refresh(pid);
  return pid;
end $$;

create or replace function public.admin_set_test_time(p uuid, sim_at timestamptz) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  update public.profiles set sim_offset = case when sim_at is null then null else sim_at - now() end where id = p;
  perform private.refresh(p);
  return private.state(p);
end $$;

-- action: complete | complete_alt | miss | open
create or replace function public.admin_test_force(p uuid, d int, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; pl public.player_levels;
begin
  perform private.assert_test(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into pl from public.player_levels where profile_id = p and day = d;
  if action = 'miss' then
    perform private.mark_missed(p, d, t);
  elsif action = 'complete' then
    if pl.missed_at is not null then raise exception 'P030_ALREADY_MISSED'; end if;
    if pl.status <> 'COMPLETED' then perform private.complete_level(p, d, t); end if;
  elsif action = 'complete_alt' then
    if pl.missed_at is null then perform private.mark_missed(p, d, t); end if;
    select * into pl from public.player_levels where profile_id = p and day = d;
    if pl.status <> 'COMPLETED' then perform private.complete_level(p, d, t); end if;
  elsif action = 'open' then
    update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = d and status = 'LOCKED';
  else
    raise exception 'P030_BAD_ACTION';
  end if;
  return private.state(p);
end $$;

create or replace function public.admin_test_observe(p uuid, d int, action text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  if action is null then
    delete from public.observations where profile_id = p and day = d;
  else
    insert into public.observations (profile_id, day, action, at) values (p, d, action, private.game_now(p))
    on conflict (profile_id, day) do update set action = excluded.action;
  end if;
  return private.sample_state(p);
end $$;

create or replace function public.admin_test_reset(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  perform set_config('p030.purge_test', 'on', true);
  delete from public.event_log where profile_id = p;
  delete from public.player_levels where profile_id = p;
  delete from public.flags where profile_id = p;
  delete from public.inventory where profile_id = p;
  delete from public.observations where profile_id = p;
  delete from public.evidence where profile_id = p;
  delete from public.notifications where profile_id = p;
  delete from public.portrait_gift where profile_id = p;
  delete from public.finale_progress where profile_id = p;
  perform set_config('p030.purge_test', 'off', true);
  perform private.refresh(p);
end $$;

create or replace function public.admin_delete_test_profile(p uuid) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_test(p);
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles where id = p;
  perform set_config('p030.purge_test', 'off', true);
end $$;

-- ───────────────────────── 提醒產生器（排程呼叫） ─────────────────────────
create or replace function private.generate_reminders(p uuid) returns int
language plpgsql as $$
declare t timestamptz; s public.settings; d int; pl public.player_levels; l public.levels; w record;
        local_t time; sent int; created int := 0; countdown int;
begin
  t := private.game_now(p);
  s := private.settings();
  d := private.game_day(t);
  if d < 1 or d > 11 then return 0; end if;
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into w from private.level_window(d);
  if t < w.open_at then return 0; end if;
  countdown := 11 - d;

  if d = 11 then
    if private.notify(p, t, 'NEW_MISSION', 'NEW:11', 11, '第030號檔案室', '所有區域的紀錄已移入同一個房間。門沒有上鎖。') then created := created + 1; end if;
    return created;
  end if;

  if private.notify(p, t, 'NEW_MISSION', 'NEW:' || d, d, 'D-' || countdown || '｜新區域解除封鎖',
       coalesce(l.config #>> '{notify,new}', '偵測到新的異常訊號。區域將於今日 23:59:59 重新封閉。')) then created := created + 1; end if;

  if pl.status in ('COMPLETED', 'MISSED') or pl.missed_at is not null or t >= w.close_at then return created; end if;
  local_t := (t at time zone s.tz)::time;
  select count(*) into sent from public.notifications
   where profile_id = p and day = d and type in ('MISSION_PENDING', 'MISSION_EXPIRING');

  if local_t >= s.pending_reminder and sent < s.daily_reminder_cap and local_t < s.expiring_reminder then
    if private.notify(p, t, 'MISSION_PENDING', 'PENDING:' || d, d, '觀測站仍在等待',
         coalesce(l.config #>> '{notify,pending}', '今天的區域仍有未處理的訊號。')) then created := created + 1; sent := sent + 1; end if;
  end if;
  if local_t >= s.expiring_reminder and sent < s.daily_reminder_cap then
    if private.notify(p, t, 'MISSION_EXPIRING', 'EXPIRING:' || d, d, '區域即將關閉',
         coalesce(l.config #>> '{notify,expiring}', '這個區域將在午夜重新封閉。之後它不會以同樣的樣子回來。')) then created := created + 1; end if;
  end if;
  return created;
end $$;

create or replace function public.cron_tick() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare pr record; n int := 0;
begin
  for pr in select id from public.profiles where not is_test loop
    perform private.refresh(pr.id);
    n := n + private.generate_reminders(pr.id);
  end loop;
  return jsonb_build_object('created', n, 'at', now());
end $$;

-- 測試檔案：用模擬時間跑一次排程（只產生站內訊息，不推播）
create or replace function public.admin_test_tick(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare n int;
begin
  perform private.assert_test(p);
  perform private.refresh(p);
  n := private.generate_reminders(p);
  return jsonb_build_object('created', n, 'game_now', private.game_now(p));
end $$;

-- ───────────────────────── 推播佇列（僅 service_role / Edge Function） ─────────────────────────
create or replace function private.in_quiet(p uuid, t timestamptz) returns boolean
language plpgsql stable as $$
declare prefs public.notification_prefs; lt time;
begin
  select * into prefs from public.notification_prefs where profile_id = p;
  if prefs.quiet_start is null or prefs.quiet_end is null then return false; end if;
  lt := (t at time zone (private.settings()).tz)::time;
  if prefs.quiet_start <= prefs.quiet_end then
    return lt >= prefs.quiet_start and lt < prefs.quiet_end;
  end if;
  return lt >= prefs.quiet_start or lt < prefs.quiet_end;
end $$;

create or replace function public.push_claim(max_items int default 50) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare out jsonb := '[]'; n record;
begin
  update public.notifications set push_status = 'queued'
   where push_status = 'sending' and pushed_at < now() - interval '10 minutes';
  -- 已失效的「即將截止」不再推送
  update public.notifications nn set push_status = 'skipped'
   where push_status = 'queued' and type in ('MISSION_EXPIRING', 'MISSION_PENDING')
     and now() >= (private.level_window(nn.day)).close_at;
  for n in
    select * from public.notifications
     where push_status = 'queued' and created_at <= now()
       and not private.in_quiet(profile_id, now())
     order by created_at limit max_items
     for update skip locked
  loop
    update public.notifications set push_status = 'sending', pushed_at = now() where id = n.id;
    out := out || jsonb_build_object('id', n.id, 'type', n.type, 'title', n.title, 'body', n.body, 'day', n.day,
      'subs', (select coalesce(jsonb_agg(jsonb_build_object('endpoint', endpoint, 'keys', jsonb_build_object('p256dh', p256dh, 'auth', auth))), '[]')
                 from public.push_subscriptions where profile_id = n.profile_id));
  end loop;
  return out;
end $$;

create or replace function public.push_mark(nid bigint, ok boolean, gone text[]) returns void
language plpgsql security definer set search_path = public, private as $$
begin
  update public.notifications set push_status = case when ok then 'sent' else 'failed' end, pushed_at = now() where id = nid;
  delete from public.push_subscriptions where endpoint = any(coalesce(gone, '{}'));
end $$;

-- ───────────────────────── 權限 ─────────────────────────
revoke all on all functions in schema public from public;
revoke all on all functions in schema private from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    execute 'revoke all on all functions in schema public from anon, authenticated';
    execute 'revoke all on all functions in schema private from anon, authenticated';
    execute 'revoke all on schema private from anon, authenticated';
    execute 'grant execute on function public.is_admin() to anon, authenticated';
    execute $g$grant execute on function
      public.bootstrap(), public.get_state(uuid), public.open_level(uuid, int), public.submit_step(uuid, int, text, jsonb),
      public.explore(uuid, int, text), public.request_hint(uuid, int, text),
      public.submit_evidence(uuid, int, text, text, text, text), public.observe(uuid, text),
      public.list_notifications(uuid), public.mark_notifications_read(uuid), public.get_prefs(uuid), public.save_prefs(uuid, jsonb),
      public.save_push_subscription(uuid, jsonb), public.delete_push_subscription(uuid, text),
      public.get_portrait(uuid), public.save_portrait(uuid, jsonb, text[]),
      public.finale_archive(uuid), public.submit_definition(uuid, text, boolean), public.finale_hunt(uuid), public.submit_hunt(uuid, int, text),
      public.admin_overview(), public.admin_profile_state(uuid), public.admin_list_evidence(text),
      public.admin_review_evidence(uuid, text, text), public.admin_delete_evidence(uuid),
      public.admin_trigger_event(uuid, text, text, jsonb), public.admin_grant_portrait(uuid), public.admin_set_ar_fallback(int, text, boolean),
      public.admin_export(), public.admin_create_test_profile(text, timestamptz), public.admin_set_test_time(uuid, timestamptz),
      public.admin_test_force(uuid, int, text), public.admin_test_observe(uuid, int, text), public.admin_test_reset(uuid),
      public.admin_delete_test_profile(uuid), public.admin_test_tick(uuid)
      to authenticated$g$;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    execute 'grant execute on function public.cron_tick(), public.push_claim(int), public.push_mark(bigint, boolean, text[]) to service_role';
  end if;
end $$;

-- ===== migrations/20261107000004_storage_schedule.sql =====
-- PROJECT 030 · 檔案儲存權限與背景排程
-- 這個檔案只在 Supabase 上有效（需要 storage / pg_cron / pg_net）。本機測試會自動略過。

do $outer$
begin
  if not exists (select 1 from pg_namespace where nspname = 'storage') then
    raise notice 'storage schema missing – skipped';
    return;
  end if;

  insert into storage.buckets (id, name, public, file_size_limit)
  values ('evidence', 'evidence', false, 26214400),
         ('gifts', 'gifts', false, 15728640)
  on conflict (id) do nothing;

  -- 路徑規則：<profile_id>/<...>；只有檔案擁有者與管理者能讀寫
  begin
    execute $p$create policy p030_owner_insert on storage.objects for insert to authenticated
    with check (bucket_id in ('evidence', 'gifts')
      and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()))$p$;
  exception when others then raise notice 'policy p030_owner_insert skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_owner_read on storage.objects for select to authenticated
    using (bucket_id in ('evidence', 'gifts')
      and ((storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()) or public.is_admin()))$p$;
  exception when others then raise notice 'policy p030_owner_read skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_admin_delete on storage.objects for delete to authenticated
    using (bucket_id in ('evidence', 'gifts') and public.is_admin())$p$;
  exception when others then raise notice 'policy p030_admin_delete skipped: %', sqlerrm;
  end;
  begin
    execute $p$create policy p030_owner_delete_gift on storage.objects for delete to authenticated
    using (bucket_id = 'gifts' and (storage.foldername(name))[1] in (select id::text from public.profiles where user_id = auth.uid()))$p$;
  exception when others then raise notice 'policy p030_owner_delete_gift skipped: %', sqlerrm;
  end;
end
$outer$;

-- 推播派送設定（不經 API 暴露）
create table if not exists private.app_config (key text primary key, value text not null);

create or replace function private.dispatch_push() returns void
language plpgsql security definer set search_path = public, private as $$
declare url text; secret text;
begin
  select value into url from private.app_config where key = 'push_function_url';
  select value into secret from private.app_config where key = 'cron_secret';
  if url is null or secret is null then return; end if;
  if not exists (select 1 from public.notifications where push_status = 'queued') then return; end if;
  perform net.http_post(url := url, body := '{}'::jsonb,
                        headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', secret));
end $$;

do $outer$
begin
  if not exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    raise notice 'pg_cron unavailable – skipped';
    return;
  end if;
  create extension if not exists pg_cron;
  create extension if not exists pg_net;
  perform cron.unschedule(jobid) from cron.job where jobname = 'p030-tick';
  -- 每 5 分鐘：判定逾期、產生提醒、派送推播（與玩家是否開啟網頁無關）
  perform cron.schedule('p030-tick', '*/5 * * * *', 'select public.cron_tick(); select private.dispatch_push();');
end
$outer$;

-- ===== migrations/20261107000005_seed.sql =====
-- 由 tools/build-seed.mjs 自動產生。部署後請以管理後台修改內容。

insert into public.symbols (id, key, name, digit, lore) values (1, 'origin', '起', 3, '[{"from_day":1,"text":"一個開始的記號。"},{"from_day":6,"text":"它第二次出現時，你已經不是第一次見到它的那個人。"},{"from_day":10,"text":"每一個開始，都發生在某件事之後。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (2, 'echo', '聲', 0, '[{"from_day":2,"text":"它記得聲音，但不記得是誰說的。"},{"from_day":9,"text":"回放的時候，你聽見的是當時的自己。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (3, 'key', '鑰', 7, '[{"from_day":3,"text":"能打開東西，也能只留下形狀。"},{"from_day":7,"text":"第 7 天，再用一次。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (4, 'mirror', '鏡', 1, '[{"from_day":4,"text":"鏡子裡的房間，比外面多一盞燈。"},{"from_day":10,"text":"鏡像不是相反，只是另一個方向。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (5, 'sprout', '芽', 9, '[{"from_day":5,"text":"不是每一株都同時長出來。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (6, 'fault', '裂', 4, '[{"from_day":6,"text":"裂縫也是一種紀錄。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (7, 'gate', '門', 6, '[{"from_day":7,"text":"有些門只開一次。有些門會在別處再出現。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (8, 'fork', '岔', 2, '[{"from_day":8,"text":"選擇之後，另一條路並沒有消失，只是你沒有走。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (9, 'void', '空', 8, '[{"from_day":9,"text":"空白不是沒有內容，是還沒有被寫下。"}]'::jsonb) on conflict (id) do nothing;
insert into public.symbols (id, key, name, digit, lore) values (10, 'loop', '環', 5, '[{"from_day":10,"text":"沒有起點，也沒有終點。"}]'::jsonb) on conflict (id) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (1, 'ZONE 01', '接入', 'INTAKE', '{"notify":{"new":"你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。","pending":"第 01 區的電力仍未恢復。","expiring":"第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"},"scene":{"theme":"intake","light":"on","props":["incubator","panel","terminal","clock","desk"],"hotspots":[{"id":"under_desk","x":24,"y":82,"label":"桌子底下"},{"id":"c_panel","x":17,"y":41,"label":"配電箱","clue":[{"type":"note","text":"配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}]},{"id":"c_clock","x":49,"y":21,"label":"牆上的時鐘","clue":[{"type":"clock","h":10,"m":30,"caption":"時鐘停住了。秒針一動也不動。"}]},{"id":"c_lock","x":77,"y":54,"label":"培養艙的鎖","clue":[{"type":"note","text":"培養艙的鎖上刻著：\n「解鎖所需的兩樣東西，遺落在你世界的床邊。」\n「型號照抄。」\n「數字，依配電箱的規則。」"}]}]},"intro":["……連線建立。","觀測者，歡迎接入 PROJECT 030。","你的權限：觀測、修復、紀錄。"],"steps":[{"id":"s_id_intro","type":"story","text":["終端機：「新觀察員接入。」","「你已被指派至第 030 號檔案。開始建立身分檔案。」","「請先確認你的觀察員編號。」"],"speaker":"SYSTEM","scene":{"light":"on"},"stage":1,"stage_title":"身分建檔"},{"id":"s_id","type":"keypad","title":"觀察員編號","length":4,"prompt":"輸入你的觀察員編號。","stage":1,"stage_title":"身分建檔"},{"id":"s_calib","type":"story","text":["終端機：「身分確認。」","「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」","「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」"],"speaker":"SYSTEM","stage":1,"stage_title":"身分建檔"},{"id":"s_tone","type":"choice","title":"校準 1／4・識別色調","flag":"p_tone","stage":1,"stage_title":"身分建檔","text":["檔案裡的你，應該是什麼顏色？"],"options":[{"id":"mono","label":"黑白・永恆","desc":"只留下光與影。"},{"id":"film","label":"暖色・膠片","desc":"像一段被保存下來的午後。"},{"id":"cool","label":"冷光・未來","desc":"金屬、霓虹、乾淨的線條。"},{"id":"cover","label":"高彩・封面","desc":"鮮明、張揚，像雜誌封面上的人。"}]},{"id":"s_outfit","type":"choice","title":"校準 2／4・輪廓","flag":"p_outfit","stage":1,"stage_title":"身分建檔","text":["識別影像需要一個輪廓。你想以什麼樣子被記錄？"],"options":[{"id":"formal","label":"正式","desc":"西裝或套裝，像是要去領一個獎。"},{"id":"smart","label":"俐落","desc":"襯衫、簡單的剪裁，乾淨就好。"},{"id":"self","label":"本色","desc":"你平常最像自己的那一套衣服。"},{"id":"bold","label":"大膽","desc":"平常不敢穿、但一直想試試看的。"}]},{"id":"s_mood","type":"choice","title":"校準 3／4・表情模組","flag":"p_mood","stage":1,"stage_title":"身分建檔","text":["檔案裡的你，看起來是什麼表情？"],"options":[{"id":"confident","label":"自信","desc":"直視鏡頭。"},{"id":"gentle","label":"溫柔","desc":"像在對某個人笑。"},{"id":"calm","label":"冷靜","desc":"安靜、不動聲色。"},{"id":"playful","label":"玩心","desc":"有一點調皮。"}]},{"id":"s_scene","type":"choice","title":"校準 4／4・背景場域","flag":"p_scene","stage":1,"stage_title":"身分建檔","text":["識別影像要放在什麼樣的空間裡？"],"options":[{"id":"studio","label":"純色空間","desc":"什麼都沒有，只有你。"},{"id":"city","label":"城市街角","desc":"有路燈、有人經過。"},{"id":"retro","label":"復古房間","desc":"舊沙發、老燈、時間的味道。"},{"id":"light","label":"光影抽象","desc":"光線和陰影切出你的輪廓。"}]},{"id":"s_ref","type":"evidence","title":"參考影像（可略過）","kinds":["photo"],"optional":true,"stage":1,"stage_title":"身分建檔","prompt":"如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。"},{"id":"s_saved","type":"story","text":["終端機：「識別影像設定已寫入。」","「身分檔案建立完成。指派任務：修復檔案 030。」"],"speaker":"SYSTEM","stage":1,"stage_title":"身分建檔"},{"id":"s_blackout","type":"story","text":["就在檔案寫入的瞬間——","整個房間暗了下來。只剩下紅色的緊急照明。","系統：「警告。主電源中斷。培養艙失去供電。請立即恢復電源。」"],"speaker":"SYSTEM","scene":{"light":"emergency"},"fx":"static","stage":2,"stage_title":"緊急重啟"},{"id":"s_power","type":"switches","title":"配電箱","count":6,"labels":["1","2","3","4","5","6"],"stage":2,"stage_title":"緊急重啟","prompt":"先調查上方畫面裡的配電箱，再撥動開關、拉下主閘。"},{"id":"s_sample","type":"story","text":["燈一盞一盞亮回來。培養艙的玻璃起霧，又慢慢變清。","裡面有一個很小的東西。它沒有名字，只有編號：030。","但停電觸發了保護機制——培養艙被鎖住了。"],"speaker":"SYSTEM","scene":{"light":"on"},"stage":2,"stage_title":"緊急重啟"},{"id":"s_lock","type":"text","title":"培養艙的鎖","placeholder":"輸入密碼（英文＋數字）","stage":2,"stage_title":"緊急重啟","prompt":"先調查畫面裡的培養艙，再輸入密碼。"},{"id":"s_unlocked","type":"story","text":["鎖開了。培養艙的門緩緩滑開。","系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"],"speaker":"SYSTEM","stage":2,"stage_title":"緊急重啟"},{"id":"s_observe","type":"observe","title":"第一次觀察","prompt":"前往「培養艙」選一種方式觀察它，再回到這裡。","stage":2,"stage_title":"緊急重啟"},{"id":"s_drift","type":"story","text":["終端機突然閃爍：「警告。偵測到時間差。」","「此區的時間，停在某一刻。你的世界卻仍在前進。」","「培養艙無法在不同步的時間裡封存。」"],"speaker":"SYSTEM","stage":3,"stage_title":"時間同步"},{"id":"s_sync","type":"evidence","title":"時間同步","kinds":["photo"],"gate":true,"stage":3,"stage_title":"時間同步","prompt":"同步程序需要一份來自你世界的證據。（這個房間裡，有東西停住了。）","pending_text":"同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}],"epilogue":["電力恢復。第 01 區已歸檔。","你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, '{"route_title":"備用通道","scene":{"theme":"intake","light":"off","props":["incubator","panel","terminal"],"hotspots":[]},"intro":["主電源已經燒毀。","你只有一支手電筒。"],"steps":[{"id":"a_find","type":"find","title":"黑暗中的記號","spots":[{"id":"w1","x":18,"y":30},{"id":"w2","x":72,"y":22},{"id":"glyph","x":58,"y":70},{"id":"w3","x":30,"y":76}],"clue":[{"type":"note","text":"有人用螢光漆在牆上畫了一個圓。"}],"prompt":"用手電筒照亮四周，找到那個圓。"},{"id":"a_terminal","type":"keypad","title":"備用終端","length":4,"clue":[{"type":"note","text":"時鐘的玻璃碎了。碎片裡，兩根指針分別停在「十」和「六」。"}],"prompt":"輸入時間停止的時刻。"},{"id":"a_sample","type":"story","text":["培養艙在備用電力下亮了一下。","樣本 030 還在。只是比你想像的更安靜。"]},{"id":"a_observe","type":"observe","title":"補登觀測","prompt":"前往「培養艙」完成今天的觀測。"},{"id":"a_log","type":"evidence","title":"觀測日誌 #001（補登）","kinds":["text"],"prompt":"用一句話記下今天你注意到的一件小事。"}],"epilogue":["備用通道已關閉。","符號留下來了——但不是原本那一個。"]}'::jsonb, '{"s_power":{"answer":"011010","hints":["「無法再被拆開」的數字，只能被 1 和它自己整除。","注意：1 不算。這種數必須大於 1。","打開 2、3、5，其他保持關閉。"],"success":"配電箱發出低鳴。燈一盞一盞亮起。","wrong":"保險絲跳了一下，又暗了。"},"s_sync":{"hints":["看看這個房間裡，有什麼東西停住了。","你的世界裡，也有同樣的東西。讓它停在同一刻。","找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]},"hotspots":{"under_desk":{"text":"桌子底下黏著一張舊標籤：「樣本來源：未登記」。","grant":{"items":[{"key":"label_unregistered","name":"未登記的標籤","desc":"樣本來源：未登記。","data":{"hidden":true}}]}}},"s_lock":{"answer":["A168888483"],"hints":["培養艙的鎖提到兩樣遺失的東西，它們在你世界的床邊。","床邊有一支手機和一張收據。密碼 ＝ 手機型號 ＋ 收據上的統編。","依配電箱的規則：1 不算。型號照抄，統編裡的 1 全部拿掉。"],"success":"咔。培養艙的鎖彈開了。","wrong":"鎖沒有反應。"},"s_id":{"answer":"$birth_mmdd","hints":["你登入時輸入的那四個數字。"],"success":"身分確認。","wrong":"編號不符。"},"a_find":{"answer":"glyph","success":"螢光圓圈在光束下浮現。"},"a_terminal":{"answer":"1030","hints":["「十」和「六」是時針和分針。"],"success":"備用終端亮起。"}}'::jsonb, '{"symbol":1,"flags":{"lab_power":true}}'::jsonb, '{"symbol":1,"echo":true,"flags":{"lab_backup":true}}'::jsonb, '{"flags":{"lab_dark":true},"message":{"title":"第 01 區斷電","body":"接入室的燈在午夜熄滅了。備用通道仍可使用，但那裡沒有燈。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (2, 'ZONE 02', '頻率', 'FREQUENCY', '{"notify":{"new":"一段不明訊號正在重複播放。來源：第 02 區。","pending":"訊號仍在等待回應。","expiring":"頻道將於午夜關閉。"},"scene":{"theme":"radio","light":"on","props":["radio","antenna","desk","window"],"hotspots":[{"id":"drawer","x":76,"y":80,"label":"抽屜"},{"id":"c_log","x":51,"y":57,"label":"收音機","clue":[{"type":"log","lines":["廣播紀錄 23:10 —— 收到片段訊號","附註：訊號是倒著傳來的。","內容：「7.301」"]}]},{"id":"c_serial","x":88,"y":46,"label":"印表機旁的便條","clue":[{"type":"note","text":"有人在便條上潦草地寫著：\n「耗材序號：13 位數字。」\n「它印在一樣你每天都會用、用完就會消失的白色東西上。」"}]},{"id":"c_keys","x":20,"y":34,"label":"牆上的舊貼紙","clue":[{"type":"note","text":"一張泛黃的鍵盤貼紙。\n每個英文字母旁邊，都還印著一個小小的符號：ㄅ、ㄆ、ㄇ、ㄈ……\n數字鍵 3、4、6、7 上印著的，是聲調。"}]}]},"variants":[{"id":"dim","when":{"flag":"lab_dark"},"scene":{"light":"dim"},"intro":["接入室沒有恢復電力，這裡的燈也比應該的暗。","收音機靠電池運轉。"]}],"intro":["收音機自己開著。","只有雜訊。"],"steps":[{"id":"s_intro","type":"story","text":["收音機自己開著，只有雜訊。","系統：「請找出訊號源的頻率。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_tune","type":"dial","title":"調頻","dials":4,"format":"###.#","stage":1,"stage_title":"訊號解析","prompt":"調查畫面裡的收音機，轉動旋鈕對準頻率。"},{"id":"s_signal","type":"story","text":["雜訊退去，一段從深海傳來的錄音開始播放。","系統：「訊號裡混了好幾種聲音。分離前，需要知道一共有幾種。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_count","type":"listen","title":"訊號分離","stage":1,"stage_title":"訊號解析","prompt":"播放錄音。每聽到一種「新的」聲音，就點一下「標記」。聽完後送出：一共有幾種？（背景的海潮不算）"},{"id":"s_print","type":"story","text":["分離完成的瞬間，收音機旁的印表機亮起了紅燈。","螢幕顯示：「紙張耗盡。請輸入耗材序號以繼續列印。」"],"stage":2,"stage_title":"亂碼"},{"id":"s_serial","type":"keypad","title":"耗材序號","length":13,"stage":2,"stage_title":"亂碼","prompt":"輸入 13 位耗材序號。（畫面裡有人留下了線索）"},{"id":"s_printed","type":"story","text":["序號吻合。印表機開始運轉——","吐出來的紙上，只有一行看不懂的字。"],"stage":2,"stage_title":"亂碼"},{"id":"s_decode","type":"text","title":"亂碼","placeholder":"翻譯成一句話","stage":2,"stage_title":"亂碼","clue":[{"type":"log","lines":["［自動列印・來源：第 02 頻道］","","5l3j35 al au q9 5l4","","附註：發送者用的，不是你習慣的那種打字方式。"]}],"prompt":"這行字其實是一句話。它在說什麼？"},{"id":"s_cats","type":"evidence","title":"執行指令","kinds":["photo"],"gate":true,"photoset":{"count":5,"label":"第 {n} 隻"},"stage":2,"stage_title":"亂碼","prompt":"照紙上說的去做。一格放一張照片，五格都完成後，一起送出審核。","pending_text":"五張照片已送出。觀察站正在一隻一隻地數……"},{"id":"s_laugh","type":"story","text":["照片傳回的瞬間，訊號裡多了一段很短、很亮的頻率。","系統：「偵測到未知頻率。分類：笑聲。」","系統：「觀察站需要一段新的樣本才能完成校準。」"],"speaker":"SYSTEM","stage":3,"stage_title":"笑聲頻率"},{"id":"s_joke","type":"evidence","title":"笑聲頻率","kinds":["audio"],"gate":true,"stage":3,"stage_title":"笑聲頻率","prompt":"這段笑聲必須由你引起，發生在另一個人身上。把整個過程錄下來。","pending_text":"笑聲已送出。觀察站正在校準頻率……"},{"id":"s_watcher","type":"story","text":["門口站著一個人，穿著舊式的值班外套。","「我聽見有人在笑。」他說。「很久沒聽到了。」","「我是這裡的守夜人。我們明天見。」"],"speaker":"守夜人","when":{"not":{"flag":"lab_dark"}},"stage":3,"stage_title":"笑聲頻率"},{"id":"s_watcher_dark","type":"story","text":["走廊的另一端有手電筒的光晃了一下。","「……剛剛是誰在笑？」有人說。「這裡太暗了，明天吧。」"],"speaker":"？","when":{"flag":"lab_dark"},"stage":3,"stage_title":"笑聲頻率"}],"epilogue":["頻率已鎖定。","你取得了第二個符號。"]}'::jsonb, '{"route_title":"靜默頻道","scene":{"theme":"radio","light":"dim","npc":"note","props":["radio","desk","window"],"hotspots":[]},"intro":["收音機沒有聲音了。","門上貼著一張紙條。"],"steps":[{"id":"a_note","type":"text","title":"紙條","placeholder":"四個字","clue":[{"type":"letter","lines":["等不到你，我先走了。","待會兒雨應該就停了。","訊號我抄下來了，在東邊。","號碼別告訴別人。","——守夜人"]}],"prompt":"紙條裡藏著一句話。是什麼？"},{"id":"a_record","type":"evidence","title":"環境聲樣本（補登）","kinds":["audio"],"prompt":"錄下你此刻所在地 5–15 秒的環境聲。"}],"epilogue":["你沒有見到守夜人。","但你知道他等過。"]}'::jsonb, '{"s_tune":{"answer":"1037","hints":["紀錄說訊號是倒著傳來的。","把「7.301」倒過來讀。"],"success":"雜訊消失了。","wrong":"只有雜訊。"},"hotspots":{"drawer":{"text":"抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。","grant":{"items":[{"key":"freq_table","name":"頻率表","desc":"「030.0 —— 不要調到這裡」。","data":{"hidden":true}}]}}},"s_count":{"answer":"6","hints":["同一種聲音，可能出現不只一次。重複的只算一種。","戴上耳機，從頭聽一次，每聽到一種新的聲音就記下來。","聲納、氣泡、心跳、鯨魚、貓叫、音樂盒——一共 6 種。"],"success":"分離完成：聲納・氣泡・心跳・鯨歌・貓叫・音樂盒。","wrong":"數量不符。訊號又混在一起了。"},"s_serial":{"answer":"4710901898847","hints":["每天都會用、用完就會消失、白色的……","它通常放在廁所或浴室。","找到倍潔雅衛生紙的包裝，輸入條碼下方的 13 個數字。"],"success":"序號吻合。印表機開始運轉。","wrong":"序號不符。印表機拒絕列印。"},"s_decode":{"answer":["找五隻貓咪拍照","找5隻貓咪拍照","找五隻貓拍照","找5隻貓拍照","找五只猫咪拍照","找五隻貓咪合照","找五隻貓咪","五隻貓咪拍照","ㄓㄠˇㄨˇㄓㄇㄠㄇㄧㄆㄞㄓㄠˋ"],"hints":["這不是亂碼。是有人用另一種鍵盤，打了一句中文。","想像用「注音」輸入法打字：5 是ㄓ、l 是ㄠ、3 是三聲，空白是一聲。","5l3＝找、j3＝五、5＝隻、al＝貓、au＝咪、q9＝拍、5l4＝照。"],"success":"解碼完成：「找五隻貓咪拍照」。","wrong":"翻出來的句子不太對。"},"s_cats":{"hints":["紙上的那句話，就是你要做的事。","五格各放一隻不同的貓，可以分次、在不同地方拍。","貓咪咖啡廳，是最容易一次遇見五隻貓的地方。"]},"s_joke":{"hints":["笑聲不能是你自己的。","講一個笑話給身邊的朋友聽，冷笑話也算。","把你講笑話的過程和朋友的反應一起錄下來，上傳。"]},"a_note":{"answer":["等待訊號"],"hints":["看每一行的第一個字。"],"success":"紙條背面寫著：「我會再回來。」","wrong":"好像不是這樣讀的。"}}'::jsonb, '{"symbol":2,"flags":{"watcher_met":true}}'::jsonb, '{"symbol":2,"echo":true,"flags":{"read_note":true}}'::jsonb, '{"flags":{"watcher_left":true},"message":{"title":"頻道關閉","body":"收音機在午夜後只剩下靜默。有人在門上留了一張紙條。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (3, 'ZONE 03', '保險箱', 'THE SAFE', '{"notify":{"new":"第 03 區偵測到一個實體投影。它在你的世界裡。","pending":"投影卡尚未被掃描。","expiring":"投影將於午夜失效。"},"scene":{"theme":"vault","light":"on","props":["safe","shelf","desk"],"hotspots":[]},"variants":[{"id":"watcher","when":{"flag":"watcher_met"},"scene":{"npc":"watcher"}},{"id":"note","when":{"flag":"watcher_left"},"scene":{"npc":"note"}}],"intro":["房間中央有一個保險箱，但它不是真的在這裡。","系統：「保險箱的實體投影卡已放置於現實世界。」"],"steps":[{"id":"s_watch","type":"story","text":["守夜人：「卡片是我放的。提示我只說一次——」","「找一個你每天都會打開，卻很少注意它的地方。」"],"speaker":"守夜人","when":{"flag":"watcher_met"},"stage":1,"stage_title":"投影卡 A"},{"id":"s_note","type":"story","text":["桌上壓著一張紙條：","「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"],"when":{"not":{"flag":"watcher_met"}},"stage":1,"stage_title":"投影卡 A"},{"id":"s_scan","type":"ar","title":"掃描投影卡 A","target":0,"card":"A","overlay":"safe","prompt":"找到實體卡片 A，用相機對準它。","stage":1,"stage_title":"投影卡 A"},{"id":"s_open","type":"keypad","title":"保險箱轉盤","length":3,"prompt":"輸入保險箱的密碼。","stage":2,"stage_title":"保險箱"},{"id":"s_inside","type":"story","text":["保險箱裡只有一張舊照片。","照片背面寫著：「第 7 天，再用一次。」","照片的角落，有一行很小的字：「座標未確認」。"],"stage":2,"stage_title":"保險箱"},{"id":"s_coord","type":"evidence","title":"座標確認","kinds":["photo"],"gate":true,"stage":3,"stage_title":"座標確認","prompt":"系統需要確認投影卡的原始座標。","pending_text":"座標資料已送出。觀察站正在比對……"}],"epilogue":["保險箱已歸檔。","你取得了第三個符號，以及一張照片。"]}'::jsonb, '{"route_title":"鑰匙的形狀","scene":{"theme":"vault","light":"dim","props":["safe_open","shelf"],"hotspots":[]},"intro":["保險箱的門半開著，裡面是空的。","內壁上只剩一把鑰匙的壓痕。"],"steps":[{"id":"a_key","type":"dial","title":"復刻鑰匙","dials":5,"digits":[1,2,3,4],"format":"#####","clue":[{"type":"imprint","heights":[3,1,4,1,2],"caption":"內壁上的壓痕"}],"prompt":"調整五個齒的高度，讓鑰匙和壓痕吻合。"},{"id":"a_after","type":"story","text":["鑰匙插進壓痕，牆後有東西鬆開了。","你沒拿到照片。拿到的是一張拓印。"]}],"epilogue":["你得到的不是原本的東西。","但形狀還在。"]}'::jsonb, '{"s_scan":{"fallback":"VAULT-A","reveal":{"overlay":"safe","digits":"418"},"success":"卡片上方浮現一個保險箱。"},"s_open":{"answer":"418","hints":["數字只出現在投影的保險箱上。"],"success":"咔。","wrong":"轉盤卡住了。"},"s_coord":{"hints":["投影卡是在哪裡找到的？","回到那個地方。","拍一張「找到卡片的那個位置」上傳。"]},"a_key":{"answer":"31412","hints":["由左到右，數一數每個齒的高度。"],"success":"吻合。"}}'::jsonb, '{"symbol":3,"items":[{"key":"photo_old","name":"舊照片","desc":"背面寫著：第 7 天，再用一次。"}]}'::jsonb, '{"symbol":3,"echo":true,"items":[{"key":"key_rubbing","name":"鑰匙拓印","desc":"不是鑰匙本身，只是它的形狀。"}]}'::jsonb, '{"flags":{"safe_taken":true},"message":{"title":"保險箱已被開啟","body":"有人在你之前打開了它。裡面少了一樣東西。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (4, 'ZONE 04', '鏡廳', 'MIRROR HALL', '{"notify":{"new":"第 04 區的鏡面開始反射不存在的光。","pending":"鏡子裡的燈還亮著。","expiring":"鏡廳將於午夜熄燈。"},"scene":{"theme":"mirror","light":"on","props":["mirror","mirror2","lamp"],"hotspots":[]},"variants":[{"id":"cracked","when":{"stat":"missed","gte":2},"scene":{"props":["mirror_cracked","mirror2","lamp"]},"intro":["這裡的鏡子有一面裂了。","裂痕剛好穿過鏡子裡你的位置。"]}],"intro":["這裡的每一面鏡子都比房間大。","鏡子裡的房間，比外面多了一盞燈。"],"steps":[{"id":"s_mirror","type":"keypad","title":"鏡中數字","length":4,"stage":1,"stage_title":"鏡中數字","clue":[{"type":"mirror","text":"8031","caption":"這組數字只出現在鏡子裡。"}],"prompt":"它在現實中應該是什麼？"},{"id":"s_clock_intro","type":"story","text":["第二面鏡子裡，掛著一個時鐘。","但這個房間裡，沒有任何時鐘。"],"stage":2,"stage_title":"鏡中時鐘"},{"id":"s_mclock","type":"keypad","title":"鏡中時鐘","length":4,"stage":2,"stage_title":"鏡中時鐘","clue":[{"type":"clock","h":2,"m":15,"mirror":true,"caption":"鏡子裡的時鐘。"}],"prompt":"真正的時間是幾點幾分？（四位數）"},{"id":"s_photo","type":"evidence","title":"另一邊","kinds":["photo"],"gate":true,"stage":3,"stage_title":"另一邊","prompt":"鏡廳需要一張「另一邊」的你。","pending_text":"影像已送出。鏡面正在校正……"},{"id":"s_letter","type":"story","text":["鏡子後方滑出一個信封。","封面寫著：影像校正邀請函。","「請決定，影像中的你應該是什麼樣子。」"],"stage":3,"stage_title":"另一邊"}],"epilogue":["鏡廳已歸檔。","一封邀請函已送達「禮物」頁。"]}'::jsonb, '{"route_title":"碎鏡","scene":{"theme":"mirror","light":"dim","props":["shards"],"hotspots":[]},"intro":["地上全是碎片。","其中四片比較大，上面映著一個信封的一角。"],"steps":[{"id":"a_shards","type":"rotate","title":"拼回鏡子","tiles":4,"start":[1,3,2,1],"image":"envelope","prompt":"轉動每一片碎片，拼出完整的影像。"},{"id":"a_letter","type":"story","text":["碎片拼起來的時候，信封從裂縫裡掉了出來。","影像校正邀請函——有一點刮痕，但還能讀。"]}],"epilogue":["邀請函沒有消失。它只是換了一條路來找你。"]}'::jsonb, '{"s_mirror":{"answer":"8031","hints":["鏡子會左右顛倒。","從右往左讀，並把每個數字翻回來。"],"success":"鏡子裡的燈閃了一下。","wrong":"鏡面沒有反應。"},"s_mclock":{"answer":["0215","1415"],"hints":["鏡子會左右顛倒。","把時鐘左右翻回來再讀。","分針在 3 的位置是 15 分。"],"success":"鏡中的秒針開始走動。","wrong":"鏡面沒有反應。"},"s_photo":{"hints":["鏡子有兩邊。","拍一張有你倒影的照片——鏡子、窗戶、水面都可以。","對著鏡子，拍下你自己的倒影上傳。"]},"a_shards":{"answer":"0000","success":"影像完整了。"}}'::jsonb, '{"symbol":4,"gift":"portrait"}'::jsonb, '{"symbol":4,"echo":true,"gift":"portrait"}'::jsonb, '{"message":{"title":"鏡廳熄燈","body":"所有鏡子在午夜同時碎了。碎片還在，只是需要重新拼起來。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (5, 'ZONE 05', '溫室', 'GREENHOUSE', '{"notify":{"new":"第 05 區的濕度上升。有東西在生長。","pending":"溫室裡的植物還沒有被照顧。","expiring":"溫室的燈將於午夜關閉。"},"scene":{"theme":"greenhouse","light":"on","props":["plants","incubator","window"],"hotspots":[{"id":"roots","x":82,"y":84,"label":"根部"},{"id":"vines","x":10,"y":40,"label":"藤蔓後面","when":{"stat":"exploration","gte":2}},{"id":"c_pot","x":50,"y":82,"label":"花盆上的標籤","clue":[{"type":"note","text":"標籤上的字很小：\n「調配方法：見《居家保健小百科》——消化不良。」\n「對照速查表：用法 × 肌膚敏感度，數一數每一欄。」"}]}]},"variants":[{"id":"watcher","when":{"flag":"watcher_met"},"scene":{"npc":"watcher"},"intro":["守夜人在澆水。","「它們不是同一天種的，」他說，「所以不會同一天開。」"]}],"intro":["溫室裡的植物都不是同一天種下的。","培養艙被移到了這裡。"],"steps":[{"id":"s_order","type":"sequence","title":"澆水順序","pick":5,"render":"plant","stage":1,"stage_title":"澆水順序","items":[{"id":"c","stage":3},{"id":"a","stage":1},{"id":"e","stage":5},{"id":"b","stage":2},{"id":"d","stage":4}],"clue":[{"type":"note","text":"澆水紀錄：「從最晚種下的開始。」"}],"prompt":"依序點選植物。"},{"id":"s_ill","type":"story","text":["溫室的終端亮起紅燈：「樣本消化系統異常。」","「需要一份調配。調配的方法，記載在你世界的一本書裡。」"],"speaker":"SYSTEM","stage":2,"stage_title":"消化系統調配"},{"id":"s_recipe","type":"keypad","title":"消化系統調配","length":6,"stage":2,"stage_title":"消化系統調配","prompt":"輸入 6 位調配碼。（先調查畫面裡的花盆）"},{"id":"s_night","type":"story","optional":true,"title":"夜間花苞","text":["花苞在夜裡打開了。","裡面是一顆很小的、發著光的種子。"],"window":{"from":"21:00","to":"23:59:59","closed_text":"花苞緊閉著。也許要等到夜裡（21:00 後）。"},"stage":2,"stage_title":"灌溉計時器"},{"id":"s_photo","type":"evidence","title":"生長樣本","kinds":["photo"],"gate":true,"stage":3,"stage_title":"生長樣本","prompt":"溫室需要一份「正在長大」的樣本。","pending_text":"樣本已送出。溫室正在比對生長紀錄……"}],"epilogue":["溫室已歸檔。","你取得了第五個符號。"]}'::jsonb, '{"route_title":"枯室","scene":{"theme":"greenhouse","light":"dim","props":["plants_dry","incubator"],"hotspots":[]},"intro":["植物在你離開的那一晚枯了。","但根還在。"],"steps":[{"id":"a_valves","type":"switches","title":"灌溉閥","count":5,"labels":["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ"],"clue":[{"type":"roots","has":[1,0,1,1,0],"caption":"撥開土壤，看得到根的形狀。"},{"type":"note","text":"「只澆還有根的那幾株。」"}],"prompt":"打開需要的閥門。"},{"id":"a_photo","type":"evidence","title":"生長紀錄（補登）","kinds":["photo"],"prompt":"拍下一個正在生長、或正在改變中的東西。"}],"epilogue":["有兩株長出了新葉。","和原本的不一樣。"]}'::jsonb, '{"s_order":{"answer":"a,b,c,d,e","hints":["最晚種下的，現在長得最小。"],"success":"水流過每一株植物。","wrong":"有一株植物垂下了葉子。"},"s_night":{"grant":{"items":[{"key":"night_seed","name":"夜開的種子","desc":"只在夜裡發光。","data":{"hidden":true}}]}},"hotspots":{"roots":{"text":"根部纏著一張標籤：「不是每一株都需要被看見。」","grant":{"items":[{"key":"root_tag","name":"根部標籤","desc":"不是每一株都需要被看見。","data":{"hidden":true}}]}},"vines":{"text":"藤蔓後面有一間更小的溫室。裡面只種了一株，還沒發芽。","grant":{"items":[{"key":"hidden_greenhouse","name":"隱藏溫室的土","desc":"還沒發芽。","data":{"hidden":true}}]}}},"s_recipe":{"answer":"777250","hints":["花盆標籤提到一本書。它在你家的廚房。","找到《居家保健小百科》裡「消化不良」的複方調配，把用到的精油對照前面的精油速查表。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"],"success":"調配完成。樣本的光變得穩定。","wrong":"調配比例不對。樣本微微顫抖。"},"s_photo":{"hints":["你的世界裡，有什麼東西每天都在悄悄長大？","植物、寵物、指甲、頭髮……任何正在生長的都可以。","拍一株植物最新長出的葉子上傳。"]},"a_valves":{"answer":"10110","success":"水滲進土裡。"}}'::jsonb, '{"symbol":5}'::jsonb, '{"symbol":5,"echo":true}'::jsonb, '{"flags":{"greenhouse_wilted":true},"message":{"title":"溫室枯萎","body":"午夜之後，溫室的植物枯了。根還在。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (6, 'ZONE 06', '斷層', 'FAULT LINE', '{"notify":{"new":"異常：第 01 區的紀錄出現在第 06 區。","pending":"斷層仍在擴大。","expiring":"斷層將於午夜固定成形。"},"scene":{"theme":"fault","light":"flicker","props":["crack","terminal"],"hotspots":[{"id":"c_crack","x":50,"y":52,"label":"裂縫裡的紙","clue":[{"type":"note","text":"一張被撕下的紙，邊緣燒焦了：\n「……社會工作……」\n「……答錯的那幾題，改回正確答案……」\n「共 10 題。」"}]}]},"intro":["系統錯誤。","有些紀錄出現在不該出現的地方。"],"steps":[{"id":"s_glitch","type":"story","title":"損壞的紀錄","inject_evidence_day":1,"text":["第 01 區的紀錄出現在這裡，但已經損壞："],"stage":1,"stage_title":"重建斷層"},{"id":"s_lock","type":"symbols","title":"重建斷層","slots":4,"stage":1,"stage_title":"重建斷層","clue":[{"type":"log","lines":["損壞的時間戳：","D01 ▒▒ D02 ▒▒ D02 ▒▒ D01","「把最早的兩個訊號，依時間戳放回去。」"]}],"prompt":"從你持有的符號中依序放入。"},{"id":"s_exam_intro","type":"story","text":["裂縫深處卡著一張被撕下來的紙。","系統：「斷層的另一側，是一段曾經答錯的紀錄。把它改回來，裂縫才會停止。」"],"speaker":"SYSTEM","stage":2,"stage_title":"錯過的答案"},{"id":"s_exam","type":"letters","title":"錯過的答案","length":10,"letters":["A","B","C","D"],"stage":2,"stage_title":"錯過的答案","prompt":"依序輸入 10 個正確答案（A–D）。（先調查畫面裡的裂縫）"},{"id":"s_choice","type":"choice","title":"修復","flag":"fault","stage":2,"stage_title":"錯過的答案","text":["斷層中有一段紀錄可以修復。","但修復它，會覆寫較近的一段。"],"options":[{"id":"repair","label":"修復最早的紀錄","desc":"裂縫會闔上，另一段會被覆寫。"},{"id":"keep","label":"保留裂縫","desc":"兩段紀錄都留下，裂縫不會消失。"}]},{"id":"s_mended","type":"evidence","title":"修補過的東西","kinds":["photo"],"gate":true,"stage":3,"stage_title":"修補過的東西","prompt":"斷層需要一個「修補過」的東西作為參照。","pending_text":"參照物已送出。斷層正在比對……"}],"epilogue":["斷層已固定。","你取得了第六個符號。"]}'::jsonb, '{"route_title":"深層裂縫","scene":{"theme":"fault","light":"off","props":["crack_wide"],"hotspots":[]},"intro":["裂縫已經寬到可以走進去。","裡面的紀錄是倒著寫入的。"],"steps":[{"id":"a_lock","type":"symbols","title":"倒序重建","slots":4,"clue":[{"type":"log","lines":["倒序寫入：","D02 ▒▒ D01 ▒▒ D01 ▒▒ D02"]}],"prompt":"從你持有的符號中依序放入。"},{"id":"a_choice","type":"choice","title":"裂縫深處","flag":"fault","text":["裂縫的另一邊有光。"],"options":[{"id":"cross","label":"跨過去","desc":""},{"id":"stay","label":"沿著裂縫走","desc":""}]}],"epilogue":["你從另一個方向離開了斷層。"]}'::jsonb, '{"s_lock":{"answer":"sym1,sym2,sym2,sym1","hints":["你最早取得的兩個符號，分別來自第 1 天和第 2 天。","在「物品」查看每個符號的來源日。"],"success":"裂縫停止擴大。","wrong":"斷層發出刺耳的聲音。"},"s_exam":{"answer":"BDBBCBABAB","hints":["那是一張考卷。你曾經考過的。","它藏在衣櫥中間的櫃子裡。","找到四分社工師考卷的「社會工作」科，把答錯的題目的正確答案依序輸入。"],"success":"答案吻合。裂縫停止擴大。","wrong":"斷層發出刺耳的聲音。"},"s_mended":{"hints":["你身邊有沒有什麼東西，壞過，又被修好？","黏過的杯子、補過的衣服、貼著膠帶的東西……","拍一個曾經壞掉、又被修好的東西上傳。"]},"a_lock":{"answer":"sym2,sym1,sym1,sym2","hints":["第 1 天和第 2 天的符號——即使只是殘響——也算。"],"success":"裂縫裡的紀錄安靜下來。"}}'::jsonb, '{"symbol":6}'::jsonb, '{"symbol":6,"echo":true}'::jsonb, '{"message":{"title":"斷層擴大","body":"裂縫在午夜變寬了。另一側出現了一條沒有照明的通道。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (7, 'ZONE 07', '門', 'THE GATE', '{"notify":{"new":"第 07 區出現了一扇門。它只在今天存在。","pending":"那扇門仍然關著。","expiring":"門將於午夜消失。"},"scene":{"theme":"gate","light":"on","props":["gate","pillars"],"hotspots":[{"id":"photo_slot","x":50,"y":46,"label":"門上的凹槽","when":{"item":"photo_old"}},{"id":"side_room","x":88,"y":60,"label":"柱子後方","when":{"stat":"exploration","gte":2}}]},"variants":[{"id":"watcher","when":{"flag":"watcher_met"},"scene":{"npc":"watcher"},"intro":["守夜人站在門邊。","「我等這扇門很久了，」他說。「但它不是為我開的。」"]}],"intro":["一扇門，沒有門把。","門的另一面，有一張投影卡在等你。"],"steps":[{"id":"s_scan","type":"ar","title":"掃描投影卡 B","target":1,"card":"B","overlay":"totem","prompt":"找到實體卡片 B，用相機對準它。","stage":1,"stage_title":"投影卡 B"},{"id":"s_rings","type":"rings","title":"門環","rings":[[1,2,3,4,5,6],[2,3,4,5,6,7],[3,4,5,6,7,1]],"prompt":"轉動三個門環，對準圖騰上的符號。","stage":2,"stage_title":"門環"},{"id":"s_through","type":"story","text":["門打開了。","門後是一條走廊，盡頭還有一扇門——它沒有輪廓，也沒有影像。","系統：「這扇門需要被描出來。一雙手不夠。」"],"stage":3,"stage_title":"集結之手"},{"id":"s_hands","type":"evidence","title":"集結之手","kinds":["photo"],"gate":true,"mosaic":{"cols":10,"rows":3,"text":"1118","hearts":true},"stage":3,"stage_title":"集結之手","prompt":"每一格只露出門的一小段輪廓。讓手覆蓋發光的線，30 格全部完成，門才會出現。","pending_text":"影像已拼合並送出。門正在辨識……"}],"epilogue":["門已歸檔。","你取得了第七個符號。"]}'::jsonb, '{"route_title":"門縫","scene":{"theme":"gate","light":"dim","props":["wall_slit"],"hotspots":[]},"intro":["門消失了。","牆上只剩一道很窄的縫。"],"steps":[{"id":"a_peek","type":"keypad","title":"從縫隙看進去","length":4,"clue":[{"type":"slit","text":"7 2 9 1"}],"prompt":"拖動視線，讀出縫隙另一側的數字。"},{"id":"a_after","type":"story","text":["牆後的機關轉動了一下。","門沒有回來，但你聽見它在別的地方打開。"]}],"epilogue":["有些門只開一次。","有些門會在別處再出現。"]}'::jsonb, '{"s_scan":{"fallback":"GATE-B","reveal":{"overlay":"totem","glyphs":[4,5,6]},"success":"卡片上方浮現一座圖騰。"},"s_rings":{"answer":"4,5,6","hints":["答案只出現在 AR 圖騰上。"],"success":"門環依序歸位。","wrong":"門環彈回原位。"},"hotspots":{"photo_slot":{"text":"照片嵌進凹槽剛剛好。門內傳來機械聲。","grant":{"flags":{"photo_used":true},"items":[{"key":"gate_mark","name":"門的刻痕","desc":"你在第 3 天拿到的東西，在第 7 天被用上了。","data":{"hidden":true}}]}},"side_room":{"text":"柱子後方有一間沒有標示的小房間。牆上有一張地圖的一角。","grant":{"items":[{"key":"map_fragment","name":"地圖殘片","desc":"標示著一個不在這十個區域裡的位置。","data":{"hidden":true}}]}}},"s_hands":{"hints":["一雙手不夠。","找朋友來幫忙：每一格請一個人把手放在發光的線上拍下來（同一個人拍好幾格也可以）。","30 格全部拍完，按「拼合影像」，手就會拼出門的形狀。"]},"a_peek":{"answer":"7291","success":"牆後有東西動了。"}}'::jsonb, '{"symbol":7,"flags":{"gate_open":true}}'::jsonb, '{"symbol":7,"echo":true}'::jsonb, '{"flags":{"gate_sealed":true},"remove_items":["photo_old"],"message":{"title":"門已封閉","body":"那扇門在午夜後消失了。你帶著的那張照片，被夾進了門縫。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (8, 'ZONE 08', '岔路', 'THE FORK', '{"notify":{"new":"第 08 區要求一個選擇。","pending":"岔路仍在等待你的回覆。","expiring":"若午夜前沒有回覆，系統將代為選擇。"},"scene":{"theme":"fork","light":"on","props":["door_left","door_right"],"hotspots":[]},"variants":[{"id":"third","when":{"stat":"missed","gte":2},"scene":{"props":["door_left","door_mid","door_right"]},"intro":["兩扇門之間，出現了第三扇。","它沒有名字。"],"steps":[{"id":"s_intro","type":"story","text":["左邊寫著「保存」，右邊寫著「放手」。","中間那扇門什麼也沒寫。"],"stage":1,"stage_title":"選擇"},{"id":"s_door","type":"choice","title":"選一扇門","flag":"fork","text":["系統：「只能選一扇。」"],"stage":1,"stage_title":"選擇","options":[{"id":"keep","label":"保存","desc":""},{"id":"stay","label":"（沒有名字的門）","desc":""},{"id":"release","label":"放手","desc":""}]},{"id":"s_keep","type":"sequence","title":"整理檔案","pick":4,"render":"box","when":{"flag":"choice:fork","eq":"keep"},"stage":2,"stage_title":"門後","items":[{"id":"b","label":"▮▮▮"},{"id":"d","label":"▮"},{"id":"a","label":"▮▮▮▮"},{"id":"c","label":"▮▮"}],"prompt":"從最厚的開始，把檔案放回架上。"},{"id":"s_release","type":"switches","title":"熄燈","count":5,"labels":["01","02","03","04","05"],"when":{"flag":"choice:fork","eq":"release"},"stage":2,"stage_title":"門後","clue":[{"type":"note","text":"「只留下你最早點亮的那一盞。」"}],"prompt":"關掉其他的燈。","initial":"11111"},{"id":"s_stay","type":"wait","title":"停留","seconds":30,"when":{"flag":"choice:fork","eq":"stay"},"stage":2,"stage_title":"門後","start_text":"系統開始計時。請不要離開這個畫面。","early_text":"你離開得太早了。計時重新開始。","prompt":"什麼都不用做。停留 30 秒。"},{"id":"s_voice","type":"evidence","title":"沒有走的那條路","kinds":["audio"],"gate":true,"stage":3,"stage_title":"另一端","prompt":"岔路的另一端，需要你的聲音。","pending_text":"聲音已送出。岔路正在記錄……"}]}],"intro":["兩扇門。","左邊寫著「保存」，右邊寫著「放手」。"],"steps":[{"id":"s_door","type":"choice","title":"選一扇門","flag":"fork","text":["系統：「只能選一扇。」"],"stage":1,"stage_title":"選擇","options":[{"id":"keep","label":"保存","desc":""},{"id":"release","label":"放手","desc":""}]},{"id":"s_keep","type":"sequence","title":"整理檔案","pick":4,"render":"box","when":{"flag":"choice:fork","eq":"keep"},"stage":2,"stage_title":"門後","items":[{"id":"b","label":"▮▮▮"},{"id":"d","label":"▮"},{"id":"a","label":"▮▮▮▮"},{"id":"c","label":"▮▮"}],"prompt":"從最厚的開始，把檔案放回架上。"},{"id":"s_release","type":"switches","title":"熄燈","count":5,"labels":["01","02","03","04","05"],"when":{"flag":"choice:fork","eq":"release"},"stage":2,"stage_title":"門後","clue":[{"type":"note","text":"「只留下你最早點亮的那一盞。」"}],"prompt":"關掉其他的燈。","initial":"11111"},{"id":"s_voice","type":"evidence","title":"沒有走的那條路","kinds":["audio"],"gate":true,"stage":3,"stage_title":"另一端","prompt":"岔路的另一端，需要你的聲音。","pending_text":"聲音已送出。岔路正在記錄……"}],"epilogue":["岔路已歸檔。","另一扇門並沒有消失。只是你沒有走進去。"]}'::jsonb, '{"route_title":"覆寫","scene":{"theme":"fork","light":"dim","props":["door_left","door_right","relay"],"hotspots":[]},"intro":["系統替你選了「靜置」。兩扇門都上鎖了。","門邊有一組繼電器。"],"steps":[{"id":"a_relay","type":"switches","title":"繼電器","count":4,"labels":["A","B","C","D"],"initial":"0110","clue":[{"type":"note","text":"目前狀態：系統決定。\n「與系統相反的，才是你的。」"}],"prompt":"改寫繼電器。"},{"id":"a_door","type":"choice","title":"重新選擇","flag":"fork","text":["鎖開了。這一次由你決定。"],"options":[{"id":"keep","label":"保存","desc":""},{"id":"release","label":"放手","desc":""},{"id":"system","label":"維持系統的選擇","desc":""}]},{"id":"a_log","type":"evidence","title":"缺損的紀錄","kinds":["text"],"prompt":"檔案缺損：請補上一段遺失的紀錄——一件你曾經錯過，但後來仍然記得的小事。"}],"epilogue":["選擇已被覆寫——或被保留。","兩者都記錄在案。"]}'::jsonb, '{"s_keep":{"answer":"a,b,c,d","success":"架子滿了。"},"s_release":{"answer":"10000","hints":["你最早點亮的燈，在第 1 天。"],"success":"只剩一盞燈。它很亮。"},"s_voice":{"hints":["那扇你沒有選的門後面，是一段沒有被記錄的事。","說說看：一件你曾經錯過、但後來仍然記得的小事。","錄一段聲音，說出那件事。"]},"a_relay":{"answer":"1001","success":"繼電器發出喀的一聲。"}}'::jsonb, '{"symbol":8}'::jsonb, '{"symbol":8,"echo":true}'::jsonb, '{"flags_default":{"choice:fork":"system"},"message":{"title":"系統已代為選擇","body":"岔路在午夜前沒有收到回覆。系統替你選了一扇門。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (9, 'ZONE 09', '回放', 'PLAYBACK', '{"notify":{"new":"第 09 區的投影機開始轉動。它播放的是你的紀錄。","pending":"回放仍在等待排序。","expiring":"回放將於午夜停止。這一段不會被保存。"},"scene":{"theme":"playback","light":"dim","props":["projector","screen"],"hotspots":[]},"intro":["投影機開始轉動。","它播放的，是這幾天被保存下來的東西——沒有日期，順序亂了。"],"steps":[{"id":"s_timeline","type":"timeline","title":"排列片段","upto":8,"prompt":"依照發生的順序排列這些片段。空白的片段也有它的位置。","stage":1,"stage_title":"排列片段"},{"id":"s_stop","type":"story","text":["投影機在最後一格停住了。","畫面角落印著一行字：「紀錄起始日」。"],"stage":2,"stage_title":"起始日"},{"id":"s_date","type":"keypad","title":"紀錄起始日","length":4,"prompt":"輸入第一個片段浮上海面的日期（月日，四位數）。","stage":2,"stage_title":"起始日"},{"id":"s_voice","type":"evidence","title":"最後一段","kinds":["audio"],"gate":true,"stage":3,"stage_title":"最後一段","prompt":"回放缺少最後一段：現在的你。","pending_text":"聲音已送出。投影機正在寫入……"}],"epilogue":["回放結束。","你取得了第九個符號。它是空白的。"]}'::jsonb, null, '{"s_timeline":{"hints":["照片、聲音、文字與符號，都和你那一天做過的事有關。","空白的片段，代表那一天的原路線沒有被走完。"],"wrong":"影像跳動了一下。順序不對。"},"s_date":{"answer":"$start_mmdd","hints":["你第一次接入的那一天。","看「紀錄」頁最早的一筆事件。"],"success":"投影機重新轉動。","wrong":"日期不符。"},"s_voice":{"hints":["投影機也可以錄音。","對它說一句話——給十天前剛接入時的自己。","錄一段聲音，對十天前的自己說一句話。"]}}'::jsonb, '{"symbol":9}'::jsonb, '{}'::jsonb, '{"message":{"title":"回放中斷","body":"投影機在午夜停了。這一段影像沒有被保存，也不會再播放。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (10, 'ZONE 10', '核心', 'THE CORE', '{"notify":{"new":"最後一個區域。所有符號正在共鳴。","pending":"核心尚未被校準。","expiring":"核心將於午夜冷卻。"},"scene":{"theme":"core","light":"on","props":["core","pillars"],"hotspots":[]},"variants":[{"id":"steady","when":{"stat":"max_streak","gte":5},"scene":{"pulse":"steady"},"intro":["核心的脈動很規律。","和培養艙裡的某個東西同步。"]},{"id":"drift","when":{"stat":"breaks","gte":2},"scene":{"pulse":"irregular"},"intro":["核心的脈動時快時慢。","像是在等什麼人回來。"]}],"intro":["所有的符號同時發出聲音。","每一個符號都有自己的頻率。"],"steps":[{"id":"s_code","type":"keypad","title":"核心頻率","length":5,"stage":1,"stage_title":"核心頻率","clue":[{"type":"glyphs","ids":[6,2,1,2,7],"caption":"核心上刻著五個符號。"}],"prompt":"輸入核心的頻率。"},{"id":"s_ring","type":"story","text":["五個頻率疊在一起，形成一個環。","環的中央浮現三個空格：「顯示真正的編號」。"],"stage":2,"stage_title":"真正的編號"},{"id":"s_number","type":"symbols","title":"真正的編號","slots":3,"stage":2,"stage_title":"真正的編號","clue":[{"type":"log","lines":["「讓核心顯示它真正的編號。」","用符號的頻率拼出來。"]}],"prompt":"放入三個符號。"},{"id":"s_last","type":"choice","title":"最後的設定","flag":"core","text":["系統：「十個區域的紀錄即將封存。」"],"stage":3,"stage_title":"最後一樣東西","options":[{"id":"seal","label":"封存所有紀錄","desc":""},{"id":"open","label":"讓紀錄繼續寫下去","desc":""}]},{"id":"s_keepsake","type":"evidence","title":"最後一樣東西","kinds":["photo"],"gate":true,"stage":3,"stage_title":"最後一樣東西","prompt":"核心封存前，可以放進最後一樣東西。","pending_text":"已送出。核心正在接收……"}],"epilogue":["所有區域已歸檔。","明天，第030號檔案室將會開啟。"]}'::jsonb, '{"route_title":"未閉合之環","scene":{"theme":"core","light":"dim","props":["core"],"hotspots":[]},"intro":["核心已經冷卻。","但符號的刻痕還在，只是順序反了。"],"steps":[{"id":"a_code","type":"keypad","title":"冷卻的頻率","length":5,"clue":[{"type":"glyphs","ids":[7,2,1,2,6],"caption":"冷卻後的刻痕（由右至左）"}],"prompt":"輸入頻率。"},{"id":"a_ring","type":"story","text":["環亮了一半。","另一半，留給以後。"]}],"epilogue":["環沒有完全閉合。","也許它本來就不需要。"]}'::jsonb, '{"s_code":{"answer":"40306","hints":["每個符號在「物品」頁都有一個頻率數字。","裂＝4、聲＝0、起＝3、門＝6。"],"success":"核心開始旋轉。","wrong":"頻率不符。"},"s_number":{"answer":"sym2,sym1,sym2","hints":["檔案的編號是 030。","頻率 0 是「聲」，頻率 3 是「起」。"],"success":"核心顯示：030。","wrong":"編號不符。"},"s_keepsake":{"hints":["那是一樣你現在擁有、而且想一直留著的東西。","可以是物品、一個地方，或一個人（經過對方同意）。","拍下一樣你想帶進三十歲的東西上傳。"]},"a_code":{"answer":"60304","hints":["每個符號在「物品」頁都有一個頻率數字。"],"success":"核心微微發光。"}}'::jsonb, '{"symbol":10,"flags":{"core_done":true}}'::jsonb, '{"symbol":10,"echo":true}'::jsonb, '{"message":{"title":"核心冷卻","body":"核心在午夜冷卻了。環沒有完全閉合。"}}'::jsonb)
on conflict (day) do nothing;

insert into public.levels (day, code, title, subtitle, config, alternate, secrets, on_complete, on_alternate_complete, on_missed)
values (11, 'FILE 030', '第030號檔案室', 'ARCHIVE 030', '{"scene":{"theme":"archive","light":"on","props":["shelves"],"hotspots":[]},"steps":[],"monologue":[{"text":"第030號檔案室。"},{"text":"十天前，系統接到一個任務：為一個人建立一份完整的定義。"},{"text":"它收集了每一次觀測、每一段聲音、每一張照片、每一個選擇。"},{"when":{"stat":"missed","gte":1},"text":"也收集了每一次缺席。缺席的地方沒有被刪除，它們一樣是紀錄。"},{"when":{"stat":"missed","lte":0},"text":"十個區域都留下了紀錄。系統以為，這樣就足夠了。"},{"when":{"flag":"choice:fault","eq":"keep"},"text":"你保留了那道裂縫。系統一度把它歸類為錯誤。"},{"when":{"flag":"choice:fault","eq":"repair"},"text":"你修復了最早的紀錄，也覆寫了另一段。系統記下了這個交換。"},{"when":{"any":[{"flag":"choice:fault","eq":"cross"},{"flag":"choice:fault","eq":"stay"}]},"text":"你走進了裂縫裡面。系統沒有為那裡準備地圖。"},{"when":{"flag":"choice:fork","eq":"keep"},"text":"在岔路，你選擇保存。"},{"when":{"flag":"choice:fork","eq":"release"},"text":"在岔路，你選擇放手。"},{"when":{"flag":"choice:fork","eq":"stay"},"text":"在岔路，你走進了沒有名字的門。系統沒有預料到第三個選項。"},{"when":{"flag":"choice:fork","eq":"system"},"text":"在岔路，你保留了系統替你做的選擇。那也是一種選擇。"},{"when":{"flag":"watcher_met"},"text":"守夜人留下了一句話：「我只是在你不在的時候，替你看著。」"},{"when":{"flag":"watcher_left"},"text":"你沒有見到守夜人最後一面。他留下的紙條，被歸檔在第 02 區。"},{"text":"樣本 030 已經停止變化——不，它沒有。它只是在你看著它的時候，看起來像停住了。"},{"text":"系統的結論是：無法完成定義。"},{"text":"不是因為資料不夠。而是被定義的那個人，在被記錄的同時，仍在改變。"},{"text":"30，不是一個完成的版本。"},{"text":"30｜未完成的我。"},{"text":"所以，系統把最後一個欄位交給你。"}]}'::jsonb, null, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb)
on conflict (day) do nothing;

update public.finale_config set
  hunt = '[{"title":"最後的座標","clue":"（請在管理後台設定第一段提示）","location_hint":"","code":""}]'::jsonb,
  final_title = '檔案狀態：持續更新中',
  final_body = '（請在管理後台設定最終訊息）'
where id = 1 and hunt = '[]'::jsonb;

-- ===== migrations/20261108000006_admin_can_play.sql =====
-- 管理者信箱若同時在受邀名單中，也建立一份正式玩家檔案（方便用同一個信箱試玩）
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; invited boolean; prof jsonb;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  invited := exists (select 1 from public.allowed_players where lower(email) = em);
  if invited then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid;
  return jsonb_build_object('is_admin', adm, 'allowed', adm or invited, 'email', em, 'profiles', prof);
end $$;
revoke all on function public.bootstrap() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.bootstrap() from anon';
    execute 'grant execute on function public.bootstrap() to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000007_finale_photo.sql =====
-- 終章照片：只存在資料庫（管理者上傳），生日當天之後才由 RPC 交給玩家
alter table public.finale_config add column if not exists photo text;

create or replace function public.finale_photo(p uuid) returns text
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.assert_finale_open(p);
  return (select photo from public.finale_config where id = 1);
end $$;
revoke all on function public.finale_photo(uuid) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.finale_photo(uuid) from anon';
    execute 'grant execute on function public.finale_photo(uuid) to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000008_gate_tasks.sql =====
-- 現實世界任務：需管理者審核通過才算完成的「關卡門檻」佐證（gate）
-- 截止前送出、尚待審核者保留準時資格。
create or replace function private.mark_missed(p uuid, d int, at_t timestamptz) returns void
language plpgsql as $$
declare l public.levels; pl public.player_levels; new_status text;
begin
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'COMPLETED' or pl.missed_at is not null then return; end if;
  -- 截止前已送出、仍在等待審核的「關卡門檻」佐證：保留準時資格，等待管理者審核
  if exists (select 1 from public.evidence e where e.profile_id = p and e.day = d and e.status = 'PENDING_REVIEW'
             and coalesce((e.payload ->> 'gate')::boolean, false) and e.submitted_at < at_t) then return; end if;
  -- 逾期：永久記錄，原路線進度封存，開啟替代路線（若有）
  new_status := case when l.alternate is not null then 'ALTERNATE' else 'MISSED' end;
  update public.player_levels
     set missed_at = at_t, status = new_status, variant = null,
         data = jsonb_build_object('done','{}'::jsonb,'attempts','{}'::jsonb,'hints','{}'::jsonb,
                                   'reveals','{}'::jsonb,'started','{}'::jsonb,'main_archive', pl.data)
   where profile_id = p and day = d;
  update public.evidence set status = 'OVERDUE'
   where profile_id = p and day = d and status = 'NEEDS_MORE';
  perform private.log(p, at_t, 'MISSED', d,
    jsonb_build_object('title', l.title, 'had_started', pl.started_at is not null, 'route', new_status));
  perform private.apply_effects(p, at_t, l.on_missed, d, 'missed:' || d);
  perform private.notify(p, at_t, 'MISSION_MISSED', 'MISSED:' || d, d,
    coalesce(l.on_missed #>> '{message,title}', '訊號中斷'),
    coalesce(l.on_missed #>> '{message,body}', '某個區域在你離開時關上了。紀錄已保存，但它不會再以原本的樣子出現。'));
end $$;

create or replace function public.submit_evidence(p uuid, d int, step_id text, kind text, path text, content text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; eid uuid; completion jsonb;
        last_status text;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  select * into l from public.levels where day = d;
  if pl.status in ('LOCKED', 'MISSED') then raise exception 'P030_NOT_PLAYABLE'; end if;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null or st ->> 'type' <> 'evidence' then raise exception 'P030_NO_SUCH_STEP'; end if;
  if not (st -> 'kinds') ? kind then raise exception 'P030_BAD_EVIDENCE_KIND'; end if;

  select e.status into last_status from public.evidence e
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status <> 'REPLACED'
   order by e.submitted_at desc limit 1;
  if pl.status = 'COMPLETED' and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_COMPLETED'; end if;
  if (pl.data -> 'done') ? step_id and coalesce(last_status, '') <> 'NEEDS_MORE' then raise exception 'P030_ALREADY_SUBMITTED'; end if;
  if not prior_ok and not ((pl.data -> 'done') ? step_id) then raise exception 'P030_STEP_ORDER'; end if;
  if coalesce((st ->> 'gate')::boolean, false) and coalesce(last_status, '') = 'PENDING_REVIEW' then raise exception 'P030_PENDING_REVIEW'; end if;

  if kind in ('photo', 'audio') then
    if path is null or split_part(path, '/', 1) <> p::text then raise exception 'P030_BAD_PATH'; end if;
  elsif kind = 'text' then
    if length(trim(coalesce(content, ''))) = 0 then raise exception 'P030_EMPTY_TEXT'; end if;
    path := null;
  end if;

  update public.evidence e set status = 'REPLACED'
   where e.profile_id = p and e.day = d and e.step_id = submit_evidence.step_id and e.status = 'NEEDS_MORE';
  insert into public.evidence (profile_id, day, step_id, kind, storage_path, text_content, status, on_time, submitted_at, payload)
  values (p, d, step_id, kind, path, left(content, 4000), 'PENDING_REVIEW', pl.missed_at is null, t,
          jsonb_build_object('gate', coalesce((st ->> 'gate')::boolean, false)))
  returning id into eid;
  perform private.log(p, t, 'EVIDENCE', d, jsonb_build_object('kind', kind, 'step', step_id, 'id', eid));
  -- 關卡門檻：要等管理者審核通過才算完成這一步
  if coalesce((st ->> 'gate')::boolean, false) then
    return jsonb_build_object('id', eid, 'status', 'PENDING_REVIEW', 'pending', true, 'completed', false);
  end if;
  if not ((pl.data -> 'done') ? step_id) then
    update public.player_levels set data = jsonb_set(data, array['done', step_id], to_jsonb(t)) where profile_id = p and day = d;
    completion := private.check_completion(p, d, t);
  end if;
  return jsonb_build_object('id', eid, 'status', 'PENDING_REVIEW', 'completed', completion is not null, 'completion', completion);
end $$;

create or replace function public.admin_review_evidence(eid uuid, new_status text, note text) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare e public.evidence; t timestamptz;
begin
  perform private.assert_admin();
  if new_status not in ('APPROVED', 'NEEDS_MORE', 'PENDING_REVIEW') then raise exception 'P030_BAD_STATUS'; end if;
  select * into e from public.evidence where id = eid for update;
  if e.id is null then raise exception 'P030_NOT_FOUND'; end if;
  t := private.game_now(e.profile_id);
  update public.evidence set status = new_status, review_note = note, reviewed_at = now(), reviewer = auth.uid() where id = eid;
  perform private.log(e.profile_id, t, 'REVIEW', e.day, jsonb_build_object('evidence', eid, 'status', new_status));
  -- 關卡門檻通過：以「送出時間」完成這一步，準時與否以送出時間判定
  if new_status = 'APPROVED' and coalesce((e.payload ->> 'gate')::boolean, false) then
    update public.player_levels set data = jsonb_set(data, array['done', e.step_id], to_jsonb(e.submitted_at))
     where profile_id = e.profile_id and day = e.day and status <> 'COMPLETED';
    perform private.check_completion(e.profile_id, e.day, e.submitted_at);
  end if;
  if new_status = 'NEEDS_MORE' and coalesce((e.payload ->> 'gate')::boolean, false) then
    perform private.refresh(e.profile_id);   -- 若已過截止時間，此時才判定錯過
  end if;
  if new_status = 'APPROVED' then
    insert into public.flags (profile_id, key, value, source, set_at) values (e.profile_id, 'evidence_ok:' || e.day, 'true', 'review', t)
    on conflict (profile_id, key) do update set value = 'true', set_at = excluded.set_at;
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':ok', e.day, '樣本比對完成',
      '你提交的紀錄已通過比對，已歸檔至第 ' || e.day || ' 區。');
  elsif new_status = 'NEEDS_MORE' then
    perform private.notify(e.profile_id, t, 'SPECIAL_EVENT', 'REVIEW:' || eid || ':more', e.day, '紀錄需要補充',
      coalesce(nullif(note, ''), '系統無法辨識這份紀錄。請在區域關閉前補充。'));
  end if;
  return to_jsonb(e) || jsonb_build_object('status', new_status);
end $$;

-- 第 1 區：時鐘改為現實世界同步任務
update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "emergency", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_wake", "type": "story", "text": ["本區電力異常。", "系統：「請先恢復電源。」"], "speaker": "SYSTEM"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}], "prompt": "撥動開關，然後拉下主閘。"}, {"id": "s_sample", "type": "story", "text": ["培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "系統：「樣本需要觀察。每天一次。觀察的方式，由你決定。」"], "speaker": "SYSTEM"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」完成今天的觀察，再回到這裡。"}, {"id": "s_log", "type": "evidence", "title": "觀察日誌 #001", "kinds": ["text"], "prompt": "用一句話記下今天你注意到的一件小事。任何事都可以。"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "這個房間的時間。"}], "prompt": "同步程序需要一份來自你世界的證據。", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;

-- ===== migrations/20261108000009_three_stages.sql =====
-- PROJECT 030 · 每日三關（第 1 關機關、第 2 關謎題、第 3 關現實任務）
-- 會保留你已自訂的第 3 區卡片提示（s_watch / s_note）與第 7 區卡片提示（s_scan 的 prompt）。

create or replace function public.submit_step(p uuid, d int, step_id text, answer jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare
  t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; sec jsonb;
  ok boolean := false; ans text; expected jsonb; att int; msg text; mode text; local_t time; s public.settings;
  cards jsonb; exp_order text; sel text; completion jsonb; reveal jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null then raise exception 'P030_NO_SUCH_STEP'; end if;
  if (pl.data -> 'done') ? step_id then return jsonb_build_object('correct', true, 'already', true); end if;
  if not prior_ok then raise exception 'P030_STEP_ORDER'; end if;

  -- 特定時段任務
  if st ? 'window' then
    s := private.settings();
    local_t := (t at time zone s.tz)::time;
    if local_t < (st #>> '{window,from}')::time or local_t > (st #>> '{window,to}')::time then
      return jsonb_build_object('correct', false, 'message', coalesce(st #>> '{window,closed_text}', '這個機關現在沒有反應。'));
    end if;
  end if;

  sec := l.secrets -> step_id;
  ans := answer ->> 'value';

  case st ->> 'type'
    when 'story', 'observe_hint', 'archive' then ok := true;
    when 'choice' then
      sel := answer ->> 'option';
      if not exists (select 1 from jsonb_array_elements(st -> 'options') o where o ->> 'id' = sel) then
        raise exception 'P030_BAD_OPTION';
      end if;
      ok := true;
      insert into public.flags (profile_id, key, value, source, set_at)
      values (p, 'choice:' || (st ->> 'flag'), to_jsonb(sel), 'day:' || d, t)
      on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
      insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
      values (p, d, step_id, 'choice', jsonb_build_object('option', sel), 'APPROVED', pl.missed_at is null, t);
      perform private.log(p, t, 'CHOICE', d, jsonb_build_object('flag', st ->> 'flag', 'option', sel));
    when 'ar' then
      if (answer ->> 'target') is not null and (answer ->> 'target')::int = (st ->> 'target')::int then
        ok := true; mode := 'scan';
      elsif (answer ->> 'code') is not null and coalesce((l.ar_fallback ->> step_id)::boolean, false)
            and private.norm(answer ->> 'code') = private.norm(sec ->> 'fallback') then
        ok := true; mode := 'fallback';
      elsif (answer ->> 'code') is not null and not coalesce((l.ar_fallback ->> step_id)::boolean, false) then
        raise exception 'P030_FALLBACK_DISABLED';
      end if;
      if ok then
        insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
        values (p, d, step_id, 'scan', jsonb_build_object('mode', mode, 'target', answer -> 'target'), 'APPROVED', pl.missed_at is null, t);
        perform private.log(p, t, 'SCAN', d, jsonb_build_object('mode', mode, 'target', answer -> 'target'));
      end if;
    when 'wait' then
      if pl.data #> array['started', step_id] is null then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'started', true, 'message', st ->> 'start_text');
      end if;
      ok := t >= (pl.data #>> array['started', step_id])::timestamptz + make_interval(secs => (st ->> 'seconds')::int);
      if not ok then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'message', coalesce(st ->> 'early_text', '太快了。重新開始等待。'));
      end if;
    when 'timeline' then
      cards := private.timeline_cards(p, coalesce((st ->> 'upto')::int, 8));
      select string_agg(c ->> 'id', ',' order by ord) into exp_order from jsonb_array_elements(cards) with ordinality x(c, ord);
      ok := private.norm(ans) = private.norm(exp_order);
    when 'observe' then
      ok := exists (select 1 from public.observations where profile_id = p and day = private.game_day(t));
      if not ok then return jsonb_build_object('correct', false, 'message', '培養艙尚未記錄今天的觀測。'); end if;
    when 'evidence' then
      raise exception 'P030_USE_SUBMIT_EVIDENCE';
    else
      expected := sec -> 'answer';
      if expected is null then raise exception 'P030_STEP_HAS_NO_ANSWER %', step_id; end if;
      -- 動態答案：$start_mmdd ＝ 第一天的月日（依設定的生日計算）
      if expected #>> '{}' = '$start_mmdd' then expected := to_jsonb(to_char(private.start_date(), 'MMDD')); end if;
      if jsonb_typeof(expected) = 'array' then
        ok := exists (select 1 from jsonb_array_elements_text(expected) e where private.norm(e) = private.norm(ans));
      else
        ok := private.norm(expected #>> '{}') = private.norm(ans);
      end if;
  end case;

  if not ok then
    att := coalesce((pl.data #>> array['attempts', step_id])::int, 0) + 1;
    update public.player_levels set data = jsonb_set(data, array['attempts', step_id], to_jsonb(att)) where profile_id = p and day = d;
    msg := coalesce(sec ->> 'wrong', '沒有反應。');
    return jsonb_build_object('correct', false, 'attempts', att, 'message', msg);
  end if;

  reveal := sec -> 'reveal';
  update public.player_levels
     set data = jsonb_set(jsonb_set(data, array['done', step_id], to_jsonb(t)), array['reveals', step_id], coalesce(reveal, 'null'))
   where profile_id = p and day = d;
  perform private.apply_effects(p, t, sec -> 'grant', d, 'step:' || d || ':' || step_id);
  completion := private.check_completion(p, d, t);
  return jsonb_build_object('correct', true, 'reveal', reveal, 'success_text', sec ->> 'success',
                            'completed', completion is not null, 'completion', completion, 'mode', mode);
end $$;

create or replace function private.p030_keep(old_steps jsonb, new_steps jsonb, ids text[], keys text[]) returns jsonb
language sql immutable as $$
  select coalesce(jsonb_agg(
    case when n ->> 'id' = any(ids) and exists (select 1 from jsonb_array_elements(old_steps) o where o ->> 'id' = n ->> 'id')
         then n || (select coalesce(jsonb_object_agg(k, o -> k), '{}') from jsonb_array_elements(old_steps) o, unnest(keys) k where o ->> 'id' = n ->> 'id' and o ? k)
         else n end order by ord), '[]')
  from jsonb_array_elements(new_steps) with ordinality x(n, ord);
$$;

update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "emergency", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_wake", "type": "story", "text": ["本區電力異常。", "系統：「請先恢復電源。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "配電箱"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "stage": 1, "stage_title": "配電箱", "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}], "prompt": "撥動開關，然後拉下主閘。"}, {"id": "s_boot_intro", "type": "story", "text": ["燈亮了。培養艙的面板跳出一行字：", "「啟動碼 ＝ 通電的位置，全部相乘。」"], "stage": 2, "stage_title": "培養艙啟動"}, {"id": "s_boot", "type": "keypad", "title": "培養艙啟動碼", "length": 3, "stage": 2, "stage_title": "培養艙啟動", "prompt": "輸入三位數啟動碼。"}, {"id": "s_sample", "type": "story", "text": ["培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "培養艙啟動"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」選一種方式觀察它，再回到這裡。", "stage": 2, "stage_title": "培養艙啟動"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "時間同步"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "時間同步", "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "這個房間的時間。"}], "prompt": "同步程序需要一份來自你世界的證據。", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = secrets || '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "s_boot": {"answer": "030", "hints": ["通電的位置是 2、3、5。", "2 × 3 × 5 ＝ ？（三位數，前面補 0）"], "success": "培養艙發出低鳴。", "wrong": "面板：「啟動碼錯誤。」"}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;
update public.levels set config = '{"notify": {"new": "一段不明訊號正在重複播放。來源：第 02 區。", "pending": "訊號仍在等待回應。", "expiring": "頻道將於午夜關閉。"}, "scene": {"theme": "radio", "light": "on", "props": ["radio", "antenna", "desk", "window"], "hotspots": [{"id": "drawer", "x": 76, "y": 80, "label": "抽屜"}]}, "variants": [{"id": "dim", "when": {"flag": "lab_dark"}, "scene": {"light": "dim"}, "intro": ["接入室沒有恢復電力，這裡的燈也比應該的暗。", "收音機靠電池運轉。"]}], "intro": ["收音機自己開著。", "只有雜訊。"], "steps": [{"id": "s_intro", "type": "story", "text": ["收音機自己開著，只有雜訊。", "系統：「請找出訊號源的頻率。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "調頻"}, {"id": "s_tune", "type": "dial", "title": "調頻", "dials": 4, "format": "###.#", "stage": 1, "stage_title": "調頻", "clue": [{"type": "log", "lines": ["廣播紀錄 23:10 —— 收到片段訊號", "附註：訊號是倒著傳來的。", "內容：「7.301」"]}], "prompt": "轉動旋鈕，對準頻率。"}, {"id": "s_frag", "type": "story", "text": ["雜訊退去，訊號斷成了四段。", "系統：「請依正確順序重組訊號。」"], "stage": 2, "stage_title": "訊號重組"}, {"id": "s_order", "type": "sequence", "title": "訊號重組", "pick": 4, "render": "box", "stage": 2, "stage_title": "訊號重組", "items": [{"id": "c", "label": "每天"}, {"id": "a", "label": "訊號源"}, {"id": "d", "label": "自己響起"}, {"id": "b", "label": "在你的世界"}], "clue": [{"type": "note", "text": "訊號開頭是「訊號源」，結尾是一個動作。"}], "prompt": "依序點選四段訊號。"}, {"id": "s_decoded", "type": "story", "text": ["重組後的訊號：", "「訊號源・在你的世界・每天・自己響起。」"], "speaker": "SIGNAL", "stage": 3, "stage_title": "訊號源"}, {"id": "s_record", "type": "evidence", "title": "訊號源", "kinds": ["audio"], "gate": true, "stage": 3, "stage_title": "訊號源", "prompt": "收音機需要一段來自訊號源的聲音。", "pending_text": "聲音已送出。觀察站正在比對頻率……"}, {"id": "s_watcher", "type": "story", "text": ["門口站著一個人，穿著舊式的值班外套。", "「你也收到訊號了？」", "「我是這裡的守夜人。我們明天見。」"], "speaker": "守夜人", "when": {"not": {"flag": "lab_dark"}}, "stage": 3, "stage_title": "訊號源"}, {"id": "s_watcher_dark", "type": "story", "text": ["走廊的另一端有手電筒的光晃了一下。", "「……這裡太暗了，」有人說。「明天吧。」"], "speaker": "？", "when": {"flag": "lab_dark"}, "stage": 3, "stage_title": "訊號源"}], "epilogue": ["頻率已鎖定。", "你取得了第二個符號。"]}'::jsonb, secrets = secrets || '{"s_tune": {"answer": "1037", "hints": ["紀錄說訊號是倒著傳來的。", "把「7.301」倒過來讀。"], "success": "雜訊消失了。", "wrong": "只有雜訊。"}, "hotspots": {"drawer": {"text": "抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。", "grant": {"items": [{"key": "freq_table", "name": "頻率表", "desc": "「030.0 —— 不要調到這裡」。", "data": {"hidden": true}}]}}}, "s_order": {"answer": "a,b,c,d", "hints": ["第一段是「訊號源」。", "訊號源 → 在你的世界 → 每天 → 自己響起"], "success": "訊號變得清晰。", "wrong": "訊號又亂了。"}, "s_record": {"hints": ["你的世界裡，有什麼東西每天會自己發出聲音？", "鬧鐘、微波爐的「叮」、熱水壺、洗衣機……", "錄下任何一個會自己響起的聲音上傳。"]}, "a_note": {"answer": ["等待訊號"], "hints": ["看每一行的第一個字。"], "success": "紙條背面寫著：「我會再回來。」", "wrong": "好像不是這樣讀的。"}}'::jsonb, updated_at = now() where day = 2;
update public.levels set config = jsonb_set('{"notify": {"new": "第 03 區偵測到一個實體投影。它在你的世界裡。", "pending": "投影卡尚未被掃描。", "expiring": "投影將於午夜失效。"}, "scene": {"theme": "vault", "light": "on", "props": ["safe", "shelf", "desk"], "hotspots": []}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}}, {"id": "note", "when": {"flag": "watcher_left"}, "scene": {"npc": "note"}}], "intro": ["房間中央有一個保險箱，但它不是真的在這裡。", "系統：「保險箱的實體投影卡已放置於現實世界。」"], "steps": [{"id": "s_watch", "type": "story", "text": ["守夜人：「卡片是我放的。提示我只說一次——」", "「找一個你每天都會打開，卻很少注意它的地方。」"], "speaker": "守夜人", "when": {"flag": "watcher_met"}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_note", "type": "story", "text": ["桌上壓著一張紙條：", "「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"], "when": {"not": {"flag": "watcher_met"}}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_scan", "type": "ar", "title": "掃描投影卡 A", "target": 0, "card": "A", "overlay": "safe", "prompt": "找到實體卡片 A，用相機對準它。", "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_open", "type": "keypad", "title": "保險箱轉盤", "length": 3, "prompt": "輸入保險箱的密碼。", "stage": 2, "stage_title": "保險箱"}, {"id": "s_inside", "type": "story", "text": ["保險箱裡只有一張舊照片。", "照片背面寫著：「第 7 天，再用一次。」", "照片的角落，有一行很小的字：「座標未確認」。"], "stage": 2, "stage_title": "保險箱"}, {"id": "s_coord", "type": "evidence", "title": "座標確認", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "座標確認", "prompt": "系統需要確認投影卡的原始座標。", "pending_text": "座標資料已送出。觀察站正在比對……"}], "epilogue": ["保險箱已歸檔。", "你取得了第三個符號，以及一張照片。"]}'::jsonb, '{steps}', private.p030_keep(config -> 'steps', '[{"id": "s_watch", "type": "story", "text": ["守夜人：「卡片是我放的。提示我只說一次——」", "「找一個你每天都會打開，卻很少注意它的地方。」"], "speaker": "守夜人", "when": {"flag": "watcher_met"}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_note", "type": "story", "text": ["桌上壓著一張紙條：", "「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"], "when": {"not": {"flag": "watcher_met"}}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_scan", "type": "ar", "title": "掃描投影卡 A", "target": 0, "card": "A", "overlay": "safe", "prompt": "找到實體卡片 A，用相機對準它。", "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_open", "type": "keypad", "title": "保險箱轉盤", "length": 3, "prompt": "輸入保險箱的密碼。", "stage": 2, "stage_title": "保險箱"}, {"id": "s_inside", "type": "story", "text": ["保險箱裡只有一張舊照片。", "照片背面寫著：「第 7 天，再用一次。」", "照片的角落，有一行很小的字：「座標未確認」。"], "stage": 2, "stage_title": "保險箱"}, {"id": "s_coord", "type": "evidence", "title": "座標確認", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "座標確認", "prompt": "系統需要確認投影卡的原始座標。", "pending_text": "座標資料已送出。觀察站正在比對……"}]'::jsonb, array['s_watch','s_note'], array['text'])), secrets = secrets || '{"s_scan": {"fallback": "VAULT-A", "reveal": {"overlay": "safe", "digits": "418"}, "success": "卡片上方浮現一個保險箱。"}, "s_open": {"answer": "418", "hints": ["數字只出現在投影的保險箱上。"], "success": "咔。", "wrong": "轉盤卡住了。"}, "s_coord": {"hints": ["投影卡是在哪裡找到的？", "回到那個地方。", "拍一張「找到卡片的那個位置」上傳。"]}, "a_key": {"answer": "31412", "hints": ["由左到右，數一數每個齒的高度。"], "success": "吻合。"}}'::jsonb, updated_at = now() where day = 3;
update public.levels set config = '{"notify": {"new": "第 04 區的鏡面開始反射不存在的光。", "pending": "鏡子裡的燈還亮著。", "expiring": "鏡廳將於午夜熄燈。"}, "scene": {"theme": "mirror", "light": "on", "props": ["mirror", "mirror2", "lamp"], "hotspots": []}, "variants": [{"id": "cracked", "when": {"stat": "missed", "gte": 2}, "scene": {"props": ["mirror_cracked", "mirror2", "lamp"]}, "intro": ["這裡的鏡子有一面裂了。", "裂痕剛好穿過鏡子裡你的位置。"]}], "intro": ["這裡的每一面鏡子都比房間大。", "鏡子裡的房間，比外面多了一盞燈。"], "steps": [{"id": "s_mirror", "type": "keypad", "title": "鏡中數字", "length": 4, "stage": 1, "stage_title": "鏡中數字", "clue": [{"type": "mirror", "text": "8031", "caption": "這組數字只出現在鏡子裡。"}], "prompt": "它在現實中應該是什麼？"}, {"id": "s_clock_intro", "type": "story", "text": ["第二面鏡子裡，掛著一個時鐘。", "但這個房間裡，沒有任何時鐘。"], "stage": 2, "stage_title": "鏡中時鐘"}, {"id": "s_mclock", "type": "keypad", "title": "鏡中時鐘", "length": 4, "stage": 2, "stage_title": "鏡中時鐘", "clue": [{"type": "clock", "h": 2, "m": 15, "mirror": true, "caption": "鏡子裡的時鐘。"}], "prompt": "真正的時間是幾點幾分？（四位數）"}, {"id": "s_photo", "type": "evidence", "title": "另一邊", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "另一邊", "prompt": "鏡廳需要一張「另一邊」的你。", "pending_text": "影像已送出。鏡面正在校正……"}, {"id": "s_letter", "type": "story", "text": ["鏡子後方滑出一個信封。", "封面寫著：影像校正邀請函。", "「請決定，影像中的你應該是什麼樣子。」"], "stage": 3, "stage_title": "另一邊"}], "epilogue": ["鏡廳已歸檔。", "一封邀請函已送達「禮物」頁。"]}'::jsonb, secrets = secrets || '{"s_mirror": {"answer": "8031", "hints": ["鏡子會左右顛倒。", "從右往左讀，並把每個數字翻回來。"], "success": "鏡子裡的燈閃了一下。", "wrong": "鏡面沒有反應。"}, "s_mclock": {"answer": ["0215", "1415"], "hints": ["鏡子會左右顛倒。", "把時鐘左右翻回來再讀。", "分針在 3 的位置是 15 分。"], "success": "鏡中的秒針開始走動。", "wrong": "鏡面沒有反應。"}, "s_photo": {"hints": ["鏡子有兩邊。", "拍一張有你倒影的照片——鏡子、窗戶、水面都可以。", "對著鏡子，拍下你自己的倒影上傳。"]}, "a_shards": {"answer": "0000", "success": "影像完整了。"}}'::jsonb, updated_at = now() where day = 4;
update public.levels set config = '{"notify": {"new": "第 05 區的濕度上升。有東西在生長。", "pending": "溫室裡的植物還沒有被照顧。", "expiring": "溫室的燈將於午夜關閉。"}, "scene": {"theme": "greenhouse", "light": "on", "props": ["plants", "incubator", "window"], "hotspots": [{"id": "roots", "x": 82, "y": 84, "label": "根部"}, {"id": "vines", "x": 10, "y": 40, "label": "藤蔓後面", "when": {"stat": "exploration", "gte": 2}}]}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}, "intro": ["守夜人在澆水。", "「它們不是同一天種的，」他說，「所以不會同一天開。」"]}], "intro": ["溫室裡的植物都不是同一天種下的。", "培養艙被移到了這裡。"], "steps": [{"id": "s_order", "type": "sequence", "title": "澆水順序", "pick": 5, "render": "plant", "stage": 1, "stage_title": "澆水順序", "items": [{"id": "c", "stage": 3}, {"id": "a", "stage": 1}, {"id": "e", "stage": 5}, {"id": "b", "stage": 2}, {"id": "d", "stage": 4}], "clue": [{"type": "note", "text": "澆水紀錄：「從最晚種下的開始。」"}], "prompt": "依序點選植物。"}, {"id": "s_drops", "type": "keypad", "title": "灌溉計時器", "length": 2, "stage": 2, "stage_title": "灌溉計時器", "clue": [{"type": "note", "text": "灌溉紀錄：\nⅠ號：3 滴\nⅡ號：Ⅰ號的兩倍\nⅢ號：比Ⅱ號少 1 滴\nⅣ號：和Ⅰ號一樣\n\n「總共要給幾滴？」"}], "prompt": "輸入總滴數。"}, {"id": "s_night", "type": "story", "optional": true, "title": "夜間花苞", "text": ["花苞在夜裡打開了。", "裡面是一顆很小的、發著光的種子。"], "window": {"from": "21:00", "to": "23:59:59", "closed_text": "花苞緊閉著。也許要等到夜裡（21:00 後）。"}, "stage": 2, "stage_title": "灌溉計時器"}, {"id": "s_photo", "type": "evidence", "title": "生長樣本", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "生長樣本", "prompt": "溫室需要一份「正在長大」的樣本。", "pending_text": "樣本已送出。溫室正在比對生長紀錄……"}], "epilogue": ["溫室已歸檔。", "你取得了第五個符號。"]}'::jsonb, secrets = secrets || '{"s_order": {"answer": "a,b,c,d,e", "hints": ["最晚種下的，現在長得最小。"], "success": "水流過每一株植物。", "wrong": "有一株植物垂下了葉子。"}, "s_night": {"grant": {"items": [{"key": "night_seed", "name": "夜開的種子", "desc": "只在夜裡發光。", "data": {"hidden": true}}]}}, "hotspots": {"roots": {"text": "根部纏著一張標籤：「不是每一株都需要被看見。」", "grant": {"items": [{"key": "root_tag", "name": "根部標籤", "desc": "不是每一株都需要被看見。", "data": {"hidden": true}}]}}, "vines": {"text": "藤蔓後面有一間更小的溫室。裡面只種了一株，還沒發芽。", "grant": {"items": [{"key": "hidden_greenhouse", "name": "隱藏溫室的土", "desc": "還沒發芽。", "data": {"hidden": true}}]}}}, "s_drops": {"answer": "17", "hints": ["先算出每一號各是幾滴。", "3、6、5、3。"], "success": "水流過每一株植物。", "wrong": "有一株植物垂下了葉子。"}, "s_photo": {"hints": ["你的世界裡，有什麼東西每天都在悄悄長大？", "植物、寵物、指甲、頭髮……任何正在生長的都可以。", "拍一株植物最新長出的葉子上傳。"]}, "a_valves": {"answer": "10110", "success": "水滲進土裡。"}}'::jsonb, updated_at = now() where day = 5;
update public.levels set config = '{"notify": {"new": "異常：第 01 區的紀錄出現在第 06 區。", "pending": "斷層仍在擴大。", "expiring": "斷層將於午夜固定成形。"}, "scene": {"theme": "fault", "light": "flicker", "props": ["crack", "terminal"], "hotspots": []}, "intro": ["系統錯誤。", "有些紀錄出現在不該出現的地方。"], "steps": [{"id": "s_glitch", "type": "story", "title": "損壞的紀錄", "inject_evidence_day": 1, "text": ["第 01 區的紀錄出現在這裡，但已經損壞："], "stage": 1, "stage_title": "重建斷層"}, {"id": "s_lock", "type": "symbols", "title": "重建斷層", "slots": 4, "stage": 1, "stage_title": "重建斷層", "clue": [{"type": "log", "lines": ["損壞的時間戳：", "D01 ▒▒ D02 ▒▒ D02 ▒▒ D01", "「把最早的兩個訊號，依時間戳放回去。」"]}], "prompt": "從你持有的符號中依序放入。"}, {"id": "s_depth", "type": "keypad", "title": "斷層深度", "length": 2, "stage": 2, "stage_title": "斷層深度", "clue": [{"type": "log", "lines": ["斷層深度 ＝ 最早兩個符號的頻率，", "依取得的順序排列。"]}], "prompt": "輸入斷層深度。"}, {"id": "s_choice", "type": "choice", "title": "修復", "flag": "fault", "stage": 2, "stage_title": "斷層深度", "text": ["斷層中有一段紀錄可以修復。", "但修復它，會覆寫較近的一段。"], "options": [{"id": "repair", "label": "修復最早的紀錄", "desc": "裂縫會闔上，另一段會被覆寫。"}, {"id": "keep", "label": "保留裂縫", "desc": "兩段紀錄都留下，裂縫不會消失。"}]}, {"id": "s_mended", "type": "evidence", "title": "修補過的東西", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "修補過的東西", "prompt": "斷層需要一個「修補過」的東西作為參照。", "pending_text": "參照物已送出。斷層正在比對……"}], "epilogue": ["斷層已固定。", "你取得了第六個符號。"]}'::jsonb, secrets = secrets || '{"s_lock": {"answer": "sym1,sym2,sym2,sym1", "hints": ["你最早取得的兩個符號，分別來自第 1 天和第 2 天。", "在「物品」查看每個符號的來源日。"], "success": "裂縫停止擴大。", "wrong": "斷層發出刺耳的聲音。"}, "s_depth": {"answer": "30", "hints": ["在「物品」裡，每個符號都有頻率數字。", "「起」的頻率是 3，「聲」的頻率是 0。"], "success": "斷層停止下沉。", "wrong": "深度不符。"}, "s_mended": {"hints": ["你身邊有沒有什麼東西，壞過，又被修好？", "黏過的杯子、補過的衣服、貼著膠帶的東西……", "拍一個曾經壞掉、又被修好的東西上傳。"]}, "a_lock": {"answer": "sym2,sym1,sym1,sym2", "hints": ["第 1 天和第 2 天的符號——即使只是殘響——也算。"], "success": "裂縫裡的紀錄安靜下來。"}}'::jsonb, updated_at = now() where day = 6;
update public.levels set config = jsonb_set('{"notify": {"new": "第 07 區出現了一扇門。它只在今天存在。", "pending": "那扇門仍然關著。", "expiring": "門將於午夜消失。"}, "scene": {"theme": "gate", "light": "on", "props": ["gate", "pillars"], "hotspots": [{"id": "photo_slot", "x": 50, "y": 46, "label": "門上的凹槽", "when": {"item": "photo_old"}}, {"id": "side_room", "x": 88, "y": 60, "label": "柱子後方", "when": {"stat": "exploration", "gte": 2}}]}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}, "intro": ["守夜人站在門邊。", "「我等這扇門很久了，」他說。「但它不是為我開的。」"]}], "intro": ["一扇門，沒有門把。", "門的另一面，有一張投影卡在等你。"], "steps": [{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——比這扇小。", "那扇門沒有影像。系統：「請提供參照。」"], "stage": 3, "stage_title": "最後一扇門"}, {"id": "s_door", "type": "evidence", "title": "最後一扇門", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "最後一扇門", "prompt": "門後還有一扇門。它在你的世界裡。", "pending_text": "參照已送出。門正在辨識……"}], "epilogue": ["門已歸檔。", "你取得了第七個符號。"]}'::jsonb, '{steps}', private.p030_keep(config -> 'steps', '[{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——比這扇小。", "那扇門沒有影像。系統：「請提供參照。」"], "stage": 3, "stage_title": "最後一扇門"}, {"id": "s_door", "type": "evidence", "title": "最後一扇門", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "最後一扇門", "prompt": "門後還有一扇門。它在你的世界裡。", "pending_text": "參照已送出。門正在辨識……"}]'::jsonb, array['s_scan'], array['prompt'])), secrets = secrets || '{"s_scan": {"fallback": "GATE-B", "reveal": {"overlay": "totem", "glyphs": [4, 5, 6]}, "success": "卡片上方浮現一座圖騰。"}, "s_rings": {"answer": "4,5,6", "hints": ["答案只出現在 AR 圖騰上。"], "success": "門環依序歸位。", "wrong": "門環彈回原位。"}, "hotspots": {"photo_slot": {"text": "照片嵌進凹槽剛剛好。門內傳來機械聲。", "grant": {"flags": {"photo_used": true}, "items": [{"key": "gate_mark", "name": "門的刻痕", "desc": "你在第 3 天拿到的東西，在第 7 天被用上了。", "data": {"hidden": true}}]}}, "side_room": {"text": "柱子後方有一間沒有標示的小房間。牆上有一張地圖的一角。", "grant": {"items": [{"key": "map_fragment", "name": "地圖殘片", "desc": "標示著一個不在這十個區域裡的位置。", "data": {"hidden": true}}]}}}, "s_door": {"hints": ["你每天都會經過很多扇門。", "有一扇門，你每天都開，卻很少真正看它。", "拍下你家大門（從裡面看出去）上傳。"]}, "a_peek": {"answer": "7291", "success": "牆後有東西動了。"}}'::jsonb, updated_at = now() where day = 7;
update public.levels set config = '{"notify": {"new": "第 08 區要求一個選擇。", "pending": "岔路仍在等待你的回覆。", "expiring": "若午夜前沒有回覆，系統將代為選擇。"}, "scene": {"theme": "fork", "light": "on", "props": ["door_left", "door_right"], "hotspots": []}, "variants": [{"id": "third", "when": {"stat": "missed", "gte": 2}, "scene": {"props": ["door_left", "door_mid", "door_right"]}, "intro": ["兩扇門之間，出現了第三扇。", "它沒有名字。"], "steps": [{"id": "s_intro", "type": "story", "text": ["左邊寫著「保存」，右邊寫著「放手」。", "中間那扇門什麼也沒寫。"], "stage": 1, "stage_title": "選擇"}, {"id": "s_door", "type": "choice", "title": "選一扇門", "flag": "fork", "text": ["系統：「只能選一扇。」"], "stage": 1, "stage_title": "選擇", "options": [{"id": "keep", "label": "保存", "desc": ""}, {"id": "stay", "label": "（沒有名字的門）", "desc": ""}, {"id": "release", "label": "放手", "desc": ""}]}, {"id": "s_keep", "type": "sequence", "title": "整理檔案", "pick": 4, "render": "box", "when": {"flag": "choice:fork", "eq": "keep"}, "stage": 2, "stage_title": "門後", "items": [{"id": "b", "label": "▮▮▮"}, {"id": "d", "label": "▮"}, {"id": "a", "label": "▮▮▮▮"}, {"id": "c", "label": "▮▮"}], "prompt": "從最厚的開始，把檔案放回架上。"}, {"id": "s_release", "type": "switches", "title": "熄燈", "count": 5, "labels": ["01", "02", "03", "04", "05"], "when": {"flag": "choice:fork", "eq": "release"}, "stage": 2, "stage_title": "門後", "clue": [{"type": "note", "text": "「只留下你最早點亮的那一盞。」"}], "prompt": "關掉其他的燈。", "initial": "11111"}, {"id": "s_stay", "type": "wait", "title": "停留", "seconds": 30, "when": {"flag": "choice:fork", "eq": "stay"}, "stage": 2, "stage_title": "門後", "start_text": "系統開始計時。請不要離開這個畫面。", "early_text": "你離開得太早了。計時重新開始。", "prompt": "什麼都不用做。停留 30 秒。"}, {"id": "s_voice", "type": "evidence", "title": "沒有走的那條路", "kinds": ["audio"], "gate": true, "stage": 3, "stage_title": "另一端", "prompt": "岔路的另一端，需要你的聲音。", "pending_text": "聲音已送出。岔路正在記錄……"}]}], "intro": ["兩扇門。", "左邊寫著「保存」，右邊寫著「放手」。"], "steps": [{"id": "s_door", "type": "choice", "title": "選一扇門", "flag": "fork", "text": ["系統：「只能選一扇。」"], "stage": 1, "stage_title": "選擇", "options": [{"id": "keep", "label": "保存", "desc": ""}, {"id": "release", "label": "放手", "desc": ""}]}, {"id": "s_keep", "type": "sequence", "title": "整理檔案", "pick": 4, "render": "box", "when": {"flag": "choice:fork", "eq": "keep"}, "stage": 2, "stage_title": "門後", "items": [{"id": "b", "label": "▮▮▮"}, {"id": "d", "label": "▮"}, {"id": "a", "label": "▮▮▮▮"}, {"id": "c", "label": "▮▮"}], "prompt": "從最厚的開始，把檔案放回架上。"}, {"id": "s_release", "type": "switches", "title": "熄燈", "count": 5, "labels": ["01", "02", "03", "04", "05"], "when": {"flag": "choice:fork", "eq": "release"}, "stage": 2, "stage_title": "門後", "clue": [{"type": "note", "text": "「只留下你最早點亮的那一盞。」"}], "prompt": "關掉其他的燈。", "initial": "11111"}, {"id": "s_voice", "type": "evidence", "title": "沒有走的那條路", "kinds": ["audio"], "gate": true, "stage": 3, "stage_title": "另一端", "prompt": "岔路的另一端，需要你的聲音。", "pending_text": "聲音已送出。岔路正在記錄……"}], "epilogue": ["岔路已歸檔。", "另一扇門並沒有消失。只是你沒有走進去。"]}'::jsonb, secrets = secrets || '{"s_keep": {"answer": "a,b,c,d", "success": "架子滿了。"}, "s_release": {"answer": "10000", "hints": ["你最早點亮的燈，在第 1 天。"], "success": "只剩一盞燈。它很亮。"}, "s_voice": {"hints": ["那扇你沒有選的門後面，是一段沒有被記錄的事。", "說說看：一件你曾經錯過、但後來仍然記得的小事。", "錄一段聲音，說出那件事。"]}, "a_relay": {"answer": "1001", "success": "繼電器發出喀的一聲。"}}'::jsonb, updated_at = now() where day = 8;
update public.levels set config = '{"notify": {"new": "第 09 區的投影機開始轉動。它播放的是你的紀錄。", "pending": "回放仍在等待排序。", "expiring": "回放將於午夜停止。這一段不會被保存。"}, "scene": {"theme": "playback", "light": "dim", "props": ["projector", "screen"], "hotspots": []}, "intro": ["投影機開始轉動。", "它播放的，是這幾天被保存下來的東西——沒有日期，順序亂了。"], "steps": [{"id": "s_timeline", "type": "timeline", "title": "排列片段", "upto": 8, "prompt": "依照發生的順序排列這些片段。空白的片段也有它的位置。", "stage": 1, "stage_title": "排列片段"}, {"id": "s_stop", "type": "story", "text": ["投影機在最後一格停住了。", "畫面角落印著一行字：「紀錄起始日」。"], "stage": 2, "stage_title": "起始日"}, {"id": "s_date", "type": "keypad", "title": "紀錄起始日", "length": 4, "prompt": "輸入第一個片段浮上海面的日期（月日，四位數）。", "stage": 2, "stage_title": "起始日"}, {"id": "s_voice", "type": "evidence", "title": "最後一段", "kinds": ["audio"], "gate": true, "stage": 3, "stage_title": "最後一段", "prompt": "回放缺少最後一段：現在的你。", "pending_text": "聲音已送出。投影機正在寫入……"}], "epilogue": ["回放結束。", "你取得了第九個符號。它是空白的。"]}'::jsonb, secrets = secrets || '{"s_timeline": {"hints": ["照片、聲音、文字與符號，都和你那一天做過的事有關。", "空白的片段，代表那一天的原路線沒有被走完。"], "wrong": "影像跳動了一下。順序不對。"}, "s_date": {"answer": "$start_mmdd", "hints": ["你第一次接入的那一天。", "看「紀錄」頁最早的一筆事件。"], "success": "投影機重新轉動。", "wrong": "日期不符。"}, "s_voice": {"hints": ["投影機也可以錄音。", "對它說一句話——給十天前剛接入時的自己。", "錄一段聲音，對十天前的自己說一句話。"]}}'::jsonb, updated_at = now() where day = 9;
update public.levels set config = '{"notify": {"new": "最後一個區域。所有符號正在共鳴。", "pending": "核心尚未被校準。", "expiring": "核心將於午夜冷卻。"}, "scene": {"theme": "core", "light": "on", "props": ["core", "pillars"], "hotspots": []}, "variants": [{"id": "steady", "when": {"stat": "max_streak", "gte": 5}, "scene": {"pulse": "steady"}, "intro": ["核心的脈動很規律。", "和培養艙裡的某個東西同步。"]}, {"id": "drift", "when": {"stat": "breaks", "gte": 2}, "scene": {"pulse": "irregular"}, "intro": ["核心的脈動時快時慢。", "像是在等什麼人回來。"]}], "intro": ["所有的符號同時發出聲音。", "每一個符號都有自己的頻率。"], "steps": [{"id": "s_code", "type": "keypad", "title": "核心頻率", "length": 5, "stage": 1, "stage_title": "核心頻率", "clue": [{"type": "glyphs", "ids": [6, 2, 1, 2, 7], "caption": "核心上刻著五個符號。"}], "prompt": "輸入核心的頻率。"}, {"id": "s_ring", "type": "story", "text": ["五個頻率疊在一起，形成一個環。", "環的中央浮現三個空格：「顯示真正的編號」。"], "stage": 2, "stage_title": "真正的編號"}, {"id": "s_number", "type": "symbols", "title": "真正的編號", "slots": 3, "stage": 2, "stage_title": "真正的編號", "clue": [{"type": "log", "lines": ["「讓核心顯示它真正的編號。」", "用符號的頻率拼出來。"]}], "prompt": "放入三個符號。"}, {"id": "s_last", "type": "choice", "title": "最後的設定", "flag": "core", "text": ["系統：「十個區域的紀錄即將封存。」"], "stage": 3, "stage_title": "最後一樣東西", "options": [{"id": "seal", "label": "封存所有紀錄", "desc": ""}, {"id": "open", "label": "讓紀錄繼續寫下去", "desc": ""}]}, {"id": "s_keepsake", "type": "evidence", "title": "最後一樣東西", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "最後一樣東西", "prompt": "核心封存前，可以放進最後一樣東西。", "pending_text": "已送出。核心正在接收……"}], "epilogue": ["所有區域已歸檔。", "明天，第030號檔案室將會開啟。"]}'::jsonb, secrets = secrets || '{"s_code": {"answer": "40306", "hints": ["每個符號在「物品」頁都有一個頻率數字。", "裂＝4、聲＝0、起＝3、門＝6。"], "success": "核心開始旋轉。", "wrong": "頻率不符。"}, "s_number": {"answer": "sym2,sym1,sym2", "hints": ["檔案的編號是 030。", "頻率 0 是「聲」，頻率 3 是「起」。"], "success": "核心顯示：030。", "wrong": "編號不符。"}, "s_keepsake": {"hints": ["那是一樣你現在擁有、而且想一直留著的東西。", "可以是物品、一個地方，或一個人（經過對方同意）。", "拍下一樣你想帶進三十歲的東西上傳。"]}, "a_code": {"answer": "60304", "hints": ["每個符號在「物品」頁都有一個頻率數字。"], "success": "核心微微發光。"}}'::jsonb, updated_at = now() where day = 10;

select '每日三關已更新' as status, count(*) from public.levels;

-- ===== migrations/20261108000010_player_profile.sql =====
-- 壽星資料：後台只需設定「名字」與「生日」
-- 登入：輸入生日月日（MMDD）＝ observer@p030.game 的密碼 p030-MMDD（由伺服器自動設定）
alter table public.settings add column if not exists player_name text not null default '觀察員';

create or replace function public.admin_set_player(p_name text, p_birthday date) returns jsonb
language plpgsql security definer set search_path = public, private, extensions, auth as $$
declare uid uuid; pw text; em text := 'observer@p030.game';
begin
  perform private.assert_admin();
  if p_birthday is null then raise exception 'P030_BIRTHDAY_REQUIRED'; end if;
  update public.settings set player_name = coalesce(nullif(trim(p_name), ''), '觀察員'), birthday = p_birthday, updated_at = now() where id = 1;
  pw := 'p030-' || to_char(p_birthday, 'MMDD');
  select id into uid from auth.users where lower(email) = em limit 1;
  if uid is null then
    uid := gen_random_uuid();
    insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
                            raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
                            confirmation_token, recovery_token, email_change_token_new, email_change)
    values ('00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', em,
            crypt(pw, gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');
  else
    update auth.users set encrypted_password = crypt(pw, gen_salt('bf')), email_confirmed_at = coalesce(email_confirmed_at, now()), updated_at = now()
     where id = uid;
  end if;
  if not exists (select 1 from auth.identities where user_id = uid and provider = 'email') then
    insert into auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values (gen_random_uuid(), uid::text, uid, jsonb_build_object('sub', uid::text, 'email', em, 'email_verified', true), 'email', now(), now(), now());
  end if;
  insert into public.allowed_players (email, note) values (em, '壽星') on conflict do nothing;
  return jsonb_build_object('player_name', (select player_name from public.settings where id = 1),
                            'birthday', p_birthday, 'login_code', to_char(p_birthday, 'MMDD'),
                            'start_date', p_birthday - 10);
end $$;

-- 重置壽星進度：刪除正式檔案，下次登入自動建立全新的一份（帳號與生日不變）
create or replace function public.admin_reset_player() returns int
language plpgsql security definer set search_path = public, private as $$
declare n int;
begin
  perform private.assert_admin();
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles where not is_test
     and user_id in (select id from auth.users where lower(email) = 'observer@p030.game');
  get diagnostics n = row_count;
  perform set_config('p030.purge_test', 'off', true);
  return n;
end $$;

create or replace function public.get_state(p uuid) returns jsonb
language plpgsql security definer set search_path = public, private as $$
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  return private.state(p) || (select jsonb_build_object('player_name', player_name, 'observer_no', to_char(birthday, 'MMDD')) from public.settings where id = 1);
end $$;

revoke all on function public.admin_set_player(text, date), public.admin_reset_player() from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.admin_set_player(text, date), public.admin_reset_player() from anon';
    execute 'grant execute on function public.admin_set_player(text, date), public.admin_reset_player(), public.get_state(uuid) to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000011_identity_profile.sql =====
-- PROJECT 030 · 第 1 天「身分建檔」：以遊戲劇情暗中選出形象照風格（色調／服裝／氛圍／場景）

create or replace function public.submit_step(p uuid, d int, step_id text, answer jsonb) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare
  t timestamptz; l public.levels; pl public.player_levels; st jsonb; prior_ok boolean; sec jsonb;
  ok boolean := false; ans text; expected jsonb; att int; msg text; mode text; local_t time; s public.settings;
  cards jsonb; exp_order text; sel text; completion jsonb; reveal jsonb;
begin
  perform private.assert_profile(p);
  perform private.refresh(p);
  t := private.game_now(p);
  perform private.load_active(p, d);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  select * into st, prior_ok from private.find_step(p, l, pl, step_id);
  if st is null then raise exception 'P030_NO_SUCH_STEP'; end if;
  if (pl.data -> 'done') ? step_id then return jsonb_build_object('correct', true, 'already', true); end if;
  if not prior_ok then raise exception 'P030_STEP_ORDER'; end if;

  -- 特定時段任務
  if st ? 'window' then
    s := private.settings();
    local_t := (t at time zone s.tz)::time;
    if local_t < (st #>> '{window,from}')::time or local_t > (st #>> '{window,to}')::time then
      return jsonb_build_object('correct', false, 'message', coalesce(st #>> '{window,closed_text}', '這個機關現在沒有反應。'));
    end if;
  end if;

  sec := l.secrets -> step_id;
  ans := answer ->> 'value';

  case st ->> 'type'
    when 'story', 'observe_hint', 'archive' then ok := true;
    when 'choice' then
      sel := answer ->> 'option';
      if not exists (select 1 from jsonb_array_elements(st -> 'options') o where o ->> 'id' = sel) then
        raise exception 'P030_BAD_OPTION';
      end if;
      ok := true;
      insert into public.flags (profile_id, key, value, source, set_at)
      values (p, 'choice:' || (st ->> 'flag'), to_jsonb(sel), 'day:' || d, t)
      on conflict (profile_id, key) do update set value = excluded.value, set_at = excluded.set_at, source = excluded.source;
      insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
      values (p, d, step_id, 'choice', jsonb_build_object('option', sel), 'APPROVED', pl.missed_at is null, t);
      perform private.log(p, t, 'CHOICE', d, jsonb_build_object('flag', st ->> 'flag', 'option', sel));
    when 'ar' then
      if (answer ->> 'target') is not null and (answer ->> 'target')::int = (st ->> 'target')::int then
        ok := true; mode := 'scan';
      elsif (answer ->> 'code') is not null and coalesce((l.ar_fallback ->> step_id)::boolean, false)
            and private.norm(answer ->> 'code') = private.norm(sec ->> 'fallback') then
        ok := true; mode := 'fallback';
      elsif (answer ->> 'code') is not null and not coalesce((l.ar_fallback ->> step_id)::boolean, false) then
        raise exception 'P030_FALLBACK_DISABLED';
      end if;
      if ok then
        insert into public.evidence (profile_id, day, step_id, kind, payload, status, on_time, submitted_at)
        values (p, d, step_id, 'scan', jsonb_build_object('mode', mode, 'target', answer -> 'target'), 'APPROVED', pl.missed_at is null, t);
        perform private.log(p, t, 'SCAN', d, jsonb_build_object('mode', mode, 'target', answer -> 'target'));
      end if;
    when 'wait' then
      if pl.data #> array['started', step_id] is null then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'started', true, 'message', st ->> 'start_text');
      end if;
      ok := t >= (pl.data #>> array['started', step_id])::timestamptz + make_interval(secs => (st ->> 'seconds')::int);
      if not ok then
        update public.player_levels set data = jsonb_set(data, array['started', step_id], to_jsonb(t)) where profile_id = p and day = d;
        return jsonb_build_object('correct', false, 'message', coalesce(st ->> 'early_text', '太快了。重新開始等待。'));
      end if;
    when 'timeline' then
      cards := private.timeline_cards(p, coalesce((st ->> 'upto')::int, 8));
      select string_agg(c ->> 'id', ',' order by ord) into exp_order from jsonb_array_elements(cards) with ordinality x(c, ord);
      ok := private.norm(ans) = private.norm(exp_order);
    when 'observe' then
      ok := exists (select 1 from public.observations where profile_id = p and day = private.game_day(t));
      if not ok then return jsonb_build_object('correct', false, 'message', '培養艙尚未記錄今天的觀測。'); end if;
    when 'evidence' then
      raise exception 'P030_USE_SUBMIT_EVIDENCE';
    else
      expected := sec -> 'answer';
      if expected is null then raise exception 'P030_STEP_HAS_NO_ANSWER %', step_id; end if;
      -- 動態答案：$start_mmdd ＝ 第一天的月日（依設定的生日計算）
      if expected #>> '{}' = '$start_mmdd' then expected := to_jsonb(to_char(private.start_date(), 'MMDD')); end if;
      if expected #>> '{}' = '$birth_mmdd' then expected := to_jsonb(to_char((private.settings()).birthday, 'MMDD')); end if;
      if jsonb_typeof(expected) = 'array' then
        ok := exists (select 1 from jsonb_array_elements_text(expected) e where private.norm(e) = private.norm(ans));
      else
        ok := private.norm(expected #>> '{}') = private.norm(ans);
      end if;
  end case;

  if not ok then
    att := coalesce((pl.data #>> array['attempts', step_id])::int, 0) + 1;
    update public.player_levels set data = jsonb_set(data, array['attempts', step_id], to_jsonb(att)) where profile_id = p and day = d;
    msg := coalesce(sec ->> 'wrong', '沒有反應。');
    return jsonb_build_object('correct', false, 'attempts', att, 'message', msg);
  end if;

  reveal := sec -> 'reveal';
  update public.player_levels
     set data = jsonb_set(jsonb_set(data, array['done', step_id], to_jsonb(t)), array['reveals', step_id], coalesce(reveal, 'null'))
   where profile_id = p and day = d;
  perform private.apply_effects(p, t, sec -> 'grant', d, 'step:' || d || ':' || step_id);
  completion := private.check_completion(p, d, t);
  return jsonb_build_object('correct', true, 'reveal', reveal, 'success_text', sec ->> 'success',
                            'completed', completion is not null, 'completion', completion, 'mode', mode);
end $$;

update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "emergency", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_wake", "type": "story", "text": ["本區電力異常。", "系統：「請先恢復電源。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "stage": 1, "stage_title": "恢復電源", "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}], "prompt": "撥動開關，然後拉下主閘。"}, {"id": "s_sample", "type": "story", "text": ["燈亮了。培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」選一種方式觀察它，再回到這裡。", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_id_intro", "type": "story", "text": ["終端機：「新觀察員接入。開始建立身分檔案。」", "「請先確認你的觀察員編號。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_id", "type": "keypad", "title": "觀察員編號", "length": 4, "prompt": "輸入你的觀察員編號。", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_calib", "type": "story", "text": ["終端機：「身分確認。」", "「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」", "「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_tone", "type": "choice", "title": "校準 1／4・識別色調", "flag": "p_tone", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，應該是什麼顏色？"], "options": [{"id": "mono", "label": "黑白・永恆", "desc": "只留下光與影。"}, {"id": "film", "label": "暖色・膠片", "desc": "像一段被保存下來的午後。"}, {"id": "cool", "label": "冷光・未來", "desc": "金屬、霓虹、乾淨的線條。"}, {"id": "cover", "label": "高彩・封面", "desc": "鮮明、張揚，像雜誌封面上的人。"}]}, {"id": "s_outfit", "type": "choice", "title": "校準 2／4・輪廓", "flag": "p_outfit", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像需要一個輪廓。你想以什麼樣子被記錄？"], "options": [{"id": "formal", "label": "正式", "desc": "西裝或套裝，像是要去領一個獎。"}, {"id": "smart", "label": "俐落", "desc": "襯衫、簡單的剪裁，乾淨就好。"}, {"id": "self", "label": "本色", "desc": "你平常最像自己的那一套衣服。"}, {"id": "bold", "label": "大膽", "desc": "平常不敢穿、但一直想試試看的。"}]}, {"id": "s_mood", "type": "choice", "title": "校準 3／4・表情模組", "flag": "p_mood", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，看起來是什麼表情？"], "options": [{"id": "confident", "label": "自信", "desc": "直視鏡頭。"}, {"id": "gentle", "label": "溫柔", "desc": "像在對某個人笑。"}, {"id": "calm", "label": "冷靜", "desc": "安靜、不動聲色。"}, {"id": "playful", "label": "玩心", "desc": "有一點調皮。"}]}, {"id": "s_scene", "type": "choice", "title": "校準 4／4・背景場域", "flag": "p_scene", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像要放在什麼樣的空間裡？"], "options": [{"id": "studio", "label": "純色空間", "desc": "什麼都沒有，只有你。"}, {"id": "city", "label": "城市街角", "desc": "有路燈、有人經過。"}, {"id": "retro", "label": "復古房間", "desc": "舊沙發、老燈、時間的味道。"}, {"id": "light", "label": "光影抽象", "desc": "光線和陰影切出你的輪廓。"}]}, {"id": "s_ref", "type": "evidence", "title": "參考影像（可略過）", "kinds": ["photo"], "optional": true, "stage": 2, "stage_title": "身分建檔", "prompt": "如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。"}, {"id": "s_saved", "type": "story", "text": ["終端機：「識別影像設定已寫入。」", "「影像將於稍後生成。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "時間同步"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "時間同步", "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "這個房間的時間。"}], "prompt": "同步程序需要一份來自你世界的證據。", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = secrets || '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "s_id": {"answer": "$birth_mmdd", "hints": ["你登入時輸入的那四個數字。"], "success": "身分確認。", "wrong": "編號不符。"}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;

select '第 1 天已更新' as status;

-- ===== migrations/20261108000012_real_world_codes.sql =====
-- PROJECT 030 · 場景線索（點選畫面中的物件）＋ 現實世界密碼：衛生紙條碼（第 2 天）、精油調配（第 5 天）、社工師考卷（第 6 天）

update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "emergency", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}, {"id": "c_panel", "x": 17, "y": 41, "label": "配電箱", "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}]}, {"id": "c_clock", "x": 49, "y": 21, "label": "牆上的時鐘", "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "時鐘停住了。秒針一動也不動。"}]}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_wake", "type": "story", "text": ["本區電力異常。", "系統：「請先恢復電源。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "stage": 1, "stage_title": "恢復電源", "prompt": "先調查上方畫面裡的配電箱，再撥動開關、拉下主閘。"}, {"id": "s_sample", "type": "story", "text": ["燈亮了。培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」選一種方式觀察它，再回到這裡。", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_id_intro", "type": "story", "text": ["終端機：「新觀察員接入。開始建立身分檔案。」", "「請先確認你的觀察員編號。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_id", "type": "keypad", "title": "觀察員編號", "length": 4, "prompt": "輸入你的觀察員編號。", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_calib", "type": "story", "text": ["終端機：「身分確認。」", "「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」", "「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_tone", "type": "choice", "title": "校準 1／4・識別色調", "flag": "p_tone", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，應該是什麼顏色？"], "options": [{"id": "mono", "label": "黑白・永恆", "desc": "只留下光與影。"}, {"id": "film", "label": "暖色・膠片", "desc": "像一段被保存下來的午後。"}, {"id": "cool", "label": "冷光・未來", "desc": "金屬、霓虹、乾淨的線條。"}, {"id": "cover", "label": "高彩・封面", "desc": "鮮明、張揚，像雜誌封面上的人。"}]}, {"id": "s_outfit", "type": "choice", "title": "校準 2／4・輪廓", "flag": "p_outfit", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像需要一個輪廓。你想以什麼樣子被記錄？"], "options": [{"id": "formal", "label": "正式", "desc": "西裝或套裝，像是要去領一個獎。"}, {"id": "smart", "label": "俐落", "desc": "襯衫、簡單的剪裁，乾淨就好。"}, {"id": "self", "label": "本色", "desc": "你平常最像自己的那一套衣服。"}, {"id": "bold", "label": "大膽", "desc": "平常不敢穿、但一直想試試看的。"}]}, {"id": "s_mood", "type": "choice", "title": "校準 3／4・表情模組", "flag": "p_mood", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，看起來是什麼表情？"], "options": [{"id": "confident", "label": "自信", "desc": "直視鏡頭。"}, {"id": "gentle", "label": "溫柔", "desc": "像在對某個人笑。"}, {"id": "calm", "label": "冷靜", "desc": "安靜、不動聲色。"}, {"id": "playful", "label": "玩心", "desc": "有一點調皮。"}]}, {"id": "s_scene", "type": "choice", "title": "校準 4／4・背景場域", "flag": "p_scene", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像要放在什麼樣的空間裡？"], "options": [{"id": "studio", "label": "純色空間", "desc": "什麼都沒有，只有你。"}, {"id": "city", "label": "城市街角", "desc": "有路燈、有人經過。"}, {"id": "retro", "label": "復古房間", "desc": "舊沙發、老燈、時間的味道。"}, {"id": "light", "label": "光影抽象", "desc": "光線和陰影切出你的輪廓。"}]}, {"id": "s_ref", "type": "evidence", "title": "參考影像（可略過）", "kinds": ["photo"], "optional": true, "stage": 2, "stage_title": "身分建檔", "prompt": "如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。"}, {"id": "s_saved", "type": "story", "text": ["終端機：「識別影像設定已寫入。」", "「影像將於稍後生成。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "時間同步"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "時間同步", "prompt": "同步程序需要一份來自你世界的證據。（這個房間裡，有東西停住了。）", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = secrets || '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "s_id": {"answer": "$birth_mmdd", "hints": ["你登入時輸入的那四個數字。"], "success": "身分確認。", "wrong": "編號不符。"}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;
update public.levels set config = '{"notify": {"new": "一段不明訊號正在重複播放。來源：第 02 區。", "pending": "訊號仍在等待回應。", "expiring": "頻道將於午夜關閉。"}, "scene": {"theme": "radio", "light": "on", "props": ["radio", "antenna", "desk", "window"], "hotspots": [{"id": "drawer", "x": 76, "y": 80, "label": "抽屜"}, {"id": "c_log", "x": 51, "y": 57, "label": "收音機", "clue": [{"type": "log", "lines": ["廣播紀錄 23:10 —— 收到片段訊號", "附註：訊號是倒著傳來的。", "內容：「7.301」"]}]}, {"id": "c_serial", "x": 20, "y": 34, "label": "窗邊的抄錄紙", "clue": [{"type": "note", "text": "有人在紙上潦草地抄著：\n「訊號源序號：13 位數字。」\n「它印在一樣你每天都會用、用完就會消失的白色東西上。」"}]}]}, "variants": [{"id": "dim", "when": {"flag": "lab_dark"}, "scene": {"light": "dim"}, "intro": ["接入室沒有恢復電力，這裡的燈也比應該的暗。", "收音機靠電池運轉。"]}], "intro": ["收音機自己開著。", "只有雜訊。"], "steps": [{"id": "s_intro", "type": "story", "text": ["收音機自己開著，只有雜訊。", "系統：「請找出訊號源的頻率。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "調頻"}, {"id": "s_tune", "type": "dial", "title": "調頻", "dials": 4, "format": "###.#", "stage": 1, "stage_title": "調頻", "prompt": "調查畫面裡的收音機，轉動旋鈕對準頻率。"}, {"id": "s_order", "type": "sequence", "title": "訊號重組", "pick": 4, "render": "box", "stage": 1, "stage_title": "調頻", "items": [{"id": "c", "label": "每天"}, {"id": "a", "label": "訊號源"}, {"id": "d", "label": "自己響起"}, {"id": "b", "label": "在你的世界"}], "clue": [{"type": "note", "text": "訊號斷成了四段。開頭是「訊號源」，結尾是一個動作。"}], "prompt": "依序點選四段訊號。"}, {"id": "s_need_serial", "type": "story", "text": ["訊號重組完成：「訊號源・在你的世界・每天・自己響起。」", "系統：「訊號源已定位。但頻道被鎖住了——需要訊號源的序號。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "訊號源序號"}, {"id": "s_serial", "type": "keypad", "title": "訊號源序號", "length": 13, "stage": 2, "stage_title": "訊號源序號", "prompt": "輸入 13 位序號。（畫面裡有人留下了線索）"}, {"id": "s_decoded", "type": "story", "text": ["頻道解鎖。", "系統：「最後一步：需要一段來自訊號源本身的聲音。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "訊號源"}, {"id": "s_record", "type": "evidence", "title": "訊號源", "kinds": ["audio"], "gate": true, "stage": 3, "stage_title": "訊號源", "prompt": "收音機需要一段「每天會自己響起」的聲音。", "pending_text": "聲音已送出。觀察站正在比對頻率……"}, {"id": "s_watcher", "type": "story", "text": ["門口站著一個人，穿著舊式的值班外套。", "「你也收到訊號了？」", "「我是這裡的守夜人。我們明天見。」"], "speaker": "守夜人", "when": {"not": {"flag": "lab_dark"}}, "stage": 3, "stage_title": "訊號源"}, {"id": "s_watcher_dark", "type": "story", "text": ["走廊的另一端有手電筒的光晃了一下。", "「……這裡太暗了，」有人說。「明天吧。」"], "speaker": "？", "when": {"flag": "lab_dark"}, "stage": 3, "stage_title": "訊號源"}], "epilogue": ["頻率已鎖定。", "你取得了第二個符號。"]}'::jsonb, secrets = secrets || '{"s_tune": {"answer": "1037", "hints": ["紀錄說訊號是倒著傳來的。", "把「7.301」倒過來讀。"], "success": "雜訊消失了。", "wrong": "只有雜訊。"}, "hotspots": {"drawer": {"text": "抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。", "grant": {"items": [{"key": "freq_table", "name": "頻率表", "desc": "「030.0 —— 不要調到這裡」。", "data": {"hidden": true}}]}}}, "s_order": {"answer": "a,b,c,d", "hints": ["第一段是「訊號源」。", "訊號源 → 在你的世界 → 每天 → 自己響起"], "success": "訊號變得清晰。", "wrong": "訊號又亂了。"}, "s_serial": {"answer": "4710901898847", "hints": ["每天都會用、用完就會消失、白色的……", "它通常放在廁所或浴室。", "找到倍潔雅衛生紙的包裝，輸入條碼下方的 13 個數字。"], "success": "序號吻合。頻道解鎖。", "wrong": "序號不符。"}, "s_record": {"hints": ["你的世界裡，有什麼東西每天會自己發出聲音？", "鬧鐘、微波爐的「叮」、熱水壺、洗衣機……", "錄下任何一個會自己響起的聲音上傳。"]}, "a_note": {"answer": ["等待訊號"], "hints": ["看每一行的第一個字。"], "success": "紙條背面寫著：「我會再回來。」", "wrong": "好像不是這樣讀的。"}}'::jsonb, updated_at = now() where day = 2;
update public.levels set config = '{"notify": {"new": "第 05 區的濕度上升。有東西在生長。", "pending": "溫室裡的植物還沒有被照顧。", "expiring": "溫室的燈將於午夜關閉。"}, "scene": {"theme": "greenhouse", "light": "on", "props": ["plants", "incubator", "window"], "hotspots": [{"id": "roots", "x": 82, "y": 84, "label": "根部"}, {"id": "vines", "x": 10, "y": 40, "label": "藤蔓後面", "when": {"stat": "exploration", "gte": 2}}, {"id": "c_pot", "x": 50, "y": 82, "label": "花盆上的標籤", "clue": [{"type": "note", "text": "標籤上的字很小：\n「調配方法：見《居家保健小百科》——消化不良。」\n「對照速查表：用法 × 肌膚敏感度，數一數每一欄。」"}]}]}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}, "intro": ["守夜人在澆水。", "「它們不是同一天種的，」他說，「所以不會同一天開。」"]}], "intro": ["溫室裡的植物都不是同一天種下的。", "培養艙被移到了這裡。"], "steps": [{"id": "s_order", "type": "sequence", "title": "澆水順序", "pick": 5, "render": "plant", "stage": 1, "stage_title": "澆水順序", "items": [{"id": "c", "stage": 3}, {"id": "a", "stage": 1}, {"id": "e", "stage": 5}, {"id": "b", "stage": 2}, {"id": "d", "stage": 4}], "clue": [{"type": "note", "text": "澆水紀錄：「從最晚種下的開始。」"}], "prompt": "依序點選植物。"}, {"id": "s_ill", "type": "story", "text": ["溫室的終端亮起紅燈：「樣本消化系統異常。」", "「需要一份調配。調配的方法，記載在你世界的一本書裡。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "消化系統調配"}, {"id": "s_recipe", "type": "keypad", "title": "消化系統調配", "length": 6, "stage": 2, "stage_title": "消化系統調配", "prompt": "輸入 6 位調配碼。（先調查畫面裡的花盆）"}, {"id": "s_night", "type": "story", "optional": true, "title": "夜間花苞", "text": ["花苞在夜裡打開了。", "裡面是一顆很小的、發著光的種子。"], "window": {"from": "21:00", "to": "23:59:59", "closed_text": "花苞緊閉著。也許要等到夜裡（21:00 後）。"}, "stage": 2, "stage_title": "灌溉計時器"}, {"id": "s_photo", "type": "evidence", "title": "生長樣本", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "生長樣本", "prompt": "溫室需要一份「正在長大」的樣本。", "pending_text": "樣本已送出。溫室正在比對生長紀錄……"}], "epilogue": ["溫室已歸檔。", "你取得了第五個符號。"]}'::jsonb, secrets = secrets || '{"s_order": {"answer": "a,b,c,d,e", "hints": ["最晚種下的，現在長得最小。"], "success": "水流過每一株植物。", "wrong": "有一株植物垂下了葉子。"}, "s_night": {"grant": {"items": [{"key": "night_seed", "name": "夜開的種子", "desc": "只在夜裡發光。", "data": {"hidden": true}}]}}, "hotspots": {"roots": {"text": "根部纏著一張標籤：「不是每一株都需要被看見。」", "grant": {"items": [{"key": "root_tag", "name": "根部標籤", "desc": "不是每一株都需要被看見。", "data": {"hidden": true}}]}}, "vines": {"text": "藤蔓後面有一間更小的溫室。裡面只種了一株，還沒發芽。", "grant": {"items": [{"key": "hidden_greenhouse", "name": "隱藏溫室的土", "desc": "還沒發芽。", "data": {"hidden": true}}]}}}, "s_recipe": {"answer": "777250", "hints": ["花盆標籤提到一本書。它在你家的廚房。", "找到《居家保健小百科》裡「消化不良」的複方調配，把用到的精油對照前面的精油速查表。", "速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"], "success": "調配完成。樣本的光變得穩定。", "wrong": "調配比例不對。樣本微微顫抖。"}, "s_photo": {"hints": ["你的世界裡，有什麼東西每天都在悄悄長大？", "植物、寵物、指甲、頭髮……任何正在生長的都可以。", "拍一株植物最新長出的葉子上傳。"]}, "a_valves": {"answer": "10110", "success": "水滲進土裡。"}}'::jsonb, updated_at = now() where day = 5;
update public.levels set config = '{"notify": {"new": "異常：第 01 區的紀錄出現在第 06 區。", "pending": "斷層仍在擴大。", "expiring": "斷層將於午夜固定成形。"}, "scene": {"theme": "fault", "light": "flicker", "props": ["crack", "terminal"], "hotspots": [{"id": "c_crack", "x": 50, "y": 52, "label": "裂縫裡的紙", "clue": [{"type": "note", "text": "一張被撕下的紙，邊緣燒焦了：\n「……社會工作……」\n「……答錯的那幾題，改回正確答案……」\n「共 10 題。」"}]}]}, "intro": ["系統錯誤。", "有些紀錄出現在不該出現的地方。"], "steps": [{"id": "s_glitch", "type": "story", "title": "損壞的紀錄", "inject_evidence_day": 1, "text": ["第 01 區的紀錄出現在這裡，但已經損壞："], "stage": 1, "stage_title": "重建斷層"}, {"id": "s_lock", "type": "symbols", "title": "重建斷層", "slots": 4, "stage": 1, "stage_title": "重建斷層", "clue": [{"type": "log", "lines": ["損壞的時間戳：", "D01 ▒▒ D02 ▒▒ D02 ▒▒ D01", "「把最早的兩個訊號，依時間戳放回去。」"]}], "prompt": "從你持有的符號中依序放入。"}, {"id": "s_exam_intro", "type": "story", "text": ["裂縫深處卡著一張被撕下來的紙。", "系統：「斷層的另一側，是一段曾經答錯的紀錄。把它改回來，裂縫才會停止。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "錯過的答案"}, {"id": "s_exam", "type": "letters", "title": "錯過的答案", "length": 10, "letters": ["A", "B", "C", "D"], "stage": 2, "stage_title": "錯過的答案", "prompt": "依序輸入 10 個正確答案（A–D）。（先調查畫面裡的裂縫）"}, {"id": "s_choice", "type": "choice", "title": "修復", "flag": "fault", "stage": 2, "stage_title": "錯過的答案", "text": ["斷層中有一段紀錄可以修復。", "但修復它，會覆寫較近的一段。"], "options": [{"id": "repair", "label": "修復最早的紀錄", "desc": "裂縫會闔上，另一段會被覆寫。"}, {"id": "keep", "label": "保留裂縫", "desc": "兩段紀錄都留下，裂縫不會消失。"}]}, {"id": "s_mended", "type": "evidence", "title": "修補過的東西", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "修補過的東西", "prompt": "斷層需要一個「修補過」的東西作為參照。", "pending_text": "參照物已送出。斷層正在比對……"}], "epilogue": ["斷層已固定。", "你取得了第六個符號。"]}'::jsonb, secrets = secrets || '{"s_lock": {"answer": "sym1,sym2,sym2,sym1", "hints": ["你最早取得的兩個符號，分別來自第 1 天和第 2 天。", "在「物品」查看每個符號的來源日。"], "success": "裂縫停止擴大。", "wrong": "斷層發出刺耳的聲音。"}, "s_exam": {"answer": "BDBBCBABAB", "hints": ["那是一張考卷。你曾經考過的。", "它藏在衣櫥中間的櫃子裡。", "找到四分社工師考卷的「社會工作」科，把答錯的題目的正確答案依序輸入。"], "success": "答案吻合。裂縫停止擴大。", "wrong": "斷層發出刺耳的聲音。"}, "s_mended": {"hints": ["你身邊有沒有什麼東西，壞過，又被修好？", "黏過的杯子、補過的衣服、貼著膠帶的東西……", "拍一個曾經壞掉、又被修好的東西上傳。"]}, "a_lock": {"answer": "sym2,sym1,sym1,sym2", "hints": ["第 1 天和第 2 天的符號——即使只是殘響——也算。"], "success": "裂縫裡的紀錄安靜下來。"}}'::jsonb, updated_at = now() where day = 6;

select '場景線索與現實密碼已更新' as status;

-- ===== migrations/20261108000013_day1_lost_items.sql =====
-- PROJECT 030 · 第 1 天：床邊的遺失物（手機型號 ＋ 收據統編，依配電箱規則去掉 1）解開培養艙
-- 第 3 天保險箱維持 AR 投影密碼；保留你自訂的卡片 A 提示

update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "emergency", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}, {"id": "c_panel", "x": 17, "y": 41, "label": "配電箱", "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}]}, {"id": "c_clock", "x": 49, "y": 21, "label": "牆上的時鐘", "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "時鐘停住了。秒針一動也不動。"}]}, {"id": "c_lock", "x": 77, "y": 54, "label": "培養艙的鎖", "clue": [{"type": "note", "text": "培養艙的鎖上刻著：\n「解鎖所需的兩樣東西，遺落在你世界的床邊。」\n「型號照抄。」\n「數字，依配電箱的規則。」"}]}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_wake", "type": "story", "text": ["本區電力異常。", "系統：「請先恢復電源。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "stage": 1, "stage_title": "恢復電源", "prompt": "先調查上方畫面裡的配電箱，再撥動開關、拉下主閘。"}, {"id": "s_sample", "type": "story", "text": ["燈亮了。培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "但培養艙被鎖住了。鎖上需要一組密碼。"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_lock", "type": "text", "title": "培養艙的鎖", "placeholder": "輸入密碼（英文＋數字）", "stage": 1, "stage_title": "恢復電源", "prompt": "先調查畫面裡的培養艙，再輸入密碼。"}, {"id": "s_unlocked", "type": "story", "text": ["鎖開了。培養艙的門緩緩滑開。", "系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」選一種方式觀察它，再回到這裡。", "stage": 1, "stage_title": "恢復電源"}, {"id": "s_id_intro", "type": "story", "text": ["終端機：「新觀察員接入。開始建立身分檔案。」", "「請先確認你的觀察員編號。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_id", "type": "keypad", "title": "觀察員編號", "length": 4, "prompt": "輸入你的觀察員編號。", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_calib", "type": "story", "text": ["終端機：「身分確認。」", "「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」", "「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_tone", "type": "choice", "title": "校準 1／4・識別色調", "flag": "p_tone", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，應該是什麼顏色？"], "options": [{"id": "mono", "label": "黑白・永恆", "desc": "只留下光與影。"}, {"id": "film", "label": "暖色・膠片", "desc": "像一段被保存下來的午後。"}, {"id": "cool", "label": "冷光・未來", "desc": "金屬、霓虹、乾淨的線條。"}, {"id": "cover", "label": "高彩・封面", "desc": "鮮明、張揚，像雜誌封面上的人。"}]}, {"id": "s_outfit", "type": "choice", "title": "校準 2／4・輪廓", "flag": "p_outfit", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像需要一個輪廓。你想以什麼樣子被記錄？"], "options": [{"id": "formal", "label": "正式", "desc": "西裝或套裝，像是要去領一個獎。"}, {"id": "smart", "label": "俐落", "desc": "襯衫、簡單的剪裁，乾淨就好。"}, {"id": "self", "label": "本色", "desc": "你平常最像自己的那一套衣服。"}, {"id": "bold", "label": "大膽", "desc": "平常不敢穿、但一直想試試看的。"}]}, {"id": "s_mood", "type": "choice", "title": "校準 3／4・表情模組", "flag": "p_mood", "stage": 2, "stage_title": "身分建檔", "text": ["檔案裡的你，看起來是什麼表情？"], "options": [{"id": "confident", "label": "自信", "desc": "直視鏡頭。"}, {"id": "gentle", "label": "溫柔", "desc": "像在對某個人笑。"}, {"id": "calm", "label": "冷靜", "desc": "安靜、不動聲色。"}, {"id": "playful", "label": "玩心", "desc": "有一點調皮。"}]}, {"id": "s_scene", "type": "choice", "title": "校準 4／4・背景場域", "flag": "p_scene", "stage": 2, "stage_title": "身分建檔", "text": ["識別影像要放在什麼樣的空間裡？"], "options": [{"id": "studio", "label": "純色空間", "desc": "什麼都沒有，只有你。"}, {"id": "city", "label": "城市街角", "desc": "有路燈、有人經過。"}, {"id": "retro", "label": "復古房間", "desc": "舊沙發、老燈、時間的味道。"}, {"id": "light", "label": "光影抽象", "desc": "光線和陰影切出你的輪廓。"}]}, {"id": "s_ref", "type": "evidence", "title": "參考影像（可略過）", "kinds": ["photo"], "optional": true, "stage": 2, "stage_title": "身分建檔", "prompt": "如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。"}, {"id": "s_saved", "type": "story", "text": ["終端機：「識別影像設定已寫入。」", "「影像將於稍後生成。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "身分建檔"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "時間同步"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "時間同步", "prompt": "同步程序需要一份來自你世界的證據。（這個房間裡，有東西停住了。）", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = secrets || '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "s_lock": {"answer": ["A168888483"], "hints": ["培養艙的鎖提到兩樣遺失的東西，它們在你世界的床邊。", "床邊有一支手機和一張收據。密碼 ＝ 手機型號 ＋ 收據上的統編。", "依配電箱的規則：1 不算。型號照抄，統編裡的 1 全部拿掉。"], "success": "咔。培養艙的鎖彈開了。", "wrong": "鎖沒有反應。"}, "s_id": {"answer": "$birth_mmdd", "hints": ["你登入時輸入的那四個數字。"], "success": "身分確認。", "wrong": "編號不符。"}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;
update public.levels set config = jsonb_set('{"notify": {"new": "第 03 區偵測到一個實體投影。它在你的世界裡。", "pending": "投影卡尚未被掃描。", "expiring": "投影將於午夜失效。"}, "scene": {"theme": "vault", "light": "on", "props": ["safe", "shelf", "desk"], "hotspots": []}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}}, {"id": "note", "when": {"flag": "watcher_left"}, "scene": {"npc": "note"}}], "intro": ["房間中央有一個保險箱，但它不是真的在這裡。", "系統：「保險箱的實體投影卡已放置於現實世界。」"], "steps": [{"id": "s_watch", "type": "story", "text": ["守夜人：「卡片是我放的。提示我只說一次——」", "「找一個你每天都會打開，卻很少注意它的地方。」"], "speaker": "守夜人", "when": {"flag": "watcher_met"}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_note", "type": "story", "text": ["桌上壓著一張紙條：", "「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"], "when": {"not": {"flag": "watcher_met"}}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_scan", "type": "ar", "title": "掃描投影卡 A", "target": 0, "card": "A", "overlay": "safe", "prompt": "找到實體卡片 A，用相機對準它。", "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_open", "type": "keypad", "title": "保險箱轉盤", "length": 3, "prompt": "輸入保險箱的密碼。", "stage": 2, "stage_title": "保險箱"}, {"id": "s_inside", "type": "story", "text": ["保險箱裡只有一張舊照片。", "照片背面寫著：「第 7 天，再用一次。」", "照片的角落，有一行很小的字：「座標未確認」。"], "stage": 2, "stage_title": "保險箱"}, {"id": "s_coord", "type": "evidence", "title": "座標確認", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "座標確認", "prompt": "系統需要確認投影卡的原始座標。", "pending_text": "座標資料已送出。觀察站正在比對……"}], "epilogue": ["保險箱已歸檔。", "你取得了第三個符號，以及一張照片。"]}'::jsonb, '{steps}', private.p030_keep(config -> 'steps', '[{"id": "s_watch", "type": "story", "text": ["守夜人：「卡片是我放的。提示我只說一次——」", "「找一個你每天都會打開，卻很少注意它的地方。」"], "speaker": "守夜人", "when": {"flag": "watcher_met"}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_note", "type": "story", "text": ["桌上壓著一張紙條：", "「卡片在你每天都會打開，卻很少注意的地方。——守夜人」"], "when": {"not": {"flag": "watcher_met"}}, "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_scan", "type": "ar", "title": "掃描投影卡 A", "target": 0, "card": "A", "overlay": "safe", "prompt": "找到實體卡片 A，用相機對準它。", "stage": 1, "stage_title": "投影卡 A"}, {"id": "s_open", "type": "keypad", "title": "保險箱轉盤", "length": 3, "prompt": "輸入保險箱的密碼。", "stage": 2, "stage_title": "保險箱"}, {"id": "s_inside", "type": "story", "text": ["保險箱裡只有一張舊照片。", "照片背面寫著：「第 7 天，再用一次。」", "照片的角落，有一行很小的字：「座標未確認」。"], "stage": 2, "stage_title": "保險箱"}, {"id": "s_coord", "type": "evidence", "title": "座標確認", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "座標確認", "prompt": "系統需要確認投影卡的原始座標。", "pending_text": "座標資料已送出。觀察站正在比對……"}]'::jsonb, array['s_watch','s_note'], array['text'])), secrets = secrets || '{"s_scan": {"fallback": "VAULT-A", "reveal": {"overlay": "safe", "digits": "418"}, "success": "卡片上方浮現一個保險箱。"}, "s_open": {"answer": "418", "hints": ["數字只出現在投影的保險箱上。"], "success": "咔。", "wrong": "轉盤卡住了。"}, "s_coord": {"hints": ["投影卡是在哪裡找到的？", "回到那個地方。", "拍一張「找到卡片的那個位置」上傳。"]}, "a_key": {"answer": "31412", "hints": ["由左到右，數一數每個齒的高度。"], "success": "吻合。"}}'::jsonb || '{"s_scan":{"fallback":"VAULT-A","reveal":{"overlay":"safe","digits":"418"},"success":"卡片上方浮現一個保險箱。"}}'::jsonb, updated_at = now() where day = 3;

select '第 1 天遺失物已設定' as status;

-- ===== migrations/20261108000014_day1_order.sql =====
-- PROJECT 030 · 第 1 天順序：身分建檔 → 突發停電・緊急重啟（含床邊遺失物）→ 時間同步

update public.levels set config = '{"notify": {"new": "你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。", "pending": "第 01 區的電力仍未恢復。", "expiring": "第 01 區將於午夜封閉。封閉後，那裡不會再有燈。"}, "scene": {"theme": "intake", "light": "on", "props": ["incubator", "panel", "terminal", "clock", "desk"], "hotspots": [{"id": "under_desk", "x": 24, "y": 82, "label": "桌子底下"}, {"id": "c_panel", "x": 17, "y": 41, "label": "配電箱", "clue": [{"type": "note", "text": "配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」"}]}, {"id": "c_clock", "x": 49, "y": 21, "label": "牆上的時鐘", "clue": [{"type": "clock", "h": 10, "m": 30, "caption": "時鐘停住了。秒針一動也不動。"}]}, {"id": "c_lock", "x": 77, "y": 54, "label": "培養艙的鎖", "clue": [{"type": "note", "text": "培養艙的鎖上刻著：\n「解鎖所需的兩樣東西，遺落在你世界的床邊。」\n「型號照抄。」\n「數字，依配電箱的規則。」"}]}]}, "intro": ["……連線建立。", "觀測者，歡迎接入 PROJECT 030。", "你的權限：觀測、修復、紀錄。"], "steps": [{"id": "s_id_intro", "type": "story", "text": ["終端機：「新觀察員接入。」", "「你已被指派至第 030 號檔案。開始建立身分檔案。」", "「請先確認你的觀察員編號。」"], "speaker": "SYSTEM", "scene": {"light": "on"}, "stage": 1, "stage_title": "身分建檔"}, {"id": "s_id", "type": "keypad", "title": "觀察員編號", "length": 4, "prompt": "輸入你的觀察員編號。", "stage": 1, "stage_title": "身分建檔"}, {"id": "s_calib", "type": "story", "text": ["終端機：「身分確認。」", "「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」", "「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "身分建檔"}, {"id": "s_tone", "type": "choice", "title": "校準 1／4・識別色調", "flag": "p_tone", "stage": 1, "stage_title": "身分建檔", "text": ["檔案裡的你，應該是什麼顏色？"], "options": [{"id": "mono", "label": "黑白・永恆", "desc": "只留下光與影。"}, {"id": "film", "label": "暖色・膠片", "desc": "像一段被保存下來的午後。"}, {"id": "cool", "label": "冷光・未來", "desc": "金屬、霓虹、乾淨的線條。"}, {"id": "cover", "label": "高彩・封面", "desc": "鮮明、張揚，像雜誌封面上的人。"}]}, {"id": "s_outfit", "type": "choice", "title": "校準 2／4・輪廓", "flag": "p_outfit", "stage": 1, "stage_title": "身分建檔", "text": ["識別影像需要一個輪廓。你想以什麼樣子被記錄？"], "options": [{"id": "formal", "label": "正式", "desc": "西裝或套裝，像是要去領一個獎。"}, {"id": "smart", "label": "俐落", "desc": "襯衫、簡單的剪裁，乾淨就好。"}, {"id": "self", "label": "本色", "desc": "你平常最像自己的那一套衣服。"}, {"id": "bold", "label": "大膽", "desc": "平常不敢穿、但一直想試試看的。"}]}, {"id": "s_mood", "type": "choice", "title": "校準 3／4・表情模組", "flag": "p_mood", "stage": 1, "stage_title": "身分建檔", "text": ["檔案裡的你，看起來是什麼表情？"], "options": [{"id": "confident", "label": "自信", "desc": "直視鏡頭。"}, {"id": "gentle", "label": "溫柔", "desc": "像在對某個人笑。"}, {"id": "calm", "label": "冷靜", "desc": "安靜、不動聲色。"}, {"id": "playful", "label": "玩心", "desc": "有一點調皮。"}]}, {"id": "s_scene", "type": "choice", "title": "校準 4／4・背景場域", "flag": "p_scene", "stage": 1, "stage_title": "身分建檔", "text": ["識別影像要放在什麼樣的空間裡？"], "options": [{"id": "studio", "label": "純色空間", "desc": "什麼都沒有，只有你。"}, {"id": "city", "label": "城市街角", "desc": "有路燈、有人經過。"}, {"id": "retro", "label": "復古房間", "desc": "舊沙發、老燈、時間的味道。"}, {"id": "light", "label": "光影抽象", "desc": "光線和陰影切出你的輪廓。"}]}, {"id": "s_ref", "type": "evidence", "title": "參考影像（可略過）", "kinds": ["photo"], "optional": true, "stage": 1, "stage_title": "身分建檔", "prompt": "如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。"}, {"id": "s_saved", "type": "story", "text": ["終端機：「識別影像設定已寫入。」", "「身分檔案建立完成。指派任務：修復檔案 030。」"], "speaker": "SYSTEM", "stage": 1, "stage_title": "身分建檔"}, {"id": "s_blackout", "type": "story", "text": ["就在檔案寫入的瞬間——", "整個房間暗了下來。只剩下紅色的緊急照明。", "系統：「警告。主電源中斷。培養艙失去供電。請立即恢復電源。」"], "speaker": "SYSTEM", "scene": {"light": "emergency"}, "fx": "static", "stage": 2, "stage_title": "緊急重啟"}, {"id": "s_power", "type": "switches", "title": "配電箱", "count": 6, "labels": ["1", "2", "3", "4", "5", "6"], "stage": 2, "stage_title": "緊急重啟", "prompt": "先調查上方畫面裡的配電箱，再撥動開關、拉下主閘。"}, {"id": "s_sample", "type": "story", "text": ["燈一盞一盞亮回來。培養艙的玻璃起霧，又慢慢變清。", "裡面有一個很小的東西。它沒有名字，只有編號：030。", "但停電觸發了保護機制——培養艙被鎖住了。"], "speaker": "SYSTEM", "scene": {"light": "on"}, "stage": 2, "stage_title": "緊急重啟"}, {"id": "s_lock", "type": "text", "title": "培養艙的鎖", "placeholder": "輸入密碼（英文＋數字）", "stage": 2, "stage_title": "緊急重啟", "prompt": "先調查畫面裡的培養艙，再輸入密碼。"}, {"id": "s_unlocked", "type": "story", "text": ["鎖開了。培養艙的門緩緩滑開。", "系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」"], "speaker": "SYSTEM", "stage": 2, "stage_title": "緊急重啟"}, {"id": "s_observe", "type": "observe", "title": "第一次觀察", "prompt": "前往「培養艙」選一種方式觀察它，再回到這裡。", "stage": 2, "stage_title": "緊急重啟"}, {"id": "s_drift", "type": "story", "text": ["終端機突然閃爍：「警告。偵測到時間差。」", "「此區的時間，停在某一刻。你的世界卻仍在前進。」", "「培養艙無法在不同步的時間裡封存。」"], "speaker": "SYSTEM", "stage": 3, "stage_title": "時間同步"}, {"id": "s_sync", "type": "evidence", "title": "時間同步", "kinds": ["photo"], "gate": true, "stage": 3, "stage_title": "時間同步", "prompt": "同步程序需要一份來自你世界的證據。（這個房間裡，有東西停住了。）", "pending_text": "同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。"}], "epilogue": ["電力恢復。第 01 區已歸檔。", "你取得了第一個符號。它的用途尚未解鎖。"]}'::jsonb, secrets = secrets || '{"s_power": {"answer": "011010", "hints": ["「無法再被拆開」的數字，只能被 1 和它自己整除。", "注意：1 不算。這種數必須大於 1。", "打開 2、3、5，其他保持關閉。"], "success": "配電箱發出低鳴。燈一盞一盞亮起。", "wrong": "保險絲跳了一下，又暗了。"}, "s_sync": {"hints": ["看看這個房間裡，有什麼東西停住了。", "你的世界裡，也有同樣的東西。讓它停在同一刻。", "找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）"]}, "hotspots": {"under_desk": {"text": "桌子底下黏著一張舊標籤：「樣本來源：未登記」。", "grant": {"items": [{"key": "label_unregistered", "name": "未登記的標籤", "desc": "樣本來源：未登記。", "data": {"hidden": true}}]}}}, "s_lock": {"answer": ["A168888483"], "hints": ["培養艙的鎖提到兩樣遺失的東西，它們在你世界的床邊。", "床邊有一支手機和一張收據。密碼 ＝ 手機型號 ＋ 收據上的統編。", "依配電箱的規則：1 不算。型號照抄，統編裡的 1 全部拿掉。"], "success": "咔。培養艙的鎖彈開了。", "wrong": "鎖沒有反應。"}, "s_id": {"answer": "$birth_mmdd", "hints": ["你登入時輸入的那四個數字。"], "success": "身分確認。", "wrong": "編號不符。"}, "a_find": {"answer": "glyph", "success": "螢光圓圈在光束下浮現。"}, "a_terminal": {"answer": "1030", "hints": ["「十」和「六」是時針和分針。"], "success": "備用終端亮起。"}}'::jsonb, updated_at = now() where day = 1;

select '第 1 天順序已更新' as status;

-- ===== migrations/20261108000015_stage_photos.sql =====
-- 每關過關照片：管理者上傳；只有玩家真的過了那一關，伺服器才會回傳
create table if not exists public.reward_photos (
  day        int  not null check (day between 1 and 11),
  stage      int  not null check (stage between 1 and 9),
  photo      text not null,
  caption    text,
  updated_at timestamptz not null default now(),
  primary key (day, stage)
);
alter table public.reward_photos enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where tablename = 'reward_photos' and policyname = 'admin_all') then
    create policy admin_all on public.reward_photos for all using (public.is_admin()) with check (public.is_admin());
  end if;
end $$;

create or replace function public.stage_photos(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare l public.levels; pl public.player_levels; r jsonb; st jsonb; done_stages int[] := '{}'; pending int[] := '{}';
begin
  perform private.assert_profile(p);
  select * into l from public.levels where day = d;
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is null or pl.status = 'LOCKED' then return '[]'; end if;
  r := private.resolve(p, l, pl);
  for st in select * from jsonb_array_elements(r -> 'steps') loop
    if st ? 'stage' and not coalesce((st ->> 'optional')::boolean, false) and not ((pl.data -> 'done') ? (st ->> 'id')) then
      pending := pending || (st ->> 'stage')::int;
    end if;
    if st ? 'stage' then done_stages := done_stages || (st ->> 'stage')::int; end if;
  end loop;
  return (select coalesce(jsonb_agg(jsonb_build_object('stage', rp.stage, 'photo', rp.photo, 'caption', rp.caption) order by rp.stage), '[]')
            from public.reward_photos rp
           where rp.day = d
             and (pl.status = 'COMPLETED' and pl.missed_at is null and rp.stage = any(done_stages)
                  or (rp.stage = any(done_stages) and not rp.stage = any(pending))));
end $$;

revoke all on function public.stage_photos(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.stage_photos(uuid, int) from anon';
    execute 'grant execute on function public.stage_photos(uuid, int) to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000016_day7_hands.sql =====
-- PROJECT 030 · 第 7 天第 3 關「集結之手」：18 格拼圖拍照，手拼出 ♥1118♥（保留你自訂的卡片 B 提示）

update public.levels set config = jsonb_set('{"notify": {"new": "第 07 區出現了一扇門。它只在今天存在。", "pending": "那扇門仍然關著。", "expiring": "門將於午夜消失。"}, "scene": {"theme": "gate", "light": "on", "props": ["gate", "pillars"], "hotspots": [{"id": "photo_slot", "x": 50, "y": 46, "label": "門上的凹槽", "when": {"item": "photo_old"}}, {"id": "side_room", "x": 88, "y": 60, "label": "柱子後方", "when": {"stat": "exploration", "gte": 2}}]}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}, "intro": ["守夜人站在門邊。", "「我等這扇門很久了，」他說。「但它不是為我開的。」"]}], "intro": ["一扇門，沒有門把。", "門的另一面，有一張投影卡在等你。"], "steps": [{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——它沒有輪廓，也沒有影像。", "系統：「這扇門需要被描出來。一雙手不夠。」"], "stage": 3, "stage_title": "集結之手"}, {"id": "s_hands", "type": "evidence", "title": "集結之手", "kinds": ["photo"], "gate": true, "mosaic": {"cols": 9, "rows": 2, "text": "1118", "hearts": true}, "stage": 3, "stage_title": "集結之手", "prompt": "每一格只露出門的一小段輪廓。讓手覆蓋發光的線，18 格全部完成，門才會出現。", "pending_text": "影像已拼合並送出。門正在辨識……"}], "epilogue": ["門已歸檔。", "你取得了第七個符號。"]}'::jsonb, '{steps}', private.p030_keep(config -> 'steps', '[{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——它沒有輪廓，也沒有影像。", "系統：「這扇門需要被描出來。一雙手不夠。」"], "stage": 3, "stage_title": "集結之手"}, {"id": "s_hands", "type": "evidence", "title": "集結之手", "kinds": ["photo"], "gate": true, "mosaic": {"cols": 9, "rows": 2, "text": "1118", "hearts": true}, "stage": 3, "stage_title": "集結之手", "prompt": "每一格只露出門的一小段輪廓。讓手覆蓋發光的線，18 格全部完成，門才會出現。", "pending_text": "影像已拼合並送出。門正在辨識……"}]'::jsonb, array['s_scan'], array['prompt'])), secrets = secrets || '{"s_scan": {"fallback": "GATE-B", "reveal": {"overlay": "totem", "glyphs": [4, 5, 6]}, "success": "卡片上方浮現一座圖騰。"}, "s_rings": {"answer": "4,5,6", "hints": ["答案只出現在 AR 圖騰上。"], "success": "門環依序歸位。", "wrong": "門環彈回原位。"}, "hotspots": {"photo_slot": {"text": "照片嵌進凹槽剛剛好。門內傳來機械聲。", "grant": {"flags": {"photo_used": true}, "items": [{"key": "gate_mark", "name": "門的刻痕", "desc": "你在第 3 天拿到的東西，在第 7 天被用上了。", "data": {"hidden": true}}]}}, "side_room": {"text": "柱子後方有一間沒有標示的小房間。牆上有一張地圖的一角。", "grant": {"items": [{"key": "map_fragment", "name": "地圖殘片", "desc": "標示著一個不在這十個區域裡的位置。", "data": {"hidden": true}}]}}}, "s_hands": {"hints": ["一雙手不夠。", "找朋友來幫忙：每一格請一個人把手放在發光的線上拍下來（同一個人拍好幾格也可以）。", "18 格全部拍完，按「拼合影像」，手就會拼出門的形狀。"]}, "a_peek": {"answer": "7291", "success": "牆後有東西動了。"}}'::jsonb, updated_at = now() where day = 7;

select '第 7 天集結之手已更新' as status;

-- ===== migrations/20261108000017_day_photo.sql =====
-- 過關照片改為「一天一張」：當天全部完成（碎片回收）後才會回傳
create or replace function public.stage_photos(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare pl public.player_levels;
begin
  perform private.assert_profile(p);
  select * into pl from public.player_levels where profile_id = p and day = d;
  if pl.status is distinct from 'COMPLETED' then return '[]'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('stage', rp.stage, 'photo', rp.photo, 'caption', rp.caption) order by rp.stage), '[]')
            from public.reward_photos rp where rp.day = d);
end $$;
revoke all on function public.stage_photos(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.stage_photos(uuid, int) from anon';
    execute 'grant execute on function public.stage_photos(uuid, int) to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000018_day7_hands_30.sql =====
-- PROJECT 030 · 第 7 天集結之手改為 30 格（10 × 3）、細線（保留你自訂的卡片 B 提示）

update public.levels set config = jsonb_set('{"notify": {"new": "第 07 區出現了一扇門。它只在今天存在。", "pending": "那扇門仍然關著。", "expiring": "門將於午夜消失。"}, "scene": {"theme": "gate", "light": "on", "props": ["gate", "pillars"], "hotspots": [{"id": "photo_slot", "x": 50, "y": 46, "label": "門上的凹槽", "when": {"item": "photo_old"}}, {"id": "side_room", "x": 88, "y": 60, "label": "柱子後方", "when": {"stat": "exploration", "gte": 2}}]}, "variants": [{"id": "watcher", "when": {"flag": "watcher_met"}, "scene": {"npc": "watcher"}, "intro": ["守夜人站在門邊。", "「我等這扇門很久了，」他說。「但它不是為我開的。」"]}], "intro": ["一扇門，沒有門把。", "門的另一面，有一張投影卡在等你。"], "steps": [{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——它沒有輪廓，也沒有影像。", "系統：「這扇門需要被描出來。一雙手不夠。」"], "stage": 3, "stage_title": "集結之手"}, {"id": "s_hands", "type": "evidence", "title": "集結之手", "kinds": ["photo"], "gate": true, "mosaic": {"cols": 10, "rows": 3, "text": "1118", "hearts": true}, "stage": 3, "stage_title": "集結之手", "prompt": "每一格只露出門的一小段輪廓。讓手覆蓋發光的線，30 格全部完成，門才會出現。", "pending_text": "影像已拼合並送出。門正在辨識……"}], "epilogue": ["門已歸檔。", "你取得了第七個符號。"]}'::jsonb, '{steps}', private.p030_keep(config -> 'steps', '[{"id": "s_scan", "type": "ar", "title": "掃描投影卡 B", "target": 1, "card": "B", "overlay": "totem", "prompt": "找到實體卡片 B，用相機對準它。", "stage": 1, "stage_title": "投影卡 B"}, {"id": "s_rings", "type": "rings", "title": "門環", "rings": [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], "prompt": "轉動三個門環，對準圖騰上的符號。", "stage": 2, "stage_title": "門環"}, {"id": "s_through", "type": "story", "text": ["門打開了。", "門後是一條走廊，盡頭還有一扇門——它沒有輪廓，也沒有影像。", "系統：「這扇門需要被描出來。一雙手不夠。」"], "stage": 3, "stage_title": "集結之手"}, {"id": "s_hands", "type": "evidence", "title": "集結之手", "kinds": ["photo"], "gate": true, "mosaic": {"cols": 10, "rows": 3, "text": "1118", "hearts": true}, "stage": 3, "stage_title": "集結之手", "prompt": "每一格只露出門的一小段輪廓。讓手覆蓋發光的線，30 格全部完成，門才會出現。", "pending_text": "影像已拼合並送出。門正在辨識……"}]'::jsonb, array['s_scan'], array['prompt'])), secrets = secrets || '{"s_scan": {"fallback": "GATE-B", "reveal": {"overlay": "totem", "glyphs": [4, 5, 6]}, "success": "卡片上方浮現一座圖騰。"}, "s_rings": {"answer": "4,5,6", "hints": ["答案只出現在 AR 圖騰上。"], "success": "門環依序歸位。", "wrong": "門環彈回原位。"}, "hotspots": {"photo_slot": {"text": "照片嵌進凹槽剛剛好。門內傳來機械聲。", "grant": {"flags": {"photo_used": true}, "items": [{"key": "gate_mark", "name": "門的刻痕", "desc": "你在第 3 天拿到的東西，在第 7 天被用上了。", "data": {"hidden": true}}]}}, "side_room": {"text": "柱子後方有一間沒有標示的小房間。牆上有一張地圖的一角。", "grant": {"items": [{"key": "map_fragment", "name": "地圖殘片", "desc": "標示著一個不在這十個區域裡的位置。", "data": {"hidden": true}}]}}}, "s_hands": {"hints": ["一雙手不夠。", "找朋友來幫忙：每一格請一個人把手放在發光的線上拍下來（同一個人拍好幾格也可以）。", "30 格全部拍完，按「拼合影像」，手就會拼出門的形狀。"]}, "a_peek": {"answer": "7291", "success": "牆後有東西動了。"}}'::jsonb, updated_at = now() where day = 7;

select '集結之手已改為 30 格' as status;

-- ===== migrations/20261108000019_admin_test_only.sql =====
-- 管理者只負責「管理」與「測試」：不再擁有正式玩家檔案
-- 正式檔案只屬於壽星（observer@p030.game）；管理者登入遊戲頁面時一律使用測試檔案（模擬時間、不推播、不影響正式進度）
create or replace function public.bootstrap() returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare uid uuid := auth.uid(); em text := lower(coalesce(auth.jwt() ->> 'email', '')); adm boolean; invited boolean; prof jsonb; tp uuid; bday date;
begin
  if uid is null then raise exception 'P030_NOT_SIGNED_IN' using errcode = '42501'; end if;
  if exists (select 1 from public.admin_emails where lower(email) = em) then
    insert into public.admins (user_id) values (uid) on conflict do nothing;
  end if;
  adm := exists (select 1 from public.admins where user_id = uid);
  invited := not adm and exists (select 1 from public.allowed_players where lower(email) = em);
  if invited then
    insert into public.profiles (user_id, label) values (uid, em) on conflict do nothing;
  end if;
  -- 管理者第一次進遊戲頁面：自動建立一份測試檔案，模擬時間＝第 1 天早上 10:00
  if adm and not exists (select 1 from public.profiles where user_id = uid and is_test) then
    select birthday into bday from public.settings where id = 1;
    insert into public.profiles (user_id, is_test, label, sim_offset)
    values (uid, true, '測試檔案',
            case when bday is null then null else (((bday - 10)::timestamp + time '10:00') at time zone 'Asia/Taipei') - now() end)
    returning id into tp;
    perform private.refresh(tp);
  end if;
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'is_test', is_test, 'label', label) order by is_test, created_at), '[]')
    into prof from public.profiles where user_id = uid and (is_test or not adm);
  return jsonb_build_object('is_admin', adm, 'allowed', adm or invited, 'email', em, 'profiles', prof);
end $$;

-- 清除管理者先前誤建的正式檔案（含其進度紀錄），並把管理者信箱移出玩家名單
do $$
begin
  perform set_config('p030.purge_test', 'on', true);
  delete from public.profiles pf using public.admins a where pf.user_id = a.user_id and not pf.is_test;
  delete from public.allowed_players ap where lower(ap.email) in (select lower(email) from public.admin_emails);
  perform set_config('p030.purge_test', 'off', true);
end $$;

-- ===== migrations/20261108000020_test_jump.sql =====
-- 測試：直接選區。清空這份測試檔案 → 前面各區以「準時完成」帶過 → 模擬時間跳到該區當天 10:00（或自訂開放時間）
create or replace function public.admin_test_jump(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare k int; t timestamptz; s public.settings;
begin
  perform private.assert_test(p);
  if d is null or d < 1 or d > 11 then raise exception 'P030_BAD_DAY'; end if;
  s := private.settings();
  perform public.admin_test_reset(p);
  for k in 1 .. d loop
    -- 當天 10:00；若管理者自訂了較晚的開放時間，就用開放後 1 分鐘
    t := greatest(((s.birthday - 10 + (k - 1))::timestamp + time '10:00') at time zone s.tz,
                  (private.level_window(k)).open_at + interval '1 minute');
    update public.profiles set sim_offset = t - now() where id = p;
    perform private.refresh(p);
    if k < d then perform private.complete_level(p, k, t); end if;
  end loop;
  return private.state(p);
end $$;

revoke all on function public.admin_test_jump(uuid, int) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.admin_test_jump(uuid, int) from anon';
    execute 'grant execute on function public.admin_test_jump(uuid, int) to authenticated';
  end if;
end $$;

-- ===== migrations/20261108000021_day2_redesign.sql =====
-- PROJECT 030 · 第 2 區「頻率」改版：
--   第 1 關 訊號解析：調頻 → 聽深海錄音，數出有幾種聲音
--   第 2 關 亂碼：注音鍵盤亂碼「5l3j35 al au q9 5l4」→ 找五隻貓咪拍照（管理者審核）
--   第 3 關 笑聲頻率：講笑話給朋友聽並錄音（管理者審核）
update public.levels set config = '{"notify":{"new":"一段不明訊號正在重複播放。來源：第 02 區。","pending":"訊號仍在等待回應。","expiring":"頻道將於午夜關閉。"},"scene":{"theme":"radio","light":"on","props":["radio","antenna","desk","window"],"hotspots":[{"id":"drawer","x":76,"y":80,"label":"抽屜"},{"id":"c_log","x":51,"y":57,"label":"收音機","clue":[{"type":"log","lines":["廣播紀錄 23:10 —— 收到片段訊號","附註：訊號是倒著傳來的。","內容：「7.301」"]}]},{"id":"c_keys","x":20,"y":34,"label":"牆上的舊貼紙","clue":[{"type":"note","text":"一張泛黃的鍵盤貼紙。\n每個英文字母旁邊，都還印著一個小小的符號：ㄅ、ㄆ、ㄇ、ㄈ……\n數字鍵 3、4、6、7 上印著的，是聲調。"}]}]},"variants":[{"id":"dim","when":{"flag":"lab_dark"},"scene":{"light":"dim"},"intro":["接入室沒有恢復電力，這裡的燈也比應該的暗。","收音機靠電池運轉。"]}],"intro":["收音機自己開著。","只有雜訊。"],"steps":[{"id":"s_intro","type":"story","text":["收音機自己開著，只有雜訊。","系統：「請找出訊號源的頻率。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_tune","type":"dial","title":"調頻","dials":4,"format":"###.#","stage":1,"stage_title":"訊號解析","prompt":"調查畫面裡的收音機，轉動旋鈕對準頻率。"},{"id":"s_signal","type":"story","text":["雜訊退去，一段從深海傳來的錄音開始播放。","系統：「訊號裡混了好幾種聲音。分離前，需要知道一共有幾種。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_count","type":"listen","title":"訊號分離","length":1,"stage":1,"stage_title":"訊號解析","prompt":"仔細聽完整段錄音。裡面一共出現了幾「種」聲音？（背景的海潮不算）"},{"id":"s_print","type":"story","text":["分離完成的瞬間，收音機旁的印表機自己動了起來。","吐出來的紙上，只有一行看不懂的字。"],"stage":2,"stage_title":"亂碼"},{"id":"s_decode","type":"text","title":"亂碼","placeholder":"翻譯成一句話","stage":2,"stage_title":"亂碼","clue":[{"type":"log","lines":["［自動列印・來源：第 02 頻道］","","5l3j35 al au q9 5l4","","附註：發送者用的，不是你習慣的那種打字方式。"]}],"prompt":"這行字其實是一句話。它在說什麼？"},{"id":"s_cats","type":"evidence","title":"執行指令","kinds":["photo"],"gate":true,"stage":2,"stage_title":"亂碼","prompt":"照紙上說的去做。完成後，上傳照片。","pending_text":"照片已送出。觀察站正在一隻一隻地數……"},{"id":"s_laugh","type":"story","text":["照片傳回的瞬間，訊號裡多了一段很短、很亮的頻率。","系統：「偵測到未知頻率。分類：笑聲。」","系統：「觀察站需要一段新的樣本才能完成校準。」"],"speaker":"SYSTEM","stage":3,"stage_title":"笑聲頻率"},{"id":"s_joke","type":"evidence","title":"笑聲頻率","kinds":["audio"],"gate":true,"stage":3,"stage_title":"笑聲頻率","prompt":"這段笑聲必須由你引起，發生在另一個人身上。把整個過程錄下來。","pending_text":"笑聲已送出。觀察站正在校準頻率……"},{"id":"s_watcher","type":"story","text":["門口站著一個人，穿著舊式的值班外套。","「我聽見有人在笑。」他說。「很久沒聽到了。」","「我是這裡的守夜人。我們明天見。」"],"speaker":"守夜人","when":{"not":{"flag":"lab_dark"}},"stage":3,"stage_title":"笑聲頻率"},{"id":"s_watcher_dark","type":"story","text":["走廊的另一端有手電筒的光晃了一下。","「……剛剛是誰在笑？」有人說。「這裡太暗了，明天吧。」"],"speaker":"？","when":{"flag":"lab_dark"},"stage":3,"stage_title":"笑聲頻率"}],"epilogue":["頻率已鎖定。","你取得了第二個符號。"]}'::jsonb, secrets = '{"s_tune":{"answer":"1037","hints":["紀錄說訊號是倒著傳來的。","把「7.301」倒過來讀。"],"success":"雜訊消失了。","wrong":"只有雜訊。"},"hotspots":{"drawer":{"text":"抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。","grant":{"items":[{"key":"freq_table","name":"頻率表","desc":"「030.0 —— 不要調到這裡」。","data":{"hidden":true}}]}}},"s_count":{"answer":"6","hints":["同一種聲音，可能出現不只一次。重複的只算一種。","戴上耳機，從頭聽一次，每聽到一種新的聲音就記下來。","聲納、氣泡、心跳、鯨魚、貓叫、音樂盒——一共 6 種。"],"success":"分離完成：聲納・氣泡・心跳・鯨歌・貓叫・音樂盒。","wrong":"數量不符。訊號又混在一起了。"},"s_decode":{"answer":["找五隻貓咪拍照","找5隻貓咪拍照","找五隻貓拍照","找5隻貓拍照","找五只猫咪拍照","找五隻貓咪合照","找五隻貓咪","五隻貓咪拍照","ㄓㄠˇㄨˇㄓㄇㄠㄇㄧㄆㄞㄓㄠˋ"],"hints":["這不是亂碼。是有人用另一種鍵盤，打了一句中文。","想像用「注音」輸入法打字：5 是ㄓ、l 是ㄠ、3 是三聲，空白是一聲。","5l3＝找、j3＝五、5＝隻、al＝貓、au＝咪、q9＝拍、5l4＝照。"],"success":"解碼完成：「找五隻貓咪拍照」。","wrong":"翻出來的句子不太對。"},"s_cats":{"hints":["紙上的那句話，就是你要做的事。","五隻要在同一張照片裡（盡量都入鏡）。","貓咪咖啡廳，是最容易一次遇見五隻貓的地方。"]},"s_joke":{"hints":["笑聲不能是你自己的。","講一個笑話給身邊的朋友聽，冷笑話也算。","把你講笑話的過程和朋友的反應一起錄下來，上傳。"]},"a_note":{"answer":["等待訊號"],"hints":["看每一行的第一個字。"],"success":"紙條背面寫著：「我會再回來。」","wrong":"好像不是這樣讀的。"}}'::jsonb, updated_at = now() where day = 2;

select '第 2 區已改版' as status;

-- ===== migrations/20261108000022_day2_barcode_listen.sql =====
-- PROJECT 030 · 第 2 區「頻率」改版（含衛生紙條碼；可直接覆蓋，不需要先貼 21）：
--   第 1 關 訊號解析：調頻 → 聽深海錄音，邊聽邊標記，數出有幾種聲音
--   第 2 關 亂碼：印表機耗材序號（倍潔雅衛生紙條碼）→ 注音鍵盤亂碼「5l3j35 al au q9 5l4」→ 找五隻貓咪拍照（管理者審核）
--   第 3 關 笑聲頻率：講笑話給朋友聽並錄音（管理者審核）
update public.levels set config = '{"notify":{"new":"一段不明訊號正在重複播放。來源：第 02 區。","pending":"訊號仍在等待回應。","expiring":"頻道將於午夜關閉。"},"scene":{"theme":"radio","light":"on","props":["radio","antenna","desk","window"],"hotspots":[{"id":"drawer","x":76,"y":80,"label":"抽屜"},{"id":"c_log","x":51,"y":57,"label":"收音機","clue":[{"type":"log","lines":["廣播紀錄 23:10 —— 收到片段訊號","附註：訊號是倒著傳來的。","內容：「7.301」"]}]},{"id":"c_serial","x":88,"y":46,"label":"印表機旁的便條","clue":[{"type":"note","text":"有人在便條上潦草地寫著：\n「耗材序號：13 位數字。」\n「它印在一樣你每天都會用、用完就會消失的白色東西上。」"}]},{"id":"c_keys","x":20,"y":34,"label":"牆上的舊貼紙","clue":[{"type":"note","text":"一張泛黃的鍵盤貼紙。\n每個英文字母旁邊，都還印著一個小小的符號：ㄅ、ㄆ、ㄇ、ㄈ……\n數字鍵 3、4、6、7 上印著的，是聲調。"}]}]},"variants":[{"id":"dim","when":{"flag":"lab_dark"},"scene":{"light":"dim"},"intro":["接入室沒有恢復電力，這裡的燈也比應該的暗。","收音機靠電池運轉。"]}],"intro":["收音機自己開著。","只有雜訊。"],"steps":[{"id":"s_intro","type":"story","text":["收音機自己開著，只有雜訊。","系統：「請找出訊號源的頻率。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_tune","type":"dial","title":"調頻","dials":4,"format":"###.#","stage":1,"stage_title":"訊號解析","prompt":"調查畫面裡的收音機，轉動旋鈕對準頻率。"},{"id":"s_signal","type":"story","text":["雜訊退去，一段從深海傳來的錄音開始播放。","系統：「訊號裡混了好幾種聲音。分離前，需要知道一共有幾種。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_count","type":"listen","title":"訊號分離","stage":1,"stage_title":"訊號解析","prompt":"播放錄音。每聽到一種「新的」聲音，就點一下「標記」。聽完後送出：一共有幾種？（背景的海潮不算）"},{"id":"s_print","type":"story","text":["分離完成的瞬間，收音機旁的印表機亮起了紅燈。","螢幕顯示：「紙張耗盡。請輸入耗材序號以繼續列印。」"],"stage":2,"stage_title":"亂碼"},{"id":"s_serial","type":"keypad","title":"耗材序號","length":13,"stage":2,"stage_title":"亂碼","prompt":"輸入 13 位耗材序號。（畫面裡有人留下了線索）"},{"id":"s_printed","type":"story","text":["序號吻合。印表機開始運轉——","吐出來的紙上，只有一行看不懂的字。"],"stage":2,"stage_title":"亂碼"},{"id":"s_decode","type":"text","title":"亂碼","placeholder":"翻譯成一句話","stage":2,"stage_title":"亂碼","clue":[{"type":"log","lines":["［自動列印・來源：第 02 頻道］","","5l3j35 al au q9 5l4","","附註：發送者用的，不是你習慣的那種打字方式。"]}],"prompt":"這行字其實是一句話。它在說什麼？"},{"id":"s_cats","type":"evidence","title":"執行指令","kinds":["photo"],"gate":true,"stage":2,"stage_title":"亂碼","prompt":"照紙上說的去做。完成後，上傳照片。","pending_text":"照片已送出。觀察站正在一隻一隻地數……"},{"id":"s_laugh","type":"story","text":["照片傳回的瞬間，訊號裡多了一段很短、很亮的頻率。","系統：「偵測到未知頻率。分類：笑聲。」","系統：「觀察站需要一段新的樣本才能完成校準。」"],"speaker":"SYSTEM","stage":3,"stage_title":"笑聲頻率"},{"id":"s_joke","type":"evidence","title":"笑聲頻率","kinds":["audio"],"gate":true,"stage":3,"stage_title":"笑聲頻率","prompt":"這段笑聲必須由你引起，發生在另一個人身上。把整個過程錄下來。","pending_text":"笑聲已送出。觀察站正在校準頻率……"},{"id":"s_watcher","type":"story","text":["門口站著一個人，穿著舊式的值班外套。","「我聽見有人在笑。」他說。「很久沒聽到了。」","「我是這裡的守夜人。我們明天見。」"],"speaker":"守夜人","when":{"not":{"flag":"lab_dark"}},"stage":3,"stage_title":"笑聲頻率"},{"id":"s_watcher_dark","type":"story","text":["走廊的另一端有手電筒的光晃了一下。","「……剛剛是誰在笑？」有人說。「這裡太暗了，明天吧。」"],"speaker":"？","when":{"flag":"lab_dark"},"stage":3,"stage_title":"笑聲頻率"}],"epilogue":["頻率已鎖定。","你取得了第二個符號。"]}'::jsonb, secrets = '{"s_tune":{"answer":"1037","hints":["紀錄說訊號是倒著傳來的。","把「7.301」倒過來讀。"],"success":"雜訊消失了。","wrong":"只有雜訊。"},"hotspots":{"drawer":{"text":"抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。","grant":{"items":[{"key":"freq_table","name":"頻率表","desc":"「030.0 —— 不要調到這裡」。","data":{"hidden":true}}]}}},"s_count":{"answer":"6","hints":["同一種聲音，可能出現不只一次。重複的只算一種。","戴上耳機，從頭聽一次，每聽到一種新的聲音就記下來。","聲納、氣泡、心跳、鯨魚、貓叫、音樂盒——一共 6 種。"],"success":"分離完成：聲納・氣泡・心跳・鯨歌・貓叫・音樂盒。","wrong":"數量不符。訊號又混在一起了。"},"s_serial":{"answer":"4710901898847","hints":["每天都會用、用完就會消失、白色的……","它通常放在廁所或浴室。","找到倍潔雅衛生紙的包裝，輸入條碼下方的 13 個數字。"],"success":"序號吻合。印表機開始運轉。","wrong":"序號不符。印表機拒絕列印。"},"s_decode":{"answer":["找五隻貓咪拍照","找5隻貓咪拍照","找五隻貓拍照","找5隻貓拍照","找五只猫咪拍照","找五隻貓咪合照","找五隻貓咪","五隻貓咪拍照","ㄓㄠˇㄨˇㄓㄇㄠㄇㄧㄆㄞㄓㄠˋ"],"hints":["這不是亂碼。是有人用另一種鍵盤，打了一句中文。","想像用「注音」輸入法打字：5 是ㄓ、l 是ㄠ、3 是三聲，空白是一聲。","5l3＝找、j3＝五、5＝隻、al＝貓、au＝咪、q9＝拍、5l4＝照。"],"success":"解碼完成：「找五隻貓咪拍照」。","wrong":"翻出來的句子不太對。"},"s_cats":{"hints":["紙上的那句話，就是你要做的事。","五隻要在同一張照片裡（盡量都入鏡）。","貓咪咖啡廳，是最容易一次遇見五隻貓的地方。"]},"s_joke":{"hints":["笑聲不能是你自己的。","講一個笑話給身邊的朋友聽，冷笑話也算。","把你講笑話的過程和朋友的反應一起錄下來，上傳。"]},"a_note":{"answer":["等待訊號"],"hints":["看每一行的第一個字。"],"success":"紙條背面寫著：「我會再回來。」","wrong":"好像不是這樣讀的。"}}'::jsonb, updated_at = now() where day = 2;

select '第 2 區已改版' as status;

-- ===== migrations/20261108000023_day2_five_cats.sql =====
-- PROJECT 030 · 第 2 區「頻率」改版（五隻貓分別拍、一起審核；可直接覆蓋，不需要先貼 21／22）：
--   第 1 關 訊號解析：調頻 → 聽深海錄音，邊聽邊標記，數出有幾種聲音
--   第 2 關 亂碼：印表機耗材序號（倍潔雅衛生紙條碼）→ 注音鍵盤亂碼「5l3j35 al au q9 5l4」→ 找五隻貓咪，一格一張，五張合併後一起審核
--   第 3 關 笑聲頻率：講笑話給朋友聽並錄音（管理者審核）
update public.levels set config = '{"notify":{"new":"一段不明訊號正在重複播放。來源：第 02 區。","pending":"訊號仍在等待回應。","expiring":"頻道將於午夜關閉。"},"scene":{"theme":"radio","light":"on","props":["radio","antenna","desk","window"],"hotspots":[{"id":"drawer","x":76,"y":80,"label":"抽屜"},{"id":"c_log","x":51,"y":57,"label":"收音機","clue":[{"type":"log","lines":["廣播紀錄 23:10 —— 收到片段訊號","附註：訊號是倒著傳來的。","內容：「7.301」"]}]},{"id":"c_serial","x":88,"y":46,"label":"印表機旁的便條","clue":[{"type":"note","text":"有人在便條上潦草地寫著：\n「耗材序號：13 位數字。」\n「它印在一樣你每天都會用、用完就會消失的白色東西上。」"}]},{"id":"c_keys","x":20,"y":34,"label":"牆上的舊貼紙","clue":[{"type":"note","text":"一張泛黃的鍵盤貼紙。\n每個英文字母旁邊，都還印著一個小小的符號：ㄅ、ㄆ、ㄇ、ㄈ……\n數字鍵 3、4、6、7 上印著的，是聲調。"}]}]},"variants":[{"id":"dim","when":{"flag":"lab_dark"},"scene":{"light":"dim"},"intro":["接入室沒有恢復電力，這裡的燈也比應該的暗。","收音機靠電池運轉。"]}],"intro":["收音機自己開著。","只有雜訊。"],"steps":[{"id":"s_intro","type":"story","text":["收音機自己開著，只有雜訊。","系統：「請找出訊號源的頻率。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_tune","type":"dial","title":"調頻","dials":4,"format":"###.#","stage":1,"stage_title":"訊號解析","prompt":"調查畫面裡的收音機，轉動旋鈕對準頻率。"},{"id":"s_signal","type":"story","text":["雜訊退去，一段從深海傳來的錄音開始播放。","系統：「訊號裡混了好幾種聲音。分離前，需要知道一共有幾種。」"],"speaker":"SYSTEM","stage":1,"stage_title":"訊號解析"},{"id":"s_count","type":"listen","title":"訊號分離","stage":1,"stage_title":"訊號解析","prompt":"播放錄音。每聽到一種「新的」聲音，就點一下「標記」。聽完後送出：一共有幾種？（背景的海潮不算）"},{"id":"s_print","type":"story","text":["分離完成的瞬間，收音機旁的印表機亮起了紅燈。","螢幕顯示：「紙張耗盡。請輸入耗材序號以繼續列印。」"],"stage":2,"stage_title":"亂碼"},{"id":"s_serial","type":"keypad","title":"耗材序號","length":13,"stage":2,"stage_title":"亂碼","prompt":"輸入 13 位耗材序號。（畫面裡有人留下了線索）"},{"id":"s_printed","type":"story","text":["序號吻合。印表機開始運轉——","吐出來的紙上，只有一行看不懂的字。"],"stage":2,"stage_title":"亂碼"},{"id":"s_decode","type":"text","title":"亂碼","placeholder":"翻譯成一句話","stage":2,"stage_title":"亂碼","clue":[{"type":"log","lines":["［自動列印・來源：第 02 頻道］","","5l3j35 al au q9 5l4","","附註：發送者用的，不是你習慣的那種打字方式。"]}],"prompt":"這行字其實是一句話。它在說什麼？"},{"id":"s_cats","type":"evidence","title":"執行指令","kinds":["photo"],"gate":true,"photoset":{"count":5,"label":"第 {n} 隻"},"stage":2,"stage_title":"亂碼","prompt":"照紙上說的去做。一格放一張照片，五格都完成後，一起送出審核。","pending_text":"五張照片已送出。觀察站正在一隻一隻地數……"},{"id":"s_laugh","type":"story","text":["照片傳回的瞬間，訊號裡多了一段很短、很亮的頻率。","系統：「偵測到未知頻率。分類：笑聲。」","系統：「觀察站需要一段新的樣本才能完成校準。」"],"speaker":"SYSTEM","stage":3,"stage_title":"笑聲頻率"},{"id":"s_joke","type":"evidence","title":"笑聲頻率","kinds":["audio"],"gate":true,"stage":3,"stage_title":"笑聲頻率","prompt":"這段笑聲必須由你引起，發生在另一個人身上。把整個過程錄下來。","pending_text":"笑聲已送出。觀察站正在校準頻率……"},{"id":"s_watcher","type":"story","text":["門口站著一個人，穿著舊式的值班外套。","「我聽見有人在笑。」他說。「很久沒聽到了。」","「我是這裡的守夜人。我們明天見。」"],"speaker":"守夜人","when":{"not":{"flag":"lab_dark"}},"stage":3,"stage_title":"笑聲頻率"},{"id":"s_watcher_dark","type":"story","text":["走廊的另一端有手電筒的光晃了一下。","「……剛剛是誰在笑？」有人說。「這裡太暗了，明天吧。」"],"speaker":"？","when":{"flag":"lab_dark"},"stage":3,"stage_title":"笑聲頻率"}],"epilogue":["頻率已鎖定。","你取得了第二個符號。"]}'::jsonb, secrets = '{"s_tune":{"answer":"1037","hints":["紀錄說訊號是倒著傳來的。","把「7.301」倒過來讀。"],"success":"雜訊消失了。","wrong":"只有雜訊。"},"hotspots":{"drawer":{"text":"抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。","grant":{"items":[{"key":"freq_table","name":"頻率表","desc":"「030.0 —— 不要調到這裡」。","data":{"hidden":true}}]}}},"s_count":{"answer":"6","hints":["同一種聲音，可能出現不只一次。重複的只算一種。","戴上耳機，從頭聽一次，每聽到一種新的聲音就記下來。","聲納、氣泡、心跳、鯨魚、貓叫、音樂盒——一共 6 種。"],"success":"分離完成：聲納・氣泡・心跳・鯨歌・貓叫・音樂盒。","wrong":"數量不符。訊號又混在一起了。"},"s_serial":{"answer":"4710901898847","hints":["每天都會用、用完就會消失、白色的……","它通常放在廁所或浴室。","找到倍潔雅衛生紙的包裝，輸入條碼下方的 13 個數字。"],"success":"序號吻合。印表機開始運轉。","wrong":"序號不符。印表機拒絕列印。"},"s_decode":{"answer":["找五隻貓咪拍照","找5隻貓咪拍照","找五隻貓拍照","找5隻貓拍照","找五只猫咪拍照","找五隻貓咪合照","找五隻貓咪","五隻貓咪拍照","ㄓㄠˇㄨˇㄓㄇㄠㄇㄧㄆㄞㄓㄠˋ"],"hints":["這不是亂碼。是有人用另一種鍵盤，打了一句中文。","想像用「注音」輸入法打字：5 是ㄓ、l 是ㄠ、3 是三聲，空白是一聲。","5l3＝找、j3＝五、5＝隻、al＝貓、au＝咪、q9＝拍、5l4＝照。"],"success":"解碼完成：「找五隻貓咪拍照」。","wrong":"翻出來的句子不太對。"},"s_cats":{"hints":["紙上的那句話，就是你要做的事。","五格各放一隻不同的貓，可以分次、在不同地方拍。","貓咪咖啡廳，是最容易一次遇見五隻貓的地方。"]},"s_joke":{"hints":["笑聲不能是你自己的。","講一個笑話給身邊的朋友聽，冷笑話也算。","把你講笑話的過程和朋友的反應一起錄下來，上傳。"]},"a_note":{"answer":["等待訊號"],"hints":["看每一行的第一個字。"],"success":"紙條背面寫著：「我會再回來。」","wrong":"好像不是這樣讀的。"}}'::jsonb, updated_at = now() where day = 2;

select '第 2 區已改版' as status;

-- ===== 管理者 =====
insert into public.admin_emails (email) values ('ja9705110@gmail.com') on conflict do nothing;
