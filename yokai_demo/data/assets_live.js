/*
 * 확정 배치된 신규 에셋 등록부 — 자동 생성 파일, 손으로 고치지 않는다.
 * 생성: node tools/scan-assets.mjs   (근거: docs/에셋_적용_가이드.md)
 * data/assets.js 는 여기에 적힌 것만 새 에셋으로 쓰고, 없으면 기존 더미로 폴백한다.
 */
(function (global) {
  'use strict';
  var Game = global.Game = global.Game || {};
  Game.LiveAssets = {
    "bg": {
      "burning_house": {
        "f": "assets/bg/common/burning_house.webp",
        "w": 1376,
        "h": 768
      },
      "menu_bg": {
        "f": "assets/bg/common/menu_bg.webp",
        "w": 1376,
        "h": 768
      },
      "ruined_house_ash": {
        "f": "assets/bg/common/ruined_house_ash.webp",
        "w": 1376,
        "h": 768
      },
      "title_bg": {
        "f": "assets/bg/common/title_bg.webp",
        "w": 1376,
        "h": 768
      },
      "bak_house": {
        "f": "assets/bg/honsu/bak_house.webp",
        "w": 1376,
        "h": 768
      },
      "brother_shed": {
        "f": "assets/bg/honsu/brother_shed.webp",
        "w": 1376,
        "h": 768
      },
      "burnt_village": {
        "f": "assets/bg/honsu/burnt_village.webp",
        "w": 1376,
        "h": 768
      },
      "geumok_house_ruin": {
        "f": "assets/bg/honsu/geumok_house_ruin.webp",
        "w": 1376,
        "h": 768
      },
      "gwana": {
        "f": "assets/bg/honsu/gwana.webp",
        "w": 1376,
        "h": 768
      },
      "gwana_office": {
        "f": "assets/bg/honsu/gwana_office.webp",
        "w": 1376,
        "h": 768
      },
      "old_shrine": {
        "f": "assets/bg/honsu/old_shrine.webp",
        "w": 1376,
        "h": 768
      },
      "old_shrine_dawn": {
        "f": "assets/bg/honsu/old_shrine_dawn.webp",
        "w": 1376,
        "h": 768
      },
      "old_shrine_night": {
        "f": "assets/bg/honsu/old_shrine_night.webp",
        "w": 1376,
        "h": 768
      },
      "shrine_interior": {
        "f": "assets/bg/honsu/shrine_interior.webp",
        "w": 1376,
        "h": 768
      },
      "uncle_house": {
        "f": "assets/bg/honsu/uncle_house.webp",
        "w": 1376,
        "h": 768
      },
      "village_lane": {
        "f": "assets/bg/honsu/village_lane.webp",
        "w": 1376,
        "h": 768
      }
    },
    "ch": {
      "eunho_calm": {
        "f": "assets/ch/common/eunho_calm.webp",
        "w": 1024,
        "h": 1024
      },
      "eunho_cold": {
        "f": "assets/ch/common/eunho_cold.webp",
        "w": 1024,
        "h": 1024
      },
      "eunho_exhausted": {
        "f": "assets/ch/common/eunho_exhausted.webp",
        "w": 1024,
        "h": 1024
      },
      "eunho_focused": {
        "f": "assets/ch/common/eunho_focused.webp",
        "w": 1024,
        "h": 1024
      },
      "eunho_resolved": {
        "f": "assets/ch/common/eunho_resolved.webp",
        "w": 1024,
        "h": 1024
      },
      "eunho_shaken": {
        "f": "assets/ch/common/eunho_shaken.webp",
        "w": 1024,
        "h": 1024
      },
      "jeonwoochi_amused": {
        "f": "assets/ch/common/jeonwoochi_amused.webp",
        "w": 1024,
        "h": 1024
      },
      "jeonwoochi_calm": {
        "f": "assets/ch/common/jeonwoochi_calm.webp",
        "w": 1024,
        "h": 1024
      },
      "jeonwoochi_grave": {
        "f": "assets/ch/common/jeonwoochi_grave.webp",
        "w": 1024,
        "h": 1024
      },
      "ajeon_evasive": {
        "f": "assets/ch/honsu/ajeon_evasive.webp",
        "w": 1024,
        "h": 1024
      },
      "ajeon_officious": {
        "f": "assets/ch/honsu/ajeon_officious.webp",
        "w": 1024,
        "h": 1024
      },
      "anak_worried": {
        "f": "assets/ch/honsu/anak_worried.webp",
        "w": 1024,
        "h": 1024
      },
      "baksubang_affable": {
        "f": "assets/ch/honsu/baksubang_affable.webp",
        "w": 1024,
        "h": 1024
      },
      "baksubang_cornered": {
        "f": "assets/ch/honsu/baksubang_cornered.webp",
        "w": 1024,
        "h": 1024
      },
      "baksubang_nervous": {
        "f": "assets/ch/honsu/baksubang_nervous.webp",
        "w": 1024,
        "h": 1024
      },
      "brother_afraid": {
        "f": "assets/ch/honsu/brother_afraid.webp",
        "w": 1024,
        "h": 1024
      },
      "brother_earnest": {
        "f": "assets/ch/honsu/brother_earnest.webp",
        "w": 1024,
        "h": 1024
      },
      "uncle_cold": {
        "f": "assets/ch/honsu/uncle_cold.webp",
        "w": 1024,
        "h": 1024
      },
      "uncle_firm": {
        "f": "assets/ch/honsu/uncle_firm.webp",
        "w": 1024,
        "h": 1024
      },
      "uncle_grieving": {
        "f": "assets/ch/honsu/uncle_grieving.webp",
        "w": 1024,
        "h": 1024
      }
    },
    "yk": {
      "songaksi_01": {
        "f": "assets/yk/honsu/songaksi_01.webp",
        "w": 1024,
        "h": 1024
      },
      "songaksi_02": {
        "f": "assets/yk/honsu/songaksi_02.webp",
        "w": 1024,
        "h": 1024
      }
    },
    "item": {
      "testimony_01": {
        "f": "assets/item/common/testimony_01.webp",
        "w": 1024,
        "h": 1024
      },
      "testimony_02": {
        "f": "assets/item/common/testimony_02.webp",
        "w": 1024,
        "h": 1024
      },
      "door_blind": {
        "f": "assets/item/honsu/door_blind.webp",
        "w": 1024,
        "h": 1024
      },
      "honseo_burnt": {
        "f": "assets/item/honsu/honseo_burnt.webp",
        "w": 1024,
        "h": 1024
      },
      "mulsaek_cloth": {
        "f": "assets/item/honsu/mulsaek_cloth.webp",
        "w": 1024,
        "h": 1024
      },
      "myeongju": {
        "f": "assets/item/honsu/myeongju.webp",
        "w": 1024,
        "h": 1024
      },
      "silver_nyang": {
        "f": "assets/item/honsu/silver_nyang.webp",
        "w": 1024,
        "h": 1024
      },
      "talisman_fresh": {
        "f": "assets/item/honsu/talisman_fresh.webp",
        "w": 1024,
        "h": 1024
      },
      "yemul_box": {
        "f": "assets/item/honsu/yemul_box.webp",
        "w": 1024,
        "h": 1024
      },
      "yemul_note": {
        "f": "assets/item/honsu/yemul_note.webp",
        "w": 1024,
        "h": 1024
      }
    },
    "doc": {
      "cheopjeong": {
        "f": "assets/doc/common/cheopjeong.webp",
        "w": 1024,
        "h": 1024
      }
    },
    "ui": {
      "lock": {
        "f": "assets/ui/common/lock.webp",
        "w": 1024,
        "h": 1024
      }
    }
  };
})(this);
