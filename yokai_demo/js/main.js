/*
 * 부트스트랩 — 엔진(로직)과 화면(UI)을 연결한다.
 *
 * 규칙 판정은 core 가, 그리기는 ui 가 한다.
 * 이 파일은 입력을 받아 둘을 이어주고 화면 사이를 오가는 역할만 맡는다.
 *
 * 진행 단위는 '한 줄'이다.
 *  클릭 → 현재 노드의 다음 대사 한 줄 → … → 대사가 끝나면 다음 클릭에 노드 이동
 */
(function (global) {
  'use strict';

  var Game = global.Game;
  var doc = global.document;

  var R = Game.Renderer;
  var state = new Game.GameState();

  var chapter = null;    // 현재 챕터 메타
  var engine = null;     // 현재 챕터의 시나리오 엔진

  /*
   * 진행 모드
   *  menu           — 메뉴 화면(메인 / 장 선택 / 도감 / 야사록 / 감상실)이 열려 있음
   *  lines          — 현재 노드에 아직 출력할 대사가 남음
   *  advance        — 대사를 다 읽음. 다음 클릭에 노드 이동
   *  choice         — 선택지 대기
   *  ending_pending — 엔딩 대사를 다 읽음. 다음 클릭에 엔딩 화면
   *  ending         — 엔딩 화면
   *  death_pending  — 즉사 대사를 다 읽음. 다음 클릭에 즉사 화면
   *  death          — 즉사 화면 (직전 분기점으로 복귀 대기)
   *  muncho         — 「문초」 화면 (js/ui/muncho.js 가 진행, 끝나면 등급으로 분기)
   */
  var mode = 'menu';

  var pending = [];          // 현재 노드에서 아직 출력하지 않은 대사
  var BACKLOG_MAX = 400;     // 저장 용량 방어 — 오래된 대사는 버린다
  var lastYasarok = [];      // 이번 클리어로 새로 열린 야사록 카드 (엔딩 화면 표기용)
  var lastUnlock = { hidden: true };  // 이번 클리어의 해금 화면 정보 (Game.Progress.unlockInfo)
  var deathCount = 0;        // 지금 즉사 지점에서의 누적 횟수 — 「잔향」 점증의 근거
  var echoAsked = false;     // 잔향을 끈 채 4회 이상 죽었을 때 한 번만 묻는다

  /* ── 엔딩 해금 표기 ───────────────────────────────────── */
  function endingTitles() {
    var map = {};
    if (!engine) return map;
    for (var id in engine.script.nodes) {
      var node = engine.script.nodes[id];
      if (node.ending) map[node.ending.id] = node.ending.title;
    }
    return map;
  }

  function unlockedText() {
    var titles = endingTitles();
    var unlocked = Game.Save.unlocked();
    var total = 0, key;
    for (key in titles) total++;

    var mine = unlocked.filter(function (id) { return titles[id]; });
    if (!mine.length) return '이 장에서 확인한 엔딩 0 / ' + total;

    var names = mine.map(function (id) { return titles[id]; });
    return '이 장에서 확인한 엔딩 ' + mine.length + ' / ' + total + ' — ' + names.join(' · ');
  }

  /** 이번 클리어로 새로 열린 야사록 표기 */
  function yasarokText() {
    if (!lastYasarok || !lastYasarok.length) return '';
    var names = lastYasarok.map(function (card) { return '「' + card.title + '」'; });
    return '야사록 ' + lastYasarok.length + '장 해금 — ' + names.join(' · ');
  }

  /* ── 노드 진입 / 대사 출력 ────────────────────────────── */

  /**
   * 현재 노드를 화면에 반영한다.
   * revealFirst=false 는 저장 복원 시 사용한다 (이미 읽은 줄은 백로그로 복원됨).
   */
  function enterNode(revealFirst) {
    var node = engine.node();
    R.setBackdrop(node.bg);
    Game.Audio.play(Game.Assets.bgmFor(node));   // 같은 트랙이면 끊지 않는다
    R.setClueCount(state.clueCount());
    R.hideChoices();
    R.playFx(node.fx);                           // 강도 0이면 renderer 가 무시한다

    announceCodex(node.id);

    // 이미 읽은 줄은 건너뛰고, 남은 줄만 큐에 담는다
    pending = engine.lines().slice(state.lineIndex);

    if (!pending.length) {
      settle();
    } else {
      mode = 'lines';
      if (revealFirst) revealNext();
    }
    autosave();
  }

  /** 이 노드에서 새로 열린 인물이 있으면 알린다 */
  function announceCodex(nodeId) {
    var opened = Game.Codex.check(nodeId);
    if (!opened.length) return;
    var names = opened.map(function (o) { return o.name; }).join(', ');
    R.toast('인물 도감에 « ' + names + ' » 추가');
  }

  /** 대사 한 줄 출력 */
  function revealNext() {
    var line = pending.shift();
    state.lineIndex++;
    appendBacklog([line]);

    mode = 'lines';
    R.pushLine(line, function () {
      // 느린 줄의 타이핑이 끝난 시점에 다음 상태를 정한다
      if (!pending.length) settle();
      autosave();
    });
  }

  /** 노드의 대사를 모두 읽은 뒤의 상태 결정 */
  function settle() {
    if (engine.isChoice()) {
      mode = 'choice';
      // 촌각 선택지면 제한 시간을 함께 넘긴다 (없으면 null 이라 막대가 붙지 않는다)
      R.showChoices(engine.node().prompt, engine.options(), onPick,
                    engine.timeLimit(), onTimeout);
    } else if (engine.isDeath()) {
      mode = 'death_pending';
    } else if (engine.isMuncho()) {
      // 「문초」 — 대사를 다 읽으면 연쇄 논파 화면이 열리고, 세운 고리 수(등급)로 다음 노드가 갈린다
      mode = 'muncho';
      Game.MunchoUI.open(engine.munchoStart(), function (grade) {
        engine.munchoResolve(grade);
        enterNode(true);
      });
    } else if (engine.isEnding()) {
      mode = 'ending_pending';
      var ending = engine.node().ending;
      if (chapter.dev) {
        // 시연 장은 실제 진행·해금 기록에 아무것도 남기지 않는다
        lastYasarok = [];
        lastUnlock = { hidden: true };
      } else {
        var wasCleared = Game.Save.chapterStatus(chapter.id) === 'cleared';   // 기록하기 «전»에 확인
        Game.Save.markCleared(chapter.id, ending.id);
        // 야사록은 엔딩 종류를 가리지 않는다 — 고증 해설이지 이야기의 반전이 아니다
        lastYasarok = Game.Yasarok.unlockChapter(chapter.id);
        lastUnlock = Game.Progress.unlockInfo(chapter.id, ending.kind, wasCleared);
      }
    } else {
      mode = 'advance';
    }
  }

  /** 촌각 초과 — "아무것도 하지 못했다"가 자동 적용된다 */
  function onTimeout() {
    if (mode !== 'choice') return;
    var missed = { who: '', text: '▷ (아무것도 하지 못했다)', cls: 'picked missed' };
    R.pushLine(missed);
    appendBacklog([missed]);

    R.hideChoices();
    if (engine.timeout()) enterNode(true);
  }

  function appendBacklog(lines) {
    state.backlog = state.backlog.concat(lines.map(function (line) {
      // 조건식과 slow 는 저장하지 않는다(복원 시에는 즉시 출력).
      // 초상과 소품은 복원 후에도 그대로 보여야 하므로 남긴다.
      return {
        who: line.who, text: line.text, cls: line.cls,
        portrait: line.portrait, prop: line.prop
      };
    }));
    if (state.backlog.length > BACKLOG_MAX) {
      state.backlog = state.backlog.slice(-BACKLOG_MAX);
    }
  }

  function replayBacklog() {
    R.clearLog();
    R.pushLines(state.backlog);
  }

  /* ── 입력 처리 ────────────────────────────────────────── */

  function advance() {
    // 느리게 나타나는 중이면 먼저 그 줄을 즉시 완성한다
    if (R.isTyping()) {
      R.finishTyping();
      return;
    }

    if (mode === 'lines') {
      revealNext();
      return;
    }
    if (mode === 'advance') {
      if (engine.advance()) enterNode(true);
      return;
    }
    if (mode === 'death_pending') {
      mode = 'death';
      deathCount = engine.recordDeath();     // 같은 지점에서 몇 번째인가 — 잔향이 이것으로 점증한다
      R.showDeath(engine.node().death);
      return;
    }
    if (mode === 'ending_pending') {
      mode = 'ending';
      R.showEnding(engine.node().ending, unlockedText(), yasarokText());
      // 해금 화면이 없는 경우(시연 장 · 배드로 끝난 4부)에는 «다음으로» 버튼을 감춘다
      var nextBtn = doc.getElementById('btn-ending-next');
      if (lastUnlock.hidden) nextBtn.classList.add('hidden');
      else nextBtn.classList.remove('hidden');
    }
    // choice / ending / death / menu 모드에서는 클릭으로 진행하지 않는다
  }

  /**
   * 즉사 복귀 — 직전 분기점으로 되돌린다.
   * 처음부터 다시 시키지 않는 것이 설계 원칙이다(2부 플롯 7.1항).
   */
  function onRevive() {
    R.hideDeath();

    /*
     * 「잔향(殘響)」 — 즉사 화면과 재시작 사이의 암전 한 줄.
     * 회차가 쌓일수록 힌트가 구체화되고(engine.echoLine), 극중 인물의 목소리로만 나온다.
     * 끈 상태에서도 4회 이상 반복 사망하면 한 번 표시 여부를 묻는다(3부 플롯 8.3항).
     */
    var line = engine.echoLine(deathCount);
    var enabled = R.echoOn();
    if (line && !enabled && deathCount >= 4 && !echoAsked) {
      echoAsked = true;
      enabled = global.confirm('같은 자리에서 여러 번 쓰러졌습니다. 잔향을 한 번 들어 보시겠습니까?');
    }

    var proceed = function () {
      engine.revive();
      // 죽은 뒤에 쌓인 대사는 state.rewind 가 이미 잘라냈으므로 로그를 다시 그린다
      replayBacklog();
      enterNode(true);
    };
    if (line && enabled) R.showEcho(line, proceed);
    else proceed();
  }

  function onPick(index, text) {
    // 고른 선택지를 로그에 남겨 회차 플레이 시 경로를 되짚을 수 있게 한다
    var picked = { who: '', text: '▷ ' + text, cls: 'picked' };
    R.pushLine(picked);
    appendBacklog([picked]);

    R.hideChoices();
    engine.choose(index);
    enterNode(true);
  }

  /* ── 챕터 진입 ────────────────────────────────────────── */

  /** 챕터 메타 + 시나리오를 붙여 엔진을 만든다 */
  function attach(chapterId) {
    var meta = Game.findChapter(chapterId);
    var script = Game.chapterScript(meta);
    if (Game.Release && !Game.Release.allows(chapterId)) {
      R.toast('체험판에서는 열리지 않습니다.');
      return false;
    }
    if (!meta || !script) {
      R.toast('아직 준비되지 않은 장입니다.');
      return false;
    }
    chapter = meta;
    engine = new Game.Engine(script, state);
    R.setChapterTitle(meta.dev ? meta.title : '제' + meta.no + '부 · ' + meta.title);
    return true;
  }

  /** 챕터를 처음부터 시작 */
  function playChapter(chapterId) {
    if (!attach(chapterId)) return;

    engine.start();
    state.chapterId = chapterId;
    if (!chapter.dev) Game.Save.markPlaying(chapterId);   // 시연 장은 진행 기록을 남기지 않는다
    lastYasarok = [];
    echoAsked = false;

    R.clearLog();
    R.hideEnding();
    R.hideDeath();
    Game.Menu.show(null);
    enterNode(true);
  }

  /** 저장된 자리에서 재개 */
  function resumeChapter(chapterId) {
    var data = Game.Save.load();
    if (!data || data.chapterId !== chapterId) {
      playChapter(chapterId);
      return;
    }
    if (!attach(chapterId)) return;

    engine.resume(data);
    state.chapterId = chapterId;
    lastYasarok = [];

    R.hideEnding();
    R.hideDeath();
    Game.Menu.show(null);
    replayBacklog();
    enterNode(false);
  }

  function autosave() {
    if (chapter && chapter.dev) return;    // 시연 장이 실제 진행 슬롯을 덮어쓰면 안 된다
    Game.Save.save(state);
  }

  function toMenu() {
    mode = 'menu';
    R.hideChoices();
    R.hideEnding();
    R.hideDeath();
    // 본편 배경은 감춰지지만, 메뉴를 닫았을 때 어색하지 않도록 함께 맞춰둔다
    R.setBackdrop('title');
    Game.Audio.play('menu');                     // [BGM 5] 메인 화면 테마
    Game.Menu.show('title', true);
  }

  /* ── 메뉴 동작 ────────────────────────────────────────── */

  function onStartNew() {
    // 진행 슬롯을 덮어쓰게 되므로, 저장이 있으면 한 번 확인한다
    if (Game.Save.hasSave() &&
        !global.confirm('저장된 진행 기록을 덮어쓰고 처음부터 시작합니다. 계속하시겠습니까?\n(인물 도감과 엔딩 해금은 그대로 유지됩니다)')) {
      return;
    }
    var first = Game.Progress.firstPlayable();
    if (!first) {
      R.toast('플레이 가능한 장이 없습니다.');
      return;
    }
    Game.Save.clear();
    playChapter(first.id);
  }

  function onLoad() {
    if (!Game.Save.hasSave()) {
      R.toast('저장된 기록이 없습니다.');
      return;
    }
    // 저장 슬롯 화면(썸네일·부와 장면·저장 시각·진행 단계)에서 이어하기. «장 선택으로» 길도 함께 둔다.
    Game.Menu.show('load');
  }

  /** 저장 데이터 삭제 — 진행 슬롯만 지운다. 도감·엔딩·야사록·증좌 열람 기록은 남는다 */
  function onDeleteSave() {
    if (!Game.Save.hasSave()) return;
    if (!global.confirm('저장된 진행 기록을 삭제합니다. 되돌릴 수 없습니다. 계속하시겠습니까?\n(인물 도감과 엔딩 해금은 그대로 유지됩니다)')) {
      return;
    }
    Game.Save.clear();
    R.toast('저장 데이터를 삭제했습니다.');
    Game.Menu.show('load');
    Game.Menu.refreshTitle();
  }

  function onPickChapter(chapterId, resume) {
    if (resume) resumeChapter(chapterId);
    else playChapter(chapterId);
  }

  /** 감상실에서 곡을 직접 재생 */
  function onPlayTrack(key) {
    Game.Audio.play(key);
  }

  /** 증좌첩이 지금 무엇을 그려야 하는지 — 진행 중인 장이 없으면 null */
  function onJeungjwaContext() {
    return chapter ? { chapterId: chapter.id, state: state } : null;
  }

  /**
   * 증좌첩 닫기.
   * 본편 도중(조사·선택·즉사 등)에 열었다면 그 자리로 그대로 돌아가야 하므로
   * 다른 메뉴 화면들처럼 무조건 타이틀로 보내지 않는다(기획서 v4.4 7.13.1항 "닫으면 그 자리로").
   */
  function onJeungjwaBack() {
    Game.Menu.show(mode === 'menu' ? 'title' : null);
  }

  /* ── 이벤트 연결 ──────────────────────────────────────── */

  function bind() {
    doc.getElementById('stage').addEventListener('click', advance);

    doc.addEventListener('keydown', function (ev) {
      // 음량 단계 조절은 어느 화면에서나 가능
      if (ev.key === '-' || ev.key === '_') { Game.Audio.nudge(-1); return; }
      if (ev.key === '=' || ev.key === '+') { Game.Audio.nudge(1); return; }
      if (ev.key === 'm' || ev.key === 'M') { Game.Audio.toggleMute(); return; }

      /*
       * 증좌첩은 "조사 중·대화 중·문초 중 어디서나" 열려야 하므로(기획서 v4.4 7.13.1항)
       * 아래의 모드별 early return 보다 먼저 처리한다. 이미 다른 메뉴가 열려 있으면 무시한다.
       */
      if ((ev.key === 'e' || ev.key === 'E') && !Game.Menu.isOpen()) {
        Game.Menu.show('jeungjwa');
        return;
      }

      if (mode === 'menu' || mode === 'ending') return;

      if (ev.key === ' ' || ev.key === 'Enter') {
        ev.preventDefault();
        advance();
        return;
      }
      // 숫자 키로 선택지 선택
      if (mode === 'choice' && /^[1-9]$/.test(ev.key)) {
        var options = engine.options();
        var pick = options[Number(ev.key) - 1];
        if (pick) onPick(pick.index, pick.text);
      }
    });

    doc.getElementById('volume').addEventListener('click', function (ev) {
      var act = ev.target.getAttribute && ev.target.getAttribute('data-act');
      if (!act) return;
      ev.stopPropagation();
      Game.Audio.nudge(act === 'vol-up' ? 1 : -1);
    });

    doc.getElementById('controls').addEventListener('click', function (ev) {
      var act = ev.target.getAttribute && ev.target.getAttribute('data-act');
      if (!act) return;
      ev.stopPropagation();

      if (act === 'jeungjwa') {
        Game.Menu.show('jeungjwa');
      } else if (act === 'save') {
        R.toast(Game.Save.save(state) ? '저장했습니다.' : '이 환경에서는 저장할 수 없습니다.');
      } else if (act === 'load') {
        resumeChapter(Game.Progress.resumeChapterId() || chapter.id);
      } else if (act === 'restart') {
        playChapter(chapter.id);
      } else if (act === 'menu') {
        toMenu();
      }
    });

    doc.getElementById('btn-again').addEventListener('click', function () {
      playChapter(chapter.id);
    });
    doc.getElementById('btn-to-menu').addEventListener('click', toMenu);
    // 엔딩·후일담을 다 본 뒤 «다음 부가 열렸음»을 알리는 해금 화면으로 넘어간다
    doc.getElementById('btn-ending-next').addEventListener('click', function () {
      R.hideEnding();
      mode = 'menu';
      Game.Menu.showUnlock(lastUnlock, yasarokText());
    });

    doc.getElementById('btn-revive').addEventListener('click', onRevive);
    doc.getElementById('btn-death-menu').addEventListener('click', function () {
      R.hideDeath();
      toMenu();
    });

    // 엔딩 화면에서 읽은 내용을 다시 훑어볼 수 있게 오버레이를 잠시 내린다
    doc.getElementById('btn-backlog').addEventListener('click', function () {
      R.hideEnding();
      mode = 'ending_pending';
      R.toast('화면을 클릭하면 엔딩 화면으로 돌아갑니다.');
    });
  }

  function boot() {
    R.init();
    bind();

    Game.Menu.init({
      onStartNew: onStartNew,
      onLoad: onLoad,
      onDeleteSave: onDeleteSave,
      onPickChapter: onPickChapter,
      onPlayTrack: onPlayTrack,
      onJeungjwaContext: onJeungjwaContext,
      onJeungjwaBack: onJeungjwaBack,
      onToMenu: toMenu,
      onStartDev: function () { playChapter('dev'); }
    });

    Game.Assets.preload();                       // 배경 이미지 선행 로딩
    Game.Audio.init(R.setAudioState);            // 음량 표시를 렌더러에 위임
    R.setBackdrop('title');
    Game.Audio.play('menu');                     // [BGM 5] 메인 화면 테마

    Game.Menu.show('title');
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(this);
