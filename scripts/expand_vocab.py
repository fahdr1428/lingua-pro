#!/usr/bin/env python3
"""
v34a — vocab expansion script.

Adds ~22 high-frequency common words per language, focusing on:
  - Common verbs (know, think, say, give, take, need, want, like, see, hear)
  - Body parts (head, eye, hand, foot, heart, hair)
  - Colors (the basics)
  - Weather (hot, cold, rain, sun, wind)
  - Time (morning, night, week, month, year, hour)
  - Direction (here, there, up, down, left, right)
  - Question words (when, why, who)
  - Daily life (sleep, wake, work, buy)
  - Connectors (and, but, or, because)

Each entry is hand-checked. Sources used:
  - Wiktionary for transliteration sanity
  - Standard textbook conventions for example sentences
  - Web-verified where uncertain (Korean honorifics, Arabic verb forms,
    Bengali script, Punjabi Shahmukhi, Indonesian collocations)

Structure: NEW_WORDS[code] = [
    {
      "concept": "head",        # English concept (used to build the translation)
      "lemma": "...",           # native script word
      "translit": "...",        # romanization (omit for Latin-script languages)
      "translation": "head",    # English meaning (usually = concept, but can be richer)
      "category": "Body",       # vocab category
      "unit": "u3",             # which unit to put it in
      "example_native": "...",
      "example_translation": "...",
    },
    ...
]

Then run: python3 scripts/expand_vocab.py
It merges into the JSON files, deduping by lemma so re-runs are safe.
"""

import json
import os
import sys

# Resolve project root regardless of where the script is run from
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LANG_DIR = os.path.join(ROOT, "src", "data", "languages")

# Unit hints by category — used when an entry doesn't specify a unit explicitly.
# Most languages have u1-u11 or u1-u13 with a similar layout, so this works for all.
DEFAULT_UNIT_BY_CATEGORY = {
    "Greetings": "u1",
    "People": "u2",
    "Family": "u3",
    "Numbers": "u4",
    "Food": "u5",
    "Verbs": "u7",   # verbs unit
    "Body": "u2",    # often pairs with People in beginner curricula
    "Colors": "u2",
    "Weather": "u8",
    "Common": "u2",
    "Time": "u8",
    "Places": "u9",
    "Direction": "u9",
    "Connectors": "u10",
    "Travel": "u9",
}

# =============================================================================
# NEW WORDS — 22 per language, focused on highest-frequency common vocabulary
# =============================================================================

NEW_WORDS = {
    # -------------------------------------------------------------------------
    # SPANISH — high confidence
    # -------------------------------------------------------------------------
    "es": [
        # Common verbs that were missing
        {"lemma": "Saber", "translit": "sa-BER", "translation": "to know (a fact)", "category": "Verbs", "example_native": "Yo sé la respuesta", "example_translation": "I know the answer"},
        {"lemma": "Pensar", "translit": "pen-SAR", "translation": "to think", "category": "Verbs", "example_native": "Pienso en ti", "example_translation": "I think of you"},
        {"lemma": "Decir", "translit": "de-THEER", "translation": "to say", "category": "Verbs", "example_native": "Dice la verdad", "example_translation": "He says the truth"},
        {"lemma": "Dar", "translit": "dar", "translation": "to give", "category": "Verbs", "example_native": "Te doy el libro", "example_translation": "I give you the book"},
        {"lemma": "Tomar", "translit": "to-MAR", "translation": "to take", "category": "Verbs", "example_native": "Tomo café", "example_translation": "I take/drink coffee"},
        {"lemma": "Necesitar", "translit": "ne-the-si-TAR", "translation": "to need", "category": "Verbs", "example_native": "Necesito agua", "example_translation": "I need water"},
        {"lemma": "Gustar", "translit": "gus-TAR", "translation": "to like (be pleasing)", "category": "Verbs", "example_native": "Me gusta el café", "example_translation": "I like coffee"},
        {"lemma": "Oír", "translit": "o-EER", "translation": "to hear", "category": "Verbs", "example_native": "Oigo música", "example_translation": "I hear music"},
        # Body
        {"lemma": "Cabeza", "translit": "ka-BE-tha", "translation": "head", "category": "Body", "example_native": "Me duele la cabeza", "example_translation": "My head hurts"},
        {"lemma": "Mano", "translit": "MA-no", "translation": "hand", "category": "Body", "example_native": "Dame la mano", "example_translation": "Give me your hand"},
        {"lemma": "Corazón", "translit": "ko-ra-THON", "translation": "heart", "category": "Body", "example_native": "Mi corazón", "example_translation": "My heart"},
        # Colors
        {"lemma": "Negro", "translit": "NE-gro", "translation": "black", "category": "Colors", "example_native": "Café negro", "example_translation": "Black coffee"},
        {"lemma": "Blanco", "translit": "BLAN-ko", "translation": "white", "category": "Colors", "example_native": "Pan blanco", "example_translation": "White bread"},
        {"lemma": "Amarillo", "translit": "a-ma-REE-yo", "translation": "yellow", "category": "Colors", "example_native": "El sol amarillo", "example_translation": "The yellow sun"},
        # Weather
        {"lemma": "Sol", "translit": "sol", "translation": "sun", "category": "Weather", "example_native": "Hace sol", "example_translation": "It's sunny"},
        {"lemma": "Lluvia", "translit": "YU-via", "translation": "rain", "category": "Weather", "example_native": "Mucha lluvia", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "Año", "translit": "AHN-yo", "translation": "year", "category": "Time", "example_native": "Este año", "example_translation": "This year"},
        {"lemma": "Semana", "translit": "se-MA-na", "translation": "week", "category": "Time", "example_native": "Esta semana", "example_translation": "This week"},
        {"lemma": "Hora", "translit": "O-ra", "translation": "hour", "category": "Time", "example_native": "Una hora", "example_translation": "One hour"},
        # Question words
        {"lemma": "Cuándo", "translit": "KWAN-do", "translation": "when", "category": "Common", "example_native": "¿Cuándo vienes?", "example_translation": "When are you coming?"},
        {"lemma": "Por qué", "translit": "por KE", "translation": "why", "category": "Common", "example_native": "¿Por qué no?", "example_translation": "Why not?"},
        {"lemma": "Quién", "translit": "kee-EN", "translation": "who", "category": "Common", "example_native": "¿Quién es?", "example_translation": "Who is it?"},
    ],

    # -------------------------------------------------------------------------
    # FRENCH — high confidence
    # -------------------------------------------------------------------------
    "fr": [
        # Common verbs
        {"lemma": "Savoir", "translit": "sa-VWAR", "translation": "to know (a fact)", "category": "Verbs", "example_native": "Je sais la réponse", "example_translation": "I know the answer"},
        {"lemma": "Penser", "translit": "pahn-SAY", "translation": "to think", "category": "Verbs", "example_native": "Je pense à toi", "example_translation": "I think of you"},
        {"lemma": "Dire", "translit": "deer", "translation": "to say", "category": "Verbs", "example_native": "Il dit la vérité", "example_translation": "He tells the truth"},
        {"lemma": "Donner", "translit": "do-NAY", "translation": "to give", "category": "Verbs", "example_native": "Je te donne le livre", "example_translation": "I give you the book"},
        {"lemma": "Prendre", "translit": "PRAHN-dr", "translation": "to take", "category": "Verbs", "example_native": "Je prends un café", "example_translation": "I take a coffee"},
        {"lemma": "Aimer", "translit": "ay-MAY", "translation": "to like, to love", "category": "Verbs", "example_native": "J'aime le café", "example_translation": "I like coffee"},
        {"lemma": "Entendre", "translit": "ahn-TAHN-dr", "translation": "to hear", "category": "Verbs", "example_native": "J'entends la musique", "example_translation": "I hear music"},
        {"lemma": "Comprendre", "translit": "kom-PRAHN-dr", "translation": "to understand", "category": "Verbs", "example_native": "Je comprends", "example_translation": "I understand"},
        # Body
        {"lemma": "Tête", "translit": "tet", "translation": "head", "category": "Body", "example_native": "Ma tête", "example_translation": "My head"},
        {"lemma": "Main", "translit": "man", "translation": "hand", "category": "Body", "example_native": "Donne-moi la main", "example_translation": "Give me your hand"},
        {"lemma": "Cœur", "translit": "kur", "translation": "heart", "category": "Body", "example_native": "Mon cœur", "example_translation": "My heart"},
        # Colors
        {"lemma": "Noir", "translit": "nwar", "translation": "black", "category": "Colors", "example_native": "Café noir", "example_translation": "Black coffee"},
        {"lemma": "Blanc", "translit": "blahn", "translation": "white", "category": "Colors", "example_native": "Pain blanc", "example_translation": "White bread"},
        {"lemma": "Jaune", "translit": "zhohn", "translation": "yellow", "category": "Colors", "example_native": "Le soleil jaune", "example_translation": "The yellow sun"},
        # Weather
        {"lemma": "Soleil", "translit": "so-LAY", "translation": "sun", "category": "Weather", "example_native": "Il y a du soleil", "example_translation": "It's sunny"},
        {"lemma": "Pluie", "translit": "PLOO-ee", "translation": "rain", "category": "Weather", "example_native": "Beaucoup de pluie", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "Année", "translit": "ah-NAY", "translation": "year", "category": "Time", "example_native": "Cette année", "example_translation": "This year"},
        {"lemma": "Semaine", "translit": "suh-MEN", "translation": "week", "category": "Time", "example_native": "Cette semaine", "example_translation": "This week"},
        {"lemma": "Heure", "translit": "ur", "translation": "hour", "category": "Time", "example_native": "Une heure", "example_translation": "One hour"},
        # Question words
        {"lemma": "Quand", "translit": "kahn", "translation": "when", "category": "Common", "example_native": "Quand viens-tu ?", "example_translation": "When are you coming?"},
        {"lemma": "Pourquoi", "translit": "poor-KWA", "translation": "why", "category": "Common", "example_native": "Pourquoi pas ?", "example_translation": "Why not?"},
        {"lemma": "Qui", "translit": "kee", "translation": "who", "category": "Common", "example_native": "Qui est-ce ?", "example_translation": "Who is it?"},
    ],

    # -------------------------------------------------------------------------
    # URDU — high confidence (Pakistani heritage, well-documented script)
    # -------------------------------------------------------------------------
    "ur": [
        {"lemma": "جاننا", "translit": "jaan-na", "translation": "to know", "category": "Verbs", "example_native": "میں جانتا ہوں", "example_translation": "I know"},
        {"lemma": "سوچنا", "translit": "soch-na", "translation": "to think", "category": "Verbs", "example_native": "میں سوچتا ہوں", "example_translation": "I think"},
        {"lemma": "کہنا", "translit": "kehna", "translation": "to say", "category": "Verbs", "example_native": "وہ کہتا ہے", "example_translation": "He says"},
        {"lemma": "دینا", "translit": "dena", "translation": "to give", "category": "Verbs", "example_native": "مجھے دو", "example_translation": "Give me"},
        {"lemma": "لینا", "translit": "lena", "translation": "to take", "category": "Verbs", "example_native": "یہ لو", "example_translation": "Take this"},
        {"lemma": "دیکھنا", "translit": "dekhna", "translation": "to see", "category": "Verbs", "example_native": "میں دیکھ رہا ہوں", "example_translation": "I am looking"},
        {"lemma": "سننا", "translit": "sun-na", "translation": "to listen, hear", "category": "Verbs", "example_native": "سنو", "example_translation": "Listen"},
        # Body
        {"lemma": "سر", "translit": "sar", "translation": "head", "category": "Body", "example_native": "میرا سر", "example_translation": "My head"},
        {"lemma": "ہاتھ", "translit": "haath", "translation": "hand", "category": "Body", "example_native": "میرا ہاتھ", "example_translation": "My hand"},
        {"lemma": "دل", "translit": "dil", "translation": "heart", "category": "Body", "example_native": "میرا دل", "example_translation": "My heart"},
        # Colors
        {"lemma": "سیاہ", "translit": "siyaah", "translation": "black", "category": "Colors", "example_native": "سیاہ چائے", "example_translation": "Black tea"},
        {"lemma": "سفید", "translit": "safed", "translation": "white", "category": "Colors", "example_native": "سفید کاغذ", "example_translation": "White paper"},
        {"lemma": "پیلا", "translit": "peela", "translation": "yellow", "category": "Colors", "example_native": "پیلا پھول", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "دھوپ", "translit": "dhoop", "translation": "sunlight", "category": "Weather", "example_native": "تیز دھوپ", "example_translation": "Strong sunlight"},
        {"lemma": "بارش", "translit": "baarish", "translation": "rain", "category": "Weather", "example_native": "بہت بارش", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "سال", "translit": "saal", "translation": "year", "category": "Time", "example_native": "اس سال", "example_translation": "This year"},
        {"lemma": "ہفتہ", "translit": "hafta", "translation": "week", "category": "Time", "example_native": "اس ہفتے", "example_translation": "This week"},
        {"lemma": "گھنٹہ", "translit": "ghanta", "translation": "hour", "category": "Time", "example_native": "ایک گھنٹہ", "example_translation": "One hour"},
        # Question words
        {"lemma": "کب", "translit": "kab", "translation": "when", "category": "Common", "example_native": "کب آؤ گے؟", "example_translation": "When will you come?"},
        {"lemma": "کیوں", "translit": "kyun", "translation": "why", "category": "Common", "example_native": "کیوں نہیں؟", "example_translation": "Why not?"},
        {"lemma": "کون", "translit": "kaun", "translation": "who", "category": "Common", "example_native": "کون ہے؟", "example_translation": "Who is it?"},
        # Daily
        {"lemma": "سونا", "translit": "sona", "translation": "to sleep", "category": "Verbs", "example_native": "میں سو رہا ہوں", "example_translation": "I am sleeping"},
    ],

    # -------------------------------------------------------------------------
    # HINDI — parallel to Urdu where possible
    # -------------------------------------------------------------------------
    "hi": [
        {"lemma": "जानना", "translit": "jaan-na", "translation": "to know", "category": "Verbs", "example_native": "मैं जानता हूँ", "example_translation": "I know"},
        {"lemma": "सोचना", "translit": "soch-na", "translation": "to think", "category": "Verbs", "example_native": "मैं सोचता हूँ", "example_translation": "I think"},
        {"lemma": "कहना", "translit": "kehna", "translation": "to say", "category": "Verbs", "example_native": "वह कहता है", "example_translation": "He says"},
        {"lemma": "देना", "translit": "dena", "translation": "to give", "category": "Verbs", "example_native": "मुझे दो", "example_translation": "Give me"},
        {"lemma": "लेना", "translit": "lena", "translation": "to take", "category": "Verbs", "example_native": "यह लो", "example_translation": "Take this"},
        {"lemma": "देखना", "translit": "dekhna", "translation": "to see", "category": "Verbs", "example_native": "मैं देख रहा हूँ", "example_translation": "I am looking"},
        {"lemma": "सुनना", "translit": "sun-na", "translation": "to listen, hear", "category": "Verbs", "example_native": "सुनो", "example_translation": "Listen"},
        # Body
        {"lemma": "सिर", "translit": "sir", "translation": "head", "category": "Body", "example_native": "मेरा सिर", "example_translation": "My head"},
        {"lemma": "हाथ", "translit": "haath", "translation": "hand", "category": "Body", "example_native": "मेरा हाथ", "example_translation": "My hand"},
        {"lemma": "दिल", "translit": "dil", "translation": "heart", "category": "Body", "example_native": "मेरा दिल", "example_translation": "My heart"},
        # Colors
        {"lemma": "काला", "translit": "kaala", "translation": "black", "category": "Colors", "example_native": "काली चाय", "example_translation": "Black tea"},
        {"lemma": "सफ़ेद", "translit": "safed", "translation": "white", "category": "Colors", "example_native": "सफ़ेद कागज़", "example_translation": "White paper"},
        {"lemma": "पीला", "translit": "peela", "translation": "yellow", "category": "Colors", "example_native": "पीला फूल", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "धूप", "translit": "dhoop", "translation": "sunlight", "category": "Weather", "example_native": "तेज़ धूप", "example_translation": "Strong sunlight"},
        {"lemma": "बारिश", "translit": "baarish", "translation": "rain", "category": "Weather", "example_native": "बहुत बारिश", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "साल", "translit": "saal", "translation": "year", "category": "Time", "example_native": "इस साल", "example_translation": "This year"},
        {"lemma": "हफ़्ता", "translit": "hafta", "translation": "week", "category": "Time", "example_native": "इस हफ़्ते", "example_translation": "This week"},
        {"lemma": "घंटा", "translit": "ghanta", "translation": "hour", "category": "Time", "example_native": "एक घंटा", "example_translation": "One hour"},
        # Question words
        {"lemma": "कब", "translit": "kab", "translation": "when", "category": "Common", "example_native": "कब आओगे?", "example_translation": "When will you come?"},
        {"lemma": "क्यों", "translit": "kyun", "translation": "why", "category": "Common", "example_native": "क्यों नहीं?", "example_translation": "Why not?"},
        {"lemma": "कौन", "translit": "kaun", "translation": "who", "category": "Common", "example_native": "कौन है?", "example_translation": "Who is it?"},
        {"lemma": "सोना", "translit": "sona", "translation": "to sleep", "category": "Verbs", "example_native": "मैं सो रहा हूँ", "example_translation": "I am sleeping"},
    ],

    # -------------------------------------------------------------------------
    # ARABIC (MSA) — medium-high confidence
    # Dictionary forms are 3rd-masc-singular present (web-verified earlier)
    # -------------------------------------------------------------------------
    "ar": [
        {"lemma": "يعرف", "translit": "ya'rif", "translation": "to know", "category": "Verbs", "example_native": "أعرف", "example_translation": "I know"},
        {"lemma": "يفكر", "translit": "yufakkir", "translation": "to think", "category": "Verbs", "example_native": "أفكر فيك", "example_translation": "I think of you"},
        {"lemma": "يقول", "translit": "yaqool", "translation": "to say", "category": "Verbs", "example_native": "يقول الحقيقة", "example_translation": "He says the truth"},
        {"lemma": "يعطي", "translit": "yu'ti", "translation": "to give", "category": "Verbs", "example_native": "يعطيني الكتاب", "example_translation": "He gives me the book"},
        {"lemma": "يأخذ", "translit": "ya'khudh", "translation": "to take", "category": "Verbs", "example_native": "آخذ القهوة", "example_translation": "I take coffee"},
        {"lemma": "يرى", "translit": "yaraa", "translation": "to see", "category": "Verbs", "example_native": "أرى البيت", "example_translation": "I see the house"},
        {"lemma": "يسمع", "translit": "yasma'", "translation": "to hear", "category": "Verbs", "example_native": "أسمع الموسيقى", "example_translation": "I hear music"},
        # Body
        {"lemma": "رأس", "translit": "ra's", "translation": "head", "category": "Body", "example_native": "رأسي", "example_translation": "My head"},
        {"lemma": "يد", "translit": "yad", "translation": "hand", "category": "Body", "example_native": "يدي", "example_translation": "My hand"},
        {"lemma": "قلب", "translit": "qalb", "translation": "heart", "category": "Body", "example_native": "قلبي", "example_translation": "My heart"},
        # Colors
        {"lemma": "أسود", "translit": "aswad", "translation": "black", "category": "Colors", "example_native": "قهوة سوداء", "example_translation": "Black coffee"},
        {"lemma": "أبيض", "translit": "abyad", "translation": "white", "category": "Colors", "example_native": "خبز أبيض", "example_translation": "White bread"},
        {"lemma": "أصفر", "translit": "asfar", "translation": "yellow", "category": "Colors", "example_native": "الشمس صفراء", "example_translation": "The sun is yellow"},
        # Weather
        {"lemma": "شمس", "translit": "shams", "translation": "sun", "category": "Weather", "example_native": "الشمس مشرقة", "example_translation": "The sun is bright"},
        {"lemma": "مطر", "translit": "matar", "translation": "rain", "category": "Weather", "example_native": "كثير من المطر", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "سنة", "translit": "sana", "translation": "year", "category": "Time", "example_native": "هذه السنة", "example_translation": "This year"},
        {"lemma": "أسبوع", "translit": "usbu'", "translation": "week", "category": "Time", "example_native": "هذا الأسبوع", "example_translation": "This week"},
        {"lemma": "ساعة", "translit": "saa'a", "translation": "hour", "category": "Time", "example_native": "ساعة واحدة", "example_translation": "One hour"},
        # Question words
        {"lemma": "متى", "translit": "mataa", "translation": "when", "category": "Common", "example_native": "متى تأتي؟", "example_translation": "When are you coming?"},
        {"lemma": "لماذا", "translit": "limaadhaa", "translation": "why", "category": "Common", "example_native": "لماذا لا؟", "example_translation": "Why not?"},
        {"lemma": "من", "translit": "man", "translation": "who", "category": "Common", "example_native": "من هذا؟", "example_translation": "Who is this?"},
        {"lemma": "أين", "translit": "ayna", "translation": "where", "category": "Common", "example_native": "أين البيت؟", "example_translation": "Where is the house?"},
        {"lemma": "ينام", "translit": "yanaam", "translation": "to sleep", "category": "Verbs", "example_native": "أنام", "example_translation": "I sleep"},
    ],

    # -------------------------------------------------------------------------
    # MANDARIN — high confidence (verbs never conjugate)
    # -------------------------------------------------------------------------
    "zh": [
        {"lemma": "知道", "translit": "zhīdào", "translation": "to know (a fact)", "category": "Verbs", "example_native": "我知道", "example_translation": "I know"},
        {"lemma": "想", "translit": "xiǎng", "translation": "to think, want", "category": "Verbs", "example_native": "我想你", "example_translation": "I miss/think of you"},
        {"lemma": "给", "translit": "gěi", "translation": "to give", "category": "Verbs", "example_native": "给我", "example_translation": "Give me"},
        {"lemma": "拿", "translit": "ná", "translation": "to take, hold", "category": "Verbs", "example_native": "拿这个", "example_translation": "Take this"},
        {"lemma": "听", "translit": "tīng", "translation": "to listen, hear", "category": "Verbs", "example_native": "听音乐", "example_translation": "Listen to music"},
        {"lemma": "需要", "translit": "xūyào", "translation": "to need", "category": "Verbs", "example_native": "我需要水", "example_translation": "I need water"},
        {"lemma": "喜欢", "translit": "xǐhuān", "translation": "to like", "category": "Verbs", "example_native": "我喜欢咖啡", "example_translation": "I like coffee"},
        # Body
        {"lemma": "头", "translit": "tóu", "translation": "head", "category": "Body", "example_native": "我的头", "example_translation": "My head"},
        {"lemma": "手", "translit": "shǒu", "translation": "hand", "category": "Body", "example_native": "我的手", "example_translation": "My hand"},
        {"lemma": "心", "translit": "xīn", "translation": "heart", "category": "Body", "example_native": "我的心", "example_translation": "My heart"},
        # Colors
        {"lemma": "黑", "translit": "hēi", "translation": "black", "category": "Colors", "example_native": "黑咖啡", "example_translation": "Black coffee"},
        {"lemma": "白", "translit": "bái", "translation": "white", "category": "Colors", "example_native": "白米饭", "example_translation": "White rice"},
        {"lemma": "黄", "translit": "huáng", "translation": "yellow", "category": "Colors", "example_native": "黄色的太阳", "example_translation": "The yellow sun"},
        # Weather
        {"lemma": "太阳", "translit": "tàiyáng", "translation": "sun", "category": "Weather", "example_native": "大太阳", "example_translation": "Big sun"},
        {"lemma": "雨", "translit": "yǔ", "translation": "rain", "category": "Weather", "example_native": "下大雨", "example_translation": "Heavy rain"},
        # Time
        {"lemma": "年", "translit": "nián", "translation": "year", "category": "Time", "example_native": "今年", "example_translation": "This year"},
        {"lemma": "星期", "translit": "xīngqī", "translation": "week", "category": "Time", "example_native": "这个星期", "example_translation": "This week"},
        {"lemma": "小时", "translit": "xiǎoshí", "translation": "hour", "category": "Time", "example_native": "一个小时", "example_translation": "One hour"},
        # Question words
        {"lemma": "什么时候", "translit": "shénme shíhou", "translation": "when", "category": "Common", "example_native": "什么时候来？", "example_translation": "When are you coming?"},
        {"lemma": "为什么", "translit": "wèishénme", "translation": "why", "category": "Common", "example_native": "为什么不？", "example_translation": "Why not?"},
        {"lemma": "谁", "translit": "shéi", "translation": "who", "category": "Common", "example_native": "谁是？", "example_translation": "Who is it?"},
        {"lemma": "睡觉", "translit": "shuìjiào", "translation": "to sleep", "category": "Verbs", "example_native": "我要睡觉", "example_translation": "I want to sleep"},
    ],

    # -------------------------------------------------------------------------
    # JAPANESE — medium-high (polite -masu forms; dictionary forms ambiguous,
    # so I use the polite ending consistently for verbs)
    # -------------------------------------------------------------------------
    "ja": [
        {"lemma": "知る", "translit": "shiru", "translation": "to know", "category": "Verbs", "example_native": "知っています", "example_translation": "I know"},
        {"lemma": "思う", "translit": "omou", "translation": "to think", "category": "Verbs", "example_native": "そう思います", "example_translation": "I think so"},
        {"lemma": "言う", "translit": "iu", "translation": "to say", "category": "Verbs", "example_native": "彼が言います", "example_translation": "He says"},
        {"lemma": "あげる", "translit": "ageru", "translation": "to give", "category": "Verbs", "example_native": "あげます", "example_translation": "I give"},
        {"lemma": "聞く", "translit": "kiku", "translation": "to listen, hear", "category": "Verbs", "example_native": "音楽を聞きます", "example_translation": "I listen to music"},
        # Body
        {"lemma": "頭", "translit": "atama", "translation": "head", "category": "Body", "example_native": "私の頭", "example_translation": "My head"},
        {"lemma": "手", "translit": "te", "translation": "hand", "category": "Body", "example_native": "私の手", "example_translation": "My hand"},
        {"lemma": "心", "translit": "kokoro", "translation": "heart, mind", "category": "Body", "example_native": "私の心", "example_translation": "My heart"},
        # Colors
        {"lemma": "黒い", "translit": "kuroi", "translation": "black", "category": "Colors", "example_native": "黒いコーヒー", "example_translation": "Black coffee"},
        {"lemma": "白い", "translit": "shiroi", "translation": "white", "category": "Colors", "example_native": "白いパン", "example_translation": "White bread"},
        {"lemma": "黄色い", "translit": "kiiroi", "translation": "yellow", "category": "Colors", "example_native": "黄色い花", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "太陽", "translit": "taiyou", "translation": "sun", "category": "Weather", "example_native": "明るい太陽", "example_translation": "Bright sun"},
        {"lemma": "雨", "translit": "ame", "translation": "rain", "category": "Weather", "example_native": "雨が降ります", "example_translation": "It's raining"},
        # Time
        {"lemma": "年", "translit": "toshi", "translation": "year", "category": "Time", "example_native": "今年", "example_translation": "This year"},
        {"lemma": "週", "translit": "shuu", "translation": "week", "category": "Time", "example_native": "今週", "example_translation": "This week"},
        {"lemma": "時間", "translit": "jikan", "translation": "hour, time", "category": "Time", "example_native": "一時間", "example_translation": "One hour"},
        # Question words
        {"lemma": "いつ", "translit": "itsu", "translation": "when", "category": "Common", "example_native": "いつ来ますか", "example_translation": "When are you coming?"},
        {"lemma": "なぜ", "translit": "naze", "translation": "why", "category": "Common", "example_native": "なぜですか", "example_translation": "Why?"},
        {"lemma": "誰", "translit": "dare", "translation": "who", "category": "Common", "example_native": "誰ですか", "example_translation": "Who is it?"},
        {"lemma": "どこ", "translit": "doko", "translation": "where", "category": "Common", "example_native": "どこですか", "example_translation": "Where is it?"},
        # Daily
        {"lemma": "寝る", "translit": "neru", "translation": "to sleep", "category": "Verbs", "example_native": "寝ます", "example_translation": "I sleep"},
        {"lemma": "起きる", "translit": "okiru", "translation": "to wake up", "category": "Verbs", "example_native": "起きます", "example_translation": "I wake up"},
        {"lemma": "買う", "translit": "kau", "translation": "to buy", "category": "Verbs", "example_native": "本を買います", "example_translation": "I buy a book"},
    ],

    # -------------------------------------------------------------------------
    # KOREAN — medium confidence (polite -yo form consistently)
    # -------------------------------------------------------------------------
    "ko": [
        {"lemma": "알다", "translit": "alda", "translation": "to know", "category": "Verbs", "example_native": "저는 알아요", "example_translation": "I know"},
        {"lemma": "생각하다", "translit": "saenggakhada", "translation": "to think", "category": "Verbs", "example_native": "저는 생각해요", "example_translation": "I think"},
        {"lemma": "말하다", "translit": "malhada", "translation": "to say, speak", "category": "Verbs", "example_native": "그가 말해요", "example_translation": "He speaks"},
        {"lemma": "주다", "translit": "juda", "translation": "to give", "category": "Verbs", "example_native": "주세요", "example_translation": "Please give (me)"},
        {"lemma": "받다", "translit": "batda", "translation": "to receive, take", "category": "Verbs", "example_native": "이것을 받아요", "example_translation": "I take this"},
        {"lemma": "듣다", "translit": "deutda", "translation": "to listen, hear", "category": "Verbs", "example_native": "음악을 들어요", "example_translation": "I listen to music"},
        {"lemma": "필요하다", "translit": "piryohada", "translation": "to need", "category": "Verbs", "example_native": "물이 필요해요", "example_translation": "I need water"},
        # Body
        {"lemma": "머리", "translit": "meori", "translation": "head, hair", "category": "Body", "example_native": "제 머리", "example_translation": "My head"},
        {"lemma": "손", "translit": "son", "translation": "hand", "category": "Body", "example_native": "제 손", "example_translation": "My hand"},
        {"lemma": "마음", "translit": "ma-eum", "translation": "heart, mind", "category": "Body", "example_native": "제 마음", "example_translation": "My heart"},
        # Colors
        {"lemma": "검정", "translit": "geomjeong", "translation": "black", "category": "Colors", "example_native": "검정 커피", "example_translation": "Black coffee"},
        {"lemma": "하양", "translit": "hayang", "translation": "white", "category": "Colors", "example_native": "하양 빵", "example_translation": "White bread"},
        {"lemma": "노랑", "translit": "norang", "translation": "yellow", "category": "Colors", "example_native": "노랑 꽃", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "해", "translit": "hae", "translation": "sun", "category": "Weather", "example_native": "밝은 해", "example_translation": "Bright sun"},
        {"lemma": "비", "translit": "bi", "translation": "rain", "category": "Weather", "example_native": "비가 와요", "example_translation": "It's raining"},
        # Time
        {"lemma": "년", "translit": "nyeon", "translation": "year", "category": "Time", "example_native": "올해", "example_translation": "This year"},
        {"lemma": "주", "translit": "ju", "translation": "week", "category": "Time", "example_native": "이번 주", "example_translation": "This week"},
        # Question words
        {"lemma": "언제", "translit": "eonje", "translation": "when", "category": "Common", "example_native": "언제 와요?", "example_translation": "When are you coming?"},
        {"lemma": "왜", "translit": "wae", "translation": "why", "category": "Common", "example_native": "왜 안 와요?", "example_translation": "Why aren't you coming?"},
        {"lemma": "누구", "translit": "nugu", "translation": "who", "category": "Common", "example_native": "누구예요?", "example_translation": "Who is it?"},
        # Daily
        {"lemma": "자다", "translit": "jada", "translation": "to sleep", "category": "Verbs", "example_native": "저는 자요", "example_translation": "I sleep"},
        {"lemma": "사다", "translit": "sada", "translation": "to buy", "category": "Verbs", "example_native": "책을 사요", "example_translation": "I buy a book"},
    ],

    # -------------------------------------------------------------------------
    # BENGALI — medium confidence (would benefit from native review)
    # -------------------------------------------------------------------------
    "bn": [
        {"lemma": "জানা", "translit": "jana", "translation": "to know", "category": "Verbs", "example_native": "আমি জানি", "example_translation": "I know"},
        {"lemma": "ভাবা", "translit": "bhaba", "translation": "to think", "category": "Verbs", "example_native": "আমি ভাবি", "example_translation": "I think"},
        {"lemma": "বলা", "translit": "bola", "translation": "to say", "category": "Verbs", "example_native": "সে বলে", "example_translation": "He says"},
        {"lemma": "দেওয়া", "translit": "deoya", "translation": "to give", "category": "Verbs", "example_native": "আমাকে দাও", "example_translation": "Give me"},
        {"lemma": "নেওয়া", "translit": "neoya", "translation": "to take", "category": "Verbs", "example_native": "এটা নাও", "example_translation": "Take this"},
        {"lemma": "দেখা", "translit": "dekha", "translation": "to see", "category": "Verbs", "example_native": "আমি দেখি", "example_translation": "I see"},
        {"lemma": "শোনা", "translit": "shona", "translation": "to listen, hear", "category": "Verbs", "example_native": "শোনো", "example_translation": "Listen"},
        # Body
        {"lemma": "মাথা", "translit": "matha", "translation": "head", "category": "Body", "example_native": "আমার মাথা", "example_translation": "My head"},
        {"lemma": "হাত", "translit": "hat", "translation": "hand", "category": "Body", "example_native": "আমার হাত", "example_translation": "My hand"},
        {"lemma": "মন", "translit": "mon", "translation": "heart, mind", "category": "Body", "example_native": "আমার মন", "example_translation": "My heart"},
        # Colors
        {"lemma": "কালো", "translit": "kalo", "translation": "black", "category": "Colors", "example_native": "কালো চা", "example_translation": "Black tea"},
        {"lemma": "সাদা", "translit": "sada", "translation": "white", "category": "Colors", "example_native": "সাদা কাগজ", "example_translation": "White paper"},
        {"lemma": "হলুদ", "translit": "holud", "translation": "yellow", "category": "Colors", "example_native": "হলুদ ফুল", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "সূর্য", "translit": "shurjo", "translation": "sun", "category": "Weather", "example_native": "উজ্জ্বল সূর্য", "example_translation": "Bright sun"},
        {"lemma": "বৃষ্টি", "translit": "brishti", "translation": "rain", "category": "Weather", "example_native": "অনেক বৃষ্টি", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "বছর", "translit": "bochor", "translation": "year", "category": "Time", "example_native": "এই বছর", "example_translation": "This year"},
        {"lemma": "সপ্তাহ", "translit": "shoptaho", "translation": "week", "category": "Time", "example_native": "এই সপ্তাহ", "example_translation": "This week"},
        # Question words
        {"lemma": "কখন", "translit": "kokhon", "translation": "when", "category": "Common", "example_native": "কখন আসবে?", "example_translation": "When will you come?"},
        {"lemma": "কেন", "translit": "keno", "translation": "why", "category": "Common", "example_native": "কেন না?", "example_translation": "Why not?"},
        {"lemma": "কে", "translit": "ke", "translation": "who", "category": "Common", "example_native": "কে এটা?", "example_translation": "Who is it?"},
        {"lemma": "কোথায়", "translit": "kothay", "translation": "where", "category": "Common", "example_native": "কোথায় আছ?", "example_translation": "Where are you?"},
        # Daily
        {"lemma": "ঘুমানো", "translit": "ghumano", "translation": "to sleep", "category": "Verbs", "example_native": "আমি ঘুমাই", "example_translation": "I sleep"},
    ],

    # -------------------------------------------------------------------------
    # PUNJABI (SHAHMUKHI) — parallels Urdu where possible
    # -------------------------------------------------------------------------
    "pa": [
        {"lemma": "جاننا", "translit": "jaan-na", "translation": "to know", "category": "Verbs", "example_native": "میں جانناں آں", "example_translation": "I know"},
        {"lemma": "سوچنا", "translit": "soch-na", "translation": "to think", "category": "Verbs", "example_native": "میں سوچناں آں", "example_translation": "I think"},
        {"lemma": "آکھنا", "translit": "aakh-na", "translation": "to say", "category": "Verbs", "example_native": "اوہ آکھدا اے", "example_translation": "He says"},
        {"lemma": "دینا", "translit": "dena", "translation": "to give", "category": "Verbs", "example_native": "مینوں دے", "example_translation": "Give me"},
        {"lemma": "لینا", "translit": "lena", "translation": "to take", "category": "Verbs", "example_native": "ایہہ لے", "example_translation": "Take this"},
        {"lemma": "ویکھنا", "translit": "vekh-na", "translation": "to see", "category": "Verbs", "example_native": "میں ویکھ رہیا آں", "example_translation": "I am watching"},
        {"lemma": "سننا", "translit": "sun-na", "translation": "to listen", "category": "Verbs", "example_native": "سن", "example_translation": "Listen"},
        # Body
        {"lemma": "سر", "translit": "sir", "translation": "head", "category": "Body", "example_native": "میرا سر", "example_translation": "My head"},
        {"lemma": "ہتھ", "translit": "hath", "translation": "hand", "category": "Body", "example_native": "میرا ہتھ", "example_translation": "My hand"},
        {"lemma": "دل", "translit": "dil", "translation": "heart", "category": "Body", "example_native": "میرا دل", "example_translation": "My heart"},
        # Colors
        {"lemma": "کالا", "translit": "kala", "translation": "black", "category": "Colors", "example_native": "کالی چاہ", "example_translation": "Black tea"},
        {"lemma": "چِٹا", "translit": "chitta", "translation": "white", "category": "Colors", "example_native": "چِٹا کاغذ", "example_translation": "White paper"},
        {"lemma": "پیلا", "translit": "peela", "translation": "yellow", "category": "Colors", "example_native": "پیلا پھل", "example_translation": "Yellow fruit"},
        # Weather
        {"lemma": "دھپ", "translit": "dhup", "translation": "sunlight", "category": "Weather", "example_native": "تیز دھپ", "example_translation": "Strong sunlight"},
        {"lemma": "مینہ", "translit": "menh", "translation": "rain", "category": "Weather", "example_native": "بہت مینہ", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "ورہا", "translit": "varha", "translation": "year", "category": "Time", "example_native": "ایہہ ورہا", "example_translation": "This year"},
        {"lemma": "ہفتہ", "translit": "hafta", "translation": "week", "category": "Time", "example_native": "ایہہ ہفتہ", "example_translation": "This week"},
        {"lemma": "گھنٹہ", "translit": "ghanta", "translation": "hour", "category": "Time", "example_native": "اک گھنٹہ", "example_translation": "One hour"},
        # Question words
        {"lemma": "کدوں", "translit": "kadon", "translation": "when", "category": "Common", "example_native": "کدوں آویں گا؟", "example_translation": "When will you come?"},
        {"lemma": "کیوں", "translit": "kyun", "translation": "why", "category": "Common", "example_native": "کیوں نہیں؟", "example_translation": "Why not?"},
        {"lemma": "کون", "translit": "kaun", "translation": "who", "category": "Common", "example_native": "کون اے؟", "example_translation": "Who is it?"},
        {"lemma": "سوناں", "translit": "sonan", "translation": "to sleep", "category": "Verbs", "example_native": "میں سوناں آں", "example_translation": "I sleep"},
    ],

    # -------------------------------------------------------------------------
    # INDONESIAN — high confidence (Latin script, no conjugation)
    # -------------------------------------------------------------------------
    "id": [
        {"lemma": "Tahu", "translit": "TAH-hoo", "translation": "to know (a fact)", "category": "Verbs", "example_native": "Saya tahu", "example_translation": "I know"},
        {"lemma": "Pikir", "translit": "PEE-kir", "translation": "to think", "category": "Verbs", "example_native": "Saya pikir begitu", "example_translation": "I think so"},
        {"lemma": "Bilang", "translit": "BEE-lahng", "translation": "to say", "category": "Verbs", "example_native": "Dia bilang", "example_translation": "He says"},
        {"lemma": "Beri", "translit": "buh-REE", "translation": "to give", "category": "Verbs", "example_native": "Beri saya", "example_translation": "Give me"},
        {"lemma": "Ambil", "translit": "AHM-beel", "translation": "to take", "category": "Verbs", "example_native": "Ambil ini", "example_translation": "Take this"},
        {"lemma": "Lihat", "translit": "LEE-hat", "translation": "to see, look", "category": "Verbs", "example_native": "Saya lihat", "example_translation": "I see"},
        {"lemma": "Dengar", "translit": "duh-NGAR", "translation": "to listen, hear", "category": "Verbs", "example_native": "Dengar musik", "example_translation": "Listen to music"},
        {"lemma": "Mau", "translit": "mow", "translation": "to want", "category": "Verbs", "example_native": "Saya mau air", "example_translation": "I want water"},
        {"lemma": "Suka", "translit": "SOO-kah", "translation": "to like", "category": "Verbs", "example_native": "Saya suka kopi", "example_translation": "I like coffee"},
        # Body
        {"lemma": "Kepala", "translit": "kuh-PAH-lah", "translation": "head", "category": "Body", "example_native": "Kepala saya", "example_translation": "My head"},
        {"lemma": "Tangan", "translit": "TAH-ngan", "translation": "hand", "category": "Body", "example_native": "Tangan saya", "example_translation": "My hand"},
        {"lemma": "Hati", "translit": "HAH-tee", "translation": "heart, liver", "category": "Body", "example_native": "Hati saya", "example_translation": "My heart"},
        # Colors
        {"lemma": "Hitam", "translit": "HEE-tahm", "translation": "black", "category": "Colors", "example_native": "Kopi hitam", "example_translation": "Black coffee"},
        {"lemma": "Putih", "translit": "POO-tih", "translation": "white", "category": "Colors", "example_native": "Roti putih", "example_translation": "White bread"},
        {"lemma": "Kuning", "translit": "KOO-ning", "translation": "yellow", "category": "Colors", "example_native": "Bunga kuning", "example_translation": "Yellow flower"},
        # Weather
        {"lemma": "Matahari", "translit": "ma-ta-HAH-ree", "translation": "sun", "category": "Weather", "example_native": "Matahari panas", "example_translation": "Hot sun"},
        {"lemma": "Hujan", "translit": "HOO-jan", "translation": "rain", "category": "Weather", "example_native": "Banyak hujan", "example_translation": "Lots of rain"},
        # Time
        {"lemma": "Tahun", "translit": "TAH-hoon", "translation": "year", "category": "Time", "example_native": "Tahun ini", "example_translation": "This year"},
        {"lemma": "Minggu", "translit": "MING-goo", "translation": "week", "category": "Time", "example_native": "Minggu ini", "example_translation": "This week"},
        {"lemma": "Jam", "translit": "jahm", "translation": "hour, clock", "category": "Time", "example_native": "Satu jam", "example_translation": "One hour"},
        # Question words
        {"lemma": "Kapan", "translit": "KAH-pan", "translation": "when", "category": "Common", "example_native": "Kapan datang?", "example_translation": "When are you coming?"},
        {"lemma": "Kenapa", "translit": "kuh-NAH-pah", "translation": "why", "category": "Common", "example_native": "Kenapa tidak?", "example_translation": "Why not?"},
        {"lemma": "Siapa", "translit": "see-AH-pah", "translation": "who", "category": "Common", "example_native": "Siapa ini?", "example_translation": "Who is this?"},
        {"lemma": "Tidur", "translit": "TEE-door", "translation": "to sleep", "category": "Verbs", "example_native": "Saya tidur", "example_translation": "I sleep"},
    ],

    # -------------------------------------------------------------------------
    # NIGERIAN PIDGIN — verbs barely change
    # -------------------------------------------------------------------------
    "pcm": [
        {"lemma": "Sabi", "translit": "SAH-bee", "translation": "to know, understand", "category": "Verbs", "example_native": "I sabi am", "example_translation": "I know him/her"},
        {"lemma": "Tink", "translit": "tink", "translation": "to think", "category": "Verbs", "example_native": "I tink so", "example_translation": "I think so"},
        {"lemma": "Talk", "translit": "tok", "translation": "to say, speak", "category": "Verbs", "example_native": "Im talk say...", "example_translation": "He said that..."},
        {"lemma": "Give", "translit": "giv", "translation": "to give", "category": "Verbs", "example_native": "Give me", "example_translation": "Give me"},
        {"lemma": "Take", "translit": "tek", "translation": "to take", "category": "Verbs", "example_native": "Take am", "example_translation": "Take it"},
        {"lemma": "See", "translit": "see", "translation": "to see", "category": "Verbs", "example_native": "I see am", "example_translation": "I see it"},
        {"lemma": "Hear", "translit": "ya", "translation": "to hear, listen", "category": "Verbs", "example_native": "I hear you", "example_translation": "I hear you"},
        {"lemma": "Like", "translit": "like", "translation": "to like", "category": "Verbs", "example_native": "I like am", "example_translation": "I like it"},
        # Body
        {"lemma": "Head", "translit": "hed", "translation": "head", "category": "Body", "example_native": "My head", "example_translation": "My head"},
        {"lemma": "Hand", "translit": "han", "translation": "hand", "category": "Body", "example_native": "My hand", "example_translation": "My hand"},
        {"lemma": "Belle", "translit": "beh-LEH", "translation": "belly, stomach", "category": "Body", "example_native": "My belle dey hurt", "example_translation": "My stomach hurts"},
        # Colors
        {"lemma": "Black", "translit": "blak", "translation": "black", "category": "Colors", "example_native": "Black coffee", "example_translation": "Black coffee"},
        {"lemma": "White", "translit": "wait", "translation": "white", "category": "Colors", "example_native": "White bread", "example_translation": "White bread"},
        # Weather
        {"lemma": "Sun", "translit": "son", "translation": "sun", "category": "Weather", "example_native": "Hot sun", "example_translation": "Hot sun"},
        {"lemma": "Rain", "translit": "rein", "translation": "rain", "category": "Weather", "example_native": "Rain dey fall", "example_translation": "It's raining"},
        # Time
        {"lemma": "Year", "translit": "yeer", "translation": "year", "category": "Time", "example_native": "Dis year", "example_translation": "This year"},
        {"lemma": "Week", "translit": "weik", "translation": "week", "category": "Time", "example_native": "Dis week", "example_translation": "This week"},
        # Question words
        {"lemma": "When", "translit": "wen", "translation": "when", "category": "Common", "example_native": "When you go come?", "example_translation": "When will you come?"},
        {"lemma": "Why", "translit": "wai", "translation": "why", "category": "Common", "example_native": "Why now?", "example_translation": "Why?"},
        {"lemma": "Who", "translit": "hu", "translation": "who", "category": "Common", "example_native": "Who be dat?", "example_translation": "Who is that?"},
        # Daily
        {"lemma": "Sleep", "translit": "sleep", "translation": "to sleep", "category": "Verbs", "example_native": "I wan sleep", "example_translation": "I want to sleep"},
        {"lemma": "Wake", "translit": "wek", "translation": "to wake up", "category": "Verbs", "example_native": "I just wake", "example_translation": "I just woke up"},
        {"lemma": "Buy", "translit": "bai", "translation": "to buy", "category": "Verbs", "example_native": "I wan buy am", "example_translation": "I want to buy it"},
    ],
}


# =============================================================================
# MERGE LOGIC
# =============================================================================

def expand_language(code):
    """Merge NEW_WORDS[code] into the language's JSON file. Dedupe by lemma."""
    path = os.path.join(LANG_DIR, f"{code}.json")
    if not os.path.exists(path):
        print(f"  ✗ {code}: file not found")
        return 0
    with open(path, "r", encoding="utf-8") as f:
        pack = json.load(f)

    existing_lemmas = {v["lemma"] for v in pack["vocab"]}
    existing_categories = set(pack.get("categories", []))
    existing_unit_ids = {u["id"] for u in pack.get("units", [])}

    # Next ID number
    max_n = max(int(v["id"].split("_")[1]) for v in pack["vocab"])
    next_n = max_n + 1

    added = 0
    new_cats = set()
    for entry in NEW_WORDS.get(code, []):
        if entry["lemma"] in existing_lemmas:
            continue  # already there — skip (re-runs are safe)

        # Decide which unit to assign
        unit = entry.get("unit") or DEFAULT_UNIT_BY_CATEGORY.get(entry["category"], "u2")
        if unit not in existing_unit_ids:
            # Fall back to a unit that DOES exist (u2 is in every pack)
            unit = "u2"

        # Add the category if it's new for this language
        if entry["category"] not in existing_categories:
            new_cats.add(entry["category"])
            existing_categories.add(entry["category"])

        new_vocab = {
            "id": f"{code}_{next_n:04d}",
            "unit": unit,
            "lemma": entry["lemma"],
            "translit": entry.get("translit", ""),
            "translation": entry["translation"],
            "category": entry["category"],
            "difficulty": entry.get("difficulty", 2),
            "frequencyRank": entry.get("frequencyRank", 100 + next_n),
            "examples": [{
                "native": entry["example_native"],
                "translation": entry["example_translation"],
            }],
        }
        pack["vocab"].append(new_vocab)
        existing_lemmas.add(entry["lemma"])
        added += 1
        next_n += 1

    # Update categories list
    if new_cats:
        pack["categories"] = sorted(existing_categories)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(pack, f, ensure_ascii=False, indent=2)

    return added


def main():
    print("v34a vocab expansion — merging new common words into language packs\n")
    total = 0
    for code in sorted(NEW_WORDS.keys()):
        added = expand_language(code)
        total += added
        print(f"  {code}: +{added} new words")
    print(f"\n✓ added {total} words total across {len(NEW_WORDS)} languages")


if __name__ == "__main__":
    main()
