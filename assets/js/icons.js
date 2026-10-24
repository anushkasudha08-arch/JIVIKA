/* ==========================================================================
   JIVIKA AROGYA — inline SVG icon set (no external icon library)
   ========================================================================== */
(function () {
  "use strict";

  const P = {
    home: '<path d="M3.6 10.6 12 3.8l8.4 6.8V20a1.2 1.2 0 0 1-1.2 1.2h-4.6v-6.4H9.4v6.4H4.8A1.2 1.2 0 0 1 3.6 20Z"/>',
    grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="2"/><rect x="13.5" y="3.5" width="7" height="7" rx="2"/><rect x="3.5" y="13.5" width="7" height="7" rx="2"/><rect x="13.5" y="13.5" width="7" height="7" rx="2"/>',
    droplet: '<path d="M12 3.2c3.4 3.7 6 7 6 10a6 6 0 0 1-12 0c0-3 2.6-6.3 6-10Z"/>',
    heart: '<path d="M12 20.2s-7.6-4.6-7.6-9.9A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 3.2c0 5.3-7.6 9.9-7.6 9.9Z"/>',
    "heart-pulse": '<path d="M12 20.2s-7.6-4.6-7.6-9.9A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 3.2c0 5.3-7.6 9.9-7.6 9.9Z"/><path d="M6.6 12.1h2.8l1.3-2.4 2 4.6 1.4-2.2h3.3"/>',
    sparkle: '<path d="M11 3.4 12.7 9l5.6 1.7-5.6 1.7L11 18l-1.7-5.6L3.7 10.7 9.3 9Z"/><path d="m18.4 16.2.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z"/>',
    leaf: '<path d="M4.5 19.5c-1-6.2 3.4-13.6 15-15 1.2 9.8-4.6 15.6-12.6 15.6"/><path d="M4.8 19.2c2.3-4.6 5.5-8 10.2-10.4"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/>',
    shield: '<path d="M12 3 19.5 6v6c0 4.8-3.3 8.3-7.5 9.2C7.8 20.3 4.5 16.8 4.5 12V6Z"/>',
    "shield-check": '<path d="M12 3 19.5 6v6c0 4.8-3.3 8.3-7.5 9.2C7.8 20.3 4.5 16.8 4.5 12V6Z"/><path d="m9 12 2.2 2.2 4.2-4.3"/>',
    chat: '<path d="M20.5 11.6a8.2 8.2 0 0 1-8.2 8.2H9l-4.6 2.4v-5a8.2 8.2 0 0 1 4.6-13.9h3.3a8.2 8.2 0 0 1 8.2 8.2Z"/><path d="M8.8 9.2h6.4M8.8 12.6h4.2"/>',
    user: '<circle cx="12" cy="8" r="3.8"/><path d="M4.5 20.5c.9-3.7 3.9-5.7 7.5-5.7s6.6 2 7.5 5.7"/>',
    users: '<circle cx="9" cy="8.5" r="3.4"/><path d="M2.8 20c.7-3.3 3.2-5 6.2-5s5.5 1.7 6.2 5"/><path d="M16.2 5.6a3.4 3.4 0 0 1 0 6.4M17.6 15.4c2.1.4 3.4 1.9 3.9 4.6"/>',
    globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.6 12h16.8"/><path d="M12 3.4c2.4 2.4 3.7 5.4 3.7 8.6s-1.3 6.2-3.7 8.6c-2.4-2.4-3.7-5.4-3.7-8.6S9.6 5.8 12 3.4Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"/>',
    moon: '<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.6 8.6 0 1 0 10.5 10.5Z"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    "arrow-right": '<path d="M4.5 12h15M13.5 6l6 6-6 6"/>',
    "arrow-left": '<path d="M19.5 12h-15M10.5 6l-6 6 6 6"/>',
    "chevron-left": '<path d="m14.5 6-6 6 6 6"/>',
    "chevron-right": '<path d="m9.5 6 6 6-6 6"/>',
    "chevron-down": '<path d="m6 9.5 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="3"/><path d="M8 3.5v4M16 3.5v4M3.5 10.5h17"/>',
    bell: '<path d="M18 8.6a6 6 0 1 0-12 0c0 4.2-1.6 5.4-1.6 5.4h15.2S18 12.8 18 8.6"/><path d="M10.2 18.4a2 2 0 0 0 3.6 0"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 6.5"/>',
    "check-circle": '<circle cx="12" cy="12" r="8.6"/><path d="m8.4 12.2 2.6 2.6 4.6-5"/>',
    trash: '<path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l.9 13h9.2l.9-13"/><path d="M10.5 11v5M13.5 11v5"/>',
    download: '<path d="M12 3.5v11M7.5 10.5 12 15l4.5-4.5M4.5 20.5h15"/>',
    upload: '<path d="M12 15.5v-11M7.5 8.5 12 4l4.5 4.5M4.5 20.5h15"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
    phone: '<path d="M6.2 3.5h3l1.6 4-2.1 1.4a11.5 11.5 0 0 0 5.4 5.4l1.4-2.1 4 1.6v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.2 5.7a2 2 0 0 1 2-2.2Z"/>',
    alert: '<path d="M12 4 21 20H3Z"/><path d="M12 10v4.5"/><circle cx="12" cy="17.3" r=".9" fill="currentColor" stroke="none"/>',
    info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".9" fill="currentColor" stroke="none"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    play: '<path d="M8 5.5 18.5 12 8 18.5Z"/>',
    pause: '<path d="M9 5.5v13M15 5.5v13"/>',
    refresh: '<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v4.5h-4.5"/>',
    book: '<path d="M12 6.5C10.5 5 8 4.5 4.5 4.5v13c3.5 0 6 .5 7.5 2 1.5-1.5 4-2 7.5-2v-13c-3.5 0-6 .5-7.5 2Z"/><path d="M12 6.5v13"/>',
    pill: '<rect x="3.2" y="9" width="17.6" height="6.4" rx="3.2" transform="rotate(-45 12 12)"/><path d="M9.2 8.2 15.8 14.8"/>',
    hospital: '<rect x="4" y="6.5" width="16" height="14" rx="2.5"/><path d="M9.5 20.5V16h5v4.5"/><path d="M12 9v4M10 11h4M12 6.5v-3"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
    stethoscope: '<path d="M6 3.5v5a5 5 0 0 0 10 0v-5"/><path d="M11 13.5V16a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="10.5" r="2.4"/>',
    utensils: '<path d="M7 3.5v7a2.5 2.5 0 0 0 5 0v-7"/><path d="M9.5 10.5v10"/><path d="M17.5 3.5c-1.5 1.5-2 3-2 4.5s.5 3 2 4.5v8"/>',
    coins: '<ellipse cx="12" cy="6.5" rx="7" ry="3"/><path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/><path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5"/>',
    send: '<path d="M21 3 10.5 13.5M21 3l-6.5 18-4-8.5L2 8.5Z"/>',
    edit: '<path d="M16.5 4.5 19.5 7.5 8.5 18.5H5.5v-3Z"/><path d="M14 7 17 10"/>',
    external: '<path d="M14 4.5h5.5V10M19 5l-8 8"/><path d="M18 14.5v4a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/>',
    file: '<path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5Z"/><path d="M14 3.5v5h5"/>',
    wind: '<path d="M3.5 8.5h9a3 3 0 1 0-3-3"/><path d="M3.5 12.5h13a3 3 0 1 1-3 3"/><path d="M3.5 16.5h5.5"/>',
    type: '<path d="M4 6.5h9.5M8.7 6.5v13"/><path d="M15 11.5h5M17.5 11.5v8"/>',
    accessibility: '<circle cx="12" cy="4.4" r="1.8"/><path d="M5 8.5h14M12 8.5v5M12 13.5l-3 7M12 13.5l3 7"/>',
    water: '<path d="M6 5.5h12l-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2Z"/><path d="M6.6 12h10.8"/>',
    bowl: '<path d="M3.5 11h17c0 5-3.8 8.5-8.5 8.5S3.5 16 3.5 11Z"/><path d="M8 11c0-3 1.5-4.5 4-7 2.5 2.5 4 4 4 7"/>',
    "mood-1": '<circle cx="12" cy="12" r="8.6"/><path d="M8.5 16.9c1-1.8 2.2-2.7 3.5-2.7s2.5.9 3.5 2.7"/><circle cx="9" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".9" fill="currentColor" stroke="none"/><path d="M7.6 7.2 10 8.4M16.4 7.2 14 8.4"/>',
    "mood-2": '<circle cx="12" cy="12" r="8.6"/><path d="M8.8 16.2c1-1.2 2.1-1.8 3.2-1.8s2.2.6 3.2 1.8"/><circle cx="9" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".9" fill="currentColor" stroke="none"/>',
    "mood-3": '<circle cx="12" cy="12" r="8.6"/><path d="M8.8 15.6h6.4"/><circle cx="9" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".9" fill="currentColor" stroke="none"/>',
    "mood-4": '<circle cx="12" cy="12" r="8.6"/><path d="M8.5 14.8c1 1.5 2.2 2.2 3.5 2.2s2.5-.7 3.5-2.2"/><circle cx="9" cy="10" r=".9" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r=".9" fill="currentColor" stroke="none"/>',
    "mood-5": '<circle cx="12" cy="12" r="8.6"/><path d="M8.3 14.4c1 1.8 2.3 2.7 3.7 2.7s2.7-.9 3.7-2.7"/><path d="M8.4 10.2c.4-.7 1-.7 1.4 0M14.2 10.2c.4-.7 1-.7 1.4 0"/>',
    baby: '<circle cx="12" cy="12" r="8.6"/><circle cx="9.2" cy="10" r="1"/><circle cx="14.8" cy="10" r="1"/><path d="M9.4 15c.8.9 1.6 1.3 2.6 1.3s1.8-.4 2.6-1.3"/><path d="M12 3.4c0-1 .8-1.6 1.6-1.6"/>',
    scale: '<path d="M12 4v16M7 20h10"/><path d="M4 8h16"/><path d="M4 8 1.5 14h5Z"/><path d="M20 8l-2.5 6h5Z"/>'
  };

  function icon(name, cls) {
    const path = P[name] || P.info;
    return '<svg class="ic ' + (cls || "") + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + path + "</svg>";
  }

  window.JV = window.JV || {};
  window.JV.icon = icon;
  window.JV.iconNames = Object.keys(P);
})();
