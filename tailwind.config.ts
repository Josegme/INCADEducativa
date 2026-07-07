import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        inc: {
          violet:  '#9B30FF',
          magenta: '#C026D3',
        },
        edu: {
          bg:             '#08080F',
          surface:        '#100F1E',
          'surface-alt':  '#151428',
          'surface-raised':'#1C1A35',
          success:        '#10B981',
          warning:        '#F59E0B',
          danger:         '#EF4444',
          gold:           '#E8C97A',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        sm:   '6px',
        md:   '10px',
        lg:   '14px',
        xl:   '20px',
        pill: '9999px',
      },
      boxShadow: {
        card:        '0px 2px 8px rgba(0, 0, 0, 0.40)',
        'card-violet':'0px 4px 20px rgba(155, 48, 255, 0.15)',
        modal:       '0px 8px 40px rgba(0, 0, 0, 0.70)',
      },
    },
  },
  plugins: [],
}

export default config
