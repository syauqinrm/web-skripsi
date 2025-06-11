/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F0F4F8", // Latar belakang abu-abu sangat muda
        surface: "#FFFFFF", // Warna dasar untuk kartu/elemen
        primary: "#9FC2E5", // Biru pastel
        secondary: "#E0BBE4", // Ungu pastel
        accent: "#FFD8B1", // Oranye/peach pastel
        "text-main": "#1F2937", // Teks utama gelap
        "text-light": "#6B7280", // Teks sekunder
        success: "#B2D8B2", // Hijau pastel
        danger: "#FFB3B3", // Merah pastel
        kopi: "#AB8169",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Gunakan font yang bersih seperti Inter
      },
    },
  },
  plugins: [],
};
