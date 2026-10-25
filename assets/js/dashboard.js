/* ==========================================================================
   Health dashboard
   ========================================================================== */
(function () {
  "use strict";

  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;
  let tipOffset = 0;

  function tr(key, fallback) {
    const value = JV.i18n.t(key);
    return value === key ? fallback : value;
  }

  function pvStatusText(id) {
    const meta = JV.preventive ? JV.preventive.statusMeta(id) : { label: id };
    return tr("pv.st." + id, meta.label);
  }

  function today() { return JV.toISO(new Date()); }

  function waterData() {
    const w = Store.get("water", null);
    if (!w || w.date !== today()) return { date: today(), count: 0 };
    return { date: w.date, count: JV.clamp(Number(w.count) || 0, 0, 12) };
  }

  function moodEntries() {
    const list = Store.get("moods", []);
    return Array.isArray(list) ? list : [];
  }

  function moodFor(dateISO) {
    return moodEntries().filter(function (m) { return m.date === dateISO; })[0] || null;
  }

  function phaseInsight(phase) {
    const map = {
      Menstrual: "Rest a little more. Iron-rich food and a warm compress help with cramps. If pain is severe, that is worth a doctor's visit.",
      Follicular: "Energy often rises in this phase. A good time for strength exercise, new routines and getting things done.",
      Ovulation: "You may notice clearer discharge or a mild one-sided twinge. This is the fertile window — not a contraceptive guide.",
      Luteal: "PMS can show up now: bloating, mood dips, tender breasts. Prioritise sleep, nuts and greens, and gentler movement."
    };
    return map[phase] || map.Follicular;
  }

  function renderWelcome(pred) {
    const host = document.getElementById("dashWelcome");
    if (!host) return;
    const profile = Store.profile();
    const name = (profile.name || "").trim();
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const dateText = new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
    const consent = profile.consent.store;

    host.innerHTML =
      '<div class="row" style="gap:1rem;flex:1 1 280px">' +
      '<div class="avatar-xl" aria-hidden="true">' + esc(name ? name[0].toUpperCase() : "J") + "</div>" +
      "<div style=\"min-width:0\">" +
      '<h1 style="font-size:clamp(1.35rem,2.4vw,1.8rem);margin-bottom:.2rem">' + greeting + (name ? ", " + esc(name) : "") + "</h1>" +
      '<p style="margin:0">' + esc(dateText) + ' · <span class="text-pink" style="font-weight:800">Cycle day ' + pred.cycleDay + "</span>" +
      ' · <span class="phase-badge phase-' + pred.phase.toLowerCase() + '">' + pred.phase + "</span></p>" +
      (consent === false ? '<p class="tiny" style="margin-top:.45rem;color:var(--amber-ink)">' +
        icon("alert") + " Records are kept for this visit only — saving is switched off.</p>" : "") +
      "</div></div>" +
      '<div class="row" style="flex:none;gap:.5rem">' +
      '<a class="btn btn-secondary btn-sm" href="profile.html">' + icon("user") + " Edit profile</a>" +
      '<a class="btn btn-primary btn-sm" href="assistant.html">' + icon("chat") + " Ask the assistant</a>" +
      "</div>";
  }

  function renderOverview(pred) {
    const host = document.getElementById("overview");
    if (!host) return;
    const entries = moodEntries().filter(function (m) {
      return JV.daysBetween(JV.parseISO(m.date), new Date()) <= 6;
    });
    const avg = entries.length ? entries.reduce(function (a, b) { return a + Number(b.mood || 0); }, 0) / entries.length : 0;
    const water = waterData();

    function card(iconName, label, value, note, tone) {
      return '<div class="dash-stat"><div class="ds-top"><span class="ds-label">' + esc(label) + "</span>" +
        '<span class="ds-icon ' + (tone || "") + '">' + icon(iconName) + "</span></div>" +
        '<span class="ds-value">' + value + "</span><span class=\"ds-note\">" + esc(note) + "</span></div>";
    }

    host.innerHTML =
      card("droplet", "Next period", pred.daysUntil + (pred.daysUntil === 1 ? " day" : " days"),
        JV.fmtDate(pred.nextStart, { weekday: "short" }), "") +
      card("refresh", "Cycle length", pred.cycleLength + " days",
        pred.irregular ? "Some variation logged" : "Your usual pattern", "text-lav") +
      card("sparkle", "Mood this week", entries.length ? avg.toFixed(1) + "/5" : "—",
        entries.length ? entries.length + " check-ins" : "No check-ins yet", "text-pink") +
      card("water", "Water today", water.count + "/8", water.count >= 8 ? "Goal reached" : "Glasses of water", "text-teal");
  }

  function renderCycle(pred) {
    const host = document.getElementById("cycleCard");
    if (!host) return;
    const pct = pred.cycleDay / pred.cycleLength;
    host.innerHTML =
      '<div class="card-head">' +
      '<div class="icon-badge">' + icon("droplet") + "</div>" +
      "<div><h3>Cycle today</h3><p>Based on the dates you have logged</p></div>" +
      '<a class="btn btn-ghost btn-sm" href="menstrual.html" style="margin-left:auto">Calendar ' + icon("arrow-right") + "</a></div>" +
      '<div class="ring-wrap">' + JV.ui.ring(pct, { size: 190, stroke: 12 }) +
      '<div class="ring-center"><span class="big">' + pred.cycleDay + '</span>' +
      '<span class="small-lbl">of ' + pred.cycleLength + " days</span>" +
      '<span class="phase">' + pred.phase + " phase</span></div></div>" +
      '<div class="cycle-facts">' +
      "<div><span class=\"v\">" + JV.fmtDate(pred.nextStart) + '</span><span class="k">Next period</span></div>' +
      "<div><span class=\"v\">" + JV.fmtDate(pred.ovulation) + '</span><span class="k">Ovulation est.</span></div>' +
      "<div><span class=\"v\">" + (pred.daysUntil === 0 ? "Today" : pred.daysUntil + "d") + '</span><span class="k">Countdown</span></div>' +
      "</div>" +
      '<div class="callout info" style="margin-top:1rem">' + icon("sparkle") + "<p>" + esc(phaseInsight(pred.phase)) + "</p></div>" +
      '<div class="row" style="margin-top:1rem">' +
      '<button class="btn btn-primary btn-sm" type="button" id="logStartBtn">' + icon("plus") + " Period started today</button>" +
      '<a class="btn btn-secondary btn-sm" href="menstrual.html#log">Log flow &amp; symptoms</a>' +
      "</div>";

    host.querySelector("#logStartBtn").addEventListener("click", function () {
      const s = JV.Cycle.settings();
      const d = today();
      if (s.lastStart === d) { JV.toast("Today is already marked as your period start"); return; }
      s.lastStart = d;
      s.logs = (s.logs || []).filter(function (l) { return l.start !== d; });
      s.logs.push({ id: JV.uid(), start: d, periodLength: s.periodLength, flow: "medium", symptoms: [], pain: 0, notes: "" });
      JV.Cycle.saveSettings(s);
      JV.toast("Period start saved — predictions updated");
      renderAll();
    });
  }

  function renderMood() {
    const host = document.getElementById("moodCard");
    if (!host) return;
    const entry = moodFor(today());
    host.innerHTML =
      '<div class="card-head"><div class="icon-badge lav">' + icon("sparkle") + "</div>" +
      "<div><h4 style=\"margin:0\" data-i18n=\"dash.logMood\">How are you feeling today?</h4>" +
      "<p>Tap one — it takes a second</p></div></div>" +
      '<div class="mood-row">' + JV.content.MOODS.map(function (m) {
        const pressed = entry && Number(entry.mood) === m.id;
        return '<button class="mood-btn" type="button" data-mood="' + m.id + '" aria-pressed="' + !!pressed + '">' +
          JV.icon(m.icon, "face") + '<span class="lbl">' + m.key + "</span></button>";
      }).join("") + "</div>" +
      '<p class="tiny muted" style="margin-top:.75rem">' +
      (entry ? "Saved today. You can change it anytime." : "Your moods stay private on this device.") + "</p>" +
      '<a class="btn btn-ghost btn-sm" href="mental.html" style="margin-top:.35rem">Open mood history ' + icon("arrow-right") + "</a>";

    host.querySelectorAll("[data-mood]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const value = Number(btn.getAttribute("data-mood"));
        const list = moodEntries().filter(function (m) { return m.date !== today(); });
        list.push({ id: JV.uid(), date: today(), mood: value, ts: Date.now() });
        list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
        Store.set("moods", list);
        JV.toast("Mood saved for today");
        renderMood();
        renderOverview(JV.Cycle.predict());
      });
    });
  }

  function renderWater() {
    const host = document.getElementById("waterCard");
    if (!host) return;
    const w = waterData();
    const glasses = [];
    for (let i = 0; i < 8; i++) {
      glasses.push('<button class="water-glass ' + (i < w.count ? "filled" : "") + '" type="button" data-glass="' + (i + 1) +
        '" aria-label="' + (i + 1) + ' glasses of water" aria-pressed="' + (i < w.count) + '"></button>');
    }
    host.innerHTML =
      '<div class="card-head"><div class="icon-badge teal">' + icon("water") + "</div>" +
      '<div style="flex:1"><h4 style="margin:0">Water today</h4><p>Simple goal: 8 glasses</p></div>' +
      '<span class="badge teal">' + w.count + "/8</span></div>" +
      '<div class="water-row">' + glasses.join("") + "</div>" +
      '<div class="progress teal"><span style="width:' + Math.min(100, (w.count / 8) * 100) + '%"></span></div>' +
      '<p class="tiny muted" style="margin-top:.6rem">' +
      (w.count >= 8 ? "Goal reached — well done." : (8 - w.count) + " more to reach today's goal.") + "</p>";

    host.querySelectorAll("[data-glass]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const idx = Number(btn.getAttribute("data-glass"));
        const cur = waterData().count;
        const next = Math.max(0, idx === cur ? idx - 1 : idx);
        Store.set("water", { date: today(), count: next });
        renderWater();
        renderOverview(JV.Cycle.predict());
      });
    });
  }

  function renderReminders(pred) {
    const host = document.getElementById("reminderCard");
    if (!host) return;
    const settings = JV.Cycle.settings();
    const moodDone = !!moodFor(today());
    const water = waterData().count;

    const items = [];
    if (pred.daysUntil <= 3) {
      items.push({ icon: "bell", title: "Period expected in " + pred.daysUntil + " days", text: "Keep a pad or cup in your bag. Log the first day when it starts.", tone: "pink" });
    } else {
      items.push({ icon: "calendar", title: "Next period " + JV.fmtDate(pred.nextStart), text: pred.daysUntil + " days away — predictions update when you log.", tone: "lav" });
    }
    items.push({
      icon: "sparkle",
      title: moodDone ? "Mood logged today" : "Mood check-in pending",
      text: moodDone ? "Thank you for checking in." : "One tap on the mood row is enough.",
      tone: moodDone ? "teal" : "amber"
    });
    if (water < 8) {
      items.push({ icon: "water", title: "Water: " + water + " of 8 glasses", text: "Keep a bottle nearby and sip through the day.", tone: "teal" });
    }
    if (pred.irregular) {
      items.push({ icon: "alert", title: "Your cycles vary more than 7 days", text: "Worth mentioning at your next health visit.", tone: "amber" });
    }

    host.innerHTML =
      '<div class="card-head"><div class="icon-badge amber">' + icon("bell") + "</div>" +
      "<div><h4 style=\"margin:0\">Reminders</h4><p>Gentle nudges, never noisy</p></div></div>" +
      '<div class="stack-sm">' + items.map(function (i) {
        return '<div class="reminder-item"><div class="reminder-dot ' + i.tone + '">' + icon(i.icon) + "</div>" +
          "<div><h5>" + esc(i.title) + "</h5><p>" + esc(i.text) + "</p></div></div>";
      }).join("") + "</div>" +
      '<div class="row" style="margin-top:.85rem;gap:.5rem">' +
      '<button class="btn btn-secondary btn-sm" type="button" id="notifyBtn">' + icon("bell") +
      (settings.reminders ? " Reminder on" : " Turn on reminder") + "</button>" +
      '<a class="btn btn-ghost btn-sm" href="menstrual.html#reminders">Settings</a></div>' +
      '<p class="tiny muted" style="margin-top:.6rem">Browser reminders appear while this site is open. For a guaranteed alert, note the date in your phone calendar too.</p>';

    const btn = host.querySelector("#notifyBtn");
    btn.addEventListener("click", function () {
      if (!("Notification" in window)) { JV.toast("This browser cannot show reminders", "error"); return; }
      Notification.requestPermission().then(function (perm) {
        if (perm === "granted") {
          JV.Cycle.saveSettings({ reminders: true });
          try {
            new Notification("JIVIKA AROGYA", {
              body: "Your period is expected in " + pred.daysUntil + " days. Take care of yourself.",
              icon: "assets/img/favicon.svg"
            });
          } catch (e) { /* some browsers block construction on http */ }
          JV.toast("Period reminders turned on");
          renderReminders(JV.Cycle.predict());
        } else {
          JV.toast("Notifications blocked — you can still read reminders here", "error");
        }
      });
    });
  }

  function renderTip() {
    const host = document.getElementById("tipCard");
    if (!host) return;
    const tips = JV.content.TIPS;
    const idx = (Math.floor(Date.now() / 86400000) + tipOffset) % tips.length;
    const tip = tips[idx];
    const lang = JV.i18n.get();
    const text = lang === "hi" && tip.hi ? tip.hi : lang === "kn" && tip.kn ? tip.kn : tip.en;
    host.innerHTML =
      '<div class="row-between" style="position:relative;z-index:1">' +
      '<span class="eyebrow" style="margin:0" data-i18n="dash.tip">Today\'s health tip</span>' +
      '<button class="icon-btn" type="button" id="newTip" aria-label="Show another tip">' + icon("refresh") + "</button></div>" +
      "<blockquote style=\"margin-top:.5rem\">" + esc(text) + "</blockquote>" +
      '<div class="tip-meta"><span class="badge neutral">' + esc(tip.tag) + "</span>" +
      '<span>·</span><span>' + (idx + 1) + " of " + tips.length + "</span></div>";
    host.querySelector("#newTip").addEventListener("click", function () {
      tipOffset += 1;
      renderTip();
    });
  }

  function renderPreventive() {
    const host = document.getElementById("preventiveCard");
    if (!host) return;
    const P = JV.preventive;
    if (!P) { host.hidden = true; return; }
    const s = P.summary(Store.get("preventive", null));
    const sessionOnly = Store.profile().consent.store === false;
    const age = s.ageGroup
      ? tr("pv.age." + (s.ageGroup.id === "60-plus" ? "60" : s.ageGroup.id), s.ageGroup.title)
      : "";

    let html = '<div class="card-head"><div class="icon-badge lav">' + icon("shield-check") + "</div>" +
      '<div><h4 style="margin:0">' + esc(tr("pv.dashTitle", "My Preventive Health Plan")) + "</h4>" +
      "<p>" + esc(tr("pv.dashSub", "Age-wise screening, appointments and follow-ups")) + "</p></div>" +
      '<a class="btn btn-ghost btn-sm" href="preventive.html" style="margin-left:auto">' +
      esc(tr("pv.viewPlan", "Open my plan")) + " " + icon("arrow-right") + "</a></div>";

    if (!s.hasState) {
      html += '<div class="pv-empty" style="margin-top:.6rem">' +
        esc(tr("pv.dashEmpty", "No checklist yet. It is optional, needs no account, and your answers stay on this device.")) + "</div>" +
        '<div class="pv-dash-foot">' +
        '<a class="btn btn-primary btn-sm" href="preventive.html#pvWizard">' + icon("shield-check") + " " +
        esc(tr("pv.start", "Start the checklist")) + "</a>" +
        '<a class="btn btn-secondary btn-sm" href="preventive.html#pvLibrary">' + icon("book") + " " +
        esc(tr("pv.library", "Screening library")) + "</a></div>";
      host.innerHTML = html;
      return;
    }

    html += '<div class="pv-dash-stats">' +
      '<div class="pv-dash-stat due"><b>' + (s.counts["not-reviewed"] || 0) + "</b><span>" + esc(pvStatusText("not-reviewed")) + "</span></div>" +
      '<div class="pv-dash-stat discuss"><b>' + s.counts.discuss + "</b><span>" + esc(pvStatusText("discuss")) + "</span></div>" +
      '<div class="pv-dash-stat scheduled"><b>' + s.counts.scheduled + "</b><span>" + esc(pvStatusText("scheduled")) + "</span></div>" +
      '<div class="pv-dash-stat"><b>' + s.counts.completed + "</b><span>" + esc(pvStatusText("completed")) + "</span></div></div>";

    html += '<p class="tiny muted" style="margin:0 0 .35rem">' + esc(tr("pv.ageGroup", "Age group")) +
      ": <strong>" + esc(age || tr("pv.general", "Not set")) + "</strong>" +
      (sessionOnly ? ' · <span style="color:var(--amber-ink)">' + esc(JV.i18n.t("pv.sessionOnly")) + "</span>" : "") + "</p>";

    if (s.items.length) {
      html += '<div class="pv-dash-list">' + s.items.slice(0, 4).map(function (item) {
        const tone = item.status === "completed" ? "teal" : item.status === "scheduled" ? "lavender" :
          item.status === "discuss" ? "amber" : "neutral";
        return '<div class="pv-dash-row"><span>' + esc(item.name) + "</span>" +
          '<span class="badge ' + tone + '">' + esc(pvStatusText(item.status)) + "</span></div>";
      }).join("") + "</div>";
      if (s.items.length > 4) {
        html += '<p class="tiny muted" style="margin:.1rem 0 0">+' + (s.items.length - 4) + "</p>";
      }
    } else {
      html += '<div class="pv-empty">' + esc(tr("pv.planEmpty", "No plan yet. Add screenings from your results.")) + "</div>";
    }

    if (s.upcoming.length) {
      const next = s.upcoming[0];
      html += '<div class="callout info" style="margin:.6rem 0 0">' + icon("calendar") +
        "<p><strong>" + esc(tr("pv.upcoming", "Upcoming appointment")) + ":</strong> " + esc(next.name) + " · " +
        esc(JV.fmtDate(next.date, { day: "numeric", month: "short" })) + "</p></div>";
    }
    if (s.reminders.length) {
      html += '<p class="tiny muted" style="margin:.45rem 0 0">' + icon("bell") + " " + s.reminders.length + " " +
        esc(tr("pv.reminders", "Reminders")) + (s.remindersEnabled ? "" : " (" + esc(JV.i18n.t("pv.remindersOff")) + ")") + "</p>";
    }

    html += '<div class="pv-dash-foot">' +
      '<a class="btn btn-primary btn-sm" href="preventive.html#pvPlan">' + icon("calendar") + " " +
      esc(tr("pv.viewPlan", "Open my plan")) + "</a>" +
      '<a class="btn btn-secondary btn-sm" href="preventive.html#pvCare">' + icon("pin") + " " +
      esc(tr("pv.findCare", "Find screening near you")) + "</a>" +
      '<a class="btn btn-ghost btn-sm" href="preventive.html#pvWarnings">' + icon("alert") + " " +
      esc(tr("pv.warning", "Early warning signs")) + "</a></div>";
    host.innerHTML = html;
  }

  function renderQuick() {
    const host = document.getElementById("quickGrid");
    if (!host) return;
    const ids = ["preventive", "menstrual", "physical", "mental", "nutrition", "healthcare", "schemes", "assistant", "profile"];
    host.innerHTML = JV.NAV.filter(function (n) { return ids.indexOf(n.id) !== -1; }).map(function (n) {
      return '<a class="quick-link" href="' + n.href + '">' + icon(n.icon) + "<span>" + esc(JV.i18n.t(n.key)) + "</span></a>";
    }).join("");
  }

  function renderAll() {
    const pred = JV.Cycle.predict();
    renderWelcome(pred);
    renderOverview(pred);
    renderCycle(pred);
    renderPreventive();
    renderMood();
    renderWater();
    renderReminders(pred);
    renderTip();
    renderQuick();
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderAll();
    document.addEventListener("jivika:lang", renderAll);
  });
})();
