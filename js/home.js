import {
    searchMovies,
    getMovieDetails,
    getPopularMovies
} from "./api.js";


const moviesContainer = document.querySelector(".top-picks");

const loadingElement = document.querySelector("#homeLoading");
const errorElement = document.querySelector("#homeError");
const emptyElement = document.querySelector("#homeEmpty");

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchDropdown = document.querySelector("#searchDropdown");
const heroPoster = document.querySelector(".hero__poster");
const urlParams = new URLSearchParams(window.location.search);

let currentPage = Number(urlParams.get("page")) || 1;const paginationElement = document.querySelector("#homePagination");
function updatePageUrl() {
    const url = new URL(window.location);

    url.searchParams.set("page", currentPage);

    window.history.pushState({}, "", url);
}

async function loadMovies() {
    showLoading();

    try {
       const data = await getPopularMovies(currentPage);

renderMovies(data.results);
renderPagination(data.total_pages);

    } catch (error) {
        console.error(error);
        showError();

    } finally {
        loadingElement.hidden = true;
    }
}


function renderMovies(movies) {

    moviesContainer.innerHTML = "";
    emptyElement.hidden = true;

    if (!movies || movies.length === 0) {
    emptyElement.hidden = false;
    return;
}

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

function renderPagination(totalPages) {
    paginationElement.innerHTML = "";

    const previousButton = document.createElement("button");

    previousButton.className = "pagination__arrow";
    previousButton.textContent = "←";
    previousButton.disabled = currentPage === 1;

   previousButton.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--;

        const url = new URL(window.location);
        url.searchParams.set("page", currentPage);
        window.history.pushState({}, "", url);

        loadMovies();
    }
});

    paginationElement.appendChild(previousButton);

    for (let page = 1; page <= Math.min(totalPages, 5); page++) {
        const pageButton = document.createElement("button");

        pageButton.className = "pagination__page";
        pageButton.textContent = page;

        if (page === currentPage) {
            pageButton.classList.add("pagination__page--active");
        }

     pageButton.addEventListener("click", () => {
    currentPage = page;

    const url = new URL(window.location);
    url.searchParams.set("page", currentPage);
    window.history.pushState({}, "", url);

    loadMovies();
});

        paginationElement.appendChild(pageButton);
    }

    const nextButton = document.createElement("button");

    nextButton.className = "pagination__arrow";
    nextButton.textContent = "→";
    nextButton.disabled = currentPage === totalPages;

   nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
        currentPage++;

        const url = new URL(window.location);
        url.searchParams.set("page", currentPage);
        window.history.pushState({}, "", url);

        loadMovies();
    }
});

    paginationElement.appendChild(nextButton);
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

function showLoading() {
    loadingElement.hidden = false;
    errorElement.hidden = true;
    emptyElement.hidden = true;
}

function showError() {
    loadingElement.hidden = true;
    errorElement.hidden = false;
    errorElement.textContent = "Failed to load movies.";
}

async function loadHero() {
    try {
        const movie = await getMovieDetails(693134);

        if (movie.backdrop_path) {
            heroPoster.src =
                `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

            heroPoster.alt = movie.title;
        }
    } catch (error) {
        console.error(error);
    }
}


loadMovies();
loadHero();