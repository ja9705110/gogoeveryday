/* =========================================================================
   slides-c.js — PART 10 配件　·　PART 11 影像編修（含 AI）　·　PART 12 收尾　·　附錄
   第 66–91 頁
   ========================================================================= */

/* =========================================================================
   PART 10　配件怎麼放（進度緩衝，66–67）
   ========================================================================= */
S({ part:'PART 10', time:'進度緩衝', kind:'std', title:'配件不是拿來填滿畫面',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">配件的工作是幫人看懂商品</h2>
    </div>
    <div class="cards c3" data-r style="gap:16px">
      ${[['說明商品','原料入鏡，讓人知道用什麼做的',C.clay],
         ['說明用途','器具入鏡，讓人知道怎麼用',C.sage],
         ['建立情境','場景入鏡，讓人想像什麼時候用',C.gold]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:20px 18px;border-top:5px solid ${c}">
          <p class="k" style="font-size:24px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <table class="tbl" data-r style="font-size:20px">
      <thead><tr><th style="width:170px">你的商品</th><th>可以一起入鏡的東西</th></tr></thead>
      <tbody>
        <tr><td class="lead-col">咖啡</td><td>咖啡豆、咖啡匙、杯子、書、點心</td></tr>
        <tr><td class="lead-col">手工餅乾</td><td>麵粉、奶油、茶、咖啡、包裝紙</td></tr>
        <tr><td class="lead-col">手工皂</td><td>毛巾、木盤、植物、原料</td></tr>
        <tr><td class="lead-col">飾品</td><td>飾品盒、布料、鏡子、穿搭單品</td></tr>
        <tr><td class="lead-col">農產品</td><td>葉子、竹籃、切開的果肉、做好的料理</td></tr>
      </tbody>
    </table>
  </div>`,
  notes:{
    say:['這一段是緩衝，進度慢就整段跳過，不會影響今天的成果。',
         '重點是「配件跟商品要有關」，不是隨便找漂亮的東西放。'],
    ask:['問：你的商品，可以放什麼配件？'],
    do:[],
    diff:['學員的情境照會從「擺一堆東西」變成「有理由的擺設」。'],
    more:['教材 P.90：可在主體附近擺放調味料、筷子、湯匙或餐盤當裝飾。'],
    less:['整段跳過。']
  }});

S({ part:'PART 10', time:'進度緩衝', kind:'std', title:'一個主角 ＋ 1–3 個配角',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:40px">寧可少，不要多</h2>
    </div>
    <div data-r style="display:flex;gap:26px;justify-content:center;align-items:center">
      ${ART.scene({ w:340, h:255, bg:'wood', light:'side', angle:'a45', clutter:3, px:110,
                    cls:'bad', mark:'✕', cap:'放太多：分不出主角' })}
      ${ART.scene({ w:340, h:255, bg:'wood', light:'side', angle:'a45', clutter:1, px:150,
                    cls:'good', mark:'✓', cap:'一主一配：主角很明確' })}
    </div>
    <div class="callout" data-r style="max-width:920px">${ART.icon('warn',32)}
      <span class="txt">東西放在一起拍，
      <b>會讓人分不出主體是誰，易使主題失焦</b>。</span></div>
  </div>`,
  notes:{
    say:['一句話：配角是來襯托的，不是來搶戲的。'],
    ask:['問：左邊那張，你的眼睛第一個看到哪裡？'],
    do:['加一個配角重拍情境照。'],
    diff:['畫面會變乾淨，商品重新變成主角。'],
    more:[], less:['整段跳過。']
  }});

/* =========================================================================
   PART 11　影像編修　（68–86）
   ========================================================================= */
S({ part:'PART 11', time:'14:50', kind:'divider', title:'PART 11｜影像編修',
  html: divider('11','影像編修',
    '照片已經拍好了，現在讓它更接近你想給人的感覺。<br>先講內建，再講 AI。',
    ART.icon('wand',130,'rgba(255,255,255,.13)')),
  notes:{ say:['先確認每個人手上都有上午拍的照片，等一下要用。'], ask:[], do:[] }});

S({ part:'PART 11', time:'14:51', kind:'std', title:'修圖救得回什麼、救不回什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">先知道界線，才不會白花時間</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card sage" data-r style="padding:22px 24px">
        <p class="cap" style="color:${C.sage}">✓ 救得回來</p>
        <div class="stack gap-s">
          <div class="yes"><i>✓</i><span>整張太暗（但看得到東西）</span></div>
          <div class="yes"><i>✓</i><span>拍歪了、地平線不正</span></div>
          <div class="yes"><i>✓</i><span>顏色偏黃或偏藍</span></div>
          <div class="yes"><i>✓</i><span>邊邊角角有小雜物</span></div>
          <div class="yes"><i>✓</i><span>比例不對，要裁成正方形</span></div>
        </div>
      </div>
      <div class="card" data-r style="padding:22px 24px;background:#fdf3f1;border-color:transparent">
        <p class="cap" style="color:#c0392b">✕ 救不回來</p>
        <div class="stack gap-s">
          <div class="no"><i>✕</i><span><b>沒對到焦</b>——商品本身就是糊的</span></div>
          <div class="no"><i>✕</i><span><b>手震糊掉</b>——字會有殘影</span></div>
          <div class="no"><i>✕</i><span>暗到<b>完全沒細節</b>，拉亮只會有雜訊</span></div>
          <div class="no"><i>✕</i><span>用數位變焦拍的，放大就是糊</span></div>
          <div class="no"><i>✕</i><span>重要部分<b>被切掉</b>了</span></div>
        </div>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">所以早上那句話是真的：<b class="hl">先把照片拍好，再談修圖。</b>
      右邊那五種，今天下午的所有工具都救不回來。</span></div>
  </div>`,
  notes:{
    say:['這一頁是整個編修段的地基，一定要講清楚界線。',
         '把早上「先拍好再修圖」的伏筆明確收回來。',
         '右邊五項可以請學員對照自己上午拍壞的照片。'],
    ask:['問：你上午有沒有拍到糊掉的照片？現在打開看看，修得回來嗎？'],
    do:['打開上午拍的照片，判斷屬於左邊還是右邊。'],
    diff:['學員會理解修圖不是萬能，回頭更重視拍攝。'],
    more:['示範把一張糊掉的照片用「銳利化」拉，證明救不回來。'],
    less:['只講「糊掉救不回來」一句。']
  }});

S({ part:'PART 11', time:'14:54', kind:'std', title:'修圖會破壞照片：一定要留原檔',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="mega" data-r style="font-size:46px;max-width:1000px;line-height:1.32">
        「修圖對圖片是一種破壞，<br>有些為不可逆的，<br>
        <span class="hl">修圖一次就是對圖片的一次損傷</span>」</h2>
    </div>
    <div class="cards c3" data-r style="gap:18px;max-width:1000px;margin:0 auto">
      ${[['複製一份再修','在相簿裡先「拷貝」一張，修複製的那張',C.clay],
         ['不要修了又修','同一張反覆修、存檔，畫質會一次比一次差',C.gold],
         ['原檔永遠留著','之後想改風格、換平台，才有東西可以重來',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['「修圖一次就是一次損傷」這句直接引用教材，講出來很有份量。',
         'iPhone 的編輯可以「回復原始照片」，但用 App 修完另存的就回不去了，要提醒。'],
    ask:['問：你有沒有修過一張照片，後來後悔想改回來？'],
    do:['把要修的照片先複製一份。'],
    diff:['學員養成留原檔的習慣。'],
    more:['講 iPhone 的「回復」按鈕在哪裡。'],
    less:['只講「先複製一份再修」。']
  }});

S({ part:'PART 11', time:'14:57', kind:'std', title:'內建修圖在哪裡：iPhone／Android 對照',
  html:`
  <div class="split" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">相簿打開照片<br>右上角「編輯」</h2>
      </div>
      ${ART.steps([
        ['iPhone','相片 App → 打開照片 → 右上角「編輯」<br>下方三個圖示：調整、濾鏡、裁切'],
        ['Android','相簿／Google 相簿 → 打開照片 →<br>下方「編輯」→ 調整、濾鏡、裁剪']
      ])}
      <div class="callout sage" data-r style="padding:15px 22px">${ART.icon('ok',30,C.sage)}
        <span class="txt">列了十幾個選項，
        今天<b>只教三個</b>：裁切、亮度、顏色。其他先不用碰。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.phone(`
        <div style="position:relative;width:100%;height:100%;background:#12100e">
          <div style="position:absolute;left:0;right:0;top:0;height:46px;display:flex;
               align-items:center;justify-content:space-between;padding:0 14px">
            <span style="font-size:16px;font-weight:700;color:rgba(255,255,255,.6)">取消</span>
            <span style="font-size:16px;font-weight:800;color:${C.gold}">完成</span>
          </div>
          <div style="position:absolute;left:0;right:0;top:46px;bottom:118px;
               display:grid;place-items:center;background:#1b1512">
            ${ART.scene({ w:216, h:216, bg:'wood', light:'side', angle:'a45', px:120 })}
          </div>
          <div style="position:absolute;left:0;right:0;bottom:52px;padding:0 16px">
            ${ART.slider('亮度', 62, '+18')}
          </div>
          <div class="edit-bar" style="position:absolute;left:0;right:0;bottom:0">
            <span class="eb-i on">☀</span><span class="eb-i">◐</span>
            <span class="eb-i">◑</span><span class="eb-i">✂</span><span class="eb-i">◈</span>
          </div>
        </div>`, { w:238, h:474 })}
    </div>
  </div>`,
  notes:{
    say:['先讓所有人找到「編輯」按鈕，找不到的不要往下走。',
         '「只教三個，其他先不用碰」要講，不然學員會被十幾個選項嚇到。'],
    ask:['問：找到編輯按鈕的舉手？'],
    do:['打開上午拍的一張照片，按下編輯。'],
    diff:['多數學員第一次進到編輯畫面。'],
    more:['講「自動」按鈕可以一鍵調整，適合沒把握的時候。'],
    less:['講師示範，學員看就好。']
  }});

S({ part:'PART 11', time:'15:01', kind:'std', title:'動作一：裁切與拉正',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:38px">先把畫面<br>切乾淨、拉正</h2>
      </div>
      <ul class="list" data-r>
        <li><b>裁切</b>：把邊邊的雜物切掉，讓商品佔更大</li>
        <li><b>拉正</b>：的「校正」，把歪掉的水平轉回來</li>
        <li><b>換比例</b>：切成 1:1 給 IG、9:16 給限動</li>
        <li>早上用 4:3 拍就是為了這一步——<b>留得多才有得裁</b></li>
      </ul>
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('crop',30,C.gold)}
        <span class="txt">順序很重要：<b>先裁切，再調亮度</b>。
        裁完畫面變了，亮度的判斷才準。</span></div>
    </div>
    <div data-r style="display:flex;flex-direction:column;gap:14px;align-items:center">
      ${ART.scene({ w:330, h:200, bg:'wood', light:'side', angle:'a45', clutter:2, px:100,
                    cls:'bad', mark:'✕', cap:'原圖：邊邊有雜物、有點歪' })}
      ${ART.scene({ w:330, h:200, bg:'wood', light:'side', angle:'a45', px:150,
                    cls:'good', mark:'✓', cap:'裁切拉正後：乾淨、商品變大' })}
    </div>
  </div>`,
  notes:{
    say:['「先裁切再調亮度」的順序要講，這是實務經驗。',
         '把早上 4:3 的伏筆收回來。'],
    ask:['問：你上午拍的照片，邊邊有沒有多餘的東西？'],
    do:['把一張照片裁切、拉正，並切成 1:1。'],
    diff:['只是裁切，照片就變得像「有在經營」的商品照。'],
    more:['教材 P.171：直向、橫向可以修正廣角造成的變形。'],
    less:['只做裁切，不做拉正。']
  }});

S({ part:'PART 11', time:'15:05', kind:'std', title:'動作二：亮度與陰影',
  html:`
  <div class="split" style="gap:36px">
    <div data-r style="display:flex;flex-direction:column;gap:12px;align-items:center">
      ${ART.scene({ w:340, h:212, bg:'wood', light:'side', angle:'a45', sim:'dark',
                    cls:'bad', mark:'✕', cap:'原圖：偏暗，暗部看不到細節' })}
      ${ART.scene({ w:340, h:212, bg:'wood', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'亮度 +18、陰影 +25' })}
    </div>
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">只動兩根滑桿</h2>
      </div>
      <div class="stack gap-s" data-r>
        <div class="card flat" style="padding:16px 20px">
          ${ART.slider('亮度', 62, '+18')}
          <p class="v" style="font-size:19px;margin-top:9px">整張變亮或變暗。<b>小幅度調</b>，過頭會失真。</p>
        </div>
        <div class="card flat" style="padding:16px 20px">
          ${ART.slider('陰影', 68, '+25')}
          <p class="v" style="font-size:19px;margin-top:9px">
            <b>只把暗的地方拉亮</b>，亮的地方不動。側光照片最好用。</p>
        </div>
      </div>
      <div class="callout" data-r style="padding:14px 20px">${ART.icon('warn',30)}
        <span class="txt">還有增豔、亮部、對比、黑點等選項，
        <b>今天先不要碰</b>。兩根滑桿就能解決八成的問題。</span></div>
    </div>
  </div>`,
  notes:{
    say:['「陰影」這根滑桿最多人不知道，但對側光照片效果最好，要重點示範。',
         '一直強調「小幅度調」，中高齡學員很容易拉到底。'],
    ask:['問：你的照片是整張太暗，還是只有一邊太暗？（整張→亮度；一邊→陰影）'],
    do:['用亮度與陰影兩根滑桿調一張照片。'],
    diff:['側光照片的暗部細節會回來，立體感還在但看得清楚了。'],
    more:['講「對比」可以讓照片更有精神，但商品照不要加太多。'],
    less:['只調亮度。']
  }});

S({ part:'PART 11', time:'15:09', kind:'std', title:'動作三：飽和度與色溫，讓顏色回到真實',
  html:`
  <div class="split w-right" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">iPhone 拍的時候<br>調不了顏色<br>這裡可以救</h2>
      </div>
      <div class="stack gap-s" data-r>
        <div class="card flat" style="padding:16px 20px">
          ${ART.slider('色溫', 42, '−12')}
          <p class="v" style="font-size:19px;margin-top:9px">
            室內黃燈拍的照片會偏黃，<b>色溫往冷調一點</b>就回來了。</p>
        </div>
        <div class="card flat" style="padding:16px 20px">
          ${ART.slider('飽和度', 56, '+8')}
          <p class="v" style="font-size:19px;margin-top:9px">
            顏色的鮮豔程度。<b>加一點點就好</b>，加太多商品會假。</p>
        </div>
      </div>
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('warn',30,C.gold)}
        <span class="txt">判斷標準只有一個：<b class="hl">照片上的顏色，跟你眼前的實品一不一樣。</b>
        不是「好不好看」。</span></div>
    </div>
    <div data-r style="display:flex;flex-direction:column;gap:12px;align-items:center">
      ${ART.scene({ w:340, h:212, bg:'wood', light:'side', angle:'a45', sim:'warmcast',
                    cls:'bad', mark:'✕', cap:'室內黃燈：整張偏黃' })}
      ${ART.scene({ w:340, h:212, bg:'wood', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'色溫調冷一點：顏色回來了' })}
    </div>
  </div>`,
  notes:{
    say:['這一頁明確回收早上第 5 頁的白平衡伏筆，要講出來。',
         '「跟實品一不一樣」是商品照唯一的顏色標準，這句話下午講紅線時會再用。',
         '飽和度加太多是最常見的錯誤，特別是食物照。'],
    ask:['問：把手機拿起來對照你的實品，顏色一樣嗎？'],
    do:['調色溫與飽和度，調到跟實品一樣為止。'],
    diff:['偏黃的照片會變乾淨，商品顏色回到真實。'],
    more:['講「色調」可以微調偏綠偏紫。'],
    less:['只調色溫。']
  }});

S({ part:'PART 11', time:'15:13', kind:'std', title:'【實作】把上午拍的商品照修一次',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　六分鐘</p>
      <h2 class="h" data-r style="font-size:40px">三個動作，照順序做一次</h2>
    </div>
    <div data-r style="display:flex;align-items:center;gap:14px;max-width:1020px;margin:0 auto">
      ${[['① 複製','先拷貝一份，修複製的',C.muted],
         ['② 裁切拉正','切掉雜物、轉正',C.clay],
         ['③ 亮度陰影','整張亮度＋暗部細節',C.gold],
         ['④ 色溫飽和','調到跟實品一樣',C.sage]]
        .map(([k,v,c],i)=>`
        ${i?`<span style="font-size:30px;color:${C.muted};font-weight:300">→</span>`:''}
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);border-top:5px solid ${c};
             border-radius:16px;padding:18px 14px">
          <p style="margin:0 0 6px;font-size:23px;font-weight:900;color:${c}">${k}</p>
          <p style="margin:0;font-size:19px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1020px">${ART.icon('eye',32)}
      <span class="txt">修完之後，<b>跟原檔並排看一次</b>。
      如果差別大到「像另一張照片」，就是修過頭了。</span></div>
  </div>`,
  notes:{
    say:['四步照順序做，不要跳。',
         '「像另一張照片就是修過頭」是很好用的判斷標準。',
         '走動時特別看有沒有人把飽和度拉到底。'],
    ask:['問：修完跟原本差多少？會不會太多？'],
    do:['選一張上午拍的照片，四步做完。'],
    diff:['照片會變乾淨、變亮，但商品本身沒變。'],
    more:['修第二張，練熟。'],
    less:['只做 ①②③ 三步。']
  }});

S({ part:'PART 11', time:'15:19', kind:'std', title:'濾鏡：商品照為什麼要慎用',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">濾鏡可以統一風格，不能改商品顏色</h2>
    </div>
    <div data-r style="display:flex;gap:16px;justify-content:center">
      ${ART.scene({ w:236, h:180, bg:'wood', light:'side', angle:'a45', px:100, cls:'good', mark:'✓', cap:'原圖' })}
      ${ART.scene({ w:236, h:180, bg:'wood', light:'side', angle:'a45', px:100, sim:'soft', cap:'微調：可以' })}
      ${ART.scene({ w:236, h:180, bg:'wood', light:'side', angle:'a45', px:100, sim:'warmcast', cls:'bad', mark:'✕', cap:'重濾鏡：顏色跑掉' })}
      ${ART.scene({ w:236, h:180, bg:'wood', light:'side', angle:'a45', px:100, sim:'flat', cls:'bad', mark:'✕', cap:'黑白：商品照不適用' })}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt"><b class="hl">顏色失真＝客人收到覺得跟照片不一樣。</b>
      這不是美感問題，是消費爭議。濾鏡用來讓六張照片<b>風格一致</b>可以，
      用來把褐色果醬變成鮮紅色不行。</span></div>
  </div>`,
  notes:{
    say:['這一頁是紅線的前哨站，語氣要明確。',
         '教材列了鮮豔、戲劇、黑白、銀色調、復古五種，講一句帶過就好。',
         '重點是「一致」與「失真」的差別。'],
    ask:['問：你買過跟照片顏色差很多的東西嗎？當下的感覺是什麼？'],
    do:['如果要用濾鏡，六張照片用同一個，強度調到最低。'],
    diff:['學員會理解濾鏡是風格工具，不是修正工具。'],
    more:['講食物照特別忌諱加濾鏡。'],
    less:['只講最後那句結論。']
  }});

S({ part:'PART 11', time:'15:22', kind:'std', title:'AI 幫你做兩件事：修圖 vs 生圖',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">修圖是整理你拍的，生圖是無中生有</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card" data-r style="padding:24px;border-top:5px solid ${C.sage}">
        <p class="cap" style="color:${C.sage}">AI 修圖</p>
        <p class="k" style="font-size:26px">整理你自己拍的照片</p>
        <p class="v" style="font-size:20px">
          去掉桌上的雜物、把背景換成白色、把畫面往外延伸、把照片放大變清楚。<br><br>
          <b>照片還是你拍的，商品還是你的商品。</b></p>
        <div class="rule"></div>
        <div class="yes"><i>✓</i><span>商品主圖可以用</span></div>
      </div>
      <div class="card" data-r style="padding:24px;border-top:5px solid ${C.plum}">
        <p class="cap" style="color:${C.plum}">AI 生圖</p>
        <p class="k" style="font-size:26px">憑空生出一張新圖</p>
        <p class="v" style="font-size:20px">
          你打一段文字，AI 畫出一張本來不存在的圖。<br><br>
          <b>它生出來的果醬罐，不是你的果醬罐。</b></p>
        <div class="rule"></div>
        <div class="no"><i>✕</i><span>商品主圖不能用</span></div>
        <div class="yes" style="margin-top:8px"><i>✓</i><span>背景板、情境示意、社群素材可以</span></div>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">一句話記住：<b class="hl">修圖動的是「畫面」，生圖動的是「事實」。</b></span></div>
  </div>`,
  notes:{
    say:['這一頁是 AI 段的地基，一定要講到學員能複述。',
         '「它生出來的果醬罐，不是你的果醬罐」這句話最有效，要慢慢講。',
         '不要把生圖講成壞東西，它有正當用途，只是不能拿來當實品。'],
    ask:['問：如果客人看到 AI 生成的商品圖，下單後收到實品，會怎麼想？'],
    do:[],
    diff:['學員建立起分辨兩者的能力，後面的紅線才聽得懂。'],
    more:['講平台規範：多數電商平台要求商品主圖必須是實拍。'],
    less:['只講最後那一句結論。']
  }});

S({ part:'PART 11', time:'15:25', kind:'std', title:'AI 修圖：四個最實用的功能',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">不用學全部，這四個就夠</h2>
    </div>
    <div class="cards c4" data-r style="gap:16px">
      ${[['去除雜物','桌上多了一支筆、背景有電線，圈起來就消失',C.clay,'wand'],
         ['去背換白底','把商品剪下來，換成純白背景，適合電商上架',C.sage,'crop'],
         ['延伸背景','照片邊邊拍不夠，AI 幫你補出來，好裁成各種比例',C.gold,'grid'],
         ['放大變清楚','舊照片解析度不夠，放大補細節（有極限）',C.plum,'eye']]
        .map(([k,v,c,ic])=>`
        <div class="card" style="padding:22px 18px;border-top:5px solid ${c}">
          <span class="ico">${ART.icon(ic,34,c)}</span>
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">「放大變清楚」有極限。<b>糊掉的照片 AI 也救不回來</b>，
      它只是猜一個看起來合理的樣子——猜出來的細節不是真的細節。</span></div>
  </div>`,
  notes:{
    say:['四個功能裡，「去除雜物」和「去背換白底」對做生意的人最實用。',
         '最後的提醒很重要：AI 放大是「猜」，不是「還原」。這呼應前面「糊掉救不回來」。'],
    ask:['問：你的照片裡最想去掉什麼東西？'],
    do:[],
    diff:['學員知道 AI 能做什麼，也知道它的極限。'],
    more:['講去背之後邊緣可能有殘留，要檢查。'],
    less:['只講去除雜物與去背兩項。']
  }});

S({ part:'PART 11', time:'15:28', kind:'std', title:'兩條路：手機內建 vs 網頁 AI',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">先試手機內建，不夠再用網頁</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card" data-r style="padding:24px;border-top:5px solid ${C.clean}">
        <p class="cap" style="color:${C.clean}">路線一　手機內建</p>
        <ul class="list dense">
          <li><b>iPhone</b>　相片 → 編輯 → 「清除」工具</li>
          <li><b>Samsung</b>　相簿 → 編輯 → 「物件擦除」</li>
          <li><b>其他 Android</b>　Google 相簿 → 編輯 → 「魔術橡皮擦」</li>
        </ul>
        <div class="rule"></div>
        <div class="yes"><i>✓</i><span>快、不用登入、不用上傳</span></div>
        <div class="no"><i>✕</i><span>功能少，各廠差異大，舊機型可能沒有</span></div>
      </div>
      <div class="card" data-r style="padding:24px;border-top:5px solid ${C.plum}">
        <p class="cap" style="color:${C.plum}">路線二　網頁 AI</p>
        <ul class="list dense">
          <li><b>Google</b>（Gemini）　上傳照片，用講的告訴它要改什麼</li>
          <li><b>ChatGPT</b>　同樣上傳照片，用文字下指令</li>
        </ul>
        <div class="rule"></div>
        <div class="yes"><i>✓</i><span>功能強，可以「用說的」，能做去背、延伸、生圖</span></div>
        <div class="no"><i>✕</i><span>要有帳號、要上傳照片、要看網路速度</span></div>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.icon('warn',32,C.gold)}
      <span class="txt">各家介面改版很快，選單名稱可能跟今天不一樣。
      <b>找的原則一樣：先找「編輯」，再找有橡皮擦或魔術棒圖示的那一項。</b></span></div>
  </div>`,
  notes:{
    say:['先確認學員的帳號狀況，沒帳號的請助教協助或兩人一組。',
         '「找的原則一樣」這句要講，呼應早上「不要背按鈕位置」。',
         '上課前一週務必用自己的手機實機走一次這三條路徑。'],
    ask:['問：手機裡找得到「清除」或「物件擦除」的舉手？'],
    do:['先找找看自己的手機有沒有內建，沒有的準備用網頁。'],
    diff:['學員知道自己走哪一條路。'],
    more:['講上傳照片到網頁 AI 的隱私提醒：不要傳有個資的照片。'],
    less:['全班統一用 Google 相簿，不分兩路。']
  }});

S({ part:'PART 11', time:'15:31', kind:'std', title:'指令怎麼下：四個要素',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">一句好指令，有這四個部分</h2>
    </div>
    <div class="cards c4" data-r style="gap:14px">
      ${[['1','要改什麼','把桌上的鑰匙和杯子去掉','pe-1'],
         ['2','改成什麼','背景保持原本的木紋桌面','pe-2'],
         ['3','保留什麼','果醬罐本身不要改變','pe-3'],
         ['4','用在哪裡','這張要放在網路商店當主圖','pe-4']]
        .map(([n,k,v,cls])=>`
        <div class="card" style="padding:20px 18px">
          <span class="pe ${cls}" style="margin-bottom:10px;display:inline-block">${n}</span>
          <p class="k" style="font-size:23px">${k}</p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="prompt good" data-r>
      <span class="p-lab">完整範例</span><br>
      「<em>把桌上的鑰匙和杯子去掉</em>，<em>背景保持原本的木紋桌面</em>，
      <em>果醬罐本身不要改變</em>，<em>這張要放在網路商店當主圖</em>。」
    </div>
    <div class="callout" data-r style="padding:14px 22px">${ART.icon('bulb',30)}
      <span class="txt">第 3 項「<b>保留什麼</b>」最容易漏掉，但它是<b class="hl">保護你商品的那一句</b>。</span></div>
  </div>`,
  notes:{
    say:['四個要素照順序講，然後念一次完整範例。',
         '「保留什麼」這一項要特別強調——不寫這句，AI 很可能順手把商品也改了。',
         '附錄有指令範本，學員不用抄。'],
    ask:['問：如果不寫「果醬罐本身不要改變」，你猜 AI 會做什麼？'],
    do:['在紙上寫下自己的一句指令，四個部分都要有。'],
    diff:['學員第一次知道指令是有結構的，不是隨便講。'],
    more:['講可以追加「不要改變顏色」「不要加任何文字」。'],
    less:['只講前三項。']
  }});

S({ part:'PART 11', time:'15:34', kind:'std', title:'好指令 vs 壞指令',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">講得越模糊，AI 越會自己發揮</h2>
    </div>
    <div class="split" style="gap:28px">
      <div class="stack gap-s">
        <div class="prompt bad" data-r>
          <span class="p-lab">壞指令</span><br>「幫我修好看一點」</div>
        ${ART.scene({ w:440, h:212, bg:'dark', light:'back', angle:'a45', sim:'warmcast', px:130,
                      cls:'bad', mark:'✕', cap:'背景被換掉、顏色被加濃、商品變了樣' })}
      </div>
      <div class="stack gap-s">
        <div class="prompt good" data-r>
          <span class="p-lab">好指令</span><br>
          「把桌上的鑰匙去掉，背景保持木紋，<em>果醬罐本身不要改變</em>」</div>
        ${ART.scene({ w:440, h:212, bg:'wood', light:'side', angle:'a45', px:130,
                      cls:'good', mark:'✓', cap:'只有雜物消失，其他都一樣' })}
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">AI 不知道哪些是你的商品、哪些是雜物。
      <b>你不講，它就自己猜</b>——猜錯了，你的商品就變成別的東西了。</span></div>
  </div>`,
  notes:{
    say:['左右對照講，讓學員自己看出差別。',
         '「你不講，它就自己猜」是這一頁的核心。'],
    ask:['問：左邊那張如果拿去賣，會有什麼問題？'],
    do:[],
    diff:['學員理解為什麼要把指令寫清楚。'],
    more:['現場示範一次壞指令的結果，效果最好。'],
    less:['只念兩個指令，不展開。']
  }});

S({ part:'PART 11', time:'15:37', kind:'std', title:'【實作】用 AI 去掉照片裡的一個雜物',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　六分鐘</p>
      <h2 class="h" data-r style="font-size:40px">挑一張有雜物的照片</h2>
    </div>
    <div data-r style="display:flex;align-items:center;gap:16px;max-width:1000px;margin:0 auto">
      ${['① 選一張邊邊有雜物的照片','② 用手機內建或網頁 AI','③ 圈起來，或用四要素下指令','④ 跟原檔並排比較']
        .map((t,i)=>`
        ${i?`<span style="font-size:28px;color:${C.muted};font-weight:300">→</span>`:''}
        <div style="flex:1;background:#fff;border:1px solid rgba(36,28,23,.12);
             border-radius:15px;padding:16px 14px;font-size:20px;font-weight:700;color:${C.ink2};
             line-height:1.4">${t}</div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1000px">${ART.icon('eye',32)}
      <span class="txt">修完一定要<b>放大檢查商品本身</b>：
      顏色一樣嗎？形狀一樣嗎？標籤上的字還對嗎？<b class="hl">商品有變，就重做。</b></span></div>
  </div>`,
  notes:{
    say:['「修完放大檢查商品本身」是這個實作最重要的步驟，不要讓學員只看整體。',
         '沒有帳號、手機沒內建的學員，請兩人一組共用一台。',
         '教室三十人同時上傳，網路可能會慢，先講在前面讓大家有心理準備。'],
    ask:['問：AI 有沒有順手改到你的商品？'],
    do:['去掉一個雜物，跟原檔並排比較，放大檢查商品。'],
    diff:['雜物消失，但學員也會發現 AI 有時會改到不該改的地方。'],
    more:['再試一次去背換白底。'],
    less:['講師示範一次，學員回家做。']
  }});

S({ part:'PART 11', time:'15:41', kind:'std', title:'AI 生圖可以拿來做什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">拿來做「配角」可以，拿來當「主角」不行</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card sage" data-r style="padding:22px 24px">
        <p class="cap" style="color:${C.sage}">✓ 可以拿來做</p>
        <ul class="list sage dense">
          <li><b>背景板</b>：生一張木紋、布紋、純色底圖，印出來或墊在商品下面</li>
          <li><b>情境示意圖</b>：節慶、送禮氛圍圖（要標示「示意圖」）</li>
          <li><b>社群裝飾底圖</b>：貼文背景、活動宣傳圖的底</li>
          <li><b>版面草稿</b>：先看看排版感覺，再自己拍</li>
        </ul>
      </div>
      <div class="card" data-r style="padding:22px 24px;background:#fdf3f1;border-color:transparent">
        <p class="cap" style="color:#c0392b">✕ 不可以拿來做</p>
        <ul class="list dense">
          <li><b>商品本身</b>——生出來的不是你的商品</li>
          <li><b>商品主圖</b>——客人下單是看這張</li>
          <li>任何會讓客人<b>以為那就是實品</b>的畫面</li>
          <li>食品的成品照——最容易產生落差與爭議</li>
        </ul>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt">最實用的一招：<b>用 AI 生一張純色或木紋的背景圖，印出來當背景板。</b>
      成本幾塊錢，比買攝影背景紙便宜太多。</span></div>
  </div>`,
  notes:{
    say:['先講可以做的，再講不可以做的，語氣才不會像在禁止。',
         '「生背景板印出來」這一招最實用，學員回家馬上能用。',
         '情境示意圖一定要標示「示意圖」，這是誠信也是自保。'],
    ask:['問：你會想生一張什麼樣的背景？'],
    do:[],
    diff:['學員知道 AI 生圖有正當用途，不會因噎廢食。'],
    more:['示範生一張背景圖的指令：「一張淺灰色水泥質感的桌面，正上方俯視，沒有任何物品，柔和自然光」。'],
    less:['只講「生圖不能拿來當商品主圖」。']
  }});

S({ part:'PART 11', time:'15:44', kind:'std', title:'商品照的三條紅線',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:36px;margin-bottom:6px">
        AI 可以整理畫面，<span class="hl">不可以改變商品</span></h2>
    </div>
    <div class="stack gap-s" data-r>
      ${ART.redline('1','不能改商品本身的顏色',
        '褐色的果醬修成鮮紅色、米白的皂修成純白。客人收到會覺得「跟照片不一樣」——這是消費爭議，不是美感問題。')}
      ${ART.redline('2','不能改份量、大小、數量',
        '一盒 12 顆不能修成 16 顆，小罐不能修得像大罐。份量是交易條件，改了就是誤導。')}
      ${ART.redline('3','不能生成不存在的東西當實品',
        '沒做過的口味、沒有的包裝、AI 生出來的成品照。食品類特別小心，這牽涉食品標示。')}
    </div>
    <div class="callout" data-r style="padding:14px 22px">${ART.icon('ok',30,C.sage)}
      <span class="txt">判斷方法很簡單：<b>客人收到實品，會不會覺得被騙？</b>
      不會，就可以修；會，就不要修。</span></div>
  </div>`,
  notes:{
    say:['這一頁是整個 AI 段最重要的一頁，講最久，語氣要嚴肅但不要恐嚇。',
         '三條紅線都用「客人收到會怎麼想」來說明，比講法規有效。',
         '最後那個判斷方法要讓學員記住，回家自己判斷用的。'],
    ask:['問：你買過跟照片差很多的東西嗎？當下什麼感覺？還會再買嗎？',
         '問：如果是你自己的客人這樣覺得，你會損失什麼？'],
    do:['檢查剛剛修的照片，三條紅線有沒有踩到。'],
    diff:['學員會開始自我審查，這正是目的。'],
    more:['講食品標示與廣告不實的基本概念，但不要講成法律課。'],
    less:['只講第 1 條與最後的判斷方法。']
  }});

S({ part:'PART 11', time:'15:47', kind:'std', title:'【實作】二選一',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　五分鐘　·　挑一個做就好</p>
      <h2 class="h" data-r style="font-size:38px">去背換白底，或生一張背景板</h2>
    </div>
    <div class="split" style="gap:26px;max-width:1020px;margin:0 auto">
      <div class="card" data-r style="padding:22px 24px;border-top:5px solid ${C.sage}">
        <p class="cap" style="color:${C.sage}">選項 A　去背換白底</p>
        <p class="v" style="font-size:20px;text-align:left">
          把主圖的商品剪下來，背景換成純白。<br>
          電商平台、蝦皮、官網上架最常用這一種。</p>
        <div class="rule"></div>
        <p class="v" style="font-size:19px;text-align:left">
          指令：「把背景換成純白色，<b>商品本身的顏色和形狀不要改變</b>，邊緣要乾淨」</p>
      </div>
      <div class="card" data-r style="padding:22px 24px;border-top:5px solid ${C.plum}">
        <p class="cap" style="color:${C.plum}">選項 B　生一張背景板</p>
        <p class="v" style="font-size:20px;text-align:left">
          生一張純色或木紋的桌面圖，之後印出來當背景板。<br>
          比買攝影背景紙便宜太多。</p>
        <div class="rule"></div>
        <p class="v" style="font-size:19px;text-align:left">
          指令：「一張淺灰色水泥質感的桌面，正上方俯視，<b>沒有任何物品</b>，柔和自然光」</p>
      </div>
    </div>
    <div class="callout gold" data-r style="max-width:1020px">${ART.icon('bulb',30,C.gold)}
      <span class="txt">選 A 的人記得檢查<b>邊緣有沒有殘留</b>；
      選 B 的人記得<b>不要在生成的背景上放 AI 生的商品</b>——商品要用自己拍的。</span></div>
  </div>`,
  notes:{
    say:['二選一是為了讓不同程度的學員都有事做。',
         '選 B 的提醒很重要：背景可以是 AI 的，商品一定要是自己拍的。',
         '這一步做完，PART 11 就結束了。'],
    ask:['問：你選 A 還是 B？'],
    do:['A 或 B 擇一完成。'],
    diff:['學員手上會多一張可以直接上架的白底圖，或一張可以重複使用的背景板。'],
    more:['兩個都做。'],
    less:['講師示範 A，學員看完回家做。']
  }});

S({ part:'PART 11', time:'15:49', kind:'std', title:'修圖 App 五款對照',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">先用內建就夠了，這些等有需要再說</h2>
    </div>
    <table class="tbl" data-r style="font-size:20px">
      <thead><tr><th style="width:180px">App</th><th style="width:330px">最大特色</th><th>什麼時候才需要</th></tr></thead>
      <tbody>
        <tr><td class="lead-col">Snapseed</td><td><b>局部修飾</b>：只調某一塊的亮度</td><td>想把商品調亮但背景不動時</td></tr>
        <tr><td class="lead-col">Adobe Lightroom</td><td>白平衡、鏡頭校正，功能最完整</td><td>iPhone 想調白平衡時</td></tr>
        <tr><td class="lead-col">Foodie</td><td>食物專用濾鏡，有「正俯視圖」提示</td><td>常拍食物、需要俯拍對齊時</td></tr>
        <tr><td class="lead-col">VSCO</td><td>濾鏡可再微調數值</td><td>想建立固定風格時</td></tr>
        <tr><td class="lead-col">PhotoGrid</td><td>多張拼圖、加邊框文字</td><td>要做六張的拼圖版面時</td></tr>
      </tbody>
    </table>
    <div class="callout sage" data-r>${ART.icon('ok',32,C.sage)}
      <span class="txt">這些 App <b>有些功能需要額外付費</b>。
      今天教的三個動作用內建就做得到，<b class="hl">不用花錢</b>。</span></div>
  </div>`,
  notes:{
    say:['這一頁快速帶過，重點是「現在不用裝」。',
         'Snapseed 的局部修飾是唯一內建做不到、又真的實用的功能，可以多講一句。',
         'iPhone 使用者想調白平衡的話，Lightroom 是唯一免費解法。'],
    ask:['問：你手機裡有裝修圖 App 嗎？'],
    do:[],
    diff:['學員不會因為看到一堆 App 就焦慮。'],
    more:['示範 Snapseed 的局部修飾。'],
    less:['整頁跳過，附錄有表。']
  }});

/* =========================================================================
   PART 12　Before / After 與收尾　（87–89）
   ========================================================================= */
S({ part:'收尾', time:'15:50', kind:'std', title:'拿出你早上第一張照片',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">早上那張，跟現在這張，放在一起</h2>
    </div>
    <div class="split" style="gap:30px" data-r>
      ${ART.scene({ w:400, h:250, bg:'wood', light:'flat', angle:'top', clutter:3, px:96,
                    sim:'dark', cls:'bad', mark:'Before', cap:'早上九點十七分' })}
      ${ART.scene({ w:400, h:250, bg:'wood', light:'side', angle:'a45', px:150,
                    cls:'good', mark:'After', cap:'下午三點五十分' })}
    </div>
    <div class="checks" data-r style="grid-template-columns:repeat(4,1fr);gap:11px 22px">
      ${['鏡頭乾淨了嗎','對焦有對到嗎','光線變好了嗎','背景乾淨了嗎',
         '商品突出了嗎','構圖舒服了嗎','看得出想給人什麼感覺嗎','有沒有修過']
        .map(t=>`
        <div class="check" style="justify-content:flex-start">
          <span class="box"></span>
          <span style="font-size:19px;font-weight:700;color:${C.ink2};text-align:left">${t}</span>
        </div>`).join('')}
    </div>
  </div>`,
  notes:{
    say:['這是今天的高潮，不要趕。讓學員自己看自己的兩張。',
         '八個檢查點一項一項念，讓學員自己打勾。',
         '第七項「看得出想給人什麼感覺嗎」是今天主軸的最後一次回收。'],
    ask:['問：兩張差最多的是哪一項？',
         '問：如果只能挑一件今天學到的事帶回家，你會挑哪一件？'],
    do:['把 Before 與 After 並排，八個檢查點逐一打勾。'],
    diff:['幾乎每個人的差異都會很大，尤其是光線與背景兩項。'],
    more:['請三四位學員投影自己的前後對照，全班一起看。'],
    less:['只做並排，不逐項打勾。']
  }});

S({ part:'收尾', time:'15:55', kind:'std', title:'選出今天最滿意的一張',
  html:`
  <div class="stack gap-l center" style="text-align:center;justify-content:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">互動　·　三分鐘</p>
      <h2 class="mega" data-r style="font-size:48px;line-height:1.3">
        從今天拍的所有照片裡<br>挑出<span class="hl">最滿意的一張</span></h2>
    </div>
    <p class="lead" data-r style="font-size:24px;max-width:880px">
      不是最漂亮的，是<b>最像你商品實際樣子</b>的那一張。<br>
      把它設成那個商品的主圖。</p>
    <div data-r style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
      <span class="tag">拿給旁邊的人看</span>
      <span class="tag">說一句「我選這張，因為⋯⋯」</span>
      <span class="tag on">回家就用這張</span>
    </div>
  </div>`,
  notes:{
    say:['「不是最漂亮，是最像實品」——今天的顏色標準在這裡最後講一次。',
         '互相分享這一步不要省，學員之間的鼓勵比講師的稱讚有用。'],
    ask:['問：你選哪一張？為什麼是這張？'],
    do:['兩人一組互相看照片，各說一句為什麼選它。'],
    diff:['學員會發現自己真的說得出理由，這就是今天最大的收穫。'],
    more:['請學員互相追蹤 IG，回家看彼此發的照片。'],
    less:['只請三位學員發表。']
  }});

S({ part:'收尾', time:'15:58', kind:'std', title:'回家後怎麼練',
  html:`
  <div class="stack gap-l center" style="text-align:center;justify-content:center">
    <div data-r style="display:flex;gap:20px;justify-content:center;margin-bottom:6px">
      ${ART.icon('cam',52,C.clay)}${ART.icon('sun',52,C.gold)}${ART.icon('wand',52,C.sage)}
    </div>
    <h2 class="mega" data-r style="font-size:44px;max-width:1000px;line-height:1.34">
      今天你不是「學過」怎麼拍，<br>
      是<span class="hl">已經拍出來了</span>。</h2>
    <div class="cards c3" data-r style="gap:20px;max-width:1000px;margin:0 auto">
      ${[['每週拍一個商品','六張拍不完就拍三張：主圖、細節、幕後',C.clay],
         ['固定同一種感覺','四種選一種，連續拍一個月再換',C.gold],
         ['修圖只做三件事','裁切、亮度、顏色。不要越修越多',C.sage]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:22px 20px;border-top:5px solid ${c}">
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <p class="lead" data-r style="font-size:23px;max-width:900px">
      下一堂課我們會接著做<b>更完整的影像編修</b>。<br>
      在那之前，把今天這六張拍熟就好。</p>
  </div>`,
  notes:{
    say:['慢慢念「已經拍出來了」這句，停三秒再說「今天辛苦了」。',
         '三張卡片是回家的最小承諾，不要開太高的目標。',
         '預告下一堂，讓學員知道還有後續。'],
    ask:[],
    do:['發回饋單。鼓勵學員互相追蹤，回家看彼此的照片。'],
    diff:[],
    more:['請學員承諾一個「這週要拍的商品」，寫在講義上。'],
    less:['只念最後一句。']
  }});

/* =========================================================================
   附錄　（90–91）
   ========================================================================= */
S({ part:'附錄', time:'—', kind:'std', title:'附錄①　拍攝前檢查表 ＋ 修圖三動作',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:31px;margin-bottom:2px">拍之前十秒，修圖三動作</h2>
    </div>
    <div class="split" style="gap:26px">
      <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.clay}">
        <p class="cap" style="color:${C.clay};margin-bottom:8px">拍之前，花十秒走一遍</p>
        <div class="checks" style="grid-template-columns:1fr;gap:7px">
          ${['鏡頭擦乾淨了','鏡頭保護貼沒有刮傷起霧','電量與儲存空間還夠',
             '螢幕亮度正常、護眼模式已關','格線已打開、比例 4:3','閃光燈已關閉',
             '背景四個邊看過一遍','想好這張要給人什麼感覺']
            .map(t=>`<div class="check" style="justify-content:flex-start">
              <span class="box"></span>
              <span style="font-size:18px;font-weight:700;color:${C.ink2}">${t}</span></div>`).join('')}
        </div>
      </div>
      <div class="card" data-r style="padding:16px 20px;border-top:5px solid ${C.sage}">
        <p class="cap" style="color:${C.sage};margin-bottom:8px">修圖，只做這三件事</p>
        <div class="stack gap-s">
          ${[['① 複製一份','修複製的，原檔留著'],
             ['② 裁切拉正','切雜物、轉正、換比例'],
             ['③ 亮度陰影','整張亮度 ＋ 暗部細節'],
             ['④ 色溫飽和','調到跟實品一樣為止']]
            .map(([k,v])=>`
            <div style="display:flex;gap:12px;align-items:center;background:${C.paper2};
                 border-radius:11px;padding:9px 14px">
              <span style="font-size:19px;font-weight:900;color:${C.sage};min-width:94px">${k}</span>
              <span style="font-size:18px;font-weight:650;color:${C.ink2}">${v}</span>
            </div>`).join('')}
          <div class="callout" style="padding:10px 16px;margin-top:1px">${ART.icon('warn',24)}
            <span class="txt" style="font-size:18px">修完跟原檔並排。差別大到像另一張照片，就是修過頭了。</span></div>
        </div>
      </div>
    </div>
  </div>`,
  notes:{ say:['這一頁與下一頁會單獨印成 A4 發給學員。'], ask:[], do:[] }});

S({ part:'附錄', time:'—', kind:'std', title:'附錄②　感覺配方表 ＋ 六張清單 ＋ AI 指令範本',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:29px;margin-bottom:0">回家照著做的三張表</h2>
    </div>
    <table class="tbl compact" data-r style="font-size:17px">
      <thead><tr><th style="width:126px">感覺</th><th>光線</th><th>背景</th><th>角度</th><th>構圖</th></tr></thead>
      <tbody>
        ${F.map(f=>`
        <tr><td class="lead-col" style="color:${f.c};font-weight:900">${f.name}</td>
          <td>${f.light}</td><td>${f.bg}</td><td>${f.angle}</td><td>${f.comp}</td></tr>`).join('')}
      </tbody>
    </table>
    <div class="split" style="gap:20px">
      <div class="card" data-r style="padding:12px 16px;border-top:4px solid ${C.clay}">
        <p class="cap" style="color:${C.clay};margin-bottom:6px;font-size:18px">一個商品，六張照片</p>
        <div class="checks" style="grid-template-columns:1fr;gap:5px">
          ${['① 主圖（中央構圖、背景乾淨）','② 完整外觀','③ 細節照（走近拍）',
             '④ 不同角度（45 度或俯拍）','⑤ 使用情境（1–3 個配角）','⑥ 幕後製作']
            .map(t=>`<div class="check" style="justify-content:flex-start">
              <span class="box"></span>
              <span style="font-size:17px;font-weight:700;color:${C.ink2}">${t}</span></div>`).join('')}
        </div>
      </div>
      <div class="card" data-r style="padding:12px 16px;border-top:4px solid ${C.plum}">
        <p class="cap" style="color:${C.plum};margin-bottom:6px;font-size:18px">AI 指令範本（四要素）</p>
        <div class="prompt good" style="padding:9px 13px;font-size:17px;line-height:1.45">
          「<em>把＿＿＿去掉</em>，<em>背景保持＿＿＿</em>，
          <em>商品本身的顏色和形狀不要改變</em>，<em>這張要用在＿＿＿</em>。」
        </div>
        <p class="v" style="font-size:17px;margin-top:7px;line-height:1.5">
          <b>三條紅線：</b>不改商品顏色｜不改份量大小｜不生成不存在的實品。<br>
          判斷方法：<b>客人收到實品，會不會覺得被騙？</b></p>
      </div>
    </div>
  </div>`,
  notes:{ say:['這一頁印出來讓學員貼在手機殼背面或工作檯前。'], ask:[], do:[] }});
