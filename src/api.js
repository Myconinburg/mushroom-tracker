// src/api.js
import { toCamelCase, toSnakeCase } from './utils/helpers'; // Make sure helpers.js is in src/utils/

// IMPORTANT: Replace this with your actual Django API base URL if different
// It's best practice to use an environment variable for this.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mushtrack-backend.onrender.com/api/v1';

/**
 * A generic request function to handle API calls, including case transformation.
 * @param {string} endpoint - The API endpoint (e.g., 'batches/', 'varieties/').
 * @param {object} [options={}] - Optional configuration for the fetch call.
 * @returns {Promise<any>} A promise that resolves with the camelCased JSON response.
 */
async function request(endpoint, options = {}) {
  const { body, ...customConfig } = options;

  const token = localStorage.getItem('accessToken'); // Get token for authenticated requests

  const headers = {
    'Content-Type': 'application/json',
    // Add other default headers if needed
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method: body ? 'POST' : (customConfig.method || 'GET'),
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };

  if (body) {
    // Convert outgoing JavaScript object (camelCase) to JSON string with snake_case keys
    const snakeCaseBody = toSnakeCase(body);
    console.log('API Request: Sending snake_case body:', snakeCaseBody); // For debugging
    config.body = JSON.stringify(snakeCaseBody);
  }

  // Ensure endpoint doesn't start with a slash if API_BASE_URL already might have path components
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const fullUrl = `${API_BASE_URL}/${cleanEndpoint}`;
  console.log(`API Request: ${config.method} to ${fullUrl}`); // For debugging

  try {
    const response = await fetch(fullUrl, config);

    let responseData;
    const contentType = response.headers.get("content-type");

    if (response.status === 204) { // No Content
        responseData = null; // Or an empty object/array as appropriate for the call
    } else if (contentType && contentType.includes("application/json")) {
      responseData = await response.json().catch((err) => {
        console.error("Failed to parse JSON response:", err);
        // If JSON parsing fails but status is ok, might be an issue or an empty successful response not marked as 204
        if (response.ok) return null; // Or handle as error if expecting JSON
        throw new Error("Failed to parse JSON response from server.");
      });
    } else {
      responseData = await response.text().catch(() => null);
    }

    console.log(`API Response: Status ${response.status} from ${fullUrl}`, responseData); // For debugging

    if (!response.ok) {
      const error = new Error(
        responseData?.detail || // Django REST framework often uses 'detail'
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : response.statusText) ||
        'API Request Failed'
      );
      error.status = response.status;
      error.data = responseData ? toCamelCase(responseData) : { message: response.statusText };
      console.error('API Error Data (camelCased):', error.data); // For debugging
      return Promise.reject(error);
    }

    return responseData ? toCamelCase(responseData) : null;
  } catch (error) {
    console.error('API call failed (network or other error):', error.message);
    return Promise.reject(error);
  }
}

// --- Specific API functions for your application ---

export function fetchBatches() {
  return request('batches/'); // Assuming 'batches/' is your endpoint for GETting all batches
}

export function createBatch(batchData) {
  // batchData is expected to be in camelCase from the form
  return request('batches/', { body: batchData, method: 'POST' });
}

export function updateExistingBatch(batchId, batchData) {
  // batchData is expected to be in camelCase
  return request(`batches/${batchId}/`, { body: batchData, method: 'PUT' });
}

export function deleteExistingBatch(batchId) {
  return request(`batches/${batchId}/`, { method: 'DELETE' });
}

export function fetchVarieties() {
  return request('varieties/'); // Assuming 'varieties/' is your endpoint for GETting varieties
}

// Add other specific API functions as needed, for example:
// export function fetchSubstrates() {
//   return request('substrates/');
// }
//
// export function fetchSuppliers() {
//   return request('suppliers/');
// }

// Example for login if you need it (adjust endpoint and payload structure)
export async function loginUser(credentials) {
  // credentials should be { username: '...', password: '...' } or similar
  // The `request` function will convert this to snake_case if your backend expects that for login
  return request('auth/login/', { body: credentials, method: 'POST' }); // Adjust endpoint as needed
}

export async function refreshToken(refreshTok) {
    return request('auth/token/refresh/', { body: { refresh: refreshTok }, method: 'POST' });
}