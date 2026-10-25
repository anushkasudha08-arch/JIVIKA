/* ==========================================================================
   JIVIKA AROGYA — app shell, storage, accessibility, cycle maths
   ========================================================================== */
(function () {
  "use strict";

  const JV = window.JV || {};
  const icon = JV.icon;
  const DAY = 86400000;
  const PREFIX = "jivika.";
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  const HEALTH_KEYS = ["cycle", "moods", "journal", "selfcare", "water", "schemes", "checklist", "moodNotes", "preventive"];

  const PROFILE_DEFAULTS = {
    name: "",
    ageGroup: "",
    state: "",
    lifeStage: "",
    diet: "",
    consent: { store: null, reminders: false, assistant: null },
    a11y: { theme: "light", text: "md", contrast: "normal" },
    createdAt: null,
    lastVisit: null
  };

  const memory = new Map();

  /* ---------- storage ---------- */
  const Store = {
    get: function (key, fallback) {
      try {
        const raw = localStorage.getItem(PREFIX + key);
        if (raw === null) return memory.has(key) ? memory.get(key) : fallback;
        return JSON.parse(raw);
      } catch (e) {
        return memory.has(key) ? memory.get(key) : fallback;
      }
    },
    set: function (key, value) {
      memory.set(key, value);
      const isHealth = HEALTH_KEYS.indexOf(key) !== -1;
      const consent = Store.profile().consent.store;
      if (isHealth && consent === false) return false;
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    remove: function (key) {
      memory.delete(key);
      try { localStorage.removeItem(PREFIX + key); } catch (e) { /* ignore */ }
    },
    profile: function () {
      const saved = Store.get("profile", {}) || {};
      const merged = Object.assign({}, PROFILE_DEFAULTS, saved);
      merged.consent = Object.assign({}, PROFILE_DEFAULTS.consent, saved.consent || {});
      merged.a11y = Object.assign({}, PROFILE_DEFAULTS.a11y, saved.a11y || {});
      return merged;
    },
    saveProfile: function (patch) {
      const next = Object.assign(Store.profile(), patch);
      next.consent = Object.assign(Store.profile().consent, patch && patch.consent ? patch.consent : {});
      next.a11y = Object.assign(Store.profile().a11y, patch && patch.a11y ? patch.a11y : {});
      if (!next.createdAt) next.createdAt = new Date().toISOString();
      memory.set("profile", next);
      try { localStorage.setItem(PREFIX + "profile", JSON.stringify(next)); } catch (e) { /* private mode */ }
      return next;
    },
    clearHealth: function () {
      HEALTH_KEYS.concat(["cycle", "moods"]).forEach(function (k) { Store.remove(k); });
    },
    clearAll: function () {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(PREFIX) === 0) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
      });
      memory.clear();
    },
    bytes: function () {
      let total = 0;
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf(PREFIX) === 0) total += (localStorage.getItem(k) || "").length + k.length;
      });
      return total;
    }
  };

  /* ---------- dates ---------- */
  function parseISO(iso) {
    if (!iso) return null;
    if (iso instanceof Date) return new Date(iso.getFullYear(), iso.getMonth(), iso.getDate());
    const parts = String(iso).split("-");
    if (parts.length !== 3) return new Date(iso);
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  }
  function toISO(d) {
    const dt = d instanceof Date ? d : parseISO(d);
    if (!dt || isNaN(dt)) return "";
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return dt.getFullYear() + "-" + m + "-" + day;
  }
  function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return startOfDay(x); }
  function daysBetween(a, b) { return Math.round((startOfDay(b) - startOfDay(a)) / DAY); }
  function locale() {
    const l = JV.i18n.get();
    return (l === "en" || l === "tcy") ? "en-IN" : l + "-IN";
  }
  function fmtDate(d, opts) {
    const dt = d instanceof Date ? d : parseISO(d);
    if (!dt || isNaN(dt)) return "—";
    const o = Object.assign({ day: "numeric", month: "short" }, opts || {});
    try { return new Intl.DateTimeFormat(locale(), o).format(dt); } catch (e) { return dt.toDateString(); }
  }
  function fmtMonth(d) {
    const dt = d instanceof Date ? d : parseISO(d);
    try { return new Intl.DateTimeFormat(locale(), { month: "long", year: "numeric" }).format(dt); } catch (e) { return dt.toDateString(); }
  }
  function weekdayShort(d) {
    try { return new Intl.DateTimeFormat(locale(), { weekday: "short" }).format(d); } catch (e) { return ""; }
  }

  /* ---------- misc helpers ---------- */
  function esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function uid() { return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3); }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function plural(n, one, many) { return n === 1 ? one : many; }

  /* ---------- toast ---------- */
  let toastTimer = null;
  function toast(message, type) {
    let wrap = $("#toastWrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.id = "toastWrap";
      wrap.className = "toast-wrap";
      wrap.setAttribute("role", "status");
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    wrap.innerHTML = '<div class="toast ' + (type === "error" ? "error" : "") + '">' +
      icon(type === "error" ? "alert" : "check-circle") + "<span>" + esc(message) + "</span></div>";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { wrap.innerHTML = ""; }, 3200);
  }

  /* ---------- dialogs ---------- */
  function ensureDialog(id) {
    let dlg = document.getElementById(id);
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = id;
    dlg.className = "modal";
    document.body.appendChild(dlg);
    return dlg;
  }

  function confirmDialog(opts) {
    const o = Object.assign({ title: "Are you sure?", message: "", confirm: "Confirm", cancel: "Cancel", danger: false }, opts || {});
    const dlg = ensureDialog("confirmDialog");
    dlg.innerHTML =
      '<div class="modal-head"><div class="icon-badge ' + (o.danger ? "danger" : "lav") + '">' + icon(o.danger ? "alert" : "info") + "</div>" +
      "<div><h3>" + esc(o.title) + "</h3></div></div>" +
      '<div class="modal-body"><p>' + esc(o.message) + "</p></div>" +
      '<div class="modal-foot"><button class="btn btn-secondary" data-act="cancel" type="button">' + esc(o.cancel) + "</button>" +
      '<button class="btn ' + (o.danger ? "btn-danger" : "btn-primary") + '" data-act="ok" type="button">' + esc(o.confirm) + "</button></div>";
    return new Promise(function (resolve) {
      let settled = false;
      function onCancel(event) {
        if (event && event.preventDefault) event.preventDefault();
        finish(false);
      }
      function finish(val) {
        if (settled) return;
        settled = true;
        dlg.removeEventListener("cancel", onCancel);
        if (dlg.open) dlg.close();
        resolve(val);
      }
      dlg.querySelector('[data-act="cancel"]').addEventListener("click", function () { finish(false); });
      dlg.querySelector('[data-act="ok"]').addEventListener("click", function () { finish(true); });
      dlg.addEventListener("cancel", onCancel);
      if (dlg.open) dlg.close();
      dlg.showModal();
    });
  }

  /* ---------- navigation map ---------- */
  const NAV = [
    { id: "home", href: "index.html", key: "nav.home", icon: "home" },
    { id: "dashboard", href: "dashboard.html", key: "nav.dashboard", icon: "grid" },
    { id: "preventive", href: "preventive.html", key: "nav.preventive", icon: "shield-check" },
    { id: "menstrual", href: "menstrual.html", key: "nav.menstrual", icon: "droplet" },
    { id: "physical", href: "physical.html", key: "nav.physical", icon: "heart-pulse" },
    { id: "mental", href: "mental.html", key: "nav.mental", icon: "sparkle" },
    { id: "nutrition", href: "nutrition.html", key: "nav.nutrition", icon: "leaf" },
    { id: "healthcare", href: "healthcare.html", key: "nav.healthcare", icon: "pin" },
    { id: "schemes", href: "schemes.html", key: "nav.schemes", icon: "shield" },
    { id: "assistant", href: "assistant.html", key: "nav.assistant", icon: "chat" },
    { id: "profile", href: "profile.html", key: "nav.profile", icon: "user" }
  ];
  const PRIMARY = ["dashboard", "preventive", "menstrual", "physical", "mental", "assistant"];
  const OPTIONAL = [];
  const TABS = ["home", "menstrual", "assistant", "mental", "profile"];

  function currentPage() { return (document.body && document.body.getAttribute("data-page")) || "home"; }

  let brandCount = 0;
  function brandMarkup() {
    brandCount += 1;
    const gid = "jvBrand" + brandCount;
    return '<svg class="brand-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#f9b3c8"/><stop offset=".55" stop-color="#e0749c"/><stop offset="1" stop-color="#a487e8"/></linearGradient></defs>' +
      '<rect width="48" height="48" rx="14" fill="url(#' + gid + ')"/>' +
      '<path d="M24 11c4.4 4.8 6.6 8.6 6.6 11.8 0 3.2-2.6 5.6-6.6 8.2-4-2.6-6.6-5-6.6-8.2C17.4 19.6 19.6 15.8 24 11Z" fill="#fff" fill-opacity=".94"/>' +
      '<path d="M15 24.4c1.6-1.7 3.4-2.6 5.2-2.6-1 1.8-1.5 3.6-1.4 5.4-1.3-.5-2.6-1.4-3.8-2.8Z" fill="#fff" fill-opacity=".7"/>' +
      '<path d="M33 24.4c-1.6-1.7-3.4-2.6-5.2-2.6 1 1.8 1.5 3.6 1.4 5.4 1.3-.5 2.6-1.4 3.8-2.8Z" fill="#fff" fill-opacity=".7"/>' +
      '<circle cx="24" cy="34.6" r="1.7" fill="#fff" fill-opacity=".8"/></svg>';
  }

  function renderHeader() {
    const host = document.getElementById("site-header");
    if (!host) return;
    const page = currentPage();
    const primary = NAV.filter(function (n) { return PRIMARY.indexOf(n.id) !== -1; });

    const navLinks = primary.map(function (n) {
      const opt = OPTIONAL.indexOf(n.id) !== -1 ? ' data-optional="true"' : "";
      return '<a href="' + n.href + '"' + opt + (page === n.id ? ' aria-current="page"' : "") + ' data-i18n="' + n.key + '">' + JV.i18n.t(n.key) + "</a>";
    }).join("");

    const panelLinks = NAV.map(function (n) {
      return '<a href="' + n.href + '"' + (page === n.id ? ' aria-current="page"' : "") + ' data-nav-key="' + n.key + '">' +
        icon(n.icon) + "<span>" + JV.i18n.t(n.key) + "</span></a>";
    }).join("");

    const langOptions = JV.i18n.langs.map(function (l) {
      return '<option value="' + l.code + '"' + (JV.i18n.get() === l.code ? " selected" : "") + ">" + l.label + "</option>";
    }).join("");

    host.innerHTML =
      '<header class="site-header" id="siteHeader">' +
      '<div class="container header-inner">' +
      '<a class="brand" href="index.html" aria-label="JIVIKA AROGYA — home">' + brandMarkup() +
      '<span class="brand-text"><span class="brand-name">JIVIKA AROGYA</span>' +
      '<span class="brand-tag" data-i18n="brand.tagline">' + JV.i18n.t("brand.tagline") + "</span></span></a>" +
      '<nav class="main-nav" aria-label="Main navigation">' + navLinks + "</nav>" +
      '<div class="header-actions">' +
      '<div class="lang-select-wrap">' + icon("globe") +
      '<label class="sr-only" for="langSelect" data-i18n="common.language">Language</label>' +
      '<select class="lang-select" id="langSelect" aria-label="' + JV.i18n.t("common.language") + '">' + langOptions + "</select></div>" +
      '<button class="icon-btn theme-toggle" id="themeToggle" type="button" aria-label="' + JV.i18n.t("common.theme") + '" title="' + JV.i18n.t("common.theme") + '">' + icon("moon") + "</button>" +
      '<button class="icon-btn" id="a11yBtn" type="button" aria-label="' + JV.i18n.t("common.accessibility") + '" title="' + JV.i18n.t("common.accessibility") + '">' + icon("accessibility") + "</button>" +
      '<a class="icon-btn profile-link" href="profile.html" aria-label="' + JV.i18n.t("nav.profile") + '" title="' + JV.i18n.t("nav.profile") + '">' + icon("user") + "</a>" +
      '<button class="icon-btn menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="navPanel" aria-label="' + JV.i18n.t("common.menu") + '">' + icon("menu") + "</button>" +
      "</div></div>" +
      '<nav class="nav-panel" id="navPanel" aria-label="All pages"><div class="nav-panel-inner">' + panelLinks +
      '<div class="nav-panel-extra">' +
      '<button class="btn btn-secondary btn-sm" id="panelA11y" type="button">' + icon("accessibility") + JV.i18n.t("common.accessibility") + "</button>" +
      '<a class="btn btn-primary btn-sm" href="assistant.html">' + icon("chat") + JV.i18n.t("nav.assistant") + "</a>" +
      "</div></div></nav></header>";

    const header = $("#siteHeader");
    const onScroll = function () {
      header.classList.toggle("is-stuck", window.scrollY > 6);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const menuBtn = $("#menuBtn");
    const panel = $("#navPanel");
    function closePanel() {
      panel.classList.remove("open");
      menuBtn.setAttribute("aria-expanded", "false");
    }
    menuBtn.addEventListener("click", function () {
      const open = !panel.classList.contains("open");
      panel.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      menuBtn.innerHTML = icon(open ? "close" : "menu");
    });
    document.addEventListener("click", function (e) {
      if (!panel.classList.contains("open")) return;
      if (panel.contains(e.target) || menuBtn.contains(e.target)) return;
      closePanel();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePanel();
    });
    panel.addEventListener("click", function (e) {
      if (e.target.closest("a")) closePanel();
    });
    $("#panelA11y").addEventListener("click", function () { closePanel(); openA11y(); });

    $("#langSelect").addEventListener("change", function (e) {
      JV.i18n.set(e.target.value);
      refreshHeaderLabels();
      toast(JV.i18n.t("common.language") + ": " + e.target.options[e.target.selectedIndex].text);
    });

    $("#themeToggle").addEventListener("click", function () { toggleTheme(); });
    $("#a11yBtn").addEventListener("click", openA11y);
    syncThemeIcon();
  }

  function refreshHeaderLabels() {
    if (!document.getElementById("siteHeader")) return;
    const nav = document.querySelector(".main-nav");
    if (nav) {
      nav.querySelectorAll("a").forEach(function (a) {
        const key = a.getAttribute("data-i18n");
        if (key) a.textContent = JV.i18n.t(key);
      });
    }
    const panel = document.getElementById("navPanel");
    if (panel) {
      panel.querySelectorAll("a[data-nav-key]").forEach(function (a) {
        const key = a.getAttribute("data-nav-key");
        const label = a.querySelector("span");
        if (label) label.textContent = JV.i18n.t(key);
      });
    }
    const brandTag = document.querySelector(".brand-tag");
    if (brandTag) brandTag.textContent = JV.i18n.t("brand.tagline");
    const langSel = document.getElementById("langSelect");
    if (langSel) langSel.value = JV.i18n.get();
    const menuBtn = document.getElementById("menuBtn");
    if (menuBtn) menuBtn.setAttribute("aria-label", JV.i18n.t("common.menu"));
    const a11yBtn = document.getElementById("a11yBtn");
    if (a11yBtn) { a11yBtn.setAttribute("aria-label", JV.i18n.t("common.accessibility")); a11yBtn.setAttribute("title", JV.i18n.t("common.accessibility")); }
    const themeBtn = document.getElementById("themeToggle");
    if (themeBtn) { themeBtn.setAttribute("aria-label", JV.i18n.t("common.theme")); themeBtn.setAttribute("title", JV.i18n.t("common.theme")); }
    const pl = document.querySelector(".profile-link");
    if (pl) { pl.setAttribute("aria-label", JV.i18n.t("nav.profile")); pl.setAttribute("title", JV.i18n.t("nav.profile")); }
    const a11yDlg = document.getElementById("a11yDialog");
    if (a11yDlg) a11yDlg.remove();
  }

  function renderFooter() {
    const host = document.getElementById("site-footer");
    if (!host) return;
    const navById = {};
    NAV.forEach(function (n) { navById[n.id] = n; });
    function pick(ids) { return ids.map(function (id) { return navById[id]; }).filter(Boolean); }
    const col1 = pick(["dashboard", "preventive", "menstrual", "physical", "mental"]);
    const col2 = pick(["nutrition", "healthcare", "schemes"]);
    const col3 = pick(["assistant", "profile", "home"]);
    function link(n) {
      return '<a href="' + n.href + '" data-i18n="' + n.key + '">' + JV.i18n.t(n.key) + "</a>";
    }
    host.innerHTML =
      '<footer class="site-footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand"><a class="brand" href="index.html">' + brandMarkup() +
      '<span class="brand-text"><span class="brand-name">JIVIKA AROGYA</span></span></a>' +
      '<p data-i18n="footer.note">' + JV.i18n.t("footer.note") + "</p></div>" +
      '<div class="footer-col"><h4>Health tools</h4>' + col1.map(link).join("") + "</div>" +
      '<div class="footer-col"><h4>Support</h4>' + col2.map(link).join("") + "</div>" +
      '<div class="footer-col"><h4>Your account</h4>' + col3.map(link).join("") + "</div>" +
      "</div>" +
      '<div class="footer-bottom"><div><strong>JIVIKA AROGYA</strong> · <span data-i18n="footer.rights">' + JV.i18n.t("footer.rights") + "</span></div>" +
      '<div class="footer-helplines">' +
      '<a href="tel:108">' + icon("phone") + " 108 Ambulance</a>" +
      '<a href="tel:181">' + icon("phone") + " 181 Women's helpline</a>" +
      '<a href="tel:14416">' + icon("phone") + " 14416 Mental health</a>" +
      "</div></div></div></footer>";
  }

  function renderTabbar() {
    const host = document.getElementById("site-tabbar");
    if (!host) return;
    const page = currentPage();
    host.innerHTML = '<nav class="tabbar" aria-label="Quick navigation">' +
      TABS.map(function (id) {
        const n = NAV.filter(function (x) { return x.id === id; })[0];
        return '<a href="' + n.href + '"' + (page === id ? ' aria-current="page"' : "") + ">" + icon(n.icon) +
          "<span>" + JV.i18n.t(n.key).split(" ")[0] + "</span></a>";
      }).join("") + "</nav>";
  }

  /* ---------- theme & accessibility ---------- */
  function applyA11y(prefs) {
    const html = document.documentElement;
    html.setAttribute("data-theme", prefs.theme || "light");
    html.setAttribute("data-text", prefs.text || "md");
    html.setAttribute("data-contrast", prefs.contrast || "normal");
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", prefs.theme === "dark" ? "#161220" : "#fff9f7");
  }
  function saveA11y(patch) {
    const profile = Store.profile();
    const next = Object.assign({}, profile.a11y, patch);
    Store.saveProfile({ a11y: next });
    applyA11y(next);
    syncThemeIcon();
    return next;
  }
  function toggleTheme() {
    const cur = Store.profile().a11y.theme;
    saveA11y({ theme: cur === "dark" ? "light" : "dark" });
  }
  function syncThemeIcon() {
    const btn = document.getElementById("themeToggle");
    if (!btn) return;
    const dark = document.documentElement.getAttribute("data-theme") === "dark";
    btn.innerHTML = icon(dark ? "sun" : "moon");
  }

  function openA11y() {
    const dlg = ensureDialog("a11yDialog");
    const p = Store.profile().a11y;
    const t = JV.i18n.t;
    dlg.innerHTML =
      '<div class="modal-head"><div class="icon-badge lav sm">' + icon("accessibility") + "</div>" +
      "<div><h3>" + esc(t("a11y.title")) + "</h3></div>" +
      '<button class="icon-btn" data-act="close" type="button" aria-label="' + esc(t("common.close")) + '">' + icon("close") + "</button></div>" +
      '<div class="modal-body"><div class="a11y-panel">' +
      '<div class="a11y-row"><div><strong>' + esc(t("a11y.text")) + "</strong>" +
      '<div class="segmented" style="margin-top:.45rem" role="group">' +
      '<button type="button" data-text="md" aria-pressed="' + (p.text === "md") + '">' + esc(t("a11y.normal")) + "</button>" +
      '<button type="button" data-text="lg" aria-pressed="' + (p.text === "lg") + '">' + esc(t("a11y.large")) + "</button>" +
      '<button type="button" data-text="xl" aria-pressed="' + (p.text === "xl") + '">' + esc(t("a11y.xlarge")) + "</button>" +
      "</div></div></div>" +
      '<div class="a11y-row"><span><strong>' + esc(t("a11y.contrast")) + "</strong></span>" +
      '<label class="switch"><input type="checkbox" id="a11yContrast"' + (p.contrast === "high" ? " checked" : "") + '><span class="track"></span></label></div>' +
      '<div class="a11y-row"><span><strong>' + esc(t("a11y.theme")) + "</strong></span>" +
      '<label class="switch"><input type="checkbox" id="a11yNight"' + (p.theme === "dark" ? " checked" : "") + '><span class="track"></span></label></div>' +
      '<button class="btn btn-secondary btn-block" type="button" data-act="reset">' + icon("refresh") + esc(t("a11y.reset")) + "</button>" +
      "</div></div>";
    dlg.querySelector('[data-act="close"]').addEventListener("click", function () { dlg.close(); });
    dlg.querySelectorAll("[data-text]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        saveA11y({ text: btn.getAttribute("data-text") });
        dlg.querySelectorAll("[data-text]").forEach(function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      });
    });
    dlg.querySelector("#a11yContrast").addEventListener("change", function (e) {
      saveA11y({ contrast: e.target.checked ? "high" : "normal" });
    });
    dlg.querySelector("#a11yNight").addEventListener("change", function (e) {
      saveA11y({ theme: e.target.checked ? "dark" : "light" });
    });
    dlg.querySelector('[data-act="reset"]').addEventListener("click", function () {
      saveA11y({ text: "md", contrast: "normal", theme: "light" });
      dlg.close();
      toast("Display reset to default");
    });
    dlg.showModal();
  }

  /* ---------- consent bar ---------- */
  function maybeShowConsent() {
    const page = currentPage();
    if (["dashboard", "preventive", "menstrual", "mental"].indexOf(page) === -1) return;
    const profile = Store.profile();
    if (profile.consent.store !== null) return;
    if (sessionStorage.getItem("jivika.consentDismissed") === "1") return;

    const bar = document.createElement("div");
    bar.className = "consent-bar";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Data consent");
    bar.innerHTML =
      '<div class="icon-badge sm">' + icon("lock") + "</div>" +
      "<div class=\"consent-body\"><strong>Save my health data on this device?</strong>" +
      '<p class="small">Your cycle, moods and notes stay in this browser. Nothing is uploaded. You can delete everything anytime from Profile.</p></div>' +
      '<div class="consent-actions">' +
      '<button class="btn btn-secondary btn-sm" type="button" data-act="no">Only this visit</button>' +
      '<button class="btn btn-primary btn-sm" type="button" data-act="yes">Yes, save it</button>' +
      "</div>";
    document.body.appendChild(bar);
    bar.querySelector('[data-act="yes"]').addEventListener("click", function () {
      Store.saveProfile({ consent: { store: true } });
      Store.set("cycle", Cycle.settings());
      bar.remove();
      toast("Health data will be saved on this device");
    });
    bar.querySelector('[data-act="no"]').addEventListener("click", function () {
      Store.saveProfile({ consent: { store: false } });
      sessionStorage.setItem("jivika.consentDismissed", "1");
      bar.remove();
      toast("Data will be kept only for this visit");
    });
  }

  /* ---------- language note ---------- */
  function renderLangNote() {
    const host = document.getElementById("langNote");
    if (!host) return;
    if (JV.i18n.get() === "en") { host.innerHTML = ""; return; }
    host.innerHTML = '<div class="callout info">' + icon("info") +
      "<p>" + esc(JV.i18n.t("banner.english")) + "</p></div>";
  }

  /* ---------- cycle maths ---------- */
  const Cycle = {
    settings: function () {
      const s = Store.get("cycle", null) || {};
      const today = startOfDay(new Date());
      let lastStart = s.lastStart;
      if (!lastStart) lastStart = toISO(addDays(today, -12));
      return {
        lastStart: lastStart,
        cycleLength: clamp(Number(s.cycleLength) || 28, 18, 60),
        periodLength: clamp(Number(s.periodLength) || 5, 1, 12),
        reminders: s.reminders !== false,
        reminderDays: clamp(Number(s.reminderDays) || 2, 1, 7),
        logs: Array.isArray(s.logs) ? s.logs : [],
        days: Array.isArray(s.days) ? s.days : []
      };
    },
    saveSettings: function (patch) {
      const next = Object.assign(Cycle.settings(), patch);
      Store.set("cycle", next);
      return next;
    },
    predict: function (settings) {
      const s = settings || Cycle.settings();
      const today = startOfDay(new Date());
      const start = parseISO(s.lastStart);
      const len = s.cycleLength;
      let daysSince = daysBetween(start, today);
      if (daysSince < 0) daysSince = 0;
      const cyclesPassed = Math.floor(daysSince / len);
      const currentStart = addDays(start, cyclesPassed * len);
      const cycleDay = clamp(daysBetween(currentStart, today) + 1, 1, len);
      let nextStart = addDays(currentStart, len);
      if (daysBetween(today, nextStart) < 0) nextStart = addDays(nextStart, len);
      const daysUntil = daysBetween(today, nextStart);
      const ovulation = addDays(nextStart, -14);
      const fertileStart = addDays(ovulation, -5);
      const fertileEnd = addDays(ovulation, 1);
      let phase = "Follicular";
      if (cycleDay <= s.periodLength) phase = "Menstrual";
      else if (cycleDay >= len - 15 && cycleDay <= len - 12) phase = "Ovulation";
      else if (cycleDay > len - 12) phase = "Luteal";
      else phase = "Follicular";
      const upcoming = [1, 2, 3].map(function (i) {
        const st = addDays(nextStart, (i - 1) * len);
        return { start: st, end: addDays(st, s.periodLength - 1) };
      });
      const starts = s.logs.map(function (l) { return l.start; }).filter(Boolean)
        .map(parseISO).sort(function (a, b) { return a - b; });
      let irregular = false;
      if (starts.length >= 3) {
        const diffs = [];
        for (let i = 1; i < starts.length; i++) diffs.push(daysBetween(starts[i - 1], starts[i]));
        const avg = diffs.reduce(function (a, b) { return a + b; }, 0) / diffs.length;
        irregular = diffs.some(function (d) { return Math.abs(d - avg) > 7; });
      }
      return {
        settings: s, nextStart: nextStart, daysUntil: daysUntil, cycleDay: cycleDay,
        cycleLength: len, phase: phase, ovulation: ovulation,
        fertileStart: fertileStart, fertileEnd: fertileEnd,
        currentStart: currentStart, upcoming: upcoming, irregular: irregular
      };
    },
    inPeriod: function (date, p) {
      const d = startOfDay(date);
      const logs = p.settings.logs;
      for (let i = 0; i < logs.length; i++) {
        const l = logs[i];
        if (!l.start) continue;
        const st = parseISO(l.start);
        const en = addDays(st, (Number(l.periodLength) || p.settings.periodLength) - 1);
        if (d >= st && d <= en) return true;
      }
      const st = parseISO(p.settings.lastStart);
      const en = addDays(st, p.settings.periodLength - 1);
      if (d >= st && d <= en) return true;
      return false;
    }
  };

  /* ---------- download ---------- */
  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- boot ---------- */
  function boot() {
    applyA11y(Store.profile().a11y);
    renderHeader();
    renderFooter();
    renderTabbar();
    renderLangNote();
    JV.i18n.apply(document);
    maybeShowConsent();

    const profile = Store.profile();
    const today = toISO(new Date());
    if (profile.lastVisit !== today) Store.saveProfile({ lastVisit: today });

    document.addEventListener("jivika:lang", function () {
      refreshHeaderLabels();
      renderFooter();
      renderTabbar();
      renderLangNote();
      JV.i18n.apply(document);
    });
  }

  Object.assign(JV, {
    Store: Store, Cycle: Cycle, toast: toast, confirm: confirmDialog, download: download,
    $: $, $$: $$, esc: esc, uid: uid, clamp: clamp, plural: plural,
    parseISO: parseISO, toISO: toISO, addDays: addDays, daysBetween: daysBetween,
    startOfDay: startOfDay, fmtDate: fmtDate, fmtMonth: fmtMonth, weekdayShort: weekdayShort,
    locale: locale, NAV: NAV, applyA11y: applyA11y, saveA11y: saveA11y, openA11y: openA11y,
    openDialog: ensureDialog, toggleTheme: toggleTheme
  });
  window.JV = JV;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
