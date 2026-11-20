(function () {
  "use strict";
  window.Overlays.intro = {
    render(context) {
      return `
        <section class="intro-player" aria-label="剧情开场动画">
          <video class="intro-video" src="assets/video/intro.mp4" autoplay playsinline preload="auto"></video>
          <button class="intro-skip" type="button" data-action="close-overlay" aria-label="跳过开场动画">跳过</button>
        </section>
      `;
    },
  };
})();
