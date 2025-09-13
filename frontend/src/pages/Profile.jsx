import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { usersAPI } from "../utils/api"
import Button from "../components/common/Button"
import Input from "../components/common/Input"
import Card from "../components/common/Card"
import Loading from "../components/common/Loading"
import ErrorMessage from "../components/common/ErrorMessage"
import StarRating from "../components/common/StarRating"

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    profilePicture: "",
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
      setFormData({
        username: user.username || "",
        email: user.email || "",
        profilePicture: user.profilePicture || "",
      })
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const data = await usersAPI.getUser(user._id)
      setProfileData(data)
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.username) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (formData.profilePicture && !/^https?:\/\/.+/.test(formData.profilePicture)) {
      newErrors.profilePicture = "Profile picture must be a valid URL"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsUpdating(true)

    try {
      const response = await usersAPI.updateUser(user._id, formData)
      updateUser(response.user)
      setIsEditing(false)
      await fetchProfile()
    } catch (error) {
      console.error("Failed to update profile:", error)
      setErrors({ general: error.message || "Failed to update profile" })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      username: user.username || "",
      email: user.email || "",
      profilePicture: user.profilePicture || "",
    })
    setErrors({})
    setIsEditing(false)
  }

  if (isLoading) {
    return <Loading text="Loading profile..." />
  }

  if (!profileData) {
    return <ErrorMessage message="Failed to load profile" onRetry={fetchProfile} />
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {user.profilePicture ? (
              <img
                src={user.profilePicture || "/placeholder.svg"}
                alt={user.username}
                className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-3xl font-bold text-primary-600">{user.username?.charAt(0).toUpperCase()}</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
          <p className="text-gray-600">Member since {new Date(user.joinDate).toLocaleDateString()}</p>
        </div>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profileData.reviewCount || 0}</div>
              <div className="text-sm text-gray-600">Reviews Written</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl font-bold text-primary-600">{profileData.watchlistCount || 0}</div>
              <div className="text-sm text-gray-600">Movies in Watchlist</div>
            </Card.Content>
          </Card>
          <Card>
            <Card.Content className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {profileData.recentReviews?.length > 0
                  ? (
                      profileData.recentReviews.reduce((sum, review) => sum + review.rating, 0) /
                      profileData.recentReviews.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </Card.Content>
          </Card>
        </div>

        {/* Profile Information */}
        <Card>
          <Card.Header>
            <div className="flex justify-between items-center">
              <Card.Title>Profile Information</Card.Title>
              {!isEditing && (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>
          </Card.Header>
          <Card.Content>
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-sm text-red-800">{errors.general}</p>
                  </div>
                )}

                <Input
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={errors.username}
                  required
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  required
                />

                <Input
                  label="Profile Picture URL"
                  name="profilePicture"
                  type="url"
                  value={formData.profilePicture}
                  onChange={handleChange}
                  error={errors.profilePicture}
                  placeholder="https://example.com/your-photo.jpg"
                />

                <div className="flex space-x-4">
                  <Button type="submit" loading={isUpdating} disabled={isUpdating}>
                    Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Username</label>
                  <p className="mt-1 text-gray-900">{user.username}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-gray-900 capitalize">{user.role}</p>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>

        {/* Recent Reviews */}
        {profileData.recentReviews && profileData.recentReviews.length > 0 && (
          <Card>
            <Card.Header>
              <Card.Title>Recent Reviews</Card.Title>
            </Card.Header>
            <Card.Content>
              <div className="space-y-4">
                {profileData.recentReviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex items-start space-x-4">
                      {review.movie.posterUrl && (
                        <img
                          src={review.movie.posterUrl || "/placeholder.svg"}
                          alt={review.movie.title}
                          className="h-16 w-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{review.movie.title}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <StarRating rating={review.rating} readonly size="sm" />
                          <span className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mt-2 line-clamp-2">{review.reviewText}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  )
}

export default Profile
