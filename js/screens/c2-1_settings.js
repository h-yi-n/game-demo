(function () {
  "use strict";
  function render() {
    const active = window.SaveStore.getActive();
    const data = active.data;
    const level = window.SaveStore.levelFromXp(data.xp);
    const completed = data.sessions.length;
    const profiles = window.SaveStore.getProfiles().map(function (profile) {
      if (!profile) {
        const id = ["A", "B", "C"][window.SaveStore.getProfiles().indexOf(profile)];
        return `<button class="profile-row is-empty" type="button" data-profile-create="${id}"><span>＋</span>新建档位</button>`;
      }
      const selected = profile.id === active.id;
      return `
        <button class="profile-row${selected ? " is-current" : ""}" type="button" data-profile-switch="${profile.id}" ${selected ? "disabled" : ""}>
          <span>${profile.name}</span><small>Lv.${window.SaveStore.levelFromXp(profile.data.xp).level} · ${profile.data.sessions.length} 次训练</small><i>${selected ? "当前" : "切换"}</i>
        </button>`;
    }).join("");
    const percent = Math.round(level.progress * 100);
    return `
      <section class="settings-panel settings-overview">
        <span class="settings-kicker">当前成长</span>
        <strong class="settings-level">Lv.${level.level}</strong>
        <span class="settings-xp">${data.xp} XP</span>
        <div class="settings-progress" aria-label="等级经验进度"><span style="width:${percent}%"></span></div>
        <p>${level.next ? `${percent}% · 下一级 ${level.next} XP` : "已达到当前最高等级"}</p>
        <p class="settings-muted">完成训练 ${completed} 次</p>
      </section>
      <section class="settings-panel settings-options">
        <h2>偏好</h2>
        <label class="settings-volume">背景音乐音量
          <input id="settings-volume" type="range" min="0" max="1" step="0.01" value="${window.AudioBus ? window.AudioBus.getVolume() : 0.6}">
        </label>
        <button class="settings-action" id="settings-replay" type="button">查看开场回放</button>
      </section>
      <section class="settings-panel settings-profiles">
        <h2>本地存档</h2>
        <p class="settings-muted">解锁、经验、成就和家长端记录分别保存</p>
        <div class="profile-list">${profiles}</div>
        <button class="settings-action settings-reset" id="settings-reset-profile" type="button" data-confirm="false">重置当前档位</button>
      </section>
    `;
  }

  function mount() {
    const volume = document.getElementById("settings-volume");
    if (volume) {
      const paintVolume = function () {
        const percent = Math.round(Number(volume.value) * 100);
        volume.style.setProperty("--volume-percent", percent + "%");
      };
      paintVolume();
      volume.addEventListener("input", function () {
        paintVolume();
        if (window.AudioBus) window.AudioBus.setVolume(this.value);
      });
    }
    const replay = document.getElementById("settings-replay");
    if (replay) replay.addEventListener("click", function () { window.App.playIntro(true); });
    document.querySelectorAll("[data-profile-switch]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.SaveStore.switchTo(this.dataset.profileSwitch)) window.App.navigate("c2-1");
      });
    });
    document.querySelectorAll("[data-profile-create]").forEach(function (button) {
      button.addEventListener("click", function () {
        if (window.SaveStore.create(this.dataset.profileCreate)) window.App.navigate("c2-1");
      });
    });
    const reset = document.getElementById("settings-reset-profile");
    if (reset) {
      reset.addEventListener("click", function () {
        if (this.dataset.confirm !== "true") {
          this.dataset.confirm = "true";
          this.textContent = "再次点击确认重置";
          return;
        }
        window.App.resetProgress();
        window.App.navigate("c2-1");
      });
    }
  }

  window.Screens["c2-1"] = {
    render() {
      window.requestAnimationFrame(mount);
      return Scene.page({
        id: "c2-1",
        title: "设置",
        label: "C2-1 设置",
        back: "c2",
        content: render(),
      });
    },
  };
})();
