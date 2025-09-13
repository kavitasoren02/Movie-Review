import { useState } from "react"
import { reviewsAPI } from "../../utils/api"
import { useAuth } from "../../context/AuthContext"
import Button from "../common/Button"
import StarRating from "../common/StarRating"
import Textarea from "../common/Textarea"

const ReviewList = ({ movieId, reviews, onReviewUpdate }) => {
  const { user, isAuthenticated } = useAuth()
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [editingReview, setEditingReview] = useState(null)

  const sortedReviews = [...reviews].sort((a, b) => {
    let aValue = a[sortBy]
    let bValue = b[sortBy]

    if (sortBy === "createdAt") {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1
    } else {
      return aValue < bValue ? 1 : -1
    }
  })

  const handleHelpfulVote = async (reviewId) => {
    if (!isAuthenticated) return

    try {
      const response = await reviewsAPI.markHelpful(reviewId)
      onReviewUpdate()
    } catch (error) {
      console.error("Failed to vote helpful:", error)
    }
  }

  const handleEditReview = (review) => {
    setEditingReview(review)
  }

  const handleUpdateReview = async (reviewId, reviewData) => {
    try {
      await reviewsAPI.updateReview(reviewId, reviewData)
      setEditingReview(null)
      onReviewUpdate()
    } catch (error) {
      console.error("Failed to update review:", error)
      throw error
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return

    try {
      await reviewsAPI.deleteReview(reviewId)
      onReviewUpdate()
    } catch (error) {
      console.error("Failed to delete review:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Sort Controls */}
      {reviews.length > 1 && (
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Sort by:</span>
          <select className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm w-auto placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="createdAt">Date</option>
            <option value="rating">Rating</option>
            <option value="helpfulCount">Helpful</option>
          </select>
          <select className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm w-auto placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      )}

      {/* Reviews */}
      <div className="space-y-6">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review._id}
            review={review}
            currentUser={user}
            isAuthenticated={isAuthenticated}
            isEditing={editingReview?._id === review._id}
            onEdit={() => handleEditReview(review)}
            onUpdate={handleUpdateReview}
            onDelete={() => handleDeleteReview(review._id)}
            onCancelEdit={() => setEditingReview(null)}
            onHelpfulVote={() => handleHelpfulVote(review._id)}
          />
        ))}
      </div>
    </div>
  )
}

// Review Card Component
const ReviewCard = ({
  review,
  currentUser,
  isAuthenticated,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
  onHelpfulVote,
}) => {
  const [editData, setEditData] = useState({
    rating: review.rating,
    reviewText: review.reviewText,
  })
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState("")

  const isOwner = currentUser && currentUser._id === review.user._id
  const hasVotedHelpful = isAuthenticated && review.helpful?.includes(currentUser._id)

  const handleUpdate = async (e) => {
    e.preventDefault()

    if (editData.rating === 0) {
      setError("Please select a rating")
      return
    }

    if (editData.reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long")
      return
    }

    setIsUpdating(true)
    setError("")

    try {
      await onUpdate(review._id, editData)
    } catch (error) {
      setError(error.message || "Failed to update review")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isEditing) {
    return (
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
        <h4 className="font-semibold text-gray-900 mb-4">Edit Review</h4>

        <form onSubmit={handleUpdate} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <StarRating rating={editData.rating} onRatingChange={(rating) => setEditData({ ...editData, rating })} />
          </div>

          <Textarea
            label="Review"
            value={editData.reviewText}
            onChange={(e) => setEditData({ ...editData, reviewText: e.target.value })}
            rows={4}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" size="sm" loading={isUpdating} disabled={isUpdating}>
              Update Review
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={onCancelEdit}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div className="border-b border-gray-200 pb-6 last:border-b-0">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {review.user.profilePicture ? (
            <img
              src={review.user.profilePicture || "/placeholder.svg"}
              alt={review.user.username}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="h-10 w-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
              <span className="font-semibold">{review.user.username.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <h4 className="font-semibold text-gray-900">{review.user.username}</h4>
              <StarRating rating={review.rating} readonly size="sm" />
              <span className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>

            {isOwner && (
              <div className="flex space-x-2">
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
                  Delete
                </Button>
              </div>
            )}
          </div>

          <p className="text-gray-700 leading-relaxed mb-4">{review.reviewText}</p>

          <div className="flex items-center space-x-4">
            {isAuthenticated && !isOwner && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHelpfulVote}
                className={`flex items-center space-x-1 ${
                  hasVotedHelpful ? "text-blue-600" : "text-gray-600"
                } hover:text-blue-600`}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4h-2m-2-2h2m0 0V9a2 2 0 012-2h2"
                  />
                </svg>
                <span>{hasVotedHelpful ? "Helpful" : "Mark as helpful"}</span>
              </Button>
            )}

            {review.helpfulCount > 0 && (
              <span className="text-sm text-gray-600">
                {review.helpfulCount} {review.helpfulCount === 1 ? "person" : "people"} found this helpful
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewList
