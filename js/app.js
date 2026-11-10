(function () {
  "use strict";
  const SEAS = [
    { name: "珊瑚森林" },
    { name: "海流峡谷" },
    { name: "水晶洞穴" },
    { name: "海域 4" },
    { name: "海域 5" },
    { name: "海域 6" },
    { name: "海域 7" },
    { name: "海域 8" },
  ];
  const LEVELS = [0, 1, 2];
  const STORAGE_KEY = "oral-motor-game-skeleton-progress-v1";
  /* [临时·破解版] 恒为已解锁的海域数量。
     现在填 3，三个海域与各自三关全部可点、可看。
     真实解锁记忆（依赖通关记录）做完后，把这里改成 0 即可完全恢复原逻辑，
     不需要再改下面任何一处判断。 */
  const DEV_UNLOCK_SEAS = 3;
  window.Screens = window.Screens || {};
  window.Overlays = window.Overlays || {};
  let progress = loadProgress();
  let currentScreen = "c1";
  let screenContext = {};
  let overlayId = null;
  let overlayContext = {};
  let pendingLevel = null;
  let started = false;
  function defaultProgress() {
    return {
      selectedSea: 0,
      cleared: SEAS.map(function () {
        return [false, false, false];
      }),
    };
  }
  function normalizeProgress(value) {
    const normalized = defaultProgress();
    const savedCleared =
      value && Array.isArray(value.cleared) ? value.cleared : [];
    normalized.cleared = SEAS.map(function (_, seaIndex) {
      const savedSea = Array.isArray(savedCleared[seaIndex])
        ? savedCleared[seaIndex]
        : [];
      return LEVELS.map(function (_, levelIndex) {
        return Boolean(savedSea[levelIndex]);
      });
    });
    const savedSea = value && Number(value.selectedSea);
    normalized.selectedSea =
      Number.isInteger(savedSea) &&
      savedSea >= 0 &&
      savedSea < SEAS.length &&
      ((DEV_UNLOCK_SEAS > 0 && savedSea < DEV_UNLOCK_SEAS) ||
        seaUnlockedWith(normalized.cleared, savedSea))
        ? savedSea
        : 0;
    return normalized;
  }
  function loadProgress() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? normalizeProgress(JSON.parse(raw)) : defaultProgress();
    } catch (error) {
      return defaultProgress();
    }
  }
  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      // 本地文件环境禁用 localStorage 时，当前会话仍可继续操作。
    }
  }
  function seaUnlockedWith(cleared, seaIndex) {
    if (seaIndex === 0) return true;
    return LEVELS.every(function (levelIndex) {
      return Boolean(cleared[seaIndex - 1][levelIndex]);
    });
  }
  function levelUnlockedWith(cleared, seaIndex, levelIndex) {
    if (levelIndex === 0) return true;
    return Boolean(cleared[seaIndex][levelIndex - 1]);
  }
  function isSeaUnlocked(seaIndex) {
    if (DEV_UNLOCK_SEAS > 0 && seaIndex >= 0 && seaIndex < DEV_UNLOCK_SEAS) {
      return true;
    }
    return seaUnlockedWith(progress.cleared, seaIndex);
  }
  function isLevelUnlocked(seaIndex, levelIndex) {
    if (DEV_UNLOCK_SEAS > 0 && seaIndex >= 0 && seaIndex < DEV_UNLOCK_SEAS) {
      return true;
    }
    return levelUnlockedWith(progress.cleared, seaIndex, levelIndex);
  }
  function isLevelCleared(seaIndex, levelIndex) {
    return Boolean(progress.cleared[seaIndex][levelIndex]);
  }
  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }
  function screenFrame(config) {
    const back = config.back
      ? `
        <button type="button" data-nav="${escapeHtml(config.back.screen)}">
          返回 ${escapeHtml(config.back.label)}
        </button>
      `
      : "";
    return `
      <article class="screen" data-screen="${escapeHtml(config.code)}">
        <h1>${escapeHtml(config.code)} ${escapeHtml(config.title)}</h1>
        <p>${escapeHtml(config.description)}</p>
        <section class="jump-list" aria-label="跳转清单">
          <h2>跳转清单</h2>
          ${config.content}
        </section>
        ${back}
      </article>
    `;
  }
  function clearOverlay() {
    overlayId = null;
    overlayContext = {};
    const root = document.getElementById("overlay-root");
    if (root) root.replaceChildren();
  }
  function renderOverlay() {
    const root = document.getElementById("overlay-root");
    if (!root) return;

    const overlay = overlayId ? window.Overlays[overlayId] : null;
    root.innerHTML = overlay ? overlay.render(overlayContext) : "";
  }
  function render() {
    const root = document.getElementById("screen-root");
    const screen = window.Screens[currentScreen];
    if (!root || !screen) return;
    root.innerHTML = screen.render(screenContext);
  }
  function navigate(nextScreen, context) {
    if (!window.Screens[nextScreen]) return;
    clearOverlay();
    currentScreen = nextScreen;
    screenContext = context || {};
    render();
  }
  function openSea(seaIndex) {
    if (!isSeaUnlocked(seaIndex)) return;
    progress.selectedSea = seaIndex;
    saveProgress();
    navigate("c3", { seaIndex: seaIndex });
  }
  function startLevel(seaIndex, levelIndex) {
    if (!isLevelUnlocked(seaIndex, levelIndex)) return;
    pendingLevel = { seaIndex: seaIndex, levelIndex: levelIndex };
    overlayId = "l2";
    overlayContext = { tried: [false, false, false] };
    renderOverlay();
  }
  function completeRun() {
    if (currentScreen !== "c4" || overlayId) return;
    const seaIndex = screenContext.seaIndex;
    const levelIndex = screenContext.levelIndex;
    if (!isLevelUnlocked(seaIndex, levelIndex)) return;
    progress.cleared[seaIndex][levelIndex] = true;
    let targetSea = seaIndex;
    let targetScreen = "c3";
    let allComplete = false;
    if (levelIndex === 2) {
      if (seaIndex + 1 < SEAS.length && isSeaUnlocked(seaIndex + 1)) {
        targetSea = seaIndex + 1;
        progress.selectedSea = targetSea;
      } else {
        targetScreen = "c2";
        allComplete = true;
      }
    }
    saveProgress();
    navigate("c5", {
      seaIndex: seaIndex,
      levelIndex: levelIndex,
      targetSea: targetSea,
      targetScreen: targetScreen,
      allComplete: allComplete,
    });
  }
  function continueFromResult() {
    if (currentScreen !== "c5") return;
    if (screenContext.targetScreen === "c2") {
      navigate("c2", { allComplete: true });
      return;
    }
    navigate("c3", { seaIndex: screenContext.targetSea });
  }
  function markCalibration(index) {
    if (overlayId !== "l2" || index < 0 || index > 2) return;
    overlayContext.tried[index] = true;
    renderOverlay();
    if (overlayContext.tried.every(Boolean)) {
      const level = pendingLevel;
      pendingLevel = null;
      if (level) navigate("c4", level);
    }
  }
  function handleClick(event) {
    const button = event.target.closest("button");
    if (!button || button.disabled) return;

    if (button.dataset.nav) {
      navigate(button.dataset.nav);
      return;
    }
    if (button.dataset.openLevel !== undefined) {
      startLevel(
        Number(button.dataset.openSea),
        Number(button.dataset.openLevel),
      );
      return;
    }
    if (button.dataset.openSea !== undefined) {
      openSea(Number(button.dataset.openSea));
      return;
    }
    switch (button.dataset.action) {
      case "complete-run":
        completeRun();
        break;
      case "continue-result":
        continueFromResult();
        break;
      case "calibrate":
        markCalibration(Number(button.dataset.calibration));
        break;
      case "close-overlay":
        clearOverlay();
        break;
    }
  }
  function handleKeydown(event) {
    if (currentScreen !== "c1" || overlayId) return;
    if (event.target.closest && event.target.closest("button")) return;
    event.preventDefault();
    navigate("c2");
  }
  function start() {
    if (started) return;
    started = true;
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeydown);
    navigate("c1");
  }
  window.App = {
    SEAS: SEAS,
    LEVELS: LEVELS,
    screen: screenFrame,
    escapeHtml: escapeHtml,
    navigate: navigate,
    openSea: openSea,
    startLevel: startLevel,
    isSeaUnlocked: isSeaUnlocked,
    isLevelUnlocked: isLevelUnlocked,
    isLevelCleared: isLevelCleared,
    getSelectedSea: function () {
      return progress.selectedSea;
    },
    getScreen: function () {
      return currentScreen;
    },
    getScreenContext: function () {
      return screenContext;
    },
    getOverlayContext: function () {
      return overlayContext;
    },
    getCurrentOverlay: function () {
      return overlayId;
    },
    getProgress: function () {
      return JSON.parse(JSON.stringify(progress));
    },
    resetProgress: function () {
      progress = defaultProgress();
      saveProgress();
      navigate("c1");
    },
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
