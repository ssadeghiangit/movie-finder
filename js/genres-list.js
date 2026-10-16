import { genres } from "./genres-data.js";
import {
    getMoviesByGenre,
    getMovieDetails
} from "./api.js";

const genreList = document.querySelector("#genreList");
const genreMovieCount = document.querySelector("#genreMovieCount");
const genreMovies = document.querySelector("#genreMovies");
const sortButton = document.querySelector("#sortButton");

let selectedGenreId = genres[0].id;
let currentMovies = [];
let sortOrder = "desc";
let latestRequestId = 0;

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

function renderGenreList() {
    genreList.innerHTML = "";

    genres.forEach((genre) => {
        const genreLink = document.createElement("a");

        genreLink.className = "genre-list__item";
        genreLink.href = `#genre-${genre.id}`;
        genreLink.textContent = genre.name;
        genreLink.dataset.genreId = genre.id;

        if (genre.id === selectedGenreId) {
            genreLink.classList.add("genre-list__item--active");
            genreLink.setAttribute("aria-current", "true");
        }

        genreList.appendChild(genreLink);
    });
}

async function loadGenreMovies(genreId) {
    const selectedGenre = genres.find(
        (genre) => genre.id === genreId
    );

    if (!selectedGenre) {
        return;
    }

    const requestId = ++latestRequestId;

    genreMovieCount.textContent = "Loading...";
    genreMovies.textContent = "Loading movies...";

    try {
        const data = await getMoviesByGenre(genreId, 1, sortOrder);

        // از نمایش پاسخ درخواست قدیمی جلوگیری می‌کنیم.
        if (requestId !== latestRequestId) {
            return;
        }

        currentMovies = data.results || [];

        genreMovieCount.textContent =
            `${Number(data.total_results || 0).toLocaleString()} titles`;

        renderMovies(currentMovies);
    } catch (error) {
        if (requestId !== latestRequestId) {
            return;
        }

        console.error("Failed to load genre movies:", error);

        genreMovieCount.textContent = "Unavailable";
        genreMovies.textContent =
            "Unable to load movies. Please try again.";
    }
}

function updateSortButton() {
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

    sortButton.setAttribute(
        "aria-pressed",
        String(sortOrder === "asc")
    );
}

sortButton.addEventListener("click", () => {
    sortOrder = sortOrder === "desc" ? "asc" : "desc";

    updateSortButton();
    loadGenreMovies(selectedGenreId);
});

function renderMovies(movies) {
    genreMovies.innerHTML = "";

    if (!movies.length) {
        genreMovies.textContent =
            "No movies found for this genre.";
        return;
    }

    const movieCards = movies.map(createMovieCard);

    genreMovies.append(...movieCards);
}

function formatVoteCount(count) {
    const n = Number(count) || 0;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return String(n);
}

function createMovieCard(movie) {
    const movieCard = document.createElement("article");
    movieCard.className = "genre-movie-card";

    // Poster
    const posterLink = document.createElement("a");
    posterLink.href = `./details.html?id=${movie.id}`;
    posterLink.setAttribute("aria-label", `View ${movie.title} details`);

    const poster = document.createElement("img");
    poster.className = "genre-movie-card__poster";
    poster.alt = `${movie.title} poster`;
    poster.loading = "lazy";

    if (movie.poster_path) {
        poster.src = `https://image.tmdb.org/t/p/w342${movie.poster_path}`;
    } else {
        poster.classList.add("genre-movie-card__poster--missing");
    }

    posterLink.appendChild(poster);

    // Details
    const details = document.createElement("div");
    details.className = "genre-movie-card__details";

    // Header: title LEFT + rating RIGHT
    const header = document.createElement("div");
    header.className = "genre-movie-card__header";

    const title = document.createElement("h3");
    title.className = "genre-movie-card__title";
    title.textContent = movie.title;

    const rating = document.createElement("div");
    rating.className = "genre-movie-card__rating";

    const star = document.createElement("span");
    star.className = "genre-movie-card__star";
    star.textContent = "★";

    const ratingValue = Number(movie.vote_average);
    const ratingText = document.createElement("span");
    ratingText.textContent = Number.isFinite(ratingValue)
        ? `${ratingValue.toFixed(1)} (${formatVoteCount(movie.vote_count)})`
        : "N/A";

    rating.append(star, ratingText);
    header.append(title, rating);

    // Meta: year · age
    const metadata = document.createElement("p");
    metadata.className = "genre-movie-card__metadata";
    const year = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "Year unavailable";
    metadata.textContent = `${year} · ${movie.adult ? "18+" : "All audiences"}`;

    // Genre pills
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

    // Overview
    const overview = document.createElement("p");
    overview.className = "genre-movie-card__overview";
    overview.textContent = movie.overview || "No description available.";

    // Director
    const director = document.createElement("p");
    director.className = "genre-movie-card__director";
    director.textContent = "Director: Loading...";

    // Cast
    const cast = document.createElement("p");
    cast.className = "genre-movie-card__cast";
    cast.textContent = "Stars: Loading...";

    // Votes
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

    loadAdditionalMovieInfo(movie.id, director, cast);

    return movieCard;
}

async function loadAdditionalMovieInfo(
    movieId,
    directorElement,
    castElement
) {
    try {
        const details = await getCachedMovieDetails(movieId);

        const director = details.credits?.crew?.find(
            (person) => person.job === "Director"
        );

        const actors = (details.credits?.cast || [])
            .slice(0, 3)
            .map((person) => person.name);

        directorElement.textContent =
            `Director: ${director?.name || "Unknown"}`;

        castElement.textContent =
            `Stars: ${actors.join(", ") || "Unknown"}`;
    } catch (error) {
        console.error(
            `Failed to load details for movie ${movieId}:`,
            error
        );

        directorElement.textContent = "Director: Unavailable";
        castElement.textContent = "Stars: Unavailable";
    }
}

genreList.addEventListener("click", (event) => {
    const genreLink = event.target.closest("[data-genre-id]");

    if (!genreLink) {
        return;
    }

    event.preventDefault();

    selectedGenreId = Number(genreLink.dataset.genreId);

    renderGenreList();

    history.replaceState(
        null,
        "",
        `#genre-${selectedGenreId}`
    );

    loadGenreMovies(selectedGenreId);
});

updateSortButton();
renderGenreList();
loadGenreMovies(selectedGenreId);