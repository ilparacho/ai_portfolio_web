/*
 * BGM 재생 담당 (UI 계층)
 *
 * - 트랙 하나만 루프 재생한다. 같은 트랙이 요청되면 재생을 끊지 않는다.
 * - 음량은 0~5단계. 0단계가 곧 음소거이며, 단계는 저장해 다음 실행에도 유지한다.
 * - 브라우저 자동재생 정책상 사용자 조작 전에는 재생이 거부될 수 있다.
 *   거부되면 첫 클릭/키 입력 때 한 번 더 시도한다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  var doc = global.document;

  var MAX_LEVEL = 5;
  var DEFAULT_LEVEL = 3;

  /*
   * 단계별 실제 음량.
   * 근거: 대사를 읽는 화면이므로 상단 단계도 0.72 이하로 묶어 낭독을 방해하지 않게 한다.
   * (index 0 = 꺼짐)
   */
  var LEVELS = [0, 0.08, 0.18, 0.32, 0.50, 0.72];

  var FADE_MS = 240;     // 트랙 교체 시 짧은 페이드

  var audio = null;
  var currentKey = null;
  var level = DEFAULT_LEVEL;
  var fadeTimer = null;
  var waitingForGesture = false;
  var onStateChange = null;

  function targetVolume() {
    return LEVELS[level];
  }

  function fade(to, done) {
    if (fadeTimer) global.clearInterval(fadeTimer);
    var steps = 8;
    var from = audio.volume;
    var delta = (to - from) / steps;
    var i = 0;
    fadeTimer = global.setInterval(function () {
      i++;
      audio.volume = Math.max(0, Math.min(1, from + delta * i));
      if (i >= steps) {
        global.clearInterval(fadeTimer);
        fadeTimer = null;
        if (done) done();
      }
    }, FADE_MS / steps);
  }

  /** 재생 시도 — 자동재생이 막히면 다음 사용자 조작까지 대기 */
  function attemptPlay() {
    var promise = audio.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () { armGesture(); });
    }
  }

  function armGesture() {
    if (waitingForGesture) return;
    waitingForGesture = true;
    notify();

    var resume = function () {
      doc.removeEventListener('click', resume, true);
      doc.removeEventListener('keydown', resume, true);
      waitingForGesture = false;
      if (level > 0 && currentKey) {
        audio.play().catch(function () { /* 재차 실패는 무시 */ });
      }
      notify();
    };
    doc.addEventListener('click', resume, true);
    doc.addEventListener('keydown', resume, true);
  }

  function notify() {
    if (onStateChange) onStateChange(Audio.status());
  }

  var Audio = {
    init: function (statusCallback) {
      onStateChange = statusCallback || null;

      audio = doc.createElement('audio');
      audio.loop = true;
      audio.preload = 'auto';
      audio.volume = 0;
      audio.style.display = 'none';
      doc.body.appendChild(audio);

      // 이전 버전의 음소거 설정(muted)을 단계 체계로 옮긴다
      var saved = Game.Save.getPref('bgmLevel', null);
      if (saved === null) {
        level = Game.Save.getPref('muted', false) === true ? 0 : DEFAULT_LEVEL;
      } else {
        level = Math.max(0, Math.min(MAX_LEVEL, Number(saved)));
      }

      notify();
      return Audio;
    },

    /** 트랙 전환. 같은 트랙이면 아무것도 하지 않는다. */
    play: function (key) {
      if (!audio || !key || key === currentKey) return;

      var track = Game.Assets.track(key);
      if (!track) return;

      // 한 번 들은 곡은 BGM 감상실에 열어준다
      Game.Save.unlockTrack(key);

      var start = function () {
        currentKey = key;
        audio.src = track.url;
        audio.volume = 0;
        if (level === 0) return;    // 꺼진 상태면 src 만 걸어두고 재생하지 않는다
        attemptPlay();
        fade(targetVolume());
      };

      if (currentKey && audio.volume > 0) {
        fade(0, start);             // 이전 트랙을 짧게 내린 뒤 교체
      } else {
        start();
      }
    },

    stop: function () {
      if (!audio) return;
      audio.pause();
      currentKey = null;
    },

    /** 음량 단계 설정 (0~5). 0에서 올리면 재생을 재개한다. */
    setLevel: function (next) {
      var clamped = Math.max(0, Math.min(MAX_LEVEL, next));
      var wasOff = (level === 0);
      level = clamped;
      Game.Save.setPref('bgmLevel', level);

      if (level === 0) {
        if (fadeTimer) global.clearInterval(fadeTimer);
        audio.pause();
        audio.volume = 0;
      } else if (currentKey) {
        if (wasOff) attemptPlay();
        fade(targetVolume());
      }
      notify();
      return level;
    },

    nudge: function (delta) {
      return Audio.setLevel(level + delta);
    },

    /** 0단계 ↔ 이전 단계 토글 */
    toggleMute: function () {
      if (level > 0) {
        Game.Save.setPref('bgmLevelBeforeMute', level);
        return Audio.setLevel(0);
      }
      return Audio.setLevel(Game.Save.getPref('bgmLevelBeforeMute', DEFAULT_LEVEL));
    },

    status: function () {
      return {
        level: level,
        max: MAX_LEVEL,
        waiting: waitingForGesture,
        trackKey: currentKey
      };
    },

    /** 설정 화면 등에서 쓰는 짧은 음량 표기 */
    label: function () {
      return level === 0 ? '꺼짐' : (level + ' / ' + MAX_LEVEL);
    }
  };

  Game.Audio = Audio;
})(this);
