/*
 * 메뉴 화면 담당 (UI 전용)
 * — 메인 / 챕터 선택 / 인물 도감 / 야사록 / 설정 / BGM 감상실
 *
 * 판정은 Game.Progress, Game.Codex, Game.Yasarok 가 한다.
 * 이 파일은 그 결과를 그리고 클릭만 넘긴다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  var doc = global.document;

  var SCREENS = ['title', 'chapters', 'load', 'codex', 'yasarok', 'jeungjwa', 'unlock', 'options', 'jukebox'];

  var el = {};
  var handlers = {};      // { onStartNew, onLoad, onPickChapter, onPlayTrack, onJeungjwaContext, onJeungjwaBack, onToMenu, onStartDev }
  var currentCodexId = null;

  // 증좌첩 — 지금 상세로 펼친 항목, 대조에 담은 항목(최대 2개)
  var jjCurrentId = null;
  var jjSelected = [];

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function make(tag, className, text) {
    var node = doc.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  /*
   * 증좌첩 전용 강조 마크업 — **강조** 구간만 hiClass 를 입힌 <strong> 으로 분해한다.
   * js/ui/renderer.js 의 대사 마크업과 같은 표기(**...**)를 쓰지만,
   * 여기서는 대화창의 금박 강조가 아니라 "농묵(濃墨) 키워드"로 색을 달리 입히므로
   * 별도의 작은 파서를 둔다(기획서 v4.4 7.13.3a).
   */
  function markupInto(container, text, hiClass) {
    var re = /\*\*([^*]+)\*\*/g;
    var last = 0, m;
    while ((m = re.exec(text || '')) !== null) {
      if (m.index > last) container.appendChild(doc.createTextNode(text.slice(last, m.index)));
      container.appendChild(make('strong', hiClass, m[1]));
      last = re.lastIndex;
    }
    if (last < (text || '').length) container.appendChild(doc.createTextNode(text.slice(last)));
  }

  /**
   * 인물 초상 노드.
   * 초상 파일이 없는 인물(형체가 없거나, 정체를 감췄거나, 에셋 대기 중)은
   * 이름 첫 글자를 넣은 실루엣으로 그린다 — 빈 자리로 보이지 않게 하려는 처리다.
   */
  function portraitNode(entry, className) {
    var src = Game.Assets.portraitOf(entry);
    if (src) {
      var img = doc.createElement('img');
      img.className = className;
      img.src = src;
      img.alt = entry.name;
      return img;
    }
    var box = make('span', className + ' silhouette', entry.name.charAt(0));
    box.setAttribute('aria-label', entry.name);
    return box;
  }

  /* ── 메인 타이틀: 스플래시 → 캐러셀 메뉴 ──────────────────── */

  /*
   * 요즘 게임처럼 두 단계로 나눈다.
   *  splash : 타이틀과 «화면을 눌러 시작». 아무 곳이나 누르면 메뉴로 넘어간다.
   *  menu   : 한 번에 항목 하나만 크게 보이고 〈 〉 로 좌우 이동해 고른다.
   * 스플래시는 게임을 켠 직후에만 나온다. 하위 화면에서 돌아오거나 «메인으로»를 누르면 바로 메뉴다.
   */
  var titleStage = 'splash';
  var splashPending = true;     // 부팅 직후 한 번만 스플래시를 보인다
  var menuIndex = 0;            // 캐러셀에서 지금 보이는 항목 (하위 화면에 다녀와도 유지)
  var swipeStartX = null;
  var MENU_IDS = ['codex', 'yasarok', 'options', 'jukebox'];   // 체험판에서 잠글 수 있는 타이틀 메뉴
  var titleFromPlay = false;    // 본편에서 돌아온 직후 — 이어하기(있다면)를 맨 앞에 두고 시작한다

  /** 캐러셀에 오르는 항목 — 감춰진 항목(개발용 시연 등)은 건너뛴다 */
  function menuItems() {
    return [].filter.call(el.menuList.querySelectorAll('.menu-item'), function (b) {
      return !b.classList.contains('hidden');
    });
  }

  function renderCarousel() {
    var items = menuItems();
    if (!items.length) return;
    if (menuIndex >= items.length) menuIndex = 0;

    // 감춰진 항목(저장이 없어진 «이어하기» 등)에 current 가 남으면 display:block 이 hidden 을 이긴다 — 전부 걷고 다시 건다
    [].forEach.call(el.menuList.querySelectorAll('.menu-item.current'), function (b) { b.classList.remove('current'); });
    items[menuIndex].classList.add('current');
    // 점 표시 — 지금 몇 번째인지, 총 몇 개인지는 «점»으로만 알린다(숫자 없음)
    clear(el.menuDots);
    for (var d = 0; d < items.length; d++) {
      el.menuDots.appendChild(make('span', 'menu-dot' + (d === menuIndex ? ' on' : '')));
    }
  }

  function moveMenu(delta) {
    var items = menuItems();
    if (!items.length) return;
    menuIndex = (menuIndex + delta + items.length) % items.length;
    renderCarousel();
    // 바뀐 항목이 짧게 밀려 들어오게 한다 (느린 페이드가 아니라 즉각적인 스태킹)
    var cur = items[menuIndex];
    cur.classList.remove('slide-in');
    void cur.offsetWidth;
    cur.classList.add('slide-in');
  }

  function setTitleStage(stage) {
    titleStage = stage;
    el.title.classList.remove('title-stage-splash', 'title-stage-menu');
    el.title.classList.add('title-stage-' + stage);
    if (stage === 'menu') renderCarousel();
  }

  /** 스플래시 → 메뉴 */
  function enterMenuStage() {
    splashPending = false;
    setTitleStage('menu');
  }

  function titleVisible() {
    return !el.title.classList.contains('hidden');
  }

  function bindTitle() {
    // 스플래시 — 아무 곳이나 클릭·터치하면 메뉴로 (click 은 터치에서도 발생한다)
    el.title.addEventListener('click', function () {
      if (titleStage === 'splash') enterMenuStage();
    });

    doc.getElementById('menu-prev').addEventListener('click', function () { moveMenu(-1); });
    doc.getElementById('menu-next').addEventListener('click', function () { moveMenu(1); });

    // 스와이프 — 좌우로 밀어 항목을 넘긴다
    el.menuList.addEventListener('touchstart', function (ev) {
      swipeStartX = ev.touches[0].clientX;
    }, { passive: true });
    el.menuList.addEventListener('touchend', function (ev) {
      if (swipeStartX === null) return;
      var dx = ev.changedTouches[0].clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(dx) > 40) moveMenu(dx < 0 ? 1 : -1);
    }, { passive: true });

    doc.addEventListener('keydown', function (ev) {
      if (!titleVisible()) return;

      if (titleStage === 'splash') {
        // 음량·음소거 키와 수식키는 «시작» 입력으로 세지 않는다
        if (['-', '_', '=', '+', 'm', 'M', 'Shift', 'Control', 'Alt', 'Meta', 'Tab'].indexOf(ev.key) !== -1) return;
        ev.preventDefault();
        enterMenuStage();
        return;
      }

      if (ev.key === 'ArrowLeft' || ev.key === 'a' || ev.key === 'A') {
        ev.preventDefault();
        moveMenu(-1);
      } else if (ev.key === 'ArrowRight' || ev.key === 'd' || ev.key === 'D') {
        ev.preventDefault();
        moveMenu(1);
      } else if (ev.key === 'Enter' || ev.key === ' ') {
        // 포커스된 버튼의 기본 동작과 겹쳐 두 번 눌리지 않도록 직접 처리한다
        ev.preventDefault();
        var cur = menuItems()[menuIndex];
        if (cur && !cur.disabled) cur.click();
      }
    });
  }

  /* ── 챕터 선택 ─────────────────────────────────────────── */

  var STATUS_LABEL = {
    playing: '진행중',
    cleared: '완료',
    unstarted: '미시작'
  };

  /**
   * 배경 이미지를 깐 div. 에셋에 filter 가 걸려 있어도 카드 글자에 번지지 않도록
   * 글자와 다른 레이어(자식 div)에 입힌다.
   */
  function coverNode(imageKey, className) {
    var art = imageKey ? Game.Assets.image(imageKey) : null;
    var box = make('div', className);
    if (art) {
      box.style.backgroundImage = 'url("' + art.url + '")';
      box.style.filter = art.filter;
    }
    return box;
  }

  /*
   * 장 선택 카드 (풀기획서 v4.4 7.10.1 · UI 명세 3장).
   *  - 열린 장: 대표 배경 + 어두운 오버레이·하단 그라디언트 위에 글자. 진행 상태 · 엔딩 · 야사록 수집.
   *    클리어한 장은 테두리에 금박 표식, 진엔딩까지 본 장은 표식이 다르다.
   *  - 잠긴 장: 이미지·제목을 완전히 가린다. 실루엣이나 블러가 아니라 «단색 판 + 자물쇠».
   *    배경 이미지 자체가 스포일러이기 때문이다(3부 카드에 추국청이 보이면 «주인공이 잡혀간다»가 새어나간다).
   */
  function lockedCard(item) {
    var ch = item.chapter;
    var card = make('article', 'chapter-card locked');
    card.appendChild(make('div', 'chapter-lock-plate', '鎖'));

    var body = make('div', 'chapter-content');
    var head = make('div', 'chapter-head');
    head.appendChild(make('span', 'chapter-no', '제' + ch.no + '부 · ???'));
    head.appendChild(make('span', 'badge badge-locked', item.lockReason === 'wip' ? '준비 중' : '잠김'));
    body.appendChild(head);

    var hint = item.lockReason === 'wip' ? '시나리오 준비 중입니다'
      : (item.lockReason === 'demo' ? '체험판에서는 열리지 않습니다' : '앞선 장을 마치면 열립니다');
    body.appendChild(make('p', 'chapter-hint', hint));
    card.appendChild(body);

    // 잠긴 카드를 눌러도 아무것도 열리지 않고 안내만 나온다
    card.addEventListener('click', function () {
      Game.Renderer.toast(hint);
    });
    return card;
  }

  function chapterCard(item) {
    if (item.locked) return lockedCard(item);

    var ch = item.chapter;
    var cls = 'chapter-card' + (item.status === 'cleared' ? ' cleared' : '') + (item.trueCleared ? ' true-cleared' : '');
    var hasCover = !!(ch.cover && Game.Assets.image(ch.cover));
    var card = make('article', cls + (hasCover ? ' has-cover' : ''));

    if (hasCover) {
      card.appendChild(coverNode(ch.cover, 'chapter-cover'));
      card.appendChild(make('div', 'chapter-scrim'));
    }
    var body = make('div', 'chapter-content');

    var head = make('div', 'chapter-head');
    head.appendChild(make('span', 'chapter-no', '제' + ch.no + '부'));
    head.appendChild(make('span', 'chapter-yokai', ch.yokai + (ch.era ? ' · ' + ch.era : '')));
    head.appendChild(make('span', 'badge badge-' + item.status, STATUS_LABEL[item.status]));
    body.appendChild(head);

    var title = make('h3', 'chapter-title', ch.title);
    if (ch.titleTentative) title.appendChild(make('span', 'tentative-mark', ' (가제)'));
    body.appendChild(title);

    body.appendChild(make('p', 'chapter-summary', ch.summary));

    // 수집 현황 — 부별로만 센다. 전체 합계는 내지 않는다(5부 은닉과 충돌, 7.12.3)
    var stats = [];
    if (item.endingTotal) stats.push('엔딩 ' + item.endingSeen + ' / ' + item.endingTotal);
    if (item.yasarokTotal) stats.push('야사록 ' + item.yasarokOpen + ' / ' + item.yasarokTotal);
    if (stats.length) body.appendChild(make('p', 'chapter-endings', stats.join('  ·  ')));

    var action = make('div', 'chapter-action');
    var btn = make('button', null, item.resumable ? '이어하기'
      : (item.status === 'cleared' ? '다시 플레이' : '이 장 시작'));
    btn.type = 'button';
    btn.addEventListener('click', function () {
      handlers.onPickChapter(ch.id, item.resumable);
    });
    action.appendChild(btn);

    // 이어하기가 가능한 챕터에는 처음부터 다시 시작하는 길도 함께 준다
    if (item.resumable) {
      var restart = make('button', 'ghost', '처음부터');
      restart.type = 'button';
      restart.addEventListener('click', function () {
        handlers.onPickChapter(ch.id, false);
      });
      action.appendChild(restart);
    }
    body.appendChild(action);
    card.appendChild(body);
    return card;
  }

  function renderChapters() {
    var list = Game.Progress.list();
    clear(el.chapterList);
    for (var i = 0; i < list.length; i++) {
      el.chapterList.appendChild(chapterCard(list[i]));
    }
  }

  /* ── 불러오기 — 저장 슬롯 (풀기획서 v4.4 7.10.2) ────────── */

  function pad2(n) { return (n < 10 ? '0' : '') + n; }

  function formatSavedAt(ms) {
    if (!ms) return '저장 일시 미상';
    var d = new Date(ms);
    return d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()) +
           ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes());
  }

  /*
   * 썸네일은 저장 시점의 배경, 위치는 «부 · 장면명», 진행률은 초반/중반/후반 세 단계로만 보인다.
   * 퍼센트로 보이면 «얼마나 남았나»를 계산하게 되어 서스펜스가 줄기 때문이다.
   * 이 프로토타입의 저장 슬롯은 하나뿐이라 카드도 하나이고, 비어 있으면 어두운 판을 보인다.
   */
  function renderLoad() {
    clear(el.loadList);
    var info = Game.Progress.slotInfo();

    var card = make('article', 'slot-card' + (info ? '' : ' empty'));
    if (!info) {
      card.appendChild(make('div', 'slot-thumb slot-thumb-empty'));
      var emptyBody = make('div', 'slot-body');
      emptyBody.appendChild(make('p', 'slot-empty', '비어 있음'));
      card.appendChild(emptyBody);
      el.loadList.appendChild(card);
      return;
    }

    card.appendChild(coverNode(info.bgKey, 'slot-thumb'));
    var body = make('div', 'slot-body');
    body.appendChild(make('p', 'slot-place',
      '제' + info.chapter.no + '부' + (info.scene ? ' · ' + info.scene : ' · ' + info.chapter.title)));
    body.appendChild(make('p', 'slot-meta', formatSavedAt(info.savedAt) + '  ·  ' + info.stage));

    var actions = make('div', 'slot-actions');
    var btn = make('button', null, '이어하기');
    btn.type = 'button';
    btn.addEventListener('click', function () {
      handlers.onPickChapter(info.chapterId, true);
    });
    actions.appendChild(btn);
    // 삭제는 확인을 거친다(main.js). 진행 슬롯만 지우며 도감·엔딩·증좌 열람 기록은 남는다
    var del = make('button', 'slot-delete', '삭제');
    del.type = 'button';
    del.addEventListener('click', function () {
      if (handlers.onDeleteSave) handlers.onDeleteSave();
    });
    actions.appendChild(del);
    body.appendChild(actions);
    card.appendChild(body);
    el.loadList.appendChild(card);
  }

  /* ── 인물 도감 ─────────────────────────────────────────── */

  function renderCodex() {
    var list = Game.Codex.list();
    var counts = Game.Codex.counts();
    el.codexCount.textContent = '수집 ' + counts.open + ' / ' + counts.total;

    clear(el.codexList);
    var firstOpen = null;

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var row = make('button', 'codex-item' + (item.unlocked ? '' : ' locked'));
      row.type = 'button';

      var text = make('span', 'codex-item-text');
      if (item.unlocked) {
        row.appendChild(portraitNode(item.entry, 'codex-thumb'));

        text.appendChild(make('span', 'codex-name', item.entry.name));
        text.appendChild(make('span', 'codex-role', item.entry.role));
        row.appendChild(text);

        if (firstOpen === null) firstOpen = item.entry.id;
        bindCodexRow(row, item.entry.id);
      } else {
        row.appendChild(make('span', 'codex-thumb placeholder', '?'));
        text.appendChild(make('span', 'codex-name', '???'));
        text.appendChild(make('span', 'codex-role', '아직 만나지 않은 인물'));
        row.appendChild(text);
        row.disabled = true;
      }
      el.codexList.appendChild(row);
    }

    /*
     * 인물을 특정하지 않는 안내.
     * 누구에게 진상이 남았는지는 밝히지 않고, 기록이 더 채워질 수 있다는 사실만 알린다.
     */
    el.codexNotice.textContent = Game.Codex.hasLockedSecrets()
      ? '일부 인물의 기록은 이야기의 특정 결말에 이르러야 채워집니다.'
      : '';

    // 이전에 보던 인물이 있으면 유지, 없으면 첫 인물을 펼친다
    var target = currentCodexId;
    var stillOpen = false;
    for (var j = 0; j < list.length; j++) {
      if (list[j].entry.id === target && list[j].unlocked) stillOpen = true;
    }
    showCodexDetail(stillOpen ? target : firstOpen);
  }

  function bindCodexRow(row, id) {
    row.addEventListener('click', function () {
      showCodexDetail(id);
    });
  }

  function showCodexDetail(id) {
    currentCodexId = id;
    clear(el.codexDetail);

    // 목록에서 선택 표시 갱신
    var rows = el.codexList.childNodes;
    var list = Game.Codex.list();
    for (var i = 0; i < rows.length; i++) {
      if (list[i] && list[i].entry.id === id) rows[i].classList.add('selected');
      else if (rows[i].classList) rows[i].classList.remove('selected');
    }

    if (!id) {
      el.codexDetail.appendChild(make('p', 'codex-empty',
        '아직 만난 인물이 없습니다. 이야기를 진행하면 채워집니다.'));
      return;
    }

    var item = null;
    for (var j = 0; j < list.length; j++) {
      if (list[j].entry.id === id) item = list[j];
    }
    if (!item || !item.unlocked) return;

    var entry = item.entry;
    var head = make('div', 'codex-detail-head');

    head.appendChild(portraitNode(entry, 'codex-avatar'));

    var headText = make('div', 'codex-detail-name');
    var name = make('h3', null, entry.name);
    if (entry.hanja) name.appendChild(make('span', 'codex-hanja', ' ' + entry.hanja));
    if (entry.nameTentative) name.appendChild(make('span', 'tentative-mark', ' (임시)'));
    // 실존 인물임을 표시해, 창작 인물과 섞이지 않게 한다 (기획서 3.4항 인물 사용 원칙)
    if (entry.real) name.appendChild(make('span', 'real-mark', ' 실존'));
    headText.appendChild(name);
    headText.appendChild(make('p', 'codex-role-line', entry.role));
    head.appendChild(headText);
    el.codexDetail.appendChild(head);

    for (var k = 0; k < entry.lines.length; k++) {
      el.codexDetail.appendChild(make('p', 'codex-line', entry.lines[k]));
    }

    // 진상은 조건이 충족된 인물에게만 붙는다.
    // 잠긴 경우 아무 표시도 하지 않는다 — 표시 자체가 핵심 인물을 지목하는 스포일러가 된다.
    if (item.secret) {
      var box = make('div', 'codex-secret');
      box.appendChild(make('span', 'codex-secret-label', '— 진상'));
      box.appendChild(make('p', null, item.secret));
      el.codexDetail.appendChild(box);
    }
  }

  /* ── 야사록 ────────────────────────────────────────────── */

  function renderYasarok() {
    var list = Game.Yasarok.list();
    var counts = Game.Yasarok.counts();
    el.yasarokCount.textContent = '수집 ' + counts.open + ' / ' + counts.total;

    clear(el.yasarokList);

    for (var i = 0; i < list.length; i++) {
      var item = list[i];
      var card = item.card;
      var box = make('article', 'yasarok-card' + (item.unlocked ? '' : ' locked'));

      var head = make('div', 'yasarok-head');
      head.appendChild(make('span', 'yasarok-kind', Game.YasarokKind[card.kind] || ''));

      if (item.unlocked) {
        var close = Game.YasarokClose[card.close];
        head.appendChild(make('span', 'yasarok-title', '「' + card.title + '」'));
        if (close) {
          var mark = make('span', 'yasarok-mark mark-' + card.close, close.mark);
          mark.title = close.label;
          head.appendChild(mark);
        }
        box.appendChild(head);
        box.appendChild(make('p', 'yasarok-body', card.body.replace(/\*\*/g, '')));
        if (close) box.appendChild(make('p', 'yasarok-close', '— ' + close.label));
        // 설정 문서 차원의 주의사항(혼동 방지 등)이 있으면 함께 보여준다
        if (card.note) box.appendChild(make('p', 'yasarok-note', card.note));
      } else {
        head.appendChild(make('span', 'yasarok-title', '「???」'));
        box.appendChild(head);
        box.appendChild(make('p', 'yasarok-body',
          '해당 장을 끝내면 야담꾼이 이 이야기를 풀어놓습니다.'));
      }
      el.yasarokList.appendChild(box);
    }
  }

  /* ── 증좌첩 ────────────────────────────────────────────── */

  /** 지금 진행 중인 장의 항목 목록. 진행 중인 장이 없으면 null */
  function jjContext() {
    return handlers.onJeungjwaContext ? handlers.onJeungjwaContext() : null;
  }

  function jjItems() {
    var ctx = jjContext();
    if (!ctx) return [];
    return Game.Jeungjwa.items(ctx.chapterId, ctx.state);
  }

  function renderJeungjwa() {
    var wraps = jjItems();
    el.jjCount.textContent = '수집 ' + wraps.length;
    el.jjCompare.classList.add('hidden');
    el.jjMain.classList.remove('hidden');

    clear(el.jjList);

    if (!wraps.length) {
      el.jjList.appendChild(make('p', 'codex-empty',
        jjContext() ? '아직 얻은 것이 없습니다.' : '진행 중인 장이 없습니다.'));
      el.jjDetail.innerHTML = '';
      el.jjCompareBtn.disabled = true;
      return;
    }

    // 이미 지워진(불가능해진) 선택은 대조 목록에서도 뺀다
    var ids = wraps.map(function (w) { return w.def.id; });
    jjSelected = jjSelected.filter(function (id) { return ids.indexOf(id) !== -1; });
    if (!jjCurrentId || ids.indexOf(jjCurrentId) === -1) jjCurrentId = wraps[0].def.id;

    for (var i = 0; i < wraps.length; i++) {
      el.jjList.appendChild(jjRow(wraps[i]));
    }
    el.jjCompareBtn.disabled = jjSelected.length !== 2;
    showJjDetail(jjCurrentId);
  }

  function jjRow(wrap) {
    var def = wrap.def;
    var picked = jjSelected.indexOf(def.id) !== -1;
    var row = make('div', 'jj-item' + (wrap.isNew ? ' is-new' : '') + (def.id === jjCurrentId ? ' selected' : ''));

    var titleBtn = make('button', 'jj-item-title', (def.kind ? '[' + def.kind + '] ' : '') + def.title);
    titleBtn.type = 'button';
    titleBtn.addEventListener('click', function () {
      jjCurrentId = def.id;
      Game.Jeungjwa.markSeen(def.id);
      renderJeungjwa();
    });
    row.appendChild(titleBtn);

    if (wrap.isNew) row.appendChild(make('span', 'jj-new-badge', '새로 얻음'));

    var pick = make('button', 'jj-pick' + (picked ? ' selected' : ''), picked ? '담음 ✓' : '대조에 담기');
    pick.type = 'button';
    pick.addEventListener('click', function (ev) {
      ev.stopPropagation();
      toggleJjSelect(def.id);
    });
    row.appendChild(pick);

    return row;
  }

  /** 대조에 담을 항목 — 최대 2개. 이미 2개면 먼저 담은 것부터 밀어낸다 */
  function toggleJjSelect(id) {
    var at = jjSelected.indexOf(id);
    if (at !== -1) {
      jjSelected.splice(at, 1);
    } else {
      jjSelected.push(id);
      if (jjSelected.length > 2) jjSelected.shift();
    }
    renderJeungjwa();
  }

  function jjDetailBlock(def) {
    var frag = doc.createDocumentFragment();
    frag.appendChild(make('h3', 'jj-title', (def.kind ? '[' + def.kind + '] ' : '') + def.title));

    var prop = def.prop && Game.Assets.prop(def.prop);
    if (prop) {
      var img = doc.createElement('img');
      img.className = 'jj-prop-img';
      img.src = prop.url;
      img.alt = prop.label;
      frag.appendChild(img);
    }

    frag.appendChild(make('p', 'jj-meta', '획득 — ' + def.acquired));

    var body = make('p', 'jj-text');
    markupInto(body, def.body, 'jj-nongmuk');
    frag.appendChild(body);

    var insight = make('p', 'jj-insight');
    insight.appendChild(make('span', 'jj-insight-label', '신은호의 소견 — '));
    insight.appendChild(doc.createTextNode(def.insight));
    frag.appendChild(insight);

    return frag;
  }

  function showJjDetail(id) {
    var ctx = jjContext();
    clear(el.jjDetail);
    if (!ctx) return;
    var def = Game.Jeungjwa.find(ctx.chapterId, id);
    if (!def) return;
    el.jjDetail.appendChild(jjDetailBlock(def));
  }

  /** 대조 — 고른 두 항목을 나란히 편다 */
  function showJjCompare() {
    if (jjSelected.length !== 2) return;
    var ctx = jjContext();
    if (!ctx) return;

    clear(el.jjCompareA);
    clear(el.jjCompareB);
    var a = Game.Jeungjwa.find(ctx.chapterId, jjSelected[0]);
    var b = Game.Jeungjwa.find(ctx.chapterId, jjSelected[1]);
    if (a) el.jjCompareA.appendChild(jjDetailBlock(a));
    if (b) el.jjCompareB.appendChild(jjDetailBlock(b));

    el.jjMain.classList.add('hidden');
    el.jjCompare.classList.remove('hidden');
  }

  function hideJjCompare() {
    el.jjCompare.classList.add('hidden');
    el.jjMain.classList.remove('hidden');
  }

  /* ── 설정 ──────────────────────────────────────────────── */

  function renderOptions() {
    var level = Game.Renderer.fxLevel();
    var buttons = el.fxLevel.querySelectorAll('[data-fx]');
    for (var i = 0; i < buttons.length; i++) {
      var on = Number(buttons[i].getAttribute('data-fx')) === level;
      if (on) buttons[i].classList.add('selected');
      else buttons[i].classList.remove('selected');
    }
    el.optVolLabel.textContent = Game.Audio.label();

    // 촌각 시간 여유 / 잔향 힌트
    markSelected(el.chongakScale, 'data-chongak', Game.Renderer.chongakScale());
    markSelected(el.echoToggle, 'data-echo', Game.Renderer.echoOn() ? 1 : 0);
  }

  /** 버튼 묶음에서 attr 값이 value 인 것만 선택 표시 */
  function markSelected(group, attr, value) {
    var buttons = group.querySelectorAll('[' + attr + ']');
    for (var i = 0; i < buttons.length; i++) {
      var on = Number(buttons[i].getAttribute(attr)) === Number(value);
      if (on) buttons[i].classList.add('selected');
      else buttons[i].classList.remove('selected');
    }
  }

  /* ── 챕터 해금 화면 ────────────────────────────────────── */

  var pendingUnlock = null;    // { info, gained } — Menu.showUnlock 이 채우고 renderUnlock 이 읽는다

  /*
   * 엔딩과 후일담이 끝난 뒤 «다음 부가 열렸음»을 알리고 이동 수단을 준다(풀기획서 v4.4 7.9항).
   *  - 배드엔딩에서도 해금은 일어나되 문구만 달라진다 (5부만 예외 — 은닉이라 아예 이 화면이 없다)
   *  - 이미 다녀온 길이면 «이미 다녀온 길입니다» + 장 선택 버튼만
   *  - 마지막 장이면 엔딩 수집 현황을 함께 보인다
   * 해금 문구는 UI 언어이므로 챕터 제목을 그대로 써도 된다(7.6항 메타 금지의 예외).
   */
  function renderUnlock() {
    var info = pendingUnlock.info;
    var next = info.next;
    var btnNext = doc.getElementById('unlock-next');
    var btnChapters = doc.getElementById('unlock-chapters');
    var eyebrow = doc.getElementById('unlock-eyebrow');
    var title = doc.getElementById('unlock-title');
    var teaser = doc.getElementById('unlock-teaser');
    var gained = doc.getElementById('unlock-gained');

    btnNext.classList.add('hidden');
    btnChapters.classList.remove('hidden');
    teaser.textContent = '';
    gained.textContent = pendingUnlock.gained || '';

    if (info.again) {
      eyebrow.textContent = '이미 지나온 길';
      title.textContent = '이미 다녀온 길입니다';
      gained.textContent = '';
    } else if (info.final) {
      eyebrow.textContent = '끝';
      title.textContent = '이야기가 여기서 닫혔습니다';
      // 최종부를 끝낸 뒤에야 전체 엔딩 수 대비 현황을 공개한다(누설 차단, 7.12.6항)
      gained.textContent = '확인한 엔딩 ' + Game.Save.unlocked().length + '종';
    } else if (next && next.playable && Game.Release && !Game.Release.allows(next.id)) {
      eyebrow.textContent = '체험판';
      title.textContent = '체험판은 여기까지입니다';
      teaser.textContent = '이 뒤의 이야기는 정식판에서 이어집니다.';
    } else if (next && !next.playable) {
      eyebrow.textContent = '다음 장';
      title.textContent = '제' + next.no + '부 「' + next.title + '」';
      teaser.textContent = '아직 준비 중입니다.';
    } else if (next) {
      eyebrow.textContent = '해금';
      title.textContent = info.bad
        ? '제' + next.no + '부가 열렸습니다.'
        : '제' + next.no + '부 「' + next.title + '」가 열렸습니다.';
      teaser.textContent = info.bad
        ? '다만 이 고을에 남은 것이 있습니다.'      // 재플레이를 부르는 문구
        : (next.teaser || '');
      btnNext.classList.remove('hidden');
      btnNext.onclick = function () { handlers.onPickChapter(next.id, false); };
    }
  }

  /* ── BGM 감상실 ────────────────────────────────────────── */

  function renderJukebox() {
    var heard = Game.Save.tracks();
    var keys = Game.Assets.trackKeys();
    clear(el.jukeboxList);

    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var track = Game.Assets.track(key);
      var isHeard = heard.indexOf(key) !== -1;

      var row = make('div', 'jukebox-item' + (isHeard ? '' : ' locked'));
      row.appendChild(make('span', 'jukebox-label',
        isHeard ? track.label : '??? — 아직 듣지 않은 곡'));

      if (isHeard) {
        var btn = make('button', null, '재생');
        btn.type = 'button';
        bindTrack(btn, key);
        row.appendChild(btn);
      }
      el.jukeboxList.appendChild(row);
    }
  }

  function bindTrack(btn, key) {
    btn.addEventListener('click', function () {
      handlers.onPlayTrack(key);
      markPlayingTrack(key);
    });
  }

  /** 지금 재생 중인 곡을 목록에 표시 */
  function markPlayingTrack(key) {
    var keys = Game.Assets.trackKeys();
    var rows = el.jukeboxList.childNodes;
    for (var i = 0; i < rows.length; i++) {
      if (!rows[i].classList) continue;
      if (keys[i] === key) rows[i].classList.add('playing');
      else rows[i].classList.remove('playing');
    }
  }

  /* ── 화면 전환 ─────────────────────────────────────────── */

  /** 메뉴 오버레이에 배경 에셋을 깐다 (에셋이 없으면 CSS 그라디언트 유지) */
  function applyArt(overlay, imageKey) {
    var art = Game.Assets.image(imageKey);
    if (!art) {
      overlay.classList.remove('has-art');
      overlay.style.backgroundImage = '';
      return;
    }
    overlay.classList.add('has-art');
    overlay.style.backgroundImage =
      'linear-gradient(rgba(10, 8, 7, 0.72), rgba(10, 8, 7, 0.88)), url("' + art.url + '")';
  }

  var Menu = {
    init: function (callbacks) {
      handlers = callbacks || {};

      el.title = doc.getElementById('screen-title');
      el.chapters = doc.getElementById('screen-chapters');
      el.load = doc.getElementById('screen-load');
      el.loadList = doc.getElementById('load-list');
      el.codex = doc.getElementById('screen-codex');
      el.yasarok = doc.getElementById('screen-yasarok');
      el.jeungjwa = doc.getElementById('screen-jeungjwa');
      el.unlock = doc.getElementById('screen-unlock');
      el.chongakScale = doc.getElementById('chongak-scale');
      el.echoToggle = doc.getElementById('echo-toggle');
      el.options = doc.getElementById('screen-options');
      el.jukebox = doc.getElementById('screen-jukebox');

      el.chapterList = doc.getElementById('chapter-list');
      el.codexList = doc.getElementById('codex-list');
      el.codexDetail = doc.getElementById('codex-detail');
      el.codexCount = doc.getElementById('codex-count');
      el.codexNotice = doc.getElementById('codex-notice');
      el.yasarokList = doc.getElementById('yasarok-list');
      el.yasarokCount = doc.getElementById('yasarok-count');
      el.jjCount = doc.getElementById('jj-count');
      el.jjMain = doc.getElementById('jj-main');
      el.jjList = doc.getElementById('jj-list');
      el.jjDetail = doc.getElementById('jj-detail');
      el.jjCompare = doc.getElementById('jj-compare');
      el.jjCompareA = doc.getElementById('jj-compare-a');
      el.jjCompareB = doc.getElementById('jj-compare-b');
      el.jjCompareBtn = doc.getElementById('jj-compare-btn');
      el.fxLevel = doc.getElementById('fx-level');
      el.optVolLabel = doc.getElementById('opt-vol-label');
      el.jukeboxList = doc.getElementById('jukebox-list');
      el.menuList = doc.getElementById('menu-list');
      el.menuDots = doc.getElementById('menu-dots');

      doc.getElementById('btn-continue').addEventListener('click', function () {
        var info = Game.Progress.slotInfo();
        if (info) handlers.onPickChapter(info.chapterId, true);
      });
      doc.getElementById('btn-new').addEventListener('click', function () {
        handlers.onStartNew();
      });
      doc.getElementById('btn-load').addEventListener('click', function () {
        handlers.onLoad();
      });
      doc.getElementById('btn-codex').addEventListener('click', function () {
        Menu.show('codex');
      });
      doc.getElementById('btn-yasarok').addEventListener('click', function () {
        Menu.show('yasarok');
      });
      doc.getElementById('btn-options').addEventListener('click', function () {
        Menu.show('options');
      });
      doc.getElementById('btn-jukebox').addEventListener('click', function () {
        Menu.show('jukebox');
      });

      // 증좌첩 — 닫기는 main.js 가 지금 진행 상태를 보고 행선지를 정한다(본편 도중이면 그 자리로).
      doc.getElementById('btn-jeungjwa-back').addEventListener('click', function () {
        jjSelected = [];
        if (handlers.onJeungjwaBack) handlers.onJeungjwaBack();
        else Menu.show('title');
      });
      doc.getElementById('jj-goto-codex').addEventListener('click', function () {
        Menu.show('codex');
      });
      el.jjCompareBtn.addEventListener('click', showJjCompare);
      doc.getElementById('jj-compare-close').addEventListener('click', hideJjCompare);

      doc.getElementById('load-to-chapters').addEventListener('click', function () {
        Menu.show('chapters');
      });
      doc.getElementById('unlock-chapters').addEventListener('click', function () {
        Menu.show('chapters');
      });
      doc.getElementById('unlock-menu').addEventListener('click', function () {
        if (handlers.onToMenu) handlers.onToMenu();
        else Menu.show('title');
      });

      // 시스템 시연 — 주소에 ?dev=1 이 있을 때만 메뉴에 나타난다 (일반 플레이어에게는 존재하지 않는다)
      var devBtn = doc.getElementById('btn-dev');
      if (/[?&]dev=1/.test(global.location.search || '') && !(Game.Release && Game.Release.demo)) {
        devBtn.classList.remove('hidden');
        devBtn.addEventListener('click', function () {
          if (handlers.onStartDev) handlers.onStartDev();
        });
      }

      // 촌각 시간 여유 / 잔향 — 고르면 즉시 저장
      el.chongakScale.addEventListener('click', function (ev) {
        var raw = ev.target.getAttribute && ev.target.getAttribute('data-chongak');
        if (raw === null) return;
        Game.Renderer.setChongakScale(Number(raw));
        renderOptions();
      });
      el.echoToggle.addEventListener('click', function (ev) {
        var raw = ev.target.getAttribute && ev.target.getAttribute('data-echo');
        if (raw === null) return;
        Game.Renderer.setEchoOn(raw === '1');
        renderOptions();
      });

      // 연출 강도 — 고르면 즉시 저장하고 그 강도로 미리 한 번 보여준다
      el.fxLevel.addEventListener('click', function (ev) {
        var raw = ev.target.getAttribute && ev.target.getAttribute('data-fx');
        if (raw === null) return;
        Game.Renderer.setFxLevel(Number(raw));
        renderOptions();
        Game.Renderer.playFx('flash-white');
      });

      doc.getElementById('opt-volume').addEventListener('click', function (ev) {
        var act = ev.target.getAttribute && ev.target.getAttribute('data-act');
        if (!act) return;
        Game.Audio.nudge(act === 'vol-up' ? 1 : -1);
        renderOptions();
      });

      bindTitle();

      // 각 하위 화면의 '돌아가기'
      var backs = doc.querySelectorAll('[data-back]');
      for (var i = 0; i < backs.length; i++) {
        backs[i].addEventListener('click', function () {
          Menu.show('title');
        });
      }
      return Menu;
    },

    /** name 이 null 이면 모든 메뉴를 닫는다 (본편 화면으로) */
    show: function (name, fromPlay) {
      if (fromPlay) titleFromPlay = true;
      for (var i = 0; i < SCREENS.length; i++) {
        el[SCREENS[i]].classList.add('hidden');
      }
      if (!name) return;

      // 메인은 [BG 5], 하위 메뉴는 [BG 6] 을 깐다. 글이 읽히도록 어둡게 덮는다.
      applyArt(el[name], name === 'title' ? 'title' : 'menu');

      if (name === 'title') {
        Menu.refreshTitle();
        setTitleStage(splashPending ? 'splash' : 'menu');
      }
      if (name === 'chapters') renderChapters();
      if (name === 'load') renderLoad();
      if (name === 'codex') renderCodex();
      if (name === 'yasarok') renderYasarok();
      if (name === 'jeungjwa') renderJeungjwa();
      if (name === 'unlock') renderUnlock();
      if (name === 'options') renderOptions();
      if (name === 'jukebox') renderJukebox();

      el[name].classList.remove('hidden');
    },

    /** 해금 화면을 연다 — info 는 Game.Progress.unlockInfo 의 결과 */
    showUnlock: function (info, gained) {
      pendingUnlock = { info: info, gained: gained || '' };
      Menu.show('unlock');
    },

    /** 열려 있는 메뉴 화면이 있는가 */
    isOpen: function () {
      for (var i = 0; i < SCREENS.length; i++) {
        if (!el[SCREENS[i]].classList.contains('hidden')) return true;
      }
      return false;
    },

    /** 타이틀의 불러오기 활성 여부 / 해금 현황 갱신 */
    /**
     * 타이틀 갱신 — 불러오기 활성 여부만 다룬다.
     * 도감·야사록 총수나 엔딩 합계는 타이틀에 내지 않는다(부 개수를 짐작하게 하는 누설, 풀기획서 v4.4 7.12.3).
     */
    refreshTitle: function () {
      var hasSave = Game.Save.hasSave();
      var keep = menuItems()[menuIndex];      // 항목이 늘고 줄어도 고르던 항목을 따라간다

      // 이어하기 — 저장이 있을 때만 캐러셀 맨 앞에 선다
      var cont = doc.getElementById('btn-continue');
      var info = hasSave ? Game.Progress.slotInfo() : null;
      cont.classList.toggle('hidden', !info);
      if (info) {
        cont.querySelector('.menu-desc').textContent =
          '제' + info.chapter.no + '부' + (info.scene ? ' · ' + info.scene : '') + ' — ' + info.stage;
      }

      // 체험판 — 표식을 달고, 잠긴 메뉴는 눌러도 열리지 않게 한다
      var demo = doc.getElementById('title-demo');
      var Rel = Game.Release;
      demo.classList.toggle('hidden', !(Rel && Rel.demo));
      if (Rel && Rel.demo) demo.textContent = Rel.label;
      MENU_IDS.forEach(function (id) {
        var b = doc.getElementById('btn-' + id);
        var locked = !!(Rel && Rel.menuLocked(id));
        b.disabled = locked;
        if (locked) b.querySelector('.menu-desc').textContent = '체험판에서는 열리지 않습니다';
      });

      var load = doc.getElementById('btn-load');
      load.disabled = !hasSave;
      load.querySelector('.menu-desc').textContent = hasSave
        ? '저장된 자리를 확인하고 이어갑니다'
        : '저장된 기록이 없습니다';

      var items = menuItems();
      if (titleFromPlay || splashPending || !keep || items.indexOf(keep) === -1) menuIndex = 0;
      else menuIndex = items.indexOf(keep);
      titleFromPlay = false;
      renderCarousel();
    },

  };

  Game.Menu = Menu;
})(this);
