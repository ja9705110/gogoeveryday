// PROJECT 030 · 每日三關（覆蓋 levels.mjs 的主線步驟與答案）
// 每天：第 1 關 熱身機關 → 第 2 關 主謎題 → 第 3 關 現實世界任務（gate：需管理者審核通過）
// 第 3 關不直接說要做什麼，提示由模糊到明確。

const S = (stage, stage_title) => ({ stage, stage_title });
const story = (id, text, extra = {}) => ({ id, type: 'story', text, ...extra });

export const stages = {
  // ───────── DAY 1 · 接入／身分建檔（暗中選出形象照風格） ─────────
  1: {
    scene: { hotspots: [
      { id: 'under_desk', x: 24, y: 82, label: '桌子底下' },
      { id: 'c_panel', x: 17, y: 41, label: '配電箱', clue: [{ type: 'note', text: '配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」' }] },
      { id: 'c_clock', x: 49, y: 21, label: '牆上的時鐘', clue: [{ type: 'clock', h: 10, m: 30, caption: '時鐘停住了。秒針一動也不動。' }] },
      { id: 'c_lock', x: 77, y: 54, label: '培養艙的鎖', clue: [{ type: 'note', text: '培養艙的鎖上刻著：\n「解鎖所需的兩樣東西，遺落在你世界的床邊。」\n「型號照抄。」\n「數字，依配電箱的規則。」' }] },
    ] },
    steps: [
      story('s_wake', ['本區電力異常。', '系統：「請先恢復電源。」'], { speaker: 'SYSTEM', ...S(1, '恢復電源') }),
      { id: 's_power', type: 'switches', title: '配電箱', count: 6, labels: ['1', '2', '3', '4', '5', '6'], ...S(1, '恢復電源'),
        prompt: '先調查上方畫面裡的配電箱，再撥動開關、拉下主閘。' },
      story('s_sample', ['燈亮了。培養艙的玻璃起霧，又慢慢變清。', '裡面有一個很小的東西。它沒有名字，只有編號：030。',
        '但培養艙被鎖住了。鎖上需要一組密碼。'], { speaker: 'SYSTEM', ...S(1, '恢復電源') }),
      { id: 's_lock', type: 'text', title: '培養艙的鎖', placeholder: '輸入密碼（英文＋數字）', ...S(1, '恢復電源'),
        prompt: '先調查畫面裡的培養艙，再輸入密碼。' },
      story('s_unlocked', ['鎖開了。培養艙的門緩緩滑開。', '系統：「樣本需要觀察。每天一次，什麼時候都可以。觀察的方式，由你決定。」'], { speaker: 'SYSTEM', ...S(1, '恢復電源') }),
      { id: 's_observe', type: 'observe', title: '第一次觀察', prompt: '前往「培養艙」選一種方式觀察它，再回到這裡。', ...S(1, '恢復電源') },
      story('s_id_intro', ['終端機：「新觀察員接入。開始建立身分檔案。」', '「請先確認你的觀察員編號。」'], { speaker: 'SYSTEM', ...S(2, '身分建檔') }),
      { id: 's_id', type: 'keypad', title: '觀察員編號', length: 4, prompt: '輸入你的觀察員編號。', ...S(2, '身分建檔') },
      story('s_calib', ['終端機：「身分確認。」', '「觀察員識別影像尚未建立。系統將依你的設定，生成一張存入檔案 030 的識別影像。」',
        '「這張影像會成為檔案裡的你。請依直覺設定，沒有正確答案。」'], { speaker: 'SYSTEM', ...S(2, '身分建檔') }),
      { id: 's_tone', type: 'choice', title: '校準 1／4・識別色調', flag: 'p_tone', ...S(2, '身分建檔'),
        text: ['檔案裡的你，應該是什麼顏色？'],
        options: [{ id: 'mono', label: '黑白・永恆', desc: '只留下光與影。' }, { id: 'film', label: '暖色・膠片', desc: '像一段被保存下來的午後。' },
                  { id: 'cool', label: '冷光・未來', desc: '金屬、霓虹、乾淨的線條。' }, { id: 'cover', label: '高彩・封面', desc: '鮮明、張揚，像雜誌封面上的人。' }] },
      { id: 's_outfit', type: 'choice', title: '校準 2／4・輪廓', flag: 'p_outfit', ...S(2, '身分建檔'),
        text: ['識別影像需要一個輪廓。你想以什麼樣子被記錄？'],
        options: [{ id: 'formal', label: '正式', desc: '西裝或套裝，像是要去領一個獎。' }, { id: 'smart', label: '俐落', desc: '襯衫、簡單的剪裁，乾淨就好。' },
                  { id: 'self', label: '本色', desc: '你平常最像自己的那一套衣服。' }, { id: 'bold', label: '大膽', desc: '平常不敢穿、但一直想試試看的。' }] },
      { id: 's_mood', type: 'choice', title: '校準 3／4・表情模組', flag: 'p_mood', ...S(2, '身分建檔'),
        text: ['檔案裡的你，看起來是什麼表情？'],
        options: [{ id: 'confident', label: '自信', desc: '直視鏡頭。' }, { id: 'gentle', label: '溫柔', desc: '像在對某個人笑。' },
                  { id: 'calm', label: '冷靜', desc: '安靜、不動聲色。' }, { id: 'playful', label: '玩心', desc: '有一點調皮。' }] },
      { id: 's_scene', type: 'choice', title: '校準 4／4・背景場域', flag: 'p_scene', ...S(2, '身分建檔'),
        text: ['識別影像要放在什麼樣的空間裡？'],
        options: [{ id: 'studio', label: '純色空間', desc: '什麼都沒有，只有你。' }, { id: 'city', label: '城市街角', desc: '有路燈、有人經過。' },
                  { id: 'retro', label: '復古房間', desc: '舊沙發、老燈、時間的味道。' }, { id: 'light', label: '光影抽象', desc: '光線和陰影切出你的輪廓。' }] },
      { id: 's_ref', type: 'evidence', title: '參考影像（可略過）', kinds: ['photo'], optional: true, ...S(2, '身分建檔'),
        prompt: '如果你心裡有一張「想變成這樣」的人物影像，可以上傳作為校準參考。沒有也沒關係。' },
      story('s_saved', ['終端機：「識別影像設定已寫入。」', '「影像將於稍後生成。」'], { speaker: 'SYSTEM', ...S(2, '身分建檔') }),
      story('s_drift', ['終端機突然閃爍：「警告。偵測到時間差。」', '「此區的時間，停在某一刻。你的世界卻仍在前進。」',
        '「培養艙無法在不同步的時間裡封存。」'], { speaker: 'SYSTEM', ...S(3, '時間同步') }),
      { id: 's_sync', type: 'evidence', title: '時間同步', kinds: ['photo'], gate: true, ...S(3, '時間同步'),
        prompt: '同步程序需要一份來自你世界的證據。（這個房間裡，有東西停住了。）',
        pending_text: '同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。' },
    ],
    secrets: {
      s_lock: { answer: ['A168888483'], hints: ['培養艙的鎖提到兩樣遺失的東西，它們在你世界的床邊。', '床邊有一支手機和一張收據。密碼 ＝ 手機型號 ＋ 收據上的統編。', '依配電箱的規則：1 不算。型號照抄，統編裡的 1 全部拿掉。'], success: '咔。培養艙的鎖彈開了。', wrong: '鎖沒有反應。' },
      s_id: { answer: '$birth_mmdd', hints: ['你登入時輸入的那四個數字。'], success: '身分確認。', wrong: '編號不符。' },
      s_sync: { hints: ['看看這個房間裡，有什麼東西停住了。', '你的世界裡，也有同樣的東西。讓它停在同一刻。', '找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）'] },
    },
  },

  // ───────── DAY 2 · 頻率 ─────────
  2: {
    scene: { hotspots: [
      { id: 'drawer', x: 76, y: 80, label: '抽屜' },
      { id: 'c_log', x: 51, y: 57, label: '收音機', clue: [{ type: 'log', lines: ['廣播紀錄 23:10 —— 收到片段訊號', '附註：訊號是倒著傳來的。', '內容：「7.301」'] }] },
      { id: 'c_serial', x: 20, y: 34, label: '窗邊的抄錄紙', clue: [{ type: 'note', text: '有人在紙上潦草地抄著：\n「訊號源序號：13 位數字。」\n「它印在一樣你每天都會用、用完就會消失的白色東西上。」' }] },
    ] },
    steps: [
      story('s_intro', ['收音機自己開著，只有雜訊。', '系統：「請找出訊號源的頻率。」'], { speaker: 'SYSTEM', ...S(1, '調頻') }),
      { id: 's_tune', type: 'dial', title: '調頻', dials: 4, format: '###.#', ...S(1, '調頻'), prompt: '調查畫面裡的收音機，轉動旋鈕對準頻率。' },
      { id: 's_order', type: 'sequence', title: '訊號重組', pick: 4, render: 'box', ...S(1, '調頻'),
        items: [{ id: 'c', label: '每天' }, { id: 'a', label: '訊號源' }, { id: 'd', label: '自己響起' }, { id: 'b', label: '在你的世界' }],
        clue: [{ type: 'note', text: '訊號斷成了四段。開頭是「訊號源」，結尾是一個動作。' }], prompt: '依序點選四段訊號。' },
      story('s_need_serial', ['訊號重組完成：「訊號源・在你的世界・每天・自己響起。」', '系統：「訊號源已定位。但頻道被鎖住了——需要訊號源的序號。」'], { speaker: 'SYSTEM', ...S(2, '訊號源序號') }),
      { id: 's_serial', type: 'keypad', title: '訊號源序號', length: 13, ...S(2, '訊號源序號'), prompt: '輸入 13 位序號。（畫面裡有人留下了線索）' },
      story('s_decoded', ['頻道解鎖。', '系統：「最後一步：需要一段來自訊號源本身的聲音。」'], { speaker: 'SYSTEM', ...S(3, '訊號源') }),
      { id: 's_record', type: 'evidence', title: '訊號源', kinds: ['audio'], gate: true, ...S(3, '訊號源'),
        prompt: '收音機需要一段「每天會自己響起」的聲音。', pending_text: '聲音已送出。觀察站正在比對頻率……' },
      story('s_watcher', ['門口站著一個人，穿著舊式的值班外套。', '「你也收到訊號了？」', '「我是這裡的守夜人。我們明天見。」'],
        { speaker: '守夜人', when: { not: { flag: 'lab_dark' } }, ...S(3, '訊號源') }),
      story('s_watcher_dark', ['走廊的另一端有手電筒的光晃了一下。', '「……這裡太暗了，」有人說。「明天吧。」'],
        { speaker: '？', when: { flag: 'lab_dark' }, ...S(3, '訊號源') }),
    ],
    secrets: {
      s_order: { answer: 'a,b,c,d', hints: ['第一段是「訊號源」。', '訊號源 → 在你的世界 → 每天 → 自己響起'], success: '訊號變得清晰。', wrong: '訊號又亂了。' },
      s_serial: { answer: '4710901898847', hints: ['每天都會用、用完就會消失、白色的……', '它通常放在廁所或浴室。', '找到倍潔雅衛生紙的包裝，輸入條碼下方的 13 個數字。'], success: '序號吻合。頻道解鎖。', wrong: '序號不符。' },
      s_record: { hints: ['你的世界裡，有什麼東西每天會自己發出聲音？', '鬧鐘、微波爐的「叮」、熱水壺、洗衣機……', '錄下任何一個會自己響起的聲音上傳。'] },
    },
  },

  // ───────── DAY 3 · 保險箱 ─────────
  3: {
    steps: [
      story('s_watch', ['守夜人：「卡片是我放的。提示我只說一次——」', '「找一個你每天都會打開，卻很少注意它的地方。」'],
        { speaker: '守夜人', when: { flag: 'watcher_met' }, ...S(1, '投影卡 A') }),
      story('s_note', ['桌上壓著一張紙條：', '「卡片在你每天都會打開，卻很少注意的地方。——守夜人」'], { when: { not: { flag: 'watcher_met' } }, ...S(1, '投影卡 A') }),
      { id: 's_scan', type: 'ar', title: '掃描投影卡 A', target: 0, card: 'A', overlay: 'safe', prompt: '找到實體卡片 A，用相機對準它。', ...S(1, '投影卡 A') },
      { id: 's_open', type: 'keypad', title: '保險箱轉盤', length: 3, prompt: '輸入保險箱的密碼。', ...S(2, '保險箱') },
      story('s_inside', ['保險箱裡只有一張舊照片。', '照片背面寫著：「第 7 天，再用一次。」', '照片的角落，有一行很小的字：「座標未確認」。'], { ...S(2, '保險箱') }),
      { id: 's_coord', type: 'evidence', title: '座標確認', kinds: ['photo'], gate: true, ...S(3, '座標確認'),
        prompt: '系統需要確認投影卡的原始座標。', pending_text: '座標資料已送出。觀察站正在比對……' },
    ],
    secrets: {
      s_coord: { hints: ['投影卡是在哪裡找到的？', '回到那個地方。', '拍一張「找到卡片的那個位置」上傳。'] },
    },
  },

  // ───────── DAY 4 · 鏡廳 ─────────
  4: {
    steps: [
      { id: 's_mirror', type: 'keypad', title: '鏡中數字', length: 4, ...S(1, '鏡中數字'),
        clue: [{ type: 'mirror', text: '8031', caption: '這組數字只出現在鏡子裡。' }], prompt: '它在現實中應該是什麼？' },
      story('s_clock_intro', ['第二面鏡子裡，掛著一個時鐘。', '但這個房間裡，沒有任何時鐘。'], { ...S(2, '鏡中時鐘') }),
      { id: 's_mclock', type: 'keypad', title: '鏡中時鐘', length: 4, ...S(2, '鏡中時鐘'),
        clue: [{ type: 'clock', h: 2, m: 15, mirror: true, caption: '鏡子裡的時鐘。' }], prompt: '真正的時間是幾點幾分？（四位數）' },
      { id: 's_photo', type: 'evidence', title: '另一邊', kinds: ['photo'], gate: true, ...S(3, '另一邊'),
        prompt: '鏡廳需要一張「另一邊」的你。', pending_text: '影像已送出。鏡面正在校正……' },
      story('s_letter', ['鏡子後方滑出一個信封。', '封面寫著：影像校正邀請函。', '「請決定，影像中的你應該是什麼樣子。」'], { ...S(3, '另一邊') }),
    ],
    secrets: {
      s_mclock: { answer: ['0215', '1415'], hints: ['鏡子會左右顛倒。', '把時鐘左右翻回來再讀。', '分針在 3 的位置是 15 分。'], success: '鏡中的秒針開始走動。', wrong: '鏡面沒有反應。' },
      s_photo: { hints: ['鏡子有兩邊。', '拍一張有你倒影的照片——鏡子、窗戶、水面都可以。', '對著鏡子，拍下你自己的倒影上傳。'] },
    },
  },

  // ───────── DAY 5 · 溫室 ─────────
  5: {
    scene: { hotspots: [
      { id: 'roots', x: 82, y: 84, label: '根部' },
      { id: 'vines', x: 10, y: 40, label: '藤蔓後面', when: { stat: 'exploration', gte: 2 } },
      { id: 'c_pot', x: 50, y: 82, label: '花盆上的標籤', clue: [{ type: 'note', text: '標籤上的字很小：\n「調配方法：見《居家保健小百科》——消化不良。」\n「對照速查表：用法 × 肌膚敏感度，數一數每一欄。」' }] },
    ] },
    steps: [
      { id: 's_order', type: 'sequence', title: '澆水順序', pick: 5, render: 'plant', ...S(1, '澆水順序'),
        items: [{ id: 'c', stage: 3 }, { id: 'a', stage: 1 }, { id: 'e', stage: 5 }, { id: 'b', stage: 2 }, { id: 'd', stage: 4 }],
        clue: [{ type: 'note', text: '澆水紀錄：「從最晚種下的開始。」' }], prompt: '依序點選植物。' },
      story('s_ill', ['溫室的終端亮起紅燈：「樣本消化系統異常。」', '「需要一份調配。調配的方法，記載在你世界的一本書裡。」'], { speaker: 'SYSTEM', ...S(2, '消化系統調配') }),
      { id: 's_recipe', type: 'keypad', title: '消化系統調配', length: 6, ...S(2, '消化系統調配'), prompt: '輸入 6 位調配碼。（先調查畫面裡的花盆）' },
      { id: 's_night', type: 'story', optional: true, title: '夜間花苞', text: ['花苞在夜裡打開了。', '裡面是一顆很小的、發著光的種子。'],
        window: { from: '21:00', to: '23:59:59', closed_text: '花苞緊閉著。也許要等到夜裡（21:00 後）。' }, ...S(2, '灌溉計時器') },
      { id: 's_photo', type: 'evidence', title: '生長樣本', kinds: ['photo'], gate: true, ...S(3, '生長樣本'),
        prompt: '溫室需要一份「正在長大」的樣本。', pending_text: '樣本已送出。溫室正在比對生長紀錄……' },
    ],
    secrets: {
      s_recipe: { answer: '777250', hints: ['花盆標籤提到一本書。它在你家的廚房。', '找到《居家保健小百科》裡「消化不良」的複方調配，把用到的精油對照前面的精油速查表。', '速查表有 3 種用法、3 種肌膚敏感度，共 6 欄。數一數每一欄有幾支調配裡的精油打勾，依序輸入 6 個數字。'], success: '調配完成。樣本的光變得穩定。', wrong: '調配比例不對。樣本微微顫抖。' },
      s_photo: { hints: ['你的世界裡，有什麼東西每天都在悄悄長大？', '植物、寵物、指甲、頭髮……任何正在生長的都可以。', '拍一株植物最新長出的葉子上傳。'] },
    },
  },

  // ───────── DAY 6 · 斷層 ─────────
  6: {
    scene: { hotspots: [
      { id: 'c_crack', x: 50, y: 52, label: '裂縫裡的紙', clue: [{ type: 'note', text: '一張被撕下的紙，邊緣燒焦了：\n「……社會工作……」\n「……答錯的那幾題，改回正確答案……」\n「共 10 題。」' }] },
    ] },
    steps: [
      { id: 's_glitch', type: 'story', title: '損壞的紀錄', inject_evidence_day: 1, text: ['第 01 區的紀錄出現在這裡，但已經損壞：'], ...S(1, '重建斷層') },
      { id: 's_lock', type: 'symbols', title: '重建斷層', slots: 4, ...S(1, '重建斷層'),
        clue: [{ type: 'log', lines: ['損壞的時間戳：', 'D01 ▒▒ D02 ▒▒ D02 ▒▒ D01', '「把最早的兩個訊號，依時間戳放回去。」'] }], prompt: '從你持有的符號中依序放入。' },
      story('s_exam_intro', ['裂縫深處卡著一張被撕下來的紙。', '系統：「斷層的另一側，是一段曾經答錯的紀錄。把它改回來，裂縫才會停止。」'], { speaker: 'SYSTEM', ...S(2, '錯過的答案') }),
      { id: 's_exam', type: 'letters', title: '錯過的答案', length: 10, letters: ['A', 'B', 'C', 'D'], ...S(2, '錯過的答案'), prompt: '依序輸入 10 個正確答案（A–D）。（先調查畫面裡的裂縫）' },
      { id: 's_choice', type: 'choice', title: '修復', flag: 'fault', ...S(2, '錯過的答案'),
        text: ['斷層中有一段紀錄可以修復。', '但修復它，會覆寫較近的一段。'],
        options: [{ id: 'repair', label: '修復最早的紀錄', desc: '裂縫會闔上，另一段會被覆寫。' }, { id: 'keep', label: '保留裂縫', desc: '兩段紀錄都留下，裂縫不會消失。' }] },
      { id: 's_mended', type: 'evidence', title: '修補過的東西', kinds: ['photo'], gate: true, ...S(3, '修補過的東西'),
        prompt: '斷層需要一個「修補過」的東西作為參照。', pending_text: '參照物已送出。斷層正在比對……' },
    ],
    secrets: {
      s_exam: { answer: 'BDBBCBABAB', hints: ['那是一張考卷。你曾經考過的。', '它藏在衣櫥中間的櫃子裡。', '找到四分社工師考卷的「社會工作」科，把答錯的題目的正確答案依序輸入。'], success: '答案吻合。裂縫停止擴大。', wrong: '斷層發出刺耳的聲音。' },
      s_mended: { hints: ['你身邊有沒有什麼東西，壞過，又被修好？', '黏過的杯子、補過的衣服、貼著膠帶的東西……', '拍一個曾經壞掉、又被修好的東西上傳。'] },
    },
  },

  // ───────── DAY 7 · 門 ─────────
  7: {
    steps: [
      { id: 's_scan', type: 'ar', title: '掃描投影卡 B', target: 1, card: 'B', overlay: 'totem', prompt: '找到實體卡片 B，用相機對準它。', ...S(1, '投影卡 B') },
      { id: 's_rings', type: 'rings', title: '門環', rings: [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]], prompt: '轉動三個門環，對準圖騰上的符號。', ...S(2, '門環') },
      story('s_through', ['門打開了。', '門後是一條走廊，盡頭還有一扇門——比這扇小。', '那扇門沒有影像。系統：「請提供參照。」'], { ...S(3, '最後一扇門') }),
      { id: 's_door', type: 'evidence', title: '最後一扇門', kinds: ['photo'], gate: true, ...S(3, '最後一扇門'),
        prompt: '門後還有一扇門。它在你的世界裡。', pending_text: '參照已送出。門正在辨識……' },
    ],
    secrets: {
      s_door: { hints: ['你每天都會經過很多扇門。', '有一扇門，你每天都開，卻很少真正看它。', '拍下你家大門（從裡面看出去）上傳。'] },
    },
  },

  // ───────── DAY 8 · 岔路 ─────────
  8: {
    steps: [
      { id: 's_door', type: 'choice', title: '選一扇門', flag: 'fork', text: ['系統：「只能選一扇。」'], ...S(1, '選擇'),
        options: [{ id: 'keep', label: '保存', desc: '' }, { id: 'release', label: '放手', desc: '' }] },
      { id: 's_keep', type: 'sequence', title: '整理檔案', pick: 4, render: 'box', when: { flag: 'choice:fork', eq: 'keep' }, ...S(2, '門後'),
        items: [{ id: 'b', label: '▮▮▮' }, { id: 'd', label: '▮' }, { id: 'a', label: '▮▮▮▮' }, { id: 'c', label: '▮▮' }], prompt: '從最厚的開始，把檔案放回架上。' },
      { id: 's_release', type: 'switches', title: '熄燈', count: 5, labels: ['01', '02', '03', '04', '05'], when: { flag: 'choice:fork', eq: 'release' }, ...S(2, '門後'),
        clue: [{ type: 'note', text: '「只留下你最早點亮的那一盞。」' }], prompt: '關掉其他的燈。', initial: '11111' },
      { id: 's_voice', type: 'evidence', title: '沒有走的那條路', kinds: ['audio'], gate: true, ...S(3, '另一端'),
        prompt: '岔路的另一端，需要你的聲音。', pending_text: '聲音已送出。岔路正在記錄……' },
    ],
    variant_steps: {
      third: [
        story('s_intro', ['左邊寫著「保存」，右邊寫著「放手」。', '中間那扇門什麼也沒寫。'], { ...S(1, '選擇') }),
        { id: 's_door', type: 'choice', title: '選一扇門', flag: 'fork', text: ['系統：「只能選一扇。」'], ...S(1, '選擇'),
          options: [{ id: 'keep', label: '保存', desc: '' }, { id: 'stay', label: '（沒有名字的門）', desc: '' }, { id: 'release', label: '放手', desc: '' }] },
        { id: 's_keep', type: 'sequence', title: '整理檔案', pick: 4, render: 'box', when: { flag: 'choice:fork', eq: 'keep' }, ...S(2, '門後'),
          items: [{ id: 'b', label: '▮▮▮' }, { id: 'd', label: '▮' }, { id: 'a', label: '▮▮▮▮' }, { id: 'c', label: '▮▮' }], prompt: '從最厚的開始，把檔案放回架上。' },
        { id: 's_release', type: 'switches', title: '熄燈', count: 5, labels: ['01', '02', '03', '04', '05'], when: { flag: 'choice:fork', eq: 'release' }, ...S(2, '門後'),
          clue: [{ type: 'note', text: '「只留下你最早點亮的那一盞。」' }], prompt: '關掉其他的燈。', initial: '11111' },
        { id: 's_stay', type: 'wait', title: '停留', seconds: 30, when: { flag: 'choice:fork', eq: 'stay' }, ...S(2, '門後'),
          start_text: '系統開始計時。請不要離開這個畫面。', early_text: '你離開得太早了。計時重新開始。', prompt: '什麼都不用做。停留 30 秒。' },
        { id: 's_voice', type: 'evidence', title: '沒有走的那條路', kinds: ['audio'], gate: true, ...S(3, '另一端'),
          prompt: '岔路的另一端，需要你的聲音。', pending_text: '聲音已送出。岔路正在記錄……' },
      ],
    },
    secrets: {
      s_voice: { hints: ['那扇你沒有選的門後面，是一段沒有被記錄的事。', '說說看：一件你曾經錯過、但後來仍然記得的小事。', '錄一段聲音，說出那件事。'] },
    },
  },

  // ───────── DAY 9 · 回放 ─────────
  9: {
    steps: [
      { id: 's_timeline', type: 'timeline', title: '排列片段', upto: 8, prompt: '依照發生的順序排列這些片段。空白的片段也有它的位置。', ...S(1, '排列片段') },
      story('s_stop', ['投影機在最後一格停住了。', '畫面角落印著一行字：「紀錄起始日」。'], { ...S(2, '起始日') }),
      { id: 's_date', type: 'keypad', title: '紀錄起始日', length: 4, prompt: '輸入第一個片段浮上海面的日期（月日，四位數）。', ...S(2, '起始日') },
      { id: 's_voice', type: 'evidence', title: '最後一段', kinds: ['audio'], gate: true, ...S(3, '最後一段'),
        prompt: '回放缺少最後一段：現在的你。', pending_text: '聲音已送出。投影機正在寫入……' },
    ],
    secrets: {
      s_date: { answer: '$start_mmdd', hints: ['你第一次接入的那一天。', '看「紀錄」頁最早的一筆事件。'], success: '投影機重新轉動。', wrong: '日期不符。' },
      s_voice: { hints: ['投影機也可以錄音。', '對它說一句話——給十天前剛接入時的自己。', '錄一段聲音，對十天前的自己說一句話。'] },
    },
  },

  // ───────── DAY 10 · 核心 ─────────
  10: {
    steps: [
      { id: 's_code', type: 'keypad', title: '核心頻率', length: 5, ...S(1, '核心頻率'),
        clue: [{ type: 'glyphs', ids: [6, 2, 1, 2, 7], caption: '核心上刻著五個符號。' }], prompt: '輸入核心的頻率。' },
      story('s_ring', ['五個頻率疊在一起，形成一個環。', '環的中央浮現三個空格：「顯示真正的編號」。'], { ...S(2, '真正的編號') }),
      { id: 's_number', type: 'symbols', title: '真正的編號', slots: 3, ...S(2, '真正的編號'),
        clue: [{ type: 'log', lines: ['「讓核心顯示它真正的編號。」', '用符號的頻率拼出來。'] }], prompt: '放入三個符號。' },
      { id: 's_last', type: 'choice', title: '最後的設定', flag: 'core', text: ['系統：「十個區域的紀錄即將封存。」'], ...S(3, '最後一樣東西'),
        options: [{ id: 'seal', label: '封存所有紀錄', desc: '' }, { id: 'open', label: '讓紀錄繼續寫下去', desc: '' }] },
      { id: 's_keepsake', type: 'evidence', title: '最後一樣東西', kinds: ['photo'], gate: true, ...S(3, '最後一樣東西'),
        prompt: '核心封存前，可以放進最後一樣東西。', pending_text: '已送出。核心正在接收……' },
    ],
    secrets: {
      s_number: { answer: 'sym2,sym1,sym2', hints: ['檔案的編號是 030。', '頻率 0 是「聲」，頻率 3 是「起」。'], success: '核心顯示：030。', wrong: '編號不符。' },
      s_keepsake: { hints: ['那是一樣你現在擁有、而且想一直留著的東西。', '可以是物品、一個地方，或一個人（經過對方同意）。', '拍下一樣你想帶進三十歲的東西上傳。'] },
    },
  },
};
