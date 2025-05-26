// src/components/LoginComponent.jsx
import React, { useState } from 'react';
import { loginUser } from '../api'; // Path should be '../api' if api.js is in src/

function LoginComponent({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Added for loading state

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // The loginUser function from api.js is expected to return the
      // response data from the backend, which should include tokens.
      // It will also handle the camelCase conversion.
      const loginData = await loginUser({ username, password }); // Pass credentials as an object

      // Assuming your Django backend returns tokens like this:
      // { access: "your_access_token", refresh: "your_refresh_token", user: { ... } }
      // Adjust property names (access, refresh) if your backend uses different ones.
      if (loginData && loginData.access && loginData.refresh) {
        localStorage.setItem('accessToken', loginData.access);
        localStorage.setItem('refreshToken', loginData.refresh);
        // Optionally store user details if returned and needed
        // if (loginData.user) {
        //   localStorage.setItem('userData', JSON.stringify(loginData.user));
        // }
        onLoginSuccess(); // This will trigger re-render in App.js and data fetching
      } else {
        // This case might happen if loginUser resolves but doesn't return expected token structure
        console.error("Login response did not contain expected tokens:", loginData);
        setError("Login successful, but token data is missing. Please contact support.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      // err.data should contain the camelCased error response from the backend
      const detail = err.data?.detail;
      const nonFieldErrors = err.data?.nonFieldErrors; // Common for DRF auth
      let errorMessage = "Login failed. Please check your credentials.";

      if (detail) {
        errorMessage = detail;
      } else if (nonFieldErrors && nonFieldErrors.length > 0) {
        errorMessage = nonFieldErrors.join(' ');
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Login to Spawn Point</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
              Username:
            </label>
            <input
              type="text"
              id="username"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && <p className="text-red-500 text-xs italic mb-4 text-center">{error}</p>}
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginComponent;