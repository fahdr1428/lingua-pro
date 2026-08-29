// =============================================================================
// Tiny shared UI primitives — buttons, progress bar, top bar, bottom nav.
// All styled inline so the project has zero CSS-framework dependencies.
// =============================================================================

import React, { useState, useEffect } from "react";
import { LANGUAGES, listLanguages } from "../data/registry.js";

// v69 (ui-ux-pro-max premium pass): brought the shared Button in line with the
// "luxury is restraint" language already established by .btn-premium on Home —
// ink-black primary, no shouty uppercase, soft layered shadow instead of a hard
// 4px offset. This cascades to every screen still using the old loud style
// (Onboarding, Settings, Upgrade, Letters, Profile) without touching Lesson.jsx's
// bespoke exercise UI, which has its own carefully-tuned feedback colors.
export function Button({ children, variant = "primary", style, ...rest }) {
  const base = {
    border: "none",
    borderRadius: 16,
    padding: "15px 22px",
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: 0.1,
    cursor: "pointer",
    width: "100%",
    transition: "transform 150ms var(--ease-smooth, ease), box-shadow 200ms var(--ease-smooth, ease), filter 200ms var(--ease-smooth, ease)",
  };
  const variants = {
    primary: {
      background: "var(--ink-solid)",
      color: "var(--ink-on)",
      boxShadow: "0 2px 0 #161d2c, 0 8px 20px rgba(35,43,61,0.22)",
    },
    secondary: {
      background: "var(--surface)",
      color: "var(--text)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-card)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      boxShadow: "0 3px 0 #991b1b",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-dim)",
      padding: "10px 16px",
      fontSize: 14,
    },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} {...rest}>{children}</button>;
}

export function ProgressBar({ value, max, color = "var(--primary)", height = 12 }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  // v96: the fill is full width and slid into place rather than grown.
  // Animating `width` runs layout on every frame; translating is composited.
  // Translation also keeps the rounded right-hand cap its proper shape, which
  // a scaleX would squash flat.
  return (
    <div
      className="bar-track"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      style={{ width: "100%", height, background: "var(--surface-hi)", borderRadius: 999 }}
    >
      <div
        className="bar-fill"
        style={{ background: color, borderRadius: 999, transform: `translateX(${pct - 100}%)` }}
      />
    </div>
  );
}

export function Card({ children, style, className = "", ...rest }) {
  return (
    <div
      className={`card-lift glass ${className}`.trim()}
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: 20,
        marginBottom: 16,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}


// v61 (ui-ux-pro-max skill): real SVG icons — emoji-as-icons is a core
// anti-pattern (inconsistent cross-platform rendering, no color control).
const ic = (paths, size = 20) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    dangerouslySetInnerHTML={{ __html: paths }} />
);
export const ICONS = {
  flame: ic('<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>', 16),
  gem: ic('<path d="M6 3h12l4 6-10 13L2 9Z"/><path d="M11 3 8 9l4 13 4-13-3-6"/><path d="M2 9h20"/>', 16),
  heart: ic('<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', 16),
  sprout: ic('<path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/>'),
  grid: ic('<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>'),
  mic: ic('<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>'),
  user: ic('<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  flag: ic('<path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>'),
  zap: ic('<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"/>', 16),
};

export function TopBar({ streak, gems, hearts, totalXp, premium, currentLang, onPickLanguage }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const lang = currentLang ? LANGUAGES[currentLang] : null;
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10,
        padding: "14px 16px",
        background: "var(--bg-alt)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flexShrink: 1 }}>
        {/* v40: visible, tappable language switcher — one tap to change language */}
        {lang && onPickLanguage && (
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="Switch language"
            style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "var(--surface-hi)", border: "1px solid var(--border)",
              borderRadius: 999, padding: "5px 9px 5px 7px", cursor: "pointer",
              fontWeight: 800, fontSize: 13, color: "var(--text)",
              flexShrink: 1, minWidth: 0, whiteSpace: "nowrap",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>{lang.flag}</span>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 84 }}>{lang.name}</span>
            <span style={{ fontSize: 9, opacity: 0.6, flexShrink: 0 }}>▼</span>
          </button>
        )}
        {/* v85: the four counters read as one group.
            XP used to be pinned to the FAR RIGHT of the bar, separated from the
            other three by the entire width of the screen — on a 1920px display
            that is a metre of empty space between "hearts" and "XP", and it read
            as an unrelated widget rather than as the fourth of four stats.
            It sits with the others now, and last within them, because a
            lifetime total is the least urgent thing on this bar. */}
        <Stat icon={ICONS.flame} value={streak} />
        <Stat icon={ICONS.gem} value={gems} color="var(--accent-text)" />
        <Stat icon={ICONS.heart} value={premium ? "∞" : hearts} color="var(--danger)" />
        <span className="topbar-div" aria-hidden="true" />
        <Stat icon={ICONS.zap} value={totalXp} color="var(--text-mute)" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* Zaban brand mark — present on every screen */}
        <img src="/mark-64.webp" alt="Zaban" width="24" height="24" style={{ height: 24, width: 24, objectFit: "contain", opacity: 0.95, flexShrink: 0 }} />
      </div>

      {pickerOpen && (
        <LanguagePickerModal
          currentLang={currentLang}
          onPick={(code) => { setPickerOpen(false); if (code !== currentLang) onPickLanguage(code); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

// v40: quick language-switch modal. Lists all languages; tap to switch
// instantly (progress per language is preserved). Closes on backdrop tap.
function LanguagePickerModal({ currentLang, onPick, onClose }) {
  const langs = listLanguages();

  // v94 — the modal could be opened by keyboard and then not closed by one.
  // It had a labelled ✕ button, but no Escape and no dialog semantics, so a
  // screen reader announced it as an anonymous group of buttons with no way
  // out except tabbing to find the ✕.
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { e.preventDefault(); onClose(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    // The backdrop closes on click, which is a mouse convenience — it must NOT
    // be a tab stop, and it must NOT be aria-hidden either: the dialog is its
    // child, so hiding it would hide the whole modal from a screen reader.
    // Escape is the keyboard equivalent; the ✕ button inside is the visible one.
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 200, display: "flex", alignItems: "flex-start",
        justifyContent: "center", paddingTop: "10vh",
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-picker-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", borderRadius: 20, padding: 20,
          width: "min(420px, 90vw)", maxHeight: "75vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 id="language-picker-title" style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Choose a language</h2>
          <button onClick={onClose} aria-label="Close" style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "var(--text-dim)" }}>✕</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {langs.map((l) => {
            const code = l.code || l.id;
            const isCurrent = code === currentLang;
            return (
              <button
                key={code}
                onClick={() => onPick(code)}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  background: isCurrent ? "var(--primary-dark)" : "var(--surface)",
                  border: `2px solid ${isCurrent ? "var(--primary)" : "var(--border)"}`,
                  borderRadius: 12, padding: "12px 14px", cursor: "pointer",
                  color: isCurrent ? "#fff" : "var(--text)", textAlign: "left",
                }}
              >
                <span style={{ fontSize: 26 }}>{l.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>{l.name}</div>
                  {l.nativeName && <div style={{ fontSize: 13, opacity: 0.7 }}>{l.nativeName}</div>}
                </div>
                {isCurrent && <span style={{ fontSize: 13, fontWeight: 700 }}>✓ Current</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, value, color = "var(--text)" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 15, fontWeight: 800, color, flexShrink: 0, whiteSpace: "nowrap" }}>
      <span style={{ display: "flex", flexShrink: 0 }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}


// v66 — desktop side rail. Shown only at >=1024px (CSS), replacing the bottom
// nav, which is a phone pattern. Uses the same item list as BottomNav so the
// two can't drift apart.
export function SideRail({ screen, onNavigate, streak = 0, totalXp = 0 }) {
  // v85: two groups rather than five flat items. The first three are places you
  // go to DO something; the last two are places you go to SEE something. Five
  // undifferentiated entries make you read all five labels every time, and the
  // separation costs a hairline and one word.
  //
  // Kept to five. A navigation rail is one of the few places in an app where the
  // right instinct is to resist adding to it.
  const groups = [
    {
      label: "Learn",
      items: [
        { id: "home", icon: ICONS.sprout, label: "Learn" },
        { id: "hub", icon: ICONS.grid, label: "Practice" },
        { id: "speak", icon: ICONS.mic, label: "Speak" },
      ],
    },
    {
      label: "Progress",
      items: [
        { id: "missions", icon: ICONS.flag, label: "Missions" },
        { id: "profile", icon: ICONS.user, label: "Profile" },
      ],
    },
  ];
  const active = screen === "home" ? "home" : screen;
  return (
    <nav className="side-rail" aria-label="Main">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 20px" }}>
        <img src="/mark-64.webp" alt="" width="22" height="22" style={{ width: 22, height: 22, objectFit: "contain" }} />
        <span className="brand-serif" style={{ fontSize: 17, color: "var(--ink)" }}>zaban</span>
      </div>
      {groups.map((g) => (
        <div key={g.label} className="rail-group">
          <div className="rail-group-head">{g.label}</div>
          {g.items.map((it) => (
            <button
              key={it.id}
              className="side-rail-item"
              aria-current={active === it.id ? "page" : undefined}
              onClick={() => onNavigate(it.id)}
            >
              {it.icon}
              {it.label}
            </button>
          ))}
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", gap: 16, padding: "14px 12px 0" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{streak}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>day streak</div>
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 800, color: "var(--ink)" }}>{totalXp}</div>
          <div style={{ fontSize: 10.5, color: "var(--text-mute)" }}>xp</div>
        </div>
      </div>
    </nav>
  );
}

export function BottomNav({ screen, onNavigate }) {
  // v57: mobile-first nav — Learn | Practice | Speak | Profile.
  // Words moved inside the Practice hub; Settings moved inside Profile.
  const items = [
    { id: "home", icon: ICONS.sprout, label: "Learn" },
    { id: "hub", icon: ICONS.grid, label: "Practice" },
    { id: "speak", icon: ICONS.mic, label: "Speak" },
    { id: "missions", icon: ICONS.flag, label: "Missions" },
    { id: "profile", icon: ICONS.user, label: "Profile" },
  ];
  return (
    <div
      className="bottom-nav"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--bg-alt)",
        borderTop: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-around",
        padding: "12px 0 calc(12px + env(safe-area-inset-bottom))",
        zIndex: 50,
      }}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            background: "transparent",
            border: "none",
            color: screen === item.id ? "var(--primary-text)" : "var(--text-mute)",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            padding: "4px 12px",
          }}
        >
          <span style={{ fontSize: 22 }}>{item.icon}</span>
          {item.label}
        </button>
      ))}
    </div>
  );
}

// v85: the width lives in CSS, not in an inline style.
//
// This used to set `maxWidth: 720` inline. An inline style beats any stylesheet
// rule, so `.home-container { max-width: 1020px }` — written deliberately, with
// a comment explaining the two-column desktop layout it was for — never once
// applied. The desktop home had been silently capped at 720px since the rule
// was added, and nothing looked broken enough to notice.
//
// The `style` prop still spreads last, so a caller that genuinely needs an
// inline override keeps working.
export function Container({ children, style, className = "" }) {
  return (
    <div className={`app-container ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
