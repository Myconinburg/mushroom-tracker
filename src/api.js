// src/api.js
import { toCamelCase, toSnakeCase } from './utils/helpers';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://mushtrack-backend.onrender.com/api';

// ... (the rest of the request function and token refresh logic remains the same) ...
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
      
      if (error.status === 401 && error.data?.code === 'token_not_valid' && !isRetry) {
        if (!isRefreshing) {
          isRefreshing = true;
          const refreshTok = localStorage.getItem('refreshToken');
          if (refreshTok) {
            return _refreshToken(refreshTok).then(newAccessToken => {
              localStorage.setItem('accessToken', newAccessToken);
              processQueue(null, newAccessToken);
              config.headers['Authorization'] = `Bearer ${newAccessToken}`;
              return request(endpoint, {...options, headers: config.headers}, true); 
            }).catch(refreshError => {
              processQueue(refreshError, null);
              console.error("Token refresh failed:", refreshError);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              window.dispatchEvent(new CustomEvent('auth-error')); 
              return Promise.reject(refreshError);
            }).finally(() => {
              isRefreshing = false;
            });
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            window.dispatchEvent(new CustomEvent('auth-error'));
            return Promise.reject(error); 
          }
        } else {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(newAccessToken => {
            config.headers['Authorization'] = `Bearer ${newAccessToken}`;
            return request(endpoint, {...options, headers: config.headers}, true); 
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

async function _refreshToken(refreshTok) {
    console.log("Attempting to refresh token...");
    const response = await fetch(`${API_BASE_URL}/token/refresh/`, { // ENSURE THIS ENDPOINT IS CORRECT
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshTok })
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.detail || 'Failed to refresh token');
    }
    console.log("Token refreshed successfully.");
    return data.access; 
}

// --- Specific API functions ---
// ... (fetchBatches, createBatch etc. remain the same) ...
export function fetchBatches() {
  return request('batches/'); 
}

export function createBatch(batchData) {
  return request('batches/', { body: batchData, method: 'POST' });
}

export function updateExistingBatch(batchId, batchData) {
  return request(`batches/${batchId}/`, { body: batchData, method: 'PUT' });
}

export function deleteExistingBatch(batchId) {
  return request(`batches/${batchId}/`, { method: 'DELETE' });
}

export function fetchVarieties() {
  return request('varieties/'); 
}

export async function loginUser(credentials) {
  // credentials should be { username: '...', password: '...' } or similar
  return request('token/', { body: credentials, method: 'POST' }); // CORRECTED ENDPOINT
}

export { _refreshToken as refreshToken };
