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
