import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        masala: {
          red: "#B4182A",        // packet red
          redDeep: "#7A0F1C",
          redBright: "#E8283F",  // vivid accent used for glows / active states
          gold: "#F2B90B",       // packet mustard/gold
          goldSoft: "#FBE29B",
          goldBright: "#FFD447",
          brown: "#3B1F14",      // powder brown
          brownDeep: "#221009",  // near-black surface for dark accents
          cream: "#FDF6E3",      // label cream
          mist: "#FFFBF2",       // lighter-than-cream surface for cards on cards
          green: "#1F9D55",      // positive / settled state
        },
      },
      backgroundImage: {
        "masala-gradient": "linear-gradient(135deg, #B4182A 0%, #7A0F1C 60%, #3B1F14 100%)",
        "masala-gradient-vivid": "linear-gradient(135deg, #E8283F 0%, #B4182A 45%, #7A0F1C 100%)",
        "gold-gradient": "linear-gradient(135deg, #F2B90B 0%, #FBE29B 100%)",
        "gold-gradient-vivid": "linear-gradient(135deg, #FFD447 0%, #F2B90B 100%)",
        "mesh-hero":
          "radial-gradient(120% 100% at 0% 0%, rgba(232,40,63,0.20) 0%, transparent 55%)," +
          "radial-gradient(120% 100% at 100% 0%, rgba(242,185,11,0.18) 0%, transparent 55%)," +
          "radial-gradient(140% 120% at 50% 100%, rgba(232,40,63,0.10) 0%, transparent 60%)",
        "glass-sheen": "linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(242,185,11,0.35)",
        "glow-red": "0 8px 30px -8px rgba(180,24,42,0.45)",
        "glow-gold": "0 8px 24px -6px rgba(242,185,11,0.45)",
        soft: "0 2px 8px rgba(59,31,20,0.06), 0 1px 2px rgba(59,31,20,0.04)",
        "soft-lg": "0 12px 32px -8px rgba(59,31,20,0.16), 0 4px 12px -4px rgba(59,31,20,0.08)",
        "float-nav": "0 -8px 30px -8px rgba(59,31,20,0.18)",
        "inner-glass": "inset 0 1px 0 rgba(255,255,255,0.4)",
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem",
        "4xl": "2rem",
      },
      backdropBlur: {
        xs: "2px",
      },
      keyframes: {
        floatIn: {
          "0%": { opacity: "0", transform: "translateY(10px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        floatIn: "floatIn 0.35s cubic-bezier(0.16,1,0.3,1)",
        shimmer: "shimmer 2.5s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
