import * as React from "react"

import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none ring-offset-background focus-visible:ring-offset-0",
        variant == "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant == "destructive" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        variant == "outline" && "bg-transparent border border-input hover:bg-accent hover:text-accent-foreground",
        variant == "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        variant == "ghost" && "bg-transparent hover:bg-accent hover:text-accent-foreground",
        variant == "link" && "underline-offset-4 hover:underline text-foreground",
        size == "default" && "h-9 px-4 py-2",
        size == "sm" && "h-8 rounded-md px-3 text-xs",
        size == "lg" && "h-10 rounded-md px-8",
        size == "icon" && "h-9 w-9",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }
