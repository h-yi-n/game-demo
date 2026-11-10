window.Screens.c7 = {
  render() {
    return window.App.screen({
      code: "C7",
      title: "成就",
      description: "查看已获得和未获得的成就。",
      content: `<button type="button" data-nav="c2">C2 主界面</button>`,
      back: { screen: "c2", label: "C2 主界面" },
    });
  },
};
