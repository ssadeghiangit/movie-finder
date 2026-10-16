
import { searchMovies } from "./api.js";

const searchForm = document.querySelector("#searchForm");
const searchInput = document.querySelector("#searchInput");
const searchDropdown = document.querySelector("#searchDropdown");

let debounceTimer;
let latestRequestId = 0;

function clearDropdown() {
    if (searchDropdown) {
        searchDropdown.innerHTML = "";
    }
}

function renderSearchDropdown(movies) {
    if (!searchDropdown) {
        return;
    }

    searchDropdown.innerHTML = "";

    movies.slice(0, 5).forEach((movie) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "search-dropdown__item";

        const poster = document.createElement("img");
        poster.alt = "";
        poster.loading = "lazy";

        if (movie.poster_path) {
            poster.src =
                `https://image.tmdb.org/t/p/w92${movie.poster_path}`;
        }

        const textContainer = document.createElement("div");
        const title = document.createElement("h3");
        const year = document.createElement("span");

        title.textContent = movie.title;
        year.textContent =
            movie.release_date?.slice(0, 4) || "Year unavailable";

        textContainer.append(title, year);

        if (movie.poster_path) {
            item.append(poster);
        }

        item.append(textContainer);

        item.addEventListener("click", () => {
            window.location.href = `./details.html?id=${movie.id}`;
        });

        searchDropdown.append(item);
    });
}

async function handleSearchInput() {
    const query = searchInput.value.trim();
    const requestId = ++latestRequestId;

    clearTimeout(debounceTimer);
    clearDropdown();

    if (query.length < 2) {
        return;
    }

    debounceTimer = setTimeout(async () => {
        try {
            const data = await searchMovies(query);

            // نتایج درخواست‌های قدیمی را نمایش نده.
            if (requestId !== latestRequestId) {
                return;
            }

            renderSearchDropdown(data.results || []);
        } catch (error) {
            if (requestId === latestRequestId) {
                console.error("Search suggestions failed:", error);
                clearDropdown();
            }
        }
    }, 300);
}

if (searchForm && searchInput) {
    searchInput.addEventListener("input", handleSearchInput);

    searchForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const query = searchInput.value.trim();

        if (!query) {
            return;
        }

        window.location.href =
            `./search.html?query=${encodeURIComponent(query)}`;
    });

    document.addEventListener("click", (event) => {
        if (
            searchDropdown &&
            !searchForm.contains(event.target) &&
            !searchDropdown.contains(event.target)
        ) {
            clearDropdown();
        }
    });
}
