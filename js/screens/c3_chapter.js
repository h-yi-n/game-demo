(function () {
  "use strict";

  const C3_SELECTED_SEA_KEY = "oral-motor-c2-selected-sea-v1";

  let leaving = false;

  function teardown() {
    document.removeEventListener("click", onLevelClick, false);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onLevelClick, false);
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
    if (!Number.isInteger(seaIndex) || seaIndex < 0 || seaIndex > 2) return;
    if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex > 2) {
      return;
    }
    leave(ring, seaIndex, levelIndex);
  }

  window.Screens.c3 = {
    render() {
      const App = window.App;
      const context = App.getScreenContext();
      const savedRaw = window.localStorage.getItem(C3_SELECTED_SEA_KEY);
      const savedSea = Number(savedRaw);
      const relayedSea = Number.isInteger(window.C2SelectedSea)
        ? window.C2SelectedSea
        : savedRaw !== null &&
            Number.isInteger(savedSea) &&
            savedSea >= 0 &&
            savedSea < 3
          ? savedSea
          : App.getSelectedSea();
      const seaIndex = Number.isInteger(context.seaIndex)
        ? context.seaIndex
        : relayedSea;
      const sea = App.SEAS[seaIndex];

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
        const state = !unlocked ? "locked" : cleared ? "done" : "current";
        return `
          <button
            class="ring-slot c3-ring ${ringClasses[levelIndex]}"
            type="button"
            data-state="${state}"
            data-c3-sea="${seaIndex}"
            data-c3-level="${levelIndex}"
            ${unlocked ? "" : "disabled"}
            aria-label="第 ${levelIndex + 1} 关"
          >
            <span class="ring-float">
              <span class="ring-bubble" aria-hidden="true"></span>
              <span class="ring-index c3-index ${indexClasses[levelIndex]}">${number}</span>
            </span>
          </button>
        `;
      }).join("");

      /* DOM 已经写进 #screen-root 之后再挂监听，所以走 rAF，
         不能直接在这里 addEventListener（那时候节点还没进文档） */
      window.requestAnimationFrame(mount);

      return `
        <article class="scr scr-c3" aria-label="C3 ${App.escapeHtml(sea.name)} · 章内三关">
          <h1 class="visually-hidden">C3 ${App.escapeHtml(sea.name)} · 章内三关</h1>
          <img
            class="scene-bg c3-bg"
            src="assets/海域${seaIndex + 1}底图.png"
            alt=""
            draggable="false"
          />
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
})();
