/* ==========================================================================
   Physical health — condition browser, home remedies, first aid, emergency
   ========================================================================== */
(function () {
  "use strict";

  const C = JV.content;
  const W = JV.wellbeing;
  const icon = JV.icon;
  const esc = JV.esc;
  const ALL = "__all";

  function unique(list) {
    return list.filter(function (v, i) { return list.indexOf(v) === i; });
  }

  /* ---------- filter chips ---------- */
  function makeChips(hostId, values, allLabel, onPick) {
    const host = document.getElementById(hostId);
    if (!host) return;
    const items = [{ value: ALL, label: allLabel }].concat(
      values.map(function (v) { return { value: v, label: v }; })
    );

    host.innerHTML = items.map(function (it) {
      return '<button class="chip" type="button" data-filter="' + esc(it.value) + '" aria-pressed="' +
        (it.value === ALL) + '">' + esc(it.label) + "</button>";
    }).join("");

    host.addEventListener("click", function (e) {
      const btn = e.target.closest("button[data-filter]");
      if (!btn) return;
      host.querySelectorAll("button[data-filter]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      onPick(btn.getAttribute("data-filter"));
    });
  }

  /* ---------- conditions ---------- */
  function renderConditions(filter) {
    const grid = document.getElementById("condGrid");
    if (!grid) return;
    const list = C.CONDITIONS.filter(function (c) {
      return filter === ALL || c.category === filter;
    });
    grid.innerHTML = list.map(function (c) { return JV.ui.conditionCard(c); }).join("");
    const count = document.getElementById("condCount");
    if (count) count.textContent = list.length + " of " + C.CONDITIONS.length + " topics";
  }

  /* ---------- home remedies ---------- */
  function renderRemedies(filter) {
    const grid = document.getElementById("remedyGrid");
    if (!grid) return;
    const list = C.REMEDIES.filter(function (r) {
      return filter === ALL || r.tag === filter;
    });
    grid.innerHTML = list.map(function (r) { return JV.ui.remedyCard(r); }).join("");
  }

  /* ---------- first aid ---------- */
  function renderFirstAid() {
    const grid = document.getElementById("firstaidGrid");
    if (!grid) return;
    grid.innerHTML = C.FIRSTAID.map(function (f) { return JV.ui.firstAidCard(f); }).join("");
  }

  /* ---------- care levels ---------- */
  function renderCareLevels() {
    const host = document.getElementById("careLevels");
    if (!host) return;
    const tones = { home: "teal", hospital: "lav", stethoscope: "amber", alert: "danger" };
    host.innerHTML = W.CARE_LEVELS.map(function (l, i) {
      return '<article class="card card-pad care-level">' +
        '<div class="row-between" style="margin-bottom:.75rem">' +
        '<div class="icon-badge ' + (tones[l.icon] || "") + '">' + icon(l.icon) + "</div>" +
        '<span class="care-num">' + (i + 1) + "</span></div>" +
        "<h4 style=\"margin:0 0 .35rem\">" + esc(l.level) + "</h4>" +
        '<p class="small" style="margin:0 0 .6rem">' + esc(l.when) + "</p>" +
        '<p class="tiny muted" style="margin:0;padding-top:.6rem;border-top:1px dashed var(--line)">' +
        esc(l.where) + "</p></article>";
    }).join("");
  }

  /* ---------- helplines ---------- */
  function renderHelplines() {
    const host = document.getElementById("helplineGrid");
    if (!host) return;
    const wanted = ["108", "112", "104", "181", "14416"];
    host.innerHTML = C.HELPLINES
      .filter(function (h) { return wanted.indexOf(h.number) > -1; })
      .map(function (h) { return JV.ui.helplineCard(h); })
      .join("");
  }

  /* ---------- safe medicine rules ---------- */
  function renderMedicineSafety() {
    const host = document.getElementById("medSafety");
    if (!host) return;
    host.innerHTML = W.MEDICINE_SAFETY.slice(0, 4).map(function (t) {
      return "<li>" + esc(t) + "</li>";
    }).join("");
  }

  function init() {
    const condCats = unique(C.CONDITIONS.map(function (c) { return c.category; }));
    const remedyTags = unique(C.REMEDIES.map(function (r) { return r.tag; }));

    makeChips("condFilters", condCats, "All areas", renderConditions);
    makeChips("remedyFilters", remedyTags, "All remedies", renderRemedies);

    renderConditions(ALL);
    renderRemedies(ALL);
    renderFirstAid();
    renderCareLevels();
    renderHelplines();
    renderMedicineSafety();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
