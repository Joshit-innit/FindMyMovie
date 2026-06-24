const API_KEY = process.env.WATCHMODE_API_KEY;

const getWatchmodeId = async (tmdbMovieId) => {

    const url =
        `https://api.watchmode.com/v1/search/?search_field=tmdb_movie_id&search_value=${tmdbMovieId}`;

    const response = await fetch(url, {
        headers: {
            "X-API-Key": API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Watchmode Search Error: ${response.status}`);
    }

    const data = await response.json();

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

    const response = await fetch(url, {
        headers: {
            "X-API-Key": API_KEY
        }
    });

    if (!response.ok) {
        throw new Error(`Watchmode Sources Error: ${response.status}`);
    }

    const data = await response.json();

    return data.map(source => ({
        platform: source.name,
        type: source.type,
        region: source.region,
        price: source.price
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