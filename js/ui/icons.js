(function () {
  "use strict";

  function icon(content) {
    return `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${content}</svg>`;
  }

  window.Icons = {
    back: icon(`
      <path
        d="M17.9 3.3 7.3 12 17.9 20.7"
        vector-effect="non-scaling-stroke"
      />
    `),
    settings: icon(`
      <path d="M4 7h8.9" vector-effect="non-scaling-stroke" />
      <circle
        cx="15"
        cy="7"
        r="2.1"
        vector-effect="non-scaling-stroke"
      />
      <path d="M17.1 7H20" vector-effect="non-scaling-stroke" />
      <path d="M4 12h2.9" vector-effect="non-scaling-stroke" />
      <circle
        cx="9"
        cy="12"
        r="2.1"
        vector-effect="non-scaling-stroke"
      />
      <path d="M11.1 12H20" vector-effect="non-scaling-stroke" />
      <path d="M4 17h8.9" vector-effect="non-scaling-stroke" />
      <circle
        cx="15"
        cy="17"
        r="2.1"
        vector-effect="non-scaling-stroke"
      />
      <path d="M17.1 17H20" vector-effect="non-scaling-stroke" />
    `),
    skin: icon(`
      <path
        d="M9.1 4.6 12 6.9 14.9 4.6 19.2 6.7 20.4 10.5 17.3 11.4 17.3 19.2 6.7 19.2 6.7 11.4 3.6 10.5 4.8 6.7Z"
        vector-effect="non-scaling-stroke"
      />
    `),
    collection: icon(`
      <rect
        x="5.7"
        y="4.4"
        width="12.6"
        height="15.2"
        rx="2.2"
        vector-effect="non-scaling-stroke"
      />
      <path d="M9.5 4.4v15.2" vector-effect="non-scaling-stroke" />
      <path d="M12.5 11.8h2.6" vector-effect="non-scaling-stroke" />
    `),
    viewSwitch: icon(`
      <circle
        cx="8.6"
        cy="8.2"
        r="2.6"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M4.4 18.8c0-2.9 1.9-4.9 4.2-4.9s4.2 2 4.2 4.9"
        vector-effect="non-scaling-stroke"
      />
      <circle
        cx="17.8"
        cy="10.8"
        r="1.9"
        vector-effect="non-scaling-stroke"
      />
      <path
        d="M15.4 18.8c0-2.1 1.1-3.6 3-3.6s3 1.5 3 3.6"
        vector-effect="non-scaling-stroke"
      />
    `),
  };
})();
