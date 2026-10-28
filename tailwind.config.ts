import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0b1a13',      // AUVARE Deep Brand Forest Green
          primary: '#15803d',   // Primary emerald action tone
          light: '#22c55e',     // Neon accent green
          soft: '#eaf3ee',      // Frosted green background tint
          gold: '#c5a059',      // Archival luxury gold accent
        },
        admin: {
          bg: '#f8fafc',
          card: '#ffffff',
          border: '#e2e8f0',
          sidebar: '#0b1a13',
          textMain: '#0f172a',
          textMuted: '#64748b',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-jakarta)', 'Inter', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        luxury: '0 10px 30px -10px rgba(11, 26, 19, 0.12)',
        sheet: '0 -10px 40px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        luxury: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
