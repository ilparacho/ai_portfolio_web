/*
 * 저장 / 불러오기 (localStorage)
 *
 * 네 갈래로 분리해 보관한다.
 *  - 진행 슬롯 : 플레이 중인 상태 (챕터 + 노드 + 플래그). 새로 시작하면 덮어쓴다.
 *  - 진행 기록 : 챕터별 상태(진행중 / 클리어). 챕터 선택 화면의 노출 규칙에 쓰인다.
 *  - 해금 기록 : 확인한 엔딩 / 인물 도감 / 야사록 / 감상한 BGM. 새로 시작해도 남는다.
 *  - 환경 설정 : 음량 단계, 화면 연출 강도 등.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var KEY_SLOT = 'jy_save_v1';
  var KEY_UNLOCK = 'jy_unlocked_v1';
  var KEY_PREF = 'jy_pref_v1';
  var KEY_PROGRESS = 'jy_progress_v1';
  var KEY_CODEX = 'jy_codex_v1';
  var KEY_TRACKS = 'jy_tracks_v1';
  var KEY_YASAROK = 'jy_yasarok_v1';
  var KEY_JEUNGJWA_SEEN = 'jy_jeungjwa_seen_v1';
  var KEY_REVEALED = 'jy_revealed_v1';

  /** localStorage 사용 가능 여부 — file:// 나 시크릿 모드에서 막힐 수 있어 방어한다 */
  function available() {
    try {
      global.localStorage.setItem('__jy_test', '1');
      global.localStorage.removeItem('__jy_test');
      return true;
    } catch (e) {
      return false;
    }
  }

  function readJson(key, fallback) {
    if (!available()) return fallback;
    try {
      var raw = global.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    if (!available()) return false;
    try {
      global.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  }

  /** 목록형 해금 기록에 항목 추가 (중복 방지). 새로 들어갔으면 true */
  function pushUnique(key, value) {
    if (!value) return false;
    var list = readJson(key, []);
    if (list.indexOf(value) !== -1) return false;
    list.push(value);
    writeJson(key, list);
    return true;
  }

  var Save = {
    available: available,

    /* ── 진행 슬롯 ─────────────────────────────── */
    save: function (state) {
      var data = state.toJSON();
      data.savedAt = Date.now();      // 불러오기 화면에 실제 저장 일시를 보여준다(풀기획서 7.10.2)
      return writeJson(KEY_SLOT, data);
    },

    load: function () {
      return readJson(KEY_SLOT, null);
    },

    hasSave: function () {
      return !!Save.load();
    },

    clear: function () {
      if (available()) global.localStorage.removeItem(KEY_SLOT);
    },

    /* ── 챕터별 진행 기록 ──────────────────────── */
    /** { ch1: { status: 'playing' | 'cleared', endings: [...] } } */
    progress: function () {
      return readJson(KEY_PROGRESS, {});
    },

    /** 챕터를 시작했음을 기록 (이미 클리어한 챕터의 상태는 낮추지 않는다) */
    markPlaying: function (chapterId) {
      if (!chapterId) return;
      var all = Save.progress();
      var entry = all[chapterId] || { status: 'playing', endings: [] };
      if (entry.status !== 'cleared') entry.status = 'playing';
      all[chapterId] = entry;
      writeJson(KEY_PROGRESS, all);
    },

    /** 챕터 클리어 기록 — 엔딩 종류도 함께 누적한다 */
    markCleared: function (chapterId, endingId) {
      if (!chapterId) return;
      var all = Save.progress();
      var entry = all[chapterId] || { status: 'cleared', endings: [] };
      entry.status = 'cleared';
      if (endingId && entry.endings.indexOf(endingId) === -1) entry.endings.push(endingId);
      all[chapterId] = entry;
      writeJson(KEY_PROGRESS, all);
    },

    chapterStatus: function (chapterId) {
      var entry = Save.progress()[chapterId];
      return entry ? entry.status : 'unstarted';
    },

    /* ── 해금 기록 ─────────────────────────────── */
    unlocked: function () {
      return readJson(KEY_UNLOCK, []);
    },

    unlock: function (endingId) {
      pushUnique(KEY_UNLOCK, endingId);
    },

    codex: function () {
      return readJson(KEY_CODEX, []);
    },

    /** 새로 열린 도감이면 true */
    unlockCodex: function (entryId) {
      return pushUnique(KEY_CODEX, entryId);
    },

    tracks: function () {
      return readJson(KEY_TRACKS, []);
    },

    unlockTrack: function (trackKey) {
      return pushUnique(KEY_TRACKS, trackKey);
    },

    yasarok: function () {
      return readJson(KEY_YASAROK, []);
    },

    /** 새로 열린 야사록 카드면 true */
    unlockYasarok: function (cardId) {
      return pushUnique(KEY_YASAROK, cardId);
    },

    /* ── 은닉된 장의 노출 기록 (5부) ───────────── */
    revealed: function () {
      return readJson(KEY_REVEALED, []);
    },

    isRevealed: function (chapterId) {
      return Save.revealed().indexOf(chapterId) !== -1;
    },

    /** 은닉된 장을 영구히 드러낸다 — 이후 새 회차에서도 다시 숨기지 않는다(7.12.6). 새로 드러났으면 true */
    reveal: function (chapterId) {
      return pushUnique(KEY_REVEALED, chapterId);
    },

    /* ── 증좌첩 열람 기록 ──────────────────────── */
    seenJeungjwa: function () {
      return readJson(KEY_JEUNGJWA_SEEN, []);
    },

    /** 항목을 펼쳐 읽었음을 기록 — 새로 읽은 것이면 true */
    markJeungjwaSeen: function (id) {
      return pushUnique(KEY_JEUNGJWA_SEEN, id);
    },

    /* ── 환경 설정 (음량 등) ───────────────────── */
    getPref: function (key, fallback) {
      var prefs = readJson(KEY_PREF, {});
      return Object.prototype.hasOwnProperty.call(prefs, key) ? prefs[key] : fallback;
    },

    setPref: function (key, value) {
      var prefs = readJson(KEY_PREF, {});
      prefs[key] = value;
      writeJson(KEY_PREF, prefs);
    }
  };

  Game.Save = Save;
})(this);
