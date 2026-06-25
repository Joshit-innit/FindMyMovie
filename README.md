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

Create backend `.env` from `.env.example`:

```env
NODE_ENV=development
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

TMDB_API_KEY=your_tmdb_api_key
WATCHMODE_API_KEY=your_watchmode_api_key

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=find_my_movie
DB_SSL=false
```

Create frontend env from `Frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000
```

---

# 🚀 Deployment

## 1. Aiven for MySQL

Create an Aiven MySQL service, then run the schema in `src/database/schema.sql` against your Aiven database.

Use the Aiven connection values in Render:

```env
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_SSL_CA=your-aiven-ca-certificate
```

If the CA certificate is stored as a file in Render, use `DB_SSL_CA_PATH` instead of `DB_SSL_CA`.

## 2. Render Backend

This repo includes `Dockerfile`, `.dockerignore`, and `render.yaml`.

In Render, create a Blueprint or a Docker Web Service from this repository. Set the service root to the repository root and keep the Dockerfile path as `./Dockerfile`.

Required Render environment variables:

```env
NODE_ENV=production
FRONTEND_ORIGIN=https://your-netlify-site.netlify.app
TMDB_API_KEY=your_tmdb_api_key
WATCHMODE_API_KEY=your_watchmode_api_key
DB_HOST=your-aiven-host
DB_PORT=your-aiven-port
DB_USER=avnadmin
DB_PASSWORD=your-aiven-password
DB_NAME=defaultdb
DB_SSL=true
DB_SSL_CA=your-aiven-ca-certificate
```

Optional AI advisor variables:

```env
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
```

Health check endpoint:

```http
GET /health
```

## 3. Netlify Frontend

This repo includes `netlify.toml` for the `Frontend` Vite app.

Netlify settings:

```text
Base directory: Frontend
Build command: npm run build
Publish directory: Frontend/dist
```

Set this Netlify environment variable:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

After Netlify gives you the site URL, update Render `FRONTEND_ORIGIN` to that exact URL.

---

# 🛡️ Production Security Added

* Rate limiting on `/api`
* Helmet HTTP security headers
* Strict configurable CORS
* Hidden `X-Powered-By`
* JSON body size limit
* Query parameter pollution protection
* Compression
* Netlify static security headers
* Render health check endpoint
* Managed MySQL SSL support for Aiven

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
