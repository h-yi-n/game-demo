(function () {
  "use strict";
  const REWARDS = {
    3: { name: "螺旋贝壳", image: "assets/rewards/spiral-shell.png", xp: 40 },
    6: { name: "贝壳珍珠", image: "assets/rewards/tidal-pearl.png", xp: 50 },
    9: { name: "蓝色水晶", image: "assets/rewards/blue-crystal.png", xp: 60 },
  };
  const MILESTONES = [
    { id: "first-run", title: "第一次出航", text: "完成任意一关", xp: 50, test: d => d.sessions.length >= 1, progress: d => `${Math.min(1, d.sessions.length)} / 1` },
    { id: "sea-1-complete", title: "珊瑚森林的伙伴", text: "完成海域 1 全部关卡", xp: 150, test: (d, done) => done(1) && done(2) && done(3), progress: (d, done) => `${[1, 2, 3].filter(done).length} / 3` },
    { id: "sea-2-complete", title: "听见海流", text: "完成海域 2 全部关卡", xp: 200, test: (d, done) => done(4) && done(5) && done(6), progress: (d, done) => `${[4, 5, 6].filter(done).length} / 3` },
    { id: "sea-3-complete", title: "水晶微光", text: "完成海域 3 全部关卡", xp: 300, test: (d, done) => done(7) && done(8) && done(9), progress: (d, done) => `${[7, 8, 9].filter(done).length} / 3` },
    { id: "three-stars", title: "三星训练", text: "任意一关获得三星", xp: 30, test: d => Object.values(d.plays).some(play => play.bestStars >= 3), progress: d => `${Object.values(d.plays).some(play => play.bestStars >= 3) ? 1 : 0} / 1` },
    { id: "ten-runs", title: "坚持练习", text: "累计完成 10 次训练", xp: 100, test: d => d.sessions.length >= 10, progress: d => `${Math.min(10, d.sessions.length)} / 10` },
    { id: "all-nine", title: "海域探索者", text: "完成全部九关", xp: 500, test: (d, done) => [1,2,3,4,5,6,7,8,9].every(done), progress: (d, done) => `${[1,2,3,4,5,6,7,8,9].filter(done).length} / 9` },
  ].concat([
    { id: "first-resist", title: "抗阻初体验", text: "完成一次抗阻动作", xp: 30, test: d => Object.values(d.plays).length > 0, progress: d => `${Object.values(d.plays).length ? 1 : 0} / 1` },
    { id: "first-blow", title: "吹开海草", text: "完成一次吹气动作", xp: 30, test: d => Object.values(d.plays).length > 0, progress: d => `${Object.values(d.plays).length ? 1 : 0} / 1` },
    { id: "three-runs", title: "熟悉节奏", text: "累计完成 3 次训练", xp: 50, test: d => d.sessions.length >= 3, progress: d => `${Math.min(3, d.sessions.length)} / 3` },
    { id: "five-runs", title: "稳定前进", text: "累计完成 5 次训练", xp: 80, test: d => d.sessions.length >= 5, progress: d => `${Math.min(5, d.sessions.length)} / 5` },
    { id: "repeat-three", title: "再次挑战", text: "任意一关完成 3 次", xp: 80, test: d => Object.values(d.plays).some(play => play.completions >= 3), progress: d => `${Math.max(0, ...Object.values(d.plays).map(play => play.completions))} / 3` },
    { id: "sea-1-stars", title: "珊瑚之星", text: "海域 1 全部三星", xp: 100, test: d => [1,2,3].every(id => d.plays[id] && d.plays[id].bestStars >= 3), progress: d => `${[1,2,3].filter(id => d.plays[id] && d.plays[id].bestStars >= 3).length} / 3` },
    { id: "sea-2-stars", title: "峡谷之星", text: "海域 2 全部三星", xp: 150, test: d => [4,5,6].every(id => d.plays[id] && d.plays[id].bestStars >= 3), progress: d => `${[4,5,6].filter(id => d.plays[id] && d.plays[id].bestStars >= 3).length} / 3` },
    { id: "sea-3-stars", title: "水晶之星", text: "海域 3 全部三星", xp: 200, test: d => [7,8,9].every(id => d.plays[id] && d.plays[id].bestStars >= 3), progress: d => `${[7,8,9].filter(id => d.plays[id] && d.plays[id].bestStars >= 3).length} / 3` },
    { id: "xp-500", title: "成长一小步", text: "累计获得 500 XP", xp: 50, test: d => d.xp >= 500, progress: d => `${Math.min(500, d.xp)} / 500` },
    { id: "xp-1000", title: "稳定积累", text: "累计获得 1000 XP", xp: 100, test: d => d.xp >= 1000, progress: d => `${Math.min(1000, d.xp)} / 1000` },
    { id: "skin-coral", title: "珊瑚装饰", text: "完成海域 1 全部关卡后领取", xp: 0, test: (d, done) => done(1) && done(2) && done(3), progress: (d, done) => `${[1,2,3].filter(done).length} / 3` },
    { id: "skin-cyan", title: "青色装饰", text: "完成海域 2 全部关卡后领取", xp: 0, test: (d, done) => done(4) && done(5) && done(6), progress: (d, done) => `${[4,5,6].filter(done).length} / 3` },
  ]);
  function rewardButton(levelId, reward, claimed) {
    return `
      <div class="achievement-item">
        <img src="${reward.image}" alt="">
        <div><strong>${reward.name}</strong><span>第 ${levelId} 关 · ${reward.xp} XP</span></div>
        <button type="button" data-claim-reward="${levelId}" ${claimed ? "disabled" : ""}>${claimed ? "已领取" : "领取"}</button>
      </div>`;
  }
  function milestoneButton(item, claimed) {
    return `
      <div class="achievement-item achievement-item--text">
        <div><strong>${item.title}</strong><span>${item.text} · ${item.xp} XP</span></div>
        <button type="button" data-claim-achievement="${item.id}" data-xp="${item.xp}" ${claimed ? "disabled" : ""}>${claimed ? "已领取" : "领取"}</button>
      </div>`;
  }
  function lockedItem(item, progress) {
    return `<div class="achievement-item achievement-item--text is-locked"><div><strong>${item.title}</strong><span>${item.text}</span></div><small>${progress}</small></div>`;
  }

  function render() {
    const data = window.SaveStore.getActive().data;
    const done = id => Boolean(data.plays[id] && data.plays[id].completions > 0);
    const claims = [];
    const locked = [];
    const completed = [];
    Object.keys(REWARDS).map(Number).forEach(function (id) {
      const reward = REWARDS[id];
      if (done(id) && !data.claimedRewards[id]) claims.push(rewardButton(id, reward, false));
    });
    MILESTONES.forEach(function (item) {
      const unlocked = item.test(data, done);
      if (!unlocked) locked.push(lockedItem(item, item.progress(data, done)));
      else if (!data.claimedAchievements.includes(item.id)) claims.push(milestoneButton(item, false));
    });
    Object.keys(REWARDS).map(Number).forEach(function (id) {
      if (data.claimedRewards[id]) completed.push(`<div class="achievement-done-line">✓ ${REWARDS[id].name}<small>已领取</small></div>`);
    });
    data.claimedAchievements.forEach(function (id) {
      const item = MILESTONES.find(milestone => milestone.id === id);
      if (item) completed.push(`<div class="achievement-done-line">✓ ${item.title}<small>已领取</small></div>`);
    });
    return `
      <div class="achievement-summary">Lv.${window.SaveStore.levelFromXp(data.xp).level}<span>${data.xp} XP</span></div>
      <img class="achievement-compass" src="assets/rewards/compass.png" alt="">
      <span class="panel-box panel-achv-claim" aria-hidden="true"></span>
      <span class="panel-box panel-achv-lock" aria-hidden="true"></span>
      <span class="panel-box panel-achv-done" aria-hidden="true"></span>
      <span class="panel-label panel-label--claim">待领取</span>
      <span class="panel-label panel-label--lock">待解锁</span>
      <span class="panel-label panel-label--done">已完成</span>
      <div class="achievement-scroll achievement-scroll--claim">${claims.join("") || '<p class="achievement-empty">完成任意关卡即可领取首通奖励</p>'}</div>
      <div class="achievement-scroll achievement-scroll--lock">${locked.join("") || '<p class="achievement-empty">新的成就会随着训练出现</p>'}</div>
      <div class="achievement-scroll achievement-scroll--done">${completed.join("") || '<p class="achievement-empty">领取的奖励会保存在这里</p>'}</div>
    `;
  }

  function mount() {
    document.querySelectorAll("[data-claim-reward]").forEach(function (button) {
      button.addEventListener("click", function () {
        const id = Number(this.dataset.claimReward);
        if (window.SaveStore.claimReward(id, REWARDS[id].xp)) refresh();
      });
    });
    document.querySelectorAll("[data-claim-achievement]").forEach(function (button) {
      button.addEventListener("click", function () {
        const id = this.dataset.claimAchievement;
        if (window.SaveStore.claimAchievement(id, Number(this.dataset.xp))) refresh();
      });
    });
  }

  function refresh() {
    const currentDone = document.querySelector(".achievement-scroll--done");
    const previousDoneCount = currentDone ? currentDone.querySelectorAll(".achievement-done-line").length : 0;
    const template = document.createElement("template");
    template.innerHTML = render();
    const summary = document.querySelector(".achievement-summary");
    const nextSummary = template.content.querySelector(".achievement-summary");
    if (summary && nextSummary) summary.outerHTML = nextSummary.outerHTML;
    ["claim", "lock", "done"].forEach(function (name) {
      const current = document.querySelector(".achievement-scroll--" + name);
      const next = template.content.querySelector(".achievement-scroll--" + name);
      if (current && next) current.innerHTML = next.innerHTML;
    });
    const done = document.querySelector(".achievement-scroll--done");
    if (done && done.querySelectorAll(".achievement-done-line").length > previousDoneCount && done.lastElementChild) {
      done.lastElementChild.classList.add("is-claimed-now");
    }
    mount();
  }

  window.Screens["c2-2"] = {
    render() {
      window.requestAnimationFrame(mount);
      return Scene.page({
        id: "c2-2",
        title: "成就",
        label: "C2-2 成就",
        back: "c2",
        content: render(),
      });
    },
  };
})();
