/* ==========================================================================
   Home page
   ========================================================================== */
(function () {
  "use strict";

  function dayIndex() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function tipFor(lang) {
    const tip = JV.content.TIPS[dayIndex() % JV.content.TIPS.length];
    if (lang === "hi" && tip.hi) return tip.hi;
    if (lang === "kn" && tip.kn) return tip.kn;
    return tip.en;
  }

  function renderHero() {
    const host = document.getElementById("heroVisual");
    if (!host) return;
    const p = JV.Cycle.predict();
    const pct = p.cycleDay / p.cycleLength;
    const todayMood = (JV.Store.get("moods", []) || []).slice(-1)[0];
    const moodVal = todayMood ? todayMood.mood : 4;

    const faces = JV.content.MOODS.map(function (m) {
      return '<span class="' + (m.id === moodVal ? "on" : "") + '">' + JV.icon(m.icon) + "</span>";
    }).join("");

    host.innerHTML =
      '<div class="hero-blob"></div>' +
      '<div class="float-card fc-cycle">' +
      '<div class="fc-title">' + JV.icon("droplet") + " Cycle today</div>" +
      '<div class="ring-row">' +
      '<div class="ring-mini">' + JV.ui.ring(pct, { size: 84, stroke: 9 }) +
      '<div class="ring-center"><span class="big">' + p.cycleDay + "</span></div></div>" +
      '<div><div class="ring-num">' + p.daysUntil + "<small>days to period</small></div>" +
      '<span class="phase-badge phase-' + p.phase.toLowerCase() + '" style="margin-top:.4rem">' + p.phase + "</span></div>" +
      "</div></div>" +
      '<div class="float-card fc-mood">' +
      '<div class="fc-title">' + JV.icon("sparkle") + " Mood check-in</div>" +
      '<div class="mood-mini">' + faces + "</div>" +
      '<p class="tiny muted" style="margin:.5rem 0 0">Two taps a day is enough</p></div>' +
      '<div class="float-card fc-tip">' +
      '<span class="mini-label">Today&rsquo;s health tip</span>' +
      "<p>" + JV.esc(tipFor(JV.i18n.get())) + "</p></div>";
  }

  function renderLangGrid() {
    const host = document.getElementById("langGrid");
    if (!host) return;
    host.innerHTML = JV.i18n.langs.map(function (l) {
      return '<button type="button" class="lang-card" data-lang="' + l.code + '" aria-pressed="' +
        (JV.i18n.get() === l.code) + '"><span class="glyph" aria-hidden="true">' + l.glyph +
        '</span><span class="name">' + l.label + "</span></button>";
    }).join("");
    host.querySelectorAll("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        JV.i18n.set(btn.getAttribute("data-lang"));
        JV.toast("Language: " + btn.querySelector(".name").textContent);
        renderLangGrid();
      });
    });
  }

  function renderRemedies() {
    const host = document.getElementById("remedyPreview");
    if (!host) return;
    const ids = ["cramps", "burn", "stress"];
    host.innerHTML = ids.map(function (id) {
      const r = JV.content.REMEDIES.filter(function (x) { return x.id === id; })[0];
      return r ? JV.ui.remedyCard(r) : "";
    }).join("");
  }

  function init() {
    renderHero();
    renderLangGrid();
    renderRemedies();
    document.addEventListener("jivika:lang", function () {
      renderHero();
      renderLangGrid();
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
