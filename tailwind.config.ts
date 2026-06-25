import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './features/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        paper: '#F5E8A8',
        ivory: '#FFFDF6',
        navy: '#102A43',
        slate: '#5B6C80',
        brass: '#B48A3D',
        moss: '#7E9F79',
        terracotta: '#C97A52',
      },
      borderRadius: {
        card: '20px',
        button: '14px',
        input: '14px',
        image: '18px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(16, 42, 67, 0.07)',
        lift: '0 6px 24px rgba(16, 42, 67, 0.10)',
      },
      transitionDuration: {
        card: '180ms',
        button: '120ms',
        page: '220ms',
        pin: '250ms',
      },
      fontFamily: {
        heading: ['var(--font-geist)', 'sans-serif'],
        body: ['var(--font-source-serif)', 'serif'],
        ui: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        'title': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'small': ['0.875rem', { lineHeight: '1.5' }],
        'label': ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      maxWidth: {
        content: '680px',
      },
    },
  },
  plugins: [],
}

export default config
