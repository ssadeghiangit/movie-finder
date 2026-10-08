import { searchMovies } from "./api.js";


const moviesContainer = document.querySelector(".top-picks");

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchDropdown = document.querySelector("#searchDropdown");

async function loadMovies() {

    try {

        const data = await searchMovies("Dune");

        renderMovies(data.results);

    } catch (error) {

        console.error(error);

    }
}


function renderMovies(movies) {

    moviesContainer.innerHTML = "";

    movies.forEach((movie) => {

        const movieCard = document.createElement("article");

        movieCard.className = "movie-card";

        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : "";

        movieCard.innerHTML = `

            <img
                class="movie-card__poster"
                src="${poster}"
                alt="${movie.title}"
            >

            <div class="movie-card__info">

                <div>

                    <h3 class="movie-card__title">
                        ${movie.title}
                    </h3>

                    <p class="movie-card__genres">
                        Movie
                    </p>

                </div>

                <div class="movie-card__actions">

                    <div class="movie-card__rating">

                        <span>★</span>

                        <span>
                            ${movie.vote_average.toFixed(1)}
                        </span>

                    </div>

                    <a
                        href="./details.html?id=${movie.id}"
                        class="movie-card__details"
                    >
                        View Info
                    </a>

                </div>

            </div>
        `;

        moviesContainer.appendChild(movieCard);

    });
}




function renderSearchDropdown(movies) {

    searchDropdown.innerHTML = "";


    if (movies.length === 0) {

        searchDropdown.innerHTML = `
            <p class="search-dropdown__empty">
                No movies found
            </p>
        `;

        return;
    }


    movies.slice(0, 5).forEach((movie) => {

        const result = document.createElement("button");

        result.className = "search-dropdown__item";

        result.type = "button";


        const poster = movie.poster_path
            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
            : "";


        result.innerHTML = `

            ${
                poster
                    ? `
                        <img
                            src="${poster}"
                            alt="${movie.title}"
                        >
                    `
                    : ""
            }

            <div>

                <h3>
                    ${movie.title}
                </h3>

                <span>
                    ${movie.release_date?.slice(0, 4) || "N/A"}
                </span>

            </div>

        `;

        result.addEventListener("click", () => {
    window.location.href = `./details.html?id=${movie.id}`;
});


        searchDropdown.appendChild(result);

    });
}




searchInput.addEventListener("input", async () => {

    const query = searchInput.value.trim();


    if (!query) {

        searchDropdown.innerHTML = "";

        return;
    }


    try {

        const data = await searchMovies(query);

        renderSearchDropdown(data.results);

    } catch (error) {

        console.error(error);

    }

});




searchForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const query = searchInput.value.trim();

    if (!query) {
        return;
    }

    window.location.href =
        `./search.html?query=${encodeURIComponent(query)}`;
});




loadMovies();