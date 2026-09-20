/*
 * 시나리오 엔진 (순수 로직 — DOM 참조 없음)
 *
 * 역할: 시나리오 데이터(노드 그래프)를 상태에 따라 진행시키는 것뿐이다.
 *       화면 출력·입력 처리는 전부 ui/renderer.js 와 main.js 가 담당한다.
 *
 * ── 노드 스키마 ─────────────────────────────────────────────
 *  공통    : { id, bg?, bgm?, sfx?, fx?, set?, onEnter?(state) }
 *  대사    : { lines: [...], next: 'nodeId' | function(state) -> 'nodeId' }
 *  선택지  : { prompt?, options: [ { text, next, set?, tag?, once?, when?(state) } ],
 *              timeLimit?: ms, timeoutNext?: 'nodeId' }
 *  엔딩    : { ending: { id, title, kind: 'good'|'bad'|'normal', desc? }, lines? }
 *  즉사    : { death:  { id, title, master?, desc?, echoes?: [{ who, text }] }, lines? }
 *  문초    : { muncho: def, munchoNext: { fail, good, true }, lines? }  — 판정은 js/core/muncho.js
 *
 *  lines 의 각 원소는 문자열 또는 { who?, text, cls?, slow?, portrait?, prop?, when? } 객체.
 *  prop : 습득한 문서·물건의 이미지 키 (data/assets.js 의 PROPS). 대사 아래에 함께 보여준다.
 *  cls  : 'narration' | 'thought' | 'spirit' | 'whisper' | 'shout' | 'danger'
 *         | 'clue' | 'sfx' | 'epilogue'
 *  slow : true 면 글자 단위로 느리게 출력 (긴장 구간 연출)
 *  who / portrait 는 함수(state)로도 줄 수 있다 — 2부 그슨대가 상대에 따라 얼굴을 바꾸는 데 쓴다.
 *  텍스트 안에서는 **강조** / !!큰글씨!! 마크업을 쓸 수 있다.
 *
 *  fx  : 화면 연출 키. 'flash-white' | 'flash-red' | 'shake-weak' | 'shake-mid' | 'shake-strong'
 *        강도 조절·해제는 UI(ui/renderer.js)의 접근성 설정이 담당한다.
 *
 * ── 즉사와 체크포인트 ───────────────────────────────────────
 *  선택지 노드에 들어갈 때마다 상태를 스냅숏으로 떠둔다(checkpoint).
 *  즉사 노드에 도달하면 UI 가 그 스냅숏으로 되돌려 직전 분기점부터 다시 하게 한다.
 *  "즉사는 긴장 장치이지 플레이어를 벌하기 위한 것이 아니다"(2부 플롯 7.1항)를
 *  로직으로 보장하는 자리다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  function Engine(script, state) {
    this.script = script;
    this.state = state || new Game.GameState();
  }

  /** 처음부터 시작 */
  Engine.prototype.start = function () {
    this.state.reset();
    return this.goto(this.script.startId);
  };

  /** 저장된 상태에서 재개 */
  Engine.prototype.resume = function (data) {
    this.state.load(data);
    if (!this.state.nodeId || !this.script.nodes[this.state.nodeId]) {
      return this.start();
    }
    return this.node();
  };

  Engine.prototype.node = function () {
    return this.script.nodes[this.state.nodeId] || null;
  };

  /** next 가 함수면 상태로 평가해 노드 id 를 얻는다 (분기 규칙을 데이터에 둘 수 있게 함) */
  Engine.prototype.resolve = function (ref) {
    return (typeof ref === 'function') ? ref(this.state) : ref;
  };

  /**
   * 특정 노드로 이동. 노드의 set / onEnter 를 여기서 한 번만 적용한다.
   * (진입 시점에 적용하므로 저장 후 복원해도 중복 적용되지 않는다)
   */
  Engine.prototype.goto = function (nodeId) {
    var id = this.resolve(nodeId);
    var node = this.script.nodes[id];
    if (!node) {
      throw new Error('[engine] 존재하지 않는 노드: ' + id);
    }
    /*
     * 선택지 노드는 즉사 복귀 지점이 된다.
     * 노드에 들어가기 '전' 상태를 떠두어야 그 노드의 set/onEnter 가 중복 적용되지 않는다.
     */
    if (node.options) this.state.mark(id);

    this.state.nodeId = id;
    this.state.lineIndex = 0;   // 새 노드에 들어가면 대사 출력 위치를 처음으로
    this.state.visit(id);
    this.state.apply(node.set);
    if (typeof node.onEnter === 'function') node.onEnter(this.state);
    // 시연용 샌드박스 장(script.sandbox)은 실제 엔딩 해금 기록을 더럽히지 않는다
    if (node.ending && !this.script.sandbox) Game.Save.unlock(node.ending.id);
    return node;
  };

  /* ── 「문초」 노드 ───────────────────────────────────────── */

  /** 문초 노드인가 — { muncho: def, next: { fail, good, true } } */
  Engine.prototype.isMuncho = function () {
    var node = this.node();
    return !!(node && node.muncho);
  };

  /** 현재 노드의 문초 세션을 연다 (판정은 js/core/muncho.js) */
  Engine.prototype.munchoStart = function () {
    var node = this.node();
    if (!node || !node.muncho) return null;
    return Game.Muncho.start(node.muncho, this.state);
  };

  /** 문초 결과 등급('fail'|'good'|'true')에 해당하는 노드로 이동한다 */
  Engine.prototype.munchoResolve = function (grade) {
    var node = this.node();
    if (!node || !node.muncho || !node.munchoNext) return null;
    var target = node.munchoNext[grade] || node.munchoNext.fail;
    return this.goto(target);
  };

  /* ── 「잔향(殘響)」 ─────────────────────────────────────── */

  /** 즉사를 기록하고 같은 지점에서의 누적 횟수를 돌려준다 */
  Engine.prototype.recordDeath = function () {
    var node = this.node();
    if (!node || !node.death) return 0;
    return this.state.bumpDeath(node.death.id);
  };

  /**
   * 누적 횟수에 맞는 잔향 한 줄. 없으면 null.
   * death.echoes 는 [{ who, text }, ...] — 인덱스가 깊어질수록 구체적이다(1회 → 첫 줄, 횟수가 넘치면 마지막 줄).
   * 화자는 반드시 극중 인물이어야 한다(시스템 안내문 금지, 3부 플롯 8.1항).
   */
  Engine.prototype.echoLine = function (count) {
    var node = this.node();
    var list = node && node.death && node.death.echoes;
    if (!list || !list.length || !count) return null;
    return list[Math.min(count, list.length) - 1];
  };

  /** 즉사 노드인가 */
  Engine.prototype.isDeath = function () {
    var node = this.node();
    return !!(node && node.death);
  };

  /**
   * 즉사 직전의 분기점으로 되돌린다.
   * 스냅숏이 없으면(첫 선택지 전에 죽는 경우) 챕터를 처음부터 시작한다.
   */
  Engine.prototype.revive = function () {
    var mark = this.state.rewind();
    if (!mark) return this.start();
    return this.goto(mark);
  };

  /**
   * 현재 노드에서 출력할 대사 목록을 정규화해서 반환한다.
   *  - 문자열 원소는 { text } 형태로 통일
   *  - when 조건이 걸린 대사는 상태에 따라 걸러낸다 (회차별 추가 대사 처리)
   *  - 노드의 sfx 는 맨 앞의 효과음 줄로 삽입한다
   * 조건 판정을 여기서 끝내므로 renderer 는 규칙을 알 필요가 없다.
   */
  Engine.prototype.lines = function () {
    var node = this.node();
    if (!node) return [];
    var state = this.state;
    var out = [];

    if (node.sfx) out.push({ who: '', text: node.sfx, cls: 'sfx' });

    var src = node.lines || [];
    for (var i = 0; i < src.length; i++) {
      var raw = src[i];
      var line = (typeof raw === 'string') ? { text: raw } : raw;
      if (typeof line.when === 'function' && !line.when(state)) continue;
      /*
       * slow 는 연출 플래그, portrait 는 화자 표기와 무관하게 초상을 직접 지정할 때 쓴다.
       * who / portrait 를 함수로 두면 상태에 따라 화자가 바뀐다 —
       * 2부 그슨대가 "보는 이가 가장 의심하는 얼굴"을 취하는 연출이 이것으로 구현된다.
       */
      out.push({
        who: this.resolve(line.who) || '',
        text: line.text,
        cls: line.cls || '',
        slow: !!line.slow,
        portrait: this.resolve(line.portrait) || '',
        // prop 은 습득한 문서·물건의 이미지를 대사 아래에 함께 보여줄 때 쓴다
        prop: line.prop || ''
      });
    }
    return out;
  };

  Engine.prototype.isChoice = function () {
    var node = this.node();
    return !!(node && node.options);
  };

  Engine.prototype.isEnding = function () {
    var node = this.node();
    return !!(node && node.ending);
  };

  /**
   * 현재 노드에서 실제로 보여줄 선택지 목록.
   * when 조건 불충족 / once + 이미 선택한 항목은 제외한다.
   * 반환 원소에 원본 인덱스(index)를 담아 choose() 에 그대로 넘길 수 있게 한다.
   */
  Engine.prototype.options = function () {
    var node = this.node();
    if (!node || !node.options) return [];
    var state = this.state;
    var out = [];
    for (var i = 0; i < node.options.length; i++) {
      var opt = node.options[i];
      if (typeof opt.when === 'function' && !opt.when(state)) continue;
      if (opt.once && state.isVisited(optionKey(node.id, i))) continue;
      out.push({ index: i, text: opt.text, tag: opt.tag });
    }
    return out;
  };

  /**
   * 「촌각(寸刻)」 제한 시간 선택지 정보. 없으면 null.
   * 3부에서 정식 도입되며, 2부 후반에 한 장면만 맛보기로 등장한다(2부 플롯 7.3항).
   */
  Engine.prototype.timeLimit = function () {
    var node = this.node();
    if (!node || !node.options || !node.timeLimit) return null;
    return node.timeLimit;
  };

  /** 제한 시간 초과 — "아무것도 하지 못했다". 불리하되 즉사는 아니다 */
  Engine.prototype.timeout = function () {
    var node = this.node();
    if (!node || !node.timeoutNext) return null;
    return this.goto(node.timeoutNext);
  };

  /** 선택지 선택 → 플래그 적용 후 다음 노드로 이동 */
  Engine.prototype.choose = function (index) {
    var node = this.node();
    if (!node || !node.options || !node.options[index]) {
      throw new Error('[engine] 잘못된 선택지 인덱스: ' + index);
    }
    var opt = node.options[index];
    this.state.visit(optionKey(node.id, index));
    this.state.apply(opt.set);
    if (typeof opt.onPick === 'function') opt.onPick(this.state);
    return this.goto(opt.next);
  };

  /** 대사 노드 진행 */
  Engine.prototype.advance = function () {
    var node = this.node();
    if (!node || node.options || node.ending || !node.next) return null;
    return this.goto(node.next);
  };

  /** 1회성 선택지 기록용 키 (노드 방문 기록과 같은 저장소를 공유한다) */
  function optionKey(nodeId, index) {
    return nodeId + '#' + index;
  }

  Engine.prototype.optionKey = optionKey;

  /**
   * 「촌각」 기본 제한 시간(ms) — 3부 플롯 7.6항 확정값. 테스트 후 조정을 전제로 한 초기값이다.
   * 접근성 배율(1.5배 / 2배 / 무제한)은 UI 설정이 곱한다(js/ui/renderer.js).
   */
  Engine.CHONGAK = {
    PROLOGUE: 15000,       // 프롤로그 학습 구간
    INTERROGATION: 20000,  // 추국 심문 — 문장이 길고 이두 문체라 읽는 시간이 필요
    RING: 15000,           // 「문초」 각 고리
    DEFAULT: 15000         // 기타 긴급 장면
  };

  Game.Engine = Engine;
})(this);
