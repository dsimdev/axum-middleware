require('dotenv').config();

module.exports = {
  API_URL: process.env.API_URL,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  AXUM_URL_BASE: process.env.AXUM_URL_BASE,
  DEFAULT_PROVINCE: process.env.DEFAULT_PROVINCE
};