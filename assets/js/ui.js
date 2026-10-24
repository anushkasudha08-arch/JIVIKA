/* ==========================================================================
   JIVIKA AROGYA — shared render helpers
   ========================================================================== */
(function () {
  "use strict";
  const JV = window.JV;
  const icon = JV.icon;
  const esc = JV.esc;
  let ringSeq = 0;

  function ring(pct, opts) {
    const o = Object.assign({ size: 190, stroke: 12 }, opts || {});
    const id = "rg" + (++ringSeq);
    const r = 50;
    const circ = 2 * Math.PI * r;
    const offset = circ * (1 - Math.max(0, Math.min(1, pct)));
    return '<svg viewBox="0 0 120 120" width="' + o.size + '" height="' + o.size + '" role="img" aria-label="' +
      Math.round(pct * 100) + '% of cycle">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="#f7a7be"/><stop offset=".5" stop-color="#e0749c"/><stop offset="1" stop-color="#a98be6"/>' +
      "</linearGradient></defs>" +
      '<circle class="ring-track" cx="60" cy="60" r="50" stroke-width="' + o.stroke + '"/>' +
      '<circle class="ring-fill" cx="60" cy="60" r="50" stroke="url(#' + id + ')" stroke-width="' + o.stroke +
      '" stroke-dasharray="' + circ.toFixed(1) + '" stroke-dashoffset="' + offset.toFixed(1) + '"/>' +
      "</svg>";
  }

  function remedyCard(r, opts) {
    const o = opts || {};
    return '<article class="card card-pad remedy-card card-hover" data-remedy="' + esc(r.id) + '">' +
      '<div class="remedy-head"><div class="icon-badge">' + icon(r.icon) + "</div>" +
      '<div style="min-width:0"><h3>' + esc(r.concern) + "</h3>" +
      '<span class="tag">' + esc(r.tag) + "</span></div></div>" +
      '<div class="remedy-block"><span class="rk">Home care</span><p class="rv">' + esc(r.care) + "</p></div>" +
      '<div class="remedy-block"><span class="rk">How it helps</span><p class="rv">' + esc(r.help) + "</p></div>" +
      '<div class="remedy-block safety"><span class="rk">Safety</span><p class="rv">' + esc(r.safety) + "</p></div>" +
      '<div class="remedy-block doctor"><span class="rk">See a doctor</span><p class="rv">' + esc(r.doctor) + "</p></div>" +
      (o.link ? '<a class="btn btn-secondary btn-sm" href="' + o.link + '">' + icon("stethoscope") + "Find care</a>" : "") +
      "</article>";
  }

  function conditionCard(c) {
    return '<article class="card card-pad condensable card-hover" data-cat="' + esc(c.category) + '">' +
      '<div class="card-head"><div class="icon-badge lav">' + icon(c.icon) + "</div>" +
      '<div style="min-width:0"><h3>' + esc(c.title) + "</h3>" +
      '<span class="tag">' + esc(c.category) + "</span></div></div>" +
      '<p class="cond-symptoms">' + esc(c.summary) + "</p>" +
      '<details class="acc" style="margin-top:.35rem"><summary>Common signs' + icon("chevron-down") + "</summary>" +
      '<div class="acc-body"><ul>' + c.symptoms.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div></details>" +
      '<details class="acc"><summary style="color:var(--danger-ink)">Warning signs' + icon("chevron-down") + "</summary>" +
      '<div class="acc-body"><ul>' + c.warning.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul></div></details>" +
      '<div class="callout info" style="margin-top:.6rem">' + icon("stethoscope") +
      "<p><strong>When to get help:</strong> " + esc(c.when) + "</p></div>" +
      '<p class="small muted" style="margin-top:.6rem">' + icon("leaf") + " " + esc(c.tip) + "</p>" +
      "</article>";
  }

  function firstAidCard(f) {
    const donts = f.donts.map(function (s) { return s.replace(/^Do not\s+/i, ""); });
    return '<article class="card card-pad" data-aid="' + esc(f.id) + '">' +
      '<div class="card-head"><div class="icon-badge danger">' + icon(f.icon) + "</div>" +
      "<div><h3 style=\"margin:0\">" + esc(f.title) + "</h3></div></div>" +
      '<ol class="stack-sm" style="padding-left:1.1rem;margin-bottom:.75rem">' +
      f.steps.map(function (s) { return '<li style="font-size:.86rem">' + esc(s) + "</li>"; }).join("") + "</ol>" +
      '<div class="callout warn">' + icon("alert") + "<p><strong>Do not:</strong> " +
      esc(donts.join(" — also do not ")) + "</p></div>" +
      '<div class="callout danger" style="margin-top:.6rem">' + icon("phone") + "<p>" + esc(f.call) + "</p></div>" +
      "</article>";
  }

  function helplineCard(h) {
    return '<a class="helpline-card" href="tel:' + esc(h.number) + '">' +
      '<div class="icon-badge ' + (h.tone === "danger" ? "danger" : h.tone === "teal" ? "teal" : h.tone === "lav" ? "lav" : "") + ' sm">' + icon("phone") + "</div>" +
      '<div style="flex:1;min-width:0"><div class="num">' + esc(h.number) + "</div>" +
      "<h5>" + esc(h.label) + "</h5><p>" + esc(h.note) + "</p></div>" +
      '<span class="badge teal">Call</span></a>';
  }

  function schemeCard(s, saved) {
    const sub = s.category === "State example" ? "State government scheme" : s.level + " · " + s.category;
    return '<article class="card card-pad scheme-card" data-level="' + esc(s.level) + '" data-cat="' + esc(s.category) + '">' +
      '<div class="scheme-top"><div class="icon-badge ' + (s.level === "State" ? "lav" : "teal") + '">' + icon("shield-check") + "</div>" +
      '<div style="min-width:0"><h3>' + esc(s.name) + "</h3>" +
      '<span class="s-sub">' + esc(sub) + "</span></div></div>" +
      '<div class="scheme-detail"><dl style="margin:0">' +
      "<dt>What you get</dt><dd>" + esc(s.benefit) + "</dd>" +
      "<dt>Who can apply</dt><dd>" + esc(s.who) + "</dd>" +
      "<dt>Documents</dt><dd>" + esc(s.docs.join(" · ")) + "</dd>" +
      "<dt>How to apply</dt><dd>" + esc(s.how) + "</dd></dl></div>" +
      '<div class="scheme-foot">' +
      '<label class="scheme-check"><input type="checkbox" data-scheme="' + esc(s.id) + '"' + (saved ? " checked" : "") + "> I have applied</label>" +
      '<a class="btn btn-secondary btn-sm" href="' + esc(s.link) + '" target="_blank" rel="noopener noreferrer">' +
      icon("external") + "Official site</a></div></article>";
  }

  function emptyState(iconName, title, text) {
    return '<div class="empty-state"><div class="icon-badge lav">' + icon(iconName) + "</div><h4>" + esc(title) +
      "</h4><p>" + esc(text) + "</p></div>";
  }

  function disclaimer(text) {
    return '<div class="callout">' + icon("info") + "<p><strong>Please note:</strong> " + esc(text) + "</p></div>";
  }

  window.JV.ui = {
    ring: ring, remedyCard: remedyCard, conditionCard: conditionCard,
    firstAidCard: firstAidCard, helplineCard: helplineCard, schemeCard: schemeCard,
    emptyState: emptyState, disclaimer: disclaimer
  };
})();
