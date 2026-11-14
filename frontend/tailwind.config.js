/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          950: '#06090e',
          900: '#0a0f18',
          850: '#0f1624',
          800: '#151f32',
          750: '#1b273f',
          700: '#233252',
          card: 'rgba(15, 22, 36, 0.78)',
          'card-hover': 'rgba(21, 31, 50, 0.85)',
          border: 'rgba(255, 255, 255, 0.08)',
          'border-active': 'rgba(0, 240, 255, 0.35)',
        },
        cyan: {
          400: '#22d3ee',
          500: '#06b6d4',
          electric: '#00f2fe',
        },
        threat: {
          safe: '#10b981',
          'safe-subtle': 'rgba(16, 185, 129, 0.15)',
          'safe-glow': 'rgba(16, 185, 129, 0.3)',
          suspicious: '#f59e0b',
          'suspicious-subtle': 'rgba(245, 158, 11, 0.15)',
          'suspicious-glow': 'rgba(245, 158, 11, 0.3)',
          critical: '#f43f5e',
          'critical-subtle': 'rgba(244, 63, 94, 0.15)',
          'critical-glow': 'rgba(244, 63, 94, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'radar-sweep': 'sweep 4s linear infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        sweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        }
      }
    },
  },
  plugins: [],
}
