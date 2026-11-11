-- 幸福券：讓逾期的那一區重新開啟，回去完成它、看見那一天的回顧，之後再回到今天
-- 例：11/11 太累只破到一半 → 11/12 收到幸福券 → 回去把鏡廳完成
create table if not exists public.happy_tickets (
  profile_id uuid not null references public.profiles on delete cascade,
  day        int  not null check (day between 1 and 10),
  granted_at timestamptz not null default now(),
  until      timestamptz not null,           -- 使用後，這一區開放到這個時間（不含）
  used_at    timestamptz,
  note       text,
  primary key (profile_id, day)
);
alter table public.happy_tickets enable row level security;
do $$ begin
  create policy own_tickets on public.happy_tickets for select
    using (public.is_admin() or exists (select 1 from public.profiles pf where pf.id = profile_id and pf.user_id = auth.uid()));
exception when duplicate_object then null; end $$;

-- missed_at 一旦寫入不可回寫——唯一的例外：測試檔案重置、使用幸福券
create or replace function private.guard_missed() returns trigger language plpgsql as $$
begin
  if old.missed_at is not null and (new.missed_at is distinct from old.missed_at)
     and coalesce(current_setting('p030.purge_test', true), '') <> 'on'
     and coalesce(current_setting('p030.happy_ticket', true), '') <> 'on' then
    raise exception 'P030_TIME_IS_IRREVERSIBLE';
  end if;
  return new;
end $$;

-- 用了幸福券、還在期限內的那一區，不會被標成逾期
create or replace function private.refresh(p uuid) returns void
language plpgsql as $$
declare t timestamptz; l public.levels; w record; pl public.player_levels; tk public.happy_tickets;
begin
  t := private.game_now(p);
  for l in select * from public.levels order by day loop
    insert into public.player_levels (profile_id, day) values (p, l.day) on conflict do nothing;
    select * into pl from public.player_levels where profile_id = p and day = l.day for update;
    select * into w from private.level_window(l.day);

    if pl.status = 'COMPLETED' or pl.missed_at is not null then continue; end if;
    if t < w.open_at then continue; end if;

    if t >= w.close_at then
      select * into tk from public.happy_tickets where profile_id = p and day = l.day and used_at is not null;
      if tk.profile_id is not null and t < tk.until then continue; end if;
      perform private.mark_missed(p, l.day, case when tk.profile_id is not null then tk.until else w.close_at end);
    elsif pl.status = 'LOCKED' then
      update public.player_levels set status = 'AVAILABLE' where profile_id = p and day = l.day;
    end if;
  end loop;
end $$;

-- 使用幸福券：把那一區恢復成逾期前的樣子（已完成的關卡都還在），重新開放到期限
create or replace function public.use_happy_ticket(p uuid, d int) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; tk public.happy_tickets; pl public.player_levels; restored jsonb;
begin
  perform private.assert_profile(p);
  t := private.game_now(p);
  select * into tk from public.happy_tickets where profile_id = p and day = d for update;
  if tk.profile_id is null then raise exception 'P030_NO_TICKET'; end if;
  if tk.used_at is not null then return jsonb_build_object('ok', true, 'already', true, 'until', tk.until); end if;
  if t >= tk.until then raise exception 'P030_TICKET_EXPIRED'; end if;
  select * into pl from public.player_levels where profile_id = p and day = d for update;
  if pl.status = 'COMPLETED' then raise exception 'P030_ALREADY_DONE'; end if;
  update public.happy_tickets set used_at = t where profile_id = p and day = d;
  if pl.missed_at is not null then
    restored := coalesce(pl.data -> 'main_archive', '{"done":{},"attempts":{},"hints":{},"reveals":{},"started":{}}'::jsonb);
    perform set_config('p030.happy_ticket', 'on', true);
    update public.player_levels
       set missed_at = null, variant = null, data = restored,
           status = case when restored -> 'done' <> '{}'::jsonb or pl.started_at is not null then 'IN_PROGRESS' else 'AVAILABLE' end
     where profile_id = p and day = d;
    perform set_config('p030.happy_ticket', '', true);
    update public.evidence set status = 'NEEDS_MORE' where profile_id = p and day = d and status = 'OVERDUE';
    -- 收回「熄燈」的通知
    update public.notifications set read_at = coalesce(read_at, t) where profile_id = p and dedupe_key = 'MISSED:' || d;
  end if;
  perform private.log(p, t, 'TICKET', d, jsonb_build_object('until', tk.until));
  return jsonb_build_object('ok', true, 'until', tk.until);
end $$;

-- 管理者：送出幸福券（預設開放到對方「今天」結束）
create or replace function public.admin_grant_ticket(p uuid, d int, until_at timestamptz default null, msg text default null) returns jsonb
language plpgsql security definer set search_path = public, private as $$
declare t timestamptz; w record; g int; u timestamptz; l public.levels;
begin
  if not public.is_admin() then raise exception 'P030_FORBIDDEN' using errcode = '42501'; end if;
  t := private.game_now(p);
  select * into l from public.levels where day = d;
  if l.day is null or d > 10 then raise exception 'P030_BAD_ANSWER'; end if;
  if exists (select 1 from public.player_levels where profile_id = p and day = d and status = 'COMPLETED') then raise exception 'P030_ALREADY_DONE'; end if;
  -- 預設期限：對方遊戲時間「今天」的 24:00
  select day into g from public.levels lv where (private.level_window(lv.day)).open_at <= t and lv.day <= 10 order by lv.day desc limit 1;
  select * into w from private.level_window(greatest(coalesce(g, d), d));
  u := coalesce(until_at, w.close_at);
  insert into public.happy_tickets (profile_id, day, granted_at, until, note) values (p, d, t, u, msg)
  on conflict (profile_id, day) do update set granted_at = excluded.granted_at, until = excluded.until, used_at = null, note = excluded.note;
  perform private.notify(p, t, 'SPECIAL_EVENT', 'TICKET:' || d || ':' || extract(epoch from t)::bigint, d, '你收到一張幸福券',
    coalesce(msg, '累了也沒關係。用這張券，回去把「' || l.title || '」走完吧，走完再回來就好。'));
  return jsonb_build_object('ok', true, 'until', u);
end $$;

revoke all on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) from public;
do $$ begin
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) from anon';
    execute 'grant execute on function public.use_happy_ticket(uuid, int), public.admin_grant_ticket(uuid, int, timestamptz, text) to authenticated';
    execute 'grant select on public.happy_tickets to authenticated';
  end if;
end $$;

-- 11/12：送給壽星一張第 4 區（鏡廳）的幸福券，開放到 11/12 23:59
do $$
declare pr record; s public.settings; l public.levels; w record;
begin
  s := private.settings();
  select * into l from public.levels where day = 4;
  select * into w from private.level_window(5);
  for pr in select pf.id from public.profiles pf where not pf.is_test and not exists (select 1 from public.admins a where a.user_id = pf.user_id) loop
    if exists (select 1 from public.player_levels where profile_id = pr.id and day = 4 and status = 'COMPLETED') then continue; end if;
    if exists (select 1 from public.happy_tickets where profile_id = pr.id and day = 4) then continue; end if;
    insert into public.happy_tickets (profile_id, day, granted_at, until, note)
    values (pr.id, 4, now(), w.close_at, '昨天太累了也沒關係。用這張券，回去把鏡廳走完吧——走完再回到今天就好。');
    perform private.notify(pr.id, now(), 'SPECIAL_EVENT', 'TICKET:4', 4, '你收到一張幸福券',
      '昨天太累了也沒關係。用這張券，回去把鏡廳走完吧——走完再回到今天就好。');
  end loop;
end $$;

select '幸福券已安裝' as status;

-- 讓 API 立刻認得新的函式
notify pgrst, 'reload schema';
