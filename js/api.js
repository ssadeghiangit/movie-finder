const API_BASE_URL = "https://api.themoviedb.org/3";

const options = {
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MjlmYzg0ZmM4NDhiZjYxMDQ2ODRmMjQ4Y2QxMzY3YSIsIm5iZiI6MTc5MTMwNzY1MC4zMTYsInN1YiI6IjZhYzUyZjgyOTEyYzQ0YzU2YmJkNmRlMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Um962UT3x_1chTqQfeI5KZKmJtwf34W0DvVtC39o9EI"
    }
};

export async function searchMovies(query, page = 1) {
    const params = new URLSearchParams({
        query: query.trim(),
        page: String(page)
    });

    const url = `${API_BASE_URL}/search/movie?${params}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to search movies");
    }

    return response.json();
}

export async function getPopularMovies(page = 1) {
    const url = `${API_BASE_URL}/movie/popular?page=${page}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to fetch popular movies");
    }

    return response.json();
}

export async function getMoviesByGenre(
    genreId,
    page = 1,
    sortOrder = "desc"
) {
    const sortBy = sortOrder === "desc"
        ? "popularity.desc"
        : "popularity.asc";

    const params = new URLSearchParams({
        with_genres: String(genreId),
        page: String(page),
        sort_by: sortBy,
        "vote_count.gte": "50"
    });

    const url = `${API_BASE_URL}/discover/movie?${params}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to fetch movies by genre");
    }

    return response.json();
}

export async function getMovieDetails(movieId) {
    const params = new URLSearchParams({
        append_to_response: "credits,images,release_dates"
    });

    const url = `${API_BASE_URL}/movie/${movieId}?${params}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to fetch movie details");
    }

    return response.json();
}