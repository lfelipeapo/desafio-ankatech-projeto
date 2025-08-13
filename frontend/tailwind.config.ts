import type { Config } from "tailwindcss";
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
      container: { center: true, padding: "1rem", screens: { '2xl': '1200px' } },
      borderRadius: { '2xl': '1.25rem', '3xl': '1.5rem' },
      fontSize: { 'xs':'0.75rem','sm':'0.875rem','base':'0.95rem','lg':'1.05rem','xl':'1.25rem' },
      boxShadow: { 'card': '0 1px 2px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)' }
    } },
  plugins: [],
};
export default config;
