import { forwardRef } from "react"

const Button = forwardRef(
  (
    { children, variant = "primary", size = "md", disabled = false, loading = false, className = "", ...props },
    ref,
  ) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
      primary: "bg-[#2563eb] text-white hover:bg-primary-700 active:bg-[#1e40af]",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300",
      outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100",
      ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    }

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-6 text-base",
    }

    const spinnerSizes = {
      sm: "h-4 w-4",
      md: "h-4 w-4",
      lg: "h-5 w-5",
    }

    const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`.trim()

    return (
      <button ref={ref} className={classes} disabled={disabled || loading} {...props}>
        {loading && <span className={`inline-block animate-spin rounded-full border-2 border-current border-r-transparent mr-2 ${spinnerSizes[size]}`} />}
        {children}
      </button>
    )
  },
)

Button.displayName = "Button"

export default Button
