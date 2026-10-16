import { genres } from "./genres-data.js";

const genresButton = document.querySelector("#genresButton");
const genresDropdown = document.querySelector("#genresDropdown");

function renderGenres() {
    genresDropdown.innerHTML = "";

    genres.forEach((genre) => {
        const genreLink = document.createElement("a");

        genreLink.href =
            `./genre.html?id=${genre.id}&name=${encodeURIComponent(genre.name)}`;

        genreLink.textContent = genre.name;

        genresDropdown.appendChild(genreLink);
    });
}

genresButton.addEventListener("click", () => {
    const isOpen = genresDropdown.classList.toggle(
        "genres-dropdown--open"
    );

    genresButton.setAttribute("aria-expanded", String(isOpen));
});

renderGenres();