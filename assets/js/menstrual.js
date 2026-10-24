/* ==========================================================================
   Menstrual health — calendar, predictions, logging, reminders
   ========================================================================== */
(function () {
  "use strict";

  const Cycle = JV.Cycle;
  const icon = JV.icon;
  const esc = JV.esc;
  const now = new Date();
  let view = new Date(now.getFullYear(), now.getMonth(), 1);
  let selected = JV.toISO(now);

  function today() { return JV.toISO(new Date()); }

  function isPeriodDay(date, s) {
    return s.logs.some(function (l) {
      if (!l.start) return false;
      const st = JV.parseISO(l.start);
      const len = Number(l.periodLength) || s.periodLength;
      const en = JV.addDays(st, len - 1);
      return date >= st && date <= en;
    });
  }

  function inRange(date, start, end) {
    return date >= JV.startOfDay(start) && date <= JV.startOfDay(end);
  }

  /* ---------- calendar ---------- */
  function renderCalendar() {
    const host = document.getElementById("calCard");
    if (!host) return;
    const s = Cycle.settings();
    const pred = Cycle.predict(s);
    const year = view.getFullYear();
    const month = view.getMonth();
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const lead = first.getDay();
    const logged = {};
    s.days.forEach(function (d) { logged[d.date] = true; });

    const dows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    let cells = dows.map(function (d) { return '<div class="cal-dow">' + d + "</div>"; }).join("");
    for (let i = 0; i < lead; i++) cells += '<div class="cal-cell empty"></div>';

    const todayDate = JV.startOfDay(new Date());
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = JV.toISO(date);
      let cls = "cal-cell";
      let label = JV.fmtDate(date);
      if (isPeriodDay(date, s)) { cls += " period"; label += ", period day"; }
      else if (pred.upcoming.some(function (w) { return inRange(date, w.start, w.end); })) { cls += " predicted"; label += ", predicted period"; }
      else if (JV.daysBetween(date, pred.ovulation) === 0) { cls += " ovulation"; label += ", estimated ovulation"; }
      else if (inRange(date, pred.fertileStart, pred.fertileEnd)) { cls += " fertile"; label += ", fertile window"; }
      if (date.getTime() === todayDate.getTime()) { cls += " today"; label += ", today"; }
      if (logged[iso]) cls += " has-log";
      cells += '<button type="button" class="' + cls + '" data-date="' + iso + '" title="' + esc(label) + '" aria-label="' + esc(label) + '">' + d + "</button>";
    }

    host.innerHTML =
      '<div class="cal-head">' +
      '<button class="icon-btn" type="button" id="calPrev" aria-label="Previous month">' + icon("chevron-left") + "</button>" +
      "<div style=\"text-align:center\"><div class=\"cal-title\">" + esc(JV.fmtMonth(view)) + "</div>" +
      '<button class="btn btn-ghost btn-sm" type="button" id="calToday" style="padding:.1rem .5rem;min-height:26px;font-size:.72rem">Back to today</button></div>' +
      '<button class="icon-btn" type="button" id="calNext" aria-label="Next month">' + icon("chevron-right") + "</button></div>" +
      '<div class="cal-grid" role="grid" aria-label="Cycle calendar">' + cells + "</div>" +
      '<div class="cal-legend">' +
      '<span><i style="background:linear-gradient(135deg,#f7a7be,#a98be6)"></i>Period</span>' +
      '<span><i style="background:color-mix(in srgb, var(--pink-500) 26%, transparent)"></i>Predicted</span>' +
      '<span><i style="background:color-mix(in srgb, var(--teal-500) 30%, transparent)"></i>Fertile</span>' +
      '<span><i style="background:var(--teal-50);border:1.4px solid var(--teal-400)"></i>Ovulation</span>' +
      '<span><i style="background:transparent;border:2px solid var(--lav-500)"></i>Today</span>' +
      "</div>" +
      '<p class="tiny muted" style="margin-top:.7rem">Tap any day to log flow and symptoms for that date.</p>';

    host.querySelector("#calPrev").addEventListener("click", function () {
      view = new Date(year, month - 1, 1); renderCalendar();
    });
    host.querySelector("#calNext").addEventListener("click", function () {
      view = new Date(year, month + 1, 1); renderCalendar();
    });
    host.querySelector("#calToday").addEventListener("click", function () {
      view = new Date(now.getFullYear(), now.getMonth(), 1); renderCalendar();
    });
    host.querySelectorAll(".cal-cell[data-date]").forEach(function (cell) {
      cell.addEventListener("click", function () {
        selected = cell.getAttribute("data-date");
        loadDay(selected);
        const logSection = document.getElementById("log");
        if (logSection) logSection.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- summary ---------- */
  function renderSummary() {
    const host = document.getElementById("summaryCard");
    if (!host) return;
    const pred = Cycle.predict();
    const pct = Math.round((pred.cycleDay / pred.cycleLength) * 100);

    host.innerHTML =
      '<div class="card-head"><div class="icon-badge">' + icon("droplet") + "</div>" +
      "<div><h3>Your cycle</h3><p>Estimates based on your last period</p></div></div>" +
      '<div class="stack-sm">' +
      '<div><div class="stat-value">' + (pred.daysUntil === 0 ? "Today" : pred.daysUntil) + "</div>" +
      '<div class="stat-label">' + (pred.daysUntil === 0 ? "Period expected today" : "Days until next period") + "</div></div>" +
      '<div class="progress" style="margin-top:.5rem"><span style="width:' + pct + '%"></span></div>' +
      '<div class="row-between tiny muted"><span>Day ' + pred.cycleDay + " of " + pred.cycleLength + "</span><span>" + pct + "%</span></div>" +
      "</div>" +
      '<div class="cycle-facts" style="margin-top:1.1rem">' +
      '<div><span class="v">' + JV.fmtDate(pred.nextStart) + '</span><span class="k">Next period</span></div>' +
      '<div><span class="v">' + JV.fmtDate(pred.ovulation) + '</span><span class="k">Ovulation est.</span></div>' +
      '<div><span class="v">' + JV.fmtDate(pred.fertileStart) + " – " + JV.fmtDate(pred.fertileEnd) + '</span><span class="k">Fertile window</span></div>' +
      "</div>" +
      '<div class="callout" style="margin-top:1rem">' + icon("calendar") +
      "<p><strong>Next three periods:</strong><br>" +
      pred.upcoming.map(function (w) {
        return JV.fmtDate(w.start) + " – " + JV.fmtDate(w.end);
      }).join("<br>") + "</p></div>" +
      (pred.irregular ? '<div class="callout warn" style="margin-top:.6rem">' + icon("alert") +
        "<p><strong>Your cycles vary by more than 7 days.</strong> Mention this at your next health visit — it can be simple to treat, but it should be checked.</p></div>" : "") +
      '<p class="tiny muted" style="margin-top:.75rem">The fertile window is for information only. It is not a contraception method.</p>';
  }

  /* ---------- settings ---------- */
  function renderSettings() {
    const s = Cycle.settings();
    const last = document.getElementById("setLast");
    if (!last) return;
    last.value = s.lastStart;
    document.getElementById("setCycle").value = s.cycleLength;
    document.getElementById("setPeriod").value = s.periodLength;
  }

  /* ---------- reminders ---------- */
  function renderReminders() {
    const host = document.getElementById("reminderSettings");
    if (!host) return;
    const s = Cycle.settings();
    const pred = Cycle.predict();
    const opts = [1, 2, 3, 5, 7].map(function (n) {
      return '<option value="' + n + '"' + (s.reminderDays === n ? " selected" : "") + ">" + n + " day" + (n > 1 ? "s" : "") + " before</option>";
    }).join("");

    host.innerHTML =
      '<div class="card-head"><div class="icon-badge amber sm">' + icon("bell") + "</div>" +
      "<div><h4 style=\"margin:0\">Period reminders</h4><p>For " + esc(JV.fmtDate(pred.nextStart)) + "</p></div></div>" +
      '<label class="switch" style="margin-bottom:.9rem"><input type="checkbox" id="remToggle"' + (s.reminders ? " checked" : "") + '>' +
      '<span class="track"></span><span>Remind me before my period</span></label>' +
      '<div class="field"><label for="remDays">When should we remind you?</label>' +
      '<select class="select" id="remDays"' + (s.reminders ? "" : " disabled") + ">" + opts + "</select></div>" +
      '<button class="btn btn-secondary btn-block btn-sm" type="button" id="remNotify">' + icon("bell") + " Allow browser notifications</button>" +
      '<p class="tiny muted" style="margin-top:.6rem">Notifications appear while this page or site is open in your browser. ' +
      "For an alert you can rely on, also mark the date in your phone calendar.</p>";

    host.querySelector("#remToggle").addEventListener("change", function (e) {
      Cycle.saveSettings({ reminders: e.target.checked });
      renderReminders();
      JV.toast(e.target.checked ? "Reminders on" : "Reminders off");
    });
    host.querySelector("#remDays").addEventListener("change", function (e) {
      Cycle.saveSettings({ reminderDays: Number(e.target.value) });
      JV.toast("You will be reminded " + e.target.value + " days before");
    });
    host.querySelector("#remNotify").addEventListener("click", function () {
      if (!("Notification" in window)) { JV.toast("This browser cannot show notifications", "error"); return; }
      Notification.requestPermission().then(function (p) {
        if (p === "granted") {
          Cycle.saveSettings({ reminders: true });
          JV.toast("Notifications allowed");
          renderReminders();
        } else {
          JV.toast("Notifications blocked in browser settings", "error");
        }
      });
    });
  }

  /* ---------- insights ---------- */
  function renderInsights() {
    const host = document.getElementById("insightsCard");
    if (!host) return;
    const s = Cycle.settings();
    const days = s.days.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    const count = {};
    let painSum = 0;
    days.forEach(function (d) {
      painSum += Number(d.pain) || 0;
      (d.symptoms || []).forEach(function (id) { count[id] = (count[id] || 0) + 1; });
    });
    const top = Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, 5);

    host.innerHTML =
      '<div class="card-head"><div class="icon-badge lav sm">' + icon("sparkle") + "</div>" +
      "<div><h4 style=\"margin:0\">Your patterns</h4><p>From " + days.length + " logged " + (days.length === 1 ? "day" : "days") + "</p></div></div>" +
      (days.length === 0
        ? '<p class="small muted" style="margin:0">Log a few days and common symptoms will appear here — helpful to show a doctor.</p>'
        : '<div class="stack-sm">' +
          top.map(function (id) {
            const sym = JV.content.SYMPTOMS.filter(function (x) { return x.id === id; })[0];
            const label = sym ? sym.label : id;
            const pct = Math.round((count[id] / days.length) * 100);
            return '<div><div class="row-between tiny" style="font-weight:700"><span>' + esc(label) +
              "</span><span class=\"muted\">" + count[id] + "×</span></div>" +
              '<div class="progress" style="height:6px;margin-top:.25rem"><span style="width:' + Math.min(100, pct) + '%"></span></div></div>';
          }).join("") +
          '<div class="row-between" style="margin-top:.6rem"><span class="small muted">Average pain</span>' +
          '<span class="badge">' + (painSum / days.length).toFixed(1) + "/10</span></div>" +
          "</div>") +
      '<a class="btn btn-ghost btn-sm" href="#log" style="margin-top:.7rem">Log today ' + icon("arrow-right") + "</a>";
  }

  /* ---------- history ---------- */
  function renderHistory() {
    const host = document.getElementById("historyCard");
    if (!host) return;
    const s = Cycle.settings();
    const days = s.days.slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; }).slice(0, 6);

    host.innerHTML =
      '<div class="card-head"><div class="icon-badge teal"><' + 'svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path d="M12 6.5C10.5 5 8 4.5 4.5 4.5v13c3.5 0 6 .5 7.5 2 1.5-1.5 4-2 7.5-2v-13c-3.5 0-6 .5-7.5 2Z"/><path d="M12 6.5v13"/></svg></div>' +
      "<div><h3>Recent logs</h3><p>Tap a day to edit it</p></div></div>" +
      (days.length === 0
        ? '<div class="empty-state"><div class="icon-badge"><' + 'svg class="ic" viewBox="0 0 24 24" aria-hidden="true">' +
          '<path d="M12 3.2c3.4 3.7 6 7 6 10a6 6 0 0 1-12 0c0-3 2.6-6.3 6-10Z"/></svg></div>' +
          "<h4>No days logged yet</h4><p>Start with today — flow, pain and one or two symptoms is plenty.</p></div>"
        : '<div>' + days.map(function (d) {
          const dt = JV.parseISO(d.date);
          const syms = (d.symptoms || []).map(function (id) {
            const x = JV.content.SYMPTOMS.filter(function (y) { return y.id === id; })[0];
            return x ? x.label : id;
          }).join(", ");
          const flow = (JV.content.FLOW.filter(function (f) { return f.id === d.flow; })[0] || {}).label || d.flow;
          return '<div class="log-item"><div class="log-date"><span class="d">' + dt.getDate() +
            '</span><span class="m">' + JV.fmtDate(dt, { month: "short" }) + "</span></div>" +
            '<div style="flex:1;min-width:0"><h5>' + esc(flow) + " flow · pain " + (d.pain || 0) + "/10</h5>" +
            "<p>" + esc(syms || "No symptoms recorded") + (d.notes ? " · " + esc(d.notes) : "") + "</p></div>" +
            '<div class="row" style="flex:none;gap:.2rem">' +
            '<button class="icon-btn" type="button" data-edit="' + d.date + '" aria-label="Edit">' + icon("edit") + "</button>" +
            '<button class="icon-btn" type="button" data-del="' + d.date + '" aria-label="Delete">' + icon("trash") + "</button></div></div>";
        }).join("") + "</div>") +
      (s.logs.length ? '<details class="acc" style="margin-top:.9rem"><summary>Period starts (' + s.logs.length + ")" + icon("chevron-down") + "</summary>" +
        '<div class="acc-body"><ul>' + s.logs.slice().sort(function (a, b) { return a.start < b.start ? 1 : -1; }).map(function (l) {
          return "<li>" + esc(JV.fmtDate(l.start)) + " · " + (Number(l.periodLength) || s.periodLength) + " days</li>";
        }).join("") + "</ul></div></details>" : "");

    host.querySelectorAll("[data-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const date = btn.getAttribute("data-del");
        JV.confirm({ title: "Delete this log?", message: "The entry for " + JV.fmtDate(date) + " will be removed.", confirm: "Delete", danger: true })
          .then(function (ok) {
            if (!ok) return;
            const settings = Cycle.settings();
            settings.days = settings.days.filter(function (d) { return d.date !== date; });
            Cycle.saveSettings(settings);
            JV.toast("Log deleted");
            renderAll();
          });
      });
    });
    host.querySelectorAll("[data-edit]").forEach(function (btn) {
      btn.addEventListener("click", function () { loadDay(btn.getAttribute("data-edit")); });
    });
  }

  /* ---------- day form ---------- */
  function buildSymptoms() {
    const host = document.getElementById("symptomPick");
    if (!host) return;
    host.innerHTML = JV.content.SYMPTOMS.map(function (s) {
      return '<label><input type="checkbox" name="symptom" value="' + s.id + '"> ' + esc(s.label) + "</label>";
    }).join("");
  }

  function loadDay(iso) {
    const s = Cycle.settings();
    const entry = s.days.filter(function (d) { return d.date === iso; })[0];
    selected = iso;
    document.getElementById("logDate").value = iso;
    document.getElementById("logFlow").value = entry ? entry.flow : "medium";
    document.getElementById("logPain").value = entry ? entry.pain || 0 : 0;
    document.getElementById("painValue").textContent = entry ? entry.pain || 0 : 0;
    document.getElementById("logNotes").value = entry ? entry.notes || "" : "";
    document.querySelectorAll('#symptomPick input').forEach(function (cb) {
      cb.checked = !!(entry && (entry.symptoms || []).indexOf(cb.value) !== -1);
    });
    document.getElementById("logStart").checked = s.lastStart === iso;
  }

  /* ---------- render all ---------- */
  function renderAll() {
    renderCalendar();
    renderSummary();
    renderSettings();
    renderReminders();
    renderInsights();
    renderHistory();
  }

  function startPeriod(dateISO, opts) {
    const s = Cycle.settings();
    const d = dateISO || today();
    s.lastStart = d;
    s.logs = s.logs.filter(function (l) { return l.start !== d; });
    s.logs.push({
      id: JV.uid(), start: d, periodLength: (opts && opts.periodLength) || s.periodLength,
      flow: (opts && opts.flow) || "medium", symptoms: [], pain: 0, notes: ""
    });
    Cycle.saveSettings(s);
    JV.toast("Period start saved — predictions updated");
    renderAll();
  }

  function init() {
    buildSymptoms();
    renderAll();
    loadDay(today());

    const pain = document.getElementById("logPain");
    pain.addEventListener("input", function () {
      document.getElementById("painValue").textContent = pain.value;
    });

    document.getElementById("logForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const settings = Cycle.settings();
      const date = document.getElementById("logDate").value || today();
      const flow = document.getElementById("logFlow").value;
      const painVal = Number(document.getElementById("logPain").value) || 0;
      const symptoms = Array.prototype.slice.call(document.querySelectorAll('#symptomPick input:checked')).map(function (c) { return c.value; });
      const notes = document.getElementById("logNotes").value.trim();
      const isStart = document.getElementById("logStart").checked;

      settings.days = settings.days.filter(function (d) { return d.date !== date; });
      settings.days.push({ id: JV.uid(), date: date, flow: flow, pain: painVal, symptoms: symptoms, notes: notes });
      settings.days.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      Cycle.saveSettings(settings);

      if (isStart) {
        startPeriod(date, { flow: flow });
      } else {
        JV.toast("Day saved" + (symptoms.length ? " with " + symptoms.length + " symptoms" : ""));
        renderAll();
      }
      loadDay(date);
    });

    document.getElementById("settingsForm").addEventListener("submit", function (e) {
      e.preventDefault();
      const last = document.getElementById("setLast").value;
      const len = Number(document.getElementById("setCycle").value);
      const plen = Number(document.getElementById("setPeriod").value);
      if (!last) { JV.toast("Please choose the first day of your last period", "error"); return; }
      if (len < 18 || len > 60) { JV.toast("Cycle length should be between 18 and 60 days", "error"); return; }
      if (plen < 1 || plen > 12) { JV.toast("Bleeding days should be between 1 and 12", "error"); return; }
      Cycle.saveSettings({ lastStart: last, cycleLength: len, periodLength: plen });
      JV.toast("Cycle settings updated");
      view = new Date(JV.parseISO(last).getFullYear(), JV.parseISO(last).getMonth(), 1);
      renderAll();
    });

    document.getElementById("logForm").addEventListener("reset", function () {
      setTimeout(function () { loadDay(today()); }, 0);
    });

    document.getElementById("startToday").addEventListener("click", function () {
      const s = Cycle.settings();
      if (s.lastStart === today()) { JV.toast("Today is already marked as day 1"); return; }
      startPeriod(today());
      loadDay(today());
    });

    document.addEventListener("jivika:lang", renderAll);

    if (location.hash === "#log") {
      loadDay(today());
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
