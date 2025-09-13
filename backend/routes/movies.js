const express = require("express")
const { body, query, validationResult } = require("express-validator")
const Movie = require("../models/Movie")
const Review = require("../models/Review")
const { auth, adminAuth } = require("../middleware/auth")
const { handleValidationErrors } = require("../middleware/validation")

const router = express.Router()

// @route   GET /api/movies
// @desc    Get all movies with pagination and filtering
// @access  Public
router.get(
  "/",
  [
    query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
    query("limit").optional().isInt({ min: 1, max: 50 }).withMessage("Limit must be between 1 and 50"),
    query("genre").optional().isString().withMessage("Genre must be a string"),
    query("year").optional().isInt({ min: 1900 }).withMessage("Year must be a valid year"),
    query("minRating").optional().isFloat({ min: 0, max: 5 }).withMessage("Min rating must be between 0 and 5"),
    query("maxRating").optional().isFloat({ min: 0, max: 5 }).withMessage("Max rating must be between 0 and 5"),
    query("search").optional().isString().withMessage("Search must be a string"),
    query("sortBy")
      .optional()
      .isIn(["title", "releaseYear", "averageRating", "createdAt"])
      .withMessage("Invalid sort field"),
    query("sortOrder").optional().isIn(["asc", "desc"]).withMessage("Sort order must be asc or desc"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1
      const limit = Number.parseInt(req.query.limit) || 12
      const skip = (page - 1) * limit

      // Build filter object
      const filter = {}

      if (req.query.genre) {
        filter.genre = { $in: [req.query.genre] }
      }

      if (req.query.year) {
        filter.releaseYear = Number.parseInt(req.query.year)
      }

      if (req.query.minRating || req.query.maxRating) {
        filter.averageRating = {}
        if (req.query.minRating) {
          filter.averageRating.$gte = Number.parseFloat(req.query.minRating)
        }
        if (req.query.maxRating) {
          filter.averageRating.$lte = Number.parseFloat(req.query.maxRating)
        }
      }

      if (req.query.search) {
        filter.$text = { $search: req.query.search }
      }

      // Build sort object
      const sortBy = req.query.sortBy || "createdAt"
      const sortOrder = req.query.sortOrder === "asc" ? 1 : -1
      const sort = { [sortBy]: sortOrder }

      // If sorting by text search relevance
      if (req.query.search && !req.query.sortBy) {
        sort.score = { $meta: "textScore" }
      }

      const movies = await Movie.find(filter)
        .select("title genre releaseYear director posterUrl averageRating totalReviews duration")
        .sort(sort)
        .skip(skip)
        .limit(limit)

      const total = await Movie.countDocuments(filter)

      // Get featured movies (highest rated with at least 5 reviews)
      let featuredMovies = []
      if (page === 1 && !req.query.search && !req.query.genre) {
        featuredMovies = await Movie.find({ totalReviews: { $gte: 5 } })
          .select("title genre releaseYear director posterUrl averageRating totalReviews")
          .sort({ averageRating: -1 })
          .limit(6)
      }

      res.json({
        movies,
        featuredMovies,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
        filters: {
          genre: req.query.genre,
          year: req.query.year,
          minRating: req.query.minRating,
          maxRating: req.query.maxRating,
          search: req.query.search,
        },
      })
    } catch (error) {
      console.error("Get movies error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   GET /api/movies/genres
// @desc    Get all available genres
// @access  Public
router.get("/genres", async (req, res) => {
  try {
    const genres = await Movie.distinct("genre")
    res.json({
      genres: genres
        .flat()
        .filter((genre, index, arr) => arr.indexOf(genre) === index)
        .sort(),
    })
  } catch (error) {
    console.error("Get genres error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   GET /api/movies/:id
// @desc    Get specific movie with reviews
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("addedBy", "username")

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" })
    }

    // Get reviews for this movie
    const reviews = await Review.find({ movie: req.params.id })
      .populate("user", "username profilePicture")
      .sort({ createdAt: -1 })

    res.json({
      movie,
      reviews,
    })
  } catch (error) {
    console.error("Get movie error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Movie not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/movies
// @desc    Add a new movie (admin only)
// @access  Private (Admin)
router.post(
  "/",
  [
    body("title").notEmpty().trim().withMessage("Title is required"),
    body("genre").isArray({ min: 1 }).withMessage("At least one genre is required"),
    body("releaseYear")
      .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
      .withMessage("Release year must be valid"),
    body("director").notEmpty().trim().withMessage("Director is required"),
    body("synopsis").notEmpty().isLength({ max: 2000 }).withMessage("Synopsis is required (max 2000 characters)"),
    body("duration").isInt({ min: 1 }).withMessage("Duration must be a positive number"),
    body("cast").optional().isArray().withMessage("Cast must be an array"),
    body("posterUrl").optional().isURL().withMessage("Poster URL must be valid"),
    body("trailerUrl").optional().isURL().withMessage("Trailer URL must be valid"),
  ],
  adminAuth,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { title, genre, releaseYear, director, cast, synopsis, posterUrl, trailerUrl, duration, tmdbId } = req.body

      // Check if movie already exists
      const existingMovie = await Movie.findOne({
        $or: [{ title, releaseYear }, ...(tmdbId ? [{ tmdbId }] : [])],
      })

      if (existingMovie) {
        return res.status(400).json({ message: "Movie already exists" })
      }

      const movie = new Movie({
        title,
        genre,
        releaseYear,
        director,
        cast: cast || [],
        synopsis,
        posterUrl: posterUrl || "",
        trailerUrl: trailerUrl || "",
        duration,
        tmdbId,
        addedBy: req.user._id,
      })

      await movie.save()
      await movie.populate("addedBy", "username")

      res.status(201).json({
        message: "Movie added successfully",
        movie,
      })
    } catch (error) {
      console.error("Add movie error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   PUT /api/movies/:id
// @desc    Update movie (admin only)
// @access  Private (Admin)
router.put(
  "/:id",
  [
    body("title").optional().notEmpty().trim().withMessage("Title cannot be empty"),
    body("genre").optional().isArray({ min: 1 }).withMessage("At least one genre is required"),
    body("releaseYear")
      .optional()
      .isInt({ min: 1900, max: new Date().getFullYear() + 5 })
      .withMessage("Release year must be valid"),
    body("director").optional().notEmpty().trim().withMessage("Director cannot be empty"),
    body("synopsis")
      .optional()
      .notEmpty()
      .isLength({ max: 2000 })
      .withMessage("Synopsis cannot be empty (max 2000 characters)"),
    body("duration").optional().isInt({ min: 1 }).withMessage("Duration must be a positive number"),
    body("cast").optional().isArray().withMessage("Cast must be an array"),
    body("posterUrl").optional().isURL().withMessage("Poster URL must be valid"),
    body("trailerUrl").optional().isURL().withMessage("Trailer URL must be valid"),
  ],
  adminAuth,
  handleValidationErrors,
  async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id)
      if (!movie) {
        return res.status(404).json({ message: "Movie not found" })
      }

      const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      }).populate("addedBy", "username")

      res.json({
        message: "Movie updated successfully",
        movie: updatedMovie,
      })
    } catch (error) {
      console.error("Update movie error:", error)
      if (error.name === "CastError") {
        return res.status(404).json({ message: "Movie not found" })
      }
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   DELETE /api/movies/:id
// @desc    Delete movie (admin only)
// @access  Private (Admin)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id)
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" })
    }

    // Delete all reviews for this movie
    await Review.deleteMany({ movie: req.params.id })

    // Delete the movie
    await Movie.findByIdAndDelete(req.params.id)

    res.json({ message: "Movie and associated reviews deleted successfully" })
  } catch (error) {
    console.error("Delete movie error:", error)
    if (error.name === "CastError") {
      return res.status(404).json({ message: "Movie not found" })
    }
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
