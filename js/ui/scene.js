/* ------------------------------------------------------------
   Scene · C2 家族共用外壳
   ------------------------------------------------------------
   为什么要抽出这一层：
   C2-0 主界面 / C2-1 设置 / C2-2 成就 / C2-3 外观 / C2-4 图鉴
   五屏共用同一条底图动画、同一个「海域 | lv.01」页头、同一个返回键。
   复制五份的话，以后换底图或换页头位置要改五处，必然漏。

   [2026-11-16] 「等级详情」这个页面已从设计稿里去掉，对应 screen 一并删除。

   这里只放"结构"不放样式：所有尺寸都在 css/tokens.css 里，
   类名在 css/ui.css 里。
   ------------------------------------------------------------ */
(function () {
  "use strict";

  /* 底图视频常驻层不再只有一条：C2 家族一条、家长端一条。
     每族的图层 id 与 .stage[data-bg] 的取值同名。 */
  var BG_LAYERS = {
    c2: "scene-bg-layer",
    p: "p-bg-layer",
  };

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* 播放倍速。数字不写在这里——CSS 变量 --bg-playback-rate 从 tokens 的
     --p1-bg-rate 转接过来，这里只负责搬到 <video> 上。名字统一成一个，
     以后哪条底图要单独变速，在 ui.css 里给那个元素加同一个变量即可。 */
  function rateOf(video) {
    var raw = getComputedStyle(video).getPropertyValue("--bg-playback-rate");
    var n = parseFloat(raw);
    return isFinite(n) && n > 0 ? n : 1;
  }

  function applyRate(video) {
    var r = rateOf(video);
    if (Math.abs(video.playbackRate - r) > 0.001) video.playbackRate = r;
  }

  /* 为什么每次切族都设一遍，还要挂两个监听：
     Safari 在 metadata 就绪、以及重新 play() 之后会把 playbackRate 复位成 1。
     设一次不保险；重复设是幂等的，代价可以忽略。
     （监听 ratechange 反设会有回环风险，所以只在这两个时机补。） */
  function bindRate(video) {
    if (video.__rateBound) return;
    video.__rateBound = true;
    video.addEventListener("loadedmetadata", function () {
      applyRate(video);
    });
    video.addEventListener("play", function () {
      applyRate(video);
    });
  }

  /* 切底图族。family 为 null 表示当前屏不需要共用底图（C1 / C3 / C4 / C5）。
     真正在播的永远只有当前那一族，另一条一律 pause()——
     两条片子同时解码没有必要，而且会在切屏时抢帧。 */
  function bg(family) {
    var stage = document.querySelector(".stage");
    if (!stage) return;
    if (family) stage.setAttribute("data-bg", family);
    else stage.removeAttribute("data-bg");

    Object.keys(BG_LAYERS).forEach(function (key) {
      var layer = document.getElementById(BG_LAYERS[key]);
      if (!layer) return;
      var video = layer.querySelector("video");
      if (!video) return;
      bindRate(video);
      if (family === key && !reduced()) {
        applyRate(video);
        if (video.paused) {
          var started = video.play();
          if (started && started.catch) started.catch(function () {});
        }
      } else if (!video.paused) {
        video.pause();
      }
    });
  }

  /* 当前选中的海域序号与名字。和 C2-0 用的是同一份状态。 */
  function currentSea() {
    var index = window.App.getSelectedSea();
    var seats = window.App.SEAS || [];
    var name = (seats[index] && seats[index].name) || "";
    return {
      index: index,
      number: String(index + 1).padStart(2, "0"),
      name: name,
    };
  }

  /* 子页面页头：海域 │ lv.01 / 横杠 / 「01」+ 海域名（折两行）/ 页名
     结构对应 Figma 的 C2-1 ~ C2-4 那四张，和 C2-0 的标题组同源。

     data-hero 把当前数字挂到页头上：数字「1」比「0/2/3」窄，盒子宽度会变，
     海域名和页名要按差值整体右移（见 css/ui.css 那段）。 */
  function pageHead(title) {
    var sea = currentSea();
    return `
      <header class="page-head" data-hero="${sea.number}">
        <p class="page-head__meta">海域</p>
        <span class="page-head__rule" aria-hidden="true"></span>
        <p class="page-head__level">lv.01</p>
        <span class="page-head__rule-h" aria-hidden="true"></span>
        <p class="page-head__hero">${sea.number}</p>
        <p class="page-head__name">${window.App.escapeHtml(sea.name)}</p>
        <p class="page-head__title">${window.App.escapeHtml(title)}</p>
      </header>
    `;
  }

  /* 返回键。文案同时作为 aria-label，给读屏用。 */
  function back(nav, label) {
    return `
      <button
        class="figma-back app-back"
        type="button"
        data-nav="${window.App.escapeHtml(nav)}"
        aria-label="返回${window.App.escapeHtml(label)}"
      >
        ${window.Icons.back}
      </button>
    `;
  }

  /* 一整屏外壳：底图 + 页头 + 内容 + 返回键。
     opts: { id, title, label, back, content } */
  function page(opts) {
    return `
      <article class="scr scr-c2page scr-${opts.id}" aria-label="${window.App.escapeHtml(opts.label || opts.title)}">
        <h1 class="visually-hidden">${window.App.escapeHtml(opts.title)}</h1>
        ${pageHead(opts.title)}
        ${opts.content || ""}
        ${back(opts.back || "c2", "主界面")}
      </article>
    `;
  }

  window.Scene = {
    bg: bg,
    pageHead: pageHead,
    back: back,
    page: page,
    currentSea: currentSea,
  };
})();
