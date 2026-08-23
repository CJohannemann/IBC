/** @type {import('tailwindcss').Config} */
export default {
  // Touch devices latch :hover on tap, which left the last tile you touched
  // stuck at hover:scale-105 and visibly wider than the ones beside it.
  future: { hoverOnlyWhenSupported: true },
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ibc: {
          navy:    '#0c2038',
          red:     '#ef4444',
          gold:    '#fbbf24',
          cream:   '#f5f1e8',
        },
      },
    },
  },
  plugins: [],
}

