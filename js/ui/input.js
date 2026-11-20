(function () {
  "use strict";

  /* 开发期三路输入模拟。输出字段与未来硬件层保持一致：
     active / continuousSec / strength。所有页面共享这一层，不把
     键盘判断散落到各个 screen。 */
  const ACTIONS = [
    {
      index: 0,
      id: "mouth",
      label: "抿嘴",
      satisfies: ["mouth"],
      codes: ["Digit1", "Numpad1"],
      keys: ["1"],
    },
    {
      index: 1,
      id: "resist",
      label: "抿嘴抗阻",
      satisfies: ["mouth", "resist"],
      codes: ["Digit2", "Numpad2"],
      keys: ["2"],
    },
    {
      index: 2,
      id: "blow",
      label: "吹气",
      satisfies: ["blow"],
      codes: ["Digit3", "Numpad3"],
      keys: ["3"],
    },
  ];
  const HOLD_CONFIRM_SEC = 0.6;
  const FRAME_MS = 50;
  const keyToAction = new Map();
  const pressedCodes = new Set();
  const confirmed = new Set();
  let activeId = null;
  let startedAt = 0;
  let tickTimer = 0;

  ACTIONS.forEach(function (action) {
    action.codes.forEach(function (code) {
      keyToAction.set(code, action);
    });
    action.keys.forEach(function (key) {
      keyToAction.set(key, action);
    });
  });

  function actionOf(event) {
    return keyToAction.get(event.code) || keyToAction.get(event.key);
  }

  function isActionKey(event) {
    return Boolean(actionOf(event));
  }

  function satisfies(actionId, requirementId) {
    const action = ACTIONS[activeIdToIndex(actionId)];
    return Boolean(action && action.satisfies.includes(requirementId));
  }

  function nowSec() {
    return window.performance.now() / 1000;
  }

  function stateOf(action) {
    const active = activeId === action.id;
    return {
      index: action.index,
      id: action.id,
      label: action.label,
      satisfies: action.satisfies.slice(),
      active: active,
      continuousSec: active
        ? Math.max(0, Math.round((nowSec() - startedAt) * 10) / 10)
        : 0,
      strength: active ? 1 : 0,
    };
  }

  function snapshot() {
    return {
      active: activeId ? stateOf(ACTIONS[activeIdToIndex(activeId)]) : null,
      channels: ACTIONS.map(stateOf),
    };
  }

  function activeIdToIndex(id) {
    return ACTIONS.findIndex(function (action) {
      return action.id === id;
    });
  }

  function emit(type, action) {
    document.dispatchEvent(
      new CustomEvent(type, {
        detail: {
          action: stateOf(action),
          snapshot: snapshot(),
        },
      }),
    );
  }

  function paintRoot(action) {
    if (action) {
      document.documentElement.dataset.inputAction = action.id;
    } else {
      delete document.documentElement.dataset.inputAction;
    }
  }

  function stopTicker() {
    if (!tickTimer) return;
    window.clearInterval(tickTimer);
    tickTimer = 0;
  }

  function tick() {
    if (!activeId) {
      stopTicker();
      return;
    }
    const action = ACTIONS[activeIdToIndex(activeId)];
    const state = stateOf(action);
    emit("actioninputtick", action);
    if (!confirmed.has(action.id) && state.continuousSec >= HOLD_CONFIRM_SEC) {
      confirmed.add(action.id);
      emit("actioninputhold", action);
    }
  }

  function begin(action) {
    if (activeId === action.id) return;
    if (activeId) end(activeId, "switch");
    activeId = action.id;
    startedAt = nowSec();
    confirmed.delete(action.id);
    paintRoot(action);
    emit("actioninputstart", action);
    stopTicker();
    tickTimer = window.setInterval(tick, FRAME_MS);
  }

  function end(actionId, reason) {
    if (activeId !== actionId) return;
    const action = ACTIONS[activeIdToIndex(actionId)];
    const finalState = stateOf(action);
    activeId = null;
    startedAt = 0;
    confirmed.delete(action.id);
    stopTicker();
    paintRoot(null);
    document.dispatchEvent(
      new CustomEvent("actioninputend", {
        detail: {
          action: Object.assign({}, finalState, {
            active: false,
            strength: 0,
          }),
          reason: reason || "release",
          snapshot: snapshot(),
        },
      }),
    );
  }

  function onKeydown(event) {
    const action = actionOf(event);
    if (!action) return;
    event.preventDefault();
    if (event.repeat) return;
    pressedCodes.add(event.code || event.key);
    begin(action);
  }

  function onKeyup(event) {
    const action = actionOf(event);
    if (!action) return;
    event.preventDefault();
    pressedCodes.delete(event.code || event.key);
    const stillPressed = action.codes.some(function (code) {
      return pressedCodes.has(code);
    }) || action.keys.some(function (key) {
      return pressedCodes.has(key);
    });
    if (!stillPressed && activeId === action.id) end(action.id, "release");
  }

  function releaseAll() {
    pressedCodes.clear();
    if (activeId) end(activeId, "blur");
  }

  document.addEventListener("keydown", onKeydown, true);
  document.addEventListener("keyup", onKeyup, true);
  window.addEventListener("blur", releaseAll);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) releaseAll();
  });

  window.ActionInput = {
    ACTIONS: ACTIONS.map(function (action) {
      return {
        index: action.index,
        id: action.id,
        label: action.label,
        satisfies: action.satisfies.slice(),
        codes: action.codes.slice(),
      };
    }),
    HOLD_CONFIRM_SEC: HOLD_CONFIRM_SEC,
    isActionKey: isActionKey,
    satisfies: satisfies,
    snapshot: snapshot,
    releaseAll: releaseAll,
  };
})();
