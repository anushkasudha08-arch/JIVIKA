/* ==========================================================================
   JIVIKA AROGYA — preventive health data, eligibility rules and plan storage
   --------------------------------------------------------------------------
   CLINICAL SAFETY
   * Every screening record is a DRAFT (review.status = "pending"). The
     "source" is the guideline the wording is based on; "source.year" is the
     guideline year, not a sign-off date for this website.
   * Intervals are only filled where a named guideline supports one. Where a
     guideline gives no fixed interval the field says so instead of inventing
     a number.
   * Rules never diagnose. They sort educational suggestions into:
       due     — routine screening supported by the cited guideline
       discuss — individual decision with a clinician (age/risk dependent)
       recent  — the user says it was done recently; not confirmed
     Symptoms are handled separately and never delayed by this checklist.
   ========================================================================== */
(function (root, factory) {
  "use strict";
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) {
    root.JV = root.JV || {};
    root.JV.preventive = api;
  }
})(typeof window !== "undefined" ? window : null, function () {
  "use strict";

  const STORE_KEY = "preventive";
  const REVIEW = { status: "pending", label: "Clinical review pending", reviewer: "", reviewedOn: null };

  const STATUSES = [
    { id: "not-reviewed", label: "Not reviewed", tone: "neutral" },
    { id: "discuss", label: "Discuss with doctor", tone: "amber" },
    { id: "scheduled", label: "Scheduled", tone: "lav" },
    { id: "completed", label: "Completed", tone: "teal" }
  ];

  const AGE_GROUPS = [
    {
      id: "10-19", min: 10, max: 19, range: "10–19 years", title: "Adolescent health",
      blurb: "Growth, periods, iron, HPV vaccination and emotional well-being. Routine cancer screening is not started yet.",
      icon: "sparkle", screeningIds: ["anaemia", "pcos", "mental", "bp", "senses"]
    },
    {
      id: "20-29", min: 20, max: 29, range: "20–29 years", title: "Young women's health",
      blurb: "Blood pressure, iron and menstrual health, preconception care and mental well-being. Cervical screening usually starts at 30.",
      icon: "heart", screeningIds: ["bp", "diabetes", "anaemia", "ferritin", "cervical", "mental", "pcos"]
    },
    {
      id: "30-39", min: 30, max: 39, range: "30–39 years", title: "Preventive health",
      blurb: "Cervical screening becomes routine, blood pressure and diabetes checks matter, and breast awareness is part of every visit.",
      icon: "shield-check", screeningIds: ["bp", "diabetes", "cervical", "breast", "thyroid", "pcos", "mental", "anaemia"]
    },
    {
      id: "40-49", min: 40, max: 49, range: "40–49 years", title: "Midlife health",
      blurb: "Heart and cholesterol risk, mammography from 40, cervical screening, bone health and eye checks as menopause approaches.",
      icon: "heart-pulse", screeningIds: ["bp", "diabetes", "lipids", "breast", "cervical", "thyroid", "osteoporosis", "senses"]
    },
    {
      id: "50-59", min: 50, max: 59, range: "50–59 years", title: "Menopause and healthy ageing",
      blurb: "Bone density, heart risk, mammography, cervical screening up to 65, vision, hearing and emotional health.",
      icon: "leaf", screeningIds: ["bp", "diabetes", "lipids", "breast", "cervical", "osteoporosis", "senses", "mental"]
    },
    {
      id: "60-plus", min: 60, max: 120, range: "60+ years", title: "Senior women's health",
      blurb: "Bone density from 65, vision and hearing, heart and sugar checks, and cervical screening only if it was never completed.",
      icon: "users", screeningIds: ["bp", "diabetes", "lipids", "osteoporosis", "senses", "cervical", "mental", "breast"]
    }
  ];

  /* ---------- screening library (presentation content) ---------- */
  const SCREENINGS = [
    {
      id: "bp", name: "Blood pressure measurement", icon: "heart-pulse",
      condition: "High blood pressure (hypertension), which can lead to stroke, heart and kidney disease",
      why: "High blood pressure usually has no symptoms. Measuring it is the only way to find it before it damages the heart, brain, eyes or kidneys.",
      who: "All adults from 18. India's public health programmes offer opportunistic checks from 30.",
      interval: "Every 3–5 years if 18–39 with normal readings and no risk factors; at least once a year from 40, or more often if readings are high (USPSTF 2021).",
      risk: "Family history of high blood pressure, diabetes, kidney disease, obesity, PCOS, pregnancy, high salt intake, smoking.",
      prep: "Sit quietly for 5 minutes. Avoid tea, coffee, smoking or exercise for 30 minutes. Sit with your back supported, feet flat and arm at heart level.",
      consult: "Two readings of 140/90 mmHg or higher, a reading of 180/120 mmHg or higher (urgent), or symptoms such as severe headache, chest pain or breathlessness.",
      source: { org: "USPSTF", title: "Hypertension in adults: screening (2021) and India NPCDCS guidance", year: "2021", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/hypertension-in-adults-screening" }
    },
    {
      id: "diabetes", name: "Diabetes screening (blood glucose or HbA1c)", icon: "droplet",
      condition: "Type 2 diabetes and prediabetes",
      why: "Diabetes can develop quietly for years. Early detection allows treatment that protects the heart, kidneys, eyes, nerves and feet.",
      who: "All adults from 35 (ADA 2024). Many Indian programmes begin at 30. Earlier testing is advised with risk factors.",
      interval: "Every 3 years if the result is normal; every year if prediabetes is found (ADA 2024).",
      risk: "Family history of diabetes, overweight, PCOS, gestational diabetes, high blood pressure, high cholesterol, smoking, low physical activity.",
      prep: "Fasting glucose needs 8–10 hours without food (water is fine). HbA1c does not need fasting. Follow your laboratory's instructions. An abnormal result is usually confirmed with a repeat test.",
      consult: "Excess thirst, frequent urination, unexplained weight loss, blurred vision, slow-healing wounds, or a test result above the laboratory's normal range.",
      source: { org: "American Diabetes Association", title: "Standards of Care in Diabetes — Section 2, diagnosis and classification", year: "2024", url: "https://diabetesjournals.org/care/issue/47/Supplement_1" }
    },
    {
      id: "lipids", name: "Cholesterol and cardiovascular risk assessment", icon: "heart",
      condition: "High cholesterol and raised ten-year risk of heart attack or stroke",
      why: "Cholesterol has no symptoms. A lipid profile plus blood pressure, sugar and smoking history helps estimate heart risk and decide whether treatment is worthwhile.",
      who: "Adults 40–75 for routine risk assessment; younger adults with diabetes, high blood pressure, obesity, family heart disease or PCOS should discuss earlier testing.",
      interval: "Every 4–6 years if low risk (ACC/AHA 2018); more often if cholesterol is high or other risk factors are present.",
      risk: "Family history of early heart disease or very high cholesterol, diabetes, high blood pressure, smoking, obesity, PCOS, menopause.",
      prep: "Fasting for 9–12 hours is usually requested for triglycerides; follow the laboratory's instructions. Continue prescribed medicines unless told otherwise.",
      consult: "Chest pain, breathlessness, palpitations, or a very high cholesterol result — discuss treatment and further tests with a clinician.",
      source: { org: "ACC/AHA", title: "Guideline on the management of blood cholesterol", year: "2018", url: "https://www.ahajournals.org/doi/10.1161/CIR.0000000000000625" }
    },
    {
      id: "anaemia", name: "Anaemia assessment and CBC when clinically indicated", icon: "droplet",
      condition: "Iron-deficiency anaemia and other causes of low haemoglobin",
      why: "Heavy periods, pregnancy and poor iron intake are common causes of anaemia. It can cause tiredness, breathlessness and poor pregnancy outcomes, and it is treatable.",
      who: "Women with heavy or long periods, fatigue, breathlessness, pallor, pregnancy or a diet low in iron. Not a routine test for every woman without symptoms.",
      interval: "No fixed interval for women without symptoms. During pregnancy, haemoglobin is checked at antenatal visits (WHO 2016).",
      risk: "Heavy menstrual bleeding, pregnancy or recent childbirth, vegetarian diet with low iron intake, previous anaemia, malabsorption, chronic disease.",
      prep: "No special preparation for a CBC. Tell the laboratory if you take iron supplements, as this can affect results.",
      consult: "Haemoglobin below the laboratory's reference range, worsening breathlessness, palpitations, dizziness or fainting.",
      source: { org: "WHO", title: "Antenatal care recommendations (2016); anaemia guidance", year: "2016", url: "https://www.who.int/health-topics/anaemia" }
    },
    {
      id: "ferritin", name: "Ferritin testing when iron deficiency is suspected", icon: "water",
      condition: "Iron deficiency, including iron deficiency without anaemia",
      why: "Ferritin shows how much iron is stored. It helps explain tiredness, hair loss, restless legs or heavy periods when haemoglobin is still normal.",
      who: "Only when iron deficiency is suspected — for example heavy periods, persistent fatigue, pregnancy, or before starting iron treatment. Not a general screening test.",
      interval: "No routine interval. Repeat only when a clinician advises, for example after 3 months of iron treatment.",
      risk: "Heavy menstrual bleeding, pregnancy, low-iron diet, blood donation, gut disease, previous iron deficiency.",
      prep: "A morning sample is preferred. Tell the laboratory about iron supplements; recent iron can raise ferritin. Inflammation can also raise it, so interpret with a CBC and clinical review.",
      consult: "Ferritin below the laboratory range, or fatigue and breathlessness that are getting worse.",
      source: { org: "WHO", title: "Guideline on ferritin concentrations for assessing iron status", year: "2020", url: "https://www.who.int/publications/i/item/9789240000124" }
    },
    {
      id: "cervical", name: "Cervical cancer screening", icon: "shield-check",
      condition: "Cervical pre-cancer and cervical cancer caused by high-risk HPV",
      why: "Cervical screening finds changes years before cancer develops, when treatment is simple and highly effective.",
      who: "Women aged 30–65, whether or not they have had the HPV vaccine. In India's programme, screening is offered through VIA where HPV testing is not available.",
      interval: "HPV DNA test every 5 years where available (WHO 2021 allows 5–10 years). VIA every 5 years in India's programme when HPV testing is unavailable. Confirm the schedule with your clinician.",
      risk: "HPV infection, smoking, HIV or immune suppression, early marriage or multiple births are associated with higher risk.",
      prep: "Avoid screening during a heavy period. Do not use vaginal creams or douches for 48 hours. Tell the clinician if you are pregnant or have had a hysterectomy.",
      consult: "Any abnormal screening result, bleeding after sex, bleeding between periods, or unusual discharge. A screening test is not a diagnosis.",
      source: { org: "WHO / MoHFW", title: "WHO guideline for screening and treatment of cervical pre-cancer (2021); India operational framework (2016)", year: "2021", url: "https://www.who.int/publications/i/item/9789240030824" }
    },
    {
      id: "breast", name: "Breast health assessment and mammography when appropriate", icon: "heart",
      condition: "Breast cancer, benign lumps and nipple or skin changes",
      why: "Breast awareness and clinical examination help women notice changes early. Mammography can find small cancers before they can be felt.",
      who: "Mammography every 2 years for women 40–74 (USPSTF 2024). In India, clinical breast examination and awareness are offered from 30. Earlier assessment is advised with strong family history.",
      interval: "Mammography every 2 years from 40 to 74 (USPSTF 2024). Clinical breast examination intervals vary by programme — follow your clinician's advice.",
      risk: "Family history of breast or ovarian cancer, BRCA gene change, early periods or late menopause, no pregnancy, hormone therapy, obesity, alcohol use.",
      prep: "Do not use deodorant, talc or cream on the chest or underarms on the day of a mammogram. Bring previous images and reports if you have them.",
      consult: "A new lump, nipple discharge (especially bloody), a nipple turning inward, skin dimpling or redness, or persistent breast pain.",
      source: { org: "USPSTF", title: "Breast cancer: screening", year: "2024", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/breast-cancer-screening" }
    },
    {
      id: "osteoporosis", name: "Osteoporosis risk assessment and bone density testing", icon: "scale",
      condition: "Low bone density and higher risk of hip, spine and wrist fractures",
      why: "Bone loss speeds up after menopause and often causes no symptoms until a fracture. Knowing bone density helps decide about calcium, vitamin D, exercise and treatment.",
      who: "Women 65 and older. Postmenopausal women under 65 with risk factors, and anyone with a fracture after a minor fall, should discuss earlier testing.",
      interval: "No fixed repeat interval in guidelines. The gap between scans is individualised by your clinician (USPSTF 2025 finds insufficient evidence for a fixed schedule).",
      risk: "Early menopause, low body weight, smoking, long-term steroid medicines, family hip fracture, previous fracture, low calcium or vitamin D intake.",
      prep: "Wear loose clothing without metal zips. Avoid calcium supplements for 24 hours if your laboratory asks. Tell the clinician if you may be pregnant.",
      consult: "Height loss, sudden back pain, a fracture after a minor fall, or early menopause — ask about bone health.",
      source: { org: "USPSTF", title: "Osteoporosis to prevent fractures: screening", year: "2025", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/osteoporosis-screening" }
    },
    {
      id: "thyroid", name: "Thyroid function testing when indicated", icon: "refresh",
      condition: "Hypothyroidism (underactive) and hyperthyroidism (overactive)",
      why: "Thyroid problems can cause fatigue, weight change, low mood, irregular periods and pregnancy complications. Testing is useful when symptoms or risk factors are present.",
      who: "Women with symptoms, a neck swelling, infertility, pregnancy or planning pregnancy, family history of thyroid disease, or another autoimmune condition. Routine testing of every asymptomatic adult is not recommended.",
      interval: "No fixed interval; repeat only as advised by your clinician. Pregnancy and fertility care follow separate schedules.",
      risk: "Family history of thyroid disease, other autoimmune disease, previous neck surgery or radiation, pregnancy, certain medicines.",
      prep: "TSH does not need fasting. Tell the laboratory if you take biotin or thyroid medicine. Take thyroid tablets as usual unless your clinician says otherwise.",
      consult: "Neck swelling, unexplained weight change, palpitations, severe tiredness, feeling very cold or hot, or pregnancy with thyroid symptoms.",
      source: { org: "USPSTF / ATA", title: "Thyroid dysfunction screening (USPSTF statement) and ATA case-finding guidance", year: "2015", url: "https://www.uspreventiveservicestaskforce.org/uspstf/recommendation/thyroid-dysfunction-screening" }
    },
    {
      id: "pcos", name: "Menstrual health and PCOS assessment", icon: "calendar",
      condition: "Polycystic ovary syndrome (PCOS), irregular ovulation and endometrial problems",
      why: "Very irregular periods can signal PCOS or other hormone problems. Recognising them early allows treatment for acne, unwanted hair, fertility and long-term metabolic risk.",
      who: "Women with cycles longer than 35 days, fewer than eight periods a year, new acne or excess facial hair, or difficulty conceiving. Not a routine test when cycles are regular.",
      interval: "No routine interval; assessment is symptom-based. Known PCOS needs periodic review as advised by a clinician.",
      risk: "Family history of PCOS, weight gain, insulin resistance, acne, excess hair, irregular periods since adolescence.",
      prep: "Bring a record of your last few period dates. Blood tests and a pelvic ultrasound may be advised; fasting may be needed for metabolic tests.",
      consult: "Cycles shorter than 21 or longer than 35 days, bleeding between periods, rapid hair growth or voice change, or infertility.",
      source: { org: "ESHRE", title: "International evidence-based guideline for the assessment and management of PCOS", year: "2023", url: "https://www.eshre.eu/Guidelines-and-Legal/Guidelines/Polycystic-Ovary-Syndrome" }
    },
    {
      id: "senses", name: "Vision and hearing assessments for older women", icon: "globe",
      condition: "Refractive error, cataract, glaucoma, diabetic eye disease and age-related hearing loss",
      why: "Vision and hearing loss raise the risk of falls, isolation and memory problems. Many causes are treatable when found early.",
      who: "Vision checks every 1–2 years from 60, or every year with diabetes. Hearing checks when difficulty starts; India's elderly care programme offers screening from 60.",
      interval: "Comprehensive eye exam every 1–2 years from 60 (AAO); annual dilated eye exam with diabetes. Hearing: check when you notice a problem; no universal interval is proven.",
      risk: "Diabetes, high blood pressure, glaucoma in the family, long-term noise exposure, certain medicines, smoking.",
      prep: "Bring your glasses or hearing aid and a list of medicines. A companion helps with the trip home if your eyes are dilated.",
      consult: "Sudden vision loss, new flashes or floaters, eye pain, difficulty hearing conversation, or ringing that does not settle.",
      source: { org: "WHO / AAO", title: "World report on vision (2019), World report on hearing (2021), AAO eye-exam guidance", year: "2021", url: "https://www.who.int/publications/i/item/9789240020481" }
    },
    {
      id: "mental", name: "Mental health and emotional well-being assessment", icon: "sparkle",
      condition: "Depression, anxiety and perinatal mental health conditions",
      why: "Emotional health affects sleep, relationships and how well physical conditions are managed. Screening tools such as PHQ-9, GAD-7 or EPDS help start a conversation — they are not a diagnosis.",
      who: "All women, with attention during pregnancy, after childbirth, after loss, during menopause and when living with long-term illness or violence.",
      interval: "No fixed interval for everyone. Perinatal services screen during pregnancy and after birth (ACOG 2023). Ask for a review whenever symptoms last more than two weeks.",
      risk: "Previous depression or anxiety, pregnancy or recent birth, violence, isolation, chronic illness, family history, financial stress.",
      prep: "No preparation. Answer honestly; a trained health worker will discuss what the score means.",
      consult: "Low mood or anxiety for more than two weeks, unable to care for yourself or your baby, or any thought of self-harm — seek help immediately.",
      source: { org: "ACOG / WHO", title: "Screening and diagnosis of perinatal mental health conditions (ACOG 2023); mhGAP guidance", year: "2023", url: "https://www.acog.org/clinical" }
    }
  ];

  /* ---------- early warning signs and emergencies ---------- */
  const SYMPTOMS = [
    { id: "heavyBleeding", label: "Unusually heavy or persistent menstrual bleeding", severity: "urgent", guidance: "Soaking a pad every 1–2 hours, clots larger than a coin, or bleeding beyond 7 days needs a same-week clinical assessment. Do not wait for a screening appointment.", link: "menstrual.html" },
    { id: "postmenopausalBleeding", label: "Any bleeding after menopause", severity: "urgent", guidance: "Bleeding 12 months or more after your last period needs prompt assessment, even if it is light. This is not something to watch at home.", link: "menstrual.html" },
    { id: "breastLump", label: "A new breast lump, skin change or nipple change", severity: "urgent", guidance: "A new lump, dimpling, redness, or a nipple turning inward or discharging blood needs a clinical breast examination. Most lumps are not cancer, but they must be checked.", link: "physical.html" },
    { id: "pelvicPain", label: "Persistent pelvic pain", severity: "consult", guidance: "Pain lasting more than two weeks, pain during sex, or pain with fever needs a clinical review.", link: "menstrual.html" },
    { id: "weightLoss", label: "Unexplained weight loss", severity: "consult", guidance: "Losing more than 5% of body weight in six months without trying deserves a medical assessment.", link: "nutrition.html" },
    { id: "fatigue", label: "Persistent or unusual fatigue", severity: "consult", guidance: "Tiredness that does not improve with rest can have many causes, including anaemia, thyroid problems, diabetes and low mood. Ask for a clinical review.", link: "physical.html" },
    { id: "anaemiaSigns", label: "Breathlessness, pallor, palpitations or dizziness (possible anaemia)", severity: "urgent", guidance: "These signs can mean low haemoglobin. Get a same-day or next-day clinical review; do not rely on home remedies alone.", link: "nutrition.html" },
    { id: "diabetesSigns", label: "Excess thirst, frequent urination, blurred vision or slow healing", severity: "consult", guidance: "These can be signs of diabetes. Ask for a blood glucose or HbA1c test; do not start or stop any medicine yourself.", link: "assistant.html" },
    { id: "thyroidSigns", label: "Neck swelling, weight change, palpitations or temperature intolerance", severity: "consult", guidance: "These can be signs of a thyroid problem. A clinician can decide whether thyroid tests are needed.", link: "assistant.html" },
    { id: "irregularPeriods", label: "Very irregular or absent periods", severity: "consult", guidance: "Cycles shorter than 21 days or longer than 35 days, or fewer than eight periods a year, deserve a menstrual/PCOS assessment.", link: "menstrual.html" },
    { id: "visionChange", label: "New vision or hearing difficulty", severity: "consult", guidance: "New blurring, floaters, difficulty hearing conversation or persistent ringing needs an eye or hearing check. Sudden vision loss or sudden hearing loss is urgent.", link: "healthcare.html" },
    { id: "mentalHealth", label: "Low mood, anxiety or hopelessness for more than two weeks", severity: "urgent", guidance: "You deserve support. Talk to a health worker or call Tele-MANAS on 14416. If you have thoughts of harming yourself, seek help immediately.", link: "mental.html" }
  ];

  const EMERGENCY_SIGNS = [
    { id: "chestPain", label: "Severe chest pain or pressure", guidance: "Call 108 now. Do not drive yourself." },
    { id: "breathing", label: "Severe difficulty breathing", guidance: "Call 108 now. Sit upright and stay with someone." },
    { id: "stroke", label: "Sudden weakness or numbness on one side, face drooping or slurred speech", guidance: "Call 112 or 108 immediately. Note the time symptoms started." },
    { id: "bleedingFaint", label: "Very heavy bleeding with fainting or collapse", guidance: "Call 108 now. Lie down and raise your legs if possible." },
    { id: "abdominalSevere", label: "Severe or sudden abdominal or pelvic pain", guidance: "Go to the nearest emergency department or call 108." },
    { id: "selfHarm", label: "Thoughts of harming yourself", guidance: "Call 14416 (Tele-MANAS) or 112 now, or go to the nearest emergency department. You are not alone." }
  ];

  const FAMILY_HISTORY = [
    { id: "breastOvarian", label: "Breast or ovarian cancer" },
    { id: "colorectal", label: "Bowel (colorectal) cancer" },
    { id: "diabetes", label: "Diabetes" },
    { id: "cvd", label: "Early heart disease or very high cholesterol" },
    { id: "osteoporosis", label: "Hip fracture or osteoporosis" },
    { id: "thyroid", label: "Thyroid disease" }
  ];

  const RISK_FACTORS = [
    { id: "hypertension", label: "High blood pressure" },
    { id: "diabetes", label: "Diabetes or prediabetes" },
    { id: "thyroid", label: "A thyroid condition" },
    { id: "pcos", label: "PCOS" },
    { id: "obesity", label: "Overweight or obesity" },
    { id: "smoking", label: "Smoking or tobacco use" },
    { id: "steroids", label: "Long-term steroid tablets" },
    { id: "earlyMenopause", label: "Menopause before age 45" },
    { id: "fracture", label: "A broken bone after a minor fall" },
    { id: "gestational", label: "Diabetes during pregnancy" }
  ];

  const PREVIOUS_TESTS = [
    { id: "cervical", label: "Cervical screening (HPV/VIA/Pap)", years: 5 },
    { id: "breast", label: "Mammogram", years: 2 },
    { id: "bp", label: "Blood pressure check", years: 1 },
    { id: "diabetes", label: "Blood sugar or HbA1c", years: 3 },
    { id: "lipids", label: "Cholesterol test", years: 5 }
  ];

  /* ---------- eligibility rules (logic only, no presentation) ---------- */
  function has(list, id) { return Array.isArray(list) && list.indexOf(id) !== -1; }
  function prev(answers, id) {
    const p = answers.previous && answers.previous[id];
    return p && p.date ? p.date : "";
  }
  function withinYears(dateISO, years, today) {
    if (!dateISO) return false;
    const d = new Date(dateISO + "T00:00:00");
    if (isNaN(d)) return false;
    const limit = new Date(today.getFullYear() - years, today.getMonth(), today.getDate());
    return d >= limit && d <= today;
  }
  function isPregnant(a) { return a.pregnancy === "yes"; }
  function isPostpartum(a) { return a.pregnancy === "postpartum"; }
  function menopause(a) { return a.menopause; }

  const RULES = {
    bp: function (a, ctx) {
      if (a.age < 18) return { category: "discuss", reason: "Blood pressure is checked at routine clinical visits during adolescence; adult screening intervals do not apply yet." };
      if (withinYears(prev(a, "bp"), 1, ctx.today)) return { category: "recent", reason: "You entered a blood pressure check in the last year. Bring the reading to your next visit; this tool cannot confirm whether it was normal." };
      if (a.age >= 30) return { category: "due", reason: "India's public health programmes offer blood pressure checks from age 30, and USPSTF recommends screening all adults." };
      return { category: "due", reason: "USPSTF recommends blood pressure screening for all adults from 18. Repeat every 3–5 years if readings are normal and risk is low." };
    },
    diabetes: function (a, ctx) {
      if (isPregnant(a)) return { category: "discuss", reason: "Pregnancy changes sugar testing. Gestational diabetes screening is arranged by your antenatal clinician, usually between 24 and 28 weeks." };
      if (withinYears(prev(a, "diabetes"), 3, ctx.today)) return { category: "recent", reason: "You entered a sugar or HbA1c test in the last 3 years. Confirm the result and next due date with your clinician." };
      if (a.age >= 35) return { category: "due", reason: "ADA 2024 recommends screening all adults from 35, repeated every 3 years when normal." };
      if (a.age >= 30) return { category: "discuss", reason: "Indian programmes often begin at 30 while ADA begins at 35. Ask your clinician whether testing now is right for you." };
      if (has(a.risks, "diabetes") || has(a.risks, "pcos") || has(a.risks, "gestational") || has(a.risks, "hypertension") || has(a.risks, "obesity") || has(a.family, "diabetes")) {
        return { category: "discuss", reason: "Risk factors suggest earlier testing may be worthwhile, even though routine screening starts at 30–35." };
      }
      return { category: "not", reason: "" };
    },
    lipids: function (a, ctx) {
      if (withinYears(prev(a, "lipids"), 5, ctx.today)) return { category: "recent", reason: "You entered a cholesterol test in the last 5 years. Confirm the result and whether a repeat is due." };
      if (a.age >= 40 && a.age <= 75) return { category: "due", reason: "ACC/AHA and USPSTF support cardiovascular risk assessment with a lipid profile for adults 40–75." };
      if (a.age >= 20 && (has(a.risks, "diabetes") || has(a.risks, "hypertension") || has(a.risks, "obesity") || has(a.risks, "pcos") || has(a.family, "cvd"))) {
        return { category: "discuss", reason: "You have risk factors that may justify a cholesterol check before 40." };
      }
      return { category: "not", reason: "" };
    },
    anaemia: function (a) {
      if (isPregnant(a)) return { category: "discuss", reason: "Haemoglobin is checked during antenatal visits. Ask your clinician about the schedule and iron supplementation." };
      if (isPostpartum(a)) return { category: "discuss", reason: "Pregnancy and childbirth use up iron. Ask your clinician whether a CBC is needed after delivery." };
      if (has(a.symptoms, "heavyBleeding") || has(a.symptoms, "fatigue") || has(a.symptoms, "anaemiaSigns")) return { category: "not", reason: "" };
      return { category: "not", reason: "" };
    },
    ferritin: function (a) {
      if (isPregnant(a)) return { category: "discuss", reason: "Iron studies may be advised in pregnancy if anaemia is suspected. Your antenatal clinician decides." };
      if (has(a.symptoms, "heavyBleeding") || has(a.symptoms, "fatigue") || has(a.symptoms, "anaemiaSigns")) return { category: "not", reason: "" };
      return { category: "not", reason: "" };
    },
    cervical: function (a, ctx) {
      if (a.age < 21) return { category: "not", reason: "" };
      if (a.age >= 30 && a.age <= 65) {
        if (isPregnant(a)) return { category: "discuss", reason: "Cervical screening can be done during pregnancy, but the timing and technique are decided by your antenatal clinician." };
        if (withinYears(prev(a, "cervical"), 5, ctx.today)) return { category: "recent", reason: "You entered cervical screening in the last 5 years. Confirm the result and next due date with your clinician — a normal result does not remove the need for follow-up." };
        return { category: "due", reason: "Cervical screening is recommended from 30 to 65, whether or not you had the HPV vaccine." };
      }
      if (a.age > 65) {
        if (withinYears(prev(a, "cervical"), 5, ctx.today)) return { category: "recent", reason: "You entered cervical screening in the last 5 years. Ask your clinician whether you can stop screening after 65." };
        return { category: "discuss", reason: "If you have never been screened or have no documented normal results, discuss whether screening after 65 is right for you." };
      }
      return { category: "not", reason: "" };
    },
    breast: function (a, ctx) {
      if (withinYears(prev(a, "breast"), 2, ctx.today)) return { category: "recent", reason: "You entered a mammogram in the last 2 years. Confirm the result and next due date with your clinician." };
      if (isPregnant(a) && a.age >= 40 && a.age <= 74) return { category: "discuss", reason: "Mammography is usually deferred during pregnancy unless there is a clinical concern. Ask your antenatal clinician." };
      if (a.age >= 40 && a.age <= 74) return { category: "due", reason: "USPSTF 2024 recommends mammography every 2 years for women aged 40–74." };
      if (a.age >= 30 && a.age < 40) return { category: "discuss", reason: "Breast awareness and clinical breast examination are offered in India's programme. Mammography is not routine before 40 unless risk is high." };
      if (a.age > 74) return { category: "discuss", reason: "After 75, the benefits and harms of mammography depend on your health and preferences. Decide with your clinician." };
      if (has(a.family, "breastOvarian")) return { category: "discuss", reason: "A strong family history may justify earlier assessment or genetic counselling. This is not routine screening." };
      return { category: "not", reason: "" };
    },
    osteoporosis: function (a) {
      if (a.age >= 65) return { category: "due", reason: "USPSTF 2025 recommends bone density screening for women 65 and older." };
      const postMenopausal = menopause(a) === "post" || menopause(a) === "peri" || has(a.risks, "earlyMenopause");
      if (a.age >= 50 && postMenopausal && (has(a.risks, "earlyMenopause") || has(a.risks, "fracture") || has(a.risks, "steroids") || has(a.risks, "smoking") || has(a.family, "osteoporosis"))) {
        return { category: "discuss", reason: "Postmenopausal women under 65 with risk factors may benefit from bone density testing." };
      }
      if (has(a.risks, "fracture") || has(a.risks, "steroids")) return { category: "discuss", reason: "A fracture after a minor fall or long-term steroid use warrants a bone health review at any adult age." };
      return { category: "not", reason: "" };
    },
    thyroid: function (a) {
      if (isPregnant(a) || a.pregnancy === "planning") return { category: "discuss", reason: "Thyroid testing may be advised in pregnancy or when planning pregnancy, especially with symptoms or a known thyroid condition." };
      if (has(a.risks, "thyroid") || has(a.family, "thyroid")) return { category: "discuss", reason: "A personal or family history of thyroid disease makes testing more likely to be useful if symptoms appear." };
      return { category: "not", reason: "" };
    },
    pcos: function (a) {
      if (has(a.symptoms, "irregularPeriods")) return { category: "not", reason: "" };
      if (has(a.risks, "pcos") && a.age <= 50) return { category: "discuss", reason: "Known PCOS needs periodic review of cycles, weight, blood pressure and sugar — not a single screening test." };
      return { category: "not", reason: "" };
    },
    senses: function (a) {
      if (has(a.risks, "diabetes")) return { category: "due", reason: "Diabetes increases the risk of eye disease. An annual dilated eye examination is recommended, and hearing should be checked if difficulty appears." };
      if (a.age >= 60) return { category: "due", reason: "Vision should be checked every 1–2 years from 60. India's elderly care programme also offers hearing screening." };
      if (a.age >= 40) return { category: "discuss", reason: "A baseline eye examination around midlife is reasonable; your clinician can advise how often to repeat it." };
      return { category: "not", reason: "" };
    },
    mental: function (a) {
      if (isPregnant(a) || isPostpartum(a)) return { category: "due", reason: "Perinatal mental health screening is recommended during pregnancy and after childbirth (ACOG 2023)." };
      return { category: "discuss", reason: "There is no single screening interval for everyone. A check-in is worthwhile at life changes, after loss, during menopause, or whenever low mood lasts more than two weeks." };
    }
  };

  /* ---------- helpers ---------- */
  function parseAge(value) {
    if (value === null || value === undefined || value === "") return null;
    const n = Number(value);
    if (!isFinite(n) || Math.floor(n) !== n) return null;
    return n;
  }

  function ageFromDob(iso, today) {
    if (!iso) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!m) return null;
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const day = Number(m[3]);
    const d = new Date(y, mo - 1, day);
    // The Date constructor rolls 2000-13-01 over to 2001-01-01, so check that
    // the parsed parts survived unchanged before trusting the date.
    if (isNaN(d) || d.getFullYear() !== y || d.getMonth() !== mo - 1 || d.getDate() !== day) return null;
    const now = today || new Date();
    if (d > now) return null;
    let age = now.getFullYear() - d.getFullYear();
    const beforeBirthday = now.getMonth() < d.getMonth() ||
      (now.getMonth() === d.getMonth() && now.getDate() < d.getDate());
    if (beforeBirthday) age -= 1;
    return age >= 0 && age < 120 ? age : null;
  }

  function ageGroupFor(age) {
    if (age === null || age === undefined) return null;
    for (let i = 0; i < AGE_GROUPS.length; i++) {
      if (age >= AGE_GROUPS[i].min && age <= AGE_GROUPS[i].max) return AGE_GROUPS[i];
    }
    return null;
  }

  function screeningById(id) {
    return SCREENINGS.filter(function (s) { return s.id === id; })[0] || null;
  }

  function defaultAnswers() {
    return {
      age: null, dob: "", symptoms: [], emergency: [], family: [],
      pregnancy: "no", menopause: "na", risks: [], previous: {}
    };
  }

  function normalizeAnswers(input) {
    const base = defaultAnswers();
    const a = Object.assign(base, input || {});
    a.age = parseAge(a.age);
    a.symptoms = Array.isArray(a.symptoms) ? a.symptoms : [];
    a.emergency = Array.isArray(a.emergency) ? a.emergency : [];
    a.family = Array.isArray(a.family) ? a.family : [];
    a.risks = Array.isArray(a.risks) ? a.risks : [];
    a.previous = a.previous && typeof a.previous === "object" ? a.previous : {};
    return a;
  }

  function validateAnswers(answers, today) {
    const a = normalizeAnswers(answers);
    const now = today || new Date();
    const errors = {};
    if (a.dob && a.age === null) {
      const fromDob = ageFromDob(a.dob, now);
      if (fromDob === null) errors.dob = "Enter a valid date of birth in the past.";
      else a.age = fromDob;
    }
    if (a.age !== null) {
      if (!isFinite(a.age) || a.age < 10) errors.age = "This checklist covers ages 10 and older. For younger children, ask a paediatrician.";
      else if (a.age > 100) errors.age = "Please check the age entered — this checklist covers ages 10 to 100.";
    }
    return { ok: Object.keys(errors).length === 0, errors: errors, answers: a };
  }

  function evaluate(answers, opts) {
    const options = opts || {};
    const today = options.today || new Date();
    const checked = validateAnswers(answers, today);
    const a = checked.answers;
    const emergency = a.emergency.map(function (id) {
      const e = EMERGENCY_SIGNS.filter(function (x) { return x.id === id; })[0];
      return e ? { id: e.id, label: e.label, guidance: e.guidance } : null;
    }).filter(Boolean);
    const symptomCare = a.symptoms.map(function (id) {
      const s = SYMPTOMS.filter(function (x) { return x.id === id; })[0];
      return s ? { id: s.id, label: s.label, guidance: s.guidance, severity: s.severity, link: s.link } : null;
    }).filter(Boolean);

    if (!checked.ok || a.age === null) {
      return {
        general: true, valid: checked.ok, errors: checked.errors,
        age: a.age, group: ageGroupFor(a.age),
        due: [], discuss: [], recent: [], symptomCare: symptomCare, emergency: emergency,
        hasEmergency: emergency.length > 0,
        notice: checked.ok
          ? "Add your age for a personal checklist. The screening library below is general education, not a personal plan."
          : "Check the highlighted answer before seeing a personal checklist."
      };
    }

    const due = [];
    const discuss = [];
    const recent = [];
    SCREENINGS.forEach(function (s) {
      const rule = RULES[s.id];
      if (!rule) return;
      const r = rule(a, { today: today });
      if (!r || r.category === "not" || !r.reason) return;
      const row = {
        screeningId: s.id, name: s.name, icon: s.icon,
        condition: s.condition, interval: s.interval,
        reason: r.reason, category: r.category,
        source: s.source, review: REVIEW
      };
      if (r.category === "due") due.push(row);
      else if (r.category === "discuss") discuss.push(row);
      else recent.push(row);
    });

    return {
      general: false, valid: true, errors: {}, age: a.age, group: ageGroupFor(a.age),
      due: due, discuss: discuss, recent: recent,
      symptomCare: symptomCare, emergency: emergency, hasEmergency: emergency.length > 0,
      notice: ""
    };
  }

  /* ---------- plan and reminder state ---------- */
  function defaultState() {
    return {
      version: 1, savedAt: null, saveConsent: false,
      answers: null,
      plan: {},
      reminders: { enabled: false, items: [] }
    };
  }

  function normalizeState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== "object") return base;
    const state = Object.assign(base, raw);
    state.plan = raw.plan && typeof raw.plan === "object" ? raw.plan : {};
    state.reminders = Object.assign({ enabled: false, items: [] }, raw.reminders || {});
    if (!Array.isArray(state.reminders.items)) state.reminders.items = [];
    return state;
  }

  function load(store) {
    try {
      const raw = store && typeof store.get === "function" ? store.get(STORE_KEY, null) : null;
      return normalizeState(raw);
    } catch (e) {
      return defaultState();
    }
  }

  function save(store, state) {
    const payload = normalizeState(state);
    payload.savedAt = new Date().toISOString();
    const ok = store && typeof store.set === "function" ? store.set(STORE_KEY, payload) : false;
    return { ok: !!ok, state: payload };
  }

  function remove(store) {
    if (store && typeof store.remove === "function") store.remove(STORE_KEY);
  }

  function planEntry(state, id) {
    const p = state && state.plan ? state.plan[id] : null;
    return Object.assign({ status: "not-reviewed", date: "", updatedAt: null }, p || {});
  }

  function setPlanEntry(state, id, patch) {
    const current = planEntry(state, id);
    state.plan[id] = Object.assign(current, patch, { updatedAt: new Date().toISOString() });
    return state.plan[id];
  }

  function statusMeta(id) {
    return STATUSES.filter(function (s) { return s.id === id; })[0] || STATUSES[0];
  }

  function summary(state) {
    const s = normalizeState(state);
    const items = Object.keys(s.plan).map(function (id) {
      const sc = screeningById(id);
      return {
        id: id, name: sc ? sc.name : id, icon: sc ? sc.icon : "shield-check",
        status: planEntry(s, id).status, date: planEntry(s, id).date
      };
    }).sort(function (a, b) {
      const order = ["scheduled", "discuss", "not-reviewed", "completed"];
      return order.indexOf(a.status) - order.indexOf(b.status);
    });
    const counts = { due: 0, discuss: 0, scheduled: 0, completed: 0, "not-reviewed": 0 };
    items.forEach(function (i) { counts[i.status] = (counts[i.status] || 0) + 1; });
    const upcoming = items.filter(function (i) { return i.status === "scheduled" && i.date; })
      .sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    const reminders = (s.reminders.items || []).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return {
      hasState: !!s.savedAt, savedAt: s.savedAt, saveConsent: s.saveConsent,
      ageGroup: s.answers ? ageGroupFor(parseAge(s.answers.age)) : null,
      items: items, counts: counts, upcoming: upcoming, reminders: reminders,
      remindersEnabled: !!s.reminders.enabled
    };
  }

  function daysUntil(dateISO, today) {
    if (!dateISO) return null;
    const target = new Date(dateISO + "T00:00:00");
    const now = today || new Date();
    if (isNaN(target)) return null;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((target - start) / 86400000);
  }

  function normalizeReminder(input) {
    const title = String(input.title || "").trim().slice(0, 80);
    const date = String(input.date || "").trim();
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
    const d = new Date(date + "T00:00:00");
    if (isNaN(d)) return null;
    return { id: input.id || "", title: title, date: date, kind: input.kind === "followup" ? "followup" : "appointment" };
  }

  return {
    STORE_KEY: STORE_KEY, REVIEW: REVIEW, STATUSES: STATUSES,
    AGE_GROUPS: AGE_GROUPS, SCREENINGS: SCREENINGS, SYMPTOMS: SYMPTOMS,
    EMERGENCY_SIGNS: EMERGENCY_SIGNS, FAMILY_HISTORY: FAMILY_HISTORY,
    RISK_FACTORS: RISK_FACTORS, PREVIOUS_TESTS: PREVIOUS_TESTS,
    parseAge: parseAge, ageFromDob: ageFromDob, ageGroupFor: ageGroupFor,
    screeningById: screeningById, defaultAnswers: defaultAnswers,
    normalizeAnswers: normalizeAnswers, validateAnswers: validateAnswers,
    evaluate: evaluate, defaultState: defaultState, normalizeState: normalizeState,
    load: load, save: save, remove: remove,
    planEntry: planEntry, setPlanEntry: setPlanEntry, statusMeta: statusMeta,
    summary: summary, daysUntil: daysUntil, normalizeReminder: normalizeReminder
  };
});
