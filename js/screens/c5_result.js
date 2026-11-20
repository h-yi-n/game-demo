(function () {
  "use strict";

  /* 星级判定尚未接入，本轮所有关卡先模拟三星。
     后续只替换这个值，下面的 is-earned / is-missed 状态已经预留。 */
  const EARNED_STARS = 3;
  const STAR_PATH =
    "M32 3.8 L40.6 23.8 L62.3 25.6 L45.7 39.7 L50.7 60.9 " +
    "L32 49.6 L13.3 60.9 L18.3 39.7 L1.7 25.6 L23.4 23.8 Z";

  function renderStars() {
    return [0, 1, 2]
      .map(function (_, index) {
        const earned = index < EARNED_STARS;
        return `
          <span
            class="sea-result-star ${earned ? "is-earned" : "is-missed"}"
            data-star="${index + 1}"
            data-earned="${earned ? "true" : "false"}"
            style="--star-index: ${index}"
            aria-hidden="true"
          >
            <svg viewBox="0 0 64 64">
              <path d="${STAR_PATH}"></path>
            </svg>
          </span>
        `;
      })
      .join("");
  }

  /* 结算是浮窗，不是独立全屏页。弹出时 currentScreen 仍是对应游玩页，
     所以底层继续显示同一关、同一海域的底图。 */
  function trainingSummary(seaIndex, levelIndex) {
    const configs = window.GameLevelConfigs || [];
    const config = configs.find(function (item) {
      return item.sea === seaIndex && item.level === levelIndex;
    });
    const totals = { mouth: 0, resist: 0, blow: 0 };
    let count = 0;
    let seconds = 0;
    if (config) {
      config.rounds.forEach(function (round) {
        round.forEach(function (token) {
          const action = { M: "mouth", R: "resist", B: "blow" }[token[0]];
          const hold = Number(token.slice(1));
          totals[action] += hold;
          seconds += hold;
          count += 1;
        });
      });
    }
    return { title: config ? config.title : "", totals: totals, count: count, seconds: seconds };
  }

  function formatSeconds(seconds) {
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, "0");
    return String(minutes).padStart(2, "0") + ":" + rest;
  }

  function makeResultOverlay(seaIndex, levelIndex) {
    return {
      render(context) {
        const resultCode = window.SeaUI.resultCode(seaIndex, levelIndex);
        const autoplay = window.matchMedia("(prefers-reduced-motion: reduce)")
          .matches
          ? ""
          : "autoplay";
        const summary = trainingSummary(seaIndex, levelIndex);
        let destination = window.SeaUI.seaCode(context.targetSea) + " 关卡选择";
        if (context.allComplete) destination = "C2 主界面";
        return `
          <div class="sea-result-backdrop" aria-hidden="true"><img src="assets/海域${seaIndex + 1}底图.png" alt=""></div>
          <video
            class="sea-result-character"
            src="assets/video/hero_result_alpha.webm"
            preload="auto"
            muted
            loop
            playsinline
            ${autoplay}
            aria-hidden="true"
          ></video>
          <section
            class="overlay-card sea-result-card"
            data-overlay="${resultCode}"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-${seaIndex + 1}-${levelIndex + 1}-title"
            data-earned-stars="${EARNED_STARS}"
            data-training-seconds="${summary.seconds}"
          >
            <h2
              class="sea-result-card__title"
              id="result-${seaIndex + 1}-${levelIndex + 1}-title"
            >
              通关！
            </h2>
            <div class="sea-result-stars" aria-label="${EARNED_STARS}星通关">
              ${renderStars()}
            </div>
            <p class="sea-result-card__level">${window.App.escapeHtml(summary.title)}</p>
            <div class="sea-result-card__actions" aria-label="三项训练均已完成">
              <span>抿嘴 <i>✓</i></span><span>抗阻 <i>✓</i></span><span>吹气 <i>✓</i></span>
            </div>
            <p class="sea-result-card__time">${summary.count} 段 · 有效训练 ${formatSeconds(summary.seconds)}</p>
            <p class="visually-hidden">继续后前往：${destination}</p>
          </section>
          <button
            class="sea-result-continue"
            type="button"
            data-action="continue-result"
            aria-label="继续，前往${destination}"
          ></button>
        `;
      },
    };
  }

  for (let seaIndex = 0; seaIndex < window.CONFIG.PLAYABLE_SEAS; seaIndex += 1) {
    for (let levelIndex = 0; levelIndex < window.App.LEVELS.length; levelIndex += 1) {
      window.Overlays[window.SeaUI.resultOverlayId(seaIndex, levelIndex)] =
        makeResultOverlay(seaIndex, levelIndex);
    }
  }
})();
