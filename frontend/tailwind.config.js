/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Bricolage Grotesque', 'system-ui', 'sans-serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: '#0E0E10',
        'bg-soft': '#16161A',
        surface: '#1E1E24',
        'surface-2': '#2A2A33',
        border: '#2E2E38',
        'text-main': '#F4F4F6',
        'text-dim': '#9C9CA8',
        'text-mute': '#6B6B78',
        accent: '#D6FF3A',
        'accent-deep': '#B8E021',
      },
    },
  },
  plugins: [],
};
