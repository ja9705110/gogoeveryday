/* =========================================================================
   slides-a.js — PART 0 開場與感覺主軸　＋　PART 1 認識你的手機相機
   第 1–17 頁
   ========================================================================= */
const DECK = [];
const S = o => DECK.push(o);

const F = ART.FEEL;                       // 四種感覺
const feelChips = () => F.map(f =>
  `<span class="tag sm" style="color:${f.c};border-color:${f.c}44">${f.name}</span>`).join('');

/* =========================================================================
   1　封面
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'cover', title:'封面：手機拍攝商品與影像編修基礎（1）',
  html:`
  <div class="cover-wrap">
    <div class="cover-l">
      <h1 class="mega" data-r style="font-size:66px">手機拍攝商品<br>與影像編修基礎</h1>
      <p class="lead" data-r style="margin-top:18px;font-size:27px">
        今天不聽理論。<br>
        你會用自己的手機，把一個商品<b class="hl">真的拍好、真的修好</b>。</p>
      <div data-r style="display:flex;gap:10px;margin-top:26px;flex-wrap:wrap">${feelChips()}</div>
    </div>
    <div class="cover-r" data-r>
      ${ART.scene({ w:360, h:300, bg:'wood', light:'side', angle:'a45', zoom:1.05 })}
    </div>
  </div>`,
  notes:{
    say:['自我介紹兩分鐘就好，不要久。',
         '開場最重要的一件事：請所有人現在就把手機拿出來，確認電量、確認相機打得開、確認相簿有空間。',
         '這件事在九點做，比在十點半發現有人手機滿了要好太多。'],
    ask:['問：今天有帶自己的商品或小東西來的舉手？（沒帶的人現場借杯子、鑰匙、水瓶都可以）'],
    do:['請所有人把手機拿出來放桌上，螢幕朝上。'],
    diff:['學員會意識到今天是要動手的，不是聽課。'],
    more:['可以請一兩位學員說自己做什麼商品，後面舉例時用得到。'],
    less:['自我介紹壓到一分鐘，直接進第 2 頁。']
  }});

/* =========================================================================
   2　今天結束時，你會有這些
   ========================================================================= */
S({ part:'開場', time:'09:02', kind:'std', title:'今天結束時，你會有這些',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">不是筆記，是四樣做好的成果</h2>
    </div>
    <div class="cards c4" data-r style="gap:18px">
      ${[['一組六張商品照','同一個商品，六種用途，風格一致',ART.icon('cam',42,C.clay),'tint'],
         ['一張修過的照片','裁切、亮度、顏色都調過，可以直接上架',ART.icon('wand',42,C.sage),'sage'],
         ['一張拍攝前檢查表','回家照著走，不會再忘記擦鏡頭',ART.icon('ok',42,C.gold),'gold'],
         ['一個屬於你的風格','四種感覺挑一種，以後拍什麼都照這個調',ART.icon('bulb',42,C.plum),'plum']]
        .map(([k,v,ic,cls])=>`
        <div class="card ${cls}" style="padding:24px 20px">
          <span class="ico">${ic}</span>
          <p class="k" style="font-size:23px">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',34,C.gold)}
      <span class="txt">做不完沒關係。<b>做完一半也是成功</b>——重點是回家知道怎麼繼續。</span></div>
  </div>`,
  notes:{
    say:['把終點講得很具體，中高齡學員才有安全感。',
         '最後一句「做完一半也是成功」一定要講，這是整天不讓人放棄的關鍵。'],
    ask:['問：你們現在拍商品最大的困擾是什麼？（多半會說「拍起來很暗」「看起來很雜」）'],
    do:[],
    diff:['學員的表情會從「又要上課」變成「原來今天有東西可以帶走」。'],
    more:['把學員說的困擾寫在白板上，下午對應到哪一段解決。'],
    less:['只講四張卡片的標題，不展開。']
  }});

/* =========================================================================
   3　今天的節奏
   ========================================================================= */
S({ part:'開場', time:'09:05', kind:'std', title:'今天的節奏',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">先拍 → 再講 → 再拍 → 比較</h2>
    </div>
    <div data-r style="display:flex;align-items:center;gap:14px">
      ${[['先拍','用你平常的方式拍一張',C.muted],
         ['再講','我只講一個技巧',C.clay],
         ['再拍','用剛學的再拍一張',C.gold],
         ['比較','兩張並排，自己看差別',C.sage]]
        .map(([k,v,c],i)=>`
        ${i?`<span style="font-size:34px;color:${C.muted};font-weight:300">→</span>`:''}
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);border-top:5px solid ${c};
             border-radius:18px;padding:22px 18px;box-shadow:0 14px 34px -20px rgba(60,40,28,.45)">
          <p style="margin:0 0 8px;font-size:27px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:21px;font-weight:650;color:${C.ink2};line-height:1.45">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('eye',34)}
      <span class="txt">我不會一次講四件事。<b class="hl">一次只改一個地方</b>，你才看得出來是哪裡變好的。</span></div>
  </div>`,
  notes:{
    say:['這一頁是整天的操作手冊，要講清楚。',
         '「一次只改一個變因」是所有比較能成立的前提，也是學員回家自己練習的方法。',
         '提醒：每一次「再拍」都不要刪掉舊的那張，兩張都要留著。'],
    ask:['問：等一下拍完，如果你看不出兩張哪裡不一樣，要怎麼辦？（答：舉手，我們一起看）'],
    do:['請學員在相簿裡開一個新相簿叫「09/13 上課」，今天拍的都丟進去。'],
    diff:['學員會開始留意「這一張跟上一張差在哪」，而不是只看好不好看。'],
    more:['示範一次相簿建立的路徑。'],
    less:['跳過建相簿，直接口頭提醒不要刪照片。']
  }});

/* =========================================================================
   4　四個觀念先講在前面
   ========================================================================= */
S({ part:'開場', time:'09:08', kind:'std', title:'四個觀念先講在前面',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">拍好一張商品照的四個前提</h2>
    </div>
    <div class="cards c2" data-r style="gap:17px">
      ${[['手機貴，不代表照片好看',
          '決定照片好不好的是光線、對焦、有沒有晃。這三件事跟你手機多少錢無關。',C.clay],
         ['商品照只要做到三件事',
          '<b>看得清楚</b>、<b>看得舒服</b>、<b>看得懂重點</b>。做到這三件就夠了，不用追求藝術感。',C.sage],
         ['先把照片拍好，再談修圖',
          '修圖救得回太暗、有點歪；救不回沒對到焦、手震糊掉。下午你會親眼看到界線在哪。',C.gold],
         ['一次只改一個地方',
          '同時改光線又換背景，你永遠不知道是哪個讓照片變好。',C.plum]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 24px;border-left:5px solid ${c}">
          <p class="k" style="font-size:25px;color:${c}">${k}</p>
          <p class="v" style="font-size:21px">${v}</p>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['第一點要講得斬釘截鐵。班上一定有人用舊手機，這句話是在告訴她「你可以」。',
         '第三點先埋下伏筆，下午 PART 11 會回來收。'],
    ask:['問：你們覺得一張商品照最重要的是什麼？（引導到「看得清楚」）'],
    do:[],
    diff:['用舊手機的學員會放鬆下來。'],
    more:['舉例：同一個場景用五年前的手機和最新的手機，光線對了差距很小。'],
    less:['只講第一點和第三點。']
  }});

/* =========================================================================
   5　攝影名詞，翻成生活話
   ========================================================================= */
S({ part:'開場', time:'09:11', kind:'std', title:'攝影名詞，翻成生活話',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">聽到這些字，心裡想的是這句話</h2>
    </div>
    <table class="tbl" data-r>
      <thead><tr><th style="width:180px">聽到這個字</th><th style="width:330px">心裡想這句話</th><th>今天你要會做的動作</th></tr></thead>
      <tbody>
        <tr><td class="lead-col">對焦</td><td><b>哪裡要清楚</b></td><td>用手指點商品，畫面出現方框就對了</td></tr>
        <tr><td class="lead-col">曝光</td><td><b>太亮還是太暗</b></td><td>點完之後按住旁邊的太陽圖示，上下移動</td></tr>
        <tr><td class="lead-col">構圖</td><td><b>商品放在哪裡比較舒服</b></td><td>打開格線，把商品放在線上或交叉點</td></tr>
        <tr><td class="lead-col">景深</td><td><b>背景是清楚還是模糊</b></td><td>離商品近一點，背景自然會糊掉</td></tr>
        <tr><td class="lead-col">白平衡</td><td><b>顏色有沒有偏黃或偏藍</b></td><td>iPhone 拍的時候調不了，<b>下午用修圖救</b></td></tr>
      </tbody>
    </table>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt">最後一列要注意：<b>iPhone 內建相機沒有白平衡功能</b>，
      只能換角度或事後修圖；Android 的專業模式才調得到。</span></div>
  </div>`,
  notes:{
    say:['逐列念過去，每一列都用「動作」收尾，不要停在名詞解釋。',
         '白平衡這一列一定要照實講。教材 P.56 明載 iOS 內建沒有白平衡功能，講錯學員回家會找不到。',
         '這一頁不用背，附錄有同樣的表。'],
    ask:['問：這五個字裡面，哪一個你以前聽過但不知道意思？'],
    do:[],
    diff:['學員不再被術語卡住，後面講對焦、曝光時能直接跟上。'],
    more:['補一個「解析度＝照片有多少格子」，接第 15 頁。'],
    less:['只講對焦與曝光兩列，其餘留給附錄。']
  }});

/* =========================================================================
   6　先用眼睛看：四張照片，感覺一樣嗎？　★ 純視覺，不給答案
   ========================================================================= */
S({ part:'開場', time:'09:13', kind:'std', title:'先看照片：這四張，感覺一樣嗎？',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:38px">同一罐果醬，四個人拍<br>
        <span class="hl">給你的感覺一樣嗎？</span></h2>
    </div>
    <div data-r style="display:flex;gap:18px;justify-content:center">
      ${F.map((f,i)=>`
        <div style="position:relative">
          ${ART.scene(Object.assign({ w:258, h:322, px:150 }, f.sim))}
          <span style="position:absolute;left:12px;top:12px;width:38px;height:38px;
                border-radius:50%;background:rgba(255,255,255,.94);color:${C.ink};
                font-size:22px;font-weight:900;display:flex;align-items:center;
                justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,.25)">
            ${'ABCD'[i]}</span>
        </div>`).join('')}
    </div>
    <p class="lead" data-r style="font-size:24px">
      先不要想技巧、不要管哪張比較好看。<br>
      <b class="hl">哪一張，最像你想給客人的感覺？</b></p>
  </div>`,
  notes:{
    say:['這一頁完全不要解釋，先讓學員用眼睛看。',
         '四張是同一罐果醬、同一個商品，差別只有拍法。這件事先不要說破，等她們自己發現。',
         '停久一點，至少三十秒，讓大家真的看進去。'],
    ask:['問：A 給你什麼感覺？（讓學員自己講詞：溫暖、乾淨、新鮮、高級⋯⋯）',
         '問：B 呢？C 呢？D 呢？（把學員說的形容詞寫在白板上）',
         '問：哪一張最像你想給客人的感覺？舉手投票。'],
    do:['四張各舉手投票一次，看班上分布。'],
    diff:['學員會發現「同一個東西，拍法不同，感覺差很多」——這是整天最重要的一次體會。'],
    more:['請投給不同選項的學員各說一句為什麼，答案會很有趣。'],
    less:['只問「哪一張最像你想給客人的感覺」一題。']
  }});

/* =========================================================================
   7　你想給人什麼感覺？　★ 全課主軸（揭曉配方）
   ========================================================================= */
S({ part:'開場', time:'09:14', kind:'std', title:'你想給人什麼感覺？',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:4px">
        剛剛那四張，差別在這裡——<span class="hl">感覺，決定怎麼拍</span></h2>
    </div>
    <div class="cards c4" data-r style="gap:15px">
      ${F.map((f,i)=>ART.feelCard(Object.assign({}, f, { name:'ABCD'[i] + '　' + f.name }), 202)).join('')}
    </div>
    <div class="callout" data-r style="padding:15px 24px">${ART.icon('bulb',32,C.gold)}
      <span class="txt">感覺定了，<b>光線、背景、角度、構圖四件事就都有答案</b>，
      不用每一項重新猜。今天每一段結束，我們都會回來對一次這張表。</span></div>
  </div>`,
  notes:{
    say:['這一頁是整天的主軸，講慢一點。',
         '四種感覺不是規則，是四條現成的路。學員只要選一條走，就不會每拍一張都在猶豫。',
         '請學員現在心裡先選一種，不用講出來，下午總實作時會再確認一次。'],
    ask:['問：你的商品，你希望客人看到照片時第一個感覺是什麼？',
         '問：手作果醬適合哪一種？（沒有標準答案，四種都可以，重點是要選一種）'],
    do:['請學員在講義上圈選一種感覺。'],
    diff:['之後每一段的頁尾呼應帶出現時，學員會開始自己對照自己圈的那一列。'],
    more:['請兩三位學員說自己選哪一種、為什麼，全班一起討論合不合適。'],
    less:['只講「先問感覺，再問怎麼拍」這句話，四張卡片快速帶過。']
  }});

/* =========================================================================
   7　【實作 0】先拍一張
   ========================================================================= */
S({ part:'開場', time:'09:17', kind:'std', title:'【實作 0】照你平常的方式，先拍一張',
  html:`
  <div class="split w-left" style="gap:44px">
    <div class="stack gap-m">
      <div>
        <p class="eyebrow" data-r>實作 0　·　五分鐘</p>
        <h2 class="h" data-r style="font-size:40px">先不要想太多<br>照你平常的方式拍一張</h2>
      </div>
      <p class="lead" data-r style="font-size:23px">
        不用擦鏡頭、不用找地方、不用調任何東西。<br>
        就像你平常拍要放到臉書那樣，拍一張就好。</p>
      <div class="callout" data-r>${ART.icon('warn',32)}
        <span class="txt"><b>這張照片千萬不要刪掉。</b>下午四點我們會把它拿出來，
        跟你最後拍的那張並排比較。</span></div>
      <div data-r style="display:flex;gap:10px;flex-wrap:wrap">
        <span class="tag">① 這張哪裡不錯？</span>
        <span class="tag">② 哪裡還可以更好？</span>
        <span class="tag on">③ 是手機的問題，還是拍法的問題？</span>
      </div>
    </div>
    <div data-r style="display:flex;justify-content:center">
      ${ART.slot({ w:330, h:400, tag:'學員自己的 Before',
        t:'學員拍的第一張', s:'不給任何提示<br>拍完留著，下午做前後對照' })}
    </div>
  </div>`,
  notes:{
    say:['這一段完全不要給提示。給了提示，下午的對照就沒有說服力了。',
         '五分鐘就好，不要拖。有人拍很久就說「就這樣，先拍一張」。',
         '拍完之後，三個問題一個一個問，讓學員自己講。'],
    ask:['問：你覺得這張哪裡不錯？',
         '問：哪裡還可以更好？',
         '問：你覺得是手機的問題，還是拍法可以調整？（多數人會說手機，這正是今天要翻轉的）'],
    do:['每人用自己的商品或現場物件，拍一張，存在「09/13 上課」相簿。'],
    diff:['多數人會拍出：光線不足、背景雜亂、商品放正中央但很小。這三個問題正好對應今天的三大段。'],
    more:['請兩位學員的照片投影出來，全班一起講哪裡可以更好。'],
    less:['縮短到三分鐘，三個問題只問第三個。']
  }});

/* =========================================================================
   8　PART 1 分隔頁
   ========================================================================= */
S({ part:'PART 1', time:'09:25–10:20', kind:'divider', title:'PART 1｜認識你的手機相機',
  html:`
  <div class="wrap">
    <p class="pno" data-r>01</p>
    <h2 data-r>認識你的<br>手機相機</h2>
    <p class="d-sub" data-r>找得到功能，後面才做得動。這一段不求快，求每個人都跟得上。</p>
  </div>
  <div class="d-art">${ART.icon('phone',130,'rgba(255,255,255,.13)')}</div>`,
  notes:{ say:['這一段是後面所有實作的地基，慢一點沒關係。'], ask:[], do:[] }});

/* =========================================================================
   9　iPhone 和 Android，差在哪裡
   ========================================================================= */
S({ part:'PART 1', time:'09:26', kind:'std', title:'iPhone 和 Android，差在哪裡',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">兩邊的核心功能，其實一樣</h2>
    </div>
    <div class="cards c2" data-r style="gap:22px">
      <div class="card" style="border-top:5px solid ${C.clean}">
        <p class="cap" style="color:${C.clean}">iPhone　·　iOS</p>
        <ul class="list">
          <li>介面各機型幾乎一致，教一次大家都通</li>
          <li>內建水平儀，拍俯拍很好用</li>
          <li><b>沒有白平衡</b>，顏色只能事後修</li>
          <li>有原況照片、方形畫面、全景</li>
        </ul>
      </div>
      <div class="card" style="border-top:5px solid ${C.fresh}">
        <p class="cap" style="color:${C.fresh}">Android　·　Samsung／OPPO／小米…</p>
        <ul class="list sage">
          <li>各廠牌介面差很多，位置要自己找</li>
          <li>多半有<b>專業模式</b>，可調白平衡、EV、ISO</li>
          <li>格線可能叫「構圖線」或「Grid」</li>
          <li>水平儀有些要另外裝 App</li>
        </ul>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.icon('ok',32,C.sage)}
      <span class="txt">「iOS 與 Android 在手機相機內建的功能中，有些微的差別，
      <b>但基本上都可以透過下載 App 補足各自缺少的功能</b>。」</span></div>
  </div>`,
  notes:{
    say:['先解決學員心裡的焦慮：「我用 Android，是不是比較差？」不是。',
         '重點放在「差別很小，而且可以補」，不要花時間比較優劣。',
         '白平衡那一點先提，第 5 頁講過，下午修圖段會再回來。'],
    ask:['問：現場用 iPhone 的舉手？用 Android 的舉手？（先知道比例，後面示範才知道要投影哪一台）'],
    do:[],
    diff:['用 Android 的學員不會覺得自己被冷落。'],
    more:['請一位 Android 學員的手機投影，讓大家看專業模式長什麼樣。'],
    less:['只講最後那句結論。']
  }});

/* =========================================================================
   10　不要背按鈕位置
   ========================================================================= */
S({ part:'PART 1', time:'09:32', kind:'std', title:'不要背按鈕位置，要知道自己在找什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">每支手機都要找得到這六個</h2>
    </div>
    <div class="cards c3" data-r style="gap:16px">
      ${[['對焦','點螢幕，出現方框',ART.icon('eye',34,C.clay)],
         ['亮度','方框旁邊的太陽',ART.icon('sun',34,C.gold)],
         ['鏡頭切換','0.5x／1x／2x',ART.icon('cam',34,C.clean)],
         ['格線','設定裡的九宮格',ART.icon('grid',34,C.sage)],
         ['照片比例','4:3／1:1／16:9',ART.icon('crop',34,C.plum)],
         ['錄影畫質','1080p／4K、fps',ART.icon('phone',34,C.ink3)]]
        .map(([k,v,ic])=>`
        <div class="card flat" style="padding:18px 20px;display:flex;gap:14px;align-items:center">
          <span style="flex:0 0 auto">${ic}</span>
          <span><p class="k" style="font-size:23px;margin:0 0 3px">${k}</p>
          <p class="v" style="font-size:20px;margin:0">${v}</p></span>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('bulb',32)}
      <span class="txt">找不到的時候，用手機<b>設定裡的搜尋</b>打關鍵字，
      例如「格線」「畫質」。這比記位置有用得多。</span></div>
  </div>`,
  notes:{
    say:['這一頁的觀念比內容重要：介面會改版，記位置沒用，要記「我在找什麼」。',
         '這句話今天會用到很多次，尤其現場有人的手機跟投影不一樣時。'],
    ask:['問：有人手機的相機介面跟我投影的長得不一樣嗎？（找一台出來當範例）'],
    do:['請學員打開自己的相機 App，試著找出這六個在哪裡，找不到的舉手。'],
    diff:['助教這時候會很忙，這是正常的，讓大家花三分鐘找。'],
    more:['示範用設定搜尋找「格線」。'],
    less:['六個只找對焦、亮度、格線三個。']
  }});

/* =========================================================================
   11　格線在哪裡開
   ========================================================================= */
S({ part:'PART 1', time:'09:38', kind:'std', title:'格線在哪裡開：iPhone／Android 對照',
  html:`
  <div class="split" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">格線不是裝飾<br>是幫你拍直、拍正</h2>
      </div>
      ${ART.steps([
        ['iPhone','設定 → 相機 → 打開「格線」。<br>同一頁還有水平儀可以一起開。'],
        ['Android','相機 App → 右上角設定 → 「格線」<br>或「構圖線」「Grid」。各廠名稱不同。']
      ])}
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('grid',30,C.gold)}
        <span class="txt">三分法又叫「九宮格構圖法」，
        <b>在手機開啟格線功能後，即可使用</b>。下午講構圖就是用這條線。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.phone(ART.camView({
        grid:true, ratio:'4:3', top:'格線已開',
        view: `<div style="position:absolute;inset:0;background:${'linear-gradient(#c9a271,#b98f5c)'}">
                 <div style="position:absolute;left:50%;top:55%;transform:translate(-50%,-50%)">
                   ${ART.jar45(120)}</div></div>`
      }), { w:238, h:474 })}
    </div>
  </div>`,
  notes:{
    say:['一次只講一個步驟，講完停下來等大家做完。',
         'Android 的學員名稱可能不一樣，請她們找「有九宮格圖示」的那一項。',
         '格線打開之後不要關掉，今天整天都會用到。'],
    ask:['問：Android 的同學，你們的選項叫什麼名字？（收集不同說法，寫在白板上）'],
    do:['所有人現在打開格線。助教走動確認每一台都開好。'],
    diff:['打開格線後，學員拍照時會自然開始留意有沒有拍歪。'],
    more:['iPhone 順便打開水平儀，示範俯拍時兩個十字對齊。'],
    less:['只講 iPhone，Android 交給助教個別協助。']
  }});

/* =========================================================================
   12　【實作】一起把格線打開
   ========================================================================= */
S({ part:'PART 1', time:'09:44', kind:'std', title:'【實作】一起把格線打開',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　五分鐘</p>
      <h2 class="h" data-r style="font-size:42px">現在打開格線，拍一張</h2>
    </div>
    <div data-r style="display:flex;gap:26px;justify-content:center;align-items:center">
      ${ART.scene({ w:300, h:225, bg:'wood', light:'flat', angle:'a45', pos:'center',
                    cap:'沒有格線：不知道有沒有歪' })}
      <span style="font-size:36px;color:${C.muted};font-weight:300">→</span>
      <div style="position:relative">
        ${ART.scene({ w:300, h:225, bg:'wood', light:'flat', angle:'a45', pos:'third',
                      cap:'有格線：商品放在線上' })}
        <div style="position:absolute;inset:0;pointer-events:none;border-radius:16px;overflow:hidden">
          <div style="position:absolute;left:33.33%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.7)"></div>
          <div style="position:absolute;left:66.66%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.7)"></div>
          <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,.7)"></div>
          <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,.7)"></div>
        </div>
      </div>
    </div>
    <p class="lead" data-r style="font-size:23px;text-align:center">
      這一步先不用管好不好看，<b>只要確認你的螢幕上真的看得到那四條線</b>。</p>
  </div>`,
  notes:{
    say:['這是今天第一個「全班一起做」的動作，節奏要抓好。',
         '確認每個人螢幕上都有線再往下，不要留人。'],
    ask:['問：看得到四條線的舉手。（沒舉手的請助教過去）'],
    do:['打開格線，隨便拍一張，確認畫面上有線。'],
    diff:['學員第一次看到畫面被分成九格，會開始意識到「商品可以不放正中間」。'],
    more:['順便講一句：線的交叉點就是等一下構圖要用的位置。'],
    less:['不拍照，只確認線有出現。']
  }});

/* =========================================================================
   13　照片比例
   ========================================================================= */
S({ part:'PART 1', time:'09:50', kind:'std', title:'照片比例：4:3、1:1、16:9 長什麼樣',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">看畫面裡留下多少東西</h2>
    </div>
    <div data-r style="display:flex;gap:22px;align-items:flex-end;justify-content:center">
      ${ART.scene({ w:300, h:225, px:140, bg:'wood', light:'side', angle:'a45', cap:'4:3　最完整' })}
      ${ART.scene({ w:225, h:225, px:140, bg:'wood', light:'side', angle:'a45', cap:'1:1　左右被切掉' })}
      ${ART.scene({ w:300, h:169, px:140, bg:'wood', light:'side', angle:'a45', cap:'16:9　上下被切掉' })}
    </div>
    <div class="callout" data-r>${ART.icon('crop',32)}
      <span class="txt">比例不是「哪個好看」，是<b>「畫面裡留下多少東西」</b>。
      留得多，之後才有得裁。</span></div>
  </div>`,
  notes:{
    say:['三張是同一個場景，只有比例不同。請學員注意 16:9 上下被切掉多少。',
         '不要講定義，直接看畫面。'],
    ask:['問：這三張，哪一張你最有可能之後想裁成正方形發 IG？（引導到 4:3 保留最多）'],
    do:['請學員在自己的相機裡找到比例切換的位置，試著切一次再切回來。'],
    diff:['學員會發現 16:9 拍起來「比較有電影感」但東西少很多。'],
    more:['講一下教材 P.58–59 用同一盆花做的對照。'],
    less:['只講 4:3 和 1:1，16:9 帶過。']
  }});

/* =========================================================================
   14　商品照為什麼先用 4:3
   ========================================================================= */
S({ part:'PART 1', time:'09:56', kind:'std', title:'商品照為什麼先用 4:3',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">先用 4:3，三個理由</h2>
    </div>
    <div class="cards c3" data-r style="gap:18px">
      ${[['1','留得最完整','手機感光元件本來就是 4:3，這是原生比例，不會浪費畫素。',C.clay],
         ['2','之後好裁','要發 IG 裁成 1:1、要發限動裁成 9:16，都還有空間。',C.sage],
         ['3','不會後悔','拍太滿事後救不回來；留白一點，永遠有退路。',C.gold]]
        .map(([n,k,v,c])=>`
        <div class="card" style="padding:24px 22px">
          <span class="num-badge" style="background:${c};margin-bottom:12px">${n}</span>
          <p class="k" style="font-size:25px">${k}</p>
          <p class="v" style="font-size:21px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt">不要一開始就把所有照片拍成 16:9。
      <b>拍得寬，不代表拍得好</b>，而且事後補不回上下被切掉的部分。</span></div>
  </div>`,
  notes:{
    say:['「留得多才有得裁」是這一頁唯一要記住的。',
         '接社群課：上一堂教過 IG 貼文是 4:5、限動是 9:16，都是從 4:3 裁出來的。'],
    ask:['問：如果你拍的時候就裁成正方形，事後想改成直式，救得回來嗎？（救不回來）'],
    do:['把相機的比例設定成 4:3，今天之後都用這個。'],
    diff:['學員之後拍照會習慣留一點空間，不再把商品塞滿畫面。'],
    more:['接社群課的尺寸速查表，講一次三個平台的常用比例。'],
    less:['只講理由 2。']
  }});

/* =========================================================================
   15　幾 MP？高畫素不等於高畫質
   ========================================================================= */
S({ part:'PART 1', time:'10:02', kind:'std', title:'幾 MP？高畫素不等於高畫質',
  html:`
  <div class="split w-right" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">畫素高，<br>照片不一定好看</h2>
      </div>
      <p class="lead" data-r style="font-size:22px">
        「有些人認為畫素愈高，呈現的畫質就會愈好，<b>其實並不一定</b>。」<br>
        決定畫質的是感光元件大小，不是數字。</p>
      <div class="callout sage" data-r style="padding:15px 22px">${ART.icon('ok',30,C.sage)}
        <span class="txt">現在的手機，<b>畫素都夠用了</b>。今天不用再想這件事。</span></div>
    </div>
    <div class="stack gap-s" data-r>
      <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em">真正決定照片好壞的四件事</p>
      ${[['光線','夠不夠、從哪裡來',C.gold],
         ['對焦','有沒有點在商品上',C.clay],
         ['手震','有沒有拿穩',C.plum],
         ['數位變焦','有沒有用手指硬放大',C.clean]]
        .map(([k,v,c])=>`
        <div style="display:flex;gap:14px;align-items:center;background:#fff;
             border:1px solid rgba(36,28,23,.12);border-left:5px solid ${c};
             border-radius:14px;padding:14px 18px">
          <span style="font-size:24px;font-weight:900;color:${c};min-width:104px">${k}</span>
          <span style="font-size:21px;font-weight:650;color:${C.ink2}">${v}</span>
        </div>`).join('')}
      <p style="margin:6px 0 0;font-size:20px;font-weight:700;color:${C.ink3}">
        這四件事，今天全部都會教。</p>
    </div>
  </div>`,
  notes:{
    say:['這一頁是在幫學員省錢：不用為了拍照換手機。',
         '右邊四件事是今天課程的預告，講完可以說「這四個等一下都會做到」。'],
    ask:['問：有人知道自己手機幾 MP 嗎？（多半不知道，這正好證明「不用管」）'],
    do:[],
    diff:['學員不再糾結手機規格，注意力回到操作。'],
    more:['教怎麼查：手機設定 → 關於本機，或搜尋官網規格。'],
    less:['整頁只講「畫素都夠用了，不用管」一句。']
  }});

/* =========================================================================
   16　錄影設定
   ========================================================================= */
S({ part:'PART 1', time:'10:08', kind:'std', title:'錄影設定：1080p 還是 4K、30 還是 60fps',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">兩個數字，看懂就好</h2>
    </div>
    <div class="cards c2" data-r style="gap:22px">
      <div class="card" style="border-top:5px solid ${C.clean}">
        <p class="cap" style="color:${C.clean}">解析度</p>
        <div class="stack gap-s">
          <div class="yes"><i>●</i><span><b>1080p</b>　發社群完全夠用，檔案小、上傳快</span></div>
          <div class="no"><i>●</i><span><b>4K</b>　細節多，但檔案大、手機容易滿</span></div>
        </div>
      </div>
      <div class="card" style="border-top:5px solid ${C.gold}">
        <p class="cap" style="color:${C.gold}">每秒格數 fps</p>
        <div class="stack gap-s">
          <div class="yes"><i>●</i><span><b>30fps</b>　一般日常影片</span></div>
          <div class="no"><i>●</i><span><b>60fps</b>　動作順，適合<b>倒果醬、撒糖粉、切蛋糕</b>這種畫面</span></div>
        </div>
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('bulb',32)}
      <span class="txt">初學者就設 <b>1080p / 30fps</b>。
      要拍製作過程的動作畫面，再改成 <b>1080p / 60fps</b>。</span></div>
  </div>`,
  notes:{
    say:['不要深入講 Codec、Bitrate、Log 這些，今天用不到。',
         '60fps 的例子要具體：倒果醬、撒粉、切蛋糕，學員才知道什麼時候要用。'],
    ask:['問：你們拍過製作過程的影片嗎？'],
    do:['在相機設定裡把錄影設成 1080p / 30fps。'],
    diff:['之後拍幕後影片時不會因為 4K 把手機空間塞爆。'],
    more:['講慢動作與縮時攝影各適合什麼（教材 P.55）。'],
    less:['整頁只留最後那句結論。']
  }});

/* =========================================================================
   17　你的預設值就設這個
   ========================================================================= */
S({ part:'PART 1', time:'10:14', kind:'std', title:'你的預設值就設這個',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:40px">設好這五項，今天之後都不用再改</h2>
    </div>
    <div class="checks c2" data-r style="grid-template-columns:repeat(2,1fr);gap:14px 30px;max-width:840px">
      ${[['格線','打開'],['照片比例','4:3'],['錄影','1080p / 30fps'],
         ['閃光燈','關閉'],['上傳畫質','最高（社群 App 裡設定）']]
        .map(([k,v])=>`
        <div class="check done" style="justify-content:flex-start">
          <span class="box"></span>
          <span style="font-size:23px;font-weight:750;color:${C.ink2}">
            ${k}　<b style="color:${C.clay}">${v}</b></span>
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="max-width:840px">${ART.icon('ok',32,C.sage)}
      <span class="txt">這五項是一次性的設定。<b>設完就忘掉它</b>，
      接下來整天我們只練「怎麼拍」。</span></div>
  </div>`,
  notes:{
    say:['這是 PART 1 的收攏頁，五項一起確認一次。',
         '閃光燈關閉這一項，等一下 PART 3 會解釋為什麼。',
         '最後那句「設完就忘掉它」很重要，讓學員知道設定階段結束了。'],
    ask:['問：五項都設好的舉手。（沒舉手的請助教處理，不要拖全班）'],
    do:['五項逐一確認，助教走動檢查。'],
    diff:['接下來所有實作的起點都一致，比較才有意義。'],
    more:['順便把上傳畫質也一起設好（FB 設定 → 媒體；IG 設定和隱私 → 媒體品質）。'],
    less:['只確認格線、比例、閃光燈三項。']
  }});
