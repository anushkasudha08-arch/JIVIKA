/* ==========================================================================
   Smart health assistant — red-flag triage, topic library and local chat
   ========================================================================== */
(function () {
  "use strict";

  const Store = JV.Store;
  const icon = JV.icon;
  const esc = JV.esc;

  const $ = function (id) { return document.getElementById(id); };

  /* ---------- emergencies (checked before anything else) ---------- */
  const EMERGENCIES = [
    {
      id: "chest",
      title: "Chest pain or pressure",
      tag: "Call 108 now",
      re: /\b(chest (pain|pressure|heaviness|tightness|tight)|pain in (my |the )?chest|heart attack|left arm (pain|numbness))\b/,
      what: "Chest pain, pressure or heaviness can be a heart attack. In women it is often felt as tiredness, breathlessness or pain in the jaw, neck or upper belly, not always as a dramatic collapse.",
      now: [
        "Call 108 first and say clearly: chest pain, and the name of your village or street.",
        "Stop all work and sit down. Loosen tight clothes.",
        "Unlock the door and ask a neighbour or family member to stay with you.",
        "Do not drive yourself or take a bus to hospital.",
        "If a doctor has already given you a medicine for chest pain, take it exactly as prescribed while you wait."
      ]
    },
    {
      id: "breath",
      title: "Difficulty breathing",
      tag: "Call 108 now",
      re: /\b(cannot breathe|cant breathe|difficulty breathing|breathless at rest|gasping|choking|lips (are )?(blue|turning blue))\b/,
      what: "Breathlessness at rest, or lips turning blue, means the body is not getting enough oxygen. It needs emergency care immediately.",
      now: [
        "Call 108 now.",
        "Sit upright and lean slightly forward. Do not lie flat.",
        "Open a window or move to fresh air.",
        "Loosen tight clothing around the neck and chest.",
        "If you have a prescribed inhaler for asthma, use it exactly as your doctor instructed."
      ]
    },
    {
      id: "bleed",
      title: "Very heavy bleeding",
      tag: "Get help now",
      re: /\b(soak(ing)? (a )?pad (every|an|in an) hour|bleeding (very )?heavily|severe bleeding|large clots|bleeding (that )?will not stop|wont stop bleeding|bleeding in pregnancy|pregnant (and|with) (bleeding|bleed))\b/,
      what: "Soaking a pad in an hour, passing large clots, or bleeding that will not stop can quickly make you weak. In pregnancy it is always an emergency.",
      now: [
        "Call 108 or go to the nearest hospital with a maternity unit now.",
        "Lie down and keep your legs raised on a pillow.",
        "Do not insert cloth or anything into the vagina.",
        "Count how many pads you have soaked and tell the doctor.",
        "Ask someone to stay with you. Do not travel alone."
      ]
    },
    {
      id: "faint",
      title: "Fainting, fits or confusion",
      tag: "Call 108 now",
      re: /\b(fainted|passed out|unconscious|seizure|fits|convulsion|suddenly confused)\b/,
      what: "Fainting, a fit (seizure) or sudden confusion needs urgent medical help, especially if it is the first time or lasts more than a minute.",
      now: [
        "Call 108.",
        "If the person is breathing, turn them on their side.",
        "Do not put anything in the mouth and do not hold the body down during a fit.",
        "Move hard objects away and note the time the fit started and how long it lasted.",
        "If breathing stops, start chest compressions only if you have been trained. Ask 108 for instructions."
      ]
    },
    {
      id: "stroke",
      title: "Signs of a stroke",
      tag: "Call 108 now",
      re: /\b(face (is )?droop\w*|drooping face|slurred speech|cannot speak|cant speak|one side (weak|numb)|sudden weakness)\b/,
      what: "A drooping face, a weak arm or slurred speech can be a stroke. Treatment works best when it starts in the first hours.",
      now: [
        "Call 108 immediately and say: possible stroke.",
        "Note the exact time the symptoms started. The hospital will ask.",
        "Do not give food, water or medicine.",
        "Keep the person sitting up and calm. Do not let them walk.",
        "Stay with them until the ambulance arrives."
      ]
    },
    {
      id: "selfharm",
      title: "Thoughts of harming yourself",
      tag: "You deserve support now",
      re: /\b(suicide|suicidal|kill myself|end my life|ending my life|end it all|want to die|self harm|hurt myself|no reason to live|better off dead)\b/,
      what: "You are not alone, and these feelings can get better with help. Please tell someone today. This is not a burden and it is not your fault.",
      now: [
        "Call 14416 (Tele-MANAS, free, 24×7) or 181 and say you need to talk to someone now.",
        "Tell one person you trust and ask them to stay with you.",
        "Move away from anything you could use to hurt yourself.",
        "If you have already taken something or hurt yourself, call 108.",
        "You can also walk into any hospital emergency and say how you feel."
      ],
      links: [["tel:14416", "Call 14416"], ["tel:181", "Call 181"], ["mental.html#support", "Support and helplines"]]
    },
    {
      id: "pregnancy",
      title: "Pregnancy danger signs",
      tag: "Get help now",
      re: /\b(severe headache (in pregnancy|with blurred vision)|blurred vision|baby (is )?not moving|no (baby )?movement|water (broke|breaking)|fluid leaking)\b/,
      what: "Severe headache, blurred vision, swelling of the face or hands, bleeding, or fewer baby movements can be signs of a serious problem in pregnancy.",
      now: [
        "Call 108 or go to the nearest hospital with a maternity unit now.",
        "Carry your MCP card and any reports.",
        "Do not wait for the next clinic day.",
        "If there is bleeding, lie down and do not travel alone.",
        "Tell the doctor your weeks of pregnancy and how many times you have been pregnant."
      ]
    },
    {
      id: "belly",
      title: "Sudden severe belly pain",
      tag: "Get help now",
      re: /\b(severe (stomach|abdominal|belly) pain|unbearable (stomach|abdominal|belly) pain|stomach pain (so bad|cannot stand))\b/,
      what: "Severe pain that starts suddenly and stops you from standing or walking can be an emergency, such as a twisted ovary, ectopic pregnancy or appendicitis.",
      now: [
        "Call 108 or go to the nearest hospital now.",
        "Do not eat or drink anything.",
        "Do not take a painkiller before a doctor examines you. It can hide the problem.",
        "Do not put a hot water bottle on the belly.",
        "If you might be pregnant, tell the doctor."
      ]
    },
    {
      id: "overdose",
      title: "Possible overdose or poisoning",
      tag: "Call 108 now",
      re: /\b(took too many (tablets|pills|medicines)|overdose|swallowed (poison|chemical|pesticide)|drank poison|poisoning)\b/,
      what: "Taking too many tablets, or swallowing a poison or chemical, needs emergency treatment even if the person looks well at first.",
      now: [
        "Call 108 now.",
        "Keep the strip, bottle or container and give it to the doctor.",
        "Note the time and how much was taken.",
        "Do not make the person vomit.",
        "If the person is unconscious but breathing, turn them on their side."
      ]
    }
  ];

  /* ---------- general health topics ---------- */
  const TOPICS = [
    {
      id: "period-pain",
      cat: "periods",
      q: "Period pain that stops my day",
      title: "Period pain (cramps)",
      keys: ["period pain", "painful periods", "menstrual pain", "period cramps", "cramps", "cramping", "stomach pain during period", "lower belly pain", "back pain during period", "pain in my lower belly"],
      urgency: "self",
      what: "Period pain comes from the womb muscle tightening. It is common on the first two days and often eases with warmth, movement and rest.",
      care: [
        "Hold a warm water bottle or warm cloth on the lower belly for 15 to 20 minutes. Wrap it in cloth. Never put very hot water directly on skin.",
        "Walk slowly or do gentle stretching. Staying still can make cramps feel worse.",
        "Drink water through the day and eat regular meals. Very salty or very sweet food can make bloating worse.",
        "Lie on your side with a pillow between your knees, or on your back with knees bent.",
        "If a doctor or ASHA has given you a pain medicine, take it exactly as advised. Do not take antibiotics or extra doses."
      ],
      see: [
        "The pain stops you from standing, working or sleeping, or it gets worse every cycle.",
        "Pain starts 3 to 5 days before bleeding, or comes with fever, bad-smelling discharge or pain during sex.",
        "Bleeding is very heavy, or you soak a pad every hour (call 108).",
        "You bleed between periods or after sex."
      ],
      links: [["menstrual.html", "Track your cycle"], ["physical.html#remedies", "Home remedy cards"]]
    },
    {
      id: "late-period",
      cat: "periods",
      q: "My period is late",
      title: "Late or missed period",
      keys: ["late period", "period is late", "period late", "missed period", "missed my period", "no period", "period not come", "delayed period", "pregnancy test", "am i pregnant"],
      urgency: "clinic",
      what: "A period can be a few days late because of stress, travel, illness, hard work, weight change or hormones. Pregnancy is also possible if you have had sex.",
      care: [
        "Count from the first day of your last period. A cycle of 21 to 35 days is usually normal, and up to 7 days of change is common.",
        "A home pregnancy test is most reliable 7 days after a missed period, using morning urine. Follow the kit instructions exactly.",
        "Keep a record of dates in the cycle tracker. It makes any doctor visit easier.",
        "Eat regular meals, sleep enough and reduce very heavy physical work where possible."
      ],
      see: [
        "The pregnancy test is positive. Book a doctor or ASHA visit to confirm and start antenatal care.",
        "No period for 3 months or more when you are not pregnant.",
        "Sudden severe lower belly pain, especially with bleeding or fainting. Go to a hospital now.",
        "You are over 45, periods had stopped for a year, and bleeding starts again."
      ],
      links: [["menstrual.html", "Cycle tracker"], ["healthcare.html", "Find a clinic"]]
    },
    {
      id: "irregular",
      cat: "periods",
      q: "My periods are irregular",
      title: "Irregular periods",
      keys: ["irregular period", "irregular periods", "periods are irregular", "cycle is irregular", "spotting between periods", "bleeding between periods", "period twice a month", "period every two weeks", "periods every two weeks"],
      urgency: "clinic",
      what: "Cycles shorter than 21 days or longer than 35 days, or bleeding that changes a lot, are called irregular. Common reasons are PCOS, thyroid problems, weight change, stress and the years before menopause.",
      care: [
        "Track at least 3 cycles: date, flow and pain. A pattern helps the doctor much more than one date.",
        "Eat regular meals with protein and iron-rich food, and move 30 minutes most days.",
        "Sleep 7 to 8 hours. Night duty and shift work can change cycles.",
        "Birth control, thyroid tablets and some other medicines change bleeding. Tell the doctor everything you take."
      ],
      see: [
        "Bleeding between periods, after sex, or so heavy that you change pads at night.",
        "No period for 3 months, or cycles shorter than 21 days for 3 cycles.",
        "You also have acne, extra facial hair and weight gain around the belly. This can be PCOS.",
        "Any bleeding after menopause. See a doctor within a week."
      ],
      links: [["menstrual.html#learn", "Learn about your cycle"], ["physical.html#conditions", "Conditions explained"]]
    },
    {
      id: "heavy",
      cat: "periods",
      q: "My bleeding is very heavy",
      title: "Heavy periods",
      keys: ["heavy period", "heavy bleeding", "bleeding a lot", "large clots", "big clots", "bleeding for more than 7 days", "flooding", "period bleeding too much", "change pad at night"],
      urgency: "clinic",
      what: "Heavy bleeding means soaking a pad in an hour, passing large clots, or bleeding for more than 7 days. It is common and treatable, but it can cause anaemia (low blood).",
      care: [
        "Write down how many pads or cloths you change in a day, and any clots. Take the note to the doctor.",
        "Eat iron-rich food daily: dal, green leaves, jaggery, eggs, fish and liver in moderation.",
        "Add lemon, amla, guava or tomato to meals. Vitamin C helps the body absorb iron.",
        "Rest and avoid heavy lifting on the heaviest days."
      ],
      see: [
        "You soak a pad every hour for 2 hours, feel dizzy, faint, or your heart is racing. Call 108.",
        "You are pregnant and bleeding. Go to hospital the same day.",
        "Bleeding lasts more than 7 days, or returns every 2 weeks.",
        "You feel breathless, very tired or look pale. Ask for a haemoglobin test."
      ],
      links: [["menstrual.html#learn", "Heavy bleeding explained"], ["healthcare.html", "Find a gynaecologist"]]
    },
    {
      id: "pcos",
      cat: "periods",
      q: "Could I have PCOS?",
      title: "PCOS (polycystic ovary syndrome)",
      keys: ["pcos", "pcod", "polycystic", "cyst in ovary", "ovarian cyst", "extra hair on face", "facial hair", "hair on chin", "irregular periods and acne"],
      urgency: "clinic",
      what: "PCOS is a hormone condition. Periods are often irregular and male-type hormones are higher, which can cause acne, extra facial hair, weight gain around the belly and thinning scalp hair. It is diagnosed by a doctor, not by one scan or an app.",
      care: [
        "Move 30 minutes most days. Brisk walking, cycling and heavy household work all count.",
        "Build meals around vegetables, dal, beans, eggs, curd and whole grains. Limit sweet drinks and fried snacks.",
        "Keep a simple record of cycle dates and weight.",
        "Small regular meals and enough sleep help insulin and hormones."
      ],
      warn: "Do not start hormone tablets, slimming pills or online PCOS capsules on your own. Some unregulated products damage the liver.",
      see: [
        "Periods come fewer than 8 times a year, or stop for 3 months.",
        "Rapid weight gain, very heavy bleeding, or dark velvety skin folds on the neck.",
        "You have been trying to conceive for 12 months without success."
      ],
      next: ["irregular", "heavy", "anaemia"],
      links: [["menstrual.html#learn", "PCOS explained"], ["physical.html#conditions", "Full condition card"], ["nutrition.html", "Food for hormone health"]]
    },
    {
      id: "discharge",
      cat: "infections",
      q: "Discharge that smells or itches",
      title: "Vaginal discharge and itching",
      keys: ["discharge", "white discharge", "vaginal discharge", "smelly discharge", "yellow discharge", "green discharge", "itching down there", "vaginal itching", "fungal infection", "yeast infection", "burning and itching"],
      urgency: "self",
      what: "Some clear or white discharge is normal and changes through the month. A change in smell or colour, itching or sores usually means a common infection that can be treated.",
      care: [
        "Wash the outside with plain water once a day. Soap, perfume and vaginal washes are not needed inside.",
        "Wear cotton underwear and change it daily. Dry underwear fully in sunlight.",
        "Wipe from front to back after using the toilet.",
        "Do not insert cloth, herbs or home-made liquids into the vagina to clean it.",
        "Avoid tight synthetic leggings for long hours in hot weather."
      ],
      see: [
        "Discharge is green or yellow, frothy, or smells bad.",
        "There is itching, sores, pain when passing urine or pain during sex.",
        "You have fever with lower belly pain.",
        "You are pregnant and have discharge with pain or bleeding."
      ],
      links: [["physical.html#remedies", "Home care cards"], ["healthcare.html", "Find a clinic"]]
    },
    {
      id: "uti",
      cat: "infections",
      q: "Burning when I pass urine",
      title: "Burning or frequent urine (UTI)",
      keys: ["burning urine", "burning when i pass urine", "burning while passing urine", "urine infection", "uti", "frequent urination", "passing urine often", "pain while passing urine", "smelly urine", "blood in urine", "burning when i pee"],
      urgency: "clinic",
      what: "Burning, a strong urge, or passing small amounts of urine often points to a urinary infection. It is common and treatable, but antibiotics must be chosen correctly by a doctor.",
      care: [
        "Drink extra water, about 2 to 3 litres through the day, unless a doctor has told you to limit fluids.",
        "Do not hold urine for long. Empty the bladder fully.",
        "Wash from front to back, and pass urine after sex.",
        "Avoid strong tea, coffee and very spicy food until it settles.",
        "Do not take leftover antibiotics or tablets given to someone else."
      ],
      see: [
        "Fever, back or side pain, or vomiting. This can be a kidney infection.",
        "There is blood in the urine.",
        "You are pregnant. A urine infection in pregnancy needs quick treatment.",
        "Symptoms last more than 2 days, or keep coming back."
      ],
      links: [["physical.html#conditions", "UTI explained"], ["healthcare.html", "Find a doctor"]]
    },
    {
      id: "anaemia",
      cat: "body",
      q: "I feel tired and weak all the time",
      title: "Tiredness and anaemia",
      keys: ["anaemia", "anemia", "low blood", "low haemoglobin", "low hemoglobin", "tired all the time", "always tired", "feeling weak", "weakness", "pale", "dizzy when i stand", "no energy", "fatigue"],
      urgency: "clinic",
      what: "Feeling tired, breathless on stairs, dizzy or pale can be anaemia (low haemoglobin). It is very common in Indian women, from low iron, heavy periods, pregnancy or poor diet.",
      care: [
        "Eat iron-rich food daily: green leafy vegetables, dal, beans, jaggery, dates, eggs and fish.",
        "Add vitamin C with meals: lemon, amla, guava or tomato. It helps iron get absorbed.",
        "Keep tea and coffee at least an hour away from meals.",
        "If a doctor prescribed iron tablets, take them as told. Dark stools are normal and not a reason to stop."
      ],
      see: [
        "Breathlessness at rest, chest pain, fainting or a very fast heartbeat. Go to hospital.",
        "Heavy periods keep coming back.",
        "You are pregnant and have not had a haemoglobin test.",
        "There is no improvement after 3 to 4 weeks of iron tablets."
      ],
      links: [["physical.html#conditions", "Anaemia explained"], ["nutrition.html", "Iron-rich affordable food"]]
    },
    {
      id: "breast",
      cat: "body",
      q: "I found a lump in my breast",
      title: "Breast changes and lumps",
      keys: ["breast lump", "lump in breast", "lump in my breast", "breast pain", "breast discharge", "nipple discharge", "breast cancer", "hard lump", "lump in armpit", "breast"],
      urgency: "clinic",
      what: "Most breast lumps are not cancer, but every new lump, skin change or nipple discharge should be checked by a doctor. Tenderness before periods is common and usually settles.",
      care: [
        "Do a monthly self-check a few days after your period ends: look in a mirror, feel with flat fingers in circles, then check the armpit.",
        "Note any change in a diary: size, shape, skin and nipple.",
        "Wear a well-fitting, non-wire bra if pain is troubling.",
        "Do not apply heat, massage or herbal paste on a lump."
      ],
      see: [
        "A hard lump that stays after your period, or one that is growing.",
        "Skin dimpling, orange-peel texture, redness or a sore that does not heal.",
        "Bloody or clear discharge from one nipple, or the nipple turns inward.",
        "A lump with fever and redness. This can be an abscess and needs same-day care."
      ],
      links: [["physical.html#conditions", "Breast health explained"], ["healthcare.html", "Find a hospital"]]
    },
    {
      id: "hair",
      cat: "body",
      q: "My hair is falling out",
      title: "Hair fall and thinning",
      keys: ["hair fall", "hair loss", "hair is falling", "my hair is falling", "thinning hair", "bald patch", "bald patches", "dandruff", "hair"],
      urgency: "self",
      what: "Losing 50 to 100 hairs a day is normal. More than that often follows pregnancy, heavy periods, low iron, thyroid problems, crash diets or very tight hairstyles.",
      care: [
        "Eat protein at every meal: dal, egg, curd, milk, peanuts, soya and fish.",
        "Iron, vitamin D and B12 matter. Ask for a blood test if hair fall continues for months.",
        "Avoid very tight braids and ponytails, and limit hot ironing and chemical straightening.",
        "Wash 2 to 3 times a week with a mild shampoo. Oiling is comfort, not a cure."
      ],
      see: [
        "Round bald patches or sudden heavy shedding.",
        "Scalp itching, scaling, redness or sores.",
        "Hair fall with irregular periods, weight gain or tiredness. Hormones or thyroid need checking.",
        "Hair loss started after a new medicine."
      ],
      links: [["physical.html#conditions", "Hair and skin health"], ["nutrition.html", "Protein and iron foods"]]
    },
    {
      id: "skin",
      cat: "body",
      q: "Acne and dark spots",
      title: "Acne, dark spots and rashes",
      keys: ["acne", "pimples", "dark spots", "pigmentation", "rash", "skin", "itching skin", "eczema", "melasma", "fairness cream"],
      urgency: "self",
      what: "Acne, dark patches and rashes are common and usually harmless. Hormones, heat, sweat, cosmetics and some medicines can trigger them.",
      care: [
        "Wash your face twice a day with plain water and a mild cleanser. Pat dry, do not scrub.",
        "Do not pick or squeeze pimples. It causes scars that last.",
        "Use a simple moisturiser and sunscreen. Avoid fairness creams and mixed creams from shops.",
        "Wash sweaty clothes daily and keep skin folds dry."
      ],
      warn: "Creams sold for fairness or quick glow often contain steroids. They thin the skin and make the problem worse. Stop and see a doctor.",
      see: [
        "Painful deep lumps or scars, or acne that keeps getting worse.",
        "A rash with fever, or a rash spreading fast.",
        "Dark patches on the face that spread during pregnancy. Get advice before using any cream.",
        "You have been using a steroid cream from a shop."
      ],
      links: [["physical.html#conditions", "Skin problems explained"], ["physical.html#remedies", "Home care cards"]]
    },
    {
      id: "mood-low",
      cat: "mind",
      q: "I have been feeling low",
      title: "Low mood and depression",
      keys: ["feel low", "feeling low", "low mood", "depressed", "depression", "sad all the time", "crying", "hopeless", "no interest in anything", "worthless", "empty inside", "cant enjoy anything"],
      urgency: "self",
      what: "Feeling low for a few days is common. When it lasts more than two weeks and affects sleep, appetite and daily work, it deserves care like any other health problem.",
      care: [
        "Tell one person you trust how you feel. You do not have to manage alone.",
        "Keep a small routine: same sleep and wake time, one meal with someone, 10 minutes outdoors in sunlight.",
        "Move your body daily. Walking counts.",
        "Cut alcohol and tobacco. They worsen low mood and sleep.",
        "Write three lines in the journal each night. The mental wellness page has a private space."
      ],
      see: [
        "Two weeks or more of low mood, poor sleep, or no interest in things you used to enjoy.",
        "You cannot work, eat, or care for yourself or your children.",
        "You have thoughts of harming yourself. Call 14416 now, or 108 if you are in immediate danger."
      ],
      next: ["anxiety", "sleep", "period-pain"],
      links: [["mental.html#checkin", "Mood check-in"], ["mental.html#support", "Talk to someone"], ["tel:14416", "Call 14416"]]
    },
    {
      id: "anxiety",
      cat: "mind",
      q: "I feel anxious all the time",
      title: "Anxiety and panic",
      keys: ["anxiety", "anxious", "panic attack", "panic", "worried all the time", "overthinking", "tension", "stress", "cant relax", "nervous"],
      urgency: "self",
      what: "Anxiety is the body's alarm staying switched on. A fast heartbeat, tight chest, sweating and racing thoughts feel frightening but are not dangerous by themselves.",
      care: [
        "Breathe slowly: in for 4 counts, hold for 4, out for 6. Continue for 2 minutes. The mental wellness page has a guided timer.",
        "Name 5 things you can see, 4 you can touch and 3 you can hear. This brings attention back to now.",
        "Reduce strong tea and coffee, especially after 4 pm.",
        "Move daily and keep a regular sleep time."
      ],
      see: [
        "Panic attacks keep coming, or you avoid going out, working or travelling.",
        "You cannot sleep for many nights and cannot function during the day.",
        "Chest pain with breathlessness on effort. This must be checked as a physical problem first."
      ],
      next: ["mood-low", "sleep"],
      links: [["mental.html#breathe", "Guided breathing"], ["mental.html#support", "Support options"]]
    },
    {
      id: "sleep",
      cat: "mind",
      q: "I cannot sleep",
      title: "Sleep problems",
      keys: ["cannot sleep", "cant sleep", "not sleeping", "insomnia", "waking at night", "wake up at night", "sleep problem", "trouble sleeping"],
      urgency: "self",
      what: "Sleep changes with stress, hormones, pregnancy, menopause, pain, anaemia and thyroid problems. Most adults need 7 to 8 hours.",
      care: [
        "Wake at the same time every day, even after a bad night.",
        "No screens for 30 minutes before bed. Dim the light.",
        "No tea or coffee after 4 pm, and no alcohol as a sleep aid.",
        "If your mind is busy, write tomorrow's tasks on paper before lying down.",
        "Keep the room dark and quiet. A cloth over the eyes helps."
      ],
      see: [
        "Three weeks of poor sleep with daytime sleepiness or low mood.",
        "Loud snoring with pauses in breathing.",
        "Restless legs, or night sweats that soak your clothes."
      ],
      next: ["mood-low", "anxiety"],
      links: [["mental.html#support", "Mental wellness support"], ["mental.html", "Self-care routines"]]
    },
    {
      id: "headache",
      cat: "body",
      q: "Headaches that keep coming",
      title: "Headache and migraine",
      keys: ["headache", "headaches", "migraine", "head pain", "head is paining", "head ache"],
      urgency: "self",
      what: "Most headaches are tension headaches from stress, screen time, dehydration or skipped meals. Migraine is a throbbing one-sided headache, often with nausea and light sensitivity.",
      care: [
        "Drink water and eat something if you have skipped a meal.",
        "Rest in a dark, quiet room with a cool cloth on the forehead.",
        "Loosen hair and relax the neck and shoulders with gentle stretches.",
        "Keep a headache diary: food, sleep and the day of your cycle."
      ],
      see: [
        "A sudden worst-ever headache, or headache with fever, stiff neck or confusion. Go to hospital now.",
        "Headache after a head injury.",
        "Weakness, slurred speech or loss of vision.",
        "Headache in pregnancy with swelling or blurred vision. Call your doctor the same day."
      ],
      links: [["physical.html#emergency", "Emergency signs"], ["mental.html#breathe", "Relaxation"]]
    },
    {
      id: "fever",
      cat: "infections",
      q: "Fever that will not settle",
      title: "Fever",
      keys: ["fever", "temperature", "chills", "body ache", "viral fever", "high temperature"],
      urgency: "clinic",
      what: "Fever is the body fighting an infection. Most fevers settle in 3 to 4 days, but dengue, malaria and typhoid are common in India and need tests.",
      care: [
        "Drink fluids: water, ORS, coconut water and rice water.",
        "Rest and eat light food such as khichdi, dal and curd.",
        "Sponge with normal water, not ice water, if the body is very hot.",
        "Do not take antibiotics on your own, and never take more than the stated paracetamol dose."
      ],
      see: [
        "Fever above 39°C that does not come down, or lasts more than 3 days.",
        "Bleeding gums, red spots on the skin or severe body pain. This can be dengue.",
        "Stiff neck, severe headache, confusion or fits.",
        "You are pregnant or have diabetes.",
        "Breathlessness. Call 108."
      ],
      links: [["healthcare.html", "Find a clinic"], ["physical.html#firstaid", "First aid basics"]]
    },
    {
      id: "bones",
      cat: "body",
      q: "Weak bones and joint pain",
      title: "Bone and joint health",
      keys: ["osteoporosis", "weak bones", "bone pain", "joint pain", "knee pain", "back pain", "calcium deficiency", "fracture", "bones"],
      urgency: "self",
      what: "Bone strength drops after 30 and faster after menopause. Low calcium, low vitamin D, little movement and smoking speed this up. Weak bones often cause no pain until a bone breaks.",
      care: [
        "Move 30 minutes most days with weight on your feet: walking, climbing stairs, standing while working.",
        "Calcium daily: milk, curd, paneer, ragi, sesame seeds, small fish and green leaves.",
        "Get 15 to 20 minutes of morning sun on the arms for vitamin D.",
        "Do not smoke, and limit alcohol.",
        "Keep floors dry and use a light at night to prevent falls."
      ],
      see: [
        "A fracture from a simple fall, or sudden back pain that changes your posture.",
        "Height loss, or a curved upper back after menopause.",
        "You take steroid tablets long term. Ask about a bone check."
      ],
      links: [["nutrition.html", "Calcium-rich foods"], ["physical.html#conditions", "Osteoporosis explained"]]
    },
    {
      id: "menopause",
      cat: "body",
      q: "Hot flushes and menopause",
      title: "Perimenopause and menopause",
      keys: ["menopause", "perimenopause", "hot flush", "hot flushes", "hot flash", "hot flashes", "night sweats", "periods stopped", "no periods after 45", "mood swings"],
      urgency: "self",
      what: "Menopause is when periods have stopped for 12 months, usually between 45 and 55. Hot flushes, night sweats, mood changes, dry skin and poor sleep are common.",
      care: [
        "Wear cotton clothes, keep the room cool and use a hand fan for hot flushes.",
        "Take calcium and vitamin D, and do weight-bearing movement for your bones.",
        "Slow breathing and a regular sleep time help with flushes and mood.",
        "Do pelvic floor (Kegel) exercises daily for bladder control.",
        "Use a lubricant if sex is painful or dry. Ask a doctor which one is safe for you."
      ],
      see: [
        "Any bleeding after 12 months with no period. See a doctor within a week.",
        "Very heavy bleeding, or bleeding between periods.",
        "Hot flushes so severe that sleep and work are affected.",
        "Chest pain, breathlessness or a new lump."
      ],
      next: ["bones", "sleep", "bladder"],
      links: [["physical.html#conditions", "Menopause explained"], ["nutrition.html", "Food for this stage"]]
    },
    {
      id: "pregnancy-nutrition",
      cat: "nutrition",
      q: "What should I eat in pregnancy?",
      title: "Eating well in pregnancy",
      keys: ["pregnant", "pregnancy", "antenatal", "breastfeeding", "trimester", "morning sickness", "nausea in pregnancy", "what to eat in pregnancy"],
      urgency: "self",
      what: "In pregnancy, small frequent meals and a balanced plate support you and the baby. Weight gain is expected and is checked at each antenatal visit.",
      care: [
        "One extra small meal a day in pregnancy, and two while breastfeeding. There is no need to eat for two.",
        "Daily: dal, milk or curd, egg, fish or soya, green leaves, fruit, whole grains, and the iron and folic acid tablets given at the clinic.",
        "Drink 8 to 10 glasses of water, more in hot weather.",
        "For morning sickness: a dry biscuit before rising, small frequent meals, and ginger water.",
        "Avoid raw or undercooked meat, unpasteurised milk and alcohol. Do not take any medicine without asking."
      ],
      warn: "Do not take iron and calcium tablets at the same time. Leave a gap of about 2 hours, as your clinic advises.",
      see: [
        "Bleeding, fluid leaking, severe headache, blurred vision, swelling of the face or hands, or fewer baby movements. Go to hospital now.",
        "Vomiting so much that you cannot keep water down.",
        "Fever, burning urine or a rash."
      ],
      next: ["anaemia", "bones"],
      links: [["nutrition.html#plans", "Pregnancy meal plan"], ["schemes.html", "Maternity schemes"], ["healthcare.html", "Antenatal care"]]
    },
    {
      id: "medicine",
      cat: "care",
      q: "How do I take my medicines safely?",
      title: "Safe use of medicines",
      keys: ["medicine", "tablet", "tablets", "antibiotic", "antibiotics", "dose", "side effect", "pharmacist", "expired medicine", "painkiller", "paracetamol", "self medication", "leftover tablets", "medicine safety"],
      urgency: "self",
      what: "Medicines help only when the right one is taken in the right dose for the right number of days. Antibiotics and steroid creams are often sold without a prescription in India, and that is unsafe.",
      care: [
        "Take the prescription to a pharmacist and ask what each tablet is for and for how many days.",
        "Finish a prescribed antibiotic course even if you feel better.",
        "Do not share tablets or use leftover antibiotics. If you miss a dose, skip it and continue. Never double the next dose.",
        "Store medicines away from sunlight and damp, check the expiry date, and keep them out of children's reach.",
        "If you are pregnant, breastfeeding, or have kidney or liver problems, ask before any medicine, including Ayurvedic products."
      ],
      warn: "Never stop or change a prescribed medicine because of something you read or a suggestion from a neighbour. Speak to the doctor who prescribed it.",
      see: [
        "Rash, swelling of the face or throat, or difficulty breathing after a medicine. Call 108.",
        "Vomiting, black stools or yellow eyes after starting a medicine.",
        "You take 4 or more medicines. Ask for a review."
      ],
      next: ["fever", "anaemia"],
      links: [["healthcare.html", "Pharmacies and doctors"], ["physical.html#conditions", "Condition information"]]
    },
    {
      id: "screening",
      cat: "body",
      q: "Pap smear and cervical screening",
      title: "Cervical screening (Pap test)",
      keys: ["pap smear", "pap test", "cervical screening", "cervical cancer", "hpv", "pelvic exam", "screening test", "health check"],
      urgency: "clinic",
      what: "Cervical screening finds changes long before they become cancer. In India, a Pap test is advised from age 30, every 3 to 5 years, at a PHC or district hospital. It is often free.",
      care: [
        "Ask at the PHC or district hospital for cervical screening. The test itself takes only a few minutes.",
        "Go on a day when you are not bleeding.",
        "Do not use a vaginal wash or vaginal medicine for 2 days before the test.",
        "Carry your previous reports and your MCP card if you have one."
      ],
      see: [
        "A positive HPV or Pap report. Take it to a doctor, do not ignore it.",
        "Bleeding between periods or after sex.",
        "Ongoing discharge, pelvic pain or pain during sex."
      ],
      next: ["breast", "menopause"],
      links: [["schemes.html", "Health schemes"], ["healthcare.html", "Find a screening centre"]]
    },
    {
      id: "bladder",
      cat: "body",
      q: "I leak urine when I cough",
      title: "Leaking urine",
      keys: ["urine leak", "leaking urine", "leak urine", "cant hold urine", "incontinence", "peeing when i cough", "kegel", "kegel exercise"],
      urgency: "self",
      what: "Leaking urine when coughing, laughing or lifting is common after pregnancy and around menopause. It is not something you have to live with.",
      care: [
        "Kegel exercise: squeeze the muscles you use to stop urine, hold for 3 to 5 seconds, relax, 10 times, 3 times a day.",
        "Empty the bladder regularly and do not hold urine for long.",
        "Limit very strong tea and coffee, and prevent constipation with water and fibre.",
        "Squeeze the pelvic muscles just before you cough, laugh or lift."
      ],
      see: [
        "Leaking with a sudden strong urge and no warning.",
        "Leaking all the time, or with fever, pain or burning.",
        "Leaking started after pelvic surgery or a difficult delivery."
      ],
      next: ["uti", "menopause"],
      links: [["physical.html#conditions", "Pelvic floor explained"], ["healthcare.html", "Find a physiotherapist"]]
    },
    {
      id: "periods-basics",
      cat: "periods",
      q: "How do periods work?",
      title: "Periods, simply explained",
      keys: ["period", "periods", "menstruation", "menstrual", "cycle", "menses", "sanitary pad", "pad", "bleeding"],
      urgency: "self",
      what: "A period is normal bleeding from the womb every 21 to 35 days, lasting 2 to 7 days. The first 1 or 2 days are usually the heaviest.",
      care: [
        "Change a pad every 4 to 6 hours, or a cloth as soon as it is wet. Wash and dry cloth pads in direct sun.",
        "Wash the outside of the body with plain water daily during your period. Bathing is safe.",
        "Track your dates and flow. The cycle tracker can estimate the next period, but it is only an estimate.",
        "Eat iron-rich food and rest more on the heavy days."
      ],
      see: [
        "Cycles longer than 35 days or shorter than 21 days.",
        "Bleeding for more than 7 days, or soaking a pad every hour.",
        "Pain that stops you from working.",
        "No period by age 15, or no period for 3 months."
      ],
      links: [["menstrual.html", "Cycle tracker"], ["menstrual.html#learn", "Menstrual hygiene"]]
    }
  ];

  const STARTERS = [
    { label: "My period is late", topic: "late-period" },
    { label: "Burning when I pass urine", topic: "uti" },
    { label: "I have been feeling low", topic: "mood-low" },
    { label: "Are leftover tablets safe?", topic: "medicine" }
  ];

  const BROWSE = [
    "period-pain", "late-period", "irregular", "heavy", "pcos", "discharge", "uti",
    "anaemia", "breast", "mood-low", "anxiety", "sleep", "bones", "menopause",
    "pregnancy-nutrition", "medicine"
  ];

  /* ---------- page state ---------- */
  const state = { busy: false, thread: [] };

  let scrollEl = null;
  let chipsEl = null;
  let inputEl = null;
  let sendEl = null;

  /* ---------- text matching ---------- */
  function norm(text) {
    return " " + String(text || "").toLowerCase()
      .replace(/['\u2019]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim() + " ";
  }
  function hasPhrase(nq, phrase) {
    if (nq.indexOf(" " + phrase + " ") !== -1) return true;
    if (phrase.charAt(phrase.length - 1) !== "s" && nq.indexOf(" " + phrase + "s ") !== -1) return true;
    return false;
  }
  function matchScore(topic, nq) {
    let score = 0;
    topic.keys.forEach(function (key) {
      if (hasPhrase(nq, key)) score += key.split(" ").length * 2;
    });
    return score;
  }
  function bestTopic(nq) {
    let best = null;
    let bestScore = 1;
    TOPICS.forEach(function (topic) {
      const score = matchScore(topic, nq);
      if (score > bestScore) { best = topic; bestScore = score; }
    });
    return best;
  }
  function findEmergency(nq) {
    return EMERGENCIES.filter(function (e) { return e.re.test(nq); })[0] || null;
  }
  function topicById(id) {
    return TOPICS.filter(function (t) { return t.id === id; })[0] || null;
  }

  /* ---------- reply builders ---------- */
  function ul(items) {
    return "<ul>" + items.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + "</ul>";
  }
  function linksHTML(links) {
    return '<div class="b-links">' + links.map(function (l) {
      const external = l[0].indexOf("http") === 0;
      const iconName = l[0].indexOf("tel:") === 0 ? "phone" : external ? "external" : "arrow-right";
      return '<a href="' + esc(l[0]) + '"' + (external ? ' target="_blank" rel="noopener"' : "") + ">" +
        icon(iconName) + esc(l[1]) + "</a>";
    }).join("") + "</div>";
  }
  function footnote() {
    return '<p class="tiny muted b-foot">General information only. This is not a diagnosis or a prescription.</p>';
  }

  function topicReply(topic) {
    const urgency = topic.urgency === "clinic"
      ? { cls: "clinic", label: "See a doctor" }
      : { cls: "self", label: "Home care" };
    let html = '<span class="urgency ' + urgency.cls + '">' + urgency.label + "</span>" +
      '<span class="b-title">' + esc(topic.title) + "</span>" +
      "<p><strong>What may be happening.</strong> " + esc(topic.what) + "</p>" +
      "<p><strong>What can help at home</strong></p>" + ul(topic.care);
    if (topic.warn) {
      html += '<p class="b-warn">' + icon("alert") + "<span>" + esc(topic.warn) + "</span></p>";
    }
    html += "<p><strong>See a doctor if</strong></p>" + ul(topic.see);
    if (topic.links) html += linksHTML(topic.links);
    return html + footnote();
  }

  function emergencyReply(e) {
    const links = e.links || [["tel:108", "Call 108"], ["physical.html#emergency", "Emergency care"], ["healthcare.html", "Nearest hospital"]];
    return '<span class="urgency urgent">' + esc(e.tag) + "</span>" +
      '<span class="b-title">' + esc(e.title) + "</span>" +
      "<p>" + esc(e.what) + "</p>" +
      "<p><strong>Do this now</strong></p>" + ul(e.now) +
      linksHTML(links) +
      '<p class="tiny muted b-foot">Do not wait to chat. This tool cannot assess an emergency.</p>';
  }

  function introHTML() {
    return '<span class="b-title">Namaste. I am the JIVIKA health assistant.</span>' +
      "<p>I explain common women's health problems in simple words, suggest safe home care, and tell you when to see a doctor.</p>" +
      "<ul><li>Type one problem at a time, for example: my period is late.</li>" +
      "<li>I never diagnose a disease or prescribe a medicine.</li>" +
      "<li>For an emergency, call <strong>108</strong> right away.</li></ul>" +
      '<p class="tiny muted b-foot">This is a guided information tool. It is not a live AI model and not a doctor.</p>';
  }

  function greetingReply() {
    return {
      html: '<span class="b-title">Namaste. How are you feeling today?</span>' +
        "<p>Tell me one problem in your own words, such as: my period is late, or burning when I pass urine.</p>" +
        "<p>I can explain common problems, safe home care and when to see a doctor. I cannot examine you.</p>",
      chips: STARTERS
    };
  }

  function thanksReply() {
    return {
      html: '<span class="b-title">You are welcome.</span>' +
        "<p>If anything changes or gets worse, please speak to a doctor, nurse or ASHA worker. Do not wait if you feel very unwell.</p>",
      chips: [{ label: "Emergency helpline numbers", text: "emergency helpline numbers" }]
    };
  }

  function aboutReply() {
    return {
      html: '<span class="b-title">I am a guided information assistant</span>' +
        "<p>I am not a doctor and not a live AI model. Your words are matched to a checked library of general women's health information written for this site.</p>" +
        "<p>I cannot examine you, read your reports or prescribe medicine. For anything personal or urgent, call 104 or see a doctor.</p>",
      chips: STARTERS
    };
  }

  function helpReply() {
    return {
      html: '<span class="b-title">What I can help with</span>' + ul([
        "Period pain, late, irregular or heavy periods, and PCOS.",
        "Discharge, itching and urine infections.",
        "Tiredness and anaemia, thyroid and bone health.",
        "Breast changes, hair fall and skin problems.",
        "Low mood, anxiety and sleep.",
        "Pregnancy nutrition, menopause and safe medicine use."
      ]) + "<p>Ask one thing at a time in simple words. I will also tell you when the problem needs a doctor.</p>",
      chips: STARTERS
    };
  }

  function warningSignsReply() {
    return {
      html: '<span class="urgency urgent">Call 108</span><span class="b-title">When not to wait</span>' +
        "<p>Call 108 now if any of these are happening:</p>" + ul([
          "Chest pain, pressure or heaviness.",
          "Difficulty breathing, or lips turning blue.",
          "Fainting, a fit, or sudden confusion.",
          "Bleeding that soaks a pad every hour.",
          "Sudden severe belly pain.",
          "In pregnancy: bleeding, severe headache, blurred vision, or fewer baby movements.",
          "Thoughts of harming yourself. Call 14416 as well."
        ]) +
        "<p>Do not wait to see if it passes. Unlock the door and tell someone near you.</p>" +
        linksHTML([["tel:108", "Call 108"], ["tel:14416", "Call 14416"], ["physical.html#emergency", "Emergency care"]]),
      chips: [{ label: "Emergency helpline numbers", text: "emergency helpline numbers" }]
    };
  }

  function emergencyContactReply() {
    return {
      html: '<span class="urgency urgent">Emergency numbers</span><span class="b-title">Who to call</span>' +
        "<p><strong>108</strong> free ambulance, 24×7.<br><strong>112</strong> police, fire and ambulance.<br>" +
        "<strong>181</strong> women's helpline.<br><strong>14416</strong> free mental health support.<br>" +
        "<strong>104</strong> free health advice in your language.</p>" +
        "<p>Say your name, your village or street, and what is happening. Stay on the line.</p>" +
        linksHTML([["tel:108", "Call 108"], ["tel:112", "Call 112"], ["tel:14416", "Call 14416"]]) +
        footnote(),
      chips: [{ label: "When to call 108", text: "when to call 108" }]
    };
  }

  function languageReply() {
    return {
      html: '<span class="b-title">I can only read simple English right now</span>' +
        "<p>This assistant uses English so that nothing is translated wrongly. For help in your language, call 104. It is free, and a health worker will speak with you.</p>" +
        "<p>You can also ask your ASHA worker to sit with you. The other pages of this site are translated.</p>",
      chips: STARTERS
    };
  }

  function fallbackReply() {
    return {
      html: '<span class="b-title">I am not sure I understood</span>' +
        "<p>I work best with one problem at a time and simple words, like: I have stomach pain during my period.</p>" +
        "<p>You can pick a question below, or call 104 to speak to a health worker in your language. If something feels urgent, do not wait. Call 108.</p>",
      chips: STARTERS
    };
  }

  function respond(text) {
    const nq = norm(text);
    const emergency = findEmergency(nq);
    if (emergency) return { html: emergencyReply(emergency), chips: emergencyChips() };

    const topic = bestTopic(nq);
    if (topic) return { html: topicReply(topic), chips: relatedChips(topic) };

    if (/\b(hi|hello|hey|hii|namaste|namaskar|namaskara|vanakkam|good morning|good evening)\b/.test(nq) &&
      nq.trim().split(" ").length <= 4) return greetingReply();
    if (/\b(thank you|thanks|thanku)\b/.test(nq)) return thanksReply();
    if (/\b(who are you|are you (a )?(doctor|human|real)|are you ai|is this ai|robot)\b/.test(nq)) return aboutReply();
    if (/\b(what can you do|how can you help|what do you know)\b/.test(nq)) return helpReply();
    if (/\b(when to call 108|warning signs|red flags|is this an emergency)\b/.test(nq)) return warningSignsReply();
    if (/\b(emergency|ambulance)\b/.test(nq)) return emergencyContactReply();
    if (!/[a-z0-9]/.test(nq) && /[^\x00-\x7F]/.test(String(text))) return languageReply();
    return fallbackReply();
  }

  function emergencyChips() {
    return [{ label: "Emergency helpline numbers", text: "emergency helpline numbers" }];
  }

  function relatedChips(topic) {
    const list = [];
    (topic.next || []).forEach(function (id) {
      const t = topicById(id);
      if (t && list.indexOf(t) === -1) list.push(t);
    });
    TOPICS.forEach(function (t) {
      if (list.length < 3 && t !== topic && t.cat === topic.cat && list.indexOf(t) === -1) list.push(t);
    });
    if (!list.length) return STARTERS;
    return list.slice(0, 3).map(function (t) { return { label: t.q, topic: t.id }; });
  }

  /* ---------- chat rendering ---------- */
  function scrollToEnd() {
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight;
  }

  function addMessage(role, html) {
    if (!scrollEl) return null;
    const el = document.createElement("div");
    el.className = "msg" + (role === "user" ? " user" : "");
    el.innerHTML = '<div class="msg-avatar">' + icon(role === "user" ? "user" : "sparkle") + "</div>" +
      '<div class="bubble">' + html + "</div>";
    scrollEl.appendChild(el);
    scrollToEnd();
    return el;
  }

  function pushUser(text) {
    const html = esc(text).replace(/\n/g, "<br>");
    addMessage("user", html);
    state.thread.push({ role: "user", html: html });
    saveThread();
  }

  function showTyping() {
    if (!scrollEl) return null;
    const el = document.createElement("div");
    el.className = "msg";
    el.innerHTML = '<div class="msg-avatar">' + icon("sparkle") + "</div>" +
      '<div class="bubble"><span class="typing"><span class="typing-dots"><i></i><i></i><i></i></span> checking</span></div>';
    scrollEl.appendChild(el);
    scrollToEnd();
    return el;
  }

  function queueReply(build) {
    state.busy = true;
    if (sendEl) sendEl.disabled = true;
    const typing = showTyping();
    setTimeout(function () {
      if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
      const res = build() || {};
      if (res.html) {
        addMessage("bot", res.html);
        state.thread.push({ role: "bot", html: res.html });
        saveThread();
      }
      setChips(res.chips || []);
      state.busy = false;
      if (sendEl) sendEl.disabled = false;
      if (inputEl) inputEl.focus();
    }, 540);
  }

  function sendUser(text) {
    const clean = String(text || "").trim();
    if (!clean || state.busy) return;
    pushUser(clean);
    queueReply(function () { return respond(clean); });
  }

  function askTopic(id) {
    const topic = topicById(id);
    if (!topic || state.busy) return;
    const chat = $("chat");
    if (chat) chat.scrollIntoView({ behavior: "smooth", block: "start" });
    pushUser(topic.q);
    queueReply(function () { return { html: topicReply(topic), chips: relatedChips(topic) }; });
  }

  function renderChips(host, list) {
    if (!host) return;
    host.innerHTML = list.map(function (c) {
      return '<button type="button" data-topic="' + esc(c.topic || "") + '" data-text="' + esc(c.text || "") + '">' +
        esc(c.label) + "</button>";
    }).join("");
    host.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const id = btn.getAttribute("data-topic");
        const text = btn.getAttribute("data-text");
        if (id) askTopic(id);
        else if (text) sendUser(text);
      });
    });
  }

  function setChips(list) {
    renderChips(chipsEl, list && list.length ? list : STARTERS);
  }

  /* ---------- consent & storage ---------- */
  function consent() { return Store.profile().consent.assistant; }

  function saveThread() {
    if (consent() !== true) return;
    Store.set("assistant", { ts: Date.now(), messages: state.thread.slice(-40) });
  }

  function updatePrivacyNote() {
    const note = $("privacyNote");
    if (!note) return;
    const c = consent();
    note.textContent = c === true
      ? "This chat is saved in this browser only, so you can come back to it. Nothing is uploaded. Clear it any time with New chat or from Privacy settings."
      : c === false
        ? "This chat is not saved. It disappears when you close this page. You can change this in Privacy settings."
        : "Nothing is saved until you choose. The chat stays on this screen only, and basic health information never needs an account.";
  }

  function showConsentPrompt() {
    const bubble = addMessage("bot",
      '<span class="b-title">Before we start, should this chat be saved?</span>' +
      "<p>Everything you type stays in this browser. Nothing is uploaded, and you can delete it any time.</p>" +
      '<div class="b-actions">' +
      '<button class="btn btn-primary btn-sm" type="button" data-consent="yes">Save on this device</button>' +
      '<button class="btn btn-secondary btn-sm" type="button" data-consent="no">Do not save</button>' +
      "</div>");
    if (!bubble) return;

    bubble.querySelectorAll("[data-consent]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        const yes = btn.getAttribute("data-consent") === "yes";
        Store.saveProfile({ consent: { assistant: yes } });
        if (yes) saveThread();
        else Store.remove("assistant");
        bubble.querySelector(".bubble").innerHTML = yes
          ? '<span class="b-title">Saved on this device only</span><p>You can clear it with New chat, or delete it from Profile, Privacy settings.</p>'
          : '<span class="b-title">This chat will not be saved</span><p>It will disappear when you close this page. You can change this in your privacy settings.</p>';
        updatePrivacyNote();
        JV.toast(yes ? "Chat will be saved on this device" : "Chat will not be saved");
        if (inputEl) inputEl.focus();
      });
    });
  }

  function restoreThread() {
    if (consent() !== true) return;
    const saved = Store.get("assistant", null);
    if (!saved || !Array.isArray(saved.messages)) return;
    saved.messages.forEach(function (m) {
      if (!m || typeof m.html !== "string") return;
      if (m.role !== "user" && m.role !== "bot") return;
      state.thread.push({ role: m.role, html: m.html });
      addMessage(m.role, m.html);
    });
  }

  /* ---------- controls ---------- */
  function autoGrow() {
    if (!inputEl) return;
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(130, inputEl.scrollHeight) + "px";
  }

  function submitInput() {
    if (state.busy || !inputEl) return;
    const text = inputEl.value;
    if (!text.trim()) return;
    inputEl.value = "";
    autoGrow();
    sendUser(text);
  }

  function initControls() {
    if (inputEl) {
      inputEl.addEventListener("input", autoGrow);
      inputEl.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          submitInput();
        }
      });
    }
    if (sendEl) sendEl.addEventListener("click", submitInput);

    const clear = $("chatClear");
    if (clear) {
      clear.addEventListener("click", function () {
        if (state.busy) return;
        JV.confirm({
          title: "Start a new chat?",
          message: "This clears the conversation from this screen and from this device.",
          confirm: "Clear chat",
          danger: true
        }).then(function (ok) {
          if (!ok) return;
          state.thread.length = 0;
          Store.remove("assistant");
          if (scrollEl) scrollEl.innerHTML = "";
          addMessage("bot", introHTML());
          updatePrivacyNote();
          setChips(STARTERS);
          if (consent() === null) showConsentPrompt();
          JV.toast("New chat started");
        });
      });
    }
  }

  /* ---------- boot ---------- */
  function init() {
    scrollEl = $("chatScroll");
    if (!scrollEl) return;
    chipsEl = $("chatChips");
    inputEl = $("chatInput");
    sendEl = $("chatSend");

    addMessage("bot", introHTML());
    restoreThread();
    if (consent() === null) showConsentPrompt();

    updatePrivacyNote();
    setChips(STARTERS);
    renderChips($("topicChips"), BROWSE.map(function (id) {
      const t = topicById(id);
      return { label: t.q, topic: t.id };
    }));
    initControls();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
