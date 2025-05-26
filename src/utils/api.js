// src/utils/api.js
import { toCamelCase, toSnakeCase } from './helpers';

// IMPORTANT: Replace this with your actual Django API base URL
// Example: 'http://localhost:8000/api' or 'https://yourdomain.com/api'
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mushtrack-backend.onrender.com/api/'; // Default if not set in .env

/**
 * A generic request function to handle API calls, including case transformation.
 * @param {string} endpoint - The API endpoint (e.g., 'batches/', 'varieties/').
 * @param {object} [options={}] - Optional configuration for the fetch call.
 * @param {object} [options.body] - The request body for POST/PUT requests (in camelCase).
 * @param {string} [options.method] - HTTP method (GET, POST, PUT, DELETE, etc.).
 * @param {object} [options.headers] - Custom headers.
 * @returns {Promise<any>} A promise that resolves with the camelCased JSON response.
 */
async function request(endpoint, options = {}) {
  const { body, ...customConfig } = options;

  const headers = {
    'Content-Type': 'application/json',
    // Add other default headers if needed, e.g., Authorization
    // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  };

  const config = {
    method: body ? 'POST' : (customConfig.method || 'GET'), // Default to GET if no body and no method specified
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    // Convert outgoing JavaScript object (camelCase) to JSON string with snake_case keys
    config.body = JSON.stringify(toSnakeCase(body));
  }

  const fullUrl = `${API_BASE_URL}/${endpoint.startsWith('/') ? endpoint.substring(1) : endpoint}`;

  try {
    const response = await fetch(fullUrl, config);

    // Attempt to parse JSON regardless of ok status, as error responses might also be JSON
    let responseData;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json().catch(() => null); // Gracefully handle non-JSON or empty responses
    } else {
      responseData = await response.text().catch(() => null); // For non-JSON responses
    }


    if (!response.ok) {
      // Construct a meaningful error object
      const error = new Error(responseData?.detail || responseData?.message || response.statusText || 'API Request Failed');
      error.status = response.status;
      error.data = responseData ? toCamelCase(responseData) : { message: response.statusText }; // Convert error response keys to camelCase
      return Promise.reject(error);
    }

    // Convert incoming JSON response (snake_case) to JavaScript object with camelCase keys
    return responseData ? toCamelCase(responseData) : null; // Return null for empty successful responses (e.g., 204 No Content)
  } catch (error) {
    // Handle network errors or other fetch-related issues
    console.error('API call failed:', error.message);
    // You might want to re-throw a more generic error or handle specific network issues
    return Promise.reject(error);
  }
}

// --- Exported API utility functions ---

// Example GET request
export function getData(endpoint, params = {}) {
  const queryParams = new URLSearchParams(toSnakeCase(params)).toString();
  return request(queryParams ? `${endpoint}?${queryParams}` : endpoint, { method: 'GET' });
}

// Example POST request
export function postData(endpoint, body) {
  return request(endpoint, { body, method: 'POST' });
}

// Example PUT request
export function putData(endpoint, body) {
  return request(endpoint, { body, method: 'PUT' });
}

// Example DELETE request
export function deleteData(endpoint) {
  return request(endpoint, { method: 'DELETE' });
}

// You can add more specific API functions here, e.g.:
// export function getBatches() {
//   return getData('batches/');
// }
//
// export function createBatch(batchData) {
//   return postData('batches/', batchData);
// }
//
// export function updateBatch(batchId, batchData) {
//   return putData(`batches/${batchId}/`, batchData);
// }
