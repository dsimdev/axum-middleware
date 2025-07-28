require('dotenv').config();

const AXUM_DISTRI = process.env.AXUM_DISTRI;

module.exports = {
  API_URL: process.env.API_URL,
  USER: process.env.USER,
  PASSWORD: process.env.PASSWORD,
  DISTRIBUTOR: Number(process.env.DISTRIBUTOR),
  BRANCH: Number(process.env.BRANCH),
  DEFAULT_PROVINCE: process.env.DEFAULT_PROVINCE,
  PAGE: Number(process.env.PAGE),
  RECORDS_PER_PAGE: Number(process.env.RECORDS_PER_PAGE),
  AXUM_API_KEY: process.env.AXUM_API_KEY,
  AXUM_DISTRI,
  AXUM_URL_BASE: `https://gateway.axum.com.ar/${AXUM_DISTRI}/api/v1`,
};