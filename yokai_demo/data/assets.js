/*
 * 에셋 매핑 데이터 v0.2.0
 *
 * 근거: docs/1부_에셋_매칭표.md, docs/2부_에셋_매칭표.md (사용자 제공 에셋 매칭 표)
 * 파일 경로와 장면 대응만 담는다. 실제 재생/표시는 js/ui/audio.js, js/ui/renderer.js 가 한다.
 *
 * 파일명에 공백이 있어 URL 로 쓸 때는 반드시 encodeURIComponent 를 거쳐야 한다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var IMAGE_DIR = 'file/image/';
  var SOUND_DIR = 'file/sound/';
  var PROP_DIR = 'file/image/props/';
  /*
   * 인물 초상 — 파일명은 도감 항목 id 와 동일하다 (sin.png, heo.png …).
   * 원본(1024px)은 file/character/original/ 에 보존되어 있고,
   * 여기서 쓰는 것은 워터마크를 잘라내고 256px 로 리사이즈한 가공본이다.
   *   ffmpeg -i "original/<id>.png" -vf "crop=800:800:112:0,scale=256:256:flags=lanczos" <id>.png
   */
  var PORTRAIT_DIR = 'file/character/';

  /* 배경 이미지 — 키는 시나리오 데이터의 bg 값과 1:1 대응 */
  var IMAGES = {
    // 메인 테마 — 게임 시작 전 화면 전용
    title:   { file: 'main_theme1.png',       label: '[BG 5] 메인 테마 · 폐허가 된 마을 밤' },
    menu:    { file: 'main_theme2.png',       label: '[BG 6] 메인 테마 · 대숲의 사당' },

    fire:    { file: 'Mansion in Flames.png', label: '[BG 4] 불타는 양반가 저택' },
    /*
     * [BG 1] 원본은 '불이 타오르는 중'인 그림이다.
     * 조사 파트는 종전 직후 초겨울 밤이라 화염이 그대로 보이면 시점이 어긋나므로,
     * 채도·명도를 크게 낮춰 '불이 잦아든 폐허'로 읽히게 보정한다.
     * (불 꺼진 마을 야경 전용 배경이 준비되면 이 filter 를 지우고 파일만 교체하면 된다)
     */
    road:    { file: 'Burnt Village.png',     label: '[BG 1] 불탄 마을 (야경 보정)',
               filter: 'brightness(0.42) saturate(0.3)' },
    village: { file: 'Burnt Village.png',     label: '[BG 1] 불탄 마을 (야경 보정)',
               filter: 'brightness(0.42) saturate(0.3)' },
    house:   { file: 'Joseon Indoor.png',     label: '[BG 3] 고을 아전의 동헌' },
    shrine:  { file: 'Ghostly Shrine.png',    label: '[BG 2] 금옥의 낡은 사당' },
    ghost:   { file: 'Ghostly Shrine.png',    label: '[BG 2] 금옥의 낡은 사당' },
    // 굿 엔딩의 새벽 — 전용 이미지가 없어 사당 배경을 따뜻하게 보정해 재사용한다
    dawn:    { file: 'Ghostly Shrine.png',    label: '[BG 2] 금옥의 낡은 사당 (새벽 보정)',
               filter: 'sepia(0.32) brightness(1.18) saturate(1.1)' },

    /*
     * ── 2부 「서로를 삼키는 그림자」 ──────────────────────────
     * 전용 배경 5종을 받았다. 키 이름은 사용자 제공 매칭 표를 그대로 따른다.
     *
     * 1부 프롤로그(fire)는 '불타는 저택'을, 2부 프롤로그(red_dream)는 '붉은 하늘'을 쓴다.
     * 같은 밤을 다루지만 일부러 다른 그림을 쓰는 것이다 —
     * 하늘이 붉었다는 사실은 2부에서 처음 드러나야 하므로(플롯 v2 3항),
     * 1부에서 미리 보여주면 시점 특정의 효과가 죽는다.
     */
    red_dream:     { file: 'red_dream.png',      label: '[BG 7] 프롤로그 · 붉은 기억 (참극 회상)' },
    sealed_gate:   { file: 'sealed_gate.png',    label: '[BG 8] 봉쇄된 고을 입구' },
    inspection:    { file: 'heo_inspection.png', label: '[BG 9] 어의 허준의 검안소' },
    foggy_market:  { file: 'foggy_market.png',   label: '[BG 10] 밤의 스산한 저잣거리' },
    unburied_hill: { file: 'unburied_hill.png',  label: '[BG 11] 야산 매장지' },

    /* 전용 배경이 없는 2부 장면 — 위 5종과 1부 배경을 보정해 메운다 */
    // 객점 — 잠들기 전. 1부 동헌 실내를 어둡고 따뜻하게
    inn:       { file: 'Joseon Indoor.png',   label: '[BG 3] 봉쇄된 고을의 객점 (야간 보정)',
                 filter: 'brightness(0.66) sepia(0.18)' },
    // 봉쇄 관아 — 1부 동헌과 같은 실내지만 서늘하게
    hall:      { file: 'Joseon Indoor.png',   label: '[BG 3] 봉쇄 고을의 관아 (냉광 보정)',
                 filter: 'brightness(0.88) saturate(0.7)' },
    // 그슨대가 부푸는 자리 — 저잣거리 배경에 청광을 넣어 같은 밤의 다른 결로 만든다
    shadow:    { file: 'foggy_market.png',    label: '[BG 10] 그림자가 부푸는 자리 (청광 보정)',
                 filter: 'brightness(0.62) saturate(0.55) hue-rotate(155deg)' },
    /*
     * 봉쇄가 풀린 아침 — 같은 문(sealed_gate)이 아침 햇살에 열린 모습으로 되돌아온다.
     * 밝기는 1.15 까지만 올린다. 그 위로 올리면 스크림을 낮춘 뒤로 본문이 묻힌다.
     */
    dawn2:     { file: 'sealed_gate.png',     label: '[BG 8] 봉쇄가 풀린 아침 (주광 보정)',
                 filter: 'brightness(1.15) saturate(0.8) sepia(0.2)' }
  };

  /*
   * 소품 이미지 — 대사 줄의 prop 값과 1:1 대응.
   * 원본 스프라이트 시트(file/Props & UI Effects.png)를 8종으로 분할한 것이다.
   * 문서 양식 소품은 그 자체가 고증이 된다(기획서 v2 6.1항).
   */
  var PROPS = {
    prop_byeokyeok:     { file: 'prop_byeokyeok.png',     label: '『신찬벽온방』(1612) 처방서' },
    prop_gwanja:        { file: 'prop_gwanja.png',        label: '관자(關子) — 봉쇄 통행 허가' },
    prop_cheopjeong:    { file: 'prop_cheopjeong.png',    label: '첩정(牒呈) — 하급 관아의 보고' },
    prop_chigye:        { file: 'prop_chigye.png',        label: '치계(馳啓) — 관찰사의 장계' },
    prop_black_pattern: { file: 'prop_black_pattern.png', label: '문양이 새겨진 쇠붙이' }
  };

  /* BGM */
  var TRACKS = {
    // 게임 시작 전 화면(메인·장 선택·도감·감상실) 전용 테마
    menu:        { file: 'main_music_theme.mp4',      label: '[BGM 5] 메인 화면 테마' },
    /*
     * [BGM 1] 은 메인 화면 전용 테마가 생긴 뒤로 굿 엔딩의 새벽 장면(dawn) 리프라이즈로 쓴다.
     * 감상실에는 그대로 남아 있으므로 굿 엔딩에 도달하면 해금된다.
     */
    main:        { file: 'The Eyes of Left Path.mp4', label: '[BGM 1] 「좌도의 눈」 (에필로그)' },
    investigate: { file: 'Silent Ash Village.mp4',    label: '[BGM 2] 탐문·조사 「재만 남은 마을」' },
    grief:       { file: 'Grief of Son-Gaksi.mp4',    label: '[BGM 3] 원혼의 슬픔 「손각시의 곡소리」' },
    past:        { file: 'Remnants of Fire.mp4',      label: '[BGM 4] 회상·과거 비극 「재로 변한 가문」' },

    /* 2부 전용 5트랙 */
    red_memory:        { file: 'Remnants of Red Sky.mp4', label: '[BGM 6] 프롤로그 「붉은 기억」' },
    plague_investigate: { file: 'Shadow in the Fog.mp4',  label: '[BGM 7] 탐문·조사 「안개 속 그림자」' },
    heo_deduction:     { file: 'Deduction of Medicine.mp4', label: '[BGM 8] 의학과 좌도 「허준의 검안소」' },
    geusundae_attack:  { file: 'Attack of Geusundae.mp4', label: '[BGM 9] 위기·즉사 「그슨대의 습격」' },
    black_hat_climax:  { file: 'Truth of Black Hat.mp4',  label: '[BGM 10] 클라이맥스 「그림자의 진실」' }
  };

  /*
   * 배경별 기본 BGM.
   * 노드에 bgm 을 직접 지정하면 그 값이 우선한다(예: 사당 '조사' 파트는 조사 테마 유지).
   * 같은 트랙이 이어지는 동안에는 재생을 끊지 않으므로 장면이 바뀌어도 음악은 끊기지 않는다.
   */
  var BG_TO_BGM = {
    fire: 'past',
    road: 'investigate',
    village: 'investigate',
    house: 'investigate',
    shrine: 'grief',
    ghost: 'grief',
    dawn: 'main',       // 에필로그에서 타이틀 테마를 다시 얹는다

    /*
     * 1부 신규 배경(헤르메스 확정본, 2026-10-07) — 새 ID 를 대본에서 직접 쓰므로 BGM 도 새 ID 로 잇는다.
     * 여기 없으면 bgmFor 가 null 을 돌려줘 그 장면부터 음악이 꺼진다(스모크 테스트는 이를 잡지 못한다).
     * 근거: 각 장면이 옛 키에서 쓰던 트랙을 그대로 유지한다 — fire→past, house·village→investigate,
     *       ghost→grief, dawn→main, shrine→grief. uncle_house 는 옛 house(→investigate)를 대신한다.
     */
    burning_house: 'past',
    ruined_house_ash: 'past',
    gwana_office: 'investigate',
    bak_house: 'investigate',
    brother_shed: 'investigate',
    geumok_house_ruin: 'investigate',
    uncle_house: 'investigate',
    shrine_interior: 'grief',
    old_shrine_night: 'grief',
    old_shrine_dawn: 'main',

    /*
     * 2부 — 전용 트랙 5종을 받았다.
     * 매장지(unburied_hill)는 조사 파트이므로 기본은 조사 테마로 두고,
     * 경고·즉사 노드에만 「그슨대의 습격」을 직접 지정한다.
     * 클라이맥스의 흑막 대면도 노드 단위로 「그림자의 진실」을 얹는다.
     */
    red_dream: 'red_memory',
    inn: 'plague_investigate',
    sealed_gate: 'plague_investigate',
    foggy_market: 'plague_investigate',
    hall: 'plague_investigate',
    unburied_hill: 'plague_investigate',
    inspection: 'heo_deduction',
    shadow: 'geusundae_attack',
    dawn2: 'main'
  };

  /*
   * ── 신규 에셋(헤르메스 제작, assets/<범주>/<장>/<id>.<확장자>) 연결 ─────────────
   * 근거: docs/에셋_적용_가이드.md. 확정 배치된 파일만 data/assets_live.js(자동 생성)에 적힌다.
   * 조회 순서는 항상 «등록부에 있는 새 에셋 → 기존 더미»라서, 에셋이 한 장씩 들어와도
   * 게임은 언제나 완결된 상태로 돈다. 아래 표에 없는 키는 계속 기존 더미를 쓴다.
   *
   *  · 새 ID 를 시나리오에서 직접 써도 된다(node.bg: 'archive_night', line.portrait: 'eunho_shaken').
   *  · 표에 filter 를 적은 것은 «같은 그림을 재사용해 다른 시간대·분위기로 보이게 하는» 장면뿐이다.
   *    옛 더미를 억지로 어둡게 하던 보정은 새 그림에는 필요 없어 적지 않았다.
   *  · 대응이 애매한 옛 키(house · hall · fire · 엑스트라 6종 · dark_hat)는 사람이 정할 때까지 비워 뒀다.
   */
  var LIVE = global.Game && global.Game.LiveAssets ? global.Game.LiveAssets : {};

  /* 옛 배경 키 → 새 배경 ID */
  var BG_NEW = {
    red_dream:     { id: 'red_memory' },
    shrine:        { id: 'old_shrine' },
    ghost:         { id: 'old_shrine' },
    dawn:          { id: 'old_shrine', filter: 'sepia(0.32) brightness(1.18) saturate(1.1)' },
    // 1부 프롤로그의 «이름 없는 고을 어귀»(road) / 조사 허브 «절반이 불탄 마을»(village) — 1부 플롯 v3.0 2장
    village:       { id: 'burnt_village' },
    road:          { id: 'village_lane' },
    sealed_gate:   { id: 'blockade' },
    dawn2:         { id: 'blockade',  filter: 'brightness(1.15) saturate(0.8) sepia(0.2)' },
    // 타이틀·장 선택 메뉴 — 옛 [BG 5]·[BG 6] 더미를 확정본(title_bg·menu_bg, 2026-10-07)으로 교체
    title:         { id: 'title_bg' },
    menu:          { id: 'menu_bg' },
    inspection:    { id: 'geoman_inside' },
    foggy_market:  { id: 'market_river' },
    unburied_hill: { id: 'burial_hill' },
    inn:           { id: 'inn_room' },
    shadow:        { id: 'night_scene' }
  };

  /* 옛 초상 id(도감 id) → 새 초상 ID. 표정 목록의 첫 번째가 기본 표정이다 */
  var PORTRAIT_NEW = {
    sin: 'eunho_calm',        jeon: 'jeonwoochi_calm', heo: 'heojun_calm',
    kang: 'kangmunwoo_affable', bak: 'baksubang_affable', uncle: 'uncle_grieving',
    ajeon: 'ajeon_officious', dori: 'dolibeom_ingratiating', nam: 'namcheomji_dignified',
    eoksoe: 'eoksoe_shrewd',
    yunbok: 'brother_earnest',   // 정혼자의 동생(1부) — 작업지시서 id 는 brother
    geumok: 'songaksi_01',       // 도감의 금옥 = 손각시 1단계(요괴 범주 yk)
    anak: 'anak_worried'         // 도감 '마을 아낙' — 화자 '아낙' 이 codex.js 표로 anak 에 이어진다
  };

  /*
   * 새 소품 ID 의 화면 표기. 소품 캡션(figcaption)·alt 에 쓰이며, 없으면 id 문자열이 그대로 보인다.
   * 이름 근거: 헤르메스 확정완료보고(2026-10-07)와 docs/1부_에셋_부족분_점검.md 3-3.
   * 아래 7종은 1부 대본 초안이 쓰는 소품이며, 이름은 대본 시트의 증좌첩 항목명·[단서] 줄 본문을 따랐다.
   * ⚠ testimony_02 는 «— 나를 업어 키운 손이었다»(혼령 금옥) 줄에 붙은 소품이라 «금옥의 증언» 으로 추정했다.
   */
  var PROP_LABEL = {
    door_blind: '문에 쳐진 대나무 발',
    yemul_box: '빈 예물함',
    talisman_fresh: '신은호의 부적',
    honseo_burnt: '불탄 혼서(婚書) 잔편',
    yemul_note: '예물 품목 쪽지',
    myeongju: '숙부의 세간 — 무명',
    mulsaek_cloth: '사당의 물색 천',
    testimony_01: '정혼자 동생의 증언',
    testimony_02: '금옥의 증언',
    silver_nyang: '은자(銀子)'
  };

  /*
   * 옛 소품 키 → 새 소품 ID (범주, id).
   * 문서 중 관자·치계는 일부러 잇지 않았다 — 새 문서 템플릿은 글자 없는 괘선 지면이라
   * 글자 조판 합성이 붙기 전에 옛 소품을 바꾸면 «내용 없는 종이»가 뜬다. 첩정만 아래 예외.
   */
  var PROP_NEW = {
    // 첩정은 글자 없는 괘선 지면(앵커)이다. 글자 조판 합성은 아직 없어 «내용 없는 종이»로 보이지만,
    // 1부 첩정 초안의 소품은 내용을 본문이 말하므로 일러스트로 쓴다. 관자·치계 템플릿은 2부 에셋이 오면 잇는다.
    prop_cheopjeong:    { cat: 'doc',  id: 'cheopjeong' },
    prop_byeokyeok:     { cat: 'item', id: 'book_byeokyeok' },
    prop_black_pattern: { cat: 'item', id: 'pattern_iron' }
  };

  function liveFile(cat, id) {
    var group = LIVE[cat];
    return group && group[id] ? group[id].f : null;
  }

  function url(dir, file) {
    return dir + encodeURIComponent(file);
  }

  Game.Assets = {
    /** 배경 정보 반환 — { url, filter, label }. 없으면 null (CSS 그라디언트 폴백) */
    image: function (key) {
      var entry = IMAGES[key];
      var map = BG_NEW[key];
      var file = liveFile('bg', key) || (map && liveFile('bg', map.id));
      if (file) {
        return {
          url: file,
          filter: liveFile('bg', key) ? 'none' : (map.filter || 'none'),
          label: entry ? entry.label : key
        };
      }
      if (!entry) return null;
      return {
        url: url(IMAGE_DIR, entry.file),
        filter: entry.filter || 'none',
        label: entry.label
      };
    },

    /** BGM 정보 반환 — { url, label } */
    track: function (key) {
      var entry = TRACKS[key];
      if (!entry) return null;
      return { url: url(SOUND_DIR, entry.file), label: entry.label };
    },

    /** 소품 정보 반환 — { url, label }. 없으면 null */
    prop: function (key) {
      var entry = PROPS[key];
      var map = PROP_NEW[key];
      var file = (map && liveFile(map.cat, map.id)) || liveFile('item', key) || liveFile('doc', key);
      if (file) return { url: file, label: entry ? entry.label : (PROP_LABEL[key] || key) };
      if (!entry) return null;
      return { url: url(PROP_DIR, entry.file), label: entry.label };
    },

    /** 공용 UI 이미지 경로(등록부 ui 범주). 없으면 null — 호출하는 쪽이 텍스트 폴백을 둔다 */
    ui: function (id) {
      return liveFile('ui', id);
    },

    /** 소품 키 목록 (스모크 테스트 검증용) */
    propKeys: function () {
      var out = [];
      for (var key in PROPS) out.push(key);
      return out;
    },

    /** BGM 키 목록 (감상실 표시 순서 — 메인 → 1부 → 2부) */
    trackKeys: function () {
      return [
        'menu',
        'investigate', 'grief', 'past', 'main',
        'red_memory', 'plague_investigate', 'heo_deduction',
        'geusundae_attack', 'black_hat_climax'
      ];
    },

    /** 인물 초상 경로 (도감 id 기준) */
    portrait: function (id) {
      if (!id) return null;
      var file = liveFile('ch', id) || liveFile('yk', id) ||
        liveFile('ch', PORTRAIT_NEW[id]) || liveFile('yk', PORTRAIT_NEW[id]);
      if (file) return file;
      return PORTRAIT_DIR + encodeURIComponent(id) + '.png';
    },

    /**
     * 도감 항목의 초상 경로. 없으면 null 이고, UI 는 이름 첫 글자 실루엣으로 대체한다.
     *  - faceless: true        → null. 형체가 없거나 정체를 감춘 인물 (설정상 의도된 부재)
     *  - portraitPending: true → null. 전용 초상 에셋이 아직 없는 인물 (제작 대기)
     *  - portrait: 'id'        → 그 파일을 쓴다. 엑스트라 초상을 빌려 쓸 때 사용
     *  - 지정이 없으면 항목 id 를 파일명으로 본다 (sin → sin.png)
     */
    portraitOf: function (entry) {
      if (!entry || entry.faceless || entry.portraitPending) return null;
      return Game.Assets.portrait(entry.portrait || entry.id);
    },

    /** 노드에 맞는 BGM 키 (노드 지정 > 배경 기본값) */
    bgmFor: function (node) {
      if (!node) return null;
      return node.bgm || BG_TO_BGM[node.bg] || null;
    },

    /** 배경·초상 선행 로딩 — 장면 전환이나 대사 출력 시 깜빡임을 막는다 */
    preload: function () {
      var done = {};
      var load = function (src) {
        if (!src || done[src]) return;
        done[src] = true;
        var img = new global.Image();
        img.src = src;
      };

      for (var key in IMAGES) load(Game.Assets.image(key).url);
      for (var propKey in PROPS) load(Game.Assets.prop(propKey).url);
      // 신규 에셋 중 시나리오가 새 ID 로 직접 부르는 배경은 옛 키 표에 없으므로 따로 올린다
      for (var newBg in (LIVE.bg || {})) load(LIVE.bg[newBg].f);

      if (Game.CodexEntries) {
        for (var i = 0; i < Game.CodexEntries.length; i++) {
          load(Game.Assets.portraitOf(Game.CodexEntries[i]));
        }
      }
      for (var extraId in (Game.ExtraPortraits || {})) {
        load(Game.Assets.portrait(extraId));
      }
    }
  };
})(this);
