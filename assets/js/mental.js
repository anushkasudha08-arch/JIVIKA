/* ==========================================================================
   Mental wellness — mood check-in, history, breathing, self-care, journal
   ========================================================================== */
(function () {
  "use strict";

  const C = JV.content;
  const W = JV.wellbeing;
  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;
  const MOODS = C.MOODS;

  let selectedMood = 0;

  function today() { return JV.toISO(new Date()); }
  function moodEntries() {
    const list = Store.get("moods", []);
    return Array.isArray(list) ? list : [];
  }
  function entryFor(date) {
    return moodEntries().filter(function (e) { return e.date === date; })[0] || null;
  }
  function moodLabel(id) {
    const m = MOODS.filter(function (x) { return x.id === Number(id); })[0];
    return m ? m.key : "—";
  }

  /* ---------- mood check-in ---------- */
  function initCheckin() {
    const host = document.getElementById("moodRow");
    if (!host) return;
    const entry = entryFor(today());
    selectedMood = entry ? Number(entry.mood) : 0;

    const note = document.getElementById("moodNote");
    if (note && entry && entry.note) note.value = entry.note;

    host.innerHTML = MOODS.map(function (m) {
      const on = selectedMood === m.id;
      return '<button class="mood-btn" type="button" data-mood="' + m.id + '" aria-pressed="' + on +
        '" aria-label="' + esc(m.key) + '">' + icon(m.icon, "face") +
        '<span class="lbl">' + esc(m.key) + "</span></button>";
    }).join("");

    host.querySelectorAll("[data-mood]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedMood = Number(btn.getAttribute("data-mood"));
        host.querySelectorAll("[data-mood]").forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
      });
    });

    const saved = document.getElementById("moodSaved");
    if (saved) saved.textContent = entry ? "Saved today · you can update it" : "Not saved yet";

    const saveBtn = document.getElementById("saveMood");
    if (!saveBtn) return;
    saveBtn.addEventListener("click", function () {
      if (!selectedMood) {
        JV.toast("Choose how you feel first", "error");
        return;
      }
      const noteEl = document.getElementById("moodNote");
      const noteText = (noteEl ? noteEl.value : "").trim().slice(0, 240);
      const list = moodEntries().filter(function (e) { return e.date !== today(); });
      list.push({ id: JV.uid(), date: today(), mood: selectedMood, note: noteText, ts: Date.now() });
      list.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
      Store.set("moods", list);
      document.getElementById("moodSaved").textContent = "Saved today · just now";
      JV.toast("Check-in saved for today");
      renderHistory();
    });
  }

  /* ---------- mood history ---------- */
  function renderHistory() {
    const host = document.getElementById("moodHistory");
    if (!host) return;

    const entries = moodEntries();
    const byDate = {};
    entries.forEach(function (e) { byDate[e.date] = e; });

    const days = [];
    for (let i = 13; i >= 0; i--) days.push(JV.toISO(JV.addDays(new Date(), -i)));

    const bars = days.map(function (iso) {
      const e = byDate[iso];
      const m = e ? JV.clamp(Number(e.mood) || 0, 0, 5) : 0;
      const d = JV.parseISO(iso);
      const h = m ? 10 + m * 20 : 4;
      const title = JV.fmtDate(d) + " · " + (e ? moodLabel(m) : "No check-in") +
        (e && e.note ? " — " + e.note : "");
      return '<div class="mood-bar-col"><div class="mood-bar ' + (m ? "b" + m : "empty") +
        '" style="height:' + h + 'px" title="' + esc(title) + '"></div>' +
        '<span class="mood-bar-day">' + esc(JV.weekdayShort(d).slice(0, 2)) + "</span></div>";
    }).join("");

    const week = entries.filter(function (e) {
      return JV.daysBetween(JV.parseISO(e.date), new Date()) <= 6;
    });
    const avg = week.length
      ? week.reduce(function (a, b) { return a + Number(b.mood || 0); }, 0) / week.length
      : 0;

    let streak = 0;
    for (let i = 0; i < 400; i++) {
      const iso = JV.toISO(JV.addDays(new Date(), -i));
      if (byDate[iso]) streak++;
      else if (i > 0) break;
    }

    const counts = {};
    days.forEach(function (iso) {
      if (!byDate[iso]) return;
      const m = Number(byDate[iso].mood);
      counts[m] = (counts[m] || 0) + 1;
    });
    const top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; })[0];

    const notes = entries.filter(function (e) { return e.note && e.note.trim(); })
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .slice(0, 3);

    host.innerHTML =
      '<div class="card-head">' +
      '<div class="icon-badge lav sm">' + icon("sparkle") + "</div>" +
      '<div><h3 style="margin:0">Your mood history</h3><p>Last 14 days</p></div>' +
      '<span class="badge" style="margin-left:auto">' + entries.length + " logged</span></div>" +
      '<div class="mood-bar-chart" role="img" aria-label="Mood over the last 14 days">' + bars + "</div>" +
      '<div class="row-between tiny muted" style="margin-top:.35rem"><span>2 weeks ago</span><span>Today</span></div>' +
      '<div class="grid-3" style="gap:.6rem;margin-top:1.1rem">' +
      '<div class="stat"><span class="stat-value" style="font-size:1.3rem">' + (avg ? avg.toFixed(1) + "/5" : "—") +
      '</span><span class="stat-label">7-day average</span></div>' +
      '<div class="stat"><span class="stat-value" style="font-size:1.3rem">' + streak +
      '</span><span class="stat-label">Day streak</span></div>' +
      '<div class="stat"><span class="stat-value" style="font-size:1.3rem">' + (top ? esc(moodLabel(top)) : "—") +
      '</span><span class="stat-label">Most common</span></div>' +
      "</div>" +
      (notes.length
        ? '<div style="margin-top:1.1rem"><h5 style="margin:0 0 .3rem;font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Recent notes</h5>' +
          notes.map(function (e) {
            return '<div class="data-row"><div class="dr-body"><h5>' + JV.fmtDate(e.date) + " · " +
              esc(moodLabel(e.mood)) + '</h5><p style="white-space:pre-wrap">' + esc(e.note) + "</p></div>" +
              '<button class="icon-btn" type="button" data-note-del="' + esc(e.id) + '" aria-label="Delete this note">' +
              icon("trash") + "</button></div>";
          }).join("") + "</div>"
        : '<p class="tiny muted" style="margin:1rem 0 0">Notes you add with a check-in will appear here — ' +
          "sometimes they show a pattern that is worth telling a doctor about.</p>") +
      '<p class="tiny muted" style="margin:.8rem 0 0">These records stay in this browser only. ' +
      'You can delete them in <a href="profile.html">Profile &amp; Privacy</a>.</p>';

    host.querySelectorAll("[data-note-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-note-del");
        const list = moodEntries().map(function (e) {
          if (e.id === id) e.note = "";
          return e;
        });
        Store.set("moods", list);
        JV.toast("Note deleted");
        renderHistory();
      });
    });
  }

  /* ---------- breathing exercise ---------- */
  const breath = {
    tech: W.BREATHING[0],
    phases: [],
    step: 0,
    left: 0,
    round: 1,
    running: false,
    started: false,
    done: false,
    timer: null
  };

  function buildPhases(t) {
    const p = [{ label: "Breathe in", secs: t.inhale, cls: "inhale" }];
    if (t.hold) p.push({ label: "Hold", secs: t.hold, cls: "" });
    p.push({ label: "Breathe out", secs: t.exhale, cls: "exhale" });
    if (t.holdOut) p.push({ label: "Hold", secs: t.holdOut, cls: "" });
    return p;
  }

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function updateBreathButton() {
    const btn = document.getElementById("breathStart");
    if (!btn) return;
    const label = breath.running ? "Pause" : breath.done ? "Start again" : breath.started ? "Resume" : "Start";
    btn.innerHTML = icon(breath.running ? "pause" : "play") + " " + label;
  }

  function paintBreath() {
    const phase = breath.phases[breath.step] || breath.phases[0];
    const orb = document.getElementById("breathOrb");
    if (orb) {
      orb.classList.remove("inhale", "exhale");
      if (breath.running && phase && phase.cls) orb.classList.add(phase.cls);
    }
    setText("breathCount", breath.running ? breath.left : phase ? phase.secs : breath.tech.inhale);
    setText("breathLabel", breath.running ? phase.label : breath.done ? "Done" : "Ready");
    setText("breathRound", "Round " + Math.min(breath.round, breath.tech.rounds) + " of " + breath.tech.rounds);
    updateBreathButton();
  }

  function stopBreathTimer() {
    if (breath.timer) clearInterval(breath.timer);
    breath.timer = null;
  }

  function tickBreath() {
    breath.left--;

    if (breath.left <= 0) {
      breath.step++;
      if (breath.step >= breath.phases.length) {
        breath.step = 0;
        breath.round++;
        if (breath.round > breath.tech.rounds) {
          finishBreath();
          return;
        }
      }
      breath.left = breath.phases[breath.step].secs;
    }

    paintBreath();
  }

  function startBreath() {
    if (breath.running) {
      breath.running = false;
      stopBreathTimer();
      setText("breathLabel", "Paused");
      updateBreathButton();
      return;
    }

    if (breath.done) resetBreath();

    if (!breath.started) {
      breath.phases = buildPhases(breath.tech);
      breath.step = 0;
      breath.left = breath.phases[0].secs;
      breath.started = true;
    }

    breath.running = true;
    paintBreath();
    stopBreathTimer();
    breath.timer = setInterval(tickBreath, 1000);
  }

  function finishBreath() {
    stopBreathTimer();
    breath.running = false;
    breath.done = true;
    breath.started = false;
    breath.round = breath.tech.rounds;
    const orb = document.getElementById("breathOrb");
    if (orb) orb.classList.remove("inhale", "exhale");
    setText("breathCount", "✓");
    setText("breathLabel", "Well done");
    setText("breathRound", "Completed " + breath.tech.rounds + " rounds");
    updateBreathButton();
    JV.toast("Well done — notice how your body feels");
  }

  function resetBreath() {
    stopBreathTimer();
    breath.running = false;
    breath.done = false;
    breath.started = false;
    breath.step = 0;
    breath.round = 1;
    breath.phases = buildPhases(breath.tech);
    breath.left = breath.phases[0].secs;
    const orb = document.getElementById("breathOrb");
    if (orb) orb.classList.remove("inhale", "exhale");
    setText("breathCount", breath.phases[0].secs);
    setText("breathLabel", "Ready");
    setText("breathRound", "Round 1 of " + breath.tech.rounds);
    updateBreathButton();
  }

  function selectBreath(id) {
    const tech = W.BREATHING.filter(function (b) { return b.id === id; })[0];
    if (!tech) return;
    breath.tech = tech;
    resetBreath();
    const note = document.getElementById("breathNote");
    if (note) note.textContent = tech.note;
    document.querySelectorAll("#breathChips [data-breath]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-breath") === id));
    });
  }

  function initBreath() {
    const host = document.getElementById("breathChips");
    if (!host) return;
    host.innerHTML = W.BREATHING.map(function (b) {
      return '<button class="chip" type="button" data-breath="' + b.id + '" aria-pressed="' +
        (b.id === breath.tech.id) + '">' + esc(b.name) + "</button>";
    }).join("");

    host.addEventListener("click", function (e) {
      const btn = e.target.closest("[data-breath]");
      if (btn) selectBreath(btn.getAttribute("data-breath"));
    });

    const note = document.getElementById("breathNote");
    if (note) note.textContent = breath.tech.note;

    document.getElementById("breathStart").addEventListener("click", startBreath);
    document.getElementById("breathReset").addEventListener("click", resetBreath);
    resetBreath();
  }

  /* ---------- self-care checklist ---------- */
  function selfcareData() {
    const s = Store.get("selfcare", null);
    if (!s || s.date !== today()) return { date: today(), ids: [] };
    return { date: s.date, ids: Array.isArray(s.ids) ? s.ids : [] };
  }

  function renderSelfcare() {
    const host = document.getElementById("selfcareCard");
    if (!host) return;
    const data = selfcareData();
    const total = W.SELF_CARE.length;
    const done = data.ids.length;
    const pct = Math.round((done / total) * 100);

    host.innerHTML =
      '<div class="card-head">' +
      '<div class="icon-badge"><svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.2s-7.6-4.6-7.6-9.9A4.4 4.4 0 0 1 12 7.1a4.4 4.4 0 0 1 7.6 3.2c0 5.3-7.6 9.9-7.6 9.9Z"/></svg></div>' +
      '<div style="flex:1"><h3 style="margin:0">Today\u2019s self-care</h3><p>' + done + " of " + total +
      " done — no score, just care</p></div>" +
      '<span class="badge teal">' + pct + "%</span></div>" +
      '<div class="progress teal" style="margin-bottom:1rem"><span style="width:' + pct + '%"></span></div>' +
      '<div class="checklist">' +
      W.SELF_CARE.map(function (item) {
        const on = data.ids.indexOf(item.id) > -1;
        return '<label class="checklist-item"><input type="checkbox" data-care="' + item.id + '"' +
          (on ? " checked" : "") + "><span>" + esc(item.label) + "</span></label>";
      }).join("") + "</div>" +
      '<p class="tiny muted" style="margin:.85rem 0 0">' + (done === total
        ? "All eight done. That is enough for today."
        : "Pick one thing, not all eight. Small and repeatable beats perfect.") + "</p>";

    host.querySelectorAll("[data-care]").forEach(function (cb) {
      cb.addEventListener("change", function () {
        const id = cb.getAttribute("data-care");
        const cur = selfcareData();
        const ids = cur.ids.slice();
        const idx = ids.indexOf(id);
        if (idx > -1) ids.splice(idx, 1); else ids.push(id);
        Store.set("selfcare", { date: today(), ids: ids });
        renderSelfcare();
        if (ids.length === total) JV.toast("All eight done — take a moment to notice that");
      });
    });
  }

  /* ---------- sleep, stress, grounding ---------- */
  function renderLists() {
    const sleep = document.getElementById("sleepList");
    if (sleep) {
      sleep.innerHTML = W.SLEEP_TIPS.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    }
    const stress = document.getElementById("stressList");
    if (stress) {
      stress.innerHTML = W.STRESS_SIGNS.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("");
    }
    const grounding = document.getElementById("groundingList");
    if (grounding) {
      grounding.innerHTML = W.GROUNDING.map(function (t, i) {
        return '<li class="firstaid-step"><span class="n">' + (W.GROUNDING.length - i) +
          "</span><p>" + esc(t) + "</p></li>";
      }).join("");
    }
  }

  /* ---------- journal ---------- */
  let promptIndex = Math.floor(Math.random() * W.JOURNAL_PROMPTS.length);

  function renderJournal() {
    const promptEl = document.getElementById("journalPrompt");
    if (promptEl) promptEl.textContent = "\u201C" + W.JOURNAL_PROMPTS[promptIndex] + "\u201D";

    const host = document.getElementById("journalList");
    if (!host) return;
    const list = Store.get("journal", []);
    const entries = (Array.isArray(list) ? list.slice() : [])
      .sort(function (a, b) { return a.date < b.date ? 1 : -1; })
      .slice(0, 4);

    host.innerHTML = entries.length
      ? entries.map(function (e) {
        return '<div class="data-row"><div class="dr-body"><h5>' + JV.fmtDate(e.date) +
          '</h5><p style="white-space:pre-wrap">' + esc(e.text) + "</p></div>" +
          '<button class="icon-btn" type="button" data-journal-del="' + esc(e.id) +
          '" aria-label="Delete this entry">' + icon("trash") + "</button></div>";
      }).join("")
      : '<p class="tiny muted" style="margin:0">No entries yet. Even one line counts.</p>';

    host.querySelectorAll("[data-journal-del]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-journal-del");
        JV.confirm({
          title: "Delete this entry?",
          message: "This cannot be undone. The entry is removed from this device only.",
          confirm: "Delete",
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          const cur = Store.get("journal", []);
          const next = (Array.isArray(cur) ? cur : []).filter(function (e) { return e.id !== id; });
          Store.set("journal", next);
          JV.toast("Entry deleted");
          renderJournal();
        });
      });
    });
  }

  function initJournal() {
    const save = document.getElementById("journalSave");
    const promptBtn = document.getElementById("journalNew");
    if (save) {
      save.addEventListener("click", function () {
        const el = document.getElementById("journalText");
        const text = (el.value || "").trim();
        if (text.length < 2) {
          JV.toast("Write a line first", "error");
          return;
        }
        const cur = Store.get("journal", []);
        const arr = Array.isArray(cur) ? cur.slice() : [];
        arr.push({ id: JV.uid(), date: today(), text: text.slice(0, 1200), ts: Date.now() });
        Store.set("journal", arr);
        el.value = "";
        JV.toast("Saved privately on this device");
        renderJournal();
      });
    }
    if (promptBtn) {
      promptBtn.addEventListener("click", function () {
        promptIndex = (promptIndex + 1) % W.JOURNAL_PROMPTS.length;
        renderJournal();
      });
    }
    renderJournal();
  }

  /* ---------- support contacts ---------- */
  function contactCard(c) {
    const tone = c.tone === "pink" ? "" : c.tone === "lav" ? "lav" : "teal";
    return '<a class="contact-card" href="tel:' + esc(c.number) + '">' +
      '<div class="icon-badge ' + tone + ' sm">' + icon("phone") + "</div>" +
      '<div class="cc-body"><h5>' + esc(c.name) + "</h5><p>" + esc(c.detail) + "</p></div>" +
      '<span class="num">' + esc(c.number) + "</span></a>";
  }

  function renderSupport() {
    const quick = document.getElementById("quickSupport");
    if (quick) {
      quick.innerHTML =
        '<div class="card-head"><div class="icon-badge teal sm">' + icon("phone") + "</div>" +
        '<div><h4 style="margin:0">Talk to someone now</h4><p>Free and confidential</p></div></div>' +
        '<div class="grid" style="gap:.5rem">' +
        W.SUPPORT_CONTACTS.slice(0, 3).map(contactCard).join("") + "</div>" +
        '<a class="btn btn-ghost btn-sm" href="#support" style="margin-top:.6rem">All support services ' +
        icon("arrow-right") + "</a>";
    }

    const host = document.getElementById("supportGrid");
    if (host) host.innerHTML = W.SUPPORT_CONTACTS.map(contactCard).join("");
  }

  /* ---------- init ---------- */
  function init() {
    initCheckin();
    renderHistory();
    initBreath();
    renderSelfcare();
    renderLists();
    initJournal();
    renderSupport();
  }

  document.addEventListener("jivika:lang", function () {
    renderHistory();
    renderJournal();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
