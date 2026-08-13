/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0a0e17',
          sidebar: '#070a10',
          card: '#121926',
          cardHover: '#182234',
          elevated: '#1a2436',
          border: '#212d42',
          borderLight: '#2e3e5c',
        },
        brand: {
          cyan: '#06b6d4',
          cyanLight: '#67e8f9',
          cyanDark: '#0891b2',
          blue: '#3b82f6',
          purple: '#8b5cf6',
          purpleLight: '#c084fc',
          green: '#10b981',
          greenLight: '#34d399',
          red: '#ef4444',
          redLight: '#f87171',
          orange: '#f59e0b',
          orangeLight: '#fbbf24',
        },
      },
      borderRadius: {
        'ms': '12px',
        'ms-lg': '16px',
        'ms-xl': '20px',
      },
      boxShadow: {
        'ms-card': '0 4px 20px -2px rgba(0, 0, 0, 0.45)',
        'ms-glow': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
        'ms-glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.25)',
      },
    },
  },
  plugins: [],
}
