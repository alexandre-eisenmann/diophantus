// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Adjust according to your file structure
  ],
  theme: {
    extend: {
      fontFamily: {
        'roboto-mono': ["Roboto Mono", "monospace"],
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