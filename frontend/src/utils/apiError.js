/**
 * Standardized API Error Parser for QuizMaster Frontend
 * Safely extracts user-friendly error messages based on status codes and network status.
 */
export const getApiErrorMessage = (error) => {
  if (!error) {
    return 'An unexpected error occurred. Please try again.';
  }

  // Axios Timeout or Network Connection Error (e.g. Render backend sleeping / cold start)
  if (error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout')) {
    return 'Server connection timed out. The backend server may be waking up from sleep. Please wait a few seconds and try again.';
  }

  if (!error.response) {
    return 'Unable to reach the server. Please check your network connection or verify the backend server is running.';
  }

  const status = error.response.status;
  const serverMsg = error.response.data?.message;

  switch (status) {
    case 401:
      return serverMsg || 'Invalid email or password credentials.';
    case 403:
      return serverMsg || 'Access denied. Account is inactive or unauthorized.';
    case 404:
      return serverMsg || 'Requested resource or API endpoint not found.';
    case 429:
      return serverMsg || 'Too many requests. Please wait a moment and try again.';
    case 500:
    case 502:
    case 503:
    case 504:
      return serverMsg || 'Server error encountered. Please try again in a few moments.';
    default:
      return serverMsg || `Request failed with status code ${status}`;
  }
};
