const API_BASE_URL = "https://api.themoviedb.org/3";

const options = {
    headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI1MjlmYzg0ZmM4NDhiZjYxMDQ2ODRmMjQ4Y2QxMzY3YSIsIm5iZiI6MTc5MTMwNzY1MC4zMTYsInN1YiI6IjZhYzUyZjgyOTEyYzQ0YzU2YmJkNmRlMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.Um962UT3x_1chTqQfeI5KZKmJtwf34W0DvVtC39o9EI"
    }
};

export async function searchMovies(query, page = 1) {
    const url = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`;

    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error("Failed to fetch movies");
    }

    return response.json();
}