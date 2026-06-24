const tmdbService = require("../services/tmdbService");
const watchmodeService = require("../services/watchmodeService");
const movieDbService = require("../services/movieDbService");

// Search Movies
const searchMovie = async (req, res) => {
    try {

        const query = req.query.q;

        if (!query) {
            return res.status(400).json({
                message: "Movie name is required"
            });
        }

        const movies =
            await tmdbService.searchMovie(query);

        return res.status(200).json(movies);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

// Movie Details
const getMovieDetails = async (req, res) => {

    try {

        const movieId = req.params.id;

        const cachedMovie =
            await movieDbService.getMovieById(movieId);

        if (cachedMovie) {

            console.log("Movie served from database");

            return res.status(200).json(cachedMovie);
        }

        const movie =
            await tmdbService.getMovieDetails(movieId);

        await movieDbService.saveMovie(movie);

        console.log("Movie fetched from TMDB and saved");

        return res.status(200).json(movie);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

// Availability
const getMovieAvailability = async (req, res) => {

    try {

        const movieId = req.params.id;

        const cachedAvailability =
            await movieDbService.getAvailabilityByMovieId(movieId);

        if (
            cachedAvailability &&
            cachedAvailability.length > 0
        ) {

            console.log("Availability served from database");

            return res.status(200).json(cachedAvailability);
        }

        const availability =
            await watchmodeService.getAvailability(movieId);

        await movieDbService.saveAvailability(
            movieId,
            availability
        );

        console.log(
            "Availability fetched from Watchmode and saved"
        );

        return res.status(200).json(availability);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    searchMovie,
    getMovieDetails,
    getMovieAvailability
};