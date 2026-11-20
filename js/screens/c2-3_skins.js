/* C2-3 皮肤（页内标题写「外观」）
   三个圆环直接复用 C3-1：同一套 .ring-slot / .ring-bubble / .c3-ring--* 类，
   同一批 --c3-* token。Figma 里这两张的三环实测同坐标，所以是字面意义上的复用，
   不是"照着画一遍"。
   这一版环里不放皮肤缩略图（内容后补），只用玻璃环 + 编号把骨架立住。
   环不可点，所以用 <div>：外观页只做选择预览，跳转仍在别处。 */
window.Screens["c2-3"] = {
  render() {
    const Scene = window.Scene;
    const previews = ["assets/主角-小海豚 定稿.png", "assets/主角-小海豚 皮肤外观1.png", "assets/主角-小海豚 皮肤外观2.png"];
    const rings = [
      ["c3-ring--center", "c3-index--center", "01"],
      ["c3-ring--left", "c3-index--left", "02"],
      ["c3-ring--right", "c3-index--right", "03"],
    ]
      .map(function ([ringClass, indexClass, number], index) {
        return `
          <div class="ring-slot c3-ring ${ringClass}" aria-hidden="true">
            <span class="ring-float">
              <span class="ring-preview c3-ring-preview" aria-hidden="true"><img src="${previews[index]}" alt="" draggable="false"></span>
              <span class="ring-bubble"></span>
              <span class="ring-index c3-index ${indexClass}">${number}</span>
            </span>
          </div>
        `;
      })
      .join("");

    window.requestAnimationFrame(function () {
      window.SeaUI.bindRingFocus(document.querySelector(".scr-c2-3"));
    });

    return Scene.page({
      id: "c2-3",
      title: "外观",
      label: "C2-3 外观",
      back: "c2",
      content: rings,
    });
  },
};
