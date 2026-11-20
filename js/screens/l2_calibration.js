window.Overlays.l2 = {
  render(context) {
    const actions = [
      { index: 0, label: "抿嘴", name: "mouth" },
      { index: 1, label: "抿嘴抗阻", name: "resist" },
      { index: 2, label: "吹气", name: "blow" },
    ];
    const mouthTried = context.tried[0];
    const resistTried = context.tried[1];
    const blowTried = context.tried[2];
    const step = !mouthTried
      ? "mouth"
      : !resistTried
        ? "resist"
        : !blowTried
          ? "blow"
          : "done";
    const buttons = actions
      .map(function (action, position) {
        const tried = context.tried[action.index];
        const locked =
          (action.name === "resist" && !mouthTried) ||
          (action.name === "blow" && !(mouthTried && resistTried));
        const status = tried ? "已试" : locked ? "等待前一项" : "试一下";
        const positionName = ["one", "two", "three"][position];
        return `
          <div
            class="calibration-action calibration-action--${positionName}"
            data-calibration="${action.index}"
            data-calibration-name="${action.name}"
            data-calibration-label="${action.label}"
            data-calibration-key="${action.index + 1}"
            data-tried="${tried ? "true" : "false"}"
            data-locked="${locked ? "true" : "false"}"
            aria-label="${action.label}，${status}"
          >
            <span class="calibration-action__frame" aria-hidden="true">
              <span class="calibration-action__media" data-calibration-media="${action.name}">
                <span class="calibration-action__sprite"></span>
              </span>
            </span>
            <span class="calibration-action__done" aria-hidden="true">✓</span>
            <span class="calibration-action__label">${action.label}</span>
          </div>
        `;
      })
      .join("");

    return `
      <section
        class="overlay-card calibration-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calibration-title"
        data-calibration-step="${step}"
      >
        <h1 class="calibration-card__title" id="calibration-title">校准</h1>
        <p class="visually-hidden">依次模拟抿嘴、抿嘴抗阻和吹气，三项都完成后开始本关。</p>
        <div class="calibration-actions">
          ${buttons}
        </div>
      </section>
    `;
  },
};
