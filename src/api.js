// src/api.js
import { toCamelCase, toSnakeCase } from './utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mushtrack-backend.onrender.com/api';

// --- START: Declarations for token refresh logic ---
// These variables need to be in the module scope, accessible by the request function.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};
// --- END: Declarations for token refresh logic ---

/**
 * A generic request function to handle API calls, including case transformation.
 * @param {string} endpoint - The API endpoint (e.g., 'batches/', 'varieties/').
 * @param {object} [options={}] - Optional configuration for the fetch call.
 * @param {boolean} [isRetry=false] - Internal flag to prevent infinite refresh loops.
 * @returns {Promise<any>} A promise that resolves with the camelCased JSON response.
 */
async function request(endpoint, options = {}, isRetry = false) {
  const { body, ...customConfig } = options;
  let token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
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
    const snakeCaseBody = toSnakeCase(body);
    console.log('API Request: Sending snake_case body:', snakeCaseBody);
    config.body = JSON.stringify(snakeCaseBody);
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
  const fullUrl = `${API_BASE_URL}/${cleanEndpoint}`;
  console.log(`API Request: ${config.method} to ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, config);

    let responseData;
    const contentType = response.headers.get("content-type");

    if (response.status === 204) {
        responseData = null;
    } else if (contentType && contentType.includes("application/json")) {
      responseData = await response.json().catch(() => null);
    } else {
      responseData = await response.text().catch(() => null);
    }

    console.log(`API Response: Status ${response.status} from ${fullUrl}`, responseData);

    if (!response.ok) {
      const error = new Error(
        responseData?.detail ||
        responseData?.message ||
        (typeof responseData === 'string' ? responseData : response.statusText) ||
        'API Request Failed'
      );
      error.status = response.status;
      error.data = responseData ? toCamelCase(responseData) : { message: response.statusText };

      // Token refresh logic
      // ESLint errors pointed here, ensure isRefreshing, processQueue, failedQueue are defined in module scope
      if (error.status === 401 && error.data?.code === 'token_not_valid' && !isRetry) {
        if (!isRefreshing) { // Line 65 in previous log
          isRefreshing = true; // Line 66 in previous log
          const refreshTok = localStorage.getItem('refreshToken');
          if (refreshTok) {
            return _refreshToken(refreshTok).then(newAccessToken => { // _refreshToken is defined below
              localStorage.setItem('accessToken', newAccessToken);
              processQueue(null, newAccessToken); // Line 71 in previous log
              // Update headers for the retry
              const newHeaders = { ...config.headers, 'Authorization': `Bearer ${newAccessToken}` };
              return request(endpoint, {...options, headers: newHeaders }, true); // Retry original request
            }).catch(refreshError => {
              processQueue(refreshError, null); // Line 75 in previous log
              console.error("Token refresh failed:", refreshError);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.dispatchEvent(new CustomEvent('auth-error'));
              return Promise.reject(refreshError);
            }).finally(() => {
              isRefreshing = false; // Line 82 in previous log
            });
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.dispatchEvent(new CustomEvent('auth-error'));
            return Promise.reject(error);
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject }); // Line 92 in previous log
          }).then(newAccessToken => {
             // Update headers for the retry
            const newHeaders = { ...config.headers, 'Authorization': `Bearer ${newAccessToken}` };
            return request(endpoint, {...options, headers: newHeaders }, true);
          });
        }
      }
      console.error('API Error Data (camelCased):', error.data);
      return Promise.reject(error);
    }
    return responseData ? toCamelCase(responseData) : null;
  } catch (error) {
    console.error('API call failed (network or other error):', error.message);
    return Promise.reject(error);
  }
}

// Internal function to refresh the token
async function _refreshToken(refreshTok) {
    console.log("Attempting to refresh token...");
    // Use a raw fetch here to avoid circular dependency with the request function's interceptor logic
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, { // Ensure this endpoint is correct for your backend
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTok }) // Django Simple JWT expects { "refresh": "..." }
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Failed to refresh token');
    }
    console.log("Token refreshed successfully.");
    return data.access; // Django Simple JWT returns { "access": "...", "refresh": "..." (optional) }
}


// --- Specific API functions for your application ---

export function fetchBatches() {
  return request('batches/');
}

export function createBatch(batchData) {
  return request('batches/', { body: batchData, method: 'POST' });
}

export function updateExistingBatch(batchId, batchData) {
  return request(`batches/${batchId}/`, { body: batchData, method: 'PATCH' });
}

export function deleteExistingBatch(batchId) {
  return request(`batches/${batchId}/`, { method: 'DELETE' });
}

export function fetchVarieties() {
  return request('varieties/');
}

export async function loginUser(credentials) {
  return request('token/', { body: credentials, method: 'POST' });
}

// Exporting _refreshToken as refreshToken for potential use elsewhere (e.g. manual refresh if needed)
export { _refreshToken as refreshToken };
