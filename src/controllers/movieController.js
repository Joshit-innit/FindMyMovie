const tmdbService = require("../services/tmdbService");
const watchmodeService = require("../services/watchmodeService");
const movieDbService = require("../services/movieDbService");
const advisorService = require("../services/advisorService");

const uniqueMovies = (movies) => {
    const seen = new Map();

    for (const movie of movies) {
        if (!seen.has(movie.id)) {
            seen.set(movie.id, movie);
        }
    }

    return [...seen.values()];
};

// Search Movies
const searchMovie = async (req, res) => {
    try {

        const query = req.query.title || req.query.q;
        const platform = req.query.platform;
        const region = req.query.region || "US";

        if (!query && platform) {
            const movies =
                await tmdbService.getPlatformMovies(platform, region);

            return res.status(200).json({
                results: movies
            });
        }

        if (!query) {
            return res.status(400).json({
                message: "Movie name is required"
            });
        }

        let searchQueries = [query];

        try {
            const correctedQueries = await advisorService.getSearchCorrections(query);
            searchQueries = [...new Set([...correctedQueries, query])].slice(0, 8);
        } catch (advisorError) {
            console.warn("AI search correction skipped:", advisorError.message);
        }

        const movies = uniqueMovies(
            (await Promise.all(
                searchQueries.map((searchQuery) =>
                    tmdbService.searchMovie(searchQuery).catch(() => [])
                )
            )).flat()
        );

        const filteredMovies = platform && movies.some((movie) => movie.providers?.length)
            ? movies.filter((movie) =>
                movie.providers?.some((provider) =>
                    provider.platform
                        ?.toLowerCase()
                        .includes(String(platform).toLowerCase())
                )
            )
            : movies;

        return res.status(200).json({
            results: filteredMovies
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const getAdvisorResponse = async (req, res) => {
    try {
        const message = req.body?.message;

        if (!message || !String(message).trim()) {
            return res.status(400).json({
                message: "Message is required"
            });
        }

        const intent = await advisorService.getAdvisorIntent(message);
        const movies = uniqueMovies(
            (await Promise.all(
                intent.searchQueries.map((query) =>
                    tmdbService.searchMovie(query).catch(() => [])
                )
            )).flat()
        ).slice(0, 8);

        const platform = intent.platform;
        const filteredMovies = platform && movies.some((movie) => movie.providers?.length)
            ? movies.filter((movie) =>
                movie.providers?.some((provider) =>
                    provider.platform
                        ?.toLowerCase()
                        .includes(String(platform).toLowerCase())
                )
            )
            : movies;

        return res.status(200).json({
            reply: filteredMovies.length > 0
                ? intent.reply
                : "Movie not available for now.",
            results: filteredMovies,
            intent
        });

    } catch (error) {

        console.error(error);

        return res.status(200).json({
            reply: "Movie not available for now.",
            results: []
        });
    }
};

const getTrendingMovies = async (req, res) => {
    try {
        const movies = await tmdbService.getTrendingMovies();

        return res.status(200).json({
            results: movies
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const getPlatformMovies = async (req, res) => {
    try {
        const movies = await tmdbService.getPlatformMovies(
            req.params.platform,
            req.query.region || "US"
        );

        return res.status(200).json({
            results: movies
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: error.message
        });
    }
};

const getSimilarMovies = async (req, res) => {
    try {
        const movies = await tmdbService.getSimilarMovies(req.params.id);

        return res.status(200).json({
            results: movies
        });
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

        const movie =
            await tmdbService.getMovieDetails(movieId);

        if (!movie.providers || movie.providers.length === 0) {
            try {
                movie.providers = await watchmodeService.getAvailability(movieId);
            } catch (availabilityError) {
                console.warn("Watchmode availability skipped:", availabilityError.message);
            }
        }

        try {
            await movieDbService.saveMovie(movie);
        } catch (cacheError) {
            console.warn("Movie cache save skipped:", cacheError.message);
        }

        console.log("Movie fetched from TMDB");

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
    getAdvisorResponse,
    getTrendingMovies,
    getMovieDetails,
    getMovieAvailability,
    getPlatformMovies,
    getSimilarMovies
};
