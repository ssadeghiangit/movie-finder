import {
    getMovieDetails,
    getPopularMovies
} from "./api.js";
import { genres } from "./genres-data.js";


const moviesContainer = document.querySelector(".top-picks");

const loadingElement = document.querySelector("#homeLoading");
const errorElement = document.querySelector("#homeError");
const emptyElement = document.querySelector("#homeEmpty");

const heroPoster = document.querySelector(".hero__poster");

const heroTitle = document.querySelector(".hero__title");
const heroGenres = document.querySelector(".hero__genres");
const heroSynopsis = document.querySelector(".hero__synopsis");
const heroStatus = document.querySelector(".hero__status");
const heroPagination = document.querySelector("#heroPagination");

const urlParams = new URLSearchParams(window.location.search);

let currentPage = Number(urlParams.get("page")) || 1;
const paginationElement = document.querySelector("#homePagination");



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

        const genreText = (movie.genre_ids || [])
            .map((id) => genres.find((g) => g.id === id)?.name)
            .filter(Boolean)
            .slice(0, 2)
            .join(", ") || "Movie";

        const rating = Number.isFinite(Number(movie.vote_average))
            ? Number(movie.vote_average).toFixed(1)
            : "N/A";

        movieCard.innerHTML = `
            <img
                class="movie-card__poster"
                src="${poster}"
                alt="${movie.title}"
                loading="lazy"
            >
            <div class="movie-card__info">
                <div>
                    <h3 class="movie-card__title">${movie.title}</h3>
                    <p class="movie-card__genres">${genreText}</p>
                </div>
                <div class="movie-card__actions">
                    <div class="movie-card__rating">
                        <span>★</span>
                        <span>${rating}</span>
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
let heroMovies = [];
let currentHeroIndex = 0;
let heroInterval = null;

const HERO_SLIDE_DURATION = 5000;
const HERO_MOVIE_COUNT = 5;

async function loadHero() {
    try {
        const data = await getPopularMovies(1);

        const movies = data.results
            .filter((movie) => movie.backdrop_path)
            .slice(0, HERO_MOVIE_COUNT);

        if (movies.length === 0) {
            return;
        }

        const detailedMovies = await Promise.all(
            movies.map((movie) => getMovieDetails(movie.id))
        );

        heroMovies = detailedMovies;

        renderHeroPagination();
        showHeroSlide(0);
        startHeroAutoplay();

    } catch (error) {
        console.error("Failed to load hero slider:", error);
    }
}

function showHeroSlide(index) {
    if (heroMovies.length === 0) {
        return;
    }

    currentHeroIndex = index;

    const movie = heroMovies[currentHeroIndex];

    heroPoster.src =
        `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;

    heroPoster.alt = movie.title;

    heroTitle.textContent = movie.title;

    heroGenres.innerHTML = "";

    movie.genres.slice(0, 3).forEach((genre) => {
        const genreTag = document.createElement("span");

        genreTag.className = "genre-tag";
        genreTag.textContent = genre.name;

        heroGenres.appendChild(genreTag);
    });

    heroSynopsis.textContent =
        movie.overview || "No synopsis available.";

    heroStatus.textContent = movie.status || "";

    const dots = heroPagination.querySelectorAll(".hero__dot");

    dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === currentHeroIndex;

        dot.classList.toggle("hero__dot--active", isActive);
        dot.setAttribute("aria-current", isActive ? "true" : "false");
    });
}

function renderHeroPagination() {
    heroPagination.innerHTML = "";

    heroMovies.forEach((movie, index) => {
        const dot = document.createElement("button");

        dot.type = "button";
        dot.className = "hero__dot";
        dot.setAttribute(
            "aria-label",
            `Show ${movie.title}`
        );

        dot.addEventListener("click", () => {
            showHeroSlide(index);
            startHeroAutoplay();
        });

        heroPagination.appendChild(dot);
    });
}

function startHeroAutoplay() {
    clearInterval(heroInterval);

    heroInterval = setInterval(() => {
        const nextIndex =
            (currentHeroIndex + 1) % heroMovies.length;

        showHeroSlide(nextIndex);
    }, HERO_SLIDE_DURATION);
}


loadMovies();
loadHero();