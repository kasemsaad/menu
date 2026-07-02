const DEFAULT_PRIMARY = "#ea580c";
const DEFAULT_ACCENT = "#f97316";
const STYLE_ID = "brand-theme-vars";

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Normalize #RRGGBB for color inputs and API */
export const normalizeHex = (hex?: string, fallback = DEFAULT_PRIMARY) => {
  if (!hex) return fallback;
  let clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    clean = clean
      .split("")
      .map((c) => c + c)
      .join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return fallback;
  return `#${clean.toLowerCase()}`;
};

export const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex, "");
  if (normalized === "") return null;
  const clean = normalized.replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map((c) => clamp(c).toString(16).padStart(2, "0")).join("")}`;

const mix = (hex: string, target: { r: number; g: number; b: number }, amount: number) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return rgbToHex(
    rgb.r + (target.r - rgb.r) * amount,
    rgb.g + (target.g - rgb.g) * amount,
    rgb.b + (target.b - rgb.b) * amount
  );
};

export const generateBrandScale = (primary: string) => {
  const base = normalizeHex(primary, DEFAULT_PRIMARY);
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };
  return {
    50: mix(base, white, 0.92),
    100: mix(base, white, 0.84),
    200: mix(base, white, 0.68),
    300: mix(base, white, 0.52),
    400: mix(base, white, 0.28),
    500: mix(base, white, 0.08),
    600: base,
    700: mix(base, black, 0.12),
    800: mix(base, black, 0.28),
    900: mix(base, black, 0.42),
  };
};

export const applyBrandTheme = (primary?: string, accent?: string) => {
  const primaryHex = normalizeHex(primary, DEFAULT_PRIMARY);
  const accentHex = normalizeHex(accent, normalizeHex(primary, DEFAULT_ACCENT));
  const scale = generateBrandScale(primaryHex);
  if (hexToRgb(accentHex)) scale[500] = accentHex;

  const root = document.documentElement;
  const vars: string[] = [];

  Object.entries(scale).forEach(([key, value]) => {
    root.style.setProperty(`--brand-${key}`, value);
    vars.push(`--brand-${key}: ${value};`);
  });

  root.style.setProperty("--brand-accent", accentHex);
  vars.push(`--brand-accent: ${accentHex};`);

  const gradientFrom = scale[600];
  const gradientMid = scale[500];
  const gradientTo = accentHex;
  root.style.setProperty("--brand-gradient-from", gradientFrom);
  root.style.setProperty("--brand-gradient-mid", gradientMid);
  root.style.setProperty("--brand-gradient-to", gradientTo);
  vars.push(`--brand-gradient-from: ${gradientFrom};`);
  vars.push(`--brand-gradient-mid: ${gradientMid};`);
  vars.push(`--brand-gradient-to: ${gradientTo};`);

  let styleEl = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `:root, html { ${vars.join(" ")} }`;

  try {
    sessionStorage.setItem("brandPrimary", primaryHex);
    sessionStorage.setItem("brandAccent", accentHex);
  } catch {
    /* ignore */
  }
};

export const reapplyStoredBrandTheme = () => {
  try {
    const primary = sessionStorage.getItem("brandPrimary");
    const accent = sessionStorage.getItem("brandAccent");
    if (primary) applyBrandTheme(primary, accent ?? undefined);
  } catch {
    /* ignore */
  }
};

export const getBrandCssColor = (varName: string) => {
  if (typeof document === "undefined") return DEFAULT_PRIMARY;
  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim() || DEFAULT_PRIMARY;
};

export const getBrandChartColors = () => [
  getBrandCssColor("--brand-600"),
  getBrandCssColor("--brand-accent"),
  getBrandCssColor("--brand-300"),
  getBrandCssColor("--brand-100"),
];

export const DEFAULT_BRAND = { primary: DEFAULT_PRIMARY, accent: DEFAULT_ACCENT };
