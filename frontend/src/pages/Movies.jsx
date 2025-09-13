import { useState, useEffect } from "react"
import { useSearchParams, Link } from "react-router-dom"
import { moviesAPI } from "../utils/api"
import Button from "../components/common/Button"
import Input from "../components/common/Input"
import Card from "../components/common/Card"
import Loading from "../components/common/Loading"
import ErrorMessage from "../components/common/ErrorMessage"
import StarRating from "../components/common/StarRating"

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [pagination, setPagination] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    genre: searchParams.get("genre") || "",
    year: searchParams.get("year") || "",
    minRating: searchParams.get("minRating") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  })

  useEffect(() => {
    fetchGenres()
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [searchParams])

  const fetchGenres = async () => {
    try {
      const response = await moviesAPI.getGenres()
      setGenres(response.genres || [])
    } catch (error) {
      console.error("Failed to fetch genres:", error)
    }
  }

  const fetchMovies = async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const params = {
        page,
        limit: 12,
        ...Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== "")),
      }

      const response = await moviesAPI.getMovies(params)
      setMovies(response.movies || [])
      setPagination(response.pagination || {})
    } catch (error) {
      console.error("Failed to fetch movies:", error)
      setError(error.message || "Failed to load movies")
    } finally {
      setIsLoading(false)
    }
  }

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value }
    setFilters(newFilters)

    // Update URL params
    const newParams = new URLSearchParams()
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) newParams.set(key, val)
    })
    setSearchParams(newParams)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchMovies(1)
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      genre: "",
      year: "",
      minRating: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    })
    setSearchParams({})
  }

  const handlePageChange = (page) => {
    fetchMovies(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={() => fetchMovies()} />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Movies</h1>
        <p className="text-gray-600">Discover and explore our collection of movies</p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <Card.Content className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                placeholder="Search movies..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />

              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                value={filters.genre}
                onChange={(e) => handleFilterChange("genre", e.target.value)}
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>

              <Input
                type="number"
                placeholder="Year"
                min="1900"
                max={new Date().getFullYear() + 5}
                value={filters.year}
                onChange={(e) => handleFilterChange("year", e.target.value)}
              />

              <select
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                value={filters.minRating}
                onChange={(e) => handleFilterChange("minRating", e.target.value)}
              >
                <option value="">Any Rating</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Sort by:</label>
                <select
                  className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm w-auto placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                >
                  <option value="createdAt">Date Added</option>
                  <option value="title">Title</option>
                  <option value="releaseYear">Release Year</option>
                  <option value="averageRating">Rating</option>
                </select>
                <select
                  className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm w-auto placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>

              <div className="flex space-x-2">
                <Button type="submit" size="sm">
                  Search
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </form>
        </Card.Content>
      </Card>

      {/* Movies Grid */}
      {isLoading ? (
        <Loading text="Loading movies..." />
      ) : movies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 011 1v1a1 1 0 01-1 1h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7H3a1 1 0 01-1-1V5a1 1 0 011-1h4zM9 3v1h6V3H9zm0 4v10h6V7H9z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No movies found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
          <Button onClick={clearFilters}>Clear Filters</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
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

// Movie Card Component
const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie._id}`} className="group">
      <Card className="overflow-hidden transition-transform hover:scale-105 hover:shadow-lg">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={movie.posterUrl || "/placeholder.svg?height=400&width=300&query=movie poster"}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
        </div>
        <Card.Content className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {movie.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
            {movie.releaseYear} • {movie.duration} min
          </p>
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genre.slice(0, 2).map((g) => (
              <span key={g} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900 bg-gray-100">
                {g}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between">
            <StarRating rating={movie.averageRating} readonly size="sm" />
            <span className="text-sm text-gray-500">
              {movie.totalReviews} review{movie.totalReviews !== 1 ? "s" : ""}
            </span>
          </div>
        </Card.Content>
      </Card>
    </Link>
  )
}

export default Movies
