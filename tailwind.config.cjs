/** @type {import('tailwindcss').Config} */

const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        // GUISS Typography Tokens
        'page-title': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // text-xl
        'section-title': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }], // text-base
        'body': ['0.875rem', { lineHeight: '1.25rem' }], // text-sm
        'caption': ['0.75rem', { lineHeight: '1rem' }], // text-xs
      },
      colors: {
        // Base
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        background: 'var(--background)',
        foreground: 'var(--foreground)',

        // Surface
        surface: {
          DEFAULT: 'var(--surface)',
          muted: 'var(--surface-muted)',
          subtle: 'var(--surface-subtle)',
        },

        // Primary (Sky - Medical)
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          subtle: 'var(--primary-subtle)',
          foreground: 'var(--primary-foreground)',
        },

        // Secondary
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },

        // Destructive
        destructive: {
          DEFAULT: 'var(--destructive)',
          foreground: 'var(--destructive-foreground)',
        },

        // Muted
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },

        // Accent
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },

        // Popover
        popover: {
          DEFAULT: 'var(--popover)',
          foreground: 'var(--popover-foreground)',
        },

        // Card
        card: {
          DEFAULT: 'var(--card)',
          foreground: 'var(--card-foreground)',
        },

        // Status Colors (GUISS Design Tokens)
        success: {
          DEFAULT: 'var(--success)',
          subtle: 'var(--success-subtle)',
        },
        warning: {
          DEFAULT: 'var(--warning)',
          subtle: 'var(--warning-subtle)',
        },
        danger: {
          DEFAULT: 'var(--danger)',
          subtle: 'var(--danger-subtle)',
        },
        info: {
          DEFAULT: 'var(--info)',
          subtle: 'var(--info-subtle)',
        },

        // Text Colors
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
          disabled: 'var(--text-disabled)',
        },

        // Sidebar
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          primary: 'var(--sidebar-primary)',
          'primary-foreground': 'var(--sidebar-primary-foreground)',
          accent: 'var(--sidebar-accent)',
          'accent-foreground': 'var(--sidebar-accent-foreground)',
          border: 'var(--sidebar-border)',
          ring: 'var(--sidebar-ring)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        // GUISS Spacing Tokens
        'page': '1.5rem',        // p-6
        'page-compact': '1rem',  // p-4
        'section': '1.5rem',     // space-y-6
        'subsection': '1rem',    // space-y-4
        'card': '1rem',          // p-4
        'form': '0.75rem',       // space-y-3
        'modal': '1.5rem',       // p-6
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
