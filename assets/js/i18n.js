/* ==========================================================================
   JIVIKA AROGYA — interface translations
   Navigation + key labels are translated. Detailed medical articles stay in
   English on purpose: a mistranslated symptom or dose can cause real harm.
   ========================================================================== */
(function () {
  "use strict";

  const STRINGS = {
    en: {
      "brand.tagline": "Women's health, in your language",
      "nav.home": "Home", "nav.dashboard": "Dashboard", "nav.menstrual": "Menstrual Health",
      "nav.physical": "Physical Health", "nav.mental": "Mental Wellness", "nav.nutrition": "Nutrition & Diet",
      "nav.healthcare": "Nearby Healthcare", "nav.schemes": "Government Schemes",
      "nav.assistant": "Health Assistant", "nav.profile": "Profile & Privacy",

      "common.menu": "Menu", "common.close": "Close", "common.language": "Language",
      "common.theme": "Switch theme", "common.accessibility": "Display settings",
      "common.save": "Save", "common.cancel": "Cancel", "common.delete": "Delete",
      "common.search": "Search", "common.all": "All", "common.call": "Call",
      "common.viewAll": "View all", "common.learnMore": "Learn more",
      "common.helpline": "Helpline", "common.emergency": "Emergency", "common.today": "Today",
      "common.disclaimer": "This website gives health education only. It does not diagnose illness or prescribe medicine.",

      "home.eyebrow": "For women, with care",
      "home.title": "Your health, understood — <em>in your language</em>.",
      "home.sub": "A calm, private companion for periods, physical and mental health, nutrition and affordable care — for villages and cities alike.",
      "home.cta1": "Open my dashboard", "home.cta2": "Talk to the assistant",
      "home.trust1": "Private by design", "home.trust2": "8 languages", "home.trust3": "Free to use",
      "home.quickTitle": "Everything you need, in one place",
      "home.quickSub": "Simple tools. No complicated menus. Start with whatever you need today.",
      "home.langTitle": "Speak to us in the language you think in",
      "home.langSub": "Choose a language, then use the speaker-friendly font size buttons for easy reading.",
      "home.supportTitle": "If today feels heavy, you are not alone",
      "home.privacyTitle": "Your body, your data",
      "home.privacySub": "Nothing about your health leaves this device.",

      "dash.welcome": "Welcome back",
      "dash.sub": "Here is a gentle snapshot of your health today.",
      "dash.next": "Next period", "dash.days": "days", "dash.logMood": "How are you feeling today?",
      "dash.tip": "Today's health tip", "dash.quick": "Quick access",

      "page.menstrual": "Menstrual Health", "page.physical": "Physical Health",
      "page.mental": "Mental Wellness", "page.nutrition": "Nutrition & Diet",
      "page.healthcare": "Nearby Healthcare", "page.schemes": "Government Schemes",
      "page.assistant": "Smart Health Assistant", "page.profile": "Profile & Privacy",
      "page.dashboard": "Health Dashboard", "page.home": "Home",

      "a11y.title": "Display settings", "a11y.text": "Text size", "a11y.contrast": "High contrast",
      "a11y.theme": "Night mode", "a11y.reset": "Reset to default",
      "a11y.normal": "Normal", "a11y.large": "Large", "a11y.xlarge": "Largest",
      "a11y.on": "On", "a11y.off": "Off",

      "footer.note": "JIVIKA AROGYA offers health education, not medical care. Always confirm symptoms, medicines and test results with a qualified doctor, nurse or ASHA worker.",
      "footer.rights": "Made for women in villages and cities.",
      "banner.english": "Detailed medical articles open in English so nothing is mistranslated. Ask your ASHA worker or call 104 for help in your language."
    },

    hi: {
      "brand.tagline": "महिलाओं का स्वास्थ्य, आपकी भाषा में",
      "nav.home": "होम", "nav.dashboard": "डैशबोर्ड", "nav.menstrual": "मासिक धर्म स्वास्थ्य",
      "nav.physical": "शारीरिक स्वास्थ्य", "nav.mental": "मानसिक स्वास्थ्य", "nav.nutrition": "पोषण और आहार",
      "nav.healthcare": "नज़दीकी स्वास्थ्य सेवा", "nav.schemes": "सरकारी योजनाएँ",
      "nav.assistant": "स्वास्थ्य सहायक", "nav.profile": "प्रोफ़ाइल और निजता",

      "common.menu": "मेन्यू", "common.close": "बंद करें", "common.language": "भाषा",
      "common.theme": "रंग बदलें", "common.accessibility": "दिखने के सेटिंग",
      "common.save": "सेव करें", "common.cancel": "रद्द करें", "common.delete": "हटाएँ",
      "common.search": "खोजें", "common.all": "सभी", "common.call": "कॉल करें",
      "common.viewAll": "सब देखें", "common.learnMore": "और जानें",
      "common.helpline": "हेल्पलाइन", "common.emergency": "आपातकाल", "common.today": "आज",
      "common.disclaimer": "यह वेबसाइट केवल स्वास्थ्य जानकारी देती है। यह बीमारी नहीं बताती और दवा नहीं लिखती।",

      "home.eyebrow": "महिलाओं के लिए, पूरे ध्यान से",
      "home.title": "आपका स्वास्थ्य, <em>आपकी भाषा में</em> समझाया हुआ।",
      "home.sub": "मासिक धर्म, शारीरिक और मानसिक सेहत, पोषण और किफ़ायती इलाज के लिए एक शांत, निजी साथी — गाँव और शहर दोनों के लिए।",
      "home.cta1": "मेरा डैशबोर्ड खोलें", "home.cta2": "सहायक से बात करें",
      "home.trust1": "पूरी निजता", "home.trust2": "8 भाषाएँ", "home.trust3": "मुफ़्त",
      "home.quickTitle": "आपकी ज़रूरत की हर चीज़, एक जगह",
      "home.quickSub": "आसान साधन। कोई उलझा हुआ मेन्यू नहीं। आज जो चाहिए, वहीं से शुरू करें।",
      "home.langTitle": "उसी भाषा में बात करें जिसमें आप सोचती हैं",
      "home.langSub": "भाषा चुनें, फिर आसान पढ़ने के लिए अक्षरों का आकार बड़ा करें।",
      "home.supportTitle": "अगर आज मन भारी है, तो आप अकेली नहीं हैं",
      "home.privacyTitle": "आपका शरीर, आपका डेटा",
      "home.privacySub": "आपकी सेहत से जुड़ी कोई भी जानकारी इस डिवाइस से बाहर नहीं जाती।",

      "dash.welcome": "फिर से स्वागत है",
      "dash.sub": "आज आपकी सेहत की एक छोटी तस्वीर।",
      "dash.next": "अगला मासिक", "dash.days": "दिन", "dash.logMood": "आज आप कैसा महसूस कर रही हैं?",
      "dash.tip": "आज की स्वास्थ्य सलाह", "dash.quick": "तुरंत पहुँच",

      "page.menstrual": "मासिक धर्म स्वास्थ्य", "page.physical": "शारीरिक स्वास्थ्य",
      "page.mental": "मानसिक स्वास्थ्य", "page.nutrition": "पोषण और आहार",
      "page.healthcare": "नज़दीकी स्वास्थ्य सेवा", "page.schemes": "सरकारी योजनाएँ",
      "page.assistant": "स्मार्ट स्वास्थ्य सहायक", "page.profile": "प्रोफ़ाइल और निजता",
      "page.dashboard": "स्वास्थ्य डैशबोर्ड", "page.home": "होम",

      "a11y.title": "दिखने के सेटिंग", "a11y.text": "अक्षरों का आकार", "a11y.contrast": "गहरा कंट्रास्ट",
      "a11y.theme": "रात का मोड", "a11y.reset": "डिफ़ॉल्ट करें",
      "a11y.normal": "सामान्य", "a11y.large": "बड़ा", "a11y.xlarge": "सबसे बड़ा",
      "a11y.on": "चालू", "a11y.off": "बंद",

      "footer.note": "जीविका आरोग्य केवल स्वास्थ्य शिक्षा देता है, इलाज नहीं। लक्षण, दवा और जाँच के बारे में डॉक्टर, नर्स या आशा कार्यकर्ता से ज़रूर पूछें।",
      "footer.rights": "गाँव और शहर की महिलाओं के लिए बनाया गया।",
      "banner.english": "विस्तृत लेख अंग्रेज़ी में खुलते हैं ताकि कोई गलत अनुवाद न हो। अपनी भाषा में मदद के लिए आशा कार्यकर्ता से पूछें या 104 पर कॉल करें।"
    },

    kn: {
      "brand.tagline": "ಮಹಿಳೆಯರ ಆರೋಗ್ಯ, ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ",
      "nav.home": "ಮುಖಪುಟ", "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.menstrual": "ಮಾಸಿಕ ಆರೋಗ್ಯ",
      "nav.physical": "ದೈಹಿಕ ಆರೋಗ್ಯ", "nav.mental": "ಮಾನಸಿಕ ಆರೋಗ್ಯ", "nav.nutrition": "ಪೋಷಣೆ ಮತ್ತು ಆಹಾರ",
      "nav.healthcare": "ಹತ್ತಿರದ ಆರೋಗ್ಯ ಸೇವೆ", "nav.schemes": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      "nav.assistant": "ಆರೋಗ್ಯ ಸಹಾಯಕ", "nav.profile": "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಖಾಸಗಿತನ",

      "common.menu": "ಮೆನು", "common.close": "ಮುಚ್ಚಿ", "common.language": "ಭಾಷೆ",
      "common.theme": "ಬಣ್ಣ ಬದಲಿಸಿ", "common.accessibility": "ವೀಕ್ಷಣಾ ಸೆಟ್ಟಿಂಗ್",
      "common.save": "ಉಳಿಸಿ", "common.cancel": "ರದ್ದುಮಾಡಿ", "common.delete": "ಅಳಿಸಿ",
      "common.search": "ಹುಡುಕಿ", "common.all": "ಎಲ್ಲಾ", "common.call": "ಕರೆ ಮಾಡಿ",
      "common.viewAll": "ಎಲ್ಲಾ ನೋಡಿ", "common.learnMore": "ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ",
      "common.helpline": "ಸಹಾಯವಾಣಿ", "common.emergency": "ತುರ್ತು", "common.today": "ಇಂದು",
      "common.disclaimer": "ಈ ಜಾಲತಾಣ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ ನೀಡುತ್ತದೆ. ರೋಗ ನಿರ್ಣಯ ಮಾಡುವುದಿಲ್ಲ, ಔಷಧಿ ಸೂಚಿಸುವುದಿಲ್ಲ.",

      "home.eyebrow": "ಮಹಿಳೆಯರಿಗಾಗಿ, ಕಾಳಜಿಯಿಂದ",
      "home.title": "ನಿಮ್ಮ ಆರೋಗ್ಯ, <em>ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ</em> ಅರ್ಥವಾಗುವಂತೆ.",
      "home.sub": "ಮಾಸಿಕ ಆರೋಗ್ಯ, ದೈಹಿಕ ಹಾಗೂ ಮಾನಸಿಕ ಆರೋಗ್ಯ, ಪೋಷಣೆ ಮತ್ತು ಕೈಗೆಟುಕುವ ಚಿಕಿತ್ಸೆಗೆ ಒಂದು ಶಾಂತ, ಖಾಸಗಿ ಸಂಗಾತಿ — ಹಳ್ಳಿ ಮತ್ತು ನಗರ ಎರಡಕ್ಕೂ.",
      "home.cta1": "ನನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಿರಿ", "home.cta2": "ಸಹಾಯಕನೊಂದಿಗೆ ಮಾತನಾಡಿ",
      "home.trust1": "ಖಾಸಗಿತನಕ್ಕೆ ಆದ್ಯತೆ", "home.trust2": "8 ಭಾಷೆಗಳು", "home.trust3": "ಉಚಿತ",
      "home.quickTitle": "ನಿಮಗೆ ಬೇಕಾದ ಎಲ್ಲವೂ ಒಂದೇ ಜಾಗದಲ್ಲಿ",
      "home.quickSub": "ಸರಳ ಸಾಧನಗಳು. ಗೊಂದಲದ ಮೆನು ಇಲ್ಲ. ಇಂದು ಬೇಕಾದದ್ದರಿಂದ ಆರಂಭಿಸಿ.",
      "home.langTitle": "ನೀವು ಯೋಚಿಸುವ ಭಾಷೆಯಲ್ಲೇ ಮಾತನಾಡಿ",
      "home.langSub": "ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ, ನಂತರ ಓದಲು ಸುಲಭವಾಗಲು ಅಕ್ಷರ ಗಾತ್ರವನ್ನು ಹೆಚ್ಚಿಸಿ.",
      "home.supportTitle": "ಇಂದು ಮನಸ್ಸು ಭಾರವಾಗಿದ್ದರೆ, ನೀವು ಒಂಟಿಯಲ್ಲ",
      "home.privacyTitle": "ನಿಮ್ಮ ದೇಹ, ನಿಮ್ಮ ಡೇಟಾ",
      "home.privacySub": "ನಿಮ್ಮ ಆರೋಗ್ಯದ ಯಾವುದೇ ಮಾಹಿತಿ ಈ ಸಾಧನದಿಂದ ಹೊರಗೆ ಹೋಗುವುದಿಲ್ಲ.",

      "dash.welcome": "ಮತ್ತೆ ಸ್ವಾಗತ",
      "dash.sub": "ಇಂದು ನಿಮ್ಮ ಆರೋಗ್ಯದ ಒಂದು ಸಣ್ಣ ಚಿತ್ರ.",
      "dash.next": "ಮುಂದಿನ ಮಾಸಿಕ", "dash.days": "ದಿನ", "dash.logMood": "ಇಂದು ನೀವು ಹೇಗಿದ್ದೀರಿ?",
      "dash.tip": "ಇಂದಿನ ಆರೋಗ್ಯ ಸಲಹೆ", "dash.quick": "ತ್ವರಿತ ಪ್ರವೇಶ",

      "page.menstrual": "ಮಾಸಿಕ ಆರೋಗ್ಯ", "page.physical": "ದೈಹಿಕ ಆರೋಗ್ಯ",
      "page.mental": "ಮಾನಸಿಕ ಆರೋಗ್ಯ", "page.nutrition": "ಪೋಷಣೆ ಮತ್ತು ಆಹಾರ",
      "page.healthcare": "ಹತ್ತಿರದ ಆರೋಗ್ಯ ಸೇವೆ", "page.schemes": "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು",
      "page.assistant": "ಸ್ಮಾರ್ಟ್ ಆರೋಗ್ಯ ಸಹಾಯಕ", "page.profile": "ಪ್ರೊಫೈಲ್ ಮತ್ತು ಖಾಸಗಿತನ",
      "page.dashboard": "ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "page.home": "ಮುಖಪುಟ",

      "a11y.title": "ವೀಕ್ಷಣಾ ಸೆಟ್ಟಿಂಗ್", "a11y.text": "ಅಕ್ಷರ ಗಾತ್ರ", "a11y.contrast": "ಹೆಚ್ಚು ಕಾಂಟ್ರಾಸ್ಟ್",
      "a11y.theme": "ರಾತ್ರಿ ಮೋಡ್", "a11y.reset": "ಡೀಫಾಲ್ಟ್‌ಗೆ ಹಿಂತಿರುಗಿ",
      "a11y.normal": "ಸಾಮಾನ್ಯ", "a11y.large": "ದೊಡ್ಡದು", "a11y.xlarge": "ಅತಿ ದೊಡ್ಡದು",
      "a11y.on": "ಆನ್", "a11y.off": "ಆಫ್",

      "footer.note": "ಜೀವಿಕಾ ಆರೋಗ್ಯ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ನೀಡುತ್ತದೆ, ಚಿಕಿತ್ಸೆ ಅಲ್ಲ. ಲಕ್ಷಣ, ಔಷಧಿ ಮತ್ತು ಪರೀಕ್ಷೆ ಬಗ್ಗೆ ವೈದ್ಯರು, ನರ್ಸ್ ಅಥವಾ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರನ್ನು ಖಂಡಿತ ಕೇಳಿ.",
      "footer.rights": "ಹಳ್ಳಿ ಮತ್ತು ನಗರದ ಮಹಿಳೆಯರಿಗಾಗಿ.",
      "banner.english": "ವಿವರವಾದ ಲೇಖನಗಳು ತಪ್ಪು ಅನುವಾದ ತಪ್ಪಿಸಲು ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ ತೆರೆಯುತ್ತವೆ. ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಸಹಾಯಕ್ಕೆ ಆಶಾ ಕಾರ್ಯಕರ್ತೆಯರನ್ನು ಕೇಳಿ ಅಥವಾ 104 ಗೆ ಕರೆ ಮಾಡಿ."
    },

    ta: {
      "brand.tagline": "பெண்களின் உடல்நலம், உங்கள் மொழியில்",
      "nav.home": "முகப்பு", "nav.dashboard": "டாஷ்போர்டு", "nav.menstrual": "மாதவிடாய் நலம்",
      "nav.physical": "உடல் நலம்", "nav.mental": "மனநலம்", "nav.nutrition": "ஊட்டச்சத்து & உணவு",
      "nav.healthcare": "அருகிலுள்ள சுகாதாரம்", "nav.schemes": "அரசு திட்டங்கள்",
      "nav.assistant": "சுகாதார உதவியாளர்", "nav.profile": "சுயவிவரம் & தனியுரிமை",

      "common.menu": "பட்டி", "common.close": "மூடு", "common.language": "மொழி",
      "common.theme": "நிறத்தை மாற்று", "common.accessibility": "காட்சி அமைப்புகள்",
      "common.save": "சேமி", "common.cancel": "ரத்து", "common.delete": "நீக்கு",
      "common.search": "தேடு", "common.all": "அனைத்தும்", "common.call": "அழை",
      "common.viewAll": "அனைத்தையும் பார்", "common.learnMore": "மேலும் அறிக",
      "common.helpline": "உதவி எண்", "common.emergency": "அவசரம்", "common.today": "இன்று",
      "common.disclaimer": "இந்த இணையதளம் சுகாதார தகவலை மட்டுமே தருகிறது. நோயைக் கண்டறியாது, மருந்து பரிந்துரைக்காது.",

      "home.eyebrow": "பெண்களுக்காக, அக்கறையுடன்",
      "home.title": "உங்கள் உடல்நலம், <em>உங்கள் மொழியில்</em> புரியும் வகையில்.",
      "home.sub": "மாதவிடாய், உடல் மற்றும் மனநலம், ஊட்டச்சத்து, மலிவு சிகிச்சை — கிராமம் மற்றும் நகரம் இரண்டிற்கும் ஓர் அமைதியான, தனிப்பட்ட துணை.",
      "home.cta1": "என் டாஷ்போர்டைத் திற", "home.cta2": "உதவியாளரிடம் பேசு",
      "home.trust1": "தனியுரிமை பாதுகாப்பு", "home.trust2": "8 மொழிகள்", "home.trust3": "இலவசம்",
      "home.quickTitle": "உங்களுக்குத் தேவையான அனைத்தும் ஒரே இடத்தில்",
      "home.quickSub": "எளிய கருவிகள். சிக்கலான பட்டிகள் இல்லை. இன்று தேவையானதில் தொடங்குங்கள்.",
      "home.langTitle": "நீங்கள் நினைக்கும் மொழியிலேயே பேசுங்கள்",
      "home.langSub": "மொழியைத் தேர்ந்தெடுத்து, படிக்க எளிதாக எழுத்து அளவைப் பெரிதாக்குங்கள்.",
      "home.supportTitle": "இன்று மனம் கனமாக இருந்தால், நீங்கள் தனியில்லை",
      "home.privacyTitle": "உங்கள் உடல், உங்கள் தரவு",
      "home.privacySub": "உங்கள் உடல்நலம் குறித்த எந்தத் தகவலும் இந்தச் சாதனத்தை விட்டு வெளியே செல்லாது.",

      "dash.welcome": "மீண்டும் வருக",
      "dash.sub": "இன்று உங்கள் உடல்நலத்தின் ஒரு சிறு படம்.",
      "dash.next": "அடுத்த மாதவிடாய்", "dash.days": "நாட்கள்", "dash.logMood": "இன்று எப்படி உணர்கிறீர்கள்?",
      "dash.tip": "இன்றைய சுகாதார குறிப்பு", "dash.quick": "விரைவு அணுகல்",

      "page.menstrual": "மாதவிடாய் நலம்", "page.physical": "உடல் நலம்",
      "page.mental": "மனநலம்", "page.nutrition": "ஊட்டச்சத்து & உணவு",
      "page.healthcare": "அருகிலுள்ள சுகாதாரம்", "page.schemes": "அரசு திட்டங்கள்",
      "page.assistant": "ஸ்மார்ட் சுகாதார உதவியாளர்", "page.profile": "சுயவிவரம் & தனியுரிமை",
      "page.dashboard": "சுகாதார டாஷ்போர்டு", "page.home": "முகப்பு",

      "a11y.title": "காட்சி அமைப்புகள்", "a11y.text": "எழுத்து அளவு", "a11y.contrast": "அதிக மாறுபாடு",
      "a11y.theme": "இரவு பயன்முறை", "a11y.reset": "இயல்புநிலைக்கு",
      "a11y.normal": "சாதாரணம்", "a11y.large": "பெரியது", "a11y.xlarge": "மிகப் பெரியது",
      "a11y.on": "இயக்கு", "a11y.off": "நிறுத்து",

      "footer.note": "ஜீவிகா ஆரோக்யா சுகாதார கல்வியை மட்டுமே வழங்குகிறது, சிகிச்சை அல்ல. அறிகுறிகள், மருந்து, பரிசோதனை பற்றி மருத்துவர், செவிலியர் அல்லது ஆஷா பணியாளரிடம் கேளுங்கள்.",
      "footer.rights": "கிராமம் மற்றும் நகரப் பெண்களுக்காக.",
      "banner.english": "தவறான மொழிபெயர்ப்பைத் தவிர்க்க விரிவான கட்டுரைகள் ஆங்கிலத்தில் திறக்கின்றன. உங்கள் மொழியில் உதவிக்கு ஆஷா பணியாளரிடம் கேளுங்கள் அல்லது 104 ஐ அழையுங்கள்."
    },

    te: {
      "brand.tagline": "మహిళల ఆరోగ్యం, మీ భాషలో",
      "nav.home": "హోమ్", "nav.dashboard": "డాష్‌బోర్డ్", "nav.menstrual": "రుతుస్రావ ఆరోగ్యం",
      "nav.physical": "శారీరక ఆరోగ్యం", "nav.mental": "మానసిక ఆరోగ్యం", "nav.nutrition": "పోషణ & ఆహారం",
      "nav.healthcare": "సమీప ఆరోగ్య సేవలు", "nav.schemes": "ప్రభుత్వ పథకాలు",
      "nav.assistant": "ఆరోగ్య సహాయకుడు", "nav.profile": "ప్రొఫైల్ & గోప్యత",

      "common.menu": "మెనూ", "common.close": "మూసివేయి", "common.language": "భాష",
      "common.theme": "రంగు మార్చు", "common.accessibility": "ప్రదర్శన సెట్టింగ్‌లు",
      "common.save": "సేవ్ చేయి", "common.cancel": "రద్దు", "common.delete": "తొలగించు",
      "common.search": "వెతుకు", "common.all": "అన్నీ", "common.call": "కాల్ చేయి",
      "common.viewAll": "అన్నీ చూడు", "common.learnMore": "మరింత తెలుసుకో",
      "common.helpline": "సహాయవాణి", "common.emergency": "అత్యవసరం", "common.today": "ఈరోజు",
      "common.disclaimer": "ఈ వెబ్‌సైట్ ఆరోగ్య సమాచారం మాత్రమే ఇస్తుంది. వ్యాధిని నిర్ధారించదు, మందులు సూచించదు.",

      "home.eyebrow": "మహిళల కోసం, శ్రద్ధతో",
      "home.title": "మీ ఆరోగ్యం, <em>మీ భాషలో</em> అర్థమయ్యేలా.",
      "home.sub": "రుతుస్రావం, శారీరక మరియు మానసిక ఆరోగ్యం, పోషణ, చవకైన చికిత్స కోసం ప్రశాంతమైన, గోప్యమైన తోడు — పల్లెకూ నగరానికీ.",
      "home.cta1": "నా డాష్‌బోర్డ్ తెరువు", "home.cta2": "సహాయకుడితో మాట్లాడు",
      "home.trust1": "గోప్యతకు ప్రాధాన్యం", "home.trust2": "8 భాషలు", "home.trust3": "ఉచితం",
      "home.quickTitle": "మీకు కావాల్సినవి అన్నీ ఒకే చోట",
      "home.quickSub": "సులభ సాధనాలు. సంక్లిష్ట మెనూలు లేవు. ఈరోజు అవసరమైనదానితో ప్రారంభించండి.",
      "home.langTitle": "మీరు ఆలోచించే భాషలోనే మాట్లాడండి",
      "home.langSub": "భాషను ఎంచుకోండి, చదవడం సులభంగా ఉండేందుకు అక్షర పరిమాణాన్ని పెంచండి.",
      "home.supportTitle": "ఈరోజు మనసు బరువుగా ఉంటే, మీరు ఒంటరి కాదు",
      "home.privacyTitle": "మీ శరీరం, మీ డేటా",
      "home.privacySub": "మీ ఆరోగ్యానికి సంబంధించిన ఏ సమాచారం ఈ పరికరం నుండి బయటికి వెళ్లదు.",

      "dash.welcome": "మళ్ళీ స్వాగతం",
      "dash.sub": "ఈరోజు మీ ఆరోగ్యం గురించి ఒక చిన్న చిత్రం.",
      "dash.next": "తదుపరి రుతుస్రావం", "dash.days": "రోజులు", "dash.logMood": "ఈరోజు ఎలా ఉన్నారు?",
      "dash.tip": "ఈరోజు ఆరోగ్య చిట్కా", "dash.quick": "త్వరిత ప్రవేశం",

      "page.menstrual": "రుతుస్రావ ఆరోగ్యం", "page.physical": "శారీరక ఆరోగ్యం",
      "page.mental": "మానసిక ఆరోగ్యం", "page.nutrition": "పోషణ & ఆహారం",
      "page.healthcare": "సమీప ఆరోగ్య సేవలు", "page.schemes": "ప్రభుత్వ పథకాలు",
      "page.assistant": "స్మార్ట్ ఆరోగ్య సహాయకుడు", "page.profile": "ప్రొఫైల్ & గోప్యత",
      "page.dashboard": "ఆరోగ్య డాష్‌బోర్డ్", "page.home": "హోమ్",

      "a11y.title": "ప్రదర్శన సెట్టింగ్‌లు", "a11y.text": "అక్షర పరిమాణం", "a11y.contrast": "అధిక కాంట్రాస్ట్",
      "a11y.theme": "రాత్రి మోడ్", "a11y.reset": "డిఫాల్ట్‌కు",
      "a11y.normal": "సాధారణం", "a11y.large": "పెద్దది", "a11y.xlarge": "అతి పెద్దది",
      "a11y.on": "ఆన్", "a11y.off": "ఆఫ్",

      "footer.note": "జీవికా ఆరోగ్య ఆరోగ్య విద్యను మాత్రమే అందిస్తుంది, చికిత్స కాదు. లక్షణాలు, మందులు, పరీక్షల గురించి డాక్టర్, నర్సు లేదా ఆశా కార్యకర్తను తప్పక అడగండి.",
      "footer.rights": "పల్లె మరియు నగర మహిళల కోసం.",
      "banner.english": "తప్పు అనువాదం జరగకుండా వివరమైన వ్యాసాలు ఇంగ్లీషులో తెరుచుకుంటాయి. మీ భాషలో సహాయం కోసం ఆశా కార్యకర్తను అడగండి లేదా 104కు కాల్ చేయండి."
    },

    ml: {
      "brand.tagline": "സ്ത്രീകളുടെ ആരോഗ്യം, നിങ്ങളുടെ ഭാഷയിൽ",
      "nav.home": "ഹോം", "nav.dashboard": "ഡാഷ്ബോർഡ്", "nav.menstrual": "ആർത്തവാരോഗ്യം",
      "nav.physical": "ശാരീരിക ആരോഗ്യം", "nav.mental": "മാനസിക ആരോഗ്യം", "nav.nutrition": "പോഷകാഹാരം",
      "nav.healthcare": "അടുത്തുള്ള ആരോഗ്യസേവനം", "nav.schemes": "സർക്കാർ പദ്ധതികൾ",
      "nav.assistant": "ആരോഗ്യ സഹായി", "nav.profile": "പ്രൊഫൈൽ & സ്വകാര്യത",

      "common.menu": "മെനു", "common.close": "അടയ്ക്കുക", "common.language": "ഭാഷ",
      "common.theme": "നിറം മാറ്റുക", "common.accessibility": "ദൃശ്യ ക്രമീകരണങ്ങൾ",
      "common.save": "സേവ് ചെയ്യുക", "common.cancel": "റദ്ദാക്കുക", "common.delete": "നീക്കം ചെയ്യുക",
      "common.search": "തിരയുക", "common.all": "എല്ലാം", "common.call": "വിളിക്കുക",
      "common.viewAll": "എല്ലാം കാണുക", "common.learnMore": "കൂടുതൽ അറിയുക",
      "common.helpline": "ഹെൽപ്പ്‌ലൈൻ", "common.emergency": "അടിയന്തരം", "common.today": "ഇന്ന്",
      "common.disclaimer": "ഈ വെബ്സൈറ്റ് ആരോഗ്യ വിവരങ്ങൾ മാത്രം നൽകുന്നു. രോഗനിർണ്ണയമോ മരുന്ന് നിർദ്ദേശമോ നൽകുന്നില്ല.",

      "home.eyebrow": "സ്ത്രീകൾക്കായി, കരുതലോടെ",
      "home.title": "നിങ്ങളുടെ ആരോഗ്യം, <em>നിങ്ങളുടെ ഭാഷയിൽ</em>.",
      "home.sub": "ആർത്തവം, ശാരീരിക–മാനസിക ആരോഗ്യം, പോഷണം, താങ്ങാനാകുന്ന ചികിത്സ — ഗ്രാമത്തിനും നഗരത്തിനും ഒരുപോലെ ഒരു ശാന്തമായ കൂട്ട്.",
      "home.cta1": "എന്റെ ഡാഷ്ബോർഡ് തുറക്കുക", "home.cta2": "സഹായിയോട് സംസാരിക്കുക",
      "home.trust1": "സ്വകാര്യത ഉറപ്പ്", "home.trust2": "8 ഭാഷകൾ", "home.trust3": "സൗജന്യം",
      "home.quickTitle": "വേണ്ടതെല്ലാം ഒരിടത്ത്",
      "home.quickSub": "ലളിത ഉപകരണങ്ങൾ. സങ്കീർണ്ണ മെനുവില്ല. ഇന്ന് ആവശ്യമുള്ളതിൽ തുടങ്ങുക.",
      "home.langTitle": "നിങ്ങൾ ചിന്തിക്കുന്ന ഭാഷയിൽ സംസാരിക്കുക",
      "home.langSub": "ഭാഷ തിരഞ്ഞെടുത്ത്, വായിക്കാൻ എളുപ്പത്തിന് അക്ഷരവലിപ്പം കൂട്ടുക.",
      "home.supportTitle": "ഇന്ന് മനസ്സ് ഭാരമുള്ളതാണെങ്കിൽ, നിങ്ങൾ ഒറ്റയ്ക്കല്ല",
      "home.privacyTitle": "നിങ്ങളുടെ ശരീരം, നിങ്ങളുടെ ഡാറ്റ",
      "home.privacySub": "നിങ്ങളുടെ ആരോഗ്യത്തെക്കുറിച്ചുള്ള ഒരു വിവരവും ഈ ഉപകരണത്തിൽ നിന്ന് പുറത്തുപോകുന്നില്ല.",

      "dash.welcome": "വീണ്ടും സ്വാഗതം",
      "dash.sub": "ഇന്നത്തെ ആരോഗ്യത്തിന്റെ ഒരു ചെറിയ ചിത്രം.",
      "dash.next": "അടുത്ത ആർത്തവം", "dash.days": "ദിവസം", "dash.logMood": "ഇന്ന് എങ്ങനെ തോന്നുന്നു?",
      "dash.tip": "ഇന്നത്തെ ആരോഗ്യ നിർദ്ദേശം", "dash.quick": "പെട്ടെന്നുള്ള പ്രവേശനം",

      "page.menstrual": "ആർത്തവാരോഗ്യം", "page.physical": "ശാരീരിക ആരോഗ്യം",
      "page.mental": "മാനസിക ആരോഗ്യം", "page.nutrition": "പോഷകാഹാരം",
      "page.healthcare": "അടുത്തുള്ള ആരോഗ്യസേവനം", "page.schemes": "സർക്കാർ പദ്ധതികൾ",
      "page.assistant": "സ്മാർട്ട് ആരോഗ്യ സഹായി", "page.profile": "പ്രൊഫൈൽ & സ്വകാര്യത",
      "page.dashboard": "ആരോഗ്യ ഡാഷ്ബോർഡ്", "page.home": "ഹോം",

      "a11y.title": "ദൃശ്യ ക്രമീകരണങ്ങൾ", "a11y.text": "അക്ഷരവലിപ്പം", "a11y.contrast": "ഉയർന്ന കോൺട്രാസ്റ്റ്",
      "a11y.theme": "രാത്രി മോഡ്", "a11y.reset": "ഡിഫോൾട്ടിലേക്ക്",
      "a11y.normal": "സാധാരണ", "a11y.large": "വലുത്", "a11y.xlarge": "ഏറ്റവും വലുത്",
      "a11y.on": "ഓൺ", "a11y.off": "ഓഫ്",

      "footer.note": "ജീവിക ആരോഗ്യ ആരോഗ്യ വിദ്യാഭ്യാസം മാത്രം നൽകുന്നു, ചികിത്സയല്ല. ലക്ഷണങ്ങൾ, മരുന്ന്, പരിശോധന എന്നിവയെക്കുറിച്ച് ഡോക്ടർ, നഴ്സ് അല്ലെങ്കിൽ ആശ വർക്കറോട് ചോദിക്കുക.",
      "footer.rights": "ഗ്രാമത്തിലെയും നഗരത്തിലെയും സ്ത്രീകൾക്കായി.",
      "banner.english": "തെറ്റായ വിവർത്തനം ഒഴിവാക്കാൻ വിശദമായ ലേഖനങ്ങൾ ഇംഗ്ലീഷിൽ തുറക്കുന്നു. നിങ്ങളുടെ ഭാഷയിൽ സഹായത്തിന് ആശ വർക്കറോട് ചോദിക്കുക അല്ലെങ്കിൽ 104 വിളിക്കുക."
    },

    bn: {
      "brand.tagline": "নারীর স্বাস্থ্য, আপনার ভাষায়",
      "nav.home": "হোম", "nav.dashboard": "ড্যাশবোর্ড", "nav.menstrual": "মাসিক স্বাস্থ্য",
      "nav.physical": "শারীরিক স্বাস্থ্য", "nav.mental": "মানসিক সুস্থতা", "nav.nutrition": "পুষ্টি ও খাদ্য",
      "nav.healthcare": "কাছের স্বাস্থ্যসেবা", "nav.schemes": "সরকারি প্রকল্প",
      "nav.assistant": "স্বাস্থ্য সহায়ক", "nav.profile": "প্রোফাইল ও গোপনীয়তা",

      "common.menu": "মেনু", "common.close": "বন্ধ করুন", "common.language": "ভাষা",
      "common.theme": "রং বদলান", "common.accessibility": "প্রদর্শন সেটিংস",
      "common.save": "সেভ করুন", "common.cancel": "বাতিল", "common.delete": "মুছুন",
      "common.search": "খুঁজুন", "common.all": "সব", "common.call": "কল করুন",
      "common.viewAll": "সব দেখুন", "common.learnMore": "আরও জানুন",
      "common.helpline": "হেল্পলাইন", "common.emergency": "জরুরি", "common.today": "আজ",
      "common.disclaimer": "এই ওয়েবসাইট কেবল স্বাস্থ্য-শিক্ষা দেয়। রোগ নির্ণয় বা ওষুধ লেখা করে না।",

      "home.eyebrow": "নারীর জন্য, যত্ন নিয়ে",
      "home.title": "আপনার স্বাস্থ্য, <em>আপনার ভাষায়</em> বোঝা।",
      "home.sub": "মাসিক, শারীরিক ও মানসিক স্বাস্থ্য, পুষ্টি এবং সাশ্রয়ী চিকিৎসার জন্য একটি শান্ত, গোপনীয় সঙ্গী — গ্রাম ও শহর দুইয়ের জন্যই।",
      "home.cta1": "আমার ড্যাশবোর্ড খুলুন", "home.cta2": "সহায়কের সঙ্গে কথা বলুন",
      "home.trust1": "গোপনীয়তা সুরক্ষিত", "home.trust2": "৮টি ভাষা", "home.trust3": "বিনামূল্যে",
      "home.quickTitle": "আপনার প্রয়োজনীয় সবকিছু এক জায়গায়",
      "home.quickSub": "সহজ সরঞ্জাম। জটিল মেনু নেই। আজ যা দরকার সেটা দিয়েই শুরু করুন।",
      "home.langTitle": "যে ভাষায় ভাবেন, সেই ভাষায় কথা বলুন",
      "home.langSub": "ভাষা বেছে নিন, তারপর সহজে পড়তে অক্ষরের আকার বাড়ান।",
      "home.supportTitle": "আজ মন ভারী হলে, আপনি একা নন",
      "home.privacyTitle": "আপনার শরীর, আপনার তথ্য",
      "home.privacySub": "আপনার স্বাস্থ্য সম্পর্কিত কোনো তথ্য এই ডিভাইস থেকে বাইরে যায় না।",

      "dash.welcome": "আবার স্বাগতম",
      "dash.sub": "আজ আপনার স্বাস্থ্যের একটি ছোট্ট চিত্র।",
      "dash.next": "পরবর্তী মাসিক", "dash.days": "দিন", "dash.logMood": "আজ কেমন লাগছে?",
      "dash.tip": "আজকের স্বাস্থ্য পরামর্শ", "dash.quick": "দ্রুত প্রবেশ",

      "page.menstrual": "মাসিক স্বাস্থ্য", "page.physical": "শারীরিক স্বাস্থ্য",
      "page.mental": "মানসিক সুস্থতা", "page.nutrition": "পুষ্টি ও খাদ্য",
      "page.healthcare": "কাছের স্বাস্থ্যসেবা", "page.schemes": "সরকারি প্রকল্প",
      "page.assistant": "স্মার্ট স্বাস্থ্য সহায়ক", "page.profile": "প্রোফাইল ও গোপনীয়তা",
      "page.dashboard": "স্বাস্থ্য ড্যাশবোর্ড", "page.home": "হোম",

      "a11y.title": "প্রদর্শন সেটিংস", "a11y.text": "লেখার আকার", "a11y.contrast": "উচ্চ কনট্রাস্ট",
      "a11y.theme": "রাতের মোড", "a11y.reset": "ডিফল্টে ফিরুন",
      "a11y.normal": "সাধারণ", "a11y.large": "বড়", "a11y.xlarge": "সবচেয়ে বড়",
      "a11y.on": "চালু", "a11y.off": "বন্ধ",

      "footer.note": "জীবিকা আরোগ্য কেবল স্বাস্থ্য-শিক্ষা দেয়, চিকিৎসা নয়। উপসর্গ, ওষুধ ও পরীক্ষা নিয়ে ডাক্তার, নার্স বা আশা কর্মীর সঙ্গে অবশ্যই কথা বলুন।",
      "footer.rights": "গ্রাম ও শহরের নারীদের জন্য।",
      "banner.english": "ভুল অনুবাদ এড়াতে বিস্তারিত নিবন্ধগুলো ইংরেজিতে খোলে। নিজের ভাষায় সাহায্যের জন্য আশা কর্মীকে জিজ্ঞাসা করুন বা ১০৪ নম্বরে কল করুন।"
    },

    tcy: {
      "brand.tagline": "ಮಹಿಳೆಯರ ಆರೋಗ್ಯ, ಇರೆನ ಭಾಷೆಡ್",
      "nav.home": "ಮುಖಪುಟ", "nav.dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "nav.menstrual": "ಮಾಸಿಕ ಆರೋಗ್ಯ",
      "nav.physical": "ದೇಹದ ಆರೋಗ್ಯ", "nav.mental": "ಮನಸ್ಸುದ ಆರೋಗ್ಯ", "nav.nutrition": "ಆಹಾರ ಪೋಷಣೆ",
      "nav.healthcare": "ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ", "nav.schemes": "ಸರ್ಕಾರಿ ಯೋಜನೆಲು",
      "nav.assistant": "ಆರೋಗ್ಯ ಸಹಾಯಕೆ", "nav.profile": "ಪ್ರೊಫೈಲ್ ಬೊಕ್ಕ ಗೋಪ್ಯತೆ",

      "common.menu": "ಮೆನು", "common.close": "ಮುಚ್ಚು", "common.language": "ಭಾಷೆ",
      "common.theme": "ಬಣ್ಣ ಬದಲ್", "common.accessibility": "ತೋಜುನ ಸೆಟ್ಟಿಂಗ್",
      "common.save": "ಒರಿತುದು", "common.cancel": "ರದ್ದು", "common.delete": "ದೆತ್ತ್ ಪಾಡು",
      "common.search": "ನಾಡ್", "common.all": "ಮುಟ್ಟ", "common.call": "ಕರೆ ಮಲ್ಪು",
      "common.viewAll": "ಮುಟ್ಟ ತೂಲೆ", "common.learnMore": "ನನಾತ್ ತೆರಿಯೊನುಲೆ",
      "common.helpline": "ಸಹಾಯ ಸಂಖ್ಯೆ", "common.emergency": "ತುರ್ತು", "common.today": "ಇನಿ",
      "common.disclaimer": "ಈ ವೆಬ್‌ಸೈಟ್ ಆರೋಗ್ಯ ಮಾಹಿತಿ ಮಾತ್ರ ಕೊರ್ಪುಂಡು. ರೋಗ ಪನ್ಪುಜಿ, ಮರ್ದ್ ಸೂಚಿಸುಜಿ.",

      "home.eyebrow": "ಮಹಿಳೆಯರೆಗ್, ಕಾಳಜಿಡ್",
      "home.title": "ಇರೆನ ಆರೋಗ್ಯ, <em>ಇರೆನ ಭಾಷೆಡ್</em> ತೆರಿಯೊನುನಂಚ.",
      "home.sub": "ಮಾಸಿಕ ಆರೋಗ್ಯ, ದೇಹ ಬೊಕ್ಕ ಮನಸ್ಸುದ ಆರೋಗ್ಯ, ಆಹಾರ ಬೊಕ್ಕ ಸಿಗುನ ಚಿಕಿತ್ಸೆಗ್ ಒಂಜಿ ನೆಮ್ಮದಿದ ಸಂಗಾತಿ — ಊರುಗು ಪೇಟೆಗು.",
      "home.cta1": "ಎನ್ನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಲೆ", "home.cta2": "ಸಹಾಯಕೆಡ್ ಪಾತೆರ್‌ಲೆ",
      "home.trust1": "ಗೋಪ್ಯತೆ ಉಂಡು", "home.trust2": "8 ಭಾಷೆಲು", "home.trust3": "ಉಚಿತ",
      "home.quickTitle": "ಇರೆಗ್ ಬೋಡಾಯಿನ ಮುಟ್ಟ ಒಂಜಿ ಜಾಗೊಡು",
      "home.quickSub": "ಸುಲಭ ಸಾಧನೊಲು. ಗೊಂದಲದ ಮೆನು ಇಜ್ಜಿ. ಇನಿ ಬೋಡಾಯಿನೆಡ್ದ್ ಸುರು ಮಲ್ಪುಲೆ.",
      "home.langTitle": "ಇರೆನ ಯೋಚನೆದ ಭಾಷೆಡೇ ಪಾತೆರ್‌ಲೆ",
      "home.langSub": "ಭಾಷೆ ಆಯ್ಕೆ ಮಲ್ಪುಲೆ, ಬೊಕ್ಕ ಓದೆರೆ ಸುಲಭ ಆವರೆ ಅಕ್ಷರ ಗಾತ್ರ ಹೆಚ್ಚ ಮಲ್ಪುಲೆ.",
      "home.supportTitle": "ಇನಿ ಮನಸ್ಸು ಭಾರ ಉಂಡುಂಡ, ಇರ್ ಒರಿಯೇ ಇಜ್ಜಿ",
      "home.privacyTitle": "ಇರೆನ ಮೈ, ಇರೆನ ಮಾಹಿತಿ",
      "home.privacySub": "ಇರೆನ ಆರೋಗ್ಯದ ಯಾವುದೇ ಮಾಹಿತಿ ಈ ಸಾಧನೊರ್ದು ಪಿದಯಿ ಪೋಪುಜಿ.",

      "dash.welcome": "ಮತ್ತೆ ಸ್ವಾಗತ",
      "dash.sub": "ಇನಿ ಇರೆನ ಆರೋಗ್ಯದ ಒಂಜಿ ಚಿಕ್ಕ ಚಿತ್ರ.",
      "dash.next": "ಬತ್ತಿನ ಮಾಸಿಕ", "dash.days": "ದಿನ", "dash.logMood": "ಇನಿ ಇರ್ ಎಂಚ ಉಲ್ಲರ್?",
      "dash.tip": "ಇನಿದ ಆರೋಗ್ಯ ಸಲಹೆ", "dash.quick": "ಬೇಗ ಸಿಗುನ",

      "page.menstrual": "ಮಾಸಿಕ ಆರೋಗ್ಯ", "page.physical": "ದೇಹದ ಆರೋಗ್ಯ",
      "page.mental": "ಮನಸ್ಸುದ ಆರೋಗ್ಯ", "page.nutrition": "ಆಹಾರ ಪೋಷಣೆ",
      "page.healthcare": "ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ", "page.schemes": "ಸರ್ಕಾರಿ ಯೋಜನೆಲು",
      "page.assistant": "ಸ್ಮಾರ್ಟ್ ಆರೋಗ್ಯ ಸಹಾಯಕೆ", "page.profile": "ಪ್ರೊಫೈಲ್ ಬೊಕ್ಕ ಗೋಪ್ಯತೆ",
      "page.dashboard": "ಆರೋಗ್ಯ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್", "page.home": "ಮುಖಪುಟ",

      "a11y.title": "ತೋಜುನ ಸೆಟ್ಟಿಂಗ್", "a11y.text": "ಅಕ್ಷರ ಗಾತ್ರ", "a11y.contrast": "ಹೆಚ್ಚು ಕಾಂಟ್ರಾಸ್ಟ್",
      "a11y.theme": "ರಾತ್ರಿದ ಮೋಡ್", "a11y.reset": "ಡೀಫಾಲ್ಟ್‌ಗ್",
      "a11y.normal": "ಸಾಮಾನ್ಯ", "a11y.large": "ಮಲ್ಲ", "a11y.xlarge": "ಮಸ್ತ್ ಮಲ್ಲ",
      "a11y.on": "ಆನ್", "a11y.off": "ಆಫ್",

      "footer.note": "ಜೀವಿಕಾ ಆರೋಗ್ಯ ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಕೊರ್ಪುಂಡು, ಚಿಕಿತ್ಸೆ ಅತ್ತ್. ಲಕ್ಷಣ, ಮರ್ದ್ ಬೊಕ್ಕ ಪರೀಕ್ಷೆದ ಬಗೆಟ್ ಡಾಕ್ಟರ್, ನರ್ಸ್ ಅತ್ತಂಡ ಆಶಾ ಕಾರ್ಯಕರ್ತೆನ್ ಕೇನ್‌ಲೆ.",
      "footer.rights": "ಊರು ಬೊಕ್ಕ ಪೇಟೆದ ಮಹಿಳೆಯರೆಗ್.",
      "banner.english": "ತಪ್ಪು ಅನುವಾದ ಆವಂದಿಲೆಕ್ಕ ವಿಸ್ತಾರದ ಲೇಖನೊಲು ಇಂಗ್ಲಿಷ್‌ಡ್ ತೆರೆಯುಂಡು. ಇರೆನ ಭಾಷೆಡ್ ಸಹಾಯಗ್ ಆಶಾ ಕಾರ್ಯಕರ್ತೆನ್ ಕೇನ್‌ಲೆ ಅತ್ತಂಡ 104ಗ್ ಕರೆ ಮಲ್ಪುಲೆ."
    }
  };

  /* Navigation labels for pages added after the original dictionary. */
  const EXTRA = {
    en: { "nav.preventive": "Preventive Health", "page.preventive": "Preventive Healthcare" },
    hi: { "nav.preventive": "निवारक स्वास्थ्य", "page.preventive": "निवारक स्वास्थ्य देखभाल" },
    kn: { "nav.preventive": "ಮುನ್ನೆಚ್ಚರಿಕೆ ಆರೋಗ್ಯ", "page.preventive": "ಮುನ್ನೆಚ್ಚರಿಕೆ ಆರೋಗ್ಯ ಸೇವೆ" },
    ta: { "nav.preventive": "தடுப்பு சுகாதாரம்", "page.preventive": "தடுப்பு சுகாதாரப் பராமரிப்பு" },
    te: { "nav.preventive": "నివారణ ఆరోగ్యం", "page.preventive": "నివారణ ఆరోగ్య సంరక్షణ" },
    ml: { "nav.preventive": "പ്രതിരോധ ആരോഗ്യം", "page.preventive": "പ്രതിരോധ ആരോഗ്യ സേവനം" },
    bn: { "nav.preventive": "প্রতিরোধমূলক স্বাস্থ্য", "page.preventive": "প্রতিরোধমূলক স্বাস্থ্যসেবা" },
    tcy: { "nav.preventive": "ಮುನ್ನೆಚ್ಚರಿಕೆ ಆರೋಗ್ಯ", "page.preventive": "ಮುನ್ನೆಚ್ಚರಿಕೆ ಆರೋಗ್ಯ ಸೇವೆ" }
  };
  Object.keys(EXTRA).forEach(function (code) {
    if (!STRINGS[code]) STRINGS[code] = {};
    Object.keys(EXTRA[code]).forEach(function (key) { STRINGS[code][key] = EXTRA[code][key]; });
  });

  const LANGS = [
    { code: "en", label: "English", glyph: "A" },
    { code: "hi", label: "हिन्दी", glyph: "अ" },
    { code: "kn", label: "ಕನ್ನಡ", glyph: "ಅ" },
    { code: "ta", label: "தமிழ்", glyph: "அ" },
    { code: "te", label: "తెలుగు", glyph: "అ" },
    { code: "ml", label: "മലയാളം", glyph: "അ" },
    { code: "bn", label: "বাংলা", glyph: "অ" },
    { code: "tcy", label: "ತುಳು", glyph: "ತು" }
  ];

  const STORE_KEY = "jivika.lang";
  let current = "en";

  function readSaved() {
    try {
      const saved = localStorage.getItem(STORE_KEY);
      if (saved && STRINGS[saved]) return saved;
    } catch (e) { /* storage blocked — stay with English */ }
    return "en";
  }

  function t(key, vars) {
    const dict = STRINGS[current] || STRINGS.en;
    let out = dict[key];
    if (out === undefined) out = STRINGS.en[key];
    if (out === undefined) return key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        out = out.split("{" + k + "}").join(vars[k]);
      });
    }
    return out;
  }

  function apply(root) {
    const scope = root || document;
    scope.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    scope.querySelectorAll("[data-i18n-html]").forEach(function (node) {
      node.innerHTML = t(node.getAttribute("data-i18n-html"));
    });
    scope.querySelectorAll("[data-i18n-label]").forEach(function (node) {
      node.setAttribute("aria-label", t(node.getAttribute("data-i18n-label")));
    });
    scope.querySelectorAll("[data-i18n-ph]").forEach(function (node) {
      node.setAttribute("placeholder", t(node.getAttribute("data-i18n-ph")));
    });
  }

  function set(code) {
    if (!STRINGS[code]) code = "en";
    current = code;
    try { localStorage.setItem(STORE_KEY, code); } catch (e) { /* ignore */ }
    document.documentElement.setAttribute("lang", code === "tcy" ? "kn" : code);
    document.documentElement.setAttribute("data-lang", code);
    apply(document);
    document.dispatchEvent(new CustomEvent("jivika:lang", { detail: { lang: code } }));
  }

  current = readSaved();
  document.documentElement.setAttribute("data-lang", current);

  window.JV = window.JV || {};
  window.JV.i18n = { t: t, apply: apply, set: set, get: function () { return current; }, strings: STRINGS, langs: LANGS };
  window.t = t;
})();
