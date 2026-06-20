#!/usr/bin/env python3
"""
v41 vocabulary expansion — Nigerian Pidgin, Bengali, Indonesian.

Focus: high-frequency CONVERSATIONAL words & phrases, web-verified.

Verification notes:
  - Nigerian Pidgin: verified against British Council, BuzzNigeria, Wikivoyage,
    Culture Trip Pidgin phrase lists. Pidgin spelling is informal/variable;
    common written forms used.
  - Indonesian: verified against Talkpal, Preply, Mondly, Kaiwa, Twinkl. Standard
    Bahasa Indonesia. No conjugation/gender, phonetic spelling.
  - Bengali: parallels verified Bengali conversational vocab; Bengali script.
    Lower confidence on script nuance — flagged for native review.

Deduped by lemma at merge. Run: python3 scripts/expand_vocab_v41.py
"""

import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG_DIR = os.path.join(ROOT, "src", "data", "languages")

def safe_unit(code, desired):
    existing = {
        "pcm": {f"u{i}" for i in range(1, 6)},
        "bn":  {f"u{i}" for i in range(1, 11)},
        "id":  {f"u{i}" for i in range(1, 6)},
    }[code]
    return desired if desired in existing else "u2"


NEW = {
    # =========================================================================
    # NIGERIAN PIDGIN — web-verified (British Council, Wikivoyage, BuzzNigeria)
    # =========================================================================
    "pcm": [
        {"lemma":"How far","translit":"how far","translation":"hello / how's it going","category":"Greetings","unit":"u1","ex_n":"How far, my friend?","ex_t":"Hello, my friend!"},
        {"lemma":"Wetin","translit":"weh-TIN","translation":"what","category":"Common","unit":"u1","ex_n":"Wetin dey happen?","ex_t":"What's happening?"},
        {"lemma":"Abeg","translit":"a-BEG","translation":"please","category":"Greetings","unit":"u1","ex_n":"Abeg help me","ex_t":"Please help me"},
        {"lemma":"Wahala","translit":"wa-HA-la","translation":"trouble, problem","category":"Common","unit":"u1","ex_n":"No wahala","ex_t":"No problem"},
        {"lemma":"No wahala","translit":"no wa-HA-la","translation":"no problem","category":"Greetings","unit":"u1","ex_n":"— Thank you. — No wahala","ex_t":"— Thank you. — No problem"},
        {"lemma":"Dey","translit":"day","translation":"to be / -ing (continuous)","category":"Verbs","unit":"u5","ex_n":"I dey come","ex_t":"I am coming"},
        {"lemma":"Chop","translit":"chop","translation":"to eat / food","category":"Verbs","unit":"u5","ex_n":"I wan chop","ex_t":"I want to eat"},
        {"lemma":"Comot","translit":"co-MOT","translation":"to leave, get out","category":"Verbs","unit":"u5","ex_n":"Comot for road","ex_t":"Get out of the way"},
        {"lemma":"Una","translit":"OO-na","translation":"you (plural)","category":"People","unit":"u2","ex_n":"Una good?","ex_t":"Are you all well?"},
        {"lemma":"Abi","translit":"a-BI","translation":"right? isn't it?","category":"Common","unit":"u1","ex_n":"You dey come, abi?","ex_t":"You're coming, right?"},
        {"lemma":"Oya","translit":"OH-ya","translation":"come on, let's go","category":"Common","unit":"u1","ex_n":"Oya, make we go","ex_t":"Come on, let's go"},
        {"lemma":"Sharp sharp","translit":"sharp sharp","translation":"quickly, fast","category":"Common","unit":"u1","ex_n":"Do am sharp sharp","ex_t":"Do it quickly"},
        {"lemma":"Sabi","translit":"SA-bi","translation":"to know, understand","category":"Verbs","unit":"u5","ex_n":"I sabi am","ex_t":"I know it"},
        {"lemma":"Wan","translit":"wan","translation":"to want","category":"Verbs","unit":"u5","ex_n":"I wan water","ex_t":"I want water"},
        {"lemma":"Pikin","translit":"PIH-kin","translation":"child","category":"Family","unit":"u3","ex_n":"My pikin","ex_t":"My child"},
        {"lemma":"Money","translit":"MO-ney","translation":"money","category":"Common","unit":"u4","ex_n":"I no get money","ex_t":"I don't have money"},
        {"lemma":"Now now","translit":"now now","translation":"right now, immediately","category":"Common","unit":"u1","ex_n":"Come now now","ex_t":"Come right now"},
        {"lemma":"Small small","translit":"small small","translation":"slowly, little by little","category":"Common","unit":"u1","ex_n":"Do am small small","ex_t":"Do it bit by bit"},
        {"lemma":"Well well","translit":"well well","translation":"very much, properly","category":"Common","unit":"u1","ex_n":"I like am well well","ex_t":"I like it a lot"},
        {"lemma":"Make","translit":"mek","translation":"let (let's)","category":"Common","unit":"u1","ex_n":"Make we go","ex_t":"Let's go"},
    ],

    # =========================================================================
    # INDONESIAN — web-verified (Talkpal, Preply, Mondly, Kaiwa)
    # =========================================================================
    "id": [
        {"lemma":"Terima kasih","translit":"tuh-REE-ma KA-see","translation":"thank you","category":"Greetings","unit":"u1","ex_n":"Terima kasih banyak","ex_t":"Thank you very much"},
        {"lemma":"Sama-sama","translit":"SA-ma SA-ma","translation":"you're welcome","category":"Greetings","unit":"u1","ex_n":"— Terima kasih. — Sama-sama","ex_t":"— Thanks. — You're welcome"},
        {"lemma":"Tolong","translit":"TO-long","translation":"please / help","category":"Useful","unit":"u1","ex_n":"Tolong saya","ex_t":"Help me, please"},
        {"lemma":"Permisi","translit":"per-MEE-see","translation":"excuse me","category":"Greetings","unit":"u1","ex_n":"Permisi, saya mau lewat","ex_t":"Excuse me, I want to pass"},
        {"lemma":"Maaf","translit":"ma-AF","translation":"sorry","category":"Useful","unit":"u1","ex_n":"Maaf, saya terlambat","ex_t":"Sorry, I'm late"},
        {"lemma":"Berapa","translit":"buh-RA-pa","translation":"how much / how many","category":"Common","unit":"u4","ex_n":"Berapa harganya?","ex_t":"How much does it cost?"},
        {"lemma":"Di mana","translit":"dee MA-na","translation":"where","category":"Common","unit":"u1","ex_n":"Di mana toilet?","ex_t":"Where is the toilet?"},
        {"lemma":"Apa","translit":"A-pa","translation":"what","category":"Common","unit":"u1","ex_n":"Apa ini?","ex_t":"What is this?"},
        {"lemma":"Mengerti","translit":"muh-NGER-tee","translation":"to understand","category":"Verbs","unit":"u5","ex_n":"Saya tidak mengerti","ex_t":"I don't understand"},
        {"lemma":"Ulangi","translit":"oo-LA-ngee","translation":"to repeat","category":"Verbs","unit":"u5","ex_n":"Tolong ulangi","ex_t":"Please repeat"},
        {"lemma":"Suka","translit":"SOO-ka","translation":"to like","category":"Verbs","unit":"u5","ex_n":"Saya suka ini","ex_t":"I like this"},
        {"lemma":"Mau","translit":"mow","translation":"to want","category":"Verbs","unit":"u5","ex_n":"Saya mau makan","ex_t":"I want to eat"},
        {"lemma":"Lapar","translit":"LA-par","translation":"hungry","category":"Feelings","unit":"u2","ex_n":"Saya lapar","ex_t":"I am hungry"},
        {"lemma":"Haus","translit":"HOWS","translation":"thirsty","category":"Feelings","unit":"u2","ex_n":"Saya haus","ex_t":"I am thirsty"},
        {"lemma":"Sampai jumpa","translit":"SAM-pai JOOM-pa","translation":"goodbye, see you","category":"Greetings","unit":"u1","ex_n":"Sampai jumpa lagi","ex_t":"See you again"},
        {"lemma":"Tidak apa-apa","translit":"TEE-dak A-pa A-pa","translation":"it's okay, no problem","category":"Common","unit":"u1","ex_n":"Tidak apa-apa","ex_t":"It's okay"},
        {"lemma":"Sekarang","translit":"suh-KA-rang","translation":"now","category":"Time","unit":"u3","ex_n":"Sekarang juga","ex_t":"Right now"},
        {"lemma":"Hari ini","translit":"HA-ree EE-nee","translation":"today","category":"Time","unit":"u3","ex_n":"Hari ini panas","ex_t":"Today is hot"},
        {"lemma":"Lagi","translit":"LA-gee","translation":"again, more","category":"Common","unit":"u1","ex_n":"Sekali lagi","ex_t":"One more time"},
        {"lemma":"Sedikit","translit":"suh-DEE-kit","translation":"a little","category":"Common","unit":"u4","ex_n":"Sedikit air","ex_t":"A little water"},
        {"lemma":"Bagus","translit":"BA-goos","translation":"good, nice","category":"Common","unit":"u1","ex_n":"Bagus sekali","ex_t":"Very good"},
    ],

    # =========================================================================
    # BENGALI — conversational essentials (Bengali script). Native review advised.
    # =========================================================================
    "bn": [
        {"lemma":"দয়া করে","translit":"doya kore","translation":"please","category":"Greetings","unit":"u1","ex_n":"দয়া করে সাহায্য করুন","ex_t":"Please help"},
        {"lemma":"ধন্যবাদ","translit":"dhonnobad","translation":"thank you","category":"Greetings","unit":"u1","ex_n":"অনেক ধন্যবাদ","ex_t":"Thank you very much"},
        {"lemma":"মাফ করবেন","translit":"maaf korben","translation":"sorry / excuse me","category":"Greetings","unit":"u1","ex_n":"মাফ করবেন","ex_t":"Excuse me"},
        {"lemma":"হ্যাঁ","translit":"hyañ","translation":"yes","category":"Common","unit":"u1","ex_n":"হ্যাঁ, ঠিক আছে","ex_t":"Yes, okay"},
        {"lemma":"না","translit":"na","translation":"no","category":"Common","unit":"u1","ex_n":"না, ধন্যবাদ","ex_t":"No, thank you"},
        {"lemma":"সাহায্য","translit":"shahajjo","translation":"help","category":"Common","unit":"u1","ex_n":"আমার সাহায্য দরকার","ex_t":"I need help"},
        {"lemma":"কত","translit":"koto","translation":"how much / how many","category":"Common","unit":"u4","ex_n":"এটা কত?","ex_t":"How much is this?"},
        {"lemma":"কোথায়","translit":"kothay","translation":"where","category":"Common","unit":"u1","ex_n":"টয়লেট কোথায়?","ex_t":"Where is the toilet?"},
        {"lemma":"কি","translit":"ki","translation":"what","category":"Common","unit":"u1","ex_n":"এটা কি?","ex_t":"What is this?"},
        {"lemma":"পানি","translit":"pani","translation":"water","category":"Food","unit":"u5","ex_n":"আমার পানি দরকার","ex_t":"I need water"},
        {"lemma":"বুঝি না","translit":"bujhi na","translation":"I don't understand","category":"Common","unit":"u1","ex_n":"আমি বুঝি না","ex_t":"I don't understand"},
        {"lemma":"চাই","translit":"chai","translation":"to want","category":"Verbs","unit":"u7","ex_n":"আমি চা চাই","ex_t":"I want tea"},
        {"lemma":"আবার","translit":"abar","translation":"again","category":"Common","unit":"u1","ex_n":"আবার বলুন","ex_t":"Please say it again"},
        {"lemma":"একটু","translit":"ektu","translation":"a little","category":"Common","unit":"u4","ex_n":"একটু পানি","ex_t":"A little water"},
        {"lemma":"এখন","translit":"ekhon","translation":"now","category":"Time","unit":"u8","ex_n":"এখনই","ex_t":"Right now"},
        {"lemma":"আজ","translit":"aaj","translation":"today","category":"Time","unit":"u8","ex_n":"আজ গরম","ex_t":"Today is hot"},
        {"lemma":"ভালো","translit":"bhalo","translation":"good","category":"Common","unit":"u1","ex_n":"খুব ভালো","ex_t":"Very good"},
        {"lemma":"ক্ষুধার্ত","translit":"khudharto","translation":"hungry","category":"Feelings","unit":"u2","ex_n":"আমি ক্ষুধার্ত","ex_t":"I am hungry"},
        {"lemma":"বেশি","translit":"beshi","translation":"more, a lot","category":"Common","unit":"u4","ex_n":"একটু বেশি","ex_t":"A little more"},
        {"lemma":"কম","translit":"kom","translation":"less","category":"Common","unit":"u4","ex_n":"একটু কম","ex_t":"A little less"},
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
            "id": f"{code}_{n:04d}", "unit": unit, "lemma": e["lemma"],
            "translit": e.get("translit", ""), "translation": e["translation"],
            "category": e["category"], "difficulty": e.get("difficulty", 2),
            "frequencyRank": e.get("frequencyRank", 50 + n),
            "examples": [{"native": e["ex_n"], "translation": e["ex_t"]}],
        })
        existing.add(e["lemma"]); added += 1; n += 1
    pack["categories"] = sorted(cats)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(pack, f, ensure_ascii=False, indent=2)
    return added


if __name__ == "__main__":
    print("v41 vocab expansion — pcm, id, bn (web-verified conversational)\n")
    total = 0
    for code in ["pcm", "id", "bn"]:
        a = expand(code); total += a
        print(f"  {code}: +{a} words")
    print(f"\n✓ added {total} words across 3 languages")
