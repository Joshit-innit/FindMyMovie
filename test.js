// testDbMovie.js

const movieDbService =
    require("./src/services/movieDbService");

(async () => {

    try {

        const movie = {
            id: 157336,
            title: "Interstellar",
            rating: 8.4,
            runtime: 169,
            poster: "poster.jpg",
            genres: [
                "Adventure",
                "Science Fiction"
            ]
        };

        await movieDbService.saveMovie(movie);

        const result =
            await movieDbService.getMovieById(
                157336
            );

        console.log(result);

    } catch (error) {

        console.error(error);
    }

})();