/*
   JIVIKA AROGYA — tests for the preventive health module
   --------------------------------------------------------------------------
   Run with:  node --test tests/

   These tests exercise the *rules* module only (assets/js/data-preventive.js),
   which is deliberately free of DOM code. They check:

   * age-group boundaries and date-of-birth handling
   * the three result categories (due / discuss / symptoms first)
   * that symptoms are never delayed by routine screening logic
   * validation of missing or invalid answers
   * saved-plan, reminder and summary behaviour with an in-memory store

   They do not test the page rendering (preventive.js) — that needs a browser.
   ========================================================================== */
"use strict";

const test = require("node:test");
const assert = require("node:assert");
const P = require("../assets/js/data-preventive.js");

/* Fixed "today" so age maths and intervals never drift with the clock. */
const TODAY = new Date(2026, 9, 25); // 25 October 2026

function answers(patch) {
  return Object.assign(P.defaultAnswers(), patch || {});
}

function ids(rows) {
  return rows.map(function (r) { return r.screeningId || r.id; }).sort();
}

/* ---------- in-memory Store adapter (same shape as JV.Store) ---------- */
function memoryStore() {
  const box = {};
  return {
    box: box,
    get: function (k, fallback) { return k in box ? JSON.parse(JSON.stringify(box[k])) : fallback; },
    set: function (k, v) { box[k] = JSON.parse(JSON.stringify(v)); return true; },
    remove: function (k) { delete box[k]; }
  };
}

/* ======================================================================
   1. Data integrity
   ====================================================================== */
test("screening library has the twelve required assessments with complete fields", function () {
  assert.strictEqual(P.SCREENINGS.length, 12);
  const seen = {};
  P.SCREENINGS.forEach(function (s) {
    ["name", "condition", "why", "who", "interval", "risk", "prep", "consult"].forEach(function (field) {
      assert.ok(typeof s[field] === "string" && s[field].trim().length > 0,
        s.id + " is missing " + field);
    });
    assert.ok(s.source && s.source.org && s.source.title, s.id + " is missing a source");
    assert.match(String(s.source.year), /^\d{4}$/, s.id + " needs a guideline year");
    assert.ok(!seen[s.id], "duplicate screening id " + s.id);
    seen[s.id] = true;
  });
});

test("clinical review is still pending and no sign-off date is claimed", function () {
  assert.strictEqual(P.REVIEW.status, "pending");
  assert.strictEqual(P.REVIEW.reviewedOn, null);
});

test("every age group advertises only known screening ids", function () {
  assert.strictEqual(P.AGE_GROUPS.length, 6);
  P.AGE_GROUPS.forEach(function (g) {
    assert.ok(g.screeningIds.length > 0, g.id + " has no screenings");
    g.screeningIds.forEach(function (id) {
      assert.ok(P.screeningById(id), g.id + " references unknown screening " + id);
    });
  });
});

test("the six age ranges are contiguous and do not overlap", function () {
  const sorted = P.AGE_GROUPS.slice().sort(function (a, b) { return a.min - b.min; });
  sorted.forEach(function (g, i) {
    if (i === 0) return;
    assert.strictEqual(g.min, sorted[i - 1].max + 1, "gap or overlap before " + g.id);
  });
});

/* ======================================================================
   2. Age groups and dates
   ====================================================================== */
test("age group boundaries map to the right band", function () {
  const cases = [
    [9, null], [10, "10-19"], [19, "10-19"],
    [20, "20-29"], [29, "20-29"],
    [30, "30-39"], [39, "30-39"],
    [40, "40-49"], [49, "40-49"],
    [50, "50-59"], [59, "50-59"],
    [60, "60-plus"], [75, "60-plus"], [120, "60-plus"], [121, null]
  ];
  cases.forEach(function (c) {
    const g = P.ageGroupFor(c[0]);
    assert.strictEqual(g ? g.id : null, c[1], "age " + c[0]);
  });
});

test("parseAge rejects fractions, text and empty values", function () {
  assert.strictEqual(P.parseAge("35"), 35);
  assert.strictEqual(P.parseAge(35), 35);
  assert.strictEqual(P.parseAge("35.5"), null);
  assert.strictEqual(P.parseAge("thirty"), null);
  assert.strictEqual(P.parseAge(""), null);
  assert.strictEqual(P.parseAge(null), null);
  assert.strictEqual(P.parseAge(undefined), null);
  assert.strictEqual(P.parseAge(NaN), null);
});

test("ageFromDob handles birthdays and impossible dates", function () {
  assert.strictEqual(P.ageFromDob("2000-10-25", TODAY), 26); // birthday today
  assert.strictEqual(P.ageFromDob("2000-10-26", TODAY), 25); // one day short
  assert.strictEqual(P.ageFromDob("2027-01-01", TODAY), null); // future
  assert.strictEqual(P.ageFromDob("2000-13-01", TODAY), null); // bad month
  assert.strictEqual(P.ageFromDob("", TODAY), null);
});

test("validateAnswers derives age from date of birth and rejects out-of-range ages", function () {
  const fromDob = P.validateAnswers(answers({ age: null, dob: "1990-05-10" }), TODAY);
  assert.strictEqual(fromDob.ok, true);
  assert.strictEqual(fromDob.answers.age, 36);

  const tooYoung = P.validateAnswers(answers({ age: 8 }), TODAY);
  assert.strictEqual(tooYoung.ok, false);
  assert.ok(tooYoung.errors.age);

  const tooOld = P.validateAnswers(answers({ age: 101 }), TODAY);
  assert.strictEqual(tooOld.ok, false);
  assert.ok(tooOld.errors.age);

  const badDob = P.validateAnswers(answers({ dob: "3000-01-01" }), TODAY);
  assert.strictEqual(badDob.ok, false);
  assert.ok(badDob.errors.dob);
});

/* ======================================================================
   3. Eligibility rules
   ====================================================================== */
test("age 25, no risk factors: blood pressure due, mental health discussion, nothing invented", function () {
  const r = P.evaluate(answers({ age: 25 }), { today: TODAY });
  assert.strictEqual(r.general, false);
  assert.deepStrictEqual(ids(r.due), ["bp"]);
  assert.deepStrictEqual(ids(r.discuss), ["mental"]);
  assert.deepStrictEqual(ids(r.recent), []);
  // Neither cervical nor mammography is routine at 25.
  assert.ok(ids(r.due).indexOf("cervical") === -1);
  assert.ok(ids(r.due).indexOf("breast") === -1);
});

test("age 45: routine checks follow the cited guidelines", function () {
  const r = P.evaluate(answers({ age: 45 }), { today: TODAY });
  assert.deepStrictEqual(ids(r.due), ["bp", "breast", "cervical", "diabetes", "lipids"]);
  assert.deepStrictEqual(ids(r.discuss), ["mental", "senses"]);
  // Osteoporosis screening is not automatic before 65 without risk factors.
  assert.ok(ids(r.due).indexOf("osteoporosis") === -1);
});

test("age 68: bone density and vision are added, cervical screening becomes a discussion", function () {
  const r = P.evaluate(answers({ age: 68 }), { today: TODAY });
  const due = ids(r.due);
  assert.ok(due.indexOf("osteoporosis") !== -1, "bone density should be due at 68");
  assert.ok(due.indexOf("senses") !== -1, "vision/hearing should be due at 68");
  assert.ok(ids(r.discuss).indexOf("cervical") !== -1, "cervical after 65 needs discussion");
});

test("pregnancy changes cervical and mammography to discussion, never routine due", function () {
  const r = P.evaluate(answers({ age: 42, pregnancy: "yes" }), { today: TODAY });
  assert.ok(ids(r.discuss).indexOf("cervical") !== -1);
  assert.ok(ids(r.discuss).indexOf("breast") !== -1);
  assert.ok(ids(r.due).indexOf("breast") === -1);
  assert.ok(ids(r.due).indexOf("cervical") === -1);
  // Perinatal mental health is explicitly recommended during pregnancy.
  assert.ok(ids(r.due).indexOf("mental") !== -1);
  assert.ok(ids(r.discuss).indexOf("diabetes") !== -1, "sugar testing is arranged by the antenatal clinician");
});

test("family history and risk factors move tests into the discussion category", function () {
  const r = P.evaluate(answers({
    age: 26,
    family: ["cvd", "diabetes"],
    risks: ["pcos", "obesity"]
  }), { today: TODAY });
  const discuss = ids(r.discuss);
  assert.ok(discuss.indexOf("lipids") !== -1, "family heart history at 26 warrants a discussion");
  assert.ok(discuss.indexOf("diabetes") !== -1, "risk factors justify earlier sugar testing");
  assert.ok(r.due.indexOf("lipids") === -1);
});

test("a recent screening is reported as recent, not due", function () {
  const r = P.evaluate(answers({
    age: 40,
    previous: { cervical: { date: "2024-03-01" }, bp: { date: "2026-02-01" } }
  }), { today: TODAY });
  const recent = ids(r.recent);
  assert.ok(recent.indexOf("cervical") !== -1, "HPV test two years ago is still within five years");
  assert.ok(recent.indexOf("bp") !== -1, "BP measured this year is recent");
  assert.ok(ids(r.due).indexOf("cervical") === -1);
});

test("an old screening date does not count as recent", function () {
  const r = P.evaluate(answers({
    age: 40,
    previous: { cervical: { date: "2018-01-01" } }
  }), { today: TODAY });
  assert.ok(ids(r.due).indexOf("cervical") !== -1);
  assert.ok(ids(r.recent).indexOf("cervical") === -1);
});

test("a future screening date is ignored rather than trusted", function () {
  const r = P.evaluate(answers({
    age: 40,
    previous: { cervical: { date: "2030-01-01" } }
  }), { today: TODAY });
  assert.ok(ids(r.recent).indexOf("cervical") === -1);
  assert.ok(ids(r.due).indexOf("cervical") !== -1);
});

/* ======================================================================
   4. Symptoms and emergencies
   ====================================================================== */
test("symptoms are routed to clinical evaluation, not routine screening", function () {
  const r = P.evaluate(answers({
    age: 42,
    symptoms: ["heavyBleeding", "fatigue"]
  }), { today: TODAY });
  assert.deepStrictEqual(ids(r.symptomCare), ["fatigue", "heavyBleeding"]);
  assert.strictEqual(r.hasEmergency, false);
  // Anaemia assessment is diagnostic in this situation, so it must not be
  // presented as a routine "due" item.
  assert.ok(ids(r.due).indexOf("anaemia") === -1);
});

test("emergency selections are surfaced and flagged", function () {
  const r = P.evaluate(answers({ age: 55, emergency: ["chestPain", "stroke"] }), { today: TODAY });
  assert.strictEqual(r.hasEmergency, true);
  assert.deepStrictEqual(ids(r.emergency), ["chestPain", "stroke"]);
  assert.ok(r.emergency[0].guidance.length > 0, "emergency guidance must be present");
});

test("skipping age still shows symptoms and emergencies", function () {
  const r = P.evaluate(answers({ age: null, symptoms: ["breastLump"], emergency: ["breathing"] }), { today: TODAY });
  assert.strictEqual(r.general, true);
  assert.strictEqual(r.valid, true);
  assert.deepStrictEqual(ids(r.symptomCare), ["breastLump"]);
  assert.strictEqual(r.hasEmergency, true);
  assert.deepStrictEqual(r.due, []);
  assert.deepStrictEqual(r.discuss, []);
  assert.ok(r.notice.length > 0, "general mode should explain that it is education, not a plan");
});

test("invalid answers fall back to general education instead of guessing", function () {
  const r = P.evaluate(answers({ age: 6 }), { today: TODAY });
  assert.strictEqual(r.general, true);
  assert.strictEqual(r.valid, false);
  assert.ok(r.errors.age);
  assert.deepStrictEqual(r.due, []);
});

test("unknown symptom and emergency ids are ignored safely", function () {
  const r = P.evaluate(answers({
    age: 30, symptoms: ["notAThing", "__proto__"], emergency: ["bogus"]
  }), { today: TODAY });
  assert.deepStrictEqual(r.symptomCare, []);
  assert.strictEqual(r.hasEmergency, false);
});

/* ======================================================================
   5. Saved records (in-memory Store)
   ====================================================================== */
test("load returns a clean default when nothing was saved", function () {
  const store = memoryStore();
  const state = P.load(store);
  assert.strictEqual(state.savedAt, null);
  assert.deepStrictEqual(state.plan, {});
  assert.strictEqual(P.summary(state).hasState, false);
});

test("save stamps savedAt and round-trips through load", function () {
  const store = memoryStore();
  const state = P.defaultState();
  state.saveConsent = true;
  state.answers = answers({ age: 35 });
  const result = P.save(store, state);
  assert.strictEqual(result.ok, true);
  assert.ok(result.state.savedAt, "savedAt must be set on save");

  const back = P.load(store);
  assert.strictEqual(back.answers.age, 35);
  assert.strictEqual(back.saveConsent, true);
  assert.strictEqual(P.summary(back).ageGroup.id, "30-39");
});

test("plan statuses feed the summary counts and upcoming list", function () {
  const store = memoryStore();
  const state = P.defaultState();
  state.answers = answers({ age: 45 });
  P.setPlanEntry(state, "bp", { status: "scheduled", date: "2026-11-10" });
  P.setPlanEntry(state, "cervical", { status: "discuss" });
  P.setPlanEntry(state, "lipids", { status: "completed", date: "2026-10-01" });
  P.save(store, state);

  const s = P.summary(P.load(store));
  assert.strictEqual(s.counts.scheduled, 1);
  assert.strictEqual(s.counts.discuss, 1);
  assert.strictEqual(s.counts.completed, 1);
  assert.strictEqual(s.counts["not-reviewed"], 0);
  assert.deepStrictEqual(s.upcoming.map(function (i) { return i.id; }), ["bp"]);
  assert.strictEqual(s.items[0].status, "scheduled", "scheduled items sort first");
});

test("an unknown plan id still renders a safe row", function () {
  const store = memoryStore();
  const state = P.defaultState();
  state.plan.removedScreening = { status: "not-reviewed" };
  P.save(store, state);
  const s = P.summary(P.load(store));
  assert.strictEqual(s.items[0].name, "removedScreening");
  assert.strictEqual(s.items[0].icon, "shield-check");
});

test("statusMeta falls back to not-reviewed for unknown statuses", function () {
  assert.strictEqual(P.statusMeta("scheduled").label, "Scheduled");
  assert.strictEqual(P.statusMeta("deleted-by-user").id, "not-reviewed");
});

test("remove deletes the saved plan", function () {
  const store = memoryStore();
  const state = P.defaultState();
  state.saveConsent = true;
  state.answers = answers({ age: 50 });
  P.save(store, state);
  P.remove(store);
  assert.strictEqual(P.summary(P.load(store)).hasState, false);
});

test("corrupt stored data does not throw", function () {
  const store = memoryStore();
  store.box[P.STORE_KEY] = "not an object";
  const s = P.load(store);
  assert.strictEqual(s.savedAt, null);
  assert.deepStrictEqual(s.reminders.items, []);
});

/* ======================================================================
   6. Reminders
   ====================================================================== */
test("normalizeReminder accepts a valid appointment and trims the title", function () {
  const r = P.normalizeReminder({ title: "  " + "A".repeat(120) + "  ", date: "2026-12-01" });
  assert.ok(r);
  assert.strictEqual(r.title.length, 80);
  assert.strictEqual(r.kind, "appointment");
});

test("normalizeReminder keeps clinician-ordered follow-ups distinct", function () {
  const r = P.normalizeReminder({ title: "Review HbA1c", date: "2026-12-01", kind: "followup" });
  assert.strictEqual(r.kind, "followup");
});

test("normalizeReminder rejects empty titles, bad dates and impossible dates", function () {
  assert.strictEqual(P.normalizeReminder({ title: "", date: "2026-12-01" }), null);
  assert.strictEqual(P.normalizeReminder({ title: "Check", date: "01-12-2026" }), null);
  assert.strictEqual(P.normalizeReminder({ title: "Check", date: "2026-13-40" }), null);
  assert.strictEqual(P.normalizeReminder({ title: "   ", date: "2026-12-01" }), null);
});

test("reminders are only listed after the user enables them", function () {
  const state = P.defaultState();
  state.reminders.items.push({ id: "r1", title: "BP check", date: "2026-11-01", kind: "appointment" });
  assert.strictEqual(P.summary(state).remindersEnabled, false);
  state.reminders.enabled = true;
  const s = P.summary(state);
  assert.strictEqual(s.remindersEnabled, true);
  assert.strictEqual(s.reminders.length, 1);
});

test("daysUntil counts calendar days from a fixed today", function () {
  assert.strictEqual(P.daysUntil("2026-10-25", TODAY), 0);
  assert.strictEqual(P.daysUntil("2026-10-30", TODAY), 5);
  assert.strictEqual(P.daysUntil("2026-10-20", TODAY), -5);
  assert.strictEqual(P.daysUntil("", TODAY), null);
  assert.strictEqual(P.daysUntil("not-a-date", TODAY), null);
});
