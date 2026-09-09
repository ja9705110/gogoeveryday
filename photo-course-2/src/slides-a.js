/* =========================================================================
   slides-a.js — PART 0 開場 ～ PART 5 故事感
   第 1–44 頁
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

/* =========================================================================
   PART 0　開場（1–5）
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
         '這堂課的主軸是攝影，剪輯只佔最後 40 分鐘——這件事現在就要講清楚，學員才知道重點在哪。'],
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
      素材拍得好，剪輯只要四十分鐘就夠。</span></div>
  </div>`,
  notes:{
    say:['四樣成果講具體，學員才有安全感。',
         '最後那句要講：素材好，剪輯就快。這是今天時間分配的理由。'],
    ask:['問：你們拍過影片嗎？最後有剪出來嗎？（多數人拍了一堆沒剪）'],
    do:[],
    diff:['學員理解為什麼上午都在「想」。'],
    more:['問拍了沒剪的原因，多半是「素材亂七八糟不知道從何剪起」。'],
    less:['只講四張卡片標題。']
  }});

S({ part:'開場', time:'09:05', kind:'std', title:'今天的節奏',
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
    <div class="callout" data-r>${ART.icon('warn',34)}
      <span class="txt">最常見的失敗：<b class="hl">跳過前面三步，直接拿手機開始拍</b>。
      拍了一堆素材，回來發現剪不出一支完整的影片。</span></div>
  </div>`,
  notes:{
    say:['五步照順序講，每一步都對應今天的一個時段。',
         '「跳過前三步直接拍」是幾乎所有人的習慣，要點破。'],
    ask:['問：你以前拍影片，是先想好還是先拍再說？'],
    do:[],
    diff:['學員接受上午不碰相機這件事。'],
    more:[], less:['直接進下一頁。']
  }});

S({ part:'開場', time:'09:08', kind:'std', title:'四個核心觀念',
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
         '第四句是整天的順序，下午拍攝時會一直回來提醒。'],
    ask:['問：你看過的短影音裡，哪一種會讓你停下來看完？'],
    do:[],
    diff:['學員開始意識到影片和照片不一樣：影片要有「事情在發生」。'],
    more:['舉例：一支只有商品轉圈的影片 vs 一支手在包裝的影片。'],
    less:['只講第一句和第四句。']
  }});

S({ part:'開場', time:'09:12', kind:'std', title:'上午想清楚，下午才拍得順',
  html:`
  <div class="split" style="gap:38px">
    <div class="card" data-r style="padding:26px 28px;border-top:6px solid ${C.gold}">
      <p class="cap" style="color:${C.gold};font-size:21px">上午　全部在「想」</p>
      <ul class="list">
        <li>這支影片要拍什麼</li>
        <li>開始、過程、完成怎麼分</li>
        <li>遠、中、近、特寫各拍什麼</li>
        <li>分鏡表與素材清單</li>
        <li>怎麼拍出故事感</li>
      </ul>
      <div class="rule"></div>
      <p class="v" style="font-size:20px"><b>上午不碰相機。</b></p>
    </div>
    <div class="card" data-r style="padding:26px 28px;border-top:6px solid ${C.clay}">
      <p class="cap" style="color:${C.clay};font-size:21px">下午　全部在「做」</p>
      <ul class="list">
        <li>錄影長度與三種運鏡</li>
        <li><b>正式拍攝（今天最長的一段）</b></li>
        <li>InShot 剪輯九個步驟</li>
        <li>輸出、成果放映、檢視</li>
      </ul>
      <div class="rule"></div>
      <p class="v" style="font-size:20px"><b>下午幾乎不聽課。</b></p>
    </div>
  </div>`,
  notes:{
    say:['這一頁是在跟學員談條件：上午請忍耐，下午都是你的。',
         '中高齡學員坐一上午聽課會累，先講明白換來的是什麼，接受度會高很多。',
         '強調下午的拍攝是今天最長的一段。'],
    ask:['問：可以接受上午先不拿相機嗎？'],
    do:[],
    diff:['上午的秩序會好很多。'],
    more:[], less:['一句話帶過。']
  }});

/* =========================================================================
   PART 1　這支影片要拍什麼（6–14）
   ========================================================================= */
S({ part:'PART 1', time:'09:15', kind:'divider', title:'PART 1｜這支影片要拍什麼',
  html: divider('01','這支影片<br>要拍什麼',
    '先決定主題，再決定怎麼拍。<br>主題不清楚，後面每一步都會卡。',
    ART.icon('bulb',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段是整天的地基，不要急著往下。'], ask:[], do:[] }});

S({ part:'PART 1', time:'09:16', kind:'std', title:'十一種短影音主題',
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

S({ part:'PART 1', time:'09:19', kind:'std', title:'這十一種不是選一種，是十一個系列',
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

S({ part:'PART 1', time:'09:22', kind:'std', title:'你的商品適合哪一種',
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

S({ part:'PART 1', time:'09:26', kind:'std', title:'一支影片，只講一件事',
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

S({ part:'PART 1', time:'09:29', kind:'std', title:'講太多的下場',
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

S({ part:'PART 1', time:'09:32', kind:'std', title:'【實作】填兩句話',
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

S({ part:'PART 1', time:'09:36', kind:'std', title:'兩句話寫不出來，代表還沒想清楚',
  html:`
  <div class="stack gap-m">
    <div><h2 class="h" data-r style="font-size:36px">卡住的三種情況，這樣處理</h2></div>
    <div class="stack gap-s" data-r>
      ${[['想不到要拍什麼','回去看第 9 頁的商品類型對照，選粗體那一種。<br>真的沒想法就拍「製作過程」——最不會失敗。',C.clay],
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

S({ part:'PART 1', time:'09:39', kind:'std', title:'清楚的一句話 vs 模糊的一句話',
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

/* =========================================================================
   PART 2　三段式腳本（15–21）
   ========================================================================= */
S({ part:'PART 2', time:'09:45', kind:'divider', title:'PART 2｜三段式腳本',
  html: divider('02','三段式腳本',
    '不用學正式劇本格式。<br>只要三段：開始、過程、完成。',
    ART.icon('note',130,'rgba(255,255,255,.13)')),
  notes:{ say:['強調：這不是編劇課，三段就夠。'], ask:[], do:[] }});

S({ part:'PART 2', time:'09:46', kind:'std', title:'開始 → 過程 → 完成',
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

S({ part:'PART 2', time:'09:50', kind:'std', title:'範例一：商品介紹的三段',
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

S({ part:'PART 2', time:'09:54', kind:'std', title:'範例二：試吃心得的三段',
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

S({ part:'PART 2', time:'09:58', kind:'std', title:'範例三：製作過程的三段',
  html: threeAct('製作過程：原料 → 製作 → 成品',
    [['開始','桌上攤開的原料','全景','3 秒'],
     ['過程','切、攪、下鍋、裝瓶（多個短鏡頭）','近景＋特寫','15 秒'],
     ['完成','完成的商品，貼上標籤','近景','4 秒']],
    '總長約 <b>22 秒</b>。過程那一段可以拆成<b>四五個 3 秒的小鏡頭</b>，節奏才會好。'),
  notes:{
    say:['製作過程是最推薦的類型，也是今天多數人會拍的。',
         '「過程拆成四五個小鏡頭」是這一頁的重點，接下午的錄影長度那一段。'],
    ask:['問：你的商品，製作過程有哪幾個步驟？'],
    do:[], diff:['學員理解一段過程可以拆成很多鏡頭。'],
    more:['請學員口頭說出自己的四五個步驟。'],
    less:['只講「原料→製作→成品」六個字。']
  }});

S({ part:'PART 2', time:'10:02', kind:'std', title:'【實作】寫出你的三段',
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

S({ part:'PART 2', time:'10:06', kind:'std', title:'檢查：每一段能不能用一句話說完',
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

/* =========================================================================
   PART 3　遠、中、近、特寫（22–30）
   ========================================================================= */
S({ part:'PART 3', time:'10:20', kind:'divider', title:'PART 3｜遠、中、近、特寫',
  html: divider('03','遠、中、近<br>特寫',
    '同一件事情，多拍幾種距離，影片才有變化。<br>這是短影音和照片最大的不同。',
    ART.icon('cam',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段是攝影的核心，時間給足。'], ask:[], do:[] }});

S({ part:'PART 3', time:'10:21', kind:'std', title:'同一件事，四種距離',
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

S({ part:'PART 3', time:'10:25', kind:'std', title:'全景：看整體',
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

S({ part:'PART 3', time:'10:29', kind:'std', title:'中景：商品＋手',
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

S({ part:'PART 3', time:'10:33', kind:'std', title:'近景：商品是主角',
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

S({ part:'PART 3', time:'10:37', kind:'std', title:'特寫：只看一個細節',
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

S({ part:'PART 3', time:'10:41', kind:'std', title:'四種距離分別回答什麼問題',
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

S({ part:'PART 3', time:'10:45', kind:'std', title:'同一個動作，四種畫面',
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

S({ part:'PART 3', time:'10:48', kind:'std', title:'【實作】同一個動作拍四種距離',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　六分鐘　·　今天第一次拿相機</p>
      <h2 class="h" data-r style="font-size:38px">挑一個動作，拍四張照片就好</h2>
    </div>
    <div data-r style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;max-width:1000px">
      <span class="tag">① 全景</span><span class="tag">② 中景</span>
      <span class="tag">③ 近景</span><span class="tag on">④ 特寫</span>
      <span class="tag g">拍照就好，先不要錄影</span>
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:1000px">
      這一次<b>只拍照片</b>，練習距離的感覺。<br>
      四張排在一起看：<b class="hl">如果四張長得很像，代表距離沒有真的變。</b></p>
  </div>`,
  notes:{
    say:['刻意只拍照不錄影，因為現在練的是「距離」不是「錄影」。',
         '拍完一定要四張排一起看，這是判斷有沒有做到的唯一方法。',
         '常見錯誤：四張距離差太少，看起來像同一張。'],
    ask:['問：四張排一起，看得出距離不同嗎？'],
    do:['挑一個動作，四種距離各拍一張照片。'],
    diff:['學員會發現自己以為變了距離，其實只差一點點。'],
    more:['請差異最明顯的一位投影出來。'],
    less:['只拍中景和特寫兩張。']
  }});

/* =========================================================================
   PART 4　分鏡與素材清單（31–38）
   ========================================================================= */
S({ part:'PART 4', time:'10:50', kind:'divider', title:'PART 4｜分鏡與素材清單',
  html: divider('04','分鏡與<br>素材清單',
    '拍之前就決定要拍哪些畫面。<br>這是今天最重要的一張表。',
    ART.icon('grid',130,'rgba(255,255,255,.13)')),
  notes:{ say:['分鏡表是今天的核心產出，下午拍攝完全照它走。'], ask:[], do:[] }});

S({ part:'PART 4', time:'10:51', kind:'std', title:'不要先拍一堆，再回來想怎麼剪',
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

S({ part:'PART 4', time:'10:55', kind:'std', title:'分鏡表長這樣',
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

S({ part:'PART 4', time:'10:59', kind:'std', title:'完整範例：手工果醬六個鏡頭',
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

S({ part:'PART 4', time:'11:03', kind:'std', title:'秒數怎麼抓',
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

S({ part:'PART 4', time:'11:07', kind:'std', title:'素材清單：拍之前先列',
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

S({ part:'PART 4', time:'11:11', kind:'std', title:'【實作】完成 5–8 個分鏡',
  html:`
  <div class="stack gap-s pad-tight center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　十二分鐘　·　今天最重要的一張表</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:4px">把你的三段，拆成 5–8 個鏡頭</h2>
    </div>
    <div data-r style="width:100%;max-width:1020px;margin:0 auto">
      ${ART.boardBlank(7)}
    </div>
    <div class="callout gold" data-r style="max-width:1020px;padding:13px 22px">${ART.icon('bulb',28,C.gold)}
      <span class="txt">卡住的話回頭看第 34 頁的果醬範例，<b>照它的格式換成你的商品</b>。</span></div>
  </div>`,
  notes:{
    say:['十二分鐘，這是上午最長的一次實作，走動協助每一個人。',
         '檢查三件事：有沒有五個以上、四種距離有沒有都出現、過程段是不是最多。',
         '寫不出來的，直接把果醬範例的六個鏡頭換成她的商品。'],
    ask:['問：你的分鏡表裡，特寫有幾個？（至少要一個）'],
    do:['完成 5–8 個鏡頭的分鏡表。'],
    diff:['每個人手上都有一張下午可以照著拍的表。'],
    more:['請兩位投影自己的分鏡表，全班一起看。'],
    less:['降到 5 個鏡頭就好。']
  }});

S({ part:'PART 4', time:'11:19', kind:'std', title:'【實作】完成素材清單',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　六分鐘</p>
      <h2 class="h" data-r style="font-size:38px">下午要用到的東西，全部列出來</h2>
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
         '午休前提醒：下午要用的東西，午休時先擺好。'],
    ask:['問：你的清單裡，哪一項是不可逆的？'],
    do:['完成素材清單，並在不可逆的項目前面畫星號。'],
    diff:['下午拍攝時不會發生「東西用掉了才想到沒拍」。'],
    more:[], less:['口頭提醒，不寫清單。']
  }});

/* =========================================================================
   PART 5　故事感（39–44）
   ========================================================================= */
S({ part:'PART 5', time:'11:25', kind:'divider', title:'PART 5｜故事感',
  html: divider('05','故事感',
    '商品影片不要只有商品轉一圈。<br>有人、有手、有過程，才有人看得下去。',
    ART.icon('hand',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段是上午最後一段，也是最能提升成品質感的一段。'], ask:[], do:[] }});

S({ part:'PART 5', time:'11:26', kind:'std', title:'不要只拍結果，也要拍過程',
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

S({ part:'PART 5', time:'11:30', kind:'std', title:'餅乾的五個鏡頭',
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

S({ part:'PART 5', time:'11:34', kind:'std', title:'飾品的五個鏡頭',
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

S({ part:'PART 5', time:'11:38', kind:'std', title:'故事感來自哪裡',
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

S({ part:'PART 5', time:'11:42', kind:'std', title:'你的商品，過程在哪裡？',
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
      <span class="txt">午休前把分鏡表補好。<b>下午就照這張表拍，不再改。</b></span></div>
  </div>`,
  notes:{
    say:['這是上午的收尾，讓學員自己檢查分鏡表。',
         '「下午就照這張表拍，不再改」要明確講，不然下午會有人一直改。',
         '午休前提醒：要用的東西午休時先擺好。'],
    ask:['問：過程有幾個鏡頭？0–1 個的舉手？（這些人要優先協助）'],
    do:['補完分鏡表，午休時擺好道具。'],
    diff:['下午拍攝可以直接開始，不用再花時間規劃。'],
    more:[], less:['口頭提醒即可。']
  }});
