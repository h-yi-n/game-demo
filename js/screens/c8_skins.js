window.Screens.c8 = {
  render() {
    return window.App.screen({
      code: "C8",
      title: "皮肤",
      description: "查看可用外观并选择一个应用。",
      content: `<button type="button" data-nav="c2">C2 主界面</button>`,
      back: { screen: "c2", label: "C2 主界面" },
    });
  },
};
