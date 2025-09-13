const express = require("express")
const { body, validationResult } = require("express-validator")
const Review = require("../models/Review")
const Movie = require("../models/Movie")
const mongoose = require("mongoose") // Import mongoose
const { auth } = require("../middleware/auth")
const { updateMovieRating } = require("../utils/updateMovieRating")
const { handleValidationErrors } = require("../middleware/validation")

const router = express.Router()

// @route   GET /api/movies/:movieId/reviews
// @desc    Get reviews for a specific movie
// @access  Public
router.get("/:movieId/reviews", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const sortBy = req.query.sortBy || "createdAt"
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1

    // Validate sort options
    const validSortFields = ["createdAt", "rating", "helpfulCount"]
    if (!validSortFields.includes(sortBy)) {
      return res.status(400).json({ message: "Invalid sort field" })
    }

    const reviews = await Review.find({ movie: req.params.movieId })
      .populate("user", "username profilePicture")
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)

    const total = await Review.countDocuments({ movie: req.params.movieId })

    // Calculate rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: { movie: mongoose.Types.ObjectId(req.params.movieId) } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    res.json({
      reviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      ratingDistribution,
    })
  } catch (error) {
    console.error("Get reviews error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/movies/:movieId/reviews
// @desc    Submit a new review for a movie
// @access  Private
router.post(
  "/:movieId/reviews",
  [
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("reviewText")
      .notEmpty()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review text must be between 10 and 2000 characters"),
  ],
  auth,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { rating, reviewText } = req.body

      // Check if movie exists
      const movie = await Movie.findById(req.params.movieId)
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" })
      }

      // Check if user already reviewed this movie
      const existingReview = await Review.findOne({
        user: req.user._id,
        movie: req.params.movieId,
      })

      if (existingReview) {
        return res.status(400).json({ message: "You have already reviewed this movie" })
      }

      // Create new review
      const review = new Review({
        user: req.user._id,
        movie: req.params.movieId,
        rating,
        reviewText,
      })

      await review.save()
      await review.populate("user", "username profilePicture")

      // Update movie's average rating
      await updateMovieRating(req.params.movieId)

      res.status(201).json({
        message: "Review submitted successfully",
        review,
      })
    } catch (error) {
      console.error("Submit review error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private (review owner only)
router.put(
  "/:id",
  [
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("reviewText")
      .optional()
      .isLength({ min: 10, max: 2000 })
      .withMessage("Review text must be between 10 and 2000 characters"),
  ],
  auth,
  handleValidationErrors,
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id)
      if (!review) {
        return res.status(404).json({ message: "Review not found" })
      }

      // Check if user owns this review
      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "You can only edit your own reviews" })
      }

      const { rating, reviewText } = req.body

      // Update review
      const updatedReview = await Review.findByIdAndUpdate(
        req.params.id,
        {
          ...(rating && { rating }),
          ...(reviewText && { reviewText }),
        },
        { new: true, runValidators: true },
      ).populate("user", "username profilePicture")

      // Update movie's average rating if rating changed
      if (rating) {
        await updateMovieRating(review.movie)
      }

      res.json({
        message: "Review updated successfully",
        review: updatedReview,
      })
    } catch (error) {
      console.error("Update review error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private (review owner only)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user owns this review
    if (review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews" })
    }

    const movieId = review.movie

    // Delete review
    await Review.findByIdAndDelete(req.params.id)

    // Update movie's average rating
    await updateMovieRating(movieId)

    res.json({ message: "Review deleted successfully" })
  } catch (error) {
    console.error("Delete review error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/reviews/:id/helpful
// @desc    Mark a review as helpful
// @access  Private
router.post("/:id/helpful", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
    if (!review) {
      return res.status(404).json({ message: "Review not found" })
    }

    // Check if user already marked this review as helpful
    const alreadyHelpful = review.helpful.includes(req.user._id)

    if (alreadyHelpful) {
      // Remove from helpful
      review.helpful = review.helpful.filter((userId) => userId.toString() !== req.user._id.toString())
      review.helpfulCount = Math.max(0, review.helpfulCount - 1)
    } else {
      // Add to helpful
      review.helpful.push(req.user._id)
      review.helpfulCount += 1
    }

    await review.save()

    res.json({
      message: alreadyHelpful ? "Removed from helpful" : "Marked as helpful",
      helpful: !alreadyHelpful,
      helpfulCount: review.helpfulCount,
    })
  } catch (error) {
    console.error("Mark helpful error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
