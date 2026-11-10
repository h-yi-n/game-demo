window.Overlays.l2 = {
  render(context) {
    const labels = ["抿嘴", "抿嘴抗阻", "吹气"];
    const buttons = labels.map(function (label, index) {
      const tried = context.tried[index];
      return `
        <button
          type="button"
          data-action="calibrate"
          data-calibration="${index}"
          ${tried ? "disabled" : ""}
        >
          ${label}${tried ? " · 已试" : " · 试一下"}
        </button>
      `;
    }).join("");

    return `
      <section class="overlay-card" role="dialog" aria-modal="true" aria-label="校准">
        <h1>L2 校准</h1>
        <p>三个动作各试一次；全部试完后自动进入 C4。</p>
        ${buttons}
      </section>
    `;
  },
};
