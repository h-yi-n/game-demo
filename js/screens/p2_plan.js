/* P2 家长端 · 历史记录
   页面分工：上方只看跨周变化，下方只看单次训练明细，不重复 P1 的每日图和本周小结。
   数据全部来自 parent_data.js 的演示数据，本页不读写存储。 */
window.Screens.p2 = {
  render() {
    const data = window.ParentDemoData;
    const esc = window.App.escapeHtml;
    const weeklyMax = 60 * 60;

    const trendColumns = data.weekStarts
      .map(function (weekStart, index) {
        const week = data.summarizeWeek(weekStart);
        const minutes = Math.round(week.totalSeconds / 60);
        const height = Math.min(100, (week.totalSeconds / weeklyMax) * 100);
        const currentClass = index === data.weekStarts.length - 1 ? " is-current" : "";
        return `
          <div class="p-trend__week${currentClass}" aria-label="${data.formatShortDate(weekStart)} 起，${week.sessionCount} 次，共 ${minutes} 分钟">
            <span class="p-trend__value">${minutes}</span>
            <span class="p-trend__track" aria-hidden="true">
              <span class="p-trend__bar" style="--bar-height: ${height}%"></span>
            </span>
            <span class="p-trend__date">${data.formatShortDate(weekStart)} 起</span>
            <span class="p-trend__count">${week.sessionCount} 次</span>
          </div>
        `;
      })
      .join("");

    const historyRows = data.recent(4)
      .map(function (session) {
        return `
          <tr>
            <td>${data.formatShortDate(session.date)}<span>${session.weekday}</span></td>
            <td class="p-history__level">${esc(session.sea)} · 第 ${data.levelNumber(session)} 关</td>
            <td>${data.formatClock(session.durationSec)}</td>
            <td>${esc(session.status)}</td>
            ${data.actionDefs
              .map(function (action) {
                const value = session.actions[action.key];
                return `<td>${value.count}<i>/</i>${value.seconds}</td>`;
              })
              .join("")}
          </tr>
        `;
      })
      .join("") || '<tr><td colspan="7">暂无训练记录</td></tr>';

    return `
      <article class="scr scr-p1 scr-p2" aria-label="P2 家长端 · 历史记录">
        <h1 class="visually-hidden">P2 家长端 · 历史记录</h1>

        <p class="p-title">历史记录</p>

        <nav class="p-tabs" aria-label="家长端页面">
          <button class="p-tab" type="button" data-nav="p1">本周概览</button>
          <span class="p-tab is-current" aria-current="page">历史记录</span>
        </nav>

        <section class="panel-p2-a p-panel p-trend" aria-labelledby="p-trend-title">
          <div class="p-panel__head">
            <h2 id="p-trend-title">近 4 周</h2>
            <span class="p-panel__unit">总时长 / 分钟&nbsp;&nbsp;·&nbsp;&nbsp;演示数据</span>
          </div>
          <div class="p-trend__chart" role="img" aria-label="近四周训练总时长与次数">
            ${trendColumns}
          </div>
        </section>

        <section class="panel-p2-b p-panel p-history" aria-label="最近四次训练明细">
          <table>
            <caption class="visually-hidden">最近四次训练明细，动作列依次表示完成次数和累计动作秒数</caption>
            <colgroup>
              <col class="p-history__col-date">
              <col class="p-history__col-level">
              <col class="p-history__col-time">
              <col class="p-history__col-status">
              <col span="3">
            </colgroup>
            <thead>
              <tr>
                <th scope="col">日期</th>
                <th scope="col">关卡</th>
                <th scope="col">用时</th>
                <th scope="col">状态</th>
                <th scope="col">抿嘴 <span>次 / 秒</span></th>
                <th scope="col">抗阻 <span>次 / 秒</span></th>
                <th scope="col">吹气 <span>次 / 秒</span></th>
              </tr>
            </thead>
            <tbody>${historyRows}</tbody>
          </table>
        </section>

        <span class="panel-label panel-label--p2-l1">训练趋势</span>
        <span class="panel-label panel-label--p2-l2">单次记录</span>

        <button class="figma-back app-back" type="button" data-nav="c1" aria-label="返回 C1 开屏">
          ${Icons.back}
        </button>
      </article>
    `;
  },
};
