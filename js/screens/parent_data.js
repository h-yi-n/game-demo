/* 家长端数据读取层：所有记录都来自当前存档，不使用演示数据。
   保留 summarizeWeek / recent 接口，P1/P2 的展示结构无需改动。 */
(function () {
  "use strict";
  const ACTION_DEFS = [
    { key: "mouth", name: "抿嘴" },
    { key: "resist", name: "抿嘴抗阻" },
    { key: "blow", name: "吹气" },
  ];
  function sessions() {
    return window.SaveStore.getActive().data.sessions.slice();
  }
  function mondayOf(dateText) {
    const date = new Date(dateText + "T00:00:00");
    const day = (date.getDay() + 6) % 7;
    date.setDate(date.getDate() - day);
    return date.toISOString().slice(0, 10);
  }
  function currentDate() { return new Date().toISOString().slice(0, 10); }
  function recentWeeks() {
    const current = mondayOf(currentDate());
    const start = new Date(current + "T00:00:00");
    return [3, 2, 1, 0].map(offset => {
      const date = new Date(start);
      date.setDate(date.getDate() - offset * 7);
      return date.toISOString().slice(0, 10);
    });
  }
  function summarizeWeek(weekStart) {
    const weekSessions = sessions().filter(session => mondayOf(session.date) === weekStart);
    const actions = {};
    ACTION_DEFS.forEach(action => { actions[action.key] = { count: 0, seconds: 0 }; });
    const days = Array.from({ length: 7 }, (_, index) => ({ day: index, seconds: 0, sessionCount: 0 }));
    weekSessions.forEach(session => {
      const day = (new Date(session.date + "T00:00:00").getDay() + 6) % 7;
      days[day].seconds += session.durationSec;
      days[day].sessionCount += 1;
      ACTION_DEFS.forEach(action => {
        const value = session.actions[action.key] || { count: 0, seconds: 0 };
        actions[action.key].count += value.count;
        actions[action.key].seconds += value.seconds;
      });
    });
    return {
      sessions: weekSessions,
      sessionCount: weekSessions.length,
      totalSeconds: weekSessions.reduce((total, session) => total + session.durationSec, 0),
      actions: actions,
      days: days,
    };
  }
  function recent(count) {
    return sessions().slice(-count).reverse().map(session => {
      if (session.weekday) return session;
      const date = new Date(session.date + "T00:00:00");
      return Object.assign({}, session, { weekday: "周" + "日一二三四五六"[date.getDay()] });
    });
  }
  function levelNumber(session) {
    return session && Number.isInteger(session.levelIndex) ? session.levelIndex + 1 : session.level;
  }
  function formatClock(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes + ":" + String(seconds).padStart(2, "0");
  }
  function formatShortDate(isoDate) { return isoDate.slice(5).replace("-", "."); }
  window.ParentDemoData = {
    isDemo: false,
    get currentWeek() { return mondayOf(currentDate()); },
    get weekStarts() { return recentWeeks(); },
    dayNames: ["一", "二", "三", "四", "五", "六", "日"],
    actionDefs: ACTION_DEFS,
    get sessions() { return sessions(); },
    summarizeWeek: summarizeWeek,
    recent: recent,
    levelNumber: levelNumber,
    formatClock: formatClock,
    formatShortDate: formatShortDate,
  };
})();
