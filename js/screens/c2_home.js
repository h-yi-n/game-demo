(function () {
  var SEA_NAMES = ["珊瑚森林", "海流峡谷", "水晶洞穴"];
  var SELECTED_SEA_KEY = "oral-motor-c2-selected-sea-v1";
  var leaving = false;

  function readSelectedSea(defaultSea) {
    if (Number.isInteger(window.C2SelectedSea)) {
      return window.C2SelectedSea;
    }
    try {
      var raw = window.localStorage.getItem(SELECTED_SEA_KEY);
      var saved = Number(raw);
      if (raw !== null && Number.isInteger(saved) && saved >= 0 && saved < 3) {
        return saved;
      }
    } catch (error) {
      // 本地存储不可用时继续使用 App 的选中海域。
    }
    return defaultSea;
  }

  /* 原样保留：捕获阶段写 localStorage */
  document.addEventListener(
    "click",
    function (event) {
      var ring = event.target.closest(".c2-ring[data-sea-index]");
      if (!ring) return;
      var seaIndex = Number(ring.dataset.seaIndex);
      if (!Number.isInteger(seaIndex) || seaIndex < 0 || seaIndex > 2) return;
      if (!window.App.isSeaUnlocked(seaIndex)) return;
      window.C2SelectedSea = seaIndex;
      try {
        window.localStorage.setItem(SELECTED_SEA_KEY, String(seaIndex));
      } catch (error) {
        // 当前会话仍可通过 window.C2SelectedSea 记住选择。
      }
    },
    true,
  );

  function teardown() {
    document.removeEventListener("click", onRingClick, false);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onRingClick, false);
    bindTitlePreview(readSelectedSea(window.App.getSelectedSea()));
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
    if (!Number.isInteger(seaIndex) || seaIndex < 0 || seaIndex > 2) return;
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
      nameEl.textContent = SEA_NAMES[index];
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
      if (!Number.isInteger(index) || index < 0 || index > 2) return;
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
      var context = App.getScreenContext();
      var allComplete = context.allComplete === true;
      var selectedSea = readSelectedSea(App.getSelectedSea());
      var selectedLabel = SEA_NAMES[selectedSea] || App.SEAS[selectedSea].name;
      var selectedNumber = String(selectedSea + 1).padStart(2, "0");

      function renderSeaRing(seaIndex, ringClass, indexClass) {
        var current = selectedSea === seaIndex;
        var number = String(seaIndex + 1).padStart(2, "0");
        var preview = `
          <span class="ring-preview c2-ring-preview">
            <img src="assets/海域${seaIndex + 1}预览.png" alt="" draggable="false">
          </span>
        `;
        return `
          <button
            class="ring-slot c2-ring ${ringClass}${current ? " is-current" : ""}"
            type="button"
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

      var mainRings = [
        ["c2-ring--one", "c2-ring-index--one", 0],
        ["c2-ring--two", "c2-ring-index--two", 1],
        ["c2-ring--three", "c2-ring-index--three", 2],
      ]
        .map(function ([ringClass, indexClass, seaIndex]) {
          return renderSeaRing(seaIndex, ringClass, indexClass);
        })
        .join("");

      // 海域 4–8 本轮不做（2026-11-10 决定），入口已从界面移除。
      // 解锁逻辑仍在 js/app.js 里，未来要做时按原样加回 .c2-mini-row 即可。

      window.requestAnimationFrame(mount);
      return `
        <article class="scr scr-c2" data-sea="${selectedSea}" aria-label="C2 主界面">
          <h1 class="visually-hidden">C2 主界面</h1>
          <img class="scene-bg c2-bg" src="assets/主界面底图.png" alt="" draggable="false">
          <img class="c2-whale" src="assets/主角-小鲸鱼.png" alt="" draggable="false">

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

          <nav class="c2-tools" aria-label="设置与工具">
            <button class="c2-tool" type="button" data-nav="c10" aria-label="设置">
              <span class="c2-tool__icon">${Icons.settings}</span>
            </button>
            <button class="c2-tool" type="button" data-nav="c8" aria-label="皮肤">
              <span class="c2-tool__icon">${Icons.skin}</span>
            </button>
            <button class="c2-tool" type="button" data-nav="c9" aria-label="图鉴">
              <span class="c2-tool__icon">${Icons.collection}</span>
            </button>
          </nav>

          ${allComplete ? '<p class="c2-complete" role="status">全部完成</p>' : ""}

          <svg
            class="c2-arc"
            viewBox="0 0 235 308"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="c2-arc__a"
              d="M22.5676 12.5121C-2.11472 107.274 3.17085 296.534 221.772 295.487"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="c2-arc__b"
              d="M22.5676 12.5121C-2.11472 107.274 3.17085 296.534 221.772 295.487"
              vector-effect="non-scaling-stroke"
            />
            <path
              class="c2-arc__c"
              d="M22.5676 12.5121C-2.11472 107.274 3.17085 296.534 221.772 295.487"
              vector-effect="non-scaling-stroke"
            />
          </svg>
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
