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
      "--glass": "rgba(255,255,255,0.78)",
      "--raised": "#ffffff",
      "--raised-soft": "rgba(255,255,255,0.7)",
      "--border": "#e8dfca",
      "--text": "#1d1a14",
      "--text-dim": "#6b6356",
      "--text-mute": "#655f52",
      "--accent-text": "#a55a05",
      // v80 — THESE WERE NEVER THEMED, AND THE DARK THEME WAS UNUSABLE.
      //
      // --ink is used 82 times across the app and --root 14, and no theme
      // overrode either — so both kept their :root value, a deep navy and a
      // warm brown chosen for the cream palette. On Dark that put near-black
      // text on a near-black background: measured at 1.2:1 against a required
      // 4.5:1, which is invisible, not merely low. Anyone who picked the Dark
      // theme got an app they could not read, and nothing said so.
      "--ink": "#232b3d",
      // The fill of a primary button, and the text that sits on it. Kept
      // separate from --ink because a dark theme needs a LIGHT button with
      // DARK text, which is the exact opposite of what --ink must be there.
      "--ink-solid": "#232b3d",
      "--ink-on": "#ffffff",
      "--root": "#6f5540",
      "--miss": "#9a4708",
      "--primary": "#2f7d4f",
      "--on-primary": "#ffffff",
      "--primary-text": "#2e794d",
      "--primary-dark": "#1d5635",
      "--primary-soft": "#eaf3ec",
      "--accent": "#d97706",
      "--accent-soft": "#fef3c7",
      "--danger": "#c0392b",
      "--danger-text": "#a5281b",
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
      "--glass": "rgba(30,35,50,0.82)",
      "--raised": "#1e2332",
      "--raised-soft": "rgba(30,35,50,0.7)",
      "--border": "#2a3148",
      "--text": "#f1f3f8",
      "--text-dim": "#9aa3b8",
      "--text-mute": "#949aac",
      "--accent-text": "#fbbf24",
      // Inverted for a dark ground: 11.6:1 and 7.8:1 respectively.
      "--ink": "#dfe5f2",
      "--ink-solid": "#dfe5f2",
      "--ink-on": "#0b0d12",
      "--root": "#d9b79a",
      "--miss": "#f59e0b",
      "--primary": "#22c55e",
      // Bright green: white on it is 2.28:1. Dark text on it is 8.9:1.
      "--on-primary": "#0b0d12",
      "--primary-text": "#22c55e",
      "--primary-dark": "#15803d",
      "--primary-soft": "rgba(34,197,94,0.12)",
      "--accent": "#fbbf24",
      "--accent-soft": "rgba(251,191,36,0.12)",
      "--danger": "#ef4444",
      "--danger-text": "#f87171",
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
      "--glass": "rgba(255,255,255,0.80)",
      "--raised": "#ffffff",
      "--raised-soft": "rgba(255,255,255,0.72)",
      "--border": "#bdd7e7",
      "--text": "#0c2233",
      "--text-dim": "#456678",
      "--text-mute": "#4e6270",
      "--accent-text": "#9b580a",
      "--ink": "#0c2233",
      "--ink-solid": "#0c2233",
      "--ink-on": "#ffffff",
      "--root": "#6b5340",
      "--miss": "#a04a08",
      "--primary": "#0e6e8c",
      "--on-primary": "#ffffff",
      "--primary-text": "#0e6e8c",
      "--primary-dark": "#075066",
      "--primary-soft": "#dceaf3",
      "--accent": "#e8830f",
      "--accent-soft": "#fdebd2",
      "--danger": "#c0392b",
      "--danger-text": "#a5281b",
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
