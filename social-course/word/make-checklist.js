/* =========================================================================
   make-checklist.js — 產生「三平台實作檢核表.docx」
     P1 Facebook 粉絲專頁 / P2 Instagram / P3 LINE 官方帳號 / P4 總覽與追蹤
   ========================================================================= */
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle, PageBreak, VerticalAlign
} = require('docx');
const fs = require('fs');
const path = require('path');

const FONT = { ascii:'微軟正黑體', eastAsia:'微軟正黑體', hAnsi:'微軟正黑體', cs:'微軟正黑體' };

const C = {
  ink:'241C17', ink2:'4A3C33', ink3:'7A6A5D', muted:'9C8B7C',
  clay:'C05F3C', clayTint:'FBEEE6',
  fb:'1877F2', fbTint:'EEF4FF',
  ig:'C2185B', igTint:'FDEEF4',
  ln:'03934A', lnTint:'E6F8EE',
  gold:'B87A28', goldTint:'FBF0DC',
  line:'DED3C6', line2:'EFE7DC'
};

const MARGIN = 1134;                        // A4 邊界 2 公分
const CONTENT_W = 11906 - MARGIN * 2;       // 9638 dxa

/* 欄寬：序號 / 檢核項目 / 判斷標準 / 完成 */
const W = [560, 2380, 5698, 1000];

/* ── 小工具 ─────────────────────────────────────────────────────────── */
const run = (text, o = {}) => new TextRun({
  text, font: FONT, size: o.size || 20, bold: o.bold,
  color: o.color || C.ink2, break: o.break
});

const para = (text, o = {}) => new Paragraph({
  alignment: o.align,
  spacing: { before: o.before || 0, after: o.after ?? 80 },
  children: Array.isArray(text) ? text : [run(text, o)]
});

const h1 = (text, color) => new Paragraph({
  spacing: { before: 0, after: 60 },
  children: [new TextRun({ text, font: FONT, size: 38, bold: true, color: color || C.ink })]
});

const cell = (children, o = {}) => new TableCell({
  width: { size: o.w, type: WidthType.DXA },
  columnSpan: o.span,
  shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill, color: 'auto' } : undefined,
  margins: { top: o.tight ? 70 : 90, bottom: o.tight ? 70 : 90, left: 110, right: 110 },
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

/* 一格文字 */
const tx = (text, o = {}) => new Paragraph({
  alignment: o.align, spacing: { after: 0 },
  children: [new TextRun({
    text, font: FONT, size: o.size || 20, bold: o.bold, color: o.color || C.ink2 })]
});

/* ── 檢核表主體 ─────────────────────────────────────────────────────── */
/* data = [ {sec:'A. 建立帳號'}, [項目, 判斷標準, optional?], ... ] */
function checklist(data, tone, tint) {
  const rows = [];
  let n = 0;

  rows.push(new TableRow({
    tableHeader: true,
    children: [
      cell(tx('　', { size: 18 }), { w: W[0], fill: tone }),
      cell(tx('檢核項目', { size: 19, bold: true, color: 'FFFFFF' }), { w: W[1], fill: tone }),
      cell(tx('做到什麼程度才算完成', { size: 19, bold: true, color: 'FFFFFF' }), { w: W[2], fill: tone }),
      cell(tx('完成', { size: 19, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER }), { w: W[3], fill: tone })
    ]
  }));

  for (const item of data) {
    if (item.sec) {
      rows.push(new TableRow({
        children: [cell(
          tx(item.sec, { size: 20, bold: true, color: tone }),
          { w: CONTENT_W, span: 4, fill: tint, tight: true })]
      }));
      continue;
    }
    const [name, std, optional] = item;
    n += 1;
    rows.push(new TableRow({
      children: [
        cell(tx(String(n), { size: 19, color: C.muted, align: AlignmentType.CENTER }), { w: W[0] }),
        cell(tx(name, { size: 20, bold: true, color: optional ? C.ink3 : C.ink }), { w: W[1] }),
        cell(tx(std, { size: 19, color: C.ink2 }), { w: W[2] }),
        cell(tx('□', { size: 30, color: tone, align: AlignmentType.CENTER }), { w: W[3] })
      ]
    }));
  }
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: W, borders: tblBorders, rows
  });
}

/* 頁首 */
function header(title, sub, tone, count) {
  return [
    h1(title, tone),
    para([
      run(sub, { size: 20, color: C.ink3 }),
      run('　　共 ' + count + ' 項', { size: 19, bold: true, color: tone })
    ], { after: 160 })
  ];
}

/* 頁尾：完成度與備註 */
function footer(tone, tint, total) {
  const w2 = [2600, CONTENT_W - 2600];
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: w2, borders: tblBorders,
    rows: [
      new TableRow({ children: [
        cell(tx('今天完成幾項？', { size: 20, bold: true, color: tone }), { w: w2[0], fill: tint }),
        cell(tx('　　　　　項　／　' + total + ' 項　　　　　完成日期：　　　月　　　日',
          { size: 20, color: C.ink2 }), { w: w2[1] })
      ]}),
      new TableRow({ children: [
        cell(tx('沒做完的，回家補做', { size: 20, bold: true, color: tone }), { w: w2[0], fill: tint }),
        cell([tx('', { size: 20 }), tx('', { size: 20 })], { w: w2[1] })
      ]})
    ]
  });
}

/* 提示條 */
function note(lines, tone, tint) {
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
        spacing: { after: i === lines.length - 1 ? 0 : 60 },
        children: Array.isArray(l) ? l : [run(l, { size: 19 })]
      })), { w: CONTENT_W, fill: tint, tight: true })]})]
  });
}

/* ═════════════════════════════════════════════════════════════════════
   Facebook
   ═════════════════════════════════════════════════════════════════════ */
const FB = [
  { sec:'A　帳號與粉專建立' },
  ['登入個人帳號', '用自己原本的 Facebook 帳號登入，看得到自己的首頁。粉專是掛在個人帳號下建立的，不用另外註冊。'],
  ['建立粉絲專頁', '從「選單 ☰ → 粉絲專頁 → 建立新的粉絲專頁」走完流程，畫面出現自己的專頁。'],
  ['專頁名稱', '填的是正式店名／品牌名，不是「測試」「我的專頁」這種暫時名稱。'],
  ['選擇類別', '至少選 1 個類別（例：食品飲料、手工藝品店、居家服務），選了才會被搜尋到。'],

  { sec:'B　基本資訊建立' },
  ['大頭貼', '已上傳 360 × 360 以上的正方形圖，主體在正中間，縮成圓形後仍看得出是什麼。'],
  ['封面橫幅', '已上傳 1640 × 624 的橫圖，店名／電話放在正中間（手機會裁掉左右兩側）。'],
  ['簡介', '一句話寫清楚「你賣什麼、在哪裡」，255 字以內，不要留空白。'],
  ['聯絡方式', '電話或 Messenger 至少填一項，別人點得到、找得到你。'],
  ['地址或服務範圍', '有實體店就填地址；沒有店面就填服務地區（例：台中市西屯區）。'],
  ['營業時間', '有固定時間就照實填；沒有就選「永遠營業」或關掉不顯示。'],

  { sec:'C　品牌與品質維護' },
  ['上傳畫質設定', 'Facebook App →「設定 → 媒體」→ 照片與影片上傳畫質都改成最高。不設定的話上傳會被壓糊。'],
  ['三個平台圖片一致', 'FB、IG、LINE 用同一張大頭貼，客人才認得出是同一家。'],
  ['專頁用戶名稱（@）', '設定短網址（例：@xitun.handmade），可以印在名片或傳給客人。'],
  ['置頂貼文', '把最重要的一篇（自我介紹或主打商品）設為置頂，新客人第一眼就看到。'],

  { sec:'D　發布內容' },
  ['發第一篇貼文', '有文字 ＋ 至少 1 張圖，已成功發布，回到專頁看得到它。'],
  ['貼文加地點或標籤', '在貼文裡加了地點打卡或標記，讓附近的人有機會看到。'],
  ['發一則限時動態', '用手機拍或選一張照片，發成限時動態（24 小時後會消失，練習用最安全）。'],

  { sec:'E　後台數據' },
  ['找到後台', '能自己點到「專業主頁面板 → 洞察報告」，不用旁人幫忙。'],
  ['看懂四個數字', '知道觸及人數、互動次數、新增追蹤、單篇貼文成效各自代表什麼。'],
  ['記下今天的數字', '把今天的追蹤人數寫在下面的追蹤表上，一個月後才有得比。']
];

/* ═════════════════════════════════════════════════════════════════════
   Instagram
   ═════════════════════════════════════════════════════════════════════ */
const IG = [
  { sec:'A　帳號建立' },
  ['下載並登入 App', '手機裝好 Instagram，能用自己的帳號登入。'],
  ['帳號名稱（@）', '取好英文帳號名稱，盡量和 Facebook 的短網址一致，好記也好找。'],
  ['切換成專業帳號', '「設定和隱私 → 帳號類型和工具 → 切換為專業帳號 → 選商家」。沒切換就完全看不到任何數據，這一項一定要做。'],

  { sec:'B　基本資訊建立' },
  ['大頭貼', '已上傳 320 × 320 以上的正方形圖。顯示得很小，用單一主體最清楚。'],
  ['姓名欄放關鍵字', '姓名欄填「品牌名 ＋ 你做什麼」（例：西屯手作蛋捲）。這一欄會被搜尋到，不要只填英文帳號。'],
  ['個人簡介', '150 字以內，寫清楚賣什麼、在哪裡、怎麼訂購。'],
  ['聯絡按鈕', '個人檔案上出現電話／Email／地址的按鈕，客人點一下就能聯絡。'],
  ['類別標籤', '名字底下有顯示類別（例：手工藝品店），這是切換專業帳號後才會出現的。'],

  { sec:'C　品牌與品質維護' },
  ['上傳畫質設定', '「設定和隱私 → 媒體品質」→ 開啟「以最佳畫質上傳」。預設是關的，開了照片才不會糊。'],
  ['九宮格主體放中間', '知道九宮格會把貼文裁成 3:4，所以商品、人臉不要放在照片最上面或最下面。'],
  ['建立精選限動', '至少建立 1 組精選（例：商品、訂購方式、客人回饋），限時動態才不會 24 小時就白做。'],
  ['與 Facebook 連結', '在「帳號中心」把 IG 和 FB 粉專連起來，之後一次發文可以兩邊都發。'],

  { sec:'D　發布內容' },
  ['發一篇貼文', '上傳時記得點左下角的「展開」圖示，保留 4:5 直式，不要被自動裁成正方形。'],
  ['貼文加 3–5 個 hashtag', '加上與商品、地區相關的標籤（例：#西屯美食 #手工蛋捲），不用貪多。'],
  ['發一則限時動態', '上下各留約 250 px 不要放字，會被頭像和輸入框遮住。'],
  ['發一支 Reels', '手機直式錄影 15 秒內就好。Reels 是目前最容易被陌生人看到的形式。'],

  { sec:'E　後台數據' },
  ['找到洞察報告', '能自己點到「個人檔案 → 專業主頁面板 → 洞察報告」。'],
  ['看懂四個數字', '知道觸及帳號數、互動次數、追蹤者變化、單篇成效各自代表什麼。'],
  ['記下今天的數字', '把今天的追蹤人數寫在追蹤表上。']
];

/* ═════════════════════════════════════════════════════════════════════
   LINE 官方帳號
   ═════════════════════════════════════════════════════════════════════ */
const LN = [
  { sec:'A　帳號建立' },
  ['下載官方帳號 App', '另外下載名叫「LINE 官方帳號」的 App。在原本的 LINE 裡面找不到，這是最多人卡住的地方。'],
  ['用現有 LINE 登入', '用自己原本的 LINE 帳號登入即可，不用公司行號、不用統一編號，個人也能申請。'],
  ['建立帳號並命名', '填好帳號名稱與類別，建立完成後看得到自己的管理畫面。'],

  { sec:'B　基本資訊建立' },
  ['大頭貼', '已上傳 640 × 640 的正方形圖，和 FB／IG 同一張。'],
  ['封面（背景圖）', '已上傳 1080 × 878 的圖。注意上方會被大頭貼與名稱蓋住一部分。'],
  ['狀態消息', '一句話介紹（例：西屯手作蛋捲・每週三五出貨），顯示在名稱下方。'],
  ['基本資料', '電話、地址、營業時間、網址都填好，客人點進來看得到。'],
  ['取得加入好友 QR Code', '已找到自己的 QR Code 或加入好友連結，可以存到手機或印出來貼在店裡。'],

  { sec:'C　品牌與品質維護' },
  ['傳送畫質設定', '原本的 LINE App →「設定 → 照片和影片」→ 傳送照片畫質選「原始畫質」。預設是壓縮過的。'],
  ['改好歡迎訊息', '把系統預設的罐頭訊息改成自己的話：你是誰、賣什麼、怎麼訂購。這是新好友看到的第一則訊息。'],
  ['圖片與另外兩個平台一致', '大頭貼、封面的風格和 FB／IG 一致。'],
  ['確認回應模式', '在「設定 → 回應設定」確認是聊天模式還是自動回應，知道客人傳訊息時會發生什麼事。'],

  { sec:'D　發布內容' },
  ['發一則群發訊息', '先把自己的官方帳號加為好友，群發一則測試訊息，確認自己收得到。'],
  ['建立圖文選單', '2500 × 843 的小型選單，檔案要壓在 1 MB 以內。好友還少的話可以先跳過。', true],
  ['建立圖文訊息或優惠券', '1040 × 1040 的正方形大圖，適合新品公告。今天可以先跳過。', true],

  { sec:'E　後台數據' },
  ['找到分析頁面', '能自己點到「主頁 → 分析」。'],
  ['看懂四個數字', '知道好友數、封鎖數、訊息開封率、點擊數各自代表什麼。'],
  ['記下今天的數字', '把今天的好友數寫在追蹤表上。']
];

const countOf = a => a.filter(x => !x.sec).length;

/* ═════════════════════════════════════════════════════════════════════
   組頁
   ═════════════════════════════════════════════════════════════════════ */
const kids = [];

/* ── P1 Facebook ── */
kids.push(...header('Facebook 粉絲專頁　實作檢核表',
  '每完成一項就打勾。沒完成的不要空著，圈起來回家補做。', C.fb, countOf(FB)));
kids.push(checklist(FB, C.fb, C.fbTint));
kids.push(new Paragraph({ spacing:{ before: 160 }, children: [] }));
kids.push(footer(C.fb, C.fbTint, countOf(FB)));

/* ── P2 Instagram ── */
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(...header('Instagram　實作檢核表',
  '第 3 項「切換成專業帳號」沒做，後面的數據全部看不到。', C.ig, countOf(IG)));
kids.push(checklist(IG, C.ig, C.igTint));
kids.push(new Paragraph({ spacing:{ before: 160 }, children: [] }));
kids.push(footer(C.ig, C.igTint, countOf(IG)));

/* ── P3 LINE ── */
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(...header('LINE 官方帳號　實作檢核表',
  '灰色字的項目今天做不完沒關係，好友累積到 30 人以後再回來做。', C.ln, countOf(LN)));
kids.push(checklist(LN, C.ln, C.lnTint));
kids.push(new Paragraph({ spacing:{ before: 160 }, children: [] }));
kids.push(footer(C.ln, C.lnTint, countOf(LN)));

/* ── P4 總覽 ── */
kids.push(new Paragraph({ children: [new PageBreak()] }));
kids.push(h1('三平台總覽　·　數字追蹤'));
kids.push(para('把三頁的結果抄過來，一眼看出哪裡還沒補完。', { size: 20, color: C.ink3, after: 200 }));

/* 總覽矩陣 */
{
  const w = [2200, 2479, 2479, CONTENT_W - 2200 - 2479 - 2479];
  const secs = [
    ['A　帳號建立', '4 項', '3 項', '3 項'],
    ['B　基本資訊建立', '6 項', '5 項', '5 項'],
    ['C　品牌與品質維護', '4 項', '4 項', '4 項'],
    ['D　發布內容', '3 項', '4 項', '3 項'],
    ['E　後台數據', '3 項', '3 項', '3 項']
  ];
  const head = new TableRow({
    tableHeader: true,
    children: [
      cell(tx('項目分類', { size: 19, bold: true, color: 'FFFFFF' }), { w: w[0], fill: C.ink }),
      cell(tx('Facebook', { size: 19, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER }), { w: w[1], fill: C.fb }),
      cell(tx('Instagram', { size: 19, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER }), { w: w[2], fill: C.ig }),
      cell(tx('LINE', { size: 19, bold: true, color: 'FFFFFF', align: AlignmentType.CENTER }), { w: w[3], fill: C.ln })
    ]
  });
  const body = secs.map((r, ri) => new TableRow({
    children: r.map((t, i) => cell(
      i === 0
        ? tx(t, { size: 20, bold: true, color: C.ink })
        : [tx('完成　　　／ ' + t, { size: 19, color: C.ink2, align: AlignmentType.CENTER })],
      { w: w[i], fill: i === 0 ? (ri % 2 ? C.line2 : undefined) : undefined }))
  }));
  const totalRow = new TableRow({
    children: [
      cell(tx('合計', { size: 21, bold: true, color: C.clay }), { w: w[0], fill: C.clayTint }),
      cell(tx('　　　／ 20 項', { size: 21, bold: true, color: C.fb, align: AlignmentType.CENTER }), { w: w[1], fill: C.clayTint }),
      cell(tx('　　　／ 19 項', { size: 21, bold: true, color: C.ig, align: AlignmentType.CENTER }), { w: w[2], fill: C.clayTint }),
      cell(tx('　　　／ 18 項', { size: 21, bold: true, color: C.ln, align: AlignmentType.CENTER }), { w: w[3], fill: C.clayTint })
    ]
  });
  kids.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: w, borders: tblBorders,
    rows: [head, ...body, totalRow]
  }));
}

/* 數字追蹤表 */
kids.push(new Paragraph({ spacing:{ before: 320, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: C.clay, space: 4 } },
  children: [new TextRun({ text:'數字追蹤　—　今天記一次，一個月後再記一次', font: FONT, size: 26, bold: true, color: C.clay })] }));
{
  const w = [3000, 2213, 2213, CONTENT_W - 3000 - 2213 - 2213];
  const rows = [
    ['要記的數字', '今天　　月　　日', '一個月後　　月　　日', '有沒有變多？'],
    ['Facebook 追蹤人數', '', '', ''],
    ['Facebook 單篇最高觸及', '', '', ''],
    ['Instagram 追蹤人數', '', '', ''],
    ['Instagram 單篇最高觸及', '', '', ''],
    ['LINE 好友人數', '', '', ''],
    ['LINE 訊息開封率（%）', '', '', '']
  ];
  kids.push(new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: w, borders: tblBorders,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0,
      children: r.map((t, i) => cell(
        tx(t || '　', {
          size: ri === 0 ? 19 : 20,
          bold: ri === 0 || i === 0,
          color: ri === 0 ? 'FFFFFF' : C.ink,
          align: ri === 0 && i > 0 ? AlignmentType.CENTER : undefined
        }),
        { w: w[i], fill: ri === 0 ? C.ink : (i === 0 && ri % 2 ? C.line2 : undefined) }))
    }))
  }));
}

kids.push(new Paragraph({ spacing:{ before: 260 }, children: [] }));
kids.push(note([
  [run('三個平台如果只來得及做完一件事，做這個：', { bold: true, color: C.clay, size: 20 })],
  [run('Facebook — ', { bold: true, color: C.fb, size: 19 }),
   run('把大頭貼、封面、簡介、聯絡方式四樣填滿。沒填滿，別人點進來會以為這家沒在經營。', { size: 19 })],
  [run('Instagram — ', { bold: true, color: C.ig, size: 19 }),
   run('切換成專業帳號。這一步不做，後面所有數據都看不到。', { size: 19 })],
  [run('LINE — ', { bold: true, color: C.ln, size: 19 }),
   run('改好歡迎訊息、拿到 QR Code。有這兩樣就能開始收客人。', { size: 19 })]
], C.clay, C.clayTint));

kids.push(new Paragraph({ spacing:{ before: 220 }, children: [
  new TextRun({ text:'＊各 App 的選單名稱會隨版本略有不同，找不到時用 App 內的搜尋功能找關鍵字（例如「畫質」「專業帳號」）。',
    font: FONT, size: 18, color: C.muted })
]}));

/* ── 輸出 ─────────────────────────────────────────────────────────── */
const doc = new Document({
  styles: { default: { document: { run: { font: FONT, size: 20, color: C.ink2 } } } },
  sections: [{
    properties: { page: { margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN } } },
    children: kids
  }]
});

const out = path.join(__dirname, '三平台實作檢核表.docx');
Packer.toBuffer(doc).then(b => {
  fs.writeFileSync(out, b);
  console.log('已產生：' + path.basename(out));
});
