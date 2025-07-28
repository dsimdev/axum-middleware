const express = require("express");
const { Parser } = require("json2csv");
const Client = require("./client");
const axios = require("axios");
const {
  API_URL,
  USER,
  PASSWORD,
  PAGE,
  RECORDS_PER_PAGE,
  AXUM_API_KEY,
  AXUM_URL_BASE
} = require("../utils/constants");
const {
  findPercepcionIIBB,
  getTasa,
  mapClienteToCustomFormat,
  mapPadronToPercepcionJson,
  mapPadronToPercepcionCsv
} = require("../utils/functions");

const router = express.Router();

const client = new Client(API_URL, USER, PASSWORD);



router.get("/clientes", async (req, res, next) => {
  try {
    const rutasVentas = await client.fetchRutasVentasData();
    const response = await client.fetchClientData(PAGE, RECORDS_PER_PAGE);
    const resultado = Array.isArray(response.resultado)
      ? response.resultado.filter((c) => !c.anulado)
      : [];
    const mapped = resultado.map((c) =>
      mapClienteToCustomFormat(c, rutasVentas)
    );
    res.json(mapped);
  } catch (error) {
    next(error);
  }
});

router.get("/percepciones-csv", async (req, res, next) => {
  try {
    const response = await client.fetchClientData();
    const clientesArray = Array.isArray(response.resultado)
      ? response.resultado.filter(c => c.aplicaIngresosBrutos)
      : [];
    const padron = await client.fetchPadroniibbData();
    const percepcioniibb = await client.fetchPercepcioniibbData();

    const percepcion = findPercepcionIIBB(percepcioniibb);
    const formulas = percepcion.percepcionBrutoFormula || [];
    const minimoImponible = percepcion.minimoImponible || "";

    const csvRows = padron.map((padronCliente) => {
      const cliente = clientesArray.find(
        (c) => c.codigoCliente === padronCliente.codigoCliente
      );
      const tasa = getTasa(padronCliente, cliente, formulas);
      return mapPadronToPercepcionCsv(padronCliente, cliente, minimoImponible, tasa);
    });

    const parser = new Parser({
      fields: ["codigo", "minib", "percepib", "des"],
    });
    const csv = parser.parse(csvRows);

    res.header("Content-Type", "text/csv");
    res.attachment("Percepciones.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

router.get("/percepciones", async (req, res, next) => {
  try {
    const response = await client.fetchClientData();
    const clientesArray = Array.isArray(response.resultado)
      ? response.resultado.filter(c => c.aplicaIngresosBrutos)
      : [];
    const padron = await client.fetchPadroniibbData();
    const percepcioniibb = await client.fetchPercepcioniibbData();

    const percepcion = findPercepcionIIBB(percepcioniibb);
    const formulas = percepcion.percepcionBrutoFormula || [];
    const minimoImponible = percepcion.minimoImponible || "";

    const jsonRows = padron.map((padronCliente) => {
      const cliente = clientesArray.find(
        (c) => c.codigoCliente === padronCliente.codigoCliente
      );
      const tasa = getTasa(padronCliente, cliente, formulas);
      return mapPadronToPercepcionJson(padronCliente, cliente, minimoImponible, tasa);
    });

    res.json(jsonRows);
  } catch (error) {
    next(error);
  }
});

router.post("/clientes", async (req, res, next) => {
  try {
    const clientes = req.body; // Espera un array de clientes en el body
    const url = `${AXUM_URL_BASE}/Clientes`;
    const response = await axios.post(url, clientes, {
      headers: {
        "X-Api-Key": AXUM_API_KEY,
        "Content-Type": "application/json",
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

router.post("/percepciones", async (req, res, next) => {
  try {
    const percepciones = req.body; // Espera un array de percepciones en el body
    const url = `${AXUM_URL_BASE}/Percepciones`;
    const response = await axios.post(url, percepciones, {
      headers: {
        "X-Api-Key": AXUM_API_KEY,
        "Content-Type": "application/json",
      },
    });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;
