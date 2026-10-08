import { searchMovies } from "./api.js";

const searchMoviesElement = document.querySelector("#searchMovies");
const searchTitleElement = document.querySelector("#searchTitle");

const loadingElement = document.querySelector("#searchLoading");
const errorElement = document.querySelector("#searchError");
const emptyElement = document.querySelector("#searchEmpty");

const paginationElement = document.querySelector("#searchPagination");

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");

const params = new URLSearchParams(window.location.search);

const query = params.get("query");

let currentPage = Number(params.get("page")) || 1;
let totalPages = 1;

if (query) {
    searchInput.value = query;
    searchTitleElement.textContent = `Search results for "${query}"`;
    loadSearchResults();
} else {
    showError("Search query was not provided.");
}

async function loadSearchResults() {
    showLoading();

    try {
        const data = await searchMovies(query, currentPage);

        totalPages = data.total_pages;

        renderMovies(data.results);
        renderPagination();

    } catch (error) {
        console.error(error);
        showError("Failed to load search results.");

    } finally {
        loadingElement.hidden = true;
    }
}

function renderMovies(movies) {
    searchMoviesElement.innerHTML = "";
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
                        ${movie.release_date?.slice(0, 4) || "N/A"}
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

        searchMoviesElement.appendChild(movieCard);
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

    loadSearchResults();
}

function showLoading() {
    loadingElement.hidden = false;
    errorElement.hidden = true;
    emptyElement.hidden = true;
}

function showError(message) {
    loadingElement.hidden = true;
    errorElement.hidden = false;
    errorElement.textContent = message;
}