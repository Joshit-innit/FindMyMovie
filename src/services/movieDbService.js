const pool = require("../database/db");

// Save Movie
const saveMovie = async (movie) => {

    const query = `
        INSERT INTO movies (
            movie_id,
            title,
            rating,
            runtime,
            poster,
            genres
        )
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            title = VALUES(title),
            rating = VALUES(rating),
            runtime = VALUES(runtime),
            poster = VALUES(poster),
            genres = VALUES(genres)
    `;

    await pool.execute(query, [
    movie.id ?? null,
    movie.title ?? null,
    movie.rating ?? null,
    movie.runtime ?? null,
    movie.poster ?? null,
    JSON.stringify(movie.genres ?? [])
    ]);
};

// Get Movie By ID
const getMovieById = async (movieId) => {

    const query = `
        SELECT *
        FROM movies
        WHERE movie_id = ?
    `;

    const [rows] = await pool.execute(query, [movieId]);

    if (rows.length === 0) {
        return null;
    }

    return {
        ...rows[0],
        genres:
            typeof rows[0].genres === "string"
                ? JSON.parse(rows[0].genres)
                : rows[0].genres
    };
};

// Save Availability
const saveAvailability = async (
    movieId,
    sources
) => {

    // Remove old entries
    await pool.execute(
        `DELETE FROM availability WHERE movie_id = ?`,
        [movieId]
    );

    const query = `
        INSERT INTO availability (
            movie_id,
            platform_name,
            availability_type,
            region,
            price
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    for (const source of sources) {

        await pool.execute(query, [
            movieId,
            source.platform,
            source.type,
            source.region,
            source.price
        ]);
    }
};

// Get Availability
const getAvailabilityByMovieId = async (
    movieId
) => {

    const query = `
        SELECT
            platform_name,
            availability_type,
            region,
            price
        FROM availability
        WHERE movie_id = ?
    `;

    const [rows] =
        await pool.execute(query, [movieId]);

    return rows;
};

// Check if movie exists
const movieExists = async (movieId) => {

    const query = `
        SELECT movie_id
        FROM movies
        WHERE movie_id = ?
    `;

    const [rows] =
        await pool.execute(query, [movieId]);

    return rows.length > 0;
};

// Check if availability exists
const availabilityExists = async (
    movieId
) => {

    const query = `
        SELECT id
        FROM availability
        WHERE movie_id = ?
        LIMIT 1
    `;

    const [rows] =
        await pool.execute(query, [movieId]);

    return rows.length > 0;
};

module.exports = {
    saveMovie,
    getMovieById,
    saveAvailability,
    getAvailabilityByMovieId,
    movieExists,
    availabilityExists
};