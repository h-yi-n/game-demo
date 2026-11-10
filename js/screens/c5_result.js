window.Screens.c5 = {
  render(context) {
    const target =
      context.targetScreen === "c2"
        ? "C2 主界面"
        : `C3 ${window.App.SEAS[context.targetSea].name}`;
    return window.App.screen({
      code: "C5",
      title: "单局结算",
      description: "本局完成。点继续前往下一目的地。",
      content: `
        <div class="stage">本局已通关；下一目的地：${target}</div>
        <button type="button" data-action="continue-result">
          继续 → 回关卡选择
        </button>
      `,
    });
  },
};
