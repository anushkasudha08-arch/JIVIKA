/* ==========================================================================
   Profile & privacy — details, consent, data summary, export, delete, display
   ========================================================================== */
(function () {
  "use strict";

  const Store = JV.Store;
  const W = JV.wellbeing;
  const icon = JV.icon;
  const esc = JV.esc;
  const $ = function (id) { return document.getElementById(id); };

  const AGE_GROUPS = ["Under 18", "18–25", "26–35", "36–45", "46–55", "56 and above"];

  const STATES = {
    "States": [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
      "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
      "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
      "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ],
    "Union territories": [
      "Andaman & Nicobar Islands", "Chandigarh", "Dadra & Nagar Haveli and Daman & Diu", "Delhi",
      "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
    ]
  };

  /* ---------- small helpers ---------- */
  function options(list, current) {
    return list.map(function (item) {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      return '<option value="' + esc(value) + '"' + (value === current ? " selected" : "") + ">" +
        esc(label) + "</option>";
    }).join("");
  }

  function listOf(key) {
    const value = Store.get(key, []);
    return Array.isArray(value) ? value : [];
  }

  function chosen(list, id) {
    return list.filter(function (x) { return x.id === id; })[0] || null;
  }

  function cardHead(iconName, tone, title, sub) {
    return '<div class="card-head"><div class="icon-badge ' + tone + '">' + icon(iconName) + "</div>" +
      '<div style="flex:1;min-width:0"><h3 style="margin:0">' + esc(title) + "</h3><p>" + esc(sub) + "</p></div>";
  }

  function switchRow(id, title, desc, checked) {
    return '<div class="consent-row"><div class="cr-main"><strong>' + esc(title) + "</strong><p>" +
      esc(desc) + "</p></div>" +
      '<label class="switch"><input type="checkbox" id="' + id + '" aria-label="' + esc(title) + '"' +
      (checked ? " checked" : "") + '><span class="track"></span></label></div>';
  }

  /* ---------- details form ---------- */
  function updatePreview() {
    const nameEl = $("pName");
    if (!nameEl) return;
    const name = nameEl.value.trim();
    const avatar = $("pAvatar");
    const greet = $("pGreeting");
    if (name) {
      avatar.textContent = name.charAt(0).toUpperCase();
      greet.textContent = "Hello, " + name;
    } else {
      avatar.innerHTML = icon("user");
      greet.textContent = "Hello";
    }
  }

  function fillForm() {
    const p = Store.profile();
    $("pName").value = p.name || "";
    $("pAge").innerHTML = '<option value="">Not set</option>' + options(AGE_GROUPS, p.ageGroup);
    $("pStage").innerHTML = '<option value="">Not set</option>' +
      options(W.STAGES.map(function (s) { return { value: s.id, label: s.label }; }), p.lifeStage);
    $("pDiet").innerHTML = '<option value="">Not set</option>' +
      options(W.DIET_PREFS.map(function (d) { return { value: d.id, label: d.label }; }), p.diet);
    $("pState").innerHTML = '<option value="">Not set</option>' +
      Object.keys(STATES).map(function (group) {
        return '<optgroup label="' + esc(group) + '">' + options(STATES[group], p.state) + "</optgroup>";
      }).join("");
    updatePreview();
  }

  function saveDetails(event) {
    if (event) event.preventDefault();
    const name = ($("pName").value || "").trim().slice(0, 40);
    Store.saveProfile({
      name: name,
      ageGroup: $("pAge").value,
      lifeStage: $("pStage").value,
      diet: $("pDiet").value,
      state: $("pState").value
    });
    $("pName").value = name;
    updatePreview();
    renderData();
    JV.toast("Your details were saved on this device");
  }

  function resetFields() {
    JV.confirm({
      title: "Reset the fields?",
      message: "This clears the form but does not change what is saved until you press “Save details”.",
      confirm: "Reset fields",
      cancel: "Keep them"
    }).then(function (ok) {
      if (!ok) return;
      ["pName", "pAge", "pStage", "pDiet", "pState"].forEach(function (id) { $(id).value = ""; });
      updatePreview();
      JV.toast("Fields reset — press Save details to keep it");
    });
  }

  /* ---------- consent ---------- */
  function renderConsent() {
    const host = $("consentCard");
    if (!host) return;
    const consent = Store.profile().consent;

    const badge = consent.store === true
      ? '<span class="badge teal">Saving on</span>'
      : consent.store === false
        ? '<span class="badge neutral">Not saving</span>'
        : '<span class="badge amber">Not chosen yet</span>';

    host.innerHTML =
      cardHead("shield-check", "lav", "Consent & saving", "You decide what this browser remembers") +
      badge +
      "</div>" +
      switchRow("consentStore", "Remember my health data on this device",
        "Cycle dates, symptoms, moods, journal notes, water, saved schemes and the checklist. Kept in this browser — never uploaded.",
        consent.store === true) +
      switchRow("consentReminders", "Show period reminders in JIVIKA",
        "Controls the reminder card on the dashboard and the menstrual page. Add the date to your phone calendar for an alarm that always works.",
        JV.Cycle.settings().reminders) +
      switchRow("consentAssistant", "Let the health assistant remember our chat",
        "The last 40 messages are saved on this device so you can continue later. Turning this off also deletes the saved conversation.",
        consent.assistant === true) +
      '<div class="callout info" style="margin-top:1rem">' + icon("info") + "<p>" +
      (consent.store === false
        ? "<strong>Not saving.</strong> Health entries are kept for this visit only and disappear when you close the tab."
        : "<strong>Education always works.</strong> Every health article stays open, with or without saving. Only your own entries are affected.") +
      "</p></div>";

    const storeToggle = $("consentStore");
    storeToggle.addEventListener("change", function () {
      if (storeToggle.checked) {
        Store.saveProfile({ consent: { store: true } });
        Store.set("cycle", JV.Cycle.settings());
        JV.toast("Health data will be saved on this device");
        renderConsent();
        renderData();
        return;
      }
      JV.confirm({
        title: "Stop saving new health data?",
        message: "Data already saved stays in this browser until you delete it below. New entries will be kept only for this visit.",
        confirm: "Stop saving",
        cancel: "Keep saving"
      }).then(function (ok) {
        if (ok) {
          Store.saveProfile({ consent: { store: false } });
          JV.toast("New health data will be kept for this visit only");
        }
        renderConsent();
        renderData();
      });
    });

    $("consentReminders").addEventListener("change", function (event) {
      const on = event.target.checked;
      JV.Cycle.saveSettings({ reminders: on });
      Store.saveProfile({ consent: { reminders: on } });
      const saving = Store.profile().consent.store !== false;
      JV.toast(on
        ? (saving ? "Period reminders turned on" : "Reminders on for this visit only")
        : "Period reminders turned off");
      renderConsent();
    });

    $("consentAssistant").addEventListener("change", function (event) {
      if (event.target.checked) {
        Store.saveProfile({ consent: { assistant: true } });
        JV.toast("The assistant can now remember your chat on this device");
        renderData();
        return;
      }
      JV.confirm({
        title: "Stop saving chat history?",
        message: "The conversation saved on this device will be deleted. The assistant keeps working — it just forgets each chat when you leave.",
        confirm: "Stop and delete",
        cancel: "Keep saving",
        danger: true
      }).then(function (ok) {
        if (ok) {
          Store.saveProfile({ consent: { assistant: false } });
          Store.remove("assistant");
          JV.toast("Chat history deleted and saving turned off");
        }
        renderConsent();
        renderData();
      });
    });
  }

  /* ---------- data summary ---------- */
  function dataRow(iconName, tone, title, desc, value) {
    const empty = !value || value === "—";
    return '<div class="data-row"><span class="icon-badge ' + tone + ' sm">' + icon(iconName) + "</span>" +
      '<div class="data-main"><strong>' + esc(title) + "</strong><span>" + esc(desc) + "</span></div>" +
      '<span class="data-count' + (empty ? " zero" : "") + '">' + esc(value || "—") + "</span></div>";
  }

  function renderData() {
    const host = $("dataCard");
    if (!host) return;

    const p = Store.profile();
    const cycle = JV.Cycle.settings();
    const moods = listOf("moods");
    const journal = listOf("journal");
    const schemes = listOf("schemes");
    const checklist = listOf("checklist");
    const assistant = Store.get("assistant", null);
    const messages = assistant && Array.isArray(assistant.messages) ? assistant.messages.length : 0;
    const nutrition = Store.get("nutrition", null);
    const stage = nutrition ? chosen(W.STAGES, nutrition.stage) : null;
    const preventive = Store.get("preventive", null);
    const pvItems = preventive && preventive.plan ? Object.keys(preventive.plan).length : 0;
    const bytes = Store.bytes();
    const kb = bytes / 1024;
    const size = bytes ? (kb >= 0.1 ? kb.toFixed(1) + " KB" : "under 0.1 KB") : "nothing";
    const started = p.createdAt ? JV.fmtDate(String(p.createdAt).slice(0, 10), { day: "numeric", month: "short", year: "numeric" }) : "";

    host.innerHTML =
      cardHead("file", "", "What is stored on this device", "Every record JIVIKA keeps about you, in plain words") +
      "</div>" +
      dataRow("droplet", "teal", "Cycle & period dates",
        "Start date, cycle length and period length",
        cycle.logs.length ? cycle.logs.length + (cycle.logs.length === 1 ? " cycle" : " cycles") : "") +
      dataRow("calendar", "", "Symptom log",
        "Cramps, flow, mood and other symptoms you recorded",
        cycle.days.length ? cycle.days.length + (cycle.days.length === 1 ? " day" : " days") : "") +
      dataRow("mood-3", "lav", "Mood check-ins",
        "Daily mood and the short note you added",
        moods.length ? moods.length + (moods.length === 1 ? " check-in" : " check-ins") : "") +
      dataRow("book", "amber", "Private journal",
        "Notes written on the mental wellness page",
        journal.length ? journal.length + (journal.length === 1 ? " note" : " notes") : "") +
      dataRow("chat", "teal", "Assistant conversation",
        p.consent.assistant === true ? "Saved so you can continue the chat later" : "Saving is off — chats are forgotten when you leave",
        p.consent.assistant === true ? (messages ? messages + (messages === 1 ? " message" : " messages") : "") : "Off") +
      dataRow("utensils", "", "Nutrition plan",
        "Life stage and food preference you picked",
        stage ? stage.label : "") +
      dataRow("shield", "lav", "Schemes & checklist",
        "Applications marked and preparation steps ticked",
        (schemes.length + checklist.length) ? (schemes.length + checklist.length) + " items" : "") +
      dataRow("shield-check", "teal", "Preventive screening plan",
        "Age group, screening statuses and reminders — no test results",
        pvItems ? pvItems + (pvItems === 1 ? " item" : " items") : "") +
      '<div class="data-foot">' + icon("file") + "<span>Total in this browser: <strong>" + esc(size) + "</strong>" +
      (started ? " · started " + esc(started) : "") + "</span></div>" +
      '<div class="row" style="gap:.5rem;margin-top:.9rem">' +
      '<button class="btn btn-secondary btn-sm" type="button" id="exportData">' + icon("download") +
      " Export a copy (JSON)</button></div>" +
      '<div class="danger-zone">' +
      '<div><strong style="font-size:.9rem">Delete data</strong>' +
      '<p class="tiny muted" style="margin:.15rem 0 0">There is no server copy, so a deleted record cannot be restored. ' +
      "Export a copy first if you may need it.</p></div>" +
      '<div class="row" style="gap:.55rem">' +
      '<button class="btn btn-secondary btn-sm" type="button" id="deleteHealth">' + icon("trash") +
      " Delete health records</button>" +
      '<button class="btn btn-danger btn-sm" type="button" id="deleteAll">' + icon("trash") +
      " Delete everything</button>" +
      "</div></div>";

    $("exportData").addEventListener("click", exportData);
    $("deleteHealth").addEventListener("click", deleteHealth);
    $("deleteAll").addEventListener("click", deleteAll);
  }

  /* ---------- export & delete ---------- */
  function exportData() {
    const p = Store.profile();
    const payload = {
      app: "JIVIKA AROGYA",
      about: "Health information saved in this browser by the person using it. Keep this file private.",
      exportedAt: new Date().toISOString(),
      language: JV.i18n.get(),
      profile: {
        name: p.name, ageGroup: p.ageGroup, lifeStage: p.lifeStage,
        diet: p.diet, state: p.state, createdAt: p.createdAt, lastVisit: p.lastVisit
      },
      consent: p.consent,
      display: p.a11y,
      cycle: Store.get("cycle", null),
      moods: listOf("moods"),
      journal: listOf("journal"),
      selfcare: Store.get("selfcare", null),
      water: Store.get("water", null),
      assistant: Store.get("assistant", null),
      nutrition: Store.get("nutrition", null),
      schemes: listOf("schemes"),
      checklist: listOf("checklist"),
      preventive: Store.get("preventive", null)
    };
    JV.download("jivika-arogya-data-" + JV.toISO(new Date()) + ".json", JSON.stringify(payload, null, 2));
    JV.toast("A private copy was downloaded — keep the file safe");
  }

  function deleteHealth() {
    JV.confirm({
      title: "Delete health records?",
      message: "This removes cycle dates, symptoms, moods, journal notes, water, saved schemes, the checklist, your preventive screening plan, your nutrition plan and the assistant conversation from this browser. Your name and display settings stay. It cannot be undone.",
      confirm: "Delete health records",
      cancel: "Keep records",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      Store.clearHealth();
      Store.remove("assistant");
      Store.remove("nutrition");
      renderAll();
      JV.toast("Health records deleted from this browser");
    });
  }

  function deleteAll() {
    JV.confirm({
      title: "Delete everything?",
      message: "This removes your name, health records, saved chats, language choice and display settings from this browser. There is no server copy and no account to recover it from. This cannot be undone.",
      confirm: "Delete everything",
      cancel: "Cancel",
      danger: true
    }).then(function (ok) {
      if (!ok) return;
      const lang = JV.i18n.get();
      Store.clearAll();
      JV.i18n.set(lang);
      JV.applyA11y({ theme: "light", text: "md", contrast: "normal" });
      renderAll();
      JV.toast("All JIVIKA data deleted from this browser");
    });
  }

  /* ---------- language & display ---------- */
  function renderA11y() {
    const host = $("a11yCard");
    if (!host) return;
    const prefs = Store.profile().a11y;

    host.innerHTML =
      cardHead("accessibility", "teal", "Language & display", "Small changes that make reading easier") +
      "</div>" +
      '<div class="field"><label for="profileLang">Language</label>' +
      '<select class="select" id="profileLang">' +
      JV.i18n.langs.map(function (l) {
        return '<option value="' + esc(l.code) + '"' + (l.code === JV.i18n.get() ? " selected" : "") + ">" +
          esc(l.label) + "</option>";
      }).join("") + "</select>" +
      '<span class="help">Menus, buttons and headings change language. Detailed medical articles stay in English so nothing is mistranslated — call 104 for help in your language.</span></div>' +
      '<div class="a11y-panel">' +
      '<div class="a11y-row"><div><strong>Text size</strong><div class="tiny muted">Bigger text for small screens</div></div>' +
      '<div class="segmented" role="group" aria-label="Text size">' +
      '<button type="button" data-text="md" aria-pressed="' + (prefs.text === "md") + '">Normal</button>' +
      '<button type="button" data-text="lg" aria-pressed="' + (prefs.text === "lg") + '">Large</button>' +
      '<button type="button" data-text="xl" aria-pressed="' + (prefs.text === "xl") + '">Largest</button>' +
      "</div></div>" +
      '<div class="a11y-row"><div><strong>High contrast</strong><div class="tiny muted">Stronger borders and darker text</div></div>' +
      '<label class="switch"><input type="checkbox" id="prefContrast" aria-label="High contrast"' + (prefs.contrast === "high" ? " checked" : "") +
      '><span class="track"></span></label></div>' +
      '<div class="a11y-row"><div><strong>Night mode</strong><div class="tiny muted">Softer colours in the dark</div></div>' +
      '<label class="switch"><input type="checkbox" id="prefNight" aria-label="Night mode"' + (prefs.theme === "dark" ? " checked" : "") +
      '><span class="track"></span></label></div>' +
      '<button class="btn btn-secondary btn-block btn-sm" type="button" id="prefReset">' + icon("refresh") +
      " Reset display to default</button>" +
      "</div>";

    $("profileLang").addEventListener("change", function (event) {
      JV.i18n.set(event.target.value);
      JV.toast("Language changed");
    });

    host.querySelectorAll("[data-text]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        JV.saveA11y({ text: btn.getAttribute("data-text") });
        host.querySelectorAll("[data-text]").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
      });
    });

    $("prefContrast").addEventListener("change", function (event) {
      JV.saveA11y({ contrast: event.target.checked ? "high" : "normal" });
    });
    $("prefNight").addEventListener("change", function (event) {
      JV.saveA11y({ theme: event.target.checked ? "dark" : "light" });
    });
    $("prefReset").addEventListener("click", function () {
      JV.saveA11y({ text: "md", contrast: "normal", theme: "light" });
      renderA11y();
      JV.toast("Display reset to default");
    });
  }

  /* ---------- init ---------- */
  function renderAll() {
    fillForm();
    renderConsent();
    renderData();
    renderA11y();
  }

  function init() {
    renderAll();

    $("profileForm").addEventListener("submit", saveDetails);
    $("pName").addEventListener("input", updatePreview);
    $("resetFields").addEventListener("click", resetFields);
    const hero = $("exportHero");
    if (hero) hero.addEventListener("click", exportData);

    document.addEventListener("jivika:lang", function () {
      const select = $("profileLang");
      if (select) select.value = JV.i18n.get();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
