const mongoose = require("mongoose")

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    genre: [
      {
        type: String,
        required: true,
      },
    ],
    releaseYear: {
      type: Number,
      required: true,
      min: 1900,
      max: new Date().getFullYear() + 5,
    },
    director: {
      type: String,
      required: true,
      trim: true,
    },
    cast: [
      {
        name: String,
        character: String,
      },
    ],
    synopsis: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    posterUrl: {
      type: String,
      default: "",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    duration: {
      type: Number, // in minutes
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    tmdbId: {
      type: String,
      unique: true,
      sparse: true,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index for search functionality
movieSchema.index({ title: "text", director: "text", genre: "text" })
movieSchema.index({ genre: 1 })
movieSchema.index({ releaseYear: 1 })
movieSchema.index({ averageRating: -1 })

module.exports = mongoose.model("Movie", movieSchema)
