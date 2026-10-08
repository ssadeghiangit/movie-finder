const genres = [
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 80, name: "Crime" },
    { id: 18, name: "Drama" },
    { id: 14, name: "Fantasy" },
    { id: 27, name: "Horror" },
    { id: 9648, name: "Mystery" },
    { id: 10749, name: "Romance" },
    { id: 878, name: "Science Fiction" },
    { id: 53, name: "Thriller" }
];

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
    genresDropdown.classList.toggle("genres-dropdown--open");
});

renderGenres();