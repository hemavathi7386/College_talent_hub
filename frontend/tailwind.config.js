/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors with light purple theme
        primary: {
          light: "#F4E6FF", // very pale lavender
          DEFAULT: "#C084FC", // light purple (updated from dark purple)
          dark: "#A855F7", // slightly darker purple for contrast
        },
        // Secondary colors
        secondary: {
          DEFAULT: "#8B5CF6", // purple
          light: "#A78BFA", // lighter purple for hover states
        },
        // Accent colors
        accent: {
          DEFAULT: "#C084FC", // light purple accent
          pink: "#E6A8FF", // lavender pink
          magenta: "#D946EF", // bright pink accent
          lilac: "#D8B4FE", // soft lilac
        },
        // Background colors
        background: {
          DEFAULT: "#FFFFFF", // white
          light: "#F3F4F6", // light gray
          section: "#F8F5FF", // alternate section
          lavender: "#F4E6FF", // light lavender
        },
        // Text colors
        text: {
          DEFAULT: "#1E1E1E", // dark charcoal for headings
          body: "#374151", // darker gray for better contrast
          muted: "#6B7280", // improved muted gray for secondary text
          light: "#FFFFFF", // white text on colored backgrounds
          primary: "#1F2937", // very dark gray for primary text
        },
        // Brand colors (legacy support)
        brand: {
          light: "#F4E6FF", // very pale lavender
          DEFAULT: "#CDB4DB", // soft pastel purple
          medium: "#A78BFA", // light violet (for hover/accents)
        },
      },
      backgroundImage: {
        "gradient-light": "linear-gradient(180deg, #FFFFFF 0%, #F8F5FF 100%)",
        "gradient-hero": "linear-gradient(180deg, #EBDCFB 0%, #F4E6FF 100%)",
        "gradient-button": "linear-gradient(90deg, #C084FC 0%, #A855F7 100%)",
        "gradient-card": "linear-gradient(135deg, #F4E6FF 0%, #FFFFFF 100%)",
        "gradient-purple": "linear-gradient(135deg, #C084FC 0%, #8B5CF6 100%)",
      },
    },
  },
  plugins: [],
}
