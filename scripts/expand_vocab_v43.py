#!/usr/bin/env python3
"""
v43 vocabulary expansion — Japanese, Korean, Mandarin.

Focus: web-verified CONVERSATIONAL PHRASES — the "more complex stuff": polite
requests, survival questions, and multi-word expressions a learner needs to
actually navigate a conversation. These three languages hadn't had an
expansion batch yet (v40 did ar/hi/es/pa, v41 did pcm/id/bn).

Verification notes (web-checked this session, not generated blind):
  - Japanese: Preply, Migaku, AsianLanguageSchool, StoryLearning beginner
    phrase lists. Polite (desu/masu) register throughout.
  - Korean: Fluent in 3 Months, 90DayKorean, Migaku, AsianLanguageSchool.
    Standard polite (-yo) register.
  - Mandarin: Mandarin Blueprint, ChineseForUs, YoyoChinese, JustLearn.
    Simplified characters + pinyin with tone marks.

Deduped by lemma at merge. Run: python3 scripts/expand_vocab_v43.py
"""

import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG_DIR = os.path.join(ROOT, "src", "data", "languages")

def safe_unit(code, desired):
    existing = {
        "ja": {f"u{i}" for i in range(1, 12)},
        "ko": {f"u{i}" for i in range(1, 14)},
        "zh": {f"u{i}" for i in range(1, 14)},
    }[code]
    return desired if desired in existing else "u2"


NEW = {
    # =========================================================================
    # JAPANESE — polite conversational phrases (web-verified)
    # =========================================================================
    "ja": [
        {"lemma":"すみません","translit":"sumimasen","translation":"excuse me / sorry","category":"Useful","unit":"u1","ex_n":"すみません、駅はどこですか","ex_t":"Excuse me, where is the station?"},
        {"lemma":"ごめんなさい","translit":"gomen nasai","translation":"I'm sorry (sincere)","category":"Useful","unit":"u1","ex_n":"ごめんなさい","ex_t":"I'm truly sorry"},
        {"lemma":"お願いします","translit":"onegaishimasu","translation":"please (request)","category":"Useful","unit":"u1","ex_n":"水をお願いします","ex_t":"Water, please"},
        {"lemma":"わかりません","translit":"wakarimasen","translation":"I don't understand","category":"Useful","unit":"u1","ex_n":"すみません、わかりません","ex_t":"Sorry, I don't understand"},
        {"lemma":"わかりました","translit":"wakarimashita","translation":"I understand / got it","category":"Useful","unit":"u1","ex_n":"はい、わかりました","ex_t":"Yes, understood"},
        {"lemma":"もう一度お願いします","translit":"mou ichido onegaishimasu","translation":"one more time, please","category":"Useful","unit":"u1","ex_n":"もう一度お願いします","ex_t":"Please say it one more time"},
        {"lemma":"いくらですか","translit":"ikura desu ka","translation":"how much is it?","category":"Travel","unit":"u9","ex_n":"これはいくらですか","ex_t":"How much is this?"},
        {"lemma":"トイレはどこですか","translit":"toire wa doko desu ka","translation":"where is the bathroom?","category":"Travel","unit":"u9","ex_n":"すみません、トイレはどこですか","ex_t":"Excuse me, where is the bathroom?"},
        {"lemma":"これは何ですか","translit":"kore wa nan desu ka","translation":"what is this?","category":"Useful","unit":"u1","ex_n":"これは何ですか","ex_t":"What is this?"},
        {"lemma":"これをください","translit":"kore o kudasai","translation":"this one, please","category":"Travel","unit":"u9","ex_n":"これをください","ex_t":"I'll take this one, please"},
        {"lemma":"ちょっと待ってください","translit":"chotto matte kudasai","translation":"please wait a moment","category":"Useful","unit":"u1","ex_n":"ちょっと待ってください","ex_t":"One moment, please"},
        {"lemma":"大丈夫です","translit":"daijoubu desu","translation":"it's okay / I'm fine","category":"Useful","unit":"u1","ex_n":"大丈夫です、ありがとう","ex_t":"I'm fine, thanks"},
        {"lemma":"英語を話せますか","translit":"eigo o hanasemasu ka","translation":"do you speak English?","category":"Travel","unit":"u9","ex_n":"英語を話せますか","ex_t":"Can you speak English?"},
        {"lemma":"ゆっくり話してください","translit":"yukkuri hanashite kudasai","translation":"please speak slowly","category":"Useful","unit":"u1","ex_n":"ゆっくり話してください","ex_t":"Please speak slowly"},
        {"lemma":"助けてください","translit":"tasukete kudasai","translation":"please help","category":"Useful","unit":"u1","ex_n":"助けてください","ex_t":"Please help me"},
        {"lemma":"元気ですか","translit":"genki desu ka","translation":"how are you?","category":"Greetings","unit":"u1","ex_n":"元気ですか — 元気です","ex_t":"How are you? — I'm fine"},
    ],

    # =========================================================================
    # KOREAN — polite conversational phrases (web-verified)
    # =========================================================================
    "ko": [
        {"lemma":"주세요","translit":"juseyo","translation":"please (give me)","category":"Useful","unit":"u1","ex_n":"물 주세요","ex_t":"Water, please"},
        {"lemma":"미안해요","translit":"mianhaeyo","translation":"I'm sorry","category":"Useful","unit":"u1","ex_n":"늦어서 미안해요","ex_t":"Sorry I'm late"},
        {"lemma":"몰라요","translit":"mollayo","translation":"I don't know","category":"Useful","unit":"u1","ex_n":"저는 몰라요","ex_t":"I don't know"},
        {"lemma":"알아요","translit":"arayo","translation":"I know","category":"Useful","unit":"u1","ex_n":"네, 알아요","ex_t":"Yes, I know"},
        {"lemma":"얼마예요","translit":"eolmayeyo","translation":"how much is it?","category":"Travel","unit":"u9","ex_n":"이거 얼마예요?","ex_t":"How much is this?"},
        {"lemma":"어디예요","translit":"eodiyeyo","translation":"where is it?","category":"Travel","unit":"u9","ex_n":"화장실 어디예요?","ex_t":"Where is the bathroom?"},
        {"lemma":"도와주세요","translit":"dowajuseyo","translation":"please help me","category":"Useful","unit":"u1","ex_n":"도와주세요!","ex_t":"Please help me!"},
        {"lemma":"저기요","translit":"jeogiyo","translation":"excuse me (attention)","category":"Useful","unit":"u1","ex_n":"저기요, 메뉴 주세요","ex_t":"Excuse me, menu please"},
        {"lemma":"괜찮아요","translit":"gwaenchanayo","translation":"it's okay / I'm fine","category":"Useful","unit":"u1","ex_n":"괜찮아요, 감사합니다","ex_t":"I'm fine, thank you"},
        {"lemma":"이거 주세요","translit":"igeo juseyo","translation":"this one, please","category":"Travel","unit":"u9","ex_n":"이거 주세요","ex_t":"I'll take this one, please"},
        {"lemma":"천만에요","translit":"cheonmaneyo","translation":"you're welcome","category":"Greetings","unit":"u1","ex_n":"— 감사합니다. — 천만에요","ex_t":"— Thank you. — You're welcome"},
        {"lemma":"뭐예요","translit":"mwoyeyo","translation":"what is it?","category":"Useful","unit":"u1","ex_n":"이게 뭐예요?","ex_t":"What is this?"},
        {"lemma":"영어 할 수 있어요","translit":"yeongeo hal su isseoyo","translation":"can you speak English?","category":"Travel","unit":"u9","ex_n":"영어 할 수 있어요?","ex_t":"Can you speak English?"},
        {"lemma":"잠깐만요","translit":"jamkkanmanyo","translation":"just a moment","category":"Useful","unit":"u1","ex_n":"잠깐만요","ex_t":"One moment, please"},
    ],

    # =========================================================================
    # MANDARIN — conversational phrases, simplified + pinyin (web-verified)
    # =========================================================================
    "zh": [
        {"lemma":"请","translit":"qǐng","translation":"please","category":"Useful","unit":"u1","ex_n":"请坐","ex_t":"Please sit"},
        {"lemma":"请问","translit":"qǐngwèn","translation":"excuse me (may I ask)","category":"Useful","unit":"u1","ex_n":"请问，洗手间在哪里？","ex_t":"Excuse me, where is the bathroom?"},
        {"lemma":"多少钱","translit":"duōshao qián","translation":"how much is it?","category":"Travel","unit":"u9","ex_n":"这个多少钱？","ex_t":"How much is this?"},
        {"lemma":"在哪里","translit":"zài nǎlǐ","translation":"where is...?","category":"Travel","unit":"u9","ex_n":"车站在哪里？","ex_t":"Where is the station?"},
        {"lemma":"洗手间","translit":"xǐshǒujiān","translation":"bathroom, restroom","category":"Places","unit":"u9","ex_n":"洗手间在哪里？","ex_t":"Where is the bathroom?"},
        {"lemma":"听不懂","translit":"tīng bù dǒng","translation":"I don't understand (hearing)","category":"Useful","unit":"u1","ex_n":"对不起，我听不懂","ex_t":"Sorry, I don't understand"},
        {"lemma":"没关系","translit":"méi guānxi","translation":"it's okay / no problem","category":"Useful","unit":"u1","ex_n":"没关系","ex_t":"It's okay"},
        {"lemma":"再说一遍","translit":"zài shuō yí biàn","translation":"say it again","category":"Useful","unit":"u1","ex_n":"请再说一遍","ex_t":"Please say it again"},
        {"lemma":"请慢点儿说","translit":"qǐng màn diǎnr shuō","translation":"please speak slowly","category":"Useful","unit":"u1","ex_n":"请慢点儿说","ex_t":"Please speak a bit more slowly"},
        {"lemma":"便宜一点","translit":"piányi yìdiǎn","translation":"cheaper, please","category":"Travel","unit":"u9","ex_n":"可以便宜一点吗？","ex_t":"Can you make it cheaper?"},
        {"lemma":"我要这个","translit":"wǒ yào zhège","translation":"I want this one","category":"Travel","unit":"u9","ex_n":"我要这个，谢谢","ex_t":"I'll take this one, thanks"},
        {"lemma":"你会说英文吗","translit":"nǐ huì shuō yīngwén ma","translation":"do you speak English?","category":"Travel","unit":"u9","ex_n":"你会说英文吗？","ex_t":"Do you speak English?"},
        {"lemma":"请帮我","translit":"qǐng bāng wǒ","translation":"please help me","category":"Useful","unit":"u1","ex_n":"请帮我一下","ex_t":"Please help me a moment"},
        {"lemma":"这是什么","translit":"zhè shì shénme","translation":"what is this?","category":"Useful","unit":"u1","ex_n":"这是什么？","ex_t":"What is this?"},
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
    print("v43 vocab expansion — ja, ko, zh (web-verified conversational phrases)\n")
    total = 0
    for code in ["ja", "ko", "zh"]:
        a = expand(code); total += a
        print(f"  {code}: +{a} words")
    print(f"\n✓ added {total} words across 3 languages")
