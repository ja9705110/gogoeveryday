/* =========================================================================
   slides-a.js — 共用元件　·　開場　·　第一小時（概念、範例、腳本）
   第 1–23 頁
   ========================================================================= */
const DECK = [];
const S = o => DECK.push(o);

const divider = (no, title, sub, ic) => `
  <div class="wrap">
    <p class="pno" data-r>${no}</p>
    <h2 data-r>${title}</h2>
    <p class="d-sub" data-r>${sub}</p>
  </div>
  <div class="d-art">${ic}</div>`;

/* 十一種短影音主題 */
const TOPICS = [
  ['商品介紹','商品是什麼？特色在哪裡？'],
  ['試吃／試用心得','吃起來、用起來什麼感覺？'],
  ['使用方式','怎麼用？怎麼搭配？'],
  ['製作過程','從原料到完成'],
  ['幕後花絮','平常看不到的準備工作'],
  ['前後對比','使用前後、原料與成品'],
  ['開箱','從收到、打開到看見'],
  ['商品細節','材質、紋理、包裝'],
  ['顧客情境','什麼時候適合用？'],
  ['常見問題','回答一個客人常問的'],
  ['推薦理由','為什麼推薦這個商品']
];

const threeAct = (title, rows, c) => `
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">${title}</h2></div>
    <div data-r style="display:flex;gap:18px">
      ${rows.map(([seg,what,shot,sec],i)=>`
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
             border-top:5px solid ${[C.clay,C.gold,C.sage][i]};border-radius:16px;padding:18px 16px">
          <p style="margin:0 0 10px;font-size:22px;font-weight:900;color:${[C.clay,C.gold,C.sage][i]}">${seg}</p>
          ${ART.vshot({ w:132, k:[0.34,0.6,0.5][i],
                        sim:{ bg:'wood', light:'side', angle:i===1?'a45':'a45' } })}
          <p style="margin:11px 0 4px;font-size:20px;font-weight:800;color:${C.ink};line-height:1.35">${what}</p>
          <p style="margin:0;font-size:18px;font-weight:650;color:${C.ink3}">${shot}　·　${sec}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:14px 22px">${ART.icon('clock',28)}
      <span class="txt">${c}</span></div>
  </div>`;

const shotPage = (kind, title, uses, tip, c) => `
  <div class="split" style="gap:38px">
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.shot(kind, 300, 380, { cap:null })}
    </div>
    <div class="stack gap-m">
      <div><h2 class="h" data-r style="font-size:36px">${title}</h2></div>
      <div class="stack gap-s" data-r>
        <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em">最適合拍</p>
        ${uses.map(u=>`
          <div style="display:flex;gap:12px;align-items:center;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-left:4px solid ${c};
               border-radius:13px;padding:12px 18px;font-size:21px;font-weight:700;color:${C.ink2}">
            ${u}</div>`).join('')}
      </div>
      <div class="callout" data-r style="padding:14px 22px">${ART.icon('bulb',28)}
        <span class="txt">${tip}</span></div>
    </div>
  </div>`;

/* 必備六個鏡頭（拍攝段與附錄共用） */
const SIX = [
  ['完整商品', '全景', '看得出來這是什麼、有多大', 'wide'],
  ['商品＋手', '中景', '有人在用它、在做它',       'medium'],
  ['商品主角', '近景', '商品填滿畫面',             'close'],
  ['一個細節', '特寫', '質地、切面、扣環、紋路',   'detail'],
  ['過程或幕後', '中景', '正在做的那一刻',         'medium'],
  ['完成畫面', '近景', '包好、擺好、可以帶走了',   'close']
];

/* 運鏡三頁，共用模板 */
const movePage = (no, name, en, kind, why, how, bad, c) => ({
  part:'拍攝', time:['11:12','11:14','11:16'][no-1], kind:'std', title:'運鏡' + no + '：' + name,
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>運鏡 ${no} / 3</p>
      <h2 class="h" data-r style="font-size:38px">${name}　<span style="font-size:.62em;
        font-weight:800;color:${C.ink3}">${en}</span></h2>
    </div>
    <div class="split" data-r style="gap:30px;align-items:center">
      <div style="display:flex;justify-content:center">${ART.move(kind, 420, 268)}</div>
      <div class="stack gap-s">
        <div class="card" style="padding:18px 22px;border-left:6px solid ${c}">
          <p style="margin:0 0 5px;font-size:22px;font-weight:900;color:${c}">什麼時候用</p>
          <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">${why}</p>
        </div>
        <div class="card" style="padding:18px 22px;border-left:6px solid ${C.sage}">
          <p style="margin:0 0 5px;font-size:22px;font-weight:900;color:${C.sage}">怎麼做</p>
          <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">${how}</p>
        </div>
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('warn',30)}
      <span class="txt">${bad}</span></div>
  </div>`
});

/* 四週發片計畫（收尾段與附錄共用） */
const PLAN = [
  ['第 1 週', '草莓果醬怎麼熬', '—', '—'],
  ['第 2 週', '—', '果醬的質地特寫', '—'],
  ['第 3 週', '鳳梨果醬怎麼熬', '—', '—'],
  ['第 4 週', '—', '—', '開封後可以放多久']
];

/* InShot 九步驟（剪輯段與附錄共用） */
const NINE = [
  ['建立專案，比例選 9:16', '一進去就先設，之後不能改'],
  ['匯入今天拍的影片',     '一次全選，順序等一下再排'],
  ['修剪：切掉頭尾',       '每段留 3–5 秒最精彩的'],
  ['分割與刪除',           '中間不要的部分切開刪掉'],
  ['調整順序',             '最好看的那顆放第一個'],
  ['加文字',               '前 3 秒那一句最重要'],
  ['加音樂並調音量',       '用 InShot 內建的'],
  ['轉場：多數直接切',     '不要每個接縫都加效果'],
  ['輸出 1080p／30fps',    '存到手機相簿']
];

/* =========================================================================
   開場（1–5）
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'cover', title:'封面：商品短影音腳本、拍攝與剪輯',
  html:`
  <div class="cover-wrap">
    <div class="cover-l">
      <h1 class="mega" data-r style="font-size:62px">商品短影音<br>腳本、拍攝與剪輯</h1>
      <p class="lead" data-r style="margin-top:18px;font-size:26px">
        今天不是學剪輯 App。<br>
        你會<b class="hl">先想清楚要說什麼</b>，再拍，最後才剪。</p>
      <div data-r style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">
        <span class="tag sm">想</span><span class="tag sm">寫</span>
        <span class="tag sm">畫</span><span class="tag on sm">拍</span><span class="tag sm">剪</span>
      </div>
    </div>
    <div class="cover-r" data-r>
      ${ART.vshot({ w:196, k:0.6, sim:{ bg:'wood', light:'side', angle:'a45' } })}
    </div>
  </div>`,
  notes:{
    say:['開場先確認三件事：手機電量、儲存空間、InShot 有沒有裝好。',
         '沒裝 InShot 的請助教立刻協助，不要等到下午才發現。',
         '這堂課的主軸是攝影：一小時想腳本，三小時拍，最後才剪。現在就要講清楚，學員才知道重點在哪。'],
    ask:['問：有帶商品來的舉手？有裝好 InShot 的舉手？'],
    do:['確認電量、空間、InShot。'],
    diff:['學員知道今天是拍片不是學 App。'],
    more:['請一兩位說自己想拍什麼，後面舉例用得到。'],
    less:['自我介紹一分鐘帶過。']
  }});

S({ part:'開場', time:'09:02', kind:'std', title:'今天結束時，你會有一支影片',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:38px">不是學會軟體，是做出一支成品</h2></div>
    <div class="cards c4" data-r style="gap:18px">
      ${[['一句主題','一句話說清楚這支影片要幹嘛',ART.icon('bulb',40,C.clay),'tint'],
         ['一張分鏡表','5–8 個鏡頭，拍之前就決定好',ART.icon('grid',40,C.gold),'gold'],
         ['一批拍好的素材','六個必備鏡頭，加上補拍的',ART.icon('cam',40,C.sage),'sage'],
         ['一支 15–30 秒影片','剪好、輸出、存在手機裡',ART.icon('play',40,C.plum),'plum']]
        .map(([k,v,ic,cls])=>`
        <div class="card ${cls}" style="padding:24px 20px">
          <span class="ico">${ic}</span>
          <p class="k" style="font-size:23px">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',34,C.gold)}
      <span class="txt">今天最花時間的是<b>拍</b>，不是剪。
      素材拍得好，剪輯一個多小時就夠。</span></div>
  </div>`,
  notes:{
    say:['四樣成果講具體，學員才有安全感。',
         '最後那句要講：素材好，剪輯就快。這是今天時間分配的理由。'],
    ask:['問：你們拍過影片嗎？最後有剪出來嗎？（多數人拍了一堆沒剪）'],
    do:[],
    diff:['學員理解為什麼第一個小時都在「想」。'],
    more:['問拍了沒剪的原因，多半是「素材亂七八糟不知道從何剪起」。'],
    less:['只講四張卡片標題。']
  }});

S({ part:'開場', time:'09:04', kind:'std', title:'今天的節奏',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:38px">想 → 寫 → 畫 → 拍 → 剪</h2></div>
    <div data-r style="display:flex;align-items:center;gap:11px">
      ${[['想','這支要拍什麼',C.clay],
         ['寫','開始、過程、完成',C.gold],
         ['畫','分鏡表 5–8 個鏡頭',C.sage],
         ['拍','照分鏡表拍',C.plum],
         ['剪','InShot 組起來',C.clean]]
        .map(([k,v,c],i)=>`
        ${i?`<span style="font-size:30px;color:${C.muted};font-weight:300">→</span>`:''}
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);border-top:5px solid ${c};
             border-radius:18px;padding:20px 15px;box-shadow:0 14px 34px -20px rgba(60,40,28,.45)">
          <p style="margin:0 0 7px;font-size:26px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('clock',34,C.gold)}
      <span class="txt">前面三步，<b class="hl">只花第一個小時</b>。
      一小時之後就把手機拿起來，<b>剩下的時間全部在拍和剪</b>。</span></div>
    <div class="callout" data-r style="padding:12px 22px">${ART.icon('warn',28)}
      <span class="txt">最常見的失敗：跳過前面三步，直接拿手機開始拍。
      拍了一堆素材，回來發現剪不出一支完整的影片。<b>所以這一小時不能省。</b></span></div>
  </div>`,
  notes:{
    say:['五步照順序講，重點是時間分配：前三步只花一小時。',
         '「一小時之後就開始拍」這句一定要講，學員才願意坐得住這一小時。',
         '「跳過前三步直接拍」是幾乎所有人的習慣，要點破。'],
    ask:['問：你以前拍影片，是先想好還是先拍再說？'],
    do:[],
    diff:['學員願意先花一小時想，因為知道很快就會動手。'],
    more:[], less:['直接進下一頁。']
  }});

S({ part:'開場', time:'09:06', kind:'std', title:'四個核心觀念',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">這四句話，今天會一直回來</h2></div>
    <div class="cards c2" data-r style="gap:17px">
      ${[['影片不是拿起手機就開始拍',
          '是先想好要說什麼。想清楚的人，拍二十分鐘就夠；沒想清楚的，拍兩小時也剪不出來。',C.clay],
         ['一支短影片，先講清楚一件事',
          '十五秒講三件事，觀眾一件都記不住。想講很多，就拍很多支。',C.sage],
         ['不要只拍商品，也要拍商品正在發生什麼',
          '商品轉一圈沒有人想看。手在做、東西在動、過程在跑，才有人停下來。',C.gold],
         ['先想、再寫、再拍，最後才剪',
          '剪輯救不回沒拍到的鏡頭。今天的順序就是這句話。',C.plum]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 24px;border-left:5px solid ${c}">
          <p class="k" style="font-size:24px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['四句都是原則，講完就往下，不要展開太久。',
         '第三句「不要只拍商品」是今天故事感那一段的伏筆。',
         '第四句是整天的順序，拍攝時會一直回來提醒。'],
    ask:['問：你看過的短影音裡，哪一種會讓你停下來看完？'],
    do:[],
    diff:['學員開始意識到影片和照片不一樣：影片要有「事情在發生」。'],
    more:['舉例：一支只有商品轉圈的影片 vs 一支手在包裝的影片。'],
    less:['只講第一句和第四句。']
  }});

S({ part:'開場', time:'09:08', kind:'std', title:'一小時想清楚，其他時間全部在動手',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">今天的時間，是這樣分的</h2></div>
    <div data-r style="display:flex;gap:14px;align-items:stretch">
      ${[['第一個小時','想','主題、腳本、分鏡表','60 分',C.gold],
         ['接下來三小時','拍','必備六鏡、運鏡、過程、補拍','180 分',C.clay],
         ['最後一段','剪','InShot 九步驟、輸出','70 分',C.sage],
         ['收尾','看成果','檢視、下一步','20 分',C.plum]]
        .map(([k,v,d,m,c])=>`
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
             border-top:6px solid ${c};border-radius:16px;padding:18px 14px;text-align:center">
          <p style="margin:0 0 4px;font-size:19px;font-weight:800;color:${C.ink3}">${k}</p>
          <p style="margin:0 0 7px;font-size:30px;font-weight:900;color:${c}">${v}</p>
          <p style="margin:0 0 10px;font-size:18px;font-weight:650;color:${C.ink2};line-height:1.35">${d}</p>
          <span class="tag sm" style="background:${c};color:#fff;border-color:${c}">${m}</span>
        </div>`).join('')}
    </div>
    <div data-r>
      <div style="display:flex;height:26px;border-radius:8px;overflow:hidden;
           border:1px solid rgba(36,28,23,.14)">
        ${[[60,C.gold],[180,C.clay],[70,C.sage],[20,C.plum]].map(([n,c])=>`
          <div style="flex:${n};background:${c};opacity:.9"></div>`).join('')}
      </div>
      <p style="margin:6px 0 0;font-size:18px;font-weight:700;color:${C.ink3};text-align:center">
        實際的時間比例——<b style="color:${C.clay}">拍</b>佔一半以上</p>
    </div>
    <div class="split" data-r style="gap:18px">
      <div class="callout gold" style="margin:0">${ART.icon('bulb',30,C.gold)}
        <span class="txt">第一個小時<b>不碰相機</b>。<br>
        但只有一個小時——<b class="hl">十點多就開始拍了</b>。</span></div>
      <div class="callout" style="margin:0;background:${C.clayTint};border-color:${C.claySoft}">
        ${ART.icon('cam',30,C.clay)}
        <span class="txt"><b>拍</b>佔了今天一半以上的時間。<br>
        這是一堂拍攝課，剪輯只教必要的。</span></div>
    </div>
  </div>`,
  notes:{
    say:['這一頁是在跟學員談條件：先給我一個小時，其他時間都是你的。',
         '中高齡學員最怕「坐一整個上午聽課」，所以「只有一小時」要講清楚、講兩次。',
         '拍攝 180 分鐘是今天最長的一段——這是一堂拍攝課，不是軟體課。'],
    ask:['問：可以接受先花一個小時不拿相機嗎？'],
    do:[],
    diff:['第一個小時的秩序會好很多，因為學員知道終點在哪。'],
    more:['講為什麼不能反過來（先拍再想）：素材會用不上，等於白拍。'],
    less:['一句話帶過：一小時想，三小時拍，一小時剪。']
  }});

/* =========================================================================
   第一小時：概念、影片範例、腳本設計（6–23）
   ========================================================================= */
S({ part:'第一小時', time:'09:10', kind:'divider', title:'第一小時：想清楚要拍什麼',
  html: divider('60<span style="font-size:.42em;letter-spacing:0"> 分</span>','第一個小時<br>想清楚要拍什麼',
    '主題 → 看範例 → 三段式腳本 → 分鏡表。<br>這一小時結束，你手上會有一張可以照著拍的表。',
    ART.icon('bulb',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['這一小時是整天的地基，但只有一小時，節奏要快。',
         '四件事：選主題、看四支範例、寫三段、畫分鏡表。',
         '走到最後一頁時，每個人手上要有一張寫滿的分鏡表——那就是等一下的拍攝清單。'],
    ask:[], do:[],
    diff:['一小時後全班都有可以照著拍的東西。'],
    more:[], less:['把「你的商品適合哪一種」那頁改成口頭問答。']
  }});

S({ part:'第一小時', time:'09:11', kind:'std', title:'十一種短影音主題',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:4px">
      你的商品，可以拍成這十一種影片</h2></div>
    <div data-r style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px">
      ${TOPICS.map(([k,v],i)=>`
        <div class="card flat" style="padding:14px 16px">
          <p style="margin:0 0 4px;font-size:21px;font-weight:900;color:${
            [C.clay,C.sage,C.gold,C.plum,C.clean][i%5]}">${k}</p>
          <p style="margin:0;font-size:18px;font-weight:650;color:${C.ink2};line-height:1.35">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:13px 22px">${ART.icon('warn',28)}
      <span class="txt">今天<b>只選一種</b>來拍。貪心想全部拍，一種都拍不好。</span></div>
  </div>`,
  notes:{
    say:['十一種念過去就好，不要每一種都解釋。',
         '重點是讓學員看到「原來有這麼多種可以拍」，而不是只會拍商品照。',
         '最後那句「今天只選一種」要講清楚。'],
    ask:['問：這十一種裡，哪一種你從來沒想過可以拍？'],
    do:['在講義上圈出兩三種你想拍的。'],
    diff:['學員會發現自己一直只拍「商品介紹」這一種。'],
    more:['每種舉一個你看過的例子。'],
    less:['只念前六種。']
  }});

S({ part:'第一小時', time:'09:14', kind:'std', title:'這十一種不是選一種，是十一個系列',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">
      想要流量，靠的是<span class="hl">很多支影片</span>，不是一支</h2></div>
    <div class="cards c3" data-r style="gap:18px">
      ${[['一支影片沒流量，很正常',
          '不要因為第一支只有二十個人看就放棄。流量是累積來的，不是一支爆出來的。',C.clay],
         ['觀眾要知道下次看得到什麼',
          '同一種主題持續拍，就變成一個「系列」。有系列，別人才會追蹤你。',C.sage],
         ['系列對你自己好處更大',
          '定了系列，就不用每次重新想題材——照著同一個格式換商品拍就好。',C.gold]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">建議做法：<b>從十一種裡挑 2–3 種當固定系列，輪流發</b>。
      十一種各拍一次，不如三種各拍四次。收尾時我們會排一個月的計畫。</span></div>
  </div>`,
  notes:{
    say:['這一頁是今天關於「流量」的第一次講，收尾第 79、80 頁會完整收。',
         '中高齡學員最容易第一支沒人看就放棄，這一頁是在打預防針。',
         '「三種各拍四次，勝過十一種各拍一次」這句話要講。'],
    ask:['問：你有沒有發過影片，結果沒什麼人看？當時什麼感覺？',
         '問：你追蹤的帳號，是不是每次都發類似的東西？'],
    do:['先想想哪 2–3 種可以變成你的固定系列。'],
    diff:['學員的期待值會調整成「長期累積」，不是「一支爆紅」。'],
    more:['舉一個學員知道的帳號，分析它固定發哪幾種系列。'],
    less:['只講最後那句建議做法。']
  }});

S({ part:'第一小時', time:'09:16', kind:'std', title:'你的商品適合哪一種',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:4px">不知道拍什麼，先看你的商品類型</h2></div>
    <table class="tbl compact" data-r style="font-size:19px">
      <thead><tr><th style="width:150px">你的商品</th><th>最好拍的三種</th><th style="width:290px">為什麼</th></tr></thead>
      <tbody>
        <tr><td class="lead-col">食品、烘焙</td><td><b>製作過程</b>／試吃心得／商品細節</td><td>有火、有攪拌、有出爐，畫面本身就會動</td></tr>
        <tr><td class="lead-col">手作、飾品</td><td><b>製作過程</b>／商品細節／使用方式</td><td>手的動作最好看，細節撐得起特寫</td></tr>
        <tr><td class="lead-col">農產品</td><td><b>前後對比</b>／製作過程／顧客情境</td><td>從田裡到餐桌，落差最大</td></tr>
        <tr><td class="lead-col">保養、生活用品</td><td><b>使用方式</b>／前後對比／常見問題</td><td>怎麼用最多人問，也最好示範</td></tr>
        <tr><td class="lead-col">服務類</td><td><b>幕後花絮</b>／顧客情境／推薦理由</td><td>沒有實體商品，就拍你在做什麼</td></tr>
      </tbody>
    </table>
    <div class="callout" data-r style="padding:13px 22px">${ART.icon('bulb',28)}
      <span class="txt">粗體那一種是<b>最容易上手的起點</b>。今天就拍它。</span></div>
  </div>`,
  notes:{
    say:['讓學員先對號入座，不知道拍什麼的人有個起點。',
         '粗體那一種是建議今天拍的，因為最容易有畫面。',
         '沒有實體商品的學員（服務類）要特別照顧到，她們最容易覺得自己沒東西拍。'],
    ask:['問：你的商品屬於哪一類？粗體那一種你拍得出來嗎？'],
    do:['選定今天要拍的主題。'],
    diff:['卡住的學員有了明確方向。'],
    more:['請不同類型的學員各說一個自己的點子。'],
    less:['只講前三列。']
  }});

S({ part:'第一小時', time:'09:18', kind:'std', title:'【看範例】四支短影片',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <p class="eyebrow" data-r>一起看　·　六分鐘</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
        看四支，每一支只問<span class="hl">三個問題</span></h2>
    </div>
    <div data-r style="display:flex;gap:13px">
      ${[['範例 ①','商品介紹',C.clay],
         ['範例 ②','製作過程',C.gold],
         ['範例 ③','試吃心得',C.sage],
         ['範例 ④','商品細節',C.plum]]
        .map(([n,k,c])=>`
        <div style="flex:1;display:flex;flex-direction:column;gap:7px">
          <div style="display:flex;align-items:baseline;gap:8px">
            <span style="font-size:18px;font-weight:900;color:${c}">${n}</span>
            <span style="font-size:21px;font-weight:900;color:${C.ink}">${k}</span>
          </div>
          ${ART.slot({ w:236, h:210, t:'播放範例影片', s:'講師手機或 YouTube', tag:'▶' })}
        </div>`).join('')}
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
      ${[['① 第一秒看到什麼？','為什麼你沒有滑掉',C.clay],
         ['② 總共幾個鏡頭？','數數看，通常只有五、六個',C.gold],
         ['③ 看完你記得什麼？','記得住的就是它想講的那一件事',C.sage]]
        .map(([k,v,c])=>`
        <div class="card flat" style="padding:14px 18px;border-left:4px solid ${c}">
          <p style="margin:0 0 4px;font-size:21px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.35">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="padding:12px 22px">${ART.icon('bulb',28,C.gold)}
      <span class="txt">看完你會發現：<b>好看的影片沒有一支是「一鏡到底把商品轉一圈」</b>，
      而且<b class="hl">鏡頭都很短、數量都不多</b>。</span></div>
  </div>`,
  notes:{
    say:['這四支範例請講師課前先選好，存在手機裡或開好 YouTube 分頁。',
         '每支不要超過一分鐘，看完立刻問那三個問題，不要讓學員自由發揮。',
         '重點是讓學員自己數出「原來只有五、六個鏡頭」——後面寫分鏡表就不會怕。',
         '如果現場沒網路，用手機相簿裡預先下載好的影片。'],
    ask:['問：第一秒看到什麼？總共幾個鏡頭？看完記得什麼？（每支都問一輪）'],
    do:['看四支影片，數鏡頭數量。'],
    diff:['學員對「一支影片長什麼樣」有具體的印象，不再只是聽概念。'],
    more:['多播一支「不好看的」當對照：一鏡到底、晃、看不出在賣什麼。'],
    less:['只播兩支：製作過程和商品細節。']
  }});

S({ part:'第一小時', time:'09:24', kind:'std', title:'一支影片，只講一件事',
  html:`
  <div class="split" style="gap:36px">
    <div class="card" data-r style="padding:24px 26px;background:#fdf3f1;border-color:transparent">
      <p class="cap" style="color:#c0392b">✕ 想講太多</p>
      <p class="v" style="font-size:21px;line-height:1.6">
        「我要介紹我的果醬，講一下怎麼做的，還有草莓是哪裡來的，
        然後說一下怎麼吃，再講包裝很漂亮可以送禮，最後說現在有優惠⋯⋯」</p>
      <div class="rule"></div>
      <p class="v" style="font-size:20px"><b>結果</b>：十五秒塞六件事，
      觀眾看完一件都沒記住，也不知道你在賣什麼。</p>
    </div>
    <div class="card sage" data-r style="padding:24px 26px">
      <p class="cap" style="color:${C.sage}">✓ 只講一件</p>
      <p class="v" style="font-size:21px;line-height:1.6">
        「這支只講一件事：<b>我的草莓果醬是怎麼熬出來的</b>。」</p>
      <div class="rule"></div>
      <p class="v" style="font-size:20px"><b>結果</b>：觀眾看完記得「這個人自己熬果醬」。
      其他五件事？<b>拍成另外五支</b>——這就是系列。</p>
    </div>
  </div>`,
  notes:{
    say:['左邊那段話要用學員平常說話的語氣念出來，會很有共鳴。',
         '右邊最後那句「拍成另外五支」把前一頁的系列觀念接起來。'],
    ask:['問：左邊那支影片看完，你記得什麼？'],
    do:[],
    diff:['學員理解「講不完」不是問題，是素材。'],
    more:['把左邊那六件事列出來，變成六支影片的題目。'],
    less:['只念右邊那句。']
  }});

S({ part:'第一小時', time:'09:27', kind:'std', title:'【實作】填兩句話',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　八分鐘</p>
      <h2 class="h" data-r style="font-size:38px">寫下這兩句，今天就照這兩句拍</h2>
    </div>
    <div class="stack gap-s" data-r style="max-width:940px;margin:0 auto;width:100%">
      ${[['我今天要拍的是','＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿',C.clay],
         ['我希望觀眾看完知道','＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿＿',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:24px 28px;border-left:6px solid ${c};text-align:left">
          <p style="margin:0 0 10px;font-size:24px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:26px;font-weight:700;color:${C.ink3};letter-spacing:.06em">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="max-width:940px">${ART.icon('warn',30,C.gold)}
      <span class="txt">兩句都要寫。<b>只有第一句的人，通常拍到一半就不知道要拍什麼了。</b></span></div>
  </div>`,
  notes:{
    say:['給足八分鐘，這是今天最重要的八分鐘。',
         '走動時看每個人的第二句——第二句寫不出來的，主題就是還沒想清楚。',
         '第二句比第一句重要，它決定影片的結尾要放什麼。'],
    ask:['問：有人願意念一下自己的兩句話嗎？'],
    do:['在講義上寫下兩句話。'],
    diff:['寫得出兩句的人，後面分鏡會很順；寫不出來的，現在就要處理。'],
    more:['請三四位念出來，全班一起看清不清楚。'],
    less:['縮到五分鐘，只寫第一句。']
  }});

S({ part:'第一小時', time:'09:35', kind:'std', title:'開始 → 過程 → 完成',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:38px">一支短影片，就這三段</h2></div>
    <div data-r style="display:flex;align-items:stretch;gap:14px">
      ${[['開始','先讓人知道今天要看什麼','前 3 秒決定觀眾留不留',C.clay],
         ['過程','主要內容、動作、特色','這一段最長，也最好看',C.gold],
         ['完成','留下印象、完成畫面或一句重點','沒有結尾，觀眾會覺得斷掉',C.sage]]
        .map(([k,v,w,c],i)=>`
        ${i?`<span style="font-size:32px;color:${C.muted};font-weight:300;align-self:center">→</span>`:''}
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);border-top:6px solid ${c};
             border-radius:18px;padding:24px 20px;box-shadow:0 14px 34px -20px rgba(60,40,28,.45)">
          <p style="margin:0 0 9px;font-size:30px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0 0 10px;font-size:21px;font-weight:700;color:${C.ink};line-height:1.4">${v}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink3};line-height:1.4">${w}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('bulb',32)}
      <span class="txt">口訣就三個字：<b class="hl">開始、過程、完成</b>。
      接下來三頁看三個實際例子。</span></div>
  </div>`,
  notes:{
    say:['三段講完就進範例，不要在抽象概念停留。',
         '「完成」這一段最多人漏掉，要特別強調：沒有結尾，觀眾會覺得影片斷掉。'],
    ask:['問：你看過那種看完覺得「就這樣？」的影片嗎？那就是沒有完成段。'],
    do:[],
    diff:['學員有了一個可以套用的框架。'],
    more:[], less:['直接進範例。']
  }});

S({ part:'第一小時', time:'09:37', kind:'std', title:'範例一：商品介紹的三段',
  html: threeAct('商品介紹：完整 → 特色 → 情境',
    [['開始','桌上的完整商品','全景','3 秒'],
     ['過程','手拿起來、轉一面、指出特色','中景＋近景','8 秒'],
     ['完成','商品放在使用情境裡','中景','4 秒']],
    '總長約 <b>15 秒</b>。開始那 3 秒就要讓人看出這是什麼東西。'),
  notes:{
    say:['三個例子都用同一個結構講，學員會很快抓到規律。',
         '注意每一段標的「畫面」欄，這是下一段景別的伏筆。'],
    ask:['問：如果開始那 3 秒拍的是你在調整手機，會怎樣？'],
    do:[], diff:['學員看到三段各配什麼畫面。'],
    more:['問學員自己的商品，開始那 3 秒要拍什麼。'],
    less:['三個範例只講這一個。']
  }});

S({ part:'第一小時', time:'09:39', kind:'std', title:'範例二：試吃心得的三段',
  html: threeAct('試吃心得：拿起 → 試吃 → 推薦',
    [['開始','手拿起商品，鏡頭帶到臉','中景','3 秒'],
     ['過程','打開、聞、吃，臉上的反應','近景＋特寫','12 秒'],
     ['完成','比一個手勢，或說一句心得','中景','5 秒']],
    '總長約 <b>20 秒</b>。過程那一段的<b>反應</b>是重點，不是商品。'),
  notes:{
    say:['試吃類的重點在「反應」不在商品，這一點要講。',
         '中高齡學員最怕入鏡，可以只拍手不拍臉，效果一樣好。'],
    ask:['問：怕入鏡的舉手？（只拍手也可以，等一下講）'],
    do:[], diff:['怕鏡頭的學員知道有替代方案。'],
    more:['示範只拍手的試吃怎麼拍。'],
    less:['跳過這個範例。']
  }});

S({ part:'第一小時', time:'09:41', kind:'std', title:'範例三：製作過程的三段',
  html: threeAct('製作過程：原料 → 製作 → 成品',
    [['開始','桌上攤開的原料','全景','3 秒'],
     ['過程','切、攪、下鍋、裝瓶（多個短鏡頭）','近景＋特寫','15 秒'],
     ['完成','完成的商品，貼上標籤','近景','4 秒']],
    '總長約 <b>22 秒</b>。過程那一段可以拆成<b>四五個 3 秒的小鏡頭</b>，節奏才會好。'),
  notes:{
    say:['製作過程是最推薦的類型，也是今天多數人會拍的。',
         '「過程拆成四五個小鏡頭」是這一頁的重點，接後面的錄影長度那一段。'],
    ask:['問：你的商品，製作過程有哪幾個步驟？'],
    do:[], diff:['學員理解一段過程可以拆成很多鏡頭。'],
    more:['請學員口頭說出自己的四五個步驟。'],
    less:['只講「原料→製作→成品」六個字。']
  }});

S({ part:'第一小時', time:'09:43', kind:'std', title:'【實作】寫出你的三段',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　八分鐘</p>
      <h2 class="h" data-r style="font-size:38px">照著你的兩句話，寫出三段</h2>
    </div>
    <div class="stack gap-s" data-r style="max-width:960px;margin:0 auto;width:100%">
      ${[['開始','＿＿＿＿＿＿＿＿＿＿＿＿＿＿　約 3 秒',C.clay],
         ['過程','＿＿＿＿＿＿＿＿＿＿＿＿＿＿　約 10–15 秒',C.gold],
         ['完成','＿＿＿＿＿＿＿＿＿＿＿＿＿＿　約 4 秒',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:18px 24px;border-left:6px solid ${c};text-align:left;
             display:flex;gap:20px;align-items:center">
          <span style="font-size:24px;font-weight:900;color:${c};min-width:70px">${k}</span>
          <span style="font-size:22px;font-weight:700;color:${C.ink3};letter-spacing:.04em">${v}</span>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:960px">${ART.icon('bulb',30)}
      <span class="txt">每一段<b>一句話就好</b>，不要寫成作文。
      這三句話等一下要變成分鏡表。</span></div>
  </div>`,
  notes:{
    say:['八分鐘，走動協助。',
         '常見問題：過程那一段寫太籠統（「做果醬」），要引導寫成具體動作（「切草莓、下鍋、攪拌、裝瓶」）。'],
    ask:['問：過程那一段，你寫了幾個動作？'],
    do:['寫出三段。'],
    diff:['三段寫具體的人，等一下分鏡幾乎自動生成。'],
    more:['請兩位念自己的三段，全班一起看夠不夠具體。'],
    less:['只寫開始和完成兩段。']
  }});

S({ part:'第一小時', time:'09:51', kind:'std', title:'同一件事，四種距離',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div><h2 class="h" data-r style="font-size:36px">
      同一罐果醬、同一個位置，只有<span class="hl">距離不同</span></h2></div>
    <div data-r style="display:flex;gap:18px;justify-content:center">
      ${['wide','medium','close','detail'].map(k => ART.shot(k, 246, 300)).join('')}
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:1000px">
      四張都是同一支影片可以用的畫面。<br>
      <b class="hl">一支影片只有一種距離，看三秒就膩了。</b></p>
  </div>`,
  notes:{
    say:['四張並排先讓學員看，不要先講定義。',
         '重點：這四張不是「選一張」，是「四張都要拍」。'],
    ask:['問：這四張，哪一張最像你平常拍的？（多數是全景或中景）',
         '問：如果一支影片從頭到尾都是第一張那種距離，你看得下去嗎？'],
    do:[],
    diff:['學員意識到自己拍影片時距離從來沒變過。'],
    more:['放一支真實短影音，數它換了幾次距離。'],
    less:['直接進下一頁。']
  }});

S({ part:'第一小時', time:'09:53', kind:'std', title:'四種距離分別回答什麼問題',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">觀眾心裡的四個問題</h2></div>
    <table class="tbl" data-r>
      <thead><tr><th style="width:130px">距離</th><th style="width:300px">回答的問題</th>
        <th style="width:190px">通常放在</th><th>一支影片要幾個</th></tr></thead>
      <tbody>
        <tr><td class="lead-col" style="color:${C.clean}">全景</td><td>這是在哪裡？有什麼？</td><td>開頭</td><td>1 個</td></tr>
        <tr><td class="lead-col" style="color:${C.warm}">中景</td><td>正在發生什麼事？</td><td>過程，最多</td><td>2–3 個</td></tr>
        <tr><td class="lead-col" style="color:${C.fresh}">近景</td><td>這個商品長什麼樣？</td><td>結尾</td><td>1–2 個</td></tr>
        <tr><td class="lead-col" style="color:${C.lux}">特寫</td><td>細節到底好不好？</td><td>過程中間穿插</td><td><b>至少 1 個</b></td></tr>
      </tbody>
    </table>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">最後一欄加起來大約<b>五到七個鏡頭</b>——
      這剛好就是等一下分鏡表要填的數量。</span></div>
  </div>`,
  notes:{
    say:['這一頁把四種景別變成可執行的數量，是進入分鏡前的橋樑。',
         '最後那句「五到七個鏡頭」直接接下一段。'],
    ask:['問：你打算拍幾個鏡頭？'],
    do:[], diff:['學員有了具體的鏡頭數目標。'],
    more:[], less:['只講最後那句。']
  }});

S({ part:'第一小時', time:'09:55', kind:'std', title:'分鏡表長這樣',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">四欄就夠，不用畫圖</h2></div>
    <div data-r>
      ${ART.board([
        ['1','完整商品','全景','2 秒'],
        ['2','手拿商品','中景','3 秒'],
        ['3','商品細節','特寫','2 秒'],
        ['4','使用／製作','近景','4 秒'],
        ['5','完成畫面','全景','3 秒']
      ])}
    </div>
    <div class="callout" data-r>${ART.icon('bulb',32)}
      <span class="txt">分鏡不用畫得漂亮，<b>能看懂就好</b>。
      重點是拍之前你就知道要拍幾個、拍什麼、每個多久。</span></div>
  </div>`,
  notes:{
    say:['先說清楚：不用畫圖，寫字就好。很多學員一聽到分鏡就緊張。',
         '四欄逐欄解釋，尤其「畫面」那欄就是剛才學的四種距離。'],
    ask:['問：這五個鏡頭加起來幾秒？（14 秒，剛好一支短影音）'],
    do:[],
    diff:['學員發現分鏡表比想像中簡單。'],
    more:['講可以加第五欄「備註」寫提醒事項。'],
    less:['只講四欄的欄名。']
  }});

S({ part:'第一小時', time:'09:57', kind:'std', title:'完整範例：手工果醬六個鏡頭',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:33px;margin-bottom:4px">
      主題：草莓果醬從下鍋到裝瓶</h2></div>
    <div data-r>
      ${ART.board([
        ['1','桌上攤開的草莓與砂糖','全景','3 秒'],
        ['2','手把草莓倒進鍋裡','中景','3 秒'],
        ['3','鍋裡冒泡、木匙攪拌','特寫','4 秒'],
        ['4','果醬從鍋裡舀進玻璃瓶','中景','4 秒'],
        ['5','瓶口的果醬質地','特寫','3 秒'],
        ['6','貼上標籤的完成品','近景','3 秒']
      ], { compact:true, fs:19 })}
    </div>
    <div class="callout gold" data-r style="padding:13px 22px">${ART.icon('clock',28,C.gold)}
      <span class="txt">總長 <b>20 秒</b>　·　全景 1、中景 2、特寫 2、近景 1　·
      <b>四種距離都有，而且過程佔了四個鏡頭</b>。</span></div>
  </div>`,
  notes:{
    say:['這是今天的標準範本，學員照這個格式填自己的就對了。',
         '指出距離的分布：全景1、中景2、特寫2、近景1，這是很好的比例。',
         '過程佔四個鏡頭，呼應「不要只拍結果」。'],
    ask:['問：如果拿掉第 3 和第 5 個特寫，這支影片會變怎樣？（變得很平）'],
    do:[],
    diff:['學員有了可以直接模仿的範本。'],
    more:['把這六個鏡頭換成學員自己的商品，現場示範一次。'],
    less:['只看表，不解釋比例。']
  }});

S({ part:'第一小時', time:'09:59', kind:'std', title:'秒數怎麼抓',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">不用精準，抓個大概就好</h2></div>
    <div class="cards c3" data-r style="gap:18px">
      ${[['2–3 秒','靜態畫面：完整商品、成品、包裝','看清楚就夠了',C.clean],
         ['3–5 秒','有動作的畫面：攪拌、包裝、倒東西','要讓動作走完',C.warm],
         ['2–3 秒','特寫：細節、紋理、質地','太久會膩',C.lux]]
        .map(([k,v,w,c])=>`
        <div class="card" style="padding:24px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:30px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
          <div class="rule"></div>
          <p class="v" style="font-size:19px;color:${C.ink3}">${w}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">六個鏡頭 × 平均 3 秒＝<b>18 秒</b>，剛好。<br>
      如果你算出來超過 40 秒，<b class="hl">代表鏡頭太多或每個太長</b>，回去刪。</span></div>
  </div>`,
  notes:{
    say:['秒數不用精準，這一頁的目的是讓學員知道「大概多久」。',
         '最後那句提供一個自我檢查：算出來超過 40 秒就是太多。'],
    ask:['問：你的分鏡表加起來幾秒？'],
    do:['把自己分鏡表的秒數加起來。'],
    diff:['學員會主動刪掉多餘的鏡頭。'],
    more:['講實際錄的時候要比計畫多錄一兩秒，好剪。'],
    less:['只講「每個鏡頭 3 秒左右」。']
  }});

S({ part:'第一小時', time:'10:01', kind:'std', title:'【實作】完成 5–8 個分鏡',
  html:`
  <div class="stack gap-s pad-tight center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　九分鐘　·　今天最重要的一張表</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:4px">把你的三段，拆成 5–8 個鏡頭</h2>
    </div>
    <div data-r style="width:100%;max-width:1020px;margin:0 auto">
      ${ART.boardBlank(7)}
    </div>
    <div class="callout gold" data-r style="max-width:1020px;padding:13px 22px">${ART.icon('bulb',28,C.gold)}
      <span class="txt">卡住的話回頭看<b>上一頁的果醬範例</b>，照它的格式換成你的商品。</span></div>
  </div>`,
  notes:{
    say:['九分鐘，這是第一個小時最長的一次實作，走動協助每一個人。',
         '檢查三件事：有沒有五個以上、四種距離有沒有都出現、過程段是不是最多。',
         '寫不出來的，直接把果醬範例的六個鏡頭換成她的商品。'],
    ask:['問：你的分鏡表裡，特寫有幾個？（至少要一個）'],
    do:['完成 5–8 個鏡頭的分鏡表。'],
    diff:['每個人手上都有一張可以立刻照著拍的表。'],
    more:['請兩位投影自己的分鏡表，全班一起看。'],
    less:['降到 5 個鏡頭就好。']
  }});
