
// Import React and utility functions
import * as React from "react"
import { cn } from "@/lib/utils" // Utility function for combining class names

// Main modern card component
const ModernCard = React.forwardRef<
  HTMLDivElement, // The ref will point to a div element
  React.HTMLAttributes<HTMLDivElement> // Accept all standard div props
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Base styles for modern card appearance
      "bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200",
      className // Allow custom classes to be added
    )}
    {...props} // Spread any additional props
  />
))
ModernCard.displayName = "ModernCard" // Set display name for debugging

// Card header section component
const ModernCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6 pb-4", // Flex column layout with spacing and padding
      className
    )}
    {...props}
  />
))
ModernCardHeader.displayName = "ModernCardHeader"

// Card title component
const ModernCardTitle = React.forwardRef<
  HTMLParagraphElement, // Ref type
  React.HTMLAttributes<HTMLHeadingElement> // Props type (heading attributes)
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      // Large, semibold heading with tight tracking
      "text-lg font-semibold leading-none tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
ModernCardTitle.displayName = "ModernCardTitle"

// Card description/subtitle component
const ModernCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      "text-sm text-gray-500", // Small, muted gray text
      className
    )}
    {...props}
  />
))
ModernCardDescription.displayName = "ModernCardDescription"

// Card content/body component
const ModernCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "p-6 pt-0", // Padding on all sides except top (since header has bottom padding)
      className
    )} 
    {...props} 
  />
))
ModernCardContent.displayName = "ModernCardContent"

// Export all card components for use in other files
export { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardDescription, ModernCardContent }
