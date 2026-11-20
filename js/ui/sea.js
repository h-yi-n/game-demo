(function () {
  "use strict";

  /* C3 海域内部的编号与底图只有这一份：
     C3-1 / C3-2 / C3-3       海域选关页
     C3-x-1 / C3-x-3 / C3-x-5 三关游玩页
     C3-x-2 / C3-x-4 / C3-x-6 对应结算浮窗 */
  function seaScreenId(seaIndex) {
    return "c3-" + (seaIndex + 1);
  }

  function playScreenId(seaIndex, levelIndex) {
    return seaScreenId(seaIndex) + "-" + (levelIndex * 2 + 1);
  }

  function resultOverlayId(seaIndex, levelIndex) {
    return seaScreenId(seaIndex) + "-" + (levelIndex * 2 + 2);
  }

  function upper(id) {
    return id.toUpperCase();
  }

  /* 三个海域各共用一条循环底图。以后某一关有独立底图时，
     只在这里按 seaIndex + levelIndex 增加分支，不改页面与路由。 */
  function background(seaIndex) {
    const autoplay = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? ""
      : "autoplay";
    const seaNumber = seaIndex + 1;
    return `<video
      class="scene-bg c3-bg"
      src="assets/video/海域${seaNumber}底图动画.mp4"
      poster="assets/video/海域${seaNumber}底图动画-封面.jpg"
      preload="auto"
      muted
      loop
      playsinline
      ${autoplay}
    ></video>`;
  }

  function bindRingFocus(root) {
    if (!root) return;
    const rings = Array.from(root.querySelectorAll(".c3-ring"));
    if (!rings.length) return;
    let activeIndex = -1;

    function focusRing(nextIndex, lockDisplacedRing) {
      if (nextIndex === activeIndex) return;
      const displacedRole = rings[nextIndex].dataset.ringRole;
      const leftIndex = nextIndex === 0 ? 1 : 0;
      rings.forEach(function (ring, ringIndex) {
        ring.dataset.ringRole =
          ringIndex === nextIndex
            ? "center"
            : ringIndex === leftIndex
              ? "left"
              : "right";
      });
      activeIndex = nextIndex;

      if (lockDisplacedRing) {
        /* 换位后滑进鼠标原位置的环先不响应；必须先离开再重新进入，
           避免从它上面滑向中央时连续触发换位。 */
        rings.forEach(function (ring, ringIndex) {
          if (
            ringIndex !== nextIndex &&
            ring.dataset.ringRole === displacedRole
          ) {
            ring.dataset.ringSuppressed = "true";
          }
        });
      }
    }

    rings.forEach(function (ring, ringIndex) {
      ring.addEventListener("mouseenter", function () {
        if (ring.dataset.ringSuppressed === "true") return;
        focusRing(ringIndex, true);
      });
      ring.addEventListener("mouseleave", function () {
        delete ring.dataset.ringSuppressed;
      });
    });
    focusRing(0, false);
  }

  window.SeaUI = {
    seaScreenId: seaScreenId,
    playScreenId: playScreenId,
    resultOverlayId: resultOverlayId,
    seaCode: function (seaIndex) {
      return upper(seaScreenId(seaIndex));
    },
    playCode: function (seaIndex, levelIndex) {
      return upper(playScreenId(seaIndex, levelIndex));
    },
    resultCode: function (seaIndex, levelIndex) {
      return upper(resultOverlayId(seaIndex, levelIndex));
    },
    background: background,
    bindRingFocus: bindRingFocus,
  };
})();
