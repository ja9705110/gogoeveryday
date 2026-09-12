
/* =========================================================================
   slides-c.js — 剪輯（47–59）　·　收尾（60–65）　·　附錄（66–68）　·　備用（69–80）
   ========================================================================= */
S({ part:'剪輯', time:'14:30', kind:'divider', title:'剪輯：把素材組成一支影片',
  html: divider('70<span style="font-size:.42em;letter-spacing:0"> 分</span>','把拍好的素材<br>組成一支影片',
    '剪輯只有九個步驟，七十分鐘做完。<br>今天不追求花俏，只求「能看、能發」。',
    ART.icon('cut',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['先講清楚這段只有七十分鐘，所以只教必要的九步。',
         '花俏的功能（速度、濾鏡、貼圖）今天不教，不是不能用，是今天沒時間。',
         '請大家先打開 InShot，沒裝的舉手，助教立刻處理。'],
    ask:['問：InShot 打開了嗎？打開的舉手。'],
    do:['打開 InShot。'],
    diff:['全班在同一個畫面上。'],
    more:[], less:['跳過秒數配置那兩頁，直接開始操作。']
  }});

S({ part:'剪輯', time:'14:31', kind:'std', title:'前 3 秒／中間／後面／結尾',
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

S({ part:'剪輯', time:'14:34', kind:'std', title:'三種主題的秒數配置',
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
      這就是為什麼分鏡表只要寫 5–8 個。</span></div>
  </div>`,
  notes:{
    say:['三個範例對應最多人選的三種主題。',
         '重點是最後那句：五顆鏡頭就夠了，不要貪多。',
         '請學員拿出自己的分鏡表，對照最接近的那一欄。'],
    ask:['問：你的分鏡表有幾顆？超過八顆的舉手？（請她們刪到八顆以內）'],
    do:['照最接近的範例，把自己的分鏡表標上秒數。'],
    diff:['學員的分鏡表有秒數，總長落在 15–30 秒。'],
    more:['講如果素材真的很好，可以做到 45 秒，但新手先做 20 秒。'],
    less:['只講第一個範例。']
  }});

S({ part:'剪輯', time:'14:37', kind:'std', title:'InShot 介面：只有四個地方要記',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">畫面上東西很多，<span class="hl">但你只會用到四個</span></h2></div>
    <div class="split" data-r style="gap:34px;align-items:center">
      <div style="display:flex;justify-content:center">
        ${ART.phone(ART.inshot({ tab:0, sel:1, h:428, caption:'手工草莓果醬' }), { w:232, h:428, bg:'#0f0f12' })}
      </div>
      <div class="stack gap-s">
        ${[['上面：預覽','影片長什麼樣子，隨時看這裡。',C.clay],
           ['中間：時間軸','你的每一段影片排成一條。<br><b>點一下就選中那一段。</b>',C.gold],
           ['下面：功能列','剪輯、文字、貼圖、音樂、濾鏡、畫布。<br>今天用到<b class="hl">剪輯、文字、音樂</b>三個。',C.sage],
           ['右上角：儲存','剪好之後按這裡輸出。',C.plum]]
          .map(([k,v,c])=>`
          <div style="display:flex;gap:14px;align-items:flex-start;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-left:5px solid ${c};
               border-radius:12px;padding:13px 18px">
            <span style="flex:0 0 128px;font-size:21px;font-weight:900;color:${c}">${k}</span>
            <span style="font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="callout" data-r style="padding:12px 22px">${ART.icon('warn',28)}
      <span class="txt">App 會改版，位置可能跟這張圖不完全一樣。
      <b>重點是知道要找什麼，不是背按鈕在哪裡。</b></span></div>
  </div>`,
  notes:{
    say:['介面只講四個位置，講多了學員會慌。',
         '「App 會改版」這句一定要講，上次社群課也是這樣講的，學員會安心。',
         '如果現場版本跟簡報不一樣，直接抓一位學員的手機投影。'],
    ask:['問：找到時間軸的舉手？找到儲存的舉手？'],
    do:['在自己手機上找到這四個位置。'],
    diff:['學員知道等一下要按哪裡。'],
    more:['講畫布功能可以改比例，但我們一開始就設 9:16 所以用不到。'],
    less:['只指出時間軸和功能列。']
  }});

S({ part:'剪輯', time:'14:40', kind:'std', title:'步驟一、二：建立專案、匯入影片',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">開頭兩步，<span class="hl">9:16 一定要先設</span></h2></div>
    <div class="split" data-r style="gap:26px">
      ${[['① 建立專案，比例選 9:16',
          ['打開 InShot，選「影片」','按「新建」','比例選 <b>9:16</b>（直式）',
           '這一步<b class="hl">之後不能改</b>，一定要先選對'], C.clay],
         ['② 匯入今天拍的影片',
          ['從相簿裡選','把今天拍的<b>全部選進來</b>','順序亂沒關係，等一下再排',
           '不確定要不要用的也先選，刪比補容易'], C.sage]]
        .map(([k,list,c])=>`
        <div class="card" style="padding:20px 24px;border-top:6px solid ${c}">
          <p style="margin:0 0 12px;font-size:24px;font-weight:900;color:${c}">${k}</p>
          ${list.map((t,i)=>`
            <div style="display:flex;gap:12px;align-items:baseline;padding:7px 0;
                 border-top:${i?'1px dashed rgba(36,28,23,.12)':'none'}">
              <span style="flex:0 0 auto;width:22px;height:22px;border-radius:50%;
                    background:${c};color:#fff;font-size:14px;font-weight:900;
                    display:inline-flex;align-items:center;justify-content:center">${i+1}</span>
              <span style="font-size:20px;font-weight:650;color:${C.ink2};line-height:1.45">${t}</span>
            </div>`).join('')}
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt"><b>最常見的錯誤：忘記選 9:16，剪到一半才發現是方形的。</b>
      現在請大家一起做這兩步，做完舉手，我等大家。</span></div>
  </div>`,
  notes:{
    say:['這兩步一起做，等全班都完成再往下。',
         '9:16 忘了選是最痛的錯誤，要重來。所以停下來等大家。',
         '「一次全選」要講，不然學員會一段一段慢慢加。'],
    ask:['問：影片都匯進去的舉手？'],
    do:['建立 9:16 專案，把今天拍的全部匯入。'],
    diff:['全班在同一個起點，後面才跟得上。'],
    more:['講可以先在相簿裡把不要的刪掉，匯入會比較乾淨。'],
    less:['講師示範一次，慢的人看旁邊的。']
  }});

S({ part:'剪輯', time:'14:44', kind:'std', title:'步驟三、四：修剪、分割與刪除',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">把每一段，剪成最精彩的 3–5 秒</h2></div>
    <div class="split" data-r style="gap:30px;align-items:center">
      <div style="display:flex;justify-content:center">
        ${ART.phone(ART.inshot({ tab:0, sel:2, h:392, clips:[3,2,5,2,3,2] }), { w:212, h:392, bg:'#0f0f12' })}
      </div>
      <div class="stack gap-s">
        <div class="card" style="padding:18px 22px;border-left:6px solid ${C.clay}">
          <p style="margin:0 0 6px;font-size:23px;font-weight:900;color:${C.clay}">③ 修剪：切掉頭尾</p>
          <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
            點一段 → 選「剪輯」→ <b>拖曳兩端的把手</b>。<br>
            把前面那一秒的留白、後面那一秒的留白切掉，<br>
            <b class="hl">留下 3–5 秒動作最完整的部分</b>。</p>
        </div>
        <div class="card" style="padding:18px 22px;border-left:6px solid ${C.gold}">
          <p style="margin:0 0 6px;font-size:23px;font-weight:900;color:${C.gold}">④ 分割與刪除</p>
          <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
            中間有一段不要（晃到、手擋住）：<br>
            把游標移到那裡 → 按<b>「分割」</b> → 選中間那塊 → <b>刪除</b>。</p>
        </div>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.icon('ok',30,C.sage)}
      <span class="txt">剪的原則只有一個：<b>寧可短，不要拖</b>。
      看的人不會嫌太短，只會嫌太長。</span></div>
  </div>`,
  notes:{
    say:['修剪是整個剪輯裡最花時間的一步，也是最重要的一步。',
         '「寧可短，不要拖」要講兩次，學員普遍捨不得剪。',
         '如果有人素材太少，就把每段留長一點，不要硬剪到 3 秒。'],
    ask:['問：有人捨不得剪的舉手？（幾乎都是）'],
    do:['把每一段都修剪成 3–5 秒。'],
    diff:['影片總長從三分鐘變成二十幾秒。'],
    more:['講「分割」也可以用來讓同一段素材出現兩次。'],
    less:['只教修剪，不教分割。']
  }});

S({ part:'剪輯', time:'14:48', kind:'std', title:'步驟五：調整順序',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">順序就是<span class="hl">早上寫的三段式</span></h2></div>
    <div data-r style="display:flex;align-items:stretch;gap:12px">
      ${[['開始','最好看的那一顆<br>或商品全景',C.clay],
         ['過程','2–3 顆動作鏡頭<br>倒、切、攪、包',C.gold],
         ['完成','成品的近景<br>或包好的樣子',C.sage],
         ['結尾','一句話<br>怎麼買、下次見',C.plum]]
        .map(([k,v,c],i)=>`
        <div style="flex:1;display:flex;align-items:center;gap:12px">
          <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
               border-top:6px solid ${c};border-radius:14px;padding:18px 16px;text-align:center">
            <p style="margin:0 0 7px;font-size:24px;font-weight:900;color:${c}">${k}</p>
            <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</p>
          </div>
          ${i < 3 ? `<span style="font-size:26px;font-weight:900;color:${C.muted};flex:0 0 auto">→</span>` : ''}
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:18px">
      <div class="card" style="padding:16px 20px;border-left:5px solid ${C.ink3};margin:0">
        <p style="margin:0 0 5px;font-size:21px;font-weight:900;color:${C.ink}">怎麼調</p>
        <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">
          在時間軸上<b>長按一段不放</b>，拖到你要的位置放開。</p>
      </div>
      <div class="callout gold" style="margin:0">${ART.icon('warn',30,C.gold)}
        <span class="txt"><b>最好看的那一顆，放第一個。</b><br>
        不要留到最後——留到最後就沒人看得到了。</span></div>
    </div>
  </div>`,
  notes:{
    say:['這一頁把第一個小時寫的三段式和剪輯接起來，是整天的收束點。',
         '「最好看的放第一個」第二次講了，這次要學員真的動手調。',
         '長按拖曳這個動作，中高齡學員常按不夠久，要示範。'],
    ask:['問：你的第一顆是哪一段？'],
    do:['把時間軸的順序調成：開始 → 過程 → 完成 → 結尾。'],
    diff:['影片有結構，不再是隨機排列。'],
    more:['講可以先在紙上寫順序，再照著拖。'],
    less:['只講「最好看的放第一個」。']
  }});

S({ part:'剪輯', time:'14:51', kind:'std', title:'【實作】把鏡頭排好',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　十分鐘</p>
      <h2 class="h" data-r style="font-size:38px">修剪完、排好順序，<span class="hl">先不要加文字和音樂</span></h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1050px;margin:0 auto">
      ${[['每段 3–5 秒','頭尾的留白都切掉',C.clay],
         ['順序照三段式','開始 → 過程 → 完成 → 結尾',C.gold],
         ['總長 15–30 秒','超過就再刪一兩段',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:24px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:25px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1050px">${ART.icon('play',30)}
      <span class="txt">排好之後<b>從頭播一次</b>。
      這時候它已經是一支影片了——<b class="hl">沒有文字沒有音樂，也看得懂</b>，那才叫拍得好。</span></div>
  </div>`,
  notes:{
    say:['十分鐘，助教全場走動。',
         '最後那句是今天的核心觀念：沒有音樂字幕也看得懂，代表拍攝有做對。',
         '看得懂的請她們自己給自己拍拍手。'],
    ask:['問：從頭播一次，看得懂在講什麼的舉手？'],
    do:['修剪、排序、播一次。'],
    diff:['每個人手上都有一支「毛片」，接下來只是加工。'],
    more:['請一兩位投影播放，全班一起看順序順不順。'],
    less:['縮到 6 分鐘，順序沒排完的先往下走。']
  }});

S({ part:'剪輯', time:'15:01', kind:'std', title:'步驟六：加文字',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">文字只加三個地方，<span class="hl">多了會亂</span></h2></div>
    <div class="split" data-r style="gap:30px;align-items:center">
      <div style="display:flex;justify-content:center">
        ${ART.phone(ART.inshot({ tab:1, sel:0, h:392, caption:'熬三小時的草莓果醬' }), { w:212, h:392, bg:'#0f0f12' })}
      </div>
      <div class="stack gap-s">
        ${[['前 3 秒：一句話','最重要的一句。<br>「熬三小時的草莓果醬」<br>「這個要怎麼開？」',C.clay],
           ['中間：一兩個小標','「加糖」「小火慢煮」<br>不用每一段都加。',C.gold],
           ['結尾：怎麼找到你','「私訊訂購」「每週三出貨」<br>或你的店名。',C.sage]]
          .map(([k,v,c])=>`
          <div style="display:flex;gap:14px;align-items:flex-start;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-left:5px solid ${c};
               border-radius:12px;padding:14px 18px">
            <span style="flex:0 0 132px;font-size:21px;font-weight:900;color:${c}">${k}</span>
            <span style="font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</span>
          </div>`).join('')}
        <div class="callout" style="margin:0;padding:12px 18px">${ART.icon('warn',26)}
          <span class="txt" style="font-size:19px">字要<b>大</b>、要<b>白底黑字或加陰影</b>、
          <b>不要壓在商品上</b>。放上方或下方的空白處。</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['文字最容易做過頭，講死：只有三個地方。',
         '前 3 秒那一句最重要，等於影片的標題。',
         '字太小是最常見的問題，手機上看得清楚才算數。'],
    ask:['問：你的前 3 秒要放哪一句話？寫在講義上。'],
    do:['加上前 3 秒那一句，其他有時間再加。'],
    diff:['影片有標題，不再是純畫面。'],
    more:['講文字出現的時間長度也可以拖曳調整。'],
    less:['只加前 3 秒那一句。']
  }});

S({ part:'剪輯', time:'15:05', kind:'std', title:'步驟七：加音樂與調音量',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">用 InShot <span class="hl">內建的音樂</span>就好</h2></div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
      ${[['選音樂','按「音樂」→「音效」或內建曲庫。<br>選一首輕快、沒有人聲的。','music',C.clay],
         ['調音量','原本的環境音<b>轉小或關掉</b>，<br>音樂大約 50–70%。','slider',C.gold],
         ['對到結尾','音樂比影片長，<br><b>拖到影片結尾把它剪掉</b>。','cut',C.sage]]
        .map(([k,v,ic,c])=>`
        <div class="card" style="padding:20px 18px;border-top:5px solid ${c}">
          <span style="display:block;margin-bottom:8px">${ART.icon(ic==='slider'?'wand':ic,36,c)}</span>
          <p style="margin:0 0 6px;font-size:23px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt"><b>不要自己去抓流行歌來用。</b>
      InShot 內建的音樂多半可以商用，流行歌發到 Facebook、Instagram
      <b class="hl">可能被消音，甚至整支影片被下架</b>。<br>
      有人聲的歌也會蓋掉你的字幕，內建的純音樂最安全。</span></div>
  </div>`,
  notes:{
    say:['音樂版權這件事一定要講，學員很習慣直接用手機裡的流行歌。',
         '講具體的後果：被消音、被下架，比講「有版權問題」有用。',
         '如果影片有講話的聲音，音樂要更小，或者乾脆不加。'],
    ask:['問：有人平常做影片會加流行歌的舉手？'],
    do:['加一首內建音樂，音量調到 50–70%，結尾剪齊。'],
    diff:['影片有配樂，而且不會被平台處理掉。'],
    more:['講可以在影片結尾讓音樂淡出（fade out）。'],
    less:['直接選第一首推薦音樂，不挑。']
  }});

S({ part:'剪輯', time:'15:08', kind:'std', title:'步驟八：轉場——多數直接切',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">不加轉場，<span class="hl">比亂加轉場好看</span></h2></div>
    <div class="split" data-r style="gap:26px">
      <div class="card" style="padding:20px 24px;border-top:6px solid ${C.sage}">
        <p style="margin:0 0 10px;font-size:24px;font-weight:900;color:${C.sage}">直接切（建議）</p>
        <p style="margin:0 0 10px;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
          一顆接一顆，什麼效果都不加。<br>
          你在社群上看到的短影音，<b class="hl">九成都是直接切</b>。</p>
        <div style="display:flex;align-items:center;gap:8px">
          ${[C.clay,C.gold,C.sage,C.plum].map(c=>`
            <span style="flex:1;height:34px;border-radius:6px;background:${c};opacity:.85"></span>`).join('')}
        </div>
      </div>
      <div class="card" style="padding:20px 24px;border-top:6px solid ${C.ink3}">
        <p style="margin:0 0 10px;font-size:24px;font-weight:900;color:${C.ink3}">要加也只加一種</p>
        <p style="margin:0 0 10px;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
          最多用<b>「淡入淡出」</b>，而且<b>只用在最後一個接縫</b>。<br>
          旋轉、翻頁、閃光那些，加了會很像十年前的影片。</p>
        <div style="display:flex;align-items:center;gap:8px">
          ${[C.clay,C.gold,C.sage,C.plum].map((c,i)=>`
            <span style="flex:1;height:34px;border-radius:6px;
                  background:${i===3?'linear-gradient(90deg,'+C.sage+','+c+')':c};opacity:.85"></span>`).join('')}
        </div>
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('bulb',30)}
      <span class="txt">同一句話也適用於<b>速度、濾鏡、貼圖</b>：
      今天全部不用。<b class="hl">效果加得少，影片反而比較專業。</b></span></div>
  </div>`,
  notes:{
    say:['這一頁其實是在幫學員省時間，而且結果會比較好看。',
         '中高齡學員最喜歡加特效，所以要明講「加了會像十年前的影片」。',
         '速度、濾鏡、貼圖、子母畫面今天一律不教。'],
    ask:['問：你們看的短影音，有很多轉場特效嗎？'],
    do:['不加轉場（或只在結尾加一個淡出）。'],
    diff:['影片乾淨，而且省下五分鐘。'],
    more:['進度快的班可以示範「速度放慢」用在特寫的效果。'],
    less:['一句話講完：今天不加轉場。']
  }});

S({ part:'剪輯', time:'15:10', kind:'std', title:'步驟九：輸出',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">按右上角「儲存」，設定選這兩個</h2></div>
    <div class="split" data-r style="gap:30px;align-items:center">
      <div class="stack gap-s">
        ${[['解析度','<b>1080p</b>','再高檔案太大，上傳很久；再低會糊。',C.clay],
           ['幀率','<b>30fps</b>','夠用了。60fps 檔案大一倍，看不出差別。',C.gold]]
          .map(([k,v,note,c])=>`
          <div class="card" style="padding:18px 22px;border-left:6px solid ${c}">
            <div style="display:flex;align-items:baseline;gap:14px;margin-bottom:5px">
              <span style="font-size:22px;font-weight:900;color:${C.ink3}">${k}</span>
              <span style="font-size:30px;font-weight:900;color:${c}">${v}</span>
            </div>
            <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.45">${note}</p>
          </div>`).join('')}
        <div class="callout sage" style="margin:0">${ART.icon('ok',30,C.sage)}
          <span class="txt">輸出完會自動存進<b>手機相簿</b>。<br>
          從相簿就可以直接發到 Facebook、Instagram、LINE。</span></div>
      </div>
      <div style="display:flex;justify-content:center">
        ${ART.phone(ART.inshot({ tab:0, right:'儲存中…', h:392, caption:'熬三小時的草莓果醬', clips:[3,4,5,3,4] }),
                    { w:212, h:392, bg:'#0f0f12' })}
      </div>
    </div>
    <div class="callout" data-r style="padding:12px 22px">${ART.icon('clock',28)}
      <span class="txt">輸出要等一到三分鐘，<b>不要中途切出去或關螢幕</b>，會失敗要重來。</span></div>
  </div>`,
  notes:{
    say:['1080p／30fps 這兩個數字寫在附錄，不用背。',
         '「輸出時不要切出去」一定要講，不然一半的人會失敗。',
         '輸出要等，可以趁這時候提醒下一頁的檢視點。'],
    ask:['問：輸出完成、在相簿裡看得到的舉手？'],
    do:['輸出 1080p／30fps。'],
    diff:['每個人的手機相簿裡有一支成品。'],
    more:['講 InShot 免費版結尾會有片頭 logo，可以在設定裡移除。'],
    less:['直接用預設值輸出。']
  }});

S({ part:'剪輯', time:'15:13', kind:'std', title:'【實作】完成剪輯並輸出',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　二十七分鐘　·　剪完就輸出</p>
      <h2 class="h" data-r style="font-size:38px">加文字、加音樂、輸出。<span class="hl">今天的成品就完成了</span></h2>
    </div>
    <div class="checks" data-r style="grid-template-columns:1fr 1fr;max-width:1050px;margin:0 auto">
      ${['每段修剪成 3–5 秒','順序是開始→過程→完成→結尾',
         '前 3 秒加了一句話','加了一首內建音樂',
         '總長 15–30 秒','輸出 1080p／30fps 存進相簿']
        .map(t=>`<div class="check"><span class="box"></span><span>${t}</span></div>`).join('')}
    </div>
    <div class="callout gold" data-r style="max-width:1050px">${ART.icon('warn',30,C.gold)}
      <span class="txt">來不及的先<b>輸出目前的版本</b>，回家再修。
      <b class="hl">存在手機裡的半成品，比留在 App 裡的完美作品有用。</b></span></div>
  </div>`,
  notes:{
    say:['二十七分鐘，時間比舊版寬鬆，但還是要盯住輸出。助教全場走動。',
         '一定要講「先輸出目前版本」，不然會有人剪到下課還沒輸出，回家就放棄了。',
         '剩最後三分鐘時全班喊一次：現在還沒按輸出的請按輸出。'],
    ask:['問：已經輸出完成的舉手？'],
    do:['完成剪輯並輸出。'],
    diff:['全班手機裡都有一支影片，這是今天的成果。'],
    more:['做完的人可以幫旁邊的人，或者開始剪第二支。'],
    less:['音樂可以不加，直接輸出。']
  }});

S({ part:'收尾', time:'15:40', kind:'std', title:'成果放映：一起看',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">成果放映　·　八分鐘</p>
      <h2 class="h" data-r style="font-size:40px">先跟旁邊的人互看，<br>再挑幾支投影出來</h2>
    </div>
    <div class="split" data-r style="gap:24px;max-width:1060px;margin:0 auto">
      <div class="card" style="padding:24px;border-top:6px solid ${C.clay}">
        <p style="margin:0 0 8px;font-size:25px;font-weight:900;color:${C.clay}">先：兩兩互看</p>
        <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
          跟旁邊的人交換手機，<b>各看一支</b>。<br>
          看完說<b class="hl">一句喜歡的地方</b>就好，不要挑毛病。</p>
      </div>
      <div class="card" style="padding:24px;border-top:6px solid ${C.sage}">
        <p style="margin:0 0 8px;font-size:25px;font-weight:900;color:${C.sage}">再：投影 3–5 支</p>
        <p style="margin:0;font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">
          自願的優先。<br>
          放的時候<b>大家一起找出「哪一顆最好看」</b>。</p>
      </div>
    </div>
    <div class="callout" data-r style="max-width:1060px">${ART.icon('ok',30,C.sage)}
      <span class="txt">今天早上你們手機裡什麼都沒有。<b>現在每個人都有一支影片了。</b></span></div>
  </div>`,
  notes:{
    say:['三十個人不可能全部投影，先兩兩互看，再挑 3–5 支。',
         '互看時規定「只說喜歡的地方」，中高齡學員被批評一次就不敢再拍了。',
         '投影時盡量挑不同商品類型的，讓大家看到多樣性。'],
    ask:['問：願意放給大家看的舉手？'],
    do:['兩兩互看，各說一句喜歡的地方。'],
    diff:['學員看到別人的成果，回家比較願意繼續拍。'],
    more:['請被投影的學員說一句「最難的地方是什麼」。'],
    less:['只做兩兩互看，不投影。']
  }});

S({ part:'收尾', time:'15:44', kind:'std', title:'八個檢視點',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
      回家發之前，用這八項對一次</h2></div>
    <div class="checks" data-r style="grid-template-columns:1fr 1fr;gap:9px 20px">
      ${[['前 3 秒抓得住人嗎','第一顆是不是最好看的那一顆'],
         ['一支只講一件事嗎','講兩件事就拆成兩支'],
         ['總長 15–30 秒嗎','超過就再刪一兩顆'],
         ['是直式 9:16 嗎','有黑邊就是設錯了'],
         ['畫面穩、看得清楚嗎','晃的、糊的那一顆直接刪掉'],
         ['有過程或動作嗎','全部靜止的商品會很平'],
         ['字看得清楚嗎','手機上看，不是電腦上看'],
         ['看完知道怎麼找到你嗎','結尾要有店名或訂購方式']]
        .map(([k,v])=>`
        <div class="check" style="align-items:flex-start;padding:11px 16px">
          <span class="box" style="margin-top:3px"></span>
          <span style="flex:1">
            <b style="display:block;font-size:20px;font-weight:900;color:${C.ink}">${k}</b>
            <span style="font-size:18px;font-weight:650;color:${C.ink3}">${v}</span>
          </span>
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="padding:12px 22px">${ART.icon('ok',28,C.sage)}
      <span class="txt"><b>八項不用全過。</b>過六項就可以發了——
      發出去再慢慢進步，比放在手機裡永遠不發好。</span></div>
  </div>`,
  notes:{
    say:['八項唸過去，這一頁附錄有，回家可以照著用。',
         '最後那句最重要：不要追求完美，發出去比較重要。',
         '前三項是最關鍵的，如果只記三項就記這三項。'],
    ask:['問：你的影片八項過幾項？'],
    do:['對照八項檢查自己的影片。'],
    diff:['學員有一份回家能用的自我檢查標準。'],
    more:['請學員挑一項自己最弱的，下一支重點改進。'],
    less:['只講前三項。']
  }});

S({ part:'收尾', time:'15:48', kind:'std', title:'最常見的三個問題與怎麼改',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">如果影片怪怪的，多半是這三個原因</h2></div>
    <div class="stack gap-s" data-r>
      ${[['看完不知道你在賣什麼','一支講了太多件事，<b>或者根本沒有商品的清楚畫面</b>。',
          '回到一開始寫的兩句話。刪到只剩一件事，中間補一顆商品全景。',C.clay],
         ['很平、看不下去','全部都是靜止的商品，<b>沒有動作、沒有人、沒有過程</b>。',
          '補拍兩顆「手在做事」的鏡頭。倒、切、攪、包，哪一個都好。',C.gold],
         ['有點暈、有點糊','鏡頭一直在動，或者<b>錄影中途放大縮小</b>。',
          '晃的那幾顆直接刪掉。運鏡要慢，變焦要在錄之前就決定好。',C.sage]]
        .map(([k,why,fix,c],i)=>`
        <div style="background:#fff;border:1px solid rgba(36,28,23,.12);
             border-left:6px solid ${c};border-radius:14px;padding:16px 22px">
          <div style="display:flex;align-items:baseline;gap:12px;margin-bottom:6px">
            <span style="width:26px;height:26px;border-radius:50%;background:${c};color:#fff;
                  font-size:16px;font-weight:900;display:inline-flex;align-items:center;
                  justify-content:center;flex:0 0 auto">${i+1}</span>
            <span style="font-size:23px;font-weight:900;color:${c}">${k}</span>
          </div>
          <p style="margin:0 0 5px;font-size:19px;font-weight:650;color:${C.ink3};line-height:1.4">
            原因：${why}</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:${C.ink2};line-height:1.45">
            怎麼改：${fix}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:12px 22px">${ART.icon('bulb',28)}
      <span class="txt">三個問題的解法<b>都在拍攝，不在剪輯</b>。這就是今天為什麼把時間放在拍。</span></div>
  </div>`,
  notes:{
    say:['三個問題涵蓋八成的新手影片。',
         '最後那句是整天的總結：問題出在拍攝，剪輯救不了。'],
    ask:['問：你的影片比較接近哪一個問題？'],
    do:['圈出自己最像的那一個，下一支改進。'],
    diff:['學員知道下一支要改什麼，不是茫然地再拍一次。'],
    more:['補第四個問題：太長。超過一分鐘就沒人看完。'],
    less:['只講第一個問題。']
  }});

S({ part:'收尾', time:'15:51', kind:'std', title:'流量從哪裡來：一支不夠，要有系列',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>回家之後最重要的一頁</p>
      <h2 class="h" data-r style="font-size:36px">流量來自<span class="hl">累積</span>，不是來自單支爆紅</h2>
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px">
      ${[['一支影片沒流量是正常的','不要因為第一支只有二十個人看就放棄。<br><b>前十支都是在練習</b>。',C.ink3],
         ['觀眾要「知道下次看得到什麼」','每次都拍不一樣的東西，人家不知道追蹤你要幹嘛。<br><b class="hl">系列會讓人想追蹤</b>。',C.clay],
         ['對你自己的好處更大','有系列就<b>不用每次重新想題材</b>。<br>照著同一個公式再拍一次就好。',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:20px 18px;border-top:5px solid ${c}">
          <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:${c};line-height:1.3">${k}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.5">${v}</p>
        </div>`).join('')}
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
      ${ART.seriesCard('系列 A：製作過程', ['草莓果醬怎麼熬','鳳梨果醬怎麼熬','為什麼要熬三小時'], C.clay)}
      ${ART.seriesCard('系列 B：商品細節', ['果醬的質地','玻璃罐的封口','標籤是手寫的'], C.gold)}
      ${ART.seriesCard('系列 C：客人常問', ['開封後放多久','可以配什麼吃','小朋友能吃嗎'], C.sage)}
    </div>
    <div class="callout gold" data-r style="padding:12px 22px">${ART.icon('warn',28,C.gold)}
      <span class="txt">十一種主題<b>不是挑一種拍一次</b>，是十一條可以一直拍下去的路。
      <b class="hl">選 2–3 種輪流發</b>，比十一種都做一次有用得多。</span></div>
  </div>`,
  notes:{
    say:['這一頁接第一個小時「十一個系列」那一頁埋的伏筆，一定要回頭指一下。',
         '重點順序：先安撫（沒流量正常）、再講原因（系列讓人想追蹤）、',
         '最後講對自己的好處（不用一直想題材）——這一點對中高齡學員最有說服力。',
         '三張系列卡是範例，請學員想自己的三個系列。'],
    ask:['問：你的三個系列可以是什麼？跟旁邊的人說一個。'],
    do:['在講義上寫下自己的 2–3 個系列名稱。'],
    diff:['學員離開時不是只有一支影片，是有一個可以持續的計畫。'],
    more:['講同一系列的影片開頭要長得像：同樣的字卡、同樣的第一顆鏡頭。'],
    less:['只講「選 2–3 種輪流發」這一句。']
  }});

S({ part:'收尾', time:'15:55', kind:'std', title:'一個月的發片計畫',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:34px;margin-bottom:2px">
      <span class="hl">一週一支就夠。</span>四週輪三個系列</h2></div>
    <table class="tbl" data-r style="font-size:20px">
      <thead><tr>
        <th style="width:110px">週</th>
        <th>系列 A：製作過程</th>
        <th>系列 B：商品細節</th>
        <th>系列 C：客人常問</th>
      </tr></thead>
      <tbody>
        ${PLAN.map(r=>`
        <tr><td class="lead-col" style="text-align:center">${r[0]}</td>
          <td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="split" data-r style="gap:18px">
      <div class="callout sage" style="margin:0;padding:12px 18px">${ART.icon('ok',28,C.sage)}
        <span class="txt" style="font-size:19px"><b>同一個系列的影片，開頭要長得像。</b>
        同樣的字卡、同樣的第一顆鏡頭，觀眾才認得出來。</span></div>
      <div class="callout gold" style="margin:0;padding:12px 18px">${ART.icon('clock',28,C.gold)}
        <span class="txt" style="font-size:19px">一支影片大約<b>拍 30 分鐘、剪 20 分鐘</b>。
        一週一次，一年五十支。</span></div>
    </div>
    <div class="callout" data-r style="padding:11px 20px">${ART.icon('bulb',26)}
      <span class="txt" style="font-size:19px">今天拍的這一支，就是<b class="hl">第 1 週</b>。附錄有空白的計畫表，回家把四週填完。</span></div>
  </div>`,
  notes:{
    say:['這張表是給學員回家照抄的，附錄有空白版。',
         '「一年五十支」這個數字要講，會讓學員感覺到累積的力量。',
         '一週一支不要加碼，中高齡學員答應太多就會全部放棄。'],
    ask:['問：你的第 2 週要拍什麼？現在就決定。'],
    do:['填四週計畫表的第 2 週。'],
    diff:['學員離開教室時，下一支要拍什麼已經定了。'],
    more:['講可以先把四支的素材一次拍完，再分四週發。'],
    less:['只講「一週一支就夠」。']
  }});

S({ part:'收尾', time:'15:58', kind:'std', title:'最後一句話',
  html:`
  <div class="stack gap-m center" style="text-align:center;justify-content:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">今天到這裡</p>
      <h2 class="mega" data-r style="font-size:52px;line-height:1.28">
        影片好不好看，<br><span class="hl">八成在你按下錄影之前就決定了。</span></h2>
    </div>
    <div data-r style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;margin-top:6px">
      ${['先想','再寫','再畫','再拍','最後才剪']
        .map((t,i)=>`<span class="tag${i===3?' on':''}" style="font-size:22px">${t}</span>`).join('')}
    </div>
    <div class="callout sage" data-r style="max-width:1000px;margin-top:8px">${ART.icon('ok',32,C.sage)}
      <span class="txt">今天早上你手機裡什麼都沒有。現在你有<b>一張分鏡表</b>、
      <b>十幾段素材</b>、<b class="hl">一支剪好的影片</b>，還有<b>接下來四週要拍什麼</b>。</span></div>
    <p data-r style="margin:4px 0 0;font-size:26px;font-weight:800;color:${C.ink2}">
      回家發出去。第一支沒人看沒關係，<b style="color:${C.clay}">拍到第十支就不一樣了。</b></p>
  </div>`,
  notes:{
    say:['最後這句「八成在按下錄影之前就決定了」慢慢念，念完停三秒。',
         '然後把四樣成果數一次給她們聽，讓她們知道今天帶走了什麼。',
         '最後一句「拍到第十支就不一樣了」是給她們回家的動力。',
         '發回饋單，鼓勵互相追蹤、互加好友——回家後的第一批觀眾就是彼此。'],
    ask:['問：回家第一支要什麼時候發？（請她們說一個日期）'],
    do:['互相追蹤、互加 LINE 好友。'],
    diff:['學員帶著具體的下一步離開，而不是只帶著一支影片。'],
    more:['留三分鐘讓大家互相交換帳號。'],
    less:['直接念最後兩句話結束。']
  }});

S({ part:'附錄', time:'—', kind:'std', title:'附錄①　分鏡表（空白）',
  html:`
  <div class="stack gap-s pad-tight">
    <div style="display:flex;align-items:baseline;justify-content:space-between">
      <h2 class="h" data-r style="font-size:30px;margin:0">分鏡表　　5–8 個鏡頭</h2>
      <span style="font-size:19px;font-weight:700;color:${C.ink3}">
        主題：＿＿＿＿＿＿＿　　　總長：＿＿＿ 秒</span>
    </div>
    <div data-r>${ART.boardBlank(8)}</div>
    <div class="split" data-r style="gap:18px">
      <div class="card flat" style="padding:12px 18px">
        <p style="margin:0 0 4px;font-size:19px;font-weight:900;color:${C.clay}">「畫面」欄怎麼填</p>
        <p style="margin:0;font-size:18px;font-weight:650;color:${C.ink2}">
          全景／中景／近景／特寫，四選一。</p>
      </div>
      <div class="card flat" style="padding:12px 18px">
        <p style="margin:0 0 4px;font-size:19px;font-weight:900;color:${C.sage}">「秒數」欄怎麼填</p>
        <p style="margin:0;font-size:18px;font-weight:650;color:${C.ink2}">
          每顆 3–5 秒，加起來 15–30 秒。</p>
      </div>
    </div>
  </div>`,
  notes:{ say:['這三頁附錄會單獨印成 A4 發給學員。'], ask:[], do:[] }});

S({ part:'附錄', time:'—', kind:'std', title:'附錄②　素材清單 ＋ 必備六鏡',
  html:`
  <div class="stack gap-s pad-tight">
    <div><h2 class="h" data-r style="font-size:30px;margin-bottom:2px">素材清單　　拍之前先列，拍完打勾</h2></div>
    <div class="split" style="gap:22px">
      <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.clay}">
        <p class="cap" style="color:${C.clay};margin-bottom:8px">必備六個鏡頭（一定要有）</p>
        <div class="checks" style="grid-template-columns:1fr;gap:7px">
          ${SIX.map(([k,shot,v])=>`
            <div class="check" style="justify-content:flex-start;padding:9px 14px">
              <span class="box"></span>
              <span style="flex:1;font-size:18px;font-weight:700;color:${C.ink2}">
                ${k}<span style="color:${C.ink3};font-weight:650">　${shot}　${v}</span></span>
            </div>`).join('')}
        </div>
      </div>
      <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.sage}">
        <p class="cap" style="color:${C.sage};margin-bottom:8px">加分素材（有時間就補）</p>
        <div class="checks" style="grid-template-columns:1fr;gap:7px">
          ${['同一個動作換距離再拍一次','再多兩顆「手在做事」的過程',
             '運鏡：靠近','運鏡：離開','運鏡：平移',
             '換一個背景，同樣商品再拍一輪','空景（工作檯、窗邊）當開場']
            .map(t=>`
            <div class="check" style="justify-content:flex-start;padding:9px 14px">
              <span class="box"></span>
              <span style="font-size:18px;font-weight:700;color:${C.ink2}">${t}</span></div>`).join('')}
        </div>
        <div class="callout" style="padding:9px 14px;margin-top:9px">${ART.icon('warn',22)}
          <span class="txt" style="font-size:17px">目標 <b>12–15 段</b>。素材多一倍，剪的時候才有得挑。</span></div>
      </div>
    </div>
  </div>`,
  notes:{ say:['素材清單是拍攝時最實用的一張，建議印在分鏡表背面。'], ask:[], do:[] }});

S({ part:'附錄', time:'—', kind:'std', title:'附錄③　InShot 九步驟 ＋ 一個月發片計畫',
  html:`
  <div class="stack gap-s pad-tight">
    <div class="split" style="gap:22px;align-items:flex-start">
      <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.clay}">
        <p class="cap" style="color:${C.clay};margin-bottom:8px">InShot 九步驟</p>
        ${NINE.map(([k,v],i)=>`
          <div style="display:flex;gap:11px;align-items:baseline;padding:6px 0;
               border-top:${i?'1px dashed rgba(36,28,23,.12)':'none'}">
            <span style="flex:0 0 auto;width:21px;height:21px;border-radius:50%;background:${C.clay};
                  color:#fff;font-size:13px;font-weight:900;display:inline-flex;
                  align-items:center;justify-content:center">${i+1}</span>
            <span style="flex:1;font-size:18px;font-weight:800;color:${C.ink}">${k}</span>
            <span style="flex:0 0 210px;font-size:17px;font-weight:650;color:${C.ink3}">${v}</span>
          </div>`).join('')}
      </div>
      <div class="stack gap-s" style="flex:1">
        <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.sage}">
          <p class="cap" style="color:${C.sage};margin-bottom:8px">我的一個月發片計畫</p>
          <table class="tbl compact" style="font-size:17px;table-layout:fixed;width:100%">
            <thead><tr><th style="width:66px;white-space:nowrap">週</th>
              <th style="white-space:nowrap">系列 A</th>
              <th style="white-space:nowrap">系列 B</th>
              <th style="white-space:nowrap">系列 C</th></tr></thead>
            <tbody>
              <tr><td class="lead-col" style="text-align:center;font-size:15px">名稱</td>
                <td>＿＿＿</td><td>＿＿＿</td><td>＿＿＿</td></tr>
              ${['第 1 週','第 2 週','第 3 週','第 4 週'].map(w=>`
              <tr><td class="lead-col" style="text-align:center;white-space:nowrap">${w}</td>
                <td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>`).join('')}
            </tbody></table>
          <p style="margin:8px 0 0;font-size:17px;font-weight:650;color:${C.ink2}">
            一週一支就夠。同一個系列的影片，<b>開頭要長得像</b>。</p>
        </div>
        <div class="card" data-r style="padding:14px 20px;border-top:5px solid ${C.gold}">
          <p class="cap" style="color:${C.gold};margin-bottom:6px">發之前，八項對一次</p>
          <p style="margin:0;font-size:17px;font-weight:650;color:${C.ink2};line-height:1.6">
            前 3 秒抓得住人　·　只講一件事　·　15–30 秒　·　直式 9:16　·
            畫面穩　·　有過程或動作　·　字看得清楚　·　看完知道怎麼找到你</p>
        </div>
      </div>
    </div>
  </div>`,
  notes:{ say:['這一頁是回家用的，九步驟＋計畫表＋檢查點都在同一張。'], ask:[], do:[] }});

S({ part:'備用', time:'—', kind:'divider', title:'備用頁（不排在流程裡）',
  html: divider('＋','備用頁',
    '以下頁面不排在今天的流程裡。<br>進度快、學員提問、或某一段需要多講的時候再翻出來。',
    ART.icon('list',130,'rgba(255,255,255,.13)')),
  notes:{
    say:['這些頁原本在完整版的流程裡，改成一小時腳本後移到這裡。',
         '用得到的時機：學員問到、某一組特別快、或者哪一段講不清楚需要補充。',
         '按 O 可以直接跳到這些頁。'],
    ask:[], do:[], diff:[], more:[], less:[]
  }});

S({ part:'備用', time:'—', kind:'std', title:'講太多的下場',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div><h2 class="h" data-r style="font-size:38px">觀眾滑走的三個瞬間</h2></div>
    <div class="cards c3" data-r style="gap:20px;max-width:1020px;margin:0 auto">
      ${[['前 3 秒看不懂在拍什麼','畫面一開始是天花板、是桌子、是你在調整手機',C.clay],
         ['講到一半換了話題','本來在講怎麼做，突然講到包裝，觀眾跟不上',C.gold],
         ['看完不知道要幹嘛','沒有結尾，最後一個畫面是你伸手去關手機',C.plum]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:24px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1020px">${ART.icon('eye',32)}
      <span class="txt">這三個問題，<b class="hl">都是在拍之前就決定的</b>，
      不是剪輯能救的。所以我們現在要先想清楚。</span></div>
  </div>`,
  notes:{
    say:['三個瞬間都很具體，學員會認出自己拍過的影片。',
         '最後那句是本段的結論：這些都是拍之前決定的。'],
    ask:['問：你自己滑短影音的時候，什麼情況會直接滑掉？'],
    do:[],
    diff:['學員開始重視前 3 秒。'],
    more:['現場滑一下自己的社群，找一支三秒內看不懂的影片。'],
    less:['只講第一個瞬間。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'清楚的一句話 vs 模糊的一句話',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">同樣是果醬，兩種寫法差很多</h2></div>
    <div class="split" style="gap:30px">
      <div class="stack gap-s" data-r>
        <div class="prompt bad">
          <span class="p-lab">模糊</span><br>
          「我要拍我的果醬。」<br>
          「我希望大家覺得很好吃。」</div>
        <div class="card" style="padding:16px 20px;background:#fdf3f1;border-color:transparent">
          <p class="v" style="font-size:19px">
            拍的時候會卡：果醬的什麼？放在桌上拍嗎？拍多久？<br>
            <b>什麼都可以，就等於什麼都不知道。</b></p>
        </div>
      </div>
      <div class="stack gap-s" data-r>
        <div class="prompt good">
          <span class="p-lab">清楚</span><br>
          「我要拍<em>草莓果醬從下鍋到裝瓶</em>的過程。」<br>
          「我希望觀眾看完知道<em>這是我自己熬的，不是買現成的</em>。」</div>
        <div class="card sage" style="padding:16px 20px">
          <p class="v" style="font-size:19px">
            拍什麼馬上就有答案：草莓下鍋、攪拌、裝瓶、貼標。<br>
            <b>連結尾要拍什麼都決定了。</b></p>
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['左右對照念，讓學員自己聽出差別。',
         '重點：清楚的一句話會直接生出分鏡，模糊的不會。這是下一段的伏筆。'],
    ask:['問：你的兩句話比較像左邊還是右邊？'],
    do:['回去修自己的兩句話，改得更具體。'],
    diff:['學員會把「我要拍果醬」改成「我要拍果醬的某個過程」。'],
    more:['用學員的實例現場改一次。'],
    less:['只念右邊。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'兩句話寫不出來，代表還沒想清楚',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">卡住的三種情況，這樣處理</h2></div>
    <div class="stack gap-s" data-r>
      ${[['想不到要拍什麼','回去看商品類型對照那一頁，選粗體那一種。<br>真的沒想法就拍「製作過程」——最不會失敗。',C.clay],
         ['想拍的東西太多','把它們列出來，<b>今天只拍第一個</b>，其他寫在旁邊當下週的題材。',C.gold],
         ['第二句寫不出來','問自己：如果客人看完只記得一句話，你希望是哪一句？<br>那句就是答案。',C.sage]]
        .map(([k,v,c])=>`
        <div style="display:flex;gap:16px;align-items:flex-start;background:#fff;
             border:1px solid rgba(36,28,23,.12);border-left:5px solid ${c};
             border-radius:14px;padding:16px 20px">
          <span style="font-size:22px;font-weight:900;color:${c};min-width:168px">${k}</span>
          <span style="font-size:20px;font-weight:650;color:${C.ink2};line-height:1.5">${v}</span>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('ok',30,C.sage)}
      <span class="txt">寫不出來不是你的問題，是這一步本來就最難。
      <b>但這一步跳過去，後面每一步都會更難。</b></span></div>
  </div>`,
  notes:{
    say:['這一頁是給卡住的人的救生索，助教要拿著這一頁去個別協助。',
         '「想拍太多」的人最好處理：多的變成下週題材，正好接系列的觀念。'],
    ask:['問：現在還卡住的舉手？'],
    do:['卡住的學員由助教一對一協助。'],
    diff:['全班都有兩句話才往下走。'],
    more:[], less:['跳過，直接個別處理。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'檢查：每一段能不能用一句話說完',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div><h2 class="h" data-r style="font-size:38px">三個檢查，過了才往下</h2></div>
    <div class="cards c3" data-r style="gap:20px;max-width:1020px;margin:0 auto">
      ${[['1','開始那一段，3 秒內看得出在拍什麼嗎？','看不出來，就換一個更明顯的畫面',C.clay],
         ['2','過程那一段，有幾個具體動作？','少於三個，影片會很單調',C.gold],
         ['3','完成那一段，有東西可以拍嗎？','沒有的話，補一個「成品放好」的畫面',C.sage]]
        .map(([n,q,v,c])=>`
        <div class="card" style="padding:22px 20px">
          <span class="num-badge" style="background:${c};margin-bottom:11px">${n}</span>
          <p class="k" style="font-size:22px">${q}</p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="max-width:1020px">${ART.icon('ok',30,C.sage)}
      <span class="txt">三個都過了，你的腳本就完成了。<b>接下來把它畫成分鏡。</b></span></div>
  </div>`,
  notes:{
    say:['三個檢查一起走一遍，這是進入分鏡前的關卡。',
         '第二個檢查最重要：少於三個動作的，過程段一定會很無聊。'],
    ask:['問：三個檢查都過的舉手？'],
    do:['自己檢查一次，沒過的補寫。'],
    diff:['進入分鏡段時，每個人都有可用的腳本。'],
    more:[], less:['只做第二個檢查。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'不要先拍一堆，再回來想怎麼剪',
  html:`
  <div class="split" style="gap:36px">
    <div class="card" data-r style="padding:24px 26px;background:#fdf3f1;border-color:transparent">
      <p class="cap" style="color:#c0392b">✕ 多數人的做法</p>
      <div class="stack gap-s">
        <div class="no"><i>1</i><span>拿起手機，看到什麼拍什麼</span></div>
        <div class="no"><i>2</i><span>拍了二三十段，每段都很長</span></div>
        <div class="no"><i>3</i><span>打開剪輯 App，不知道從哪一段開始</span></div>
        <div class="no"><i>4</i><span>剪到一半發現少了關鍵鏡頭</span></div>
        <div class="no"><i>5</i><span>放棄</span></div>
      </div>
    </div>
    <div class="card sage" data-r style="padding:24px 26px">
      <p class="cap" style="color:${C.sage}">✓ 今天要學的做法</p>
      <div class="stack gap-s">
        <div class="yes"><i>1</i><span>先寫三段腳本</span></div>
        <div class="yes"><i>2</i><span>拆成 5–8 個鏡頭，寫進分鏡表</span></div>
        <div class="yes"><i>3</i><span>照表拍，拍完一個打一個勾</span></div>
        <div class="yes"><i>4</i><span>拍完就知道素材是齊的</span></div>
        <div class="yes"><i>5</i><span>剪輯只要照順序接起來</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['左邊那五步要念得像在講學員自己的故事，會很有共鳴。',
         '第 4 步「剪到一半發現少了關鍵鏡頭」是最痛的，因為東西已經收了、材料已經用完了。'],
    ask:['問：左邊這五步，你走過幾步？'],
    do:[],
    diff:['學員接受花時間寫分鏡表。'],
    more:[], less:['只講左邊第 4 步和右邊第 3 步。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'全景：看整體',
  html: shotPage('wide','全景<br>讓人看見整個場面',
    ['工作環境、你的工作檯','整桌的商品','完整的包裝與周邊'],
    '全景通常放在<b>開頭</b>，用來交代「這是在哪裡、有什麼」。', C.clean),
  notes:{
    say:['全景的功能是「交代環境」，不是「看清楚商品」。',
         '全景放開頭最有效，因為觀眾需要先知道場景。'],
    ask:['問：你的工作檯拍成全景好看嗎？（不好看就先整理）'],
    do:[], diff:['學員知道全景不是隨便拍遠一點。'],
    more:['提醒全景最容易拍到雜物，開拍前先整理桌面。'],
    less:['四種景別合併成一頁講。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'中景：商品＋手',
  html: shotPage('medium','中景<br>看得到動作在發生',
    ['手在操作、包裝、攪拌','使用方式的示範','商品和人的關係'],
    '中景是短影音<b>用得最多</b>的距離。有手、有動作，畫面才活。', C.warm),
  notes:{
    say:['中景是短影音的主力，多數鏡頭都是中景。',
         '「有手就有動作，有動作就有人看」——這句話要講。'],
    ask:['問：你的商品，手可以怎麼跟它互動？'],
    do:[], diff:['學員開始想到把手放進畫面。'],
    more:['提醒手要乾淨，指甲要整理，這是很多人忽略的。'],
    less:['與近景合併。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'近景：商品是主角',
  html: shotPage('close','近景<br>商品占滿畫面',
    ['商品主體的完整樣子','包裝正面、標籤','商品的顏色與形狀'],
    '近景適合<b>結尾</b>，讓觀眾最後記住商品長什麼樣。', C.fresh),
  notes:{
    say:['近景和中景最容易混淆：中景有手，近景商品占滿。',
         '近景放結尾，讓人記住商品——這跟開頭的全景剛好對稱。'],
    ask:['問：中景和近景差在哪裡？（有沒有手）'],
    do:[], diff:['學員分得出中景和近景。'],
    more:[], less:['與中景合併。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'特寫：只看一個細節',
  html: shotPage('detail','特寫<br>只給一個細節',
    ['食物的切面、拉絲、流動','飾品的紋理與扣環','標籤、封口、材質','手部的細微動作'],
    '特寫是<b>最有說服力</b>的畫面，也是最多人沒拍的。一支影片至少要有一個。', C.lux),
  notes:{
    say:['特寫是今天最想讓學員學會的一種，因為最多人沒拍過。',
         '特寫要走近拍，不要用手指放大——這是（1）教過的原則。',
         '手機最近對焦距離大約 8–10 公分，太近會對不到焦。'],
    ask:['問：你的商品，最值得特寫的細節是什麼？'],
    do:['想一個自己商品的特寫點。'],
    diff:['學員會開始注意商品的細節，而不只是整體。'],
    more:['示範一次特寫，讓學員看對焦怎麼點。'],
    less:['只講「一支影片至少要有一個特寫」。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'【實作】完成素材清單',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　六分鐘</p>
      <h2 class="h" data-r style="font-size:38px">等一下要用到的東西，全部列出來</h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1020px;margin:0 auto">
      ${[['要準備的東西','商品、原料、道具、包裝材料',C.clay],
         ['要做的動作','切、攪、包、拿、放、打開',C.gold],
         ['不可逆的先拍','切開、下鍋、拆封——做了就回不去',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:22px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1020px">${ART.icon('warn',30)}
      <span class="txt">第三欄最重要。<b class="hl">不可逆的動作，一定要先確認鏡頭準備好了再做。</b></span></div>
  </div>`,
  notes:{
    say:['第三點「不可逆的先拍」是實務上最有價值的一句話。',
         '提醒：要用的東西，開始拍之前先擺好。'],
    ask:['問：你的清單裡，哪一項是不可逆的？'],
    do:['完成素材清單，並在不可逆的項目前面畫星號。'],
    diff:['拍攝時不會發生「東西用掉了才想到沒拍」。'],
    more:[], less:['口頭提醒，不寫清單。']
  }});

S({ part:'備用', time:'—', kind:'std', title:'你的商品，過程在哪裡？',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">互動　·　三分鐘</p>
      <h2 class="h" data-r style="font-size:38px">回去看你的分鏡表，<span class="hl">過程有幾個鏡頭？</span></h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1020px;margin:0 auto">
      ${[['0–1 個','過程太少，影片會很平。<br>回去加兩個動作的鏡頭。','#c0392b'],
         ['2–3 個','剛剛好。<br>這支影片會有東西可看。',C.sage],
         ['4 個以上','很好，但注意總長。<br>超過 30 秒就刪掉一兩個。',C.gold]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:24px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:26px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1020px">${ART.icon('warn',30)}
      <span class="txt">現在把分鏡表補好。<b>接下來就照這張表拍，不再改。</b></span></div>
  </div>`,
  notes:{
    say:['這是腳本段的收尾，讓學員自己檢查分鏡表。',
         '「照這張表拍，不再改」要明確講，不然拍攝時會有人一直改。',
         '午休前提醒：要用的東西午休時先擺好。'],
    ask:['問：過程有幾個鏡頭？0–1 個的舉手？（這些人要優先協助）'],
    do:['補完分鏡表，午休時擺好道具。'],
    diff:['拍攝可以直接開始，不用再花時間規劃。'],
    more:[], less:['口頭提醒即可。']
  }});
