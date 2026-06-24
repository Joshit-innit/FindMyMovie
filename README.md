# 🎬 FindMyMovie

> A movie discovery platform that helps users instantly find where a movie is available to stream, rent, or buy.

---

## 📖 About The Project

Finding a movie online can be frustrating.

Most search engines show streaming platforms where a movie is supposedly available, but when users open those platforms they often find:

* The movie is unavailable in their region
* The movie is only available for rent
* The information is outdated
* Users have to visit multiple platforms before finding the movie

**FindMyMovie** solves this problem by providing a single API that allows users to:

* Search for movies
* View movie details
* Check streaming availability
* Know whether the movie is available via subscription, rent, or purchase

---

## 🎯 Problem Statement

Users waste time searching across multiple streaming platforms to find where a movie is actually available.

FindMyMovie simplifies the process by aggregating movie information and streaming availability into a single platform.

---

# 🏗️ Tech Stack

| Category               | Technology    |
| ---------------------- | ------------- |
| Backend                | Node.js       |
| Framework              | Express.js    |
| Database               | MySQL         |
| Movie Data             | TMDB API      |
| Streaming Availability | Watchmode API |
| Environment Management | dotenv        |

---

# 📂 Project Structure

```text
FindMyMovie/
│
├── .env
├── package.json
│
├── src/
│
│   ├── server.js
│   │
│   ├── routes/
│   │   └── movieRoutes.js
│   │
│   ├── controllers/
│   │   └── movieController.js
│   │
│   ├── services/
│   │   ├── tmdbService.js
│   │   ├── watchmodeService.js
│   │   └── movieDbService.js
│   │
│   ├── database/
│   │   └── db.js
│   │
│   └── config/
│
└── tests/
```

---

# ⚙️ Backend Architecture

```text
Client
  │
  ▼
Routes
  │
  ▼
Controllers
  │
  ▼
Services
  │
  ├── MySQL Cache
  ├── TMDB API
  └── Watchmode API
```

---

# 🔄 Request Processing Flow

## Movie Search Flow

```text
User
  │
  ▼
/api/search?q=movie
  │
  ▼
TMDB API
  │
  ▼
Search Results
```

---

## Movie Details Flow

```text
User
  │
  ▼
/api/movie/:id
  │
  ▼
Check MySQL
  │
  ▼
Movie Found?
  │
  ├── Yes
  │      │
  │      ▼
  │   Return Data
  │
  └── No
         │
         ▼
      TMDB API
         │
         ▼
      Save To MySQL
         │
         ▼
      Return Data
```

---

## Movie Availability Flow

```text
User
  │
  ▼
/api/movie/:id/availability
  │
  ▼
Check MySQL
  │
  ▼
Availability Found?
  │
  ├── Yes
  │      │
  │      ▼
  │   Return Data
  │
  └── No
         │
         ▼
      Watchmode API
         │
         ▼
      Save To MySQL
         │
         ▼
      Return Data
```

---

# 👤 User Journey

```text
User Searches Movie
          │
          ▼
     Search Results
          │
          ▼
      Select Movie
          │
          ▼
    View Movie Details
          │
          ▼
 View Streaming Platforms
          │
          ▼
 Subscription / Rent / Buy
          │
          ▼
      Watch Movie
```

---

# 🗄️ Database Design

## Movies Table

| Column       | Type         | Description         |
| ------------ | ------------ | ------------------- |
| movie_id     | BIGINT       | TMDB Movie ID       |
| title        | VARCHAR(255) | Movie Title         |
| rating       | DECIMAL(3,1) | Movie Rating        |
| runtime      | INT          | Duration in Minutes |
| poster       | TEXT         | Poster Path         |
| genres       | JSON         | Movie Genres        |
| last_updated | TIMESTAMP    | Last Update Time    |

---

## Availability Table

| Column            | Type          | Description               |
| ----------------- | ------------- | ------------------------- |
| id                | INT           | Primary Key               |
| movie_id          | BIGINT        | TMDB Movie ID             |
| platform_name     | VARCHAR(100)  | Streaming Platform        |
| availability_type | VARCHAR(20)   | Subscription / Rent / Buy |
| region            | VARCHAR(10)   | Country Code              |
| price             | DECIMAL(10,2) | Rental or Purchase Price  |
| last_updated      | TIMESTAMP     | Last Update Time          |

---

# 📡 API Documentation

## 1. Search Movies

### Endpoint

```http
GET /api/search?q={movie_name}
```

### Example

```http
GET /api/search?q=interstellar
```

### Response

| Field        | Type   | Description   |
| ------------ | ------ | ------------- |
| id           | Number | TMDB Movie ID |
| title        | String | Movie Title   |
| release_date | String | Release Date  |
| rating       | Number | TMDB Rating   |

### Sample Response

```json
[
  {
    "id": 157336,
    "title": "Interstellar",
    "release_date": "2014-11-05",
    "rating": 8.4
  }
]
```

---

## 2. Get Movie Details

### Endpoint

```http
GET /api/movie/:id
```

### Example

```http
GET /api/movie/157336
```

### Response

| Field   | Type   | Description        |
| ------- | ------ | ------------------ |
| id      | Number | Movie ID           |
| title   | String | Movie Title        |
| runtime | Number | Runtime in Minutes |
| rating  | Number | TMDB Rating        |
| poster  | String | Poster Path        |
| genres  | Array  | Movie Genres       |

### Sample Response

```json
{
  "id": 157336,
  "title": "Interstellar",
  "runtime": 169,
  "rating": 8.4,
  "poster": "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
  "genres": [
    "Adventure",
    "Science Fiction"
  ]
}
```

---

## 3. Get Movie Availability

### Endpoint

```http
GET /api/movie/:id/availability
```

### Example

```http
GET /api/movie/157336/availability
```

### Response

| Field             | Type   | Description           |
| ----------------- | ------ | --------------------- |
| platform_name     | String | Streaming Platform    |
| availability_type | String | sub / rent / buy      |
| region            | String | Country Code          |
| price             | Number | Rental/Purchase Price |

### Sample Response

```json
[
  {
    "platform_name": "Netflix",
    "availability_type": "sub",
    "region": "US",
    "price": null
  },
  {
    "platform_name": "Apple TV",
    "availability_type": "rent",
    "region": "US",
    "price": 3.99
  }
]
```

---

# 🚀 Key Features

✅ Movie Search

✅ Movie Details

✅ Streaming Availability Tracking

✅ Subscription / Rent / Buy Information

✅ MySQL Caching Layer

✅ Reduced External API Usage

✅ Fast Response Times

✅ RESTful API Architecture

---

# 🔐 Environment Variables

Create a `.env` file:

```env
PORT=3000

TMDB_API_KEY=your_tmdb_api_key

WATCHMODE_API_KEY=your_watchmode_api_key

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=find_my_movie
```

---

# 🎯 Future Enhancements

* Unified Movie Endpoint (`/api/movie/:id/full`)
* Genre Filtering
* Platform Filtering
* Regional Availability Support
* Frontend Dashboard (React)
* Trending Movies
* Personalized Recommendations

---

# 👨‍💻 Author

**Tammana Joshit**

FindMyMovie was built to simplify movie discovery and streaming availability tracking using real-world API integrations, database caching, and scalable backend architecture.
# FindMyMovie
