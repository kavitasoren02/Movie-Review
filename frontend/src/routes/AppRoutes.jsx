import React from "react"
import { Routes, Route } from "react-router-dom"
import Layout from "../components/layout/Layout"
import Home from "../pages/Home"
import Movies from "../pages/Movies"
import MovieDetail from "../pages/MovieDetail"
import Login from "../pages/Login"
import Register from "../pages/Register"
import Profile from "../pages/Profile"
import Watchlist from "../pages/Watchlist"
import ProtectedRoute from "./ProtectedRoute"

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" index element={
          <Layout>
            <Home />
          </Layout>
        } />
        <Route path="/movies" element={
          <Layout>
            <Movies />
          </Layout>
        } />
        <Route path="/movies/:id" element={
          <Layout>
            <MovieDetail />
          </Layout>
        } />
        <Route path="/login" element={
          <Layout>
            <Login />
          </Layout>
        } />
        <Route path="/register" element={
          <Layout>
            <Register />
          </Layout>
        } />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="watchlist"
          element={
            <ProtectedRoute>
              <Layout>
                <Watchlist />
              </Layout>
            </ProtectedRoute>
          }
        />
    </Routes>
  )
}

export default AppRoutes
