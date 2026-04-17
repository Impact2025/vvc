import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "inverse-primary": "#ffb68d",
        "surface-bright": "#fcf9f8",
        "surface": "#fcf9f8",
        "inverse-on-surface": "#f3f0ef",
        "secondary": "#1a3e8f",
        "on-primary": "#ffffff",
        "secondary-container": "#8ba8ff",
        "surface-container-high": "#ebe7e7",
        "background": "#fcf9f8",
        "primary": "#9a4600",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed-variant": "#763300",
        "on-background": "#1c1b1b",
        "on-primary-container": "#572400",
        "tertiary": "#006493",
        "surface-container": "#f0edec",
        "on-surface-variant": "#574237",
        "secondary-fixed-dim": "#b3c5ff",
        "surface-container-highest": "#e5e2e1",
        "secondary-fixed": "#dbe1ff",
        "primary-container": "#f47920",
        "primary-fixed-dim": "#ffb68d",
        "surface-variant": "#e5e2e1",
        "on-surface": "#1c1b1b",
        "primary-fixed": "#ffdbc9",
        "on-secondary": "#ffffff",
        "surface-dim": "#dcd9d9",
        "error": "#ba1a1a",
        "error-container": "#ffdad6",
        "outline": "#8b7265",
        "inverse-surface": "#313030",
        "outline-variant": "#dec0b1",
        "surface-container-low": "#f6f3f2",
        "tertiary-container": "#00a5ef",
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      fontFamily: {
        headline: ["Plus Jakarta Sans", "sans-serif"],
        body: ["Manrope", "sans-serif"],
        label: ["Manrope", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
