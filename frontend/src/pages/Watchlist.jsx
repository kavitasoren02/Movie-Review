import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { usersAPI } from "../utils/api"
import { useAuth } from "../context/AuthContext"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import Loading from "../components/common/Loading"
import ErrorMessage from "../components/common/ErrorMessage"
import StarRating from "../components/common/StarRating"

const Watchlist = () => {
  const { user } = useAuth()
  const [watchlist, setWatchlist] = useState([])
  const [pagination, setPagination] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      fetchWatchlist()
    }
  }, [user])

  const fetchWatchlist = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await usersAPI.getWatchlist(user._id, { page, limit: 12 })
      setWatchlist(response.watchlist || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error("Failed to fetch watchlist:", error)
      setError(error.message || "Failed to load watchlist")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveFromWatchlist = async (movieId) => {
    try {
      await usersAPI.removeFromWatchlist(user._id, movieId)
      setWatchlist((prev) => prev.filter((item) => item.movie._id !== movieId))
    } catch (error) {
      console.error("Failed to remove from watchlist:", error)
    }
  }

  const handlePageChange = (page) => {
    fetchWatchlist(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isLoading) {
    return <Loading text="Loading your watchlist..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchWatchlist()} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">My Watchlist</h1>
        <p className="text-gray-600">Movies you want to watch</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Your watchlist is empty</h3>
          <p className="text-gray-600 mb-4">Start adding movies you want to watch</p>
          <Link to="/movies">
            <Button>Browse Movies</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {watchlist.map((item) => (
              <WatchlistCard key={item._id} item={item} onRemove={() => handleRemoveFromWatchlist(item.movie._id)} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPrev}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  const isActive = page === pagination.currentPage
                  return (
                    <Button
                      key={page}
                      variant={isActive ? "primary" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNext}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Watchlist Card Component
const WatchlistCard = ({ item, onRemove }) => {
  const { movie, dateAdded } = item

  return (
    <Card className="overflow-hidden group">
      <div className="aspect-[2/3] relative overflow-hidden">
        <Link to={`/movies/${movie._id}`}>
          <img
            src={movie.posterUrl || "/placeholder.svg?height=400&width=300&query=movie poster"}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </Link>
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Remove from watchlist"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <Card.Content className="p-4">
        <Link to={`/movies/${movie._id}`}>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {movie.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 mb-2">{movie.releaseYear}</p>

        <div className="flex flex-wrap gap-1 mb-2">
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900 bg-gray-100">
              {g}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between mb-2">
          <StarRating rating={movie.averageRating} readonly size="sm" />
          <span className="text-sm text-gray-500">
            {movie.totalReviews} review{movie.totalReviews !== 1 ? "s" : ""}
          </span>
        </div>

        <p className="text-xs text-gray-500">Added {new Date(dateAdded).toLocaleDateString()}</p>
      </Card.Content>
    </Card>
  )
}

export default Watchlist
