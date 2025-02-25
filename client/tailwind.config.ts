/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			orbitron: [
  				'Orbitron',
  				'sans-serif'
  			],
  			roboto: [
  				'Roboto Mono',
  				'monospace'
  			]
  		},
  		keyframes: {
  			fadeInDown: {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(-20px)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			},
  			fadeInUp: {
  				'0%': {
  					opacity: 0,
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: 1,
  					transform: 'translateY(0)'
  				}
  			},
  			neonGlow: {
  				'0%, 100%': {
  					textShadow: '0 0 10px #fff, 0 0 20px #ff00de, 0 0 30px #ff00de'
  				},
  				'50%': {
  					textShadow: '0 0 20px #fff, 0 0 30px #ff00de, 0 0 40px #ff00de'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: 0.7,
  					transform: 'scale(1)'
  				},
  				'100%': {
  					opacity: 0,
  					transform: 'scale(2)'
  				}
  			},
  			slide: {
  				'0%': {
  					transform: 'translateX(0)'
  				},
  				'100%': {
  					transform: 'translateX(-200px)'
  				}
  			}
  		},
  		animation: {
  			fadeInDown: 'fadeInDown 1s ease-out',
  			fadeInUp: 'fadeInUp 1s ease-out',
  			neonGlow: 'neonGlow 2s ease-in-out infinite',
  			spinSlow: 'spinSlow 20s linear infinite',
  			fadeOut: 'fadeOut 0.8s ease-out forwards',
  			slide: 'slide 30s linear infinite'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
