/* =========================================================================
   slides-a.js — 封面 ~ PART 5（Slide 1–34）
   每一則：{ part, time, kind, title, html, notes:{say,ask,do}, tag }
   ========================================================================= */
const DECK = [];
const S = o => DECK.push(o);

/* ---------- 共用小元件 ---------- */
const dividerArt = a => `<div class="d-art">${a}</div>`;
const platPill = (k) => ({
  fb:`<span class="pill fb">${ART.fbIcon(20)} Facebook</span>`,
  ig:`<span class="pill ig">${ART.igIcon(20)} Instagram</span>`,
  ln:`<span class="pill ln">${ART.lnIcon(20)} LINE 官方帳號</span>`
}[k]);

/* =========================================================================
   00 封面
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'cover', title:'封面：社群平台操作入門',
  html:`
  <div class="cover-wrap">
    <div class="cover-l">
      <span class="kicker" data-r>西屯婦女培力 · 一日課程</span>
      <h1 data-r>社群平台<br>操作入門</h1>
      <p class="cs" data-r>不用當網紅，<br>也能讓別人看見你的作品。</p>
      <div class="meta" data-r>
        <span class="pill">08/16（六）09:00–16:00</span>
        <span class="pill">實際授課 6 小時</span>
      </div>
    </div>
    <div class="cover-r">
      <div class="anchor" data-r>
        ${igProfile({bio:'手工果醬 · 小批製作<br>用當季水果，一次煮一鍋',grid:['jam','cookie','cake','ear','stall','gift','kim','cake','yoga']})}
        <div style="position:absolute;left:-72px;top:64px">${ART.fbIcon(56)}</div>
        <div style="position:absolute;left:-92px;top:224px">${ART.igIcon(56)}</div>
        <div style="position:absolute;left:-66px;top:384px">${ART.lnIcon(56)}</div>
        <div style="position:absolute;right:-46px;top:150px">${ART.heart(54,C.clay)}</div>
        <div style="position:absolute;right:-30px;bottom:96px">${ART.chat(48,C.sage)}</div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['開場先自我介紹，並說明「這堂課不是要把大家變成網紅」，而是讓每個人手上的東西——手作、烘焙、農產、課程、服務——有辦法被別人看見。',
         '請大家把手機拿出來放桌上，今天會一直用到；如果沒有安裝 FB／IG，先協助安裝或兩人一組共用一支。'],
    ask:['請大家用一句話介紹「我做的東西」或「我想做的東西」，一人 30 秒。'],
    do:['確認每位學員的手機可以上網、能登入 Facebook 或 Instagram。']
  }});

/* =========================================================================
   00-2 今日課表
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'std', title:'今天的流程',
  html:`
  <div class="stack gap-m pad-tight">
    <div class="row" style="align-items:flex-end;gap:32px">
      <div style="flex:1">
        <p class="eyebrow" data-r>TODAY&nbsp;09:00–16:00</p>
        <h2 class="h" data-r style="font-size:38px;margin-bottom:6px">今天會走過的路</h2>
        <p class="lead" data-r style="margin:0">
          上午把<span class="mark">觀念與平台</span>搞清楚，下午全部都是<span class="mark">動手做</span>。</p>
      </div>
      <div data-r style="display:flex;gap:12px;flex:none">
        ${platPill('fb')}${platPill('ig')}${platPill('ln')}
      </div>
    </div>
    <div>
      <div class="agenda" data-r>
        <div class="ag"><span class="t">09:00–09:30</span><span class="n">社群不是只有發文：先搞懂經營邏輯</span></div>
        <div class="ag"><span class="t">09:30–10:10</span><span class="n">FB、IG、LINE 官方帳號怎麼選</span></div>
        <div class="ag rest"><span class="t">10:10–10:20</span><span class="n">休息</span></div>
        <div class="ag"><span class="t">10:20–11:05</span><span class="n">Facebook 粉絲專頁操作</span></div>
        <div class="ag"><span class="t">11:05–12:00</span><span class="n">Instagram 操作＋品牌案例觀察</span></div>
        <div class="ag rest"><span class="t">12:00–13:00</span><span class="n">午休</span></div>
        <div class="ag"><span class="t">13:00–13:45</span><span class="n">不同平台怎麼發：字數與圖文</span></div>
        <div class="ag"><span class="t">13:45–14:25</span><span class="n">Hashtag、搜尋與十大關鍵字</span></div>
        <div class="ag rest"><span class="t">14:25–14:35</span><span class="n">休息</span></div>
        <div class="ag"><span class="t">14:35–15:05</span><span class="n">Reels、限時動態與內容形式</span></div>
        <div class="ag"><span class="t">15:05–15:35</span><span class="n">LINE 官方帳號與顧客承接</span></div>
        <div class="ag"><span class="t">15:35–16:00</span><span class="n">免費曝光＋綜合實作</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['先讓學員知道整天的節奏，降低焦慮：上午聽觀念、下午做東西，中間有三次休息。',
         '特別強調 15:35 之後是「把今天學的做出一篇真的內容」，請大家上午就開始想自己要發什麼。'],
    ask:['問：今天結束時，你最想解決哪一件事？（舉手統計，寫在白板上，最後一節回來對照）'],
    do:['發下四張講義，請先寫講義 1 上半部「我的商品／技能」。']
  }});

/* =========================================================================
   PART 1
   ========================================================================= */
S({ part:'PART 1', time:'09:00–09:30', kind:'divider', title:'PART 1｜社群到底在經營什麼？',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>09:00 – 09:30 ｜ PART 1</span>
    <p class="pno" data-r>01</p>
    <h2 data-r>社群到底在經營什麼？</h2>
    <p class="d-sub" data-r>先把「為什麼要發」想清楚，後面所有按鈕才會有意義。</p>
  </div>
  ${dividerArt(ART.plaza(400))}`,
  notes:{ say:['這一段完全不碰按鈕，只談觀念。讓學員先安心：不會馬上考操作。'], ask:[], do:[] }});

S({ part:'PART 1', time:'09:00', kind:'std', title:'Slide 2｜今天只解決三件事',
  html:`
  <div class="stack gap-l">
    <div>
      <p class="eyebrow" data-r>今天不是教你當網紅</p>
      <h2 class="h" data-r style="margin-bottom:34px">今天我們只解決三件事。</h2>
    </div>
    <div class="cards c3" data-r>
      <div class="card top-accent">
        <span class="num-badge" style="margin-bottom:16px">1</span>
        <p class="k">我要去哪裡發？</p>
        <p class="v">Facebook、Instagram、LINE 官方帳號，<br>哪一個適合我？</p>
      </div>
      <div class="card top-accent a-sage">
        <span class="num-badge" style="background:${C.sage};margin-bottom:16px">2</span>
        <p class="k">我要怎麼發？</p>
        <p class="v">字要寫多少、照片怎麼配、<br>三個平台差在哪？</p>
      </div>
      <div class="card top-accent a-gold">
        <span class="num-badge" style="background:${C.gold};margin-bottom:16px">3</span>
        <p class="k">發了怎麼讓人看到？</p>
        <p class="v">Hashtag、Reels、限時動態，<br>還有不用花錢的曝光方式。</p>
      </div>
    </div>
    <div class="callout" data-r style="margin-top:6px">
      ${ART.bulb(38)}
      <span class="txt">不用學會全部功能。<b class="hl">會用得到的那幾個</b>，就足以開始。</span>
    </div>
  </div>`,
  notes:{
    say:['把整天的內容收斂成三個問題，讓學員知道「今天不會學到爆炸」。',
         '強調：社群平台的按鈕每年都在改，但這三個問題永遠不會變。'],
    ask:['問：這三件事裡，哪一件是你現在最卡住的？（舉手，快速掃過現場狀況）'],
    do:[]
  }, tag:{type:'ask', label:'舉手調查'}});

S({ part:'PART 1', time:'09:05', kind:'std', title:'Slide 3｜大家是不是都有這些困擾',
  html:`
  <div class="split" style="grid-template-columns:1.32fr .68fr;gap:40px">
    <div class="col">
      <p class="eyebrow" data-r>課前需求調查 · 有效樣本 30 人</p>
      <h2 class="h" data-r style="font-size:40px;margin-bottom:24px">這些困擾，<br>是不是你也有？</h2>
      <div class="stack gap-s">
        ${[
          ['不懂如何進行社群經營',24,'80.0',true],
          ['不會拍攝商品照片與影音',22,'73.3',false],
          ['不知道該怎麼賣、怎麼行銷',22,'73.3',false],
          ['不會寫介紹文案與內容',18,'60.0',false],
          ['不會使用 AI 工具',16,'53.3',false],
          ['完全不知道怎麼開始',14,'46.7',false]
        ].map(([t,n,p,hot])=>`
        <div data-r style="display:flex;align-items:center;gap:14px">
          <span style="font-size:21px;font-weight:${hot?850:700};
            color:${hot?C.clay:C.ink2};width:252px;flex:none">${t}</span>
          <span style="flex:1;height:14px;border-radius:99px;background:${C.paper3};overflow:hidden">
            <span style="display:block;height:100%;width:${p}%;border-radius:99px;
              background:${hot?`linear-gradient(90deg,${C.gold},${C.clay})`:C.sage}"></span></span>
          <span style="font-size:20px;font-weight:850;color:${hot?C.clay:C.ink3};
            width:152px;text-align:right;white-space:nowrap;
            font-variant-numeric:tabular-nums">${n} 人｜${p}%</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${ART.people(190)}
      <div class="card" style="max-width:330px;border-radius:20px 20px 20px 6px">
        <p class="v" style="font-weight:700">
          「把手作品分享出去、<br>增加一份收入。」</p>
      </div>
      <p class="cap-t">學員原話</p>
      <div class="callout" style="margin-top:18px;max-width:330px;padding:18px 22px;text-align:left">
        <span class="txt">排第一名的困難，<br><b class="hl">就是今天這堂課</b>。</span>
      </div>
    </div>
  </div>`,
  notes:{
    say:['這是本班 30 人的真實課前調查，不是示意數據。念出第一名「不懂如何進行社群經營 24 人、80%」，讓學員知道大家都一樣。',
         '第 2、4、5 名（拍照、文案、AI）是後面幾堂課的內容，這裡先預告，讓學員安心：不是今天學不完，是本來就分開教。',
         '今天要解決的就是第一名那一項。'],
    ask:['問：這六項裡，你自己勾了哪幾個？（舉手統計，跟調查結果對照）',
         '問：還有沒有沒被列到的困擾？（記在白板，最後一節回來確認有沒有解決）'],
    do:[]
  }, tag:{type:'ask', label:'舉手對照'}});

S({ part:'PART 1', time:'09:10', kind:'std', title:'Slide 4｜社群不是「一直賣東西」',
  html:`
  <div class="stack gap-m">
    <p class="eyebrow" data-r>最常見的錯誤</p>
    <div class="split" data-r style="gap:44px;align-items:stretch">
      <div class="card" style="background:${C.paper2};box-shadow:none;border-color:transparent">
        <p class="cap" style="color:${C.clay}">✕ 常見的做法</p>
        <div class="stack gap-s" style="margin-top:4px">
          ${['今天','明天','後天'].map((d,i)=>`
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:13px;font-weight:850;color:${C.muted};width:38px">${d}</span>
            <span style="flex:1;background:#fff;border:1px solid ${C.line||'rgba(36,28,23,.12)'};
              border-radius:12px;padding:11px 15px;font-size:15.5px;font-weight:700;color:${C.ink2};
              opacity:${1-i*0.22}">有商品，歡迎購買！</span>
          </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:center;margin:18px 0 4px">${ART.megaphone(66,C.clay)}</div>
        <p class="v" style="text-align:center;font-weight:750">只有你在說話，<br>沒有人想回應。</p>
      </div>
      <div class="card tint">
        <p class="cap" style="color:${C.sage}">✓ 正確的觀念</p>
        <div class="stack gap-s" style="margin-top:4px">
          ${[['今天','今年的草莓終於進來了 🍓'],
             ['明天','煮果醬時廚房的樣子'],
             ['後天','客人回購的一句話']].map(([d,t])=>`
          <div style="display:flex;gap:12px;align-items:center">
            <span style="font-size:13px;font-weight:850;color:${C.muted};width:38px">${d}</span>
            <span style="flex:1;background:#fff;border-radius:12px;padding:11px 15px;
              font-size:15.5px;font-weight:700;color:${C.ink2}">${t}</span>
          </div>`).join('')}
        </div>
        <div style="display:flex;justify-content:center;margin:18px 0 4px">${ART.chat(66,C.sage)}</div>
        <p class="v" style="text-align:center;font-weight:750">先讓別人願意看你，<br>再談購買。</p>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.heart(34,C.sage)}
      <span class="txt">沒有人喜歡天天被推銷，<br>但大家都喜歡看「有人正在認真做一件事」。</span></div>
  </div>`,
  notes:{
    say:['這頁是整天觀念的核心之一。左邊是大部分人的直覺做法，右邊才是有效的做法。',
         '重點不是「不能賣」，而是「不能每篇都在賣」。比例大約是：四篇裡一篇賣東西。'],
    ask:['問：如果你是客人，左邊那種帳號你會追蹤嗎？為什麼？'],
    do:[]
  }});

S({ part:'PART 1', time:'09:15', kind:'std', title:'Slide 5｜社群經營的基本流程',
  html:`
  <div class="split w-right">
    <div class="col">
      <p class="eyebrow" data-r>整天的主軸</p>
      <h2 class="h" data-r style="font-size:40px">一個陌生人，<br>怎麼變成你的客人？</h2>
      <p class="lead" data-r style="margin-top:18px">
        中間每一層都會流失一些人，<br>這很正常。<br><br>
        我們要做的不是<span class="mark">逼人買</span>，<br>
        而是讓願意留下的人<span class="mark">走得下去</span>。</p>
      <div style="display:flex;gap:14px;margin-top:26px" data-r>
        <span class="pill fb">FB · IG 負責前面三層</span>
      </div>
      <div style="display:flex;gap:14px;margin-top:10px" data-r>
        <span class="pill ln">LINE 負責後面三層</span>
      </div>
    </div>
    <div class="col">
      <div class="funnel" data-r>
        ${[['被看見',100,C.gold],['被認識',88,'#d78f4d'],['被喜歡',77,'#cd7a46'],
           ['被信任',66,C.clay],['詢問',55,'#b05231'],['購買',45,C.clay2],
           ['回購 · 推薦',36,C.plum]].map(([t,w,c])=>
          `<div class="f" style="width:${w}%;background:${c}">${t}</div>`).join('')}
      </div>
      <p class="cap-t">被看見 → 被認識 → 被喜歡 → 被信任 → 詢問 → 購買</p>
    </div>
  </div>`,
  notes:{
    say:['這個漏斗是今天所有內容的骨架，後面每一段都會回來對照：現在我們在講哪一層。',
         '提醒學員：很多人只做最上面一層（一直發文求曝光），或只做最下面一層（一直叫人買），中間沒有東西。'],
    ask:['問：你覺得自己現在卡在哪一層？'],
    do:[]
  }});

S({ part:'PART 1', time:'09:20', kind:'std', title:'Slide 6｜引流不是終點',
  html:`
  <div class="stack gap-l">
    <div class="center" style="text-align:center">
      <p class="eyebrow" data-r style="justify-content:center">換個方式想</p>
      <p class="mega sm" data-r>引流，只是把人帶到門口。</p>
    </div>
    <div class="split" data-r style="align-items:center;gap:56px">
      <div class="center">${ART.stall(330)}
        <p class="cap-t">一家店，每天很多人經過</p></div>
      <div class="stack gap-s">
        <p class="sub" data-r style="font-weight:750;color:${C.ink};font-size:21px;margin-bottom:6px">但是……</p>
        ${['東西看不懂','內容很亂','不知道在賣什麼','找不到聯絡方式']
          .map(t=>`<div class="no" data-r><i>✕</i><span>${t}</span></div>`).join('')}
        <div class="callout" data-r style="margin-top:14px;padding:16px 22px">
          <span class="txt" style="font-size:22px;font-weight:850">會買嗎？</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['用「開店」的比喻，把抽象的社群變成生活經驗。中高齡學員對實體店的經驗遠比對演算法熟。',
         '結論：把人帶來只是第一步，人來了之後看到什麼，才決定會不會買。'],
    ask:['問：大家逛市集的時候，什麼樣的攤位你會停下來？什麼樣的會直接走過？'],
    do:[]
  }, tag:{type:'ask', label:'生活經驗連結'}});

S({ part:'PART 1', time:'09:25', kind:'std', title:'Slide 7｜今天的第一句話',
  html:`
  <div class="center stack gap-l" style="text-align:center">
    <p class="eyebrow" data-r style="justify-content:center">請記住這句話</p>
    <div class="cards c3" data-r style="width:100%;gap:26px">
      ${[[ART.eye(76,C.gold),'引流','讓人<b>看見</b>你',C.gold,C.goldSoft],
         [ART.heart(76,C.clay),'好的內容','讓人<b>喜歡</b>你',C.clay,C.clayTint],
         [ART.hands(76,C.sage),'持續互動','讓人<b>信任</b>你',C.sage,C.sageSoft]]
        .map(([ic,k,v,c,bg])=>`
        <div class="card" style="background:${bg};border-color:transparent;box-shadow:none;text-align:center;padding:34px 22px">
          <div style="display:flex;justify-content:center;margin-bottom:16px">${ic}</div>
          <p class="cap" style="color:${c};margin-bottom:8px">${k}</p>
          <p style="font-size:25px;font-weight:800;color:${C.ink};margin:0;line-height:1.4">${v}</p>
        </div>`).join('')}
    </div>
    <p class="lead" data-r style="max-width:760px">
      今天所有的操作、字數、Hashtag、Reels，<br>都只是為了完成上面這三件事。</p>
  </div>`,
  notes:{
    say:['請全班一起念一次這三句話。這是整天最重要的一句，最後一節還會回來。',
         '把這句寫在白板上，整天留著。'],
    ask:[],
    do:['請學員把這句話抄在講義的空白處。']
  }});

/* =========================================================================
   PART 2
   ========================================================================= */
S({ part:'PART 2', time:'09:30–10:10', kind:'divider', title:'PART 2｜FB、IG、LINE 到底差在哪？',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>09:30 – 10:10 ｜ PART 2</span>
    <p class="pno" data-r>02</p>
    <h2 data-r>FB、IG、LINE<br>到底差在哪？</h2>
    <p class="d-sub" data-r>不是三個都要做。先知道它們各自負責什麼工作。</p>
  </div>
  ${dividerArt(`<div style="display:flex;flex-direction:column;gap:22px">
    ${ART.fbIcon(78)}${ART.igIcon(78)}${ART.lnIcon(78)}</div>`)}`,
  notes:{ say:['這一段的目標很單純：讓學員離開時知道自己要做哪一個，不要三個都開然後三個都荒廢。'], ask:[], do:[] }});

S({ part:'PART 2', time:'09:30', kind:'std', title:'Slide 8｜三個平台不是同一件事',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>用開店來想就懂了</p>
      <h2 class="h" data-r style="font-size:40px;margin-bottom:8px">三個平台，三種不同的店面</h2>
    </div>
    <div class="cards c3" data-r style="gap:24px">
      <div class="card top-accent a-fb" style="padding:0;overflow:hidden">
        <div style="padding:24px 24px 0">${ART.plaza(260)}</div>
        <div style="padding:6px 26px 28px">
          <p class="cap" style="color:${C.fb}">FACEBOOK</p>
          <p class="k" style="font-size:24px">社區廣場</p>
          <p class="v">大家會在這裡聊天、分享、看見鄰居在做什麼。<b>建立關係</b>的地方。</p>
        </div>
      </div>
      <div class="card top-accent a-ig" style="padding:0;overflow:hidden">
        <div style="padding:24px 24px 0">${ART.window(260)}</div>
        <div style="padding:6px 26px 28px">
          <p class="cap" style="color:${C.igB}">INSTAGRAM</p>
          <p class="k" style="font-size:24px">展示櫥窗</p>
          <p class="v">路過的人被作品吸引而停下來。<b>吸引新的人</b>的地方。</p>
        </div>
      </div>
      <div class="card top-accent a-ln" style="padding:0;overflow:hidden">
        <div style="padding:24px 24px 0">${ART.counter(260)}</div>
        <div style="padding:6px 26px 28px">
          <p class="cap" style="color:#03934a">LINE 官方帳號</p>
          <p class="k" style="font-size:24px">會員／客服櫃台</p>
          <p class="v">有興趣的人來問、來訂、來回購。<b>留下顧客</b>的地方。</p>
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['這個比喻整天都會用，請學員記住三個名詞：廣場、櫥窗、櫃台。',
         '很多學員的問題是「我都在櫥窗喊話，但沒有櫃台」——東西被看到了，卻沒地方成交。'],
    ask:['問：你現在有哪一個？哪一個完全沒有？'],
    do:[]
  }});

S({ part:'PART 2', time:'09:38', kind:'std', title:'Slide 9｜Facebook 適合做什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>${'社區廣場'}</p>
      <h2 class="h" data-r style="font-size:40px;display:flex;align-items:center;gap:14px">
        ${ART.fbIcon(42)} Facebook 粉絲專頁</h2>
      <p class="lead" data-r style="margin:6px 0 24px">適合這些情況 ——</p>
      <div class="cards c2" data-r style="gap:12px">
        ${['在地客群','中高齡族群','社團與社區','活動資訊','完整內容分享','建立熟悉感']
          .map(t=>`<div class="card flat" style="padding:14px 18px;border-radius:14px">
            <p class="v" style="font-weight:750;font-size:17px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:22px;background:#eef4ff;border-left-color:${C.fb}">
        ${ART.people(52,C.fb)}
        <span class="txt" style="font-size:18px">
          手作品 · 市集 · 農產品 · 社區活動 · 課程<br>
          <b style="color:${C.fb}">客人年紀偏長、住在附近，就用 Facebook。</b></span>
      </div>
    </div>
    <div class="col center" data-r>
      ${fbScreen({text:'今天早上去溪州收了一批草莓，紅得很漂亮 🍓<br>下午開始煮，晚上就可以裝瓶。<br>週三在西屯市集有擺攤，歡迎過來聊聊！'})}
      <p class="cap-t">Facebook 可以講比較完整的事</p>
    </div>
  </div>`,
  notes:{
    say:['台灣中高齡族群仍大量使用 Facebook，而且「社團」是免費曝光的主要來源，後面第九段會再談。',
         '強調 Facebook 的長處是：可以寫比較多字、可以講故事、可以被分享出去。'],
    ask:['問：你有加入哪些在地社團？（例如西屯二手、台中媽媽社團、社區公布欄）'],
    do:[]
  }});

S({ part:'PART 2', time:'09:45', kind:'std', title:'Slide 10｜Instagram 適合做什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>展示櫥窗</p>
      <h2 class="h" data-r style="font-size:40px;display:flex;align-items:center;gap:14px">
        ${ART.igIcon(42)} Instagram</h2>
      <p class="lead" data-r style="margin:6px 0 24px">適合這些情況 ——</p>
      <div class="cards c2" data-r style="gap:12px">
        ${['商品作品展示','個人風格','照片為主','短影片','製作過程','開發新客群']
          .map(t=>`<div class="card flat" style="padding:14px 18px;border-radius:14px">
            <p class="v" style="font-weight:750;font-size:17px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:22px;background:#fdeef4;border-left-color:${C.igB}">
        ${ART.camera(52,C.igB)}
        <span class="txt" style="font-size:19px">一句話：<br>
          <b style="color:${C.igB}">IG 就像你的作品展示櫥窗。</b></span>
      </div>
    </div>
    <div class="col center" data-r>
      ${igProfile({bio:'手工果醬 · 小批製作<br>當季水果，一次只煮一鍋',
                   grid:['jam','cookie','stall','cake','gift','ear','kim','cake','yoga']})}
      <p class="cap-t">九宮格＝別人對你的第一印象</p>
    </div>
  </div>`,
  notes:{
    say:['IG 最大的價值是「陌生人會找到你」——透過 Hashtag、搜尋、Reels。FB 比較難做到這件事。',
         '提醒：IG 上文字沒有連結功能（貼文內文無法點），所以聯絡方式一定要放在自我介紹。'],
    ask:['問：現場有多少人有 IG？（舉手）有在用的又有多少？'],
    do:['請有 IG 的學員現在打開自己的個人檔案，等一下 PART 4 會用到。']
  }, tag:{type:'ask', label:'舉手調查'}});

S({ part:'PART 2', time:'09:52', kind:'std', title:'Slide 11｜LINE 官方帳號適合做什麼',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>會員／客服櫃台</p>
      <h2 class="h" data-r style="font-size:40px;display:flex;align-items:center;gap:14px">
        ${ART.lnIcon(42)} LINE 官方帳號</h2>
      <p class="lead" data-r style="margin:6px 0 24px">適合這些情況 ——</p>
      <div class="cards c2" data-r style="gap:12px">
        ${['顧客詢問','預約','接單','活動通知','新品通知','熟客維繫','回購','出貨通知']
          .map(t=>`<div class="card flat" style="padding:13px 18px;border-radius:14px">
            <p class="v" style="font-weight:750;font-size:16.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:22px">
        ${ART.bag(52,C.sage)}
        <span class="txt" style="font-size:19px">
          FB、IG 把人<b>帶來</b>，<br>LINE 把有興趣的人<b class="hl-s">留下來</b>。</span>
      </div>
    </div>
    <div class="col center" data-r>
      ${lnChat([
        {side:'in', t:'您好，請問草莓果醬還有嗎？'},
        {side:'out', t:'有的！本週還剩 6 瓶 🍓<br>每瓶 250 元'},
        {side:'in', t:'我要兩瓶，可以週三市集拿嗎？'},
        {side:'out', t:'可以喔，幫您留 2 瓶<br>週三 15:00 後在西屯市集 A12 攤'}
      ])}
      <p class="cap-t">真正成交，多半發生在這裡</p>
    </div>
  </div>`,
  notes:{
    say:['很多學員以為 LINE 官方帳號是「大公司才用的」。要破除這個誤解：一個人也能開，免費方案每月有一定則數的訊息額度。',
         '重點觀念：FB／IG 上的人「不是你的」，演算法一改就看不到；LINE 好友才是真正留得住的名單。'],
    ask:['問：現場有誰用私人 LINE 在接單？遇過什麼困擾？（訊息被家人洗掉、分不清誰是客人）'],
    do:[]
  }});

S({ part:'PART 2', time:'09:58', kind:'std', title:'Slide 11-2｜你們已經在用什麼？',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>課前調查 · 曾使用過的數位工具 · 30 人</p>
      <h2 class="h" data-r style="font-size:38px">好消息：<span class="hl">你們已經天天在用了</span></h2>
    </div>
    <div class="split" data-r style="gap:44px;align-items:start">
      <div class="stack gap-s">
        ${[['LINE',30,'100.0',C.ln],
           ['Facebook',28,'93.3',C.fb],
           ['ChatGPT',17,'56.7',C.ink3]].map(([t,n,p,c])=>`
        <div style="display:flex;align-items:center;gap:14px">
          <span style="font-size:22px;font-weight:800;color:${C.ink};width:120px;flex:none">${t}</span>
          <span style="flex:1;height:16px;border-radius:99px;background:${C.paper3};overflow:hidden">
            <span style="display:block;height:100%;width:${p}%;border-radius:99px;background:${c}"></span></span>
          <span style="font-size:20px;font-weight:850;color:${C.ink2};width:150px;text-align:right;
            white-space:nowrap;font-variant-numeric:tabular-nums">${n} 人｜${p}%</span>
        </div>`).join('')}
      </div>
      <div class="stack gap-s">
        ${[['Instagram',13,'43.3',C.plum],
           ['Gemini',9,'30.0',C.ink3],
           ['Canva',4,'13.3',C.muted]].map(([t,n,p,c])=>`
        <div style="display:flex;align-items:center;gap:14px">
          <span style="font-size:22px;font-weight:800;color:${C.ink};width:120px;flex:none">${t}</span>
          <span style="flex:1;height:16px;border-radius:99px;background:${C.paper3};overflow:hidden">
            <span style="display:block;height:100%;width:${p}%;border-radius:99px;background:${c}"></span></span>
          <span style="font-size:20px;font-weight:850;color:${C.ink2};width:150px;text-align:right;
            white-space:nowrap;font-variant-numeric:tabular-nums">${n} 人｜${p}%</span>
        </div>`).join('')}
      </div>
    </div>
    <div class="cards c2" data-r style="gap:24px;margin-top:4px">
      <div class="callout sage" style="padding:20px 24px">
        ${ART.hands(40,C.sage)}
        <span class="txt">
          <b>LINE 100%、Facebook 93%</b><br>
          你要用的工具，早就在你手機裡了。</span>
      </div>
      <div class="callout gold" style="padding:20px 24px">
        ${ART.bulb(40,C.gold)}
        <span class="txt">
          <b>Instagram 只有 43%</b><br>
          所以先把 FB＋LINE 練熟，IG 之後再說。</span>
      </div>
    </div>
  </div>`,
  notes:{
    say:['這頁是用學員自己的數據替下一頁的建議鋪路：不是我叫你們做 Facebook，是因為你們本來就都在用。',
         'LINE 30 人全部都有、Facebook 28 人——這兩個是最省力的起點；Instagram 只有 13 人用過，對多數人是全新工具。',
         'Canva 只有 4 人用過，所以今天完全不碰 Canva 操作；那是後面「商品視覺設計」課程的內容。'],
    ask:['問：有用過 Instagram 的請舉手？（對照 43% 這個數字，讓現場自己確認）'],
    do:[]
  }, tag:{type:'ask', label:'舉手對照'}});

S({ part:'PART 2', time:'10:00', kind:'std', title:'Slide 12｜所以我三個都要做嗎？',
  html:`
  <div class="stack gap-l center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">最常被問的問題</p>
      <h2 class="h" data-r style="font-size:38px;color:${C.ink3};font-weight:700">所以我三個都要做嗎？</h2>
      <p class="mega" data-r style="margin-top:6px">不用。</p>
    </div>
    <div class="split" data-r style="width:100%;max-width:900px;gap:34px;margin-top:8px">
      <div class="card top-accent" style="text-align:left">
        <p class="cap">初學者先想這個</p>
        <p class="k" style="font-size:26px;margin-bottom:14px">我要在哪裡<br>「被看到」？</p>
        <div style="display:flex;gap:10px">
          <span class="pill fb">${ART.fbIcon(20)} Facebook</span>
          <span class="pill ig">${ART.igIcon(20)} Instagram</span>
        </div>
        <p class="v" style="margin-top:14px">二選一就好，先做熟一個。</p>
      </div>
      <div class="card top-accent a-ln" style="text-align:left">
        <p class="cap">然後想這個</p>
        <p class="k" style="font-size:26px;margin-bottom:14px">我要在哪裡<br>「留下顧客」？</p>
        <div style="display:flex;gap:10px">
          <span class="pill ln">${ART.lnIcon(20)} LINE 官方帳號</span>
        </div>
        <p class="v" style="margin-top:14px">這個幾乎每個人都需要。</p>
      </div>
    </div>
    <p class="lead" data-r><b>一個曝光平台 ＋ 一個聯絡平台</b>，就是最好的起點。</p>
  </div>`,
  notes:{
    say:['這頁要講得很肯定：三個都開但都不更新，比只做好一個還糟。',
         '公式：曝光平台（FB 或 IG）＋ 聯絡平台（LINE）＝ 兩個就夠。'],
    ask:[],
    do:['請學員在講義 1 勾選：主要曝光平台是 FB 還是 IG。現在就決定，不要拖到下課。']
  }, tag:{type:'do', label:'講義 1'}});

S({ part:'PART 2', time:'10:04', kind:'std', title:'Slide 13｜案例：這三個人該選哪個？',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>換你們回答</p>
      <h2 class="h" data-r style="font-size:38px">如果是他們，你會建議做哪個平台？</h2>
    </div>
    <div class="cards c3" data-r>
      ${[[ART.kimchi(118),'A 阿姨','做手工泡菜','客人大多 40–60 歲，<br>都住在台中西屯附近。',
          `<span class="pill fb">Facebook</span><span class="pill ln">LINE</span>`],
         [ART.earring(118),'B 學員','做手工耳環','想接觸 20–40 歲女性，<br>目前沒什麼在地客。',
          `<span class="pill ig">Instagram</span><span class="pill ln">LINE</span>`],
         [ART.yoga(118),'C 學員','教瑜珈','主要想招募<br>附近社區的居民。',
          `<span class="pill fb">Facebook</span><span class="pill ln">LINE</span>`]]
        .map(([art,n,job,d,ans])=>`
        <div class="card" style="text-align:center">
          <div style="display:flex;justify-content:center;margin-bottom:10px">${art}</div>
          <p class="cap">${n}</p>
          <p class="k" style="font-size:22px">${job}</p>
          <p class="v" style="min-height:52px">${d}</p>
          <div class="rule"></div>
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">${ans}</div>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.bulb(36,C.gold)}
      <span class="txt">判斷方式只有一個：<b>我的客人年紀多大、住在哪裡、平常在滑什麼？</b></span></div>
  </div>`,
  notes:{
    say:['先蓋住答案，讓學員自己講，再一個一個掀開。這裡是上午互動的重點。',
         '講完後把邏輯講白：選平台不是看「哪個比較紅」，是看「我的客人在哪裡」。'],
    ask:['問：A 阿姨如果想賣到全台灣，答案會不會改變？（會，就要加上 IG 或宅配社團）',
         '問：現場有沒有人的情況跟這三個很像？'],
    do:['兩人一組，互相說出對方適合哪個平台，並說明理由。3 分鐘。']
  }, tag:{type:'ask', label:'全班討論'}});

/* =========================================================================
   PART 3
   ========================================================================= */
S({ part:'PART 3', time:'10:20–11:05', kind:'divider', title:'PART 3｜Facebook 粉絲專頁操作',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>10:10 – 10:20 休息 ｜ 10:20 – 11:05 ｜ PART 3</span>
    <p class="pno" data-r>03</p>
    <h2 data-r>Facebook<br>粉絲專頁操作</h2>
    <p class="d-sub" data-r>拿起手機，跟著一起做。這一段講師手機投影，全班同步操作。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.fbIcon(120)}</div>`)}`,
  notes:{ say:['休息回來先確認全班手機都在手上。這一段是今天第一次大量操作，速度要放慢，寧可少做兩項也不要有人掉隊。',
               '建議安排 1–2 位志工或助教在教室走動協助。'], ask:[], do:[] }});

S({ part:'PART 3', time:'10:20', kind:'std', title:'Slide 14｜個人帳號 vs 粉絲專頁',
  html:`
  <div class="stack gap-m">
    <p class="eyebrow" data-r>先分清楚這兩個</p>
    <div class="split" data-r style="gap:44px">
      <div class="card">
        <p class="cap">個人 Facebook 帳號</p>
        <p class="k" style="font-size:30px;margin-bottom:16px">「我是誰」</p>
        <div class="art-box" style="height:118px;background:${C.paper2};margin-bottom:16px">
          ${ART.people(160,C.ink3)}</div>
        <ul class="list dense">
          <li>朋友、家人、同學</li>
          <li>有好友人數上限（5,000）</li>
          <li>用來維持關係，不是做生意</li>
        </ul>
      </div>
      <div class="card top-accent a-fb">
        <p class="cap" style="color:${C.fb}">Facebook 粉絲專頁</p>
        <p class="k" style="font-size:30px;margin-bottom:16px">「我提供什麼」</p>
        <div class="art-box" style="height:118px;background:#eef4ff;margin-bottom:16px">
          ${ART.stall(190)}</div>
        <ul class="list dense">
          <li>顧客、陌生人都能追蹤，沒有上限</li>
          <li>可以看到成效數據</li>
          <li>可以放營業時間、地址、聯絡方式</li>
        </ul>
      </div>
    </div>
    <div class="callout" data-r>${ART.bulb(36)}
      <span class="txt">如果未來要做商品、服務、課程，<b class="hl">建議另外建立粉絲專頁</b>，
      不要全部擠在個人帳號。</span></div>
  </div>`,
  notes:{
    say:['很多學員會說「我用個人帳號賣就好」。可以，但要說明三個限制：好友上限、沒有數據、朋友會被洗版。',
         '折衷做法：粉專發文 → 分享到個人帳號。兩邊都顧到，下一頁會教。'],
    ask:['問：現場有誰已經有粉絲專頁？（請他們等一下當小老師）'],
    do:[]
  }});

S({ part:'PART 3', time:'10:26', kind:'std', title:'Slide 15｜一個好的粉專至少要有六件事',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>檢查你的粉專</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:24px">至少要有這六件事</h2>
      <div class="cards c2" style="gap:14px" data-r>
        ${[['1','看得懂的名稱','別人一看就知道你做什麼'],
           ['2','清楚的大頭貼','商品或本人，不要用風景'],
           ['3','封面照片','放最有代表性的作品'],
           ['4','一句話介紹','你是誰、你做什麼、在哪裡'],
           ['5','聯絡方式','電話或 LINE，一定要放'],
           ['6','可以找到你的方式','地址、市集時間、或連結']]
          .map(([n,k,v])=>`
          <div class="card flat" style="padding:16px 18px;border-radius:16px;display:flex;gap:13px;align-items:flex-start">
            <span class="num-badge ghost" style="width:30px;height:30px;font-size:15px;border-radius:9px">${n}</span>
            <span><b style="font-size:17.5px;font-weight:800;display:block;margin-bottom:3px">${k}</b>
            <span style="font-size:14.5px;color:${C.ink3};font-weight:600">${v}</span></span>
          </div>`).join('')}
      </div>
      <p class="tiny" data-r style="margin-top:18px">
        ＊今天不教設計與排版，那是後面「商品視覺設計」課程的內容。今天只確認「有沒有」。</p>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar fb-bar"><span class="ttl">facebook</span></div>
          <div class="app-body">
            <div style="height:82px;background:linear-gradient(135deg,#f6d9c5,#eab08c);position:relative">
              <span style="position:absolute;left:13px;bottom:-24px;width:56px;height:56px;border-radius:99px;
                border:3px solid #fff;overflow:hidden;display:block">${avatar(ART.jar)}</span></div>
            <div style="padding:30px 13px 0">
              <p style="margin:0;font-size:15px;font-weight:900">小芳手作果醬｜台中</p>
              <p style="margin:3px 0 0;font-size:10.5px;color:#65676b;font-weight:650">食品雜貨 · 台中市西屯區</p>
              <p style="margin:9px 0 0;font-size:11px;line-height:1.6;color:#1c1e21;font-weight:550">
                用當季水果小批製作的手工果醬，每週三西屯市集擺攤。<br>訂購請加 LINE ⟶ @xiaofangjam</p>
              <div style="display:flex;gap:6px;margin-top:11px">
                <span style="flex:1;background:${C.fb};color:#fff;font-size:11px;font-weight:800;
                  text-align:center;padding:7px;border-radius:7px">＋ 追蹤</span>
                <span style="flex:1;background:#e4e6eb;font-size:11px;font-weight:800;
                  text-align:center;padding:7px;border-radius:7px">傳送訊息</span></div>
            </div>
          </div>`)}
        ${[['③ 封面','left:-88px;top:99px'],['② 大頭貼','left:-104px;top:148px'],
           ['① 名稱','right:-88px;top:181px'],['④ 一句話','right:-104px;top:244px'],
           ['⑤ 聯絡方式','right:-116px;top:297px']]
          .map(([t,pos])=>`<span style="position:absolute;${pos};background:${C.ink};color:${C.paper};
            font-size:12.5px;font-weight:800;padding:6px 12px;border-radius:99px;white-space:nowrap">${t}</span>`).join('')}
      </div>
    </div>
  </div>`,
  notes:{
    say:['一項一項對照右邊的手機示意圖講。學員可以邊聽邊看自己的粉專缺哪一項。',
         '最常缺的是第 5 項聯絡方式——很多粉專找不到怎麼買。'],
    ask:['問：你的粉專缺哪幾項？'],
    do:['請學員打開自己的粉專，六項逐一對照，缺的先記下來。']
  }, tag:{type:'do', label:'對照檢查'}});

S({ part:'PART 3', time:'10:32', kind:'std', title:'Slide 16｜粉專名稱怎麼取',
  html:`
  <div class="stack gap-l">
    <div>
      <p class="eyebrow" data-r>Before / After</p>
      <h2 class="h" data-r style="font-size:40px">讓陌生人看名稱，<br>就知道你在做什麼。</h2>
    </div>
    <div class="split" data-r style="gap:52px;align-items:center">
      <div class="center">
        <div style="opacity:.85">${ART.sign('小芳的小天地', C.muted, 244)}</div>
        <div class="no" style="justify-content:center;margin-top:12px"><i>✕</i>
          <span style="font-weight:750">看不出來在賣什麼</span></div>
      </div>
      <div class="center">
        ${ART.sign('小芳手作果醬｜台中', C.clay, 244)}
        <div class="yes" style="justify-content:center;margin-top:12px"><i>✓</i>
          <span style="font-weight:750">商品 ＋ 地區，一眼就懂</span></div>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.search(36,C.gold)}
      <span class="txt">公式：<b>你做什麼 ＋ 你在哪裡</b>。<br>
      這樣別人搜尋「台中 果醬」時，才可能找到你。</span></div>
    <p class="tiny" data-r>＊今天不教品牌命名與故事，那是「品牌故事撰寫」課程的內容。這裡只處理「看不看得懂」。</p>
  </div>`,
  notes:{
    say:['刻意不要講「品牌感」「調性」這種詞，中高齡學員只要記住公式：做什麼＋在哪裡。',
         '如果學員已經取了很文青的名字，不用逼他改，建議在名稱後面加上說明即可。'],
    ask:['問：如果你是客人，在搜尋列會打什麼字找這種東西？'],
    do:['請每位學員在講義空白處，用「你做什麼＋你在哪裡」寫一個名稱。']
  }, tag:{type:'do', label:'寫一個名稱'}});

S({ part:'PART 3', time:'10:38', kind:'std', title:'Slide 17｜Facebook 同步操作',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>跟著講師一起做</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:8px">現在拿出手機</h2>
      <p class="lead" data-r style="margin-bottom:24px">做完一項就打一個勾。<br>做不完沒關係，記下來回家做。</p>
      <div class="checks" style="grid-template-columns:1fr" data-r>
        ${['找到／建立粉絲專頁','修改大頭貼','修改封面照片','檢查簡介文字',
           '檢查聯絡方式（電話或 LINE）','找到發文的位置']
          .map(t=>`<div class="check"><span class="box"></span>${t}</div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar fb-bar"><span class="ttl">編輯粉絲專頁</span></div>
          <div class="app-body grey" style="padding:11px">
            ${['大頭貼照','封面照片','粉絲專頁名稱','簡介','聯絡資訊','按鈕設定']
              .map((t,i)=>`<div style="display:flex;align-items:center;gap:10px;background:#fff;
                border-radius:10px;padding:12px 13px;margin-bottom:7px;
                ${i===1?`outline:2.5px solid ${C.clay};outline-offset:1px`:''}">
                <span style="width:26px;height:26px;border-radius:8px;background:${C.paper2}"></span>
                <span style="font-size:12px;font-weight:750;color:#1c1e21">${t}</span>
                <span style="margin-left:auto;color:#b0b3b8;font-size:12px">›</span></div>`).join('')}
          </div>`)}
        <div style="position:absolute;right:-44px;top:126px">${ART.tap(84)}</div>
      </div>
      <p class="cap-t">講師手機請同步投影</p>
    </div>
  </div>`,
  notes:{
    say:['這頁停留最久，預計 12–15 分鐘。講師先示範一次，再讓學員自己做一次。',
         '沒有粉專的人：現場建立。有粉專但很久沒用的人：先更新大頭貼與簡介。'],
    ask:['問：卡在哪一步？（請卡住的人舉手，助教過去協助）'],
    do:['六項全部操作一次。完成的人請協助隔壁的學員。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'10:50', kind:'std', title:'Slide 18｜Facebook 貼文有哪些功能',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>發文的時候可以做什麼</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:22px">一則貼文的九個功能</h2>
      <div class="cards c3" style="gap:12px" data-r>
        ${[['文字','✏️'],['加照片','🖼'],['多張照片','🗂'],['標註朋友','＠'],['打卡地點','📍'],
           ['留言回覆','💬'],['分享出去','↗'],['編輯貼文','🔧'],['刪除貼文','🗑']]
          .map(([t,i])=>`<div class="card flat" style="padding:15px 10px;border-radius:14px;text-align:center">
            <div style="font-size:22px;margin-bottom:6px">${i}</div>
            <p class="v" style="font-size:15.5px;font-weight:750;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:20px">${ART.bulb(34,C.sage)}
        <span class="txt" style="font-size:18px">
          最常被忘記的是<b class="hl-s">「打卡地點」</b>——<br>
          在地客人常常是從地點找到你的。</span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar fb-bar"><span class="ttl" style="color:${C.ink};font-size:14px">建立貼文</span>
          <span style="background:${C.fb};color:#fff;font-size:11px;font-weight:800;padding:5px 13px;
            border-radius:7px">發布</span></div>
        <div class="app-body" style="padding:12px 13px">
          <div style="display:flex;gap:9px;align-items:center;margin-bottom:12px">
            <span style="width:34px;height:34px;border-radius:99px;overflow:hidden;flex:none">${avatar(ART.jar)}</span>
            <span style="font-size:12.5px;font-weight:850">小芳手作果醬｜台中</span></div>
          <p style="font-size:11.5px;line-height:1.65;color:#1c1e21;font-weight:550;margin:0 0 12px">
            今天早上收到一批新鮮草莓，紅得發亮。<br>下午開始熬煮，一鍋只做 20 瓶……</p>
          <div style="height:96px;border-radius:10px;overflow:hidden;margin-bottom:12px">${TH.jam}</div>
          ${['🖼 相片／影片','📍 打卡地點','＠ 標註朋友','😀 心情／活動']
            .map(t=>`<div style="display:flex;align-items:center;gap:9px;padding:10px 4px;
              border-top:1px solid #f0f2f5;font-size:12px;font-weight:700;color:#3d3d3d">${t}</div>`).join('')}
        </div>`)}
      <p class="cap-t">發文畫面（示意）</p>
    </div>
  </div>`,
  notes:{
    say:['一項一項在投影的手機上點給大家看，不要只念名稱。',
         '「編輯」與「刪除」一定要教——學員最怕發錯，知道可以改就敢發了。'],
    ask:['問：有沒有人發過文之後想改卻不知道怎麼改？'],
    do:['請每個人現在發一則「測試貼文」（可以只給自己看），再把它編輯一次、然後刪除。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'10:58', kind:'std', title:'Slide 19｜分享不是亂丟廣告',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>免費曝光的第一課</p>
      <h2 class="h" data-r style="font-size:38px">同一則貼文，可以分享到哪裡？</h2>
    </div>
    <div class="split" data-r style="gap:44px;align-items:stretch">
      <div class="card sage">
        <p class="cap" style="color:${C.sage}">✓ 可以分享</p>
        <div class="stack gap-s" style="margin-top:12px">
          ${['自己的個人 Facebook','適合的主題社團','相關的地方社團','合作夥伴的頁面']
            .map(t=>`<div class="yes"><i>✓</i><span>${t}</span></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v">分享前先想一句：<b>這則貼文對這個社團的人有用嗎？</b></p>
      </div>
      <div class="card" style="background:${C.paper2};border-color:transparent;box-shadow:none">
        <p class="cap" style="color:${C.clay}">✕ 不要這樣做</p>
        <div class="stack gap-s" style="margin-top:12px">
          ${['到處貼一模一樣的廣告','沒看社團規則就貼','跟社團主題完全無關','一天洗好幾次版']
            .map(t=>`<div class="no"><i>✕</i><span>${t}</span></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v">後果：<b>被檢舉、被踢出社團、帳號被限制。</b></p>
      </div>
    </div>
    <div class="callout" data-r>${ART.warn(36)}
      <span class="txt">在社團裡，你是<b class="hl">客人</b>，不是老闆。<br>
      先參與、先幫忙回答問題，再談自己的東西。</span></div>
  </div>`,
  notes:{
    say:['這頁是「免費曝光」與「被討厭」的分界線，講清楚可以省掉學員很多麻煩。',
         '建議提供實際做法：進到社團先看置頂規則，很多社團規定只能週幾發廣告。'],
    ask:['問：有沒有人被社團退過文或踢出來過？發生什麼事？'],
    do:['請學員找出 1–2 個跟自己商品有關的在地社團，記在講義上。']
  }});

/* =========================================================================
   PART 4
   ========================================================================= */
S({ part:'PART 4', time:'11:05–12:00', kind:'divider', title:'PART 4｜Instagram 操作＋品牌案例',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>11:05 – 12:00 ｜ PART 4</span>
    <p class="pno" data-r>04</p>
    <h2 data-r>Instagram 操作<br>＋品牌案例觀察</h2>
    <p class="d-sub" data-r>先看懂別人怎麼做，再回頭看自己的帳號。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.igIcon(120)}</div>`)}`,
  notes:{ say:['這一段有大量觀察活動，請先分好組（3–4 人一組），並確認每組至少有一支能上網的手機。'], ask:[], do:[] }});

S({ part:'PART 4', time:'11:05', kind:'std', title:'Slide 20｜打開 IG，先看五個地方',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>先看，再改</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:24px">打開 IG，先看這五個地方</h2>
      <div class="stack gap-s" data-r>
        ${[['①','大頭貼','用商品或本人，不要用風景照'],
           ['②','名稱','含「做什麼」的關鍵字，別人才搜得到'],
           ['③','自我介紹','你做什麼、賣給誰、在哪裡'],
           ['④','貼文','前九張決定第一印象'],
           ['⑤','連結／聯絡方式','LINE、電話、訂購表單放這裡']]
          .map(([n,k,v])=>`
          <div class="card flat" style="padding:15px 20px;border-radius:16px;display:flex;gap:15px;align-items:center">
            <span style="font-size:21px;font-weight:900;color:${C.plum};flex:none">${n}</span>
            <span><b style="font-size:18.5px;font-weight:800;display:block">${k}</b>
            <span style="font-size:15px;color:${C.ink3};font-weight:600">${v}</span></span>
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${igProfile({bio:'手工果醬 · 小批製作<br>當季水果，一次只煮一鍋'})}
        ${[['②','left:-50px;top:37px'],['①','left:-50px;top:98px'],['③','left:-50px;top:175px'],
           ['④','left:-50px;top:340px'],['⑤','right:-50px;top:204px']]
          .map(([t,pos])=>`<span style="position:absolute;${pos};width:34px;height:34px;
            display:grid;place-items:center;background:${C.plum};color:#fff;border-radius:99px;
            font-size:15px;font-weight:800">${t}</span>`).join('')}
      </div>
    </div>
  </div>`,
  notes:{
    say:['請學員現在就打開自己的 IG（沒有的人看隔壁的），五個地方一個一個對。',
         '強調第 5 項：IG 貼文內文的網址不能點，所以聯絡方式只能放在自我介紹欄。這是最多人踩的坑。'],
    ask:['問：你的自我介紹現在寫什麼？願意念出來給大家聽嗎？'],
    do:['打開自己的 IG，五個地方逐一檢查。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 4', time:'11:14', kind:'std', title:'Slide 21｜第一次進你的 IG',
  html:`
  <div class="stack gap-l center" style="text-align:center">
    <div>
      <div style="display:flex;justify-content:center;margin-bottom:10px" data-r>${ART.timer3(90)}</div>
      <p class="mega sm" data-r>三秒鐘內，<br>我知道你在做什麼嗎？</p>
    </div>
    <div class="split" data-r style="width:100%;max-width:940px;gap:40px;margin-top:4px">
      <div class="card" style="background:${C.paper2};box-shadow:none;border-color:transparent">
        <p class="cap" style="color:${C.muted}">比較模糊</p>
        <p style="font-size:27px;font-weight:800;margin:6px 0 14px;color:${C.ink3}">
          「分享生活中的幸福」</p>
        <div class="no" style="justify-content:center"><i>✕</i><span>看完不知道你在做什麼</span></div>
      </div>
      <div class="card top-accent a-plum">
        <p class="cap" style="color:${C.plum}">比較清楚</p>
        <p style="font-size:27px;font-weight:800;margin:6px 0 14px;color:${C.ink}">
          「台中手作甜點｜預訂制」</p>
        <div class="yes" style="justify-content:center"><i>✓</i><span>做什麼、在哪裡、怎麼買，都有了</span></div>
      </div>
    </div>
    <p class="tiny" data-r style="max-width:700px">
      ＊今天不深入教文案寫作，那是後面「商品文案設計」課程的內容。<br>
      現在只要做到一件事：讓陌生人三秒內看懂。</p>
  </div>`,
  notes:{
    say:['不要批評「分享生活中的幸福」不好，而是說：它適合個人帳號，不適合要接單的帳號。',
         '示範方法：請一位學員念自己的自介，其他人聽完舉手回答「他在賣什麼」，馬上見真章。'],
    ask:['隨機找 2–3 位學員念自介，全班猜他在做什麼。猜不出來就代表要改。'],
    do:['把自我介紹改成「做什麼 ＋ 給誰 ＋ 在哪裡／怎麼買」。']
  }, tag:{type:'ask', label:'三秒測試'}});

S({ part:'PART 4', time:'11:22', kind:'std', title:'Slide 22｜IG 有哪些內容形式',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>四種內容，四種用途</p>
      <h2 class="h" data-r style="font-size:38px">IG 上你會用到的四種東西</h2>
    </div>
    <div class="cards c4" data-r style="gap:20px">
      ${[['貼文','留下來的作品','會一直留在九宮格裡，是別人認識你的第一印象。',TH.jam,C.clay],
         ['Reels','短影音／過程／幕後','最容易被陌生人看到的形式。',
          `<div class="thumb tr-6" style="position:relative">${ART.play(52,'#fff')}</div>`,C.plum],
         ['限時動態','現在正在發生的事','24 小時後消失，可以隨手拍、不用完美。',
          `<div class="thumb tr-5">${ART.camera(48,C.clay2)}</div>`,C.gold],
         ['精選限動','把重要的限動留下','營業時間、訂購方式、客人回饋，放這裡。',
          `<div class="thumb tr-4">${ART.star(48,C.sage)}</div>`,C.sage]]
        .map(([k,s,v,th,c])=>`
        <div class="card" style="padding:0;overflow:hidden">
          <div style="height:104px;overflow:hidden">${th}</div>
          <div style="padding:18px 20px 22px">
            <p class="k" style="font-size:21px;margin-bottom:4px;color:${c}">${k}</p>
            <p style="font-size:13.5px;font-weight:800;color:${C.muted};margin:0 0 10px">${s}</p>
            <p class="v" style="font-size:15.5px">${v}</p>
          </div>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.bulb(34,C.gold)}
      <span class="txt">初學者建議順序：<b>先把貼文發穩定</b> →
      再試限時動態 → 最後才碰 Reels。</span></div>
  </div>`,
  notes:{
    say:['先給全貌，讓學員知道 IG 不是只有「發照片」。細節下午 PART 7 會再展開。',
         '順序很重要：叫初學者一開始就拍 Reels，多半會放棄。'],
    ask:['問：這四個裡面，你用過哪幾個？'],
    do:[]
  }});

S({ part:'PART 4', time:'11:28', kind:'std', title:'Slide 23｜一句話分辨',
  html:`
  <div class="center stack gap-l" style="text-align:center">
    <p class="eyebrow plum" data-r style="justify-content:center">用一句話記住</p>
    <div class="cards c4" data-r style="width:100%;gap:22px">
      ${[['貼文','留下作品',ART.bag(64,C.clay),C.clayTint,C.clay],
         ['Reels','讓人看過程',ART.play(64,C.plum),C.plumSoft,C.plum],
         ['限時動態','分享現在',ART.clock(64,C.gold),C.goldSoft,C.gold],
         ['精選限動','留下重要資訊',ART.star(64,C.sage),C.sageSoft,C.sage]]
        .map(([k,v,ic,bg,c])=>`
        <div class="card" style="background:${bg};border-color:transparent;box-shadow:none;padding:32px 18px">
          <div style="display:flex;justify-content:center;margin-bottom:16px">${ic}</div>
          <p class="cap" style="color:${c};margin-bottom:8px">${k}</p>
          <p style="font-size:24px;font-weight:850;margin:0;color:${C.ink};line-height:1.35">${v}</p>
        </div>`).join('')}
    </div>
    <p class="lead" data-r>四個都可以用，但不用一次全開。<br>
      <b>先選一個你今天做得到的。</b></p>
  </div>`,
  notes:{
    say:['這是上一頁的濃縮版，請全班一起念一次。',
         '可以做個小活動：講師說「今天在做餅乾的影片」，學員回答該用哪一種。'],
    ask:['快問快答：① 客人回饋的截圖 → 精選限動；② 今天出爐的餅乾 → 限動；③ 完成的作品照 → 貼文；④ 揉麵到出爐 → Reels。'],
    do:[]
  }, tag:{type:'ask', label:'快問快答'}});

S({ part:'PART 4', time:'11:34', kind:'std', title:'Slide 24｜IG 品牌案例觀察',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>看真的帳號</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:6px">我們來看三個真實的小品牌</h2>
      <p class="lead" data-r>刻意不看 Nike、Apple。<br>要看<span class="mark">跟你規模差不多、你做得到</span>的帳號。</p>
    </div>
    <div class="cards c3" data-r style="gap:22px;margin-top:6px">
      ${[['案例 A','手作飾品 / 烘焙','一人工作室，以作品照為主'],
         ['案例 B','農產品 / 小農','大量製作過程與產地照'],
         ['案例 C','個人品牌 / 課程','人出現在畫面裡，有溫度']]
        .map(([n,t,d])=>`
        <div class="card" style="padding:20px">
          <p class="cap" style="color:${C.plum}">${n}</p>
          <p class="k" style="font-size:20px">${t}</p>
          <div class="slot" style="height:150px;margin:12px 0 10px">
            <span style="font-size:26px">📱</span>
            <span class="st">此處放實際 IG 截圖</span>
            <span class="sd">上課前先選好帳號，<br>截圖個人首頁（九宮格）放進來</span>
          </div>
          <p class="v" style="font-size:15px">${d}</p>
        </div>`).join('')}
    </div>
    <p class="tiny" data-r>
      ＊建議類型：手作飾品、烘焙甜點、農產品、手作工藝、小型個人品牌。
      現場也可以直接用手機投影，即時打開帳號給學員看。</p>
  </div>`,
  notes:{
    say:['上課前務必先挑好 3–5 個真實帳號，並確認當天網路可連。最好是台中在地的，學員會更有感。',
         '如果現場網路穩定，直接開手機投影比放截圖更好——可以即時滑給大家看。',
         '挑選原則：追蹤數 1,000–20,000、一個人在經營、照片是手機拍的。太專業的會讓學員覺得「我做不到」。'],
    ask:['問：你們覺得這三個帳號，哪一個你最有可能做到？'],
    do:[]
  }, tag:{type:'ask', label:'案例觀察'}});

S({ part:'PART 4', time:'11:40', kind:'std', title:'Slide 25｜不要只看「漂不漂亮」',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow plum" data-r>觀察的方法</p>
      <h2 class="h" data-r style="font-size:38px;margin-bottom:10px">看品牌時，<br>不要只看漂不漂亮</h2>
      <p class="lead" data-r style="margin-bottom:24px">漂亮不一定賣得掉。<br>我們要看的是<span class="mark">有沒有把該說的說清楚</span>。</p>
      <div class="checks c2" data-r style="grid-template-columns:1fr 1fr">
        ${['我一眼知道她在賣什麼嗎？','大頭貼看得懂嗎？','自介清楚嗎？','有商品照嗎？',
           '有人出現在裡面嗎？','有製作過程嗎？','有 Reels 嗎？','有購買方式嗎？']
          .map(t=>`<div class="check" style="font-size:16.5px;padding:12px 15px"><span class="box"></span>${t}</div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${ART.search(150,C.plum)}
      <div class="card" style="margin-top:8px;max-width:290px">
        <p class="v" style="font-weight:700;font-size:17px">
          八個問題裡，<br>如果有五個以上是「✓」，<br>
          這個帳號就是<b class="hl">值得學的對象</b>。</p>
      </div>
      <p class="cap-t">＝ 講義 2 的檢查表</p>
    </div>
  </div>`,
  notes:{
    say:['這八個問題就是講義 2。請學員拿出講義，等一下觀察時直接勾。',
         '重點是把「感覺」變成「可檢查的項目」，學員回家才知道自己該補什麼。'],
    ask:[],
    do:['發下／確認每人手上有講義 2。']
  }, tag:{type:'do', label:'講義 2'}});

S({ part:'PART 4', time:'11:45', kind:'std', title:'Slide 26｜品牌觀察活動',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>小組活動 · 15 分鐘</p>
      <h2 class="h" data-r style="font-size:40px">每組看一個品牌，<br>回答四個問題。</h2>
    </div>
    <div class="cards c4" data-r style="gap:18px">
      ${[['1','我最喜歡它哪一點？',ART.heart(52,C.clay)],
         ['2','哪一篇讓我最想停下來？',ART.eye(52,C.gold)],
         ['3','為什麼？',ART.bulb(52,C.sage)],
         ['4','有什麼是我也做得到的？',ART.tap(52,C.plum)]]
        .map(([n,q,ic])=>`
        <div class="card" style="text-align:center;padding:26px 18px">
          <div style="display:flex;justify-content:center;margin-bottom:14px">${ic}</div>
          <span class="num-badge ghost" style="margin-bottom:12px">${n}</span>
          <p class="k" style="font-size:19px;line-height:1.45">${q}</p>
        </div>`).join('')}
    </div>
    <div class="split" data-r style="gap:32px;margin-top:4px">
      <div class="callout sage">${ART.people(52,C.sage)}
        <span class="txt" style="font-size:17.5px">
          <b>分組方式：</b>3–4 人一組，一組看一個帳號。<br>
          討論 10 分鐘，每組派一人分享 1 分鐘。</span></div>
      <div class="callout gold">${ART.clock(40,C.gold)}
        <span class="txt" style="font-size:17.5px">
          <b>講師提醒：</b>第 4 題最重要。<br>
          一定要問出「我也做得到」的那一件事。</span></div>
    </div>
  </div>`,
  notes:{
    say:['活動節奏：分組 2 分鐘 → 觀察討論 10 分鐘 → 每組分享 1 分鐘 × 3–5 組。',
         '講師在各組間走動，把學員說的「做得到的事」記在白板，下午實作時會用到。',
         '如果時間不夠，把分享縮短成「每組講一句：我們決定回去要做的一件事」。'],
    ask:['收尾時問：有沒有哪一組發現「原來他們也只是用手機拍」？'],
    do:['小組完成講義 2 的觀察表，並在最下方寫下「我也做得到的一件事」。']
  }, tag:{type:'do', label:'小組活動'}});

/* =========================================================================
   午休
   ========================================================================= */
S({ part:'午休', time:'12:00–13:00', kind:'divider', title:'午休 12:00–13:00',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>12:00 – 13:00</span>
    <p class="pno" data-r style="font-size:110px">午休</p>
    <h2 data-r style="font-size:46px">下午開始動手做</h2>
    <p class="d-sub" data-r>
      吃飯前先做一件事：<br>
      想想看，如果今天下午要發一篇貼文，<br>你會發什麼？拍什麼照片？</p>
  </div>
  ${dividerArt(ART.jar(300))}`,
  notes:{ say:['午休前先埋伏筆：下午第一件事就是「你要發什麼」，讓學員吃飯時腦袋有東西在轉。',
               '提醒 13:00 準時開始，下午操作很密集。'], ask:[], do:['請學員午休時先想好一個要發的主題，並拍一張照片。'] }});

/* =========================================================================
   PART 5
   ========================================================================= */
S({ part:'PART 5', time:'13:00–13:45', kind:'divider', title:'PART 5｜不同平台怎麼發？',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>13:00 – 13:45 ｜ PART 5</span>
    <p class="pno" data-r>05</p>
    <h2 data-r>不同平台<br>怎麼發？</h2>
    <p class="d-sub" data-r>同一個商品，在 FB、IG、LINE 上要換三種寫法。</p>
  </div>
  ${dividerArt(`<div style="display:flex;flex-direction:column;gap:16px;align-items:center">
    ${ART.jar(200)}<div style="display:flex;gap:14px">${ART.fbIcon(48)}${ART.igIcon(48)}${ART.lnIcon(48)}</div></div>`)}`,
  notes:{ say:['下午第一段。先問午休的作業：你想好要發什麼了嗎？點兩三位學員說說看。'], ask:[], do:[] }});

S({ part:'PART 5', time:'13:00', kind:'std', title:'Slide 27｜可以三個平台全部貼一樣的嗎',
  html:`
  <div class="stack gap-l center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">下午的第一個問題</p>
      <h2 class="h" data-r style="font-size:38px;color:${C.ink3};font-weight:700">
        同一段內容，可以三個平台全部貼嗎？</h2>
      <p class="mega sm" data-r style="margin-top:8px">可以，<br>但不要直接複製貼上。</p>
    </div>
    <div class="cards c3" data-r style="width:100%;gap:24px;margin-top:6px">
      ${[[ART.fbIcon(40),'Facebook','坐在沙發上，<br>願意看比較長的內容','#eef4ff'],
         [ART.igIcon(40),'Instagram','手指一直滑，<br>先看圖片才決定要不要停','#fdeef4'],
         [ART.lnIcon(40),'LINE','正在忙，<br>只想知道重點跟怎麼買','#e6f8ee']]
        .map(([ic,k,v,bg])=>`
        <div class="card" style="background:${bg};border-color:transparent;box-shadow:none;text-align:center;padding:28px 20px">
          <div style="display:flex;justify-content:center;margin-bottom:14px">${ic}</div>
          <p class="k" style="font-size:21px">${k}</p>
          <p class="v" style="font-size:16.5px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:820px">${ART.bulb(36)}
      <span class="txt">因為<b class="hl">使用平台時的情境不一樣</b>，<br>
      同一句話在三個地方的效果差很多。</span></div>
  </div>`,
  notes:{
    say:['用「使用情境」解釋，比講演算法容易懂。FB＝坐著看、IG＝滑著看、LINE＝忙著看。',
         '不用叫學員寫三份完全不同的文，只要「同一件事，換三種長度」。'],
    ask:['問：你自己在滑 IG 的時候，會把長長的文字看完嗎？'],
    do:[]
  }});

S({ part:'PART 5', time:'13:06', kind:'std', title:'Slide 28｜Facebook 貼文怎麼發',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>${'教學建議'}</p>
      <h2 class="h" data-r style="font-size:38px;display:flex;align-items:center;gap:12px">
        ${ART.fbIcon(38)} Facebook 貼文</h2>
      <div class="card top-accent a-fb" data-r style="margin:20px 0 22px;text-align:center;padding:24px">
        <p class="cap" style="color:${C.fb}">建議字數</p>
        <p style="font-size:52px;font-weight:900;margin:2px 0 4px;letter-spacing:-.03em;color:${C.ink}">
          80 – 200 <span style="font-size:24px;font-weight:800">字</span></p>
        <p class="v">搭配 1–5 張照片</p>
      </div>
      <p class="lead" data-r style="margin-bottom:14px">這裡可以 ——</p>
      <div class="cards c2" data-r style="gap:11px">
        ${['多說一點','分享製作過程','分享心得','完整說明一件事']
          .map(t=>`<div class="card flat" style="padding:13px 17px;border-radius:13px">
            <p class="v" style="font-weight:750;font-size:16.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
    </div>
    <div class="col" data-r>
      <div class="post">
        <div class="ph">
          <span class="av">${avatar(ART.jar)}</span>
          <span><span class="nm">小芳手作果醬｜台中</span><br><span class="mt">今天 09:24 · 台中市西屯區</span></span>
          <span class="badge b-fb" style="margin-left:auto">FACEBOOK</span>
        </div>
        <div style="height:150px;overflow:hidden">${TH.jam}</div>
        <div class="pb">
          <span class="cnt">約 130 字</span>
          今天早上到大湖收了一批草莓，紅得發亮，香味整台車都是。<br><br>
          草莓果醬其實很花時間，要一顆一顆去蒂、切塊，小火慢慢熬到收汁，
          一鍋大概只能做 20 瓶。<br><br>
          有些客人問為什麼不做多一點，因為煮太多鍋，味道就跑掉了。<br><br>
          這週三我會在西屯市集擺攤，歡迎過來試吃 🍓
        </div>
      </div>
      <p class="cap-t">Facebook：可以把「為什麼」講出來</p>
    </div>
  </div>`,
  notes:{
    say:['一定要強調：80–200 字是「教學建議」，不是 Facebook 的規定。平台沒有限制字數。',
         '給初學者一個數字，是為了讓他們不會卡在「到底要寫多少」。熟了以後可長可短。',
         '這篇範例的重點是最後兩段：講「為什麼一鍋只做 20 瓶」——這就是信任感的來源。'],
    ask:['問：這篇裡面，哪一句話會讓你想買？'],
    do:[]
  }});

S({ part:'PART 5', time:'13:14', kind:'std', title:'Slide 29｜Instagram 貼文怎麼發',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>教學建議</p>
      <h2 class="h" data-r style="font-size:38px;display:flex;align-items:center;gap:12px">
        ${ART.igIcon(38)} Instagram 貼文</h2>
      <div class="card top-accent a-ig" data-r style="margin:20px 0 22px;text-align:center;padding:24px">
        <p class="cap" style="color:${C.igB}">建議字數</p>
        <p style="font-size:52px;font-weight:900;margin:2px 0 4px;letter-spacing:-.03em;color:${C.ink}">
          50 – 150 <span style="font-size:24px;font-weight:800">字</span></p>
        <p class="v">圖片才是主角</p>
      </div>
      <p class="lead" data-r style="margin-bottom:14px">重點 ——</p>
      <div class="stack gap-s" data-r>
        ${['圖片先吸引人停下來','第一段要簡單、看得懂','文字補充照片沒講到的事']
          .map((t,i)=>`<div class="card flat" style="padding:14px 18px;border-radius:14px;display:flex;gap:12px">
            <span class="num-badge ghost" style="width:26px;height:26px;font-size:14px;border-radius:8px;
              background:${C.plumSoft};color:${C.plum}">${i+1}</span>
            <p class="v" style="font-weight:750;font-size:16.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
    </div>
    <div class="col" data-r>
      <div class="post">
        <div class="ph">
          <span class="av">${avatar(ART.jar)}</span>
          <span><span class="nm">xiaofang.jam</span><br><span class="mt">台中市西屯區</span></span>
          <span class="badge b-ig" style="margin-left:auto">INSTAGRAM</span>
        </div>
        <div style="height:180px;overflow:hidden">${TH.jam}</div>
        <div class="pb" style="padding-bottom:8px">
          <span class="cnt">約 60 字</span>
          把春天裝進一瓶草莓果醬裡 🍓<br><br>
          一鍋只煮 20 瓶，<br>因為煮太多，味道就跑掉了。<br><br>
          <span style="color:${C.plum};font-weight:700">週三 · 西屯市集見</span>
        </div>
        <div style="padding:0 16px 16px">
          <div class="tags">${['#台中果醬','#手工果醬','#草莓果醬','#西屯市集','#台中伴手禮']
            .map(t=>`<span class="tag sm p">${t}</span>`).join('')}</div>
        </div>
      </div>
      <p class="cap-t">Instagram：圖大、字少、有 Hashtag</p>
    </div>
  </div>`,
  notes:{
    say:['同樣強調：50–150 字是建議值，不是規定。',
         '請學員比較上一頁跟這一頁——同一件事，IG 版只留下最有畫面的那兩句。',
         'Hashtag 下一段（PART 6）會完整教，這裡先讓他們看到長什麼樣子。'],
    ask:['問：如果只能留一句話，你會留哪一句？'],
    do:[]
  }});

S({ part:'PART 5', time:'13:22', kind:'std', title:'Slide 30｜LINE 官方帳號訊息怎麼發',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>教學建議</p>
      <h2 class="h" data-r style="font-size:38px;display:flex;align-items:center;gap:12px">
        ${ART.lnIcon(38)} LINE 官方帳號</h2>
      <div class="card top-accent a-ln" data-r style="margin:20px 0 22px;text-align:center;padding:24px">
        <p class="cap" style="color:#03934a">建議字數</p>
        <p style="font-size:52px;font-weight:900;margin:2px 0 4px;letter-spacing:-.03em;color:${C.ink}">
          30 – 80 <span style="font-size:24px;font-weight:800">字</span></p>
        <p class="v">越短越好</p>
      </div>
      <div class="callout sage" data-r style="margin-bottom:18px">
        <span class="txt" style="font-size:22px;font-weight:850">一則訊息，<br>只講一件事情。</span></div>
      <div class="cards c3" data-r style="gap:11px">
        ${['新品通知','活動通知','預訂通知'].map(t=>`
          <div class="card flat" style="padding:13px 8px;border-radius:13px;text-align:center">
            <p class="v" style="font-weight:750;font-size:15.5px;color:${C.ink}">${t}</p></div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${lnChat([
        {side:'out', t:'🍓 草莓果醬本週開放預訂<br><br>每瓶 250 元<br>想預訂請直接回覆「草莓＋數量」'},
        {side:'in', t:'草莓 2'},
        {side:'out', t:'收到！幫您留 2 瓶 😊<br>週三市集或宅配都可以'}
      ])}
      <p class="cap-t">短、清楚、告訴他下一步怎麼做</p>
    </div>
  </div>`,
  notes:{
    say:['LINE 是「打擾度最高」的平台——訊息會跳出通知。所以最忌諱長篇大論。',
         '最關鍵的一句是最後一行：「請回覆草莓＋數量」。一定要告訴客人下一步做什麼，否則他看完就關掉了。',
         '補充：官方帳號免費方案每月有訊息則數上限，所以更要每則都有用。'],
    ask:['問：你收過最討厭的商家 LINE 訊息長什麼樣子？'],
    do:[]
  }});

S({ part:'PART 5', time:'13:28', kind:'std', title:'Slide 31｜一個商品，三種呈現',
  html:`
  <div class="stack gap-s pad-tight">
    <div class="row" style="align-items:flex-end;gap:24px">
      <div style="flex:1">
        <p class="eyebrow" data-r style="margin-bottom:10px">同一件事，三種寫法</p>
        <h2 class="h" data-r style="font-size:34px;margin-bottom:0">手工草莓果醬</h2>
      </div>
      <div data-r>${ART.jar(70)}</div>
    </div>
    <div class="cards c3" data-r style="gap:16px">
      <div class="card top-accent a-fb" style="padding:15px 18px">
        <span class="badge b-fb">FACEBOOK</span>
        <p class="v" style="margin-top:9px;line-height:1.5;font-size:20px">
          今天早上到大湖收了一批草莓，紅得發亮。<br><br>
          草莓果醬很花時間，要一顆一顆去蒂，小火慢慢熬，一鍋大概只能做 20 瓶。
          有客人問為什麼不做多一點，因為煮太多鍋，味道就跑掉了。<br><br>
          這週三西屯市集，歡迎過來試吃 🍓</p>
        <div class="rule" style="margin:10px 0 8px"></div>
        <p class="tiny" style="font-weight:800">約 130 字 · 講過程與原因</p>
      </div>
      <div class="card top-accent a-ig" style="padding:15px 18px">
        <span class="badge b-ig">INSTAGRAM</span>
        <p class="v" style="margin-top:9px;line-height:1.52;font-size:20px">
          把春天裝進一瓶草莓果醬裡 🍓<br><br>
          一鍋只煮 20 瓶，<br>因為煮太多，味道就跑掉了。<br><br>
          週三 · 西屯市集見</p>
        <div class="tags" style="margin-top:12px">${['#台中果醬','#手工果醬','#西屯市集']
          .map(t=>`<span class="tag sm p">${t}</span>`).join('')}</div>
        <div class="rule" style="margin:10px 0 8px"></div>
        <p class="tiny" style="font-weight:800">約 60 字 · 圖片是主角</p>
      </div>
      <div class="card top-accent a-ln" style="padding:15px 18px">
        <span class="badge b-ln">LINE</span>
        <p class="v" style="margin-top:9px;line-height:1.52;font-size:20px;font-weight:700">
          🍓 草莓果醬本週開放預訂<br><br>
          每瓶 250 元<br><br>
          想預訂請直接回覆<br>「草莓＋數量」</p>
        <div class="rule" style="margin:10px 0 8px"></div>
        <p class="tiny" style="font-weight:800">約 40 字 · 直接說怎麼買</p>
      </div>
    </div>
    <div class="callout gold" data-r style="padding:13px 22px">${ART.bulb(30,C.gold)}
      <span class="txt" style="font-size:20px;line-height:1.45">
        寫法不同，但講的是<b>同一件事</b>：一鍋只煮 20 瓶　·　<b>先寫最長的那一篇，再刪成短的。</b></span></div>
  </div>`,
  notes:{
    say:['這是 PART 5 的核心頁，建議停留 5–6 分鐘，三欄逐一念出來讓學員感受差異。',
         '教一個實用技巧：先寫 FB 版（最長）→ 刪成 IG 版 → 再刪成 LINE 版。只要寫一次。',
         '注意三欄講的都是同一個賣點「一鍋只煮 20 瓶」，不要每個平台講不同故事。'],
    ask:['問：如果你的商品是 ⟨學員的商品⟩，這三段你會怎麼寫？（現場改編一位學員的商品當範例）'],
    do:['請學員拿出午休想好的主題，先寫 FB 版本（80–200 字），寫在講義 4。']
  }, tag:{type:'do', label:'講義 4'}});

S({ part:'PART 5', time:'13:35', kind:'std', title:'Slide 32｜圖片跟文字怎麼分工',
  html:`
  <div class="center stack gap-l" style="text-align:center">
    <p class="eyebrow" data-r style="justify-content:center">記住這一句</p>
    <div class="split" data-r style="width:100%;max-width:900px;gap:44px;align-items:center">
      <div class="card" style="background:${C.clayTint};border-color:transparent;box-shadow:none;padding:38px 26px">
        <div style="display:flex;justify-content:center;margin-bottom:18px">${ART.eye(84,C.clay)}</div>
        <p class="cap" style="color:${C.clay}">圖片</p>
        <p style="font-size:32px;font-weight:850;margin:6px 0 0;line-height:1.35;color:${C.ink}">
          負責讓人<br><span class="hl">停下來</span></p>
      </div>
      <div class="card" style="background:${C.sageSoft};border-color:transparent;box-shadow:none;padding:38px 26px">
        <div style="display:flex;justify-content:center;margin-bottom:18px">${ART.bulb(84,C.sage)}</div>
        <p class="cap" style="color:${C.sage}">文字</p>
        <p style="font-size:32px;font-weight:850;margin:6px 0 0;line-height:1.35;color:${C.ink}">
          負責讓人<br><span class="hl-s">看懂</span></p>
      </div>
    </div>
    <p class="lead" data-r style="max-width:760px">
      所以照片不用很美，<br>
      <b>但一定要看得出來那是什麼</b>。</p>
  </div>`,
  notes:{
    say:['這是今天第二句要記住的話。跟早上那句「引流／內容／互動」並列。',
         '延伸：所以糊掉的、光線很暗的、看不出主角的照片，第一關就輸了。',
         '＊不要深入教攝影，後面有「手機商品攝影與影像編修」課程。這裡只講分工觀念。'],
    ask:['問：你滑手機的時候，是先看圖還是先看字？'],
    do:[]
  }});

S({ part:'PART 5', time:'13:39', kind:'std', title:'Slide 33｜圖片不是傳單',
  html:`
  <div class="split" style="gap:48px;align-items:center">
    <div class="col">
      <p class="eyebrow" data-r>最常見的錯誤</p>
      <h2 class="h" data-r style="font-size:40px;margin-bottom:18px">圖片不是傳單</h2>
      <p class="lead" data-r style="margin-bottom:20px">不要把這些<b>全部</b>塞進同一張圖 ——</p>
      <div class="cards c2" data-r style="gap:10px">
        ${['商品名稱','價格','電話','地址','故事','優惠','QR Code','20 行字']
          .map(t=>`<div class="card flat" style="padding:11px 15px;border-radius:12px;opacity:.72">
            <p class="v" style="font-weight:700;font-size:15.5px">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:22px">${ART.warn(34)}
        <span class="txt" style="font-size:18px">
          在手機上，這種圖<b class="hl">縮成一格就什麼都看不到了</b>。</span></div>
    </div>
    <div class="col center" data-r>
      <div class="baked" style="width:300px;height:300px;border-radius:18px;background:linear-gradient(145deg,#f6d9c5,#eab08c);
        padding:14px;position:relative;overflow:hidden;box-shadow:var(--shadow-m);border:1px solid rgba(0,0,0,.08)">
        <div style="background:#fff;height:100%;border-radius:10px;padding:9px;display:flex;
          flex-direction:column;gap:4px;overflow:hidden">
          <p style="margin:0;font-size:15px;font-weight:900;color:${C.clay2};text-align:center">超級好吃手工草莓果醬</p>
          <p style="margin:0;font-size:11px;font-weight:800;text-align:center">限時優惠 每瓶 250 元｜買三送一</p>
          <div style="display:flex;gap:6px;align-items:center">
            <div style="width:52px;height:52px;border-radius:6px;overflow:hidden;flex:none">${TH.jam}</div>
            <p style="margin:0;font-size:7.5px;line-height:1.45;color:#555">
              本店堅持選用大湖新鮮草莓，每日清晨採收，一顆一顆手工去蒂，
              小火慢熬三小時，不添加香料與色素，通過檢驗合格，
              是您送禮自用的最佳選擇，歡迎來電洽詢訂購……</p>
          </div>
          <p style="margin:0;font-size:9px;font-weight:800">📞 0912-345-678　✉️ LINE：@xiaofangjam</p>
          <p style="margin:0;font-size:9px;font-weight:800">📍 台中市西屯區文華路 100 號</p>
          <p style="margin:0;font-size:7.5px;color:#666">營業時間：週一至週五 09:00–18:00　週六 09:00–12:00</p>
          <div style="display:flex;gap:6px;align-items:center;margin-top:auto">
            <div style="flex:none">${ART.qr(38)}</div>
            <p style="margin:0;font-size:7.5px;color:#555;line-height:1.4">
              掃描 QR Code 加入好友，即可獲得第一手優惠訊息，
              另有多種口味：藍莓、鳳梨、金桔、洛神……</p>
          </div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-top:18px">
        <span style="font-size:13px;font-weight:800;color:${C.muted}">在 IG 九宮格裡長這樣 →</span>
        <div class="baked" style="width:74px;height:74px;border-radius:8px;overflow:hidden;filter:blur(.4px);
          background:linear-gradient(145deg,#f6d9c5,#eab08c);display:grid;place-items:center">
          <div style="width:64px;height:64px;background:#fff;border-radius:4px;padding:3px">
            <div style="font-size:3px;line-height:1.3;color:#999">超級好吃手工草莓果醬 限時優惠 每瓶250元 買三送一
              本店堅持選用大湖新鮮草莓每日清晨採收一顆一顆手工去蒂小火慢熬三小時不添加香料與色素
              0912-345-678 台中市西屯區文華路100號 營業時間週一至週五</div>
          </div>
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['右邊刻意做成「塞爆的傳單」，並在下面示範它縮小成九宮格一格時的樣子——完全看不到。',
         '這一頁很有說服力，讓學員自己看到問題，不用講太多道理。'],
    ask:['問：你看得清楚右邊那張圖在寫什麼嗎？（大部分人會說看不清楚——這就是重點）'],
    do:[]
  }});

S({ part:'PART 5', time:'13:42', kind:'std', title:'Slide 34｜圖片上留什麼',
  html:`
  <div class="split" style="gap:48px;align-items:center">
    <div class="col">
      <p class="eyebrow sage" data-r>初學者原則</p>
      <h2 class="h" data-r style="font-size:40px;margin-bottom:22px">圖片上只留兩樣東西</h2>
      <div class="stack gap-m" data-r>
        <div class="card top-accent" style="padding:22px 26px">
          <p class="cap">第一樣</p>
          <p class="k" style="font-size:26px;margin:0">1 個主標題</p>
          <p class="v" style="margin-top:6px">例如：手作草莓果醬</p>
        </div>
        <div style="text-align:center;font-size:26px;color:${C.clay};font-weight:900">＋</div>
        <div class="card top-accent a-sage" style="padding:22px 26px">
          <p class="cap" style="color:${C.sage}">第二樣</p>
          <p class="k" style="font-size:26px;margin:0">1 個重點</p>
          <p class="v" style="margin-top:6px">例如：本週限量 20 瓶</p>
        </div>
      </div>
      <div class="callout sage" data-r style="margin-top:22px">${ART.chat(34,C.sage)}
        <span class="txt" style="font-size:18px">
          價格、電話、地址、故事，<br><b class="hl-s">全部放在貼文裡就好。</b></span></div>
    </div>
    <div class="col center" data-r>
      <div style="width:320px;height:320px;border-radius:18px;overflow:hidden;position:relative;
        box-shadow:var(--shadow-m);background:linear-gradient(150deg,#f7dfc8,#e9ab7f)">
        <div style="position:absolute;inset:0;display:grid;place-items:center">${ART.jar(190)}</div>
        <div style="position:absolute;left:0;right:0;bottom:0;padding:22px 24px;
          background:linear-gradient(transparent,rgba(40,24,16,.72))">
          <p style="margin:0;font-size:27px;font-weight:900;color:#fff;letter-spacing:-.01em">手作草莓果醬</p>
          <p style="margin:5px 0 0;font-size:16px;font-weight:800;color:rgba(255,255,255,.9)">本週限量 20 瓶</p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px;margin-top:18px">
        <span style="font-size:13px;font-weight:800;color:${C.muted}">縮成一格還是看得懂 →</span>
        <div class="baked" style="width:74px;height:74px;border-radius:8px;overflow:hidden;position:relative;
          background:linear-gradient(150deg,#f7dfc8,#e9ab7f);display:grid;place-items:center">
          ${ART.jar(46)}
          <div style="position:absolute;left:0;right:0;bottom:0;padding:5px;
            background:linear-gradient(transparent,rgba(40,24,16,.72))">
            <p style="margin:0;font-size:7px;font-weight:900;color:#fff;text-align:center">手作草莓果醬</p></div>
        </div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['跟上一頁對照著看，差別非常明顯。同樣縮成一格，這張還看得懂。',
         '＊不教 Canva 操作與排版技巧（那是「商品視覺設計」課程）。這裡只講「留多少字」。'],
    ask:['問：如果只能在圖上留一句話，你的商品要留哪一句？'],
    do:['請學員在講義 4「我要搭配哪張照片」旁邊，寫下要放在圖上的那一句話。']
  }, tag:{type:'do', label:'講義 4'}});
