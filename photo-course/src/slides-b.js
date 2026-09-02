/* =========================================================================
   slides-b.js — PART 2 拍攝前準備 ～ PART 9 六張照片
   第 18–65 頁
   ========================================================================= */

/* 頁尾呼應帶：把「感覺」帶回來 */
const strip = (label, pick) => ART.feelStrip(label,
  F.map(f => [f.name, pick(f), f.cls]));

const divider = (no, title, sub, ic) => `
  <div class="wrap">
    <p class="pno" data-r>${no}</p>
    <h2 data-r>${title}</h2>
    <p class="d-sub" data-r>${sub}</p>
  </div>
  <div class="d-art">${ic}</div>`;

/* =========================================================================
   PART 2　拍攝前，把手機準備好　（18–23）
   ========================================================================= */
S({ part:'PART 2', time:'10:30', kind:'divider', title:'PART 2｜拍攝前，把手機準備好',
  html: divider('02','拍攝前<br>把手機準備好',
    '這一段不教技巧，只做整理。做完之後，同一支手機拍出來就會不一樣。',
    ART.icon('phone',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段很短但效果最直接，學員會立刻看到差別。'], ask:[], do:[] }});

S({ part:'PART 2', time:'10:31', kind:'std', title:'【實作】先別擦鏡頭，拍一張',
  html:`
  <div class="split w-left" style="gap:44px">
    <div class="stack gap-m">
      <div>
        <p class="eyebrow" data-r>實作　·　三分鐘</p>
        <h2 class="h" data-r style="font-size:40px">先<span class="hl">不要</span>擦鏡頭<br>照原樣拍一張</h2>
      </div>
      <p class="lead" data-r style="font-size:23px">
        找一個有光的地方，對著你的商品拍一張。<br>
        鏡頭髒不髒先不用管——等一下才要處理。</p>
      <div class="callout" data-r>${ART.icon('warn',32)}
        <span class="txt">拍完<b>先不要刪</b>。等一下擦完鏡頭再拍一張，兩張要並排比。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center">
      ${ART.scene({ w:330, h:280, bg:'wood', light:'side', angle:'a45', sim:'flat',
                    cap:'現在的樣子（鏡頭還沒擦）' })}
    </div>
  </div>`,
  notes:{
    say:['這一步的重點是「先不要處理」，對照才有力量。',
         '有人會忍不住先擦，請她們忍住。'],
    ask:['問：你多久擦一次手機鏡頭？（多數人會說「沒擦過」）'],
    do:['對著商品拍一張，不做任何處理。'],
    diff:['多數人的鏡頭其實很髒，等一下的對照會很明顯。'],
    more:['請一位學員的手機鏡頭投影放大，讓全班看指紋。'],
    less:['縮到兩分鐘。']
  }});

S({ part:'PART 2', time:'10:34', kind:'std', title:'鏡頭髒了會怎樣，該怎麼擦',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">鏡頭髒，整張照片都會蒙一層霧</h2>
    </div>
    <div class="split" style="gap:34px">
      <div class="stack gap-s" data-r>
        <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em">髒了會出現什麼</p>
        ${[['整張霧霧的','像隔著毛玻璃，怎麼調都不清楚'],
           ['光線散掉','有燈的地方會出現一片光暈'],
           ['細節不見','商品的紋理、字都糊在一起'],
           ['夜間更嚴重','路燈、招牌會拖出光斑']]
          .map(([k,v])=>`
          <div style="display:flex;gap:13px;align-items:flex-start;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-left:4px solid ${C.clay};
               border-radius:13px;padding:12px 16px">
            <span style="font-size:22px;font-weight:900;color:${C.clay};min-width:98px">${k}</span>
            <span style="font-size:20px;font-weight:650;color:${C.ink2};line-height:1.4">${v}</span>
          </div>`).join('')}
      </div>
      <div class="stack gap-s" data-r>
        <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em">怎麼擦</p>
        <div class="card sage" style="padding:20px 22px">
          <div class="yes" style="margin-bottom:10px"><i>✓</i><span><b>眼鏡布</b>或<b>超細纖維布</b>，乾的就好</span></div>
          <div class="yes" style="margin-bottom:10px"><i>✓</i><span>畫圓輕輕擦，從中間往外</span></div>
          <div class="no" style="margin-bottom:10px"><i>✕</i><span>衣服下擺、面紙、口水</span></div>
          <div class="no"><i>✕</i><span>用力來回磨（會刮傷鍍膜）</span></div>
        </div>
        <div class="callout gold" style="padding:14px 20px">${ART.icon('bulb',30,C.gold)}
          <span class="txt">最常見的髒污來源：<b>指紋、手汗、化妝品、口袋棉絮</b>。</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['這一頁講完就讓大家擦，不要拖。',
         '「衣服下擺」是最多人的習慣，要特別點出來為什麼不行。'],
    ask:['問：你們平常用什麼擦手機？'],
    do:['現在擦鏡頭。沒有眼鏡布的請助教發，或用乾淨的衛生紙輕輕擦（不理想但比不擦好）。'],
    diff:['擦完的照片會明顯變透、對比變高。'],
    more:['講鏡頭鍍膜為什麼怕粗糙材質。'],
    less:['只講「用眼鏡布，不要用衣服」。']
  }});

S({ part:'PART 2', time:'10:38', kind:'std', title:'【實作】擦完再拍一張，兩張並排',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　三分鐘</p>
      <h2 class="h" data-r style="font-size:40px">同一個位置，同一個角度，再拍一張</h2>
    </div>
    <div data-r style="display:flex;gap:30px;justify-content:center;align-items:center">
      ${ART.scene({ w:330, h:248, bg:'wood', light:'side', angle:'a45', sim:'flat',
                    cls:'bad', mark:'✕', cap:'擦之前：霧、對比低' })}
      <span style="font-size:38px;color:${C.muted};font-weight:300">→</span>
      ${ART.scene({ w:330, h:248, bg:'wood', light:'side', angle:'a45', sim:'soft',
                    cls:'good', mark:'✓', cap:'擦之後：透、細節出來了' })}
    </div>
    <p class="lead" data-r style="font-size:23px">
      這是今天第一次「一次只改一個地方」。<br>
      位置沒變、光線沒變、角度沒變——<b class="hl">只有鏡頭擦了</b>。</p>
  </div>`,
  notes:{
    say:['這是今天第一個 Before/After，一定要讓學員自己看自己的兩張。',
         '再次強調「只改一個地方」的邏輯。'],
    ask:['問：兩張差多少？看得出來的舉手。（通常會有人驚訝）'],
    do:['擦完鏡頭，同一個位置再拍一張，兩張並排看。'],
    diff:['照片會變透、顏色會變乾淨。鏡頭很髒的人差異會非常明顯。'],
    more:['請差異最大的一位投影出來給全班看。'],
    less:['不並排，口頭問「有沒有比較清楚」。']
  }});

S({ part:'PART 2', time:'10:42', kind:'std', title:'保護貼與螢幕顯示會騙你的眼睛',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">這些東西不會改照片，但會改你的判斷</h2>
    </div>
    <div class="cards c3" data-r style="gap:16px">
      ${[['鏡頭保護貼','檢查有沒有刮傷、裂痕、起霧、油污。<br>刮傷的保護貼比髒鏡頭更糟。',C.clay,'cam'],
         ['螢幕保護貼','防窺貼、霧面貼會讓畫面變暗、變糊。<br><b>照片檔案沒事</b>，是你看不清楚。',C.plum,'eye'],
         ['顯示模式','True Tone、夜間模式、護眼模式、藍光過濾<br>都會改變螢幕的顏色。',C.gold,'sun']]
        .map(([k,v,c,ic])=>`
        <div class="card" style="padding:22px 20px;border-top:5px solid ${c}">
          <span class="ico">${ART.icon(ic,36,c)}</span>
          <p class="k" style="font-size:24px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">要判斷商品的<b>真實顏色</b>時：把螢幕亮度調到一般、關掉護眼模式、
      不要在大太陽底下看。<b class="hl">不然你會一直修錯方向。</b></span></div>
  </div>`,
  notes:{
    say:['這一頁的重點是「不會改照片，但會改你的判斷」，這句話要說清楚。',
         '很多人在戶外看照片覺得太暗，回家一看又太亮，就是這個原因。',
         '下午修圖段會再回來提醒一次。'],
    ask:['問：有人貼防窺貼的舉手？（有的話請她把手機轉個角度給旁邊的人看，很有感）'],
    do:['把螢幕亮度調到中間，關掉護眼／夜間模式。'],
    diff:['學員會發現自己一直是在錯誤的螢幕狀態下判斷照片。'],
    more:['示範同一張照片在護眼模式開／關下看起來差多少。'],
    less:['只講螢幕亮度那一項。']
  }});

S({ part:'PART 2', time:'10:46', kind:'std', title:'拍攝前檢查表',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:40px">每次拍之前，花十秒走一遍</h2>
    </div>
    <div class="checks" data-r style="grid-template-columns:repeat(2,1fr);gap:13px 34px;max-width:880px">
      ${['鏡頭擦乾淨了','鏡頭保護貼沒有刮傷起霧','電量還夠','儲存空間還夠',
         '螢幕亮度正常','護眼／夜間模式已關','格線已打開','閃光燈已關閉']
        .map(t=>`
        <div class="check done" style="justify-content:flex-start">
          <span class="box"></span>
          <span style="font-size:22px;font-weight:750;color:${C.ink2}">${t}</span>
        </div>`).join('')}
    </div>
    <div class="callout sage" data-r style="max-width:880px">${ART.icon('ok',32,C.sage)}
      <span class="txt">八項裡面最重要的是<b>第一項</b>。
      如果只來得及做一件事，就擦鏡頭。</span></div>
  </div>`,
  notes:{
    say:['這張表附錄有，會印給大家，現在不用抄。',
         '最後那句「只來得及做一件事就擦鏡頭」是這一段的結論。'],
    ask:['問：這八項裡，哪一項你以前完全沒想過？'],
    do:['八項逐一確認一次。'],
    diff:['之後每次實作前，學員會自動先看一眼鏡頭。'],
    more:['讓學員在講義上圈出自己最容易忘的兩項。'],
    less:['只念一遍，不逐項確認。']
  }});

/* =========================================================================
   PART 3　相機基本操作　（24–32）
   ========================================================================= */
S({ part:'PART 3', time:'10:50', kind:'divider', title:'PART 3｜相機基本操作',
  html: divider('03','相機基本操作',
    '對焦、亮度、鏡頭切換。三個動作，決定一張照片清不清楚。',
    ART.icon('cam',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段全部都要動手，每講一個就拍一次。'], ask:[], do:[] }});

S({ part:'PART 3', time:'10:51', kind:'std', title:'對焦＝用手指告訴手機「我要這裡清楚」',
  html:`
  <div class="split" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">手機不知道你要拍什麼<br>你要告訴它</h2>
      </div>
      <p class="lead" data-r style="font-size:22px">
        先決定要成像清楚的位置，並點手機螢幕，
        <b>當畫面出現方格時，代表已在所點選的位置進行對焦</b>。</p>
      <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
        <span class="txt">點一下螢幕，就是把「自動對焦」變成「<b>手動對焦</b>」。
        手機本來會自己猜，猜錯的時候就換你決定。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.phone(ART.camView({
        grid:true, ratio:'4:3', top:'已對焦', focus:[50,52],
        view:`<div style="position:absolute;inset:0;background:linear-gradient(#c9a271,#b98f5c)">
                <div style="position:absolute;left:50%;top:55%;transform:translate(-50%,-50%)">
                  ${ART.jar45(118)}</div></div>`
      }), { w:238, h:474 })}
    </div>
  </div>`,
  notes:{
    say:['一定要示範：點螢幕 → 出現方框 → 那裡就變清楚。',
         '請學員注意方框出現的位置，這是判斷有沒有對到的唯一依據。'],
    ask:['問：你們平常拍照會點螢幕嗎？（多數人不會，都讓手機自己決定）'],
    do:['打開相機，對著商品點一下，確認方框出現。'],
    diff:['學員第一次意識到自己可以決定哪裡清楚。'],
    more:['示範長按可以鎖定對焦（AE/AF 鎖定）。'],
    less:['只講「點螢幕會出現方框」。']
  }});

S({ part:'PART 3', time:'10:55', kind:'std', title:'【實作】點商品 vs 點背景',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　四分鐘</p>
      <h2 class="h" data-r style="font-size:40px">同一個畫面，點兩個不同的地方</h2>
    </div>
    <div data-r style="display:flex;gap:30px;justify-content:center;align-items:center">
      ${ART.scene({ w:330, h:248, bg:'wood', light:'side', angle:'a45', clutter:1,
                    sim:'blur', cls:'bad', mark:'✕', cap:'點到背景：商品糊掉' })}
      ${ART.scene({ w:330, h:248, bg:'wood', light:'side', angle:'a45', clutter:1,
                    cls:'good', mark:'✓', cap:'點商品：商品清楚' })}
    </div>
    <p class="lead" data-r style="font-size:23px">
      這就是「對焦」。<b class="hl">照片糊掉，多半不是手機爛，是點錯地方。</b></p>
  </div>`,
  notes:{
    say:['讓學員自己拍兩張，不要只看投影。',
         '拍完問「哪一張是你平常會拍出來的？」多數人會承認是左邊那張。'],
    ask:['問：點背景那張，商品看得清楚嗎？',
         '問：你以前拍糊的照片，會不會其實就是這個原因？'],
    do:['同一個畫面拍兩張：一張點商品、一張點背景（或後面的牆），並排比較。'],
    diff:['對焦點不同，清楚的地方就不同。這是全天最容易看出來的差異之一。'],
    more:['講景深：離商品越近，背景越模糊，這是好事。'],
    less:['只拍點商品那一張，口頭說明另一種。']
  }});

S({ part:'PART 3', time:'11:00', kind:'std', title:'曝光＝照片太亮還是太暗',
  html:`
  <div class="split" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">方框旁邊<br>有一個小太陽</h2>
      </div>
      ${ART.steps([
        ['點一下','先點商品，畫面出現方框'],
        ['找太陽','方框旁邊會出現太陽圖示'],
        ['按住上下滑','往上變亮、往下變暗']
      ])}
      <div class="callout" data-r style="padding:15px 22px">${ART.icon('sun',30,C.gold)}
        <span class="txt">商品照<b>寧可亮一點</b>。
        太暗的照片修不回來，稍微亮一點反而好調。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.phone(ART.camView({
        grid:true, ratio:'4:3', top:'調亮度', focus:[46,50], sun:true,
        view:`<div style="position:absolute;inset:0;background:linear-gradient(#c9a271,#b98f5c)">
                <div style="position:absolute;left:50%;top:55%;transform:translate(-50%,-50%)">
                  ${ART.jar45(118)}</div></div>`
      }), { w:238, h:474 })}
    </div>
  </div>`,
  notes:{
    say:['太陽圖示很小，一定要投影放大示範一次。',
         '「寧可亮一點」是商品照的實務原則，跟藝術攝影不一樣。'],
    ask:['問：找得到太陽圖示的舉手？'],
    do:['點商品後，把太陽往上滑一點點，拍一張。'],
    diff:['亮度可以自己控制之後，學員不會再抱怨「室內拍起來都很暗」。'],
    more:['iPhone 可以長按鎖定曝光，Android 專業模式有 EV 數值。'],
    less:['只示範一次，不做實作。']
  }});

S({ part:'PART 3', time:'11:05', kind:'std', title:'【實作】太暗／正常／太亮，你選哪一張',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　五分鐘</p>
      <h2 class="h" data-r style="font-size:38px">拍三張，自己選一張</h2>
    </div>
    <div data-r style="display:flex;gap:22px;justify-content:center;align-items:center">
      ${ART.scene({ w:290, h:218, bg:'wood', light:'front', angle:'a45', sim:'dark',  cap:'太暗' })}
      ${ART.scene({ w:290, h:218, bg:'wood', light:'front', angle:'a45',              cap:'剛剛好' })}
      ${ART.scene({ w:290, h:218, bg:'wood', light:'front', angle:'a45', sim:'bright',cap:'太亮' })}
    </div>
    <div class="callout gold" data-r style="max-width:940px">${ART.icon('eye',32,C.gold)}
      <span class="txt">沒有標準答案。<b>你覺得商品最像實品的那張，就是對的那張。</b>
      商品照的目的不是漂亮，是不要讓客人收到後覺得「跟照片不一樣」。</span></div>
  </div>`,
  notes:{
    say:['不要幫學員選，讓她們自己講哪一張最像實品。',
         '這裡可以帶出一個重要觀念：商品照的標準是「像不像實品」，不是「美不美」。',
         '下午講濾鏡與 AI 紅線時會回來呼應這一句。'],
    ask:['問：你選哪一張？為什麼？',
         '問：如果客人收到東西，發現顏色跟照片不一樣，會怎麼想？'],
    do:['同一個商品拍太暗、正常、太亮各一張，三張並排選一張。'],
    diff:['多數人會選中間那張，並且第一次意識到亮度是自己可以控制的。'],
    more:['講一下太暗的照片放大會有雜訊，救不回來。'],
    less:['只拍正常與太暗兩張。']
  }});

S({ part:'PART 3', time:'11:10', kind:'std', title:'鏡頭切換：0.5x、1x、2x 各適合什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">商品照，先用 1x</h2>
    </div>
    <div data-r style="display:flex;gap:20px;justify-content:center;align-items:flex-end">
      ${ART.scene({ w:290, h:218, px:78,  bg:'wood', light:'side', angle:'a45', clutter:2,
                    cls:'bad', mark:'✕', cap:'0.5x　商品變小、邊緣變形' })}
      ${ART.scene({ w:290, h:218, px:150, bg:'wood', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'1x　最安全、最不失真' })}
      ${ART.scene({ w:290, h:218, px:210, bg:'wood', light:'side', angle:'a45', sim:'blur',
                    cls:'bad', mark:'✕', cap:'2x　數位放大，可能會糊' })}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">0.5x 是超廣角，<b>會讓商品邊緣變形</b>，適合拍環境不適合拍商品。
      2x 在部分手機是<b>數位放大</b>，只是把畫面裁切放大而已。</span></div>
  </div>`,
  notes:{
    say:['三張是同一個位置拍的，只有倍率不同。',
         '0.5x 變形這件事對拍商品很致命，方形的東西會變成梯形。'],
    ask:['問：你們平常會用 0.5x 嗎？什麼時候用？'],
    do:['同一個位置，三個倍率各拍一張。'],
    diff:['學員會看到 0.5x 的邊緣變形和 2x 的畫質下降。'],
    more:['講光學變焦與數位變焦的差別（教材 P.37）。'],
    less:['只講「商品用 1x」。']
  }});

S({ part:'PART 3', time:'11:14', kind:'std', title:'能走近，就不要用手指放大',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:38px">用腳靠近<br>不要用手指放大</h2>
      </div>
      <p class="lead" data-r style="font-size:22px">
        數位變焦只是把畫面做「裁剪」，
        <b>會降低照片畫質，畫面看起來也會較模糊</b>。<br><br>
        小物攝影正解：<b class="hl">近距離拍攝是最不會影響解析度的方法。</b></p>
      <div class="callout sage" data-r>${ART.icon('ok',32,C.sage)}
        <span class="txt">想拍細節，<b>人往前走兩步</b>，不要在原地用手指撐開畫面。</span></div>
    </div>
    <div data-r style="display:flex;flex-direction:column;gap:16px;align-items:center">
      ${ART.scene({ w:320, h:200, px:190, bg:'cloth', light:'side', angle:'a45', sim:'blur',
                    cls:'bad', mark:'✕', cap:'原地用手指放大：糊' })}
      ${ART.scene({ w:320, h:200, px:190, bg:'cloth', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'人走近再拍：清楚' })}
    </div>
  </div>`,
  notes:{
    say:['這一頁的口訣就一句：「用腳靠近，不要用手指放大」。',
         '兩張圖的商品大小一樣，差別只在清晰度，這正是數位變焦的代價。'],
    ask:['問：你們拍細節的時候，是走過去還是用手指放大？'],
    do:['選一個商品的細節（標籤、紋理），走近拍一張。'],
    diff:['走近拍的細節照會明顯清楚很多。'],
    more:['提醒太近會對不到焦，手機最近對焦距離大約 8–10 公分。'],
    less:['和上一頁合併講。']
  }});

S({ part:'PART 3', time:'11:17', kind:'std', title:'【實作】三個倍率各拍一張',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　四分鐘</p>
      <h2 class="h" data-r style="font-size:40px">站在同一個位置，換三次倍率</h2>
    </div>
    <div data-r style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;max-width:900px">
      <span class="tag">① 0.5x 拍一張</span>
      <span class="tag on">② 1x 拍一張</span>
      <span class="tag">③ 2x 拍一張</span>
      <span class="tag g">④ 再往前走兩步，用 1x 拍一張</span>
    </div>
    <p class="lead" data-r style="font-size:23px;max-width:900px">
      拍完把四張放大來看。<br>
      <b class="hl">第 ④ 張通常最清楚</b>——這就是「用腳靠近」的意思。</p>
    <div class="callout" data-r style="max-width:900px">${ART.icon('bulb',32)}
      <span class="txt">看不出差別的時候，把照片<b>放大到 100%</b> 再看一次。
      在小螢幕上全部都很好看，放大才看得出誰是真的清楚。</span></div>
  </div>`,
  notes:{
    say:['第四張是關鍵，一定要做。',
         '「放大到 100% 再看」這個習慣要教，不然學員永遠看不出差別。'],
    ask:['問：四張裡面，哪一張放大之後最清楚？'],
    do:['四張都拍，放大比較。'],
    diff:['2x 那張放大後會看到明顯的塗抹感。'],
    more:['講手機的主鏡頭通常畫質最好，這就是 1x。'],
    less:['只拍 ② 和 ④ 兩張。']
  }});

S({ part:'PART 3', time:'11:20', kind:'std', title:'閃光燈：什麼時候該關掉',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">拍商品，幾乎永遠關掉</h2>
    </div>
    <div class="split" style="gap:34px">
      <div data-r style="display:flex;flex-direction:column;gap:14px">
        ${ART.scene({ w:340, h:200, bg:'wood', light:'harsh', angle:'a45',
                      cls:'bad', mark:'✕', cap:'開閃光燈：陰影很硬、顏色不自然' })}
        ${ART.scene({ w:340, h:200, bg:'wood', light:'side', angle:'a45',
                      cls:'good', mark:'✓', cap:'關閃光燈、靠窗邊：柔和自然' })}
      </div>
      <div class="stack gap-s" data-r>
        <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em">為什麼不要開</p>
        <ul class="list">
          <li>拍攝物件或人像時<b>盡量不要開啟閃光燈</b>，會使陰影呈現不自然，也會使光源過硬</li>
          <li>顏色會偏掉，商品的真實色跑掉</li>
          <li>玻璃罐、塑膠包裝會直接反光成一個白點</li>
          <li>開閃光燈時相機會自動<b>調降 ISO</b>，快門變慢，<b>反而更容易晃</b></li>
        </ul>
        <div class="callout gold" style="padding:14px 20px">${ART.icon('win',30,C.gold)}
          <span class="txt">室內光線不夠時，<b>不是開閃光燈，是走到窗邊</b>。</span></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['閃光燈是初學者最常犯的錯，這一頁要講得明確。',
         '最後一句「不是開閃光燈，是走到窗邊」是下一段光線的伏筆。',
         '教材 P.80 小朋友室內照、P.82 食物那兩題都在講同一件事。'],
    ask:['問：你們拍東西會開閃光燈嗎？什麼時候會開？'],
    do:['確認閃光燈是「關閉」不是「自動」。'],
    diff:['關掉之後照片顏色會變自然，反光白點消失。'],
    more:['講「自動」模式為什麼也不建議：手機判斷不準，該亮的時候不亮。'],
    less:['只確認關閉，不解釋原因。']
  }});

/* =========================================================================
   PART 4　手機怎麼拿穩　（33–35）
   ========================================================================= */
S({ part:'PART 4', time:'11:22', kind:'std', title:'照片糊掉，多半不是手機的問題',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">
        「有時連<span class="hl">呼吸的起伏</span>都會影響畫面的清晰度」</h2>
    </div>
    <div class="cards c4" data-r style="gap:16px">
      ${[['雙手固定手機','一手托住、一手扶邊，不要單手伸很遠'],
         ['用指腹按快門','不是用指尖戳，戳下去手機會震'],
         ['手肘靠身體','手肘夾住肋骨，等於多兩根支架'],
         ['靠桌面或牆','附近有可倚靠的物體，穩定效果更佳']]
        .map(([k,v],i)=>`
        <div class="card" style="padding:22px 20px">
          <span class="num-badge" style="background:${[C.clay,C.gold,C.sage,C.plum][i]};margin-bottom:11px">${i+1}</span>
          <p class="k" style="font-size:23px">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('hand',32)}
      <span class="txt">拍商品時，商品不會動，<b>會動的只有你的手</b>。
      這四個動作是免費的，做了就有效。</span></div>
  </div>`,
  notes:{
    say:['「會動的只有你的手」這句話要講，學員才知道問題在哪。',
         '四個動作現場一起做一次，尤其是手肘靠身體。'],
    ask:['問：你們拍照的時候手會不會伸很直？'],
    do:['全班一起做一次四個動作。'],
    diff:['同樣的光線條件下，照片會明顯變清楚。'],
    more:['講快門速度低於 1/60 秒就有手震風險（教材 P.14）。'],
    less:['只講「雙手」和「靠桌子」。']
  }});

S({ part:'PART 4', time:'11:26', kind:'std', title:'錯誤拿法 vs 正確拿法',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">同樣的光，拿法不同結果不同</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card" data-r style="padding:20px;border-top:5px solid #d63b2f">
        <p class="cap" style="color:#d63b2f">常見的錯誤</p>
        <div class="stack gap-s">
          <div class="no"><i>✕</i><span>單手拿，手臂伸得很直</span></div>
          <div class="no"><i>✕</i><span>用指尖用力戳快門</span></div>
          <div class="no"><i>✕</i><span>按下去的瞬間就把手機拿走</span></div>
          <div class="no"><i>✕</i><span>邊走邊拍</span></div>
        </div>
      </div>
      <div class="card" data-r style="padding:20px;border-top:5px solid ${C.sage}">
        <p class="cap" style="color:${C.sage}">正確的做法</p>
        <div class="stack gap-s">
          <div class="yes"><i>✓</i><span>雙手托住，手肘靠身體</span></div>
          <div class="yes"><i>✓</i><span>指腹輕輕按，按完停一秒再放</span></div>
          <div class="yes"><i>✓</i><span>手肘或手腕靠在桌面上</span></div>
          <div class="yes"><i>✓</i><span>拍細節時吐氣到一半再按</span></div>
        </div>
      </div>
    </div>
    <div class="callout gold" data-r>${ART.icon('crop',32,C.gold)}
      <span class="txt"><b>直式還是橫式？</b>看你要發在哪裡：
      社群貼文與限動用直式，商品陳列、多個一起拍用橫式。今天先用直式，因為 4:3 直拿商品最完整。</span></div>
  </div>`,
  notes:{
    say:['「按完停一秒再放」是最多人忽略的，按下去馬上移開手機一定糊。',
         '直式橫式不用講太久，一句話帶過。'],
    ask:['問：有人是按完馬上把手機拿起來看的嗎？（幾乎所有人）'],
    do:[],
    diff:['按完停一秒之後，糊掉的機率會明顯下降。'],
    more:['講可以用音量鍵當快門，比點螢幕穩。'],
    less:['只講左右兩欄的第一項。']
  }});

S({ part:'PART 4', time:'11:30', kind:'std', title:'【實作】穩與不穩，各拍一張',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　四分鐘</p>
      <h2 class="h" data-r style="font-size:40px">故意晃一張，穩穩拍一張</h2>
    </div>
    <div data-r style="display:flex;gap:30px;justify-content:center;align-items:center">
      ${ART.scene({ w:330, h:248, bg:'cloth', light:'side', angle:'a45', sim:'blur',
                    cls:'bad', mark:'✕', cap:'單手、手伸直、用力戳' })}
      ${ART.scene({ w:330, h:248, bg:'cloth', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'雙手、手肘靠桌、輕輕按' })}
    </div>
    <p class="lead" data-r style="font-size:23px;max-width:900px">
      放大到 100% 再看一次。<b class="hl">糊掉的照片，修圖救不回來</b>——
      這是下午會再講的重點。</p>
  </div>`,
  notes:{
    say:['「糊掉救不回來」要在這裡先講一次，下午修圖段會回收。',
         '請學員一定要放大看，小螢幕上兩張都很好看。'],
    ask:['問：放大之後，兩張差多少？'],
    do:['故意晃一張、穩穩拍一張，放大比較。'],
    diff:['晃到的那張放大後字會有殘影。'],
    more:['介紹腳架與自拍棒（教材 P.179–180），但強調現在不用買。'],
    less:['只拍穩的那一張。']
  }});

/* =========================================================================
   PART 5　背景與商品擺放　（36–40）
   ========================================================================= */
S({ part:'PART 5', time:'11:35', kind:'divider', title:'PART 5｜背景與商品擺放',
  html: divider('05','背景與<br>商品擺放',
    '不用花錢，只要把畫面整理乾淨。這是投報率最高的一段。',
    ART.icon('crop',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段完全不用器材，只要動手整理，效果非常明顯。'], ask:[], do:[] }});

S({ part:'PART 5', time:'11:36', kind:'std', title:'你第一眼看到的是商品，還是背景？',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:38px">你的眼睛先看到哪裡？</h2>
    </div>
    <div data-r style="display:flex;gap:30px;justify-content:center;align-items:center">
      ${ART.scene({ w:340, h:255, bg:'wood', light:'flat', angle:'a45', clutter:3,
                    cls:'bad', mark:'✕', cap:'背景有鑰匙、杯子、湯匙' })}
      ${ART.scene({ w:340, h:255, bg:'wood', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'背景只有桌面' })}
    </div>
    <div class="callout" data-r style="max-width:920px">${ART.icon('eye',32)}
      <span class="txt"><b>愈乾淨、愈整齊的背景，愈可以將商品最原始的樣子呈現出來。</b>
      也提醒：東西放太多，會讓人分不出主體是誰。</span></div>
  </div>`,
  notes:{
    say:['先讓學員看，再問問題，不要先講道理。',
         '這一頁的兩張圖只差背景雜物，光線和角度都一樣。'],
    ask:['問：左邊那張，你第一眼看到什麼？',
         '問：如果你是客人，哪一張你會想點進去？'],
    do:[],
    diff:['幾乎所有人都會說右邊比較好，但講不出為什麼——下一頁就給他們理由。'],
    more:['把學員早上的 Before 照片投影出來，一起找背景雜物。'],
    less:['直接進下一頁。']
  }});

S({ part:'PART 5', time:'11:40', kind:'std', title:'背景越簡單越容易成功，拍之前先看四個邊',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">按快門前，眼睛沿著<br>畫面繞一圈</h2>
      </div>
      <div class="stack gap-s" data-r>
        ${[['上面','有沒有電線、招牌、別人的手'],
           ['下面','有沒有桌上的屑屑、水漬、遙控器'],
           ['左邊','有沒有半個杯子、袋子的一角'],
           ['右邊','有沒有充電線、鑰匙、面紙']]
          .map(([k,v])=>`
          <div style="display:flex;gap:14px;align-items:center;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-radius:13px;padding:12px 18px">
            <span style="font-size:22px;font-weight:900;color:${C.clay};min-width:60px">${k}</span>
            <span style="font-size:20px;font-weight:650;color:${C.ink2}">${v}</span>
          </div>`).join('')}
      </div>
      <div class="callout sage" data-r style="padding:15px 22px">${ART.icon('ok',30,C.sage)}
        <span class="txt">好背景不用買：<b>白紙、素色布、木桌、牆壁</b>都可以。</span></div>
    </div>
    <div class="stack gap-s" data-r>
      <p class="cap" style="color:${C.muted};font-size:20px;letter-spacing:.08em;text-align:center">
        深淺要分開，不然會融在一起</p>
      ${ART.scene({ w:330, h:186, bg:'dark', light:'flat', angle:'side', body:'#6b5a48', lid:'#5a4a3c',
                    cls:'bad', mark:'✕', cap:'深色商品配深色背景：糊成一片' })}
      ${ART.scene({ w:330, h:186, bg:'white', light:'front', angle:'side', body:'#6b5a48', lid:'#5a4a3c',
                    cls:'good', mark:'✓', cap:'深色商品配淺色背景：輪廓清楚' })}
    </div>
  </div>`,
  notes:{
    say:['「看四個邊」是一個可以馬上養成的習慣，比講構圖理論有用。',
         '深淺對比這一點借自教材 P.74 拍白髮長輩的原理，用在商品上一樣成立。'],
    ask:['問：你們家最容易拍照的乾淨檯面在哪裡？'],
    do:['把桌上跟商品無關的東西全部移開，再拍一張。'],
    diff:['只是移開雜物，照片就會像換了一台相機。'],
    more:['示範用一張 A4 白紙當背景板，立起來當背景牆。'],
    less:['只講「看四個邊」。']
  }});

S({ part:'PART 5', time:'11:45', kind:'std', title:'錯誤 vs 改善：只換背景，其他都不動',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:38px">同一個商品，四種背景</h2>
    </div>
    <div data-r style="display:flex;gap:16px;justify-content:center">
      ${ART.scene({ w:240, h:180, bg:'wood',  light:'side',  angle:'a45', clutter:2, cls:'bad', mark:'✕', cap:'雜亂桌面' })}
      ${ART.scene({ w:240, h:180, bg:'white', light:'front', angle:'a45', cap:'白色：乾淨專業' })}
      ${ART.scene({ w:240, h:180, bg:'wood',  light:'side',  angle:'a45', cap:'木紋：溫暖手作' })}
      ${ART.scene({ w:240, h:180, bg:'dark',  light:'back',  angle:'a45', cap:'深色：高級精緻' })}
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:960px">
      光線、角度、距離都沒變，<b class="hl">只換了商品底下那張紙</b>。<br>
      背景不是「有沒有比較好看」，是「你想給人什麼感覺」。</p>
    ${strip('背景怎麼選', f => f.bg)}
  </div>`,
  notes:{
    say:['這一頁是感覺主軸第一次回收，要明確講「這就是早上第 6 頁那張表」。',
         '四張只差背景，其他變因都固定，這正是「一次只改一個」的示範。'],
    ask:['問：你早上圈的是哪一種感覺？那你應該用哪一種背景？'],
    do:['換一張背景（白紙／布／木桌）再拍一張，跟原本的並排。'],
    diff:['同一個商品換背景後，感覺完全不同，但商品本身沒變。'],
    more:['講背景不要有花紋，花紋會跟商品搶。'],
    less:['只留白色與木紋兩張。']
  }});

S({ part:'PART 5', time:'11:52', kind:'std', title:'商品怎麼放：誰是主角',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">畫面裡一定要知道誰是主角</h2>
    </div>
    <div class="cards c4" data-r style="gap:16px">
      ${[['前後','主商品放前面、配角退後面，自然分出主次',C.clay],
         ['高低','用書或盒子墊高其中一個，畫面才有層次',C.gold],
         ['遠近','主角靠近鏡頭，配角放遠一點',C.sage],
         ['數量','一個主角 ＋ 1–3 個配角就夠，不要塞滿',C.plum]]
        .map(([k,v,c])=>`
        <div class="card" style="padding:20px 18px;border-top:5px solid ${c}">
          <p class="k" style="font-size:23px;color:${c}">${k}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r>${ART.icon('warn',32)}
      <span class="txt">的反例：把小物跟植物放在一起拍，
      <b>會讓人分不出主體是誰，易使主題失焦</b>。配角是來襯托的，不是來搶戲的。</span></div>
    ${strip('這一段對應到', f => f.bg)}
  </div>`,
  notes:{
    say:['四個字：前後、高低、遠近、數量。講完就讓學員動手排一次。',
         '「配角是來襯托的」這句話下午講配件時會再用一次。'],
    ask:['問：你的商品有沒有可以一起入鏡的東西？（原料、包裝、器具）'],
    do:['把商品重新排一次，用前後或高低做出層次，拍一張。'],
    diff:['排過的畫面會有前後關係，不再是「東西平平地擺著」。'],
    more:['進 PART 10 配件段（如果進度快）。'],
    less:['只講「一個主角 ＋ 1–3 個配角」。']
  }});

/* =========================================================================
   PART 6　光線　（41–50）
   ========================================================================= */
S({ part:'PART 6', time:'13:00', kind:'divider', title:'PART 6｜光線',
  html: divider('06','光線',
    '教材 P.26：「光線在拍攝照片中，扮演最重要的角色。」<br>下午第一段，也是全天最重要的一段。',
    ART.icon('sun',130,'rgba(255,255,255,.13)')),
  notes:{ say:['午休剛結束，這一段要讓大家站起來走到窗邊，正好醒神。'], ask:[], do:[] }});

S({ part:'PART 6', time:'13:01', kind:'std', title:'光線，是商品照最重要的一件事',
  html:`
  <div class="stack gap-l center" style="text-align:center;justify-content:center">
    <h2 class="mega" data-r style="font-size:56px;max-width:1000px;line-height:1.3">
      光線在拍攝照片中<br><span class="hl">扮演最重要的角色</span></h2>
    <p class="lead" data-r style="font-size:25px;max-width:860px">
      前面教的對焦、亮度、拿穩，都是在「不要拍壞」。<br>
      從這一段開始，是「怎麼拍好」。</p>
    <div data-r style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap">
      <span class="tag">順光</span><span class="tag">側光</span>
      <span class="tag">逆光</span><span class="tag dim">大太陽直射</span>
      <span class="tag g">白紙補光</span>
    </div>
  </div>`,
  notes:{
    say:['慢慢念完那句話，停兩秒。',
         '「不要拍壞」到「怎麼拍好」的轉折要講清楚，這是上下午的分界。'],
    ask:['問：你們平常都在哪裡拍商品？（多半是餐桌、客廳，很少人會特地找窗戶）'],
    do:[],
    diff:['學員會意識到前面都是基本功，重頭戲現在才開始。'],
    more:[], less:['直接進下一頁。']
  }});

S({ part:'PART 6', time:'13:03', kind:'std', title:'第一步：先找窗戶',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:38px">你家最好的燈<br>就是窗戶</h2>
      </div>
      <ul class="list" data-r>
        <li><b>自然光源就是太陽光</b>，是大家拍攝時最常使用的光線</li>
        <li>室內透過窗戶照射，<b>光線強度已經減少</b>，比在戶外好控制</li>
        <li>白天不用開燈，把商品端到窗邊就好</li>
        <li>陰天的窗邊光其實最漂亮，因為雲層把光打散了</li>
      </ul>
      <div class="callout sage" data-r>${ART.icon('ok',32,C.sage)}
        <span class="txt"><b>現在還不用買燈。</b>市售的燈箱、劍燈、環形燈都是選配；
        P.29 甚至寫「可自行製作簡易燈箱，利用紙箱與白紙」。</span></div>
    </div>
    <div data-r style="display:flex;justify-content:center;align-items:center">
      ${ART.scene({ w:340, h:300, bg:'white', light:'side', angle:'a45', zoom:1.05,
                    cap:'窗邊的桌子：今天的攝影棚' })}
    </div>
  </div>`,
  notes:{
    say:['「現在還不用買燈」一定要講。中高齡學員很容易覺得要買器材才能拍好。',
         '陰天窗邊光最漂亮這件事很反直覺，講了學員會記得。'],
    ask:['問：你家哪一扇窗戶白天光最好？'],
    do:['全班移動到窗邊（或最亮的位置）。'],
    diff:['光源換了，照片立刻不一樣。'],
    more:['講薄窗簾可以當柔光罩。'],
    less:['不移動，只講原理。']
  }});

S({ part:'PART 6', time:'13:07', kind:'std', title:'順光：最安全、最清楚',
  html:`
  <div class="split" style="gap:36px">
    <div data-r>
      ${ART.scene({ w:400, h:300, bg:'white', light:'front', angle:'a45', zoom:1.05,
                    cls:'good', mark:'✓', cap:'順光：光從你背後來' })}
    </div>
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">不知道用什麼光<br>就用順光</h2>
      </div>
      <ul class="list" data-r>
        <li><b>顏色飽和、亮度足夠，色彩看起來更鮮豔</b></li>
        <li>細節最清楚，商品的字、紋理都看得到</li>
        <li>最不容易失敗，適合<b>主圖</b>與<b>電商上架照</b></li>
      </ul>
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('warn',30,C.gold)}
        <span class="txt">缺點是比較<b>平</b>，立體感少一點。
        還有：注意不要把<b>自己的影子</b>拍進去。</span></div>
    </div>
  </div>`,
  notes:{
    say:['順光是最安全的選擇，講給沒把握的學員聽。',
         '「不要把自己的影子拍進去」是順光唯一要注意的事，教材 P.26 也提到。'],
    ask:['問：你背對窗戶站，影子會落在哪裡？'],
    do:['背對窗戶，商品放前面，拍一張。'],
    diff:['顏色會變飽和，商品的字看得清楚。'],
    more:['講順光適合哪種商品：有文字標籤的、顏色重要的。'],
    less:['三個光向合併成一頁講。']
  }});

S({ part:'PART 6', time:'13:11', kind:'std', title:'側光：立體感從這裡來',
  html:`
  <div class="split w-right" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">手作、食物<br>最適合側光</h2>
      </div>
      <ul class="list" data-r>
        <li>利用側光拍攝，<b>產生陰影，可以增加照片的立體感</b></li>
        <li>室內側光柔和，<b>能呈現更好的立體感，讓照片更有層次感</b></li>
        <li>果醬的濃稠、麵包的孔洞、布料的織紋，側光才看得出來</li>
      </ul>
      <div class="callout" data-r style="padding:15px 22px">${ART.icon('bulb',30)}
        <span class="txt">做法很簡單：<b>商品放在窗戶旁邊</b>，
        你站在跟窗戶垂直的位置拍。陰影落在商品的另一側，立體感就出來了。</span></div>
    </div>
    <div data-r>
      ${ART.scene({ w:400, h:300, bg:'wood', light:'side', angle:'a45', zoom:1.05,
                    cls:'good', mark:'✓', cap:'側光：一邊亮、一邊有陰影' })}
    </div>
  </div>`,
  notes:{
    say:['側光是手作商品最好用的光，要多花一點時間。',
         '「陰影不是壞事」這個觀念要建立，很多人以為有陰影就是拍壞了。'],
    ask:['問：你摸得到商品的紋理，但照片上看不出來，為什麼？（因為光太平）'],
    do:['商品移到窗戶旁邊，站在垂直方向拍一張。'],
    diff:['商品會突然「立起來」，有厚度。'],
    more:['講陰影太重時可以用白紙補（下一頁的伏筆）。'],
    less:['和順光合併。']
  }});

S({ part:'PART 6', time:'13:15', kind:'std', title:'逆光：有氣氛，但最難控制',
  html:`
  <div class="split" style="gap:36px">
    <div data-r>
      ${ART.scene({ w:400, h:300, bg:'dark', light:'back', angle:'a45', zoom:1.05,
                    mark:'△', cap:'逆光：光從商品後方來' })}
    </div>
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">好看，但<br>初學者最容易失敗</h2>
      </div>
      <ul class="list" data-r>
        <li>可以<b>營造另一種照片的氛圍</b>，也能增加立體感</li>
        <li>飲料、果醬、蜂蜜這類<b>透光的商品</b>，逆光會很漂亮</li>
        <li>但商品正面容易變成一片黑，需要補光</li>
        <li>室內逆光要注意角度，<b>避免背景過曝或整體模糊</b></li>
      </ul>
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('warn',30,C.gold)}
        <span class="txt">今天先知道有這個選項就好。<b>想試的話，一定要搭配下一頁的白紙。</b></span></div>
    </div>
  </div>`,
  notes:{
    say:['逆光不要教太深，讓學員知道存在、知道難就好。',
         '透光商品（果醬、蜂蜜、飲料）是唯一值得初學者嘗試逆光的情況。'],
    ask:['問：你的商品會透光嗎？'],
    do:['有透光商品的學員可以試一張，其他人先看就好。'],
    diff:['透光商品逆光會發亮，非常漂亮；不透光的會變黑。'],
    more:['講側逆光是折衷做法（教材 P.28）。'],
    less:['整頁只留一句「逆光很難，今天先不做」。']
  }});

S({ part:'PART 6', time:'13:19', kind:'std', title:'大太陽直射，為什麼反而難拍',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">正中午的太陽，是最難用的光</h2>
    </div>
    <div class="split" style="gap:30px">
      <div data-r>
        ${ART.scene({ w:400, h:250, bg:'wood', light:'harsh', angle:'a45',
                      cls:'bad', mark:'✕', cap:'正中午直射：陰影很硬、一邊死白' })}
      </div>
      <div class="stack gap-s" data-r>
        ${[['陰影太硬','邊緣像用刀切出來的，不好看'],
           ['一邊過曝','亮的地方變成一片死白，細節全沒了'],
           ['反光','玻璃罐、塑膠袋會出現刺眼的白點'],
           ['顏色跑掉','商品的顏色會被曬得偏白']]
          .map(([k,v])=>`
          <div style="display:flex;gap:13px;align-items:center;background:#fff;
               border:1px solid rgba(36,28,23,.12);border-left:4px solid #d63b2f;
               border-radius:13px;padding:11px 16px">
            <span style="font-size:21px;font-weight:900;color:#d63b2f;min-width:84px">${k}</span>
            <span style="font-size:20px;font-weight:650;color:${C.ink2}">${v}</span>
          </div>`).join('')}
      </div>
    </div>
    <div class="callout sage" data-r>${ART.icon('ok',32,C.sage)}
      <span class="txt">解法很簡單：<b>不要在正中午的太陽底下拍</b>。
      移到窗邊的陰影處，或等到早上、傍晚。柔和的窗光永遠比強光好用。</span></div>
  </div>`,
  notes:{
    say:['這一頁在打破「光越強越好」的直覺。',
         '教材 P.28 有提到正午頂光與逆光的表現不同。'],
    ask:['問：你們拍照會特地選時間嗎？'],
    do:[],
    diff:['學員以後會避開正午直射，改用窗邊。'],
    more:['講薄窗簾、描圖紙可以把直射光變柔。'],
    less:['一句話帶過：「不要在大太陽底下拍」。']
  }});

S({ part:'PART 6', time:'13:23', kind:'std', title:'一張白紙就能補光',
  html:`
  <div class="split w-left" style="gap:40px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:38px">陰影太重<br>拿張白紙擋回去</h2>
      </div>
      <p class="lead" data-r style="font-size:22px">
        反光板<b>也可以使用一般白紙、雷射卡或厚紙板來代替</b>。</p>
      ${ART.steps([
        ['商品放窗邊','光從一側進來，另一側會有陰影'],
        ['白紙放陰影側','A4 白紙立起來，對著暗的那一邊'],
        ['靠近一點','白色反光效果較弱，<b>要靠主體更近</b>']
      ])}
      <div class="callout gold" data-r style="padding:14px 20px">${ART.icon('bulb',30,C.gold)}
        <span class="txt">沒有白紙？<b>白色便當盒蓋、白毛巾、A4 紙</b>都可以。</span></div>
    </div>
    <div data-r style="display:flex;flex-direction:column;gap:14px;align-items:center">
      ${ART.scene({ w:330, h:200, bg:'wood', light:'side', angle:'a45', sim:'dark',
                    cls:'bad', mark:'✕', cap:'沒補光：暗側太黑' })}
      ${ART.scene({ w:330, h:200, bg:'wood', light:'side', angle:'a45',
                    cls:'good', mark:'✓', cap:'加白紙：暗側被打亮了' })}
    </div>
  </div>`,
  notes:{
    say:['這一招最有感，一定要現場示範。',
         '教材 P.32 說白色反光效果不佳、要靠近，這一點要照實講，不然學員放太遠會沒效果。'],
    ask:['問：你家裡有什麼白色的東西可以當反光板？'],
    do:['發 A4 白紙，每人立一張在商品的陰影側，拍一張。'],
    diff:['暗的那一側會被打亮，陰影變柔，商品細節出來。'],
    more:['講銀色反光板（鋁箔紙）反射更強，但要拉遠（教材 P.31）。'],
    less:['講師示範一次就好，不發紙。']
  }});

S({ part:'PART 6', time:'13:27', kind:'std', title:'【實作】四張並排',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　八分鐘　·　今天最重要的一次比較</p>
      <h2 class="h" data-r style="font-size:38px">同一個商品，拍四張</h2>
    </div>
    <div data-r style="display:flex;gap:16px;justify-content:center">
      ${ART.scene({ w:240, h:180, bg:'wood',  light:'flat',  angle:'a45', sim:'dark', cap:'① 原本的位置' })}
      ${ART.scene({ w:240, h:180, bg:'white', light:'front', angle:'a45',             cap:'② 移到窗邊' })}
      ${ART.scene({ w:240, h:180, bg:'wood',  light:'side',  angle:'a45',             cap:'③ 改成側光' })}
      ${ART.scene({ w:240, h:180, bg:'wood',  light:'side',  angle:'a45', sim:'soft', cls:'good', mark:'✓', cap:'④ 加白紙補光' })}
    </div>
    <p class="lead" data-r style="font-size:23px;max-width:960px">
      四張都拍完，放在一起看。<br>
      <b class="hl">中間沒有換手機、沒有修圖、沒有花一毛錢。</b></p>
  </div>`,
  notes:{
    say:['這是全天最重要的一次實作，給足八分鐘。',
         '一定要四張都拍，少一張對照就不完整。',
         '拍完先不要講評，讓學員自己看，下一頁才問問題。'],
    ask:[],
    do:['四張依序拍完，存在同一個相簿，並排比較。'],
    diff:['從①到④是連續變好的過程，學員會非常有感。'],
    more:['多拍一張逆光加白紙。'],
    less:['只拍 ① 和 ④ 兩張。']
  }});

S({ part:'PART 6', time:'13:35', kind:'std', title:'三個問題，自己挑出最好的那一張',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:38px">用這三個問題，自己挑一張</h2>
    </div>
    <div class="cards c3" data-r style="gap:20px;max-width:1000px;margin:0 auto">
      ${[['1','哪一張商品最清楚？','看得到字、看得到紋理',C.clay],
         ['2','哪一張最有立體感？','有厚度，不是平平貼在桌上',C.gold],
         ['3','哪一張看起來最舒服？','不刺眼、不昏暗，你想多看兩秒',C.sage]]
        .map(([n,q,v,c])=>`
        <div class="card" style="padding:24px 22px">
          <span class="num-badge" style="background:${c};margin-bottom:12px">${n}</span>
          <p class="k" style="font-size:24px">${q}</p>
          <p class="v" style="font-size:20px">${v}</p>
        </div>`).join('')}
    </div>
    ${strip('光線怎麼選', f => f.light)}
  </div>`,
  notes:{
    say:['三個問題一個一個問，讓學員舉手投票。',
         '三個問題的答案可能不是同一張，這很正常——這時候就用早上圈的「感覺」來決定。',
         '這一頁是感覺主軸第二次回收。'],
    ask:['問：哪一張最清楚？哪一張最有立體感？哪一張最舒服？',
         '問：如果三個答案不一樣，你要選哪一張？（答：看你要給人什麼感覺）'],
    do:['在講義上寫下自己選的那一張是第幾張，以及為什麼。'],
    diff:['學員會發現「最好看」跟「最清楚」不一定是同一張，開始有判斷力。'],
    more:['請兩三位學員投影自己的四張，全班一起判讀。'],
    less:['只問第一個問題。']
  }});

/* =========================================================================
   PART 7　構圖　（51–56）
   ========================================================================= */
const BADGE = `<span style="font-size:16px;font-weight:800;color:#fff;background:${C.clay};
  padding:2px 9px;border-radius:20px">今天練</span>`;
const COMPS = [
  { k:'center',   name:'中心式',  use:'最安全',       main:1 },
  { k:'third',    name:'三分法',  use:'最常用',       main:1 },
  { k:'space',    name:'留白',    use:'留給文字',     main:1 },
  { k:'symmetry', name:'對稱式',  use:'包裝、成套',   main:1 },
  { k:'quarter',  name:'四分法',  use:'三分法的進階', main:0 },
  { k:'diagonal', name:'對角線',  use:'活潑、有動感', main:0 },
  { k:'frame',    name:'框架式',  use:'有層次感',     main:0 },
  { k:'curve',    name:'曲線',    use:'排列成弧形',   main:0 }
];

S({ part:'PART 7', time:'13:40', kind:'divider', title:'PART 7｜構圖',
  html: divider('07','構圖',
    '書上一共八種構圖法。<br>今天先把五種練熟，另外三種知道有就好。',
    ART.icon('grid',130,'rgba(255,255,255,.13)')),
  notes:{ say:['開場就把「這不是規則」講清楚，學員才不會綁手綁腳。'], ask:[], do:[] }});

S({ part:'PART 7', time:'13:41', kind:'std', title:'構圖＝商品放在哪裡比較舒服',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">構圖只有一個問題：放中間，還是不放中間</h2>
    </div>
    <div class="split" style="gap:34px">
      <div data-r style="position:relative">
        ${ART.scene({ w:460, h:300, bg:'wood', light:'side', angle:'a45', pos:'center', px:150,
                      cap:'放正中間' })}
        <div style="position:absolute;inset:0;pointer-events:none;border-radius:16px;overflow:hidden">
          <div style="position:absolute;left:33.33%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)"></div>
          <div style="position:absolute;left:66.66%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)"></div>
          <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
          <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
        </div>
      </div>
      <div data-r style="position:relative">
        ${ART.scene({ w:460, h:300, bg:'wood', light:'side', angle:'a45', pos:'third', px:150,
                      cap:'放在線上' })}
        <div style="position:absolute;inset:0;pointer-events:none;border-radius:16px;overflow:hidden">
          <div style="position:absolute;left:33.33%;top:0;bottom:0;width:2px;background:${C.gold}"></div>
          <div style="position:absolute;left:66.66%;top:0;bottom:0;width:1px;background:rgba(255,255,255,.55)"></div>
          <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
          <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,.55)"></div>
        </div>
      </div>
    </div>
    <div class="callout" data-r>${ART.icon('grid',32)}
      <span class="txt">三分法又稱<b>九宮格構圖法</b>，
      把畫面分成九等分，主體放在其中一個交叉點或線上。<b class="hl">開啟格線後就能直接用。</b></span></div>
  </div>`,
  notes:{
    say:['把早上打開格線的伏筆收回來。',
         '左右兩張就是這一段的全部內容，後面三頁只是把選擇說清楚。'],
    ask:['問：這兩張你比較喜歡哪一張？（沒有標準答案）'],
    do:[],
    diff:['學員第一次把格線和構圖連在一起。'],
    more:['講四分法（教材 P.21）。'],
    less:['直接進第 55 頁留白。']
  }});

S({ part:'PART 7', time:'13:43', kind:'std', title:'八種構圖法，一次看完',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:4px">
        書上一共八種——<span class="hl">今天練五種，另外三種知道有就好</span></h2>
    </div>
    <div data-r style="display:grid;grid-template-columns:repeat(4,1fr);gap:13px">
      ${COMPS.map(c => `
        <div>
          ${ART.comp(c.k, 250, 146)}
          <p style="margin:7px 0 0;font-size:21px;font-weight:900;
             color:${c.main ? C.clay : C.ink3};display:flex;align-items:center;gap:7px">
            ${c.name}${c.main ? BADGE : ''}</p>
          <p style="margin:1px 0 0;font-size:18px;font-weight:650;color:${C.ink3}">${c.use}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:13px 22px">${ART.icon('bulb',28)}
      <span class="txt">「構圖法僅為拍攝參考」——<b>不是規則，是八條現成的路</b>。
      挑一條走就好，不用每張都換。</span></div>
  </div>`,
  notes:{
    say:['這一頁是給學員一個全貌，不要逐一講解，八個名字念過去就好。',
         '重點是讓她們知道：構圖不只有一種，但今天只要練會五種。',
         '標「今天練」的四個，加上等一下的重複排列，就是今天要練的五種。'],
    ask:['問：這八張圖裡，哪一張最像你平常拍的？（多半是中心式）'],
    do:[],
    diff:['學員會發現自己一直只用同一種構圖。'],
    more:['八種各講一句用途。'],
    less:['只指出「今天練這五種」，其他跳過。']
  }});

S({ part:'PART 7', time:'13:46', kind:'std', title:'中央構圖：最安全',
  html:`
  <div class="split" style="gap:36px">
    <div data-r>
      ${ART.scene({ w:420, h:315, bg:'white', light:'front', angle:'side', pos:'center', px:170,
                    cls:'good', mark:'✓', cap:'中央構圖' })}
    </div>
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">不知道怎麼放<br>就放中間</h2>
      </div>
      <ul class="list" data-r>
        <li>可以讓人在看到照片的瞬間，<b>就知道照片主體的位置</b></li>
        <li>最適合：<b>電商主圖、商品目錄、包裝照</b></li>
        <li>對稱的商品（瓶罐、盒子）放中間最好看</li>
        <li>缺點：比較沒有故事感，看久了會單調</li>
      </ul>
      <div class="callout sage" data-r style="padding:15px 22px">${ART.icon('ok',30,C.sage)}
        <span class="txt">六張照片裡的<b>主圖</b>，用中央構圖最不會出錯。</span></div>
    </div>
  </div>`,
  notes:{
    say:['中央構圖不是「初學者才用」，電商主圖幾乎都是中央構圖。',
         '要幫學員建立信心：放中間不是偷懶。'],
    ask:['問：你在網路上買東西，商品主圖大多長什麼樣？'],
    do:['用中央構圖拍一張，這張就是等一下六張照片的主圖。'],
    diff:['學員拍出的第一張「像商品照」的照片。'],
    more:[], less:['和下一頁合併。']
  }});

S({ part:'PART 7', time:'13:49', kind:'std', title:'三分法：讓商品不一定放正中間',
  html:`
  <div class="split w-right" style="gap:36px">
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">放在線上<br>畫面會呼吸</h2>
      </div>
      <ul class="list" data-r>
        <li>把商品放在<b>格線的交叉點</b>或線上</li>
        <li>另一側留出來的空間，讓照片不那麼緊繃</li>
        <li>適合：情境照、幕後照、有配角的畫面</li>
        <li>可以讓照片<b>增加穩重感</b></li>
      </ul>
      <div class="callout gold" data-r style="padding:15px 22px">${ART.icon('bulb',30,C.gold)}
        <span class="txt">實務做法：把商品往左或往右移到<b>第一條線上</b>，
        空出來的那一半放配角，或什麼都不放。</span></div>
    </div>
    <div data-r style="position:relative">
      ${ART.scene({ w:420, h:315, bg:'wood', light:'side', angle:'a45', pos:'third', px:150,
                    cls:'good', mark:'✓', cap:'三分法：商品在左邊線上' })}
      <div style="position:absolute;inset:0;pointer-events:none;border-radius:16px;overflow:hidden">
        <div style="position:absolute;left:33.33%;top:0;bottom:0;width:2px;background:${C.gold};opacity:.85"></div>
        <div style="position:absolute;top:33.33%;left:0;right:0;height:1px;background:rgba(255,255,255,.5)"></div>
        <div style="position:absolute;top:66.66%;left:0;right:0;height:1px;background:rgba(255,255,255,.5)"></div>
      </div>
    </div>
  </div>`,
  notes:{
    say:['不用講數學，就說「往旁邊移，移到線上」。',
         '很多學員第一次把東西放偏會很不習慣，要鼓勵。'],
    ask:['問：把商品移到旁邊，你會不會覺得怪怪的？（會，但多看兩次就習慣了）'],
    do:['把商品移到格線上，拍一張。'],
    diff:['畫面會鬆開，不再像證件照。'],
    more:['講交叉點比線上更強調主體。'],
    less:['只講「往旁邊移一點」。']
  }});

S({ part:'PART 7', time:'13:52', kind:'std', title:'留白：留給文字的位置',
  html:`
  <div class="split" style="gap:36px">
    <div data-r>
      ${ART.scene({ w:420, h:315, bg:'white', light:'front', angle:'a45', pos:'edge', px:130,
                    cls:'good', mark:'✓', cap:'留白：左邊空著給文字' })}
    </div>
    <div class="stack gap-m">
      <div>
        <h2 class="h" data-r style="font-size:36px">空白不是浪費<br>是留位置</h2>
      </div>
      <ul class="list" data-r>
        <li>適當的留白<b>可以製造意境與氛圍，增加想像的空間</b></li>
        <li>對做生意的人來說更實際：<b>空白處可以放價格、名稱、活動文字</b></li>
        <li>接社群課：貼文要加字的話，拍的時候就要先留位置</li>
      </ul>
      <div class="callout" data-r style="padding:15px 22px">${ART.icon('tag',30)}
        <span class="txt">留白要留在<b>同一側</b>。左邊留白就每張都留左邊，
        六張放在一起才會整齊。</span></div>
    </div>
  </div>`,
  notes:{
    say:['留白對做生意的人最有用，因為之後要加字。',
         '對稱與重複排列在這裡一起帶過，不另外開頁。'],
    ask:['問：你的貼文會在照片上加字嗎？加在哪裡？'],
    do:['拍一張留白的照片，想像左邊要放商品名稱。'],
    diff:['學員開始為了「之後要用」而拍，不是只為了「現在好看」。'],
    more:['講對角線、框架式、曲線構圖（教材 P.22–23）。'],
    less:['只講「加字的話先留位置」。']
  }});

S({ part:'PART 7', time:'13:55', kind:'std', title:'對稱與重複排列',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">成套商品用對稱，一堆小東西用排列</h2>
    </div>
    <div class="split" style="gap:30px">
      <div class="card" data-r style="padding:18px 20px;border-top:5px solid ${C.plum}">
        ${ART.comp('symmetry', 470, 210)}
        <p class="k" style="font-size:24px;color:${C.plum};margin-top:12px">對稱式</p>
        <p class="v" style="font-size:20px">
          左右一樣、上下一樣，畫面會很穩。<br>
          適合：<b>禮盒、成套商品、一組兩罐、包裝正面照</b>。</p>
      </div>
      <div class="card" data-r style="padding:18px 20px;border-top:5px solid ${C.sage}">
        ${ART.comp('repeat', 470, 210)}
        <p class="k" style="font-size:24px;color:${C.sage};margin-top:12px">重複排列</p>
        <p class="v" style="font-size:20px">
          同樣的東西排成一列、一排或九宮格，整齊本身就好看。<br>
          適合：<b>餅乾、飾品、農產品、手工皂</b>。</p>
      </div>
    </div>
    <div class="callout gold" data-r style="padding:14px 22px">${ART.icon('bulb',30,C.gold)}
      <span class="txt">重複排列有個小訣竅：<b>數量用單數</b>（3 個、5 個）比雙數自然，
      而且不要排得太整齊，稍微錯開比較有手感。</span></div>
  </div>`,
  notes:{
    say:['這兩種是今天五種裡最後兩種，也是最容易做出「像樣」照片的兩種。',
         '重複排列對做餅乾、飾品、農產品的學員特別有用，可以多花一點時間。',
         '單數比雙數自然這個小訣竅很好用，講了學員會記得。'],
    ask:['問：你的商品可以一次拍好幾個嗎？'],
    do:['商品有多個的學員，排成一列或三角形拍一張。'],
    diff:['一堆散放的小東西排整齊之後，會突然變得像商品照。'],
    more:['講九宮格排列（3×3）拍俯視圖，很適合發 IG。'],
    less:['只講對稱，重複排列口頭帶過。']
  }});

S({ part:'PART 7', time:'進度快才上', kind:'std', title:'另外三種：對角線、框架、曲線',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:36px">這三種今天不用練，知道有就好</h2>
    </div>
    <div class="cards c3" data-r style="gap:18px">
      ${[['diagonal','對角線',
          '東西沿著斜線排。畫面會比較<b>活潑、有動感</b>，適合幕後照、製作過程。',C.clay],
         ['frame','框架式',
          '用窗框、門框、手圈起來當框，把商品框在裡面，<b>有層次感</b>。',C.clean],
         ['curve','曲線',
          '東西排成弧形或 S 形，視線會跟著走，適合<b>多個小物一起拍</b>。',C.sage]]
        .map(([k,name,v,c])=>`
        <div class="card" style="padding:16px 16px 20px;border-top:5px solid ${c}">
          ${ART.comp(k, 306, 168)}
          <p class="k" style="font-size:24px;color:${c};margin-top:11px">${name}</p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="padding:14px 22px">${ART.icon('warn',30)}
      <span class="txt">加上前面五種，這就是書上完整的八種。
      <b>但今天只要練會五種就夠了</b>——構圖法是參考，不是規則。</span></div>
  </div>`,
  notes:{
    say:['這一頁是進度緩衝，時間不夠就整頁跳過，不影響今天的成果。',
         '如果有學員問「書上還有其他的嗎」，這一頁就是答案。',
         '講完把八種收攏一次：五種今天練，三種回家自己試。'],
    ask:['問：這三種裡，有沒有哪一種你想試試看？'],
    do:[],
    diff:['學員知道自己學的是完整八種裡的哪五種，不會覺得漏了東西。'],
    more:['四分法也在這裡補一句：把畫面分成十六格，主體放在中間四格的角上。'],
    less:['整頁跳過。']
  }});

S({ part:'PART 7', time:'13:59', kind:'std', title:'【實作】同一個商品，三種構圖',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　四分鐘</p>
      <h2 class="h" data-r style="font-size:38px">不換位置、不換光，只換商品放哪裡</h2>
    </div>
    <div data-r style="display:flex;gap:20px;justify-content:center">
      ${ART.scene({ w:290, h:218, bg:'wood', light:'side', angle:'a45', pos:'center', px:120, cap:'① 中央' })}
      ${ART.scene({ w:290, h:218, bg:'wood', light:'side', angle:'a45', pos:'third',  px:120, cap:'② 三分法' })}
      ${ART.scene({ w:290, h:218, bg:'wood', light:'side', angle:'a45', pos:'edge',   px:105, cap:'③ 留白' })}
    </div>
    ${strip('構圖怎麼選', f => f.comp)}
  </div>`,
  notes:{
    say:['三張拍完馬上進下一段，不要停留太久。',
         '提醒學員這三張等一下六張照片會用到。'],
    ask:['問：你早上圈的感覺，對應哪一種構圖？'],
    do:['三種構圖各拍一張。'],
    diff:['同一個商品，三種擺法給人的感覺完全不同。'],
    more:['加拍一張對稱或重複排列。'],
    less:['只拍中央與三分法。']
  }});

/* =========================================================================
   PART 8　拍攝角度　（57–60）
   ========================================================================= */
S({ part:'PART 8', time:'14:15', kind:'divider', title:'PART 8｜拍攝角度',
  html: divider('08','拍攝角度',
    '教材小物攝影要領：放在背景相對乾淨的地方，並以 45 度角拍攝。',
    ART.icon('eye',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這一段最短，但 45 度這個答案要記牢。'], ask:[], do:[] }});

S({ part:'PART 8', time:'14:16', kind:'std', title:'平拍、45 度、俯拍，各適合什麼',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">商品照的預設答案是 45 度</h2>
    </div>
    <div class="cards c3" data-r style="gap:18px">
      ${[['平拍','手機跟商品同高',
          '看得到正面與標籤。適合<b>瓶罐、包裝、有字的商品</b>。<br>層次感會少一些。',C.clean,'side'],
         ['45 度','手機略高於商品',
          '<b>最推薦</b>。更可展現細節及立體感。<br>看得到切面。',C.warm,'a45'],
         ['俯拍','手機在商品正上方',
          '適合<b>多個商品排列、平放的東西</b>。<br>單一商品俯拍會失去立體感。',C.fresh,'top']]
        .map(([k,s,v,c,ang])=>`
        <div class="card" style="padding:18px 18px 20px;border-top:5px solid ${c}">
          ${ART.scene({ w:262, h:150, bg:'wood', light:'side', angle:ang, px:92 })}
          <p class="k" style="font-size:24px;color:${c};margin-top:12px">${k}
            <span style="font-size:19px;font-weight:700;color:${C.ink3}">　${s}</span></p>
          <p class="v" style="font-size:19px">${v}</p>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt"><b>若一開始不確定要使用哪種角度，可拍多張再進行挑選。</b></span></div>
  </div>`,
  notes:{
    say:['45 度是這一段唯一要記住的答案。',
         '俯拍不是不好，是「單一商品」不適合；多個商品排列俯拍很好看。',
         '最後那句「不確定就多拍幾張」要講，這是最實用的建議。'],
    ask:['問：你平常拍東西都是從哪個角度？（多數人是隨手往下拍，就是俯拍）'],
    do:[],
    diff:['學員會發現自己一直用俯拍，難怪商品看起來扁扁的。'],
    more:['講仰拍（教材 P.25），適合拍高大物件，商品很少用。'],
    less:['只講 45 度。']
  }});

S({ part:'PART 8', time:'14:20', kind:'std', title:'同一個商品，三個角度並排',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <h2 class="h" data-r style="font-size:38px">看得出來立體感差在哪嗎？</h2>
    </div>
    <div data-r style="display:flex;gap:22px;justify-content:center">
      ${ART.scene({ w:300, h:300, bg:'cloth', light:'side', angle:'side', px:170, cap:'平拍' })}
      ${ART.scene({ w:300, h:300, bg:'cloth', light:'side', angle:'a45',  px:170,
                    cls:'good', mark:'✓', cap:'45 度' })}
      ${ART.scene({ w:300, h:300, bg:'cloth', light:'side', angle:'top',  px:170, cap:'俯拍' })}
    </div>
    <p class="lead" data-r style="font-size:22px;max-width:960px">
      平拍看得到正面，俯拍看得到排列，<b class="hl">45 度兩邊都看得到一點</b>——
      這就是它最安全的原因。</p>
  </div>`,
  notes:{
    say:['三張並排讓學員自己看，不要先講結論。',
         '「45 度兩邊都看得到一點」是最好記的解釋。'],
    ask:['問：如果你只能發一張，你發哪一張？'],
    do:[],
    diff:['俯拍那張會明顯扁平，學員會有感。'],
    more:[], less:['和上一頁合併。']
  }});

S({ part:'PART 8', time:'14:24', kind:'std', title:'【實作】換一個角度重拍',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">實作　·　五分鐘</p>
      <h2 class="h" data-r style="font-size:40px">蹲下來一點，或站高一點</h2>
    </div>
    <div data-r style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;max-width:920px">
      <span class="tag">① 平拍一張</span>
      <span class="tag on">② 45 度一張</span>
      <span class="tag">③ 俯拍一張</span>
      <span class="tag g">④ 三張裡挑一張，這就是你六張照片的「不同角度照」</span>
    </div>
    ${strip('角度怎麼選', f => f.angle)}
  </div>`,
  notes:{
    say:['提醒學員第 ④ 步：挑出來的那張等一下要用，不要拍完就忘記。',
         '中高齡學員蹲下來可能不方便，可以把商品放高一點代替。'],
    ask:['問：你挑哪一張？為什麼？'],
    do:['三個角度各拍一張，挑一張留著。'],
    diff:['學員手上開始累積「有用途」的照片，不是隨手拍。'],
    more:['加拍一張特寫細節。'],
    less:['只拍 45 度。']
  }});

/* =========================================================================
   PART 9　配方表 ＋ 六張照片　（61–65）
   ========================================================================= */
S({ part:'PART 9', time:'14:30', kind:'divider', title:'PART 9｜一個商品，六張照片',
  html: divider('09','一個商品<br>六張照片',
    '把今天學的全部用上。挑一種感覺，六張照片照同一個風格拍完。',
    ART.icon('cam',130,'rgba(255,255,255,.13)')),
  notes:{ say:['這是拍攝段的總結，也是今天最有成就感的一段。'], ask:[], do:[] }});

S({ part:'PART 9', time:'14:31', kind:'std', title:'四種感覺的完整配方表',
  html:`
  <div class="stack gap-s pad-tight">
    <div>
      <h2 class="h" data-r style="font-size:34px;margin-bottom:4px">
        挑<span class="hl">一列</span>，六張照片全部照那一列拍</h2>
    </div>
    <table class="tbl" data-r style="font-size:20px">
      <thead><tr>
        <th style="width:150px">感覺</th><th>光線</th><th>背景</th>
        <th>角度</th><th>構圖</th><th>色調</th>
      </tr></thead>
      <tbody>
        ${[[F[0],'側光','木質、素色布','45 度','留一點手的動作','暖一點'],
           [F[1],'順光','白或淺灰','平拍或正俯拍','置中、留白','不加濾鏡'],
           [F[2],'窗邊自然光','有製作痕跡的檯面','俯拍或 45 度','加肢體動作','自然'],
           [F[3],'側光或逆光','深色','特寫','大量留白','低飽和']]
          .map(([f,...cells])=>`
          <tr>
            <td class="lead-col" style="color:${f.c};font-weight:900">${f.name}</td>
            ${cells.map(c=>`<td>${c}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>
    <div class="callout" data-r style="padding:14px 22px">${ART.icon('bulb',30)}
      <span class="txt">六張照片<b>照同一列拍</b>，成果才會像「一組作品」；
      每張都換風格，就會變成六張沒關係的散照。</span></div>
  </div>`,
  notes:{
    say:['這一頁是全課的收攏，一定要停下來讓學員對照自己早上圈的那一種。',
         '「一組作品 vs 六張散照」這個對比要講清楚，這是專業與業餘的差別。'],
    ask:['問：你早上圈的是哪一種？現在還是同一種嗎？（可以改，但要選定一種）'],
    do:['在講義上圈選最終要用的那一列。'],
    diff:['學員從「隨便拍」變成「照著一個標準拍」。'],
    more:['請學員說自己為什麼選那一種，全班討論適不適合她的商品。'],
    less:['直接指定「不確定的人就用乾淨專業那一列」。']
  }});

S({ part:'PART 9', time:'14:35', kind:'std', title:'一張照片，只負責一件事',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">一組商品素材，至少要有這六張</h2>
    </div>
    <div class="cards c3" data-r style="gap:16px">
      ${[['1','主圖','商品清楚、背景乾淨、中央構圖',C.clay],
         ['2','完整外觀','看得到整體，包含包裝',C.gold],
         ['3','細節照','材質、紋理、封口、標籤',C.sage],
         ['4','不同角度','45 度或俯拍，跟主圖不一樣',C.plum],
         ['5','使用情境','加 1–3 個配角，看得出來怎麼用',C.clean],
         ['6','幕後製作','手正在做、包裝、整理的畫面',C.fresh]]
        .map(([n,k,v,c])=>`
        <div class="card" style="padding:20px 18px;display:flex;gap:14px;align-items:flex-start">
          <span class="num-badge" style="background:${c};flex:0 0 auto">${n}</span>
          <span><p class="k" style="font-size:23px;margin:0 0 4px">${k}</p>
          <p class="v" style="font-size:19px;margin:0">${v}</p></span>
        </div>`).join('')}
    </div>
    <div class="callout gold" data-r>${ART.icon('bulb',32,C.gold)}
      <span class="txt"><b>不拍攝食物的全貌，以特寫的方式，反而更可以拍出餐點的特色</b>——
      這就是第 3 張細節照的用意。</span></div>
  </div>`,
  notes:{
    say:['六張不是六個好看的角度，是六個不同的用途。',
         '第 6 張幕後照最多人忽略，但它是社群上最容易有互動的一張。'],
    ask:['問：你現在手機裡有哪幾張？（多數人只有第 1 和第 2 張）'],
    do:[],
    diff:['學員理解為什麼要拍那麼多張。'],
    more:['教材 P.94：拍攪拌、夾起、拿取的肢體動作，可增加自然與活潑度。'],
    less:['只講前四張。']
  }});

S({ part:'PART 9', time:'14:39', kind:'std', title:'這六張分別發在哪裡',
  html:`
  <div class="stack gap-m">
    <div>
      <h2 class="h" data-r style="font-size:38px">拍完不是放著，是各有各的位置</h2>
    </div>
    <table class="tbl" data-r>
      <thead><tr><th style="width:190px">照片</th><th style="width:290px">用在哪裡</th><th>為什麼</th></tr></thead>
      <tbody>
        <tr><td class="lead-col">主圖</td><td>FB／IG 貼文第一張、商品目錄</td><td>客人第一眼看到的就是它</td></tr>
        <tr><td class="lead-col">完整外觀</td><td>LINE 圖文訊息、商品說明</td><td>讓人知道實際收到什麼</td></tr>
        <tr><td class="lead-col">細節照</td><td>IG 輪播第 2、3 張</td><td>證明品質，回答「看起來如何」</td></tr>
        <tr><td class="lead-col">不同角度</td><td>IG 輪播、FB 相簿</td><td>讓人從各面看清楚</td></tr>
        <tr><td class="lead-col">使用情境</td><td>貼文配圖、封面橫幅</td><td>讓人想像自己用的樣子</td></tr>
        <tr><td class="lead-col">幕後製作</td><td>限時動態、Reels</td><td>最容易有互動，也最有溫度</td></tr>
      </tbody>
    </table>
  </div>`,
  notes:{
    say:['這一頁把上一堂社群課接起來，學員會覺得兩堂課是連著的。',
         '幕後照配限動與 Reels，是最容易讓人留言的內容。'],
    ask:['問：上一堂課我們有做 IG 輪播嗎？那需要幾張？'],
    do:[],
    diff:['學員知道每一張的去處，拍的時候更有目的。'],
    more:['回顧社群課的尺寸速查表：主圖 1080×1080，限動 1080×1920。'],
    less:['只講主圖與幕後照兩列。']
  }});

S({ part:'PART 9', time:'14:42', kind:'std', title:'【總實作】挑一種感覺，完成你的六張',
  html:`
  <div class="stack gap-m center" style="text-align:center">
    <div>
      <p class="eyebrow" data-r style="justify-content:center">總實作　·　八分鐘　·　今天的成果</p>
      <h2 class="h" data-r style="font-size:38px">六張，同一個商品，同一種感覺</h2>
    </div>
    <div class="checks" data-r style="grid-template-columns:repeat(3,1fr);gap:13px 26px;max-width:1000px">
      ${['① 主圖（中央構圖、背景乾淨）','② 完整外觀','③ 細節照（走近拍，不要放大）',
         '④ 不同角度（45 度或俯拍）','⑤ 使用情境（加 1–3 個配角）','⑥ 幕後製作（手正在做）']
        .map(t=>`
        <div class="check" style="justify-content:flex-start">
          <span class="box"></span>
          <span style="font-size:21px;font-weight:700;color:${C.ink2};text-align:left">${t}</span>
        </div>`).join('')}
    </div>
    <div class="callout" data-r style="max-width:1000px">${ART.icon('warn',32)}
      <span class="txt">拍不完沒關係，<b>先把 ①③⑥ 三張拍好</b>。
      這三張是最常用、也最能看出差別的三張。</span></div>
  </div>`,
  notes:{
    say:['八分鐘一定不夠拍六張，先講清楚「拍不完沒關係，先拍 ①③⑥」。',
         '走動時提醒每個人：光線、背景、角度都要照自己選的那一列。'],
    ask:['問：拍到第幾張了？（隨時掌握進度）'],
    do:['六張依序拍，拍不完先完成 ①③⑥。'],
    diff:['六張放在一起會像同一組作品，這是學員最有成就感的時刻。'],
    more:['請兩位學員投影自己的六張，全班一起看風格有沒有一致。'],
    less:['只做 ① 和 ③ 兩張，其餘回家補。']
  }});
