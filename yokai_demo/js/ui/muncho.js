/*
 * 「문초(問招)」 화면 (UI 전용 — 규칙은 js/core/muncho.js 가 판정한다)
 *
 * 구성 (UI 명세 5.1)
 *  상단 : 세운 고리가 위에서부터 한 줄씩 쌓인다 (누적 영역 · 드롭 대상)
 *  하단 : 아직 쓰지 않은 단서가 카드로 나열된다
 *  조작 : 카드를 상단으로 끌어 올리거나(드래그) 눌러서(터치·키보드 대체) 세운다.
 *         순서가 틀리면 상대가 반박하고 카드는 하단으로 돌아온다.
 *  임계 : 5고리 도달 시 누적 영역 테두리만 바뀐다. 숫자는 표시하지 않는다.
 *
 * 「촌각」 — 고리마다 제한 시간(기본 15초)이 걸리고, 초과하면 «아무 말도 하지 못했다»가 착오로 쌓인다.
 *  증좌첩을 위로 열어도 시간은 계속 흐른다(7.13.6). 이 파일의 타이머는 화면 표시와 무관하게 돈다.
 *
 * 미니멀 원칙: 삽화 없이 텍스트 카드만 쓴다. 문서 소품 아이콘 등 식별자는 에셋이 준비된 뒤에 얹는다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  var doc = global.document;

  var el = null;
  var session = null;
  var onDone = null;
  var timer = null;
  var running = false;

  function q(id) { return doc.getElementById(id); }

  function make(tag, className, text) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function stopTimer() {
    if (timer) { global.clearInterval(timer); timer = null; }
  }

  /** 고리 하나에 걸리는 제한 시간(ms). 0 이면 무제한 — 게이지는 보이되 줄어들지 않는다 */
  function ringLimit() {
    var base = session.def.timePerRing || Game.Engine.CHONGAK.RING;
    var scale = Game.Renderer.chongakScale();
    return scale === 0 ? 0 : base * scale;
  }

  function startRingTimer() {
    stopTimer();
    el.timer.innerHTML = '';

    var bar = make('div', 'chongak');
    var fill = make('div', 'chongak-fill');
    bar.appendChild(make('span', 'chongak-label', '촌각(寸刻)'));
    bar.appendChild(fill);
    el.timer.appendChild(bar);

    var limit = ringLimit();
    if (!limit) return;                       // 무제한 — 게이지만 가득 찬 채로 둔다

    var started = Date.now();
    timer = global.setInterval(function () {
      var left = limit - (Date.now() - started);
      if (left <= 0) {
        stopTimer();
        fill.style.width = '0%';
        onTimeout();
        return;
      }
      fill.style.width = (left / limit * 100) + '%';
      if (left / limit < 0.3) bar.classList.add('urgent');
    }, 60);
  }

  /** 시간 초과 — 아무것도 하지 못했다. 착오로 센다 */
  function onTimeout() {
    if (!running) return;
    var res = session.mistake(null);
    showRebuttal('아무 말도 하지 못했다.' + (res.rebuttal ? ' ' + res.rebuttal : ''));
    if (res.collapsed) { finish(); return; }
    startRingTimer();
  }

  function showRebuttal(text) {
    el.rebut.textContent = text || '';
    el.rebut.classList.remove('flash');
    void el.rebut.offsetWidth;                // 같은 문구가 연속으로 와도 다시 재생
    if (text) el.rebut.classList.add('flash');
  }

  /* ── 그리기 ─────────────────────────────────────────────── */

  function render() {
    // 누적 영역 — 세운 고리의 결론이 한 줄씩 쌓인다 (번호는 붙이지 않는다)
    el.stack.innerHTML = '';
    var placed = session.placed;
    if (!placed.length) {
      el.stack.appendChild(make('p', 'mc-empty', '여기에 첫 고리를 세운다.'));
    }
    for (var i = 0; i < placed.length; i++) {
      var row = make('p', 'mc-ring');
      row.appendChild(make('span', 'mc-ring-title', placed[i].title));
      if (placed[i].conclusion) row.appendChild(make('span', 'mc-ring-conclusion', placed[i].conclusion));
      el.stack.appendChild(row);
    }
    // 임계에 닿으면 테두리만 바뀐다 — 몇 개가 필요한지는 끝내 알려주지 않는다
    if (session.reached()) el.stack.classList.add('reached');
    else el.stack.classList.remove('reached');

    // 하단 카드
    el.cards.innerHTML = '';
    var cards = session.cards();
    for (var j = 0; j < cards.length; j++) el.cards.appendChild(cardNode(cards[j]));
    if (!cards.length) el.cards.appendChild(make('p', 'mc-empty', '더 세울 고리가 없다.'));
  }

  function cardNode(ring) {
    var card = make('button', 'mc-card', ring.title);
    card.type = 'button';
    card.draggable = true;
    card.setAttribute('data-ring', ring.id);
    card.addEventListener('dragstart', function (ev) {
      ev.dataTransfer.setData('text/plain', ring.id);
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', function () { card.classList.remove('dragging'); });
    card.addEventListener('click', function () { attempt(ring.id); });
    return card;
  }

  function attempt(ringId) {
    if (!running) return;
    var res = session.place(ringId);

    if (res.ok) {
      showRebuttal('');
      render();
      if (res.done) { finish(); return; }     // 더 세울 고리가 없으면 그대로 마무리
      startRingTimer();
      return;
    }

    // 틀린 순서 — 상대가 반박하고 카드는 하단으로 돌아온다(그대로 남아 있다)
    showRebuttal(res.rebuttal || '그 말은 아직 이르오.');
    var card = el.cards.querySelector('[data-ring="' + ringId + '"]');
    if (card) {
      card.classList.remove('rebutted');
      void card.offsetWidth;
      card.classList.add('rebutted');
    }
    if (res.collapsed) finish();
  }

  function finish() {
    if (!running) return;
    running = false;
    stopTimer();
    var grade = session.grade();
    var cb = onDone;
    session = null;
    onDone = null;
    // 마지막 고리가 서는 순간을 눈으로 볼 틈을 잠깐 준다
    global.setTimeout(function () {
      el.root.classList.add('hidden');
      if (cb) cb(grade);
    }, 450);
  }

  var MunchoUI = {
    init: function () {
      el = {
        root: q('screen-muncho'),
        title: q('mc-title'),
        opponent: q('mc-opponent'),
        timer: q('mc-timer'),
        stack: q('mc-stack'),
        cards: q('mc-cards'),
        rebut: q('mc-rebut')
      };

      // 드롭 대상 — 누적 영역. 끌어온 카드의 id 로 착지를 시도한다
      el.stack.addEventListener('dragover', function (ev) {
        ev.preventDefault();
        el.stack.classList.add('over');
      });
      el.stack.addEventListener('dragleave', function () { el.stack.classList.remove('over'); });
      el.stack.addEventListener('drop', function (ev) {
        ev.preventDefault();
        el.stack.classList.remove('over');
        attempt(ev.dataTransfer.getData('text/plain'));
      });

      q('mc-finish').addEventListener('click', function () { finish(); });
      q('mc-evidence').addEventListener('click', function () { Game.Menu.show('jeungjwa'); });
      return MunchoUI;
    },

    /**
     * 문초를 연다. session 은 Game.Muncho.start() 의 결과, done(grade) 는 끝났을 때 한 번 호출된다.
     * 문초를 열면 이전 화면(선택지·대사)은 그대로 아래에 남고 이 오버레이가 위를 덮는다.
     */
    open: function (sess, done) {
      if (!el) MunchoUI.init();
      session = sess;
      onDone = done;
      running = true;

      el.title.textContent = session.def.title || '';
      el.opponent.textContent = session.def.opponent ? '상대 — ' + session.def.opponent : '';
      showRebuttal('');
      render();
      el.root.classList.remove('hidden');
      startRingTimer();
    },

    isOpen: function () { return running; }
  };

  Game.MunchoUI = MunchoUI;
})(this);
