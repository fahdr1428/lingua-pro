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
        <Stat icon="🔥" value={streak} />
        <Stat icon="💎" value={gems} color="var(--accent)" />
        <Stat icon="❤️" value={premium ? "∞" : hearts} color="var(--danger)" />
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

export function BottomNav({ screen, onNavigate }) {
  // v57: mobile-first nav — Learn | Practice | Speak | Profile.
  // Words moved inside the Practice hub; Settings moved inside Profile.
  const items = [
    { id: "home", icon: "🌱", label: "Learn" },
    { id: "hub", icon: "🧩", label: "Practice" },
    { id: "practice", icon: "🗣️", label: "Speak" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];
  return (
    <div
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

export function Container({ children, style }) {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "20px 16px", paddingBottom: 100, ...style }}>
      {children}
    </div>
  );
}
