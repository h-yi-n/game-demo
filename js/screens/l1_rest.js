window.Overlays.l1 = {
  render() {
    return `
      <section class="overlay-card" role="dialog" aria-modal="true" aria-label="强制休息">
        <h1>L1 强制休息</h1>
        <p>现在休息一下。</p>
        <button type="button" data-action="close-overlay">
          点一下关闭 → 回到 C4 原处
        </button>
      </section>
    `;
  },
};
