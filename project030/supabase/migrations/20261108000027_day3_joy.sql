-- PROJECT 030 · 第 3 天（溫室）第 3 關改為「歡樂養分」：和三個不同的人各拍一張一起扮鬼臉的合照（只能現場拍）
update public.levels set
  config = jsonb_set(config, '{steps}', (
    select jsonb_agg(case s ->> 'id' when 's_warm' then '{"id":"s_warm","type":"story","text":["調配完成。樣本的光穩定下來了，但溫室裡的植物還是垂著葉子。","系統：「偵測到養分不足。缺少的成分：歡樂。」","「植物需要三份不同的笑臉，才能重新長出葉子。」"],"speaker":"SYSTEM","stage":3,"stage_title":"歡樂養分"}'::jsonb when 's_people' then '{"id":"s_people","type":"evidence","title":"歡樂養分","kinds":["photo"],"gate":true,"photoset":{"count":3,"label":"第 {n} 份養分","live":true},"stage":3,"stage_title":"歡樂養分","prompt":"找三個不同的人，和每個人各拍一張「一起扮鬼臉」的合照，餵給植物。你也要在畫面裡。（只能用相機現場拍攝）","pending_text":"三份歡樂養分已送出。植物正在吸收……"}'::jsonb else s end order by o)
    from jsonb_array_elements(config -> 'steps') with ordinality x(s, o))),
  secrets = jsonb_set(secrets, '{s_people}', '{"hints":["養分不是肥料，是三張笑臉。","每一張照片裡，都要有你和另一個人，而且兩個人都在扮鬼臉。","找三個不同的人，各拍一張一起扮鬼臉的合照（自拍也可以），在格子裡用相機現場拍，三格都完成後一起送出。"]}'::jsonb),
  updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '第 3 天第 3 關已改為「歡樂養分」' as status;
