import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1A1540", light: "#2E2152", muted: "#3B2F6B" },
        ivory: { DEFAULT: "#FFF8F0", warm: "#FDF6EC", soft: "#F5EFE6", card: "#FFFBF5" },
        gold: { DEFAULT: "#C9A96A", light: "#E2C38A", deep: "#A6864A" },
        plum: { DEFAULT: "#2E1A47", soft: "#4A2D7A" },
        accent: "var(--accent)"
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["Manrope", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      boxShadow: {
        royal: "0 10px 40px rgba(26,21,64,0.12), 0 2px 8px rgba(26,21,64,0.08)",
        soft: "0 4px 24px rgba(26,21,64,0.08)"
      },
      backgroundImage: {
        "royal-gradient": "linear-gradient(135deg, #1A1540 0%, #2E1A47 30%, #4A2D7A 60%, #6D5BFF 100%)",
        "rose-gradient": "linear-gradient(135deg, #FF6B8A 0%, #FF8E53 100%)",
        "violet-gradient": "linear-gradient(135deg, #6D5BFF 0%, #8B5CF6 50%, #EC4899 100%)"
      }
    }
  },
  plugins: []
};
export default config;
