const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000',   // API server trên port 5000, KHÔNG PHẢI 4000
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

module.exports = api;