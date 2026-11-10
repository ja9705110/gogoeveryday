-- PROJECT 030 · 第 3 天（溫室）花盆標籤改寫；「對照速查表」改成第二個提示
update public.levels set
  config = jsonb_set(config, '{scene,hotspots}', (
    select jsonb_agg(case when h ->> 'id' = 'c_pot' then h || jsonb_build_object('clue', '[{"type":"note","text":"標籤上的字很小，像是匆忙寫下的：\n「不知道吃了什麼，好像消化不良……」\n「我記得《居家保健小百科》好像放在廚房的某個櫃子裡。」"}]'::jsonb) else h end order by o)
    from jsonb_array_elements(config #> '{scene,hotspots}') with ordinality x(h, o))),
  secrets = jsonb_set(secrets, '{s_recipe,hints}', '["翻開《居家保健小百科》，找到「消化不良」的複方調配，看看用了哪幾支精油。","對照速查表：用法 × 肌膚敏感度，數一數每一欄。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"]'::jsonb),
  updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '花盆標籤與提示已更新' as status;
