// 本地存档与成长系统
(function () {
  "use strict";
  const STORAGE_KEY = "oral-motor-game-profiles-v1";
  const LEGACY_KEY = "oral-motor-game-skeleton-progress-v1";
  const SLOT_IDS = ["A", "B", "C"];
  const LEVEL_THRESHOLDS = [0, 200, 500, 900, 1400, 2000, 2800, 3800, 5000, 6500];
  const ALL_CLEAR_REVIEW_VERSION = 1;

  function emptyData(id) {
    return {
      selectedSea: 0,
      cleared: [[false, false, false], [false, false, false], [false, false, false]],
      xp: 0,
      plays: {},
      sessions: [],
      claimedAchievements: [],
      claimedRewards: {},
      introSeen: false,
      unlockedSkins: [],
    };
  }

  function makeProfile(id) {
    const now = new Date().toISOString();
    return { id: id, name: "存档 0" + (SLOT_IDS.indexOf(id) + 1), createdAt: now, updatedAt: now, data: emptyData(id) };
  }

  function normalizeProfile(profile, id) {
    const base = makeProfile(id);
    const source = profile && typeof profile === "object" ? profile : {};
    const data = source.data && typeof source.data === "object" ? source.data : source;
    base.name = typeof source.name === "string" ? source.name : base.name;
    base.createdAt = source.createdAt || base.createdAt;
    base.updatedAt = source.updatedAt || base.updatedAt;
    base.data = Object.assign(emptyData(id), data);
    base.data.cleared = [0, 1, 2].map(sea => [0, 1, 2].map(level => Boolean(data.cleared && data.cleared[sea] && data.cleared[sea][level])));
    base.data.xp = Math.max(0, Number(data.xp) || 0);
    base.data.plays = data.plays && typeof data.plays === "object" ? data.plays : {};
    base.data.sessions = Array.isArray(data.sessions) ? data.sessions.slice(-100) : [];
    base.data.claimedAchievements = Array.isArray(data.claimedAchievements) ? data.claimedAchievements.slice() : [];
    base.data.claimedRewards = data.claimedRewards && typeof data.claimedRewards === "object" ? data.claimedRewards : {};
    base.data.introSeen = Boolean(data.introSeen);
    base.data.unlockedSkins = Array.isArray(data.unlockedSkins) ? data.unlockedSkins.slice() : [];
    return base;
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (saved && saved.profiles) {
        const profiles = {};
        SLOT_IDS.forEach(id => { if (saved.profiles[id]) profiles[id] = normalizeProfile(saved.profiles[id], id); });
        if (Object.keys(profiles).length) return { activeId: profiles[saved.activeId] ? saved.activeId : SLOT_IDS.find(id => profiles[id]), profiles: profiles, allClearReviewVersion: Number(saved.allClearReviewVersion) || 0 };
      }
      const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY) || "null");
      const profile = makeProfile("A");
      if (legacy) {
        profile.data.selectedSea = Number(legacy.selectedSea) || 0;
        profile.data.cleared = legacy.cleared || profile.data.cleared;
        Object.keys(legacy).forEach(key => {
          if (!["selectedSea", "cleared"].includes(key)) profile.data[key] = legacy[key];
        });
      }
      return { activeId: "A", profiles: { A: normalizeProfile(profile, "A") }, allClearReviewVersion: 0 };
    } catch (error) {
      return { activeId: "A", profiles: { A: makeProfile("A") }, allClearReviewVersion: 0 };
    }
  }

  let state = load();
  function persist() {
    state.profiles[state.activeId].updatedAt = new Date().toISOString();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) {}
  }
  /* 按当前验收要求，仅把这次加载时的当前档位模拟为九关三星通关。
     版本标记随存档持久化：刷新不会重复写入，之后新建/切换的档位不受影响。 */
  function applyAllClearReview() {
    if (state.allClearReviewVersion >= ALL_CLEAR_REVIEW_VERSION) return;
    state.profiles[state.activeId].name = "全解锁供查阅";
    const data = state.profiles[state.activeId].data;
    const seaNames = ["珊瑚森林", "海流峡谷", "水晶洞穴"];
    const levelNames = ["海草迷宫", "缤纷珊瑚礁", "珊瑚迷宫", "湍急水流", "神秘漩涡", "潮汐之心", "水晶矿洞", "神秘商人", "水晶秘境"];
    const now = new Date();
    const currentWeekday = (now.getDay() + 6) % 7;
    data.cleared = [[true, true, true], [true, true, true], [true, true, true]];
    data.xp = 1170;
    data.plays = {};
    data.sessions = [];
    data.introSeen = true;
    for (let index = 0; index < 9; index += 1) {
      const id = index + 1;
      const seaIndex = Math.floor(index / 3);
      const levelIndex = index % 3;
      const daysAgo = Math.round((8 - index) * currentWeekday / 8);
      const completedAt = new Date(now);
      completedAt.setDate(now.getDate() - daysAgo);
      completedAt.setHours(16 + Math.floor(index / 3), (index * 11) % 60, 0, 0);
      const date = completedAt.getFullYear() + "-" + String(completedAt.getMonth() + 1).padStart(2, "0") + "-" + String(completedAt.getDate()).padStart(2, "0");
      const mouthCount = 4 + index % 4;
      const resistCount = 3 + index % 3;
      const blowCount = 2 + index % 2;
      const actions = {
        mouth: { count: mouthCount, seconds: mouthCount * 5 },
        resist: { count: resistCount, seconds: resistCount * 6 },
        blow: { count: blowCount, seconds: blowCount * 4 },
      };
      const durationSec = actions.mouth.seconds + actions.resist.seconds + actions.blow.seconds + 20;
      data.plays[id] = { completions: 1, bestStars: 3, firstClear: true, lastPlayedAt: completedAt.toISOString(), lastXp: 130 };
      data.sessions.push({
        id: "all-clear-review-" + id,
        date: date,
        weekday: "周" + "日一二三四五六"[completedAt.getDay()],
        completedAt: completedAt.toISOString(),
        seaIndex: seaIndex,
        levelIndex: levelIndex,
        sea: seaNames[seaIndex],
        level: levelNames[index],
        stars: 3,
        xp: 130,
        durationSec: durationSec,
        status: "已完成",
        actions: actions,
      });
    }
    state.allClearReviewVersion = ALL_CLEAR_REVIEW_VERSION;
    persist();
  }
  applyAllClearReview();

  function active() { return state.profiles[state.activeId]; }
  function update(mutator) {
    const profile = active();
    if (typeof mutator === "function") mutator(profile.data, profile);
    persist();
    return profile;
  }
  function levelFromXp(xp) {
    let level = 1;
    LEVEL_THRESHOLDS.forEach((threshold, index) => { if (xp >= threshold) level = index + 1; });
    const floor = LEVEL_THRESHOLDS[level - 1] || 0;
    const next = LEVEL_THRESHOLDS[level] || null;
    return { level: level, floor: floor, next: next, progress: next ? (xp - floor) / (next - floor) : 1 };
  }
  function playKey(seaIndex, levelIndex) { return seaIndex * 3 + levelIndex + 1; }
  function recordCompletion(input) {
    const seaIndex = input.seaIndex;
    const levelIndex = input.levelIndex;
    const stars = Math.max(1, Math.min(3, Number(input.stars) || 3));
    const key = playKey(seaIndex, levelIndex);
    update(data => {
      const previous = data.plays[key] || { completions: 0, bestStars: 0, firstClear: false };
      const firstClear = previous.completions === 0;
      const base = firstClear ? 100 : 30;
      const gained = base + stars * 10;
      data.xp += gained;
      data.plays[key] = {
        completions: previous.completions + 1,
        bestStars: Math.max(previous.bestStars, stars),
        firstClear: true,
        lastPlayedAt: new Date().toISOString(),
        lastXp: gained,
      };
      data.sessions.push({
        id: "run-" + Date.now() + "-" + key,
        date: new Date().toISOString().slice(0, 10),
        completedAt: new Date().toISOString(),
        seaIndex: seaIndex,
        levelIndex: levelIndex,
        sea: input.sea,
        level: input.level,
        stars: stars,
        xp: gained,
        durationSec: input.durationSec,
        status: "已完成",
        actions: input.actions,
      });
      data.sessions = data.sessions.slice(-100);
    });
    return active().data.plays[key];
  }
  function claimAchievement(id, xp) {
    let claimed = false;
    update(data => {
      if (!data.claimedAchievements.includes(id)) {
        data.claimedAchievements.push(id);
        if (id === "skin-coral" || id === "skin-cyan") data.unlockedSkins.push(id);
        data.xp += Math.max(0, Number(xp) || 0);
        claimed = true;
      }
    });
    return claimed;
  }
  function claimReward(levelId, xp) {
    let claimed = false;
    update(data => {
      if (!data.claimedRewards[levelId]) {
        data.claimedRewards[levelId] = true;
        data.xp += Math.max(0, Number(xp) || 0);
        claimed = true;
      }
    });
    return claimed;
  }

  window.SaveStore = {
    getActive: active,
    getProfiles: function () { return SLOT_IDS.map(id => state.profiles[id] || null); },
    updateActive: update,
    switchTo: function (id) {
      if (!state.profiles[id]) return false;
      state.activeId = id;
      persist();
      return true;
    },
    create: function (id) {
      if (state.profiles[id]) return false;
      state.profiles[id] = makeProfile(id);
      state.activeId = id;
      persist();
      return true;
    },
    resetActive: function () {
      const id = state.activeId;
      state.profiles[id] = makeProfile(id);
      persist();
    },
    recordCompletion: recordCompletion,
    claimAchievement: claimAchievement,
    claimReward: claimReward,
    levelFromXp: levelFromXp,
    playKey: playKey,
  };
})();
