// src/api.js
export const API_BASE_URL = 'YOUR_RENDER_BACKEND_URL_HERE'; // Make sure this is correct

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper to get refresh token
const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    // Include specific error message if available
    throw new Error(errorData.detail || errorData.messages?.[0]?.message || 'Something went wrong with the API request.');
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
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available. User must log in again.');

  console.log('Attempting to refresh token...');
  const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!response.ok) {
    // If refresh fails, clear tokens and force re-login
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw new Error('Failed to refresh token. Please log in again.');
  }

  const data = await response.json();
  localStorage.setItem('accessToken', data.access);
  console.log('Token refreshed successfully!');
  return data.access;
};

// --- NEW: A wrapper function for authenticated requests ---
async function requestWithAuth(url, options = {}) {
  let token = getAuthToken();
  let headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, { ...options, headers });

  // If response is 401 and token is expired, try refreshing
  if (response.status === 401) {
    const errorData = await response.json();
    if (errorData.code === 'token_not_valid' && errorData.messages?.[0]?.message === 'Token is expired') {
      try {
        console.log('Access token expired. Attempting to refresh...');
        const newAccessToken = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        // Retry the original request with the new token
        response = await fetch(url, { ...options, headers });
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        // Propagate the error so App.js knows to redirect to login
        throw refreshError;
      }
    } else if (errorData.code === 'token_not_valid' && errorData.detail === 'Given token not valid for any token type') {
      // This case might happen if refresh token is also invalid or something else is wrong
      console.error('Authentication failed, possibly invalid refresh token. Forcing re-login.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw new Error('Authentication failed. Please log in again.');
    }
  }

  return handleResponse(response); // Process the (potentially retried) response
}

// --- Update your existing API functions to use requestWithAuth ---

export const fetchBatches = async () => {
  // Now simply call requestWithAuth
  return requestWithAuth(`${API_BASE_URL}/api/batches/`, {
    method: 'GET',
  });
};

export const createBatch = async (batchData) => {
  return requestWithAuth(`${API_BASE_URL}/api/batches/`, {
    method: 'POST',
    body: JSON.stringify(batchData),
  });
};

export const updateExistingBatch = async (batchId, updatedData) => {
  return requestWithAuth(`${API_BASE_URL}/api/batches/${batchId}/`, {
    method: 'PUT', // or 'PATCH'
    body: JSON.stringify(updatedData),
  });
};

export const deleteExistingBatch = async (batchId) => {
  // For DELETE, if the backend returns a 204 No Content, handleResponse will try to parse JSON
  // which might fail. Adjust handleResponse or return differently for DELETE.
  // For simplicity, let's just check response.ok here for DELETE specifically.
  const token = getAuthToken();
  if (!token) throw new Error('Authentication token not found.');

  const response = await fetch(`${API_BASE_URL}/api/batches/${batchId}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.status === 401) { // Manual refresh attempt for DELETE specifically, or use requestWithAuth
      try {
        console.log('Access token expired during DELETE. Attempting to refresh...');
        const newAccessToken = await refreshAccessToken();
        const retryResponse = await fetch(`${API_BASE_URL}/api/batches/${batchId}/`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${newAccessToken}` },
        });
        if (!retryResponse.ok) {
           const errorData = await retryResponse.json();
           throw new Error(errorData.detail || 'Failed to delete batch after refresh.');
        }
        return true; // Success for DELETE
      } catch (refreshError) {
        console.error('Error refreshing token during DELETE:', refreshError);
        throw refreshError;
      }
  }

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Failed to delete batch.');
  }
  return true; // Indicate success for delete
};

export const fetchVarieties = async () => {
  return requestWithAuth(`${API_BASE_URL}/api/varieties/`, {
    method: 'GET',
  });
};

// You'll need to add API functions for substrates and suppliers similarly if you have them.