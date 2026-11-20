(function () {
  "use strict";

  var DEFAULT_CHARACTER = "dolphin";
  var VISIBLE_SCREENS = {
    c2: true,
    "c2-1": true,
    "c2-2": true,
    "c2-4": true,
  };
  var CHARACTERS = {
    dolphin: {
      id: "dolphin",
      number: "01",
      name: "小海豚",
      video: "assets/video/hero_main_alpha.webm",
      poster: "assets/主角-小海豚 定稿.png",
    },
  };
  var root = document.getElementById("character-stage");
  var video = root ? root.querySelector("video") : null;
  var image = root ? root.querySelector("img") : null;
  var currentId = null;
  var lastScreen = null;

  function reduced() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function play() {
    if (!video || video.hidden || reduced()) return;
    var result = video.play();
    if (result && result.catch) result.catch(function () {});
  }

  function syncSelection(characterId) {
    document.querySelectorAll(".coll-cell[data-character-id]").forEach(function (cell) {
      var selected = cell.dataset.characterId === characterId;
      cell.classList.toggle("is-selected", selected);
      cell.setAttribute("aria-pressed", String(selected));
    });
  }

  function select(characterId) {
    var character = CHARACTERS[characterId];
    if (!character) return false;
    syncSelection(characterId);
    if (currentId === characterId) return true;

    currentId = characterId;
    root.dataset.characterId = character.id;
    root.style.setProperty("--character-scale", character.scale || 1);
    root.dataset.motion = character.video ? "original" : "float";
    if (character.video && video) {
      if (image) image.hidden = true;
      video.hidden = false;
      video.poster = character.poster || "";
      video.src = character.video;
      video.load();
      play();
    } else {
      if (video) {
        video.pause();
        video.hidden = true;
      }
      if (image) {
        image.hidden = false;
        image.src = character.image;
        image.alt = character.name;
      }
    }
    return true;
  }

  function enter(screenId) {
    if (!root) return;
    if (lastScreen === "c2-4" && screenId !== "c2-4") select(DEFAULT_CHARACTER);
    var enteringCollection =
      screenId === "c2-4" && lastScreen !== "c2-4";
    if (enteringCollection) {
      select(DEFAULT_CHARACTER);
    } else if (!currentId) {
      select(DEFAULT_CHARACTER);
    }

    var visible = Boolean(VISIBLE_SCREENS[screenId]);
    root.dataset.visible = visible ? "true" : "false";
    if (visible) play();
    else if (video) video.pause();
    lastScreen = screenId;
  }

  function register(characterId, character) {
    if (!characterId || !character) return false;
    CHARACTERS[characterId] = Object.assign({ id: characterId }, character);
    return true;
  }

  document.addEventListener("click", function (event) {
    var choice =
      event.target.closest && event.target.closest("[data-character-id]");
    if (!choice || !choice.dataset.characterId) return;
    if (!window.App || window.App.getScreen() !== "c2-4") return;
    select(choice.dataset.characterId);
  });

  window.CharacterStage = {
    enter: enter,
    register: register,
    select: select,
    getSelected: function () {
      return currentId;
    },
    probe: function () {
      var character = currentId ? CHARACTERS[currentId] : null;
      return {
        id: currentId,
        name: character ? character.name : null,
        visible: root ? root.dataset.visible === "true" : false,
        motion: root ? root.dataset.motion : null,
        currentTime: video ? video.currentTime : 0,
        paused: video ? video.paused : true,
      };
    },
  };
})();
