/* =========================================================================
   slides-b.js — PART 6 ~ 結尾（Slide 35–63 + 講義）
   ========================================================================= */

/* =========================================================================
   PART 6
   ========================================================================= */
S({ part:'PART 6', time:'13:45–14:25', kind:'divider', title:'PART 6｜Hashtag 與十大關鍵字',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>13:45 – 14:25 ｜ PART 6</span>
    <p class="pno" data-r>06</p>
    <h2 data-r>Hashtag 與<br>十大關鍵字</h2>
    <p class="d-sub" data-r>讓不認識你的人，有機會搜尋到你。</p>
  </div>
  ${dividerArt(`<div style="display:flex;flex-direction:column;gap:14px;align-items:flex-start">
    <span class="tag y" style="font-size:24px;padding:12px 24px">#台中甜點</span>
    <span class="tag" style="font-size:24px;padding:12px 24px;margin-left:40px">#手作餅乾</span>
    <span class="tag p" style="font-size:24px;padding:12px 24px">#台中伴手禮</span>
    <span class="tag g" style="font-size:24px;padding:12px 24px;margin-left:30px">#下午茶</span>
  </div>`)}`,
  notes:{ say:['這一段是今天「被陌生人找到」的關鍵。提醒學員：這段的產出（十大關鍵字）要帶回家長期使用。'], ask:[], do:[] }});

S({ part:'PART 6', time:'13:45', kind:'std', title:'Slide 35｜Hashtag 到底是什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>先搞懂它在做什麼</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:18px">Hashtag 就是<br>幫你的內容「貼標籤」</h2>
      <div class="tags" data-r style="margin-bottom:22px">
        ${['#台中甜點','#手作餅乾','#台中伴手禮'].map(t=>
          `<span class="tag on" style="font-size:20px;padding:11px 20px">${t}</span>`).join('')}
      </div>
      <div class="callout" data-r style="margin-bottom:18px">${ART.tagIcon(38)}
        <span class="txt">它是在告訴平台：<br><b class="hl">「這篇內容跟什麼有關？」</b></span></div>
      <p class="lead" data-r>
        平台知道了，<br>
        才有辦法把你的內容，<br>
        <b>推給正在找這種東西的人</b>。</p>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar ig-bar"><span class="ttl">搜尋</span></div>
        <div class="app-body" style="padding:11px">
          <div style="background:#efefef;border-radius:9px;padding:8px 11px;display:flex;gap:8px;
            align-items:center;margin-bottom:11px">
            <span style="opacity:.4;font-size:11px">🔍</span>
            <span style="font-size:12px;font-weight:750">#台中伴手禮</span></div>
          <p style="margin:0 0 9px;font-size:10px;color:#737373;font-weight:700">28.4 萬則貼文</p>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:2px">
            ${['cake','cookie','jam','gift','stall','ear','cake','jam','cookie']
              .map(k=>`<div style="aspect-ratio:1;overflow:hidden">${TH[k]}</div>`).join('')}
          </div>
        </div>`)}
      <p class="cap-t">別人搜尋標籤時，你的貼文才會出現</p>
    </div>
  </div>`,
  notes:{
    say:['用「標籤／分類」來解釋最好懂：像去圖書館，書上要貼分類標籤，別人才找得到。',
         '示範：現場在 IG 搜尋列打 #台中伴手禮，把結果投影出來。'],
    ask:['問：有沒有人曾經用 Hashtag 找過東西？'],
    do:['請學員現在在 IG 搜尋一個跟自己商品有關的標籤，看看跳出什麼。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 6', time:'13:52', kind:'std', title:'Slide 36｜Hashtag 不是越多越好',
  html:`
  <div class="split" style="gap:48px;align-items:stretch">
    <div class="col">
      <p class="eyebrow" data-r>✕ 不要這樣</p>
      <div class="card" data-r style="background:${C.paper2};border-color:transparent;box-shadow:none;height:calc(100% - 46px)">
        <div class="tags" style="gap:8px">
          ${['#愛','#幸福','#開心','#台灣','#美食','#人生','#good','#follow','#like4like',
             '#日常','#心情','#分享','#開心每一天','#加油','#美好']
            .map(t=>`<span class="tag dim sm">${t}</span>`).join('')}
        </div>
        <div class="rule"></div>
        <div class="no"><i>✕</i><span>跟你賣的東西完全沒關係</span></div>
        <div class="no" style="margin-top:10px"><i>✕</i><span>來的人不是想買東西的人</span></div>
        <div class="no" style="margin-top:10px"><i>✕</i><span>塞太多還可能被平台判定為灌水</span></div>
      </div>
    </div>
    <div class="col">
      <p class="eyebrow sage" data-r>✓ 要這樣</p>
      <div class="card sage" data-r style="height:calc(100% - 46px)">
        <div class="tags" style="gap:9px">
          ${['#台中果醬','#手工果醬','#草莓果醬','#西屯市集','#台中伴手禮','#無添加果醬','#送禮推薦']
            .map(t=>`<span class="tag">${t}</span>`).join('')}
        </div>
        <div class="rule"></div>
        <div class="yes"><i>✓</i><span>每一個都跟這篇內容有關</span></div>
        <div class="yes" style="margin-top:10px"><i>✓</i><span>是別人真的會拿去搜尋的字</span></div>
        <div class="yes" style="margin-top:10px"><i>✓</i><span>5–10 個就夠，不用湊滿</span></div>
      </div>
    </div>
  </div>
  <div class="callout gold" data-r style="margin-top:26px">${ART.bulb(34,C.gold)}
    <span class="txt">判斷標準只有一個：<b>這個標籤，跟這一篇內容有關嗎？</b></span></div>`,
  notes:{
    say:['左邊那些「#愛 #幸福」是很多人真的在用的，不要嘲笑，只要說明「來的人不會買」。',
         '給一個具體數字：5–10 個。初學者最需要的是數字，不是原則。'],
    ask:['問：如果有人用 #美食 搜尋，跳出幾百萬篇，你的貼文排第幾？（答：看不到。所以要用更精準的字）'],
    do:[]
  }});

S({ part:'PART 6', time:'13:58', kind:'std', title:'Slide 37｜想「別人會搜尋什麼」',
  html:`
  <div class="stack gap-l center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">最重要的思考方式</p>
      <p class="mega sm" data-r>不要想「我想寫什麼」，<br>要想「<span class="hl">別人會搜尋什麼</span>」。</p>
    </div>
    <div class="split" data-r style="width:100%;max-width:960px;gap:44px;align-items:center;margin-top:4px">
      <div class="card" style="background:${C.paper2};box-shadow:none;border-color:transparent;padding:30px 26px">
        <p class="cap" style="color:${C.muted}">✕ 只想自己</p>
        <div style="display:flex;justify-content:center;margin:12px 0 14px">
          <span class="tag dim" style="font-size:21px;padding:12px 22px">#我的鳳梨酥</span></div>
        <p class="v">全世界只有你會打這幾個字。</p>
      </div>
      <div class="card top-accent" style="padding:30px 26px">
        <p class="cap" style="color:${C.clay}">✓ 想客人</p>
        <div class="tags" style="justify-content:center;margin:12px 0 14px">
          ${['#鳳梨酥','#台中伴手禮','#手工烘焙'].map(t=>`<span class="tag on">${t}</span>`).join('')}</div>
        <p class="v">這些才是別人真的會打的字。</p>
      </div>
    </div>
    <div class="callout" data-r style="max-width:820px">${ART.search(36)}
      <span class="txt">練習：<b>把自己想像成客人</b>，<br>
      你想買這個東西的時候，會在搜尋列打什麼？</span></div>
  </div>`,
  notes:{
    say:['這是整段最關鍵的觀念轉換：從「我」變成「客人」。',
         '可以現場示範：講師說「我想買伴手禮送人」，然後打開手機打字給大家看。'],
    ask:['問：如果你要買一個伴手禮送給外縣市的朋友，你會打什麼字去搜尋？（收集 3–5 個答案寫在白板）'],
    do:[]
  }, tag:{type:'ask', label:'全班收集'}});

S({ part:'PART 6', time:'14:04', kind:'std', title:'Slide 38｜十大關鍵字實作',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>今天要帶回家的東西之一</p>
      <h2 class="h" data-r style="font-size:40px">每個人建立<br>「我的 10 個關鍵字」</h2>
    </div>
    <div class="cards c3" data-r style="gap:24px">
      ${[['商品','3–4 個','你賣的東西本身叫什麼？<br>包含它的種類、做法、材料。',
          ['#鳳梨酥','#手工鳳梨酥','#手作烘焙'],C.clay,C.clayTint],
         ['地區','2–3 個','你的客人在哪裡？<br>縣市、區域、常出沒的市集。',
          ['#台中甜點','#台中伴手禮','#西屯'],C.sage,C.sageSoft],
         ['使用情境／需求','3–4 個','別人在什麼時候需要它？<br>送誰？什麼場合？',
          ['#下午茶','#送禮','#節慶禮盒'],C.gold,C.goldSoft]]
        .map(([k,n,v,tags,c,bg])=>`
        <div class="card" style="padding:26px 24px">
          <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:10px">
            <p class="k" style="font-size:24px;margin:0;color:${c}">${k}</p>
            <span style="font-size:14px;font-weight:850;color:${C.muted}">${n}</span></div>
          <p class="v" style="min-height:56px">${v}</p>
          <div class="rule"></div>
          <div class="tags">${tags.map(t=>`<span class="tag sm" style="background:${bg};border-color:transparent">${t}</span>`).join('')}</div>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.note(34)}
      <span class="txt">這 10 個字<b class="hl">寫一次，可以用一整年</b>。<br>
      以後每發一篇，從裡面挑 5–8 個適合的就好。</span></div>
  </div>`,
  notes:{
    say:['三個分類是重點：商品／地區／情境。很多人只想得到「商品」，漏掉後面兩類。',
         '「地區」對在地微型創業特別重要——競爭少、找到的人是真的買得到的人。',
         '「情境」是最容易被忽略、但轉換率最高的：#送禮 #彌月禮盒 #伴手禮，都是有明確需求的人在搜。'],
    ask:['問：你的商品在什麼「情境」下最容易被買走？'],
    do:['發下講義 3，開始填寫。這頁停留 3 分鐘，講完下一頁範例再讓他們寫完。']
  }, tag:{type:'do', label:'講義 3'}});

S({ part:'PART 6', time:'14:09', kind:'std', title:'Slide 39｜範例：手作鳳梨酥',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>完整範例</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:24px">如果我做手作鳳梨酥</h2>
      <div class="stack gap-m" data-r>
        ${[['商品',['#鳳梨酥','#手工鳳梨酥','#手作烘焙'],C.clay,C.clayTint],
           ['地區',['#台中甜點','#台中伴手禮'],C.sage,C.sageSoft],
           ['情境',['#下午茶','#送禮','#節慶禮盒'],C.gold,C.goldSoft]]
          .map(([k,tags,c,bg])=>`
          <div style="display:flex;gap:18px;align-items:flex-start">
            <span style="font-size:15px;font-weight:900;letter-spacing:.1em;color:${c};
              width:58px;flex:none;padding-top:10px">${k}</span>
            <div class="tags">${tags.map(t=>
              `<span class="tag" style="background:${bg};border-color:transparent;color:${C.ink2}">${t}</span>`).join('')}</div>
          </div>`).join('')}
      </div>
      <div class="callout gold" data-r style="margin-top:26px">${ART.bulb(34,C.gold)}
        <span class="txt" style="font-size:18px">
          注意：<b>沒有一個標籤是 #好吃 #推薦 #讚</b>。<br>
          每一個都是「有人會拿去搜尋」的字。</span></div>
    </div>
    <div class="col center" data-r>
      ${ART.pineapple(220)}
      <div class="post" style="margin-top:10px;max-width:340px">
        <div style="height:120px;overflow:hidden">${TH.cake}</div>
        <div class="pb" style="font-size:14.5px;padding:14px">
          剛出爐的鳳梨酥，外皮還燙手 🍍<br>
          用土鳳梨自己炒的內餡，酸一點、不黏牙。
          <div class="tags" style="margin-top:11px">
            ${['#鳳梨酥','#台中伴手禮','#下午茶','#送禮'].map(t=>`<span class="tag sm y">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['用完整範例把上一頁的三分類具體化。',
         '請學員注意：一篇貼文不用把 10 個都放上去，挑最相關的 5–8 個。'],
    ask:['問：如果今天發的是「包裝過程」的照片，這 10 個字裡你會挑哪幾個？'],
    do:[]
  }});

S({ part:'PART 6', time:'14:14', kind:'std', title:'Slide 40｜關鍵字去哪裡找',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow" data-r>三個免費的方法</p>
      <h2 class="h" data-r style="font-size:36px">想不出來的時候，去這三個地方找</h2>
    </div>
    <div class="cards c3" data-r style="gap:20px">
      <div class="card" style="padding:22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          ${ART.igIcon(30)}<p class="k" style="margin:0;font-size:20px">Instagram 搜尋</p></div>
        <div style="background:#efefef;border-radius:9px;padding:9px 12px;display:flex;gap:8px;
          align-items:center;margin-bottom:10px">
          <span style="opacity:.4;font-size:12px">🔍</span>
          <span style="font-size:14px;font-weight:800">鳳梨酥</span></div>
        ${['#鳳梨酥　　　12.4萬則','#鳳梨酥禮盒　 2.1萬則','#土鳳梨酥　　 8,942 則']
          .map(t=>`<p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${C.ink2}">${t}</p>`).join('')}
        <div class="rule"></div>
        <p class="v" style="font-size:15px">打進去，看平台自動跳出哪些相關標籤與則數。</p>
      </div>
      <div class="card" style="padding:22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          ${ART.search(30,C.ink3)}<p class="k" style="margin:0;font-size:20px">Google 搜尋</p></div>
        <div style="border:1px solid ${'rgba(36,28,23,.12)'};border-radius:99px;padding:9px 14px;
          display:flex;gap:8px;align-items:center;margin-bottom:10px">
          <span style="opacity:.4;font-size:12px">🔍</span>
          <span style="font-size:14px;font-weight:800">台中 伴手禮</span></div>
        ${['台中 伴手禮 推薦','台中 伴手禮 2026','台中 伴手禮 車站']
          .map(t=>`<p style="margin:0 0 6px;font-size:14px;font-weight:700;color:${C.ink2}">${t}</p>`).join('')}
        <div class="rule"></div>
        <p class="v" style="font-size:15px">看「自動完成」跟頁面最下面的「相關搜尋」。</p>
      </div>
      <div class="card" style="padding:22px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px">
          ${ART.trend(34,C.sage)}<p class="k" style="margin:0;font-size:20px">Google Trends</p></div>
        <div style="background:${C.paper2};border-radius:12px;padding:12px 14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;font-size:12.5px;font-weight:800;margin-bottom:8px">
            <span style="color:${C.clay}">手作餅乾</span><span style="color:${C.sage}">手工餅乾</span></div>
          <svg viewBox="0 0 200 56" width="100%" height="56">
            <path d="M4 44 L36 38 L68 41 L100 30 L132 33 L164 22 L196 18" stroke="${C.sage}"
              stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M4 50 L36 47 L68 49 L100 44 L132 46 L164 42 L196 40" stroke="${C.clay}"
              stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="rule" style="margin-top:4px"></div>
        <p class="v" style="font-size:15px">兩個講法哪個比較多人搜？用哪個字就對了。</p>
      </div>
    </div>
    <div class="callout" data-r style="padding:16px 24px">${ART.tap(32)}
      <span class="txt" style="font-size:18px">
        現在請跟著做一次：<b class="hl">在 IG 搜尋列打進你的商品名稱</b>，看看跳出什麼。</span></div>
  </div>`,
  notes:{
    say:['這三個工具都免費，而且不用註冊。建議現場用講師手機／電腦各示範一次。',
         'Google Trends 示範「手工餅乾 vs 手作餅乾」，比較結果會讓學員很有感——一個字差很多。',
         '如果現場網路不穩，先準備好截圖備用。'],
    ask:['問：你的商品有沒有兩種以上的叫法？（例如 手工／手作、餅乾／曲奇）'],
    do:['三個工具至少實際操作一個，把找到的新關鍵字補進講義 3。']
  }, tag:{type:'do', label:'現場示範'}});

S({ part:'PART 6', time:'14:20', kind:'std', title:'Slide 41｜學員操作：寫下你的十大關鍵字',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>動手做 · 8 分鐘</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:12px">請找出<br>跟自己最有關的 10 個關鍵字</h2>
      <p class="lead" data-r style="margin-bottom:16px">
        寫在<b>講義 3</b>，或直接打在<b>手機的備忘錄</b>裡。<br>
        建議兩邊都留一份。</p>
      <div class="checks" data-r style="grid-template-columns:1fr">
        <div class="check"><span class="box"></span>商品類 3–4 個</div>
        <div class="check"><span class="box"></span>地區類 2–3 個</div>
        <div class="check"><span class="box"></span>情境／需求類 3–4 個</div>
        <div class="check"><span class="box"></span>存進手機備忘錄，取名「我的關鍵字」</div>
      </div>
      <div class="callout sage" data-r style="margin-top:16px;padding:14px 20px">${ART.note(30,C.sage)}
        <span class="txt" style="font-size:20px;line-height:1.45">
          以後每發一篇，<b class="hl-s">從這 10 個挑 5–8 個</b>來用就好。</span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar"><span class="ttl">備忘錄</span>
          <span style="font-size:12px;color:${C.gold};font-weight:800">完成</span></div>
        <div class="app-body" style="padding:12px 13px">
          <p style="margin:0 0 10px;font-size:15px;font-weight:900">我的關鍵字</p>
          ${[['商品',['#鳳梨酥','#手工鳳梨酥','#手作烘焙']],
             ['地區',['#台中甜點','#台中伴手禮']],
             ['情境',['#下午茶','#送禮','#節慶禮盒']]]
            .map(([k,arr])=>`
            <p style="margin:0 0 4px;font-size:10.5px;font-weight:900;color:${C.muted};letter-spacing:.1em">${k}</p>
            ${arr.map(t=>`<p style="margin:0 0 5px;font-size:12px;font-weight:700;color:#1a1a1a">${t}</p>`).join('')}
            <div style="height:9px"></div>`).join('')}
          <p style="margin:0;font-size:11px;color:${C.muted};font-weight:650">＋ 再想 2 個……</p>
        </div>`, {sm:true})}
      <p class="cap-t">存在手機裡，發文時直接複製</p>
    </div>
  </div>`,
  notes:{
    say:['這 8 分鐘講師要在教室走動，個別協助。最常卡住的是「情境」類。',
         '協助技巧：直接問學員「上一個買你東西的人，是買來做什麼的？」答案通常就是情境關鍵字。',
         '一定要請他們存進手機備忘錄——寫在紙上回家就找不到了。'],
    ask:['請 2–3 位學員念出自己的 10 個字，全班一起看有沒有可以再加的。'],
    do:['完成講義 3，並存一份到手機備忘錄。']
  }, tag:{type:'do', label:'講義 3'}});

/* =========================================================================
   PART 7
   ========================================================================= */
S({ part:'PART 7', time:'14:35–15:05', kind:'divider', title:'PART 7｜Reels 與限時動態',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>14:25 – 14:35 休息 ｜ 14:35 – 15:05 ｜ PART 7</span>
    <p class="pno" data-r>07</p>
    <h2 data-r>Reels 與<br>限時動態</h2>
    <p class="d-sub" data-r>不用跳舞、不用剪輯、不用露臉，也可以拍。</p>
  </div>
  ${dividerArt(`<div style="position:relative">${ART.play(200,'#f0c9a8')}</div>`)}`,
  notes:{ say:['這一段最容易讓中高齡學員退縮。開場第一句就要先破除「我不會跳舞、我不敢露臉」的恐懼。'], ask:[], do:[] }});

S({ part:'PART 7', time:'14:35', kind:'std', title:'Slide 42｜Reels 不一定要跳舞',
  html:`
  <div class="center stack gap-l" style="text-align:center">
    <div>
      <p class="eyebrow plum" data-r style="justify-content:center">先講最大的誤會</p>
      <h2 class="h" data-r style="font-size:36px;color:${C.ink3};font-weight:700">
        很多人以為 Reels 一定要跳舞</h2>
      <p class="mega" data-r style="margin-top:10px">不用。</p>
    </div>
    <div class="cards c3" data-r style="width:100%;max-width:900px;gap:22px;margin-top:6px">
      ${[['不用跳舞',ART.play(56,C.plum)],['不用露臉',ART.camera(56,C.clay)],['不用剪輯技巧',ART.tap(56,C.sage)]]
        .map(([t,ic])=>`
        <div class="card" style="text-align:center;padding:28px 18px">
          <div style="display:flex;justify-content:center;margin-bottom:14px">${ic}</div>
          <p class="k" style="font-size:21px;margin:0">${t}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:840px">${ART.bulb(36)}
      <span class="txt">Reels 只是<b class="hl">「會動的照片」</b>。<br>
      你原本拍照的東西，改成錄 5 秒影片，就是 Reels。</span></div>
  </div>`,
  notes:{
    say:['這頁請放慢，讓學員真的放下心理負擔。可以直接問：「有誰一聽到短影音就想跳過？」',
         '關鍵句：Reels 只是會動的照片。中高齡學員聽到這句通常表情就鬆了。',
         '補充：Reels 是目前最容易被「還沒追蹤你的人」看到的形式，所以值得試。'],
    ask:['問：有誰拍過短影片？有誰完全沒拍過？'],
    do:[]
  }});

S({ part:'PART 7', time:'14:39', kind:'std', title:'Slide 43｜Reels 可以拍什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>六大類，選一個就好</p>
      <h2 class="h" data-r style="font-size:38px">Reels 可以拍這六種</h2>
    </div>
    <div class="cards c3" data-r style="gap:20px">
      ${[['①','商品展示','把成品轉一圈、拿起來、打開包裝',ART.bag(46,C.clay),C.clayTint],
         ['②','製作過程','從材料到完成，最受歡迎的一種',ART.tap(46,C.gold),C.goldSoft],
         ['③','幕後花絮','工作桌、備料、收攤、失敗的那一鍋',ART.camera(46,C.plum),C.plumSoft],
         ['④','前後對比','材料 → 成品；空攤位 → 擺好的攤位',ART.trend(52,C.sage),C.sageSoft],
         ['⑤','使用方式','果醬可以怎麼吃、耳環怎麼搭配',ART.bulb(46,C.clay),C.clayTint],
         ['⑥','工作日常','今天出貨幾箱、市集人潮、包裝的手',ART.clock(46,C.gold),C.goldSoft]]
        .map(([n,k,v,ic,bg])=>`
        <div class="card" style="padding:22px 22px;display:flex;gap:16px;align-items:flex-start">
          <span style="width:62px;height:62px;border-radius:16px;background:${bg};display:grid;
            place-items:center;flex:none">${ic}</span>
          <span>
            <p class="cap" style="margin-bottom:4px">${n}</p>
            <p class="k" style="font-size:20px;margin-bottom:5px">${k}</p>
            <p class="v" style="font-size:15px">${v}</p></span>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['六種裡面，②製作過程 跟 ③幕後花絮 是中高齡學員最容易做、效果也最好的。建議直接推薦這兩種。',
         '④前後對比 很好用而且不用露臉：一開始是麵粉，最後是餅乾，中間不用剪。'],
    ask:['問：這六種裡，哪一種你明天就可以拍？'],
    do:['請每個人選定一種，寫在講義 4 旁邊。']
  }});

S({ part:'PART 7', time:'14:44', kind:'std', title:'Slide 44｜幕後其實很好看',
  html:`
  <div class="stack gap-l">
    <div>
      <p class="eyebrow plum" data-r>舉例：手作餅乾</p>
      <h2 class="h" data-r style="font-size:38px">這五個畫面接起來，<br>就是一支 Reels。</h2>
    </div>
    <div class="row" data-r style="gap:14px;justify-content:center;align-items:center">
      ${[['材料準備','🥣',TH.cookie],['揉麵','👐',TH.hand],['烘烤','🔥',TH.cookie],
         ['出爐','✨',TH.cookie],['包裝','🎁',TH.gift]]
        .map(([t,e,th],i)=>`
        <div style="display:flex;align-items:center;gap:14px">
          <div style="text-align:center">
            <div style="width:132px;height:180px;border-radius:16px;overflow:hidden;
              box-shadow:var(--shadow-m);position:relative;background:${C.paper2}">
              ${th}
              <span style="position:absolute;left:8px;top:8px;background:rgba(0,0,0,.55);color:#fff;
                font-size:11px;font-weight:800;padding:3px 9px;border-radius:99px">${i+1}</span>
              <span style="position:absolute;left:0;right:0;bottom:0;padding:9px;
                background:linear-gradient(transparent,rgba(30,18,12,.72));color:#fff;
                font-size:13px;font-weight:800;text-align:center">${e} ${t}</span>
            </div>
          </div>
          ${i<4?`<span style="color:${C.clay};font-size:20px;font-weight:900;opacity:.5">›</span>`:''}
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.clock(36,C.gold)}
      <span class="txt">每段拍 <b>3–5 秒</b>就好，全部加起來大約 <b>15–25 秒</b>。<br>
      不用配樂、不用字幕，也可以先發出去。</span></div>
  </div>`,
  notes:{
    say:['這頁是把「Reels」變成「五張會動的照片」，是這一段最有力的一頁。',
         '強調順序就是自然的工作順序，學員本來就在做這些事，只是把手機架著錄下來。',
         '實用建議：買一個 100–200 元的手機夾／小腳架，架在旁邊錄，雙手可以繼續工作。'],
    ask:['問：你的工作流程有哪五個步驟？（請兩位學員說說看，講師幫忙拆成五格）'],
    do:['在講義 4 背面，把自己的工作流程畫成五格。']
  }, tag:{type:'do', label:'拆五格'}});

S({ part:'PART 7', time:'14:50', kind:'std', title:'Slide 45｜不用拍得很複雜',
  html:`
  <div class="split" style="gap:48px;align-items:center">
    <div class="col">
      <p class="eyebrow sage" data-r>初學者版本</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:20px">拍 3–5 個片段就好</h2>
      <div class="stack gap-s" data-r>
        ${[['1','材料'],['2','製作'],['3','成品'],['4','包裝']].map(([n,t])=>`
          <div class="card flat" style="padding:15px 20px;border-radius:15px;display:flex;gap:15px;align-items:center">
            <span class="num-badge" style="width:32px;height:32px;font-size:16px;border-radius:10px;
              background:${C.sage}">${n}</span>
            <p class="k" style="margin:0;font-size:20px">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:22px">${ART.tap(34,C.sage)}
        <span class="txt" style="font-size:18px">
          用手機內建的相機錄，<br>直接在 IG 裡面接起來就好。</span></div>
    </div>
    <div class="col">
      <p class="eyebrow" data-r style="color:${C.clay}">現在不用先學這些</p>
      <div class="card" data-r style="background:${C.paper2};border-color:transparent;box-shadow:none;padding:28px">
        <div class="stack gap-m">
          ${['專業剪輯軟體','炫技轉場','高難度特效','配音與字幕','買燈光器材']
            .map(t=>`<div class="no" style="font-size:20px"><i>✕</i><span>${t}</span></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v" style="font-size:16.5px;font-weight:700">
          這些以後有興趣再學。<br>
          <b class="hl">先發出去，比拍得漂亮重要。</b></p>
      </div>
      <div class="center" data-r style="margin-top:22px">${ART.warn(70,C.gold)}
        <p class="tiny" style="margin-top:8px;max-width:280px">
          最常見的失敗原因不是拍得不好，<br>而是「想拍到完美，所以一直沒發」。</p></div>
    </div>
  </div>`,
  notes:{
    say:['這頁的目的是「降低門檻」。請具體說：不用下載任何 App，IG 內建就能接片段。',
         '再次強調：這堂課不教剪輯與攝影技巧，後面有專門的課程。今天只要他們敢按下錄影鍵。'],
    ask:['問：有誰因為「覺得拍得不夠好」所以一直沒發？'],
    do:['現場練習：請學員拿手機，對著桌上任何東西錄 5 秒。就這樣，沒有別的要求。']
  }, tag:{type:'do', label:'錄 5 秒'}});

S({ part:'PART 7', time:'14:55', kind:'std', title:'Slide 46｜限時動態可以發什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r style="color:${C.gold}">24 小時後就消失</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:10px">限時動態比較像 ——</h2>
      <p class="mega sm" data-r style="font-size:40px;margin-bottom:24px">
        「今天正在<br>發生什麼？」</p>
      <div class="cards c2" data-r style="gap:12px">
        ${['今天正在製作','今天在擺攤','商品剩最後 3 個','今天收到新材料','客人的回饋','明天新品預告']
          .map(t=>`<div class="card flat" style="padding:14px 18px;border-radius:14px">
            <p class="v" style="font-weight:750;font-size:16.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <div class="callout gold" data-r style="margin-top:20px">${ART.clock(34,C.gold)}
        <span class="txt" style="font-size:18px">
          因為 24 小時就消失，<br><b>所以不用有壓力，隨手拍就好。</b></span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div style="height:100%;position:relative;background:linear-gradient(160deg,#f3d6bd,#d99a6d)">
          <div style="position:absolute;top:10px;left:11px;right:11px;display:flex;gap:3px">
            ${[1,1,.3,.3,.3].map(o=>`<span style="flex:1;height:2.5px;border-radius:99px;
              background:rgba(255,255,255,${o})"></span>`).join('')}</div>
          <div style="position:absolute;top:24px;left:11px;right:11px;display:flex;gap:8px;align-items:center">
            <span class="ring sm"><span>${avatar(ART.jar)}</span></span>
            <span style="font-size:11.5px;font-weight:800;color:#fff">xiaofang.jam</span>
            <span style="font-size:10px;color:rgba(255,255,255,.75);font-weight:700">2 小時</span></div>
          <div style="position:absolute;inset:0;display:grid;place-items:center">${ART.cookie(150)}</div>
          <div style="position:absolute;left:0;right:0;bottom:80px;text-align:center">
            <span style="background:rgba(255,255,255,.95);color:${C.ink};font-size:14px;font-weight:850;
              padding:9px 18px;border-radius:10px;display:inline-block;transform:rotate(-2deg)">
              今天的餅乾出爐了 🍪</span></div>
          <div style="position:absolute;left:11px;right:11px;bottom:16px;display:flex;gap:8px;align-items:center">
            <span style="flex:1;border:1.5px solid rgba(255,255,255,.7);border-radius:99px;
              padding:8px 14px;font-size:11px;color:rgba(255,255,255,.9);font-weight:700">傳送訊息</span>
            <span style="color:#fff;font-size:15px">♡</span><span style="color:#fff;font-size:15px">↗</span></div>
        </div>`)}
      <p class="cap-t">隨手拍、加一句話，就可以發</p>
    </div>
  </div>`,
  notes:{
    say:['限時動態是「養熟客」的工具，看的人多半是已經追蹤你的人。',
         '很實用的一招：「商品剩最後 3 個」——製造即時感，常常真的會有人來問。',
         '提醒：限動可以加「問答貼紙」「投票貼紙」，是最簡單的互動方式，可現場示範一次。'],
    ask:['問：你今天做了什麼事，其實就可以直接發限動？'],
    do:['請學員現在發一則限動（可設定成只有自己看得到），內容就是現在的教室或桌上的東西。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 7', time:'15:00', kind:'std', title:'Slide 47｜限時動態不用太完美',
  html:`
  <div class="stack gap-m">
    <div class="center" style="text-align:center">
      <p class="eyebrow" data-r style="justify-content:center">兩種都可以</p>
      <h2 class="h" data-r style="font-size:38px">因為它們的用途不一樣</h2>
    </div>
    <div class="split" data-r style="gap:52px;align-items:center">
      <div class="center">
        <div style="width:208px;height:208px;border-radius:18px;overflow:hidden;position:relative;
          box-shadow:var(--shadow-l);background:linear-gradient(150deg,#f7dfc8,#e9ab7f);display:grid;place-items:center">
          ${ART.jar(140)}
        </div>
        <p class="k" style="margin-top:12px;font-size:21px">精緻商品照</p>
        <p class="v" style="font-size:16px">放在<b>貼文</b>：<br>要留下來、要被反覆看到</p>
      </div>
      <div class="center">
        <div style="width:208px;height:208px;border-radius:18px;overflow:hidden;position:relative;
          box-shadow:var(--shadow-l);background:linear-gradient(155deg,#e6ded2,#c9bda9);display:grid;place-items:center">
          <div style="transform:rotate(-6deg);display:grid;place-items:center;gap:6px">
            ${ART.cookie(92)}
            <span style="background:rgba(255,255,255,.92);font-size:13px;font-weight:800;
              padding:6px 14px;border-radius:8px;transform:rotate(3deg)">還在忙 😅</span>
          </div>
          <span style="position:absolute;top:12px;left:12px;font-size:11px;font-weight:800;
            background:rgba(0,0,0,.4);color:#fff;padding:4px 10px;border-radius:99px">限時動態</span>
        </div>
        <p class="k" style="margin-top:12px;font-size:21px">手機隨手拍的工作桌</p>
        <p class="v" style="font-size:16px">放在<b>限時動態</b>：<br>只活 24 小時、要的是真實</p>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.heart(34,C.sage)}
      <span class="txt">很多人反而更喜歡右邊那種，<br>
      因為<b class="hl-s">看得出來是真的人在做事</b>。</span></div>
  </div>`,
  notes:{
    say:['這頁是給完美主義者的解藥。很多學員因為「拍不好」而完全不發。',
         '重點：兩種照片沒有好壞，只是放的位置不同。貼文要精選，限動可以隨便。'],
    ask:['問：你比較喜歡看哪一種？（通常會有不少人選右邊——這就是答案）'],
    do:[]
  }});

S({ part:'PART 7', time:'15:02', kind:'std', title:'Slide 48｜Reels vs 限時動態',
  html:`
  <div class="split w-right">
    <div class="col">
      <p class="eyebrow plum" data-r>一次分清楚</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:20px">兩個都要發嗎？</h2>
      <div class="card top-accent a-plum" data-r style="padding:22px 24px;margin-bottom:16px">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
          ${ART.play(34,C.plum)}<p class="k" style="margin:0;font-size:20px">Reels</p></div>
        <p class="v">給<b>還不認識你的人</b>看。<br>負責「被看見」。</p>
      </div>
      <div class="card top-accent a-gold" data-r style="padding:22px 24px">
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:8px">
          ${ART.clock(34,C.gold)}<p class="k" style="margin:0;font-size:20px">限時動態</p></div>
        <p class="v">給<b>已經認識你的人</b>看。<br>負責「被喜歡、被信任」。</p>
      </div>
      <p class="tiny" data-r style="margin-top:18px">
        對照早上的漏斗：Reels 在最上面，限時動態在中間。</p>
    </div>
    <div class="col" data-r>
      <table class="tbl">
        <thead><tr><th style="width:120px"></th>
          <th style="color:${C.plum}">REELS</th><th style="color:${C.gold}">限時動態</th></tr></thead>
        <tbody>
          ${[['觸及對象','被更多陌生人看到','跟目前的粉絲互動'],
             ['內容重點','過程','即時'],
             ['適合放','商品展示、製作過程','今天的狀況'],
             ['氣質','幕後、有故事','提醒、閒聊'],
             ['壽命','會一直留著','24 小時後消失'],
             ['要求','稍微想一下','隨手拍就好']]
            .map(([k,a,b])=>`<tr><td class="lead-col">${k}</td><td>${a}</td><td>${b}</td></tr>`).join('')}
        </tbody>
      </table>
    </div>
  </div>`,
  notes:{
    say:['用表格收尾這一段。重點是最後一列「要求」：Reels 要想一下，限動隨手拍。',
         '建議給學員一個可執行的頻率：Reels 一週 1 支，限時動態一週 2–3 則。不要多。'],
    ask:['問：如果一週只能做一件事，你會選 Reels 還是限動？（沒有標準答案，看他的客人是新的還是舊的）'],
    do:[]
  }});

/* =========================================================================
   PART 8
   ========================================================================= */
S({ part:'PART 8', time:'15:05–15:35', kind:'divider', title:'PART 8｜LINE 官方帳號',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>15:05 – 15:35 ｜ PART 8</span>
    <p class="pno" data-r>08</p>
    <h2 data-r>LINE 官方帳號<br>與顧客承接</h2>
    <p class="d-sub" data-r>FB、IG 把人帶來，這裡負責把人留下來。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.lnIcon(120)}</div>`)}`,
  notes:{ say:['這一段是「成交」的關鍵，但常被忽略。先問：現場有多少人已經有官方帳號？'], ask:[], do:[] }});

S({ part:'PART 8', time:'15:05', kind:'std', title:'Slide 49｜為什麼不用私人 LINE 就好',
  html:`
  <div class="split" style="gap:48px;align-items:stretch">
    <div class="col">
      <p class="eyebrow" data-r>私人 LINE</p>
      <div class="card" data-r style="background:${C.paper2};border-color:transparent;box-shadow:none;
        height:calc(100% - 46px);padding:28px">
        <p class="k" style="font-size:24px;margin-bottom:16px">家人、朋友、個人聯絡</p>
        <div style="display:flex;justify-content:center;margin:10px 0 18px">${ART.people(150,C.ink3)}</div>
        <div class="stack gap-s">
          ${['客人訊息會被家人群組洗掉','分不清誰是客人、誰是朋友',
             '沒辦法群發新品通知','別人加你＝看到你的私人生活','沒有數據，不知道有幾個客人']
            .map(t=>`<div class="no" style="font-size:17px"><i>✕</i><span>${t}</span></div>`).join('')}
        </div>
      </div>
    </div>
    <div class="col">
      <p class="eyebrow sage" data-r>LINE 官方帳號</p>
      <div class="card top-accent a-ln" data-r style="height:calc(100% - 46px);padding:28px">
        <p class="k" style="font-size:24px;margin-bottom:16px">顧客、會員、接單、活動</p>
        <div style="display:flex;justify-content:center;margin:10px 0 18px">${ART.counter(230)}</div>
        <div class="stack gap-s">
          ${['客人訊息獨立一個地方，不會漏','可以一次群發給所有好友',
             '可以看到有幾個人加入、幾個人看了','不會暴露你的私人生活','免費就能開，一個人也能用']
            .map(t=>`<div class="yes" style="font-size:17px"><i>✓</i><span>${t}</span></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['用「訊息被家人洗掉」這個例子最有共鳴，幾乎每個用私人 LINE 接單的人都遇過。',
         '要說明：官方帳號是免費開的，不需要公司行號，個人也可以申請。這點很多人不知道。'],
    ask:['問：有誰漏接過客人的訊息？發生什麼事？'],
    do:[]
  }});

S({ part:'PART 8', time:'15:11', kind:'std', title:'Slide 50｜LINE 官方帳號可以做什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>基本功能（今天要會的）</p>
      <div class="cards c2" data-r style="gap:12px;margin-bottom:24px">
        ${['一對一聊天','群發訊息','歡迎訊息','活動通知','新品通知','優惠','預約','接單']
          .map(t=>`<div class="card flat" style="padding:14px 16px;border-radius:14px">
            <p class="v" style="font-weight:750;font-size:16.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <p class="eyebrow" data-r style="color:${C.muted}">進階功能（今天只要「知道有」）</p>
      <div class="cards c3" data-r style="gap:12px">
        ${['圖文選單','優惠券','集點卡'].map(t=>`
          <div class="card" style="padding:14px 12px;border-radius:14px;text-align:center;
            background:transparent;border-style:dashed;box-shadow:none">
            <p class="v" style="font-weight:750;font-size:16px;color:${C.muted}">${t}</p></div>`).join('')}
      </div>
      <p class="tiny" data-r style="margin-top:16px">
        ＊這三個今天不教操作。等到你已經有 30–50 個好友，再回來設定就好。</p>
    </div>
    <div class="col center" data-r>
      <div style="width:300px">
        <p class="cap-t" style="margin:0 0 12px">圖文選單長這樣</p>
        ${richMenu()}
        <div class="callout sage" style="margin-top:22px;padding:16px 20px">
          ${ART.bulb(30,C.sage)}
          <span class="txt" style="font-size:16.5px">
            客人一加入就看到<br><b>「我要預訂」</b>，不用問也知道怎麼買。</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['把功能明確切成兩層：今天要會的 8 個、今天只要知道的 3 個。避免資訊過載。',
         '「歡迎訊息」最值得優先設定——客人一加好友就自動收到，等於 24 小時自動回覆。',
         '＊不要現場教圖文選單設定，會吃掉太多時間。'],
    ask:['問：如果客人加了你的 LINE，第一句話你想跟他說什麼？（這就是歡迎訊息）'],
    do:['請學員在講義背面寫下自己的「歡迎訊息」草稿，30 字以內。']
  }, tag:{type:'do', label:'寫歡迎訊息'}});

S({ part:'PART 8', time:'15:18', kind:'std', title:'Slide 51｜人從哪裡進 LINE',
  html:`
  <div class="stack gap-m center">
    <div class="center" style="text-align:center">
      <p class="eyebrow sage" data-r style="justify-content:center">五個入口，一個出口</p>
      <h2 class="h" data-r style="font-size:38px">客人是怎麼加到你的 LINE 的？</h2>
    </div>
    <div class="row" data-r style="gap:16px;justify-content:center;flex-wrap:wrap">
      ${[['Facebook',ART.fbIcon(34)],['Instagram',ART.igIcon(34)],['市集現場',ART.stall(64)],
         ['名片',ART.note(34,C.gold)],['商品包裝',ART.gift(34,C.plum)]]
        .map(([t,ic])=>`
        <div class="card" style="padding:18px 20px;text-align:center;min-width:150px">
          <div style="display:flex;justify-content:center;margin-bottom:8px;height:38px;align-items:center">${ic}</div>
          <p class="k" style="font-size:17px;margin:0">${t}</p>
        </div>`).join('')}
    </div>
    <div data-r style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:2px 0">
      <span style="color:${C.clay};font-size:24px;font-weight:900">↓</span>
      <div class="card" style="padding:20px 30px;display:flex;gap:18px;align-items:center;
        background:${C.ink};border-color:transparent">
        <span style="background:#fff;padding:8px;border-radius:12px;display:grid;place-items:center">
          ${ART.qr(58)}</span>
        <span>
          <p style="margin:0;font-size:22px;font-weight:850;color:${C.paper}">你的 QR Code</p>
          <p style="margin:4px 0 0;font-size:15px;color:rgba(255,255,255,.62);font-weight:650">
            印出來、放大、貼在看得到的地方</p></span>
      </div>
      <span style="color:${C.clay};font-size:24px;font-weight:900">↓</span>
      <div class="card top-accent a-ln" style="padding:18px 34px">
        <p style="margin:0;font-size:22px;font-weight:850;display:flex;gap:12px;align-items:center">
          ${ART.lnIcon(30)} LINE 官方帳號好友 ＋1</p></div>
    </div>
    <div class="callout" data-r style="margin-top:4px">${ART.warn(34)}
      <span class="txt">最常見的錯誤：<b class="hl">QR Code 印太小</b>，或是放在客人看不到的地方。</span></div>
  </div>`,
  notes:{
    say:['這頁把「導流」具體化成五個入口。請學員檢查：這五個地方你放了幾個？',
         '市集攤位的做法：把 QR Code 印成 A4 立牌放在桌上，比口頭說「加我 LINE」有效十倍。',
         '商品包裝上貼一張小貼紙，是回購率最高的做法。'],
    ask:['問：你目前有在哪幾個地方放 QR Code？'],
    do:['請學員現在打開自己的 LINE，找到自己的 QR Code（下一頁清單會再確認一次）。']
  }});

S({ part:'PART 8', time:'15:23', kind:'std', title:'Slide 52｜為什麼一定要導到 LINE',
  html:`
  <div class="split" style="gap:52px;align-items:center">
    <div class="col">
      <p class="eyebrow" data-r>殘酷的事實</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:20px">社群上的人，<br>今天看到你，<br>明天就忘了你。</h2>
      <div class="stack gap-s" data-r>
        ${[['今天','在 IG 看到你的果醬，覺得不錯',1],
           ['明天','已經滑過 300 篇貼文了',.6],
           ['下週','完全想不起來你叫什麼名字',.3]]
          .map(([d,t,o])=>`
          <div class="card flat" style="padding:15px 20px;border-radius:15px;display:flex;gap:16px;
            align-items:center;opacity:${o}">
            <span style="font-size:14px;font-weight:900;color:${C.clay};width:48px;flex:none">${d}</span>
            <p class="v" style="font-weight:700;font-size:16.5px;margin:0">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:24px">${ART.hands(36,C.sage)}
        <span class="txt">LINE 可以讓<b class="hl-s">已經有興趣的人留下來</b>。<br>
        下次你有新品，可以直接告訴他。</span></div>
    </div>
    <div class="col center" data-r>
      ${lnChat([
        {side:'out', t:'🍪 下週開始接聖誕禮盒訂單囉<br><br>今年新增巧克力口味<br>想看照片請回覆「1」'},
        {side:'in', t:'1'},
        {side:'in', t:'去年買過，很好吃！這次要兩盒'}
      ], {title:'小芳手作果醬'})}
      <p class="cap-t">半年前加的好友，今天還找得到他</p>
    </div>
  </div>`,
  notes:{
    say:['講一個對比：IG 粉絲 1,000 人，一則貼文可能只有 80 人看到；LINE 好友 100 人，群發時 100 人都會收到通知。',
         '結論：粉絲數不是資產，能聯絡到的名單才是。',
         '這也回到早上的漏斗——LINE 負責的是「詢問→購買→回購」。'],
    ask:['問：你有沒有想過，去年買過你東西的客人，你現在還聯絡得到嗎？'],
    do:[]
  }});

S({ part:'PART 8', time:'15:27', kind:'std', title:'Slide 53｜LINE 訊息不要太長',
  html:`
  <div class="split" style="gap:44px;align-items:stretch">
    <div class="col">
      <p class="eyebrow" data-r>✕ 錯誤示範</p>
      <div class="card" data-r style="background:${C.paper2};border-color:transparent;box-shadow:none;
        height:calc(100% - 46px);padding:24px">
        <p class="v" style="font-size:14px;line-height:1.7;color:${C.ink3}">
          大家好，我是小芳，很高興認識大家！今年冬天特別冷，不知道大家有沒有好好照顧自己呢？
          最近我們家的果醬有了新的口味，是用大湖的草莓做的，草莓是我一大早開車去收的，
          回來以後要一顆一顆去蒂，這個過程其實很花時間，大概要兩個小時……
          總之如果有興趣的話歡迎跟我說，我們這週三會在西屯市集擺攤，
          攤位大概在中間偏右邊的位置，如果找不到可以打電話給我……</p>
        <div class="rule"></div>
        <div class="no"><i>✕</i><span>整篇 FB 文章直接貼進 LINE</span></div>
        <div class="no" style="margin-top:9px"><i>✕</i><span>看完不知道要做什麼</span></div>
        <div class="no" style="margin-top:9px"><i>✕</i><span>客人手指滑兩下就關掉了</span></div>
      </div>
    </div>
    <div class="col">
      <p class="eyebrow sage" data-r>✓ 正確示範</p>
      <div class="card top-accent a-ln" data-r style="height:calc(100% - 46px);padding:24px">
        <div style="background:#8fb6d8;border-radius:14px;padding:16px 14px;margin-bottom:18px">
          <div class="bub in" style="max-width:100%;font-size:14px;margin:0">
            🍪 本週餅乾開放預訂<br><br>
            原味／巧克力<br>
            8/20 前可預訂<br><br>
            👉 回覆「我要預訂」</div>
        </div>
        <div class="yes"><i>✓</i><span>一則訊息只講一件事</span></div>
        <div class="yes" style="margin-top:9px"><i>✓</i><span>有明確的<b>下一步動作</b></span></div>
        <div class="yes" style="margin-top:9px"><i>✓</i><span>三秒鐘就能看完</span></div>
        <div class="rule"></div>
        <p class="v" style="font-weight:700">
          結構：<b>做什麼 → 有什麼選擇 → 到什麼時候 → 怎麼回我</b></p>
      </div>
    </div>
  </div>`,
  notes:{
    say:['右邊那個「👉 回覆我要預訂」是整頁的重點。沒有下一步，客人就算有興趣也不會動。',
         '把四段結構寫在白板上：做什麼→有什麼選擇→到什麼時候→怎麼回我。學員照著填就能寫。'],
    ask:['問：左邊那則，如果是你收到，你會看完嗎？'],
    do:['請學員用右邊的四段結構，寫一則自己的 LINE 訊息，30–80 字。']
  }, tag:{type:'do', label:'寫一則訊息'}});

S({ part:'PART 8', time:'15:31', kind:'std', title:'Slide 54｜LINE 操作實作',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow sage" data-r>動手做</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:14px">至少要找到這七個地方</h2>
      <div class="checks" data-r style="grid-template-columns:1fr 1fr;gap:10px 14px">
        ${['官方帳號首頁','帳號名稱','大頭貼','基本介紹','我的 QR Code','加好友的方式','群發訊息的位置']
          .map(t=>`<div class="check" style="font-size:16.5px;padding:11px 15px">
            <span class="box" style="width:21px;height:21px"></span>${t}</div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:18px;padding:16px 22px">${ART.tap(32)}
        <span class="txt" style="font-size:17px">
          <b>還沒有官方帳號的人：</b><br>
          用手機下載「LINE 官方帳號」App，<br>用現有的 LINE 帳號就能建立。</span></div>
      <p class="tiny" data-r style="margin-top:14px">
        ＊視課堂進度與網路狀況，決定是否現場實際建立帳號。<br>
        如果時間不夠，先讓大家把步驟記下來，回家再做。</p>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar ln-bar"><span class="ttl">LINE 官方帳號</span></div>
        <div class="app-body" style="padding:12px 13px;background:#f6f7f8">
          <div style="background:#fff;border-radius:12px;padding:14px;text-align:center;margin-bottom:9px">
            <span style="width:52px;height:52px;border-radius:99px;overflow:hidden;display:inline-block">
              ${avatar(ART.jar)}</span>
            <p style="margin:8px 0 2px;font-size:13px;font-weight:900">小芳手作果醬</p>
            <p style="margin:0;font-size:10px;color:#8a8d91;font-weight:700">好友 128 人</p>
          </div>
          ${[['群發訊息','📣'],['加入好友人數','📊'],['貼圖／圖文選單','🎨'],['帳號設定','⚙️'],['分享我的帳號','🔗']]
            .map(([t,i],idx)=>`<div style="display:flex;align-items:center;gap:10px;background:#fff;
              border-radius:10px;padding:12px 13px;margin-bottom:7px;
              ${idx===4?`outline:2.5px solid ${C.ln};outline-offset:1px`:''}">
              <span style="font-size:15px">${i}</span>
              <span style="font-size:12px;font-weight:750">${t}</span>
              <span style="margin-left:auto;color:#c4c7cc;font-size:12px">›</span></div>`).join('')}
        </div>`)}
      <p class="cap-t">「分享我的帳號」裡就有 QR Code</p>
    </div>
  </div>`,
  notes:{
    say:['先示範一次自己的官方帳號後台，再讓學員操作。',
         '如果現場多數人沒有官方帳號，建議至少完成到「建立帳號＋設定大頭貼＋找到 QR Code」三步。',
         '請已經完成的學員互相加好友，馬上就能看到效果，也順便測試 QR Code 有沒有用。'],
    ask:['問：有誰找到 QR Code 了？（請他舉起手機給大家看）'],
    do:['七項逐一操作。完成的人請互相掃描加好友。']
  }, tag:{type:'do', label:'手機實作'}});

/* =========================================================================
   PART 9
   ========================================================================= */
S({ part:'PART 9', time:'15:35–16:00', kind:'divider', title:'PART 9｜免費曝光＋成果實作',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>15:35 – 16:00 ｜ PART 9</span>
    <p class="pno" data-r>09</p>
    <h2 data-r>免費曝光<br>＋成果實作</h2>
    <p class="d-sub" data-r>沒有廣告費也可以。最後 25 分鐘，把今天學的做出來。</p>
  </div>
  ${dividerArt(ART.stall(360))}`,
  notes:{ say:['最後一段。先講 10 分鐘觀念，剩下 15 分鐘全部給學員做東西。時間一定要守住。'], ask:[], do:[] }});

S({ part:'PART 9', time:'15:35', kind:'std', title:'Slide 55｜沒有廣告費，可以怎麼被看見',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>十個不用花錢的方法</p>
      <h2 class="h" data-r style="font-size:38px">免費曝光的十個地方</h2>
    </div>
    <div class="cards c5" data-r style="gap:14px">
      ${[['Facebook 社團',ART.people(38,C.fb)],['個人帳號分享',ART.fbIcon(30)],
         ['顧客主動分享',ART.heart(34,C.clay)],['Instagram Reels',ART.play(34,C.plum)],
         ['限時動態',ART.clock(34,C.gold)],['Hashtag',ART.tagIcon(34,C.clay)],
         ['地區關鍵字',ART.search(34,C.sage)],['跟別人合作',ART.hands(34,C.sage)],
         ['市集 QR Code',ART.qr(34)],['LINE 好友分享',ART.lnIcon(30)]]
        .map(([t,ic])=>`
        <div class="card flat" style="padding:18px 12px;text-align:center;border-radius:16px">
          <div style="display:flex;justify-content:center;margin-bottom:9px;height:36px;align-items:center">${ic}</div>
          <p class="v" style="font-size:15px;font-weight:750;color:${C.ink};line-height:1.35">${t}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.bulb(34,C.gold)}
      <span class="txt">不用十個都做。<b>挑兩個，做三個月</b>，比十個都做一次有效。</span></div>
  </div>`,
  notes:{
    say:['十個裡面，對中高齡在地創業者最有效的通常是：Facebook 社團、顧客分享、市集 QR Code。',
         '「顧客主動分享」是最被低估的——做法很簡單：出貨時附一張小卡，寫「拍照標註我，下次折 20 元」。'],
    ask:['問：你上次被朋友介紹去買東西，是什麼情況？'],
    do:['請學員圈出兩個「我三個月內會認真做」的方法。']
  }});

S({ part:'PART 9', time:'15:40', kind:'std', title:'Slide 56｜但請記住',
  html:`
  <div class="center stack gap-l" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">最重要的提醒</p>
      <p class="mega" data-r style="line-height:1.24">曝光 ≠ 喜歡<br>喜歡 ≠ 購買</p>
    </div>
    <p class="lead" data-r style="font-size:26px">中間還需要 ——</p>
    <div class="cards c4" data-r style="width:100%;max-width:940px;gap:20px">
      ${[['內容',ART.note(52,C.clay),C.clayTint],
         ['品質',ART.star(52,C.gold),C.goldSoft],
         ['信任',ART.hands(52,C.sage),C.sageSoft],
         ['服務',ART.chat(52,C.plum),C.plumSoft]]
        .map(([t,ic,bg])=>`
        <div class="card" style="background:${bg};border-color:transparent;box-shadow:none;padding:30px 16px">
          <div style="display:flex;justify-content:center;margin-bottom:14px">${ic}</div>
          <p style="font-size:27px;font-weight:850;margin:0;color:${C.ink}">${t}</p>
        </div>`).join('')}
    </div>
    <p class="lead" data-r style="max-width:800px">
      社群只是<b>把好東西讓更多人知道</b>。<br>
      它沒有辦法把不好的東西變好。</p>
  </div>`,
  notes:{
    say:['這頁要講得誠實，不要給不切實際的期待。社群不是魔法。',
         '對這群學員特別重要：她們的商品品質通常很好，真正缺的是「被看見」跟「被信任」，而不是行銷技巧。'],
    ask:[],
    do:[]
  }});

S({ part:'PART 9', time:'15:43', kind:'std', title:'Slide 57｜免費宣傳最怕什麼',
  html:`
  <div class="split" style="gap:48px;align-items:center">
    <div class="col">
      <p class="eyebrow" data-r>五個最容易踩的雷</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:24px">這五件事，<br>做了會有反效果</h2>
      <div class="stack gap-s" data-r>
        ${['每天一直賣東西','到處亂貼廣告','每一篇都長得一樣','有人留言不回覆','發了幾天之後就消失']
          .map((t,i)=>`
          <div class="card flat" style="padding:16px 20px;border-radius:15px;display:flex;gap:15px;align-items:center">
            <span style="width:30px;height:30px;border-radius:9px;background:${C.clayTint};color:${C.clay};
              display:grid;place-items:center;font-size:17px;font-weight:900;flex:none">✕</span>
            <p class="k" style="margin:0;font-size:19.5px">${t}</p></div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${ART.warn(160)}
      <div class="card" style="margin-top:14px;max-width:320px">
        <p class="v" style="font-size:17px;font-weight:700">
          其中最可惜的是最後一個 ——<br><br>
          <b class="hl">發了三篇沒有人看，就放棄了。</b><br><br>
          社群是慢慢累積的，<br>前三個月幾乎都沒什麼人看，這很正常。</p>
      </div>
    </div>
  </div>`,
  notes:{
    say:['第五點「發了之後就消失」是最常見的失敗原因，請多花時間講。',
         '給一個具體的期待值：前 3 個月、大約 20–30 篇，才會開始有比較穩定的互動。先講清楚，學員才不會三週就放棄。',
         '「有人留言不回覆」也要強調：留言一定要回，回一句「謝謝」都好。'],
    ask:['問：有誰發過幾篇之後就放棄了？（多數人會舉手，讓大家知道這很普遍）'],
    do:[]
  }});

S({ part:'PART 9', time:'15:46', kind:'std', title:'Slide 58｜可以分享什麼（四大類）',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>解決「我不知道要發什麼」</p>
      <h2 class="h" data-r style="font-size:38px">你可以發的內容，只有四類</h2>
    </div>
    <div class="cards c4" data-r style="gap:20px">
      ${[['商品','我賣什麼','成品照、新品、口味介紹、包裝',ART.bag(50,C.clay),C.clay,C.clayTint],
         ['過程','我是怎麼做的','備料、製作、烘烤、包裝、失敗的那次',ART.tap(50,C.gold),C.gold,C.goldSoft],
         ['人','我是誰／工作日常','為什麼開始做、今天的工作、市集現場',ART.people(58,C.sage),C.sage,C.sageSoft],
         ['有用的內容','技巧、知識、使用方式','怎麼保存、怎麼搭配、怎麼挑選',ART.bulb(50,C.plum),C.plum,C.plumSoft]]
        .map(([k,s,v,ic,c,bg])=>`
        <div class="card" style="padding:26px 22px">
          <div style="width:66px;height:66px;border-radius:18px;background:${bg};display:grid;
            place-items:center;margin-bottom:16px">${ic}</div>
          <p class="k" style="font-size:24px;margin-bottom:3px;color:${c}">${k}</p>
          <p style="font-size:14px;font-weight:800;color:${C.muted};margin:0 0 11px">${s}</p>
          <p class="v" style="font-size:15px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.note(34)}
      <span class="txt">下次不知道要發什麼的時候，<b class="hl">從這四類裡面挑一個</b>就好。</span></div>
  </div>`,
  notes:{
    say:['這是解決「不知道要發什麼」最實用的一頁。請學員拍照存起來。',
         '大部分人只會發第一類（商品），所以帳號看起來像廣告傳單。第二、三類才是讓人喜歡你的關鍵。',
         '第四類「有用的內容」對建立專業感特別有效：果醬怎麼保存、開封後放多久。'],
    ask:['問：你最近三篇貼文，分別是哪一類？（多數人會發現三篇都是第一類）'],
    do:[]
  }});

S({ part:'PART 9', time:'15:49', kind:'std', title:'Slide 59｜不是每篇都要賣東西',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow sage" data-r>一週四篇的範例</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:22px">四篇裡面，<br>只有一篇在賣東西。</h2>
      <div class="stack gap-s" data-r>
        ${[['週一','商品','今天新做好的草莓果醬',C.clay,C.clayTint],
           ['週三','幕後','熬果醬的鍋子與一整個下午',C.gold,C.goldSoft],
           ['週五','小技巧','果醬開封後怎麼保存',C.plum,C.plumSoft],
           ['週日','生活／客人分享','客人傳來的早餐照片',C.sage,C.sageSoft]]
          .map(([d,k,v,c,bg])=>`
          <div class="card" style="padding:16px 20px;display:flex;gap:16px;align-items:center">
            <span style="width:52px;height:52px;border-radius:14px;background:${bg};color:${c};
              display:grid;place-items:center;font-size:15px;font-weight:900;flex:none">${d}</span>
            <span><b style="font-size:18.5px;font-weight:850;color:${c}">${k}</b>
            <span style="display:block;font-size:15px;color:${C.ink3};font-weight:600;margin-top:2px">${v}</span></span>
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${igProfile({bio:'手工果醬 · 小批製作<br>當季水果，一次只煮一鍋',
                   grid:['jam','kim','cookie','gift','stall','cake','yoga','kim','ear'], sm:true})}
      <div class="callout sage" style="margin-top:20px;max-width:320px;padding:16px 20px">
        ${ART.heart(30,C.sage)}
        <span class="txt" style="font-size:16.5px">
          讓帳號比較像<b>「一個人」</b>，<br>不是「一張廣告傳單」。</span></div>
    </div>
  </div>`,
  notes:{
    say:['一週四篇是建議值，做不到就一週兩篇，但要「固定」。固定比多重要。',
         '比例原則：賣東西的貼文不要超過四分之一。',
         '如果學員說沒時間，教他們：週日花一小時，把四篇的照片一次拍完，之後每天發一篇。'],
    ask:['問：你一週可以固定發幾篇？（請他們誠實一點，寧可少也不要做不到）'],
    do:['在講義背面寫下：我的一週發文計畫（星期幾、發哪一類）。']
  }, tag:{type:'do', label:'寫發文計畫'}});

S({ part:'PART 9', time:'15:52', kind:'std', title:'Slide 60｜最後實作',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>今天最後一個任務 · 12 分鐘</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:14px">完成一則真的內容</h2>
      <p class="lead" data-r style="margin-bottom:22px">
        選一個平台，<br>
        <b>發布出去</b>，或至少<b>存成草稿</b>。</p>
      <div style="display:flex;gap:12px;margin-bottom:24px" data-r>
        <span class="pill fb">${ART.fbIcon(20)} Facebook</span>
        <span style="align-self:center;font-size:15px;font-weight:800;color:${C.muted}">或</span>
        <span class="pill ig">${ART.igIcon(20)} Instagram</span>
      </div>
      <p class="eyebrow" data-r style="margin-bottom:12px">至少要包含 ——</p>
      <div class="checks" data-r style="grid-template-columns:1fr">
        ${['一張圖片','簡短的文字','符合這個平台的呈現方式','相關的 Hashtag（IG 適用）']
          .map(t=>`<div class="check"><span class="box"></span>${t}</div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      <div class="card" style="max-width:360px;padding:26px">
        <p class="cap">卡住的時候，照這個順序做</p>
        <div class="stack gap-s" style="margin-top:14px">
          ${[['1','打開手機相簿，挑一張今天或最近拍的照片'],
             ['2','用一句話說：這是什麼？'],
             ['3','再用一句話說：有什麼特別的？'],
             ['4','最後寫：想要的話可以怎麼跟我說'],
             ['5','IG 的話，從講義 3 挑 5 個關鍵字']]
            .map(([n,t])=>`
            <div style="display:flex;gap:13px;align-items:flex-start">
              <span class="num-badge ghost" style="width:28px;height:28px;font-size:14px;border-radius:9px">${n}</span>
              <p class="v" style="font-size:15.5px;margin:0;padding-top:3px">${t}</p></div>`).join('')}
        </div>
      </div>
      <div class="callout gold" style="margin-top:18px;max-width:360px;padding:16px 20px">
        ${ART.heart(30,C.gold)}
        <span class="txt" style="font-size:16.5px">不用寫得好，<b>寫完就好</b>。</span></div>
    </div>
  </div>`,
  notes:{
    say:['這是今天最重要的 12 分鐘。講師與助教要全場走動，一個一個看。',
         '目標不是寫得好，是「真的按下發布」。有按下去的人，回家才會繼續做。',
         '對於真的不敢發的人：讓他存草稿，或設定成只有自己看得到，也算完成。'],
    ask:['最後請 2–3 位願意的學員，把自己剛剛發的內容投影出來給大家看，全班給掌聲。'],
    do:['完成講義 4，並實際發布一則內容或存成草稿。']
  }, tag:{type:'do', label:'講義 4 · 實際發布'}});

S({ part:'PART 9', time:'15:56', kind:'std', title:'Slide 61｜再做一件事',
  html:`
  <div class="stack gap-m center">
    <div class="center" style="text-align:center">
      <p class="eyebrow" data-r style="justify-content:center">帶回家的三張紙</p>
      <h2 class="h" data-r style="font-size:38px">離開教室前，請確認你有這三個</h2>
    </div>
    <div class="cards c3" data-r style="width:100%;gap:24px">
      <div class="card top-accent">
        <p class="cap">① 寫在講義 3</p>
        <p class="k" style="font-size:24px;margin-bottom:14px">我的十大關鍵字</p>
        <div class="tags">${['#鳳梨酥','#台中伴手禮','#下午茶','#送禮','#手作烘焙']
          .map(t=>`<span class="tag sm">${t}</span>`).join('')}
          <span class="tag sm dim">…共 10 個</span></div>
        <div class="rule"></div>
        <p class="v">也要存一份在手機備忘錄。</p>
      </div>
      <div class="card top-accent a-plum">
        <p class="cap" style="color:${C.plum}">② 寫在講義 1</p>
        <p class="k" style="font-size:24px;margin-bottom:14px">我的主要平台</p>
        <div style="display:flex;gap:10px;margin-bottom:6px">
          <span class="pill fb">Facebook</span>
          <span style="align-self:center;font-size:14px;font-weight:800;color:${C.muted}">或</span>
          <span class="pill ig">Instagram</span></div>
        <div class="rule"></div>
        <p class="v">只選一個。做熟了再考慮第二個。</p>
      </div>
      <div class="card top-accent a-ln">
        <p class="cap" style="color:#03934a">③ 寫在講義 1</p>
        <p class="k" style="font-size:24px;margin-bottom:14px">我的顧客聯絡平台</p>
        <div style="display:flex;gap:10px;align-items:center">
          <span class="pill ln">${ART.lnIcon(20)} LINE 官方帳號</span></div>
        <div class="rule"></div>
        <p class="v">還沒開的人，這週內把它開起來。</p>
      </div>
    </div>
    <div class="callout" data-r style="margin-top:4px">${ART.note(34)}
      <span class="txt">回家後第一件事：<b class="hl">把 QR Code 印出來</b>，貼在你的商品包裝或攤位上。</span></div>
  </div>`,
  notes:{
    say:['把今天的產出收斂成三張紙，讓學員很清楚「我帶走了什麼」。',
         '建議請學員互相檢查隔壁同學有沒有三項都完成。',
         '如果有後續課程，這裡預告下一堂（品牌故事撰寫／商品文案設計），並說明會用到今天的成果。'],
    ask:['問：三項都完成的人請舉手。（沒完成的協助他當場補完）'],
    do:['三項逐一確認。']
  }, tag:{type:'do', label:'成果確認'}});

S({ part:'PART 9', time:'15:58', kind:'std', title:'Slide 62｜課程總結',
  html:`
  <div class="stack gap-m">
    <div class="center" style="text-align:center">
      <p class="eyebrow" data-r style="justify-content:center">今天不是要記住所有按鈕</p>
      <h2 class="h" data-r style="font-size:38px">只要記住這五件事</h2>
    </div>
    <div class="cards c5" data-r style="gap:16px">
      ${[['1','知道客人在哪','年紀、地區、平常滑什麼',C.clay],
         ['2','選對平台','一個曝光 ＋ 一個聯絡',C.gold],
         ['3','讓內容值得看','四類內容輪流發',C.sage],
         ['4','學會基本操作','會發、會改、會回留言',C.plum],
         ['5','持續出現','固定比完美重要',C.clay2]]
        .map(([n,k,v,c])=>`
        <div class="card" style="padding:26px 18px;text-align:center">
          <span class="num-badge" style="background:${c};margin-bottom:14px">${n}</span>
          <p class="k" style="font-size:20px;line-height:1.35;margin-bottom:8px">${k}</p>
          <p class="v" style="font-size:14.5px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:26px;margin-top:8px">
      <div class="callout" style="padding:18px 24px">${ART.eye(34)}
        <span class="txt" style="font-size:17.5px">引流讓人<b>看見</b>你</span></div>
      <div class="callout gold" style="padding:18px 24px">${ART.heart(34,C.gold)}
        <span class="txt" style="font-size:17.5px">好內容讓人<b>喜歡</b>你</span></div>
      <div class="callout sage" style="padding:18px 24px">${ART.hands(34,C.sage)}
        <span class="txt" style="font-size:17.5px">持續互動讓人<b>信任</b>你</span></div>
    </div>
  </div>`,
  notes:{
    say:['回到早上白板上寫的那句話，請全班再念一次。首尾呼應。',
         '五件事裡，第 5 點「持續出現」最重要也最難。可以邀請學員互相加 LINE 或組成小群組互相督促。'],
    ask:['問：今天最開始你說最想解決的問題，解決了嗎？（回到 Slide 2 的白板紀錄）'],
    do:[]
  }});

S({ part:'PART 9', time:'16:00', kind:'std', title:'Slide 63｜最後一句話',
  html:`
  <div class="center stack" style="text-align:center;gap:36px">
    <div data-r>${ART.jar(150)}</div>
    <p class="mega sm" data-r style="max-width:1000px;line-height:1.4;font-size:42px">
      不是因為有人追蹤，<br>你的東西才變好。<br><br>
      而是因為你<span class="hl">持續把好的東西分享出來</span>，<br>
      別人才慢慢認識你、喜歡你。</p>
    <div data-r style="display:flex;gap:14px;justify-content:center;margin-top:4px">
      <span class="pill">08/16 社群平台操作入門</span>
      <span class="pill">西屯婦女培力</span>
    </div>
  </div>`,
  notes:{
    say:['慢慢念完這段，停三秒再說「今天辛苦了」。',
         '如果有後續課程，這裡再預告一次時間。',
         '提醒學員填回饋單，並鼓勵大家把今天發的那則內容互相追蹤、互相按讚。'],
    ask:[],
    do:['發回饋單。鼓勵學員互相追蹤帳號。']
  }});

/* =========================================================================
   附錄：講義說明
   ========================================================================= */
S({ part:'附錄', time:'—', kind:'std', title:'附錄｜四張課堂講義',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>課前請印好，每人一份</p>
      <h2 class="h" data-r style="font-size:38px">四張 A4 課堂講義</h2>
    </div>
    <div class="cards c4" data-r style="gap:20px">
      ${[['講義 1','我的平台選擇','Slide 12 / 61 使用',['我的商品／技能','我想讓誰看到','主要曝光平台','顧客聯絡平台'],C.clay],
         ['講義 2','IG 品牌觀察表','Slide 25 / 26 使用',['八項檢查清單','我最喜歡哪一點','我也做得到的一件事'],C.plum],
         ['講義 3','我的十大關鍵字','Slide 38 / 41 使用',['商品 3–4 個','地區 2–3 個','需求／情境 3–4 個'],C.sage],
         ['講義 4','我的第一篇社群內容','Slide 31 / 34 / 60 使用',['要發在哪裡','要放什麼內容','搭配哪張照片','使用哪些關鍵字'],C.gold]]
        .map(([n,t,u,items,c])=>`
        <div class="card" style="padding:24px 22px">
          <p class="cap" style="color:${c}">${n}</p>
          <p class="k" style="font-size:21px;line-height:1.35;margin-bottom:6px">${t}</p>
          <p style="font-size:13px;font-weight:800;color:${C.muted};margin:0 0 14px">${u}</p>
          <div class="rule" style="margin-top:0"></div>
          <ul class="list dense" style="gap:9px">
            ${items.map(i=>`<li style="font-size:15px">${i}</li>`).join('')}
          </ul>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.note(34)}
      <span class="txt">四張講義的完整可列印版本，請開啟同一資料夾中的
      <b class="hl">handouts.html</b>，用瀏覽器直接列印成 A4。</span></div>
  </div>`,
  notes:{
    say:['講義檔案：handouts.html，用 Chrome 開啟後按 Ctrl/Cmd + P，選 A4 直式即可列印。',
         '建議每人多印一份講義 3（十大關鍵字），一份留在教室、一份帶回家。'],
    ask:[],
    do:[]
  }});
