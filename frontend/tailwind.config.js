/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ibc: {
          navy:    '#0f2044',
          blue:    '#1e3a8a',
          red:     '#ef4444',
          gold:    '#fbbf24',
          cream:   '#f5f1e8',
        },
      },
    },
  },
  plugins: [],
}

