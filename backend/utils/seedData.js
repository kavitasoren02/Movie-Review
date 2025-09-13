const Movie = require("../models/Movie")
const User = require("../models/User")
const Review = require("../models/Review")

const seedMovies = async () => {
  try {
    // Check if movies already exist
    const existingMovies = await Movie.countDocuments()
    if (existingMovies > 0) {
      console.log("Movies already exist, skipping seed")
      return
    }

    // Create admin user for seeding
    let adminUser = await User.findOne({ email: "admin@moviereview.com" })
    if (!adminUser) {
      adminUser = new User({
        username: "admin",
        email: "admin@moviereview.com",
        password: "Admin123!",
        role: "admin",
      })
      await adminUser.save()
    }

    const sampleMovies = [
      {
        title: "The Shawshank Redemption",
        genre: ["Drama"],
        releaseYear: 1994,
        director: "Frank Darabont",
        cast: [
          { name: "Tim Robbins", character: "Andy Dufresne" },
          { name: "Morgan Freeman", character: "Ellis Boyd 'Red' Redding" },
        ],
        synopsis:
          "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
        duration: 142,
        posterUrl: "/shawshank-redemption-poster.png",
        addedBy: adminUser._id,
      },
      {
        title: "The Godfather",
        genre: ["Crime", "Drama"],
        releaseYear: 1972,
        director: "Francis Ford Coppola",
        cast: [
          { name: "Marlon Brando", character: "Don Vito Corleone" },
          { name: "Al Pacino", character: "Michael Corleone" },
        ],
        synopsis:
          "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
        duration: 175,
        posterUrl: "/classic-mob-poster.png",
        addedBy: adminUser._id,
      },
      {
        title: "The Dark Knight",
        genre: ["Action", "Crime", "Drama"],
        releaseYear: 2008,
        director: "Christopher Nolan",
        cast: [
          { name: "Christian Bale", character: "Bruce Wayne / Batman" },
          { name: "Heath Ledger", character: "Joker" },
        ],
        synopsis:
          "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests.",
        duration: 152,
        posterUrl: "/dark-knight-batman-movie-poster.jpg",
        addedBy: adminUser._id,
      },
      {
        title: "Pulp Fiction",
        genre: ["Crime", "Drama"],
        releaseYear: 1994,
        director: "Quentin Tarantino",
        cast: [
          { name: "John Travolta", character: "Vincent Vega" },
          { name: "Samuel L. Jackson", character: "Jules Winnfield" },
        ],
        synopsis:
          "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
        duration: 154,
        posterUrl: "/pulp-fiction-poster.png",
        addedBy: adminUser._id,
      },
      {
        title: "Forrest Gump",
        genre: ["Drama", "Romance"],
        releaseYear: 1994,
        director: "Robert Zemeckis",
        cast: [{ name: "Tom Hanks", character: "Forrest Gump" }],
        synopsis:
          "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man.",
        duration: 142,
        posterUrl: "/forrest-gump-poster.png",
        addedBy: adminUser._id,
      },
      {
        title: "Inception",
        genre: ["Action", "Sci-Fi", "Thriller"],
        releaseYear: 2010,
        director: "Christopher Nolan",
        cast: [
          { name: "Leonardo DiCaprio", character: "Dom Cobb" },
          { name: "Marion Cotillard", character: "Mal" },
        ],
        synopsis:
          "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.",
        duration: 148,
        posterUrl: "/inception-movie-poster.png",
        addedBy: adminUser._id,
      },
    ]

    await Movie.insertMany(sampleMovies)
    console.log("Sample movies seeded successfully")
  } catch (error) {
    console.error("Error seeding movies:", error)
  }
}

module.exports = { seedMovies }
