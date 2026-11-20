(function () {
  "use strict";
  const sea = "珊瑚森林";
  window.LEVEL_VISUAL_CONFIGS = {
    1: {
      id: 1, sea: sea, title: "海草迷宫", asset: "assets/levels/level-01/environment/",
      rounds: [["M4","R5","M4","R5"],["B3","R5","M4","R5"],["B3","R5","M5","R10"],["M4","B3","R5","R5"]],
      feedback: [0,0,4,0], blank: [0,0,0,0], cruise: [420,560,420,650,460],
    },
    2: {
      id: 2, sea: sea, title: "缤纷珊瑚礁", asset: "assets/levels/level-02/environment/", goal: ["reef-exit.png", "guide-fish.png"], obstacles: { resist: ["coral-gate.png", "coral-branches.png"], blow: ["seaweed-curtain.png"] },
      rounds: [["M4","R5","B3","R5"],["M4","R5","M5","B4"],["M10","R10","M4","R5"],["B4","R10","M10","R5"],["B4","M10","R5","R5"]],
      feedback: [0,4,0,0,0], blank: [3,0,0,0,0], cruise: [460,540,430,680,500,460,620,520],
    },
    3: {
      id: 3, sea: sea, title: "珊瑚迷宫", asset: "assets/levels/level-03/environment/", goal: ["life-shell.png"],
      rounds: [["M4","R5","B3","R5"],["M5","R5","M5","B4"],["M4","R5","B4","R5"],["R10","M10","R10","B8"],["M10","R10","B8","R5"]],
      feedback: [0,4,0,4,0], blank: [4,0,0,0,0], cruise: [480,520,440,600,470,680,540,620],
    },
    4: {
      id: 4, sea: "海流峡谷", title: "湍急水流", asset: "assets/levels/level-04/environment/",
      obstacles: { resist: ["canyon-rock.png", "movable-rock.png"], blow: ["seaweed-mint.png"] },
      rounds: [["M5","R5","B3","R5"],["M5","R5","M5","B4"],["M5","R6","B4","R5"],["R10","M10","B8","R10"],["M5","B4","R10","M10","R5"]],
      feedback: [0,4,0,4,0], blank: [0,0,4,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
    5: {
      id: 5, sea: "海流峡谷", title: "神秘漩涡", asset: "assets/levels/level-05/environment/",
      goal: ["whirlpool.png", "small-jellyfish.png"], obstacles: { resist: ["canyon-rock.png", "movable-rock.png"], blow: ["seaweed-mint.png"] },
      rounds: [["M5","R5","M5","R5"],["B4","R6","M5","R5"],["R10","M10","B8","R6"],["M10","R10","M5","B8"],["B8","R10","M10","R10"]],
      feedback: [0,4,0,4,0], blank: [4,0,3,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
    6: {
      id: 6, sea: "海流峡谷", title: "潮汐之心", asset: "assets/levels/level-06/environment/",
      goal: ["tidal-pearl.png"], obstacles: { resist: ["canyon-rock.png", "movable-rock.png"], blow: ["seaweed-mint.png"] },
      rounds: [["M5","R5","B4","R5"],["M5","R5","M10","B8"],["R10","M10","B8","R6"],["M10","R10","M5","B8"],["B8","R10","M10","R10"],["M10","B8","R5","R5"]],
      feedback: [0,4,0,4,0,0], blank: [0,0,5,0,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
    7: {
      id: 7, sea: "水晶洞穴", title: "水晶矿洞", asset: "assets/levels/level-07/environment/",
      goal: ["gem-cluster.png"], obstacles: { resist: ["crystal-down-a.png", "crystal-up-a.png", "crystal-down-b.png", "crystal-up-b.png"], blow: ["coral-purple.png"] }, skipSeaweed: true,
      rounds: [["M5","R5","B4","R5"],["M5","R5","M10","B8"],["R10","M10","B8","R6"],["M10","R10","M5","B8"],["B8","R10","M10","R10"],["M10","B8","R5","R5"]],
      feedback: [0,4,0,4,0,0], blank: [4,0,4,0,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
    8: {
      id: 8, sea: "水晶洞穴", title: "神秘商人", asset: "assets/levels/level-08/environment/",
      goal: ["treasure-map.png"], obstacles: { resist: ["crystal-down-a.png", "crystal-up-a.png", "crystal-down-b.png", "crystal-up-b.png"], blow: ["coral-purple.png"] }, skipSeaweed: true,
      rounds: [["M5","R5","B4","R5"],["M5","R5","M10","B8"],["R10","M10","B8","R6"],["M10","R10","M6","B8"],["B8","R10","M10","R10"],["M10","R10","B8","R10","R5"]],
      feedback: [0,4,0,4,0,0], blank: [5,0,3,0,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
    9: {
      id: 9, sea: "水晶洞穴", title: "水晶秘境", asset: "assets/levels/level-09/environment/",
      goal: ["light-element.png"], obstacles: { resist: ["crystal-down-a.png", "crystal-up-a.png", "crystal-down-b.png", "crystal-up-b.png"], blow: ["coral-purple.png"] }, skipSeaweed: true,
      rounds: [["M5","R5","B4","R5"],["M5","R5","M10","B8"],["R10","M10","B8","R6"],["M10","R10","M6","B8"],["B8","R10","M10","R10"],["M10","R10","B8","R10","R10","R5"]],
      feedback: [0,4,0,4,0,0], blank: [5,0,5,0,0,0], cruise: [480,560,440,620,500,680,540,600],
    },
  };
})();
