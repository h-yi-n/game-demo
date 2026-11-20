(function () {
  "use strict";
  const SEAS = [
    { name: "珊瑚森林" },
    { name: "海流峡谷" },
    { name: "水晶洞穴" },
  ];
  const LEVELS = [0, 1, 2];
  /* 三个训练动作固定索引：0 = 抿嘴，1 = 抿嘴抗阻，2 = 吹气。
     校准页与未来硬件输入共用这一套索引。 */
  const CALIBRATION_INPUTS = [0, 1, 2];
  const CALIBRATION_STEPS = ["mouth", "resist", "blow", "done"];
  const STORAGE_KEY = "oral-motor-game-skeleton-progress-v1";
  window.Screens = window.Screens || {};
  window.Overlays = window.Overlays || {};
  let progress = window.SaveStore.getActive().data;
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
      (window.CONFIG.DEV_UNLOCK_ALL ||
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
    window.SaveStore.updateActive(function (data) {
      data.selectedSea = progress.selectedSea;
      data.cleared = progress.cleared;
    });
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
    if (window.CONFIG.DEV_UNLOCK_ALL) return true;
    return seaUnlockedWith(window.SaveStore.getActive().data.cleared, seaIndex);
  }
  function isLevelUnlocked(seaIndex, levelIndex) {
    if (window.CONFIG.DEV_UNLOCK_ALL) return true;
    return levelUnlockedWith(window.SaveStore.getActive().data.cleared, seaIndex, levelIndex);
  }
  function isLevelCleared(seaIndex, levelIndex) {
    return Boolean(window.SaveStore.getActive().data.cleared[seaIndex][levelIndex]);
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
    const overlayHost = document.querySelector(".scr-c3, .scr-sea-play");
    if (overlayHost) {
      overlayHost.classList.remove("is-calibrating", "is-resulting");
    }
    const root = document.getElementById("overlay-root");
    if (root) {
      root.replaceChildren();
      delete root.dataset.overlay;
    }
  }
  function renderOverlay() {
    const root = document.getElementById("overlay-root");
    if (!root) return;

    const overlay = overlayId ? window.Overlays[overlayId] : null;
    if (overlayId) root.dataset.overlay = overlayId;
    else delete root.dataset.overlay;
    root.innerHTML = overlay ? overlay.render(overlayContext) : "";
  }
  function paintScreen() {
    const root = document.getElementById("screen-root");
    const screen = window.Screens[currentScreen];
    if (!root || !screen) return;
    root.innerHTML = screen.render(screenContext);
  }
  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }
  /* 切屏：把刚离开的那屏克隆一份盖在最上层淡出，新屏在底下照常播入场动画。
     不这么做的话 innerHTML 一换旧屏立刻消失，中间必然露出 .stage 的深蓝底色，
     就是"先跳一个纯色界面"。 */
  function crossfadeOut(oldScreen) {
    const root = document.getElementById("screen-root");
    if (!root || !oldScreen || prefersReducedMotion()) return;
    /* 旧屏自己已经在播退场（C1 整体淡出、C2 潜入所选环），再叠一层会互相打架 */
    if (oldScreen.classList.contains("is-leaving")) return;

    const ghost = oldScreen.cloneNode(true);
    ghost.classList.add("screen-ghost");
    ghost.setAttribute("aria-hidden", "true");
    /* 拷贝出来的 <video> 是新元素，会带着 autoplay 重新起播、再解一路。
       叠影只活 160ms，让它停住显示 poster 就够了——这段视频动得很慢，
       第 0 帧和当前帧差不到 1%，看不出换了画面。 */
    const ghostVideos = ghost.querySelectorAll("video");
    for (let i = 0; i < ghostVideos.length; i += 1) {
      ghostVideos[i].removeAttribute("autoplay");
      ghostVideos[i].pause();
    }
    root.appendChild(ghost);

    let removed = false;
    const drop = function () {
      if (removed) return;
      removed = true;
      ghost.remove();
    };
    ghost.addEventListener("animationend", drop);
    /* 兜底：动画被浏览器跳过时 animationend 不会触发，别把幽灵永久留在页面上 */
    window.setTimeout(drop, 600);
  }
  /* 共用底图视频的家族划分。值是 .stage[data-bg] 的取值，也就是
     index.html 里那条常驻层的族名；不在表里的屏（C1 / C3 海域家族）
     表示自己带底图或者不需要底图，切过去时两条常驻层都淡出。
       c2 = 主界面 + 设置/成就/外观/图鉴（同一条水下片子）
       p  = 家长端 P1/P2（同一条家长端片子） */
  const BG_FAMILY = {
    c2: "c2",
    "c2-1": "c2",
    "c2-2": "c2",
    "c2-3": "c2",
    "c2-4": "c2",
    p1: "p",
    p2: "p",
  };

  function navigate(nextScreen, context) {
    if (!window.Screens[nextScreen]) return;
    const root = document.getElementById("screen-root");
    const oldScreen = root ? root.firstElementChild : null;
    clearOverlay();
    document.dispatchEvent(new CustomEvent("app:navigate", { detail: { screen: nextScreen } }));
    progress = window.SaveStore.getActive().data;
    if (window.LevelRunner && typeof window.LevelRunner.teardown === "function") window.LevelRunner.teardown();
    currentScreen = nextScreen;
    screenContext = context || {};
    if (window.Scene && window.Scene.bg) {
      window.Scene.bg(BG_FAMILY[nextScreen] || null);
    }
    paintScreen();
    crossfadeOut(oldScreen);
    if (window.AudioBus) {
      window.AudioBus.enter(nextScreen, screenContext.seaIndex);
    }
    if (window.CharacterStage) window.CharacterStage.enter(nextScreen);
  }
  function playIntro(replay) {
    overlayId = "intro";
    overlayContext = { replay: Boolean(replay) };
    if (window.AudioBus) window.AudioBus.stop();
    renderOverlay();
    const video = document.querySelector(".intro-video");
    if (!video) return;
    video.muted = false;
    video.volume = 0.85;
    function finish() {
      if (!replay) window.SaveStore.updateActive(function (data) { data.introSeen = true; });
      if (replay) navigate("c2-1");
      else navigate(window.SeaUI.seaScreenId(0), { seaIndex: 0 });
    }
    document.querySelector(".intro-skip").addEventListener("click", finish, { once: true });
    video.addEventListener("ended", finish, { once: true });
    video.addEventListener("error", finish, { once: true });
    video.play().catch(finish);
  }

  function openSea(seaIndex) {
    if (!isSeaUnlocked(seaIndex)) return;
    if (seaIndex === 0 && !window.SaveStore.getActive().data.introSeen) {
      playIntro(false);
      return;
    }
    if (!setSelectedSea(seaIndex)) return;
    navigate(window.SeaUI.seaScreenId(seaIndex), { seaIndex: seaIndex });
  }
  function startLevel(seaIndex, levelIndex) {
    if (!isLevelUnlocked(seaIndex, levelIndex)) return;
    pendingLevel = { seaIndex: seaIndex, levelIndex: levelIndex };
    overlayId = "l2";
    overlayContext = { tried: [false, false, false] };
    const calibrationHost = document.querySelector(".scr-c3");
    if (calibrationHost) calibrationHost.classList.add("is-calibrating");
    renderOverlay();
  }
  function completeRun() {
    const seaIndex = screenContext.seaIndex;
    const levelIndex = screenContext.levelIndex;
    if (!Number.isInteger(seaIndex) || !Number.isInteger(levelIndex)) return;
    if (currentScreen !== window.SeaUI.playScreenId(seaIndex, levelIndex)) return;
    if (overlayId || !isLevelUnlocked(seaIndex, levelIndex)) return;

    progress.cleared[seaIndex][levelIndex] = true;
    let targetSea = seaIndex;
    let allComplete = false;
    if (levelIndex === 2) {
      if (seaIndex + 1 < SEAS.length && isSeaUnlocked(seaIndex + 1)) {
        targetSea = seaIndex + 1;
        setSelectedSea(targetSea);
      } else {
        allComplete = true;
      }
    }
    saveProgress();
    const levelConfig = (window.GameLevelConfigs || []).find(function (item) {
      return item.sea === seaIndex && item.level === levelIndex;
    });
    const actionSummary = {
      mouth: { count: 0, seconds: 0 },
      resist: { count: 0, seconds: 0 },
      blow: { count: 0, seconds: 0 },
    };
    if (levelConfig) {
      levelConfig.rounds.forEach(function (round) {
        round.forEach(function (token) {
          const action = { M: "mouth", R: "resist", B: "blow" }[token[0]];
          const hold = Number(token.slice(1));
          actionSummary[action].count += 1;
          actionSummary[action].seconds += hold;
        });
      });
    }
    window.SaveStore.recordCompletion({
      seaIndex: seaIndex,
      levelIndex: levelIndex,
      sea: SEAS[seaIndex].name,
      level: levelConfig ? levelConfig.title : "",
      stars: 3,
      durationSec: levelConfig ? levelConfig.rounds.flat().reduce(function (sum, token) { return sum + Number(token.slice(1)); }, 0) : 0,
      actions: actionSummary,
    });
    progress = window.SaveStore.getActive().data;

    /* 不 navigate：结算浮窗直接盖在当前游玩页上。 */
    const resultHost = document.querySelector(".scr-sea-play");
    if (resultHost) resultHost.classList.add("is-resulting");
    overlayId = window.SeaUI.resultOverlayId(seaIndex, levelIndex);
    overlayContext = {
      seaIndex: seaIndex,
      levelIndex: levelIndex,
      targetSea: targetSea,
      allComplete: allComplete,
    };
    renderOverlay();
  }
  function continueFromResult() {
    const seaIndex = screenContext.seaIndex;
    const levelIndex = screenContext.levelIndex;
    if (overlayId !== window.SeaUI.resultOverlayId(seaIndex, levelIndex)) return;
    if (overlayContext.allComplete) {
      navigate("c2");
      return;
    }
    navigate(window.SeaUI.seaScreenId(overlayContext.targetSea), {
      seaIndex: overlayContext.targetSea,
    });
  }
  function markCalibration(action) {
    if (overlayId !== "l2" || !action) return;
    const expectedIndex = CALIBRATION_INPUTS.find(function (input) {
      return !overlayContext.tried[input];
    });
    if (expectedIndex === undefined) return;
    const expectedAction = window.ActionInput.ACTIONS[expectedIndex];
    if (!window.ActionInput.satisfies(action.id, expectedAction.id)) return;
    overlayContext.tried[expectedIndex] = true;
    const button = document.querySelector(
      '[data-calibration="' + expectedIndex + '"]',
    );
    if (button) {
      const label = button.querySelector(".calibration-action__label");
      button.dataset.tried = "true";
      button.setAttribute(
        "aria-label",
        (label ? label.textContent.trim() : "校准动作") + "，已试",
      );
    }
    const card = document.querySelector(".calibration-card");
    if (card) {
      card.dataset.calibrationStep =
        CALIBRATION_STEPS[CALIBRATION_INPUTS.indexOf(expectedIndex) + 1];
    }
    const nextIndex = CALIBRATION_INPUTS.find(function (input) {
      return !overlayContext.tried[input];
    });
    if (nextIndex !== undefined) {
      const next = document.querySelector(
        '[data-calibration="' + nextIndex + '"]',
      );
      if (next) {
        next.dataset.locked = "false";
        next.setAttribute(
          "aria-label",
          next.dataset.calibrationLabel + "，试一下",
        );
      }
    }
    if (CALIBRATION_INPUTS.every(function (input) {
      return overlayContext.tried[input];
    })) {
      const level = pendingLevel;
      pendingLevel = null;
      if (level) navigate(window.SeaUI.playScreenId(level.seaIndex, level.levelIndex), level);
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
      case "close-overlay":
        clearOverlay();
        break;
    }
  }
  /* ---------------- 底图预解码 ----------------
     切屏时新插入的 <img> 是那一刻才开始解码的。一张 3840×2160 的 PNG
     解到内存位图约 150–300ms，这段时间只能看到 .scr 的兜底底色 ——
     这就是"先跳一个纯色界面再加载下一页"的真正原因。
     首屏稳定后，在空闲时段按"最可能去的下一屏"顺序逐张预解码，
     之后再切屏，位图已经在内存里，第一帧就能画出来。

     为什么要串行：一张 4K 解码后约占 32MB 内存/显存，同时解六张会把
     主线程和显存一起打满，反而更卡。所以一张解完再排下一张。 */
  const WARM_ORDER = [
    /* 开屏之后最可能去的就是主界面，所以环预览排最前。
       [2026-11-16 改] 主界面底图那张 3840×2160 PNG 从这张表里删掉了：
       主界面底图在 R52 就换成了循环视频，这张 PNG 现在全项目零引用
       （`.scene-bg-layer--c2` 里只有 <video>，poster 是 jpg）。
       留着它等于在空闲时段白解一张 32MB 的位图，还占下载体积。 */
    "assets/海域1预览.png",
    "assets/海域2预览.png",
    "assets/海域3预览.png",
    /* 三张海域静态底图都已换成循环视频；poster 由 <video> 自己加载，
       不再在这里预热这些零引用 PNG。 */
    /* [2026-11-16] 家长端底图已换成循环视频，不再需要预热那张静态 PNG
       （它的 poster 由 <video poster> 自己加载，和 C1 一样不走这里）。 */
  ];
  const warmed = []; /* 必须保引用，否则解码结果可能被回收掉 */
  let warmStarted = false;

  function whenIdle(fn) {
    if (typeof window.requestIdleCallback === "function") {
      window.requestIdleCallback(fn, { timeout: 1200 });
    } else {
      window.setTimeout(fn, 120);
    }
  }

  function warmImages() {
    if (warmStarted) return;
    warmStarted = true;
    let cursor = 0;

    function step() {
      if (cursor >= WARM_ORDER.length) return;
      const img = new Image();
      img.decoding = "async";
      img.src = WARM_ORDER[cursor];
      cursor += 1;
      warmed.push(img);

      const next = function () {
        whenIdle(step);
      };
      if (typeof img.decode === "function") {
        img.decode().then(next, next);
      } else if (img.complete) {
        next();
      } else {
        img.onload = next;
        img.onerror = next;
      }
    }

    whenIdle(step);
  }

  /* 预热的时机：开屏底图现在是 1.5MB 的循环视频，它比任何一张图都更
     该先拿到带宽。所以等视频真的开始播了再多等 600ms 才预热，
     而不是死等一个固定时间。2.6s 是兜底——自动播放被拦时也得往下走。 */
  function scheduleWarm() {
    const video = document.querySelector(".c1-bg");
    let fired = false;
    const go = function () {
      if (fired) return;
      fired = true;
      warmImages();
    };
    if (video && typeof video.addEventListener === "function") {
      video.addEventListener(
        "playing",
        function () {
          window.setTimeout(go, 600);
        },
        { once: true },
      );
    }
    window.setTimeout(go, 2600);
  }

  function start() {
    if (started) return;
    started = true;
    document.addEventListener(
      "pointerdown",
      function () {
        if (window.AudioBus) window.AudioBus.unlock();
      },
      { once: true, capture: true },
    );
    document.addEventListener(
      "keydown",
      function () {
        if (window.AudioBus) window.AudioBus.unlock();
      },
      { once: true, capture: true },
    );
    document.addEventListener("click", handleClick);
    document.addEventListener("actioninputhold", function (event) {
      if (overlayId !== "l2") return;
      markCalibration(event.detail.action);
    });
    const requestedScreen = new URLSearchParams(window.location.search).get("screen");
    navigate(requestedScreen && window.Screens[requestedScreen] ? requestedScreen : "c1");
    scheduleWarm();
  }
  function setSelectedSea(seaIndex) {
    const next = Number(seaIndex);
    if (!Number.isInteger(next) || next < 0 || next >= SEAS.length) return false;
    if (progress.selectedSea === next) return true;
    progress.selectedSea = next;
    saveProgress();
    return true;
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
      return window.SaveStore.getActive().data.selectedSea;
    },
    setSelectedSea: setSelectedSea,
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
    playIntro: playIntro,
    audioProbe: function () {
      return window.AudioBus && window.AudioBus.probe();
    },
    resetProgress: function () {
      window.SaveStore.resetActive();
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
