/* ==========================================================================
   JIVIKA AROGYA — nutrition, wellness, schemes and care content
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Nutrients ---------- */
  const NUTRIENTS = [
    {
      name: "Iron", amount: "About 21 mg a day for adult women",
      why: "Carries oxygen in the blood. Low iron is the most common cause of tiredness and anaemia in Indian women.",
      foods: ["Green leafy vegetables", "Dal and rajma", "Jaggery", "Ragi", "Dates", "Liver (occasionally)"],
      tip: "Take with lemon, amla or tomato. Keep tea and coffee an hour away from meals."
    },
    {
      name: "Calcium", amount: "About 1000 mg a day",
      why: "Builds and protects bones and teeth. Needs rise in adolescence, pregnancy and after menopause.",
      foods: ["Milk and curd", "Sesame seeds", "Ragi", "Paneer", "Small fish with bones", "Green leaves"],
      tip: "Split intake across the day — the body absorbs about 300 mg at a time."
    },
    {
      name: "Protein", amount: "About 0.8–1 g per kg body weight",
      why: "Repairs muscle, makes blood and hormones, and supports hair and skin.",
      foods: ["Dal, chana, rajma", "Eggs", "Curd and paneer", "Groundnuts", "Soya chunks", "Fish and chicken"],
      tip: "Include a protein source at every meal, not only at dinner."
    },
    {
      name: "Vitamin B12", amount: "About 2.2 µg a day",
      why: "Protects nerves and blood cells. Deficiency is common in vegetarian diets and can cause tingling and fatigue.",
      foods: ["Milk and curd", "Eggs", "Fish", "Fortified cereals", "Supplements when advised"],
      tip: "If you are vegan or vegetarian for many years, ask for a B12 test."
    },
    {
      name: "Folate (folic acid)", amount: "400 µg daily before and in early pregnancy",
      why: "Prevents serious brain and spine defects in the baby.",
      foods: ["Green leafy vegetables", "Sprouts", "Dal", "Bengal gram", "Fortified flour"],
      tip: "Start folic acid at least one month before planning a pregnancy, as advised."
    },
    {
      name: "Vitamin D", amount: "20–30 minutes of sunlight most days",
      why: "Helps calcium reach the bones and supports immunity and mood.",
      foods: ["Sunlight", "Fortified milk", "Egg yolk", "Fish", "Mushrooms"],
      tip: "Morning sun on arms and face is enough — avoid the harsh afternoon sun."
    },
    {
      name: "Omega-3 fats", amount: "2 servings of fish a week, or seeds daily",
      why: "Supports heart and brain health and may reduce period inflammation.",
      foods: ["Flax seeds", "Walnuts", "Mustard oil", "Small fish", "Chia seeds"],
      tip: "Grind flax seeds before eating — whole seeds pass through undigested."
    },
    {
      name: "Fibre", amount: "About 25–30 g a day",
      why: "Prevents constipation, steadies blood sugar and supports gut health.",
      foods: ["Whole grains", "Vegetables", "Fruit with skin", "Dal", "Guava", "Papaya"],
      tip: "Increase fibre slowly and drink more water, or you may feel bloated."
    }
  ];

  /* ---------- Diet by life stage ---------- */
  const STAGES = [
    {
      id: "teen",
      label: "Adolescent (12–19)",
      icon: "baby",
      focus: "Growth, iron and bone strength. This is when lifelong bone density is built and iron needs are highest.",
      needs: ["Iron with vitamin C", "Calcium", "Protein", "Folate"],
      meals: [
        { slot: "Breakfast", veg: "Ragi porridge with milk + 2 soaked dates", nonveg: "2 eggs + whole-grain toast + a fruit", why: "Calcium and protein start the day steadily." },
        { slot: "Mid-morning", veg: "A guava or orange", nonveg: "A boiled egg or curd", why: "Vitamin C helps iron absorption." },
        { slot: "Lunch", veg: "Dal + spinach sabzi + roti + curd", nonveg: "Egg curry + greens + rice", why: "Iron, folate and protein together." },
        { slot: "Snack", veg: "Roasted chana and jaggery", nonveg: "Peanuts and a glass of milk", why: "Cheap iron and calcium between classes." },
        { slot: "Dinner", veg: "Vegetable khichdi + curd", nonveg: "Chicken and vegetable stew + rice", why: "Easy to digest before sleep." }
      ],
      avoid: "Skip daily fizzy drinks and packet snacks — they replace real food and add no iron."
    },
    {
      id: "adult",
      label: "Adult (20–40)",
      icon: "user",
      focus: "Energy, iron stores and cycle balance. Regular meals protect against the crash that follows skipped food.",
      needs: ["Iron", "Protein", "Fibre", "B12"],
      meals: [
        { slot: "Breakfast", veg: "Poha with peas and peanuts + lemon", nonveg: "Egg bhurji + roti", why: "Iron plus vitamin C in one plate." },
        { slot: "Mid-morning", veg: "Buttermilk or a fruit", nonveg: "Curd with sprouts", why: "Hydration and protein." },
        { slot: "Lunch", veg: "Rajma or chana + rice + salad", nonveg: "Fish curry + rice + greens", why: "Protein, fibre and sustained energy." },
        { slot: "Snack", veg: "Sprouts chaat with lemon", nonveg: "Boiled egg and tea (not with meals)", why: "Folate and protein without fried food." },
        { slot: "Dinner", veg: "Millet roti + mixed vegetable + dal", nonveg: "Chicken + vegetables + roti", why: "Light dinner supports better sleep." }
      ],
      avoid: "Avoid skipping breakfast and then eating heavy fried food at night — it worsens cramps and acidity."
    },
    {
      id: "pregnancy",
      label: "Pregnancy",
      icon: "heart",
      focus: "Extra calories, iron, folate and calcium for two. Follow the ASHA worker's and doctor's advice at every visit.",
      needs: ["Folic acid", "Iron", "Calcium", "Protein", "Iodine"],
      meals: [
        { slot: "Breakfast", veg: "Milk + ragi dosa or paratha + fruit", nonveg: "Eggs + milk + fruit", why: "Calcium and protein before nausea builds." },
        { slot: "Mid-morning", veg: "A handful of nuts + buttermilk", nonveg: "Curd or a boiled egg", why: "Small frequent meals ease nausea." },
        { slot: "Lunch", veg: "Dal + green leafy sabzi + roti + curd", nonveg: "Fish or chicken + rice + greens", why: "Iron, folate and protein in one meal." },
        { slot: "Snack", veg: "Fruit chaat with lemon", nonveg: "Milk with a date", why: "Vitamin C improves iron uptake." },
        { slot: "Dinner", veg: "Khichdi + paneer or curd", nonveg: "Egg curry + rice", why: "Comfortable at night, easy to digest." }
      ],
      avoid: "No alcohol or tobacco. Avoid raw or undercooked meat, unpasteurised milk and unwashed raw salad outside home."
    },
    {
      id: "postpartum",
      label: "After delivery (0–6 months)",
      icon: "baby",
      focus: "Recovery, blood loss, and breastfeeding. Eating well now protects your own iron stores too.",
      needs: ["Protein", "Iron", "Calcium", "Fluids"],
      meals: [
        { slot: "Breakfast", veg: "Methi paratha + curd + milk", nonveg: "Eggs + porridge + milk", why: "Iron and protein for recovery." },
        { slot: "Mid-morning", veg: "Fruit + handful of seeds", nonveg: "Chicken soup or curd", why: "Keeps energy steady during feeding." },
        { slot: "Lunch", veg: "Dal + seasonal vegetable + rice + ghee", nonveg: "Fish curry + rice + greens", why: "Balanced plate with healthy fats." },
        { slot: "Snack", veg: "Sprouts or peanut chikki", nonveg: "Boiled egg + milk", why: "Protein without heavy fried food." },
        { slot: "Dinner", veg: "Ragi mudde or roti + vegetable + curd", nonveg: "Chicken + vegetables", why: "Calcium and protein before night feeds." }
      ],
      avoid: "Do not follow strict 'dieting' while breastfeeding, and do not stop iron tablets without your doctor's advice."
    },
    {
      id: "menopause",
      label: "45+ and menopause",
      icon: "moon",
      focus: "Bone protection, heart health and steady energy as oestrogen falls.",
      needs: ["Calcium", "Vitamin D", "Protein", "Fibre"],
      meals: [
        { slot: "Breakfast", veg: "Ragi porridge + milk + sesame chutney", nonveg: "Eggs + milk + fruit", why: "Highest calcium start to the day." },
        { slot: "Mid-morning", veg: "Buttermilk or a fruit", nonveg: "Curd", why: "Hydration and calcium." },
        { slot: "Lunch", veg: "Dal + greens + roti + curd", nonveg: "Fish + rice + vegetables", why: "Protein protects muscle mass." },
        { slot: "Snack", veg: "Roasted seeds and nuts", nonveg: "Boiled egg", why: "Omega-3 and protein." },
        { slot: "Dinner", veg: "Vegetable khichdi + paneer", nonveg: "Chicken stew + vegetables", why: "Light, high-protein dinner." }
      ],
      avoid: "Limit very salty and deep-fried food — it strains blood pressure and heart health."
    }
  ];

  const DIET_PREFS = [
    { id: "veg", label: "Vegetarian", note: "Dal, curd, paneer, soya and sprouts cover protein well. Add lemon with iron-rich meals." },
    { id: "vegan", label: "Vegan", note: "Use soya, chana, peanuts and seeds. Ask for a B12 test and supplement advice — plant food has no natural B12." },
    { id: "egg", label: "Eggs + vegetarian", note: "Two eggs a day add high-quality protein, B12 and vitamin D cheaply." },
    { id: "nonveg", label: "Non-vegetarian", note: "Small fish twice a week adds omega-3 and calcium if eaten with bones. Keep meat portions to a palm size." }
  ];

  const AFFORDABLE_FOODS = [
    { name: "Green leafy vegetables", cost: "₹10–20 a bunch", why: "Iron, folate, calcium", note: "Seasonal greens like palak, methi, drumstick leaves are cheapest locally." },
    { name: "Dal and chana", cost: "₹100–140 per kg", why: "Protein, iron, fibre", note: "Soak overnight to cook faster and improve absorption." },
    { name: "Ragi / millets", cost: "₹40–60 per kg", why: "Calcium, iron, fibre", note: "A low-cost replacement for part of the rice or wheat." },
    { name: "Eggs", cost: "₹6–8 each", why: "Protein, B12, vitamin D", note: "One of the cheapest complete proteins available." },
    { name: "Jaggery", cost: "₹50–70 per kg", why: "Iron, quick energy", note: "Use a small piece instead of refined sugar." },
    { name: "Groundnuts", cost: "₹100–130 per kg", why: "Protein, healthy fats", note: "Roast at home rather than buying salted packets." },
    { name: "Sesame seeds (til)", cost: "₹120–160 per kg", why: "Calcium, iron", note: "A spoon in chutney or roti adds calcium daily." },
    { name: "Sprouts", cost: "Very low", why: "Folate, protein, fibre", note: "Soak and sprout moong at home in 12 hours." },
    { name: "Curd", cost: "Low if set at home", why: "Calcium, protein, probiotics", note: "Set curd at home to halve the cost." },
    { name: "Seasonal fruit", cost: "₹30–60 per kg", why: "Vitamin C, fibre", note: "Buy what is in season locally — guava and papaya are usually cheap." },
    { name: "Small fish", cost: "₹80–150 per kg", why: "Omega-3, calcium, protein", note: "Eaten with soft bones, it is a strong calcium source." },
    { name: "Soya chunks", cost: "₹90–120 per kg", why: "High protein, iron", note: "Cheapest plant protein per gram; rinse before cooking." }
  ];

  /* ---------- Medicine safety ---------- */
  const MEDICINE_SAFETY = [
    "Take medicines only prescribed for you, at the dose and duration written. Do not share with family.",
    "Complete the full course of antibiotics even if you feel better after 2 days.",
    "Tell the doctor or pharmacist if you are pregnant, breastfeeding, or taking other medicines.",
    "Keep medicines in a dry place, out of children's reach. Check the expiry date before use.",
    "Do not take painkillers daily for period pain — it can cause stomach and kidney problems.",
    "Iron and calcium tablets are best taken at different times of day, as advised.",
    "Ask your pharmacist to explain how and when to take each medicine if the label is unclear.",
    "Never stop a prescribed medicine for BP, diabetes, thyroid or mental health without medical advice."
  ];

  /* ---------- Mental wellness ---------- */
  const BREATHING = [
    { id: "calm", name: "Calming 4–6 breath", inhale: 4, hold: 0, exhale: 6, holdOut: 0, rounds: 8, note: "Longer exhale settles a racing heart. Good before sleep." },
    { id: "box", name: "Box breathing", inhale: 4, hold: 4, exhale: 4, holdOut: 4, rounds: 6, note: "Steady and even — useful before a difficult conversation or an exam." },
    { id: "478", name: "4–7–8 breath", inhale: 4, hold: 7, exhale: 8, holdOut: 0, rounds: 5, note: "Deeply relaxing. Skip the long hold if you are pregnant or feel dizzy." }
  ];

  const SELF_CARE = [
    { id: "water", label: "Drank 8 glasses of water", icon: "water" },
    { id: "walk", label: "Moved my body for 20 minutes", icon: "leaf" },
    { id: "meal", label: "Ate three proper meals", icon: "bowl" },
    { id: "sun", label: "Sat in morning sunlight", icon: "sun" },
    { id: "breath", label: "Did a 2-minute breathing pause", icon: "wind" },
    { id: "talk", label: "Talked to someone I trust", icon: "users" },
    { id: "sleep", label: "Slept 7 hours or more", icon: "moon" },
    { id: "screen", label: "Kept phone away before bed", icon: "clock" }
  ];

  const GROUNDING = [
    "Name 5 things you can see around you.",
    "Notice 4 things you can touch — the floor, your cloth, the chair.",
    "Listen for 3 sounds, near and far.",
    "Find 2 things you can smell.",
    "Notice 1 taste in your mouth, and take one slow breath."
  ];

  const STRESS_SIGNS = [
    "Sleeping too little or too much",
    "Irritability over small things",
    "Headache, tight shoulders or stomach upset",
    "Losing interest in things you usually enjoy",
    "Crying easily or feeling numb",
    "Difficulty concentrating on simple tasks"
  ];

  const SUPPORT_CONTACTS = [
    { name: "Tele-MANAS", number: "14416", detail: "Free 24×7 mental health support in many languages", tone: "teal" },
    { name: "KIRAN Helpline", number: "18005990019", detail: "24×7 toll-free counselling, 13 languages", tone: "teal" },
    { name: "Vandrevala Foundation", number: "9999666555", detail: "24×7 emotional support and counselling", tone: "lav" },
    { name: "iCALL (TISS)", number: "9152987821", detail: "Mon–Sat, 10 am–8 pm psychosocial counselling", tone: "lav" },
    { name: "AASRA", number: "9820466726", detail: "24×7 suicide prevention support", tone: "pink" },
    { name: "Women's Helpline", number: "181", detail: "Violence, abuse and safety support, 24×7", tone: "pink" }
  ];

  const SLEEP_TIPS = [
    "Keep the same sleep and wake time, even on holidays.",
    "No tea or coffee after 4 pm.",
    "Dim lights an hour before bed and keep the phone away.",
    "Keep the room cool and quiet; use a cloth over the eyes if needed.",
    "If you cannot sleep in 20 minutes, sit up and read in dim light until sleepy."
  ];

  const JOURNAL_PROMPTS = [
    "What is one thing that felt heavy today, and one thing that felt light?",
    "Who is one person I can call when I feel low?",
    "What would I say to a friend feeling exactly how I feel now?",
    "What is one small thing I did well today?",
    "What do I need tomorrow — rest, help, or company?"
  ];

  /* ---------- Government schemes ---------- */
  const SCHEMES = [
    {
      id: "pmjay", name: "Ayushman Bharat PM-JAY", level: "Central", category: "Health cover",
      benefit: "Health cover of up to ₹5 lakh per family per year for hospital treatment, including many women's procedures.",
      who: "Families identified in the SECC database, and senior citizens aged 70+ regardless of income.",
      docs: ["Aadhaar card", "Ration card", "Ayushman card or family ID"],
      how: "Check eligibility at your nearest Ayushman Arogya Mandir, CSC, or hospital help desk. Ask for the Ayushman card.",
      link: "https://pmjay.gov.in"
    },
    {
      id: "jsy", name: "Janani Suraksha Yojana", level: "Central", category: "Maternity",
      benefit: "Cash assistance for institutional delivery, with ASHA support for transport and paperwork. Amount varies by state.",
      who: "Pregnant women delivering in a government or accredited private facility, especially first-time and rural mothers.",
      docs: ["MCP card", "Aadhaar", "Bank passbook", "ASHA referral"],
      how: "Register your pregnancy with the ASHA worker. She will help with the form and the bank details.",
      link: "https://nhm.gov.in"
    },
    {
      id: "jssk", name: "Janani Shishu Suraksha Karyakram", level: "Central", category: "Maternity",
      benefit: "Free delivery including caesarean, free medicines, diagnostics, blood, diet and transport for mother and sick newborn.",
      who: "All pregnant women delivering in public health institutions, and sick newborns up to 30 days.",
      docs: ["MCP card", "Aadhaar", "Hospital registration"],
      how: "Go to any government facility for delivery. Ask the help desk about JSSK entitlements — they are free, not paid.",
      link: "https://nhm.gov.in"
    },
    {
      id: "pmsma", name: "Pradhan Mantri Surakshit Matritva Abhiyan", level: "Central", category: "Maternity",
      benefit: "Free comprehensive antenatal check-up by a doctor on the 9th of every month at government facilities.",
      who: "All pregnant women, especially in the second and third trimester.",
      docs: ["MCP card", "Previous reports"],
      how: "Visit your PHC or CHC on the 9th, or ask the ASHA worker for the PMSMA date in your area.",
      link: "https://pmsma.nhm.gov.in"
    },
    {
      id: "hwc", name: "Ayushman Arogya Mandir (Health & Wellness Centre)", level: "Central", category: "Primary care",
      benefit: "Free primary care, screening for BP, sugar and common cancers, essential medicines and teleconsultation.",
      who: "Everyone in the catchment area — no income condition.",
      docs: ["Aadhaar (optional)", "ABHA ID (optional)"],
      how: "Walk in to your nearest Ayushman Arogya Mandir. Ask for the NCD screening and the free medicine list.",
      link: "https://ab-hwc.nhp.gov.in"
    },
    {
      id: "pmmvy", name: "Pradhan Mantri Matru Vandana Yojana", level: "Central", category: "Maternity",
      benefit: "Maternity benefit of ₹5,000 for the first child (and ₹6,000 for a second child if it is a girl), paid in instalments.",
      who: "Pregnant and lactating mothers, excluding those in regular government employment.",
      docs: ["Aadhaar", "Bank passbook", "MCP card", "Husband's Aadhaar"],
      how: "Apply at the Anganwadi centre or through the PMMVY citizen portal within the time limits.",
      link: "https://pmmvy.wcd.gov.in"
    },
    {
      id: "mhs", name: "Menstrual Hygiene Scheme", level: "Central", category: "Adolescent health",
      benefit: "Subsidised sanitary napkins for adolescent girls in rural areas, distributed through ASHA workers and schools.",
      who: "Adolescent girls aged 10–19 in rural areas, and school-based programmes.",
      docs: ["None — ask the ASHA worker"],
      how: "Ask your ASHA worker or school health programme for the subsidised pack.",
      link: "https://nhm.gov.in"
    },
    {
      id: "rksk", name: "Rashtriya Kishor Swasthya Karyakram", level: "Central", category: "Adolescent health",
      benefit: "Adolescent-friendly health clinics, peer education, menstrual hygiene, nutrition and mental health support.",
      who: "Adolescents aged 10–19.",
      docs: ["None"],
      how: "Ask at the PHC for the Adolescent Friendly Health Clinic (AFHC) and the RKSK peer educator.",
      link: "https://nhm.gov.in"
    },
    {
      id: "poshan", name: "POSHAN Abhiyaan & Anganwadi services", level: "Central", category: "Nutrition",
      benefit: "Supplementary nutrition, take-home rations, growth monitoring, nutrition counselling and early childhood care.",
      who: "Pregnant women, lactating mothers, adolescent girls and children under 6.",
      docs: ["Aadhaar", "MCP card", "Ration card"],
      how: "Register at the nearest Anganwadi centre. Ask about take-home ration days and counselling sessions.",
      link: "https://poshantracker.in"
    },
    {
      id: "karnataka", name: "Mathru Poorna & Thayi Bhagya (Karnataka)", level: "State", category: "State example",
      benefit: "One nutritious hot meal daily for pregnant and lactating women at Anganwadi centres, plus maternity support in government hospitals.",
      who: "Pregnant and lactating women in Karnataka.",
      docs: ["Aadhaar", "MCP card", "Anganwadi registration"],
      how: "Ask your Anganwadi worker to enrol you. Verify current rules with the district health office.",
      link: "https://karunadu.karnataka.gov.in"
    },
    {
      id: "arogyasri", name: "Aarogyasri (Telangana / Andhra Pradesh)", level: "State", category: "State example",
      benefit: "Cashless treatment for listed procedures at network hospitals, including maternity and cancer care.",
      who: "Eligible white ration card holders in the respective state.",
      docs: ["Ration card", "Aadhaar", "Aarogyasri card"],
      how: "Check the network hospital list and get pre-authorisation through the Aarogyasri help desk.",
      link: "https://aarogyasri.telangana.gov.in"
    },
    {
      id: "tamilnadu", name: "Makkalai Thedi Maruthuvam (Tamil Nadu)", level: "State", category: "State example",
      benefit: "Doorstep screening and medicine delivery for BP, diabetes and non-communicable diseases.",
      who: "Residents of Tamil Nadu, especially those with limited mobility.",
      docs: ["Aadhaar", "Existing prescriptions"],
      how: "Ask the village health nurse or the local urban health centre to include you in the screening round.",
      link: "https://www.tn.gov.in"
    }
  ];

  /* ---------- Care-seeking guidance ---------- */
  const CARE_LEVELS = [
    { level: "Treat at home", icon: "home", when: "Mild cold, small cuts, mild period cramps, tiredness after a busy day.", where: "Rest, fluids, home care. Watch for warning signs." },
    { level: "Visit your PHC / Arogya Mandir", icon: "hospital", when: "Fever over 2 days, period pain that affects work, burning urine, unusual discharge, a new lump.", where: "ASHA worker, ANM, or doctor at the primary health centre." },
    { level: "Go to a district hospital", icon: "stethoscope", when: "Heavy bleeding, suspected fracture, severe abdominal pain, pregnancy complications, no improvement after treatment.", where: "CHC or district hospital with specialist and diagnostic services." },
    { level: "Emergency — call 108 now", icon: "alert", when: "Chest pain, difficulty breathing, unconsciousness, heavy bleeding, seizure, suspected stroke, snake bite.", where: "Do not travel alone. Call 108 for free ambulance transport." }
  ];

  window.JV = window.JV || {};
  window.JV.wellbeing = {
    NUTRIENTS: NUTRIENTS,
    STAGES: STAGES,
    DIET_PREFS: DIET_PREFS,
    AFFORDABLE_FOODS: AFFORDABLE_FOODS,
    MEDICINE_SAFETY: MEDICINE_SAFETY,
    BREATHING: BREATHING,
    SELF_CARE: SELF_CARE,
    GROUNDING: GROUNDING,
    STRESS_SIGNS: STRESS_SIGNS,
    SUPPORT_CONTACTS: SUPPORT_CONTACTS,
    SLEEP_TIPS: SLEEP_TIPS,
    JOURNAL_PROMPTS: JOURNAL_PROMPTS,
    SCHEMES: SCHEMES,
    CARE_LEVELS: CARE_LEVELS
  };
})();
