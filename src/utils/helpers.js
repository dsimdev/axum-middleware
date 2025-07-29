const { DEFAULT_PROVINCE } = require('./constants');

// Formato de respuesta estándar
function formatResponse(data) {
    if (!data) {
        return null;
    }
    return {
        success: true,
        data: data,
        timestamp: new Date().toISOString(),
    };
}

// Manejo de errores estándar
function handleError(error) {
    console.error(error);
    return {
        success: false,
        message: error.message || 'An unexpected error occurred.',
        timestamp: new Date().toISOString(),
    };
}

// Buscar percepción por provincia o devolver la primera
function findPercepcionIIBB(percepcioniibb) {
    return percepcioniibb.find(
        p => (p.provinciaIIBB || '').trim().toUpperCase() === DEFAULT_PROVINCE
    ) || percepcioniibb[0] || {};
}

// Calcular tasa
function getTasa(padronCliente, cliente, formulas) {
    let tasa = null;
    if (
        padronCliente.ingresosBrutosPadron?.[0]?.alicuotaPadron?.[0]?.tasa != null
    ) {
        tasa = padronCliente.ingresosBrutosPadron[0].alicuotaPadron[0].tasa * 0.01;
    }

    if (tasa === null || tasa === undefined || tasa === 0) {
        const formula = cliente ? formulas.find(f => f.tipoContribuyente === cliente.tipoContribuyente) : null;
        tasa = formula ? formula.tasa * 0.01 : 0;
    }

    if (cliente?.aplicaImpuestoInternos === false) {
        tasa = 0;
    }

    return tasa;
}

// Parsear condición de IVA
function parseCondIva(tipoContribuyente) {
    if (typeof tipoContribuyente === "number") return tipoContribuyente;
    if (!tipoContribuyente || typeof tipoContribuyente !== "string") return null;
    switch (tipoContribuyente.trim().toUpperCase()) {
        case "CF": return 1;
        case "EX": return 2;
        case "NC": return 3;
        case "RI": return 4;
        case "MT": return 5;
        case "RNI": return 6;
        case "NR": return 7;
        default: return null;
    }
}

// Mapear cliente a formato custom
function mapClienteToCustomFormat(cliente, rutasVentas = []) {
    const domicilio = cliente.domicilioFiscal || {};
    const segmento = cliente.segmento || {};
    const diasAtencion = Array.isArray(cliente.diasAtencion) && cliente.diasAtencion.length > 0 ? cliente.diasAtencion[0] : {};

    // Buscar vendedor en rutasVentas por codigoRuta
    let vendedor = undefined;
    if (diasAtencion.codigoRuta) {
        const ruta = rutasVentas.find(r => r.codigoRuta === diasAtencion.codigoRuta);
        if (ruta) vendedor = ruta.codigoPersonal?.toString();
    }

    // Lógica para estado
    const estado = cliente.anulado === true ? "S" : "A";

    return {
        codigo: cliente.codigoCliente?.toString(),
        razon_social: cliente.nombre,
        direccion: domicilio.calle && domicilio.altura ? `${domicilio.calle} ${domicilio.altura}` : undefined,
        zona: diasAtencion.codigoRuta?.toString(),
        vendedor,
        telefono: cliente.telefonos?.toString(),
        lista: typeof cliente.codListaPrecio === "number" ? cliente.codListaPrecio : undefined,
        orden: typeof diasAtencion.orden === "number" ? diasAtencion.orden : undefined,
        ramo: segmento.descripcionSubcanal,
        localidad: domicilio.localidad,
        condIva: parseCondIva(cliente.tipoContribuyente),
        tablaBonifId: cliente.codigoCliente?.toString(),
        topeVenta: typeof cliente.topeVenta === "number" ? cliente.topeVenta : undefined,
        margen: typeof cliente.margen === "number" ? cliente.margen : undefined,
        cobraIB: cliente.aplicaIngresosBrutos !== undefined ? cliente.aplicaIngresosBrutos.toString() : undefined,
        cuit: cliente.numeroCuit?.toString(),
        percepId: cliente.codigoCliente?.toString(),
        email: cliente.email,
        condicionDePago: cliente.formaPago?.toString(),
        coordenadas: cliente.coordenadas,
        listasASeleccionar: cliente.listasASeleccionar,
        empresa: cliente.empresa,
        codigoPostal: domicilio.codigoPostal?.toString(),
        pais: domicilio.pais,
        provincia: domicilio.provincia,
        ciudad: domicilio.localidad,
        repartidor: cliente.repartidor,
        estado,
        subramo: segmento.descripcionSegmentoMkt,
        minVenta: typeof cliente.minVenta === "number" ? cliente.minVenta : undefined,
        esFoco: cliente.focoVenta !== undefined ? cliente.focoVenta.toString() : undefined,
        segmentacion: segmento.descripcionSegmentoVta
    };
}

// Mapear padron a formato JSON de percepciones
function mapPadronToPercepcionJson(padronCliente, cliente, minimoImponible, tasa) {
    return {
        codigo: padronCliente.codigoCliente?.toString() || cliente?.codigoCliente?.toString(),
        minIB: minimoImponible !== undefined ? Number(minimoImponible) : undefined,
        percepIB: tasa === 0 ? 0 : (tasa !== undefined ? Number(tasa.toFixed(3)) : undefined),
        des: undefined,
        codigoArticulo: "",
        linea: "",
        rubro: ""
    };
}

// Mapear padron a formato CSV de percepciones
function mapPadronToPercepcionCsv(padronCliente, cliente, minimoImponible, tasa) {
    return {
        codigo: padronCliente.codigoCliente?.toString() || cliente?.codigoCliente?.toString(),
        minib: minimoImponible !== undefined ? Number(minimoImponible).toFixed(2) : undefined,
        percepib: tasa === 0 ? "0" : (tasa !== undefined ? Number(tasa).toFixed(3) : undefined),
        des: undefined,
        codigoArticulo: "",
        linea: "",
        rubro: ""
    };
}

function getAxumConfig(req, defaultUrlBase) {
    const base = req.query.base;
    const api_key = req.query.api_key;
    const urlBase = defaultUrlBase.endsWith('/') ? defaultUrlBase.slice(0, -1) : defaultUrlBase;
    return {
        urlBase,
        base,
        api_key,
        headers: {
            "X-Api-Key": api_key,
            "Content-Type": "application/json"
        }
    };
}

module.exports = {
    formatResponse,
    handleError,
    findPercepcionIIBB,
    getTasa,
    mapClienteToCustomFormat,
    parseCondIva,
    mapPadronToPercepcionJson,
    mapPadronToPercepcionCsv,
    getAxumConfig
};