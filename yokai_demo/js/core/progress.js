/*
 * 챕터 노출 / 잠금 판정 (순수 로직 — DOM 참조 없음)
 *
 * 노출 규칙 (요구사항)
 *  - 진행한 적 없는 챕터는 노출하지 않는다.
 *  - 단, '바로 다음 챕터' 하나만은 잠금(블러) 상태로 노출해 다음이 있음을 알린다.
 *  - 진행 중인 챕터는 '진행중' 표시.
 *
 * 잠금 사유는 두 가지로 구분한다.
 *  prev : 앞 챕터를 아직 클리어하지 않음
 *  wip  : 시나리오가 아직 준비되지 않음 (playable: false)
 *  demo : 체험판(data/release.js)이라 열지 않는 장
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var Progress = {
    /**
     * 챕터 선택 화면에 뿌릴 목록을 만든다.
     * 반환: [{ chapter, status, locked, lockReason, endings, isNext }]
     *   status: 'cleared' | 'playing' | 'unstarted'
     */
    list: function () {
      var saved = Game.Save.progress();
      var slot = Game.Save.load();
      var out = [];

      for (var i = 0; i < Game.Chapters.length; i++) {
        var chapter = Game.Chapters[i];
        // 은닉된 장(5부)은 잠긴 카드로도 보이지 않는다 — 노출되기 전까지는 슬롯 자체가 없다
        if (chapter.secret && !Game.Save.isRevealed(chapter.id)) break;
        var entry = saved[chapter.id];
        var status = entry ? entry.status : 'unstarted';
        var started = !!entry;

        // 앞 챕터를 클리어했는지 (첫 챕터는 항상 해금)
        var prevCleared = (i === 0) ||
          (saved[Game.Chapters[i - 1].id] || {}).status === 'cleared';
        var allowed = Game.Release ? Game.Release.allows(chapter.id) : true;
        var unlocked = prevCleared && chapter.playable && allowed;

        if (!started && !unlocked) {
          // 첫 번째 '아직 못 가는 챕터' 하나만 잠금으로 노출하고, 그 뒤는 전부 숨긴다
          out.push({
            chapter: chapter,
            status: 'unstarted',
            locked: true,
            lockReason: !chapter.playable ? 'wip' : (!allowed ? 'demo' : 'prev'),
            endings: [],
            isNext: true,
            resumable: false
          });
          break;
        }

        var endings = (entry && entry.endings) || [];
        var totals = Progress.endingInfo(chapter, endings);
        var ya = Progress.yasarokInfo(chapter.id);

        out.push({
          chapter: chapter,
          status: status,
          locked: false,
          lockReason: null,
          endings: endings,
          // 카드 표시용 수집 현황 — 부별로만 센다(전체 합계는 5부 은닉과 충돌, 풀기획서 7.12.3)
          endingSeen: totals.seen,
          endingTotal: totals.total,
          trueCleared: totals.trueSeen,
          yasarokOpen: ya.open,
          yasarokTotal: ya.total,
          isNext: false,
          // 진행 슬롯이 이 챕터를 가리키면 '이어하기' 가능
          resumable: !!(slot && slot.chapterId === chapter.id && status === 'playing')
        });
      }
      return out;
    },

    /**
     * 한 장의 엔딩 수집 현황. 같은 id 는 한 번만 센다.
     *  seen / total : 본 엔딩 / 전체 (시나리오가 없으면 total 0)
     *  trueSeen     : kind 가 'true'(진엔딩)인 엔딩을 봤는가 — 카드 테두리 표식이 달라진다
     */
    endingInfo: function (chapter, seenIds) {
      var script = Game.chapterScript(chapter);
      var kinds = {};
      if (script) {
        for (var id in script.nodes) {
          var ending = script.nodes[id].ending;
          if (ending) kinds[ending.id] = ending.kind || 'normal';
        }
      }
      var total = 0, seen = 0, trueSeen = false;
      for (var key in kinds) {
        total++;
        if (seenIds.indexOf(key) !== -1) {
          seen++;
          if (kinds[key] === 'true') trueSeen = true;
        }
      }
      return { seen: seen, total: total, trueSeen: trueSeen };
    },

    /** 한 장의 야사록 수집 현황 (해금 / 전체) */
    yasarokInfo: function (chapterId) {
      var cards = Game.yasarokFor ? Game.yasarokFor(chapterId) : [];
      var have = Game.Save.yasarok();
      var open = 0;
      for (var i = 0; i < cards.length; i++) {
        if (have.indexOf(cards[i].id) !== -1) open++;
      }
      return { open: open, total: cards.length };
    },

    /**
     * 불러오기 화면의 저장 슬롯 정보. 저장이 없으면 null.
     *  bgKey  : 저장 시점 노드의 배경 — 썸네일로 쓴다
     *  scene  : 장면명 («어의 허준의 검안소»). 배경 라벨에서 표기 꼬리를 걷어낸다
     *  stage  : '초반' | '중반' | '후반' — 퍼센트로 보이면 «얼마나 남았나»를 계산하게 되어 서스펜스가 준다
     */
    slotInfo: function () {
      var slot = Game.Save.load();
      if (!slot || !slot.chapterId) return null;
      var chapter = Game.findChapter(slot.chapterId);
      var script = Game.chapterScript(chapter);
      if (!chapter || !script) return null;

      var node = script.nodes[slot.nodeId] || null;
      var bgKey = node ? node.bg : null;
      var art = bgKey ? Game.Assets.image(bgKey) : null;
      var scene = art
        ? art.label.replace(/^\[[^\]]*\]\s*/, '').replace(/\s*\([^)]*\)\s*$/, '')
        : '';

      // 방문한 노드 수 ÷ 한 번의 통플레이가 밟는 노드 수(전체의 약 55%)로 가늠한다
      var total = 0, seen = 0, k;
      for (k in script.nodes) total++;
      for (k in (slot.visited || {})) if (k.indexOf('#') === -1) seen++;
      var ratio = total ? seen / (total * 0.55) : 0;
      var stage = ratio < 0.34 ? '초반' : (ratio < 0.67 ? '중반' : '후반');

      return {
        chapterId: chapter.id,
        chapter: chapter,
        bgKey: bgKey,
        scene: scene,
        savedAt: slot.savedAt || null,
        stage: stage
      };
    },

    /** 이어할 챕터 id (저장 슬롯 기준) */
    resumeChapterId: function () {
      var slot = Game.Save.load();
      return slot ? (slot.chapterId || 'ch1') : null;
    },

    /**
     * 챕터를 끝낸 직후의 «해금 화면» 정보 (풀기획서 v4.4 7.9 · 7.12항).
     *
     * wasCleared : 이번 클리어 «이전»에 이미 클리어한 장이었는가 (Save.markCleared 호출 전에 확인해 넘긴다)
     * endingKind : 방금 본 엔딩의 kind ('good' | 'bad' | 'true' | 'normal')
     *
     * 반환
     *   { hidden: true }                       — 해금 화면 없음 (배드로 끝난 4부 → 5부는 열리지 않는다)
     *   { again: true }                        — 이미 다녀온 길. 장 선택 버튼만 노출
     *   { final: true }                        — 마지막 장. 엔딩 수집 현황을 함께 보인다
     *   { next, playable, bad }                — 다음 부가 열렸다. bad 면 문구가 달라진다
     */
    unlockInfo: function (chapterId, endingKind, wasCleared) {
      var idx = -1;
      for (var i = 0; i < Game.Chapters.length; i++) {
        if (Game.Chapters[i].id === chapterId) idx = i;
      }
      if (idx === -1) return { hidden: true };

      var next = Game.Chapters[idx + 1] || null;
      if (!next) return { final: true };

      // 은닉된 다음 장: 굿/진엔딩에서만 열린다. 배드엔딩은 «진짜 끝처럼» 닫는다.
      if (next.secret) {
        if (endingKind === 'bad') return { hidden: true };
        Game.Save.reveal(next.id);
      }
      if (wasCleared) return { again: true };

      return { next: next, playable: !!next.playable, bad: endingKind === 'bad' };
    },

    /** 플레이 가능한 첫 챕터 — '게임 시작' 이 향할 곳 */
    firstPlayable: function () {
      for (var i = 0; i < Game.Chapters.length; i++) {
        if (Game.Chapters[i].playable) return Game.Chapters[i];
      }
      return null;
    }
  };

  Game.Progress = Progress;
})(this);
