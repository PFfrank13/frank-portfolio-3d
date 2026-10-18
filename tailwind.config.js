/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: 'var(--bg)', 1: 'var(--bg-1)', 2: 'var(--bg-2)', 3: 'var(--bg-3)' },
        line: { DEFAULT: 'var(--line)', soft: 'var(--line-soft)' },
        fg: { DEFAULT: 'var(--fg)', 2: 'var(--fg-2)', 3: 'var(--fg-3)' },
        paper: { DEFAULT: 'var(--paper)', 2: 'var(--paper-2)' },
        ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', 3: 'var(--ink-3)' },
        gold: 'var(--gold)',
        ok: 'var(--ok)',
        danger: 'var(--danger)',
        warn: 'var(--warn)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      transitionTimingFunction: { out: 'cubic-bezier(0.22, 1, 0.36, 1)' },
    },
  },
  corePlugins: { preflight: true },
  plugins: [],
};
