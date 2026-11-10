window.Screens.c4 = {
  render(context) {
    const sea = window.App.SEAS[context.seaIndex];
    return window.App.screen({
      code: "C4",
      title: "游玩",
      description: `${sea.name} · 第 ${context.levelIndex + 1} 关`,
      content: `
        <div class="stage">游玩画面</div>
        <button type="button" data-action="complete-run">
          模拟跑完 → C5 单局结算
        </button>
      `,
    });
  },
};
