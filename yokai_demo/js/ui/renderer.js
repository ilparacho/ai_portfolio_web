/*
 * 화면 출력 담당 (UI 전용)
 *
 * 이 파일은 게임 규칙을 판단하지 않는다. 넘겨받은 것만 그린다.
 *
 * 출력 방식 (카마이타치의 밤 스타일)
 *  - 기본: 클릭할 때마다 한 줄씩 즉시 스태킹 (한 노드의 대사를 몰아서 뿌리지 않는다)
 *  - 강조가 필요한 줄에는 데이터에서 cls 로 색·크기를 지정
 *  - 긴장 구간의 줄에는 slow: true 를 주면 글자 단위로 느리게 나타난다
 *
 * 대사 안의 구간 강조 마크업
 *  **강조**   → 금박 색 + 굵게
 *  !!큰글씨!! → 크게 + 붉은색
 * 마크업은 DOM 노드로 분해해 textContent 로만 넣는다(innerHTML 미사용).
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  var doc = global.document;

  var SLOW_CHAR_MS = 46;     // 느린 줄의 글자당 지연
  var SCROLL_EVERY = 6;      // 타이핑 중 스크롤 갱신 주기(글자)
  var FX_MS = 620;           // 연출 클래스를 붙여두는 시간 (CSS 애니메이션 길이와 맞춘다)

  var el = {};
  var toastTimer = null;
  var fxTimer = null;
  var countTimer = null;
  var currentLineEl = null;   // 방금 쌓은 줄 — 이전 줄들과 다르게 또렷이 보인다(7.8 "최신 줄 강조")

  /*
   * 화면 연출 강도 (접근성).
   *  2 = 기본 / 1 = 약하게 / 0 = 끔
   * 광과민성 등을 고려해 반드시 해제할 수 있어야 한다(2부 플롯 7.2항).
   * 0단계에서는 번쩍임과 흔들림을 모두 적용하지 않는다.
   */
  var fxLevel = 2;

  /*
   * 「촌각」 시간 여유 배율 (접근성, UI 명세 6장).
   *  1 = 기본 / 1.5 / 2 / 0 = 무제한 — 무제한이어도 게이지는 보이되 만료되지 않는다.
   */
  var chongakScale = 1;
  var echoOn = true;          // 「잔향」 힌트 표시 여부 (숙련자용 끄기)
  var echoTimer = null;

  // 진행 중인 타이핑 상태
  var typing = null;         // { segs, spans, si, ci, timer, onDone }

  /** 강조 마크업을 세그먼트 배열로 분해 */
  function parseMarkup(text) {
    var out = [];
    var re = /\*\*([^*]+)\*\*|!!([^!]+)!!/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) out.push({ text: text.slice(last, m.index), mark: '' });
      if (m[1] !== undefined) out.push({ text: m[1], mark: 'hi' });
      else out.push({ text: m[2], mark: 'big' });
      last = re.lastIndex;
    }
    if (last < text.length) out.push({ text: text.slice(last), mark: '' });
    return out.length ? out : [{ text: text, mark: '' }];
  }

  function stopTyping(fill) {
    if (!typing) return;
    if (typing.timer) global.clearInterval(typing.timer);
    if (fill) {
      for (var i = 0; i < typing.segs.length; i++) {
        typing.spans[i].textContent = typing.segs[i].text;
      }
    }
    var done = typing.onDone;
    typing = null;
    Renderer.scrollToEnd();
    if (done) done();
  }

  function startTyping(segs, spans, onDone) {
    typing = { segs: segs, spans: spans, si: 0, ci: 0, timer: null, onDone: onDone };
    var ticks = 0;

    typing.timer = global.setInterval(function () {
      if (!typing) return;

      // 현재 세그먼트에서 한 글자 추가
      while (typing.si < typing.segs.length && typing.ci >= typing.segs[typing.si].text.length) {
        typing.si++;
        typing.ci = 0;
      }
      if (typing.si >= typing.segs.length) {
        stopTyping(false);
        return;
      }
      typing.spans[typing.si].textContent += typing.segs[typing.si].text.charAt(typing.ci);
      typing.ci++;

      if (++ticks % SCROLL_EVERY === 0) Renderer.scrollToEnd();
    }, SLOW_CHAR_MS);
  }

  /**
   * 「촌각(寸刻)」 남은 시간 막대.
   * 초과하면 "아무것도 하지 못했다"가 자동 적용된다 — 불리하되 즉사는 아니다.
   */
  function startCountdown(limit, onTimeout) {
    var bar = doc.createElement('div');
    bar.className = 'chongak';
    var fill = doc.createElement('div');
    fill.className = 'chongak-fill';
    var label = doc.createElement('span');
    label.className = 'chongak-label';
    label.textContent = '촌각(寸刻)';
    bar.appendChild(label);
    bar.appendChild(fill);
    el.choices.appendChild(bar);

    // 접근성 배율. 무제한(0)이면 게이지를 가득 채운 채 멈춰 둔다 — 만료되지 않는다.
    if (chongakScale === 0) return;
    limit = limit * chongakScale;

    var started = Date.now();
    countTimer = global.setInterval(function () {
      var left = limit - (Date.now() - started);
      if (left <= 0) {
        Renderer.stopCountdown();
        fill.style.width = '0%';
        if (onTimeout) onTimeout();
        return;
      }
      fill.style.width = (left / limit * 100) + '%';
      // 남은 시간이 3할 아래로 떨어지면 색이 바뀐다
      if (left / limit < 0.3) bar.classList.add('urgent');
    }, 60);
  }

  /** 습득 소품 한 점을 로그에 쌓는다 (이미지 + 설명) */
  function appendProp(key) {
    var prop = Game.Assets.prop(key);
    if (!prop) return;

    var box = doc.createElement('figure');
    box.className = 'line-prop';

    var img = doc.createElement('img');
    img.src = prop.url;
    img.alt = prop.label;
    box.appendChild(img);

    var cap = doc.createElement('figcaption');
    cap.textContent = prop.label;
    box.appendChild(cap);

    el.log.appendChild(box);
  }

  var Renderer = {
    init: function () {
      el.backdrop = doc.getElementById('backdrop');
      el.log = doc.getElementById('log');
      el.choices = doc.getElementById('choices');
      el.clue = doc.getElementById('hud-clue');
      el.chapter = doc.getElementById('hud-chapter');
      el.toast = doc.getElementById('toast');
      el.volLabel = doc.getElementById('vol-label');
      el.ending = doc.getElementById('screen-ending');
      el.death = doc.getElementById('screen-death');
      el.stage = doc.getElementById('stage');
      el.fx = doc.getElementById('fx');

      fxLevel = Number(Game.Save.getPref('fxLevel', 2));
      if (isNaN(fxLevel)) fxLevel = 2;

      chongakScale = Number(Game.Save.getPref('chongakScale', 1));
      if ([0, 1, 1.5, 2].indexOf(chongakScale) === -1) chongakScale = 1;
      echoOn = Game.Save.getPref('echoOn', true) !== false;
      el.echo = doc.getElementById('screen-echo');
      return Renderer;
    },

    /* ── 화면 연출 ─────────────────────────────── */

    /** 연출 강도 조회 / 변경 (0 끔 · 1 약 · 2 기본) */
    fxLevel: function () {
      return fxLevel;
    },

    setFxLevel: function (level) {
      fxLevel = Math.max(0, Math.min(2, Number(level) || 0));
      Game.Save.setPref('fxLevel', fxLevel);
      return fxLevel;
    },

    /**
     * 노드에 지정된 연출을 한 번 재생한다.
     *  flash-white / flash-red — 단서 발견, 급습, 즉사
     *  shake-weak / -mid / -strong — 불길함, 피격, 클라이맥스
     * 강도 0이면 아무것도 하지 않고, 1이면 약한 변형만 쓴다.
     */
    playFx: function (name) {
      if (!name || !fxLevel || !el.fx) return;

      var kind = name.indexOf('flash') === 0 ? 'flash' : 'shake';
      // 약하게 설정한 경우 강도를 한 단계 내린다 (강한 흔들림 → 약한 흔들림)
      var applied = (fxLevel === 1 && kind === 'shake') ? 'shake-weak' : name;

      if (fxTimer) global.clearTimeout(fxTimer);
      el.fx.className = '';
      el.stage.classList.remove('shake-weak', 'shake-mid', 'shake-strong');

      // 리플로우를 강제해 같은 연출이 연속으로 와도 다시 재생되게 한다
      void el.fx.offsetWidth;

      if (kind === 'flash') {
        el.fx.className = 'fx-' + applied + (fxLevel === 1 ? ' fx-soft' : '');
      } else {
        el.stage.classList.add(applied);
      }

      fxTimer = global.setTimeout(function () {
        el.fx.className = '';
        el.stage.classList.remove('shake-weak', 'shake-mid', 'shake-strong');
      }, FX_MS);
    },

    /* ── 접근성: 촌각 배율 · 잔향 ─────────────── */
    chongakScale: function () { return chongakScale; },

    setChongakScale: function (scale) {
      scale = Number(scale);
      chongakScale = [0, 1, 1.5, 2].indexOf(scale) === -1 ? 1 : scale;
      Game.Save.setPref('chongakScale', chongakScale);
      return chongakScale;
    },

    echoOn: function () { return echoOn; },

    setEchoOn: function (on) {
      echoOn = !!on;
      Game.Save.setPref('echoOn', echoOn);
      return echoOn;
    },

    /**
     * 「잔향(殘響)」 — 즉사 화면과 재시작 사이의 암전 한 줄.
     * 음성 없이 텍스트만, 배경은 완전한 검정(3부 플롯 8.3항). 클릭하면 바로 넘어간다.
     * line: { who, text } — 화자는 극중 인물이어야 한다(시스템 안내문 금지).
     */
    showEcho: function (line, done) {
      if (echoTimer) global.clearTimeout(echoTimer);
      doc.getElementById('echo-who').textContent = line.who || '';
      doc.getElementById('echo-text').textContent = line.text || '';
      el.echo.classList.remove('hidden');

      var finished = false;
      function end() {
        if (finished) return;
        finished = true;
        if (echoTimer) global.clearTimeout(echoTimer);
        el.echo.classList.add('hidden');
        el.echo.onclick = null;
        if (done) done();
      }
      el.echo.onclick = end;
      echoTimer = global.setTimeout(end, 3200);
    },

    setChapterTitle: function (text) {
      el.chapter.textContent = text;
    },

    /**
     * 배경 전환.
     * 에셋 이미지가 있으면 이미지를 깔고, 없는 장면은 CSS 그라디언트를 그대로 쓴다.
     * (클래스는 항상 붙여 두므로 이미지 로드 실패 시에도 분위기가 유지된다)
     */
    setBackdrop: function (name) {
      el.backdrop.className = 'bg-' + (name || 'none');

      var art = Game.Assets ? Game.Assets.image(name) : null;
      if (art) {
        el.backdrop.style.backgroundImage = 'url("' + art.url + '")';
        el.backdrop.style.filter = art.filter;
        el.backdrop.classList.add('has-art');
      } else {
        el.backdrop.style.backgroundImage = '';
        el.backdrop.style.filter = 'none';
        el.backdrop.classList.remove('has-art');
      }
    },

    /** 음량 표시 갱신 — 0단계는 꺼짐, 자동재생 보류 상태도 함께 알린다 */
    setAudioState: function (status) {
      if (!el.volLabel) return;
      if (status.level === 0) {
        el.volLabel.textContent = '♪ 꺼짐';
      } else if (status.waiting) {
        el.volLabel.textContent = '♪ 클릭하면 재생';
      } else {
        el.volLabel.textContent = '♪ ' + status.level + '/' + status.max;
      }
    },

    clearLog: function () {
      stopTyping(false);
      el.log.innerHTML = '';
      currentLineEl = null;
    },

    /**
     * 대사 한 줄 출력.
     * line.slow 가 true 면 글자 단위로 느리게 나타나고, 완료 시 onDone 이 호출된다.
     */
    pushLine: function (line, onDone) {
      var p = doc.createElement('p');
      p.className = 'line' + (line.cls ? ' ' + line.cls : '');

      /*
       * 얼굴 뱃지.
       * 줄에 portrait 가 직접 지정되어 있으면 그것을 쓰고(엑스트라용),
       * 없으면 화자 표기로 찾는다(고정 인물용).
       */
      var portrait = line.portrait
        ? Game.Assets.portrait(line.portrait)
        : ((line.who && Game.Codex) ? Game.Codex.portraitForSpeaker(line.who) : null);
      var body = p;

      if (portrait) {
        p.classList.add('has-portrait');
        var img = doc.createElement('img');
        img.className = 'dialogue-portrait';
        img.src = portrait;
        img.alt = line.who;
        p.appendChild(img);
        // 뱃지 옆에 글이 오도록 본문을 별도 블록으로 감싼다
        body = doc.createElement('span');
        body.className = 'line-body';
        p.appendChild(body);
      }

      if (line.who) {
        var who = doc.createElement('span');
        who.className = 'who';
        who.textContent = line.who;
        body.appendChild(who);
      }

      var segs = parseMarkup(line.text || '');
      var spans = [];
      for (var i = 0; i < segs.length; i++) {
        var span = doc.createElement('span');
        if (segs[i].mark) span.className = 'mk-' + segs[i].mark;
        body.appendChild(span);
        spans.push(span);
      }
      el.log.appendChild(p);

      // 방금 쌓은 줄만 CSS 에서 완전히 밝게 그린다. 나머지는 옅어진다(.line 기본 opacity).
      if (currentLineEl) currentLineEl.classList.remove('line-current');
      currentLineEl = p;
      p.classList.add('line-current');

      /*
       * 습득 소품 이미지.
       * 문서 양식(첩정·관자·치계)은 그 자체가 고증이므로, 단서 줄에 실물을 함께 붙인다.
       * 대사 흐름을 끊지 않도록 대사 아래 별도 블록으로 쌓는다.
       */
      if (line.prop) appendProp(line.prop);

      if (line.slow) {
        startTyping(segs, spans, onDone);
        return;
      }

      for (var j = 0; j < segs.length; j++) spans[j].textContent = segs[j].text;
      Renderer.scrollToEnd();
      if (onDone) onDone();
    },

    /** 여러 줄을 즉시 쌓는다 (저장 복원 시 백로그 재생용 — 타이핑 연출 없음) */
    pushLines: function (lines) {
      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        Renderer.pushLine({
          who: line.who, text: line.text, cls: line.cls,
          portrait: line.portrait, prop: line.prop
        });
      }
      Renderer.scrollToEnd();
    },

    isTyping: function () {
      return !!typing;
    },

    /** 타이핑 중 클릭 → 남은 글자를 즉시 채운다 (일반적인 VN 조작감) */
    finishTyping: function () {
      stopTyping(true);
    },

    /*
     * 최신 줄은 항상 밴드의 아래쪽 끝(화면 중앙에서 조금 아래)에 놓이고, 이전 줄이 위로 밀려 올라간다.
     * 읽는 자리가 움직이지 않으므로 시선이 한 곳에 머문다. (CSS 가 밴드를 화면 중앙대에 둔다)
     */
    scrollToEnd: function () {
      el.log.scrollTop = el.log.scrollHeight;
    },

    setClueCount: function (n) {
      el.clue.textContent = '단서 ' + n;
    },

    /**
     * 선택지 표시.
     * options: [{ index, text, tag }] — index 는 엔진에 그대로 돌려줄 원본 인덱스
     * limit    : 「촌각」 제한 시간(ms). 주면 남은 시간 막대가 붙는다
     * onTimeout: 제한 시간 초과 시 호출
     */
    showChoices: function (prompt, options, onPick, limit, onTimeout) {
      Renderer.stopCountdown();
      el.choices.innerHTML = '';
      el.choices.classList.remove('hidden');
      // 선택지가 많으면 읽기 밴드를 위로 올려 넘치지 않게 한다(CSS .many-choices)
      el.stage.classList.toggle('many-choices', options.length > 4);

      if (prompt) {
        var p = doc.createElement('p');
        p.className = 'prompt';
        p.textContent = prompt;
        el.choices.appendChild(p);
      }

      options.forEach(function (opt, i) {
        var btn = doc.createElement('button');
        btn.type = 'button';

        var num = doc.createElement('span');
        num.className = 'num';
        num.textContent = (i + 1) + '.';
        btn.appendChild(num);

        btn.appendChild(doc.createTextNode(' ' + opt.text));
        if (opt.tag) {
          var tag = doc.createElement('span');
          tag.className = 'tag';
          tag.textContent = '— ' + opt.tag;
          btn.appendChild(tag);
        }
        btn.addEventListener('click', function (ev) {
          ev.stopPropagation();   // 무대 클릭(진행)과 겹치지 않게 한다
          onPick(opt.index, opt.text);
        });
        el.choices.appendChild(btn);
      });

      // 촌각 게이지는 선택지 바로 아래에 둔다 — 선택지에서 눈을 떼지 않고 남은 시간을 읽는다
      if (limit) startCountdown(limit, onTimeout);

      Renderer.scrollToEnd();
    },

    hideChoices: function () {
      Renderer.stopCountdown();
      el.stage.classList.remove('many-choices');
      el.choices.classList.add('hidden');
      el.choices.innerHTML = '';
    },

    stopCountdown: function () {
      if (countTimer) {
        global.clearInterval(countTimer);
        countTimer = null;
      }
    },

    /* ── 오버레이 ─────────────────────────────── */

    /**
     * 즉사 화면.
     * 전우치의 한마디를 반드시 함께 띄운다 — 실패조차 캐릭터성과 힌트로 기능하게 하는 장치다.
     * (2부 플롯 7.1항 설계 원칙)
     */
    showDeath: function (death) {
      doc.getElementById('death-title').textContent = death.title || '즉사';
      doc.getElementById('death-master').textContent = death.master || '';
      doc.getElementById('death-desc').textContent = death.desc || '';
      el.death.classList.remove('hidden');
    },

    hideDeath: function () {
      el.death.classList.add('hidden');
    },

    showEnding: function (ending, unlockedText, yasarokText) {
      el.ending.className = 'overlay kind-' + (ending.kind || 'normal');
      doc.getElementById('ending-kind').textContent =
        ending.kind === 'good' ? '엔딩 해금' : '엔딩';
      doc.getElementById('ending-title').textContent = ending.title;
      doc.getElementById('ending-desc').textContent = ending.desc || '';
      doc.getElementById('ending-unlocked').textContent = unlockedText || '';
      doc.getElementById('ending-yasarok').textContent = yasarokText || '';
      el.ending.classList.remove('hidden');
    },

    hideEnding: function () {
      el.ending.classList.add('hidden');
    },

    toast: function (message) {
      el.toast.textContent = message;
      el.toast.classList.remove('hidden');
      if (toastTimer) global.clearTimeout(toastTimer);
      toastTimer = global.setTimeout(function () {
        el.toast.classList.add('hidden');
      }, 1600);
    }
  };

  Game.Renderer = Renderer;
})(this);
