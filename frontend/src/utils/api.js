import axios from "axios"

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle common errors
    const excludeRoute = ["/auth/me", "/auth/login"];

    const REDIRECT_STATUS_CODES = [401, 403, 429];
    if (
        error.response &&
        REDIRECT_STATUS_CODES.includes(error.response.status) && !excludeRoute.includes(error?.config?.url) // redirect if api gives 401, 403, 429 and api call not from /users/info
    ) {
        window.location.href = "/"
    }

    return Promise.reject(error)
  },
)

// API methods
export const _get = async (url, config = {}) => {
  try {
    const response = await api.get(url, config)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const _post = async (url, data = {}, config = {}) => {
  try {
    const response = await api.post(url, data, config)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const _put = async (url, data = {}, config = {}) => {
  try {
    const response = await api.put(url, data, config)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

export const _delete = async (url, config = {}) => {
  try {
    const response = await api.delete(url, config)
    return response.data
  } catch (error) {
    throw error.response?.data || error
  }
}

// Auth API methods
export const authAPI = {
  register: (userData) => _post("/auth/register", userData),
  login: (credentials) => _post("/auth/login", credentials),
  logout: () => _post("/auth/logout"),
  getCurrentUser: () => _get("/auth/me"),
  changePassword: (passwordData) => _put("/auth/change-password", passwordData),
}

// Movies API methods
export const moviesAPI = {
  getMovies: (params = {}) => _get("/movies", { params }),
  getMovie: (id) => _get(`/movies/${id}`),
  createMovie: (movieData) => _post("/movies", movieData),
  updateMovie: (id, movieData) => _put(`/movies/${id}`, movieData),
  deleteMovie: (id) => _delete(`/movies/${id}`),
  getGenres: () => _get("/movies/genres"),
}

// Reviews API methods
export const reviewsAPI = {
  getReviews: (movieId, params = {}) => _get(`/reviews/${movieId}/reviews`, { params }),
  createReview: (movieId, reviewData) => _post(`/reviews/${movieId}/reviews`, reviewData),
  updateReview: (reviewId, reviewData) => _put(`/reviews/${reviewId}`, reviewData),
  deleteReview: (reviewId) => _delete(`/reviews/${reviewId}`),
  markHelpful: (reviewId) => _post(`/reviews/${reviewId}/helpful`),
}

// Users API methods
export const usersAPI = {
  getUser: (id) => _get(`/users/${id}`),
  updateUser: (id, userData) => _put(`/users/${id}`, userData),
  getWatchlist: (id, params = {}) => _get(`/users/${id}/watchlist`, { params }),
  addToWatchlist: (id, movieId) => _post(`/users/${id}/watchlist`, { movieId }),
  removeFromWatchlist: (id, movieId) => _delete(`/users/${id}/watchlist/${movieId}`),
}

export default api
