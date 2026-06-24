const API_KEY = process.env.TMDB_API_KEY;

const searchMovie = async (movieName) => {

    const url =
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieName)}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDB Error: ${response.status}`);
    }

    const data = await response.json();

    return data.results.map(movie => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        rating: movie.vote_average
    }));
};


const getMovieDetails = async (movieId) => {

    const url =
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`TMDB Error ${response.status}`);
    }

    const movie = await response.json();

    return {
        id: movie.id,
        title: movie.title,
        runtime: movie.runtime,
        release_date: movie.release_date,
        rating: movie.vote_average,
        poster: movie.poster_path,
        genres: movie.genres.map(
            genre => genre.name
        )
    };
};
module.exports = {
    searchMovie, getMovieDetails
};