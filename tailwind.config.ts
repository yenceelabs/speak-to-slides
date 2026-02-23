import type { Config } from "tailwindcss";

// Import shared Yencee Labs tailwind preset
// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require("../packages/ui/tailwind/preset");

const config: Config = {
  presets: [preset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;
