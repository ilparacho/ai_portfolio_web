/*
 * 게임 상태 (순수 로직 — DOM 참조 없음)
 *
 * 향후 유니티 이관을 고려해 이 파일은 브라우저 API(document, window 이벤트 등)를
 * 일절 참조하지 않는다. 플래그 판정 규칙이 바뀌어도 UI 코드는 손대지 않아도 된다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  function GameState() {
    this.reset();
  }

  GameState.prototype.reset = function () {
    this.chapterId = null; // 진행 중인 챕터 id
    this.nodeId = null;   // 현재 노드 id
    this.lineIndex = 0;   // 현재 노드에서 이미 출력한 대사 수 (한 줄씩 진행하므로 필요)
    this.flags = {};      // 단서·성향·신뢰도 (key -> boolean | number)
    this.visited = {};    // 방문한 노드 id (1회성 선택지 판별용)
    this.backlog = [];    // 출력된 대사 누적 (백로그 / 저장 복원용)
    /*
     * 즉사 복귀용 스냅숏.
     * 선택지 노드에 들어갈 때마다 그 시점의 노드 id / 플래그 / 백로그 길이를 떠둔다.
     * 즉사하면 이 자리로 되돌린다 — 처음부터 다시 시키지 않는다는 설계 원칙(2부 플롯 7.1항).
     */
    this.mark_ = null;
    /*
     * 즉사 횟수(같은 지점에서 몇 번 죽었는가) — 「잔향」 힌트가 회차마다 구체화되는 근거.
     * ⚠ mark/rewind 에 넣지 않는다. 되돌려지면 죽은 횟수가 지워져 힌트가 영영 점증하지 않는다.
     */
    this.deaths = {};
    return this;
  };

  /** 즉사 기록 — 같은 즉사 id 의 누적 횟수를 돌려준다 */
  GameState.prototype.bumpDeath = function (deathId) {
    this.deaths[deathId] = (this.deaths[deathId] || 0) + 1;
    return this.deaths[deathId];
  };

  GameState.prototype.deathCount = function (deathId) {
    return this.deaths[deathId] || 0;
  };

  /** 플래그 설정 */
  GameState.prototype.set = function (key, value) {
    this.flags[key] = (value === undefined) ? true : value;
    return this;
  };

  GameState.prototype.get = function (key, fallback) {
    return Object.prototype.hasOwnProperty.call(this.flags, key)
      ? this.flags[key]
      : (fallback === undefined ? null : fallback);
  };

  /** 참(truthy) 여부 — 조건식에서 가장 많이 쓰는 형태 */
  GameState.prototype.has = function (key) {
    return !!this.flags[key];
  };

  /** 숫자 플래그 누적 (예: 전투 우선 선택 횟수) */
  GameState.prototype.bump = function (key, delta) {
    var n = Number(this.flags[key] || 0) + (delta === undefined ? 1 : delta);
    this.flags[key] = n;
    return n;
  };

  /** 여러 플래그를 한 번에 적용 — 시나리오 데이터의 set 필드 처리용 */
  GameState.prototype.apply = function (patch) {
    if (!patch) return this;
    for (var key in patch) {
      if (Object.prototype.hasOwnProperty.call(patch, key)) {
        this.set(key, patch[key]);
      }
    }
    return this;
  };

  GameState.prototype.visit = function (nodeId) {
    this.visited[nodeId] = true;
    return this;
  };

  GameState.prototype.isVisited = function (nodeId) {
    return !!this.visited[nodeId];
  };

  /**
   * 획득한 단서 개수.
   * 규칙: 'clue_' 로 시작하는 truthy 플래그만 단서로 센다.
   * (근거: 성향/카운터 플래그와 구분하기 위한 명명 규칙. 데이터 작성 시 반드시 준수)
   */
  GameState.prototype.clueCount = function () {
    var n = 0;
    for (var key in this.flags) {
      if (key.indexOf('clue_') === 0 && this.flags[key]) n++;
    }
    return n;
  };

  /* ── 즉사 복귀 지점 ───────────────────────────────── */

  /** 이 노드를 복귀 지점으로 삼는다 (선택지 노드 진입 직전에 호출) */
  GameState.prototype.mark = function (nodeId) {
    this.mark_ = {
      nodeId: nodeId,
      flags: shallow(this.flags),
      visited: shallow(this.visited),
      backlogLength: this.backlog.length
    };
    return this;
  };

  /**
   * 복귀 지점으로 상태를 되돌리고 그 노드 id 를 반환한다.
   * 죽은 뒤에 얻은 플래그와 그 사이에 쌓인 대사는 함께 되돌린다 —
   * 그렇지 않으면 죽어서 알게 된 정보로 다시 도전하는 셈이 되어 긴장이 사라진다.
   */
  GameState.prototype.rewind = function () {
    if (!this.mark_) return null;
    var mark = this.mark_;
    this.flags = shallow(mark.flags);
    this.visited = shallow(mark.visited);
    this.backlog = this.backlog.slice(0, mark.backlogLength);
    this.lineIndex = 0;
    return mark.nodeId;
  };

  /** 플래그·방문 기록은 한 겹 객체이므로 얕은 복사로 충분하다 */
  function shallow(src) {
    var out = {};
    for (var key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) out[key] = src[key];
    }
    return out;
  }

  /** 저장용 직렬화 */
  GameState.prototype.toJSON = function () {
    return {
      chapterId: this.chapterId,
      nodeId: this.nodeId,
      lineIndex: this.lineIndex,
      flags: this.flags,
      visited: this.visited,
      backlog: this.backlog,
      mark: this.mark_,
      deaths: this.deaths
    };
  };

  GameState.prototype.load = function (data) {
    if (!data) return this;
    this.chapterId = data.chapterId || null;
    this.nodeId = data.nodeId || null;
    this.lineIndex = data.lineIndex || 0;
    this.flags = data.flags || {};
    this.visited = data.visited || {};
    this.backlog = data.backlog || [];
    this.mark_ = data.mark || null;   // 불러온 뒤에 죽어도 복귀 지점이 살아 있어야 한다
    this.deaths = data.deaths || {};
    return this;
  };

  Game.GameState = GameState;
})(this);
