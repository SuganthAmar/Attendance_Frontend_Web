// src/api/userApi.ts
import axios from "axios";

const API_URL = "http://localhost:5000/users";

interface UserResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    password: string;
  };
  message?: string; 
}

interface User {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}


export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<UserResponse> => {
  try {
    const response = await axios.post(`${API_URL}/register`, { name, email, password });
    return response.data;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error; 
  }
};

export const loginUser = async (
  email: string,
  password: string
): Promise<UserResponse> => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data; 
  } catch (error) {
    console.error("Error logging in:", error);
    throw error; 
  }
};


export const getLoggedInUser = async (id: string): Promise<UserResponse> => {
  try {
    const response = await axios.get(`${API_URL}/profile?id=${id}`);
    return response.data; 
  } catch (error) {
    console.error("Error fetching logged-in user:", error);
    throw error;
  }
};


export const updateUserProfile = async (
  userId: string,
  name: string,
  email: string,
  password: string,
  isAdmin: boolean
): Promise<UserResponse> => {
  try {
    const response = await axios.put(`${API_URL}/profile`, {
      id: userId,
      name,
      email,
      password,
      isAdmin, 
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export const getUserById = async (id: string) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data.data; // { id, name }
  } catch (error) {
    console.error("Error fetching user by id:", error);
    throw error;
  }
};
