(function () {
  var leaving = false;

  function teardown() {
    document.removeEventListener("click", onRingClick, false);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onRingClick, false);
    bindTitlePreview(window.App.getSelectedSea());
  }

  function leave(ring, seaIndex) {
    if (leaving) return;
    var scr = document.querySelector(".scr-c2");
    if (!scr) {
      window.App.openSea(seaIndex);
      return;
    }
    leaving = true;
    ring.classList.add("is-dived");
    scr.classList.add("is-leaving");

    var ms = parseFloat(
      window.getComputedStyle(scr).getPropertyValue("--anim-dive-dur"),
    );
    if (!(ms > 0)) ms = 700;

    window.setTimeout(function () {
      teardown();
      window.App.openSea(seaIndex);
    }, ms);
  }

  function onRingClick(event) {
    var ring =
      event.target.closest && event.target.closest(".c2-ring[data-sea-index]");
    if (!ring) return;
    var seaIndex = Number(ring.dataset.seaIndex);
    if (
      !Number.isInteger(seaIndex) ||
      seaIndex < 0 ||
      seaIndex >= window.CONFIG.PLAYABLE_SEAS
    ) {
      return;
    }
    if (!window.App.isSeaUnlocked(seaIndex)) return;
    leave(ring, seaIndex);
  }

  function bindTitlePreview(selectedSea) {
    var title = document.querySelector(".c2-title");
    var hero = document.querySelector(".c2-title__hero");
    var nameEl = document.querySelector(".c2-title__name");
    if (!title || !hero || !nameEl) return;

    var style = window.getComputedStyle(title);
    var swapOut = parseFloat(style.getPropertyValue("--c2-title-swap-out"));
    var swapIn = parseFloat(style.getPropertyValue("--c2-title-swap-in"));
    if (!(swapOut > 0)) swapOut = 0;
    if (!(swapIn > 0)) swapIn = 0;

    var shown = selectedSea;
    var paintTimer = 0;

    function paint(index) {
      hero.textContent = String(index + 1).padStart(2, "0");
      var sea = window.App.SEAS[index];
      nameEl.textContent = (sea && sea.name) || "";
      title.dataset.sea = String(index);
    }

    function setOpacity(value, ms) {
      [hero, nameEl].forEach(function (element) {
        element.style.transition = "opacity " + ms + "ms linear";
        element.style.opacity = value;
      });
    }

    function swapTo(index) {
      if (leaving || index === shown) return;
      shown = index;
      window.clearTimeout(paintTimer);

      if (!(swapOut > 0)) {
        paint(index);
        return;
      }

      setOpacity("0", swapOut);
      paintTimer = window.setTimeout(function () {
        if (leaving) return;
        /* 用最新的 shown，不是闭包里的 index —— 中途换目标时才会落在正确的海域上 */
        paint(shown);
        /* 强制回流，保证 opacity 从 0 回升时过渡真的发生 */
        void hero.offsetWidth;
        setOpacity("", swapIn);
      }, swapOut);
    }

    function restore() {
      swapTo(selectedSea);
    }

    var rings = document.querySelectorAll(".scr-c2 .c2-ring[data-sea-index]");
    rings.forEach(function (ring) {
      var index = Number(ring.dataset.seaIndex);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= window.CONFIG.PLAYABLE_SEAS
      ) {
        return;
      }
      ring.addEventListener("mouseenter", function () {
        swapTo(index);
      });
      ring.addEventListener("mouseleave", restore);
      ring.addEventListener("focus", function () {
        swapTo(index);
      });
      ring.addEventListener("blur", restore);
    });
  }

  window.Screens.c2 = {
    render() {
      var App = window.App;
      var selectedSea = App.getSelectedSea();
      var selectedLabel = App.SEAS[selectedSea].name;
      var selectedNumber = String(selectedSea + 1).padStart(2, "0");

      function renderSeaRing(seaIndex, ringClass, indexClass) {
        var current = selectedSea === seaIndex;
        var unlocked = window.App.isSeaUnlocked(seaIndex);
        var number = String(seaIndex + 1).padStart(2, "0");
        var preview = `
          <span class="ring-preview c2-ring-preview">
            <img src="assets/海域${seaIndex + 1}预览.png" alt="" draggable="false">
          </span>
        `;
        return `
          <button
            class="ring-slot c2-ring ${ringClass}${current ? " is-current" : ""}${!unlocked ? " is-locked" : ""}"
            type="button"
            ${!unlocked ? "disabled" : ""}
            data-sea-index="${seaIndex}"
            data-ring="sea-${seaIndex + 1}"
            aria-label="海域 ${seaIndex + 1}，前往章内三关"
          >
            <span class="ring-float">
              ${preview}
              <span class="ring-bubble" aria-hidden="true"></span>
              <span
                class="ring-index ${indexClass}"
                data-ring="sea-${seaIndex + 1}"
              >${number}</span>
            </span>
          </button>
        `;
      }

      var RING_WORDS = ["one", "two", "three"];
      var ringSlots = [];
      for (
        var ringIndex = 0;
        ringIndex < window.CONFIG.PLAYABLE_SEAS;
        ringIndex++
      ) {
        var word = RING_WORDS[ringIndex];
        if (!word) {
          throw new Error(
            "PLAYABLE_SEAS 超出 CSS 已有环样式（" + RING_WORDS.length + " 个）",
          );
        }
        ringSlots.push([
          ringIndex,
          "c2-ring--" + word,
          "c2-ring-index--" + word,
        ]);
      }
      var mainRings = ringSlots
        .map(function (slot) {
          return renderSeaRing(slot[0], slot[1], slot[2]);
        })
        .join("");

      // 当前只做三海域；海域内的路由统一由 js/ui/sea.js 生成。

      window.requestAnimationFrame(mount);
      return `
        <article class="scr scr-c2" data-sea="${selectedSea}" aria-label="C2 主界面">
          <h1 class="visually-hidden">C2 主界面</h1>

          <div class="c2-title" data-sea="${selectedSea}">
            <p class="c2-title__meta">海域</p>
            <span class="c2-title__rule-v" aria-hidden="true"></span>
            <p class="c2-title__level">lv.01</p>
            <span class="c2-title__rule-h" aria-hidden="true"></span>
            <p class="c2-title__hero">${selectedNumber}</p>
            <p class="c2-title__name">${App.escapeHtml(selectedLabel)}</p>
          </div>

          <p class="c2-side-title">
            <span class="c2-side-line">海域</span>
            <span class="c2-side-line">选择</span>
          </p>
          <span class="c2-sel-panel" aria-hidden="true"></span>

          <nav class="c2-tools" aria-label="设置与工具">
            <button class="c2-tool" type="button" data-nav="c2-1" aria-label="设置">
              <span class="c2-tool__icon">${Icons.settings}</span>
            </button>
            <button class="c2-tool" type="button" data-nav="c2-3" aria-label="外观">
              <span class="c2-tool__icon">${Icons.skin}</span>
            </button>
            <button class="c2-tool" type="button" data-nav="c2-4" aria-label="图鉴">
              <span class="c2-tool__icon">${Icons.collection}</span>
            </button>
            <button class="c2-tool" type="button" data-nav="c2-2" aria-label="成就">
              <span class="c2-tool__icon">${Icons.achievement}</span>
            </button>
          </nav>

          <span class="c2-bubble c2-bubble--a" aria-hidden="true"></span>
          <span class="c2-bubble c2-bubble--b" aria-hidden="true"></span>
          <span class="c2-bubble c2-bubble--c" aria-hidden="true"></span>

          ${mainRings}

          <div class="ring-slot c2-ring--extra" aria-hidden="true">
            <span class="ring-float">
              <span class="ring-bubble"></span>
            </span>
          </div>

          <button
            class="figma-back app-back"
            type="button"
            data-nav="c1"
            aria-label="返回 C1 开屏"
          >
            ${Icons.back}
          </button>
        </article>
      `;
    },
  };
})();
