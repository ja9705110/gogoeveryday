-- PROJECT 030 · 第 3 天「消化系統調配」提示順序：速查表 → 翻開小百科 → 統計
update public.levels set secrets = jsonb_set(secrets, '{s_recipe,hints}', '["對照速查表：用法 × 肌膚敏感度，數一數每一欄。","翻開《居家保健小百科》，找到「消化不良」的複方調配，看看用了哪幾支精油。","速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。"]'::jsonb), updated_at = now()
where day = 3 and config #>> '{scene,theme}' = 'greenhouse';

select '提示順序已更新' as status;
