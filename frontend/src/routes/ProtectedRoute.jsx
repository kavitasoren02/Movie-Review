import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Loading from "../components/common/Loading"

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <Loading />
    )
  }
  console.log({
    isAuthenticated,
    location
  })
  // if (!isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />
  // }

  return children
}

export default ProtectedRoute
