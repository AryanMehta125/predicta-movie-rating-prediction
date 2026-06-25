import axios from "axios";

// Local FastAPI backend
const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000";

export const API_BASE = `${BACKEND_URL}/api`;

console.log("BACKEND_URL =", BACKEND_URL);
console.log("API_BASE =", API_BASE);

const api = axios.create({
    baseURL: API_BASE,
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    },
});

export const predictMovie = async (payload) => {
    const { data } = await api.post("/predict", payload);
    return data;
};

export const analyzeSentiment = async (review) => {
    const { data } = await api.post("/sentiment", { review });
    return data;
};

export const computeFinalRating = async (predicted_rating, review) => {
    const { data } = await api.post("/final-rating", {
        predicted_rating,
        review,
    });
    return data;
};

export const sharePrediction = async (payload) => {
    const { data } = await api.post("/predictions/share", payload);
    return data;
};

export const getSharedPrediction = async (id) => {
    const { data } = await api.get(`/predictions/${id}`);
    return data;
};

export const compareMovies = async (movie_a, movie_b) => {
    const { data } = await api.post("/compare", {
        movie_a,
        movie_b,
    });
    return data;
};

export const fetchAnalytics = async () => {
    const { data } = await api.get("/analytics");
    return data;
};

export const fetchModelInfo = async () => {
    const { data } = await api.get("/model-info");
    return data;
};

export const fetchSuggestions = async (field, q = "") => {
    const { data } = await api.get("/suggestions", {
        params: { field, q },
    });
    return data.results;
};

export default api;