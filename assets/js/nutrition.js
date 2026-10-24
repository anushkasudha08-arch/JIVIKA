/* ==========================================================================
   Nutrition — life-stage meal planner, nutrients and affordable foods
   ========================================================================== */
(function () {
  "use strict";

  const W = JV.wellbeing;
  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;

  const STAGE_ICON = { teen: "baby", adult: "user", pregnancy: "heart", postpartum: "baby", menopause: "moon" };
  const STAGE_TONE = { teen: "lav", adult: "pink", pregnancy: "pink", postpartum: "teal", menopause: "amber" };
  const NUTRIENT_ICON = ["droplet", "shield", "heart-pulse", "sparkle", "leaf", "sun", "bowl", "utensils"];

  let stageId = "adult";
  let mode = "veg";

  function savedPlan() {
    const s = Store.get("nutrition", null);
    return s && typeof s === "object" ? s : {};
  }
  function savePlan() {
    Store.set("nutrition", { stage: stageId, mode: mode });
  }
  function currentStage() {
    return W.STAGES.filter(function (s) { return s.id === stageId; })[0] || W.STAGES[1];
  }

  /* ---------- life-stage meal planner ---------- */
  function renderStage() {
    const host = document.getElementById("stageCard");
    if (!host) return;
    const s = currentStage();

    const chips = W.STAGES.map(function (x) {
      return '<button class="chip" type="button" data-stage="' + x.id + '" aria-pressed="' + (x.id === s.id) + '">' +
        icon(STAGE_ICON[x.id] || "user") + esc(x.label) + "</button>";
    }).join("");

    const meals = s.meals.map(function (m) {
      return '<div class="meal-row">' +
        '<div class="meal-name">' + esc(m.slot) + "</div>" +
        "<div>" +
          '<p class="meal-items">' + esc(mode === "veg" ? m.veg : m.nonveg) + "</p>" +
          '<p class="meal-why">' + esc(m.why) + "</p>" +
        "</div></div>";
    }).join("");

    host.innerHTML =
      '<div class="card-head">' +
        '<div class="icon-badge ' + (STAGE_TONE[s.id] || "") + '">' + icon(STAGE_ICON[s.id] || "user") + "</div>" +
        '<div><h3 style="margin:0">Meal plan for your life stage</h3>' +
        "<p>Pick the stage closest to you — you can change it any time</p></div>" +
      "</div>" +
      '<div class="chip-row" style="margin-bottom:1rem">' + chips + "</div>" +
      '<div class="callout info">' + icon("info") +
        "<p><strong>" + esc(s.label) + ".</strong> " + esc(s.focus) + "</p></div>" +
      '<p class="eyebrow" style="margin:1.2rem 0 .5rem">Key nutrients now</p>' +
      '<div class="food-tags">' + s.needs.map(function (n) {
        return '<span class="food-tag">' + esc(n) + "</span>";
      }).join("") + "</div>" +
      '<div class="row-between" style="margin:1.3rem 0 .1rem">' +
        '<span class="eyebrow" style="margin:0">A day of meals</span>' +
        '<div class="segmented" role="group" aria-label="Show vegetarian or egg and non-vegetarian meals">' +
          '<button type="button" data-mode="veg" aria-pressed="' + (mode === "veg") + '">Vegetarian</button>' +
          '<button type="button" data-mode="nonveg" aria-pressed="' + (mode === "nonveg") + '">Egg / non-veg</button>' +
        "</div>" +
      "</div>" + meals +
      '<div class="callout warn" style="margin-top:1rem">' + icon("alert") +
        "<p><strong>Take care:</strong> " + esc(s.avoid) + "</p></div>" +
      '<p class="tiny muted" style="margin:.85rem 0 0">These are general suggestions, not a prescription. ' +
        "In pregnancy, diabetes, kidney disease or any illness, follow the plan your doctor or dietitian gives you.</p>";

    host.querySelectorAll("[data-stage]").forEach(function (b) {
      b.addEventListener("click", function () {
        stageId = b.getAttribute("data-stage");
        savePlan();
        renderStage();
      });
    });
    host.querySelectorAll("[data-mode]").forEach(function (b) {
      b.addEventListener("click", function () {
        mode = b.getAttribute("data-mode");
        savePlan();
        renderStage();
      });
    });
  }

  /* ---------- food preference ---------- */
  function renderPrefs() {
    const host = document.getElementById("prefChips");
    if (!host) return;
    const note = document.getElementById("prefNote");
    const current = Store.profile().diet || "";

    function showNote(id) {
      const d = W.DIET_PREFS.filter(function (x) { return x.id === id; })[0];
      if (note) {
        note.textContent = d ? d.note
          : "Choose a preference to see what to add to your plate. All four can be healthy — you can change this any time.";
      }
    }

    host.innerHTML = W.DIET_PREFS.map(function (d) {
      return '<button class="chip" type="button" data-pref="' + d.id + '" aria-pressed="' + (d.id === current) + '">' +
        esc(d.label) + "</button>";
    }).join("");
    showNote(current);

    host.querySelectorAll("[data-pref]").forEach(function (b) {
      b.addEventListener("click", function () {
        const id = b.getAttribute("data-pref");
        host.querySelectorAll("[data-pref]").forEach(function (x) {
          x.setAttribute("aria-pressed", String(x === b));
        });
        Store.saveProfile({ diet: id });
        showNote(id);
        mode = id === "veg" || id === "vegan" ? "veg" : "nonveg";
        savePlan();
        renderStage();
        JV.toast("Food preference saved");
      });
    });
  }

  /* ---------- nutrients ---------- */
  function renderNutrients() {
    const host = document.getElementById("nutrientGrid");
    if (!host) return;
    host.innerHTML = W.NUTRIENTS.map(function (n, i) {
      return '<article class="card card-pad nutrient-card">' +
        '<div class="n-head"><h4>' + esc(n.name) + "</h4>" +
          '<span class="icon-badge teal sm">' + icon(NUTRIENT_ICON[i] || "leaf") + "</span></div>" +
        '<p class="tiny" style="font-weight:800;color:var(--pink-ink)">' + esc(n.amount) + "</p>" +
        '<p class="small">' + esc(n.why) + "</p>" +
        '<div class="food-tags">' + n.foods.map(function (f) {
          return '<span class="food-tag">' + esc(f) + "</span>";
        }).join("") + "</div>" +
        '<p class="tiny muted" style="margin-top:.45rem"><strong>Tip:</strong> ' + esc(n.tip) + "</p>" +
        "</article>";
    }).join("");
  }

  /* ---------- affordable foods ---------- */
  function renderBudget() {
    const host = document.getElementById("budgetGrid");
    if (!host) return;
    host.innerHTML = W.AFFORDABLE_FOODS.map(function (f) {
      return '<article class="card card-pad budget-card">' +
        '<div class="b-head"><h4>' + esc(f.name) + "</h4>" +
          '<span class="distance-pill">' + esc(f.cost) + "</span></div>" +
        '<p class="b-needs">' + esc(f.why) + "</p>" +
        '<p class="b-note">' + esc(f.note) + "</p>" +
        "</article>";
    }).join("");
  }

  /* ---------- init ---------- */
  function init() {
    const plan = savedPlan();
    const profile = Store.profile();
    const known = W.STAGES.filter(function (s) { return s.id === plan.stage; })[0];

    stageId = known ? plan.stage
      : (W.STAGES.filter(function (s) { return s.id === profile.lifeStage; })[0] ? profile.lifeStage : "adult");
    mode = plan.mode === "veg" || plan.mode === "nonveg" ? plan.mode
      : (profile.diet === "nonveg" || profile.diet === "egg" ? "nonveg" : "veg");

    renderStage();
    renderPrefs();
    renderNutrients();
    renderBudget();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
