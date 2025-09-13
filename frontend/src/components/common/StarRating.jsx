import { useState } from "react"

const StarRating = ({ rating = 0, onRatingChange, readonly = false, size = "md" }) => {
  const [hoverRating, setHoverRating] = useState(0)

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const handleClick = (value) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value)
    }
  }

  const handleMouseEnter = (value) => {
    if (!readonly) {
      setHoverRating(value)
    }
  }

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0)
    }
  }

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hoverRating || rating)

        return (
          <button
            key={star}
            type="button"
            className={`transition-colors ${readonly ? "cursor-default" : "cursor-pointer"}`}
            onClick={() => handleClick(star)}
            onMouseEnter={() => handleMouseEnter(star)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              className={`${sizes[size]} ${
                filled ? "fill-yellow-400" : "fill-gray-300"
              }`}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 
                1.371 1.24.588 1.81l-2.8 2.034a1 1 0 
                00-.364 1.118l1.07 3.292c.3.921-.755 
                1.688-1.54 1.118l-2.8-2.034a1 1 0 
                00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 
                1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 
                1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        )
      })}
    </div>
  )
}

export default StarRating
