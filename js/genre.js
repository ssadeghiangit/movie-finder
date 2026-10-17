import { getMoviesByGenre, getMovieDetails } from "./api.js";
import { genres } from "./genres-data.js";

const genreMovies = document.querySelector("#genreMovies");
const genreTitle = document.querySelector("#genreTitle");
const genreSidebarList = document.querySelector("#genreSidebarList");
const genreMovieCount = document.querySelector("#genreMovieCount");

const loadingElement = document.querySelector("#genreLoading");
const errorElement = document.querySelector("#genreError");
const emptyElement = document.querySelector("#genreEmpty");

const paginationElement = document.querySelector("#genrePagination");
const sortButton = document.querySelector("#sortButton");

const params = new URLSearchParams(window.location.search);

const genreId = Number(params.get("id"));
const genre = genres.find((item) => item.id === genreId);
const genreName = genre?.name || params.get("name") || "Movies";

let currentPage = Math.max(1, Number(params.get("page")) || 1);
let totalPages = 1;
let sortOrder = "desc";
let currentMovies = [];

genreTitle.textContent = `${genreName} Movies`;
document.title = `${genreName} Movies | Movie Finder`;

function renderGenreSidebar() {
    genreSidebarList.innerHTML = "";

    genres.forEach((item) => {
        const link = document.createElement("a");

        link.className = "genre-list__item";
        link.href =
            `./genre.html?id=${item.id}&name=${encodeURIComponent(item.name)}`;
        link.textContent = item.name;

        if (item.id === genreId) {
            link.classList.add("genre-list__item--active");
            link.setAttribute("aria-current", "page");
        }

        genreSidebarList.appendChild(link);
    });
}

async function loadGenreMovies() {
    showLoading();

    try {
        const data = await getMoviesByGenre(genreId, currentPage, sortOrder);

        totalPages = Math.min(data.total_pages || 1, 500);
        currentMovies = data.results || [];

        if (currentPage > totalPages) {
            currentPage = totalPages;
            updatePage();
            return;
        }

        genreMovieCount.textContent =
            `${Number(data.total_results || 0).toLocaleString()} titles`;

        renderMovies(currentMovies);
        renderPagination();
    } catch (error) {
        console.error("Failed to load genre movies:", error);
        showError();
    } finally {
        loadingElement.hidden = true;
    }
}

function updateSortButtonUI() {
    const arrowUp = sortButton.querySelector(".arrow-up");
    const arrowDown = sortButton.querySelector(".arrow-down");

    if (arrowUp && arrowDown) {
        arrowUp.classList.toggle("active", sortOrder === "asc");
        arrowDown.classList.toggle("active", sortOrder === "desc");
    }

    sortButton.setAttribute(
        "aria-label",
        sortOrder === "desc"
            ? "Sort by ranking, highest first"
            : "Sort by ranking, lowest first"
    );
}

sortButton.addEventListener("click", () => {
    sortOrder = sortOrder === "desc" ? "asc" : "desc";
    updateSortButtonUI();
    currentPage = 1;
    updatePage();
});

const movieDetailsCache = new Map();

async function getCachedMovieDetails(movieId) {
    if (!movieDetailsCache.has(movieId)) {
        const detailsPromise = getMovieDetails(movieId);
        movieDetailsCache.set(movieId, detailsPromise);
        detailsPromise.catch(() => {
            movieDetailsCache.delete(movieId);
        });
    }
    return movieDetailsCache.get(movieId);
}

function formatVoteCount(count) {
    const n = Number(count) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

function renderMovies(movies) {
    genreMovies.querySelectorAll(".genre-movie-card").forEach((card) => {
        card.remove();
    });

    emptyElement.hidden = true;

    if (!movies.length) {
        emptyElement.hidden = false;
        return;
    }

    movies.forEach((movie) => {
        const movieCard = document.createElement("article");
        movieCard.className = "genre-movie-card";

        // Poster
        const posterLink = document.createElement("a");
        posterLink.href = `./details.html?id=${movie.id}`;
        posterLink.setAttribute("aria-label", `View ${movie.title} details`);

        const posterImage = document.createElement("img");
        posterImage.className = "genre-movie-card__poster";
        posterImage.loading = "lazy";
        posterImage.alt = `${movie.title} poster`;

        if (movie.poster_path) {
            posterImage.src = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
        } else {
            posterImage.classList.add("genre-movie-card__poster--missing");
        }

        posterLink.appendChild(posterImage);

        // Details
        const details = document.createElement("div");
        details.className = "genre-movie-card__details";

        // Header: title LEFT + rating RIGHT (like Figma)
        const header = document.createElement("div");
        header.className = "genre-movie-card__header";

        const title = document.createElement("h3");
        title.className = "genre-movie-card__title";
        title.textContent = movie.title;

        const ratingElement = document.createElement("div");
        ratingElement.className = "genre-movie-card__rating";

        const star = document.createElement("span");
        star.className = "genre-movie-card__star";
        star.textContent = "★";

        const ratingValue = Number(movie.vote_average);
        const ratingText = document.createElement("span");
        ratingText.textContent = Number.isFinite(ratingValue)
            ? `${ratingValue.toFixed(1)} (${formatVoteCount(movie.vote_count)})`
            : "N/A";

        ratingElement.append(star, ratingText);
        header.append(title, ratingElement);

        // Meta: year · age
        const metadata = document.createElement("p");
        metadata.className = "genre-movie-card__metadata";
        const year = movie.release_date
            ? movie.release_date.slice(0, 4)
            : "Year unavailable";
        metadata.textContent = `${year} · ${movie.adult ? "18+" : "All audiences"}`;

        // Genre pills (like Figma)
        const genresRow = document.createElement("div");
        genresRow.className = "genre-movie-card__genres";

        const genreNames = (movie.genre_ids || [])
            .map((id) => genres.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .slice(0, 3);

        genreNames.forEach((name) => {
            const pill = document.createElement("span");
            pill.className = "genre-movie-card__genre-pill";
            pill.textContent = name;
            genresRow.appendChild(pill);
        });

        const overview = document.createElement("p");
        overview.className = "genre-movie-card__overview";
        overview.textContent = movie.overview || "No synopsis available.";

        const director = document.createElement("p");
        director.className = "genre-movie-card__director";
        director.textContent = "Director: Loading...";

        const cast = document.createElement("p");
        cast.className = "genre-movie-card__cast";
        cast.textContent = "Stars: Loading...";


        const votes = document.createElement("p");
        votes.className = "genre-movie-card__votes";
        votes.textContent = `Votes: ${Number(movie.vote_count || 0).toLocaleString()}`;

        details.append(
            header,
            metadata,
            genresRow,
            overview,
            director,
            cast,
            votes
        );

        movieCard.append(posterLink, details);
        genreMovies.appendChild(movieCard);

        loadAdditionalMovieInfo(movie.id, director, cast);
    });
}

async function loadAdditionalMovieInfo(movieId, directorElement, castElement) {
    try {
        const details = await getCachedMovieDetails(movieId);

        const directorPerson = details.credits?.crew?.find(
            (person) => person.job === "Director"
        );

        const actors = (details.credits?.cast || [])
            .slice(0, 3)
            .map((person) => person.name);

        directorElement.textContent =
            `Director: ${directorPerson?.name || "Unknown"}`;

        castElement.textContent =
            `Stars: ${actors.join(", ") || "Unknown"}`;
    } catch (error) {
        console.error(`Failed to load details for movie ${movieId}:`, error);
        directorElement.textContent = "Director: Unavailable";
        castElement.textContent = "Stars: Unavailable";
    }
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
    pageButton.className = "pagination__page pagination__page--active";
    pageButton.textContent = currentPage;
    pageButton.setAttribute("aria-current", "page");

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

renderGenreSidebar();
updateSortButtonUI();

if (!params.get("id") || !genre) {
    showError();
    genreMovieCount.textContent = "Unavailable";
} else {
    loadGenreMovies();
}
