import type { Config } from "tailwindcss";

const config: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        // Shadcn/ui semantic colors (CSS variable-driven)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        // Cru feedback colors
        "cru-success": "hsl(var(--cru-success))",
        "cru-success-bg": "hsl(var(--cru-success-bg))",
        "cru-warning": "hsl(var(--cru-warning))",
        "cru-warning-bg": "hsl(var(--cru-warning-bg))",
        "cru-error": "hsl(var(--cru-error))",
        "cru-error-bg": "hsl(var(--cru-error-bg))",
        "cru-info": "hsl(var(--cru-info))",
        "cru-info-bg": "hsl(var(--cru-info-bg))",

        // Wine-inspired accents
        "cru-wine": {
          red: "hsl(var(--cru-wine-red))",
          rose: "hsl(var(--cru-wine-rose))",
          white: "hsl(var(--cru-wine-white))",
          sparkling: "hsl(var(--cru-wine-sparkling))",
          orange: "hsl(var(--cru-wine-orange))",
          dessert: "hsl(var(--cru-wine-dessert))",
        },

        // Region accents
        "cru-region": {
          france: "hsl(var(--cru-region-france))",
          italy: "hsl(var(--cru-region-italy))",
          california: "hsl(var(--cru-region-california))",
          spain: "hsl(var(--cru-region-spain))",
          other: "hsl(var(--cru-region-other))",
        },
      },

      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      transitionDuration: {
        fast: "var(--motion-fast)",
        normal: "var(--motion-normal)",
        slow: "var(--motion-slow)",
      },

      transitionTimingFunction: {
        cru: "var(--motion-easing)",
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "scale-pop": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.3)" },
          "100%": { transform: "scale(1)" },
        },
        // Onboarding step transitions — Design Bible 9.5: "horizontal slide (300ms)"
        // prefers-reduced-motion: animate plugin will still include these; we handle
        // reduced motion via a @media query in globals.css (see notes in TasteProfileOnboarding).
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "slide-in-left": {
          from: { transform: "translateX(-100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
      },

      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "scale-pop": "scale-pop 0.3s ease-out",
        // Onboarding horizontal slide — 300ms per Design Bible 9.5
        "slide-in-right": "slide-in-right 0.3s ease-in-out",
        "slide-in-left": "slide-in-left 0.3s ease-in-out",
      },
    },
  },
};

export default config;
