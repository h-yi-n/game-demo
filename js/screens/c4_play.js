(function () {
  "use strict";

  const ACTION = {
    M: { id: "mouth", code: "1" },
    R: { id: "resist", code: "2" },
    B: { id: "blow", code: "3" },
  };
  const SCENE_SPEED = 0.02;

  const LEVELS = [
    {
      sea: 0,
      level: 0,
      title: "海草迷宫",
      rounds: [
        ["M4", "R5", "M4", "R5"],
        ["B3", "R5", "M4", "R5"],
        ["B3", "R5", "M5", "R10"],
        ["M4", "B3", "R5", "R5"],
      ],
      feedback: [0, 0, 4, 0],
      blank: [0, 0, 0, 0],
    },
    {
      sea: 0,
      level: 1,
      title: "缤纷珊瑚礁",
      rounds: [
        ["M4", "R5", "B3", "R5"],
        ["M4", "R5", "M5", "B4"],
        ["M10", "R10", "M4", "R5"],
        ["B4", "R10", "M10", "R5"],
        ["B4", "M10", "R5", "R5"],
      ],
      feedback: [0, 4, 0, 0, 0],
      blank: [3, 0, 0, 0, 0],
    },
    {
      sea: 0,
      level: 2,
      title: "珊瑚迷宫",
      rounds: [
        ["M4", "R5", "B3", "R5"],
        ["M5", "R5", "M5", "B4"],
        ["M4", "R5", "B4", "R5"],
        ["R10", "M10", "R10", "B8"],
        ["M10", "R10", "B8", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0],
      blank: [4, 0, 0, 0, 0],
    },
    {
      sea: 1,
      level: 0,
      title: "湍急水流",
      rounds: [
        ["M5", "R5", "B3", "R5"],
        ["M5", "R5", "M5", "B4"],
        ["M5", "R6", "B4", "R5"],
        ["R10", "M10", "B8", "R10"],
        ["M5", "B4", "R10", "M10", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0],
      blank: [0, 0, 4, 0, 0],
    },
    {
      sea: 1,
      level: 1,
      title: "神秘漩涡",
      rounds: [
        ["M5", "R5", "M5", "R5"],
        ["B4", "R6", "M5", "R5"],
        ["R10", "M10", "B8", "R6"],
        ["M10", "R10", "M5", "B8"],
        ["B8", "R10", "M10", "R10"],
      ],
      feedback: [0, 4, 0, 4, 0],
      blank: [4, 0, 3, 0, 0],
    },
    {
      sea: 1,
      level: 2,
      title: "潮汐之心",
      rounds: [
        ["M5", "R5", "B4", "R5"],
        ["M5", "R5", "M10", "B8"],
        ["R10", "M10", "B8", "R6"],
        ["M10", "R10", "M5", "B8"],
        ["B8", "R10", "M10", "R10"],
        ["M10", "B8", "R5", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0, 0],
      blank: [0, 0, 5, 0, 0, 0],
    },
    {
      sea: 2,
      level: 0,
      title: "水晶矿洞",
      rounds: [
        ["M5", "R5", "B4", "R5"],
        ["M5", "R5", "M10", "B8"],
        ["R10", "M10", "B8", "R6"],
        ["M10", "R10", "M5", "B8"],
        ["B8", "R10", "M10", "R10"],
        ["M10", "B8", "R5", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0, 0],
      blank: [4, 0, 4, 0, 0, 0],
    },
    {
      sea: 2,
      level: 1,
      title: "神秘商人",
      rounds: [
        ["M5", "R5", "B4", "R5"],
        ["M5", "R5", "M10", "B8"],
        ["R10", "M10", "B8", "R6"],
        ["M10", "R10", "M6", "B8"],
        ["B8", "R10", "M10", "R10"],
        ["M10", "R10", "B8", "R10", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0, 0],
      blank: [5, 0, 3, 0, 0, 0],
    },
    {
      sea: 2,
      level: 2,
      title: "水晶秘境",
      rounds: [
        ["M5", "R5", "B4", "R5"],
        ["M5", "R5", "M10", "B8"],
        ["R10", "M10", "B8", "R6"],
        ["M10", "R10", "M6", "B8"],
        ["B8", "R10", "M10", "R10"],
        ["M10", "R10", "B8", "R10", "R10", "R5"],
      ],
      feedback: [0, 4, 0, 4, 0, 0],
      blank: [5, 0, 5, 0, 0, 0],
    },
  ];

  window.GameLevelConfigs = LEVELS;

  let activeRunner = null;

  function compileSteps(config) {
    const rows = [];
    config.rounds.forEach(function (round, roundIndex) {
      round.forEach(function (token, roundActionIndex) {
        const symbol = token.slice(0, 1);
        const definition = ACTION[symbol];
        rows.push({
          action: definition.id,
          code: definition.code,
          hold: Number(token.slice(1)),
          round: roundIndex,
          roundLast: roundActionIndex === round.length - 1,
          feedback:
            roundActionIndex === round.length - 1
              ? config.feedback[roundIndex] || 0
              : 0,
          blank:
            roundActionIndex === round.length - 1
              ? config.blank[roundIndex] || 0
              : 0,
        });
      });
    });
    return rows;
  }

  function sceneMarkup() {
    const segment = `
      <div class="level-track__segment">
        <img src="assets/first_level_scene_placeholder.svg" alt="" draggable="false">
      </div>
    `;
    return `
      <div class="level-scene" aria-hidden="true">
        <div class="level-track">${segment.repeat(6)}</div>
        <div class="level-scene__veil"></div>
      </div>
      <img
        class="level-hero"
        src="assets/主角-小海豚 定稿.png"
        alt="小海豚"
        draggable="false"
      >
    `;
  }

  function teardownRunner() {
    if (!activeRunner) return;
    activeRunner.teardown();
    activeRunner = null;
  }

  function mountEmbeddedRunner(root, visualLevelId) {
    teardownRunner();
    const finishButton = root.querySelector(".level-finish-trigger");
    const stage = root.querySelector(".level-stage");
    stage.classList.add("level-01-frame");

    const level = window.Level01Factory.mount(root.querySelector(".level-stage"), visualLevelId, {
      embedded: true,
      onComplete: function () {
        if (finishButton) finishButton.click();
      },
      onExit: function () {
        const context = window.App.getScreenContext();
        const seaIndex = Number.isInteger(context.seaIndex) ? context.seaIndex : Math.floor((visualLevelId - 1) / 3);
        window.App.setSelectedSea(seaIndex);
        window.App.navigate(window.SeaUI.seaScreenId(seaIndex), { seaIndex: seaIndex });
      },
    });
    window.LevelRunner = {
      root: root,
      probe: level.probe,
      teardown: level.teardown,
    };
    activeRunner = { teardown: level.teardown };
  }

  function mountRunner(root, config, steps) {
    teardownRunner();

    const track = root.querySelector(".level-track");
    const taskCode = root.querySelector(".level-task__code");
    const stepLabel = root.querySelector(".level-hud__step");
    const progressFill = root.querySelector(".level-progress__fill");
    const feedback = root.querySelector(".level-feedback");
    const finishButton = root.querySelector(".level-finish-trigger");
    const timers = [];
    let index = 0;
    let completed = 0;
    let busy = false;
    let awaitingPress = true;
    let scroll = 0;
    let stepBaseScroll = 0;
    let stepMaxProgress = 0;
    let feedbackFrame = 0;

    function later(fn, ms) {
      const timer = window.setTimeout(fn, ms);
      timers.push(timer);
      return timer;
    }

    function setScroll(value) {
      scroll = value;
      track.style.setProperty("--level-scroll", String(scroll));
    }

    function setHold(ratio) {
      root.style.setProperty(
        "--level-hold-angle",
        `${Math.max(0, Math.min(1, ratio)) * 360}deg`,
      );
      progressFill.style.setProperty(
        "--level-progress",
        String(Math.min(1, (completed + stepMaxProgress) / steps.length)),
      );
    }

    function paintStep() {
      const step = steps[index];
      busy = false;
      awaitingPress = true;
      stepBaseScroll = scroll;
      stepMaxProgress = 0;
      root.dataset.levelState = "waiting";
      root.dataset.levelAction = step.action;
      root.dataset.levelStep = String(index + 1);
      root.dataset.levelCompleted = String(completed);
      taskCode.textContent = step.code;
      stepLabel.textContent =
        String(index + 1).padStart(2, "0") +
        " / " +
        String(steps.length).padStart(2, "0");
      setHold(0);
    }

    function finishLevel() {
      root.dataset.levelState = "complete";
      root.dataset.levelCompleted = String(steps.length);
      if (finishButton) finishButton.click();
    }

    function moveDuringFeedback(durationMs) {
      track.style.transition = "none";
      const start = window.performance.now();
      const startScroll = scroll;
      function frame(now) {
        if (!root.isConnected) return;
        const ratio = Math.min(1, (now - start) / durationMs);
        setScroll(startScroll + ratio * SCENE_SPEED * (durationMs / 1000));
        if (ratio < 1) feedbackFrame = window.requestAnimationFrame(frame);
      }
      feedbackFrame = window.requestAnimationFrame(frame);
    }

    function continueAfterEffects(step, callback) {
      if (step.feedback) {
        root.dataset.levelState = "feedback";
        feedback.hidden = false;
        moveDuringFeedback(4000);
        later(function () {
          feedback.hidden = true;
          if (step.blank) {
            root.dataset.levelState = "blank";
            later(callback, step.blank * 1000);
          } else {
            callback();
          }
        }, 4000);
        return;
      }
      if (step.blank) {
        root.dataset.levelState = "blank";
        later(callback, step.blank * 1000);
        return;
      }
      callback();
    }

    function showNextStep() {
      index += 1;
      if (index >= steps.length) {
        finishLevel();
        return;
      }
      paintStep();
    }

    function resolveStep() {
      if (busy) return;
      const step = steps[index];
      busy = true;
      completed += 1;
      root.dataset.levelState = "resolved";
      root.dataset.levelCompleted = String(completed);
      stepMaxProgress = 1;
      setScroll(stepBaseScroll + step.hold * SCENE_SPEED);
      setHold(1);
      continueAfterEffects(step, showNextStep);
    }

    function onTick(event) {
      if (!root.isConnected) {
        teardown();
        return;
      }
      if (busy) return;
      const step = steps[index];
      const action = event.detail.action;
      if (action.active && action.id === step.action && !awaitingPress) {
        root.dataset.levelState = "active";
        const ratio = Math.min(1, action.continuousSec / step.hold);
        if (ratio > stepMaxProgress) {
          stepMaxProgress = ratio;
          setScroll(stepBaseScroll + ratio * step.hold * SCENE_SPEED);
        }
        setHold(ratio);
        if (ratio >= 1) resolveStep();
      }
    }

    function onStart(event) {
      if (busy || !root.isConnected) return;
      const step = steps[index];
      if (event.detail.action.id !== step.action) return;
      awaitingPress = false;
      track.style.transition = "none";
    }

    function onEnd(event) {
      if (busy || !root.isConnected) return;
      const step = steps[index];
      if (event.detail.action.id !== step.action) return;
      root.dataset.levelState = "waiting";
      awaitingPress = true;
      setHold(0);
    }

    function teardown() {
      document.removeEventListener("actioninputstart", onStart);
      document.removeEventListener("actioninputtick", onTick);
      document.removeEventListener("actioninputend", onEnd);
      timers.forEach(function (timer) {
        window.clearTimeout(timer);
      });
      if (feedbackFrame) window.cancelAnimationFrame(feedbackFrame);
      if (window.LevelRunner && window.LevelRunner.root === root) {
        window.LevelRunner = null;
      }
    }

    document.addEventListener("actioninputstart", onStart);
    document.addEventListener("actioninputtick", onTick);
    document.addEventListener("actioninputend", onEnd);
    paintStep();

    window.LevelRunner = {
      root: root,
      config: config,
      probe: function () {
        return {
          step: index + 1,
          total: steps.length,
          completed: completed,
          action: root.dataset.levelAction,
          state: root.dataset.levelState,
          scroll: scroll,
          feedbackVisible: !feedback.hidden,
        };
      },
    };
    activeRunner = { teardown: teardown };
  }

  function makeLevelScreen(config) {
    const steps = compileSteps(config);
    const sea = window.App.SEAS[config.sea];
    const screenId = window.SeaUI.playScreenId(config.sea, config.level);
    const screenCode = window.SeaUI.playCode(config.sea, config.level);
    const resultCode = window.SeaUI.resultCode(config.sea, config.level);

    const isFirstLevel = config.sea === 0 && config.level === 0;
    const isVisualLevel = true;
    const visualLevelId = config.sea * 3 + config.level + 1;

    return {
      render() {
        window.requestAnimationFrame(function () {
          const root = document.querySelector(".scr-level");
          if (root && root.dataset.screen === screenCode) {
            if (isVisualLevel) mountEmbeddedRunner(root, visualLevelId);
            else mountRunner(root, config, steps);
          }
        });
        if (isVisualLevel) {
          return `
          <article
            class="scr scr-sea-play scr-level${isFirstLevel ? " scr-level-first" : ""} scr-level--visual"
            data-screen="${screenCode}"
            data-sea="${config.sea + 1}"
            data-level="${config.level + 1}"
            data-level-state="waiting"
            data-level-action="${steps[0].action}"
            aria-label="${screenCode} ${window.App.escapeHtml(sea.name)} · ${window.App.escapeHtml(config.title)}"
          >
            ${window.Level01Markup()}
            <button
              class="level-finish-trigger"
              type="button"
              data-action="complete-run"
              data-result-code="${resultCode}"
              hidden
            ></button>
          </article>
        `;
        }
        return `
          <article
            class="scr scr-sea-play scr-level${config.sea === 0 && config.level === 0 ? " scr-level-first" : ""}"
            data-screen="${screenCode}"
            data-sea="${config.sea + 1}"
            data-level="${config.level + 1}"
            data-level-state="waiting"
            data-level-action="${steps[0].action}"
            aria-label="${screenCode} ${window.App.escapeHtml(sea.name)} · ${window.App.escapeHtml(config.title)}"
          >
            ${sceneMarkup()}
            <header class="level-hud">
              <p class="level-hud__name">${window.App.escapeHtml(sea.name)} · ${window.App.escapeHtml(config.title)}</p>
              <p class="level-hud__step">01 / ${steps.length}</p>
            </header>
            <section class="level-task" aria-label="训练动作占位">
              <span class="level-task__code">${steps[0].code}</span>
              <span class="level-task__caption">ACTION PLACEHOLDER</span>
            </section>
            <div class="level-progress" aria-hidden="true">
              <span class="level-progress__fill"></span>
            </div>
            <div class="level-feedback" hidden aria-live="polite">
              <div>
                <span class="level-feedback__label">反馈占位</span>
                <span class="level-feedback__duration">4.0s</span>
              </div>
            </div>
            <button
              class="level-finish-trigger"
              type="button"
              data-action="complete-run"
              data-result-code="${resultCode}"
              hidden
            ></button>
          </article>
        `;
      },
      steps: steps,
      config: config,
      screenId: screenId,
    };
  }

  LEVELS.forEach(function (config) {
    window.Screens[window.SeaUI.playScreenId(config.sea, config.level)] =
      makeLevelScreen(config);
  });
})();
