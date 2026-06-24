const axios = require("axios");

const API_KEY = process.env.WATCHMODE_API_KEY;

const fetchJson = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                Accept: "application/json",
                "X-API-Key": API_KEY
            }
        });

        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const detail = error.response?.data?.message || error.message;
        throw new Error(`Watchmode Error${status ? ` ${status}` : ""}: ${detail}`);
    }
};

const getWatchmodeId = async (tmdbMovieId) => {

    const url =
        `https://api.watchmode.com/v1/search/?search_field=tmdb_movie_id&search_value=${tmdbMovieId}`;

    const data = await fetchJson(url);

    if (
        !data.title_results ||
        data.title_results.length === 0
    ) {
        throw new Error("Movie not found in Watchmode");
    }

    return data.title_results[0].id;
};

const getMovieSources = async (watchmodeId) => {

    const url =
        `https://api.watchmode.com/v1/title/${watchmodeId}/sources/`;

    const data = await fetchJson(url);

    return data.map(source => ({
        platform: source.name,
        type: source.type,
        region: source.region,
        price: source.price,
        logoUrl: source.logo_100px || source.logo_200px || source.logo,
        watchUrl: source.web_url
    }));
};

const getAvailability = async (tmdbMovieId) => {

    const watchmodeId =
        await getWatchmodeId(tmdbMovieId);

    const sources =
        await getMovieSources(watchmodeId);

    return sources;
};

module.exports = {
    getAvailability
};
