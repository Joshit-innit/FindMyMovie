const express = require("express");

const router = express.Router();

const {
    searchMovie,
    getAdvisorResponse,
    getTrendingMovies,
    getMovieDetails,
    getMovieAvailability,
    getPlatformMovies,
    getSimilarMovies
} = require(
    "../controllers/movieController"
);

router.get(
    "/trending",
    getTrendingMovies
);

router.get(
    "/search",
    searchMovie
);

router.post(
    "/advisor",
    getAdvisorResponse
);

router.get(
    "/platform/:platform",
    getPlatformMovies
);

router.get(
    "/movie/:id",
    getMovieDetails
);

router.get(
    "/movie/:id/similar",
    getSimilarMovies
);

router.get(
    "/movie/:id/availability",
    getMovieAvailability
);

module.exports = router;
