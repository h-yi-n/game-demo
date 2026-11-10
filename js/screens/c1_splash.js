(function () {
  var leaving = false;

  function teardown() {
    document.removeEventListener("click", onClick, false);
    document.removeEventListener("keydown", onKeydown, true);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onClick, false);
    document.addEventListener("keydown", onKeydown, true);
  }

  function leave(next) {
    if (leaving) return;
    var scr = document.querySelector(".scr-c1");
    if (!scr) {
      window.App.navigate(next);
      return;
    }
    leaving = true;
    scr.classList.add("is-leaving");

    var ms = parseFloat(
      window.getComputedStyle(scr).getPropertyValue("--anim-exit-dur"),
    );
    if (!(ms > 0)) ms = 900;

    window.setTimeout(function () {
      teardown();
      window.App.navigate(next);
    }, ms);
  }

  function onClick(event) {
    var button =
      event.target.closest && event.target.closest(".c1-start, .c1-switch");
    if (!button) return;
    leave(button.classList.contains("c1-switch") ? "p1" : "c2");
  }

  function onKeydown(event) {
    if (event.repeat) return;
    /* 与 app.js 的 handleKeydown 保持同一套让位规则：
       焦点在按钮上时不接管，交给按钮自己的点击 */
    if (event.target && event.target.closest && event.target.closest("button")) {
      return;
    }
    if (
      event.key === "Shift" ||
      event.key === "Control" ||
      event.key === "Alt" ||
      event.key === "Meta"
    ) {
      return;
    }
    event.preventDefault();
    event.stopImmediatePropagation();
    leave("c2");
  }

  window.Screens.c1 = {
    render() {
      window.requestAnimationFrame(mount);
      return `
      <article class="scr scr-c1" aria-label="C1 开屏">
        <div class="c1-cam" aria-hidden="true">
          <img
            class="scene-bg c1-bg"
            src="assets/开屏图.png"
            alt=""
            draggable="false"
          />
          <img
            class="c1-whale"
            src="assets/开屏鲸鱼.png"
            alt=""
            draggable="false"
          />
        </div>
        <div class="c1-sheen" aria-hidden="true"></div>
        <button class="c1-start" type="button">
          <span class="visually-hidden">任意键或点按屏幕进入主界面</span>
        </button>
        <button
          class="c1-switch"
          type="button"
          aria-label="切换到家长视角"
        >
          <span class="c1-switch-icon">${Icons.viewSwitch}</span>
          <span class="c1-switch-label">视角切换 - 家长</span>
        </button>
        <h1 class="c1-title">唇游深海</h1>
        <p class="c1-hint">轻轻抿嘴 进入游戏</p>
      </article>
    `;
    },
  };
})();
