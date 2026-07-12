/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#F7F8FA',
        surface: '#FFFFFF',
        border: '#E2E4E9',
        ink: '#14181F',
        'ink-muted': '#6B7280',
        accent: '#4F46E5',
        'accent-hover': '#4338CA',
        'status-available': '#16A34A',
        'status-allocated': '#C2740B',
        'status-maintenance': '#DC2626',
        'status-reserved': '#2563EB',
        'status-inactive': '#6B7280',
      },
      fontFamily: {
        ui: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
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
      },
      keyframes: {
        pulse_chip: {
          '0%':   { transform: 'scale(1)', opacity: '1' },
          '40%':  { transform: 'scale(1.18)', opacity: '0.85' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        row_flash: {
          '0%':   { backgroundColor: 'rgba(79,70,229,0.06)' },
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
      },
      animation: {
        pulse_chip: 'pulse_chip 0.6s ease-out',
        row_flash: 'row_flash 1.2s ease-out',
        toast_in: 'toast_in 0.3s ease-out',
        fade_in: 'fade_in 0.2s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
};
