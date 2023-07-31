/** @type {import('tailwindcss').Config} */

import plugin from "tailwindcss/plugin";

export const darkMode = ["class"];
export const content = [
  "./pages/**/*.{ts,tsx}",
  "./components/**/*.{ts,tsx}",
  "./app/**/*.{ts,tsx}",
  "./src/**/*.{ts,tsx}",
];
export const theme = {
  container: {
    center: true,
    padding: "2rem",
    screens: {
      "2xl": "1400px",
    },
  },
  extend: {
    colors: {
      "border": "hsl(var(--border))",
      "input": "hsl(var(--input))",
      "ring": "hsl(var(--ring))",
      "background": "hsl(var(--background))",
      "foreground": "hsl(var(--foreground))",
      "primary": {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      "secondary": {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      "destructive": {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      "muted": {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      "accent": {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      "popover": {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      "card": {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      "resolver-ac": "#5eb95e",
      "resolver-wa": "#dd514c",
      "resolver-pending": "#607D8B",
      "resolver-untouched": "#1f1f1f",
      "resolver-selected": "#406b82",
      "resolver-bg-0": "#3e3e3e",
    },
    borderRadius: {
      lg: "var(--radius)",
      md: "calc(var(--radius) - 2px)",
      sm: "calc(var(--radius) - 4px)",
    },
    keyframes: {
      "accordion-down": {
        from: { height: 0 },
        to: { height: "var(--radix-accordion-content-height)" },
      },
      "accordion-up": {
        from: { height: "var(--radix-accordion-content-height)" },
        to: { height: 0 },
      },
    },
    animation: {
      "accordion-down": "accordion-down 0.2s ease-out",
      "accordion-up": "accordion-up 0.2s ease-out",
    },
  },
};
export const plugins = [
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require("tailwindcss-animate"),
  plugin(({ addUtilities }) => {
    addUtilities({
      ".no-overflow-anchoring": {
        overflowAnchor: "none",
      },
    });
  }),
];
