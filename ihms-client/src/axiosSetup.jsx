// axiosSetup.js
import axios from 'axios';

axios.defaults.withCredentials = true; // Ensure cookies are sent with every request

axios.interceptors.request.use(
  (config) => {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirect to login page or show a login modal
      window.location.href = '/login';
      toast.error("دسترسی شما منقضی شده است. لطفا دوباره وارد شوید.");
    }
    return Promise.reject(error);
  }
);