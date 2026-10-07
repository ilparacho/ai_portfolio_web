/*
 * 1부 「시집가지 못한 혼(魂)」 — 이름 붙은 판정(로직)
 *
 * 대본 시트(대본/1부_시집가지못한혼.xlsx)에서 «@이름» 으로 부른다. 칸 규칙은 data/chapter2_logic.js 머리글과 같다.
 *   kind: 'cond'(조건 칸) · 'route'(이동 칸, targets 에 가능한 목적지를 모두 적는다) · 'speaker' · 'face'
 *
 * ── 1부의 구조 (옛 chapter1.js 머리글에서 옮김) ───────────────────────
 *  1) 시점은 1611년(광해 3) 초겨울. 종전(1598)으로부터 13년 뒤다. 무대는 이름 없는 고을이다(고유 지명을 만들지 않는다).
 *  2) 프롤로그에서 가문 몰락의 시점·장소를 밝히지 않는다 — 그 밤이 "붉은 기운이 일던 밤"임은 2부 프롤로그에서 드러난다.
 *  3) 사건의 근본 동기는 전란 후 문서 소실로 인한 재산·혼사 분쟁. 혼서와 예물 문기가 불탔고,
 *     숙부는 "그런 문서는 없었다"로 예물을 가로챘다.
 *  4) 좌도는 유파가 아니라 죄목이다. 1부에서는 설명하지 않고 아전의 태도와 신은호가 이름을 대지 않는 행동으로만 보여준다.
 *  5) 'clue_' 접두어가 붙은 플래그만 HUD 단서 개수에 집계된다(state.clueCount).
 *
 * 이 파일은 대본 시트에서 생성되지 않는다. 손으로 고치고, 고친 뒤 node tools/script-build.mjs 로 다시 검사한다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  Game.ScriptLogic = Game.ScriptLogic || {};

  Game.ScriptLogic.ch1 = {
    '단서둘이상': {
      kind: 'cond',
      desc: '켜진 단서(clue_ 로 시작하는 플래그)가 두 개 이상 — 사람을 추궁하러 갈 수 있다',
      fn: function (s) { return s.clueCount() >= 2; }
    },
    '전투반복': {
      kind: 'route',
      desc: '«전투 우선» 을 두 번 반복하면(combat_first ≥ 2) 진상에 닿지 못한 채 강제 봉인 — 배드 엔딩 B. 한 번이면 다시 사당 앞 선택으로',
      targets: ['e_bad_b', 'b2_choice_2'],
      fn: function (s) { return (s.get('combat_first', 0) >= 2) ? 'e_bad_b' : 'b2_choice_2'; }
    },
    '숙부지목': {
      kind: 'route',
      /*
       * 확증 조건 — 지목이 옳아도 증좌가 없으면 한이 풀리지 않는다.
       *  (가) 박 서방의 실토: 혼수를 돌린 것이 숙부라는 증언 자체가 물증이 된다(found_uncle)
       *  (나) 손각시의 증언 + 빈 혼수함: 증언만으로는 관에 내놓을 수 없고,
       *       "숨이 있는 동안 물건이 빠져나갔다"는 물증(함의 흔적)이 함께 있어야 성립
       */
      desc: '숙부를 지목했을 때 — 박 서방의 실토(found_uncle), 또는 손각시의 증언(found_hansu)+사당의 빈 예물함(found_shrine)이 있으면 굿 엔딩, 없으면 배드 엔딩 A2(증좌 없는 이름)',
      targets: ['gd_01', 'e_bad_a2'],
      fn: function (s) {
        /*
         * 증좌첩 6점(부록 A-1)에 없는 판정용 사실은 clue_ 가 아니라 found_ 로 부른다(clue_ = 증좌첩 항목, 7.13.9).
         * 대본 초안 승인(2026-10-07)으로 게임 데이터가 found_* 만 켜므로 과도기의 옛 이름(clue_*) 읽기는 지웠다.
         */
        var has = function (k) { return s.has('found_' + k); };
        var proven = has('uncle') || (has('hansu') && has('shrine'));
        return proven ? 'gd_01' : 'e_bad_a2';
      }
    }
  };
})(this);
