// ~/lib/axios.ts
import axios from 'axios';

const API_KEY = import.meta.env.VITE_LITE_LLM_API_KEY;

const api = axios.create({
  baseURL: 'http://localhost:8000',
//   withCredentials: true, // if you're using cookies/sessions
});

export const ai = axios.create({
  baseURL: 'https://ai.worthmind.net',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Ocp-Apim-Subscription-Key': API_KEY
  },
  timeout: 10000 // 10 seconds
});


export default api;

