import { createContext, useContext, useReducer, useEffect } from "react"
import { authAPI } from "../utils/api"

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: "SET_LOADING",
  SET_USER: "SET_USER",
  SET_ERROR: "SET_ERROR",
  LOGOUT: "LOGOUT",
  CLEAR_ERROR: "CLEAR_ERROR",
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      }
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      // const token = Cookies.get("token")

      // if (!token) {
      //   dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
      //   return
      // }

      try {
        const response = await authAPI.getCurrentUser()
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })
      } catch (error) {
        console.error("Auth check failed:", error)
        // Cookies.remove("token")
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      const response = await authAPI.login(credentials)

      // Set token in cookie (handled by backend)
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })

      return response
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message || "Login failed" })
      throw error
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
      const response = await authAPI.register(userData)

      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: response.user })

      return response
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message || "Registration failed" })
      throw error
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      Cookies.remove("token")
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    }
  }

  // Update user function
  const updateUser = (userData) => {
    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: userData })
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return (
    <AuthContext.Provider 
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default AuthContext
