window.Screens.c9 = {
  render() {
    return window.App.screen({
      code: "C9",
      title: "图鉴",
      description: "查看遇到过的海洋伙伴。",
      content: `<button type="button" data-nav="c2">C2 主界面</button>`,
      back: { screen: "c2", label: "C2 主界面" },
    });
  },
};
