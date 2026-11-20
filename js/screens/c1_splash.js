(function () {
  var leaving = false;

  function teardown() {
    document.removeEventListener("click", onClick, false);
    document.removeEventListener("actioninputhold", onActionHold, false);
    document.removeEventListener("app:navigate", onScreenNavigate, false);
    leaving = false;
  }

  function mount() {
    teardown();
    document.addEventListener("click", onClick, false);
    document.addEventListener("actioninputhold", onActionHold, false);
    document.addEventListener("app:navigate", onScreenNavigate, false);
  }

  function leave(next) {
    if (leaving) return;
    var scr = document.querySelector(".scr-c1");
    if (!scr) {
      window.App.navigate(next);
      return;
    }
    /* 先把下一家族的视频底图放到开屏下面，再让开屏淡出。
       不能等开屏透明后才切背景，否则两屏之间必然露出纯色舞台底色。 */
    var nextFamily = next === "c2" ? "c2" : (next === "p1" || next === "p2" ? "p" : null);
    if (nextFamily && window.Scene && window.Scene.bg) window.Scene.bg(nextFamily);
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

  function onScreenNavigate(event) {
    if (event.detail && event.detail.screen !== "c1") teardown();
  }

  function onClick(event) {
    var button = event.target.closest && event.target.closest(".c1-switch");
    if (!button) return;
    leave("p1");
  }

  function onActionHold(event) {
    var action = event.detail && event.detail.action;
    if (
      action &&
      window.ActionInput.satisfies(action.id, "mouth")
    ) {
      leave("c2");
    }
  }

  window.Screens.c1 = {
    render() {
      window.requestAnimationFrame(mount);
      /* 底图是循环视频。prefers-reduced-motion 时不自动播放，
         停在 poster 上——等于回到"静态底图"，正是这个偏好要的结果 */
      const autoplay = window.matchMedia("(prefers-reduced-motion: reduce)")
        .matches
        ? ""
        : "autoplay";
      return `
      <article class="scr scr-c1" aria-label="C1 开屏">
        <div class="c1-cam" aria-hidden="true">
          <video
            class="scene-bg c1-bg"
            src="assets/video/开屏图动画.mp4"
            poster="assets/video/开屏图动画-封面.jpg"
            preload="auto"
            muted
            loop
            playsinline
            ${autoplay}
          ></video>
        </div>
        <div class="c1-sheen" aria-hidden="true"></div>
        <div class="c1-start" aria-hidden="true"></div>
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
