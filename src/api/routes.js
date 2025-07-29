const express = require("express");
const { Parser } = require("json2csv");
const Client = require("./client");
const axios = require("axios");
const {
  API_URL,
  USER,
  PASSWORD,
  AXUM_URL_BASE,
} = require("../utils/constants");
const {
  findPercepcionIIBB,
  getTasa,
  mapClienteToCustomFormat,
  mapPadronToPercepcionJson,
  mapPadronToPercepcionCsv,
  getAxumConfig,
} = require("../utils/helpers");

const router = express.Router();
const client = new Client(API_URL, USER, PASSWORD);

function requireQueryParams(params, req, res) {
  for (const param of params) {
    if (req.query[param] === undefined) {
      res
        .status(400)
        .json({ error: `Falta el parámetro obligatorio: ${param}` });
      return false;
    }
  }
  return true;
}

// GET clientes
router.get("/clientes", async (req, res, next) => {
  const required = ["distribuidor", "sucursal"];
  if (!requireQueryParams(required, req, res)) return;
  try {
    const { pagina, registrosPorPagina, distribuidor, sucursal } = req.query;
    const rutasVentas = await client.fetchRutasVentasData({
      distribuidor,
      sucursal,
    });
    const response = await client.fetchClientData({
      pagina,
      registrosPorPagina,
      distribuidor,
      sucursal,
    });
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

// GET percepciones-csv
router.get("/percepciones-csv", async (req, res, next) => {
  const required = ["distribuidor", "sucursal"];
  if (!requireQueryParams(required, req, res)) return;
  try {
    const { pagina, registrosPorPagina, distribuidor, sucursal } = req.query;
    const response = await client.fetchClientData({
      pagina,
      registrosPorPagina,
      distribuidor,
      sucursal,
    });
    const clientesArray = Array.isArray(response.resultado)
      ? response.resultado.filter((c) => c.aplicaIngresosBrutos)
      : [];
    const padron = await client.fetchPadroniibbData({
      pagina,
      registrosPorPagina,
      distribuidor,
    });
    const percepcioniibb = await client.fetchPercepcioniibbData({
      pagina,
      registrosPorPagina,
      distribuidor,
    });

    const percepcion = findPercepcionIIBB(percepcioniibb);
    const formulas = percepcion.percepcionBrutoFormula || [];
    const minimoImponible = percepcion.minimoImponible || "";

    const csvRows = padron.map((padronCliente) => {
      const cliente = clientesArray.find(
        (c) => c.codigoCliente === padronCliente.codigoCliente
      );
      const tasa = getTasa(padronCliente, cliente, formulas);
      return mapPadronToPercepcionCsv(
        padronCliente,
        cliente,
        minimoImponible,
        tasa
      );
    });

    const parser = new Parser({
      fields: [
        "codigo",
        "minib",
        "percepib",
        "des",
        "codigoArticulo",
        "linea",
        "rubro",
      ],
    });
    const csv = parser.parse(csvRows);

    res.header("Content-Type", "text/csv");
    res.attachment("Percepciones.csv");
    res.send(csv);
  } catch (error) {
    next(error);
  }
});

// GET percepciones
router.get("/percepciones", async (req, res, next) => {
  const required = ["distribuidor", "sucursal"];
  if (!requireQueryParams(required, req, res)) return;
  try {
    const { pagina, registrosPorPagina, distribuidor, sucursal } = req.query;
    const response = await client.fetchClientData({
      pagina,
      registrosPorPagina,
      distribuidor,
      sucursal,
    });
    const clientesArray = Array.isArray(response.resultado)
      ? response.resultado.filter((c) => c.aplicaIngresosBrutos)
      : [];
    const padron = await client.fetchPadroniibbData({
      pagina,
      registrosPorPagina,
      distribuidor,
    });
    const percepcioniibb = await client.fetchPercepcioniibbData({
      pagina,
      registrosPorPagina,
      distribuidor,
    });

    const percepcion = findPercepcionIIBB(percepcioniibb);
    const formulas = percepcion.percepcionBrutoFormula || [];
    const minimoImponible = percepcion.minimoImponible || "";

    const jsonRows = padron.map((padronCliente) => {
      const cliente = clientesArray.find(
        (c) => c.codigoCliente === padronCliente.codigoCliente
      );
      const tasa = getTasa(padronCliente, cliente, formulas);
      return mapPadronToPercepcionJson(
        padronCliente,
        cliente,
        minimoImponible,
        tasa
      );
    });

    res.json(jsonRows);
  } catch (error) {
    next(error);
  }
});

// POST clientes
router.post("/clientes", async (req, res, next) => {
  try {
    const { urlBase, base, headers } = getAxumConfig(req, AXUM_URL_BASE);
    if (!base)
      return res
        .status(400)
        .json({ error: "Falta el parámetro obligatorio: base" });
    const clientes = req.body;
    const url = `${urlBase}/${base}/api/v1/Clientes`; // <-- Agrega /api/v1/
    const response = await axios.post(url, clientes, { headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

// POST percepciones
router.post("/percepciones", async (req, res, next) => {
  try {
    const { urlBase, base, headers } = getAxumConfig(req, AXUM_URL_BASE);
    if (!base)
      return res
        .status(400)
        .json({ error: "Falta el parámetro obligatorio: base" });
    const percepciones = req.body;
    const url = `${urlBase}/${base}/Percepciones`;
    const response = await axios.post(url, percepciones, { headers });
    res.status(response.status).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({
      error: error.message,
      details: error.response?.data,
    });
  }
});

module.exports = router;
