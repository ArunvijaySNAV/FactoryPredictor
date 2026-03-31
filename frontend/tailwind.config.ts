import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        steel: {
          50: "#f8fafb",
          100: "#edf1f3",
          200: "#d6dee5",
          400: "#7890a6",
          500: "#5d7286",
          700: "#334250",
          900: "#19222c"
        },
        industrial: {
          blue: "#2d5f8b",
          amber: "#f1a42b",
          offwhite: "#f6f4ef",
          graphite: "#516170"
        }
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        body: ["IBM Plex Sans", "sans-serif"]
      },
      boxShadow: {
        panel: "0 18px 45px rgba(39, 60, 77, 0.12)"
      },
      backgroundImage: {
        "mesh-industrial": "radial-gradient(circle at top left, rgba(45,95,139,0.24), transparent 42%), radial-gradient(circle at bottom right, rgba(241,164,43,0.18), transparent 38%), linear-gradient(135deg, #f6f4ef 0%, #e9eef2 48%, #d8e0e7 100%)"
      }
    }
  },
  plugins: []
} satisfies Config;
