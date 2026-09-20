/*
 * 「야사록」 해금 판정 (순수 로직 — DOM 참조 없음)
 *
 * 해금 규칙은 단순하다: 해당 챕터를 클리어하면 그 챕터의 카드가 전부 열린다.
 * 인물 도감의 '진상'과 달리 엔딩 종류를 가리지 않는다 —
 * 야사록은 고증 해설이지 이야기의 반전이 아니므로, 배드 엔딩으로 끝내도 열려야 한다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var Yasarok = {
    /**
     * 챕터 클리어 시점에 호출. 새로 열린 카드 목록을 반환한다.
     * (엔딩 화면에서 "야사록 n장 해금"을 알리는 데 쓴다)
     */
    unlockChapter: function (chapterId) {
      var cards = Game.yasarokFor(chapterId);
      var opened = [];
      for (var i = 0; i < cards.length; i++) {
        if (Game.Save.unlockYasarok(cards[i].id)) opened.push(cards[i]);
      }
      return opened;
    },

    /** 전체 카드 목록 + 해금 여부. 잠긴 카드도 자리는 보여준다(수집 욕구) */
    list: function () {
      var seen = Game.Save.yasarok();
      var out = [];
      for (var i = 0; i < Game.YasarokCards.length; i++) {
        var card = Game.YasarokCards[i];
        out.push({ card: card, unlocked: seen.indexOf(card.id) !== -1 });
      }
      return out;
    },

    counts: function () {
      return { open: Game.Save.yasarok().length, total: Game.YasarokCards.length };
    }
  };

  Game.Yasarok = Yasarok;
})(this);
