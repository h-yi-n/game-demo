window.Screens.c6 = {
  render() {
    return window.App.screen({
      code: "C6",
      title: "等级详情",
      description: "查看当前等级、升级所需及已获得内容。",
      content: `<button type="button" data-nav="c2">C2 主界面</button>`,
      back: { screen: "c2", label: "C2 主界面" },
    });
  },
};
