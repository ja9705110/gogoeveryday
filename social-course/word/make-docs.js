/* =========================================================================
   make-docs.js — 產生兩份 Word 檔
     1. 圖片尺寸速查表.docx
     2. 課後測驗（選擇題 4 題）.docx
   ========================================================================= */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, HeadingLevel, BorderStyle,
  PageBreak, VerticalAlign
} = require('docx');
const fs = require('fs');
const path = require('path');

const FONT = { ascii:'微軟正黑體', eastAsia:'微軟正黑體', hAnsi:'微軟正黑體', cs:'微軟正黑體' };

const C = {
  ink:'241C17', ink2:'4A3C33', ink3:'7A6A5D', muted:'9C8B7C',
  clay:'C05F3C', clayTint:'FBEEE6',
  fb:'1877F2', fbTint:'EEF4FF',
  ig:'E1306C', igTint:'FDEEF4',
  ln:'03934A', lnTint:'E6F8EE',
  sage:'5F7A63', sageTint:'EAF0E8',
  gold:'D99A4E', goldTint:'FBF0DC',
  line:'DED3C6', line2:'EFE7DC'
};

/* 版面：A4，邊界 2 公分 → 內容寬 9638 dxa */
const MARGIN = 1134;
const CONTENT_W = 11906 - MARGIN * 2;

/* ── 小工具 ─────────────────────────────────────────────────────────── */
const run = (text, o = {}) => new TextRun({
  text, font: FONT, size: o.size || 21, bold: o.bold, italic: o.italic,
  color: o.color || C.ink2, break: o.break
});

const para = (text, o = {}) => new Paragraph({
  alignment: o.align, spacing: { before: o.before || 0, after: o.after ?? 80 },
  indent: o.indent,
  border: o.border,
  children: Array.isArray(text) ? text : [run(text, o)]
});

const h1 = (text, color) => new Paragraph({
  spacing: { before: 0, after: 60 },
  children: [new TextRun({ text, font: FONT, size: 40, bold: true, color: color || C.ink })]
});

const h2 = (text, color) => new Paragraph({
  spacing: { before: 260, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: color || C.clay, space: 4 } },
  children: [new TextRun({ text, font: FONT, size: 26, bold: true, color: color || C.clay })]
});

const cell = (children, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
  margins: { top: 90, bottom: 90, left: 120, right: 120 },
  verticalAlign: VerticalAlign.CENTER,
  children: Array.isArray(children) ? children : [children]
});

const tblBorders = {
  top:    { style: BorderStyle.SINGLE, size: 4, color: C.line },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: C.line },
  left:   { style: BorderStyle.SINGLE, size: 4, color: C.line },
  right:  { style: BorderStyle.SINGLE, size: 4, color: C.line },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: C.line2 },
  insideVertical:   { style: BorderStyle.SINGLE, size: 3, color: C.line2 }
};

/* 規格表：用途 / 尺寸 / 比例或上限 / 提醒 */
function specTable(headers, rows, tone, tint) {
  const W = [1750, 2000, 1150, CONTENT_W - 1750 - 2000 - 1150];
  const headRow = new TableRow({
    tableHeader: true,
    children: headers.map((t, i) => cell(
      new Paragraph({ spacing:{after:0}, children:[new TextRun({
        text:t, font:FONT, size:19, bold:true, color:'FFFFFF' })] }),
      { w: W[i], fill: tone }))
  });
  const body = rows.map((r, ri) => new TableRow({
    children: r.map((t, i) => cell(
      new Paragraph({ spacing:{after:0}, children:[new TextRun({
        text: t, font: FONT, size: i === 3 ? 19 : 20,
        bold: i <= 1, color: i === 2 ? C.ink3 : (i === 3 ? C.ink2 : C.ink) })] }),
      { w: W[i], fill: ri % 2 ? tint : undefined }))
  }));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: W, borders: tblBorders,
    rows: [headRow, ...body]
  });
}

/* 提示方塊 */
function tipBox(lines, tone, tint) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: {
      top:{style:BorderStyle.NONE}, bottom:{style:BorderStyle.NONE},
      right:{style:BorderStyle.NONE}, insideHorizontal:{style:BorderStyle.NONE},
      insideVertical:{style:BorderStyle.NONE},
      left:{ style: BorderStyle.SINGLE, size: 18, color: tone }
    },
    rows: [new TableRow({ children: [cell(
      lines.map((l, i) => new Paragraph({
        spacing:{ after: i === lines.length - 1 ? 0 : 70 },
        children: (Array.isArray(l) ? l : [run(l, { size: 20 })])
      })), { w: CONTENT_W, fill: tint })] })]
  });
}

/* ═════════════════════════════════════════════════════════════════════
   一、圖片尺寸速查表
   ═════════════════════════════════════════════════════════════════════ */
const sizeChildren = [];

sizeChildren.push(h1('圖片尺寸速查表'));
sizeChildren.push(para([
  run('Facebook 粉絲專頁　·　Instagram　·　LINE 官方帳號', { size: 22, color: C.ink3, bold: true })
], { after: 40 }));
sizeChildren.push(para([
  run('社群平台操作入門｜西屯婦女培力　08/16', { size: 19, color: C.muted })
], { after: 240 }));

/* 1. 總表 */
sizeChildren.push(h2('一、三個平台最常用的尺寸'));
{
  const W = [1500, 2400, 2400, CONTENT_W - 1500 - 2400 - 2400];
  const rows = [
    ['平台', '用途', '建議尺寸（px）', '比例'],
    ['Facebook', '大頭貼', '360 × 360', '1:1'],
    ['', '封面（橫幅）', '1640 × 624', '2.63:1'],
    ['', '貼文（正方形）', '1080 × 1080', '1:1'],
    ['', '貼文（直式）', '1080 × 1350', '4:5'],
    ['', '限時動態', '1080 × 1920', '9:16'],
    ['Instagram', '大頭貼', '320 × 320', '1:1'],
    ['', '貼文（直式，最推薦）', '1080 × 1350', '4:5'],
    ['', '貼文（正方形）', '1080 × 1080', '1:1'],
    ['', '限時動態 / Reels', '1080 × 1920', '9:16'],
    ['', '精選限動封面', '1080 × 1920', '9:16'],
    ['LINE 官方帳號', '大頭貼', '640 × 640', '1:1'],
    ['', '封面（背景圖）', '1080 × 878', '1.23:1'],
    ['', '圖文選單（大）', '2500 × 1686', '1.48:1'],
    ['', '圖文選單（小）', '2500 × 843', '2.97:1'],
    ['', '圖文訊息', '1040 × 1040', '1:1']
  ];
  const toneOf = i => (i <= 5 ? C.fb : i <= 10 ? C.ig : C.ln);
  const tintOf = i => (i <= 5 ? C.fbTint : i <= 10 ? C.igTint : C.lnTint);
  sizeChildren.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: W, borders: tblBorders,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      children: r.map((t, i) => cell(
        new Paragraph({ spacing:{after:0}, children:[new TextRun({
          text: t, font: FONT, size: ri === 0 ? 19 : 20,
          bold: ri === 0 || i === 0 || i === 2,
          color: ri === 0 ? 'FFFFFF' : (i === 0 ? toneOf(ri) : (i === 3 ? C.ink3 : C.ink)) })] }),
        { w: W[i], fill: ri === 0 ? C.ink : (i === 0 && t ? tintOf(ri) : undefined) }))
    }))
  }));
}

/* 2. 通則 */
sizeChildren.push(h2('二、不管哪個平台，記住這五件事'));
{
  const W = [2200, CONTENT_W - 2200];
  const rows = [
    ['寬度至少 1080', '手機螢幕很細緻，寬度低於 1080 上傳後會糊。手機直接拍的照片都超過這個數字，不用擔心。'],
    ['格式用 JPG', '照片用 JPG（檔案小、上傳快）。圖上有文字或需要透明背景才用 PNG。'],
    ['正方形最安全', '不知道要用什麼比例時，用 1080 × 1080，三個平台都不會被裁掉重要部分。'],
    ['重要內容放中間', '封面、橫幅在手機上會被裁掉左右兩邊。店名、電話千萬不要放在最邊邊。'],
    ['不要放大小圖', '小圖硬拉大一定會糊。寧可用原圖裁切，也不要把小圖放大。']
  ];
  sizeChildren.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: W, borders: tblBorders,
    rows: rows.map((r, ri) => new TableRow({
      children: r.map((t, i) => cell(
        new Paragraph({ spacing:{after:0}, children:[new TextRun({
          text: t, font: FONT, size: 20, bold: i === 0,
          color: i === 0 ? C.clay : C.ink2 })] }),
        { w: W[i], fill: ri % 2 ? C.clayTint : undefined }))
    }))
  }));
}

sizeChildren.push(new Paragraph({ spacing:{ before: 200 }, children: [] }));
sizeChildren.push(tipBox([
  [run('怎麼知道自己的照片幾 px？', { bold: true, color: C.clay, size: 20 }),
   run('　iPhone：相簿打開照片 → 往上滑，會顯示「○○○○ × ○○○○」。Android：相簿 → 右上角「⋮」→「詳細資料」。', { size: 20 })],
  [run('怎麼裁成正方形？', { bold: true, color: C.clay, size: 20 }),
   run('　相簿打開照片 → 編輯 → 裁切 → 選「正方形」，不用另外裝 App。', { size: 20 })]
], C.clay, C.clayTint));

/* 3. Facebook */
sizeChildren.push(new Paragraph({ children: [new PageBreak()] }));
sizeChildren.push(h1('Facebook 粉絲專頁', C.fb));
sizeChildren.push(para([run('大頭貼、封面橫幅、貼文、限時動態', { size: 20, color: C.ink3 })], { after: 200 }));
sizeChildren.push(specTable(
  ['用途', '建議上傳尺寸', '比例', '提醒'],
  [
    ['大頭貼', '360 × 360 px', '1:1', '顯示為圓形，四個角一定會被切掉。臉或商品要放正中間。手機上顯示約 196 px。'],
    ['封面橫幅', '1640 × 624 px', '2.63:1', '電腦顯示 820 × 312、手機顯示 640 × 360。手機會裁掉左右兩側，重要內容放中間。'],
    ['貼文 · 正方形', '1080 × 1080 px', '1:1', '最通用，同一張圖也能直接發到 Instagram。'],
    ['貼文 · 直式', '1080 × 1350 px', '4:5', '在手機上佔的版面最大，比較容易被看到。'],
    ['貼文 · 橫式', '1200 × 630 px', '1.91:1', '分享連結時的預覽圖也是這個比例。'],
    ['限時動態', '1080 × 1920 px', '9:16', '滿版直式。上下各留約 250 px 不要放字，會被介面遮住。'],
    ['活動封面', '1920 × 1005 px', '1.91:1', '辦市集、開課活動時用。'],
    ['檔案格式', 'JPG 或 PNG', '—', '照片用 JPG；圖上有文字用 PNG 比較不會糊。']
  ], C.fb, C.fbTint));

sizeChildren.push(new Paragraph({ spacing:{ before: 220 }, children: [] }));
sizeChildren.push(tipBox([
  [run('封面橫幅的安全區', { bold: true, color: C.fb, size: 21 })],
  [run('上傳 1640 × 624，但手機只看得到中間約 60% 的範圍。店名、電話、重要圖案一定要放在正中間，兩側只放背景或留白。', { size: 20 })],
  [run('最常見的三個錯誤', { bold: true, color: C.fb, size: 21 })],
  [run('① 大頭貼放全身照或風景，縮成圓形後看不出是什麼。', { size: 20 })],
  [run('② 封面把店名放在最左邊，手機一看就被裁掉。', { size: 20 })],
  [run('③ 用截圖當貼文圖片——截圖的解析度通常不夠，放大會糊。', { size: 20 })]
], C.fb, C.fbTint));

/* 4. Instagram */
sizeChildren.push(new Paragraph({ children: [new PageBreak()] }));
sizeChildren.push(h1('Instagram', C.ig));
sizeChildren.push(para([run('大頭貼、貼文、限時動態、Reels、精選限動', { size: 20, color: C.ink3 })], { after: 200 }));
sizeChildren.push(specTable(
  ['用途', '建議上傳尺寸', '比例', '提醒'],
  [
    ['大頭貼', '320 × 320 px', '1:1', '顯示為圓形且很小（約 110 px）。細節多的圖看不清楚，用單一主體最好。'],
    ['貼文 · 直式', '1080 × 1350 px', '4:5', '最推薦。在手機上佔版面最大，別人滑到時比較容易停下來。'],
    ['貼文 · 正方形', '1080 × 1080 px', '1:1', '最安全，跟 Facebook 通用，同一張圖兩邊都能發。'],
    ['貼文 · 橫式', '1080 × 566 px', '1.91:1', '佔版面最小，除非是風景照，否則不建議。'],
    ['限時動態', '1080 × 1920 px', '9:16', '上下各留約 250 px 不要放重要文字，會被頭像與輸入框遮住。'],
    ['Reels', '1080 × 1920 px', '9:16', '直式錄影即可。手機直接錄就是這個比例，不用調整。'],
    ['精選限動封面', '1080 × 1920 px', '9:16', '顯示成小圓形，只看得到正中央那一小塊。'],
    ['個人檔案九宮格', '系統自動裁切', '3:4', '貼文在九宮格會被裁成直式，主體放中間才不會被切到。'],
    ['檔案格式', 'JPG 或 PNG', '—', 'Instagram 會自動壓縮。原圖越清楚，壓縮後越好看。']
  ], C.ig, C.igTint));

sizeChildren.push(new Paragraph({ spacing:{ before: 220 }, children: [] }));
sizeChildren.push(tipBox([
  [run('兩個很多人不知道的重點', { bold: true, color: C.ig, size: 21 })],
  [run('① 貼文上傳時 Instagram 預設會裁成正方形，要點左下角的「展開」圖示才會保留原本的直式比例。', { size: 20 })],
  [run('② 九宮格的裁切跟貼文本身不一樣——貼文是 4:5，九宮格顯示是 3:4，所以商品不要放在照片最下面。', { size: 20 })]
], C.ig, C.igTint));

/* 5. LINE */
sizeChildren.push(new Paragraph({ children: [new PageBreak()] }));
sizeChildren.push(h1('LINE 官方帳號', C.ln));
sizeChildren.push(para([run('大頭貼、封面、圖文選單、圖文訊息', { size: 20, color: C.ink3 })], { after: 200 }));
sizeChildren.push(specTable(
  ['用途', '尺寸', '檔案上限', '提醒'],
  [
    ['大頭貼', '640 × 640 px', '3 MB', '顯示為圓形。建議跟 Facebook 粉專用同一張，客人才認得出是同一家。'],
    ['封面（背景圖）', '1080 × 878 px', '3 MB', '客人點進你的帳號首頁才看得到。上方會被大頭貼與名稱蓋住一部分。'],
    ['圖文選單 · 大', '2500 × 1686 px', '1 MB', '聊天室最下面固定的按鈕區。可切成 2–6 格。'],
    ['圖文選單 · 小', '2500 × 843 px', '1 MB', '只佔一半高度，不會擋到對話。初學者建議用這個。'],
    ['圖文訊息', '1040 × 1040 px', '10 MB', '群發時可以點的大圖，適合新品公告、活動通知。'],
    ['群發訊息圖片', '建議 1040 × 1040', '10 MB', '一般照片直接傳即可，系統會自動處理。'],
    ['優惠券圖片', '1040 × 1040 px', '10 MB', '正方形。'],
    ['檔案格式', 'JPG / JPEG / PNG', '—', '不支援 HEIC。iPhone 拍的照片若無法上傳，先用「編輯 → 儲存」轉一次即可。']
  ], C.ln, C.lnTint));

sizeChildren.push(new Paragraph({ spacing:{ before: 220 }, children: [] }));
sizeChildren.push(tipBox([
  [run('圖文選單 1 MB 的限制最容易卡住', { bold: true, color: C.ln, size: 21 })],
  [run('2500 × 1686 的圖很容易超過 1 MB。解決方式：① 存檔時選 JPG 而不是 PNG；② 用手機內建的「編輯 → 儲存」再上傳一次，檔案通常會變小；③ 圖案簡單一點（純色背景 ＋ 文字），檔案自然小。', { size: 20 })],
  [run('今天不用急著做圖文選單。等好友累積到 30–50 人再回來設定，比較划算。先把大頭貼與封面弄好就夠了。', { size: 20, bold: true })]
], C.ln, C.lnTint));

sizeChildren.push(new Paragraph({ spacing:{ before: 260 }, children: [
  run('＊以上為各平台目前公告的建議規格。平台偶爾會調整（例如 Instagram 個人檔案九宮格曾從 1:1 改為 3:4），大量印製前建議再確認一次。',
      { size: 18, color: C.muted })
] }));

/* ═════════════════════════════════════════════════════════════════════
   二、課後測驗
   ═════════════════════════════════════════════════════════════════════ */
const QUIZ = [
  {
    q: '關於 Facebook 粉絲專頁，下列敘述何者正確？',
    opts: [
      '必須另外註冊一個全新的 Facebook 帳號，才能建立粉絲專頁。',
      '用自己現有的個人帳號就能建立，而且建立後可以看到後台數據。',
      '粉絲專頁的追蹤人數上限和個人帳號一樣是 5,000 人。',
      '粉絲專頁只能發文，沒有任何數據可以查看。'
    ],
    ans: 1,
    why: '粉絲專頁是「掛在」個人帳號底下建立的，不需要新的帳號或 Email。建立後可以在「專業主頁面板 → 洞察報告」看到觸及人數、互動次數等數據；追蹤人數沒有上限，這也是它和個人帳號最大的差別。'
  },
  {
    q: '在 Instagram 上，想要看到「洞察報告」的數據，必須先完成哪一個動作？',
    opts: [
      '追蹤人數要先滿 1,000 人。',
      '付費升級成廣告帳號。',
      '把帳號切換成「專業帳號」。',
      '把帳號設定為不公開。'
    ],
    ans: 2,
    why: '一般個人帳號完全看不到任何數據。要在「設定和隱私 → 帳號類型和工具 → 切換為專業帳號」切換過去，洞察報告才會出現。切換是免費的、隨時可以改回來，朋友那邊看起來也沒有差別。'
  },
  {
    q: '關於 LINE 官方帳號，下列敘述何者正確？',
    opts: [
      '在原本的 LINE App 裡面就可以直接建立，不用下載其他 App。',
      '必須要有公司行號與統一編號才能申請。',
      '要另外下載「LINE 官方帳號」App，用現有的 LINE 帳號登入就能建立。',
      '只能一對一聊天，沒辦法一次通知所有好友。'
    ],
    ans: 2,
    why: '官方帳號是另一個 App（名稱就叫「LINE 官方帳號」），不是在原本的 LINE 裡面找。個人也可以申請，不需要公司行號。建立後可以用「群發訊息」一次通知所有好友，這正是它和私人 LINE 最大的差別。'
  },
  {
    q: '想準備一張圖片，同時用在 Facebook、Instagram 和 LINE，而且不容易被裁切掉重要內容，最建議使用哪一種尺寸？',
    opts: [
      '1080 × 1080 px（正方形）',
      '640 × 480 px（橫式小圖）',
      '1920 × 1005 px（寬橫式）',
      '300 × 300 px（正方形小圖）'
    ],
    ans: 0,
    why: '正方形 1080 × 1080 在三個平台都不會裁掉重要部分，是最安全的通用尺寸。(B)(D) 寬度不足 1080，上傳後會糊；(C) 太寬，在 Instagram 和 LINE 上會被裁掉上下或左右。'
  }
];

const LETTER = ['(A)', '(B)', '(C)', '(D)'];
const quizChildren = [];

quizChildren.push(h1('課後測驗'));
quizChildren.push(para([run('社群平台操作入門｜西屯婦女培力　08/16', { size: 21, color: C.ink3, bold: true })], { after: 60 }));
quizChildren.push(para([run('共 4 題，皆為單選題。請在括號內填入答案代號。', { size: 20, color: C.ink3 })], { after: 200 }));

/* 姓名列 */
quizChildren.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [1200, 3200, 1200, CONTENT_W - 1200 - 3200 - 1200],
  borders: {
    top:{style:BorderStyle.NONE}, left:{style:BorderStyle.NONE}, right:{style:BorderStyle.NONE},
    insideVertical:{style:BorderStyle.NONE}, insideHorizontal:{style:BorderStyle.NONE},
    bottom:{ style: BorderStyle.SINGLE, size: 8, color: C.ink }
  },
  rows: [new TableRow({ children: [
    cell(new Paragraph({ spacing:{after:0}, children:[run('姓名：', { bold: true, size: 21 })] }), { w: 1200 }),
    cell(new Paragraph({ spacing:{after:0}, children:[run('', { size: 21 })] }), { w: 3200 }),
    cell(new Paragraph({ spacing:{after:0}, children:[run('日期：', { bold: true, size: 21 })] }), { w: 1200 }),
    cell(new Paragraph({ spacing:{after:0}, children:[run('', { size: 21 })] }), { w: CONTENT_W - 5600 })
  ]})]
}));
quizChildren.push(new Paragraph({ spacing:{ before: 240 }, children: [] }));

QUIZ.forEach((item, i) => {
  quizChildren.push(new Paragraph({
    spacing: { before: i === 0 ? 0 : 300, after: 120 },
    children: [
      run(`${i + 1}. `, { bold: true, size: 23, color: C.clay }),
      run(item.q, { bold: true, size: 23, color: C.ink }),
      run('　（　　　）', { bold: true, size: 23, color: C.ink })
    ]
  }));
  item.opts.forEach((o, k) => {
    quizChildren.push(new Paragraph({
      spacing: { after: 90 }, indent: { left: 360 },
      children: [
        run(`${LETTER[k]} `, { bold: true, size: 21, color: C.ink3 }),
        run(o, { size: 21 })
      ]
    }));
  });
});

/* 解答頁 */
quizChildren.push(new Paragraph({ children: [new PageBreak()] }));
quizChildren.push(h1('解答與解析', C.sage));
quizChildren.push(para([run('講師用｜作答後再發給學員', { size: 20, color: C.ink3 })], { after: 200 }));

/* 答案總表 */
quizChildren.push(new Table({
  width: { size: CONTENT_W, type: WidthType.DXA },
  columnWidths: [CONTENT_W / 5, CONTENT_W / 5, CONTENT_W / 5, CONTENT_W / 5, CONTENT_W / 5],
  borders: tblBorders,
  rows: [
    new TableRow({ children: ['題號', '1', '2', '3', '4'].map((t, i) => cell(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:0},
        children:[new TextRun({ text:t, font:FONT, size:21, bold:true, color:'FFFFFF' })] }),
      { w: CONTENT_W / 5, fill: C.sage })) }),
    new TableRow({ children: ['答案', ...QUIZ.map(q => LETTER[q.ans].replace(/[()]/g, ''))].map((t, i) => cell(
      new Paragraph({ alignment: AlignmentType.CENTER, spacing:{after:0},
        children:[new TextRun({ text:t, font:FONT, size:24, bold:true,
          color: i === 0 ? C.sage : C.clay })] }),
      { w: CONTENT_W / 5, fill: i === 0 ? C.sageTint : undefined })) })
  ]
}));

quizChildren.push(new Paragraph({ spacing:{ before: 280 }, children: [] }));

QUIZ.forEach((item, i) => {
  quizChildren.push(new Paragraph({
    spacing: { before: i === 0 ? 0 : 260, after: 100 },
    children: [
      run(`第 ${i + 1} 題　答案：${LETTER[item.ans].replace(/[()]/g, '')}`, { bold: true, size: 22, color: C.sage })
    ]
  }));
  quizChildren.push(new Paragraph({
    spacing: { after: 80 }, indent: { left: 200 },
    children: [run(item.q, { size: 20, color: C.ink, bold: true })]
  }));
  quizChildren.push(new Paragraph({
    spacing: { after: 0 }, indent: { left: 200 },
    children: [run(item.why, { size: 20, color: C.ink2 })]
  }));
});

/* ── 輸出 ───────────────────────────────────────────────────────────── */
const pageSetup = {
  properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } }
};

const docOpts = children => ({
  styles: { default: { document: { run: { font: FONT, size: 21, color: C.ink2 } } } },
  sections: [{ ...pageSetup, children }]
});

const OUT = path.join(__dirname);
(async () => {
  const a = new Document(docOpts(sizeChildren));
  fs.writeFileSync(path.join(OUT, '圖片尺寸速查表.docx'), await Packer.toBuffer(a));
  const b = new Document(docOpts(quizChildren));
  fs.writeFileSync(path.join(OUT, '課後測驗_選擇題4題.docx'), await Packer.toBuffer(b));
  console.log('已產生：圖片尺寸速查表.docx、課後測驗_選擇題4題.docx');
})();
