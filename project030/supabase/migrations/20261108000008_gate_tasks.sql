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
