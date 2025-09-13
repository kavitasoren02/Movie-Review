import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { moviesAPI } from "../utils/api"
import Button from "../components/common/Button"
import Card from "../components/common/Card"
import Loading from "../components/common/Loading"
import ErrorMessage from "../components/common/ErrorMessage"
import StarRating from "../components/common/StarRating"

const Home = () => {
  const [featuredMovies, setFeaturedMovies] = useState([])
  const [trendingMovies, setTrendingMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHomeData()
  }, [])

  const fetchHomeData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Fetch featured movies (first page includes featured movies)
      const response = await moviesAPI.getMovies({ limit: 12 })
      setFeaturedMovies(response.featuredMovies || [])

      // Fetch trending movies (highest rated recent movies)
      const trendingResponse = await moviesAPI.getMovies({
        sortBy: "averageRating",
        sortOrder: "desc",
        limit: 8,
      })
      setTrendingMovies(trendingResponse.movies || [])
    } catch (error) {
      console.error("Failed to fetch home data:", error)
      setError(error.message || "Failed to load movies")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <Loading text="Loading movies..." />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchHomeData} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Discover Amazing Movies</h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Read reviews, rate films, and build your perfect watchlist. Join thousands of movie enthusiasts sharing
              their passion for cinema.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/movies">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Movies
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-white hover:bg-white hover:text-[#2563eb] bg-transparent"
                >
                  Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Movies */}
      {featuredMovies.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Featured Movies</h2>
              <Link to="/movies">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {featuredMovies.slice(0, 6).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending Movies */}
      {trendingMovies.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Trending Now</h2>
              <Link to="/movies?sortBy=averageRating&sortOrder=desc">
                <Button variant="outline">View All</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {trendingMovies.slice(0, 8).map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Movie Journey?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join our community of movie lovers. Share your thoughts, discover new films, and connect with fellow
            cinephiles.
          </p>
          <Link to="/register">
            <Button size="lg" variant="primary">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>
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
          <p className="text-sm text-gray-600 mb-2">{movie.releaseYear}</p>
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

export default Home
