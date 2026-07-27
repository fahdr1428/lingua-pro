// =============================================================================
// Tiny shared UI primitives — buttons, progress bar, top bar, bottom nav.
// All styled inline so the project has zero CSS-framework dependencies.
// =============================================================================

import React, { useState } from "react";
import { LANGUAGES, listLanguages } from "../data/registry.js";

export function Button({ children, variant = "primary", style, ...rest }) {
  const base = {
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontSize: 16,
    fontWeight: 800,
    cursor: "pointer",
    width: "100%",
    transition: "transform 0.1s, background 0.2s",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  };
  const variants = {
    primary: {
      background: "var(--primary)",
      color: "#fff",
      boxShadow: "0 4px 0 var(--primary-dark)",
    },
    secondary: {
      background: "var(--surface-hi)",
      color: "var(--text)",
      border: "2px solid var(--border)",
    },
    danger: {
      background: "var(--danger)",
      color: "#fff",
      boxShadow: "0 4px 0 #991b1b",
    },
    ghost: {
      background: "transparent",
      color: "var(--text-dim)",
      padding: "10px 16px",
      fontSize: 14,
      letterSpacing: 0,
      textTransform: "none",
    },
  };
  return <button style={{ ...base, ...variants[variant], ...style }} {...rest}>{children}</button>;
}

export function ProgressBar({ value, max, color = "var(--primary)", height = 12 }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0);
  return (
    <div style={{ width: "100%", height, background: "var(--surface-hi)", borderRadius: 999, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 450ms cubic-bezier(0.16, 1, 0.3, 1)" }} />
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
        padding: "16px 20px",
        background: "var(--bg-alt)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* v40: visible, tappable language switcher — one tap to change language */}
        {lang && onPickLanguage && (
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="Switch language"
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "var(--surface-hi)", border: "1px solid var(--border)",
              borderRadius: 999, padding: "5px 10px 5px 8px", cursor: "pointer",
              fontWeight: 800, fontSize: 14, color: "var(--text)",
            }}
          >
            <span style={{ fontSize: 18 }}>{lang.flag}</span>
            <span>{lang.name}</span>
            <span style={{ fontSize: 10, opacity: 0.6 }}>▼</span>
          </button>
        )}
        <Stat icon={ICONS.flame} value={streak} />
        <Stat icon={ICONS.gem} value={gems} color="var(--accent)" />
        <Stat icon={ICONS.heart} value={premium ? "∞" : hearts} color="var(--danger)" />
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>⚡ {totalXp}</div>
        {/* Zaban brand mark — present on every screen */}
        <img src="/zaban-mark-transparent.png" alt="Zaban" style={{ height: 28, width: 28, objectFit: "contain", opacity: 0.95 }} />
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
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
        zIndex: 200, display: "flex", alignItems: "flex-start",
        justifyContent: "center", paddingTop: "10vh",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--bg)", borderRadius: 20, padding: 20,
          width: "min(420px, 90vw)", maxHeight: "75vh", overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Choose a language</h2>
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
    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 18, fontWeight: 800, color }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{value}</span>
    </div>
  );
}


// v66 — desktop side rail. Shown only at >=1024px (CSS), replacing the bottom
// nav, which is a phone pattern. Uses the same item list as BottomNav so the
// two can't drift apart.
export function SideRail({ screen, onNavigate, streak = 0, totalXp = 0 }) {
  const items = [
    { id: "home", icon: ICONS.sprout, label: "Learn" },
    { id: "hub", icon: ICONS.grid, label: "Practice" },
    { id: "practice", icon: ICONS.mic, label: "Speak" },
    { id: "profile", icon: ICONS.user, label: "Profile" },
  ];
  const active = screen === "home" ? "home" : screen;
  return (
    <nav className="side-rail" aria-label="Main">
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 12px 20px" }}>
        <img src="/zaban-mark-transparent.png" alt="" style={{ width: 22, height: 22, objectFit: "contain" }} />
        <span className="brand-serif" style={{ fontSize: 17, color: "var(--ink)" }}>zaban</span>
      </div>
      {items.map((it) => (
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
    { id: "practice", icon: ICONS.mic, label: "Speak" },
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
            color: screen === item.id ? "var(--primary)" : "var(--text-mute)",
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

export function Container({ children, style, className = "" }) {
  return (
    <div className={className} style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px", paddingBottom: 100, ...style }}>
      {children}
    </div>
  );
}
