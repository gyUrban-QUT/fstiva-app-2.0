import axios from 'axios';

const axiosInstance = axios.create({
  // Automatically pulls from EC2 .env in production, or local .env in development
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

export default axiosInstance;
