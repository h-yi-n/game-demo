(function () {
  "use strict";

  let leaving = false;

  function teardown() {
    document.removeEventListener("click", onLevelClick, false);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onLevelClick, false);
    window.SeaUI.bindRingFocus(document.querySelector(".scr-c3"));
  }

  function leave(ring, seaIndex, levelIndex) {
    if (leaving) return;
    const scr = document.querySelector(".scr-c3");
    if (!scr) {
      window.App.startLevel(seaIndex, levelIndex);
      return;
    }
    leaving = true;
    ring.classList.add("is-focus");
    scr.classList.add("is-leaving");

    /* 读 CSS 里的时长，而不是写死 240。
       prefers-reduced-motion 会把它压到 1ms，JS 的定时器跟着一起变短。 */
    let ms = parseFloat(
      window.getComputedStyle(scr).getPropertyValue("--c3-focus-dur"),
    );
    if (!(ms > 0)) ms = 240;

    window.setTimeout(function () {
      teardown();
      window.App.startLevel(seaIndex, levelIndex);
      /* 万一没打开（关卡未解锁等），把画面恢复原样，不要停在退场态 */
      if (window.App.getCurrentOverlay() !== "l2") {
        scr.classList.remove("is-leaving");
        ring.classList.remove("is-focus");
        mount();
      }
    }, ms);
  }

  function onLevelClick(event) {
    const ring =
      event.target.closest && event.target.closest(".c3-ring[data-c3-level]");
    if (!ring || ring.disabled) return;
    const seaIndex = Number(ring.dataset.c3Sea);
    const levelIndex = Number(ring.dataset.c3Level);
    if (
      !Number.isInteger(seaIndex) ||
      seaIndex < 0 ||
      seaIndex >= window.CONFIG.PLAYABLE_SEAS
    ) {
      return;
    }
    if (
      !Number.isInteger(levelIndex) ||
      levelIndex < 0 ||
      levelIndex >= window.App.LEVELS.length
    ) {
      return;
    }
    leave(ring, seaIndex, levelIndex);
  }

  const chapterScreen = {
    render() {
      const App = window.App;
      const context = App.getScreenContext();
      const seaIndex = Number.isInteger(context.seaIndex)
        ? context.seaIndex
        : App.getSelectedSea();
      const sea = App.SEAS[seaIndex];
      const seaCode = window.SeaUI.seaCode(seaIndex);

      const ringClasses = [
        "c3-ring--center",
        "c3-ring--left",
        "c3-ring--right",
      ];
      const indexClasses = [
        "c3-index--center",
        "c3-index--left",
        "c3-index--right",
      ];

      const levelRings = App.LEVELS.map(function (_, levelIndex) {
        const unlocked = App.isLevelUnlocked(seaIndex, levelIndex);
        const cleared = App.isLevelCleared(seaIndex, levelIndex);
        const number = String(levelIndex + 1).padStart(2, "0");
        const visualLevelId = seaIndex * 3 + levelIndex + 1;
        const levelConfig = (window.GameLevelConfigs || []).find(function (item) { return item.sea === seaIndex && item.level === levelIndex; });
        const levelTitle = levelConfig ? levelConfig.title : "第 " + (levelIndex + 1) + " 关";
        const state = !unlocked ? "locked" : cleared ? "done" : "current";
        return `
          <button
            class="ring-slot c3-ring ${ringClasses[levelIndex]}"
            type="button"
            data-state="${state}"
            data-c3-sea="${seaIndex}"
            data-c3-level="${levelIndex}"
            ${unlocked ? "" : "disabled"}
            aria-label="第 ${levelIndex + 1} 关 · ${App.escapeHtml(levelTitle)}"
          >
            <span class="ring-float">
              <span class="ring-preview c3-ring-preview" aria-hidden="true"><img src="assets/levels/level-0${visualLevelId}/environment/preview.png" alt="" draggable="false"></span>
              <span class="ring-bubble" aria-hidden="true"></span>
              <span class="ring-index c3-index ${indexClasses[levelIndex]}">${number}</span>
            </span>
          </button>
        `;
      }).join("");

      /* DOM 已经写进 #screen-root 之后再挂监听，所以走 rAF，
         不能直接在这里 addEventListener（那时候节点还没进文档） */
      window.requestAnimationFrame(mount);

      /* 整个海域的选择页、游玩页、结算浮窗共用这一套底图。
         后续单关底图统一在 js/ui/sea.js 里接入。 */
      const bg = window.SeaUI.background(seaIndex);

      return `
        <article class="scr scr-c3" data-screen="${seaCode}" aria-label="${seaCode} ${App.escapeHtml(sea.name)} · 章内三关">
          <h1 class="visually-hidden">${seaCode} ${App.escapeHtml(sea.name)} · 章内三关</h1>
          ${bg}
          ${levelRings}
          <button
            class="figma-back app-back"
            type="button"
            data-nav="c2"
            aria-label="返回 C2 主界面"
          >
            ${Icons.back}
          </button>
        </article>
      `;
    },
  };

  for (let seaIndex = 0; seaIndex < window.CONFIG.PLAYABLE_SEAS; seaIndex += 1) {
    window.Screens[window.SeaUI.seaScreenId(seaIndex)] = chapterScreen;
  }
})();
