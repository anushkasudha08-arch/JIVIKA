/* ==========================================================================
   Government schemes — filters, applied tracker and application checklist
   ========================================================================== */
(function () {
  "use strict";

  const W = JV.wellbeing;
  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;

  const LEVELS = [
    { id: "all", label: "All schemes" },
    { id: "Central", label: "Central government" },
    { id: "State", label: "State example" }
  ];

  const CHECKLIST = [
    { id: "ask", label: "Ask your ASHA or Anganwadi worker which schemes you qualify for." },
    { id: "papers", label: "Keep Aadhaar, ration card and bank passbook copies together." },
    { id: "mcp", label: "If pregnant, get the MCP card and register at the Anganwadi centre." },
    { id: "form", label: "Collect the form free of cost from the Anganwadi, CSC or hospital help desk." },
    { id: "submit", label: "Submit it and photograph the stamped form or receipt." },
    { id: "number", label: "Write down the application number, date and the officer's name." },
    { id: "follow", label: "Follow up after two weeks and check that the bank account is Aadhaar-linked." }
  ];

  let level = "all";
  let cat = "all";
  let query = "";
  let applied = [];

  const $ = function (id) { return document.getElementById(id); };

  function categories() {
    const seen = [];
    W.SCHEMES.forEach(function (s) {
      if (s.category !== "State example" && seen.indexOf(s.category) === -1) seen.push(s.category);
    });
    return [{ id: "all", label: "Everything" }].concat(seen.map(function (c) {
      return { id: c, label: c };
    }));
  }

  function appliedList() {
    const list = Store.get("schemes", []);
    return Array.isArray(list) ? list : [];
  }

  /* ---------- filters ---------- */
  function makeChips(hostId, items, current, attr, onPick) {
    const host = $(hostId);
    if (!host) return;
    host.innerHTML = items.map(function (t) {
      return '<button class="chip" type="button" ' + attr + '="' + esc(t.id) + '" aria-pressed="' +
        (t.id === current) + '">' + esc(t.label) + "</button>";
    }).join("");
    host.querySelectorAll("[" + attr + "]").forEach(function (b) {
      b.addEventListener("click", function () {
        host.querySelectorAll("[" + attr + "]").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        onPick(b.getAttribute(attr));
      });
    });
  }

  /* ---------- scheme grid ---------- */
  function visibleSchemes() {
    const q = query.toLowerCase();
    return W.SCHEMES.filter(function (s) {
      if (level !== "all" && s.level !== level) return false;
      if (cat !== "all" && s.category !== cat) return false;
      if (!q) return true;
      return (s.name + " " + s.category + " " + s.benefit + " " + s.who + " " + s.how).toLowerCase().indexOf(q) !== -1;
    });
  }

  function renderGrid() {
    const grid = $("schemeGrid");
    const count = $("schemeCount");
    if (!grid) return;
    const rows = visibleSchemes();

    if (count) {
      count.textContent = rows.length
        ? "Showing " + rows.length + " of " + W.SCHEMES.length + " schemes"
        : "No scheme matches these filters";
    }

    if (!rows.length) {
      grid.innerHTML = JV.ui.emptyState("search", "No scheme matches",
        "Try a different word, choose “All schemes”, or ask your ASHA worker about district programmes.");
      return;
    }
    grid.innerHTML = rows.map(function (s) {
      return JV.ui.schemeCard(s, applied.indexOf(s.id) !== -1);
    }).join("");
  }

  /* ---------- checklist ---------- */
  function savedChecklist() {
    const list = Store.get("checklist", []);
    return Array.isArray(list) ? list.filter(function (x) { return typeof x === "string"; }) : [];
  }

  function renderChecklist() {
    const host = $("checklistCard");
    if (!host) return;
    const done = savedChecklist();
    const pct = Math.round(done.length / CHECKLIST.length * 100);

    host.innerHTML =
      '<div class="card-head">' +
        '<div class="icon-badge"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.6"/><path d="m8.4 12.2 2.6 2.6 4.6-5"/></svg></div>' +
        "<div style=\"flex:1\"><h3 style=\"margin:0\">Before you apply</h3><p>" + done.length + " of " +
          CHECKLIST.length + " steps done</p></div>" +
        '<span class="badge teal">' + pct + "%</span></div>" +
      '<div class="progress teal" style="margin-bottom:1rem"><span style="width:' + pct + '%"></span></div>' +
      '<div class="checklist">' +
        CHECKLIST.map(function (item) {
          const on = done.indexOf(item.id) !== -1;
          return '<label class="checklist-item"><input type="checkbox" data-step="' + item.id + '"' +
            (on ? " checked" : "") + "><span>" + esc(item.label) + "</span></label>";
        }).join("") +
      "</div>" +
      '<div class="row-between" style="margin-top:1rem">' +
        '<p class="tiny muted" style="margin:0">Saved on this device only. Private browsing keeps it for this visit.</p>' +
        '<button class="btn btn-ghost btn-sm" type="button" data-reset-checklist>' + icon("refresh") + "Clear</button>" +
      "</div>";

    host.querySelectorAll("[data-step]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        const id = cb.getAttribute("data-step");
        let list = savedChecklist().filter(function (x) { return x !== id; });
        if (cb.checked) list.push(id);
        const stored = Store.set("checklist", list);
        renderChecklist();
        if (cb.checked && !stored) JV.toast("Kept for this visit only");
      });
    });

    const reset = host.querySelector("[data-reset-checklist]");
    if (reset) {
      reset.addEventListener("click", function () {
        Store.set("checklist", []);
        renderChecklist();
        JV.toast("Checklist cleared");
      });
    }
  }

  /* ---------- init ---------- */
  function init() {
    applied = appliedList();

    makeChips("levelChips", LEVELS, level, "data-level", function (v) {
      level = v;
      renderGrid();
    });
    makeChips("catChips", categories(), cat, "data-cat", function (v) {
      cat = v;
      renderGrid();
    });

    const search = $("schemeSearch");
    if (search) {
      let t = null;
      search.addEventListener("input", function () {
        clearTimeout(t);
        const v = search.value;
        t = setTimeout(function () {
          query = v.trim();
          renderGrid();
        }, 180);
      });
    }

    const grid = $("schemeGrid");
    if (grid) {
      grid.addEventListener("change", function (e) {
        const cb = e.target.closest ? e.target.closest("[data-scheme]") : null;
        if (!cb) return;
        const id = cb.getAttribute("data-scheme");
        applied = applied.filter(function (x) { return x !== id; });
        if (cb.checked) applied.push(id);
        const stored = Store.set("schemes", applied);
        JV.toast(cb.checked
          ? (stored ? "Marked as applied" : "Marked for this visit only")
          : "Removed from your list");
      });
    }

    renderGrid();
    renderChecklist();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
