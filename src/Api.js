// src/api.js
const API_BASE_URL = 'https://mushtrack-backend.onrender.com'; // Replace with your actual Render URL

// Helper to get auth token (you'll need to implement how you store and retrieve tokens)
const getAuthToken = () => {
  // Retrieve the access token from localStorage, a global state, or a cookie
  return localStorage.getItem('accessToken'); // Assuming you store it here
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Something went wrong with the API request.');
  }
  return response.json();
};

export const loginUser = async (username, password) => {
  const response = await fetch(`${API_BASE_URL}/api/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  const data = await handleResponse(response);
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  return data;
};

export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token available.');

  const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  const data = await handleResponse(response);
  localStorage.setItem('accessToken', data.access);
  return data.access;
};

export const fetchBatches = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/batches/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, // Send JWT token for authentication
    },
  });
  return handleResponse(response);
};

export const createBatch = async (batchData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/batches/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(batchData),
  });
  return handleResponse(response);
};

export const updateExistingBatch = async (batchId, updatedData) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/`, {
    method: 'PUT', // or 'PATCH' depending on your Django DRF setup
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updatedData),
  });
  return handleResponse(response);
};

export const deleteExistingBatch = async (batchId) => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error('Failed to delete batch.');
  }
  return true; // Or handle as needed
};

export const fetchVarieties = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/varieties/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  return handleResponse(response);
};