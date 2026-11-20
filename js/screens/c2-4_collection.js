/* C2-4 图鉴：01 为主角，02~09 按定稿顺序展示海洋伙伴。 */
window.Screens["c2-4"] = {
  render() {
    const Scene = window.Scene;
    const creatures = [
      { id: "dolphin", number: "01", name: "小海豚" },
      { id: "crab", number: "02", name: "小螃蟹", image: "assets/collection/02-crab.png" },
      { id: "spiral-shell", number: "03", name: "螺旋贝壳", image: "assets/rewards/spiral-shell.png" },
      { id: "tidal-pearl", number: "04", name: "贝壳珍珠", image: "assets/rewards/tidal-pearl.png" },
      { id: "blue-crystal", number: "05", name: "蓝色水晶", image: "assets/rewards/blue-crystal.png" },
      { id: "pufferfish", number: "06", name: "小河豚", image: "assets/collection/06-pufferfish.png" },
      { id: "electric-eel", number: "07", name: "小电鳗", image: "assets/collection/07-electric-eel.png" },
      { id: "anglerfish", number: "08", name: "小鮟鱇", image: "assets/collection/08-anglerfish.png" },
      { id: "tropical-fish", number: "09", name: "小热带鱼", image: "assets/collection/09-tropical-fish.png" },
    ];

    const cells = creatures.map(function (creature, index) {
      const image = creature.image || `assets/collection/${creature.number}-${creature.id}.png`;
      if (creature.image) {
        window.CharacterStage.register(creature.id, {
          number: creature.number,
          name: creature.name,
          image: creature.image,
          scale: creature.id === "spiral-shell" || creature.id === "tidal-pearl" ? 0.42 : 1,
        });
      }
      const selected = index === 0;
      return `
        <button
          class="coll-cell${selected ? " is-selected" : ""}"
          type="button"
          data-character-id="${creature.id}"
          aria-label="${creature.number} ${creature.name}"
          aria-pressed="${selected}"
        >
          <span class="panel-box coll-cell__surface" aria-hidden="true"></span>
          <span class="coll-thumb" aria-hidden="true">
            <img src="${image}" alt="" draggable="false">
          </span>
          <span class="coll-index" aria-hidden="true">${creature.number}</span>
        </button>
      `;
    }).join("");

    return Scene.page({
      id: "c2-4",
      title: "图鉴",
      label: "C2-4 图鉴",
      back: "c2",
      content: `<div class="panel-grid-3x3" role="group" aria-label="选择要展示的海洋伙伴">${cells}</div>`,
    });
  },
};
