/* =========================================================================
   slides-a.js — 開場 ＋ PART 1 Facebook 粉絲專頁
   全程操作導向：建立 → 設定 → 發文 → 看後台 → 讀數據
   ========================================================================= */
const DECK = [];
const S = o => DECK.push(o);

const dividerArt = a => `<div class="d-art">${a}</div>`;
const platPill = (k) => ({
  fb:`<span class="pill fb">${ART.fbIcon(20)} Facebook</span>`,
  ig:`<span class="pill ig">${ART.igIcon(20)} Instagram</span>`,
  ln:`<span class="pill ln">${ART.lnIcon(20)} LINE 官方帳號</span>`
}[k]);

/* =========================================================================
   封面
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'cover', title:'封面：社群平台操作入門',
  html:`
  <div class="cover-wrap">
    <div class="cover-l">
      <span class="kicker" data-r>西屯婦女培力 · 一日課程</span>
      <h1 data-r>社群平台<br>操作入門</h1>
      <p class="cs" data-r>今天不談理論。<br>我們一起把三個帳號<b>親手做出來</b>。</p>
      <div class="meta" data-r>
        <span class="pill fb">Facebook 粉絲專頁</span>
        <span class="pill ig">Instagram</span>
        <span class="pill ln">LINE 官方帳號</span>
      </div>
    </div>
    <div class="cover-r">
      <div class="anchor" data-r>
        ${igProfile({bio:'手工果醬 · 小批製作<br>用當季水果，一次煮一鍋'})}
        <div style="position:absolute;left:-78px;top:70px">${ART.fbIcon(58)}</div>
        <div style="position:absolute;left:-96px;top:236px">${ART.igIcon(58)}</div>
        <div style="position:absolute;left:-70px;top:400px">${ART.lnIcon(58)}</div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['開場第一句就講清楚：今天不是聽課，是「動手做」。下課時每個人手上會有三個真的帳號。',
         '請大家現在就把手機拿出來，整天都會用到。沒有安裝 FB／IG 的，現在先安裝。'],
    ask:['問：手機電量夠嗎？沒帶充電線的舉手（教室準備幾條備用）。'],
    do:['確認每人手機能上網、能收簡訊或 Email（等一下註冊帳號會用到）。']
  }});

/* =========================================================================
   今日流程
   ========================================================================= */
S({ part:'開場', time:'09:00', kind:'std', title:'今天的流程',
  html:`
  <div class="stack gap-m pad-tight">
    <div class="row" style="align-items:flex-end;gap:32px">
      <div style="flex:1">
        <p class="eyebrow" data-r>TODAY&nbsp;09:00–16:00</p>
        <h2 class="h" data-r style="font-size:38px;margin-bottom:6px">三個平台，各約一個半小時</h2>
        <p class="lead" data-r style="margin:0">每一段都是同樣四步：<b>建立 → 設定 → 發一次 → 看後台</b>。</p>
      </div>
      <div data-r style="display:flex;gap:12px;flex:none">
        ${platPill('fb')}${platPill('ig')}${platPill('ln')}
      </div>
    </div>
    <div>
      <div class="agenda" data-r>
        <div class="ag"><span class="t">09:00–09:10</span><span class="n">開場：今天要做出什麼</span></div>
        <div class="ag"><span class="t">09:10–10:10</span><span class="n">Facebook：建立粉專＋完整設定</span></div>
        <div class="ag rest"><span class="t">10:10–10:20</span><span class="n">休息</span></div>
        <div class="ag"><span class="t">10:20–11:05</span><span class="n">Facebook：發文操作＋後台數據</span></div>
        <div class="ag"><span class="t">11:05–12:00</span><span class="n">Instagram：建立＋切換專業帳號</span></div>
        <div class="ag rest"><span class="t">12:00–13:00</span><span class="n">午休</span></div>
        <div class="ag"><span class="t">13:00–13:50</span><span class="n">Instagram：發文、限動、Reels＋洞察</span></div>
        <div class="ag"><span class="t">13:50–14:25</span><span class="n">LINE：建立官方帳號＋基本設定</span></div>
        <div class="ag rest"><span class="t">14:25–14:35</span><span class="n">休息</span></div>
        <div class="ag"><span class="t">14:35–15:45</span><span class="n">LINE：訊息、圖文選單＋後台數據</span></div>
        <div class="ag"><span class="t">15:45–16:00</span><span class="n">三個帳號總檢查</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['強調節奏一致：每個平台都走同樣四步，學員第二、第三次會愈來愈順。',
         '提醒：做不完沒關係，講義上有完整步驟，回家可以照著補。'],
    ask:[],
    do:['發下三張操作講義（FB／IG／LINE 各一張）。']
  }});

/* =========================================================================
   今天結束時你會有什麼
   ========================================================================= */
S({ part:'開場', time:'09:05', kind:'std', title:'今天結束時，你會有這些',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>今天的目標</p>
      <h2 class="h" data-r style="font-size:38px">下課時，你手上會有 ——</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[[ART.fbIcon(46),'Facebook 粉絲專頁',
          ['已建立並命名','大頭貼、封面、簡介都填好','發過一篇貼文','看得懂洞察報告'],C.fb,'#eef4ff'],
         [ART.igIcon(46),'Instagram 專業帳號',
          ['已建立並切換成專業帳號','個人檔案填好','發過貼文與限時動態','看得懂洞察數據'],C.igB,'#fdeef4'],
         [ART.lnIcon(46),'LINE 官方帳號',
          ['已建立','歡迎訊息設定完成','群發過一則訊息','看得懂好友與開封數據'],'#03934a','#e6f8ee']]
        .map(([ic,t,list,c,bg])=>`
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:${bg};padding:20px 22px;display:flex;align-items:center;gap:12px">
            ${ic}<p class="k" style="margin:0;font-size:22px;color:${c}">${t}</p></div>
          <div style="padding:18px 22px 22px">
            ${list.map(x=>`<div class="yes" style="font-size:20px;margin-bottom:10px">
              <i>✓</i><span>${x}</span></div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.tap(34)}
      <span class="txt">全程<b class="hl">講師手機同步投影</b>，一個步驟一個步驟做。跟不上就舉手，我們會等你。</span></div>
  </div>`,
  notes:{
    say:['把「今天會拿到什麼」講得很具體，學員才有安全感。',
         '說明：三個平台不一定都要用，但今天都先建起來，之後要用隨時都在。',
         '講師手機務必投影，速度放到「最慢的那位跟得上」。'],
    ask:['問：三個裡面，你最想學會哪一個？'],
    do:[]
  }});

/* =========================================================================
   PART 1｜Facebook
   ========================================================================= */
S({ part:'PART 1', time:'09:10–11:05', kind:'divider', title:'PART 1｜Facebook 粉絲專頁',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>09:10 – 11:05 ｜ PART 1</span>
    <p class="pno" data-r>01</p>
    <h2 data-r>Facebook<br>粉絲專頁</h2>
    <p class="d-sub" data-r>建立 → 設定 → 發文 → 看後台。全部在手機上完成。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.fbIcon(120)}</div>`)}`,
  notes:{ say:['第一個平台走得最慢，因為學員還在熟悉節奏。後面兩個會快很多。'], ask:[], do:[] }});

S({ part:'PART 1', time:'09:10', kind:'std', title:'個人帳號 vs 粉絲專頁',
  html:`
  <div class="stack gap-m">
    <p class="eyebrow" data-r>開始前先分清楚</p>
    <div class="split" data-r style="gap:44px">
      <div class="card">
        <p class="cap">你現在有的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">個人帳號</p>
        <div class="art-box" style="height:110px;background:${C.paper2};margin-bottom:14px">
          ${ART.people(150,C.ink3)}</div>
        <ul class="list dense">
          <li>用你的名字，加朋友</li>
          <li>沒有後台數據</li>
          <li>好友上限 5,000 人</li>
        </ul>
      </div>
      <div class="card top-accent a-fb">
        <p class="cap" style="color:${C.fb}">今天要建立的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">粉絲專頁</p>
        <div class="art-box" style="height:110px;background:#eef4ff;margin-bottom:14px">
          ${ART.stall(180)}</div>
        <ul class="list dense">
          <li>用店名或商品名，別人可以追蹤</li>
          <li><b>有後台可以看數據</b></li>
          <li>追蹤人數沒有上限</li>
        </ul>
      </div>
    </div>
    <div class="callout" data-r>${ART.bulb(34)}
      <span class="txt">粉絲專頁是<b class="hl">用你的個人帳號去建立</b>的，不用另外註冊。<br>
      建好之後兩個是分開的，發文時要看清楚現在用哪個身分。</span></div>
  </div>`,
  notes:{
    say:['最重要的一句：粉專是「掛在」個人帳號底下建立的，不用新註冊、不用新 Email。很多人卡在這裡。',
         '也要說明：建立粉專不會讓朋友看到，也不會影響個人動態。'],
    ask:['問：有人已經有粉專了嗎？（有的話請他當小老師）'],
    do:['請大家先確認自己的個人 Facebook 可以正常登入。']
  }});

S({ part:'PART 1', time:'09:15', kind:'std', title:'建立粉絲專頁：四個步驟',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow" data-r>跟著做 · 講師手機同步投影</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">建立粉絲專頁，只要四步</h2>
    </div>
    <div data-r>${steps([
      { t:'打開選單', d:'點右下角「☰」',
        screen:`<div class="app-bar fb-bar"><span class="ttl">facebook</span>
          <span class="ic"><b style="font-size:13px">🔍</b><b style="font-size:15px;color:${C.clay}">☰</b></span></div>
        <div class="app-body grey" style="padding:10px">
          ${settingRows([['👤 個人檔案',''],['🚩 粉絲專頁',''],['👥 社團',''],['🕘 動態回顧','']],1)}
        </div>` },
      { t:'點「粉絲專頁」', d:'再點「建立新的粉絲專頁」',
        screen:`<div class="app-bar fb-bar"><span class="ttl">粉絲專頁</span></div>
        <div class="app-body grey" style="padding:10px">
          <div style="background:${C.fb};color:#fff;border-radius:9px;padding:11px;text-align:center;
            font-size:13px;font-weight:800;margin-bottom:8px">＋ 建立新的粉絲專頁</div>
          ${settingRows([['你管理的粉絲專頁',''],['你按讚的粉絲專頁','']])}
        </div>` },
      { t:'填名稱與類別', d:'名稱＝別人看到的店名',
        screen:`<div class="app-bar fb-bar"><span class="ttl">建立粉絲專頁</span></div>
        <div class="app-body" style="padding:12px">
          <p style="margin:0 0 5px;font-size:11px;color:#65676b;font-weight:750">粉絲專頁名稱</p>
          <div style="border:2px solid ${C.clay};border-radius:8px;padding:9px 11px;font-size:12.5px;
            font-weight:800;margin-bottom:12px">小芳手作果醬｜台中</div>
          <p style="margin:0 0 5px;font-size:11px;color:#65676b;font-weight:750">類別</p>
          <div style="border:1px solid #dcdfe3;border-radius:8px;padding:9px 11px;font-size:12.5px;
            font-weight:700;margin-bottom:14px">食品雜貨</div>
          <div style="background:${C.fb};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800">建立粉絲專頁</div>
        </div>` },
      { t:'完成', d:'接著換大頭貼與封面',
        screen:`<div class="app-bar fb-bar"><span class="ttl">小芳手作果醬｜台中</span></div>
        <div class="app-body">
          <div style="height:70px;background:linear-gradient(135deg,#f6d9c5,#eab08c)"></div>
          <div style="padding:12px 12px 0;text-align:center">
            <p style="margin:0;font-size:14px;font-weight:900">小芳手作果醬｜台中</p>
            <p style="margin:4px 0 10px;font-size:11px;color:#65676b;font-weight:700">食品雜貨</p>
            <div style="background:${C.fb};color:#fff;border-radius:7px;padding:8px;
              font-size:12px;font-weight:800">✓ 已建立</div>
          </div>
        </div>` }
    ])}</div>
  </div>`,
  notes:{
    say:['這一頁走非常慢，四個步驟分開示範，每一步都等全班跟上再往下。',
         '第 3 步「名稱」最容易卡住：公式＝「做什麼 ＋ 在哪裡」，例如「小芳手作果醬｜台中」。名稱之後可以改，但一段時間內只能改一次，先想好。',
         '「類別」選一個接近的就好，之後可以改，不要在這裡卡住。'],
    ask:['問：你的粉專要叫什麼？（請 2–3 位念出來，全班聽聽看懂不懂）'],
    do:['全班一起完成四個步驟，建立出自己的粉絲專頁。預計 15 分鐘。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 1', time:'09:30', kind:'std', title:'換大頭貼與封面',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>設定第一步</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:20px">大頭貼與封面怎麼換</h2>
      <div class="stack gap-s" data-r>
        ${[['1','點粉專首頁的大頭貼','會跳出「編輯大頭貼」'],
           ['2','選「從相簿選擇照片」','用手機裡現成的就好'],
           ['3','調整位置後按「儲存」','圓形範圍內看得到就行'],
           ['4','封面照片同樣做法','點封面 → 編輯封面']]
          .map(([n,t,d])=>`
          <div class="card flat" style="padding:14px 18px;border-radius:15px;display:flex;gap:14px;align-items:flex-start">
            <span class="num-badge" style="width:32px;height:32px;font-size:17px;border-radius:10px;background:${C.fb}">${n}</span>
            <span><b style="font-size:21px;font-weight:800;display:block">${t}</b>
            <span style="font-size:20px;color:${C.ink3};font-weight:600">${d}</span></span>
          </div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:18px;background:#eef4ff;border-left-color:${C.fb}">
        ${ART.camera(34,C.fb)}
        <span class="txt">大頭貼放<b>商品或本人</b>，不要放風景。<br>
        別人在留言區只看得到那個小圓圈。</span></div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar fb-bar"><span class="ttl">編輯粉絲專頁</span></div>
          <div class="app-body">
            <div style="height:82px;background:linear-gradient(135deg,#f6d9c5,#eab08c);position:relative">
              <span style="position:absolute;right:8px;bottom:8px;background:rgba(255,255,255,.92);
                border-radius:99px;padding:4px 9px;font-size:11px;font-weight:800">📷 編輯封面</span>
              <span style="position:absolute;left:13px;bottom:-26px;width:58px;height:58px;border-radius:99px;
                border:3px solid #fff;overflow:hidden;display:block">${avatar(ART.jar)}</span>
              <span style="position:absolute;left:56px;bottom:-26px;width:24px;height:24px;border-radius:99px;
                background:#e4e6eb;display:grid;place-items:center;font-size:11px;border:2px solid #fff">📷</span>
            </div>
            <div style="padding:34px 13px 0">
              <p style="margin:0;font-size:15px;font-weight:900">小芳手作果醬｜台中</p>
              <p style="margin:4px 0 0;font-size:11.5px;color:#65676b;font-weight:700">食品雜貨 · 台中市西屯區</p>
            </div>
          </div>`)}
        <span style="position:absolute;right:-88px;top:104px;background:${C.ink};color:${C.paper};
          font-size:20px;font-weight:800;padding:6px 12px;border-radius:99px;white-space:nowrap">封面</span>
        <span style="position:absolute;left:-96px;top:172px;background:${C.ink};color:${C.paper};
          font-size:20px;font-weight:800;padding:6px 12px;border-radius:99px;white-space:nowrap">大頭貼</span>
      </div>
    </div>
  </div>`,
  notes:{
    say:['照片不用另外拍，用手機相簿裡現成的就好。今天的目標是「有」，不是「美」。',
         '常見卡關：找不到相簿權限。iPhone 要允許「所有照片」，Android 要允許儲存空間權限。',
         '封面建議用橫式照片，直式的會被裁掉很多。'],
    ask:['問：有人相簿裡沒有商品照嗎？（現場拿桌上任何東西拍一張就好）'],
    do:['換好大頭貼與封面。完成的人舉手，助教過去確認。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 1', time:'09:40', kind:'std', title:'填簡介與聯絡資訊',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>設定第二步</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:14px">讓別人找得到你</h2>
      <p class="lead" data-r style="margin-bottom:16px">
        粉專首頁 →「編輯粉絲專頁資訊」，把這四欄填完。</p>
      <div class="stack gap-s" data-r>
        ${[['簡介','一句話說你做什麼','用當季水果小批製作的手工果醬，每週三西屯市集擺攤。'],
           ['電話','願意接電話再填','0912-345-678'],
           ['地址／地區','沒有店面就填區域','台中市西屯區'],
           ['網站／連結','可以放 LINE 或訂購表單','line.me/R/ti/p/@xiaofangjam']]
          .map(([k,d,eg])=>`
          <div class="card flat" style="padding:13px 18px;border-radius:15px">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:3px">
              <b style="font-size:21px;font-weight:850">${k}</b>
              <span style="font-size:20px;color:${C.ink3};font-weight:600">${d}</span></div>
            <p style="margin:0;font-size:20px;color:${C.clay};font-weight:700">例：${eg}</p>
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar fb-bar"><span class="ttl">編輯粉絲專頁資訊</span></div>
        <div class="app-body grey" style="padding:11px">
          ${settingRows([['粉絲專頁名稱','小芳手作果醬'],['類別','食品雜貨'],
                         ['簡介','用當季水果…'],['電話','0912-345-678'],
                         ['地址','台中市西屯區'],['網站','line.me/R/…'],
                         ['營業時間','未設定']],2)}
          <div style="background:${C.fb};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800;margin-top:8px">儲存</div>
        </div>`)}
      <p class="cap-t">四欄填完就算完成</p>
    </div>
  </div>`,
  notes:{
    say:['「簡介」最重要，別人搜尋時會看到。一句話講清楚：做什麼、在哪裡、什麼時候買得到。',
         '電話不想公開可以留空，但一定要留一個聯絡方式——LINE 連結最安全。',
         '沒有店面的人，地址填到「區」就好，不用填門牌。'],
    ask:['問：你的簡介要怎麼寫？（請一位念出來，全班聽完回答「他在賣什麼」）'],
    do:['四欄填完並儲存。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 1', time:'09:50', kind:'std', title:'認識粉專首頁',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>設定完成，先認識介面</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">粉專首頁有這五塊</h2>
      <div class="stack gap-s" data-r>
        ${[['①','封面與大頭貼','別人的第一印象'],
           ['②','名稱與類別','搜尋時會出現的字'],
           ['③','按鈕','可設成「傳送訊息」'],
           ['④','發文區','點這裡開始寫貼文'],
           ['⑤','專業主頁面板','看數據的入口']]
          .map(([n,k,v])=>`
          <div class="card flat" style="padding:13px 18px;border-radius:15px;display:flex;gap:14px;align-items:center">
            <span style="font-size:22px;font-weight:900;color:${C.fb};flex:none">${n}</span>
            <span><b style="font-size:21px;font-weight:800;display:block">${k}</b>
            <span style="font-size:20px;color:${C.ink3};font-weight:600">${v}</span></span>
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar fb-bar"><span class="ttl">小芳手作果醬｜台中</span></div>
          <div class="app-body" style="background:#f0f2f5">
            <div style="background:#fff;padding-bottom:11px">
              <div style="height:64px;background:linear-gradient(135deg,#f6d9c5,#eab08c)"></div>
              <div style="text-align:center;margin-top:-22px">
                <span style="width:48px;height:48px;border-radius:99px;border:3px solid #fff;
                  overflow:hidden;display:inline-block">${avatar(ART.jar)}</span>
                <p style="margin:5px 0 0;font-size:13.5px;font-weight:900">小芳手作果醬｜台中</p>
                <p style="margin:3px 0 8px;font-size:11px;color:#65676b;font-weight:700">食品雜貨 · 128 位追蹤者</p>
                <div style="display:flex;gap:5px;padding:0 11px">
                  <span style="flex:1;background:${C.fb};color:#fff;font-size:11.5px;font-weight:800;
                    text-align:center;padding:7px;border-radius:7px">傳送訊息</span>
                  <span style="flex:1;background:#e4e6eb;font-size:11.5px;font-weight:800;
                    text-align:center;padding:7px;border-radius:7px">編輯</span></div>
              </div>
            </div>
            <div style="background:#fff;margin-top:7px;padding:10px 11px;display:flex;gap:8px;align-items:center">
              <span style="width:28px;height:28px;border-radius:99px;overflow:hidden">${avatar(ART.jar)}</span>
              <span style="flex:1;background:#f0f2f5;border-radius:99px;padding:7px 12px;
                font-size:11.5px;color:#65676b;font-weight:650">在想些什麼？</span></div>
            <div style="background:#fff;margin-top:7px;padding:11px;display:flex;align-items:center;gap:8px">
              <span style="font-size:14px">📊</span>
              <span style="font-size:12px;font-weight:800">專業主頁面板</span>
              <span style="margin-left:auto;color:#b0b3b8">›</span></div>
          </div>`)}
        ${[['①','left:-46px;top:92px'],['②','left:-46px;top:176px'],['③','left:-46px;top:232px'],
           ['④','right:-46px;top:292px'],['⑤','right:-46px;top:350px']]
          .map(([t,pos])=>`<span style="position:absolute;${pos};width:34px;height:34px;
            display:grid;place-items:center;background:${C.fb};color:#fff;border-radius:99px;
            font-size:17px;font-weight:800">${t}</span>`).join('')}
      </div>
    </div>
  </div>`,
  notes:{
    say:['先讓學員認得介面，等一下講後台才不會迷路。',
         '第 ③「按鈕」建議設成「傳送訊息」，客人點一下就能私訊。',
         '第 ⑤「專業主頁面板」是這一段後半的重點，先讓大家找到它在哪。'],
    ask:['問：五個位置都找到了嗎？找不到的舉手。'],
    do:['請每個人在自己的粉專上指出這五個位置。']
  }, tag:{type:'ask', label:'一起找位置'}});

S({ part:'PART 1', time:'10:00', kind:'std', title:'Facebook 建立完成檢查',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>休息前先確認</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">這六項都做到了嗎？</h2>
      <div class="checks" data-r style="grid-template-columns:1fr">
        ${['粉絲專頁已經建立','名稱是「做什麼＋在哪裡」','大頭貼換好了','封面照片換好了',
           '簡介填好了','至少留了一個聯絡方式']
          .map(t=>`<div class="check"><span class="box"></span>${t}</div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:18px">${ART.hands(34,C.sage)}
        <span class="txt">已經完成的人，<b class="hl-s">請幫忙旁邊還沒好的同學</b>。</span></div>
    </div>
    <div class="col center" data-r>
      ${ART.stall(280)}
      <p class="cap-t">你的店面，已經開好了</p>
    </div>
  </div>`,
  notes:{
    say:['休息前一定要做這個確認，否則後面的操作會卡住。',
         '沒完成的人記下卡在哪一項，休息時間助教一對一協助。'],
    ask:['問：六項都打勾的請舉手。'],
    do:['逐項確認。10:10 休息十分鐘。']
  }, tag:{type:'do', label:'成果確認'}});

/* ── 發文 ───────────────────────────────────────────────────────────── */
S({ part:'PART 1', time:'10:20', kind:'std', title:'發第一篇貼文',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow" data-r>休息回來 · 開始發文</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">發一篇貼文，四個步驟</h2>
    </div>
    <div data-r>${steps([
      { t:'點發文區', d:'「在想些什麼？」',
        screen:`<div class="app-bar fb-bar"><span class="ttl">小芳手作果醬</span></div>
        <div class="app-body grey" style="padding:10px">
          <div style="background:#fff;border-radius:9px;padding:11px;display:flex;gap:8px;align-items:center">
            <span style="width:28px;height:28px;border-radius:99px;overflow:hidden">${avatar(ART.jar)}</span>
            <span style="flex:1;background:#f0f2f5;border-radius:99px;padding:7px 11px;font-size:11.5px;
              color:#65676b;font-weight:650;outline:2px solid ${C.clay}">在想些什麼？</span></div>
        </div>` },
      { t:'打字', d:'寫幾句話就好',
        screen:`<div class="app-bar fb-bar"><span class="ttl" style="color:${C.ink};font-size:14px">建立貼文</span>
          <span style="background:#c9ccd1;color:#fff;font-size:11px;font-weight:800;padding:5px 12px;
            border-radius:7px">發布</span></div>
        <div class="app-body" style="padding:12px">
          <p style="font-size:12px;line-height:1.65;color:#1c1e21;font-weight:550;margin:0">
            今天早上收到一批新鮮草莓，下午開始煮果醬 🍓<br>週三西屯市集見！</p>
        </div>` },
      { t:'加照片', d:'點「相片／影片」',
        screen:`<div class="app-bar fb-bar"><span class="ttl" style="color:${C.ink};font-size:14px">建立貼文</span>
          <span style="background:${C.fb};color:#fff;font-size:11px;font-weight:800;padding:5px 12px;
            border-radius:7px">發布</span></div>
        <div class="app-body" style="padding:12px">
          <p style="font-size:11.5px;line-height:1.6;margin:0 0 9px">今天早上收到一批新鮮草莓 🍓</p>
          <div style="height:86px;border-radius:9px;overflow:hidden;margin-bottom:10px">${TH.jam}</div>
          <div style="display:flex;align-items:center;gap:8px;padding:9px 4px;border-top:1px solid #f0f2f5;
            font-size:12px;font-weight:750;outline:2px solid ${C.clay};border-radius:6px">🖼 相片／影片</div>
        </div>` },
      { t:'按發布', d:'完成',
        screen:`<div class="app-bar fb-bar"><span class="ttl">小芳手作果醬</span></div>
        <div class="app-body grey">
          <div class="fb-post" style="border-bottom:none">
            <div class="fb-head">
              <span style="width:30px;height:30px;border-radius:99px;overflow:hidden;flex:none">${avatar(ART.jar)}</span>
              <span><span class="fb-name">小芳手作果醬</span><br><span class="fb-meta">剛剛 · 🌐</span></span></div>
            <div class="fb-text">今天早上收到一批新鮮草莓 🍓</div>
          </div>
          <div style="height:76px;overflow:hidden">${TH.jam}</div>
          <div style="background:#fff;padding:8px 0"><div class="fb-acts">
            <span>👍 讚</span><span>💬 留言</span><span>↗ 分享</span></div></div>
        </div>` }
    ])}</div>
  </div>`,
  notes:{
    say:['第一篇不要求寫得好，重點是「按下發布」這個動作做過一次。',
         '常見卡關：打完字找不到「發布」。提醒發布鍵在右上角，沒打字時是灰色的。',
         '不敢公開發的人，可以先發一句「測試」，等一下再刪掉。'],
    ask:[],
    do:['每個人發出一篇貼文，內容不限。預計 10 分鐘。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 1', time:'10:32', kind:'std', title:'發文後可以做什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>發出去之後</p>
      <h2 class="h" data-r style="font-size:36px">這四件事一定要會</h2>
    </div>
    <div class="cards c4" data-r style="gap:20px">
      ${[['編輯','打錯字了','點貼文右上角「⋯」→ 編輯貼文',ART.note(46,C.clay),C.clayTint],
         ['刪除','發錯想收回','點「⋯」→ 刪除貼文',ART.warn(46,C.gold),C.goldSoft],
         ['置頂','想讓它排最前面','點「⋯」→ 置頂於粉絲專頁',ART.star(46,C.sage),C.sageSoft],
         ['回留言','有人留言','點留言 →「回覆」→ 送出',ART.chat(46,C.plum),C.plumSoft]]
        .map(([k,q,a,ic,bg])=>`
        <div class="card" style="padding:22px 20px">
          <div style="width:58px;height:58px;border-radius:16px;background:${bg};display:grid;
            place-items:center;margin-bottom:12px">${ic}</div>
          <p class="k" style="font-size:23px;margin-bottom:4px">${k}</p>
          <p style="font-size:20px;font-weight:750;color:${C.ink3};margin:0 0 9px">${q}</p>
          <p class="v">${a}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.bulb(34)}
      <span class="txt">全部都在同一個地方：<b class="hl">貼文右上角的「⋯」</b>。記住這三個點，就不怕發錯。</span></div>
  </div>`,
  notes:{
    say:['「可以改、可以刪」是讓學員敢發文的關鍵，一定要示範給他們看。',
         '示範時真的改一次、刪一次，讓他們親眼看到不可怕。',
         '回留言要強調：有人留言一定要回，回一句「謝謝」都好。'],
    ask:['問：有人發過文之後想改卻不知道怎麼改嗎？'],
    do:['請每個人把剛剛那篇貼文編輯一次，再置頂。']
  }, tag:{type:'do', label:'手機實作'}});

/* ── 後台 ───────────────────────────────────────────────────────────── */
S({ part:'PART 1', time:'10:40', kind:'std', title:'後台在哪裡',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow" data-r>今天的重點之一</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">數據在「專業主頁面板」</h2>
      <div class="stack gap-s" data-r>
        ${[['1','回到粉專首頁'],
           ['2','往下滑，找到「專業主頁面板」'],
           ['3','點進去'],
           ['4','再點「查看洞察報告」']]
          .map(([n,t])=>`
          <div class="card flat" style="padding:14px 20px;border-radius:15px;display:flex;gap:15px;align-items:center">
            <span class="num-badge" style="width:34px;height:34px;font-size:18px;border-radius:10px;background:${C.fb}">${n}</span>
            <p class="k" style="margin:0;font-size:22px">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:16px;background:#eef4ff;border-left-color:${C.fb}">
        ${ART.search(34,C.fb)}
        <span class="txt">找不到的人：粉專首頁往下滑，<br>通常在「編輯」按鈕再下面一點。</span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar fb-bar"><span class="ttl">專業主頁面板</span></div>
        <div class="app-body grey" style="padding:11px">
          <div style="background:#fff;border-radius:10px;padding:12px;margin-bottom:8px">
            <p style="margin:0 0 9px;font-size:12px;font-weight:900">最近 28 天</p>
            <div style="display:flex;gap:8px">
              <div style="flex:1;text-align:center"><b style="display:block;font-size:17px;font-weight:900">1,284</b>
                <span style="font-size:10px;color:#65676b;font-weight:700">觸及人數</span></div>
              <div style="flex:1;text-align:center"><b style="display:block;font-size:17px;font-weight:900">96</b>
                <span style="font-size:10px;color:#65676b;font-weight:700">互動次數</span></div>
              <div style="flex:1;text-align:center"><b style="display:block;font-size:17px;font-weight:900">＋12</b>
                <span style="font-size:10px;color:#65676b;font-weight:700">新追蹤者</span></div>
            </div>
          </div>
          ${settingRows([['📊 查看洞察報告',''],['✏️ 建立貼文',''],['💬 收件匣',''],
                         ['⚙️ 粉絲專頁設定','']],0)}
        </div>`)}
      <p class="cap-t">點「查看洞察報告」看完整數據</p>
    </div>
  </div>`,
  notes:{
    say:['Facebook 介面常改版，位置可能跟投影的不完全一樣。請學員以「找到有數字的那一頁」為目標，不要背路徑。',
         '如果現場版本不同，就用學員的手機當範例投影，比照著我的畫面更有用。',
         '提醒：粉專剛建立，數據會是 0 或很小，這很正常，重點是知道去哪裡看。'],
    ask:['問：找到「專業主頁面板」的請舉手。'],
    do:['全班一起進入洞察報告畫面。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 1', time:'10:48', kind:'std', title:'看懂這四個數字',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow" data-r>洞察報告 · 只要看這四個</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">其他數字先不用管</h2>
    </div>
    <div class="cards c4" data-r style="gap:18px">
      ${[['觸及人數','1,284','多少人「看到」你的貼文',
          '不等於有人點進來，只是出現在他畫面上。',C.fb,'#eef4ff'],
         ['互動次數','96','多少人按讚、留言、分享',
          '比觸及重要，代表真的有人在乎。',C.clay,C.clayTint],
         ['新追蹤者','＋12','這段期間多了幾個人追蹤',
          '慢慢增加就是好事，不用跟別人比。',C.sage,C.sageSoft],
         ['貼文成效','每篇','每一篇各自的表現',
          '可以看出哪一種內容大家比較喜歡。',C.gold,C.goldSoft]]
        .map(([k,v,q,d,c,bg])=>`
        <div class="card" style="padding:20px 18px">
          <p class="cap" style="color:${c};margin-bottom:5px">${k}</p>
          <p style="margin:0 0 9px;font-size:38px;font-weight:900;color:${C.ink};letter-spacing:-.02em">${v}</p>
          <div style="height:1px;background:${bg};margin-bottom:10px"></div>
          <p style="margin:0 0 7px;font-size:21px;font-weight:800;color:${C.ink};line-height:1.3">${q}</p>
          <p class="v" style="font-size:20px">${d}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r style="padding:15px 24px">${ART.bulb(32,C.gold)}
      <span class="txt" style="line-height:1.4">
        <b>觸及</b>＝有多少人經過你的店門口，<b>互動</b>＝有多少人真的走進來。互動比觸及重要。</span></div>
  </div>`,
  notes:{
    say:['四個數字逐一解釋，用「經過門口 vs 走進來」的比喻，中高齡學員最好懂。',
         '重點提醒：不要看到觸及一兩百就沮喪。剛開始的粉專，20 個人看到都算正常。',
         '互動率不用講數學，只要說「100 個人看到，有 5 個人按讚就很不錯了」。'],
    ask:['問：你現在的觸及是多少？互動是多少？（讓學員念自己的數字，破除比較心態）'],
    do:['在講義上記下今天的四個數字，一個月後回來對照。']
  }, tag:{type:'do', label:'記下數字'}});

S({ part:'PART 1', time:'10:56', kind:'std', title:'數字看完之後要怎麼調整',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>這才是看後台的意義</p>
      <h2 class="h" data-r style="font-size:36px">三種常見情況，怎麼改</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[readCard('低','觸及低、互動也低',
          '幾乎沒有人看到。多半是發文太少，或發的時間沒人在滑手機。',
          '固定一週發 2–3 篇，改在<b>晚上 8–10 點</b>發發看。',C.clay,C.clayTint),
         readCard('中','觸及還可以、互動很低',
          '有人看到，但沒有人想理你。內容多半「只在賣東西」。',
          '下一篇改成<b>問問題</b>或<b>分享製作過程</b>，先不要放價格。',C.gold,C.goldSoft),
         readCard('高','某一篇特別高',
          '這種內容大家喜歡，這是最重要的線索。',
          '把那一篇<b>再做一次</b>：同樣主題、同樣拍法，換個商品。',C.sage,C.sageSoft)]
        .join('')}
    </div>
    <div class="callout" data-r>${ART.trend(38)}
      <span class="txt">看數據只要回答一個問題：<b class="hl">下一篇要跟哪一篇一樣？</b></span></div>
  </div>`,
  notes:{
    say:['這一頁是「看得到後台」跟「會用後台」的分界線。前面教怎麼找數字，這裡教數字要拿來做什麼。',
         '最實用的是第三種：找出表現最好的那一篇，然後複製它。不用分析原因，照著再做一次就好。',
         '提醒學員：一個月看一次就夠，不要每天看，會焦慮。'],
    ask:['問：如果你的貼文都沒什麼人看，你會先改哪一件事？（引導到發文頻率與發文時間）'],
    do:['請學員看自己的貼文成效，找出目前表現最好的一篇。']
  }, tag:{type:'ask', label:'一起判讀'}});

S({ part:'PART 1', time:'11:00', kind:'std', title:'Facebook 總檢查',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow" data-r>Facebook 這一段結束</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">八項全部打勾</h2>
      <div class="checks" data-r style="grid-template-columns:1fr 1fr;gap:11px 16px">
        ${['粉絲專頁已建立','大頭貼、封面完成','簡介與聯絡方式完成','找得到發文的位置',
           '發過一篇貼文','會編輯與刪除貼文','找得到專業主頁面板','看得懂四個數字']
          .map(t=>`<div class="check" style="font-size:20px;padding:12px 15px">
            <span class="box" style="width:22px;height:22px"></span>${t}</div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:18px">${ART.star(32,C.sage)}
        <span class="txt">第一個平台完成了。<b class="hl-s">接下來兩個會快很多</b>，因為步驟都一樣。</span></div>
    </div>
    <div class="col center" data-r>
      ${ART.fbIcon(110)}
      <p class="cap-t" style="margin-top:16px">PART 1 完成</p>
    </div>
  </div>`,
  notes:{
    say:['收尾時強調「步驟都一樣」，降低學員對後面兩個平台的焦慮。',
         '沒完成的項目請記在講義上，午休或下課後補。'],
    ask:['問：八項都打勾的請舉手。'],
    do:['逐項確認，助教協助補完。']
  }, tag:{type:'do', label:'成果確認'}});
