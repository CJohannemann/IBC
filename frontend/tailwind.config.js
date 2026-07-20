/** @type {import('tailwindcss').Config} */
export default {
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

