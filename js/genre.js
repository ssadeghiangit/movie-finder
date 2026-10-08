import { getMoviesByGenre } from "./api.js";

const genreMovies = document.querySelector("#genreMovies");
const genreTitle = document.querySelector("#genreTitle");

const loadingElement = document.querySelector("#genreLoading");
const errorElement = document.querySelector("#genreError");
const emptyElement = document.querySelector("#genreEmpty");

const paginationElement = document.querySelector("#genrePagination");

const params = new URLSearchParams(window.location.search);

const genreId = params.get("id");
const genreName = params.get("name") || "Movies";

let currentPage = Number(params.get("page")) || 1;
let totalPages = 1;

genreTitle.textContent = `${genreName} Movies`;

async function loadGenreMovies() {
    showLoading();

    try {
        const data = await getMoviesByGenre(genreId, currentPage);



        totalPages = data.total_pages;

        renderMovies(data.results);
        renderPagination();

    } catch (error) {
        console.error(error);
        showError();

    } finally {
        loadingElement.hidden = true;
    }
}

function renderMovies(movies) {
    genreMovies.innerHTML = "";
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
                        ${genreName}
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

        genreMovies.appendChild(movieCard);
    });
}

function renderPagination() {
    paginationElement.innerHTML = "";

    if (totalPages <= 1) {
        return;
    }

    const previousButton = document.createElement("button");

    previousButton.className = "pagination__arrow";
    previousButton.textContent = "←";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            updatePage();
        }
    });

    paginationElement.appendChild(previousButton);

    const pageButton = document.createElement("button");

    pageButton.className =
        "pagination__page pagination__page--active";

    pageButton.textContent = currentPage;

    paginationElement.appendChild(pageButton);

    const nextButton = document.createElement("button");

    nextButton.className = "pagination__arrow";
    nextButton.textContent = "→";
    nextButton.disabled = currentPage >= totalPages;

    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePage();
        }
    });

    paginationElement.appendChild(nextButton);
}

function updatePage() {
    const url = new URL(window.location.href);

    url.searchParams.set("page", currentPage);

    window.history.pushState({}, "", url);

    loadGenreMovies();
}

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

if (!genreId) {
    showError();
} else {
    loadGenreMovies();
}