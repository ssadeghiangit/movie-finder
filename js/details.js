import { getMovieDetails } from "./api.js";

const loadingElement = document.querySelector("#detailsLoading");
const errorElement = document.querySelector("#detailsError");
const contentElement = document.querySelector("#movieDetails");

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

        loadingElement.hidden = true;
        errorElement.hidden = true;
        contentElement.hidden = false;
    } catch (error) {
        console.error("Failed to load movie details:", error);
        showError("Failed to load movie details.");
    }
}

function renderMovieDetails(movie) {
    const requiredElements = [
    "#movieTitle",
    "#movieTagline",
    "#movieMeta",
    "#movieRating",
    "#moviePoster",
    "#movieGenres",
    "#movieOverview",
    "#movieDirector",
    "#movieWriters",
    "#movieStars",
    "#movieGallery",
    "#movieCast"

];

const missingElements = requiredElements.filter(
    (selector) => !document.querySelector(selector)
);

if (missingElements.length > 0) {
    throw new Error(
        `Missing HTML elements: ${missingElements.join(", ")}`
    );
}


    document.querySelector("#movieTitle").textContent =
        movie.title || "Untitled";

    document.querySelector("#movieTagline").textContent =
        movie.tagline || "";


    const releaseYear = movie.release_date
        ? movie.release_date.slice(0, 4)
        : "N/A";

    const ageRating = getAgeRating(movie.release_dates);

    const runtime = movie.runtime
        ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
        : "N/A";

    document.querySelector("#movieMeta").textContent =
        `${releaseYear}  •  ${ageRating}  •  ${runtime}`;

    // IMDb rating
    const rating = Number(movie.vote_average) || 0;

    document.querySelector("#movieRating").textContent =
        `${rating.toFixed(1)}/10 (${formatVoteCount(movie.vote_count || 0)})`;


    const posterElement = document.querySelector("#moviePoster");

    posterElement.src = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";

    posterElement.alt = movie.title || "Movie poster";

    // Genres
    renderGenres(movie.genres || []);

    // Plot
    document.querySelector("#movieOverview").textContent =
        movie.overview || "No description available.";

    // Director, writers, and stars
    const crew = movie.credits?.crew || [];
    const cast = movie.credits?.cast || [];

    const director = crew.find(
        (person) => person.job === "Director"
    );

    document.querySelector("#movieDirector").textContent =
        director?.name || "N/A";

    const writerNames = [
        ...new Set(
            crew
                .filter((person) =>
                    ["Writer", "Screenplay", "Story"].includes(person.job)
                )
                .map((person) => person.name)
        )
    ];

    document.querySelector("#movieWriters").textContent =
        writerNames.slice(0, 3).join(" • ") || "N/A";

    document.querySelector("#movieStars").textContent =
        cast
            .slice(0, 3)
            .map((person) => person.name)
            .join(" • ") || "N/A";


    renderGallery(movie.images?.backdrops || []);
    renderCast(movie.credits?.cast || []);
}

function getAgeRating(releaseDates) {
    const usRelease = releaseDates?.results?.find(
        (item) => item.iso_3166_1 === "US"
    );

    const certification = usRelease?.release_dates?.find(
        (item) => item.certification?.trim()
    )?.certification;

    return certification || "NR";
}

function renderGenres(genres) {
    const genresElement = document.querySelector("#movieGenres");

    genresElement.replaceChildren();

    for (const genre of genres) {
        const genreElement = document.createElement("span");

        genreElement.className = "genre-pill";
        genreElement.textContent = genre.name;

        genresElement.append(genreElement);
    }
}

function renderCast(cast) {
    const castElement = document.querySelector("#movieCast");

    castElement.replaceChildren();

    const mainCast = cast
        .filter((person) => person.name && person.profile_path)
        .slice(0, 6);

    for (const person of mainCast) {
        const card = document.createElement("article");
        card.className = "cast-card";

        const imageWrapper = document.createElement("div");
        imageWrapper.className = "cast-card__image";

        const image = document.createElement("img");
        image.src =
            `https://image.tmdb.org/t/p/w185${person.profile_path}`;
        image.alt = person.name;
        image.loading = "lazy";

        const name = document.createElement("p");
        name.className = "cast-card__name";
        name.textContent = person.name;

        const character = document.createElement("p");
        character.className = "cast-card__character";
        character.textContent = person.character || "";

        imageWrapper.append(image);
        card.append(imageWrapper, name, character);
        castElement.append(card);
    }

    castElement.closest(".cast-section").hidden =
        mainCast.length === 0;
}

function renderGallery(backdrops) {
    const galleryElement = document.querySelector("#movieGallery");

    galleryElement.replaceChildren();

    for (const backdrop of backdrops.slice(0, 3)) {
        const image = document.createElement("img");

        image.src =
            `https://image.tmdb.org/t/p/w780${backdrop.file_path}`;

        image.alt = "Scene from the movie";
        image.loading = "lazy";

        galleryElement.append(image);
    }

    galleryElement.hidden = galleryElement.children.length === 0;
}

function formatVoteCount(count) {
    if (count >= 1_000_000) {
        return `${(count / 1_000_000).toFixed(1)}M`;
    }

    if (count >= 1_000) {
        return `${Math.round(count / 1_000)}K`;
    }

    return String(count);
}

function showError(message) {
    loadingElement.hidden = true;
    contentElement.hidden = true;
    errorElement.textContent = message;
    errorElement.hidden = false;
}

loadMovieDetails();
