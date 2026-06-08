/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#07050f',
        'bg-nebula': '#0d0820',
        'purple-glow': '#7c3aed',
        'purple-soft': '#a78bfa',
        'gold': '#d4a853',
        'gold-soft': '#e8c98a',
        'text-primary': '#f5f0e8',
        'text-muted': '#9b8fa8',
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}
