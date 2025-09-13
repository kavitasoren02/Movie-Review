# 🎬 Movie Review Platform  

A full-stack **Movie Review Platform** built with:  
- **Backend**: Node.js + Express + MongoDB (REST APIs)  
- **Frontend**: React + Vite (UI for browsing, reviewing, and managing movies)  

This project allows users to:  
- Register & Login  
- Browse movies with filters & pagination  
- Post reviews and ratings  
- Manage a personal watchlist  
- Admins can add/update/delete movies  

---

## 📂 Project Structure  

```
movie-review-platform/
│
├── backend/       # Node.js + Express + MongoDB API
│   ├── src/
│   ├── .env
│   └── package.json
│
├── frontend/      # React + Vite client
│   ├── src/
│   ├── .env
│   └── package.json
│
└── README.md
```

---

## ⚡ Setup & Installation  

### 1. Clone the Repository  
```bash
git clone https://github.com/kavitasoren02/Movie-Review.git
cd movie-review
```

---

### 2. Backend Setup (API Server)  

```bash
cd backend
npm install
```

#### Environment Variables  
Create a `.env` file in the `backend/` directory with the following keys:  

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviereview
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

#### Run the Server  
```bash
npm run dev
```
API will be available at: **http://localhost:5000/api**

---

### 3. Frontend Setup (React + Vite)  

```bash
cd ../frontend
npm install
```

#### Environment Variables  
Create a `.env` file in the `frontend/` directory with the following keys:  

```env
VITE_API_URL=http://localhost:5000/api
```

#### Run the Frontend  
```bash
npm run dev
```
Frontend will run at: **http://localhost:5173**

---

## 🗄 Database Setup  

This project uses **MongoDB**.  

1. Install MongoDB locally or use [MongoDB Atlas](https://www.mongodb.com/atlas).  
2. Update the `MONGO_URI` in `backend/.env`.  
3. Collections will be auto-created:  
   - `users`  
   - `movies`  
   - `reviews`  
   - `watchlists`  

---

## 🔑 API Documentation  

### Authentication  
- `POST /api/auth/register` – Register a new user  
- `POST /api/auth/login` – Login user  
- `POST /api/auth/logout` – Logout user  
- `GET /api/auth/me` – Get current user  

### Movies  
- `GET /api/movies` – Get all movies (with pagination & filters)  
- `GET /api/movies/:id` – Get a specific movie with reviews  
- `POST /api/movies` – Add new movie (**Admin only**)  
- `PUT /api/movies/:id` – Update movie (**Admin only**)  
- `DELETE /api/movies/:id` – Delete movie (**Admin only**)  

### Reviews  
- `GET /api/movies/:id/reviews` – Get reviews for a movie  
- `POST /api/movies/:id/reviews` – Add review for a movie  
- `PUT /api/reviews/:id` – Update review  
- `DELETE /api/reviews/:id` – Delete review  

### Users & Watchlist  
- `GET /api/users/:id` – Get user profile  
- `PUT /api/users/:id` – Update user profile  
- `GET /api/users/:id/watchlist` – Get user’s watchlist  
- `POST /api/users/:id/watchlist` – Add movie to watchlist  
- `DELETE /api/users/:id/watchlist/:movieId` – Remove from watchlist  

---

## 📘 Database Models  

### User  
- `username`, `email`, `password`, `profilePicture`, `joinDate`, `role`  

### Movie  
- `title`, `genre`, `releaseYear`, `director`, `cast`, `synopsis`, `posterUrl`, `trailerUrl`, `duration`, `averageRating`, `totalReviews`  

### Review  
- `user`, `movie`, `rating`, `reviewText`, `helpful`, `helpfulCount`  

### Watchlist  
- `user`, `movie`, `dateAdded`  

---

## 📝 Design Decisions  

- **Authentication**: JWT-based auth, stored in HTTP-only cookies for security.  
- **Role-based Access**: Admins can manage movies, normal users can only review & add to watchlist.  
- **Pagination & Filters**: Implemented for movies to handle large datasets efficiently.  
- **Scalable Structure**: Separate backend & frontend folders for clean architecture.  
- **Frontend API Calls**: Using Axios to consume backend APIs.  
- **State Management**: Context API for user auth & watchlist.  

---
