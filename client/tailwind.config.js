/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "var(--brand-50)",
          100: "var(--brand-100)",
          200: "var(--brand-200)",
          300: "var(--brand-300)",
          400: "var(--brand-400)",
          500: "var(--brand-500)",
          600: "var(--brand-600)",
          700: "var(--brand-700)",
          800: "var(--brand-800)",
          900: "var(--brand-900)",
          accent: "var(--brand-accent)",
        },
        surface: {
          light: "#faf8f5",
          dark: "#0f0f12",
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["DM Sans", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px -4px rgba(0,0,0,0.08)",
        "card-dark": "0 4px 24px -4px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
