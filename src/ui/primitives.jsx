// =============================================================================
// Tiny shared UI primitives — buttons, progress bar, top bar, bottom nav.
// All styled inline so the project has zero CSS-framework dependencies.
// =============================================================================

import React from "react";

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
      <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 999, transition: "width 0.4s ease" }} />
    </div>
  );
}

export function Card({ children, style, ...rest }) {
  return (
    <div
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

export function TopBar({ streak, gems, hearts, totalXp, premium }) {
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
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Stat icon="🔥" value={streak} />
        <Stat icon="💎" value={gems} color="var(--accent)" />
        <Stat icon="❤️" value={premium ? "∞" : hearts} color="var(--danger)" />
      </div>
      <div style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 700 }}>⚡ {totalXp} XP</div>
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
  const items = [
    { id: "home", icon: "🏠", label: "Learn" },
    { id: "vocab", icon: "📚", label: "Words" },
    { id: "profile", icon: "👤", label: "Profile" },
    { id: "settings", icon: "⚙️", label: "Settings" },
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
