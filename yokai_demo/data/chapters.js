/*
 * 챕터 레지스트리 v0.3.0
 *
 * 기획서 v2 4항(전 5부작 구성)을 그대로 옮긴 목록이다.
 * 시나리오가 아직 없는 부는 playable: false 로 두면 챕터 선택 화면에서 잠금으로 노출된다.
 *
 * scriptKey 는 Game 네임스페이스에 등록된 시나리오 객체의 이름이다.
 * (data/chapter1.js 가 Game.Chapter1 로 등록하는 식)
 *
 * era 는 고증 자료의 실제 연표에 맞춘 확정 시점이다(기획서 v2 1항).
 * 제목은 v2에서 3~5부까지 확정되었으므로 titleTentative 를 걷어냈다.
 *
 * cover 는 장 선택 카드의 대표 배경 키(data/assets.js 의 IMAGES)다. 4·5부는 «제작 시 지정»이라 비워둔다.
 * 현재 값은 기존 에셋을 그대로 쓴 더미이며, 전용 이미지가 오면 키만 바꾸면 된다.
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  Game.Chapters = [
    {
      id: 'ch1',
      no: 1,
      yokai: '손각시(손말명)',
      title: '시집가지 못한 혼(魂)',
      era: '신해년(1611) 초겨울',
      scriptKey: 'Chapter1',
      cover: 'shrine',          // 대표 배경 — 낡은 사당 (풀기획서 7.10.1)
      teaser: '고을 어귀 사당 근처에서 혼담이 오가던 총각들이 사라진다.',
      playable: true,
      summary: '고을 어귀 사당 근처에서 혼담이 오가던 총각들이 연이어 사라진다. ' +
               '마을은 혼례를 코앞에 두고 죽은 처녀의 원혼을 지목하지만, ' +
               '한(恨)의 뿌리에는 전란에 타 없어진 문서 한 장이 있다.'
    },
    {
      id: 'ch2',
      no: 2,
      yokai: '그슨대',
      title: '서로를 삼키는 그림자',
      era: '임자~계축년(1612~1613) 당독역 대유행기',
      scriptKey: 'Chapter2',
      cover: 'sealed_gate',     // 봉쇄된 입구 — 역병 봉쇄라는 이 부의 성격을 한 장으로
      teaser: '봉쇄된 고을에 역병이 돌고, 밤마다 사람이 사라진다.',
      playable: true,
      summary: '역병으로 봉쇄된 고을에서 밤마다 사람이 사라진다. ' +
               '목격자들의 진술은 하나같이 다르고, 죽은 사람의 얼굴을 보았다는 증언까지 나온다. ' +
               '요괴가 한 일과 사람이 한 일을 갈라내지 못하면 둘 다 놓친다.'
    },
    {
      id: 'ch3',
      no: 3,
      yokai: '두억시니',
      title: '두 번 죽은 이름',
      era: '계축년(1613) 계축옥사',
      cover: 'inspection',      // 추국청(검안소 변형) — 결전 배경이 완성되면 교체 검토
      teaser: '문경새재 고갯길에서 은상 하나가 죽었다.',
      playable: false,
      summary: '문경새재에서 은상 하나가 죽고, 열세 해 전 신은호의 가문을 무너뜨린 것과 ' +
               '똑같은 수법이 반복된다. 옥사가 조작되는 과정을 목격하면서 ' +
               '"저것과 같은 것이었구나"라는 형태의 깨달음에 이른다.'
    },
    {
      id: 'ch4',
      no: 4,
      yokai: '이무기 / 불가사리',
      title: '여의주 없는 용 / 무쇠를 삼킨 굶주림',
      era: '기유년(1609) 하늘의 물체를 전조로 회상',
      teaser: '능을 다시 잡자는 말 한마디가 돌고 있다.',
      playable: false,
      summary: '3부까지의 선택 누적에 따라 두 요괴 중 하나가 최종보스로 확정된다. ' +
               '이무기 루트는 좌절된 권력욕과 한, ' +
               '불가사리 루트는 전란 후 무기 회수 문제와 얽힌 파괴의 저주.'
    },
    {
      id: 'ch5',
      no: 5,
      yokai: '최종장',
      title: '숨김을 거두는 날',
      /*
       * ★ 5부는 잠긴 카드로도 보이지 않는다(풀기획서 v4.4 7.12항).
       * secret 이 붙은 장은 4부를 굿/진엔딩으로 끝내 reveal 되기 전까지 목록에서 슬롯 자체가 없다.
       * 배드엔딩으로는 열리지 않는다 — 7.9항 «배드엔딩에서도 해금» 원칙의 유일한 예외.
       */
      secret: true,
      teaser: '',
      playable: false,
      summary: '가문 몰락 사건의 완전한 진상 공개. ' +
               '이름에 넣은 숨을 은(隱)을 끝내 거둘 것인가 — ' +
               '신은호의 선택에 따른 멀티 엔딩.'
    }
  ];

  /**
   * 시스템 시연용 샌드박스 장(data/chapter_dev.js). Game.Chapters 에 넣지 않아
   * 장 선택·진행 기록·저장 슬롯에 절대 섞이지 않는다. 주소에 ?dev=1 을 붙였을 때만 메뉴에 노출된다.
   */
  Game.DevChapter = {
    id: 'dev',
    no: '시연',
    title: '시스템 시연',
    scriptKey: 'DevScript',
    playable: true,
    dev: true
  };

  /** id 로 챕터 찾기 */
  Game.findChapter = function (id) {
    if (id === 'dev') return Game.DevChapter;
    for (var i = 0; i < Game.Chapters.length; i++) {
      if (Game.Chapters[i].id === id) return Game.Chapters[i];
    }
    return null;
  };

  /** 챕터의 시나리오 객체 (없으면 null) */
  Game.chapterScript = function (chapter) {
    if (!chapter || !chapter.scriptKey) return null;
    return Game[chapter.scriptKey] || null;
  };
})(this);
