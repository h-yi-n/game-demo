(function () {
  "use strict";

  var TRACKS = {
    c2: "assets/audio/bgm_c2.ogg",
    seas1: "assets/audio/bgm_seas1.ogg",
    seas2: "assets/audio/bgm_seas2.ogg",
    seas3: "assets/audio/bgm_seas3.ogg",
  };
  var SCREEN_TRACKS = {
    c1: "c2",
    c2: "c2",
    "c2-1": "c2",
    "c2-2": "c2",
    "c2-3": "c2",
    "c2-4": "c2",
    p1: "c2",
    p2: "c2",
    p3: "c2",
  };
  var SEA_TRACKS = ["seas1", "seas2", "seas3"];
  var DEFAULT_VOLUME = 0.35;
  var FADE_MS = 700;
  var VOLUME_KEY = "oral-motor-game-bgm-volume-v1";
  var slots = Array.from(
    document.querySelectorAll(".bgm-layer audio[data-slot]"),
  );

  var currentTrack = null;
  var activeSlot = null;
  var fadeToken = 0;
  var volume = readVolume();

  function clampVolume(value) {
    var number = Number(value);
    if (!Number.isFinite(number)) return DEFAULT_VOLUME;
    return Math.min(1, Math.max(0, number));
  }

  function readVolume() {
    try {
      return clampVolume(
        window.localStorage.getItem(VOLUME_KEY) || DEFAULT_VOLUME,
      );
    } catch (error) {
      return DEFAULT_VOLUME;
    }
  }


  function configure(slot, track) {
    if (slot.dataset.track === track) return;
    slot.dataset.track = track;
    slot.src = TRACKS[track];
    slot.load();
  }

  function start(slot) {
    var playing = slot.play();
    if (playing && playing.catch) playing.catch(function () {});
  }

  function enter(screenId, seaIndex) {
    var track = SCREEN_TRACKS[screenId];
    /* C3-1~C3-3 与对应游玩页按当前海域取曲；结算浮窗不另切歌。 */
    if (!track && (screenId === "c3" || screenId.indexOf("c3-") === 0)) {
      var index = Number(seaIndex);
      if (
        !Number.isInteger(index) ||
        index < 0 ||
        index >= SEA_TRACKS.length
      ) {
        index = window.App ? window.App.getSelectedSea() : 0;
      }
      track = SEA_TRACKS[index] || SEA_TRACKS[0];
    }
    if (!track || track === currentTrack) return;

    var oldSlot = activeSlot;
    var nextSlot =
      oldSlot && slots.length > 1
        ? slots[(slots.indexOf(oldSlot) + 1) % slots.length]
        : slots[0];
    if (!nextSlot) return;

    currentTrack = track;
    activeSlot = nextSlot;
    fadeToken += 1;
    configure(nextSlot, track);
    nextSlot.currentTime = 0;
    nextSlot.volume = oldSlot ? 0 : volume;
    start(nextSlot);

    if (!oldSlot) return;

    var token = fadeToken;
    var startedAt = window.performance.now();
    oldSlot.volume = volume;

    function step(now) {
      if (token !== fadeToken) return;
      var progress = Math.min(1, Math.max(0, (now - startedAt) / FADE_MS));
      nextSlot.volume = volume * progress;
      oldSlot.volume = volume * (1 - progress);
      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }
      oldSlot.pause();
      oldSlot.volume = 0;
    }

    window.requestAnimationFrame(step);
  }

  function stop() {
    if (activeSlot) activeSlot.pause();
    currentTrack = null;
  }

  function unlock() {
    if (!activeSlot || !activeSlot.paused) return;
    activeSlot.volume = volume;
    start(activeSlot);
  }

  function setVolume(value) {
    volume = clampVolume(value);
    if (activeSlot) activeSlot.volume = volume;
    try {
      window.localStorage.setItem(VOLUME_KEY, String(volume));
    } catch (error) {
      // 存储不可用时，本次会话仍然保留音量。
    }
  }

  function probe() {
    return {
      track: currentTrack,
      currentTime: activeSlot ? activeSlot.currentTime : 0,
      paused: activeSlot ? activeSlot.paused : true,
      volume: volume,
      activeSlot: activeSlot ? activeSlot.dataset.slot : null,
      slots: slots.map(function (slot) {
        return {
          slot: slot.dataset.slot,
          track: slot.dataset.track || null,
          currentTime: slot.currentTime,
          paused: slot.paused,
          volume: slot.volume,
        };
      }),
    };
  }


  window.AudioBus = {
    enter: enter,
    stop: stop,
    unlock: unlock,
    setVolume: setVolume,
    getVolume: function () {
      return volume;
    },
    probe: probe,
  };
})();
