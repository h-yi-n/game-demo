window.Level01Markup = function () {
  return `<main class="level-stage" id="level-stage" tabindex="0" data-action="mouth" data-state="waiting">
    <div class="ocean" aria-hidden="true">
      <div class="ocean__track" id="ocean-track">
        <img class="ocean__background" src="assets/levels/level-01/environment/background-loop.png" alt="">
        <img class="ocean__background" src="assets/levels/level-01/environment/background-loop.png" alt="">
        <img class="ocean__background" src="assets/levels/level-01/environment/background-loop.png" alt="">
      </div>
      <div class="ocean__glow"></div>
      <div class="ocean__rays"><i></i><i></i><i></i></div>
      <div class="ambient-bubbles" id="ambient-bubbles"></div>
      <div class="fish-school fish-school--one"><i></i><i></i><i></i><i></i></div>
      <div class="fish-school fish-school--two"><i></i><i></i><i></i></div>
    </div>

    <div class="world" id="world" aria-hidden="true">
      <div class="world__layer world__layer--back" id="back-flora"></div>
      <div class="world__layer world__layer--front" id="front-flora"></div>
    </div>

    <div class="encounters" id="encounters" aria-hidden="true"></div>

    <div class="hero-wrap" id="hero-wrap" aria-hidden="true">
      <div class="hero-trail" id="hero-trail"></div>
      <div class="hero-pulse"><i></i><i></i><i></i></div>
      <video id="hero-ready" class="hero-state is-active" data-visual="ready" src="assets/hero/states/dolphin-01-ready.webm" muted loop playsinline preload="auto"></video>
      <video id="hero-focus" class="hero-state" data-visual="focus" src="assets/hero/states/dolphin-02-focus.webm" muted loop playsinline preload="auto"></video>
      <video class="hero-state" data-visual="sustain" src="assets/hero/states/dolphin-03-sustain.webm" muted loop playsinline preload="auto"></video>
      <video class="hero-state" data-visual="steady" src="assets/hero/states/dolphin-04-steady.webm" muted loop playsinline preload="auto"></video>
      <video class="hero-state" data-visual="complete" src="assets/hero/states/dolphin-05-complete.webm" muted loop playsinline preload="auto"></video>
      <video class="hero-state" data-visual="waiting" src="assets/hero/states/dolphin-06-waiting.webm" muted loop playsinline preload="auto"></video>
      <img class="hero-fallback" id="hero-fallback" src="assets/hero/states/dolphin-01-ready.png" alt="" hidden>
    </div>

    <header class="hud">
      <div class="hud__level">
        <span class="hud__eyebrow">珊瑚森林 · 01</span>
        <strong>海草迷宫</strong>
      </div>
      <div class="journey" aria-label="关卡进度">
        <div class="journey__labels"><span></span><span id="journey-percent">0%</span></div>
        <div class="journey__track"><span id="journey-fill"></span><i id="journey-dot"></i></div>
      </div>
    </header>

    <button class="figma-back app-back level-back" id="back-button" type="button" aria-label="返回海域">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.9 3.3 7.3 12 17.9 20.7" vector-effect="non-scaling-stroke"></path></svg>
    </button>

    <section class="action-card" id="action-card" aria-live="polite">
      <div class="action-ring" id="action-ring">
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle class="action-ring__base" cx="60" cy="60" r="53"></circle><circle class="action-ring__value" id="action-ring-value" cx="60" cy="60" r="53"></circle></svg>
        <div class="action-demo" id="action-demo" data-demo="mouth" aria-hidden="true"><span class="action-demo__sprite"></span><i></i><i></i></div>
      </div>
    </section>

    <div class="round-toast" id="round-toast" role="status" aria-label="这一阶段完成"><span>✓</span></div>




    <section class="complete-panel" id="complete-panel" hidden>
      <div class="complete-panel__halo"></div>
      <video class="complete-hero" src="assets/video/hero_result_alpha.webm" autoplay muted loop playsinline></video>
      <span class="complete-panel__kicker" id="complete-level-name">海草迷宫</span>
      <h1>通关！</h1>
      <div class="complete-stars" aria-label="三星通关"><i>★</i><i>★</i><i>★</i></div>
      <p id="complete-training-time">16 段 · 有效训练 01:15</p>
      <div class="complete-actions"><span>抿嘴前进<i>✓</i></span><span>抗阻寻路<i>✓</i></span><span>吹散海草<i>✓</i></span></div>
    </section>
    <div class="blow-stream" id="blow-stream" aria-hidden="true"></div>
  </main>`;
};
