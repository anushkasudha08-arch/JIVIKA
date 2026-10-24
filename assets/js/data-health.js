/* ==========================================================================
   JIVIKA AROGYA — health education content
   Written in plain language for community health education. Not a diagnosis.
   ========================================================================== */
(function () {
  "use strict";

  /* ---------- Emergency & helpline numbers (India) ---------- */
  const HELPLINES = [
    { number: "108", label: "Ambulance", note: "Free emergency transport, 24×7, all states", tone: "danger" },
    { number: "112", label: "All emergencies", note: "Police, fire and ambulance in one call", tone: "danger" },
    { number: "181", label: "Women's helpline", note: "Violence, abuse, safety, counselling", tone: "pink" },
    { number: "104", label: "Health advice", note: "Talk to a health worker in your language", tone: "teal" },
    { number: "14416", label: "Tele-MANAS", note: "Free mental health support, 24×7", tone: "lav" },
    { number: "1091", label: "Women in distress", note: "Police help for women, 24×7", tone: "pink" },
    { number: "1098", label: "Childline", note: "Help for children in danger", tone: "lav" }
  ];

  /* ---------- Daily tips (rotated by date) ---------- */
  const TIPS = [
    {
      tag: "Iron",
      en: "Pair iron-rich foods — dal, green leafy vegetables, ragi — with lemon, amla or tomato. Vitamin C helps your body absorb iron.",
      hi: "दाल, हरी सब्ज़ियाँ और रागी जैसे आयरन वाले खाने के साथ नींबू, आँवला या टमाटर लें। विटामिन C शरीर में आयरन सोखने में मदद करता है।",
      kn: "ಬೇಳೆ, ಹಸಿರು ಸೊಪ್ಪು, ರಾಗಿ ಮುಂತಾದ ಕಬ್ಬಿಣಯುಕ್ತ ಆಹಾರದೊಂದಿಗೆ ನಿಂಬೆ, ನೆಲ್ಲಿಕಾಯಿ ಅಥವಾ ಟೊಮೇಟೊ ಸೇರಿಸಿ. ವಿಟಮಿನ್ C ಕಬ್ಬಿಣ ಹೀರಿಕೊಳ್ಳಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ."
    },
    {
      tag: "Menstrual care",
      en: "Change your pad every 4–6 hours, even on light days. Wash the area with plain water only — no soap inside, no douching.",
      hi: "हल्के दिनों में भी हर 4–6 घंटे में पैड बदलें। केवल सादा पानी से साफ़ करें — अंदर साबुन या डोश नहीं।",
      kn: "ಹಗುರ ದಿನಗಳಲ್ಲೂ ಪ್ರತಿ 4–6 ಗಂಟೆಗೊಮ್ಮೆ ಪ್ಯಾಡ್ ಬದಲಿಸಿ. ಸಾಮಾನ್ಯ ನೀರಿನಿಂದ ಮಾತ್ರ ತೊಳೆಯಿರಿ — ಒಳಗೆ ಸೋಪು ಬೇಡ."
    },
    {
      tag: "Movement",
      en: "30 minutes of walking on most days supports your heart, bones and mood. It does not have to be all at once.",
      hi: "ज़्यादातर दिन 30 मिनट चलना दिल, हड्डियों और मन के लिए अच्छा है। एक साथ करना ज़रूरी नहीं।",
      kn: "ಬಹುತೇಕ ದಿನಗಳಲ್ಲಿ 30 ನಿಮಿಷ ನಡೆಯುವುದು ಹೃದಯ, ಮೂಳೆ ಮತ್ತು ಮನಸ್ಸಿಗೆ ಒಳ್ಳೆಯದು. ಒಂದೇ ಬಾರಿ ಮಾಡಬೇಕಿಲ್ಲ."
    },
    {
      tag: "Sleep",
      en: "Aim for 7–8 hours of sleep at a regular time. Steady sleep helps hormones, periods and mood.",
      hi: "रोज़ एक ही समय पर 7–8 घंटे सोने की कोशिश करें। नियमित नींद हार्मोन, मासिक और मन को संतुलित रखती है।",
      kn: "ಪ್ರತಿದಿನ ಒಂದೇ ಸಮಯಕ್ಕೆ 7–8 ಗಂಟೆ ನಿದ್ದೆ ಮಾಡಲು ಪ್ರಯತ್ನಿಸಿ. ನಿಯಮಿತ ನಿದ್ದೆ ಹಾರ್ಮೋನ್, ಮಾಸಿಕ ಮತ್ತು ಮನಸ್ಸಿಗೆ ಸಹಾಯ ಮಾಡುತ್ತದೆ."
    },
    {
      tag: "Bones",
      en: "Calcium needs vitamin D to work. Include milk, curd, sesame seeds, ragi or leafy greens, and get some morning sunlight.",
      hi: "कैल्शियम के लिए विटामिन D ज़रूरी है। दूध, दही, तिल, रागी या हरी सब्ज़ियाँ लें और सुबह की धूप लें।",
      kn: "ಕ್ಯಾಲ್ಸಿಯಂಗೆ ವಿಟಮಿನ್ D ಬೇಕು. ಹಾಲು, ಮೊಸರು, ಎಳ್ಳು, ರಾಗಿ ಅಥವಾ ಹಸಿರು ಸೊಪ್ಪು ಸೇರಿಸಿ, ಬೆಳಗಿನ ಬಿಸಿಲು ಪಡೆಯಿರಿ."
    },
    {
      tag: "Period pain",
      en: "If period pain makes you miss work or school every month, it is not something you must simply bear. Ask a doctor about it.",
      hi: "अगर हर महीने मासिक दर्द से काम या स्कूल छूटता है, तो इसे सहना ज़रूरी नहीं। डॉक्टर से जाँच करवाएँ।",
      kn: "ಪ್ರತಿ ತಿಂಗಳು ಮಾಸಿಕ ನೋವಿನಿಂದ ಕೆಲಸ ಅಥವಾ ಶಾಲೆ ತಪ್ಪುತ್ತಿದ್ದರೆ, ಅದನ್ನು ಸಹಿಸಬೇಕಿಲ್ಲ. ವೈದ್ಯರನ್ನು ಕೇಳಿ."
    },
    {
      tag: "Hydration",
      en: "Keep a bottle with you and sip through the day. Pale yellow urine is a simple sign that you are drinking enough.",
      hi: "पानी की बोतल साथ रखें और दिनभर थोड़ा-थोड़ा पिएँ। हल्का पीला पेशाब पर्याप्त पानी का संकेत है।",
      kn: "ನೀರಿನ ಬಾಟಲಿ ಜೊತೆಗೆ ಇಟ್ಟುಕೊಂಡು ದಿನವಿಡೀ ಸ್ವಲ್ಪ ಸ್ವಲ್ಪ ಕುಡಿಯಿರಿ. ತಿಳಿ ಹಳದಿ ಮೂತ್ರ ಸಾಕಷ್ಟು ನೀರು ಕುಡಿದಿರುವ ಸೂಚನೆ."
    },
    {
      tag: "Stress",
      en: "Try two minutes of slow breathing: in for 4 counts, out for 6. It calms the body within minutes.",
      hi: "दो मिनट धीमी साँस लें: 4 गिनती में अंदर, 6 गिनती में बाहर। शरीर कुछ ही मिनटों में शांत होता है।",
      kn: "ಎರಡು ನಿಮಿಷ ನಿಧಾನ ಉಸಿರಾಟ ಮಾಡಿ: 4 ಎಣಿಕೆ ಒಳಗೆ, 6 ಎಣಿಕೆ ಹೊರಗೆ. ಕೆಲವೇ ನಿಮಿಷಗಳಲ್ಲಿ ದೇಹ ಶಾಂತವಾಗುತ್ತದೆ."
    },
    {
      tag: "Breast health",
      en: "Check your breasts once a month, a few days after your period. You are learning what is normal for you, so changes are easier to notice.",
      hi: "मासिक के कुछ दिन बाद महीने में एक बार अपनी छाती जाँचें। इससे आपको अपना सामान्य पता रहता है और बदलाव आसानी से दिखते हैं।",
      kn: "ಮಾಸಿಕ ಮುಗಿದ ಕೆಲವು ದಿನಗಳ ನಂತರ ತಿಂಗಳಿಗೊಮ್ಮೆ ಎದೆ ಪರೀಕ್ಷಿಸಿ. ಇದರಿಂದ ಸಾಮಾನ್ಯ ಸ್ಥಿತಿ ತಿಳಿದು ಬದಲಾವಣೆ ಸುಲಭವಾಗಿ ಗಮನಕ್ಕೆ ಬರುತ್ತದೆ."
    },
    {
      tag: "Medicine safety",
      en: "Never take leftover antibiotics or share medicines with family. Wrong medicines can harm you and make infections harder to treat.",
      hi: "बची हुई एंटीबायोटिक न लें और दवा किसी से साझा न करें। गलत दवा नुकसान कर सकती है और संक्रमण का इलाज मुश्किल बना सकती है।",
      kn: "ಉಳಿದ ಆಂಟಿಬಯೋಟಿಕ್ ತೆಗೆದುಕೊಳ್ಳಬೇಡಿ, ಔಷಧಿ ಇತರರೊಂದಿಗೆ ಹಂಚಬೇಡಿ. ತಪ್ಪು ಔಷಧಿ ಹಾನಿ ಮಾಡಬಹುದು, ಸೋಂಕಿನ ಚಿಕಿತ್ಸೆ ಕಷ್ಟವಾಗಬಹುದು."
    },
    {
      tag: "Warning sign",
      en: "Soaking through one pad every hour, or bleeding for more than 7 days, needs medical care the same day. Do not wait.",
      hi: "हर घंटे एक पैड पूरा भर जाना, या 7 दिन से ज़्यादा खून आना — उसी दिन डॉक्टर के पास जाएँ। रुकें नहीं।",
      kn: "ಪ್ರತಿ ಗಂಟೆಗೆ ಒಂದು ಪ್ಯಾಡ್ ಪೂರ್ತಿ ತುಂಬುವುದು, ಅಥವಾ 7 ದಿನಗಳಿಗಿಂತ ಹೆಚ್ಚು ರಕ್ತಸ್ರಾವ — ಅದೇ ದಿನ ವೈದ್ಯರನ್ನು ಸಂಪರ್ಕಿಸಿ."
    },
    {
      tag: "Affordable food",
      en: "Greens, jaggery, groundnuts, sprouts, eggs and seasonal fruit give strong nutrition for very little money.",
      hi: "हरी सब्ज़ियाँ, गुड़, मूँगफली, अंकुरित दालें, अंडे और मौसमी फल कम खर्च में अच्छा पोषण देते हैं।",
      kn: "ಹಸಿರು ಸೊಪ್ಪು, ಬೆಲ್ಲ, ಶೇಂಗಾ, ಮೊಳಕೆ, ಮೊಟ್ಟೆ ಮತ್ತು ಸೀಸನ್ ಹಣ್ಣು ಕಡಿಮೆ ವೆಚ್ಚದಲ್ಲಿ ಉತ್ತಮ ಪೋಷಣೆ ನೀಡುತ್ತವೆ."
    }
  ];

  /* ---------- Mood scale ---------- */
  const MOODS = [
    { id: 1, key: "Very low", icon: "mood-1" },
    { id: 2, key: "Low", icon: "mood-2" },
    { id: 3, key: "Okay", icon: "mood-3" },
    { id: 4, key: "Good", icon: "mood-4" },
    { id: 5, key: "Great", icon: "mood-5" }
  ];

  /* ---------- Menstrual symptoms ---------- */
  const SYMPTOMS = [
    { id: "cramps", label: "Cramps" },
    { id: "backpain", label: "Back pain" },
    { id: "headache", label: "Headache" },
    { id: "bloating", label: "Bloating" },
    { id: "breast", label: "Breast tenderness" },
    { id: "fatigue", label: "Tiredness" },
    { id: "acne", label: "Acne" },
    { id: "mood", label: "Mood swings" },
    { id: "nausea", label: "Nausea" },
    { id: "dizziness", label: "Dizziness" },
    { id: "cravings", label: "Food cravings" },
    { id: "sleep", label: "Poor sleep" }
  ];

  const FLOW = [
    { id: "light", label: "Light" },
    { id: "medium", label: "Medium" },
    { id: "heavy", label: "Heavy" }
  ];

  /* ---------- Physical health conditions ---------- */
  const CONDITIONS = [
    {
      id: "osteoporosis",
      title: "Osteoporosis (weak bones)",
      category: "Bones & joints",
      icon: "scale",
      summary: "Bone strength quietly drops after menopause, especially if calcium, vitamin D or movement is low. There are often no signs until a bone breaks.",
      symptoms: ["Loss of height over time", "Stooping posture", "Sudden back pain", "A fracture after a minor fall"],
      warning: ["A fracture from a simple fall", "Sudden severe back pain that does not settle"],
      when: "Ask for a bone check if you are over 50, have had a fracture, or have a close family member with osteoporosis.",
      tip: "Daily weight-bearing movement (walking, stairs) plus calcium-rich food is the cheapest protection."
    },
    {
      id: "heart",
      title: "Heart disease in women",
      category: "Heart",
      icon: "heart-pulse",
      summary: "Heart attacks in women can look different from films — often breathlessness, tiredness, nausea or jaw and back discomfort rather than a dramatic chest pain.",
      symptoms: ["Chest tightness, pressure or heaviness", "Breathlessness with little effort", "Pain in jaw, neck, back or arm", "Cold sweat, nausea, unusual tiredness"],
      warning: ["Chest pain lasting more than 5 minutes", "Breathlessness while resting", "Pain spreading to arm or jaw with sweating"],
      when: "Call 108 immediately for the warning signs above. Do not wait for it to pass or drive yourself.",
      tip: "Rural women often delay care. If something feels very wrong, say it out loud and call for help."
    },
    {
      id: "breast",
      title: "Breast health & lumps",
      category: "Breast",
      icon: "heart",
      summary: "Most breast lumps are not cancer, but every new lump needs a doctor's examination. Knowing your normal helps you notice changes early.",
      symptoms: ["A new lump or thickening", "Skin dimpling or puckering", "Nipple turning inward", "Discharge or rash around the nipple", "Change in size or shape"],
      warning: ["A hard lump that does not move", "Bloody or one-sided nipple discharge", "Orange-peel skin or an open sore"],
      when: "See a doctor within days for any warning sign. Ask your PHC about clinical breast examination and mammography camps.",
      tip: "Do the self-check on the same day each month, a few days after your period ends."
    },
    {
      id: "anaemia",
      title: "Anaemia (low blood)",
      category: "Blood & energy",
      icon: "droplet",
      summary: "Very common in Indian women, especially with heavy periods or low iron intake. It reduces oxygen in the body and makes everything feel harder.",
      symptoms: ["Constant tiredness", "Pale inner eyelids, palms or tongue", "Breathlessness on stairs", "Dizziness or headache", "Brittle nails, hair fall"],
      warning: ["Breathlessness at rest", "Fainting or chest pain", "Black stools"],
      when: "Get a haemoglobin test at your PHC. Iron tablets must be prescribed after a test, not started by guess.",
      tip: "Tea or coffee with meals blocks iron absorption — keep a gap of an hour."
    },
    {
      id: "pcos",
      title: "PCOS (polycystic ovary syndrome)",
      category: "Hormones",
      icon: "refresh",
      summary: "A hormonal condition where periods become irregular and androgen levels rise. It is manageable, but needs ongoing care, not a single course of tablets.",
      symptoms: ["Periods more than 35 days apart or missing", "Acne and excess facial hair", "Weight gain around the belly", "Difficulty conceiving", "Dark velvety skin patches"],
      warning: ["No period for 3 months or more", "Very heavy bleeding with clots", "Severe pelvic pain"],
      when: "See a gynaecologist for a proper assessment. Do not start hormonal medicines on your own.",
      tip: "Small regular meals, movement and sleep can improve symptoms alongside medical care."
    },
    {
      id: "thyroid",
      title: "Thyroid problems",
      category: "Hormones",
      icon: "sparkle",
      summary: "Both an under-active and over-active thyroid can disturb periods, weight, skin and mood. A simple blood test can identify it.",
      symptoms: ["Unexplained weight gain or loss", "Feeling very cold or very hot", "Hair fall and dry skin", "Irregular or heavy periods", "Low mood or restlessness"],
      warning: ["A visible swelling in the neck", "Palpitations with weight loss", "Severe weakness or swelling"],
      when: "Ask for a TSH test. Thyroid medicine needs dose adjustment by a doctor and regular follow-up.",
      tip: "Take thyroid tablets on an empty stomach, 30–60 minutes before food, as prescribed."
    },
    {
      id: "uti",
      title: "Urinary tract infection",
      category: "General",
      icon: "water",
      summary: "Common and usually treatable, but it can spread to the kidney if ignored. Worth acting on early.",
      symptoms: ["Burning while passing urine", "Going often, little urine", "Lower abdominal pressure", "Cloudy or strong-smelling urine"],
      warning: ["Fever with back or side pain", "Blood in urine", "Vomiting or confusion"],
      when: "See a doctor if symptoms last more than 2 days or if you are pregnant — pregnancy changes which medicines are safe.",
      tip: "Drink water, do not hold urine for long hours, and always wipe from front to back."
    },
    {
      id: "skin",
      title: "Skin problems",
      category: "Skin & hair",
      icon: "sparkle",
      summary: "Acne, melasma and fungal infections are common and treatable. Harmful home hacks often make them worse.",
      symptoms: ["Pimples with blackheads", "Brown patches on cheeks or forehead", "Itchy ring-shaped rash", "Darkening of neck and folds"],
      warning: ["A spreading rash with fever", "Painful blisters", "Rapidly changing mole"],
      when: "See a doctor if the rash spreads fast, is very painful, or nothing improves in 2–3 weeks.",
      tip: "Do not apply toothpaste, lemon or turmeric on burns or acne — it damages the skin barrier."
    },
    {
      id: "hair",
      title: "Hair fall & thinning",
      category: "Skin & hair",
      icon: "users",
      summary: "Seasonal shedding is normal, but heavy daily hair fall is often linked to iron, thyroid, protein intake or PCOS.",
      symptoms: ["Hair on the pillow or comb in large amounts", "Widening middle parting", "Weak, brittle strands", "Scaly, itchy scalp"],
      warning: ["Sudden patchy bald areas", "Hair loss with rashes or fever"],
      when: "See a doctor if loss continues beyond 2–3 months or comes with irregular periods.",
      tip: "Wash the scalp regularly, avoid tight hairstyles and harsh chemical treatments."
    },
    {
      id: "diabetes",
      title: "Diabetes in women",
      category: "Blood & energy",
      icon: "heart-pulse",
      summary: "Diabetes can be silent for years. In women it raises the risk of heart disease, and pregnancy needs special care.",
      symptoms: ["Feeling thirsty often", "Passing urine many times", "Weight loss without trying", "Slow-healing wounds", "Repeated infections"],
      warning: ["Very sweet-smelling breath with drowsiness", "Wound turning black", "Chest pain"],
      when: "Get a blood sugar test at your PHC, especially if there is family history or gestational diabetes in a past pregnancy.",
      tip: "Never stop prescribed diabetes medicine on your own, even if readings improve."
    },
    {
      id: "menopause",
      title: "Perimenopause & menopause",
      category: "Hormones",
      icon: "moon",
      summary: "Periods become irregular and eventually stop, usually between 45 and 55. Symptoms are real and deserve support.",
      symptoms: ["Hot flushes and night sweats", "Disturbed sleep and irritability", "Vaginal dryness", "Joint aches", "Period changes"],
      warning: ["Bleeding after 12 months without periods", "Very heavy bleeding", "Bleeding between periods"],
      when: "Any bleeding after menopause needs a gynaecologist assessment — do not treat it as a normal change.",
      tip: "Strength exercise and calcium protect bones as oestrogen falls."
    },
    {
      id: "cervical",
      title: "Cervical cancer screening",
      category: "Screening",
      icon: "shield-check",
      summary: "Cervical cancer develops slowly and can be caught early. Screening is available at many government facilities.",
      symptoms: ["Often no symptoms in early stage", "Bleeding between periods", "Bleeding after intercourse", "Unusual discharge", "Pelvic pain"],
      warning: ["Bleeding after intercourse", "Foul-smelling discharge", "Unexplained bleeding after menopause"],
      when: "Screening is advised from age 30. Ask your PHC or Arogya Mandir about VIA or HPV testing availability.",
      tip: "HPV vaccination is recommended for girls aged 9–14 — ask the health worker in your area."
    }
  ];

  /* ---------- First aid ---------- */
  const FIRSTAID = [
    {
      id: "bleeding",
      title: "Severe bleeding",
      icon: "droplet",
      steps: [
        "Press firmly on the wound with a clean cloth or sterile pad.",
        "Keep pressing for at least 10 minutes without lifting to look.",
        "Raise the injured limb above heart level if possible.",
        "Add more cloth on top if blood seeps through — do not remove the first layer."
      ],
      donts: ["Do not apply mud, ash, chilli powder or cow dung.", "Do not use a tight tourniquet unless trained."],
      call: "Call 108 for heavy bleeding that does not slow down."
    },
    {
      id: "burns",
      title: "Burns & scalds",
      icon: "alert",
      steps: [
        "Cool the burn under clean running water for 20 minutes.",
        "Remove rings or tight items near the area before swelling starts.",
        "Cover loosely with a clean cloth or cling film.",
        "Give sips of water or ORS if the person is alert."
      ],
      donts: ["Do not apply ice, toothpaste, oil, ghee or turmeric.", "Do not burst blisters."],
      call: "Get care for burns larger than the palm, on face, hands, genitals, or if the skin is white or charred."
    },
    {
      id: "fainting",
      title: "Fainting",
      icon: "heart",
      steps: [
        "Lay the person flat and raise the legs about 30 cm.",
        "Turn the head to one side and loosen tight clothing.",
        "Ensure fresh air and check breathing.",
        "On waking, give water only if fully alert and sitting up."
      ],
      donts: ["Do not pour water on the face or force liquids into the mouth.", "Do not leave the person alone."],
      call: "Call 108 if they do not wake in 1 minute, have a seizure, or are pregnant or injured."
    },
    {
      id: "heat",
      title: "Heat exhaustion & heat stroke",
      icon: "sun",
      steps: [
        "Move the person to shade and loosen clothing.",
        "Sponge with cool water and fan the skin.",
        "Give small sips of water or ORS if fully conscious.",
        "For heat stroke, keep cooling until help arrives."
      ],
      donts: ["Do not give alcohol, strong tea or coffee.", "Do not leave a child in a parked vehicle."],
      call: "Call 108 if there is confusion, no sweating with hot skin, or unconsciousness."
    },
    {
      id: "choking",
      title: "Choking",
      icon: "users",
      steps: [
        "Ask loudly: are you choking? If they can cough, encourage coughing.",
        "If they cannot speak or breathe, give 5 firm back blows between the shoulder blades.",
        "If it does not clear, give up to 5 abdominal thrusts.",
        "Repeat and start CPR if the person becomes unresponsive."
      ],
      donts: ["Do not put fingers blindly into the throat.", "Do not give water to push the object down."],
      call: "Call 108 immediately — every second matters."
    },
    {
      id: "snake",
      title: "Snake bite",
      icon: "alert",
      steps: [
        "Keep the person calm and completely still.",
        "Immobilise the bitten limb with a splint, kept at heart level.",
        "Remove rings, bangles and tight clothing near the bite.",
        "Go to a hospital with anti-snake venom as fast as possible."
      ],
      donts: ["Do not cut, suck or burn the wound.", "Do not tie a tight tourniquet or apply herbs."],
      call: "Call 108 and carry the person — walking fast speeds up the venom."
    },
    {
      id: "sprain",
      title: "Sprains & minor injuries",
      icon: "scale",
      steps: [
        "Rest the limb and avoid putting weight on it.",
        "Apply a cold pack wrapped in cloth for 15–20 minutes.",
        "Wrap with a soft crepe bandage — snug, not tight.",
        "Elevate the limb above heart level when resting."
      ],
      donts: ["Do not massage with heat or oil in the first 48 hours.", "Do not walk on a limb that cannot bear weight."],
      call: "Get an X-ray if there is severe swelling, deformity, or you cannot move the joint."
    },
    {
      id: "fever",
      title: "High fever in an adult",
      icon: "clock",
      steps: [
        "Rest, drink fluids often, and wear light clothing.",
        "Sponge with lukewarm water if very hot.",
        "Paracetamol may be taken as per the label or as advised by a health worker.",
        "Note the fever pattern and any other symptoms for the doctor."
      ],
      donts: ["Do not take antibiotics without a prescription.", "Do not use ice-cold water or alcohol rubs."],
      call: "Seek care if fever lasts over 3 days, crosses 103°F, or comes with rash, stiff neck, bleeding or breathlessness — especially in pregnancy."
    }
  ];

  /* ---------- Home remedy cards (5-part structure) ---------- */
  const REMEDIES = [
    {
      id: "cramps",
      concern: "Period cramps",
      tag: "Menstrual",
      icon: "droplet",
      care: "Place a warm cloth or hot-water bottle on the lower belly for 15–20 minutes. Sip warm water, and try gentle walking or a knees-to-chest stretch.",
      help: "Heat relaxes the uterine muscle and eases the cramping that causes most period pain. Gentle movement improves blood flow.",
      safety: "Wrap the bottle in cloth to avoid burns. Avoid very hot baths if you feel dizzy. Do not take painkillers on an empty stomach or more than the label allows.",
      doctor: "If pain stops you from work or school, is worse than usual, or comes with heavy bleeding or fever, see a doctor."
    },
    {
      id: "headache",
      concern: "Tension headache",
      tag: "General",
      icon: "sparkle",
      care: "Rest in a quiet, dim room. Drink water, eat something if you have skipped a meal, and place a cool cloth on the forehead.",
      help: "Many headaches come from dehydration, hunger, screen strain or stress — rest and fluids settle them.",
      safety: "Do not take painkillers more than 2–3 days a week; overuse itself causes daily headaches. Avoid neck massage if there is injury.",
      doctor: "Get urgent care for a sudden 'worst ever' headache, headache with fever and stiff neck, vomiting, weakness, or blurred vision."
    },
    {
      id: "cold",
      concern: "Common cold & sore throat",
      tag: "General",
      icon: "wind",
      care: "Drink warm water, take steam inhalation for 5 minutes, and gargle with warm salt water (½ teaspoon salt in a glass of water) 3–4 times a day.",
      help: "Warm fluids and steam loosen mucus and soothe an irritated throat. Salt water reduces throat swelling.",
      safety: "Steam must not be so hot that it burns. Honey is not given to babies under 1 year. Do not use antibiotic tablets left over from before.",
      doctor: "See a doctor if fever lasts more than 3 days, breathing becomes difficult, or symptoms worsen after a week."
    },
    {
      id: "discharge",
      concern: "Vaginal itching or discharge",
      tag: "Menstrual",
      icon: "shield",
      care: "Wear loose cotton underwear, keep the area dry, change pads often, and wash with plain water. Avoid tight synthetic clothing in the heat.",
      help: "Most itching is linked to moisture, sweat or a mild fungal overgrowth. Air and dryness reduce it.",
      safety: "Never douche or put soap, perfume or home items inside the vagina. Do not use another person's medicine or leftover antifungal tablets.",
      doctor: "See a doctor if discharge is green, yellow, frothy, smells strong, or comes with pain or fever — and always in pregnancy."
    },
    {
      id: "constipation",
      concern: "Constipation",
      tag: "Nutrition",
      icon: "bowl",
      care: "Add a fruit, a bowl of vegetables and a glass of water at each meal. Walk 15 minutes after eating and sit for the toilet at the same time daily.",
      help: "Fibre holds water and softens stool; movement and routine help the bowel work predictably.",
      safety: "Increase fibre slowly with enough water, otherwise bloating increases. Avoid taking laxatives regularly on your own.",
      doctor: "See a doctor if there is blood in stool, severe pain, weight loss, or no bowel movement for over a week."
    },
    {
      id: "acne",
      concern: "Acne and oily skin",
      tag: "Skin & hair",
      icon: "sparkle",
      care: "Wash the face twice a day with a gentle cleanser and lukewarm water. Do not pick spots. Choose oil-free sunscreen and moisturiser.",
      help: "Removing extra oil and sweat reduces blocked pores. Not picking prevents scars and infection.",
      safety: "Do not apply toothpaste, lemon, baking soda or turmeric on the face — these cause burns and dark marks. Stop any product that stings.",
      doctor: "See a doctor if acne is painful, leaves scars, or comes with irregular periods and excess hair growth."
    },
    {
      id: "hairfall",
      concern: "Hair fall",
      tag: "Skin & hair",
      icon: "users",
      care: "Eat a protein source daily — dal, eggs, curd, groundnuts. Include iron-rich greens, and wash the scalp 2–3 times a week with a mild shampoo.",
      help: "Hair is built from protein and iron stores. A clean, non-irritated scalp supports growth.",
      safety: "Avoid tight braids, hot ironing and strong chemical straightening. Do not rely on 'miracle' oils for sudden heavy loss.",
      doctor: "See a doctor if loss lasts over 3 months, comes in patches, or is accompanied by fatigue, weight change or irregular periods."
    },
    {
      id: "fatigue",
      concern: "Tiredness and low energy",
      tag: "Nutrition",
      icon: "heart-pulse",
      care: "Eat three meals with a protein and an iron source, drink water through the day, and sleep at a fixed time. Take short walks rather than long naps.",
      help: "Steady food, hydration and sleep prevent the energy dips that come from skipping meals or poor sleep.",
      safety: "Do not take iron or vitamin tablets without a blood test — too much iron is harmful. Do not use energy drinks as a substitute for sleep.",
      doctor: "See a doctor if tiredness lasts more than 2 weeks, or comes with breathlessness, heavy periods, weight loss or pale skin."
    },
    {
      id: "burn",
      concern: "Minor kitchen burn",
      tag: "First aid",
      icon: "alert",
      care: "Hold the burn under cool running water for 20 minutes. Cover loosely with a clean, dry cloth. Keep the rest of the body warm.",
      help: "Cooling stops the burn from going deeper and reduces pain and blistering.",
      safety: "No ice, toothpaste, oil, ghee, turmeric or ash — these trap heat and cause infection. Do not break blisters.",
      doctor: "Get help for any burn on the face, hands or genitals, a burn bigger than the person's palm, or skin that is white, brown or numb."
    },
    {
      id: "stress",
      concern: "Stress and restlessness",
      tag: "Mental wellness",
      icon: "wind",
      care: "Sit comfortably and breathe in for 4 counts, hold for 4, out for 6. Repeat for 3 minutes. Then name five things you can see and hear.",
      help: "Slow exhale activates the body's calming response and reduces the racing feeling of stress.",
      safety: "Breathing exercises are supportive, not a cure. If you feel dizzy, return to normal breathing. Never stop prescribed mental health medicines on your own.",
      doctor: "Talk to a health worker if low mood, worry or sleeplessness lasts more than 2 weeks or affects daily life. Call 14416 for free support."
    },
    {
      id: "backpain",
      concern: "Lower back pain",
      tag: "General",
      icon: "scale",
      care: "Use a warm compress for 15 minutes, keep moving gently, and sleep on a firm surface with a pillow under the knees.",
      help: "Warmth reduces muscle spasm; gentle movement prevents stiffness from setting in.",
      safety: "Avoid bed rest for more than 1–2 days. Do not lift heavy weights or bend repeatedly while in pain.",
      doctor: "Seek care if pain travels down the leg with numbness, or comes with fever, urine problems or after a fall."
    },
    {
      id: "pelvic",
      concern: "Pelvic pain between periods",
      tag: "Menstrual",
      icon: "alert",
      care: "Note the date, type and duration of pain, and whether it comes with discharge, fever or bleeding. Rest and a warm compress may ease discomfort meanwhile.",
      help: "A written record helps a doctor identify patterns such as infection, fibroids or endometriosis much faster.",
      safety: "Do not self-medicate with antibiotics or painkillers for more than 2 days without advice.",
      doctor: "See a doctor within 24–48 hours if pain is severe, one-sided, or comes with fever, vomiting or unusual discharge."
    }
  ];

  window.JV = window.JV || {};
  window.JV.content = {
    HELPLINES: HELPLINES,
    TIPS: TIPS,
    MOODS: MOODS,
    SYMPTOMS: SYMPTOMS,
    FLOW: FLOW,
    CONDITIONS: CONDITIONS,
    FIRSTAID: FIRSTAID,
    REMEDIES: REMEDIES
  };
})();
