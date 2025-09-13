import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { moviesAPI, reviewsAPI, usersAPI } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import Loading from "../components/common/Loading"
import ErrorMessage from "../components/common/ErrorMessage"
import StarRating from "../components/common/StarRating"
import Textarea from "../components/common/Textarea"
import ReviewList from "../components/reviews/ReviewList"

const MovieDetail = () => {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [movie, setMovie] = useState(null)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isInWatchlist, setIsInWatchlist] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  useEffect(() => {
    if (id) {
      fetchMovieData()
    }
  }, [id])

  useEffect(() => {
    if (user && movie) {
      checkWatchlistStatus()
      checkUserReview()
    }
  }, [user, movie, reviews])

  const fetchMovieData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await moviesAPI.getMovie(id)
      setMovie(response.movie)
      setReviews(response.reviews || [])
    } catch (error) {
      console.error("Failed to fetch movie:", error)
      setError(error.message || "Failed to load movie")
    } finally {
      setIsLoading(false)
    }
  }

  const checkWatchlistStatus = async () => {
    try {
      const response = await usersAPI.getWatchlist(user._id)
      const inWatchlist = response.watchlist.some((item) => item.movie._id === id)
      setIsInWatchlist(inWatchlist)
    } catch (error) {
      console.error("Failed to check watchlist status:", error)
    }
  }

  const checkUserReview = () => {
    const existingReview = reviews.find((review) => review.user._id === user._id)
    setUserReview(existingReview)
  }

  const handleWatchlistToggle = async () => {
    try {
      if (isInWatchlist) {
        await usersAPI.removeFromWatchlist(user._id, id)
        setIsInWatchlist(false)
      } else {
        await usersAPI.addToWatchlist(user._id, id)
        setIsInWatchlist(true)
      }
    } catch (error) {
      console.error("Failed to update watchlist:", error)
    }
  }

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await reviewsAPI.createReview(id, reviewData)
      setReviews((prev) => [response.review, ...prev])
      setUserReview(response.review)
      setShowReviewForm(false)

      // Refresh movie data to get updated rating
      await fetchMovieData()
    } catch (error) {
      console.error("Failed to submit review:", error)
      throw error
    }
  }

  const handleReviewUpdate = async () => {
    // Refresh movie and reviews data
    await fetchMovieData()
  }

  if (isLoading) {
    return <Loading text="Loading movie details..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchMovieData} />
  }

  if (!movie) {
    return <ErrorMessage message="Movie not found" />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Movie Poster */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <img
              src={movie.posterUrl || "/placeholder.svg?height=600&width=400&query=movie poster"}
              alt={movie.title}
              className="w-full rounded-lg shadow-lg"
            />

            {isAuthenticated && (
              <div className="mt-4 space-y-3">
                <Button
                  className="w-full"
                  variant={isInWatchlist ? "secondary" : "primary"}
                  onClick={handleWatchlistToggle}
                >
                  {isInWatchlist ? (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                      </svg>
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                        />
                      </svg>
                      Add to Watchlist
                    </>
                  )}
                </Button>

                {!userReview && (
                  <Button className="w-full bg-transparent" variant="outline" onClick={() => setShowReviewForm(true)}>
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                    Write a Review
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Movie Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Basic Info */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{movie.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="text-lg text-gray-600">{movie.releaseYear}</span>
              <span className="text-lg text-gray-600">{movie.duration} minutes</span>
              <div className="flex items-center space-x-2">
                <StarRating rating={movie.averageRating} readonly />
                <span className="text-sm text-gray-600">
                  ({movie.totalReviews} review{movie.totalReviews !== 1 ? "s" : ""})
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.slice(0, 2).map((g) => (
                  <span key={g} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900 bg-gray-100">
                    {g}
                  </span>
                ))}
                {movie.genre.length > 2 && (
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900">+{movie.genre.length - 2}</span>
                )}
            </div>

            <p className="text-lg text-gray-700 leading-relaxed mb-6">{movie.synopsis}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Director</h3>
                <p className="text-gray-700">{movie.director}</p>
              </div>

              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Cast</h3>
                  <div className="space-y-1">
                    {movie.cast.slice(0, 5).map((actor, index) => (
                      <p key={index} className="text-gray-700">
                        <span className="font-medium">{actor.name}</span>
                        {actor.character && <span className="text-gray-500"> as {actor.character}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Trailer */}
          {movie.trailerUrl && (
            <Card>
              <Card.Header>
                <Card.Title>Trailer</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="aspect-video">
                  <iframe
                    src={movie.trailerUrl}
                    title={`${movie.title} Trailer`}
                    className="w-full h-full rounded-lg"
                    allowFullScreen
                  />
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Review Form */}
          {showReviewForm && <ReviewForm onSubmit={handleReviewSubmit} onCancel={() => setShowReviewForm(false)} />}

          {/* User's Review */}
          {userReview && (
            <Card>
              <Card.Header>
                <Card.Title>Your Review</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="flex items-center space-x-2 mb-3">
                  <StarRating rating={userReview.rating} readonly />
                  <span className="text-sm text-gray-600">{new Date(userReview.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700">{userReview.reviewText}</p>
              </Card.Content>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <Card.Header>
              <Card.Title>Reviews ({reviews.length})</Card.Title>
            </Card.Header>
            <Card.Content>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No reviews yet. Be the first to review this movie!</p>
                  {isAuthenticated && !userReview && (
                    <Button className="mt-4" onClick={() => setShowReviewForm(true)}>
                      Write the First Review
                    </Button>
                  )}
                </div>
              ) : (
                <ReviewList movieId={id} reviews={reviews} onReviewUpdate={handleReviewUpdate} />
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </div>
  )
}

// Review Form Component
const ReviewForm = ({ onSubmit, onCancel }) => {
  const [rating, setRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters long")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      await onSubmit({ rating, reviewText: reviewText.trim() })
    } catch (error) {
      setError(error.message || "Failed to submit review")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <Card.Header>
        <Card.Title>Write a Review</Card.Title>
      </Card.Header>
      <Card.Content>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating *</label>
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>

          <Textarea
            label="Review"
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your thoughts about this movie..."
            rows={4}
            required
          />

          <div className="flex space-x-4">
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              Submit Review
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </Card.Content>
    </Card>
  )
}

export default MovieDetail
