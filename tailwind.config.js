module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { ink: "#050914", navy: "#09112a", edge: "#1a2750", volt: "#2d7dff", radar: "#22e3ff", warn: "#ffb020", bad: "#ff4d6a", good: "#2ee6a6" },
    fontFamily: { sans: ["var(--font-ui)", "system-ui", "sans-serif"] },
  } },
  plugins: [],
};
