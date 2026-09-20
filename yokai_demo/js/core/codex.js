/*
 * 인물 도감 해금 판정 (순수 로직 — DOM 참조 없음)
 *
 * 노드에 들어갈 때마다 check() 를 불러 그 노드로 열리는 인물이 있는지 확인한다.
 * 해금 기록은 진행 슬롯과 별도로 저장되므로 새로 시작해도 유지된다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var Codex;

  Codex = {
    /**
     * 해당 노드 방문으로 새로 열린 인물 목록을 반환한다.
     * 반환: [{ id, name }] — 화면에 "인물 도감에 ○○이 추가되었습니다" 알림을 띄우는 데 쓴다.
     */
    check: function (nodeId) {
      var opened = [];
      for (var i = 0; i < Game.CodexEntries.length; i++) {
        var entry = Game.CodexEntries[i];
        if (!entry.revealAt || entry.revealAt.indexOf(nodeId) === -1) continue;
        if (Game.Save.unlockCodex(entry.id)) {
          opened.push({ id: entry.id, name: entry.name });
        }
      }
      return opened;
    },

    /**
     * 진상(secret) 공개 조건 판정.
     * secretWhen 은 엔딩 id 하나 또는 여러 개(배열)를 받는다.
     * 인물마다 진상이 밝혀지는 엔딩이 다를 수 있으므로(대체로 굿 엔딩) 인물별로 지정한다.
     */
    isSecretOpen: function (entry) {
      if (!entry.secret) return false;
      if (!entry.secretWhen) return false;   // 조건이 없으면 열지 않는다 (안전한 기본값)

      var need = [].concat(entry.secretWhen);
      var seen = Game.Save.unlocked();
      for (var i = 0; i < need.length; i++) {
        if (seen.indexOf(need[i]) !== -1) return true;
      }
      return false;
    },

    /**
     * 도감 화면에 뿌릴 목록.
     * 잠긴 인물도 자리만 남겨 수집 요소를 드러낸다(내용은 감춘다).
     *
     * 주의: 진상이 아직 잠긴 인물을 개별적으로 표시하지 않는다.
     * "이 인물에게 숨겨진 이야기가 있다"는 표시 자체가 사건의 핵심 인물을 지목하는
     * 스포일러가 되기 때문이다. 대신 도감 화면 하단에 인물을 특정하지 않는 안내만 둔다.
     */
    list: function () {
      var unlocked = Game.Save.codex();
      var out = [];

      for (var i = 0; i < Game.CodexEntries.length; i++) {
        var entry = Game.CodexEntries[i];
        var isOpen = unlocked.indexOf(entry.id) !== -1;
        out.push({
          entry: entry,
          unlocked: isOpen,
          secret: (isOpen && Codex.isSecretOpen(entry)) ? entry.secret : null
        });
      }
      return out;
    },

    /**
     * 아직 열리지 않은 진상이 하나라도 있는가.
     * 인물을 특정하지 않는 하단 안내문을 띄울지 판단하는 데만 쓴다.
     */
    hasLockedSecrets: function () {
      for (var i = 0; i < Game.CodexEntries.length; i++) {
        var entry = Game.CodexEntries[i];
        if (entry.secret && !Codex.isSecretOpen(entry)) return true;
      }
      return false;
    },

    /** id 로 도감 항목 찾기 */
    find: function (id) {
      for (var i = 0; i < Game.CodexEntries.length; i++) {
        if (Game.CodexEntries[i].id === id) return Game.CodexEntries[i];
      }
      return null;
    },

    /**
     * 대사 화자에 해당하는 초상 경로 (없으면 null).
     * 도감 해금 여부와 무관하다 — 눈앞에 있는 사람의 얼굴은 그대로 보여준다.
     *
     * 도감 항목이 있으면 그 항목의 초상 지정을 따른다.
     * 전용 초상이 없어 엑스트라를 빌려 쓰는 인물(허준 등)과, 초상을 두지 않는 인물
     * (그슨대·검은 갓의 사내)을 데이터 한 곳에서 관리하기 위한 우회다.
     */
    portraitForSpeaker: function (who) {
      if (!who) return null;
      var id = Game.SpeakerPortraits[who];
      if (!id) return null;

      var entry = Codex.find(id);
      if (entry) return Game.Assets.portraitOf(entry);
      return Game.Assets.portrait(id);
    },

    counts: function () {
      var unlocked = Game.Save.codex();
      return { open: unlocked.length, total: Game.CodexEntries.length };
    }
  };

  Game.Codex = Codex;
})(this);
