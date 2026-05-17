import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        stage: {
          950: "#05020a",
          900: "#0b0614",
          800: "#151026"
        },
        neon: {
          pink: "#ff3dbe",
          blue: "#51d6ff",
          amber: "#ffd166"
        }
      },
      boxShadow: {
        glow: "0 0 50px rgba(255,61,190,.25)",
        cyan: "0 0 50px rgba(81,214,255,.22)"
      },
      backgroundImage: {
        'stage-radial': 'radial-gradient(circle at 20% 20%, rgba(255,61,190,.22), transparent 30%), radial-gradient(circle at 80% 0%, rgba(81,214,255,.18), transparent 28%), linear-gradient(135deg, #05020a 0%, #0b0614 50%, #151026 100%)'
      }
    }
  },
  plugins: []
};
export default config;
