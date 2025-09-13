const Movie = require("../models/Movie")
const Review = require("../models/Review")

const updateMovieRating = async (movieId) => {
  try {
    const reviews = await Review.find({ movie: movieId })

    if (reviews.length === 0) {
      await Movie.findByIdAndUpdate(movieId, {
        averageRating: 0,
        totalReviews: 0,
      })
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
    })
  } catch (error) {
    console.error("Error updating movie rating:", error)
    throw error
  }
}

module.exports = { updateMovieRating }
