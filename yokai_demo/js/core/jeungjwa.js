/*
 * 「증좌첩(證左帖)」 판정 로직 (순수 로직 — DOM 참조 없음)
 *
 * data/jeungjwa.js 의 항목 정의와 현재 GameState 의 플래그를 대조해
 * "지금 열람 가능한 항목"만 골라낸다. 그리는 것은 js/ui/menu.js 의 몫이다.
 *
 * 근거: 기획서/요괴문초_풀기획서_v4.4.md 7.13.9항
 *   "기존 clue_ 접두어 플래그가 그대로 증좌첩 항목 ID가 된다.
 *    플래그 하나당 항목 하나. 추가 데이터(본문·소견·이미지)만 붙이면 된다."
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var Jeungjwa = {
    /**
     * 이 장에서 지금까지 얻은 물(物) 항목 목록.
     * 반환: [{ def, isNew }] — def 는 data/jeungjwa.js 의 항목 그대로, isNew 는 아직 안 읽었으면 true.
     * state 가 없으면(진행 중인 장이 없으면) 빈 배열을 돌려준다.
     */
    items: function (chapterId, state) {
      var defs = (Game.JeungjwaItems && Game.JeungjwaItems[chapterId]) || [];
      if (!state) return [];

      var seen = Game.Save.seenJeungjwa();
      var out = [];
      for (var i = 0; i < defs.length; i++) {
        var def = defs[i];
        if (!state.has(def.id)) continue;   // 아직 해당 clue_ 플래그가 서지 않았다 — 미해금
        out.push({ def: def, isNew: seen.indexOf(def.id) === -1 });
      }
      return out;
    },

    /** id 로 정의 하나를 바로 찾는다 (대조 화면에서 선택된 두 항목을 그릴 때 씀) */
    find: function (chapterId, id) {
      var defs = (Game.JeungjwaItems && Game.JeungjwaItems[chapterId]) || [];
      for (var i = 0; i < defs.length; i++) {
        if (defs[i].id === id) return defs[i];
      }
      return null;
    },

    /** 항목을 펼쳐 읽었음을 기록한다 — 다음부터는 "새로 얻음" 표시가 빠진다 */
    markSeen: function (id) {
      return Game.Save.markJeungjwaSeen(id);
    }
  };

  Game.Jeungjwa = Jeungjwa;
})(this);
