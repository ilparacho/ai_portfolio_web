/*
 * 1부 · 시집가지 못한 혼 — 시나리오 데이터 (자동 생성 — 손으로 고치지 않는다)
 *
 * 원본: 대본/1부_시집가지못한혼.xlsx
 * 생성: node tools/script-build.mjs 대본/1부_시집가지못한혼.xlsx
 * 이야기를 고치려면 원본 시트를 고치고 다시 생성한다. 사용법은 docs/대본_시트_가이드.md.
 * 이름 붙은 판정(@…)은 data/chapter1_logic.js 에 손으로 쓴다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};
  var L = (Game.ScriptLogic || {})['ch1'] || {};

  var nodes = {

    /* ════════════════════════════════════════════════
     * 프롤로그 — 「잔상(殘像) · 첫 번째 조각」
     * 플롯 v2 3항: 시간과 장소를 명시하지 않는다.
     * 플레이어는 이것이 언제 어디였는지 모른 채 지나가고,
     * 2부 프롤로그에서 비로소 "붉은 기운이 일던 밤"으로 특정된다.
     * ════════════════════════════════════════════════ */

    // 에셋 적용(2026-10-07) — 배경 fire → burning_house
    pr_01: {
      id: 'pr_01', bg: 'burning_house',
      sfx: '기둥이 내려앉는 소리.',
      lines: [
        { cls: 'narration', text: '불티가 눈처럼 날렸다.' },
        // 연도를 말하지 않는다. '조작된 옥사'라는 성질만 남기고 시점은 2부로 넘긴다.
        { cls: 'narration', text: '광양 신씨(光陽 申氏). 조작된 옥사에 얽혀 이미 한 번 내려앉은 집이었다. 그러고도 남은 것을 노린 누군가가, 사람이 아닌 것을 들여보냈다.' },
        { cls: 'narration', text: '무너지는 서까래 아래, 사람의 것이 아닌 그림자가 천천히 몸을 일으켰다.' },
        { cls: 'thought', slow: true, text: '나는 마루 밑에 숨어서 그것을 끝까지 보았다. **소리를 내지 않았다.** 그것이 열 살의 내가 한 유일한 일이었다.' }
      ],
      next: 'pr_02'
    },

    // 에셋 적용(2026-10-07) — 배경 fire → ruined_house_ash
    pr_02: {
      id: 'pr_02', bg: 'ruined_house_ash',
      lines: [
        { cls: 'narration', slow: true, text: '결 하나가 밤을 갈랐다. 요괴는 비명도 없이 접혔고, 검고 비린 피가 마루 밑까지 흘러들었다.' },
        { cls: 'narration', text: '그것을 뒤집어쓴 뒤부터, 나는 보이지 않아야 할 것들이 보였다.' },
        { cls: 'narration', text: '잿더미 앞에 선 낡은 등짐 하나.' },
        { who: '전우치', text: '살아 있는 놈이 하나 있군. 따라오겠나, 아니면 여기서 얼어 죽겠나.' },
        { cls: 'thought', text: '그가 전우치라는 것도, 그 요괴를 누가 보냈는지도, 그때는 알지 못했다.' }
      ],
      next: 'pr_03'
    },

    pr_03: {
      id: 'pr_03', bg: 'road',
      sfx: '마른 갈대를 훑는 바람.',
      lines: [
        // 고증 확정 시점 — 종전(1598)으로부터 13년. 플롯 v2 2항
        { cls: 'narration', text: '— **신해년(辛亥年), 광해 삼년 초겨울.** 전란이 끝난 지 열세 해가 지났다.' },
        { cls: 'narration', slow: true, text: '끝났다고들 했다. 그러나 마을의 절반은 여전히 잿더미였고, 아직 시신도 다 수습되지 못한 길이 남아 있었다.' },
        { cls: 'narration', text: '무엇보다 **문서가 타 없어졌다.** 논밭의 문기도, 혼사의 서약도. 증서가 없으니 세상의 모든 일이 말싸움이 되었다.' },
        { cls: 'narration', text: '이름 없는 작은 고을 어귀. 절반이 불탄 마을과, 그 뒤편의 낡은 사당.' }
      ],
      next: 'pr_04'
    },

    pr_04: {
      id: 'pr_04', bg: 'road',
      lines: [
        { who: '전우치', text: '혼담이 오가던 이들이 연이어 없어진다더군. 더러는 실성한 채로 돌아왔고.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '손각시입니까.' },
        { who: '전우치', text: '아직은 이름을 붙이지 마라. 이름을 붙이면 사람은 그 이름만 본다.' },
        { who: '전우치', text: '괴이를 보는 법부터 다시 이르마. 눈으로 찾지 말고, 어긋난 것을 찾아라. 소리가 없어야 할 곳의 소리, 그림자가 없어야 할 곳의 그림자.' }
      ],
      next: 'pr_05'
    },

    pr_05: {
      id: 'pr_05', bg: 'road',
      prompt: '스승은 대답을 기다리지 않는다. 어떻게 하겠는가.',
      options: [
        {
          text: '눈을 감고 숨을 고른다.',
          tag: '좌도의 방식',
          set: { way_listen: true },
          next: 'pr_06a'
        },
        {
          text: '먼저 품 안의 부적을 확인한다.',
          tag: '대비 우선',
          set: { way_ward: true },
          next: 'pr_06b'
        }
      ]
    },

    pr_06a: {
      id: 'pr_06a', bg: 'road',
      lines: [
        { cls: 'narration', text: '숨을 죽이자 바람의 결이 갈라졌다. 마을 쪽에서 오는 소리와, 사당 쪽에서 오는 소리가 서로 다른 박자로 겹쳤다.' },
        { who: '전우치', text: '그래. 좌도(左道)는 원래 듣는 재주다. 정도(正道)에서 이걸 천히 여기는 건, 듣다 보면 저들이 감춘 것까지 들려서지.' }
      ],
      next: 'pr_07'
    },

    pr_06b: {
      id: 'pr_06b', bg: 'road',
      lines: [
        /*
         * 에셋 적용(2026-10-07) — 소품 이미지 talisman_fresh
         * 붉은색 예외(2026-10-07, 디렉터 고증 결정): 신은호의 부적은 누런 한지에 붉은 주사(朱砂) 글씨다. 부적에 한해 «붉은색은 즉사·위험 전용» 원칙의 공식 예외. 불꽃·천·자국의 붉은색 금지는 그대로.
         */
        { cls: 'narration', prop: 'talisman_fresh', text: '접은 부적 일곱 장. 결과 하나. 손에 익은 무게가 도리어 마음을 놓게 했다.' },
        { who: '전우치', text: '나쁘지 않다. 다만 부적은 이미 벌어진 일을 늦추는 물건이야. 아직 벌어지지 않은 일에는 아무 힘이 없다.' }
      ],
      next: 'pr_07'
    },

    pr_07: {
      id: 'pr_07', bg: 'village',
      lines: [
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_amused
        { who: '전우치', portrait: 'jeonwoochi_amused', text: '나머지는 몸으로 배워라. 나는 술 한 잔 걸치고 있겠다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_exhausted
        { who: '신은호', portrait: 'eunho_exhausted', text: '……또 이러십니까.' },
        { cls: 'narration', text: '늘 그랬다. 스승은 결정적인 순간에만 나타났고, 그 전까지는 어김없이 사라져 있었다.' },
        // 이름의 뜻('숨을 은')과 극 전체의 은유를 여기서 못 박는다
        { cls: 'thought', text: '혼자다. — 하늘이 내린 재주를 세상에 드러내면 명이 짧아진다 하여 이름에 숨을 은(隱)을 넣었다 들었다.' },
        { cls: 'thought', text: '그러니 이 눈도, 이 재주도, 되도록 남에게 보이지 않는 편이 낫다.' }
      ],
      next: 'hub'
    },


    /* ════════════════════════════════════════════════
     * 조사 단계 — 허브
     * 정보 수집용 선택지. 사건의 흐름 자체는 바꾸지 않으며(캐릭터성·정보 획득 위주),
     * 단서 2개 이상을 모으면 추궁 단계로 넘어갈 수 있다.
     * ════════════════════════════════════════════════ */

    hub: {
      id: 'hub', bg: 'village',
      prompt: '무엇부터 하겠는가.',
      options: [
        {
          text: '마을 사람들을 탐문한다.',
          once: true,
          next: 'inv_village_01'
        },
        {
          text: '마을 뒤편의 낡은 사당을 살핀다.',
          once: true,
          next: 'inv_shrine_01'
        },
        // 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. 혼서 잔편의 획득 장소 «금옥의 집터».
        {
          text: '불타 버린 금옥의 집터를 찾아간다.',
          once: true,
          next: 'inv_house_01'
        },
        {
          text: '실종된 이의 아우를 찾아본다.',
          once: true,
          next: 'inv_brother_01'
        },
        /*
         * [원문] 조건: clue_village
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
         * 아전을 한 번 만난 뒤에야 관아를 찾아갈 이유가 생긴다
         */
        {
          text: '고을 관아의 문서를 엿본다.',
          once: true,
          when: function (s) { return s.has('found_village'); },
          next: 'inv_office_01'
        },
        {
          text: '모은 것을 들고, 사람을 추궁하러 간다.',
          tag: '진행',
          when: function (s) { return L['단서둘이상'].fn(s); },
          next: 'b1_intro'
        },
        {
          text: '아직 아는 것이 없다. 밤길을 더 살핀다.',
          when: function (s) { return !L['단서둘이상'].fn(s); },
          next: 'hub_wait'
        }
      ]
    },

    hub_wait: {
      id: 'hub_wait', bg: 'village',
      lines: [
        { cls: 'narration', text: '어긋난 것을 찾으려면 먼저 제대로 된 것을 알아야 한다. 아직 이 마을의 결을 모른다.' },
        { cls: 'thought', text: '적어도 두 군데는 짚어봐야겠다.' }
      ],
      next: 'hub'
    },

    /*
     * [원문] 플래그: clue_village
     * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
     * — 탐문: 마을 사람들 —
     */
    inv_village_01: {
      id: 'inv_village_01', bg: 'village',
      sfx: '문 여닫히는 소리. 그리고 이어지는 침묵.',
      lines: [
        { cls: 'narration', text: '아홉 집을 두드려 세 집이 열렸다. 나머지는 인기척만 죽였다.' },
        { who: '아낙', text: '없어진 게 넷이오. 넷 다 혼담이 오가던 **총각**들이지. 아, 우리 애는 아직 어리오. 어리다니까.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '혼담이 오간 총각들만 사라졌다는 말입니까.' },
        { who: '아낙', text: '그러니 무섭지. 시집 못 가고 죽은 처녀 귀신이 저 갈 길 못 갔다고 남의 혼사를 물어뜯는 거요.' },
        /*
         * 배경 압력 ① 문서가 사람을 규정한다 (1부 플롯 v3.0 2.1항).
         * 사건 없이 소문으로만 흘린다. 금옥의 혼서가 불탄 일과 같은 축에 있음을 플레이어가 느끼게 한다.
         */
        { who: '아낙', text: '요즘은 호패 조사가 어찌나 심한지. 남의 호패를 차고 다니다 잡힌 사람이 나왔다지 않소. 그 고을 원이 분해서 잠을 못 잤다더이다.' },
        // 배경 압력 ③ 역병 소문 — 1611년부터 온역이 돌기 시작했다. 아직 대유행은 아니다(2부 예고)
        { who: '아낙', text: '게다가 남쪽 고을에서는 병까지 돈다 하오. 아직 이 고을엔 안 왔다지만, 소문이 먼저 오니 마음이 편해야지.' }
      ],
      set: { found_village: true },
      next: 'inv_village_02'
    },

    inv_village_02: {
      id: 'inv_village_02', bg: 'village',
      lines: [
        { cls: 'narration', text: '넷의 내림을 따져 물었다. 하나는 죽은 정혼자의 사촌, 하나는 중매 서던 박 서방의 아들이었다.' },
        /*
         * [원문] 표시: 단서 / [단서] 사라진 넷은 모두 혼담이 오가던 총각이며, 그중 둘은 **그 혼사에 얽힌 집안** 사람이다. 무작위가 아니다.
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다. 증좌첩에 오르지 않으므로 «[단서]» 표시를 뗐다.
         */
        { cls: 'thought', text: '사라진 넷은 모두 혼담이 오가던 총각이며, 그중 둘은 **그 혼사에 얽힌 집안** 사람이다. 무작위가 아니다.' },
        { cls: 'narration', text: '원혼의 이름을 물으니 하나같이 같은 이름을 댔다. 금옥(琴玉). 몇 해 전, 혼례를 코앞에 두고 죽었다는 처녀.' },
        { who: '아전', text: '거기, 낯선 자. 무슨 연유로 남의 고을 사정을 캐고 다니오?' },
        { who: '신은호', text: '지나는 길에 들은 것이 있어서요.' },
        { who: '아전', text: '들은 것은 잊으시오. 관에서 병으로 죽은 것으로 다 정리한 일이오. 굶어 죽는 사람이 열이면 열인 세상에, 귀신 이야기까지 얹을 여유가 어디 있소.' },
        { cls: 'thought', text: '덮으려는 쪽이 먼저 나선다. 어긋난 것 하나.' },
        /*
         * 배경 압력 ② 말 세 마디로 사람이 갇힌다 + 좌도는 죄목이다 (플롯 v3.0 2.1항).
         * 1부에서는 설명하지 않는다. 아전의 태도와, 신은호가 이름을 대지 않는 행동으로만 보여준다.
         * 이 규칙이 실체를 드러내는 것은 3부에서 그가 피의자가 될 때다.
         */
        { who: '아전', text: '요즘은 말 세 마디 잘못 놀렸다고 옥에 갇히는 세상이오. 말조심하시오. …그래, 성함이나 알려주시오. 문서에 올려야 하니.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_cold
        { who: '신은호', portrait: 'eunho_cold', text: '지나가는 사람에게 문서에 오를 이름은 없습니다.' },
        { cls: 'narration', text: '아전의 눈이 한 번 가늘어졌다. 그는 더 캐묻지 않았다. 묻지 않는 편이 자기에게 안전하다는 것을 아는 얼굴이었다.' }
      ],
      next: 'hub'
    },

    /*
     * — 탐문: 사당 —
     * 에셋 적용(2026-10-07) — 배경 shrine → shrine_interior
     */
    inv_shrine_01: {
      id: 'inv_shrine_01', bg: 'shrine_interior', bgm: 'investigate',
      sfx: '문풍지가 안쪽에서 밀리듯 떨렸다.',
      lines: [
        // 배경 에셋([BG 2] 금옥의 낡은 사당)의 당산나무·오색천을 묘사에 맞춘다
        { cls: 'narration', text: '산길 어귀, 당산나무 아래에 서낭당이 웅크리고 있었다. 늙은 줄기를 감은 오색천이 눈발에 젖어 무겁게 늘어져 있었다.' },
        /*
         * [원문] 사당이라기엔 초라했다. 위패도 없이, 혼례에나 쓰는 붉은 천 한 폭이 서까래에 걸려 있었다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '사당이라기엔 초라했다. 위패도 없이, 혼례에나 쓰는 바랜 흰 천 한 폭이 서까래에 걸려 있었다.' },
        { cls: 'thought', text: '제사를 받는 곳이 아니다. 혼례를 흉내 낸 곳이다.' },
        /*
         * 플롯 5항: 손각시는 대사 없이 형상과 곡소리로만 존재를 암시한다.
         * 에셋 적용(2026-09-25) — 표정 songaksi_01
         */
        { cls: 'whisper', slow: true, portrait: 'songaksi_01', text: '— 가마는… 언제 오는가…' },
        { cls: 'narration', text: '말이 아니었다. 곡소리가 말의 꼴을 얻은 것이었다.' },
        { cls: 'narration', text: '소리가 없어야 할 곳의 소리. 등줄기가 곤두섰지만, 아직 형체는 없다.' }
      ],
      next: 'inv_shrine_02'
    },

    /*
     * [원문] flags: clue_shrine, clue_honseo
     * 혼서 잔편은 집터로 옮기고, 사당에서는 물색 천을 얻는다(A-1).
     * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
     * 에셋 적용(2026-10-07) — 배경 shrine → shrine_interior
     */
    inv_shrine_02: {
      id: 'inv_shrine_02', bg: 'shrine_interior', bgm: 'investigate',
      lines: [
        { cls: 'narration', text: '천 아래에 함(函) 하나가 놓여 있었다. 예물을 담는 함이다.' },
        { cls: 'narration', text: '열어 보니 비어 있었다. 다만 무명이 눌린 자국과, 은자가 놓였던 자리의 흠만 남아 있었다.' },
        /*
         * [원문] 표시: 단서 / [단서] 예물함이 비어 있다. 누군가 내용을 가져갔고, 함만 남겨 두었다.
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다. 증좌첩에 오르지 않으므로 «[단서]» 표시를 뗐다.
         * 에셋 적용(2026-10-07) — 소품 이미지 yemul_box
         */
        { cls: 'thought', prop: 'yemul_box', text: '예물함이 비어 있다. 누군가 내용을 가져갔고, 함만 남겨 두었다.' },
        // 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. «사당의 물색 천 — 매듭이 두 번». 풀기획서 7.10 대표 이미지(물색 천이 걸린 당산나무)와 같은 자리다. 배드 엔딩 후일담의 «새 물색 천» 과 짝을 이룬다.
        { cls: 'narration', text: '사당을 돌아 나오다 당산나무 아래서 걸음을 멈췄다. 줄기에 감긴 물색 천 가운데 한 폭만 매듭이 달랐다.' },
        { cls: 'narration', text: '최근에 건 것이 아니었다. 색이 바랬고, **매듭이 두 번** 묶여 있었다.' },
        // 헤르메스 에셋 적용(2026-09-25) — 소품 이미지 mulsaek_cloth
        { cls: 'clue', prop: 'mulsaek_cloth', text: '[단서] 사당의 물색 천 — 색이 바랜 천 한 폭. 매듭이 두 번 묶여 있다.' },
        { cls: 'thought', text: '한 번 묶는 것은 비는 것이다. 두 번 묶는 것은 — 무언가를 맺어 두는 것이다.' }
      ],
      set: { found_shrine: true, clue_mulsaek: true },
      next: 'hub'
    },

    /*
     * 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. 혼서 잔편은 사당 예물함이 아니라 금옥의 집터에서 나온다. 사당에서 옮겨 온 대사(잔편 · 전우치의 «탄 것»)를 이어 붙였다.
     * 에셋 적용(2026-10-07) — 배경 village → geumok_house_ruin
     */
    inv_house_01: {
      id: 'inv_house_01', bg: 'geumok_house_ruin',
      sfx: '재가 발밑에서 부서지는 소리.',
      lines: [
        { cls: 'narration', text: '금옥의 집은 마을에서 제일 먼저 탄 집이라 했다. 주춧돌과 그을린 기둥 둘만 남아 있었다.' },
        { cls: 'narration', text: '아무도 치우지 않았다. 숙부는 조카가 죽자 이 터를 그대로 두고 제 집으로 갔다고 했다.' },
        { cls: 'narration', text: '부엌 자리의 재를 헤치다 손끝에 종이가 걸렸다. 불에 그슬려 반이 없어진 조각이다.' },
        { cls: 'narration', slow: true, text: '남은 글자는 여섯 자뿐이었다. — **「…婚書…銀子…無名…」**' },
        // 헤르메스 에셋 적용(2026-09-25) — 소품 이미지 honseo_burnt
        { cls: 'clue', prop: 'honseo_burnt', text: '[단서] 불탄 혼서(婚書) 잔편 — 글자 몇 자만 남았다. 은자와 무명 두 글자가 읽힌다. 나머지는 재.' },
        { cls: 'thought', text: '증서의 반쪽. 이것으로는 아무것도 증명하지 못한다. — 아니, 하나는 증명한다. **증서가 있었다는 사실.**' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_amused
        { who: '전우치', portrait: 'jeonwoochi_amused', text: '어허, 여기 있었군.' },
        { who: '신은호', text: '술 드신다더니.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '마시면서 왔다. ……그건 태운 게 아니라 **탄 것**이다. 태우려는 자는 자를 대고 태우지 않아.' },
        { cls: 'thought', text: '전란에 탔다는 말이다. 그러니 누구의 죄도 아니고, 그래서 누구든 죄를 지을 수 있었다.' }
      ],
      set: { clue_honseo: true },
      next: 'hub'
    },

    /*
     * — 탐문: 실종자의 아우 —
     * 에셋 적용(2026-10-07) — 배경 house → brother_shed
     */
    inv_brother_01: {
      id: 'inv_brother_01', bg: 'brother_shed',
      lines: [
        { cls: 'narration', text: '마을 끝 헛간에서 젊은 사내를 찾았다. 윤복. 죽은 정혼자의 아우이자, 이번에 사라진 총각의 동생이었다.' },
        { who: '윤복', text: '큰형은 전란에 끌려가 돌아오지 못했소. 그 형의 혼사가 금옥 낭자와의 혼담이었지요.' },
        { who: '윤복', text: '그리고 이번엔 작은형이 없어졌소. 관에서는 혼사 앞두고 겁이 나서 스스로 나간 거라 합디다.' },
        { who: '윤복', text: '그럴 사람이 아니오. 형은 그날 밤, 누가 불렀다고 나갔소.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '누가.' },
        /*
         * [원문] 중매 서던 박 서방이오. 사당에서 볼 일이 있다고.
         * 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. «정혼자 동생의 증언 — 혼수 이야기로 다투었다. 누구와 다투었는지는 못 들었다».
         * 에셋 적용(2026-09-25) — 표정 brother_afraid
         */
        { who: '윤복', portrait: 'brother_afraid', text: '…모르오. 다만 그 전날, 형이 **혼수 이야기로** 누구와 크게 다투었소. 누구와인지는 못 들었소.' },
        // A-1 소견 «다툰 상대를 모른다는 말과, 말하지 않겠다는 말은 다르다» 의 방향. 윤복 자신도 혼담이 있어 겁을 먹고 있다(같은 장면 끝 대사).
        { cls: 'thought', text: '못 들었다는 얼굴이 아니었다. 말하지 않겠다는 얼굴이었다.' }
      ],
      set: { clue_brother: true },
      next: 'inv_brother_02'
    },

    /*
     * [원문] flags: clue_yemul
     * 예물 품목 쪽지는 박 서방 추궁(b1_bak_02)에서 나온다 — 풀기획서 부록 A-1(1부 증좌첩 6점) 기준.
     * 에셋 적용(2026-10-07) — 배경 house → brother_shed
     */
    inv_brother_02: {
      id: 'inv_brother_02', bg: 'brother_shed',
      lines: [
        /*
         * [원문] [단서] 실종 당일, 박 서방이 사당으로 불러냈다.
         * 풀기획서 부록 A-1(1부 증좌첩 6점) 기준.
         * 에셋 적용(2026-09-25) — 소품 증언 기본 아이콘(testimony_01) — 증좌첩과 같은 그림
         */
        { cls: 'clue', prop: 'testimony_01', text: '[단서] 정혼자 동생의 증언 — 형이 사라지기 전 «혼수 이야기로 다투었다». 누구와 다투었는지는 못 들었다고 했다.' },
        { who: '윤복', text: '한 가지 더. 큰형은 못 왔지만, 우리 집이 보낸 **예물은 이미 낭자 집에 들어가 있었소.**' },
        { who: '윤복', text: '사람은 못 오고 물건만 간 게지요. 그 물건 때문에 두 집이 한참 시끄러웠소.' },
        { cls: 'thought', text: '사람은 오지 않고, 물건만 갔다. 그리고 그 물건은 지금 함에 없다.' },
        { who: '윤복', text: '반환을 청했소. 사람이 못 갔으니 물건은 돌려받는 게 법도라고. 그런데 그쪽에서 뭐라 한 줄 아시오?' },
        { who: '윤복', slow: true, text: '**"애초에 그런 문서는 없었다."** …그 한마디로 끝이었소.' },
        { cls: 'thought', slow: true, text: '문서가 없으면 없던 일이 된다. — 이 세상은 지금 그 말이 통하는 세상이다.' },
        // 에셋 적용(2026-09-25) — 표정 brother_afraid
        { who: '윤복', portrait: 'brother_afraid', text: '나도 이제 혼담이 있소. …다음이 나일지도 모른다는 생각을 요 며칠 하오.' }
      ],
      set: { clue_brother: true },
      next: 'hub'
    },

    /*
     * [원문] 배경: house
     * — 탐문: 고을 관아 —
     * 고증 소품 ③ 첩정(牒呈) 초안.
     * 하급 관아가 상급 관아에 올리는 보고 양식이며, 실종을 '역병으로 인한 유랑'으로
     * 처리하려던 흔적이 남아 있다. 관이 괴이를 문서로 인정하지 않는다는 세계관 규칙(기획서 2.3항)이
     * 대사가 아니라 물건으로 드러나는 자리다.
     * 에셋 적용(2026-09-25) — 관아 배경(gwana, 관아 마당). ⚠ 본문은 «방 두 칸 · 서안»이라 마당 그림과 맞지 않는다 — 본문을 마당·문간 톱으로 고칠지 실내 배경을 새로 받을지 결정 필요
     * 에셋 적용(2026-10-07) — 배경 gwana → gwana_office
     */
    inv_office_01: {
      id: 'inv_office_01', bg: 'gwana_office',
      sfx: '먹이 마르지 않은 냄새.',
      lines: [
        { cls: 'narration', text: '관아라기엔 방 두 칸이었다. 아전은 자리에 없고, 서안 위에 쓰다 만 문서가 눌려 있었다.' },
        { cls: 'narration', text: '**첩정(牒呈)** — 하급 관아가 위로 올리는 보고서다. 아직 초안이라 고친 자리가 그대로 보였다.' },
        { cls: 'narration', slow: true, text: '「본월 실종 사인(四人)은 —」 여기서 붓이 멈췄고, 그 아래 지운 글자와 새로 쓴 글자가 겹쳐 있었다.' },
        { cls: 'narration', text: '지운 것은 「행방불명」. 새로 쓴 것은 **「역병으로 인한 유랑(流浪)」.**' },
        { cls: 'clue', prop: 'prop_cheopjeong', text: '[단서] 첩정 초안. 아전은 실종 넷을 역병 유랑민으로 고쳐 올리려 했다. 관은 사람이 사라진 일도, 괴이도 문서에 남기지 않는다.' },
        { cls: 'thought', text: '유랑으로 올리면 찾을 의무가 없어진다. 죽었다고 올리면 캐물을 사람이 생기고.' },
        { cls: 'thought', slow: true, text: '이 고을에서 사라진 것은 사람만이 아니다. **사람이 사라졌다는 기록**도 함께 사라지는 중이었다.' }
      ],
      set: { clue_cheopjeong: true },
      next: 'inv_office_02'
    },

    /*
     * [원문] 배경: house
     * 에셋 적용(2026-09-25) — 관아 배경(gwana, 관아 마당). ⚠ 본문은 «방 두 칸 · 서안»이라 마당 그림과 맞지 않는다 — 본문을 마당·문간 톱으로 고칠지 실내 배경을 새로 받을지 결정 필요
     * 에셋 적용(2026-10-07) — 배경 gwana → gwana_office
     */
    inv_office_02: {
      id: 'inv_office_02', bg: 'gwana_office',
      lines: [
        // 에셋 적용(2026-09-25) — 표정 ajeon_evasive
        { who: '아전', portrait: 'ajeon_evasive', text: '…누가 남의 서안을 뒤지라 하였소!' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '역병으로 유랑을 갔다는 넷 가운데, 하나는 어젯밤 사당에서 신발이 나왔다 들었습니다.' },
        { cls: 'narration', text: '아전의 손이 문서를 덮었다. 그러나 덮는 손이 이미 답이었다.' },
        // 에셋 적용(2026-09-25) — 표정 ajeon_evasive
        { who: '아전', portrait: 'ajeon_evasive', text: '…위에서 역병 아닌 일로 사람이 없어졌다 하면, 이 고을에 조사관이 내려오오. 조사관이 내려오면 곡식이 나가지, 들어오지 않소.' },
        // 에셋 적용(2026-09-25) — 표정 ajeon_evasive
        { who: '아전', portrait: 'ajeon_evasive', text: '나는 이 고을 사람 굶기지 않는 쪽을 골랐소. 그게 죄면 죄지.' },
        // 관이 괴이를 덮는 이유가 하나 더 있다 — 좌도의 술사를 불렀다는 기록이 남으면 곤란하다
        { who: '아전', text: '그리고 하나 더. 그쪽 같은 사람이 하는 일은 법에서 좌도(左道)라 부르지 않소. 그런 자를 불러들였다고 문서에 한 줄만 남아도 나 또한 무사치 못하오.' },
        { cls: 'narration', text: '대꾸하지 않았다. 대꾸할 말이 없어서가 아니라, 이 자리에서 내 이름이 한 글자라도 적히면 안 되기 때문이다.' },
        { cls: 'thought', text: '거짓말은 아니었다. 그래서 더 나빴다.' }
      ],
      next: 'hub'
    },


    /* ════════════════════════════════════════════════
     * 핵심 분기점 1 — "누구의 말을 먼저 믿을 것인가"
     * ════════════════════════════════════════════════ */

    b1_intro: {
      id: 'b1_intro', bg: 'village',
      lines: [
        { cls: 'narration', text: '두 사람의 이름이 남았다. 혼사를 붙이던 중매쟁이 박 서방과, 금옥의 유일한 혈족인 숙부.' },
        { cls: 'thought', text: '먼저 어느 쪽을 흔들지가, 이 뒤의 모든 것을 정한다.' }
      ],
      next: 'b1_choice'
    },

    b1_choice: {
      id: 'b1_choice', bg: 'village',
      prompt: '누구를 먼저 추궁하겠는가.',
      options: [
        {
          text: '박 서방을 추궁한다.',
          tag: '중매쟁이',
          next: 'b1_bak_01'
        },
        {
          text: '숙부를 추궁한다.',
          tag: '유일한 혈족',
          next: 'b1_uncle_01'
        }
      ]
    },

    /*
     * — 박 서방 루트 (진실에 더 가까운 길) —
     * 에셋 적용(2026-10-07) — 배경 house → bak_house
     */
    b1_bak_01: {
      id: 'b1_bak_01', bg: 'bak_house',
      lines: [
        { who: '박 서방', text: '아이고, 나야 마을 걱정에 잠도 못 자오. 애먼 젊은 것들이 넷이나… 그중에 내 아들도 있소!' },
        /*
         * [원문] 아들을 잃은 분이, 그 넷 중 하나를 실종된 날 밤에 사당으로 부르셨더군요.
         * 동생의 증언이 더는 박 서방을 지목하지 않으므로(A-1), 신은호가 떠본다.
         * 에셋 적용(2026-09-25) — 표정 eunho_focused
         */
        { who: '신은호', portrait: 'eunho_focused', text: '아들을 잃은 분께 여쭙습니다. 사라진 총각 하나가, 그 전날 혼수 일로 누구와 다투었다 합니다.' },
        { cls: 'narration', text: '말이 끊겼다. 손이 무릎을 두 번 쓸었다.' },
        /*
         * [원문] …그건, 그건 예물 문기(文記)를 보여줄 일이 있어서요.
         * 에셋 적용(2026-09-25) — 표정 baksubang_nervous
         */
        { who: '박 서방', portrait: 'baksubang_nervous', text: '…그건, 그건 예물 문기(文記) 이야기였소. 보여줄 게 있다고 했을 뿐이오. 사당에서.' }
      ],
      next: 'b1_bak_02'
    },

    /*
     * [원문] flags: clue_bak, clue_uncle
     * 예물 품목 쪽지는 박 서방 추궁(b1_bak_02)에서 나온다 — 풀기획서 부록 A-1(1부 증좌첩 6점) 기준.
     * 혼서 잔편을 이미 쥐고 있으면 추궁이 한결 날카로워진다
     * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
     * 에셋 적용(2026-10-07) — 배경 house → bak_house
     */
    b1_bak_02: {
      id: 'b1_bak_02', bg: 'bak_house',
      lines: [
        /*
         * [원문] 문기는 전란에 탔지요. 사당 함 바닥에서 그 반쪽을 주웠습니다.
         * 혼서 잔편의 획득 장소가 집터로 바뀌었다.
         * 에셋 적용(2026-09-25) — 표정 eunho_focused
         */
        { who: '신은호', portrait: 'eunho_focused', text: '문기는 전란에 탔지요. 낭자의 집터에서 그 반쪽을 주웠습니다.', when: function (s) { return s.has('clue_honseo'); } },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '없는 문서를 보여주러 사람을 불러냈다는 말입니까. 함은 비어 있었습니다.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_cornered
        { who: '박 서방', portrait: 'baksubang_cornered', text: '……내가 가진 게 아니오! 나는 붙여만 줬소. 예물을 어디로 돌릴지 정한 건 내가 아니오!' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '그럼 누구입니까.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_cornered
        { who: '박 서방', portrait: 'baksubang_cornered', text: '…낭자의 숙부요. 혈족이 하겠다는 걸 내가 무슨 힘으로 막소.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_nervous
        { who: '박 서방', portrait: 'baksubang_nervous', text: '문기가 탔다고, 애초에 그런 게 없었다고 하면 된다더군. 정말 그렇게 되더이다.' },
        /*
         * [원문] 표시: 단서 / [단서] 박 서방의 실토 — 예물을 가로챈 것은 숙부다. "문서가 탔으니 없던 일이 된다"는 논리를 함께 실토했다.
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다. 증좌첩에 오르지 않으므로 «[단서]» 표시를 뗐다.
         */
        { cls: 'thought', text: '박 서방의 실토 — 예물을 가로챈 것은 숙부다. "문서가 탔으니 없던 일이 된다"는 논리를 함께 실토했다.' },
        // 예물 품목 쪽지는 박 서방 추궁(b1_bak_02)에서 나온다 — 풀기획서 부록 A-1(1부 증좌첩 6점) 기준.
        { cls: 'narration', text: '박 서방이 떨리는 손으로 소매에서 쪽지 한 장을 꺼냈다.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_nervous
        { who: '박 서방', portrait: 'baksubang_nervous', text: '중매 서는 사람은 품목을 적어 두오. 받을 사람 이름은… 적지 않았소. 누구 것이 될지 몰라서.' },
        // 헤르메스 에셋 적용(2026-09-25) — 소품 이미지 yemul_note
        { cls: 'clue', prop: 'yemul_note', text: '[단서] 예물 품목 쪽지 — **은자 여남은 냥, 무명 여섯 필.** 받은 쪽 이름이 적힐 자리가 비어 있다.' },
        { cls: 'thought', text: '누구 것이 될지 몰라서 비워 둔 자리. 그 자리에 누구의 이름이 들어갔는지는 함이 말해 준다.' }
      ],
      set: { found_bak: true, found_uncle: true, clue_yemul: true },
      next: 'b1_bak_03'
    },

    // 에셋 적용(2026-10-07) — 배경 house → bak_house
    b1_bak_03: {
      id: 'b1_bak_03', bg: 'bak_house',
      lines: [
        /*
         * 에셋 적용(2026-09-25) — 표정 baksubang_nervous
         * 에셋 적용(2026-10-07) — 소품 이미지 door_blind
         */
        { who: '박 서방', portrait: 'baksubang_nervous', prop: 'door_blind', text: '낭자가 앓아누웠을 때, 그 집 문에 발이 쳐 있었소. 사람이 못 들어가게.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_cornered
        { who: '박 서방', portrait: 'baksubang_cornered', text: '나는 그걸 보고도 혼사 이야기나 하고 다녔소. …그것이 내 죄면 내 죄지, 죽인 건 내가 아니오.' },
        { cls: 'thought', text: '굶겨 죽였다. 병으로 죽은 게 아니라.' }
      ],
      next: 'b2_intro'
    },

    /*
     * [원문] flags: (빈칸)
     * 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. «숙부의 세간».
     * — 숙부 루트 (우회하는 길: 시간은 걸리지만 위선이 드러난다) —
     * 헤르메스 에셋 적용(2026-09-25) — 숙부의 방 전용 배경(uncle_house)이 생겼다. 옛 house 는 동헌 더미였다.
     */
    b1_uncle_01: {
      id: 'b1_uncle_01', bg: 'uncle_house',
      lines: [
        { cls: 'narration', text: '숙부의 방은 이 마을에서 유일하게 군불이 넉넉했다.' },
        // 풀기획서 부록 A-1(1부 증좌첩 6점) 기준. «숙부의 세간 — 잔반의 살림에 어울리지 않는 물건 몇. 무명이 궤 안에».
        { cls: 'narration', text: '잔반의 살림이라 하기엔 방이 넉넉했다. 새로 들인 문갑, 칠 냄새가 채 가시지 않은 궤.' },
        { cls: 'narration', text: '궤 문이 조금 열려 있었다. 안에 **무명**이 개켜져 있었다. 한두 필이 아니었다.' },
        // 헤르메스 에셋 적용(2026-09-25) — 소품 이미지 myeongju
        { cls: 'clue', prop: 'myeongju', text: '[단서] 숙부의 세간 — 잔반의 살림에 어울리지 않는 물건 몇. 무명이 궤 안에 개켜져 있다.' },
        { cls: 'thought', text: '눈에 담아 두었다. 묻지는 않았다. 물으면 이 사람은 궤부터 닫을 것이다.' },
        { who: '숙부', text: '조카의 일로 오셨소? 그 애 이야기는 아직도 내 목에 걸려 있소.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_cold
        { who: '신은호', portrait: 'eunho_cold', text: '예물함이 비어 있었습니다.' },
        // 이 대사가 굿 엔딩 추궁의 핵심 모순이 된다 — "없다"와 "팔았다"는 한 입에서 나올 수 없다
        { who: '숙부', text: '전란이었소. 다 뜯어 팔아 사람들 입에 넣었지. 그것도 죄라면 나는 죄인이오.' },
        /*
         * [원문] 은자 열두 냥, 무명 여섯 필이 들어왔다 들었습니다.
         * 숙부 루트에서는 품목 쪽지가 없으므로 액수를 말하지 않는다. 액수는 풀기획서 «은자 여남은 냥».
         * 에셋 적용(2026-09-25) — 표정 eunho_cold
         * 에셋 적용(2026-09-25) — 소품 숙부에게 내미는 은자(silver_nyang)
         */
        { who: '신은호', portrait: 'eunho_cold', prop: 'silver_nyang', text: '은자와 무명이 적지 않게 들어왔다 들었습니다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_firm
        { who: '숙부', portrait: 'uncle_firm', text: '누가 그런 말을 하오? 문기(文記)를 가져오시오. 문기가 있으면 내가 답하겠소.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_cold
        { who: '신은호', portrait: 'eunho_cold', text: '전란에 탔습니다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_firm
        { who: '숙부', slow: true, portrait: 'uncle_firm', text: '**그럼 애초에 그런 문서는 없었던 것이오.**' }
      ],
      set: { clue_segan: true },
      next: 'b1_uncle_02'
    },

    /*
     * [원문] 배경: house
     * 헤르메스 에셋 적용(2026-09-25) — 숙부의 방 전용 배경(uncle_house)이 생겼다. 옛 house 는 동헌 더미였다.
     */
    b1_uncle_02: {
      id: 'b1_uncle_02', bg: 'uncle_house',
      lines: [
        { cls: 'narration', text: '말이 매끄러웠다. 너무 매끄러웠다. 준비된 대답은 늘 결이 없다.' },
        { cls: 'thought', text: '없던 일이 된다. 사람 하나가 그 말 한마디에 실려 없어졌다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_cold
        { who: '숙부', portrait: 'uncle_cold', text: '정 궁금하면 박 서방을 잡으시오. 그자가 혼담을 몇 집에 겹쳐 붙였소. 조카가 죽자 제일 먼저 함을 열어본 것도 그자요.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '증인이 있습니까.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_firm
        { who: '숙부', portrait: 'uncle_firm', text: '이 마을 사람 아무나 붙잡고 물으시오. 나는 조카를 묻은 사람이오. 파낸 사람이 아니오.' },
        /*
         * [원문] 표시: 단서 / [단서] 숙부는 즉시 박 서방에게 죄를 넘겼다. 준비된 대답이다. — 다만 이것만으로는 물증이 아니다.
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다. 증좌첩에 오르지 않으므로 «[단서]» 표시를 뗐다.
         */
        { cls: 'thought', text: '숙부는 즉시 박 서방에게 죄를 넘겼다. 준비된 대답이다. — 다만 이것만으로는 물증이 아니다.' }
      ],
      set: { uncle_mask: true },
      next: 'b1_uncle_03'
    },

    /*
     * [원문] 배경: house
     * 헤르메스 에셋 적용(2026-09-25) — 숙부의 방 전용 배경(uncle_house)이 생겼다. 옛 house 는 동헌 더미였다.
     */
    b1_uncle_03: {
      id: 'b1_uncle_03', bg: 'uncle_house',
      lines: [
        { cls: 'thought', text: '이 사람은 내가 무엇을 아는지 먼저 알아내려 한다. 여기서 더 캐면 오히려 내가 읽힌다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_cold
        { who: '숙부', portrait: 'uncle_cold', text: '그런데 젊은 사람, 그 눈은 어디서 배웠소? 보통 눈이 아니오.' },
        { cls: 'narration', text: '등이 얼었다. 사주를 숨기고 살라던 말이 이럴 때 떠오른다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_cold
        { who: '신은호', portrait: 'eunho_cold', text: '…밤길을 오래 걸었을 뿐입니다.' },
        { cls: 'narration', text: '물러 나왔다. 손에 남은 것은 위선의 감촉 하나. 물증은 아직 없다.' }
      ],
      next: 'b2_intro'
    },


    /* ════════════════════════════════════════════════
     * 핵심 분기점 2 — "요괴와 마주쳤을 때의 태도"
     * ════════════════════════════════════════════════ */

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    b2_intro: {
      id: 'b2_intro', bg: 'old_shrine_night',
      sfx: '가마가 오지 않는 밤. 혼례 노래가 반 소절만 반복된다.',
      lines: [
        /*
         * [원문] 사당으로 돌아가는 길에 소리가 앞질렀다. 붉은 천이 바람 없이 부풀었다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '사당으로 돌아가는 길에 소리가 앞질렀다. 흰 천이 바람 없이 부풀었다.' },
        { cls: 'narration', slow: true, text: '천 안쪽에, 앉은 키만 한 형체가 고개를 숙이고 있었다. 머리에는 **쓰지 못한 족두리.**' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_01
        { cls: 'whisper', slow: true, portrait: 'songaksi_01', text: '— 가마는… 아직인가…' },
        { cls: 'shout', text: '!!손각시.!! 시집가지 못한 혼이다.' }
      ],
      next: 'b2_choice'
    },

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    b2_choice: {
      id: 'b2_choice', bg: 'old_shrine_night',
      prompt: '어떻게 하겠는가.',
      options: [
        {
          text: '말을 걸어, 한(恨)을 듣는다.',
          tag: '좌도방술',
          next: 'b2_talk_01'
        },
        {
          text: '부적으로 즉각 정화한다.',
          tag: '전투 우선',
          next: 'b2_fight_01'
        }
      ]
    },

    /*
     * — 대화 루트 —
     * 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
     */
    b2_talk_01: {
      id: 'b2_talk_01', bg: 'old_shrine_night',
      lines: [
        { cls: 'narration', text: '부적을 쥔 손을 내렸다. 좌도의 공법(功法)은 이럴 때 쓴다 — 이름을 부르고, 대답을 기다리는 것.' },
        { who: '신은호', text: '금옥 낭자.' },
        { cls: 'narration', slow: true, text: '숙였던 고개가 아주 천천히 들렸다. 얼굴이 있어야 할 자리에는, 혼례 화장을 반쯤 지운 흔적만 있었다.' },
        /*
         * 발화가 아니라 곡소리가 말의 결을 얻는 형태로만 전달한다
         * 에셋 적용(2026-09-25) — 표정 songaksi_01
         */
        { cls: 'spirit', slow: true, portrait: 'songaksi_01', text: '— 내 이름을 부르는 사람이, 아직 있는가.' }
      ],
      next: 'b2_talk_02'
    },

    /*
     * [원문] 플래그: clue_hansu
     * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
     * 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
     */
    b2_talk_02: {
      id: 'b2_talk_02', bg: 'old_shrine_night',
      lines: [
        { who: '신은호', text: '가마를 기다리시는군요. 왜 오지 않았는지 아십니까.' },
        /*
         * 에셋 적용(2026-09-25) — 표정 songaksi_01
         * 에셋 적용(2026-10-07) — 소품 이미지 door_blind
         */
        { cls: 'spirit', portrait: 'songaksi_01', prop: 'door_blind', text: '— 문에 발이 쳐 있었다. 안에서 부르는데 아무도 걷지 않았다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_01
        { cls: 'spirit', slow: true, portrait: 'songaksi_01', text: '— 내 함을 여는 소리를 들었다. 무명이 스치는 소리, 은자가 부딪는 소리를. 나는 그때 **아직 숨이 있었다.**' },
        { cls: 'narration', text: '숨이 있었다. 물건이 나갈 때, 사람은 아직 살아 있었다는 말이다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '함을 연 사람이 누구였습니까.' },
        /*
         * 에셋 적용(2026-09-25) — 표정 songaksi_01
         * 에셋 적용(2026-09-25) — 소품 금옥의 증언 — 증언 심화 아이콘(testimony_02)
         */
        { cls: 'spirit', slow: true, portrait: 'songaksi_01', prop: 'testimony_02', text: '— 나를 **업어 키운 손**이었다.' }
      ],
      set: { found_hansu: true },
      next: 'b2_talk_03'
    },

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    b2_talk_03: {
      id: 'b2_talk_03', bg: 'old_shrine_night',
      lines: [
        /*
         * [원문] 표시: 단서 / [단서] 예물이 빠져나갈 때 금옥은 아직 살아 있었다. 함을 연 것은 그를 키운 혈족 — 숙부다.
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다. 증좌첩에 오르지 않으므로 «[단서]» 표시를 뗐다.
         */
        { cls: 'thought', text: '예물이 빠져나갈 때 금옥은 아직 살아 있었다. 함을 연 것은 그를 키운 혈족 — 숙부다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_01
        { cls: 'spirit', portrait: 'songaksi_01', text: '— 혼담이 오간다는 소리가 들리면… 참을 수가 없다. 내 가마인 줄 알고 나가게 된다.' },
        { cls: 'narration', text: '형체가 흐려졌다. 원한이 사람을 고르는 게 아니라, 원한이 사람을 착각하는 것이었다.' },
        { cls: 'thought', text: '이 혼은 가해자가 아니다. 방치된 채로 굳은 피해자다.' }
      ],
      next: 'climax'
    },

    /*
     * — 전투 루트 —
     * 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
     */
    b2_fight_01: {
      id: 'b2_fight_01', bg: 'old_shrine_night',
      sfx: '부적이 마르며 찢어지는 소리.',
      lines: [
        /*
         * [원문] 부적을 뽑아 던졌다. 결이 붉게 타올랐고, 형체가 찢어질 듯 휘었다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         * 에셋 적용(2026-10-07) — 소품 이미지 talisman_fresh
         * 예외 범위는 부적의 «글씨(주사)»뿐이다. 불꽃 색 «푸르스름하게» 는 v0.6.5 결정 그대로 두었다 — 불꽃도 붉게 되돌릴지는 사용자 확인 필요.
         */
        { cls: 'narration', prop: 'talisman_fresh', text: '부적을 뽑아 던졌다. 결이 푸르스름하게 타올랐고, 형체가 찢어질 듯 휘었다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_02
        { cls: 'shout', portrait: 'songaksi_02', text: '— 또… !!또 나를 밀어내는가.!!' }
      ],
      onEnter: function (s) { s.bump('combat_first'); },
      next: 'b2_fight_02'
    },

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    b2_fight_02: {
      id: 'b2_fight_02', bg: 'old_shrine_night',
      lines: [
        /*
         * [원문] 붉은 천이 몸을 감았다. 목이 아니라 **손목**을 조였다 — 문에 발을 치던 그 손을 찾는 것처럼.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', slow: true, text: '흰 천이 몸을 감았다. 목이 아니라 **손목**을 조였다 — 문에 발을 치던 그 손을 찾는 것처럼.' },
        { cls: 'narration', text: '숨이 막히는 순간, 결 하나가 앞을 갈랐다.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '이 아이는 겁이 나서 문을 잠근 손을 찾는 거다. 네 손을 그 손으로 착각하게 만들면, 네가 죽는다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_shaken
        { who: '신은호', portrait: 'eunho_shaken', text: '…스승님.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_amused
        { who: '전우치', portrait: 'jeonwoochi_amused', text: '한 번은 봐준다. 두 번은 시체를 치울 사람이 없어.' }
      ],
      next: 'b2_fight_03'
    },

    /*
     * 전투 우선을 두 번 반복하면 사건의 진상에 닿지 못한 채 강제로 봉인만 하고 끝난다(배드엔딩 B).
     * 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
     */
    b2_fight_03: {
      id: 'b2_fight_03', bg: 'old_shrine_night',
      lines: [
        /*
         * [원문] 형체는 사당 안으로 물러났다. 아무것도 알아내지 못했고, 손목에는 붉은 자국만 남았다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '형체는 사당 안으로 물러났다. 아무것도 알아내지 못했고, 손목에는 하얗게 눌린 자국만 남았다.' }
      ],
      next: L['전투반복'].fn
    },

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    b2_choice_2: {
      id: 'b2_choice_2', bg: 'old_shrine_night',
      prompt: '다시 사당 앞이다. 이번에는 어떻게 하겠는가.',
      options: [
        {
          text: '이번에는 말을 걸어본다.',
          tag: '좌도방술',
          next: 'b2_talk_01'
        },
        {
          text: '이번엔 반드시 정화한다.',
          tag: '전투 우선',
          next: 'b2_fight_01'
        }
      ]
    },


    /* ════════════════════════════════════════════════
     * 클라이맥스 — 지범 지목
     * ════════════════════════════════════════════════ */

    climax: {
      id: 'climax', bg: 'shrine',
      lines: [
        { cls: 'narration', text: '새벽이 오기 전, 사당 앞에 사람이 모였다. 아전이 관의 이름으로 마무리를 지으려 했기 때문이다.' },
        { who: '아전', text: '병으로 죽은 처녀 귀신 소동은 오늘로 끝이오. 이 자가 무슨 소리를 하든 관과는 무관하오.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '그래도 이름은 불러줘야 저 아이가 간다. 누가 저 아이를 저리 만들었는지, 여기서 말해라.' },
        { cls: 'thought', slow: true, text: '틀리면 저 혼은 나를 **그 손**으로 착각한다.' }
      ],
      next: 'climax_choice'
    },

    /*
     * 확증 조건 — 지목이 옳아도 증좌가 없으면 한이 풀리지 않는다.
     *  (가) 박 서방의 실토: 혼수를 돌린 것이 숙부라는 증언 자체가 물증이 된다
     *  (나) 손각시의 증언 + 빈 혼수함: 증언만으로는 관에 내놓을 수 없고,
     *       "숨이 있는 동안 물건이 빠져나갔다"는 물증(함의 흔적)이 함께 있어야 성립
     */
    climax_choice: {
      id: 'climax_choice', bg: 'shrine',
      prompt: '지범으로 누구를 지목하겠는가.',
      options: [
        {
          text: '중매쟁이 박 서방을 지목한다.',
          next: 'e_bad_a'
        },
        {
          text: '금옥의 숙부를 지목한다.',
          next: L['숙부지목'].fn
        }
      ]
    },

    /*
     * — 굿 엔딩 루트 —
     * 여기서 쓰는 지렛대는 루트에 따라 다르다.
     *  - 숙부를 직접 만난 회차: 그가 흘린 "다 뜯어 팔았다"와 "그런 문서는 없었다"의 자기모순
     *  - 박 서방을 먼저 흔든 회차: 중매쟁이의 실토와 사가 사본
     * 어느 쪽도 없이 여기까지 오지는 못한다(climax_choice 의 확증 조건).
     */
    gd_01: {
      id: 'gd_01', bg: 'shrine',
      lines: [
        /*
         * 에셋 적용(2026-09-25) — 표정 eunho_resolved
         * 에셋 적용(2026-10-07) — 소품 이미지 door_blind
         */
        { who: '신은호', portrait: 'eunho_resolved', prop: 'door_blind', text: '금옥 낭자를 죽인 것은 굶주림이 아닙니다. 문에 쳐진 발입니다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_resolved
        { who: '신은호', portrait: 'eunho_resolved', text: '예물은 낭자가 아직 숨을 쉬는 동안 함에서 빠져나갔습니다. 함을 연 손은, 낭자를 업어 키운 손이었습니다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_firm
        { who: '숙부', portrait: 'uncle_firm', text: '…무슨 헛소리를. 문기를 대시오. 문기 없이 무슨 말을 하든—' },
        // 에셋 적용(2026-09-25) — 표정 eunho_resolved
        { who: '신은호', slow: true, portrait: 'eunho_resolved', text: '**문서 이야기를 하시는군요. 좋습니다.**' },
        // 에셋 적용(2026-09-25) — 표정 eunho_resolved
        { who: '신은호', portrait: 'eunho_resolved', text: '문기가 없었다면 예물이 들어온 일도 없겠지요. 그런데 어르신은 저를 앉혀두고 "다 뜯어 팔았다"고 하셨습니다.', when: function (s) { return s.has('uncle_mask'); } },
        // 에셋 적용(2026-09-25) — 표정 eunho_resolved
        { who: '신은호', portrait: 'eunho_resolved', text: '없던 물건을 어떻게 뜯어 파셨습니까.', when: function (s) { return s.has('uncle_mask'); } },
        { cls: 'narration', slow: true, text: '없다는 말과 팔았다는 말은 한 입에서 나올 수 없다. 문서를 지운 자는 제 말도 함께 지워야 했는데, 말은 태울 수 없는 것이었다.', when: function (s) { return s.has('uncle_mask'); } },
        /*
         * [원문] 조건: !uncle_mask & clue_bak
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
         * 에셋 적용(2026-09-25) — 표정 eunho_resolved
         */
        { who: '신은호', portrait: 'eunho_resolved', text: '문기를 붙인 중매쟁이가 이미 말했습니다. 예물을 어디로 돌릴지 정한 것은 어르신이라고.', when: function (s) { return !s.has('uncle_mask') && s.has('found_bak'); } },
        /*
         * [원문] 보내는 쪽 어머니가 손으로 베껴둔 품목이 남아 있습니다. 은자 열두 냥, 무명 여섯 필.
         * 예물 품목 쪽지는 박 서방 추궁(b1_bak_02)에서 나온다 — 풀기획서 부록 A-1(1부 증좌첩 6점) 기준.
         * 에셋 적용(2026-09-25) — 표정 eunho_resolved
         * 에셋 적용(2026-09-25) — 소품 법정에서 읽히는 예물 품목 쪽지(yemul_note)
         */
        { who: '신은호', portrait: 'eunho_resolved', prop: 'yemul_note', text: '중매쟁이가 적어 둔 품목이 남아 있습니다. 은자 여남은 냥, 무명 여섯 필. 받을 사람 이름만 비어 있습니다.', when: function (s) { return s.has('clue_yemul'); } },
        // [원문] 사가(私家)의 사본은 관에 힘이 없다. 그러나 사람들 앞에서 읽히는 데는 힘이 있었다.
        { cls: 'narration', text: '이름 없는 쪽지는 관에 힘이 없다. 그러나 사람들 앞에서 읽히는 데는 힘이 있었다.', when: function (s) { return s.has('clue_yemul'); } },
        // 에셋 적용(2026-09-25) — 표정 eunho_resolved
        { who: '신은호', portrait: 'eunho_resolved', text: '그리고 병으로 죽은 사람의 예물을 왜 병중에 옮기셨습니까. 죽은 뒤에 옮기면 될 것을.' }
      ],
      next: 'gd_02'
    },

    gd_02: {
      id: 'gd_02', bg: 'shrine',
      lines: [
        { cls: 'narration', text: '박 서방이 먼저 무릎을 꺾었다. 겁먹은 자는 늘 자기 몫만 덜어내려 한다.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_cornered
        { who: '박 서방', portrait: 'baksubang_cornered', text: '나는 붙여만 줬소! 발을 친 건 저 사람이오!' },
        /*
         * [원문] 붉은 천이 부풀었다. 이번에는 바람이 있었다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '흰 천이 부풀었다. 이번에는 바람이 있었다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_01
        { cls: 'spirit', slow: true, portrait: 'songaksi_01', text: '— 들렸다. 그 소리가.' }
      ],
      next: 'gd_03'
    },

    gd_03: {
      id: 'gd_03', bg: 'shrine',
      lines: [
        // 에셋 적용(2026-09-25) — 표정 uncle_cold
        { who: '숙부', slow: true, portrait: 'uncle_cold', text: '나는… 그 애를 묻어주었다. 굶는 입이 열이었어. **하나는 어차피 갈 애였고—**' },
        { cls: 'narration', text: '말끝이 스스로의 자백이 되는 순간이 있다. 이것이 그 순간이었다.' },
        // 에셋 적용(2026-09-25) — 표정 ajeon_evasive
        { who: '아전', portrait: 'ajeon_evasive', text: '…이건, 관에서 다시 봐야 할 일이오.' },
        { cls: 'thought', text: '덮으려던 자가 가장 먼저 편을 바꾼다. 이 또한 어긋난 것 하나.' }
      ],
      next: 'gd_04'
    },

    /*
     * 대화 루트로 진실을 직접 들은 회차에서만 마지막 한마디가 붙는다.
     * 에셋 적용(2026-10-07) — 배경 dawn → old_shrine_dawn
     */
    gd_04: {
      id: 'gd_04', bg: 'old_shrine_dawn',
      lines: [
        /*
         * [원문] 족두리가 제자리에 앉았다. 붉은 천이 처음으로 얌전히 내려왔다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '족두리가 제자리에 앉았다. 흰 천이 처음으로 얌전히 내려왔다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_01
        { cls: 'spirit', slow: true, portrait: 'songaksi_01', text: '— 가마는 오지 않았지만… **이름은 왔다.**' },
        { cls: 'narration', text: '형체가 옅어지며, 사당 안의 소리가 멎었다. 곡소리도, 노래도.' },
        /*
         * [원문] 조건: clue_hansu
         * clue_ 는 증좌첩 항목 전용(풀기획서 7.13.9). 부록 A-1 6점에 없는 판정용 사실이라 found_ 로 바꿨다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '손목의 눌린 자국이 사라져 있었다.', when: function (s) { return s.has('found_hansu'); } }
      ],
      next: 'gd_05'
    },

    // 에셋 적용(2026-10-07) — 배경 dawn → old_shrine_dawn
    gd_05: {
      id: 'gd_05', bg: 'old_shrine_dawn',
      lines: [
        { who: '전우치', text: '뭘 배웠나.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_exhausted
        { who: '신은호', portrait: 'eunho_exhausted', text: '요괴가 사람을 죽인 게 아니었습니다. 사람이 만든 것이 저 모습으로 남았을 뿐입니다.' },
        { who: '전우치', text: '……그래.' },
        { cls: 'narration', text: '스승은 처음으로, 등을 두 번 두드렸다.' },
        { cls: 'thought', slow: true, text: '**요괴도 결국 사람의 죄가 만든 것.** — 이 화두를 앞으로 몇 번이나 다시 만나게 될지, 그때는 알지 못했다.' }
      ],
      next: 'e_good'
    },


    /* ════════════════════════════════════════════════
     * 엔딩
     * ════════════════════════════════════════════════ */

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    e_bad_a: {
      id: 'e_bad_a', bg: 'old_shrine_night',
      lines: [
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '지범은 중매쟁이 박 서방입니다.' },
        // 에셋 적용(2026-09-25) — 표정 baksubang_cornered
        { who: '박 서방', portrait: 'baksubang_cornered', text: '아니오! 나는 붙여만 줬소, 붙여만—' },
        /*
         * [원문] 붉은 천이 부풀었다. 한(恨)은 풀리지 않았다. 이름이 틀렸기 때문이다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '흰 천이 부풀었다. 한(恨)은 풀리지 않았다. 이름이 틀렸기 때문이다.' },
        // 에셋 적용(2026-09-25) — 표정 songaksi_02
        { cls: 'shout', slow: true, portrait: 'songaksi_02', text: '천이 내 손목을 찾았다. — !!정혼자 쪽 사람으로 본 것이다.!!' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '이 아이는 아직 갈 길이 멀었다. — 놓아라. 이 손은 그 손이 아니야.' },
        { cls: 'epilogue', text: '— 후일담' },
        { cls: 'narration', text: '며칠 뒤, 사당 서까래에 새 물색 천이 걸렸다.' },
        { cls: 'narration', text: '누가 걸었는지는 아무도 몰랐다. 아무도 묻지 않았기 때문이다.' },
        { cls: 'narration', text: '사당을 지나는 길에 스승이 뒷짐을 지고 서 있었다.' },
        { who: '전우치', text: '……이 동네도 **그 옥사** 때 꽤나 시끄러웠었지.' },
        { cls: 'thought', text: '그 옥사. 우리 집이 잔반(殘班)으로 내려앉은 그 해의 일이다.' },
        { cls: 'thought', slow: true, text: '스승은 늘 저렇게, 내가 묻기 전에 흘리고 묻고 나면 대답하지 않는다.' }
      ],
      ending: {
        id: 'BAD_A',
        title: '배드 엔딩 A — 틀린 이름',
        kind: 'bad',
        desc: '한은 풀리지 않았고, 손각시는 신은호를 그 손으로 착각했다. 스승이 겨우 끌어냈다.'
      }
    },

    // 에셋 적용(2026-10-07) — 배경 ghost → old_shrine_night
    e_bad_a2: {
      id: 'e_bad_a2', bg: 'old_shrine_night',
      lines: [
        // 에셋 적용(2026-09-25) — 표정 eunho_focused
        { who: '신은호', portrait: 'eunho_focused', text: '지범은 숙부입니다.' },
        // 에셋 적용(2026-09-25) — 표정 uncle_cold
        { who: '숙부', portrait: 'uncle_cold', text: '증좌를 대시오. 떠도는 술사의 말 한마디로 혈족을 죄인 만드는 법이 어디 있소.' },
        { cls: 'narration', text: '옳은 이름이었지만, 손에 든 것이 없었다. 사람들은 눈을 내렸고 아전은 안도했다.' },
        /*
         * [원문] 증명되지 않은 이름은 한을 풀지 못한다. 붉은 천이 다시 부풀었다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '증명되지 않은 이름은 한을 풀지 못한다. 흰 천이 다시 부풀었다.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '맞히는 것과 밝히는 것은 다르다. 오늘 그걸 배웠으면 값은 치른 거다.' },
        // 사건의 주제가 그대로 반복되는 잔혹한 대칭 (플롯 v2 7항)
        { cls: 'narration', slow: true, text: '돌아서는 등 뒤로, 숙부가 낮게 되뇌는 소리가 들렸다. — **"그런 문서는 없었소."**' },
        { cls: 'epilogue', text: '— 후일담' },
        { cls: 'narration', text: '며칠 뒤, 사당 서까래에 새 물색 천이 걸렸다.' },
        { cls: 'narration', text: '누가 걸었는지는 아무도 몰랐다. 아무도 묻지 않았기 때문이다.' },
        { cls: 'narration', text: '사당을 지나는 길에 스승이 뒷짐을 지고 서 있었다.' },
        { who: '전우치', text: '……이 동네도 **그 옥사** 때 꽤나 시끄러웠었지.' },
        { cls: 'thought', text: '그 옥사. 우리 집이 잔반(殘班)으로 내려앉은 그 해의 일이다.' },
        { cls: 'thought', slow: true, text: '스승은 늘 저렇게, 내가 묻기 전에 흘리고 묻고 나면 대답하지 않는다.' }
      ],
      ending: {
        id: 'BAD_A2',
        title: '배드 엔딩 A — 증좌 없는 이름',
        kind: 'bad',
        desc: '지목은 옳았으나 물증이 없었다. 밝히지 못한 진실은 한을 풀지 못한다.'
      }
    },

    e_bad_b: {
      id: 'e_bad_b', bg: 'shrine',
      lines: [
        // 에셋 적용(2026-10-07) — 소품 이미지 talisman_fresh
        { cls: 'narration', prop: 'talisman_fresh', text: '두 번째 부적이 결을 태웠다. 형체는 마침내 소리 없이 접혔다.' },
        { cls: 'narration', text: '실종은 멎었고, 마을은 잠을 되찾았다. 관은 병사(病死)로 문서를 닫았다.' },
        // 에셋 적용(2026-09-25) — 표정 jeonwoochi_grave
        { who: '전우치', portrait: 'jeonwoochi_grave', text: '봉했군. 봉한 것은 언젠가 열린다.' },
        // 에셋 적용(2026-09-25) — 표정 eunho_shaken
        { who: '신은호', portrait: 'eunho_shaken', text: '…끝난 게 아니라는 말씀입니까.' },
        // 에셋 적용(2026-10-07) — 소품 이미지 door_blind
        { cls: 'narration', prop: 'door_blind', text: '누가 발을 쳤는지, 함을 연 손이 누구인지는 끝내 아무도 묻지 않았다.' },
        { cls: 'thought', text: '이긴 것 같은데, 뒷맛이 오래 남았다.' },
        { cls: 'epilogue', text: '— 후일담' },
        { cls: 'narration', text: '며칠 뒤, 사당 서까래에 새 물색 천이 걸렸다.' },
        { cls: 'narration', text: '누가 걸었는지는 아무도 몰랐다. 아무도 묻지 않았기 때문이다.' },
        { cls: 'narration', text: '사당을 지나는 길에 스승이 뒷짐을 지고 서 있었다.' },
        { who: '전우치', text: '……이 동네도 **그 옥사** 때 꽤나 시끄러웠었지.' },
        { cls: 'thought', text: '그 옥사. 우리 집이 잔반(殘班)으로 내려앉은 그 해의 일이다.' },
        { cls: 'thought', slow: true, text: '스승은 늘 저렇게, 내가 묻기 전에 흘리고 묻고 나면 대답하지 않는다.' }
      ],
      ending: {
        id: 'BAD_B',
        title: '배드 엔딩 B — 봉인',
        kind: 'bad',
        desc: '요괴는 강제로 정화되었으나 원한의 진상은 끝내 밝혀지지 않았다. 사건은 다음 부로 넘어간다.'
      }
    },

    // 에셋 적용(2026-10-07) — 배경 dawn → old_shrine_dawn
    e_good: {
      id: 'e_good', bg: 'old_shrine_dawn',
      lines: [
        { cls: 'narration', text: '숙부는 관으로 넘겨졌고, 박 서방은 제 몫만큼의 죄를 받았다.' },
        { cls: 'narration', text: '아전은 첩정을 다시 썼다. 이번에는 지운 자리가 없었다.' },
        /*
         * [원문] 사당의 붉은 천은 걷혔다. 마을 사람들은 그 자리에 처음으로 위패 하나를 세웠다.
         * 붉은색은 즉사·위험의 시그니처 색이라 다른 것에 쓰지 않는다(사용자 결정 2026-09-25) — 손각시의 혼례 천을 «바랜 흰 천»으로, 자국·불꽃 색도 붉은색을 뺐다.
         */
        { cls: 'narration', text: '사당의 흰 천은 걷혔다. 마을 사람들은 그 자리에 처음으로 위패 하나를 세웠다.' },
        { cls: 'epilogue', text: '— 후일담' },
        { cls: 'narration', text: '보름 뒤, 마을 사람들이 저마다 조금씩 내어 예물을 다시 채웠다. 은자는 아니었고, 무명도 여섯 필이 되지 못했다.' },
        { cls: 'narration', text: '그래도 함은 찼다. 사당 앞에서 뒤늦은 혼례가 치러졌다. 신랑 자리는 비어 있었다.' },
        { cls: 'narration', slow: true, text: '문기는 없었다. 그러나 그 자리에 있던 사람이 모두 보았으니, 이제 이것은 **증서가 필요 없는 일**이 되었다.' },
        { cls: 'thought', text: '나는 말없이 그것을 지켜보다 자리를 떴다.' },
        { cls: 'narration', text: '사당을 지나는 길에 스승이 뒷짐을 지고 서 있었다.' },
        { who: '전우치', text: '……이 동네도 **그 옥사** 때 꽤나 시끄러웠었지.' },
        { cls: 'thought', text: '그 옥사. 우리 집이 잔반(殘班)으로 내려앉은 그 해의 일이다.' },
        { cls: 'thought', slow: true, text: '스승은 늘 저렇게, 내가 묻기 전에 흘리고 묻고 나면 대답하지 않는다.' }
      ],
      ending: {
        id: 'GOOD',
        title: '굿 엔딩 — 시집가는 날',
        kind: 'good',
        desc: '한이 풀리고 손각시는 편안히 저승으로 향했다. 신은호는 "요괴도 결국 사람의 죄가 만든 것"이라는 화두를 얻는다.'
      }
    }
  };

  Game.Chapter1 = {
    id: 'ch1',
    title: '1부 · 시집가지 못한 혼',
    era: '신해년(1611) 초겨울 · 광해 3년',
    startId: 'pr_01',
    nodes: nodes
  };
})(this);
