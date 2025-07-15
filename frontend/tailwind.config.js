/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // New coffee-inspired palette
        "coffee-dark": "#2C3930", // rgb(44, 57, 48) - Dark green-brown
        "coffee-medium": "#3F4F44", // rgb(63, 79, 68) - Medium green-brown
        "coffee-light": "#A27B5C", // rgb(162, 123, 92) - Light brown
        "coffee-cream": "#DCD7C9", // rgb(220, 215, 201) - Cream

        // Updated theme colors using the palette
        background: "#DCD7C9", // Cream background
        surface: "#FFFFFF", // White for cards
        primary: "#2C3930", // Dark coffee for primary elements
        secondary: "#3F4F44", // Medium coffee for secondary elements
        accent: "#A27B5C", // Light coffee for accents
        "text-main": "#2C3930", // Dark text
        "text-light": "#3F4F44", // Medium text
        "text-muted": "#A27B5C", // Muted text
        success: "#4ADE80", // Keep green for success
        danger: "#EF4444", // Keep red for danger
        warning: "#F59E0B", // Keep amber for warning
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "coffee-gradient":
          "linear-gradient(135deg, #2C3930 0%, #3F4F44 50%, #A27B5C 100%)",
        "cream-gradient": "linear-gradient(135deg, #DCD7C9 0%, #FFFFFF 100%)",
        "warm-gradient": "linear-gradient(135deg, #A27B5C 0%, #DCD7C9 100%)",
      },
      boxShadow: {
        coffee: "0 4px 14px 0 rgba(44, 57, 48, 0.15)",
        "coffee-lg": "0 10px 25px -3px rgba(44, 57, 48, 0.2)",
      },
    },
  },
  plugins: [],
};
