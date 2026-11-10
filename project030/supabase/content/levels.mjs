// PROJECT 030 · 關卡內容（種子資料）
// 執行 `node project030/tools/build-seed.mjs` 會產生 migrations/..._seed.sql。
// 部署後請以管理後台修改內容，資料庫才是唯一真實來源。
// 注意：終章現實尋寶的內容「不寫在這裡」，只在後台設定。

const story = (id, text, extra = {}) => ({ id, type: 'story', text, ...extra });

export const symbols = [
  { id: 1, key: 'origin', name: '起', digit: 3, lore: [
    { from_day: 1, text: '一個開始的記號。' },
    { from_day: 6, text: '它第二次出現時，你已經不是第一次見到它的那個人。' },
    { from_day: 10, text: '每一個開始，都發生在某件事之後。' } ] },
  { id: 2, key: 'echo', name: '聲', digit: 0, lore: [
    { from_day: 2, text: '它記得聲音，但不記得是誰說的。' },
    { from_day: 9, text: '回放的時候，你聽見的是當時的自己。' } ] },
  { id: 3, key: 'key', name: '鑰', digit: 7, lore: [
    { from_day: 5, text: '能打開東西，也能只留下形狀。' },
    { from_day: 7, text: '第 7 天，再用一次。' } ] },
  { id: 4, key: 'mirror', name: '鏡', digit: 1, lore: [
    { from_day: 4, text: '鏡子裡的房間，比外面多一盞燈。' },
    { from_day: 10, text: '鏡像不是相反，只是另一個方向。' } ] },
  { id: 5, key: 'sprout', name: '芽', digit: 9, lore: [
    { from_day: 3, text: '不是每一株都同時長出來。' } ] },
  { id: 6, key: 'fault', name: '裂', digit: 4, lore: [
    { from_day: 6, text: '裂縫也是一種紀錄。' } ] },
  { id: 7, key: 'gate', name: '門', digit: 6, lore: [
    { from_day: 7, text: '有些門只開一次。有些門會在別處再出現。' } ] },
  { id: 8, key: 'fork', name: '岔', digit: 2, lore: [
    { from_day: 8, text: '選擇之後，另一條路並沒有消失，只是你沒有走。' } ] },
  { id: 9, key: 'void', name: '空', digit: 8, lore: [
    { from_day: 9, text: '空白不是沒有內容，是還沒有被寫下。' } ] },
  { id: 10, key: 'loop', name: '環', digit: 5, lore: [
    { from_day: 10, text: '沒有起點，也沒有終點。' } ] },
];

export const levels = [
  // ───────────────────────── DAY 1 · 接入（可玩原型） ─────────────────────────
  {
    day: 1, code: 'ZONE 01', title: '接入', subtitle: 'INTAKE',
    config: {
      notify: { new: '你被列為 PROJECT 030 的觀測者。第 01 區正在等待接入。', pending: '第 01 區的電力仍未恢復。', expiring: '第 01 區將於午夜封閉。封閉後，那裡不會再有燈。' },
      scene: { theme: 'intake', light: 'emergency', props: ['incubator', 'panel', 'terminal', 'clock', 'desk'],
        hotspots: [{ id: 'under_desk', x: 24, y: 82, label: '桌子底下' }] },
      intro: ['……連線建立。', '觀測者，歡迎接入 PROJECT 030。', '你的權限：觀測、修復、紀錄。'],
      steps: [
        story('s_wake', ['本區電力異常。', '系統：「請先恢復電源。」'], { speaker: 'SYSTEM' }),
        { id: 's_power', type: 'switches', title: '配電箱', count: 6, labels: ['1', '2', '3', '4', '5', '6'],
          clue: [{ type: 'note', text: '配電箱內側貼著一張發黃的紙條：\n「只讓無法再被拆開的位置通電。」' }],
          prompt: '撥動開關，然後拉下主閘。' },
        story('s_sample', ['培養艙的玻璃起霧，又慢慢變清。', '裡面有一個很小的東西。它沒有名字，只有編號：030。',
          '系統：「樣本需要觀察。每天一次。觀察的方式，由你決定。」'], { speaker: 'SYSTEM' }),
        { id: 's_observe', type: 'observe', title: '第一次觀察', prompt: '前往「培養艙」完成今天的觀察，再回到這裡。' },
        { id: 's_log', type: 'evidence', title: '觀察日誌 #001', kinds: ['text'],
          prompt: '用一句話記下今天你注意到的一件小事。任何事都可以。' },
        story('s_drift', ['終端機突然閃爍：「警告。偵測到時間差。」', '「此區的時間，停在某一刻。你的世界卻仍在前進。」',
          '「培養艙無法在不同步的時間裡封存。」'], { speaker: 'SYSTEM' }),
        { id: 's_sync', type: 'evidence', title: '時間同步', kinds: ['photo'], gate: true,
          clue: [{ type: 'clock', h: 10, m: 30, caption: '這個房間的時間。' }],
          prompt: '同步程序需要一份來自你世界的證據。',
          pending_text: '同步證據已送出。觀察站正在比對兩個世界的時間……比對通過後，本區將自動歸檔。' },
      ],
      epilogue: ['電力恢復。第 01 區已歸檔。', '你取得了第一個符號。它的用途尚未解鎖。'],
    },
    secrets: {
      s_power: { answer: '011010', hints: ['「無法再被拆開」的數字，只能被 1 和它自己整除。', '注意：1 不算。這種數必須大於 1。', '打開 2、3、5，其他保持關閉。'],
        success: '配電箱發出低鳴。燈一盞一盞亮起。', wrong: '保險絲跳了一下，又暗了。' },
      s_sync: { hints: ['看看這個房間裡，有什麼東西停住了。', '你的世界裡，也有同樣的東西。讓它停在同一刻。', '找一個真的時鐘，把指針調到 10:30，拍下來上傳。（螢幕上的時鐘不算）'] },
      hotspots: { under_desk: { text: '桌子底下黏著一張舊標籤：「樣本來源：未登記」。',
        grant: { items: [{ key: 'label_unregistered', name: '未登記的標籤', desc: '樣本來源：未登記。', data: { hidden: true } }] } } },
    },
    on_complete: { symbol: 1, flags: { lab_power: true } },
    on_missed: { flags: { lab_dark: true }, message: { title: '第 01 區斷電', body: '接入室的燈在午夜熄滅了。備用通道仍可使用，但那裡沒有燈。' } },
    alternate: {
      route_title: '備用通道',
      scene: { theme: 'intake', light: 'off', props: ['incubator', 'panel', 'terminal'], hotspots: [] },
      intro: ['主電源已經燒毀。', '你只有一支手電筒。'],
      steps: [
        { id: 'a_find', type: 'find', title: '黑暗中的記號', spots: [
            { id: 'w1', x: 18, y: 30 }, { id: 'w2', x: 72, y: 22 }, { id: 'glyph', x: 58, y: 70 }, { id: 'w3', x: 30, y: 76 } ],
          clue: [{ type: 'note', text: '有人用螢光漆在牆上畫了一個圓。' }], prompt: '用手電筒照亮四周，找到那個圓。' },
        { id: 'a_terminal', type: 'keypad', title: '備用終端', length: 4,
          clue: [{ type: 'note', text: '時鐘的玻璃碎了。碎片裡，兩根指針分別停在「十」和「六」。' }], prompt: '輸入時間停止的時刻。' },
        story('a_sample', ['培養艙在備用電力下亮了一下。', '樣本 030 還在。只是比你想像的更安靜。']),
        { id: 'a_observe', type: 'observe', title: '補登觀測', prompt: '前往「培養艙」完成今天的觀測。' },
        { id: 'a_log', type: 'evidence', title: '觀測日誌 #001（補登）', kinds: ['text'], prompt: '用一句話記下今天你注意到的一件小事。' },
      ],
      epilogue: ['備用通道已關閉。', '符號留下來了——但不是原本那一個。'],
    },
    alt_secrets: {
      a_find: { answer: 'glyph', success: '螢光圓圈在光束下浮現。' },
      a_terminal: { answer: '1030', hints: ['「十」和「六」是時針和分針。'], success: '備用終端亮起。' },
    },
    on_alternate_complete: { symbol: 1, echo: true, flags: { lab_backup: true } },
  },

  // ───────────────────────── DAY 2 · 頻率 ─────────────────────────
  {
    day: 2, code: 'ZONE 02', title: '頻率', subtitle: 'FREQUENCY',
    config: {
      notify: { new: '一段不明訊號正在重複播放。來源：第 02 區。', pending: '訊號仍在等待回應。', expiring: '頻道將於午夜關閉。' },
      scene: { theme: 'radio', light: 'on', props: ['radio', 'antenna', 'desk', 'window'],
        hotspots: [{ id: 'drawer', x: 76, y: 80, label: '抽屜' }] },
      variants: [{ id: 'dim', when: { flag: 'lab_dark' }, scene: { light: 'dim' },
        intro: ['接入室沒有恢復電力，這裡的燈也比應該的暗。', '收音機靠電池運轉。'] }],
      intro: ['收音機自己開著。', '只有雜訊。'],
      steps: [
        story('s_intro', ['系統：「請找出訊號源的頻率。」'], { speaker: 'SYSTEM' }),
        { id: 's_tune', type: 'dial', title: '調頻', dials: 4, format: '###.#',
          clue: [{ type: 'log', lines: ['廣播紀錄 23:10 —— 收到片段訊號', '附註：訊號是倒著傳來的。', '內容：「7.301」'] }],
          prompt: '轉動旋鈕，對準頻率。' },
        story('s_listen', ['雜訊退去。', '一個很遠的聲音說：「……樣本……需要……環境……」', '系統：「需要比對你所在位置的環境聲。」']),
        { id: 's_record', type: 'evidence', title: '環境聲樣本', kinds: ['audio'], prompt: '錄下你此刻所在地 5–15 秒的環境聲。' },
        story('s_watcher', ['門口站著一個人，穿著舊式的值班外套。', '「你也收到訊號了？」', '「我是這裡的守夜人。我們明天見。」'],
          { speaker: '守夜人', when: { not: { flag: 'lab_dark' } } }),
        story('s_watcher_dark', ['走廊的另一端有手電筒的光晃了一下。', '「……這裡太暗了，」有人說。「明天吧。」'],
          { speaker: '？', when: { flag: 'lab_dark' } }),
      ],
      epilogue: ['頻率已鎖定。', '你取得了第二個符號。'],
    },
    secrets: {
      s_tune: { answer: '1037', hints: ['紀錄說訊號是倒著傳來的。', '把「7.301」倒過來讀。'], success: '雜訊消失了。', wrong: '只有雜訊。' },
      hotspots: { drawer: { text: '抽屜裡有一張頻率表，其中一行被劃掉：「030.0 —— 不要調到這裡」。',
        grant: { items: [{ key: 'freq_table', name: '頻率表', desc: '「030.0 —— 不要調到這裡」。', data: { hidden: true } }] } } },
    },
    on_complete: { symbol: 2, flags: { watcher_met: true } },
    on_missed: { flags: { watcher_left: true }, message: { title: '頻道關閉', body: '收音機在午夜後只剩下靜默。有人在門上留了一張紙條。' } },
    alternate: {
      route_title: '靜默頻道',
      scene: { theme: 'radio', light: 'dim', npc: 'note', props: ['radio', 'desk', 'window'], hotspots: [] },
      intro: ['收音機沒有聲音了。', '門上貼著一張紙條。'],
      steps: [
        { id: 'a_note', type: 'text', title: '紙條', placeholder: '四個字',
          clue: [{ type: 'letter', lines: ['等不到你，我先走了。', '待會兒雨應該就停了。', '訊號我抄下來了，在東邊。', '號碼別告訴別人。', '——守夜人'] }],
          prompt: '紙條裡藏著一句話。是什麼？' },
        { id: 'a_record', type: 'evidence', title: '環境聲樣本（補登）', kinds: ['audio'], prompt: '錄下你此刻所在地 5–15 秒的環境聲。' },
      ],
      epilogue: ['你沒有見到守夜人。', '但你知道他等過。'],
    },
    alt_secrets: { a_note: { answer: ['等待訊號'], hints: ['看每一行的第一個字。'], success: '紙條背面寫著：「我會再回來。」', wrong: '好像不是這樣讀的。' } },
    on_alternate_complete: { symbol: 2, echo: true, flags: { read_note: true } },
  },

  // ───────────────────────── DAY 5 · 保險箱（AR 卡片 A；原第 3 天，11/10 起與溫室對調） ─────────────────────────
  {
    day: 5, code: 'ZONE 05', title: '保險箱', subtitle: 'THE SAFE',
    config: {
      notify: { new: '第 05 區偵測到一個實體投影。它在你的世界裡。', pending: '投影卡尚未被掃描。', expiring: '投影將於午夜失效。' },
      scene: { theme: 'vault', light: 'on', props: ['safe', 'shelf', 'desk'], hotspots: [] },
      variants: [
        { id: 'watcher', when: { flag: 'watcher_met' }, scene: { npc: 'watcher' } },
        { id: 'note', when: { flag: 'watcher_left' }, scene: { npc: 'note' } },
      ],
      intro: ['房間中央有一個保險箱，但它不是真的在這裡。', '系統：「保險箱的實體投影卡已放置於現實世界。」'],
      steps: [
        story('s_watch', ['守夜人：「卡片是我放的。提示我只說一次——」', '「找一個你每天都會打開，卻很少注意它的地方。」'],
          { speaker: '守夜人', when: { flag: 'watcher_met' } }),
        story('s_note', ['桌上壓著一張紙條：', '「卡片在你每天都會打開，卻很少注意的地方。——守夜人」'],
          { when: { not: { flag: 'watcher_met' } } }),
        { id: 's_scan', type: 'ar', title: '掃描投影卡 A', target: 0, card: 'A', overlay: 'safe',
          prompt: '找到實體卡片 A，用相機對準它。' },
        { id: 's_open', type: 'keypad', title: '保險箱轉盤', length: 3, prompt: '輸入保險箱的密碼。' },
        story('s_inside', ['保險箱裡只有一張舊照片。', '照片背面寫著：「第 7 天，再用一次。」']),
      ],
      epilogue: ['保險箱已歸檔。', '你取得了「鑰」符號，以及一張照片。'],
    },
    secrets: {
      s_scan: { fallback: 'VAULT-A', reveal: { overlay: 'safe', digits: '418' }, success: '卡片上方浮現一個保險箱。' },
      s_open: { answer: '418', hints: ['數字只出現在投影的保險箱上。'], success: '咔。', wrong: '轉盤卡住了。' },
    },
    on_complete: { symbol: 3, items: [{ key: 'photo_old', name: '舊照片', desc: '背面寫著：第 7 天，再用一次。' }] },
    on_missed: { flags: { safe_taken: true }, message: { title: '保險箱已被開啟', body: '有人在你之前打開了它。裡面少了一樣東西。' } },
    alternate: {
      route_title: '鑰匙的形狀',
      scene: { theme: 'vault', light: 'dim', props: ['safe_open', 'shelf'], hotspots: [] },
      intro: ['保險箱的門半開著，裡面是空的。', '內壁上只剩一把鑰匙的壓痕。'],
      steps: [
        { id: 'a_key', type: 'dial', title: '復刻鑰匙', dials: 5, digits: [1, 2, 3, 4], format: '#####',
          clue: [{ type: 'imprint', heights: [3, 1, 4, 1, 2], caption: '內壁上的壓痕' }],
          prompt: '調整五個齒的高度，讓鑰匙和壓痕吻合。' },
        story('a_after', ['鑰匙插進壓痕，牆後有東西鬆開了。', '你沒拿到照片。拿到的是一張拓印。']),
      ],
      epilogue: ['你得到的不是原本的東西。', '但形狀還在。'],
    },
    alt_secrets: { a_key: { answer: '31412', hints: ['由左到右，數一數每個齒的高度。'], success: '吻合。' } },
    on_alternate_complete: { symbol: 3, echo: true, items: [{ key: 'key_rubbing', name: '鑰匙拓印', desc: '不是鑰匙本身，只是它的形狀。' }] },
  },

  // ───────────────────────── DAY 4 · 鏡廳（禮物一） ─────────────────────────
  {
    day: 4, code: 'ZONE 04', title: '鏡廳', subtitle: 'MIRROR HALL',
    config: {
      notify: { new: '第 04 區的鏡面開始反射不存在的光。', pending: '鏡子裡的燈還亮著。', expiring: '鏡廳將於午夜熄燈。' },
      scene: { theme: 'mirror', light: 'on', props: ['mirror', 'mirror2', 'lamp'], hotspots: [] },
      variants: [{ id: 'cracked', when: { stat: 'missed', gte: 2 }, scene: { props: ['mirror_cracked', 'mirror2', 'lamp'] },
        intro: ['這裡的鏡子有一面裂了。', '裂痕剛好穿過鏡子裡你的位置。'] }],
      intro: ['這裡的每一面鏡子都比房間大。', '鏡子裡的房間，比外面多了一盞燈。'],
      steps: [
        { id: 's_mirror', type: 'keypad', title: '鏡中數字', length: 4,
          clue: [{ type: 'mirror', text: '8031', caption: '這組數字只出現在鏡子裡。' }], prompt: '它在現實中應該是什麼？' },
        { id: 's_photo', type: 'evidence', title: '鏡像紀錄', kinds: ['photo'], prompt: '拍一張有鏡子、窗戶，或任何倒影的照片。你可以不入鏡。' },
        story('s_letter', ['鏡子後方滑出一個信封。', '封面寫著：影像校正邀請函。', '「請決定，影像中的你應該是什麼樣子。」']),
      ],
      epilogue: ['鏡廳已歸檔。', '一封邀請函已送達「禮物」頁。'],
    },
    secrets: { s_mirror: { answer: '8031', hints: ['鏡子會左右顛倒。', '從右往左讀，並把每個數字翻回來。'], success: '鏡子裡的燈閃了一下。', wrong: '鏡面沒有反應。' } },
    on_complete: { symbol: 4, gift: 'portrait' },
    on_missed: { message: { title: '鏡廳熄燈', body: '所有鏡子在午夜同時碎了。碎片還在，只是需要重新拼起來。' } },
    alternate: {
      route_title: '碎鏡',
      scene: { theme: 'mirror', light: 'dim', props: ['shards'], hotspots: [] },
      intro: ['地上全是碎片。', '其中四片比較大，上面映著一個信封的一角。'],
      steps: [
        { id: 'a_shards', type: 'rotate', title: '拼回鏡子', tiles: 4, start: [1, 3, 2, 1], image: 'envelope', prompt: '轉動每一片碎片，拼出完整的影像。' },
        story('a_letter', ['碎片拼起來的時候，信封從裂縫裡掉了出來。', '影像校正邀請函——有一點刮痕，但還能讀。']),
      ],
      epilogue: ['邀請函沒有消失。它只是換了一條路來找你。'],
    },
    alt_secrets: { a_shards: { answer: '0000', success: '影像完整了。' } },
    on_alternate_complete: { symbol: 4, echo: true, gift: 'portrait' },
  },

  // ───────────────────────── DAY 3 · 溫室（原第 5 天） ─────────────────────────
  {
    day: 3, code: 'ZONE 03', title: '溫室', subtitle: 'GREENHOUSE',
    config: {
      notify: { new: '第 03 區的濕度上升。有東西在生長。', pending: '溫室裡的植物還沒有被照顧。', expiring: '溫室的燈將於午夜關閉。' },
      scene: { theme: 'greenhouse', light: 'on', props: ['plants', 'incubator', 'window'],
        hotspots: [{ id: 'roots', x: 82, y: 84, label: '根部' },
                   { id: 'vines', x: 10, y: 40, label: '藤蔓後面', when: { stat: 'exploration', gte: 2 } }] },
      variants: [{ id: 'watcher', when: { flag: 'watcher_met' }, scene: { npc: 'watcher' },
        intro: ['守夜人在澆水。', '「它們不是同一天種的，」他說，「所以不會同一天開。」'] }],
      intro: ['溫室裡的植物都不是同一天種下的。', '培養艙被移到了這裡。'],
      steps: [
        { id: 's_order', type: 'sequence', title: '澆水順序', pick: 5, render: 'plant',
          items: [{ id: 'c', stage: 3 }, { id: 'a', stage: 1 }, { id: 'e', stage: 5 }, { id: 'b', stage: 2 }, { id: 'd', stage: 4 }],
          clue: [{ type: 'note', text: '澆水紀錄：「從最晚種下的開始。」' }],
          prompt: '依序點選植物。' },
        { id: 's_night', type: 'story', optional: true, title: '夜間花苞', text: ['花苞在夜裡打開了。', '裡面是一顆很小的、發著光的種子。'],
          window: { from: '21:00', to: '23:59:59', closed_text: '花苞緊閉著。也許要等到夜裡（21:00 後）。' } },
        { id: 's_photo', type: 'evidence', title: '生長紀錄', kinds: ['photo'], prompt: '拍下一個正在生長、或正在改變中的東西。' },
      ],
      epilogue: ['溫室已歸檔。', '你取得了「芽」符號。'],
    },
    secrets: {
      s_order: { answer: 'a,b,c,d,e', hints: ['最晚種下的，現在長得最小。'], success: '水流過每一株植物。', wrong: '有一株植物垂下了葉子。' },
      s_night: { grant: { items: [{ key: 'night_seed', name: '夜開的種子', desc: '只在夜裡發光。', data: { hidden: true } }] } },
      hotspots: {
        roots: { text: '根部纏著一張標籤：「不是每一株都需要被看見。」', grant: { items: [{ key: 'root_tag', name: '根部標籤', desc: '不是每一株都需要被看見。', data: { hidden: true } }] } },
        vines: { text: '藤蔓後面有一間更小的溫室。裡面只種了一株，還沒發芽。', grant: { items: [{ key: 'hidden_greenhouse', name: '隱藏溫室的土', desc: '還沒發芽。', data: { hidden: true } }] } },
      },
    },
    on_complete: { symbol: 5 },
    on_missed: { flags: { greenhouse_wilted: true }, message: { title: '溫室枯萎', body: '午夜之後，溫室的植物枯了。根還在。' } },
    alternate: {
      route_title: '枯室',
      scene: { theme: 'greenhouse', light: 'dim', props: ['plants_dry', 'incubator'], hotspots: [] },
      intro: ['植物在你離開的那一晚枯了。', '但根還在。'],
      steps: [
        { id: 'a_valves', type: 'switches', title: '灌溉閥', count: 5, labels: ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ'],
          clue: [{ type: 'roots', has: [1, 0, 1, 1, 0], caption: '撥開土壤，看得到根的形狀。' }, { type: 'note', text: '「只澆還有根的那幾株。」' }],
          prompt: '打開需要的閥門。' },
        { id: 'a_photo', type: 'evidence', title: '生長紀錄（補登）', kinds: ['photo'], prompt: '拍下一個正在生長、或正在改變中的東西。' },
      ],
      epilogue: ['有兩株長出了新葉。', '和原本的不一樣。'],
    },
    alt_secrets: { a_valves: { answer: '10110', success: '水滲進土裡。' } },
    on_alternate_complete: { symbol: 5, echo: true },
  },

  // ───────────────────────── DAY 6 · 斷層（早期符號重新使用） ─────────────────────────
  {
    day: 6, code: 'ZONE 06', title: '斷層', subtitle: 'FAULT LINE',
    config: {
      notify: { new: '異常：第 01 區的紀錄出現在第 06 區。', pending: '斷層仍在擴大。', expiring: '斷層將於午夜固定成形。' },
      scene: { theme: 'fault', light: 'flicker', props: ['crack', 'terminal'], hotspots: [] },
      intro: ['系統錯誤。', '有些紀錄出現在不該出現的地方。'],
      steps: [
        { id: 's_glitch', type: 'story', title: '損壞的紀錄', inject_evidence_day: 1,
          text: ['第 01 區的紀錄出現在這裡，但已經損壞：'] },
        { id: 's_lock', type: 'symbols', title: '重建斷層', slots: 4,
          clue: [{ type: 'log', lines: ['損壞的時間戳：', 'D01 ▒▒ D02 ▒▒ D02 ▒▒ D01', '「把最早的兩個訊號，依時間戳放回去。」'] }],
          prompt: '從你持有的符號中依序放入。' },
        { id: 's_choice', type: 'choice', title: '修復', flag: 'fault',
          text: ['斷層中有一段紀錄可以修復。', '但修復它，會覆寫較近的一段。'],
          options: [{ id: 'repair', label: '修復最早的紀錄', desc: '裂縫會闔上，另一段會被覆寫。' },
                    { id: 'keep', label: '保留裂縫', desc: '兩段紀錄都留下，裂縫不會消失。' }] },
      ],
      epilogue: ['斷層已固定。', '你取得了第六個符號。'],
    },
    secrets: { s_lock: { answer: 'sym1,sym2,sym2,sym1', hints: ['你最早取得的兩個符號，分別來自第 1 天和第 2 天。', '在「物品」查看每個符號的來源日。'], success: '裂縫停止擴大。', wrong: '斷層發出刺耳的聲音。' } },
    on_complete: { symbol: 6 },
    on_missed: { message: { title: '斷層擴大', body: '裂縫在午夜變寬了。另一側出現了一條沒有照明的通道。' } },
    alternate: {
      route_title: '深層裂縫',
      scene: { theme: 'fault', light: 'off', props: ['crack_wide'], hotspots: [] },
      intro: ['裂縫已經寬到可以走進去。', '裡面的紀錄是倒著寫入的。'],
      steps: [
        { id: 'a_lock', type: 'symbols', title: '倒序重建', slots: 4,
          clue: [{ type: 'log', lines: ['倒序寫入：', 'D02 ▒▒ D01 ▒▒ D01 ▒▒ D02'] }], prompt: '從你持有的符號中依序放入。' },
        { id: 'a_choice', type: 'choice', title: '裂縫深處', flag: 'fault', text: ['裂縫的另一邊有光。'],
          options: [{ id: 'cross', label: '跨過去', desc: '' }, { id: 'stay', label: '沿著裂縫走', desc: '' }] },
      ],
      epilogue: ['你從另一個方向離開了斷層。'],
    },
    alt_secrets: { a_lock: { answer: 'sym2,sym1,sym1,sym2', hints: ['第 1 天和第 2 天的符號——即使只是殘響——也算。'], success: '裂縫裡的紀錄安靜下來。' } },
    on_alternate_complete: { symbol: 6, echo: true },
  },

  // ───────────────────────── DAY 7 · 門（AR 卡片 B） ─────────────────────────
  {
    day: 7, code: 'ZONE 07', title: '門', subtitle: 'THE GATE',
    config: {
      notify: { new: '第 07 區出現了一扇門。它只在今天存在。', pending: '那扇門仍然關著。', expiring: '門將於午夜消失。' },
      scene: { theme: 'gate', light: 'on', props: ['gate', 'pillars'],
        hotspots: [{ id: 'photo_slot', x: 50, y: 46, label: '門上的凹槽', when: { item: 'photo_old' } },
                   { id: 'side_room', x: 88, y: 60, label: '柱子後方', when: { stat: 'exploration', gte: 2 } }] },
      variants: [{ id: 'watcher', when: { flag: 'watcher_met' }, scene: { npc: 'watcher' },
        intro: ['守夜人站在門邊。', '「我等這扇門很久了，」他說。「但它不是為我開的。」'] }],
      intro: ['一扇門，沒有門把。', '門的另一面，有一張投影卡在等你。'],
      steps: [
        { id: 's_scan', type: 'ar', title: '掃描投影卡 B', target: 1, card: 'B', overlay: 'totem', prompt: '找到實體卡片 B，用相機對準它。' },
        { id: 's_rings', type: 'rings', title: '門環', rings: [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 7], [3, 4, 5, 6, 7, 1]],
          prompt: '轉動三個門環，對準圖騰上的符號。' },
        story('s_through', ['門打開了。', '門後是一條走廊，盡頭還有一扇門——比這扇小。']),
      ],
      epilogue: ['門已歸檔。', '你取得了第七個符號。'],
    },
    secrets: {
      s_scan: { fallback: 'GATE-B', reveal: { overlay: 'totem', glyphs: [4, 5, 6] }, success: '卡片上方浮現一座圖騰。' },
      s_rings: { answer: '4,5,6', hints: ['答案只出現在 AR 圖騰上。'], success: '門環依序歸位。', wrong: '門環彈回原位。' },
      hotspots: {
        photo_slot: { text: '照片嵌進凹槽剛剛好。門內傳來機械聲。', grant: { flags: { photo_used: true }, items: [{ key: 'gate_mark', name: '門的刻痕', desc: '你在第 5 天拿到的東西，在第 7 天被用上了。', data: { hidden: true } }] } },
        side_room: { text: '柱子後方有一間沒有標示的小房間。牆上有一張地圖的一角。', grant: { items: [{ key: 'map_fragment', name: '地圖殘片', desc: '標示著一個不在這十個區域裡的位置。', data: { hidden: true } }] } },
      },
    },
    on_complete: { symbol: 7, flags: { gate_open: true } },
    on_missed: { flags: { gate_sealed: true }, remove_items: ['photo_old'],
      message: { title: '門已封閉', body: '那扇門在午夜後消失了。你帶著的那張照片，被夾進了門縫。' } },
    alternate: {
      route_title: '門縫',
      scene: { theme: 'gate', light: 'dim', props: ['wall_slit'], hotspots: [] },
      intro: ['門消失了。', '牆上只剩一道很窄的縫。'],
      steps: [
        { id: 'a_peek', type: 'keypad', title: '從縫隙看進去', length: 4, clue: [{ type: 'slit', text: '7 2 9 1' }],
          prompt: '拖動視線，讀出縫隙另一側的數字。' },
        story('a_after', ['牆後的機關轉動了一下。', '門沒有回來，但你聽見它在別的地方打開。']),
      ],
      epilogue: ['有些門只開一次。', '有些門會在別處再出現。'],
    },
    alt_secrets: { a_peek: { answer: '7291', success: '牆後有東西動了。' } },
    on_alternate_complete: { symbol: 7, echo: true },
  },

  // ───────────────────────── DAY 8 · 岔路 ─────────────────────────
  {
    day: 8, code: 'ZONE 08', title: '岔路', subtitle: 'THE FORK',
    config: {
      notify: { new: '第 08 區要求一個選擇。', pending: '岔路仍在等待你的回覆。', expiring: '若午夜前沒有回覆，系統將代為選擇。' },
      scene: { theme: 'fork', light: 'on', props: ['door_left', 'door_right'], hotspots: [] },
      variants: [{
        id: 'third', when: { stat: 'missed', gte: 2 }, scene: { props: ['door_left', 'door_mid', 'door_right'] },
        intro: ['兩扇門之間，出現了第三扇。', '它沒有名字。'],
        steps: [
          story('s_intro', ['左邊寫著「保存」，右邊寫著「放手」。', '中間那扇門什麼也沒寫。']),
          { id: 's_door', type: 'choice', title: '選一扇門', flag: 'fork', text: ['系統：「只能選一扇。」'],
            options: [{ id: 'keep', label: '保存', desc: '' }, { id: 'stay', label: '（沒有名字的門）', desc: '' }, { id: 'release', label: '放手', desc: '' }] },
          { id: 's_keep', type: 'sequence', title: '整理檔案', pick: 4, render: 'box', when: { flag: 'choice:fork', eq: 'keep' },
            items: [{ id: 'b', label: '▮▮▮' }, { id: 'd', label: '▮' }, { id: 'a', label: '▮▮▮▮' }, { id: 'c', label: '▮▮' }],
            prompt: '從最厚的開始，把檔案放回架上。' },
          { id: 's_release', type: 'switches', title: '熄燈', count: 5, labels: ['01', '02', '03', '04', '05'], when: { flag: 'choice:fork', eq: 'release' },
            clue: [{ type: 'note', text: '「只留下你最早點亮的那一盞。」' }], prompt: '關掉其他的燈。', initial: '11111' },
          { id: 's_stay', type: 'wait', title: '停留', seconds: 30, when: { flag: 'choice:fork', eq: 'stay' },
            start_text: '系統開始計時。請不要離開這個畫面。', early_text: '你離開得太早了。計時重新開始。', prompt: '什麼都不用做。停留 30 秒。' },
          { id: 's_log', type: 'evidence', title: '缺損的紀錄', kinds: ['text'], prompt: '檔案缺損：請補上一段遺失的紀錄——一件你曾經錯過，但後來仍然記得的小事。' },
        ] }],
      intro: ['兩扇門。', '左邊寫著「保存」，右邊寫著「放手」。'],
      steps: [
        { id: 's_door', type: 'choice', title: '選一扇門', flag: 'fork', text: ['系統：「只能選一扇。」'],
          options: [{ id: 'keep', label: '保存', desc: '' }, { id: 'release', label: '放手', desc: '' }] },
        { id: 's_keep', type: 'sequence', title: '整理檔案', pick: 4, render: 'box', when: { flag: 'choice:fork', eq: 'keep' },
          items: [{ id: 'b', label: '▮▮▮' }, { id: 'd', label: '▮' }, { id: 'a', label: '▮▮▮▮' }, { id: 'c', label: '▮▮' }],
          prompt: '從最厚的開始，把檔案放回架上。' },
        { id: 's_release', type: 'switches', title: '熄燈', count: 5, labels: ['01', '02', '03', '04', '05'], when: { flag: 'choice:fork', eq: 'release' },
          clue: [{ type: 'note', text: '「只留下你最早點亮的那一盞。」' }], prompt: '關掉其他的燈。', initial: '11111' },
        { id: 's_log', type: 'evidence', title: '缺損的紀錄', kinds: ['text'], prompt: '檔案缺損：請補上一段遺失的紀錄——一件你曾經錯過，但後來仍然記得的小事。' },
      ],
      epilogue: ['岔路已歸檔。', '另一扇門並沒有消失。只是你沒有走進去。'],
    },
    secrets: {
      s_keep: { answer: 'a,b,c,d', success: '架子滿了。' },
      s_release: { answer: '10000', hints: ['你最早點亮的燈，在第 1 天。'], success: '只剩一盞燈。它很亮。' },
    },
    on_complete: { symbol: 8 },
    on_missed: { flags_default: { 'choice:fork': 'system' }, message: { title: '系統已代為選擇', body: '岔路在午夜前沒有收到回覆。系統替你選了一扇門。' } },
    alternate: {
      route_title: '覆寫',
      scene: { theme: 'fork', light: 'dim', props: ['door_left', 'door_right', 'relay'], hotspots: [] },
      intro: ['系統替你選了「靜置」。兩扇門都上鎖了。', '門邊有一組繼電器。'],
      steps: [
        { id: 'a_relay', type: 'switches', title: '繼電器', count: 4, labels: ['A', 'B', 'C', 'D'], initial: '0110',
          clue: [{ type: 'note', text: '目前狀態：系統決定。\n「與系統相反的，才是你的。」' }], prompt: '改寫繼電器。' },
        { id: 'a_door', type: 'choice', title: '重新選擇', flag: 'fork', text: ['鎖開了。這一次由你決定。'],
          options: [{ id: 'keep', label: '保存', desc: '' }, { id: 'release', label: '放手', desc: '' }, { id: 'system', label: '維持系統的選擇', desc: '' }] },
        { id: 'a_log', type: 'evidence', title: '缺損的紀錄', kinds: ['text'], prompt: '檔案缺損：請補上一段遺失的紀錄——一件你曾經錯過，但後來仍然記得的小事。' },
      ],
      epilogue: ['選擇已被覆寫——或被保留。', '兩者都記錄在案。'],
    },
    alt_secrets: { a_relay: { answer: '1001', success: '繼電器發出喀的一聲。' } },
    on_alternate_complete: { symbol: 8, echo: true },
  },

  // ───────────────────────── DAY 9 · 回放（無替代路線：錯過即永久缺損） ─────────────────────────
  {
    day: 9, code: 'ZONE 09', title: '回放', subtitle: 'PLAYBACK',
    config: {
      notify: { new: '第 09 區的投影機開始轉動。它播放的是你的紀錄。', pending: '回放仍在等待排序。', expiring: '回放將於午夜停止。這一段不會被保存。' },
      scene: { theme: 'playback', light: 'dim', props: ['projector', 'screen'], hotspots: [] },
      intro: ['投影機開始轉動。', '它播放的，是這幾天被保存下來的東西——沒有日期，順序亂了。'],
      steps: [
        { id: 's_timeline', type: 'timeline', title: '排列片段', upto: 8, prompt: '依照發生的順序排列這些片段。空白的片段也有它的位置。' },
        { id: 's_voice', type: 'evidence', title: '聲紋校準', kinds: ['audio'], prompt: '系統需要聲紋校準。對著麥克風說任何一句話。' },
      ],
      epilogue: ['回放結束。', '你取得了第九個符號。它是空白的。'],
    },
    secrets: { s_timeline: { hints: ['照片、聲音、文字與符號，都和你那一天做過的事有關。', '空白的片段，代表那一天的原路線沒有被走完。'], wrong: '影像跳動了一下。順序不對。' } },
    on_complete: { symbol: 9 },
    on_missed: { message: { title: '回放中斷', body: '投影機在午夜停了。這一段影像沒有被保存，也不會再播放。' } },
    alternate: null,
    on_alternate_complete: {},
  },

  // ───────────────────────── DAY 10 · 核心（跨日符號整合） ─────────────────────────
  {
    day: 10, code: 'ZONE 10', title: '核心', subtitle: 'THE CORE',
    config: {
      notify: { new: '最後一個區域。所有符號正在共鳴。', pending: '核心尚未被校準。', expiring: '核心將於午夜冷卻。' },
      scene: { theme: 'core', light: 'on', props: ['core', 'pillars'], hotspots: [] },
      variants: [
        { id: 'steady', when: { stat: 'max_streak', gte: 5 }, scene: { pulse: 'steady' }, intro: ['核心的脈動很規律。', '和培養艙裡的某個東西同步。'] },
        { id: 'drift', when: { stat: 'breaks', gte: 2 }, scene: { pulse: 'irregular' }, intro: ['核心的脈動時快時慢。', '像是在等什麼人回來。'] },
      ],
      intro: ['所有的符號同時發出聲音。', '每一個符號都有自己的頻率。'],
      steps: [
        { id: 's_code', type: 'keypad', title: '核心頻率', length: 5,
          clue: [{ type: 'glyphs', ids: [6, 2, 1, 2, 7], caption: '核心上刻著五個符號。' }], prompt: '輸入核心的頻率。' },
        story('s_ring', ['五個頻率疊在一起，形成一個環。', '環沒有起點，也沒有終點。']),
        { id: 's_last', type: 'choice', title: '最後的設定', flag: 'core', text: ['系統：「十個區域的紀錄即將封存。」'],
          options: [{ id: 'seal', label: '封存所有紀錄', desc: '' }, { id: 'open', label: '讓紀錄繼續寫下去', desc: '' }] },
      ],
      epilogue: ['所有區域已歸檔。', '明天，第030號檔案室將會開啟。'],
    },
    secrets: { s_code: { answer: '40306', hints: ['每個符號在「物品」頁都有一個頻率數字。', '裂＝4、聲＝0、起＝3、門＝6。'], success: '核心開始旋轉。', wrong: '頻率不符。' } },
    on_complete: { symbol: 10, flags: { core_done: true } },
    on_missed: { message: { title: '核心冷卻', body: '核心在午夜冷卻了。環沒有完全閉合。' } },
    alternate: {
      route_title: '未閉合之環',
      scene: { theme: 'core', light: 'dim', props: ['core'], hotspots: [] },
      intro: ['核心已經冷卻。', '但符號的刻痕還在，只是順序反了。'],
      steps: [
        { id: 'a_code', type: 'keypad', title: '冷卻的頻率', length: 5,
          clue: [{ type: 'glyphs', ids: [7, 2, 1, 2, 6], caption: '冷卻後的刻痕（由右至左）' }], prompt: '輸入頻率。' },
        story('a_ring', ['環亮了一半。', '另一半，留給以後。']),
      ],
      epilogue: ['環沒有完全閉合。', '也許它本來就不需要。'],
    },
    alt_secrets: { a_code: { answer: '60304', hints: ['每個符號在「物品」頁都有一個頻率數字。'], success: '核心微微發光。' } },
    on_alternate_complete: { symbol: 10, echo: true },
  },

  // ───────────────────────── DAY 11 · 生日：第030號檔案室 ─────────────────────────
  {
    day: 11, code: 'FILE 030', title: '第030號檔案室', subtitle: 'ARCHIVE 030',
    config: {
      scene: { theme: 'archive', light: 'on', props: ['shelves'], hotspots: [] },
      steps: [],
      monologue: [
        { text: '第030號檔案室。' },
        { text: '十天前，系統接到一個任務：為一個人建立一份完整的定義。' },
        { text: '它收集了每一次觀測、每一段聲音、每一張照片、每一個選擇。' },
        { when: { stat: 'missed', gte: 1 }, text: '也收集了每一次缺席。缺席的地方沒有被刪除，它們一樣是紀錄。' },
        { when: { stat: 'missed', lte: 0 }, text: '十個區域都留下了紀錄。系統以為，這樣就足夠了。' },
        { when: { flag: 'choice:fault', eq: 'keep' }, text: '你保留了那道裂縫。系統一度把它歸類為錯誤。' },
        { when: { flag: 'choice:fault', eq: 'repair' }, text: '你修復了最早的紀錄，也覆寫了另一段。系統記下了這個交換。' },
        { when: { any: [{ flag: 'choice:fault', eq: 'cross' }, { flag: 'choice:fault', eq: 'stay' }] }, text: '你走進了裂縫裡面。系統沒有為那裡準備地圖。' },
        { when: { flag: 'choice:fork', eq: 'keep' }, text: '在岔路，你選擇保存。' },
        { when: { flag: 'choice:fork', eq: 'release' }, text: '在岔路，你選擇放手。' },
        { when: { flag: 'choice:fork', eq: 'stay' }, text: '在岔路，你走進了沒有名字的門。系統沒有預料到第三個選項。' },
        { when: { flag: 'choice:fork', eq: 'system' }, text: '在岔路，你保留了系統替你做的選擇。那也是一種選擇。' },
        { when: { flag: 'watcher_met' }, text: '守夜人留下了一句話：「我只是在你不在的時候，替你看著。」' },
        { when: { flag: 'watcher_left' }, text: '你沒有見到守夜人最後一面。他留下的紙條，被歸檔在第 02 區。' },
        { text: '樣本 030 已經停止變化——不，它沒有。它只是在你看著它的時候，看起來像停住了。' },
        { text: '系統的結論是：無法完成定義。' },
        { text: '不是因為資料不夠。而是被定義的那個人，在被記錄的同時，仍在改變。' },
        { text: '30，不是一個完成的版本。' },
        { text: '30｜未完成的我。' },
        { text: '所以，系統把最後一個欄位交給你。' },
      ],
    },
    secrets: {},
    on_complete: {},
    on_missed: {},
    alternate: null,
    on_alternate_complete: {},
  },
];
