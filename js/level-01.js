(function () {
  "use strict";

  function mount(root, LEVEL_ID, options) {
    options = options || {};
  const LEVEL = window.LEVEL_VISUAL_CONFIGS[LEVEL_ID];
  const ASSET = LEVEL.asset;
  const ROUNDS = LEVEL.rounds;
  const FEEDBACK = LEVEL.feedback;
  const BLANK = LEVEL.blank;
  const CRUISE_DISTANCES = LEVEL.cruise;
  const ACTION = {
    M: { id: "mouth", visual: "steady", speed: 30 },
    R: { id: "resist", visual: "focus", speed: 16 },
    B: { id: "blow", visual: "sustain", speed: 36 },
  };

  const embedded = Boolean(options.embedded);
  if (embedded) root.dataset.embedded = "true";
  const ring = root.querySelector("#action-ring-value");
  const journeyFill = root.querySelector("#journey-fill");
  const journeyDot = root.querySelector("#journey-dot");
  const journeyPercent = root.querySelector("#journey-percent");
  const toast = root.querySelector("#round-toast");
  const heroWrap = root.querySelector("#hero-wrap");
  const encountersRoot = root.querySelector("#encounters");
  const actionDemo = root.querySelector("#action-demo");
  const heroVideos = Array.from(root.querySelectorAll(".hero-state"));
  const heroFallback = root.querySelector("#hero-fallback");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const timers = new Set();
  const steps = [];
  const encounterElements = new Map();
  let goalElement = null;

  let index = 0;
  let completed = 0;
  let busy = false;
  let paused = false;
  let hasStarted = false;
  let awaitingPress = true;
  let pendingAction = null;
  const eventLog = [];
  let stepBest = 0;
  let stepStrength = 1;
  let inputOffsetSec = 0;
  let chainIntoStep = false;
  let heroApproach = 0;
  let stepBaseTravel = 0;
  let travel = 0;
  let activeVisual = "ready";
  let lastTrail = 0;
  let feedbackFrame = 0;
  let stateChangedAt = performance.now();
  let shownIndex = -1;
  let vaultAnimation = null;
  let recoveryAnimation = null;
  let recoveryTimer = 0;
  const vaultSteps = [];
  let audioEnabled = false;
  let audioContext = null;
  let music = null;

  let cruiseIndex = 0;

  ROUNDS.forEach(function (round, roundIndex) {
    round.forEach(function (token, actionIndex) {
      steps.push({
        action: ACTION[token[0]].id,
        hold: Number(token.slice(1)),
        cruiseDistance: token[0] === "M" ? CRUISE_DISTANCES[cruiseIndex++] : 0,
        round: roundIndex,
        roundLast: actionIndex === round.length - 1,
        feedback: actionIndex === round.length - 1 ? FEEDBACK[roundIndex] : 0,
        blank: actionIndex === round.length - 1 ? BLANK[roundIndex] : 0,
      });
    });
  });

  function later(callback, delay) {
    const timer = window.setTimeout(function () {
      timers.delete(timer);
      if (paused) {
        later(callback, 100);
      } else {
        callback();
      }
    }, delay);
    timers.add(timer);
  }

  function buildEnvironment() {
    // Decorative plants stay anchored to the screen; only the ocean track scrolls.
    const layout = [
      { name: "seaweed-blue", x: -60, y: 50, w: 175 },
      { name: "coral-lilac", x: 330, y: 88, w: 130, back: true },
      { name: "seaweed-mint", x: 720, y: 42, w: 185 },
      { name: "coral-purple", x: 1200, y: 92, w: 145, back: true },
      { name: "seaweed-aqua", x: 1800, y: 45, w: 175 },
      { name: "seaweed-blue", x: 2400, y: 52, w: 165, back: true },
      { name: "coral-lilac", x: 3000, y: 88, w: 130, back: true },
      { name: "seaweed-mint", x: 3700, y: 42, w: 190 },
      { name: "seaweed-aqua", x: 4400, y: 45, w: 170 },
      { name: "coral-purple", x: 5100, y: 92, w: 145, back: true },
      { name: "seaweed-blue", x: 5900, y: 52, w: 170, back: true },
      { name: "seaweed-mint", x: 6700, y: 42, w: 185 },
    ];

    const back = root.querySelector("#back-flora");
    const front = root.querySelector("#front-flora");
    layout.forEach(function (plant, plantIndex) {
      if (LEVEL.skipSeaweed && plant.name.startsWith("seaweed")) return;
      const item = document.createElement("div");
      item.className = "flora";
      item.dataset.plant = plant.name;
      if (plant.name.startsWith("seaweed")) {
        item.classList.add("flora--seaweed");
        item.style.setProperty("--sway", (4.8 + (plantIndex % 4) * 0.55).toFixed(2) + "s");
        item.style.setProperty("--delay", (-plantIndex * 0.63).toFixed(2) + "s");
      }
      let sceneryX = plant.x;
      while (steps.some(function (step) { return step.encounterX !== undefined && (Math.abs(step.encounterX - sceneryX) < 430 || Math.abs(step.encounterX + 360 - sceneryX) < 330); })) {
        sceneryX += 520;
      }
      item.style.setProperty("--x", String(sceneryX));
      item.style.setProperty("--y", String(plant.y));
      item.style.setProperty("--w", String(plant.w));
      item.innerHTML = `<img src="${ASSET}${plant.name}.png" alt="">`;
      (plant.back ? back : front).appendChild(item);
    });
    const bubbles = root.querySelector("#ambient-bubbles");
    for (let i = 0; i < 19; i += 1) {
      const bubble = document.createElement("i");
      const size = 7 + (i % 5) * 5;
      bubble.style.cssText = `left:${(i * 37) % 97}%;width:calc(${size} * var(--du));height:calc(${size} * var(--du));--duration:${9 + (i % 7) * 1.7}s;--delay:${-(i % 11) * 1.9}s`;
      bubbles.appendChild(bubble);
    }
    const stream = root.querySelector("#blow-stream");
    for (let i = 0; i < 13; i += 1) {
      const bubble = document.createElement("i");
      const size = 8 + (i % 4) * 6;
      bubble.style.cssText = `left:${(i % 4) * 5}%;top:${25 + (i * 17) % 65}%;width:calc(${size} * var(--du));height:calc(${size} * var(--du));animation-delay:${-i * 0.11}s`;
      stream.appendChild(bubble);
    }
  }

  function buildEncounters() {
    let plannedTravel = 0;
    steps.forEach(function (step, stepIndex) {
      step.startTravel = plannedTravel;
      step.resolved = false;
      plannedTravel += actionDistance(step, 1, 1);
      if (step.feedback) {
        plannedTravel += 570;
      } else if (step.action !== "mouth") {
        step.exitDistance = 480;
        step.exitDuration = 900;
        plannedTravel += step.exitDistance;
      }
      if (step.action === "mouth") return;
      step.encounterX = step.startTravel + 1180;
      const encounter = document.createElement("div");
      encounter.className = "encounter encounter--" + step.action;
      encounter.dataset.step = String(stepIndex);
      encounter.style.setProperty("--encounter-x", String(step.encounterX));
      let plants;
      if (LEVEL.obstacles) {
        if (step.action === "blow") {
          plants = '<img src="' + ASSET + LEVEL.obstacles.blow[0] + '" alt="">';
        } else {
          const resistIndex = steps.slice(0, stepIndex + 1).filter(function (item) { return item.action === "resist"; }).length - 1;
          const obstacleName = LEVEL.obstacles.resist[resistIndex % LEVEL.obstacles.resist.length];
          plants = '<img src="' + ASSET + obstacleName + '" alt=""><div class="encounter__tension"><i></i><i></i></div>';
        }
      } else if (step.action === "blow") {
        plants = '<img src="' + ASSET + 'seaweed-mint.png" alt=""><img src="' + ASSET + 'seaweed-blue.png" alt=""><img src="' + ASSET + 'seaweed-aqua.png" alt="">';
      } else {
        plants = '<img src="' + ASSET + 'coral-purple.png" alt=""><img src="' + ASSET + 'coral-lilac.png" alt=""><div class="encounter__tension"><i></i><i></i></div>';
      }
      encounter.innerHTML = '<div class="encounter__scene">' + plants + '</div>';
      encountersRoot.appendChild(encounter);
      encounterElements.set(stepIndex, encounter);
    });
  }

  function buildGoal() {
    return;
    let finalIndex = steps.length - 1;
    while (finalIndex > 0 && steps[finalIndex].action === "mouth") finalIndex -= 1;
    goalElement = document.createElement("div");
    goalElement.className = "level-goal";
    goalElement.dataset.finalStep = String(finalIndex);
    goalElement.style.setProperty("--goal-x", String(steps[finalIndex].encounterX + 360));
    goalElement.innerHTML = LEVEL.goal.map(function (name) {
      return '<img src="' + ASSET + name + '" alt="">';
    }).join("");
    encountersRoot.appendChild(goalElement);
  }

  function updateEncounters() {
    const upcoming = steps.map(function (step, stepIndex) {
      return step.action !== "mouth" && !step.resolved && stepIndex >= index ? stepIndex : -1;
    }).filter(function (stepIndex) { return stepIndex >= 0; });
    const clearing = steps[index] && steps[index].action !== "mouth" && steps[index].resolved && root.dataset.state === "resolved";
    const target = clearing ? index : upcoming[0];
    const next = clearing ? upcoming[0] : upcoming[1];
    if (goalElement) {
      const finalIndex = Number(goalElement.dataset.finalStep);
      const goalX = Number(goalElement.style.getPropertyValue("--goal-x")) - travel;
      goalElement.classList.toggle("is-near", goalX > -260 && goalX < 1850);
      goalElement.classList.toggle("is-found", steps[finalIndex].resolved);
    }
    encounterElements.forEach(function (encounter, stepIndex) {
      const step = steps[stepIndex];
      const screenX = step.encounterX - travel;
      const nextIsVisible = stepIndex === next;
      const near = (step.resolved || stepIndex === target || nextIsVisible) && screenX > -420 && screenX < 1900;
      encounter.classList.toggle("is-near", near);
      encounter.classList.toggle("is-target", stepIndex === target);
      encounter.classList.toggle("is-next", stepIndex === next);
      encounter.classList.toggle("is-resolved", step.resolved);
      encounter.classList.toggle("is-current", stepIndex === index);
    });
  }

  function updateHeroApproach() {
    root.style.setProperty("--hero-shift", (heroApproach * 400).toFixed(2));
    root.style.setProperty("--hero-lift", (heroApproach * 85).toFixed(2));
  }

  function canSatisfy(action, requirement) {
    if (!action) return false;
    if (action.id === requirement) return true;
    if (requirement === "mouth" && action.id === "resist") return true;
    return Array.isArray(action.satisfies) && action.satisfies.includes(requirement);
  }

  function actionMeta(step) {
    return ACTION[Object.keys(ACTION).find(function (key) { return ACTION[key].id === step.action; })];
  }

  function setHeroVisual(name, restart) {
    activeVisual = name;
    root.dataset.visual = name;
    heroVideos.forEach(function (video) {
      const selected = video.dataset.visual === name;
      video.classList.toggle("is-active", selected);
      if (selected) {
        if (restart && video.readyState >= 1) {
          try { video.currentTime = 0; } catch (_) {}
        }
        heroFallback.hidden = true;
        if (!paused) video.play().catch(function () {});
      } else {
        video.pause();
      }
    });
  }

  function actionDistance(step, ratio, strength) {
    const meta = actionMeta(step);
    let eased = ratio;
    if (step.action === "mouth") {
      eased = ratio * 0.85 + ratio * ratio * (3 - 2 * ratio) * 0.15;
    } else if (step.action === "resist") {
      eased = ratio + Math.sin(ratio * Math.PI * 4) * 0.03;
    } else if (step.action === "blow") {
      eased = 1 - Math.pow(1 - ratio, 1.65);
    }
    const force = step.action === "mouth" ? 0.7 + Math.max(0, Math.min(1, strength)) * 0.3 : 1;
    if (step.action === "mouth") return step.cruiseDistance * eased * force;
    return step.hold * meta.speed * eased * force;
  }

  function setProgress(value, resolved) {
    const global = Math.min(1, (resolved ? completed : completed + value) / steps.length);
    const percent = Math.round(global * 100);
    journeyFill.style.width = `${global * 100}%`;
    journeyDot.style.left = `${global * 100}%`;
    journeyPercent.textContent = `${percent}%`;
    ring.style.strokeDashoffset = String(333 * (1 - value));
  }

  function setTravel(value) {
    travel = Math.max(travel, value);
    const unit = Math.min(root.clientWidth / 1600, root.clientHeight / 900);
    const loopLength = unit > 0 ? root.clientWidth / unit : 1600;
    const backgroundTravel = travel % loopLength;
    root.style.setProperty("--travel", travel.toFixed(2));
    root.style.setProperty("--background-travel", backgroundTravel.toFixed(2));
    updateEncounters();
  }

  function spawnTrail() {
    if (reducedMotion || root.dataset.action === "blow") return;
    const bubble = document.createElement("i");
    const size = 7 + Math.random() * 13;
    bubble.style.cssText = `left:${24 + Math.random() * 10}%;top:${48 + Math.random() * 25}%;width:calc(${size} * var(--du));height:calc(${size} * var(--du))`;
    root.querySelector("#hero-trail").appendChild(bubble);
    window.setTimeout(function () { bubble.remove(); }, 1500);
  }

  function softChime() {
    if (!audioEnabled) return;
    try {
      audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
      [523.25, 659.25, 783.99].forEach(function (frequency, i) {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(0, audioContext.currentTime + i * 0.09);
        gain.gain.linearRampToValueAtTime(0.055, audioContext.currentTime + i * 0.09 + 0.025);
        gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + i * 0.09 + 0.65);
        oscillator.connect(gain).connect(audioContext.destination);
        oscillator.start(audioContext.currentTime + i * 0.09);
        oscillator.stop(audioContext.currentTime + i * 0.09 + 0.7);
      });
    } catch (_) {}
  }

  function paintStep() {
    const step = steps[index];
    const planOffset = travel - (step.startTravel || 0);
    if (Number.isFinite(planOffset) && planOffset !== 0) {
      for (let i = index; i < steps.length; i += 1) {
        steps[i].startTravel += planOffset;
        if (steps[i].encounterX !== undefined) {
          steps[i].encounterX += planOffset;
          const encounter = encounterElements.get(i);
          if (encounter) encounter.style.setProperty("--encounter-x", String(steps[i].encounterX));
          if (goalElement && Number(goalElement.dataset.finalStep) === i) goalElement.style.setProperty("--goal-x", String(steps[i].encounterX + 360));
        }
      }
    }
    const chained = chainIntoStep;
    chainIntoStep = false;
    const special = step.action !== "mouth";
    busy = false;
    awaitingPress = true;
    stepBest = 0;
    stepStrength = 1;
    stepBaseTravel = travel;
    root.dataset.action = step.action;
    root.dataset.state = special && !chained ? "approach" : "waiting";
    root.dataset.step = String(index + 1);
    root.dataset.completed = String(completed);
    actionDemo.dataset.demo = step.action;
    if (special) {
      heroApproach = 1;
      updateHeroApproach();
      if (!chained) {
        later(function () {
          if (root.dataset.state === "approach") root.dataset.state = "waiting";
        }, 300);
      }
    }
    setHeroVisual(hasStarted ? "waiting" : "ready");
    setProgress(0);
    updateEncounters();
  }

  function completeLevel() {
    root.dataset.state = "complete";
    root.dataset.completed = String(steps.length);
    completed = steps.length;
    setProgress(0);
    setHeroVisual("complete");
    const totalSeconds = steps.reduce(function (sum, step) { return sum + step.hold; }, 0);
    root.querySelector("#complete-level-name").textContent = LEVEL.title;
    root.querySelector("#complete-training-time").textContent = steps.length + " 段 · 有效训练 " + String(Math.floor(totalSeconds / 60)).padStart(2, "0") + ":" + String(totalSeconds % 60).padStart(2, "0");

    if (options.onComplete) {
      options.onComplete();
    } else {
      root.querySelector("#complete-panel").hidden = false;
    }
    softChime();
  }

  function showNextStep() {
    if (shownIndex === index) return;
    shownIndex = index;
    index += 1;
    if (index >= steps.length) completeLevel();
    else paintStep();
  }

  function moveDuringFeedback(duration, distance) {
    if (feedbackFrame) window.cancelAnimationFrame(feedbackFrame);
    let elapsed = 0;
    let previous = performance.now();
    const startTravel = travel;
    function frame(now) {
      if (!paused) {
        elapsed += now - previous;
        const ratio = Math.min(1, elapsed / duration);
        const eased = ratio * ratio * (3 - 2 * ratio);
        setTravel(startTravel + eased * (distance === undefined ? 90 : distance));
      }
      previous = now;
      if (elapsed < duration) feedbackFrame = window.requestAnimationFrame(frame);
    }
    feedbackFrame = window.requestAnimationFrame(frame);
  }

  function continueAfterEffects(step, action) {
    if (index === steps.length - 1) {
      moveDuringFeedback(450, 160);
      later(completeLevel, 450);
      return;
    }
    const next = steps[index + 1];
    const canChain = next && action && action.active && canSatisfy(action, next.action);
    if (canChain && (next.action === "mouth" || step.action === "mouth")) {
      if (step.feedback) {
        toast.classList.add("is-visible");
        later(function () { toast.classList.remove("is-visible"); }, step.feedback * 1000);
      }
      chainIntoStep = true;
      showNextStep();
      return;
    }
    if (step.feedback) {
      root.style.setProperty("--vault-duration", "900ms");
      root.dataset.state = "feedback";
      moveDuringFeedback(900, 480);
      later(function () { moveDuringFeedback(step.feedback * 1000 - 900, 90); }, 900);
      toast.classList.add("is-visible");
      later(function () {
        toast.classList.remove("is-visible");
        if (step.blank) later(showNextStep, step.blank * 1000);
        else showNextStep();
      }, step.feedback * 1000);
    } else if (step.blank) {
      root.dataset.state = "blank";
      later(showNextStep, step.blank * 1000);
    } else {
      if (step.action !== "mouth") {
        const duration = step.exitDuration || 900;
        root.style.setProperty("--vault-duration", Math.min(1100, duration) + "ms");
        moveDuringFeedback(duration, step.exitDistance || 60);
        later(showNextStep, duration);
      } else {
        later(showNextStep, 650);
      }
    }
  }

  function startVault() {
    if (reducedMotion) return;
    if (vaultAnimation) vaultAnimation.cancel();
    if (recoveryAnimation) recoveryAnimation.cancel();
    if (recoveryTimer) window.clearTimeout(recoveryTimer);
    root.classList.add("is-vaulting");
    vaultSteps.push(index + 1);
    const animation = heroWrap.animate([
      { transform: "translate(0, 0) rotate(-2deg)", offset: 0 },
      { transform: "translate(calc(35 * var(--du)), calc(-70 * var(--du))) rotate(-8deg)", offset: 0.18 },
      { transform: "translate(calc(170 * var(--du)), calc(-320 * var(--du))) rotate(-12deg)", offset: 0.46 },
      { transform: "translate(calc(210 * var(--du)), calc(-295 * var(--du))) rotate(6deg)", offset: 0.66 },
      { transform: "translate(calc(150 * var(--du)), calc(-60 * var(--du))) rotate(2deg)", offset: 0.86 },
      { transform: "translate(calc(210 * var(--du)), 0) rotate(0deg)", offset: 1 },
    ], { duration: 900, easing: "linear", fill: "forwards" });
    animation.id = "heroVault";
    vaultAnimation = animation;
    animation.onfinish = function () {
      root.classList.remove("is-vaulting");
      if (vaultAnimation === animation) vaultAnimation = null;
      recoveryTimer = window.setTimeout(function () {
        recoveryAnimation = heroWrap.animate([
          { transform: "translate(calc(210 * var(--du)), 0) rotate(0deg)" },
          { transform: "translate(0, 0) rotate(-1deg)" },
        ], { duration: 800, easing: "ease-in-out", fill: "forwards" });
        recoveryAnimation.onfinish = function () {
          if (recoveryAnimation) recoveryAnimation.cancel();
          recoveryAnimation = null;
        };
      }, 400);
    };
    animation.oncancel = function () {
      root.classList.remove("is-vaulting");
      if (vaultAnimation === animation) vaultAnimation = null;
    };
  }

  function resolveStep(action) {
    if (busy) return;
    busy = true;
    completed += 1;
    stepBest = 0;
    const step = steps[index];
    const meta = actionMeta(step);
    step.resolved = true;
    root.dataset.state = "resolved";
    root.dataset.completed = String(completed);
    setTravel(stepBaseTravel + actionDistance(step, 1, stepStrength));
    setProgress(1, true);
    setHeroVisual(step.action !== "mouth" ? "complete" : meta.visual);
    if (step.action !== "mouth") startVault();
    softChime();
    continueAfterEffects(step, action);
  }

  function beginAction(action, offsetSec) {
    eventLog.push({ type: "begin", id: action.id, state: root.dataset.state, busy: busy, sec: action.continuousSec });
    const continuing = !awaitingPress && root.dataset.state === "active";
    const meta = actionMeta(steps[index]);
    const requestedOffset = continuing ? -stepBest * steps[index].hold : Number(offsetSec);
    inputOffsetSec = requestedOffset || 0;
    awaitingPress = false;
    hasStarted = true;
    setHeroVisual(meta.visual, !continuing);
  }

  function onStart(event) {
    eventLog.push({ type: "start", id: event.detail.action.id, state: root.dataset.state, busy: busy, sec: event.detail.action.continuousSec });
    if (paused) return;
    if (!canSatisfy(event.detail.action, steps[index].action)) return;
    if (busy) {
      pendingAction = event.detail.action;
      return;
    }
    beginAction(event.detail.action, 0);
  }

  function onTick(event) {
    eventLog.push({ type: "tick", id: event.detail.action.id, state: root.dataset.state, busy: busy, sec: event.detail.action.continuousSec });
    if (paused) return;
    const action = event.detail.action;
    if (!canSatisfy(action, steps[index].action)) return;
    if (busy) {
      if (action.active) pendingAction = action;
      return;
    }
    if (awaitingPress) {
      if (!action.active) return;
      // A key held during approach starts here, with its earlier hold time
      // discounted. No release/re-press and no instant completion.
      beginAction(action, action.continuousSec);
    }
    if (!action.active || awaitingPress) return;
    root.dataset.state = "active";
    let elapsed = Math.max(0, action.continuousSec - inputOffsetSec);
    if (elapsed + 0.001 < stepBest * steps[index].hold) {
      inputOffsetSec = action.continuousSec - stepBest * steps[index].hold;
      elapsed = Math.max(0, action.continuousSec - inputOffsetSec);
    }
    const ratio = Math.min(1, elapsed / steps[index].hold);
    if (ratio >= stepBest) {
      stepBest = ratio;
      stepStrength = Math.max(0, Math.min(1, Number(action.strength) || 0));
      if (steps[index].action === "mouth") {
        heroApproach = Math.max(heroApproach, ratio);
        updateHeroApproach();
      }
      setTravel(stepBaseTravel + actionDistance(steps[index], ratio, stepStrength));
      setProgress(ratio);
    }
    if (performance.now() - lastTrail > 170) {
      spawnTrail();
      lastTrail = performance.now();
    }
    if (ratio >= 1) resolveStep(action);
  }

  function onEnd(event) {
    eventLog.push({ type: "end", id: event.detail.action.id, state: root.dataset.state, busy: busy, sec: event.detail.action.continuousSec });
    if (paused || !canSatisfy(event.detail.action, steps[index].action)) return;
    if (busy) {
      pendingAction = null;
      return;
    }
    const replacement = event.detail.snapshot && event.detail.snapshot.active;
    if (replacement && replacement.active && canSatisfy(replacement, steps[index].action)) {
      inputOffsetSec = -stepBest * steps[index].hold;
      awaitingPress = false;
      return;
    }
    root.dataset.state = "waiting";
    awaitingPress = true;
    setHeroVisual("waiting");
    setProgress(stepBest);
  }

  function bindControls() {
    document.addEventListener("actioninputstart", onStart);
    document.addEventListener("actioninputtick", onTick);
    document.addEventListener("actioninputend", onEnd);
    root.querySelector("#back-button").addEventListener("click", function () {
      if (options.onExit) options.onExit();
    });

  }

  document.title = "第" + LEVEL_ID + "关 · " + LEVEL.title;
  root.querySelector(".hud__level strong").textContent = LEVEL.title;
  root.querySelector(".hud__eyebrow").textContent = LEVEL.sea + " · 0" + LEVEL_ID;
  root.querySelectorAll(".ocean__background").forEach(function (image) { image.src = ASSET + "background-loop.png"; });
  root.dataset.level = String(LEVEL_ID);

  const stateObserver = new MutationObserver(function () {
    stateChangedAt = performance.now();
    if (root.dataset.state === "waiting" && pendingAction) {
      const action = pendingAction;
      pendingAction = null;
      beginAction(action, 0);
      onTick({ detail: { action: action } });
    }
  });
  stateObserver.observe(root, { attributes: true, attributeFilter: ["data-state"] });
  const stateWatchdog = window.setInterval(function () {
    if (paused) return;
    const age = performance.now() - stateChangedAt;
    const state = root.dataset.state;
    if (state === "approach" && age > 1500) {
      busy = false;
      root.dataset.state = "waiting";
    } else if (state === "resolved" && age > 1800) {
      showNextStep();
    } else if (state === "feedback" && age > steps[index].feedback * 1000 + steps[index].blank * 1000 + 1800) {
      showNextStep();
    } else if (state === "blank" && age > steps[index].blank * 1000 + 1500) {
      showNextStep();
    }
  }, 400);

  buildEncounters();
  buildGoal();
  buildEnvironment();
  bindControls();
  paintStep();
  setHeroVisual("ready", true);
  root.focus({ preventScroll: true });
  const initialInput = window.ActionInput.snapshot().active;
  if (initialInput) {
    document.dispatchEvent(new CustomEvent("actioninputtick", { detail: { action: initialInput } }));
  }

  const api = {
    probe: function () {
      return {
        level: LEVEL_ID,
        step: index + 1,
        total: steps.length,
        completed: completed,
        action: root.dataset.action,
        state: root.dataset.state,
        progress: (completed + stepBest) / steps.length,
        travel: travel,
        backgroundTravel: Number(root.style.getPropertyValue("--background-travel") || 0),
        started: hasStarted,
        heroVisual: activeVisual,
        paused: paused,
        strength: stepStrength,
        awaitingPress: awaitingPress,
        busy: busy,
        inputOffsetSec: inputOffsetSec,
        stateAgeMs: Math.round(performance.now() - stateChangedAt),
        eventLog: eventLog.slice(-12),
        vaulting: Boolean(vaultAnimation && vaultAnimation.playState === "running"),
        vaultSteps: vaultSteps.slice(),
        encounterCount: encounterElements.size,
      };
    },
    teardown: function () {
      window.clearInterval(stateWatchdog);
      stateObserver.disconnect();
      document.removeEventListener("actioninputstart", onStart);
      document.removeEventListener("actioninputtick", onTick);
      document.removeEventListener("actioninputend", onEnd);
      timers.forEach(function (timer) { window.clearTimeout(timer); });
      timers.clear();
      if (feedbackFrame) window.cancelAnimationFrame(feedbackFrame);
      if (vaultAnimation) vaultAnimation.cancel();
      if (recoveryAnimation) recoveryAnimation.cancel();
      if (recoveryTimer) window.clearTimeout(recoveryTimer);
      heroVideos.forEach(function (video) { video.pause(); });
      if (music) music.pause();
      if (window.Level01 === api) window.Level01 = null;
    },
  };
  window.Level01 = api;
  return api;
  }

  window.Level01Factory = { mount: mount };
})();