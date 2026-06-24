const axios = require("axios");

const API_KEY = process.env.TMDB_API_KEY;
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const providerIds = {
    netflix: 8,
    disney: 337,
    "disney+": 337,
    prime: 9,
    "prime video": 9,
    apple: 350,
    "apple tv+": 350,
    hbo: 1899,
    max: 1899,
    mubi: 11,
    criterion: 258
};

const searchAliases = {
    bahubali: ["Baahubali", "Baahubali: The Beginning", "Baahubali 2", "Baahubali 2: The Conclusion"],
    baahubali: ["Baahubali", "Baahubali: The Beginning", "Baahubali 2", "Baahubali 2: The Conclusion"],
    bahubali2: ["Baahubali 2", "Baahubali 2: The Conclusion"],
    baahubali2: ["Baahubali 2", "Baahubali 2: The Conclusion"],
    intersteller: ["Interstellar"],
    avtar: ["Avatar"],
    spiderman: ["Spider-Man"],
    batman: ["Batman"],
    kgf2: ["K.G.F: Chapter 2", "KGF Chapter 2"],
    pushpa2: ["Pushpa 2", "Pushpa 2: The Rule"]
};

const aliasEntries = Object.entries(searchAliases);

const normalizePoster = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${IMAGE_BASE_URL}${path}`;
};

const normalizeMovieSummary = (movie) => ({
    id: movie.id,
    title: movie.title || movie.name,
    poster: normalizePoster(movie.poster_path),
    backdrop: normalizePoster(movie.backdrop_path),
    overview: movie.overview,
    rating: movie.vote_average,
    release_date: movie.release_date || movie.first_air_date,
    language: movie.original_language,
    genres: movie.genre_names || [],
    providers: []
});

const normalizeSearchText = (value) =>
    String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();

const collapseRepeatedLetters = (value) =>
    value.replace(/([a-z])\1+/g, "$1");

const levenshteinDistance = (left, right) => {
    const matrix = Array.from({ length: left.length + 1 }, (_, row) => [row]);

    for (let column = 1; column <= right.length; column += 1) {
        matrix[0][column] = column;
    }

    for (let row = 1; row <= left.length; row += 1) {
        for (let column = 1; column <= right.length; column += 1) {
            const cost = left[row - 1] === right[column - 1] ? 0 : 1;
            matrix[row][column] = Math.min(
                matrix[row - 1][column] + 1,
                matrix[row][column - 1] + 1,
                matrix[row - 1][column - 1] + cost
            );
        }
    }

    return matrix[left.length][right.length];
};

const getAliasVariants = (aliasKey, collapsedText) => {
    const variants = new Set(searchAliases[aliasKey] || []);
    const compactText = collapsedText.replace(/\s+/g, "");

    for (const [key, titles] of aliasEntries) {
        const distance = levenshteinDistance(aliasKey, key);
        const maxDistance = key.length <= 6 ? 1 : 2;

        if (
            distance <= maxDistance ||
            compactText.includes(key) ||
            key.includes(aliasKey)
        ) {
            titles.forEach((title) => variants.add(title));
        }
    }

    return [...variants];
};

const expandVowels = (value) => {
    const variants = new Set();
    const vowels = "aeiou";

    for (let index = 0; index < value.length; index += 1) {
        const char = value[index];
        const previous = value[index - 1];

        if (vowels.includes(char) && previous !== char) {
            variants.add(`${value.slice(0, index + 1)}${char}${value.slice(index + 1)}`);
        }
    }

    return [...variants];
};

const buildSearchQueries = (movieName) => {
    const normalized = normalizeSearchText(movieName);
    const collapsed = collapseRepeatedLetters(normalized);
    const aliasKey = collapsed.replace(/\s+/g, "");
    const words = collapsed.split(" ").filter(Boolean);
    const variants = new Set([
        String(movieName || "").trim(),
        normalized,
        collapsed,
        ...getAliasVariants(aliasKey, collapsed)
    ]);

    if (words.length === 1) {
        expandVowels(words[0]).forEach((variant) => variants.add(variant));
    } else {
        words.forEach((word, wordIndex) => {
            expandVowels(word).slice(0, 3).forEach((variant) => {
                const nextWords = [...words];
                nextWords[wordIndex] = variant;
                variants.add(nextWords.join(" "));
            });
        });
    }

    return [...variants]
        .filter(Boolean)
        .slice(0, 12);
};

const scoreSearchResult = (movie, searchText) => {
    const title = normalizeSearchText(movie.title || movie.name);

    if (title === searchText) return 100;
    if (title.startsWith(searchText)) return 80;
    if (title.includes(searchText)) return 60;
    if (collapseRepeatedLetters(title).includes(collapseRepeatedLetters(searchText))) return 45;

    return Number(movie.popularity || 0) / 10 + Number(movie.vote_average || 0);
};

const fetchJson = async (url) => {
    try {
        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                Accept: "application/json"
            }
        });

        return response.data;
    } catch (error) {
        const status = error.response?.status;
        const detail = error.response?.data?.status_message || error.message;
        throw new Error(`TMDB Error${status ? ` ${status}` : ""}: ${detail}`);
    }
};

const searchMovie = async (movieName) => {
    const searchText = normalizeSearchText(movieName);
    const seen = new Map();

    for (const query of buildSearchQueries(movieName)) {
        const url =
            `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&include_adult=false`;

        const data = await fetchJson(url);

        for (const movie of data.results || []) {
            if (!seen.has(movie.id)) {
                seen.set(movie.id, movie);
            }
        }

        const hasStrongMatch = [...seen.values()].some((movie) =>
            scoreSearchResult(movie, searchText) >= 60
        );

        if (hasStrongMatch && seen.size >= 5) {
            break;
        }
    }

    return [...seen.values()]
        .sort((a, b) => scoreSearchResult(b, searchText) - scoreSearchResult(a, searchText))
        .map(normalizeMovieSummary);
};

const getTrendingMovies = async () => {
    const url =
        `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}`;

    const data = await fetchJson(url);

    return data.results.map(normalizeMovieSummary);
};

const getPlatformMovies = async (platform, region = "US") => {
    const providerId = providerIds[String(platform).toLowerCase()];

    if (!providerId) {
        return [];
    }

    const url =
        `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&watch_region=${encodeURIComponent(region)}&with_watch_providers=${providerId}&sort_by=popularity.desc`;

    const data = await fetchJson(url);

    return data.results.map(normalizeMovieSummary);
};

const getSimilarMovies = async (movieId) => {
    const url =
        `https://api.themoviedb.org/3/movie/${movieId}/similar?api_key=${API_KEY}`;

    const data = await fetchJson(url);

    return data.results.map(normalizeMovieSummary);
};

const getMovieProviders = async (movieId, region = "US") => {
    const url =
        `https://api.themoviedb.org/3/movie/${movieId}/watch/providers?api_key=${API_KEY}`;

    const data = await fetchJson(url);
    const regionProviders = data.results?.[region] || data.results?.US || {};
    const groups = [
        ["flatrate", "Sub"],
        ["rent", "Rent"],
        ["buy", "Buy"],
        ["free", "Free"]
    ];

    return groups.flatMap(([key, type]) =>
        (regionProviders[key] || []).map((provider) => ({
            platform: provider.provider_name,
            type,
            logoUrl: normalizePoster(provider.logo_path),
            watchUrl: regionProviders.link || null,
            region
        }))
    );
};

const getMovieDetails = async (movieId) => {

    const url =
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits`;

    const [movie, providers] = await Promise.all([
        fetchJson(url),
        getMovieProviders(movieId).catch(() => [])
    ]);
    const director = movie.credits?.crew?.find((member) => member.job === "Director")?.name;
    const cast = movie.credits?.cast?.slice(0, 5).map((member) => member.name) || [];

    return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        runtime: movie.runtime,
        release_date: movie.release_date,
        rating: movie.vote_average,
        poster: normalizePoster(movie.poster_path),
        backdrop: normalizePoster(movie.backdrop_path),
        language: movie.original_language,
        genres: movie.genres.map(
            genre => genre.name
        ),
        providers,
        director,
        cast
    };
};
module.exports = {
    searchMovie,
    getTrendingMovies,
    getMovieDetails,
    getPlatformMovies,
    getSimilarMovies
};
