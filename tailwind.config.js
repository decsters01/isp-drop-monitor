/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/renderer/index.html",
    "./src/renderer/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#070B14", // Fundo principal ultra-escuro
          850: "#0B0F19", // Painel escuro
          800: "#0F172A", // Cartões e superfícies
          700: "#1E293B", // Bordas e divisores sutis
          600: "#334155"
        },
        navy: {
          500: "#1D4ED8",
          600: "#1E40AF",
          700: "#1E3A8A",
          800: "#172554"
        },
        brand: {
          blue: "#3B82F6",
          accent: "#60A5FA",
          cyan: "#38BDF8",
          glow: "rgba(59, 130, 246, 0.15)"
        }
      }
    },
  },
  plugins: [],
};
