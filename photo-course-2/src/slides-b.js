
/* =========================================================================
   slides-b.js — 拍攝（24–46）　★ 本課最長的一段，合計 180 分鐘
   ========================================================================= */
S({ part:'拍攝', time:'10:20', kind:'divider', title:'現在開始拍',
  html: divider('180<span style="font-size:.42em;letter-spacing:0"> 分</span>','現在開始拍',
    '想的部分結束了。<br>接下來三個小時，手機不要放下來。',
    ART.icon('cam',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['這是今天的主戲，合計一百八十分鐘，佔一整天一半以上。',
         '節奏是：講五分鐘 → 拍二三十分鐘 → 再講五分鐘 → 再拍。台上不要長篇大論。',
         '講師和助教全程走動。看到有人橫著拿手機，直接走過去把手機轉直。',
         '三個實作段：A 必備六鏡（35 分）、B 補拍過程（24 分）、C 換角度換背景（60 分）。'],
    ask:[], do:[],
    diff:['每個人手上都有一批可以剪的素材。'],
    more:[], less:['最少也要保留 120 分鐘給這一段，寧可刪剪輯。']
  }});

S({ part:'拍攝', time:'10:21', kind:'std', title:'素材清單：拍之前先列',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div><h2 class="h" data-r style="font-size:36px">分鏡表管「畫面」<br>素材清單管「東西」</h2></div>
      <p class="lead" data-r style="font-size:21px">
        分鏡表告訴你要拍哪些畫面，<br>
        素材清單告訴你<b>要準備哪些東西、做哪些動作</b>。</p>
      <div class="callout" data-r style="padding:15px 22px">${ART.icon('warn',30)}
        <span class="txt">沒列清單最常見的下場：<b>草莓已經全部下鍋了，
        才想到忘記拍「完整的草莓」。</b></span></div>
    </div>
    <div class="card" data-r style="padding:18px 24px;border-top:5px solid ${C.sage}">
      <p class="cap" style="color:${C.sage};font-size:20px">手工果醬　素材清單</p>
      <div class="checks" style="grid-template-columns:1fr;gap:7px">
        ${['完整的草莓','清洗草莓','切草莓','下鍋','攪拌','裝瓶','貼標籤','完成的商品','手拿商品']
          .map(t=>`<div class="check" style="justify-content:flex-start;padding:10px 16px">
            <span class="box"></span>
            <span style="font-size:19px;font-weight:700;color:${C.ink2}">${t}</span></div>`).join('')}
      </div>
    </div>
  </div>`,
  notes:{
    say:['素材清單和分鏡表的差別要講清楚：一個管畫面，一個管東西和動作。',
         '「草莓全下鍋了才想到沒拍完整的草莓」這個例子很具體，學員會記住。',
         '清單要比分鏡表多，因為要留備用素材。'],
    ask:['問：你的商品，有哪些東西一旦用掉就補不回來？'],
    do:[],
    diff:['學員會在拍之前先把東西擺好。'],
    more:['講「不可逆的動作先拍」：切開、下鍋、拆封這類。'],
    less:['只講最後那個例子。']
  }});

S({ part:'拍攝', time:'10:23', kind:'std', title:'拍之前，五樣東西準備好',
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

S({ part:'拍攝', time:'10:26', kind:'std', title:'短影音一律直式 9:16',
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
      今天拍的每一顆鏡頭，<b class="hl">手機都要直著拿</b>——這是今天唯一不能違反的規則。</span></div>
  </div>`,
  notes:{
    say:['這一頁講死，不要留討論空間：今天全部直式。',
         '中高齡學員習慣把手機打橫（因為以前的相機是橫的），整個拍攝段要一直提醒。',
         '助教走動時看到有人橫著拿，直接走過去把手機轉直。'],
    ask:['問：平常錄影是直著拿還橫著拿？（多數人會說橫的）'],
    do:['現在把手機直著拿起來，錄五秒鐘試試看。'],
    diff:['拍攝時橫拿手機的人變少。'],
    more:['講如果已經拍成橫的，InShot 可以補救但畫面會被裁掉一半。'],
    less:['一句話講完：今天全部直式。']
  }});

S({ part:'拍攝', time:'10:28', kind:'std', title:'一個鏡頭 3–5 秒就好',
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

S({ part:'拍攝', time:'10:31', kind:'std', title:'錄影前後各留一秒',
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
    say:['這一頁是整個拍攝段最實用的一句話，但學員最容易忘記。',
         '示範給大家看：不留一秒的素材，剪出來手是「跳」進畫面的。',
         '拍攝的時候，助教走動要一直提醒「先停一秒再動」。'],
    ask:['問：等一下按下錄影之後，第一件事要做什麼？（答：什麼都不做，數一秒）'],
    do:['練習一次：按錄影 → 數一秒 → 把手伸進去拿商品 → 放回去 → 數一秒 → 停。'],
    diff:['素材剪起來乾淨，不用一直微調起點。'],
    more:['講如果忘了留，InShot 也可以用「分割」補救，但會少半秒。'],
    less:['只講「前後各留一秒」六個字，然後示範一次。']
  }});

S({ part:'拍攝', time:'10:34', kind:'std', title:'【總實作 A】先拍完必備六個鏡頭',
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

S({ part:'拍攝', time:'11:09', kind:'std', title:'拍到一半的中場檢查',
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
         '重點是它適合當結尾——剛剛寫的第三段「完成」用這個運鏡最好看。'],
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

S({ part:'拍攝', time:'11:18', kind:'std', title:'【實作】三種運鏡各拍一次',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　十分鐘</p>
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

S({ part:'拍攝', time:'11:28', kind:'std', title:'不要只拍結果，也要拍過程',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div><h2 class="h" data-r style="font-size:36px">同一罐果醬，兩種拍法</h2></div>
    <div data-r style="display:flex;gap:30px;justify-content:center;align-items:center">
      <div>
        ${ART.vshot({ w:200, k:0.62, sim:{ bg:'white', light:'front', angle:'a45' },
                      cls:'bad', mark:'✕', cap:'只有成品轉一圈' })}
        <p style="margin:10px 0 0;font-size:20px;font-weight:700;color:${C.ink3}">
          好看，但沒有人想看完</p>
      </div>
      <span style="font-size:36px;color:${C.muted};font-weight:300">vs</span>
      <div>
        ${ART.vshot({ w:200, k:0.62, sim:{ bg:'flour', light:'side', angle:'a45', clutter:1 },
                      cls:'good', mark:'✓', cap:'手正在做，東西正在動' })}
        <p style="margin:10px 0 0;font-size:20px;font-weight:700;color:${C.ink2}">
          會讓人想知道<b>接下來會怎樣</b></p>
      </div>
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:1000px">
      短影音跟照片最大的差別：<b class="hl">照片показ結果，影片показ過程。</b></p>
  </div>`,
  notes:{
    say:['這一頁的核心：影片的優勢是「時間」，能拍到過程，照片不行。',
         '如果只拍成品，那不如拍照片就好——這句話可以講。'],
    ask:['問：你看短影音的時候，會看完的通常是哪一種？'],
    do:[],
    diff:['學員理解影片不是「會動的照片」。'],
    more:['講「懸念」：讓人想知道接下來會怎樣，就會看完。'],
    less:['只講最後那句。']
  }});

S({ part:'拍攝', time:'11:30', kind:'std', title:'餅乾的五個鏡頭',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">從原料到包裝，五個鏡頭就是一個故事</h2></div>
    <div data-r style="display:flex;gap:14px;align-items:stretch">
      ${[['原料','麵粉、奶油攤在檯面','全景',C.clean],
         ['整形','手在壓模、排盤','中景',C.warm],
         ['烘烤','烤箱裡上色的過程','特寫',C.gold],
         ['出爐','熱氣、剛出爐的樣子','近景',C.fresh],
         ['包裝','裝袋、綁帶、貼標','中景',C.lux]]
        .map(([k,v,shot,c],i)=>`
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="width:26px;height:26px;border-radius:50%;background:${c};color:#fff;
                  font-size:16px;font-weight:900;display:flex;align-items:center;
                  justify-content:center">${i+1}</span>
            <span style="font-size:22px;font-weight:900;color:${c}">${k}</span>
          </div>
          ${ART.vshot({ w:186, k:[0.34,0.55,1.1,0.72,0.55][i],
                        sim:{ bg:['flour','flour','wood','wood','cloth'][i],
                              light:['front','side','side','side','side'][i], angle:'a45' } })}
          <p style="margin:0;font-size:19px;font-weight:700;color:${C.ink2};line-height:1.35">${v}</p>
          <p style="margin:0;font-size:18px;font-weight:800;color:${C.ink3}">${shot}</p>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['五個鏡頭排出來，就是一個完整的故事，不需要旁白也看得懂。',
         '注意第三個「烘烤」用特寫，因為那是最有懸念的一刻。'],
    ask:['問：這五個鏡頭如果只留三個，你會留哪三個？'],
    do:[], diff:['學員看到「順序本身就是故事」。'],
    more:['講可以加第六個：有人吃下去的反應。'],
    less:['只講三個鏡頭。']
  }});

S({ part:'拍攝', time:'11:32', kind:'std', title:'飾品的五個鏡頭',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">沒有火、沒有熱氣，一樣有故事</h2></div>
    <div data-r style="display:flex;gap:14px;align-items:stretch">
      ${[['材料','珠子、線材、工具攤開','全景',C.clean],
         ['組裝','手在穿線、扣環','中景',C.warm],
         ['細節','扣環、紋路、光澤','特寫',C.lux],
         ['戴上','戴在手上或脖子上','近景',C.fresh],
         ['完成','放回盒子裡的樣子','近景',C.gold]]
        .map(([k,v,shot,c],i)=>`
        <div style="flex:1;display:flex;flex-direction:column;gap:8px">
          <div style="display:flex;align-items:center;gap:7px">
            <span style="width:26px;height:26px;border-radius:50%;background:${c};color:#fff;
                  font-size:16px;font-weight:900;display:flex;align-items:center;
                  justify-content:center">${i+1}</span>
            <span style="font-size:22px;font-weight:900;color:${c}">${k}</span>
          </div>
          ${ART.vshot({ w:186, k:[0.34,0.55,1.15,0.7,0.6][i],
                        sim:{ bg:['cloth','cloth','dark','white','cloth'][i],
                              light:['front','side','back','front','side'][i], angle:'a45' } })}
          <p style="margin:0;font-size:19px;font-weight:700;color:${C.ink2};line-height:1.35">${v}</p>
          <p style="margin:0;font-size:18px;font-weight:800;color:${C.ink3}">${shot}</p>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['這一頁是給沒有「烹飪類」商品的學員看的，證明任何商品都有過程。',
         '第四個「戴上」是飾品類最重要的鏡頭，讓人想像自己戴的樣子。'],
    ask:['問：做飾品、手工藝的舉手？你的組裝過程有哪幾步？'],
    do:[], diff:['非食品類的學員不再覺得自己沒東西拍。'],
    more:['問服務類的學員，她們的「過程」是什麼。'],
    less:['與上一頁合併。']
  }});

S({ part:'拍攝', time:'11:34', kind:'std', title:'故事感來自哪裡',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">八個地方可以找到故事感</h2></div>
    <div data-r style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">
      ${[['人','有人在畫面裡，不用露臉',C.clay],
         ['手','手的動作最好拍也最好看',C.warm],
         ['製作','正在做的過程',C.gold],
         ['動作','倒、切、攪、拉、撒',C.sage],
         ['前後','原料 vs 成品、使用前 vs 後',C.fresh],
         ['空間','工作檯、廚房、店裡',C.clean],
         ['細節','紋理、切面、質地',C.lux],
         ['完成','包好、放好、擺上桌',C.plum]]
        .map(([k,v,c])=>`
        <div class="card flat" style="padding:16px 18px;border-left:4px solid ${c}">
          <p style="margin:0 0 4px;font-size:23px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.35">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">最容易做到的是<b>「手」</b>。
      怕入鏡的人，<b class="hl">整支影片只拍手就好</b>——效果一樣，而且不用化妝。</span></div>
  </div>`,
  notes:{
    say:['八個來源快速念過，重點在最後那句「只拍手就好」。',
         '中高齡女性學員最大的心理障礙就是怕入鏡，這句話會鬆一大口氣。'],
    ask:['問：怕入鏡的舉手？（幾乎全班）'],
    do:[],
    diff:['原本說「我不要入鏡所以不拍」的學員願意試了。'],
    more:['示範只拍手的畫面怎麼取景。'],
    less:['只講「手」這一項。']
  }});

S({ part:'拍攝', time:'11:36', kind:'std', title:'【總實作 B】補拍：多幾種距離、多拍過程',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>總實作 B　·　二十四分鐘</p>
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
      <span class="txt"><b>午休前這一段，是今天最有價值的二十幾分鐘。</b>
      素材多一倍，剪的時候才有得挑。<b class="hl">拍得多的人，剪出來一定比較好看</b>——
      這是攝影決定的，不是剪輯決定的。</span></div>
  </div>`,
  notes:{
    say:['這一段的觀念要講清楚：好影片是拍出來的，不是剪出來的。',
         '很多人以為剪輯可以救，實際上剪輯只能從你拍到的東西裡面挑。',
         '二十四分鐘全部放給學員拍，講師和助教走動，午休前收尾。'],
    ask:['問：現在手機裡有幾段影片？少於十段的請繼續拍。'],
    do:['補拍到至少 10–12 段素材，午休前完成。'],
    diff:['剪輯時每個人都有得挑，不會出現「只能全部用上」的窘境。'],
    more:['拍很快的人：換一個完全不同的背景，同樣的商品再拍一輪。'],
    less:['縮到 20 分鐘，只做第一項（換距離重拍）。']
  }});

S({ part:'拍攝', time:'13:00', kind:'std', title:'午休後：先回放，刪掉不能用的',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">回到教室第一件事　·　五分鐘</p>
      <h2 class="h" data-r style="font-size:38px">打開相簿，<span class="hl">把午休前拍的看一遍</span></h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1060px;margin:0 auto">
      ${[['看得下去的','留著。這些就是等一下要剪的素材。',C.sage,'ok'],
         ['晃的、糊的、橫的','現在就刪掉。<br><b>留著只會在剪輯時浪費時間。</b>','#c0392b','no'],
         ['數一數還剩幾段','少於 10 段的人，這一段要多補拍。',C.gold,'grid']]
        .map(([k,v,c,ic])=>`
        <div class="card" style="padding:22px 18px;border-top:5px solid ${c}">
          <span style="display:block;margin-bottom:8px">${ART.icon(ic,36,c)}</span>
          <p class="k" style="font-size:24px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="max-width:1060px">${ART.icon('warn',30,C.gold)}
      <span class="txt">下午這八十分鐘是<b class="hl">最後一次拍攝的機會</b>。
      三點半以後就進剪輯，不會再回來拍了。</span></div>
  </div>`,
  notes:{
    say:['午休回來學員通常還在放空，用這五分鐘把狀態拉回來。',
         '「現在就刪掉」要講，很多人捨不得刪，結果剪輯時在一堆廢片裡翻找。',
         '助教走動時數一下誰的素材太少，這一段優先照顧。'],
    ask:['問：還剩幾段？少於 10 段的舉手。'],
    do:['回放午休前拍的，刪掉晃的、糊的、橫的。'],
    diff:['最後一段補拍有明確目標，剪輯時素材乾淨。'],
    more:['請一位學員投影她刪掉的那幾段，讓全班看什麼叫「不能用」。'],
    less:['口頭提醒：把不能用的刪掉，直接進下一頁。']
  }});

S({ part:'拍攝', time:'13:05', kind:'std', title:'複習：0.5x、1x、2x',
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

S({ part:'拍攝', time:'13:08', kind:'std', title:'很多商品一起拍：用 1x',
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

S({ part:'拍攝', time:'13:11', kind:'std', title:'同一個動作，四種畫面',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div><h2 class="h" data-r style="font-size:36px">
      「包裝商品」這一個動作，可以拍成四個鏡頭</h2></div>
    <div data-r style="display:flex;gap:16px;justify-content:center">
      ${[['wide','① 整個桌面'],['medium','② 手＋盒子'],
         ['detail','③ 綁帶、貼紙'],['close','④ 完整包裝']]
        .map(([k,cap])=>ART.shot(k, 246, 268, { cap })).join('')}
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:1020px">
      不要只錄一段十秒的包裝過程。<br>
      <b class="hl">同一個動作拆成四個鏡頭，剪起來才有節奏。</b></p>
  </div>`,
  notes:{
    say:['這一頁是本段最實用的一頁，直接給了可複製的做法。',
         '「同一個動作拍四次」是很多人沒想過的——他們以為要拍四件不同的事。'],
    ask:['問：你的過程裡，哪一個動作可以這樣拆成四個鏡頭？'],
    do:[],
    diff:['學員的分鏡表會從三四個鏡頭變成六七個。'],
    more:['講可以請旁邊的人幫忙重複同一個動作四次。'],
    less:['只講「同一個動作多拍幾種距離」一句。']
  }});

S({ part:'拍攝', time:'13:14', kind:'std', title:'【總實作 C】換角度、換背景，再拍一輪',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>總實作 C　·　六十分鐘　·　今天最後一次拍</p>
      <h2 class="h" data-r style="font-size:36px">把素材<span class="hl">從「夠用」變成「有得挑」</span></h2>
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      ${[['① 先補齊缺的','對照分鏡表，哪一顆還沒拍就先拍那一顆。<br><b>缺的補完再談加分的。</b>','wide','wood','side',C.clay],
         ['② 同一個動作，換距離再拍','剛剛拍過的動作，退遠一次、湊近一次。<br>剪的時候就有三種可以挑。','detail','wood','side',C.gold],
         ['③ 換一個背景，整輪重拍','換張布、換到窗邊、換個桌面。<br><b class="hl">同樣的商品會完全不一樣。</b>','close','cloth','front',C.sage]]
        .map(([k,v,kind,bg,light,c])=>`
        <div class="card" style="padding:18px;border-top:5px solid ${c}">
          <p style="margin:0 0 10px;font-size:22px;font-weight:900;color:${c};line-height:1.3">${k}</p>
          <div style="display:flex;justify-content:center;margin-bottom:10px">
            ${ART.shot(kind, 172, 196, { cap:null, bg, light })}
          </div>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</p>
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:18px">
      <div class="callout gold" style="margin:0">${ART.icon('clock',30,C.gold)}
        <span class="txt"><b>目標：總共 15–20 段。</b><br>
        三點半以後就不再回來拍了。</span></div>
      <div class="callout sage" style="margin:0">${ART.icon('ok',30,C.sage)}
        <span class="txt">拍得多的人，剪出來一定比較好看。<br>
        <b class="hl">這是攝影決定的，不是剪輯決定的。</b></span></div>
    </div>
  </div>`,
  notes:{
    say:['六十分鐘全部放給學員拍，講師和助教走動，台上不要再講課。',
         '三個層次照順序做：先補缺的，再換距離，最後才換背景。不要一開始就換背景。',
         '「好影片是拍出來的，不是剪出來的」這句在這一段要講兩三次。',
         '最後十分鐘提醒：三點半以後就進剪輯，不會再回來拍。'],
    ask:['問：現在幾段了？還缺哪一顆？（走動時一個一個問）'],
    do:['補齊缺的鏡頭，換距離、換背景各再拍一輪，目標 15–20 段。'],
    diff:['剪輯時每個人都有得挑，不會出現「只能全部用上」的窘境。'],
    more:['拍完的人：幫旁邊的人拍，或者出借一雙手當模特兒。'],
    less:['縮到 40 分鐘，只做第一、二項（補齊缺的、換距離）。']
  }});

S({ part:'拍攝', time:'14:14', kind:'std', title:'拍完自己檢查六項',
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
