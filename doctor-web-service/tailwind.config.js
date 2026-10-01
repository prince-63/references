/** @type {import('tailwindcss').Config} */
import getColorPalette from './src/utils/getColorPalette'

module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  // Enable JIT mode for faster builds and smaller CSS
  mode: 'jit',
  // Safelist for dynamically generated classes
  safelist: [
    // Common dynamic classes that might be generated at runtime
    {
      pattern: /^(bg|text|border)-(primary|secondary|success|error|warning|info)/,
      variants: ['hover', 'focus', 'active'],
    },
    {
      pattern: /^(w|h)-(full|screen|auto|\d+)/,
    },
  ],
  theme: {
    extend: {
      backgroundColor: {
        'checkbox-checked': '#4CAF50',
        'checkbox-unchecked': '#E5E7EB',
      },
      fontFamily: {
        custom: ['Figtree', 'sans-serif'],
      },
      colors: getColorPalette(),
      boxShadow: {
        first: '0px 0px 19px 13px #00000014;',
        second: '0px 3px 30px 0px rgba(0, 0, 0, 0.06);',
        colorPrimary: '0px 4px 23px 1px rgba(115, 91, 242, 0.49);',
        footerShadow: '0px -13px 34px 0px rgba(0, 0, 0, 0.06);',
      },
    },
  },
  plugins: [],
}
