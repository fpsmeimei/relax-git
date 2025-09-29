/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        spotify: {
          green: 'var(--brand-green)',
          blue: 'var(--brand-blue)',
          purple: 'var(--brand-purple)',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        elevated: '0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)',
        'spotify-card':
          '0 20px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)',
        'spotify-glow': '0 0 18px rgba(29,185,84,0.28)',
        'spotify-glow-strong': '0 0 26px rgba(29,185,84,0.36)',
      },
      backgroundImage: {
        'spotify-hero':
          'radial-gradient(circle at 20% 20%, rgba(29,185,84,0.18), transparent 55%), radial-gradient(circle at 80% 0%, rgba(67,177,255,0.12), transparent 50%), radial-gradient(circle at 0% 85%, rgba(175,82,222,0.16), transparent 55%)',
        'spotify-cta':
          'linear-gradient(135deg, var(--brand-green) 0%, var(--brand-blue) 55%, var(--brand-purple) 100%)',
        'spotify-brick':
          'linear-gradient(180deg, rgba(24,24,24,0.92) 0%, rgba(12,12,12,0.96) 100%)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'Spotify Mix',
          'Helvetica Neue',
          'Arial',
          'var(--font-sans)',
          'system-ui',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', 'Consolas', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        in: 'in 0.2s ease-out',
        out: 'out 0.15s ease-in',
        pop: 'pop 0.2s ease-out',
        'accordion-down': 'accordionDown 0.2s ease-out',
        'accordion-up': 'accordionUp 0.2s ease-out',
        shimmer: 'shimmer 1.2s linear infinite',
        equalizer: 'equalizer 1.2s ease-in-out infinite',
        float: 'float 8s ease-in-out infinite',
        glow: 'glow 2.4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        in: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        out: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(6px)' },
        },
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        accordionDown: {
          '0%': { height: '0' },
          '100%': { height: 'var(--radix-accordion-content-height)' },
        },
        accordionUp: {
          '0%': { height: 'var(--radix-accordion-content-height)' },
          '100%': { height: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        equalizer: {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '40%': { transform: 'scaleY(1)' },
          '80%': { transform: 'scaleY(0.6)' },
        },
        float: {
          '0%': { transform: 'translate3d(0, 0, 0)' },
          '50%': { transform: 'translate3d(0, -6px, 0)' },
          '100%': { transform: 'translate3d(0, 0, 0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(29,185,84,0.45)' },
          '50%': { boxShadow: '0 0 32px rgba(67,177,255,0.45)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@tailwindcss/forms')],
  darkMode: ['class'],
};
