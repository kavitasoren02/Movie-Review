const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const Watchlist = require("../models/Watchlist")
const Review = require("../models/Review")
const { auth } = require("../middleware/auth")

const router = express.Router()

// @route   GET /api/users/:id
// @desc    Get user profile and review history
// @access  Public
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Get user's reviews with movie details
    const reviews = await Review.find({ user: req.params.id })
      .populate("movie", "title posterUrl releaseYear")
      .sort({ createdAt: -1 })
      .limit(10)

    const userProfile = {
      ...user.toJSON(),
      reviewCount: await Review.countDocuments({ user: req.params.id }),
      watchlistCount: await Watchlist.countDocuments({ user: req.params.id }),
      recentReviews: reviews,
    }

    res.json(userProfile)
  } catch (error) {
    console.error("Get user profile error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put(
  "/:id",
  [
    body("username")
      .optional()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Username can only contain letters, numbers, and underscores"),
    body("email").optional().isEmail().normalizeEmail().withMessage("Please provide a valid email"),
    body("profilePicture").optional().isURL().withMessage("Profile picture must be a valid URL"),
  ],
  auth,
  async (req, res) => {
    try {
      // Check if user is updating their own profile
      if (req.user._id.toString() !== req.params.id) {
        return res.status(403).json({ message: "You can only update your own profile" })
      }

      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { username, email, profilePicture } = req.body

      // Check if username or email already exists (excluding current user)
      if (username || email) {
        const existingUser = await User.findOne({
          $and: [
            { _id: { $ne: req.params.id } },
            {
              $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
            },
          ],
        })

        if (existingUser) {
          return res.status(400).json({
            message: existingUser.email === email ? "Email already in use" : "Username already taken",
          })
        }
      }

      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          ...(username && { username }),
          ...(email && { email }),
          ...(profilePicture !== undefined && { profilePicture }),
        },
        { new: true, runValidators: true },
      )

      res.json({
        message: "Profile updated successfully",
        user: updatedUser.toJSON(),
      })
    } catch (error) {
      console.error("Update profile error:", error)
      res.status(500).json({ message: "Server error" })
    }
  },
)

// @route   GET /api/users/:id/watchlist
// @desc    Get user's watchlist
// @access  Private (own watchlist) or Public (if user allows)
router.get("/:id/watchlist", async (req, res) => {
  try {
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const watchlist = await Watchlist.find({ user: req.params.id })
      .populate("movie", "title posterUrl releaseYear genre averageRating")
      .sort({ dateAdded: -1 })
      .skip(skip)
      .limit(limit)

    const total = await Watchlist.countDocuments({ user: req.params.id })

    res.json({
      watchlist: watchlist.map((item) => ({
        _id: item._id,
        movie: item.movie,
        dateAdded: item.dateAdded,
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    })
  } catch (error) {
    console.error("Get watchlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   POST /api/users/:id/watchlist
// @desc    Add movie to watchlist
// @access  Private (own watchlist only)
router.post("/:id/watchlist", auth, async (req, res) => {
  try {
    // Check if user is adding to their own watchlist
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "You can only modify your own watchlist" })
    }

    const { movieId } = req.body

    if (!movieId) {
      return res.status(400).json({ message: "Movie ID is required" })
    }

    // Check if movie is already in watchlist
    const existingItem = await Watchlist.findOne({
      user: req.params.id,
      movie: movieId,
    })

    if (existingItem) {
      return res.status(400).json({ message: "Movie already in watchlist" })
    }

    // Add to watchlist
    const watchlistItem = new Watchlist({
      user: req.params.id,
      movie: movieId,
    })

    await watchlistItem.save()
    await watchlistItem.populate("movie", "title posterUrl releaseYear genre averageRating")

    res.status(201).json({
      message: "Movie added to watchlist",
      watchlistItem: {
        _id: watchlistItem._id,
        movie: watchlistItem.movie,
        dateAdded: watchlistItem.dateAdded,
      },
    })
  } catch (error) {
    console.error("Add to watchlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// @route   DELETE /api/users/:id/watchlist/:movieId
// @desc    Remove movie from watchlist
// @access  Private (own watchlist only)
router.delete("/:id/watchlist/:movieId", auth, async (req, res) => {
  try {
    // Check if user is removing from their own watchlist
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: "You can only modify your own watchlist" })
    }

    const watchlistItem = await Watchlist.findOneAndDelete({
      user: req.params.id,
      movie: req.params.movieId,
    })

    if (!watchlistItem) {
      return res.status(404).json({ message: "Movie not found in watchlist" })
    }

    res.json({ message: "Movie removed from watchlist" })
  } catch (error) {
    console.error("Remove from watchlist error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
