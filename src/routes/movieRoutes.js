const express = require("express");

const router = express.Router();

const {
    searchMovie,
    getMovieDetails,
    getMovieAvailability
} = require(
    "../controllers/movieController"
);

router.get(
    "/search",
    searchMovie
);

router.get(
    "/movie/:id",
    getMovieDetails
);

router.get(
    "/movie/:id/availability",
    getMovieAvailability
);

module.exports = router;