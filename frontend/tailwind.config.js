/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        ink: '#0F172A',
        'ink-muted': '#64748B',
        accent: '#6366F1',
        'accent-hover': '#4F46E5',
        'status-available': '#10B981',
        'status-allocated': '#F59E0B',
        'status-maintenance': '#EF4444',
        'status-reserved': '#3B82F6',
        'status-inactive': '#94A3B8',
      },
      fontFamily: {
        ui: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        '2xs': '0.75rem',
        xs: '0.8125rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem', 
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        modal: '0 20px 48px -8px rgba(0,0,0,0.18)',
        glow: '0 0 15px -3px rgba(99, 102, 241, 0.4)',
      },
      keyframes: {
        pulse_chip: {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '40%':  { transform: 'scale(1.18)', opacity: '0.85' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        row_flash: {
          '0%':   { backgroundColor: 'rgba(99,102,241,0.08)' },
          '100%': { backgroundColor: 'transparent' },
        },
        toast_in: {
          '0%':   { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fade_in: {
          '0%':   { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scale_in: {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        pulse_chip: 'pulse_chip 0.6s ease-out',
        row_flash: 'row_flash 1.2s ease-out',
        toast_in: 'toast_in 0.3s ease-out',
        fade_in: 'fade_in 0.2s ease-out',
        scale_in: 'scale_in 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
