/* ==========================================================================
   JIVIKA AROGYA — preventive healthcare page controller
   Uses JV.preventive for data, rules and storage. All persistence goes
   through JV.Store so the site-wide consent switch still applies.
   ========================================================================== */
(function () {
  "use strict";

  const P = JV.preventive;
  if (!P) return;
  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;
  const t = JV.i18n.t;

  const $ = function (id) { return document.getElementById(id); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  let data = P.load(Store);
  let answers = data.answers ? P.normalizeAnswers(data.answers) : P.defaultAnswers();
  let results = data.answers ? P.evaluate(answers) : null;
  let step = 0;
  let filter = "all";
  let editingReminder = null;
  const notified = {};

  /* ---------- small helpers ---------- */
  function tr(key, fallback) {
    const value = t(key);
    return value === key ? fallback : value;
  }
  function ageTitle(group) {
    return tr("pv.age." + (group.id === "60-plus" ? "60" : group.id), group.title);
  }
  function statusLabel(status) {
    return tr("pv.st." + status.id, status.label);
  }
  function statusTone(status) {
    return status.tone || "neutral";
  }
  function saveState() {
    const profile = Store.profile();
    if (profile.consent.store === false) {
      JV.toast(t("pv.storage"), "error");
      return false;
    }
    const res = P.save(Store, data);
    if (!res.ok) {
      JV.toast(t("pv.storage"), "error");
      return false;
    }
    data.savedAt = res.state.savedAt;
    renderSaveState();
    return true;
  }
  function persist() {
    if (!data.saveConsent) return false;
    return saveState();
  }
  function renderSaveState() {
    const badge = $("pvVisitBadge");
    if (!badge) return;
    const profile = Store.profile();
    if (profile.consent.store === false) {
      badge.className = "badge amber";
      badge.textContent = t("pv.sessionOnly");
    } else if (data.savedAt) {
      badge.className = "badge teal";
      badge.textContent = t("pv.saved");
    } else {
      badge.className = "badge neutral";
      badge.textContent = tr("pv.notSaved", "Not saved yet");
    }
  }
  function clinicalNote() {
    const note = $("pvClinicalNote");
    if (!note) return;
    note.hidden = JV.i18n.get() === "en";
    note.textContent = t("pv.clinicalEnglish");
  }
  function scrollTo(id) {
    const node = $(id);
    if (node) node.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  /* ---------- age cards ---------- */
  function renderAges() {
    const host = $("pvAgeGrid");
    if (!host) return;
    host.innerHTML = P.AGE_GROUPS.map(function (g) {
      return '<article class="pv-age-card">' +
        '<div class="pv-age-top"><span class="icon-badge">' + icon(g.icon) + "</span>" +
        "<div><h3>" + esc(ageTitle(g)) + "</h3>" +
        '<span class="pv-age-range">' + icon("calendar") + " " + esc(g.range) + "</span></div></div>" +
        "<p>" + esc(g.blurb) + "</p>" +
        '<button class="btn btn-secondary btn-sm" type="button" data-age-view="' + g.id + '">' +
        icon("arrow-right") + " " + esc(t("pv.view")) + "</button></article>";
    }).join("");
    $$("[data-age-view]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.getAttribute("data-age-view");
        renderFilter();
        renderLibrary();
        scrollTo("pvLibrary");
      });
    });
  }

  /* ---------- library ---------- */
  function renderFilter() {
    const host = $("pvAgeFilter");
    if (!host) return;
    const items = [{ id: "all", label: t("pv.all") }].concat(P.AGE_GROUPS.map(function (g) {
      return { id: g.id, label: ageTitle(g) };
    }));
    host.innerHTML = items.map(function (item) {
      return '<button class="chip" type="button" data-filter="' + item.id + '" aria-pressed="' +
        (item.id === filter) + '">' + esc(item.label) + "</button>";
    }).join("");
    $$("[data-filter]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        filter = btn.getAttribute("data-filter");
        renderFilter();
        renderLibrary();
      });
    });
  }

  function sourceLine(s) {
    return '<div class="pv-source"><span>' + esc(t("pv.source")) + ":</span>" +
      '<a href="' + esc(s.source.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(s.source.org + " — " + s.source.title) + "</a>" +
      '<time datetime="' + esc(s.source.year) + '">' + esc(s.source.year) + "</time>" +
      '<span class="pv-pending">' + icon("clock") + " " + esc(t("pv.pending")) + "</span></div>";
  }

  function detailRow(labelKey, value) {
    return "<div><dt>" + esc(t(labelKey)) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function renderLibrary() {
    const host = $("pvLibraryGrid");
    if (!host) return;
    let list = P.SCREENINGS;
    if (filter !== "all") {
      const group = P.AGE_GROUPS.filter(function (g) { return g.id === filter; })[0];
      list = group ? group.screeningIds.map(P.screeningById).filter(Boolean) : [];
    }
    if (!list.length) {
      host.innerHTML = JV.ui.emptyState("search", "No screenings in this group", "Choose another age group or all screenings.");
      return;
    }
    host.innerHTML = list.map(function (s) {
      return '<article class="pv-scr">' +
        '<div class="pv-scr-head"><span class="icon-badge lav sm">' + icon(s.icon) + "</span>" +
        "<div><h3>" + esc(s.name) + "</h3><p>" + esc(s.condition) + "</p></div></div>" +
        '<p class="pv-scr-condition"><strong>' + esc(t("pv.condition")) + ":</strong> " + esc(s.condition) + "</p>" +
        '<details><summary>' + esc(t("pv.why")) + icon("chevron-down") + "</summary>" +
        '<div class="pv-detail"><dl style="margin:0;display:grid;gap:.55rem">' +
        detailRow("pv.why", s.why) +
        detailRow("pv.who", s.who) +
        detailRow("pv.interval", s.interval) +
        detailRow("pv.risk", s.risk) +
        detailRow("pv.prep", s.prep) +
        detailRow("pv.consult", s.consult) +
        "</dl></div></details>" +
        sourceLine(s) +
        "</article>";
    }).join("");
  }

  /* ---------- questionnaire ---------- */
  function checkbox(id, label, checked, attr, danger) {
    return '<label class="pv-check' + (danger ? " danger" : "") + '">' +
      '<input type="checkbox" ' + attr + '="' + esc(id) + '"' + (checked ? " checked" : "") + ">" +
      "<span>" + esc(label) + "</span></label>";
  }

  function renderStep() {
    const host = $("pvStepHost");
    if (!host) return;
    let html = "";
    const age = answers.age;

    if (step === 0) {
      html = "<h3>" + esc(t("pv.qAge")) + "</h3>" +
        '<p class="help">Age changes which screening is relevant. It stays on this device and is never uploaded.</p>' +
        '<div class="pv-field-row">' +
        '<div class="field"><label for="pvAgeInput">Age (years)</label>' +
        '<input class="input" id="pvAgeInput" type="number" inputmode="numeric" min="10" max="100" step="1" placeholder="For example: 34" value="' +
        esc(answers.age === null ? "" : answers.age) + '"></div>' +
        '<div class="field"><label for="pvDobInput">' + esc(t("pv.qDob")) + "</label>" +
        '<input class="input" id="pvDobInput" type="date" value="' + esc(answers.dob || "") + '"></div></div>' +
        '<p class="help">' + esc(t("pv.ageError")) + "</p>";
    } else if (step === 1) {
      html = "<h3>" + esc(t("pv.qSymptoms")) + "</h3>" +
        '<p class="help">Tick what you have now. Symptoms need a clinical assessment, not a screening schedule. You can skip this question.</p>' +
        '<div class="pv-checks">' + P.SYMPTOMS.map(function (s) {
          return checkbox(s.id, s.label, answers.symptoms.indexOf(s.id) !== -1, "data-sym", s.severity === "urgent");
        }).join("") + "</div>" +
        '<h3 style="margin-top:1.3rem">' + esc(t("pv.qEmergency")) + "</h3>" +
        '<p class="help">If any of these apply, get help now — do not finish the questionnaire first.</p>' +
        '<div class="pv-checks">' + P.EMERGENCY_SIGNS.map(function (s) {
          return checkbox(s.id, s.label, answers.emergency.indexOf(s.id) !== -1, "data-emg", true);
        }).join("") + "</div>" +
        '<div class="callout danger" id="pvEmgInline" style="margin-top:.9rem"' + (answers.emergency.length ? "" : " hidden") + ">" +
        icon("phone") + "<p><strong>Call 108 or 112 now.</strong> Do not wait for this checklist or for a screening appointment.</p></div>";
    } else if (step === 2) {
      html = "<h3>" + esc(t("pv.qFamily")) + "</h3>" +
        '<p class="help">Optional. Family history can change when a screening is discussed, but it does not diagnose anything.</p>' +
        '<div class="pv-checks">' + P.FAMILY_HISTORY.map(function (s) {
          return checkbox(s.id, s.label, answers.family.indexOf(s.id) !== -1, "data-fam");
        }).join("") + "</div>";
    } else if (step === 3) {
      html = "<h3>" + esc(t("pv.qLife")) + "</h3>" +
        '<p class="help">These questions appear only when they are relevant. Skip anything that does not apply.</p>' +
        '<div class="pv-field-row">';
      if (age === null || (age >= 15 && age <= 50)) {
        html += '<div class="field"><label for="pvPregnancy">Pregnancy status</label>' +
          '<select class="select" id="pvPregnancy">' +
          [["no", "Not pregnant"], ["yes", "Pregnant"], ["postpartum", "Gave birth in the last 12 months"], ["planning", "Planning a pregnancy"], ["na", "Prefer not to say"]]
            .map(function (o) { return '<option value="' + o[0] + '"' + (answers.pregnancy === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
          "</select></div>";
      }
      if (age === null || age >= 40) {
        html += '<div class="field"><label for="pvMenopause">' + esc(t("pv.menopause")) + "</label>" +
          '<select class="select" id="pvMenopause">' +
          [["na", "Not applicable"], ["pre", "Periods still regular"], ["peri", "Periods changing (perimenopause)"], ["post", "Periods stopped for 12 months"], ["unsure", "Not sure"]]
            .map(function (o) { return '<option value="' + o[0] + '"' + (answers.menopause === o[0] ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") +
          "</select></div>";
      }
      html += "</div>";
      if (age !== null && age < 15) {
        html += '<p class="help">Pregnancy questions are hidden for this age group. A trusted adult or clinician can help with any concern.</p>';
      }
    } else if (step === 4) {
      html = "<h3>" + esc(t("pv.qRisks")) + "</h3>" +
        '<p class="help">Optional. Select anything that applies — these factors change what is worth discussing, not what is diagnosed.</p>' +
        '<div class="pv-checks">' + P.RISK_FACTORS.map(function (s) {
          return checkbox(s.id, s.label, answers.risks.indexOf(s.id) !== -1, "data-risk");
        }).join("") + "</div>";
    } else {
      html = "<h3>" + esc(t("pv.qPrevious")) + "</h3>" +
        '<p class="help">Enter a date if you remember it. Do not type test results here. Skipping this does not change the education you can read.</p>' +
        '<div class="pv-field-row">' + P.PREVIOUS_TESTS.map(function (p) {
          const entry = answers.previous[p.id] || {};
          return '<div class="field"><label for="pvPrev-' + p.id + '">' + esc(p.label) + "</label>" +
            '<input class="input" id="pvPrev-' + p.id + '" type="date" data-prev="' + p.id + '" value="' + esc(entry.date || "") + '"></div>';
        }).join("") + "</div>";
    }
    host.innerHTML = html;
    bindStep();
  }

  function collect(attr) {
    return $$("[" + attr + "]").filter(function (i) { return i.checked; }).map(function (i) {
      return i.getAttribute(attr);
    });
  }

  function bindStep() {
    const host = $("pvStepHost");
    if (!host) return;

    const ageInput = $("pvAgeInput");
    if (ageInput) {
      ageInput.addEventListener("input", function () {
        answers.age = ageInput.value === "" ? null : ageInput.value;
        answers.dob = "";
        const dob = $("pvDobInput");
        if (dob) dob.value = "";
      });
    }
    const dobInput = $("pvDobInput");
    if (dobInput) {
      dobInput.addEventListener("change", function () {
        answers.dob = dobInput.value;
        answers.age = null;
        if (dobInput.value) {
          const computed = P.ageFromDob(dobInput.value, new Date());
          if (computed !== null) answers.age = computed;
        }
      });
    }
    $$("[data-sym]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        answers.symptoms = collect("data-sym");
      });
    });
    $$("[data-emg]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        answers.emergency = collect("data-emg");
        const inline = $("pvEmgInline");
        if (inline) inline.hidden = answers.emergency.length === 0;
      });
    });
    $$("[data-fam]", host).forEach(function (input) {
      input.addEventListener("change", function () { answers.family = collect("data-fam"); });
    });
    $$("[data-risk]", host).forEach(function (input) {
      input.addEventListener("change", function () { answers.risks = collect("data-risk"); });
    });
    $$("[data-prev]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        const id = input.getAttribute("data-prev");
        answers.previous = answers.previous || {};
        answers.previous[id] = { date: input.value };
      });
    });
    const preg = $("pvPregnancy");
    if (preg) preg.addEventListener("change", function () { answers.pregnancy = preg.value; });
    const meno = $("pvMenopause");
    if (meno) meno.addEventListener("change", function () { answers.menopause = meno.value; });
  }

  function showError(message) {
    const box = $("pvError");
    if (!box) return;
    box.textContent = message;
    box.hidden = false;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
  }
  function clearError() {
    const box = $("pvError");
    if (box) { box.hidden = true; box.textContent = ""; }
  }

  function renderNav() {
    const host = $("pvWizardNav");
    if (!host) return;
    const back = step > 0
      ? '<button class="btn btn-secondary" type="button" id="pvBack">' + icon("arrow-left") + " " + esc(t("pv.back")) + "</button>"
      : "";
    const skip = '<button class="btn btn-ghost" type="button" id="pvSkip">' + esc(t("pv.skip")) + "</button>";
    const next = '<button class="btn btn-primary" type="button" id="pvNext">' +
      (step === 5 ? esc(t("pv.finish")) : esc(t("pv.next"))) + " " + icon("arrow-right") + "</button>";
    host.innerHTML = back + '<div class="pv-nav-right">' + skip + next + "</div>";

    const progress = $("pvProgressBar");
    const bar = document.querySelector(".pv-progress");
    if (progress) progress.style.width = Math.round(((step + 1) / 6) * 100) + "%";
    if (bar) {
      bar.setAttribute("aria-valuenow", String(step + 1));
      bar.setAttribute("aria-valuetext", (step + 1) + " of 6");
    }
    if ($("pvBack")) $("pvBack").addEventListener("click", function () { step = Math.max(0, step - 1); clearError(); renderStep(); renderNav(); });
    $("pvSkip").addEventListener("click", function () {
      if (step === 0) { answers.age = null; answers.dob = ""; }
      if (step === 5) { finishWizard(); return; }
      step += 1; clearError(); renderStep(); renderNav();
    });
    $("pvNext").addEventListener("click", function () {
      if (step === 5) { finishWizard(); return; }
      if (step === 0) {
        const ageVal = $("pvAgeInput") ? $("pvAgeInput").value : "";
        const dobVal = $("pvDobInput") ? $("pvDobInput").value : "";
        answers.age = ageVal === "" ? null : ageVal;
        answers.dob = dobVal;
        const check = P.validateAnswers(answers);
        if (!check.ok) { showError(check.errors.age || check.errors.dob); return; }
        answers = check.answers;
      }
      clearError();
      step += 1;
      renderStep();
      renderNav();
    });
  }

  function finishWizard() {
    const check = P.validateAnswers(answers);
    if (!check.ok) { showError(check.errors.age || check.errors.dob); return; }
    answers = check.answers;
    data.answers = answers;
    if (data.saveConsent) persist();
    results = P.evaluate(answers);
    const body = $("pvWizardBody");
    const panel = $("pvResults");
    if (body) body.hidden = true;
    if (panel) {
      panel.hidden = false;
      panel.innerHTML = '<div class="pv-loading"><span class="pv-spinner" aria-hidden="true"></span>' +
        esc(t("pv.loading")) + "</div>";
    }
    setTimeout(function () {
      try { renderResults(); } catch (e) { JV.toast(t("pv.error"), "error"); }
    }, 180);
    renderSaveState();
    renderConsentPanel();
  }

  function restartWizard() {
    answers = P.defaultAnswers();
    results = null;
    data.answers = null;
    step = 0;
    if (data.saveConsent) persist();
    const body = $("pvWizardBody");
    const panel = $("pvResults");
    if (panel) { panel.hidden = true; panel.innerHTML = ""; }
    if (body) body.hidden = false;
    renderStep();
    renderNav();
    renderSaveState();
    scrollTo("pvWizard");
  }

  /* ---------- results ---------- */
  function planActions(id) {
    const entry = P.planEntry(data, id);
    if (!data.plan[id]) {
      return '<button class="btn btn-primary btn-sm" type="button" data-add="' + id + '">' +
        icon("plus") + " " + esc(t("pv.addPlan")) + "</button>";
    }
    return '<div class="pv-item-actions">' +
      "<select data-status=\"" + id + "\" aria-label=\"" + esc(t("pv.status")) + "\">" +
      P.STATUSES.map(function (s) {
        return '<option value="' + s.id + '"' + (entry.status === s.id ? " selected" : "") + ">" + esc(statusLabel(s)) + "</option>";
      }).join("") + "</select>" +
      '<input type="date" data-date="' + id + '" value="' + esc(entry.date || "") + '" aria-label="' + esc(t("pv.appointment")) + '">' +
      '<button class="icon-btn" type="button" data-remove="' + id + '" aria-label="' + esc(t("common.delete")) + '">' + icon("trash") + "</button></div>";
  }

  function resultItem(r) {
    return '<div class="pv-item"><h4>' + esc(r.name) + "</h4>" +
      '<p class="pv-reason">' + esc(r.reason) + "</p>" +
      '<p class="pv-interval">' + esc(t("pv.interval")) + ": " + esc(r.interval) + "</p>" +
      planActions(r.screeningId) + "</div>";
  }

  function symptomItem(s) {
    const isUrgent = s.severity === "urgent";
    return '<div class="pv-item"><span class="pv-sev ' + (isUrgent ? "urgent" : "consult") + '">' +
      (isUrgent ? t("pv.urgent") : t("pv.soon")) + "</span>" +
      "<h4>" + esc(s.label) + "</h4><p class=\"pv-reason\">" + esc(s.guidance) + "</p>" +
      '<a class="btn btn-secondary btn-sm" href="' + esc(s.link) + '">' + icon("stethoscope") + " " +
      esc(t("pv.routine")) + "</a></div>";
  }

  function bindResultActions() {
    const host = $("pvResults");
    if (!host) return;
    $$("[data-add]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-add");
        P.setPlanEntry(data, id, { status: "not-reviewed" });
        persist();
        renderResults();
        renderPlan();
        JV.toast(tr("pv.added", "Added to your plan"));
      });
    });
    $$("[data-status]", host).forEach(function (sel) {
      sel.addEventListener("change", function () {
        P.setPlanEntry(data, sel.getAttribute("data-status"), { status: sel.value });
        persist();
        renderPlan();
      });
    });
    $$("[data-date]", host).forEach(function (input) {
      input.addEventListener("change", function () {
        P.setPlanEntry(data, input.getAttribute("data-date"), { date: input.value });
        persist();
        renderPlan();
      });
    });
    $$("[data-remove]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { removePlanItem(btn.getAttribute("data-remove")); });
    });
    const restart = $("pvRestart");
    if (restart) restart.addEventListener("click", restartWizard);
    const openPlan = $("pvOpenPlan");
    if (openPlan) openPlan.addEventListener("click", function () { scrollTo("pvPlan"); });
  }

  function renderResults() {
    const host = $("pvResults");
    if (!host || !results) return;
    const r = results;
    let html = "<h3>" + esc(t("pv.results")) + "</h3>";
    if (r.hasEmergency) {
      html += '<div class="callout danger" style="margin-top:.75rem">' + icon("phone") +
        "<p><strong>" + esc(t("pv.emgReported")) + "</strong></p>" +
        '<div class="row" style="margin-top:.5rem;gap:.5rem"><a class="btn btn-danger btn-sm" href="tel:108">' + esc(t("common.call")) + " 108</a>" +
        '<a class="btn btn-secondary btn-sm" href="tel:112">' + esc(t("common.call")) + " 112</a></div></div>";
    }
    if (r.general) {
      html += '<div class="callout info pv-general" style="margin-top:.75rem">' + icon("info") +
        "<p>" + esc(t("pv.general")) + "</p></div>";
    }
    if (r.symptomCare.length) {
      html += '<div class="callout warn" style="margin-top:.75rem">' + icon("alert") +
        "<p>" + esc(t("pv.symptomsFirst")) + "</p></div>";
    }

    const catA = '<section class="pv-cat a"><h3>' + icon("check-circle") + " " + esc(t("pv.catA")) + "</h3>" +
      '<p class="pv-cat-help">' + esc(t("pv.catAHelp")) + "</p>" +
      (r.due.length ? r.due.map(resultItem).join("") : '<div class="pv-empty">' + esc(tr("pv.noDue", "No routine screening was identified from these answers.")) + "</div>") +
      "</section>";
    const catB = '<section class="pv-cat b"><h3>' + icon("chat") + " " + esc(t("pv.catB")) + "</h3>" +
      '<p class="pv-cat-help">' + esc(t("pv.catBHelp")) + "</p>" +
      (r.discuss.length ? r.discuss.map(resultItem).join("") : '<div class="pv-empty">' + esc(tr("pv.noDiscuss", "Nothing to discuss from these answers.")) + "</div>") +
      "</section>";
    const catC = '<section class="pv-cat c"><h3>' + icon("alert") + " " + esc(t("pv.catC")) + "</h3>" +
      '<p class="pv-cat-help">' + esc(t("pv.catCHelp")) + "</p>" +
      (r.symptomCare.length ? r.symptomCare.map(symptomItem).join("") : '<div class="pv-empty">' + esc(tr("pv.noSymptoms", "No symptoms reported that need evaluation.")) + "</div>") +
      "</section>";

    if (!r.general) {
      html += '<div class="pv-cat-grid">' + catA + catB + catC + "</div>";
      if (r.recent.length) {
        html += '<div class="pv-recent"><strong>' + esc(tr("pv.recent", "Recently done (based on your dates)")) + "</strong>" +
          '<p class="tiny muted">' + esc(tr("pv.recentHelp", "This tool cannot confirm results. Bring your reports to your clinician.")) + "</p><ul>" +
          r.recent.map(function (x) { return "<li><strong>" + esc(x.name) + "</strong> — " + esc(x.reason) + "</li>"; }).join("") +
          "</ul></div>";
      }
    } else if (r.symptomCare.length) {
      html += '<div class="pv-cat-grid">' + catC + "</div>";
    }
    html += '<div class="pv-actions"><button class="btn btn-secondary" type="button" id="pvRestart">' + icon("refresh") + " " +
      esc(t("pv.restart")) + '</button><button class="btn btn-primary" type="button" id="pvOpenPlan">' +
      icon("calendar") + " " + esc(t("pv.viewPlan")) + "</button></div>";
    host.innerHTML = html;
    bindResultActions();
  }

  /* ---------- plan ---------- */
  function removePlanItem(id) {
    delete data.plan[id];
    persist();
    renderPlan();
    if (!$("pvResults").hidden) renderResults();
    JV.toast(tr("pv.removed", "Removed from your plan"));
  }
  function setPlan(id, patch) {
    P.setPlanEntry(data, id, patch);
    persist();
    renderPlan();
    // Keep the status/date controls in the results view in step.
    const panel = $("pvResults");
    if (results && panel && !panel.hidden) renderResults();
  }

  function renderPlan() {
    const host = $("pvPlanBody");
    if (!host) return;
    const summary = P.summary(data);
    let html = '<div class="card-head"><div class="icon-badge teal">' + icon("shield-check") + "</div>" +
      "<div><h3 style=\"margin:0\">" + esc(t("pv.plan")) + "</h3><p>" +
      (summary.ageGroup ? esc(t("pv.ageGroup")) + ": " + esc(ageTitle(summary.ageGroup)) : esc(t("pv.general"))) +
      "</p></div></div>";
    if (!summary.items.length) {
      html += '<div class="pv-empty">' + esc(t("pv.planEmpty")) + "</div>";
    } else {
      html += '<div class="pv-dash-stats">' +
        '<div class="pv-dash-stat due"><b>' + (summary.counts["not-reviewed"] || 0) + "</b><span>" + esc(tr("pv.st.not-reviewed", "Not reviewed")) + "</span></div>" +
        '<div class="pv-dash-stat discuss"><b>' + summary.counts.discuss + "</b><span>" + esc(tr("pv.st.discuss", "Discuss with doctor")) + "</span></div>" +
        '<div class="pv-dash-stat scheduled"><b>' + summary.counts.scheduled + "</b><span>" +
        esc(tr("pv.st.scheduled", "Scheduled")) + "</span></div>" +
        '<div class="pv-dash-stat"><b>' + summary.counts.completed + "</b><span>" + esc(tr("pv.st.completed", "Completed")) + "</span></div></div>";
      html += summary.items.map(function (item) {
        const entry = P.planEntry(data, item.id);
        return '<div class="pv-plan-item"><div class="pv-pi-main"><h4>' + esc(item.name) + "</h4>" +
          '<div class="pv-pi-meta">' + esc(statusLabel(P.statusMeta(entry.status))) +
          (entry.date ? " · " + esc(JV.fmtDate(entry.date, { day: "numeric", month: "short", year: "numeric" })) : "") +
          "</div></div>" +
          '<select data-status="' + item.id + '" aria-label="' + esc(t("pv.status")) + '">' +
          P.STATUSES.map(function (s) {
            return '<option value="' + s.id + '"' + (entry.status === s.id ? " selected" : "") + ">" + esc(statusLabel(s)) + "</option>";
          }).join("") + "</select>" +
          '<input type="date" data-date="' + item.id + '" value="' + esc(entry.date || "") + '" aria-label="' + esc(t("pv.appointment")) + '">' +
          '<button class="icon-btn" type="button" data-remove="' + item.id + '" aria-label="' + esc(t("common.delete")) + '">' + icon("trash") + "</button></div>";
      }).join("");
      if (summary.upcoming.length) {
        const next = summary.upcoming[0];
        html += '<div class="callout info" style="margin-top:.9rem">' + icon("calendar") + "<p><strong>" + esc(t("pv.upcoming")) + ":</strong> " +
          esc(next.name) + " · " + esc(JV.fmtDate(next.date, { day: "numeric", month: "short", year: "numeric" })) + "</p></div>";
      } else {
        html += '<p class="tiny muted" style="margin-top:.75rem">' + esc(t("pv.noUpcoming")) + "</p>";
      }
    }
    host.innerHTML = html;
    $$("[data-status]", host).forEach(function (sel) {
      sel.addEventListener("change", function () { setPlan(sel.getAttribute("data-status"), { status: sel.value }); });
    });
    $$("[data-date]", host).forEach(function (input) {
      input.addEventListener("change", function () { setPlan(input.getAttribute("data-date"), { date: input.value }); });
    });
    $$("[data-remove]", host).forEach(function (btn) {
      btn.addEventListener("click", function () { removePlanItem(btn.getAttribute("data-remove")); });
    });
  }

  function renderConsentPanel() {
    const host = $("pvConsentPanel");
    if (!host) return;
    const globalConsent = Store.profile().consent.store;
    const disabled = globalConsent === false;
    host.innerHTML = '<div class="pv-consent-panel">' +
      '<label class="pv-check"><input type="checkbox" id="pvSaveConsent"' + (data.saveConsent ? " checked" : "") +
      (disabled ? " disabled" : "") + "><span><strong>" + esc(t("pv.saveConsent")) + "</strong>" +
      "<span>" + esc(t("pv.consentDetail")) + "</span></span></label>" +
      '<div class="pv-save-row"><button class="btn btn-primary btn-sm" type="button" id="pvSaveBtn"' + (disabled ? " disabled" : "") + ">" +
      icon("download") + " " + esc(t("pv.saveBtn")) + "</button>" +
      '<span class="tiny muted" id="pvSaveMsg">' + esc(disabled ? t("pv.storage") : (data.savedAt ? t("pv.saved") : t("pv.sessionOnly"))) + "</span></div></div>";

    const check = $("pvSaveConsent");
    if (check) {
      check.addEventListener("change", function () {
        if (check.checked) {
          data.saveConsent = true;
          if (saveState()) {
            JV.toast(t("pv.saved"));
          } else {
            data.saveConsent = false;
            check.checked = false;
          }
          renderSaveState();
          return;
        }
        data.saveConsent = false;
        if (Store.profile().consent.store !== false) {
          P.save(Store, data);
        }
        JV.toast(tr("pv.savingOff", "Saving turned off — your saved copy stays until you delete it"));
        renderSaveState();
      });
    }
    const saveBtn = $("pvSaveBtn");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        data.saveConsent = true;
        const check2 = $("pvSaveConsent");
        if (check2) check2.checked = true;
        if (saveState()) {
          JV.toast(t("pv.saved"));
          renderConsentPanel();
        } else {
          data.saveConsent = false;
          if (check2) check2.checked = false;
        }
      });
    }
  }

  function renderPlanActions() {
    const host = $("pvPlanActions");
    if (!host) return;
    host.innerHTML = '<button class="btn btn-danger btn-sm" type="button" id="pvDeleteAll">' +
      icon("trash") + " " + esc(t("pv.deletePlan")) + "</button>" +
      '<a class="btn btn-secondary btn-sm" href="profile.html">' + icon("user") + " " + esc(t("pv.privacyExport")) + "</a>";
    $("pvDeleteAll").addEventListener("click", function () {
      JV.confirm({
        title: t("pv.deletePlan") + "?",
        message: t("pv.deletePlanMsg"),
        confirm: t("common.delete"),
        cancel: t("common.cancel"),
        danger: true
      }).then(function (ok) {
        if (!ok) return;
        P.remove(Store);
        data = P.defaultState();
        answers = P.defaultAnswers();
        results = null;
        step = 0;
        editingReminder = null;
        const panel = $("pvResults");
        const body = $("pvWizardBody");
        if (panel) { panel.hidden = true; panel.innerHTML = ""; }
        if (body) body.hidden = false;
        renderAll();
        JV.toast(t("pv.deleted"));
      });
    });
  }

  /* ---------- reminders ---------- */
  function reminderDay(dateISO) {
    const d = P.daysUntil(dateISO);
    if (d === null) return "";
    if (d === 0) return t("pv.today");
    if (d > 0) return t("pv.days", { n: d });
    return tr("pv.overdue", "Overdue") + " · " + JV.fmtDate(dateISO, { day: "numeric", month: "short" });
  }

  function renderReminders() {
    const host = $("pvReminderBody");
    if (!host) return;
    const items = data.reminders.items.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    const enabled = data.reminders.enabled;
    const summary = P.summary(data);
    let html = '<div class="card-head"><div class="icon-badge amber">' + icon("bell") + "</div>" +
      "<div><h4 style=\"margin:0\">" + esc(t("pv.reminders")) + "</h4><p>" +
      esc(tr("pv.remindersHelp", "Optional. Nothing is sent unless you turn reminders on.")) + "</p></div></div>";
    html += '<div class="pv-rem-toggle"><span><strong>' +
      esc(enabled ? t("pv.remindersOn") : t("pv.remindersOff")) + '</strong><br><span class="tiny muted">' + esc(t("pv.reminderHint")) + '</span></span>' +
      '<label class="switch"><input type="checkbox" id="pvReminderToggle" aria-label="' + esc(t("pv.reminders")) + '"' +
      (enabled ? " checked" : "") + '><span class="track"></span></label></div>';
    if (!items.length) {
      html += '<div class="pv-empty">' + esc(t("pv.noReminders")) + "</div>";
    } else {
      html += items.map(function (item) {
        const kind = item.kind === "followup" ? tr("pv.followup", "Follow-up") : tr("pv.appointmentKind", "Appointment");
        return '<div class="pv-rem"><div><h5>' + esc(item.title) + '</h5><p>' + esc(kind) + " · " +
          esc(JV.fmtDate(item.date, { day: "numeric", month: "short", year: "numeric" })) + " · " +
          esc(reminderDay(item.date)) + "</p></div>" +
          '<div class="pv-rem-actions"><button class="icon-btn" type="button" data-edit-rem="' + esc(item.id) +
          '" aria-label="' + esc(tr("pv.edit", "Edit")) + '">' + icon("edit") + "</button>" +
          '<button class="icon-btn" type="button" data-del-rem="' + esc(item.id) +
          '" aria-label="' + esc(t("common.delete")) + '">' + icon("trash") + "</button></div></div>";
      }).join("");
    }
    if (summary.upcoming.length) {
      html += '<p class="tiny muted" style="margin:.7rem 0 .3rem">' + esc(t("pv.suggestReminder")) + "</p>" +
        summary.upcoming.slice(0, 3).map(function (item) {
          return '<button class="btn btn-ghost btn-sm" type="button" data-suggest="' + item.id + '" style="margin:0 .3rem .3rem 0">' +
            icon("plus") + " " + esc(item.name) + " · " + esc(JV.fmtDate(item.date)) + "</button>";
        }).join("");
    }
    const edit = editingReminder ? data.reminders.items.filter(function (x) { return x.id === editingReminder; })[0] : null;
    html += '<div class="pv-rem-form"><div class="field"><label for="pvRemTitle">' + esc(tr("pv.reminderTitle", "Reminder")) + "</label>" +
      '<input id="pvRemTitle" type="text" maxlength="80" placeholder="' + esc(t("pv.reminderPh")) + '" value="' +
      esc(edit ? edit.title : "") + '"></div>' +
      '<div class="field"><label for="pvRemKind">' + esc(tr("pv.reminderKind", "Type")) + '</label><select id="pvRemKind">' +
      '<option value="appointment"' + (edit && edit.kind === "appointment" ? " selected" : "") + ">" + esc(tr("pv.appointmentKind", "Appointment")) + "</option>" +
      '<option value="followup"' + (edit && edit.kind === "followup" ? " selected" : "") + ">" + esc(tr("pv.followup", "Follow-up")) + "</option></select></div>" +
      '<div class="field"><label for="pvRemDate">' + esc(t("pv.appointment")) + '</label><input id="pvRemDate" type="date" value="' +
      esc(edit ? edit.date : "") + '"></div>' +
      '<button class="btn btn-secondary btn-sm" type="button" id="pvRemSave">' + icon(edit ? "check" : "plus") + " " +
      esc(edit ? t("common.save") : t("pv.addReminder")) + "</button>" +
      (edit ? '<button class="btn btn-ghost btn-sm" type="button" id="pvRemCancel">' + esc(t("common.cancel")) + "</button>" : "") + "</div>";
    if (enabled) {
      html += '<button class="btn btn-ghost btn-sm" type="button" id="pvNotifyBtn" style="margin-top:.6rem">' +
        icon("bell") + " " + esc(t("pv.alertEnable")) + "</button>";
    }
    html += '<p class="tiny muted" style="margin-top:.6rem">' + esc(t("pv.alertsLimit")) + "</p>";
    host.innerHTML = html;

    const toggle = $("pvReminderToggle");
    if (toggle) {
      toggle.addEventListener("change", function () {
        data.reminders.enabled = toggle.checked;
        persist();
        if (toggle.checked && !data.saveConsent) JV.toast(t("pv.sessionOnly"));
        renderReminders();
        if (toggle.checked) checkDueReminders();
      });
    }
    $$("[data-edit-rem]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        editingReminder = btn.getAttribute("data-edit-rem");
        renderReminders();
        scrollTo("pvReminderCard");
      });
    });
    $$("[data-del-rem]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-del-rem");
        data.reminders.items = data.reminders.items.filter(function (x) { return x.id !== id; });
        if (editingReminder === id) editingReminder = null;
        persist();
        renderReminders();
        JV.toast(tr("pv.removed", "Reminder deleted"));
      });
    });
    $$("[data-suggest]", host).forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-suggest");
        const item = summary.items.filter(function (x) { return x.id === id; })[0];
        if (!item || !item.date) return;
        data.reminders.items.push({
          id: JV.uid(), title: tr("pv.appointmentKind", "Appointment") + ": " + item.name, date: item.date, kind: "appointment"
        });
        data.reminders.enabled = true;
        persist();
        renderReminders();
        JV.toast(tr("pv.added", "Reminder added"));
      });
    });
    const save = $("pvRemSave");
    if (save) {
      save.addEventListener("click", function () {
        const title = ($("pvRemTitle").value || "").trim();
        const date = $("pvRemDate").value;
        const kind = $("pvRemKind").value;
        const normalized = P.normalizeReminder({ title: title, date: date, kind: kind });
        if (!normalized) { JV.toast(t("pv.reminderInvalid"), "error"); return; }
        if (editingReminder) {
          const existing = data.reminders.items.filter(function (x) { return x.id === editingReminder; })[0];
          if (existing) {
            existing.title = normalized.title;
            existing.date = normalized.date;
            existing.kind = normalized.kind;
          }
          editingReminder = null;
        } else {
          normalized.id = JV.uid();
          data.reminders.items.push(normalized);
        }
        data.reminders.enabled = true;
        persist();
        renderReminders();
        JV.toast(t("pv.saved"));
        checkDueReminders();
      });
    }
    const cancel = $("pvRemCancel");
    if (cancel) cancel.addEventListener("click", function () { editingReminder = null; renderReminders(); });
    const notify = $("pvNotifyBtn");
    if (notify) {
      notify.addEventListener("click", function () {
        if (!("Notification" in window)) { JV.toast(t("pv.alertUnsupported"), "error"); return; }
        Notification.requestPermission().then(function (permission) {
          if (permission === "granted") {
            JV.toast(t("pv.alertOn"));
            checkDueReminders();
          } else {
            JV.toast(t("pv.notifyDenied"), "error");
          }
        });
      });
    }
  }

  function checkDueReminders() {
    if (!data.reminders.enabled) return;
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    data.reminders.items.forEach(function (item) {
      const days = P.daysUntil(item.date);
      if (days === null || days > 0 || days < -1) return;
      if (notified[item.id]) return;
      notified[item.id] = true;
      try {
        new Notification("JIVIKA AROGYA", {
          body: item.title + " · " + JV.fmtDate(item.date, { day: "numeric", month: "short" }),
          icon: "assets/img/favicon.svg"
        });
      } catch (e) { /* browser blocks construction on some protocols */ }
    });
  }

  /* ---------- warnings, sources, care ---------- */
  function renderWarnings() {
    const host = $("pvWarningGrid");
    if (!host) return;
    host.innerHTML = P.SYMPTOMS.map(function (s) {
      const urgent = s.severity === "urgent";
      return '<article class="pv-warning' + (urgent ? " urgent" : "") + '">' +
        '<span class="pv-sev ' + (urgent ? "urgent" : "consult") + '">' + esc(urgent ? t("pv.urgent") : t("pv.soon")) + "</span>" +
        "<h4>" + esc(s.label) + "</h4><p>" + esc(s.guidance) + "</p>" +
        '<a href="' + esc(s.link) + '">' + icon("arrow-right") + " " + esc(t("common.learnMore")) + "</a></article>";
    }).join("");
  }

  function renderEmergency() {
    const host = $("pvEmergencyGrid");
    if (!host) return;
    host.innerHTML = P.EMERGENCY_SIGNS.map(function (s) {
      return '<div class="pv-emergency-card"><h4>' + esc(s.label) + "</h4><p>" + esc(s.guidance) + "</p></div>";
    }).join("");
  }

  function renderSources() {
    const host = $("pvSources");
    if (!host) return;
    const seen = {};
    const rows = [];
    P.SCREENINGS.forEach(function (s) {
      const key = s.source.org + "|" + s.source.title + "|" + s.source.year;
      if (seen[key]) return;
      seen[key] = true;
      rows.push(s.source);
    });
    host.innerHTML = "<strong>" + esc(t("pv.sourcesHeading")) + '</strong><ul style="margin:.4rem 0 0;padding-left:1.1rem">' +
      rows.map(function (src) {
        return "<li>" + esc(src.org) + " — " + esc(src.title) + " (" + esc(src.year) + "). " +
          '<a href="' + esc(src.url) + '" target="_blank" rel="noopener noreferrer">Open source</a></li>';
      }).join("") + "</ul>";
  }

  /* ---------- boot ---------- */
  function renderAll() {
    clinicalNote();
    renderAges();
    renderFilter();
    renderLibrary();
    renderStep();
    renderNav();
    renderWarnings();
    renderEmergency();
    renderSources();
    renderPlan();
    renderPlanActions();
    renderReminders();
    renderConsentPanel();
    renderSaveState();
    if (results) renderResults();
  }

  function init() {
    if (!$("pvAgeGrid")) return;
    renderAll();
    if (results) {
      const body = $("pvWizardBody");
      const panel = $("pvResults");
      if (body) body.hidden = true;
      if (panel) { panel.hidden = false; renderResults(); }
    }
    checkDueReminders();
    setInterval(checkDueReminders, 60000);
    document.addEventListener("jivika:lang", renderAll);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
