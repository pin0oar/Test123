
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"], // Enable class-based dark mode switching
	content: [
		// Specify which files Tailwind should scan for class names
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "", // No prefix for Tailwind classes
	theme: {
		container: {
			// Configure container component
			center: true,          // Center containers
			padding: '2rem',       // Add padding to containers
			screens: {
				'2xl': '1400px'    // Set max width for 2xl screens
			}
		},
		extend: {
			colors: {
				// Extend Tailwind's color palette with CSS custom properties
				// These colors will automatically adapt to light/dark themes
				
				border: 'hsl(var(--border))',     // Dynamic border color
				input: 'hsl(var(--input))',       // Input field border color
				ring: 'hsl(var(--ring))',         // Focus ring color
				background: 'hsl(var(--background))', // Page background
				foreground: 'hsl(var(--foreground))', // Text color
				
				// Primary brand colors
				primary: {
					DEFAULT: 'hsl(var(--primary))',           // Main brand color
					foreground: 'hsl(var(--primary-foreground))' // Text on primary color
				},
				
				// Secondary colors for less prominent elements
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				
				// Destructive colors for errors and dangerous actions
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				
				// Muted colors for subtle elements
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				
				// Accent colors for highlights and interactive states
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				
				// Popover and dropdown colors
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				
				// Card component colors
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				
				// Sidebar-specific color scheme
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',      // Sidebar background
					foreground: 'hsl(var(--sidebar-foreground))',   // Sidebar text
					primary: 'hsl(var(--sidebar-primary))',         // Active sidebar items
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))', // Text on active items
					accent: 'hsl(var(--sidebar-accent))',           // Hover states
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',   // Text on hover
					border: 'hsl(var(--sidebar-border))',           // Sidebar borders
					ring: 'hsl(var(--sidebar-ring))'                // Sidebar focus rings
				}
			},
			
			// Border radius values using CSS custom properties
			borderRadius: {
				lg: 'var(--radius)',                    // Large radius (12px)
				md: 'calc(var(--radius) - 2px)',      // Medium radius (10px)
				sm: 'calc(var(--radius) - 4px)'       // Small radius (8px)
			},
			
			// Font family configuration
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'], // Modern, clean font stack
			},
			
			// Enhanced box shadow variants
			boxShadow: {
				'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
				'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'modern': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'modern-lg': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
			},
			
			// Animation keyframes for smooth interactions
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(10px)' },
					to: { opacity: '1', transform: 'translateY(0)' }
				},
				'slide-in': {
					from: { transform: 'translateX(-100%)' },
					to: { transform: 'translateX(0)' }
				}
			},
			
			// Animation classes
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")], // Add animation utilities
} satisfies Config;
