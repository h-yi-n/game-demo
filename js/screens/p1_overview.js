/* P1 家长端 · 本周概览
   页面分工：本周执行情况 + 最近一次训练；跨周趋势与单次历史明细只在 P2。
   数据全部来自 parent_data.js 的演示数据，本页不读写存储。 */
window.Screens.p1 = {
  render() {
    const data = window.ParentDemoData;
    const esc = window.App.escapeHtml;
    const week = data.summarizeWeek(data.currentWeek);
    const latest = data.recent(1)[0] || { date: new Date().toISOString().slice(0, 10), weekday: "暂无记录", sea: "尚未开始训练", level: 0, durationSec: 0, status: "尚未完成" };
    const totalMinutes = Math.floor(week.totalSeconds / 60);
    const totalSeconds = week.totalSeconds % 60;
    const dailyMax = 20 * 60;

    const dayBars = week.days
      .map(function (day) {
        const minutes = Math.round(day.seconds / 60);
        const height = Math.min(100, (day.seconds / dailyMax) * 100);
        return `
          <div class="p-day" aria-label="周${data.dayNames[day.day]}，${minutes} 分钟">
            <span class="p-day__value">${minutes}</span>
            <span class="p-day__track" aria-hidden="true">
              <span class="p-day__bar" style="--bar-height: ${height}%"></span>
            </span>
            <span class="p-day__name">${data.dayNames[day.day]}</span>
          </div>
        `;
      })
      .join("");

    const actionRows = data.actionDefs
      .map(function (action) {
        const value = week.actions[action.key];
        const width = Math.min(100, (value.seconds / 80) * 100);
        return `
          <div class="p-action">
            <span class="p-action__name">${action.name}</span>
            <span class="p-action__metric">${value.count}<small>次</small><i>·</i>${value.seconds}<small>秒</small></span>
            <span class="p-action__track" aria-hidden="true">
              <span class="p-action__bar" style="--bar-width: ${width}%"></span>
            </span>
          </div>
        `;
      })
      .join("");

    return `
      <article class="scr scr-p1" aria-label="P1 家长端 · 本周概览">
        <h1 class="visually-hidden">P1 家长端 · 本周概览</h1>

        <p class="p-title">本周概览</p>

        <nav class="p-tabs" aria-label="家长端页面">
          <span class="p-tab is-current" aria-current="page">本周概览</span>
          <button class="p-tab" type="button" data-nav="p2">历史记录</button>
        </nav>

        <section class="panel-p1-a p-panel p-week" aria-labelledby="p-week-title">
          <div class="p-panel__head">
            <h2 id="p-week-title">本周训练</h2>
            <span class="p-demo">演示数据</span>
          </div>
          <p class="p-week__range">11.16 — 11.22</p>
          <div class="p-week__stats">
            <div class="p-stat">
              <p class="p-stat__value">${week.sessionCount}<span>次</span></p>
              <p class="p-stat__label">完成训练</p>
            </div>
            <div class="p-stat">
              <p class="p-stat__value">${totalMinutes}<span>分</span>${String(totalSeconds).padStart(2, "0")}<span>秒</span></p>
              <p class="p-stat__label">累计训练用时</p>
            </div>
          </div>
          <div class="p-chart-head">
            <h3>每日训练时长</h3>
            <span>分钟</span>
          </div>
          <div class="p-week-chart" role="img" aria-label="本周每天训练时长柱状图">
            ${dayBars}
          </div>
        </section>

        <section class="panel-p1-b p-panel p-actions" aria-labelledby="p-actions-title">
          <div class="p-panel__head">
            <h2 id="p-actions-title">本周动作累计</h2>
            <span class="p-panel__unit">时长刻度 0–80 秒</span>
          </div>
          <div class="p-action-list">
            ${actionRows}
          </div>
        </section>

        <section class="panel-p1-c p-panel p-recent" aria-labelledby="p-recent-title">
          <h2 id="p-recent-title">${esc(latest.date.slice(5).replace("-", "月"))}日 · ${latest.weekday}</h2>
          <p class="p-recent__level">${esc(latest.sea)}<span>第 ${data.levelNumber(latest)} 关</span></p>
          <div class="p-recent__time">
            <span>本次用时</span>
            <strong>${data.formatClock(latest.durationSec)}</strong>
          </div>
          <p class="p-recent__status"><i aria-hidden="true"></i>${esc(latest.status)}</p>
        </section>

        <section class="panel-p1-d p-panel p-summary" aria-labelledby="p-summary-title">
          <h2 id="p-summary-title">本周安排</h2>
          <div class="p-summary__row">
            <span>训练频次</span>
            <strong>2–3 次 / 周</strong>
          </div>
          <div class="p-summary__row">
            <span>单次用时</span>
            <strong>15–20 分钟</strong>
          </div>
          <p class="p-summary__result"><i aria-hidden="true">✓</i>均在安排内</p>
        </section>

        <span class="panel-label panel-label--p1-l1">三个动作</span>
        <span class="panel-label panel-label--p1-l2">最近一次</span>
        <span class="panel-label panel-label--p1-l3">小结</span>

        <button class="figma-back app-back" type="button" data-nav="c1" aria-label="返回 C1 开屏">
          ${Icons.back}
        </button>
      </article>
    `;
  },
};
