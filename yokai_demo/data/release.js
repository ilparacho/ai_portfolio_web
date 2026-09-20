/*
 * 배포 설정 — 체험판(데모) 잠금
 *
 * 웹에 올려 지인에게 «느낌만» 보여줄 때 쓴다. demo 를 true 로 바꾸면
 *  - playable 목록에 없는 장은 열리지 않는다 (장 선택에서 «체험판에서는 열리지 않습니다» 잠금 카드)
 *  - 1부를 끝내도 다음 장으로 넘어가는 버튼 대신 «체험판은 여기까지» 안내가 나온다
 *  - lockedMenus 에 적은 타이틀 메뉴는 눌러도 열리지 않는다
 *  - 시스템 시연(?dev=1)도 막힌다
 * 로컬 개발·전체 빌드에서는 demo 를 false 로 둔다(기본).
 *
 * 주의: 화면에서 막을 뿐 스크립트 파일 자체를 숨기지는 않는다.
 * 뒷부분의 내용까지 감추려면 올릴 때 data/chapter2.js 등을 빼면 된다(장 선택은 시나리오가 없으면 «준비 중»으로 보인다).
 */
(function (global) {
  'use strict';

  var Game = global.Game = global.Game || {};

  var Release = {
    demo: true,

    /** 체험판에서 열어 둘 장 id */
    playable: ['ch1'],

    /** 체험판에서 잠글 타이틀 메뉴 id — 'codex' | 'yasarok' | 'jukebox' | 'options' */
    lockedMenus: ['jukebox'],

    /** 타이틀에 붙는 표식 문구 */
    label: '체험판 — 제1부만 열려 있습니다',

    /** 이 장을 지금 플레이할 수 있는가 */
    allows: function (chapterId) {
      return !Release.demo || Release.playable.indexOf(chapterId) !== -1;
    },

    menuLocked: function (menuId) {
      return Release.demo && Release.lockedMenus.indexOf(menuId) !== -1;
    }
  };

  Game.Release = Release;
})(this);
