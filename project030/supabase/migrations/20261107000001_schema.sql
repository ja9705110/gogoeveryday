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
