// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust according to your file structure
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
      },
      fontWeight: {
        'thin': 300,
        'normal': 400,
        'bold': 700,
      },      
    },
  },
  plugins: [],
};