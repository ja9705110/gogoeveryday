/* =========================================================================
   slides-b.js — PART 2 Instagram ＋ PART 3 LINE 官方帳號 ＋ 收尾
   ========================================================================= */

/* =========================================================================
   PART 2｜Instagram
   ========================================================================= */
S({ part:'PART 2', time:'11:05–13:50', kind:'divider', title:'PART 2｜Instagram',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>11:05 – 13:50 ｜ PART 2</span>
    <p class="pno" data-r>02</p>
    <h2 data-r>Instagram</h2>
    <p class="d-sub" data-r>同樣四步：建立 → 設定 → 發文 → 看後台。<br>
      多一個關鍵動作：切換成「專業帳號」。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.igIcon(120)}</div>`)}`,
  notes:{ say:['提醒學員：IG 只有不到一半的人用過，這一段會從「怎麼註冊」開始，完全沒用過也跟得上。'], ask:[], do:[] }});

S({ part:'PART 2', time:'11:05', kind:'std', title:'兩種 IG 帳號',
  html:`
  <div class="stack gap-m">
    <p class="eyebrow plum" data-r>開始前先知道</p>
    <div class="split" data-r style="gap:44px">
      <div class="card">
        <p class="cap">一般人用的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">個人帳號</p>
        <div class="art-box" style="height:110px;background:${C.paper2};margin-bottom:14px">
          ${ART.people(150,C.ink3)}</div>
        <ul class="list dense">
          <li>發照片給朋友看</li>
          <li><b>沒有任何數據</b></li>
          <li>沒有聯絡按鈕</li>
        </ul>
      </div>
      <div class="card top-accent a-ig">
        <p class="cap" style="color:${C.igB}">今天要用的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">專業帳號</p>
        <div class="art-box" style="height:110px;background:#fdeef4;margin-bottom:14px">
          ${ART.window(200)}</div>
        <ul class="list dense">
          <li>一樣是免費的，隨時可以切回去</li>
          <li><b>有洞察報告可以看數據</b></li>
          <li>可以放「傳送訊息」按鈕</li>
        </ul>
      </div>
    </div>
    <div class="callout" data-r style="background:#fdeef4;border-left-color:${C.igB}">
      ${ART.warn(34,C.igB)}
      <span class="txt"><b style="color:${C.igB}">沒有切換成專業帳號，就完全看不到數據。</b><br>
      這是今天這一段最重要的一個動作。</span></div>
  </div>`,
  notes:{
    say:['這一頁是 IG 段落的關鍵。很多人用了 IG 好幾年，都不知道有「專業帳號」，所以從來沒看過數據。',
         '強調三件事：免費、隨時可以切回去、切了之後朋友看不出差別。這樣他們才敢切。'],
    ask:['問：有人已經在用 IG 了嗎？知道自己是哪一種帳號嗎？'],
    do:[]
  }});

S({ part:'PART 2', time:'11:12', kind:'std', title:'建立 Instagram 帳號',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow plum" data-r>已經有帳號的人，直接跳到下一頁</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">還沒有帳號？四步就好</h2>
    </div>
    <div data-r>${steps([
      { t:'下載並打開 App', d:'點「建立新帳號」',
        screen:`<div style="height:100%;display:grid;place-items:center;background:#fff;padding:16px">
          <div style="text-align:center">
            ${ART.igIcon(52)}
            <p style="margin:12px 0 16px;font-size:15px;font-weight:900">Instagram</p>
            <div style="background:${C.igB};color:#fff;border-radius:8px;padding:9px 16px;
              font-size:12px;font-weight:800">建立新帳號</div>
            <p style="margin:12px 0 0;font-size:11px;color:#8a8d91;font-weight:700">已有帳號？登入</p>
          </div></div>` },
      { t:'填手機或 Email', d:'會收到一組驗證碼',
        screen:`<div class="app-bar ig-bar"><span class="ttl">建立帳號</span></div>
        <div class="app-body" style="padding:14px">
          <p style="margin:0 0 6px;font-size:11px;color:#737373;font-weight:750">手機號碼</p>
          <div style="border:2px solid ${C.clay};border-radius:8px;padding:10px;font-size:12.5px;
            font-weight:800;margin-bottom:12px">0912-345-678</div>
          <div style="background:${C.igB};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800">下一步</div>
          <p style="margin:12px 0 0;font-size:10.5px;color:#8a8d91;line-height:1.5;font-weight:650">
            簡訊會收到 6 位數字，填進去就好。</p>
        </div>` },
      { t:'設定使用者名稱', d:'英文，之後可以改',
        screen:`<div class="app-bar ig-bar"><span class="ttl">使用者名稱</span></div>
        <div class="app-body" style="padding:14px">
          <div style="border:2px solid ${C.clay};border-radius:8px;padding:10px;font-size:12.5px;
            font-weight:800;margin-bottom:8px">xiaofang.jam</div>
          <p style="margin:0 0 12px;font-size:10.5px;color:#2f855a;font-weight:750">✓ 可以使用</p>
          <div style="background:${C.igB};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800">下一步</div>
        </div>` },
      { t:'完成', d:'接著切換成專業帳號',
        screen:`<div class="app-bar ig-bar"><span class="ttl">xiaofang.jam</span></div>
        <div class="app-body">
          <div class="ig-prof">
            <div class="ig-top">
              <span class="ring"><span>${avatar(ART.jar)}</span></span>
              <span class="ig-stats">
                <div><b>0</b><span>貼文</span></div><div><b>0</b><span>粉絲</span></div>
                <div><b>0</b><span>追蹤中</span></div></span>
            </div>
            <div style="background:#efefef;border-radius:7px;padding:8px;text-align:center;
              font-size:11px;font-weight:800;margin-top:8px">✓ 帳號建立完成</div>
          </div>
        </div>` }
    ])}</div>
  </div>`,
  notes:{
    say:['已經有 IG 的人請他們幫忙旁邊沒有的人，不要讓他們閒著。',
         '「使用者名稱」用英文，建議跟粉專名稱有關聯，例如 xiaofang.jam。可以之後再改，不要卡住。',
         '常見卡關：簡訊驗證碼沒收到。請他們檢查是否有擋簡訊，或改用 Email 註冊。'],
    ask:[],
    do:['沒有帳號的人現在建立。預計 12 分鐘。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 2', time:'11:25', kind:'std', title:'切換成專業帳號',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>這一步一定要做</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">切換成專業帳號</h2>
      <div class="stack gap-s" data-r>
        ${[['1','點右下角自己的頭像'],
           ['2','點右上角「☰」'],
           ['3','進入「設定和隱私」'],
           ['4','找到「帳號類型和工具」'],
           ['5','點「切換為專業帳號」'],
           ['6','類別選一個接近的，完成']]
          .map(([n,t])=>`
          <div class="card flat" style="padding:12px 18px;border-radius:14px;display:flex;gap:14px;align-items:center">
            <span class="num-badge" style="width:32px;height:32px;font-size:17px;border-radius:10px;
              background:${C.igB}">${n}</span>
            <p class="k" style="margin:0;font-size:21px">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:16px;background:#fdeef4;border-left-color:${C.igB}">
        ${ART.bulb(32,C.igB)}
        <span class="txt">中間會問你要「創作者」還是「商家」——<br>
        <b>選「商家」</b>就好，兩個差別很小。</span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar ig-bar"><span class="ttl">帳號類型和工具</span></div>
        <div class="app-body" style="padding:12px">
          <div style="background:#fdeef4;border-radius:10px;padding:12px;margin-bottom:12px;
            outline:2.5px solid ${C.igB}">
            <p style="margin:0 0 3px;font-size:13px;font-weight:900;color:${C.igB}">切換為專業帳號</p>
            <p style="margin:0;font-size:10.5px;color:#737373;font-weight:650;line-height:1.5">
              免費取得洞察報告、聯絡按鈕等工具</p>
          </div>
          ${settingRows([['新增新的專業帳號',''],['帳號隱私設定','公開']])}
          <div style="margin-top:14px;background:#f6f7f8;border-radius:10px;padding:11px">
            <p style="margin:0;font-size:10.5px;color:#737373;font-weight:700;line-height:1.6">
              切換後隨時可以改回一般帳號，<br>朋友那邊看起來完全一樣。</p>
          </div>
        </div>`)}
      <p class="cap-t">切換後才會出現「洞察報告」</p>
    </div>
  </div>`,
  notes:{
    say:['六個步驟一步一步等，這是 IG 段最容易走丟的地方。IG 的設定選單層級比較深。',
         'IG 版本不同，選單文字可能是「帳號類型和工具」或「帳號」。請學員找關鍵字「專業帳號」。',
         '切換過程中會問要不要連結 Facebook 粉專——可以連，連了之後發文能同步到 FB，但今天先跳過，不要增加複雜度。'],
    ask:['問：切換完成的人，去個人檔案看看，有沒有多出「洞察報告」？'],
    do:['全班完成切換。這是後面看數據的前提，一定要確認每個人都完成。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 2', time:'11:38', kind:'std', title:'填好個人檔案五個欄位',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>設定</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:14px">個人檔案有五欄要填</h2>
      <p class="lead" data-r style="margin-bottom:16px">個人檔案 →「編輯個人檔案」</p>
      <div class="stack gap-s" data-r>
        ${[['大頭貼','商品或本人',''],
           ['名稱','中文，可以搜尋得到','小芳手作果醬'],
           ['使用者名稱','英文帳號','xiaofang.jam'],
           ['個人簡介','做什麼、賣給誰、在哪裡','手工果醬 · 小批製作／台中西屯'],
           ['連結','放 LINE 或訂購表單','line.me/R/ti/p/@xiaofangjam']]
          .map(([k,d,eg])=>`
          <div class="card flat" style="padding:12px 18px;border-radius:14px">
            <div style="display:flex;align-items:baseline;gap:10px">
              <b style="font-size:21px;font-weight:850">${k}</b>
              <span style="font-size:20px;color:${C.ink3};font-weight:600">${d}</span></div>
            ${eg?`<p style="margin:2px 0 0;font-size:20px;color:${C.plum};font-weight:700">例：${eg}</p>`:''}
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar ig-bar"><span class="ttl">編輯個人檔案</span></div>
        <div class="app-body" style="padding:12px">
          <div style="text-align:center;margin-bottom:12px">
            <span class="ring"><span>${avatar(ART.jar)}</span></span>
            <p style="margin:6px 0 0;font-size:11px;color:${C.igB};font-weight:800">更換大頭貼照片</p>
          </div>
          ${settingRows([['名稱','小芳手作果醬'],['使用者名稱','xiaofang.jam'],
                         ['個人簡介','手工果醬 · 小批製作'],['連結','line.me/R/…'],
                         ['性別','不透露']],2)}
        </div>`)}
      <p class="cap-t">連結只有專業帳號才好用</p>
    </div>
  </div>`,
  notes:{
    say:['「名稱」跟「使用者名稱」不一樣，一定要講清楚：名稱可以是中文、可以被搜尋；使用者名稱是英文的 @帳號。',
         '個人簡介是唯一可以放連結的地方，所以 LINE 一定要放這裡。IG 貼文內文的網址不能點。',
         '沒有 LINE 官方帳號連結的人先空著，下午做完 LINE 再回來補。'],
    ask:['問：你的簡介要怎麼寫？（沿用早上 Facebook 那一句就好）'],
    do:['五欄填完並儲存。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 2', time:'11:48', kind:'std', title:'認識 IG 介面',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>先認得按鈕在哪</p>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:12px">下面五個按鈕</h2>
      <div class="stack gap-s" data-r>
        ${[['🏠','首頁','看別人發的內容'],
           ['🔍','搜尋','找人、找主題、找 Hashtag'],
           ['➕','發布','貼文、限動、Reels 都從這裡'],
           ['🎬','Reels','看短影片的地方'],
           ['👤','個人檔案','你的頁面，數據也在這裡']]
          .map(([e,k,v])=>`
          <div class="card flat" style="padding:9px 16px;border-radius:13px;display:flex;gap:13px;align-items:center">
            <span style="font-size:24px;flex:none">${e}</span>
            <span><b style="font-size:21px;font-weight:800;display:block;line-height:1.25">${k}</b>
            <span style="font-size:20px;color:${C.ink3};font-weight:600;line-height:1.3">${v}</span></span>
          </div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:14px;padding:14px 20px;background:#fdeef4;border-left-color:${C.igB}">
        ${ART.tap(30,C.igB)}
        <span class="txt" style="font-size:20px">今天只會用到<b style="color:${C.igB}">「＋」跟「👤」</b>這兩個。</span></div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar ig-bar"><span class="ttl">xiaofang.jam</span></div>
          <div class="app-body">
            <div class="ig-prof">
              <div class="ig-top">
                <span class="ring"><span>${avatar(ART.jar)}</span></span>
                <span class="ig-stats">
                  <div><b>3</b><span>貼文</span></div><div><b>12</b><span>粉絲</span></div>
                  <div><b>28</b><span>追蹤中</span></div></span></div>
              <div class="ig-bio"><b>小芳手作果醬</b><br>手工果醬 · 小批製作<br>
                <span class="lk">line.me/R/ti/p/@xiaofangjam</span></div>
              <div class="ig-grid">${thumbSet('jam','cookie','cake')}</div>
            </div>
          </div>
          <div style="height:44px;border-top:1px solid #efefef;display:flex;align-items:center;
            justify-content:space-around;background:#fff;font-size:18px">
            <span>🏠</span><span>🔍</span>
            <span style="outline:2.5px solid ${C.clay};border-radius:6px;padding:0 4px">➕</span>
            <span>🎬</span><span style="outline:2.5px solid ${C.clay};border-radius:99px;padding:1px 3px">👤</span>
          </div>`, {sm:true})}
      </div>
      <p class="cap-t">最下面那一排就是主選單</p>
    </div>
  </div>`,
  notes:{
    say:['IG 跟 FB 最大的差別：所有功能都在最下面那一排，不在右上角的選單。',
         '請學員用手指依序點一遍五個按鈕，感受一下每個頁面長什麼樣，再回到個人檔案。'],
    ask:['問：五個按鈕都點過一遍了嗎？'],
    do:['依序點過五個按鈕，最後回到個人檔案。']
  }, tag:{type:'ask', label:'一起找位置'}});

S({ part:'PART 2', time:'11:56', kind:'std', title:'Instagram 建立完成檢查',
  html:`
  <div class="split w-left">
    <div class="col">
      <p class="eyebrow plum" data-r>午休前確認</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">這五項都完成了嗎？</h2>
      <div class="checks" data-r style="grid-template-columns:1fr">
        ${['Instagram 帳號已建立','<b>已經切換成專業帳號</b>','大頭貼換好了',
           '名稱與個人簡介填好了','知道「＋」跟「個人檔案」在哪']
          .map(t=>`<div class="check"><span class="box"></span>${t}</div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:18px;background:#fdeef4;border-left-color:${C.igB}">
        ${ART.warn(32,C.igB)}
        <span class="txt">第 2 項<b style="color:${C.igB}">沒完成的人請先舉手</b>，<br>
        下午的數據那一段會用到。</span></div>
    </div>
    <div class="col center" data-r>
      ${ART.igIcon(110)}
      <p class="cap-t" style="margin-top:16px">12:00 午休，13:00 準時回來</p>
    </div>
  </div>`,
  notes:{
    say:['午休前務必確認「已切換專業帳號」這一項，下午才有數據可以看。',
         '沒完成的人請留下來，午休前五分鐘一對一處理。'],
    ask:['問：五項都打勾的請舉手。'],
    do:['逐項確認。12:00 午休。']
  }, tag:{type:'do', label:'成果確認'}});

/* ── 午休 ───────────────────────────────────────────────────────────── */
S({ part:'午休', time:'12:00–13:00', kind:'divider', title:'午休 12:00–13:00',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>12:00 – 13:00</span>
    <p class="pno" data-r style="font-size:110px">午休</p>
    <h2 data-r style="font-size:46px">下午繼續動手</h2>
    <p class="d-sub" data-r>
      吃飯前先做一件事：<br>
      拍一張你商品的照片，下午發文會用到。</p>
  </div>
  ${dividerArt(ART.jar(280))}`,
  notes:{ say:['請學員午休時拍一張照片，下午發文直接用，省下很多時間。',
               '提醒 13:00 準時開始。'], ask:[], do:['午休時拍一張商品照。'] }});

/* ── IG 發文 ────────────────────────────────────────────────────────── */
S({ part:'PART 2', time:'13:00', kind:'std', title:'發一篇 IG 貼文',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow plum" data-r>下午第一件事</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">發貼文，四個步驟</h2>
    </div>
    <div data-r>${steps([
      { t:'點「＋」', d:'選「貼文」',
        screen:`<div class="app-bar ig-bar"><span class="ttl">新貼文</span></div>
        <div class="app-body" style="padding:12px">
          ${settingRows([['📷 貼文',''],['⭕ 限時動態',''],['🎬 Reels','']],0)}
        </div>` },
      { t:'選照片', d:'從相簿挑一張',
        screen:`<div class="app-bar ig-bar"><span class="ttl">最近項目</span>
          <span style="font-size:12px;color:${C.igB};font-weight:800">下一步</span></div>
        <div class="app-body" style="padding:8px">
          <div style="height:98px;border-radius:8px;overflow:hidden;margin-bottom:6px;
            outline:2.5px solid ${C.clay}">${TH.jam}</div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">
            ${['cookie','cake','stall'].map(k=>`<div style="aspect-ratio:1;overflow:hidden">${TH[k]}</div>`).join('')}
          </div>
        </div>` },
      { t:'寫幾句話', d:'加上 Hashtag',
        screen:`<div class="app-bar ig-bar"><span class="ttl">新貼文</span>
          <span style="font-size:12px;color:${C.igB};font-weight:800">分享</span></div>
        <div class="app-body" style="padding:11px">
          <div style="display:flex;gap:8px;margin-bottom:9px">
            <div style="width:44px;height:44px;border-radius:6px;overflow:hidden;flex:none">${TH.jam}</div>
            <p style="margin:0;font-size:11px;line-height:1.55;font-weight:600">
              今天煮的草莓果醬 🍓<br>一鍋只做 20 瓶</p></div>
          <div style="border-top:1px solid #efefef;padding-top:8px">
            <p style="margin:0;font-size:10.5px;color:${C.plum};font-weight:750">
              #台中果醬 #手工果醬 #西屯市集</p></div>
        </div>` },
      { t:'按「分享」', d:'完成',
        screen:`<div class="app-bar ig-bar"><span class="ttl">xiaofang.jam</span></div>
        <div class="app-body">
          <div class="ig-prof">
            <div class="ig-top">
              <span class="ring"><span>${avatar(ART.jar)}</span></span>
              <span class="ig-stats">
                <div><b>1</b><span>貼文</span></div><div><b>12</b><span>粉絲</span></div>
                <div><b>28</b><span>追蹤中</span></div></span></div>
            <div class="ig-grid">${thumbSet('jam')}</div>
          </div>
        </div>` }
    ])}</div>
  </div>`,
  notes:{
    say:['用午休拍的照片直接發，不用重拍。',
         'Hashtag 打「#」之後 IG 會自動跳出建議，選一個就好。今天先放 3–5 個，不用糾結。',
         '常見卡關：找不到「分享」按鈕。在右上角，有些版本寫「完成」。'],
    ask:[],
    do:['每個人發出一篇 IG 貼文。預計 10 分鐘。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 2', time:'13:12', kind:'std', title:'發限時動態與 Reels',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>另外兩種發布方式</p>
      <h2 class="h" data-r style="font-size:36px">限時動態與 Reels</h2>
    </div>
    <div class="split" data-r style="gap:40px">
      <div class="card top-accent a-gold">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          ${ART.clock(40,C.gold)}<p class="k" style="margin:0;font-size:24px">限時動態</p></div>
        <div class="stack gap-s">
          ${['點「＋」→ 選「限時動態」','拍照或選照片','點「Aa」可以加字','點左下「你的限時動態」送出']
            .map((t,i)=>`<div style="display:flex;gap:12px;align-items:center">
              <span class="num-badge" style="width:30px;height:30px;font-size:16px;border-radius:9px;
                background:${C.gold}">${i+1}</span>
              <p class="v" style="margin:0;font-weight:700;color:${C.ink}">${t}</p></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v"><b>24 小時後自動消失</b>，所以隨手拍就好，不用完美。</p>
      </div>
      <div class="card top-accent a-plum">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          ${ART.play(40,C.plum)}<p class="k" style="margin:0;font-size:24px">Reels 短影片</p></div>
        <div class="stack gap-s">
          ${['點「＋」→ 選「Reels」','按住圓鈕錄 5–10 秒','放開後點「下一步」','寫一句話 → 分享']
            .map((t,i)=>`<div style="display:flex;gap:12px;align-items:center">
              <span class="num-badge" style="width:30px;height:30px;font-size:16px;border-radius:9px;
                background:${C.plum}">${i+1}</span>
              <p class="v" style="margin:0;font-weight:700;color:${C.ink}">${t}</p></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v"><b>不用跳舞、不用露臉。</b>錄你正在做的事就好。</p>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.bulb(32,C.gold)}
      <span class="txt">今天先各做一次就好。<b>做過一次，回家才敢再做。</b></span></div>
  </div>`,
  notes:{
    say:['限動跟 Reels 的操作起點都是同一個「＋」，這點要強調，學員才不會覺得又多學了兩個東西。',
         'Reels 錄影時建議把手機立在桌上，用桌上任何東西錄 5 秒就好，目的是「做過一次」。',
         '不用教剪輯、配樂、特效——那是後面的攝影課。'],
    ask:['問：限動跟貼文差在哪？（答：限動 24 小時後消失）'],
    do:['每個人發一則限時動態，並錄一支 5 秒的 Reels。預計 12 分鐘。']
  }, tag:{type:'do', label:'手機實作'}});

/* ── IG 後台 ───────────────────────────────────────────────────────── */
S({ part:'PART 2', time:'13:26', kind:'std', title:'IG 的數據在哪裡',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow plum" data-r>專業帳號才看得到</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">洞察報告怎麼進去</h2>
      <div class="stack gap-s" data-r>
        ${[['1','點右下角自己的頭像'],
           ['2','點「專業主頁面板」或「洞察報告」'],
           ['3','進去就看得到數字了']]
          .map(([n,t])=>`
          <div class="card flat" style="padding:14px 20px;border-radius:15px;display:flex;gap:15px;align-items:center">
            <span class="num-badge" style="width:34px;height:34px;font-size:18px;border-radius:10px;
              background:${C.igB}">${n}</span>
            <p class="k" style="margin:0;font-size:22px">${t}</p></div>`).join('')}
      </div>
      <div class="callout" data-r style="margin-top:16px;background:#fdeef4;border-left-color:${C.igB}">
        ${ART.warn(32,C.igB)}
        <span class="txt">看不到「洞察報告」＝<b style="color:${C.igB}">還沒切換成專業帳號</b>。<br>
        回上一段的六個步驟重做一次。</span></div>
      <p class="tiny" data-r style="margin-top:12px">
        ＊剛建立的帳號數字會很小或是 0，這很正常，重點是知道去哪裡看。</p>
    </div>
    <div class="col center" data-r>
      ${insightScreen({ title:'洞察報告', tone:C.igB, rows:[
        ['觸及帳號數','342','＋18%'],
        ['互動次數','56','＋7%'],
        ['個人檔案造訪','41','＋12%'],
        ['粉絲人數','＋9','']
      ]})}
      <p class="cap-t">最近 7 天的數字</p>
    </div>
  </div>`,
  notes:{
    say:['IG 的洞察入口比 FB 好找，就在個人檔案上方。',
         '如果有學員看不到，99% 是沒切換成專業帳號，直接帶他重做。',
         '再次提醒：剛建立的帳號數字很小很正常，不要氣餒。'],
    ask:['問：找到洞察報告的請舉手。'],
    do:['全班一起進入洞察報告。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 2', time:'13:34', kind:'std', title:'IG 要看懂這四個數字',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow plum" data-r>洞察報告 · 只看這四個</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">跟 Facebook 的概念一樣</h2>
    </div>
    <div class="cards c4" data-r style="gap:18px">
      ${[['觸及帳號數','342','多少「人」看到你',
          '注意是人數，不是次數。同一個人看兩次只算一個。',C.igB,'#fdeef4'],
         ['互動次數','56','按讚＋留言＋分享＋儲存',
          'IG 多一個「儲存」，代表他想留著以後看，很有價值。',C.clay,C.clayTint],
         ['個人檔案造訪','41','多少人點進你的頁面',
          '看到貼文後想多了解你的人，這些是潛在客人。',C.sage,C.sageSoft],
         ['粉絲增減','＋9','這段期間多了幾個粉絲',
          '如果掉粉，通常是發太多廣告。',C.gold,C.goldSoft]]
        .map(([k,v,q,d,c,bg])=>`
        <div class="card" style="padding:20px 18px">
          <p class="cap" style="color:${c};margin-bottom:5px">${k}</p>
          <p style="margin:0 0 9px;font-size:38px;font-weight:900;color:${C.ink};letter-spacing:-.02em">${v}</p>
          <div style="height:1px;background:${bg};margin-bottom:10px"></div>
          <p style="margin:0 0 7px;font-size:21px;font-weight:800;color:${C.ink};line-height:1.3">${q}</p>
          <p class="v" style="font-size:20px">${d}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:15px 24px;background:#fdeef4;border-left-color:${C.igB}">
      ${ART.star(32,C.igB)}
      <span class="txt" style="line-height:1.4">
        IG 最值得看的是<b style="color:${C.igB}">「個人檔案造訪」</b>——<br>
        會點進來看你是誰的人，才是真的有興趣的人。</span></div>
  </div>`,
  notes:{
    say:['跟早上 Facebook 那四個數字對照著講，學員會發現概念一模一樣，只是名稱不同。',
         '「儲存」是 IG 特有的，值得多講一句：有人儲存代表他想之後回來看，通常是食譜、教學、商品清單這類內容。',
         '「個人檔案造訪」是最接近生意的數字，因為連結（LINE）就放在個人檔案。'],
    ask:['問：對照早上 FB 的數字，你覺得哪一個平台的人比較多？'],
    do:['在講義上記下 IG 的四個數字。']
  }, tag:{type:'do', label:'記下數字'}});

S({ part:'PART 2', time:'13:42', kind:'std', title:'IG 數據怎麼調整',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow plum" data-r>看完之後要做什麼</p>
      <h2 class="h" data-r style="font-size:36px">三種情況，三個動作</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[readCard('①','觸及很低',
          '幾乎沒有人看到。IG 靠 Hashtag 跟 Reels 帶新的人進來。',
          '下一篇多加幾個<b>地區 Hashtag</b>（#台中甜點），並試著發一支 Reels。',C.igB,'#fdeef4'),
         readCard('②','有人看、沒人點進來',
          '照片有被看到，但沒人想認識你。多半是<b>第一張照片看不出在賣什麼</b>。',
          '換一張<b>商品清楚的照片</b>當封面，簡介也改成一看就懂。',C.gold,C.goldSoft),
         readCard('③','有人造訪、但沒人聯絡',
          '有人點進來了，卻找不到怎麼跟你買。',
          '把 <b>LINE 連結放到個人簡介</b>，並在貼文最後寫「詳情請看首頁連結」。',C.sage,C.sageSoft)]
        .join('')}
    </div>
    <div class="callout" data-r>${ART.hands(36)}
      <span class="txt">第三種最常見，也最可惜——<b class="hl">人來了，卻沒有留下聯絡方式</b>。<br>
      這就是等一下 LINE 官方帳號要解決的事。</span></div>
  </div>`,
  notes:{
    say:['三種情況對應三個具體動作，不要講抽象的「要經營」。',
         '第三種順勢帶到下一段 LINE：人來了要有地方留下來。這是整天唯一保留的觀念連結。',
         '再次提醒：一個月看一次數據就好。'],
    ask:['問：你覺得自己會是哪一種情況？'],
    do:['請學員檢查：個人簡介裡有沒有放聯絡方式？']
  }, tag:{type:'ask', label:'一起判讀'}});

/* =========================================================================
   PART 3｜LINE 官方帳號
   ========================================================================= */
S({ part:'PART 3', time:'13:50–15:45', kind:'divider', title:'PART 3｜LINE 官方帳號',
  html:`
  <div class="wrap">
    <span class="d-time" data-r>13:50 – 15:45 ｜ PART 3</span>
    <p class="pno" data-r>03</p>
    <h2 data-r>LINE 官方帳號</h2>
    <p class="d-sub" data-r>你每天都在用 LINE，但這是另一個不一樣的東西。</p>
  </div>
  ${dividerArt(`<div style="transform:scale(1.05)">${ART.lnIcon(120)}</div>`)}`,
  notes:{ say:['全班 30 人都用 LINE，所以這一段學員最有安全感。但「官方帳號」是另一個 App，要講清楚。'], ask:[], do:[] }});

S({ part:'PART 3', time:'13:50', kind:'std', title:'私人 LINE vs 官方帳號',
  html:`
  <div class="stack gap-m">
    <p class="eyebrow sage" data-r>先分清楚這兩個</p>
    <div class="split" data-r style="gap:44px">
      <div class="card">
        <p class="cap">你每天在用的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">私人 LINE</p>
        <div class="art-box" style="height:110px;background:${C.paper2};margin-bottom:14px">
          ${ART.people(150,C.ink3)}</div>
        <ul class="list dense">
          <li>家人、朋友、群組</li>
          <li>客人訊息會被家人群組洗掉</li>
          <li>不能一次通知所有客人</li>
        </ul>
      </div>
      <div class="card top-accent a-ln">
        <p class="cap" style="color:#03934a">今天要建立的</p>
        <p class="k" style="font-size:28px;margin-bottom:14px">LINE 官方帳號</p>
        <div class="art-box" style="height:110px;background:#e6f8ee;margin-bottom:14px">
          ${ART.counter(200)}</div>
        <ul class="list dense">
          <li>客人訊息獨立一個地方，不會漏</li>
          <li><b>可以一次群發給所有好友</b></li>
          <li>有後台可以看數據</li>
        </ul>
      </div>
    </div>
    <div class="callout sage" data-r>${ART.bulb(34,C.sage)}
      <span class="txt">官方帳號是<b class="hl-s">另一個 App</b>，叫「LINE Official Account Manager」。<br>
      用你現在的 LINE 帳號就能登入，不用重新註冊。</span></div>
  </div>`,
  notes:{
    say:['最重要的一句：要另外下載一個 App。很多人以為在原本的 LINE 裡面找，結果找不到。',
         '強調免費：個人也可以開，不用公司行號、不用統一編號。',
         '用「訊息被家人群組洗掉」這個例子，幾乎每個用私人 LINE 接單的人都遇過。'],
    ask:['問：有誰用私人 LINE 在接單？有沒有漏接過客人訊息？'],
    do:[]
  }});

S({ part:'PART 3', time:'13:58', kind:'std', title:'建立 LINE 官方帳號',
  html:`
  <div class="stack gap-m pad-tight">
    <div>
      <p class="eyebrow sage" data-r>跟著做</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:4px">建立官方帳號，四個步驟</h2>
    </div>
    <div data-r>${steps([
      { t:'下載 App', d:'搜尋「LINE 官方帳號」',
        screen:`<div style="height:100%;display:grid;place-items:center;background:#fff;padding:14px">
          <div style="text-align:center">
            ${ART.lnIcon(52)}
            <p style="margin:12px 0 4px;font-size:13px;font-weight:900">LINE 官方帳號</p>
            <p style="margin:0 0 14px;font-size:10.5px;color:#8a8d91;font-weight:700">LY Corporation</p>
            <div style="background:${C.ln};color:#fff;border-radius:99px;padding:7px 20px;
              font-size:12px;font-weight:800">取得</div>
          </div></div>` },
      { t:'用 LINE 登入', d:'不用另外註冊',
        screen:`<div class="app-bar ln-bar"><span class="ttl">登入</span></div>
        <div class="app-body" style="padding:16px;display:grid;place-items:center">
          <div style="text-align:center">
            <div style="background:${C.ln};color:#fff;border-radius:8px;padding:11px 18px;
              font-size:12.5px;font-weight:800;margin-bottom:10px">使用 LINE 帳號登入</div>
            <p style="margin:0;font-size:10.5px;color:#8a8d91;font-weight:700;line-height:1.5">
              用你手機裡現在的 LINE<br>直接登入就好</p>
          </div></div>` },
      { t:'填帳號名稱', d:'客人看到的名字',
        screen:`<div class="app-bar ln-bar"><span class="ttl">建立帳號</span></div>
        <div class="app-body" style="padding:13px">
          <p style="margin:0 0 5px;font-size:11px;color:#65676b;font-weight:750">帳號名稱</p>
          <div style="border:2px solid ${C.clay};border-radius:8px;padding:9px 11px;font-size:12.5px;
            font-weight:800;margin-bottom:11px">小芳手作果醬</div>
          <p style="margin:0 0 5px;font-size:11px;color:#65676b;font-weight:750">業種</p>
          <div style="border:1px solid #dcdfe3;border-radius:8px;padding:9px 11px;font-size:12.5px;
            font-weight:700;margin-bottom:13px">餐飲・美食</div>
          <div style="background:${C.ln};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800">確認</div>
        </div>` },
      { t:'完成', d:'進入管理後台',
        screen:`<div class="app-bar ln-bar"><span class="ttl">小芳手作果醬</span></div>
        <div class="app-body" style="padding:11px;background:#f6f7f8">
          <div style="background:#fff;border-radius:10px;padding:13px;text-align:center;margin-bottom:8px">
            <span style="width:44px;height:44px;border-radius:99px;overflow:hidden;display:inline-block">
              ${avatar(ART.jar)}</span>
            <p style="margin:7px 0 2px;font-size:12.5px;font-weight:900">小芳手作果醬</p>
            <p style="margin:0;font-size:10px;color:#8a8d91;font-weight:700">好友 0 人</p>
          </div>
          ${settingRows([['📣 群發訊息',''],['💬 聊天',''],['⚙️ 設定','']])}
        </div>` }
    ])}</div>
  </div>`,
  notes:{
    say:['第 1 步最容易卡：App 名稱是「LINE 官方帳號」，圖示是綠底白色對話框，跟一般 LINE 很像但不一樣。請投影 App Store 畫面給大家看。',
         '第 2 步登入時會跳回 LINE 授權，按「同意」就好。',
         '第 3 步「帳號名稱」建議跟粉專同名，客人才認得出是同一家。'],
    ask:[],
    do:['全班完成建立。預計 15 分鐘，這段最容易卡在下載 App。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'14:14', kind:'std', title:'認識 LINE 後台',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>建好之後先認識介面</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">後台有這五個地方</h2>
      <div class="stack gap-s" data-r>
        ${[['①','好友人數','有幾個客人加了你'],
           ['②','群發訊息','一次通知所有好友'],
           ['③','聊天','客人私訊你的地方'],
           ['④','圖文選單','客人一打開就看到的按鈕'],
           ['⑤','設定','改名稱、大頭貼、歡迎訊息']]
          .map(([n,k,v])=>`
          <div class="card flat" style="padding:13px 18px;border-radius:15px;display:flex;gap:14px;align-items:center">
            <span style="font-size:22px;font-weight:900;color:${C.sage};flex:none">${n}</span>
            <span><b style="font-size:21px;font-weight:800;display:block">${k}</b>
            <span style="font-size:20px;color:${C.ink3};font-weight:600">${v}</span></span>
          </div>`).join('')}
      </div>
    </div>
    <div class="col center" data-r>
      <div class="anchor">
        ${phone(`
          <div class="app-bar ln-bar"><span class="ttl">小芳手作果醬</span></div>
          <div class="app-body" style="padding:11px;background:#f6f7f8">
            <div style="background:#fff;border-radius:10px;padding:13px;text-align:center;margin-bottom:8px">
              <span style="width:42px;height:42px;border-radius:99px;overflow:hidden;display:inline-block">
                ${avatar(ART.jar)}</span>
              <p style="margin:6px 0 2px;font-size:12.5px;font-weight:900">小芳手作果醬</p>
              <p style="margin:0;font-size:11px;color:${C.ln};font-weight:800">好友 12 人</p>
            </div>
            ${settingRows([['📣 群發訊息',''],['💬 聊天','2'],['🎨 圖文選單',''],
                           ['📊 分析',''],['⚙️ 設定','']])}
          </div>`)}
        ${[['①','left:-46px;top:150px'],['②','right:-46px;top:196px'],['③','right:-46px;top:238px'],
           ['④','right:-46px;top:280px'],['⑤','right:-46px;top:364px']]
          .map(([t,pos])=>`<span style="position:absolute;${pos};width:34px;height:34px;
            display:grid;place-items:center;background:${C.sage};color:#fff;border-radius:99px;
            font-size:17px;font-weight:800">${t}</span>`).join('')}
      </div>
    </div>
  </div>`,
  notes:{
    say:['LINE 後台比 FB、IG 單純，全部功能都在同一頁，這點可以讓學員放心。',
         '請學員把五個位置都點一遍，感受一下。'],
    ask:['問：五個位置都找到了嗎？'],
    do:['依序點過五個位置。']
  }, tag:{type:'ask', label:'一起找位置'}});

S({ part:'PART 3', time:'14:35', kind:'std', title:'設定歡迎訊息',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>休息回來 · 最值得先設定的功能</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:14px">歡迎訊息</h2>
      <p class="lead" data-r style="margin-bottom:16px">
        客人一加你好友，<b>自動</b>就會收到這則訊息。<br>
        等於 24 小時幫你回話。</p>
      <div class="stack gap-s" data-r>
        ${[['1','設定 →「加入好友的歡迎訊息」'],
           ['2','把預設的字刪掉'],
           ['3','寫上你自己的話'],
           ['4','按「儲存」']]
          .map(([n,t])=>`
          <div class="card flat" style="padding:13px 20px;border-radius:15px;display:flex;gap:14px;align-items:center">
            <span class="num-badge" style="width:32px;height:32px;font-size:17px;border-radius:10px;
              background:${C.sage}">${n}</span>
            <p class="k" style="margin:0;font-size:21px">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:16px">${ART.bulb(32,C.sage)}
        <span class="txt">結構：<b>謝謝你 → 我是做什麼的 → 想買怎麼跟我說</b>。<br>
        30 字以內就夠。</span></div>
    </div>
    <div class="col center" data-r>
      ${lnChat([
        {side:'in', t:'謝謝你加入 😊<br><br>這裡是小芳手作果醬，<br>用當季水果小批製作。<br><br>想訂購請直接回覆<br>「我要訂購」，<br>我會盡快回覆你！'}
      ], {title:'小芳手作果醬'})}
      <p class="cap-t">客人加好友就會自動收到</p>
    </div>
  </div>`,
  notes:{
    say:['這是 LINE 官方帳號最實用、最容易看到效果的功能，一定要每個人都設定完成。',
         '示範時請一位學員加講師的官方帳號，讓全班看到訊息真的自動跳出來，效果很好。',
         '提醒：不要寫太長，也不要一次傳很多則，客人會覺得被騷擾。'],
    ask:['問：客人加你好友，你最想跟他說什麼？'],
    do:['每個人寫好並儲存自己的歡迎訊息。完成後兩兩互加好友，測試看看。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'14:50', kind:'std', title:'群發訊息與圖文選單',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow sage" data-r>兩個常用功能</p>
      <h2 class="h" data-r style="font-size:36px">通知客人，跟做一個選單</h2>
    </div>
    <div class="split" data-r style="gap:40px">
      <div class="card top-accent a-ln">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          ${ART.megaphone(40,C.sage)}<p class="k" style="margin:0;font-size:24px">群發訊息</p></div>
        <div class="stack gap-s">
          ${['點「群發訊息」→「建立」','打字（30–80 字）','可以加照片','點「傳送」']
            .map((t,i)=>`<div style="display:flex;gap:12px;align-items:center">
              <span class="num-badge" style="width:30px;height:30px;font-size:16px;border-radius:9px;
                background:${C.sage}">${i+1}</span>
              <p class="v" style="margin:0;font-weight:700;color:${C.ink}">${t}</p></div>`).join('')}
        </div>
        <div class="rule"></div>
        <p class="v"><b>一次送給所有好友。</b>免費方案每月有則數上限，所以有事再發。</p>
      </div>
      <div class="card top-accent a-gold">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
          ${ART.tap(38,C.gold)}<p class="k" style="margin:0;font-size:24px">圖文選單</p></div>
        <div style="margin-bottom:12px">${richMenu()}</div>
        <p class="v">客人打開聊天室，<b>最下面固定出現的按鈕</b>。<br>
          設定：設定 →「圖文選單」→ 選版型 → 填文字。</p>
      </div>
    </div>
    <div class="callout gold" data-r style="padding:14px 22px">${ART.warn(30,C.gold)}
      <span class="txt" style="font-size:20px;line-height:1.4">圖文選單今天<b>知道有這個功能就好</b>；等你有 30–50 個好友再回來設定。</span></div>
  </div>`,
  notes:{
    say:['群發一定要現場做一次，因為「按下傳送」對很多人是心理門檻。',
         '提醒免費方案的則數上限（依 LINE 當期政策，通常是每月數百則），所以不要天天發。一則訊息送給 100 個好友算 100 則。',
         '圖文選單不要現場逐步教設定，會吃掉太多時間，讓他們知道有這個功能、大概長什麼樣就好。'],
    ask:['問：你第一則群發訊息想跟客人說什麼？'],
    do:['每個人群發一則訊息給自己的好友（現場互加的同學）。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'15:05', kind:'std', title:'QR Code 在哪裡',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>怎麼讓客人加你</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">找到你的 QR Code</h2>
      <div class="stack gap-s" data-r>
        ${[['1','設定 →「帳號設定」'],
           ['2','找到「加入好友的方法」'],
           ['3','會看到你的 QR Code 與網址'],
           ['4','截圖存起來，或用「分享」傳出去']]
          .map(([n,t])=>`
          <div class="card flat" style="padding:13px 20px;border-radius:15px;display:flex;gap:14px;align-items:center">
            <span class="num-badge" style="width:32px;height:32px;font-size:17px;border-radius:10px;
              background:${C.sage}">${n}</span>
            <p class="k" style="margin:0;font-size:21px">${t}</p></div>`).join('')}
      </div>
      <div class="callout sage" data-r style="margin-top:16px">${ART.qr(38,C.sage)}
        <span class="txt">把 QR Code <b class="hl-s">印出來放大</b>，貼在商品包裝、<br>
        市集攤位、名片上。最常見的錯誤是印太小。</span></div>
    </div>
    <div class="col center" data-r>
      ${phone(`
        <div class="app-bar ln-bar"><span class="ttl">加入好友的方法</span></div>
        <div class="app-body" style="padding:14px;background:#f6f7f8">
          <div style="background:#fff;border-radius:12px;padding:18px;text-align:center">
            <div style="display:grid;place-items:center;margin-bottom:10px">${ART.qr(96)}</div>
            <p style="margin:0 0 3px;font-size:12px;font-weight:900">小芳手作果醬</p>
            <p style="margin:0;font-size:10.5px;color:#8a8d91;font-weight:700">@xiaofangjam</p>
          </div>
          <div style="background:${C.ln};color:#fff;border-radius:8px;padding:10px;text-align:center;
            font-size:12.5px;font-weight:800;margin-top:10px">分享</div>
        </div>`)}
      <p class="cap-t">截圖存到相簿最方便</p>
    </div>
  </div>`,
  notes:{
    say:['請每個人現在就截圖存到相簿，回家才找得到。',
         '實用建議：把 QR Code 存到相簿後，設成「我的最愛」，需要時一秒找到。',
         '也可以把 IG 個人簡介的連結換成這個 LINE 網址，把兩個平台串起來。'],
    ask:['問：你會把 QR Code 放在哪裡？'],
    do:['截圖存到相簿。有 IG 的人順便把連結貼到 IG 個人簡介。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'15:18', kind:'std', title:'LINE 的數據在哪裡',
  html:`
  <div class="split art">
    <div class="col">
      <p class="eyebrow sage" data-r>後台數據</p>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:16px">點「分析」就看得到</h2>
      <div class="cards c2" data-r style="gap:14px;margin-bottom:16px">
        ${[['好友人數','12','總共有幾個人加你'],
           ['新增好友','＋4','這週新加入的'],
           ['封鎖人數','1','有人不想收你的訊息'],
           ['訊息則數','86','這個月已用掉的額度']]
          .map(([k,v,d])=>`
          <div class="card flat" style="padding:15px 18px;border-radius:15px">
            <p class="cap" style="color:${C.sage};margin-bottom:3px">${k}</p>
            <p style="margin:0 0 4px;font-size:32px;font-weight:900;color:${C.ink}">${v}</p>
            <p class="v" style="font-size:20px">${d}</p>
          </div>`).join('')}
      </div>
      <div class="callout sage">${ART.bulb(32,C.sage)}
        <span class="txt">最重要的是<b class="hl-s">「好友人數」跟「封鎖人數」</b>。<br>
        好友慢慢增加、封鎖很少，就是健康的。</span></div>
    </div>
    <div class="col center" data-r>
      ${insightScreen({ title:'分析', tone:C.ln, rows:[
        ['好友人數','12','＋4'],
        ['封鎖','1',''],
        ['訊息則數','86',''],
        ['開封率','62%','']
      ]})}
      <p class="cap-t">好友、封鎖、訊息、開封率</p>
    </div>
  </div>`,
  notes:{
    say:['LINE 的數據最單純，四個數字就夠。',
         '「封鎖」這個數字要講清楚：有人封鎖是正常的，1–2 個不用在意。但如果群發一次就被封鎖好幾個，代表發太頻繁或內容不對。',
         '「訊息則數」關係到免費額度，要提醒學員留意。'],
    ask:['問：現場互加之後，你的好友人數是幾個？'],
    do:['進入「分析」頁面，找到這四個數字。']
  }, tag:{type:'do', label:'手機實作'}});

S({ part:'PART 3', time:'15:30', kind:'std', title:'LINE 數據怎麼調整',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow sage" data-r>看完之後要做什麼</p>
      <h2 class="h" data-r style="font-size:36px">三種情況，三個動作</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[readCard('①','好友一直沒增加',
          '沒有人知道你有官方帳號。多半是 QR Code 沒有出現在客人看得到的地方。',
          '把 QR Code <b>印出來貼在包裝與攤位</b>，並放進 FB 粉專與 IG 簡介。',C.sage,C.sageSoft),
         readCard('②','群發後有人封鎖',
          '發太頻繁，或每次都在賣東西。',
          '改成<b>一個月 1–2 則</b>，而且要發<b>對客人有用的事</b>（到貨、休假、優惠）。',C.gold,C.goldSoft),
         readCard('③','開封率很低',
          '訊息有送到，但沒人點開。通常是第一句話看不出重點。',
          '第一句直接講重點：<b>「本週開放預訂」</b>，不要用「大家好」開頭。',C.clay,C.clayTint)]
        .join('')}
    </div>
    <div class="callout" data-r>${ART.hands(36)}
      <span class="txt">LINE 的好友是<b class="hl">最珍貴的名單</b>——<br>
      FB、IG 的粉絲你聯絡不到，LINE 好友你隨時找得到。</span></div>
  </div>`,
  notes:{
    say:['三個情況都很具體，尤其第二種：很多人一開官方帳號就天天發，好友馬上跑光。',
         '「開封率」的意思要解釋：100 個人收到，有幾個人點開來看。',
         '最後一句是整天唯一一句「觀念」，但因為前面都做過了，學員這時候會很有感。'],
    ask:['問：你打算多久發一次群發訊息？（引導到一個月 1–2 次）'],
    do:[]
  }, tag:{type:'ask', label:'一起判讀'}});

/* =========================================================================
   收尾
   ========================================================================= */
S({ part:'收尾', time:'15:45', kind:'std', title:'三個帳號總檢查',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>今天的成果</p>
      <h2 class="h" data-r style="font-size:36px">三個帳號，全部確認一次</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[[ART.fbIcon(40),'Facebook 粉絲專頁',C.fb,'#eef4ff',
          ['粉專已建立','大頭貼、封面、簡介完成','發過一篇貼文','找得到專業主頁面板']],
         [ART.igIcon(40),'Instagram',C.igB,'#fdeef4',
          ['帳號已建立','已切換成專業帳號','發過貼文與限動','找得到洞察報告']],
         [ART.lnIcon(40),'LINE 官方帳號','#03934a','#e6f8ee',
          ['官方帳號已建立','歡迎訊息已設定','群發過一則訊息','QR Code 已存到相簿']]]
        .map(([ic,t,c,bg,list])=>`
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:${bg};padding:16px 20px;display:flex;align-items:center;gap:11px">
            ${ic}<p class="k" style="margin:0;font-size:21px;color:${c}">${t}</p></div>
          <div style="padding:16px 20px 20px">
            ${list.map(x=>`<div class="check" style="font-size:20px;padding:10px 13px;margin-bottom:8px;
              box-shadow:none;background:${C.paper}">
              <span class="box" style="width:20px;height:20px;border-color:${c}"></span>${x}</div>`).join('')}
          </div>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.hands(34)}
      <span class="txt">有任何一項沒完成的，<b class="hl">現在舉手</b>，我們留下來一起處理完再走。</span></div>
  </div>`,
  notes:{
    say:['這是今天最重要的一頁。逐項唸出來，讓每個人自己核對。',
         '沒完成的一定要留下來處理，不要讓學員帶著半成品回家——回家就不會再動了。'],
    ask:['問：十二項全部打勾的請舉手。'],
    do:['逐項確認，助教一對一補完。']
  }, tag:{type:'do', label:'成果確認'}});

S({ part:'收尾', time:'15:52', kind:'std', title:'回家後每週做三件事',
  html:`
  <div class="stack gap-m">
    <div class="center" style="text-align:center">
      <p class="eyebrow" data-r style="justify-content:center">回家之後</p>
      <h2 class="h" data-r style="font-size:36px">每週只要做這三件事</h2>
    </div>
    <div class="cards c3" data-r style="gap:24px">
      ${[['1','發 2 篇','拍你正在做的東西就好。<br>不用寫很多字。',ART.camera(52,C.clay),C.clayTint,C.clay],
         ['2','回留言與訊息','有人留言就回，回一句「謝謝」都好。',ART.chat(52,C.sage),C.sageSoft,C.sage],
         ['3','月底看一次數據','找出最好的那一篇，<br>下個月照著再做一次。',ART.trend(58,C.gold),C.goldSoft,C.gold]]
        .map(([n,k,v,ic,bg,c])=>`
        <div class="card" style="text-align:center;padding:30px 22px">
          <div style="display:flex;justify-content:center;margin-bottom:14px">${ic}</div>
          <span class="num-badge" style="background:${c};margin-bottom:12px">${n}</span>
          <p class="k" style="font-size:26px;margin-bottom:8px">${k}</p>
          <p class="v">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.clock(34,C.gold)}
      <span class="txt">一週大約<b>30 分鐘</b>就夠。<br>
      做得少沒關係，<b class="hl">固定</b>比較重要。</span></div>
  </div>`,
  notes:{
    say:['給一個做得到的最小承諾：一週 30 分鐘。太高的目標學員回家就放棄了。',
         '第 3 點呼應今天的後台教學：看數據不是天天看，是一個月一次，而且只做一個動作——複製表現最好的那一篇。'],
    ask:['問：這三件事，你覺得哪一件最難？（多半是「固定」）'],
    do:['請學員在講義上寫下：我打算星期幾發文。']
  }});

S({ part:'收尾', time:'15:58', kind:'std', title:'最後一句話',
  html:`
  <div class="center stack" style="text-align:center;gap:30px">
    <div data-r style="display:flex;gap:22px;justify-content:center">
      ${ART.fbIcon(64)}${ART.igIcon(64)}${ART.lnIcon(64)}
    </div>
    <p class="mega sm" data-r style="max-width:960px;line-height:1.4;font-size:40px">
      今天你不是「聽過」怎麼做，<br>
      是<span class="hl">已經做出來了</span>。<br><br>
      回家打開手機，<br>三個帳號都在那裡等你。</p>
    <div data-r style="display:flex;gap:14px;justify-content:center;margin-top:2px">
      <span class="pill">08/16 社群平台操作入門</span>
      <span class="pill">西屯婦女培力</span>
    </div>
  </div>`,
  notes:{
    say:['慢慢念完，停三秒再說「今天辛苦了」。',
         '這句話的重點是「已經做出來了」——今天全程動手，這是跟一般課程最大的差別。',
         '提醒填回饋單，並鼓勵大家互相追蹤、互加 LINE 好友。'],
    ask:[],
    do:['發回饋單。鼓勵學員互相追蹤帳號。']
  }});

/* =========================================================================
   附錄
   ========================================================================= */
S({ part:'附錄', time:'—', kind:'std', title:'附錄｜三張操作講義',
  html:`
  <div class="stack gap-m">
    <div>
      <p class="eyebrow" data-r>課前請印好，每人一份</p>
      <h2 class="h" data-r style="font-size:36px">三張 A4 操作講義</h2>
    </div>
    <div class="cards c3" data-r style="gap:22px">
      ${[['講義 1','Facebook 粉絲專頁',C.fb,'#eef4ff',
          ['建立四步驟','設定檢查清單','發文步驟','四個數字記錄欄']],
         ['講義 2','Instagram',C.igB,'#fdeef4',
          ['建立四步驟','切換專業帳號六步驟','個人檔案五欄','四個數字記錄欄']],
         ['講義 3','LINE 官方帳號','#03934a','#e6f8ee',
          ['建立四步驟','歡迎訊息草稿欄','QR Code 放置清單','四個數字記錄欄']]]
        .map(([n,t,c,bg,items])=>`
        <div class="card" style="padding:0;overflow:hidden">
          <div style="background:${bg};padding:18px 22px">
            <p class="cap" style="color:${c};margin-bottom:4px">${n}</p>
            <p class="k" style="margin:0;font-size:23px">${t}</p></div>
          <div style="padding:18px 22px 22px">
            <ul class="list dense" style="gap:10px">
              ${items.map(i=>`<li style="font-size:20px">${i}</li>`).join('')}
            </ul>
          </div>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.note(34)}
      <span class="txt">每張講義都留了<b class="hl">數字記錄欄</b>，<br>
      請學員寫下今天的數字，一個月後回來對照，最有成就感。</span></div>
  </div>`,
  notes:{
    say:['講義檔案：handouts.html，用 Chrome 開啟後按 Ctrl/Cmd + P，選 A4 直式列印。',
         '建議每張多印幾份，現場一定有人寫錯或弄丟。'],
    ask:[],
    do:[]
  }});
