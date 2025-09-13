const mongoose = require("mongoose")

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    helpfulCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

// Ensure one review per user per movie
reviewSchema.index({ user: 1, movie: 1 }, { unique: true })

module.exports = mongoose.model("Review", reviewSchema)
