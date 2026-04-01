/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Deep Forest Greens
        primary: '#012d1d',
        'on-primary': '#ffffff',
        'primary-container': '#1b4332',
        'on-primary-container': '#c1ecd4',
        'primary-fixed': '#c1ecd4',
        'primary-fixed-dim': '#76dba6',
        
        // Secondary
        secondary: '#4a6354',
        'on-secondary': '#ffffff',
        'secondary-container': '#cce9d5',
        'on-secondary-container': '#062113',
        
        // Tertiary - Warm Accents
        tertiary: '#3f1d00',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#6f3b00',
        'on-tertiary-container': '#ffdcc2',
        'tertiary-fixed': '#ffdcc2',
        'tertiary-fixed-dim': '#ffb780',
        
        // Surface - Warm Sands
        surface: '#f9faf2',
        'on-surface': '#1a1c18',
        'on-surface-variant': '#414844',
        'surface-variant': '#dbe5dd',
        
        // Surface Containers
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#f3f4ec',
        'surface-container': '#edece5',
        'surface-container-high': '#e8e9e1',
        'surface-container-highest': '#e2e3db',
        
        // Outline
        outline: '#717972',
        'outline-variant': '#c1c8c2',
        
        // Error
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#410002',
        
        // Success
        success: '#2e7d32',
        'on-success': '#ffffff',
        
        // Info
        info: '#0288d1',
        'on-info': '#ffffff',
      },
      fontFamily: {
        display: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['2.8rem', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'display-sm': ['2.2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'headline-lg': ['2rem', { lineHeight: '1.3' }],
        'headline-md': ['1.75rem', { lineHeight: '1.35' }],
        'headline-sm': ['1.5rem', { lineHeight: '1.4' }],
        'title-lg': ['1.25rem', { lineHeight: '1.4' }],
        'title-md': ['1rem', { lineHeight: '1.5' }],
        'title-sm': ['0.875rem', { lineHeight: '1.5' }],
        'body-lg': ['1rem', { lineHeight: '1.6' }],
        'body-md': ['0.875rem', { lineHeight: '1.6' }],
        'label-lg': ['0.875rem', { lineHeight: '1.5' }],
        'label-md': ['0.75rem', { lineHeight: '1.5' }],
        'label-sm': ['0.6875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '8': '2rem',
        '10': '2.5rem',
        '12': '3rem',
        '16': '4rem',
        '20': '5rem',
        '24': '6rem',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.375rem',
        'md': '0.75rem',
        'lg': '1rem',
        'xl': '1.5rem',
        '2xl': '2rem',
        'full': '9999px',
      },
      boxShadow: {
        'ambient': '0 8px 24px rgba(26, 28, 24, 0.06)',
        'glass': '0 4px 16px rgba(26, 28, 24, 0.04)',
      },
      backdropBlur: {
        'glass': '24px',
      },
    },
  },
  plugins: [],
}
