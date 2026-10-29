import api from "../api/client";

export const getUsers = async () => {
    const response = await api.get("/users");
    return response.data;
};

export const getSkills = async () => {
    const response = await api.get("/skills");
    return response.data;
};

export const createSwapRequest = async (requestData) => {
    const response = await api.post("/swap-requests", requestData);
    return response.data;
};