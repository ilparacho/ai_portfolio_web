/*
 * 「문초(問招)」 연쇄 논파 판정 (순수 로직 — DOM 참조 없음)
 *
 * 근거: 기획서/3부_두번죽은이름_플롯_v2.2.md 5장, 풀기획서 v4.4 11.4항,
 *       02_UI시스템_구현명세_v1.5 5장
 *
 * ── 규칙 ────────────────────────────────────────────────────
 *  - 고리(ring)는 앞 고리의 결론을 전제로 하므로 정해진 순서(정의 배열의 순서)가 있다.
 *  - 플레이어는 손에 든 단서로 세울 수 있는 고리(needs 충족)만 카드로 받는다.
 *  - 카드를 올릴 때마다 «지금 세울 차례인 고리»여야 성립한다.
 *    차례가 아니면 상대가 반박하고 카드는 하단으로 되돌아온다(착오 +1).
 *    → 어떤 고리를 세울 수 있는가는 플레이어의 경로(단서)가 정하고,
 *      세우는 순서는 플레이어의 추리가 정한다.
 *  - 착오가 maxMistakes 를 넘으면 논리가 무너진다(collapsed).
 *
 * ── 판정 (고리 임계 가변제, 풀기획서 11.4항) ─────────────────
 *  세운 고리 수  threshold 미만 → 'fail'(논리 미성립) / threshold 이상 → 'good' / full 이상 → 'true'
 *  임계와 전량 수는 정의(def)가 정한다 — 시즌이 바뀌어도 고리 목록만 새로 쓰면 성립한다.
 *
 * ── 정의(def) ───────────────────────────────────────────────
 *  { title, opponent, threshold, full, maxMistakes?, timePerRing?(ms),
 *    rebuttals?: [ '반박 문구', ... ],
 *    rings: [ { id, title, needs?: 'clue_id' | function(state), conclusion } ] }
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var DEFAULT_MISTAKES = 3;

  function Session(def, state) {
    this.def = def;
    this.state = state;
    this.placed = [];      // 세운 고리(정의 객체)
    this.mistakes = 0;
    this.finished = false;
  }

  /** 이 고리를 세울 재료(단서)를 손에 쥐고 있는가 */
  Session.prototype.hasMaterial = function (ring) {
    if (!ring.needs) return true;
    if (typeof ring.needs === 'function') return !!ring.needs(this.state);
    return this.state.has(ring.needs);
  };

  /** 세울 수 있는 고리 전체 (정의 순서) */
  Session.prototype.available = function () {
    var out = [];
    for (var i = 0; i < this.def.rings.length; i++) {
      if (this.hasMaterial(this.def.rings[i])) out.push(this.def.rings[i]);
    }
    return out;
  };

  /** 지금 세울 차례인 고리 — 세울 수 있는 것 중 아직 안 세운 첫 고리 */
  Session.prototype.expected = function () {
    var av = this.available();
    return av[this.placed.length] || null;
  };

  /**
   * 하단에 깔리는 카드. 정의 순서를 그대로 보이면 답이 드러나므로
   * id 로 결정되는 고정 순서로 뒤섞는다(무작위가 아니라 회차마다 같은 배치).
   */
  Session.prototype.cards = function () {
    var placedIds = {};
    this.placed.forEach(function (r) { placedIds[r.id] = true; });
    var cards = this.available().filter(function (r) { return !placedIds[r.id]; });
    cards.sort(function (a, b) { return scramble(a.id) - scramble(b.id) || (a.id < b.id ? -1 : 1); });
    return cards;
  };

  function scramble(id) {
    var h = 7;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 9973;
    return h;
  }

  /**
   * 카드를 상단에 올린다.
   * 반환: { ok, ring?, rebuttal?, collapsed?, done? }
   *  ok=false 이면 카드는 하단으로 돌아오고 rebuttal 이 붙는다.
   */
  Session.prototype.place = function (ringId) {
    if (this.finished) return { ok: false, rebuttal: '' };

    var exp = this.expected();
    var ring = null;
    for (var i = 0; i < this.def.rings.length; i++) {
      if (this.def.rings[i].id === ringId) ring = this.def.rings[i];
    }
    if (!ring || !this.hasMaterial(ring) || this.placed.indexOf(ring) !== -1) {
      return { ok: false, rebuttal: '' };
    }
    if (!exp || exp.id !== ring.id) return this.mistake(ring);

    this.placed.push(ring);
    return { ok: true, ring: ring, done: this.expected() === null };
  };

  /** 착오 — 틀린 순서, 혹은 촌각 초과(ring 없음) */
  Session.prototype.mistake = function (ring) {
    this.mistakes++;
    var list = this.def.rebuttals || [];
    var rebuttal = list.length ? list[(this.mistakes - 1) % list.length] : '';
    var collapsed = this.mistakes > (this.def.maxMistakes === undefined ? DEFAULT_MISTAKES : this.def.maxMistakes);
    if (collapsed) this.finished = true;
    return { ok: false, ring: ring || null, rebuttal: rebuttal, collapsed: collapsed };
  };

  /** 임계에 닿았는가 — UI 는 이때 누적 영역의 테두리만 바꾼다(숫자는 보이지 않는다) */
  Session.prototype.reached = function () {
    return this.placed.length >= this.def.threshold;
  };

  Session.prototype.isCollapsed = function () {
    return this.mistakes > (this.def.maxMistakes === undefined ? DEFAULT_MISTAKES : this.def.maxMistakes);
  };

  /** 더 세울 고리가 없거나 무너졌으면 끝난 것이다 */
  Session.prototype.isDone = function () {
    return this.finished || this.expected() === null;
  };

  /** 결과 등급 — 무너졌으면 세운 수와 무관하게 실패다 */
  Session.prototype.grade = function () {
    if (this.isCollapsed()) return 'fail';
    var n = this.placed.length;
    if (n >= this.def.full) return 'true';
    if (n >= this.def.threshold) return 'good';
    return 'fail';
  };

  Game.Muncho = {
    start: function (def, state) { return new Session(def, state); }
  };
})(this);
