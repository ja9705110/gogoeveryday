/* =========================================================================
   engine.js — 簡報引擎
   ========================================================================= */
(function(){
  'use strict';

  const stage   = document.getElementById('stage');
  const chrome  = document.getElementById('chrome');
  const elPart  = document.getElementById('cpart');
  const elTime  = document.getElementById('ctime');
  const elNum   = document.getElementById('pnum');
  const bar     = document.getElementById('bar');
  const ov      = document.getElementById('ov');
  const ovg     = document.getElementById('ovg');
  const notes   = document.getElementById('notes');
  const help    = document.getElementById('help');
  const timerEl = document.getElementById('timer');
  const hint    = document.getElementById('hint');

  const N = DECK.length;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let cur = 0, notesOn = false;

  /* ---------- 舞台縮放 ---------- */
  function fit(){
    const pad = window.innerWidth < 900 ? 12 : 32;
    const s = Math.min((window.innerWidth - pad*2)/1280, (window.innerHeight - pad*2)/720);
    stage.style.transform = 'scale(' + s + ')';
  }
  addEventListener('resize', fit);

  /* ---------- 繪製 ---------- */
  function paint(i){
    const d = DECK[i];
    const old = stage.querySelector('.slide');
    if (old) old.remove();

    const s = document.createElement('section');
    s.className = 'slide' + (d.kind === 'divider' ? ' divider' : '')
                          + (d.kind === 'cover' ? ' cover' : '')
                          + (/pad-tight/.test(d.html) ? ' pad-tight' : '');
    s.innerHTML = d.html;

    if (d.tag) {
      const t = document.createElement('span');
      t.className = 'act-tag ' + (d.tag.type || '');
      t.textContent = d.tag.label;
      s.appendChild(t);
    }

    stage.appendChild(s);
    s.querySelectorAll('[data-r]').forEach((n, k) => n.style.setProperty('--i', k));

    const dark = d.kind === 'divider';
    chrome.classList.toggle('on-dark', dark);
    elPart.textContent = d.part;
    if (elTime) elTime.textContent = d.time;
    if (elNum) elNum.innerHTML = String(i + 1) + ' <small>/ ' + N + '</small>';
    bar.style.width = ((i + 1) / N * 100) + '%';

    renderNotes(d, i);
    if (!document.startViewTransition || reduce) {
      s.classList.add('enter');
    }
    ovg.querySelectorAll('.ov-i').forEach((b, k) => b.classList.toggle('cur', k === i));
    const c = ovg.querySelector('.ov-i.cur');
    if (c && ov.classList.contains('on')) c.scrollIntoView({block:'nearest'});
  }

  function go(i, dir){
    i = Math.max(0, Math.min(N - 1, i));
    if (i === cur && stage.querySelector('.slide')) return;
    const d = dir !== undefined ? dir : (i > cur ? 1 : -1);
    cur = i;
    history.replaceState(null, '', '#' + (i + 1));
    document.documentElement.style.setProperty('--dir', d);
    if (document.startViewTransition && !reduce) {
      document.startViewTransition(() => paint(i));
    } else {
      paint(i);
    }
  }
  const next = () => go(cur + 1, 1);
  const prev = () => go(cur - 1, -1);

  /* ---------- 講師備忘 ---------- */
  function renderNotes(d, i){
    const n = d.notes || {};
    const block = (cls, title, arr) => {
      if (!arr || !arr.length) return '';
      return '<div class="nb ' + cls + '"><h5><s></s>' + title + '</h5>'
        + (arr.length > 1
            ? '<ul>' + arr.map(x => '<li>' + x + '</li>').join('') + '</ul>'
            : '<p>' + arr[0] + '</p>') + '</div>';
    };
    notes.innerHTML =
      '<div class="ng">'
      + block('say',  '講師說明', n.say)
      + block('ask',  '互動提問', n.ask)
      + block('do',   '學員實作', n.do)
      + block('diff', '預期看到的差異', n.diff)
      + block('more', '進度快：可以補充', n.more)
      + block('less', '進度慢：可以刪掉', n.less)
      + '</div><p class="nn">' + d.part + '　·　' + d.time + '　·　第 ' + (i+1) + ' / ' + N + ' 頁　·　按 S 收合</p>';
  }
  function toggleNotes(){
    notesOn = !notesOn;
    notes.classList.toggle('on', notesOn);
  }

  /* ---------- 總覽 ---------- */
  function buildOverview(){
    ovg.innerHTML = DECK.map((d, i) =>
      '<button class="ov-i' + (d.kind === 'divider' || d.kind === 'cover' ? ' div-i' : '') + '" data-i="' + i + '">'
      + '<span class="n">' + String(i + 1).padStart(2, '0') + '　' + d.part + '</span>'
      + '<span class="t">' + d.title.replace(/^Slide \d+｜/, '') + '</span></button>').join('');
    ovg.querySelectorAll('.ov-i').forEach(b => b.addEventListener('click', () => {
      ov.classList.remove('on');
      go(+b.dataset.i);
    }));
  }
  function toggleOv(){
    ov.classList.toggle('on');
    if (ov.classList.contains('on')) {
      const c = ovg.querySelector('.ov-i.cur');
      if (c) c.scrollIntoView({block:'center'});
    }
  }

  /* ---------- 計時器 ---------- */
  let tStart = null, tPaused = 0, tOn = false, tRun = false;
  const tTxt = document.getElementById('ttxt');
  const tDot = document.getElementById('tdot');
  function tick(){
    if (!tOn) return;
    const ms = tRun ? (Date.now() - tStart + tPaused) : tPaused;
    const s = Math.floor(ms / 1000);
    tTxt.textContent =
      String(Math.floor(s / 3600)).padStart(2,'0') + ':' +
      String(Math.floor(s / 60) % 60).padStart(2,'0') + ':' +
      String(s % 60).padStart(2,'0');
    tDot.classList.toggle('run', tRun);
  }
  setInterval(tick, 500);
  function toggleTimer(){
    tOn = !tOn;
    timerEl.classList.toggle('on', tOn);
    if (tOn && tStart === null) { tStart = Date.now(); tRun = true; }
    tick();
  }
  document.getElementById('tbtn').addEventListener('click', e => {
    e.stopPropagation();
    if (tRun) { tPaused += Date.now() - tStart; tRun = false; e.target.textContent = '繼續'; }
    else { tStart = Date.now(); tRun = true; e.target.textContent = '暫停'; }
    tick();
  });
  document.getElementById('trst').addEventListener('click', e => {
    e.stopPropagation();
    tStart = Date.now(); tPaused = 0; tRun = true;
    document.getElementById('tbtn').textContent = '暫停';
    tick();
  });

  /* ---------- 列印 ---------- */
  let printing = false;
  function printAll(){
    if (printing) return;
    printing = true;
    const root = document.createElement('div');
    root.id = 'printroot';
    DECK.forEach((d, i) => {
      const st = document.createElement('div');
      st.className = 'stage-print';
      const s = document.createElement('section');
      s.className = 'slide' + (d.kind === 'divider' ? ' divider' : '') + (d.kind === 'cover' ? ' cover' : '');
      s.innerHTML = d.html;
      st.appendChild(s);
      const f = document.createElement('div');
      f.className = 'print-foot';
      f.innerHTML = '<span>' + d.part + '　·　' + d.time + '</span><span>' + (i + 1) + ' / ' + N + '</span>';
      st.appendChild(f);
      root.appendChild(st);
    });
    document.body.appendChild(root);
    document.body.classList.add('printing');
    setTimeout(() => {
      window.print();
      document.body.classList.remove('printing');
      root.remove();
      printing = false;
    }, 120);
  }

  /* ---------- 鍵盤 ---------- */
  let buf = '';
  addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;

    if (/^[0-9]$/.test(k)) { buf += k; return; }
    if (k === 'Enter' && buf) { go(parseInt(buf, 10) - 1); buf = ''; return; }
    buf = '';

    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        e.preventDefault(); next(); break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home': go(0); break;
      case 'End':  go(N - 1); break;
      case 'o': case 'O': toggleOv(); break;
      case 's': case 'S': toggleNotes(); break;
      case 't': case 'T': toggleTimer(); break;
      case 'p': case 'P': printAll(); break;
      case 'f': case 'F':
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case '?': case '/': help.classList.toggle('on'); break;
      case 'Escape':
        if (help.classList.contains('on')) help.classList.remove('on');
        else if (ov.classList.contains('on')) ov.classList.remove('on');
        else if (notesOn) toggleNotes();
        break;
    }
  });

  /* ---------- 點擊 / 滑動 ---------- */
  document.getElementById('viewport').addEventListener('click', e => {
    if (ov.classList.contains('on') || help.classList.contains('on')) return;
    if (e.target.closest('#notes') || e.target.closest('#timer')) return;
    (e.clientX > window.innerWidth * 0.42) ? next() : prev();
  });
  help.addEventListener('click', e => { if (e.target === help) help.classList.remove('on'); });
  ov.addEventListener('click', e => { if (e.target === ov) ov.classList.remove('on'); });

  let tx = 0, ty = 0;
  addEventListener('touchstart', e => { tx = e.changedTouches[0].clientX; ty = e.changedTouches[0].clientY; }, {passive:true});
  addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy)) (dx < 0) ? next() : prev();
  }, {passive:true});

  /* 網址列直接改頁碼也能跳頁 */
  addEventListener('hashchange', () => {
    const n = parseInt(location.hash.replace('#', ''), 10);
    if (n >= 1 && n <= N && n - 1 !== cur) go(n - 1);
  });

  /* ---------- 啟動 ---------- */
  buildOverview();
  fit();
  const h = parseInt(location.hash.replace('#', ''), 10);
  cur = (h >= 1 && h <= N) ? h - 1 : 0;
  paint(cur);
  history.replaceState(null, '', '#' + (cur + 1));

  setTimeout(() => hint.classList.add('gone'), 5200);
  addEventListener('keydown', () => hint.classList.add('gone'), {once:true});
})();
