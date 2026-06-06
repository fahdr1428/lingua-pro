#!/usr/bin/env python3
"""
v40 vocabulary expansion — Arabic, Hindi, Spanish, Punjabi.

Focus: high-frequency CONVERSATIONAL words & phrases — the things you actually
need to hold a basic conversation (polite requests, questions, directions,
quantities, everyday actions).

Verification notes (this batch was web-checked, not generated blind):
  - Arabic: forms cross-checked against Kalimah Center, Talkpal, learn-a-new-
    language MSA lists. Standard MSA. Verb citation = 3rd-masc-sing present.
  - Punjabi (Shahmukhi): cross-checked against Preply, TheCognitio, World
    Schoolbooks Punjabi phrase lists. NOTE: Shahmukhi has no fully standardised
    spelling; forms here follow common Pakistani-Punjabi usage. Flagged as
    needing native review where confidence is lower.
  - Hindi: parallels verified Urdu/Hindi conversational vocab; Devanagari.
  - Spanish: high-confidence standard Spanish (already the most complete pack).

Each entry is deduped by lemma at merge time, so re-running is safe.
Run: python3 scripts/expand_vocab_v40.py
"""

import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG_DIR = os.path.join(ROOT, "src", "data", "languages")

# Unit fallback: which existing unit a category maps to. Punjabi only has u1-u5,
# so anything above u5 must map down. We keep it simple and safe.
def safe_unit(code, desired):
    existing = {
        "ar": {f"u{i}" for i in range(1, 12)},
        "hi": {f"u{i}" for i in range(1, 12)},
        "es": {f"u{i}" for i in range(1, 14)},
        "pa": {f"u{i}" for i in range(1, 6)},  # only u1-u5
    }[code]
    return desired if desired in existing else "u2"


NEW = {
    # =========================================================================
    # ARABIC (MSA) — web-verified conversational essentials
    # =========================================================================
    "ar": [
        # Time (verified: Talkpal)
        {"lemma":"يوم","translit":"yawm","translation":"day","category":"Time","unit":"u8","ex_n":"يوم جميل","ex_t":"A beautiful day"},
        {"lemma":"شهر","translit":"shahr","translation":"month","category":"Time","unit":"u8","ex_n":"هذا الشهر","ex_t":"This month"},
        {"lemma":"اليوم","translit":"al-yawm","translation":"today","category":"Time","unit":"u8","ex_n":"اليوم الجمعة","ex_t":"Today is Friday"},
        {"lemma":"غدا","translit":"ghadan","translation":"tomorrow","category":"Time","unit":"u8","ex_n":"أراك غدا","ex_t":"See you tomorrow"},
        {"lemma":"أمس","translit":"ams","translation":"yesterday","category":"Time","unit":"u8","ex_n":"كان أمس","ex_t":"It was yesterday"},
        # Polite / useful (verified: Kalimah, learn-a-new-language)
        {"lemma":"من فضلك","translit":"min fadlak","translation":"please","category":"Useful","unit":"u1","ex_n":"ماء من فضلك","ex_t":"Water, please"},
        {"lemma":"عفوا","translit":"afwan","translation":"sorry / you're welcome","category":"Useful","unit":"u1","ex_n":"عفوا، لا أفهم","ex_t":"Sorry, I don't understand"},
        {"lemma":"مع السلامة","translit":"ma'a as-salamah","translation":"goodbye","category":"Greetings","unit":"u1","ex_n":"مع السلامة","ex_t":"Goodbye"},
        {"lemma":"نعم","translit":"na'am","translation":"yes","category":"Useful","unit":"u1","ex_n":"نعم، من فضلك","ex_t":"Yes, please"},
        {"lemma":"لا","translit":"laa","translation":"no","category":"Useful","unit":"u1","ex_n":"لا، شكرا","ex_t":"No, thank you"},
        # Questions / directions (verified: Kalimah "ayna al-hammam")
        {"lemma":"أين الحمام","translit":"ayna al-hammam","translation":"where is the bathroom?","category":"Useful","unit":"u9","ex_n":"عفوا، أين الحمام؟","ex_t":"Excuse me, where is the bathroom?"},
        {"lemma":"كم","translit":"kam","translation":"how much / how many","category":"Common","unit":"u4","ex_n":"كم الساعة؟","ex_t":"What time is it?"},
        {"lemma":"كيف","translit":"kayfa","translation":"how","category":"Common","unit":"u1","ex_n":"كيف حالك؟","ex_t":"How are you?"},
        # Everyday quantities & words
        {"lemma":"كثير","translit":"katheer","translation":"a lot, many","category":"Common","unit":"u4","ex_n":"شكرا كثيرا","ex_t":"Thank you very much"},
        {"lemma":"قليل","translit":"qaleel","translation":"a little, few","category":"Common","unit":"u4","ex_n":"قليل من الماء","ex_t":"A little water"},
        {"lemma":"الآن","translit":"al-aan","translation":"now","category":"Time","unit":"u8","ex_n":"الآن","ex_t":"Now"},
        {"lemma":"هنا","translit":"hunaa","translation":"here","category":"Places","unit":"u9","ex_n":"تعال هنا","ex_t":"Come here"},
        {"lemma":"هناك","translit":"hunaak","translation":"there","category":"Places","unit":"u9","ex_n":"هناك","ex_t":"There"},
        # Useful verbs (MSA, 3rd-masc-sing present)
        {"lemma":"يريد","translit":"yureed","translation":"to want","category":"Verbs","unit":"u7","ex_n":"أريد ماء","ex_t":"I want water"},
        {"lemma":"يحتاج","translit":"yahtaaj","translation":"to need","category":"Verbs","unit":"u7","ex_n":"أحتاج مساعدة","ex_t":"I need help"},
        {"lemma":"يفهم","translit":"yafham","translation":"to understand","category":"Verbs","unit":"u7","ex_n":"لا أفهم","ex_t":"I don't understand"},
        {"lemma":"يتكلم","translit":"yatakallam","translation":"to speak","category":"Verbs","unit":"u7","ex_n":"أتكلم قليلا","ex_t":"I speak a little"},
        {"lemma":"مساعدة","translit":"musaa'ada","translation":"help","category":"Useful","unit":"u1","ex_n":"أحتاج مساعدة","ex_t":"I need help"},
    ],

    # =========================================================================
    # PUNJABI (SHAHMUKHI) — web-verified conversational essentials
    # NOTE: Shahmukhi spelling not fully standardised — flagged for native review.
    # =========================================================================
    "pa": [
        # Polite / useful (verified transliterations: Preply, TheCognitio)
        {"lemma":"مہربانی کرکے","translit":"meharbani karke","translation":"please","category":"Greetings","unit":"u1","ex_n":"مہربانی کرکے دوبارہ دسو","ex_t":"Please say it again"},
        {"lemma":"شکریہ","translit":"shukriya","translation":"thank you","category":"Greetings","unit":"u1","ex_n":"بہت شکریہ","ex_t":"Thank you very much"},
        {"lemma":"معاف کرنا","translit":"maaf karna","translation":"sorry / excuse me","category":"Greetings","unit":"u1","ex_n":"معاف کرنا جی","ex_t":"Excuse me (polite)"},
        {"lemma":"ہاں","translit":"haan","translation":"yes","category":"Common","unit":"u1","ex_n":"ہاں جی","ex_t":"Yes (polite)"},
        {"lemma":"نہیں","translit":"nahin","translation":"no","category":"Common","unit":"u1","ex_n":"نہیں جی","ex_t":"No (polite)"},
        # Help / understanding (verified: TheCognitio "mainu madad chahidi hai")
        {"lemma":"مدد","translit":"madad","translation":"help","category":"Common","unit":"u1","ex_n":"مینوں مدد چاہیدی اے","ex_t":"I need help"},
        {"lemma":"چاہیدا","translit":"chahida","translation":"to want / need","category":"Verbs","unit":"u5","ex_n":"مینوں پانی چاہیدا اے","ex_t":"I want water"},
        {"lemma":"سمجھ","translit":"samajh","translation":"understanding","category":"Common","unit":"u1","ex_n":"مینوں سمجھ نہیں آئی","ex_t":"I don't understand"},
        {"lemma":"دوبارہ","translit":"dubara","translation":"again","category":"Common","unit":"u1","ex_n":"دوبارہ دسو","ex_t":"Say it again"},
        # Quantities (verified: TheCognitio "thoda ghat / thoda hor")
        {"lemma":"ہور","translit":"hor","translation":"more","category":"Common","unit":"u4","ex_n":"تھوڑا ہور","ex_t":"A little more"},
        {"lemma":"گھٹ","translit":"ghat","translation":"less","category":"Common","unit":"u4","ex_n":"تھوڑا گھٹ","ex_t":"A little less"},
        {"lemma":"تھوڑا","translit":"thoda","translation":"a little","category":"Common","unit":"u4","ex_n":"تھوڑا پانی","ex_t":"A little water"},
        # Questions (verified: "eh kinna da hai", "kithe")
        {"lemma":"کتھے","translit":"kithe","translation":"where","category":"Common","unit":"u1","ex_n":"تسیں کتھے رہندے او؟","ex_t":"Where do you live?"},
        {"lemma":"کنا","translit":"kinna","translation":"how much","category":"Common","unit":"u4","ex_n":"ایہہ کنے دا اے؟","ex_t":"How much is this?"},
        {"lemma":"کی","translit":"ki","translation":"what","category":"Common","unit":"u1","ex_n":"کی حال اے؟","ex_t":"How are you?"},
        # Time (verified: TheCognitio time words)
        {"lemma":"سویرے","translit":"savere","translation":"morning","category":"Time","unit":"u3","ex_n":"سویرے ملاں گے","ex_t":"See you in the morning"},
        {"lemma":"شام","translit":"shaam","translation":"evening","category":"Time","unit":"u3","ex_n":"شام نوں","ex_t":"In the evening"},
        {"lemma":"رات","translit":"raat","translation":"night","category":"Time","unit":"u3","ex_n":"شب بخیر، رات","ex_t":"Good night"},
        # Everyday verbs / words
        {"lemma":"بولنا","translit":"bolna","translation":"to speak","category":"Verbs","unit":"u5","ex_n":"میں پنجابی بولناں","ex_t":"I speak Punjabi"},
        {"lemma":"پانی","translit":"paani","translation":"water","category":"Food","unit":"u5","ex_n":"مینوں پانی چاہیدا","ex_t":"I want water"},
        {"lemma":"چنگا","translit":"changa","translation":"good","category":"Common","unit":"u1","ex_n":"بہت چنگا","ex_t":"Very good"},
    ],

    # =========================================================================
    # HINDI — conversational essentials (Devanagari), parallels verified Urdu
    # =========================================================================
    "hi": [
        {"lemma":"कृपया","translit":"kripya","translation":"please","category":"Useful","unit":"u1","ex_n":"कृपया पानी","ex_t":"Water, please"},
        {"lemma":"धन्यवाद","translit":"dhanyavaad","translation":"thank you","category":"Greetings","unit":"u1","ex_n":"बहुत धन्यवाद","ex_t":"Thank you very much"},
        {"lemma":"माफ़ कीजिए","translit":"maaf kijiye","translation":"sorry / excuse me","category":"Useful","unit":"u1","ex_n":"माफ़ कीजिए","ex_t":"Excuse me"},
        {"lemma":"हाँ","translit":"haan","translation":"yes","category":"Useful","unit":"u1","ex_n":"हाँ जी","ex_t":"Yes (polite)"},
        {"lemma":"नहीं","translit":"nahin","translation":"no","category":"Useful","unit":"u1","ex_n":"नहीं धन्यवाद","ex_t":"No, thank you"},
        {"lemma":"मदद","translit":"madad","translation":"help","category":"Useful","unit":"u1","ex_n":"मुझे मदद चाहिए","ex_t":"I need help"},
        {"lemma":"पानी","translit":"paani","translation":"water","category":"Food","unit":"u5","ex_n":"मुझे पानी चाहिए","ex_t":"I want water"},
        {"lemma":"कितना","translit":"kitna","translation":"how much / how many","category":"Common","unit":"u4","ex_n":"यह कितने का है?","ex_t":"How much is this?"},
        {"lemma":"कहाँ","translit":"kahan","translation":"where","category":"Common","unit":"u1","ex_n":"आप कहाँ रहते हैं?","ex_t":"Where do you live?"},
        {"lemma":"क्या","translit":"kya","translation":"what","category":"Common","unit":"u1","ex_n":"यह क्या है?","ex_t":"What is this?"},
        {"lemma":"ज़्यादा","translit":"zyada","translation":"more, a lot","category":"Common","unit":"u4","ex_n":"थोड़ा ज़्यादा","ex_t":"A little more"},
        {"lemma":"कम","translit":"kam","translation":"less, few","category":"Common","unit":"u4","ex_n":"थोड़ा कम","ex_t":"A little less"},
        {"lemma":"थोड़ा","translit":"thoda","translation":"a little","category":"Common","unit":"u4","ex_n":"थोड़ा पानी","ex_t":"A little water"},
        {"lemma":"अभी","translit":"abhi","translation":"now","category":"Time","unit":"u8","ex_n":"अभी","ex_t":"Right now"},
        {"lemma":"सुबह","translit":"subah","translation":"morning","category":"Time","unit":"u8","ex_n":"सुबह मिलेंगे","ex_t":"See you in the morning"},
        {"lemma":"शाम","translit":"shaam","translation":"evening","category":"Time","unit":"u8","ex_n":"शाम को","ex_t":"In the evening"},
        {"lemma":"रात","translit":"raat","translation":"night","category":"Time","unit":"u8","ex_n":"शुभ रात्रि","ex_t":"Good night"},
        {"lemma":"चाहिए","translit":"chahiye","translation":"to want / need","category":"Verbs","unit":"u7","ex_n":"मुझे चाय चाहिए","ex_t":"I want tea"},
        {"lemma":"समझना","translit":"samajhna","translation":"to understand","category":"Verbs","unit":"u7","ex_n":"मैं नहीं समझा","ex_t":"I don't understand"},
        {"lemma":"बोलना","translit":"bolna","translation":"to speak","category":"Verbs","unit":"u7","ex_n":"मैं हिंदी बोलता हूँ","ex_t":"I speak Hindi"},
        {"lemma":"अच्छा","translit":"achha","translation":"good / okay","category":"Common","unit":"u1","ex_n":"बहुत अच्छा","ex_t":"Very good"},
        {"lemma":"दोबारा","translit":"dobara","translation":"again","category":"Common","unit":"u1","ex_n":"दोबारा बताइए","ex_t":"Please say it again"},
    ],

    # =========================================================================
    # SPANISH — conversational essentials (high confidence, standard Spanish)
    # =========================================================================
    "es": [
        {"lemma":"Por favor","translit":"por fa-VOR","translation":"please","category":"Greetings","unit":"u1","ex_n":"Agua, por favor","ex_t":"Water, please"},
        {"lemma":"De nada","translit":"de NA-da","translation":"you're welcome","category":"Greetings","unit":"u1","ex_n":"— Gracias. — De nada","ex_t":"— Thanks. — You're welcome"},
        {"lemma":"Perdón","translit":"per-DON","translation":"sorry / excuse me","category":"Greetings","unit":"u1","ex_n":"Perdón, no entiendo","ex_t":"Sorry, I don't understand"},
        {"lemma":"Sí","translit":"see","translation":"yes","category":"Common","unit":"u1","ex_n":"Sí, por favor","ex_t":"Yes, please"},
        {"lemma":"No","translit":"no","translation":"no","category":"Common","unit":"u1","ex_n":"No, gracias","ex_t":"No, thank you"},
        {"lemma":"Ayuda","translit":"a-YOO-da","translation":"help","category":"Useful","unit":"u1","ex_n":"Necesito ayuda","ex_t":"I need help"},
        {"lemma":"¿Dónde está el baño?","translit":"DON-de es-TA el BA-nyo","translation":"where is the bathroom?","category":"Travel","unit":"u9","ex_n":"Perdón, ¿dónde está el baño?","ex_t":"Excuse me, where is the bathroom?"},
        {"lemma":"¿Cuánto cuesta?","translit":"KWAN-to KWES-ta","translation":"how much does it cost?","category":"Travel","unit":"u9","ex_n":"¿Cuánto cuesta esto?","ex_t":"How much does this cost?"},
        {"lemma":"Más","translit":"mas","translation":"more","category":"Common","unit":"u4","ex_n":"Un poco más","ex_t":"A little more"},
        {"lemma":"Menos","translit":"ME-nos","translation":"less","category":"Common","unit":"u4","ex_n":"Un poco menos","ex_t":"A little less"},
        {"lemma":"Un poco","translit":"oon PO-ko","translation":"a little","category":"Common","unit":"u4","ex_n":"Un poco de agua","ex_t":"A little water"},
        {"lemma":"Ahora","translit":"a-O-ra","translation":"now","category":"Time","unit":"u8","ex_n":"Ahora no","ex_t":"Not now"},
        {"lemma":"Aquí","translit":"a-KEE","translation":"here","category":"Places","unit":"u9","ex_n":"Ven aquí","ex_t":"Come here"},
        {"lemma":"Allí","translit":"a-YEE","translation":"there","category":"Places","unit":"u9","ex_n":"Está allí","ex_t":"It's there"},
        {"lemma":"Entender","translit":"en-ten-DER","translation":"to understand","category":"Verbs","unit":"u7","ex_n":"No entiendo","ex_t":"I don't understand"},
        {"lemma":"Hablar","translit":"a-BLAR","translation":"to speak","category":"Verbs","unit":"u7","ex_n":"Hablo un poco","ex_t":"I speak a little"},
        {"lemma":"Otra vez","translit":"O-tra ves","translation":"again","category":"Common","unit":"u1","ex_n":"Otra vez, por favor","ex_t":"Again, please"},
        {"lemma":"Bien","translit":"byen","translation":"well / good","category":"Common","unit":"u1","ex_n":"Muy bien","ex_t":"Very well"},
        {"lemma":"Mal","translit":"mal","translation":"badly / bad","category":"Common","unit":"u1","ex_n":"No está mal","ex_t":"It's not bad"},
        {"lemma":"Tal vez","translit":"tal ves","translation":"maybe","category":"Common","unit":"u1","ex_n":"Tal vez mañana","ex_t":"Maybe tomorrow"},
    ],
}


def expand(code):
    path = os.path.join(LANG_DIR, f"{code}.json")
    with open(path, "r", encoding="utf-8") as f:
        pack = json.load(f)
    existing = {v["lemma"] for v in pack["vocab"]}
    cats = set(pack.get("categories", []))
    n = max(int(v["id"].split("_")[1]) for v in pack["vocab"]) + 1
    added = 0
    for e in NEW.get(code, []):
        if e["lemma"] in existing:
            continue
        unit = safe_unit(code, e.get("unit", "u2"))
        if e["category"] not in cats:
            cats.add(e["category"])
        pack["vocab"].append({
            "id": f"{code}_{n:04d}",
            "unit": unit,
            "lemma": e["lemma"],
            "translit": e.get("translit", ""),
            "translation": e["translation"],
            "category": e["category"],
            "difficulty": e.get("difficulty", 2),
            "frequencyRank": e.get("frequencyRank", 50 + n),
            "examples": [{"native": e["ex_n"], "translation": e["ex_t"]}],
        })
        existing.add(e["lemma"]); added += 1; n += 1
    pack["categories"] = sorted(cats)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pack, f, ensure_ascii=False, indent=2)
    return added


if __name__ == "__main__":
    print("v40 vocab expansion — ar, hi, es, pa (web-verified conversational)\n")
    total = 0
    for code in ["ar", "hi", "es", "pa"]:
        a = expand(code)
        total += a
        print(f"  {code}: +{a} words")
    print(f"\n✓ added {total} words across 4 languages")
