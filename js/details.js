import { getMovieDetails } from "./api.js";

const loadingElement = document.querySelector("#detailsLoading");
const errorElement = document.querySelector("#detailsError");
const contentElement = document.querySelector("#detailsContent");
const castSection = document.querySelector("#castSection");

const params = new URLSearchParams(window.location.search);
const movieId = params.get("id");

async function loadMovieDetails() {
    if (!movieId) {
        showError("Movie ID was not provided.");
        return;
    }

    try {
        const movie = await getMovieDetails(movieId);

        renderMovieDetails(movie);
    } catch (error) {
        console.error(error);
        showError("Failed to load movie details.");
    }
}

function renderMovieDetails(movie) {
    const director = movie.credits.crew.find(
        (person) => person.job === "Director"
    );

    const writers = movie.credits.crew.filter(
        (person) =>
            person.department === "Writing" ||
            person.job === "Writer"
    );

    const cast = movie.credits.cast.slice(0, 6);
    const backdrops = movie.images.backdrops.slice(0, 3);

    document.querySelector("#movieTitle").textContent = movie.title;

    document.querySelector("#movieYear").textContent =
        movie.release_date?.slice(0, 4) || "N/A";

    document.querySelector("#movieCertification").textContent =
        "N/A";

    document.querySelector("#movieRuntime").textContent =
        movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : "N/A";

    document.querySelector("#movieRating").textContent =
        `${movie.vote_average.toFixed(1)}/10`;

    const posterElement = document.querySelector("#moviePoster");

    posterElement.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";

    posterElement.alt = movie.title;

    document.querySelector("#movieGenres").innerHTML =
        movie.genres
            .map(
                (genre) => `
                    <span class="genre-pill">
                        ${genre.name}
                    </span>
                `
            )
            .join("");

    document.querySelector("#moviePlot").textContent =
        movie.overview || "No description available.";

    document.querySelector("#movieDirector").textContent =
        director?.name || "N/A";

    document.querySelector("#movieWriters").textContent =
        writers.map((writer) => writer.name).join(", ") || "N/A";

    document.querySelector("#movieStars").textContent =
        cast.map((person) => person.name).join(", ") || "N/A";

    renderGallery(backdrops);
    renderCast(cast);

    loadingElement.hidden = true;
    contentElement.hidden = false;
    castSection.hidden = false;
}

function renderGallery(backdrops) {
    const galleryElement = document.querySelector("#movieGallery");

    galleryElement.innerHTML = backdrops
        .map(
            (backdrop) => `
                <img
                    src="https://image.tmdb.org/t/p/w780${backdrop.file_path}"
                    alt="Scene from the movie"
                >
            `
        )
        .join("");
}

function renderCast(cast) {
    const castListElement = document.querySelector("#castList");

    castListElement.innerHTML = cast
        .map(
            (person) => `
                <article class="cast-card">

                    ${
                        person.profile_path
                            ? `
                                <img
                                    src="https://image.tmdb.org/t/p/w500${person.profile_path}"
                                    alt="${person.name}"
                                >
                            `
                            : `
                                <div class="cast-card__placeholder">
                                    No Image
                                </div>
                            `
                    }

                    <h3>${person.name}</h3>

                    <p>${person.character || "N/A"}</p>

                </article>
            `
        )
        .join("");
}

function showError(message) {
    loadingElement.hidden = true;
    errorElement.textContent = message;
}

loadMovieDetails();