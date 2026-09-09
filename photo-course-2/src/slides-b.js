/* =========================================================================
   slides-b.js — PART 6 鏡頭複習 ～ PART 9 正式拍攝實作
   第 45–64 頁
   ========================================================================= */

/* 必備六個鏡頭（PART 9 與附錄共用） */
const SIX = [
  ['完整商品', '全景', '看得出來這是什麼、有多大', 'wide'],
  ['商品＋手', '中景', '有人在用它、在做它',       'medium'],
  ['商品主角', '近景', '商品填滿畫面',             'close'],
  ['一個細節', '特寫', '質地、切面、扣環、紋路',   'detail'],
  ['過程或幕後', '中景', '正在做的那一刻',         'medium'],
  ['完成畫面', '近景', '包好、擺好、可以帶走了',   'close']
];

/* =========================================================================
   PART 6　鏡頭與直橫式（複習）（45–48）
   ========================================================================= */
S({ part:'PART 6', time:'11:50', kind:'divider', title:'PART 6｜鏡頭與直橫式（複習）',
  html: divider('06','鏡頭與直式<span style="font-size:.5em;font-weight:800;opacity:.7">（複習）</span>',
    '這一段上次課程教過，今天只花十分鐘複習，<br>並補充「錄影的時候」有什麼不一樣。',
    ART.icon('phone',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['這段是複習，不要重講一次。十分鐘，講完就吃飯。',
         '重點只有兩個：錄影中不要變焦、短影音一律直式。'],
    ask:[], do:[],
    diff:['上次沒來的學員也能跟上。'],
    more:['請上次有來的學員說一句 0.5x 是做什麼用的。'],
    less:['把 46、47 合併，只講直式那一頁。']
  }});

S({ part:'PART 6', time:'11:51', kind:'std', title:'複習：0.5x、1x、2x',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
      三個鏡頭，用途完全不同</h2></div>
    <div data-r style="display:flex;gap:20px;align-items:flex-start;justify-content:center">
      ${[['0.5x　廣角','裝得下整個桌面、整個空間。<br><b>但邊邊會變形，商品會被拉長。</b>',0.30,C.clean],
         ['1x　主力','形狀最正確，<b class="hl">九成的畫面用這個</b>。',0.55,C.sage],
         ['2x　望遠','壓縮背景、突顯單一商品。<br><b>畫質會下降，光不夠時會有顆粒。</b>',1.05,C.plum]]
        .map(([k,v,px,c])=>`
        <div style="flex:1;max-width:300px;display:flex;flex-direction:column;gap:9px">
          <p style="margin:0;font-size:24px;font-weight:900;color:${c}">${k}</p>
          ${ART.scene({ w:290, h:200, bg:'wood', light:'side', angle:'a45',
                        px:Math.round(290*px), clutter:px < 0.4 ? 2 : 0 })}
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="padding:13px 22px">${ART.icon('warn',30,C.gold)}
      <span class="txt"><b>錄影的時候多一條規則：不要錄到一半才變焦。</b>
      畫面會晃、會重新對焦、聲音也會錄到手指的摩擦聲。要換就<b class="hl">停下來，重錄一顆</b>。</span></div>
  </div>`,
  notes:{
    say:['三個鏡頭快速帶過，上次課程講過了。',
         '真正的重點是最後那句：錄影中變焦是新手最常見的毛病，畫面一定會晃。',
         '正確做法是停止錄影、換好鏡頭、重新錄一顆。反正等一下要剪開。'],
    ask:['問：上次課程之後，有人用過 0.5x 嗎？'],
    do:[],
    diff:['學員錄影時不再邊錄邊放大。'],
    more:['示範一次「邊錄邊變焦」有多晃，再示範分兩顆錄。'],
    less:['只講最後那句提醒。']
  }});

S({ part:'PART 6', time:'11:54', kind:'std', title:'很多商品一起拍：用 1x',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">一次拍好幾樣東西，用 1x 退後拍</h2></div>
    <div class="split" data-r style="gap:26px">
      <div style="text-align:center">
        <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#c0392b">0.5x 靠近拍</p>
        ${ART.scene({ w:400, h:250, bg:'wood', light:'side', angle:'a45', px:150, clutter:3 })}
        <p style="margin:9px 0 0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.4">
          裝得下，但<b>邊邊的東西被拉歪</b>，<br>看起來大小關係不對。</p>
      </div>
      <div style="text-align:center">
        <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:${C.sage}">1x 退兩步拍</p>
        ${ART.scene({ w:400, h:250, bg:'wood', light:'side', angle:'a45', px:118, clutter:3 })}
        <p style="margin:9px 0 0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.4">
          一樣裝得下，<b class="hl">形狀是對的</b>，<br>誰大誰小、誰前誰後都看得出來。</p>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.icon('ok',30,C.sage)}
      <span class="txt">口訣：<b>不要用鏡頭裝，要用腳退。</b>
      人退兩步，比按 0.5x 好看很多。</span></div>
  </div>`,
  notes:{
    say:['「不要用鏡頭裝，要用腳退」這句要重複兩次，學員會記得。',
         '0.5x 的變形在拍一整桌商品時最明顯，邊角的東西會被拉歪。'],
    ask:['問：有人拍全家福或一桌菜的時候，覺得旁邊的人變胖了嗎？就是這個原因。'],
    do:['請學員把桌上的東西排成一排，用 0.5x 和 1x 各拍一張比較。'],
    diff:['學員知道拍多樣商品要退後，不是按廣角。'],
    more:['講手機腳架架高一點、往後拉的做法。'],
    less:['只講口訣，跳過實作。']
  }});

S({ part:'PART 6', time:'11:57', kind:'std', title:'短影音一律直式 9:16',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">短影音<span class="hl">只拍直式</span>，這件事不用猶豫</h2></div>
    <div data-r style="display:flex;gap:46px;align-items:flex-start;justify-content:center">
      <div style="text-align:center">
        <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:${C.ink3}">在手機上打開，長這樣</p>
        ${ART.phone(ART.scene({ w:150, h:267, bg:'wood', light:'side', angle:'a45', px:92 }),
                    { w:158, h:275, bg:'#000' })}
        <p style="margin:10px 0 0;font-size:22px;font-weight:900;color:${C.sage}">直式 9:16　✓</p>
        <p style="margin:2px 0 0;font-size:19px;font-weight:650;color:${C.ink2}">佔滿整個手機畫面</p>
      </div>
      <div style="text-align:center">
        <p style="margin:0 0 8px;font-size:20px;font-weight:800;color:${C.ink3}">同一支影片，橫著拍</p>
        ${ART.phone(`<div style="position:absolute;inset:0;background:#000;display:flex;
             align-items:center;justify-content:center">
             ${ART.scene({ w:150, h:84, bg:'wood', light:'side', angle:'a45', px:52 })}</div>`,
                    { w:158, h:275, bg:'#000' })}
        <p style="margin:10px 0 0;font-size:22px;font-weight:900;color:#c0392b">橫式 16:9　✗</p>
        <p style="margin:2px 0 0;font-size:19px;font-weight:650;color:${C.ink2}">上下一大片黑邊，沒人想看完</p>
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('phone',30)}
      <span class="txt">Reels、限時動態、TikTok、YouTube Shorts <b>全部都是直式</b>。
      今天下午拍的每一顆鏡頭，<b class="hl">手機都要直著拿</b>——這是今天唯一不能違反的規則。</span></div>
  </div>`,
  notes:{
    say:['這一頁講死，不要留討論空間：今天全部直式。',
         '中高齡學員習慣把手機打橫（因為以前的相機是橫的），下午一定要一直提醒。',
         '助教走動時看到有人橫著拿，直接走過去把手機轉直。'],
    ask:['問：平常錄影是直著拿還橫著拿？（多數人會說橫的）'],
    do:['現在把手機直著拿起來，錄五秒鐘試試看。'],
    diff:['下午拍攝時橫拍的人變少。'],
    more:['講如果已經拍成橫的，InShot 可以補救但畫面會被裁掉一半。'],
    less:['一句話講完：今天全部直式。']
  }});

/* =========================================================================
   PART 7　錄影長度與運鏡（49–55）
   ========================================================================= */
S({ part:'PART 7', time:'13:00', kind:'divider', title:'PART 7｜錄影長度與運鏡',
  html: divider('07','錄影長度<br>與運鏡',
    '上午想清楚了，下午開始動手。<br>先講兩件會直接影響「好不好剪」的事。',
    ART.icon('film',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['下午第一段，先讓大家醒過來。',
         '這一段的兩個重點——每顆 3–5 秒、前後各留一秒——是等一下拍攝的操作規則。'],
    ask:[], do:[],
    diff:['學員從「想」切換到「拍」的狀態。'],
    more:[], less:[]
  }});

S({ part:'PART 7', time:'13:01', kind:'std', title:'一個鏡頭 3–5 秒就好',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">不要一鏡到底錄兩分鐘</h2></div>
    <div class="stack gap-s" data-r>
      ${[['一鏡到底錄 2 分鐘','剪的時候要看兩分鐘才找得到能用的三秒。<br>而且中途一定會晃、會失焦、會有雜音。','#c0392b','no'],
         ['分成 6–8 顆，每顆 3–5 秒','每顆都是完整可用的素材，<b class="hl">直接排順序就是一支影片</b>。',C.sage,'ok']]
        .map(([k,v,c,ic])=>`
        <div style="display:flex;gap:16px;align-items:flex-start;background:#fff;
             border:1px solid rgba(36,28,23,.12);border-left:6px solid ${c};
             border-radius:14px;padding:18px 22px">
          <span style="flex:0 0 auto;margin-top:2px">${ART.icon(ic,32,c)}</span>
          <span style="flex:1">
            <b style="display:block;font-size:24px;font-weight:900;color:${c};margin-bottom:5px">${k}</b>
            <span style="font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">${v}</span>
          </span>
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:20px;align-items:center">
      <div class="callout gold" style="margin:0">${ART.icon('clock',30,C.gold)}
        <span class="txt"><b>3 秒</b>：看得清楚的最短時間。<br>
        <b>5 秒</b>：再長觀眾就開始滑走了。</span></div>
      <div class="callout sage" style="margin:0">${ART.icon('bulb',30,C.sage)}
        <span class="txt">實際錄的時候錄 <b>6–8 秒</b>，<br>
        剪掉頭尾剛好剩 3–5 秒。</span></div>
    </div>
  </div>`,
  notes:{
    say:['「一鏡到底」是最常見的錯誤，而且是拍了不剪的主因。',
         '錄 6–8 秒剪成 3–5 秒，這個數字要講清楚，等一下實作會用到。'],
    ask:['問：有人錄過一鏡到底、後來完全沒剪的舉手？'],
    do:['現在錄一顆 6 秒的鏡頭，數 1、2、3、4、5、6 再停。'],
    diff:['學員錄的每一段都很短，剪輯時素材整齊。'],
    more:['講「一顆鏡頭只做一件事」——手只做一個動作。'],
    less:['只講 3–5 秒這個數字。']
  }});

S({ part:'PART 7', time:'13:06', kind:'std', title:'錄影前後各留一秒',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>好剪的關鍵</p>
      <h2 class="h" data-r style="font-size:36px">按下錄影 → <span class="hl">停一秒</span> → 開始動作 →
        動作做完 → <span class="hl">再停一秒</span> → 才按停止</h2>
    </div>
    <div data-r style="display:flex;gap:0;align-items:stretch;border-radius:14px;overflow:hidden;
         border:1px solid rgba(36,28,23,.14)">
      ${[['前 1 秒','手還沒進畫面','留白',C.goldSoft,C.gold],
         ['中間 3–5 秒','動作在這裡發生','要用的',C.sageSoft,C.sage],
         ['後 1 秒','手已經離開','留白',C.goldSoft,C.gold]]
        .map(([k,v,tag,bg,c],i)=>`
        <div style="flex:${i===1?2.6:1};background:${bg};padding:20px 18px;text-align:center">
          <p style="margin:0 0 6px;font-size:23px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0 0 8px;font-size:19px;font-weight:650;color:${C.ink2}">${v}</p>
          <span class="tag sm" style="background:${c};color:#fff;border-color:${c}">${tag}</span>
        </div>`).join('')}
    </div>
    <div class="stack gap-s" data-r>
      ${[['為什麼','剪的時候需要一點「可以切的餘地」。前後沒留，就會剪到手還在動、動作被切掉一半。'],
         ['最常見的失敗','按下錄影的同時手就伸進去——剪出來永遠有一格是手的殘影。'],
         ['多錄一點不吃虧','手機容量不是問題，<b>素材少才是問題</b>。']]
        .map(([k,v])=>`
        <div style="display:flex;gap:14px;align-items:baseline">
          <span style="flex:0 0 132px;font-size:21px;font-weight:900;color:${C.clay}">${k}</span>
          <span style="font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">${v}</span>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['這一頁是整個下午最實用的一句話，但學員最容易忘記。',
         '示範給大家看：不留一秒的素材，剪出來手是「跳」進畫面的。',
         '下午拍攝的時候，助教走動要一直提醒「先停一秒再動」。'],
    ask:['問：等一下按下錄影之後，第一件事要做什麼？（答：什麼都不做，數一秒）'],
    do:['練習一次：按錄影 → 數一秒 → 把手伸進去拿商品 → 放回去 → 數一秒 → 停。'],
    diff:['素材剪起來乾淨，不用一直微調起點。'],
    more:['講如果忘了留，InShot 也可以用「分割」補救，但會少半秒。'],
    less:['只講「前後各留一秒」六個字，然後示範一次。']
  }});

/* 運鏡三頁，共用模板 */
const movePage = (no, name, en, kind, why, how, bad, c) => ({
  part:'PART 7', time:'13:1' + no, kind:'std', title:'運鏡' + no + '：' + name,
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

S(Object.assign(movePage(1, '靠近', 'Push In', 'in',
  '要讓觀眾<b>注意某個細節</b>：質地、封口、logo、切面。<br>也適合當影片的第一顆，把注意力抓進來。',
  '手機<b class="hl">整台慢慢往前移</b>，不要用手指放大。<br>兩隻手拿穩，用腳往前走半步最穩。',
  '最常見的錯：用手指縮放代替移動。畫質會掉，而且會晃。<b>要動的是手機，不是手指。</b>',
  C.clay), {
  notes:{
    say:['三種運鏡，這是最好用的一種。',
         '一定要強調：靠近是「人往前」不是「手指放大」。',
         '示範一次慢慢往前，速度大約三秒走完。'],
    ask:['問：這個動作看起來像什麼？（像我們自己走近去看清楚）'],
    do:['對著自己的商品，錄一顆靠近的鏡頭。'],
    diff:['學員不再用手指縮放。'],
    more:['講可以配合對焦：先對遠的，靠近後點一下重新對焦。'],
    less:['只示範不實作。']
  }}));

S(Object.assign(movePage(2, '離開', 'Pull Out', 'out',
  '從一個細節<b>退出來看到全貌</b>，很適合<b class="hl">當結尾</b>。<br>「原來這是一整個做好的商品」的感覺。',
  '從特寫開始，手機<b>慢慢往後退</b>，退到看得見全部。<br>退的時候盡量走直線，不要邊退邊轉。',
  '退太快會像失誤。三秒退完就好，寧可慢也不要快。',
  C.plum), {
  notes:{
    say:['離開和靠近是同一個動作反過來，示範一次就好。',
         '重點是它適合當結尾——上午寫的第三段「完成」用這個運鏡最好看。'],
    ask:['問：你的影片結尾要放什麼畫面？可以用這一招。'],
    do:['錄一顆離開的鏡頭，當作影片結尾。'],
    diff:['學員的影片有一個像樣的收尾。'],
    more:['講可以在退到底時停住一秒，方便加最後一句字幕。'],
    less:['跟上一頁合併講。']
  }}));

S(Object.assign(movePage(3, '平移', 'Pan', 'pan',
  '一次<b>介紹好幾樣東西</b>，或者從左到右看過整個桌面。<br>適合開場，讓人知道「這裡有什麼」。',
  '身體不動，<b class="hl">手臂帶著手機平平地移過去</b>。<br>速度要慢——比你以為的還要更慢。',
  '平移最容易晃。手肘夾在身側、手臂當支點，比手腕轉穩十倍。有腳架就用腳架。',
  C.clean), {
  notes:{
    say:['平移是三種裡面最難拍穩的，一定要示範。',
         '「手肘夾在身側」這個動作要做給大家看，中高齡學員照做效果很明顯。',
         '速度要一直強調慢，新手平移都太快。'],
    ask:['問：有帶腳架的舉手？平移用腳架會穩很多。'],
    do:['錄一顆平移的鏡頭，從左到右數五秒。'],
    diff:['平移的畫面沒有明顯抖動。'],
    more:['講也可以上下平移（從桌面往上帶到商品）。'],
    less:['示範一次，不實作。']
  }}));

S({ part:'PART 7', time:'13:19', kind:'std', title:'【實作】三種運鏡各拍一次',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　八分鐘</p>
      <h2 class="h" data-r style="font-size:38px">用你自己的商品，<span class="hl">三種各錄一顆</span></h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1050px;margin:0 auto">
      ${[['靠近','從全部 → 一個細節','in',C.clay],
         ['離開','從一個細節 → 全部','out',C.plum],
         ['平移','從左邊 → 右邊','pan',C.clean]]
        .map(([k,v,kind,c])=>`
        <div class="card" style="padding:16px;border-top:5px solid ${c}">
          <p class="k" style="font-size:24px;color:${c};margin-bottom:9px">${k}</p>
          ${ART.move(kind, 268, 168)}
          <p class="v" style="font-size:19px;margin-top:9px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="max-width:1050px">${ART.icon('warn',30,C.gold)}
      <span class="txt">每顆錄 <b>6–8 秒</b>，前後<b>各留一秒</b>，手機<b class="hl">直著拿</b>。
      錄完馬上回放看有沒有晃——晃就重錄，現在重錄比回家重拍容易。</span></div>
  </div>`,
  notes:{
    say:['八分鐘，三顆鏡頭。助教分頭走動。',
         '走動時看三件事：手機有沒有直著拿、有沒有前後留一秒、平移會不會太快。',
         '錄完一定要請她們自己回放，這個習慣比什麼都重要。'],
    ask:['問：誰的平移最穩？請她示範一次給大家看。'],
    do:['三種運鏡各錄一顆，錄完自己回放。'],
    diff:['學員手上有三顆可用的運鏡素材，等一下可以直接用。'],
    more:['請兩三位把畫面投影出來，全班一起看哪裡會晃。'],
    less:['減成兩種：靠近和平移。']
  }});

/* =========================================================================
   PART 8　15–30 秒怎麼組（56–58）
   ========================================================================= */
S({ part:'PART 8', time:'13:25', kind:'divider', title:'PART 8｜15–30 秒怎麼組',
  html: divider('08','15–30 秒<br>怎麼組起來',
    '鏡頭都會拍了，接下來是順序。<br>把上午的三段式，換算成秒數。',
    ART.icon('clock',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['很短的一段，十分鐘。講完就開始正式拍攝。'],
    ask:[], do:[], diff:[], more:[], less:[]
  }});

S({ part:'PART 8', time:'13:26', kind:'std', title:'前 3 秒／中間／後面／結尾',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">一支 20 秒的影片，時間這樣分</h2></div>
    <div data-r style="display:flex;align-items:stretch;border-radius:16px;overflow:hidden;
         border:1px solid rgba(36,28,23,.14)">
      ${[['前 3 秒','3 秒','最好看的那一顆<br>或者一句話字幕','決定人家滑不滑走',C.clay,1.5],
         ['中間','8–12 秒','過程、動作、細節<br>2–3 顆鏡頭','影片的內容在這裡',C.gold,5],
         ['後面','3–4 秒','完成的畫面','讓人看到結果',C.sage,2],
         ['結尾','2–3 秒','一句話：怎麼買、<br>下一支拍什麼','告訴人家下一步',C.plum,1.5]]
        .map(([k,sec,what,why,c,fl])=>`
        <div style="flex:${fl};padding:18px 14px;text-align:center;background:#fff;
             border-top:6px solid ${c}">
          <p style="margin:0 0 3px;font-size:22px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0 0 9px;font-size:26px;font-weight:900;color:${C.ink}">${sec}</p>
          <p style="margin:0 0 7px;font-size:18px;font-weight:700;color:${C.ink2};line-height:1.35">${what}</p>
          <p style="margin:0;font-size:17px;font-weight:650;color:${C.ink3};line-height:1.35">${why}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt"><b>前 3 秒決定一切。</b>
      不要把最好的畫面留到最後——<b class="hl">留到最後就沒人看得到了</b>。
      把你最滿意的那一顆，放第一個。</span></div>
  </div>`,
  notes:{
    say:['「前三秒決定一切」是整個短影音最重要的一件事。',
         '中高齡學員很習慣「慢慢鋪陳」，要明講：社群不是這樣看的，三秒沒抓住就滑走了。',
         '最好的畫面放第一個——這句話等一下剪輯時會再講一次。'],
    ask:['問：你滑手機的時候，一支影片你會看幾秒才決定要不要繼續？'],
    do:['圈出你分鏡表上「最好看的那一顆」，等一下把它放第一個。'],
    diff:['學員的影片開頭不再是空景或慢慢走近。'],
    more:['講前三秒也可以放「問題」：一句字幕「這個要怎麼開？」'],
    less:['只講前 3 秒那一格。']
  }});

S({ part:'PART 8', time:'13:30', kind:'std', title:'三種主題的秒數配置',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
      三個範例，照著抄就可以</h2></div>
    <div data-r style="display:flex;gap:16px">
      ${[['商品介紹','20 秒',C.clay,
          [['3 秒','商品特寫，一句字幕'],['5 秒','商品全景，看得出大小'],
           ['7 秒','手拿起來、轉一圈'],['3 秒','使用的樣子'],['2 秒','完成畫面＋怎麼買']]],
         ['製作過程','25 秒',C.gold,
          [['3 秒','原料排開'],['5 秒','第一個動作（切、倒）'],
           ['6 秒','第二個動作（攪、煮）'],['6 秒','關鍵的一刻（特寫）'],
           ['5 秒','完成品＋包起來']]],
         ['試吃心得','18 秒',C.sage,
          [['3 秒','商品在手上'],['4 秒','打開、拿出來'],
           ['5 秒','吃／用的那一刻'],['4 秒','表情或反應'],['2 秒','一句評語']]]]
        .map(([k,total,c,rows])=>`
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
             border-top:6px solid ${c};border-radius:14px;padding:16px 18px">
          <div style="display:flex;align-items:baseline;justify-content:space-between;margin-bottom:10px">
            <span style="font-size:23px;font-weight:900;color:${c}">${k}</span>
            <span style="font-size:20px;font-weight:900;color:${C.ink3}">共 ${total}</span>
          </div>
          ${rows.map(([s,t])=>`
            <div style="display:flex;gap:10px;align-items:baseline;padding:5px 0;
                 border-top:1px dashed rgba(36,28,23,.12)">
              <span style="flex:0 0 54px;font-size:19px;font-weight:900;color:${c}">${s}</span>
              <span style="font-size:19px;font-weight:650;color:${C.ink2};line-height:1.35">${t}</span>
            </div>`).join('')}
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="padding:13px 22px">${ART.icon('ok',28,C.sage)}
      <span class="txt">看得出來嗎？<b>每一種都是 5 顆鏡頭左右</b>。
      這就是為什麼上午的分鏡表要寫 5–8 個。</span></div>
  </div>`,
  notes:{
    say:['三個範例對應上午最多人選的三種主題。',
         '重點是最後那句：五顆鏡頭就夠了，不要貪多。',
         '請學員拿出自己的分鏡表，對照最接近的那一欄。'],
    ask:['問：你的分鏡表有幾顆？超過八顆的舉手？（請她們刪到八顆以內）'],
    do:['照最接近的範例，把自己的分鏡表標上秒數。'],
    diff:['學員的分鏡表有秒數，總長落在 15–30 秒。'],
    more:['講如果素材真的很好，可以做到 45 秒，但新手先做 20 秒。'],
    less:['只講第一個範例。']
  }});

/* =========================================================================
   PART 9　正式拍攝實作（59–64）★ 本課重點
   ========================================================================= */
S({ part:'PART 9', time:'13:35', kind:'divider', title:'PART 9｜正式拍攝實作',
  html: divider('09','正式拍攝',
    '今天最重要、時間最長的一段。<br>照著你的分鏡表，把素材拍完。',
    ART.icon('cam',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['這是今天的主戲，七十五分鐘。',
         '講師和助教全程走動，台上不要再講課。',
         '中間有一次全班的中場檢查，其餘時間都在拍。'],
    ask:[], do:[],
    diff:['每個人手上都有一批可以剪的素材。'],
    more:[], less:['最少也要保留 50 分鐘給這一段，寧可刪剪輯。']
  }});

S({ part:'PART 9', time:'13:36', kind:'std', title:'拍之前，五樣東西準備好',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">開始拍之前，先花三分鐘擺好</h2></div>
    <div data-r style="display:grid;grid-template-columns:repeat(5,1fr);gap:14px">
      ${[['商品','擦乾淨、標籤轉正面','tag',C.clay],
         ['背景','素色布、木桌、白牆<br>把雜物移開','wood',C.gold],
         ['光','靠窗，人不要背對窗<br>關掉頭頂的黃燈','sun',C.sage],
         ['道具','1–3 樣就好<br>盤子、布、葉子','hand',C.clean],
         ['手機','直著拿、擦鏡頭<br>清出儲存空間','phone',C.plum]]
        .map(([k,v,ic,c])=>`
        <div class="card" style="padding:18px 16px;text-align:center;border-top:5px solid ${c}">
          <span style="display:block;margin-bottom:8px">${ART.icon(ic,38,c)}</span>
          <p style="margin:0 0 5px;font-size:23px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:18px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</p>
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:18px">
      <div class="callout gold" style="margin:0">${ART.icon('warn',30,C.gold)}
        <span class="txt"><b>最容易忘記：擦鏡頭。</b>
        手機鏡頭上的指紋，會讓整支影片霧霧的。</span></div>
      <div class="callout sage" style="margin:0">${ART.icon('ok',30,C.sage)}
        <span class="txt">擺好之後<b class="hl">先拍一張照試光</b>，<br>
        太暗就往窗邊移，不要直接開始錄。</span></div>
    </div>
  </div>`,
  notes:{
    say:['三分鐘擺場，不要跳過。擺得好，後面每一顆都好看。',
         '擦鏡頭這件事一定要講，而且要請大家現在就擦。',
         '「先拍一張照試光」是最快的檢查方式。'],
    ask:['問：現在請大家擦一下鏡頭。擦完舉手。'],
    do:['擺好五樣東西，拍一張照試光。'],
    diff:['素材的畫質整齊，不會有人整支都是霧的。'],
    more:['講補光燈的位置：放在側邊 45 度，不要正打。'],
    less:['只講光和擦鏡頭兩項。']
  }});

S({ part:'PART 9', time:'13:40', kind:'std', title:'【總實作 A】先拍完必備六個鏡頭',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <p class="eyebrow" data-r>總實作 A　·　三十五分鐘</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
        不管你的主題是什麼，<span class="hl">這六顆一定要有</span></h2>
    </div>
    <div data-r style="display:flex;gap:11px">
      ${SIX.map(([k,shot,v,kind],i)=>`
        <div style="flex:1;display:flex;flex-direction:column;gap:7px">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="width:24px;height:24px;border-radius:50%;background:${C.clay};color:#fff;
                  font-size:15px;font-weight:900;display:flex;align-items:center;
                  justify-content:center;flex:0 0 auto">${i+1}</span>
            <span style="font-size:20px;font-weight:900;color:${C.ink}">${k}</span>
          </div>
          ${ART.shot(kind, 176, 234, { cap:shot })}
          <p style="margin:0;font-size:17px;font-weight:650;color:${C.ink2};line-height:1.35">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="padding:12px 22px">${ART.icon('clock',28,C.gold)}
      <span class="txt">每顆錄 <b>6–8 秒</b>，前後各留一秒，直式。
      <b class="hl">六顆拍完再回來看這一頁</b>，不要邊拍邊改分鏡表。</span></div>
  </div>`,
  notes:{
    say:['這六顆是保底。就算腳本寫得再爛，有這六顆也剪得出一支影片。',
         '講完就放人開始拍，台上不要再說話。',
         '三十五分鐘，中間第 18 分鐘左右做一次中場檢查。'],
    ask:['問：六顆分別是什麼？請一位學員複述一次。'],
    do:['照著六個鏡頭拍完，每顆 6–8 秒。'],
    diff:['三十五分鐘後，每個人至少有六段影片在相簿裡。'],
    more:['拍完的人可以開始換角度重拍第 3、4 顆（最好用的兩顆）。'],
    less:['刪掉第 5 顆過程，先確保 1–4 顆拍完。']
  }});

S({ part:'PART 9', time:'13:58', kind:'std', title:'拍到一半的中場檢查',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">全班暫停　·　三分鐘</p>
      <h2 class="h" data-r style="font-size:38px">停一下，<span class="hl">回放你剛剛拍的</span></h2>
    </div>
    <div class="cards c4" data-r style="gap:16px;max-width:1120px;margin:0 auto">
      ${[['會晃嗎？','晃就重錄。手肘夾住身體、或者靠著桌邊。','#c0392b'],
         ['對到焦了嗎？','商品糊糊的就重錄。錄之前先點一下商品。',C.gold],
         ['夠亮嗎？','暗就往窗邊移一點，不要用手機自己調亮。',C.sage],
         ['直式嗎？','橫的全部重錄。這一項沒有商量。',C.clay]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:20px 16px;border-top:5px solid ${c}">
          <p class="k" style="font-size:24px;color:${c}">${k}</p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1120px">${ART.icon('bulb',30)}
      <span class="txt">現在重錄，比回家重拍容易一百倍。
      <b class="hl">四項有一項不過就重錄那一顆</b>——不用全部重來。</span></div>
  </div>`,
  notes:{
    say:['這三分鐘一定要停下來做，不然會有人拍了三十五分鐘全部都是晃的。',
         '四項唸一次，讓大家自己回放檢查。',
         '看到有人整批都不行，助教過去一對一處理。'],
    ask:['問：四項全過的舉手？有一項不過的舉手？（不過的先修那一顆）'],
    do:['回放剛剛拍的六顆，四項自己檢查。'],
    diff:['避免整段實作報廢，這是最有價值的三分鐘。'],
    more:['請一位學員把「晃」和「不晃」的兩顆投影出來對比。'],
    less:['只檢查「直式」和「會不會晃」兩項。']
  }});

S({ part:'PART 9', time:'14:03', kind:'std', title:'【總實作 B】補拍：多幾種距離、多拍過程',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>總實作 B　·　三十分鐘</p>
      <h2 class="h" data-r style="font-size:36px">六顆只是保底。<span class="hl">現在把素材變成兩倍</span></h2>
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      ${[['同一個動作，換距離再拍一次','剛剛拍過的動作，退遠一點再拍一次、湊近一點再拍一次。<br>剪的時候就有三種可以挑。','wide',C.clay],
         ['過程再多拍兩個','倒、切、攪、包、擦、放。<br><b>動作</b>比靜止的商品好看太多。','medium',C.gold],
         ['加上三種運鏡','剛剛練的靠近、離開、平移，<br>各挑一個地方用上去。','close',C.sage]]
        .map(([k,v,kind,c])=>`
        <div class="card" style="padding:18px;border-top:5px solid ${c}">
          <p style="margin:0 0 10px;font-size:22px;font-weight:900;color:${c};line-height:1.3">${k}</p>
          <div style="display:flex;justify-content:center;margin-bottom:10px">
            ${ART.shot(kind, 172, 200, { cap:null })}
          </div>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt"><b>這三十分鐘是今天最有價值的三十分鐘。</b>
      素材多一倍，剪的時候才有得挑。<b class="hl">拍得多的人，剪出來一定比較好看</b>——
      這是攝影決定的，不是剪輯決定的。</span></div>
  </div>`,
  notes:{
    say:['這一段的觀念要講清楚：好影片是拍出來的，不是剪出來的。',
         '很多人以為剪輯可以救，實際上剪輯只能從你拍到的東西裡面挑。',
         '三十分鐘全部放給學員拍，講師和助教走動。'],
    ask:['問：現在手機裡有幾段影片？少於十段的請繼續拍。'],
    do:['補拍到至少 12–15 段素材。'],
    diff:['剪輯時每個人都有得挑，不會出現「只能全部用上」的窘境。'],
    more:['拍很快的人：換一個完全不同的背景，同樣的商品再拍一輪。'],
    less:['縮到 20 分鐘，只做第一項（換距離重拍）。']
  }});

S({ part:'PART 9', time:'14:35', kind:'std', title:'拍完自己檢查六項',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
      六項都打勾，才算拍完</h2></div>
    <div class="stack gap-s" data-r>
      ${[['素材有 12 段以上','少於 12 段，剪的時候會不夠用。'],
         ['六個必備鏡頭都有','全景、中景、近景、特寫、過程、完成。'],
         ['每段都是直式','橫的不能用，現在還來得及補。'],
         ['每段 6–8 秒，前後有留白','太短的剪不動，要重錄。'],
         ['回放過，沒有明顯晃動或糊掉','有一兩顆不行沒關係，刪掉就好。'],
         ['最滿意的那一顆已經圈起來','等一下它要放影片的第一個。']]
        .map(([k,v],i)=>`
        <div style="display:flex;gap:14px;align-items:center;background:#fff;
             border:1px solid rgba(36,28,23,.12);border-radius:12px;padding:12px 18px">
          <span style="flex:0 0 auto;width:30px;height:30px;border-radius:8px;
                border:2.5px solid ${C.sage};display:flex;align-items:center;
                justify-content:center;font-size:16px;font-weight:900;color:${C.sage}">${i+1}</span>
          <span style="flex:0 0 330px;font-size:21px;font-weight:900;color:${C.ink}">${k}</span>
          <span style="font-size:19px;font-weight:650;color:${C.ink2}">${v}</span>
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="padding:12px 22px">${ART.icon('ok',28,C.sage)}
      <span class="txt">全部打勾的人可以先休息。<b>還沒好的，休息時間繼續拍</b>——
      素材沒拍夠，等一下剪輯會很痛苦。</span></div>
  </div>`,
  notes:{
    say:['六項唸過去，讓學員自己對。',
         '「素材沒拍夠，剪輯會很痛苦」這句要講，讓落後的人願意利用休息時間。',
         '助教統計一下有幾個人沒達標，如果超過三分之一，剪輯段要放慢。'],
    ask:['問：六項全過的舉手？（記下沒過的人，休息時優先協助）'],
    do:['自我檢查六項，沒過的補拍。'],
    diff:['進入剪輯段時，全班素材量接近，進度才跟得上。'],
    more:['過關的人幫旁邊的人拍，或者當模特兒出借一雙手。'],
    less:['只檢查前三項。']
  }});
