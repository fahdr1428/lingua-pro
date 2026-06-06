// =============================================================================
// THEMES — three palettes, applied via CSS custom properties on document root.
// Adding a new theme = add an entry to THEMES below + an option in Settings UI.
// =============================================================================

export const THEMES = {
  cream: {
    name: "Cream",
    emoji: "☕",
    description: "Warm, minimalist, easy on the eyes",
    vars: {
      "--bg": "#fbf7f0",
      "--bg-alt": "#f5efe2",
      "--surface": "#ffffff",
      "--surface-hi": "#f7f1e3",
      "--border": "#e8dfca",
      "--text": "#1d1a14",
      "--text-dim": "#6b6356",
      "--text-mute": "#a89e89",
      "--primary": "#2f7d4f",
      "--primary-dark": "#1d5635",
      "--primary-soft": "#eaf3ec",
      "--accent": "#d97706",
      "--accent-soft": "#fef3c7",
      "--danger": "#c0392b",
      "--blue": "#2b6cb0",
      "--purple": "#7c3aed",
      "--pink": "#d6336c",
    },
    colorScheme: "light",
  },

  dark: {
    name: "Dark",
    emoji: "🌙",
    description: "Easy on the eyes at night",
    vars: {
      "--bg": "#0b0d12",
      "--bg-alt": "#11141d",
      "--surface": "#181c28",
      "--surface-hi": "#232839",
      "--border": "#2a3148",
      "--text": "#f1f3f8",
      "--text-dim": "#9aa3b8",
      "--text-mute": "#5e667e",
      "--primary": "#22c55e",
      "--primary-dark": "#15803d",
      "--primary-soft": "rgba(34,197,94,0.12)",
      "--accent": "#fbbf24",
      "--accent-soft": "rgba(251,191,36,0.12)",
      "--danger": "#ef4444",
      "--blue": "#3b82f6",
      "--purple": "#a855f7",
      "--pink": "#ec4899",
    },
    colorScheme: "dark",
  },

  ocean: {
    name: "Ocean",
    emoji: "🌊",
    description: "Calm, focused, deep blue",
    vars: {
      "--bg": "#f0f7fb",
      "--bg-alt": "#e1eef6",
      "--surface": "#ffffff",
      "--surface-hi": "#dceaf3",
      "--border": "#bdd7e7",
      "--text": "#0c2233",
      "--text-dim": "#456678",
      "--text-mute": "#7993a4",
      "--primary": "#0e6e8c",
      "--primary-dark": "#075066",
      "--primary-soft": "#dceaf3",
      "--accent": "#e8830f",
      "--accent-soft": "#fdebd2",
      "--danger": "#c0392b",
      "--blue": "#1d6fcc",
      "--purple": "#6645b8",
      "--pink": "#d6336c",
    },
    colorScheme: "light",
  },
};

/** Apply a theme by injecting CSS variables onto :root. */
export function applyTheme(themeKey) {
  if (typeof document === "undefined") return;
  const theme = THEMES[themeKey] || THEMES.cream;
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  root.style.colorScheme = theme.colorScheme;
}
