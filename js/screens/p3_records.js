window.Screens.p3 = {
  render() {
    return window.App.screen({
      code: "P3",
      title: "记录与趋势",
      description: "照护端记录与趋势空壳。",
      content: `
        <button type="button" data-nav="p1">P1 概览</button>
        <button type="button" data-nav="p2">P2 训练计划</button>
      `,
      back: { screen: "p1", label: "P1 概览" },
    });
  },
};
