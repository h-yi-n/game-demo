window.Screens.p1 = {
  render() {
    return `
      <article class="scr scr-p1" aria-label="P1 家长端概览">
        <h1 class="visually-hidden">P1 家长端概览</h1>
        <img
          class="scene-bg p1-bg"
          src="assets/家长端底图.png"
          alt=""
          draggable="false"
        />
        <nav class="p1-stub" aria-label="开发占位跳转">
          <p class="p1-stub__note">占位 · 排版未定</p>
          <div class="p1-stub__links">
            <button class="p1-stub__link" type="button" data-nav="p2">P2 训练计划</button>
            <button class="p1-stub__link" type="button" data-nav="p3">P3 记录与趋势</button>
          </div>
        </nav>
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
