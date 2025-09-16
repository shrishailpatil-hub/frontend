import { type Config } from 'tailwindcss'

export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        space: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        mission: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      },
      animation: {
        'orbit': 'orbit 20s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        orbit: {
          '0%': { transform: 'rotate(0deg) translateX(200px) rotate(0deg)' },
          '100%': { transform: 'rotate(360deg) translateX(200px) rotate(-360deg)' },
        }
      }
    },
  },
  plugins: [],
} satisfies Config
