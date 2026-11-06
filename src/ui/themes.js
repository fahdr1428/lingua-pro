// =============================================================================
// THEMES — three palettes, applied via CSS custom properties on document root.
// Adding a new theme = add an entry to THEMES below + an option in Settings UI.
//
// v115 — INK IS THE DEFAULT. The cream palette read as a friendly game, not as
// somewhere serious learning happens. Ink is a near-black with a green cast,
// ivory type, and ONE accent: a muted brass, used sparingly for what matters
// (the current step, a romanisation, a focus). Green stays only as "right",
// amber only as "look at this again". Paper (the old cream) and Ocean remain
// for anyone who prefers light; "dark" was the old dark palette and now maps
// to Ink (see resolveTheme).
// =============================================================================

export const THEMES = {
  ink: {
    name: "Ink",
    description: "Dark, quiet, made for concentration",
    vars: {
      "--bg": "#0d1211",
      "--bg-alt": "#111816",
      "--surface": "#151d1b",
      "--surface-hi": "#1c2522",
      "--glass": "rgba(17,24,22,0.86)",
      "--raised": "#18211e",
      "--raised-soft": "rgba(24,33,30,0.72)",
      "--border": "#26312d",
      "--text": "#ece6d8",
      "--text-dim": "#b3ac9d",
      "--text-mute": "#958f82",
      "--accent-text": "#d4b47a",
      "--ink": "#f2ecde",
      "--ink-solid": "#ece4d0",
      "--ink-on": "#0d1211",
      "--root": "#cbb08a",
      "--miss": "#d9a25e",
      "--on-miss": "#0d1211",
      "--primary": "#79b28f",
      "--on-primary": "#0d1211",
      "--primary-text": "#8fc3a2",
      "--primary-dark": "#2c5a42",
      "--on-primary-dark": "#f2ecde",
      "--primary-soft": "rgba(121,178,143,0.12)",
      "--accent": "#c4a167",
      "--accent-soft": "rgba(196,161,103,0.13)",
      "--danger": "#df6f5f",
      "--on-danger": "#0d1211",
      "--danger-text": "#ee8f80",
      "--blue": "#86a9c7",
      "--purple": "#a99dcc",
      "--pink": "#d396a9",
      // Ink's depth: a faint brass light from above, film grain, deep shadows.
      "--glow": "rgba(196,161,103,0.09)",
      "--grain": "0.045",
      // The logo is dark ink artwork; on Ink it is drawn as an ivory silhouette.
      "--mark-filter": "brightness(0) invert(0.9) sepia(0.12)",
      "--shadow-card": "0 1px 0 rgba(255,255,255,0.03) inset, 0 10px 30px rgba(0,0,0,0.28)",
      "--shadow-deep": "0 1px 0 rgba(255,255,255,0.04) inset, 0 18px 48px rgba(0,0,0,0.42)",
    },
    colorScheme: "dark",
  },
  cream: {
    name: "Paper",
    description: "Light and warm, like a printed page",
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
      "--on-miss": "#ffffff",
      "--primary": "#2f7d4f",
      "--on-primary": "#ffffff",
      "--primary-text": "#2e794d",
      "--primary-dark": "#1d5635",
      "--on-primary-dark": "#ffffff",
      "--primary-soft": "#eaf3ec",
      "--accent": "#d97706",
      "--accent-soft": "#fef3c7",
      "--danger": "#c0392b",
      "--on-danger": "#ffffff",
      "--danger-text": "#a5281b",
      "--blue": "#2b6cb0",
      "--purple": "#7c3aed",
      "--pink": "#d6336c",
      "--glow": "transparent",
      "--grain": "0",
      "--mark-filter": "none",
      "--shadow-card": "0 1px 2px rgba(46,36,20,0.04), 0 6px 24px rgba(46,36,20,0.06)",
      "--shadow-deep": "0 2px 4px rgba(35,43,61,0.06), 0 14px 44px rgba(35,43,61,0.12)",
    },
    colorScheme: "light",
  },

  ocean: {
    name: "Ocean",
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
      "--on-miss": "#ffffff",
      "--primary": "#0e6e8c",
      "--on-primary": "#ffffff",
      "--primary-text": "#0e6e8c",
      "--primary-dark": "#075066",
      "--on-primary-dark": "#ffffff",
      "--primary-soft": "#dceaf3",
      "--accent": "#e8830f",
      "--accent-soft": "#fdebd2",
      "--danger": "#c0392b",
      "--on-danger": "#ffffff",
      "--danger-text": "#a5281b",
      "--blue": "#1d6fcc",
      "--purple": "#6645b8",
      "--pink": "#d6336c",
      "--glow": "transparent",
      "--grain": "0",
      "--mark-filter": "none",
      "--shadow-card": "0 1px 2px rgba(12,34,51,0.05), 0 6px 24px rgba(12,34,51,0.07)",
      "--shadow-deep": "0 2px 4px rgba(12,34,51,0.06), 0 14px 44px rgba(12,34,51,0.13)",
    },
    colorScheme: "light",
  },
};

/** Apply a theme by injecting CSS variables onto :root. */
/** The default palette, and where retired theme keys now point. */
export const DEFAULT_THEME = "ink";
const ALIASES = { dark: "ink" };

/** A stored theme key, as the theme to show. Unknown keys get the default. */
export function resolveTheme(themeKey) {
  const key = ALIASES[themeKey] || themeKey;
  return THEMES[key] ? key : DEFAULT_THEME;
}

export function applyTheme(themeKey) {
  if (typeof document === "undefined") return;
  const theme = THEMES[resolveTheme(themeKey)];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  root.style.colorScheme = theme.colorScheme;

  // v84 — THE STATUS BAR HAD ITS OWN OPINION.
  //
  // <meta name="theme-color"> is what a phone paints behind the status bar and
  // address bar. It was a fixed #0a0f1f — a dark navy that matches none of the
  // three themes, including the dark one — so a learner on the default cream
  // theme got a band of near-black above a warm off-white app, and switching
  // theme changed everything except that band.
  //
  // Set from the theme's own ground so the chrome and the app are the same
  // colour by construction rather than by someone remembering to update a
  // hardcoded hex in index.html.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.vars["--bg"]);
}
