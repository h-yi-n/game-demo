window.Screens.p2 = {
  render() {
    return window.App.screen({
      code: "P2",
      title: "训练计划",
      description: "照护端训练计划空壳。",
      content: `
        <button type="button" data-nav="p1">P1 概览</button>
        <button type="button" data-nav="p3">P3 记录与趋势</button>
      `,
      back: { screen: "p1", label: "P1 概览" },
    });
  },
};
