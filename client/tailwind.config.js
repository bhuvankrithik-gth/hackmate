/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        neon: {
          purple: '#a855f7',
          violet: '#8b5cf6',
          cyan: '#22d3ee',
        },
        void: {
          950: '#05070f',
          900: '#0a0e1a',
          800: '#101527',
          700: '#182036',
        },
      },
      animation: {
        blob: 'blob 18s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        'pulse-slow': 'pulse 5s ease-in-out infinite',
        shimmer: 'shimmer 1.8s linear infinite',
        'spin-slow': 'spin 14s linear infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(40px, -30px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 25px) scale(0.92)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      boxShadow: {
        neon: '0 0 24px rgba(168, 85, 247, 0.45)',
        'neon-cyan': '0 0 24px rgba(34, 211, 238, 0.4)',
      },
    },
  },
  plugins: [],
}
