/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Work Sans', 'DM Sans', 'sans-serif'],
      },
      colors: {
        // Organic green theme - warm, clean, and natural
        primary: {
          light: "#E8F0D7", // pale green
          DEFAULT: "#88B04B", // organic green
          dark: "#7CA346", // hover green
        },
        // Secondary colors
        secondary: {
          DEFAULT: "#6E8B3D", // deep natural green
          light: "#8FA653", // lighter secondary
        },
        // Accent colors
        accent: {
          DEFAULT: "#88B04B", // organic green accent
          green: "#10B981", // success green
          orange: "#F59E0B", // warning orange
          red: "#EF4444", // error red
        },
        // Background colors
        background: {
          DEFAULT: "#FAFAF8", // creamy background
          light: "#FFFFFF", // white section background
          section: "#F5F5F2", // alternate section
          dark: "#0F172A", // dark background
        },
        // Text colors
        text: {
          DEFAULT: "#2E2E2E", // dark charcoal text
          body: "#4A4A4A", // body text
          muted: "#6D6D6D", // muted gray
          light: "#FFFFFF", // white text
        },
        // Border colors
        border: {
          DEFAULT: "#E5E5E1", // subtle border
          light: "#F0F0ED",
        },
        // Brand colors
        brand: {
          light: "#E8F0D7",
          DEFAULT: "#88B04B",
          dark: "#7CA346",
        },
      },
      backgroundImage: {
        "gradient-light": "linear-gradient(180deg, #F5F7FA 0%, #FAFBFC 100%)",
        "gradient-hero": "linear-gradient(135deg, #E8EEF4 0%, #D6DFE8 100%)",
        "gradient-button": "linear-gradient(90deg, #6C8AA8 0%, #4F6D88 100%)",
        "gradient-card": "linear-gradient(135deg, #FFFFFF 0%, #F5F7FA 100%)",
        "gradient-dark": "linear-gradient(135deg, #4F6D88 0%, #3A5266 100%)",
      },
    },
  },
  plugins: [],
}
