import { Link } from "react-router-dom"
import Card from "../common/Card"
import StarRating from "../common/StarRating"

const MovieGrid = ({ movies, className = "" }) => {
  if (!movies || movies.length === 0) {
    return (
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
        <p className="text-gray-600">Try adjusting your search criteria</p>
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}>
      {movies.map((movie) => (
        <MovieCard key={movie._id} movie={movie} />
      ))}
    </div>
  )
}

// Movie Card Component
const MovieCard = ({ movie }) => {
  return (
    <Link to={`/movies/${movie._id}`} className="group">
      <Card className="overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg">
        <div className="aspect-[2/3] relative overflow-hidden">
          <img
            src={movie.posterUrl || "/placeholder.svg?height=400&width=300&query=movie poster"}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />

          {/* Rating Badge */}
          {movie.averageRating > 0 && (
            <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded-md text-sm font-semibold">
              ★ {movie.averageRating.toFixed(1)}
            </div>
          )}
        </div>

        <Card.Content className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
            {movie.title}
          </h3>

          <p className="text-sm text-gray-600 mb-2">
            {movie.releaseYear} • {movie.duration} min
          </p>

          <div className="flex flex-wrap gap-1 mb-3">
            {movie.genre.slice(0, 2).map((g) => (
              <span key={g} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900 bg-gray-100">
                {g}
              </span>
            ))}
            {movie.genre.length > 2 && (
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-gray-900">
                +{movie.genre.length - 2}
              </span>
            )}
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

export default MovieGrid
