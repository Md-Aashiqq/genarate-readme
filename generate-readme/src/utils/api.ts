import axios from 'axios';

// Create an Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000', // Replace with your API URL
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Do something before the request is sent
    // For example, you can set an Authorization header if needed
    config.headers.Authorization = `Bearer ${localStorage.getItem('accessToken')}`;

    return config;
  },
  (error) => {
    // Do something with the request error
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Do something with the response data
    return response;
  },
  (error) => {
    // Do something with the response error
    // You can handle specific error status codes, like 401 Unauthorized
    if (error.response.status === 401) {
      // Perform any action when the user is unauthorized
    }

    return Promise.reject(error);
  }
);

export default api;
