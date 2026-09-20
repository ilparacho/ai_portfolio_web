/*
 * 「빚」 — 강문우 채무 (순수 로직 — DOM 참조 없음)
 *
 * 근거: 풀기획서 v4.4 7.11항, 02_UI시스템_구현명세_v1.5 4장
 *
 * ── 원칙 ────────────────────────────────────────────────────
 *  - 수치를 HUD 에 노출하지 않는다. 강문우의 태도로만 드러낸다.
 *  - 빚은 벌점이 아니라 거래다. 막힌 플레이어에게 길을 열어주되 최고 등급은 포기하게 한다.
 *  - 최소 2회는 빚을 져도 굿엔딩에 닿아야 한다(정의상 2단계는 «진엔딩 차단»일 뿐 굿엔딩은 열려 있다).
 *  - 3단계는 의도적으로 계속 기대야 닿는다 — 실수로 닿지 않는 선을 유지한다.
 *
 * 빚은 상태 플래그('debt')에 담기므로 저장·즉사 복귀와 자동으로 함께 움직인다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var KEY = 'debt';
  var MAX_LEVEL = 3;

  /** 획득 경로별 가중치 (기획서 7.11항 표) */
  var COST = {
    HAND: 2,        // 분기점 ⑤에서 강문우의 손을 잡고 나감
    BUY_RING: 1,    // 「문초」 고리를 강문우에게서 구매
    HELP: 1         // 중간 조력 요청(선택적, 1회)
  };

  /** 단계별 강문우의 태도 — 시나리오 작성자가 대사를 고를 때 참고하는 기준 */
  var ATTITUDE = [
    '무심하다. 신은호를 이름으로 부르지 않는다',
    '처음으로 이름을 부른다. 말투가 조금 친근해진다',
    '웃는다. 부탁을 하나 한다',
    '아무 말도 하지 않는다. 그저 따라온다'
  ];

  var Debt = {
    COST: COST,
    ATTITUDE: ATTITUDE,

    /** 누적 빚 (0 이상의 정수) */
    raw: function (state) {
      return Number(state.get(KEY, 0)) || 0;
    },

    /** 단계 0~3 — 3 이상은 모두 3 */
    level: function (state) {
      return Math.min(MAX_LEVEL, Debt.raw(state));
    },

    /** 빚을 진다. 새 누적값을 돌려준다 */
    add: function (state, amount) {
      return state.bump(KEY, amount === undefined ? 1 : amount);
    },

    /** 2단계부터 진엔딩 경로가 막힌다 (굿엔딩까지만 가능) */
    blocksTrueEnding: function (state) {
      return Debt.level(state) >= 2;
    },

    /** 3단계는 클라이맥스를 통과해도 배드 엔딩 D「빚」으로 고정된다 */
    forcesBadEnding: function (state) {
      return Debt.level(state) >= MAX_LEVEL;
    },

    /** 2단계에서 후반 조사에 한 번 개입해 선택지 하나를 대신 골라버리는가 */
    intervenes: function (state) {
      return Debt.level(state) === 2;
    },

    /** 현재 단계의 태도 설명 (시나리오·테스트용) */
    attitude: function (state) {
      return ATTITUDE[Debt.level(state)];
    }
  };

  Game.Debt = Debt;
})(this);
