const { DEFAULT_PROVINCE } = require('./constants');

function findPercepcionIIBB(percepcioniibb) {
    return percepcioniibb.find(
        p => (p.provinciaIIBB || '').trim().toUpperCase() === DEFAULT_PROVINCE
    ) || percepcioniibb[0] || {};
}

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

function mapClienteToCustomFormat(cliente, rutasVentas = []) {
    const domicilio = cliente.domicilioFiscal || {};
    const segmento = cliente.segmento || {};
    const diasAtencion = Array.isArray(cliente.diasAtencion) && cliente.diasAtencion.length > 0 ? cliente.diasAtencion[0] : {};

    // Buscar vendedor en rutasVentas por codigoRuta
    let vendedor = "";
    if (diasAtencion.codigoRuta) {
        const ruta = rutasVentas.find(r => r.codigoRuta === diasAtencion.codigoRuta);
        if (ruta) vendedor = ruta.codigoPersonal?.toString() ?? "";
    }

    // Lógica para estado
    const estado = cliente.anulado === true ? "S" : "A";

    return {
        codigo: cliente.codigoCliente?.toString() ?? "", // string
        razon_social: cliente.nombre ?? "", // string
        direccion: domicilio.calle && domicilio.altura ? `${domicilio.calle} ${domicilio.altura}` : "", // string
        zona: diasAtencion.codigoRuta?.toString() ?? "", // string
        vendedor, // string
        telefono: cliente.telefonos?.toString() ?? "", // string
        lista: typeof cliente.codListaPrecio === "number" ? cliente.codListaPrecio : null, // int
        orden: typeof diasAtencion.orden === "number" ? diasAtencion.orden : null, // int
        ramo: segmento.descripcionSubcanal ?? "", // string
        localidad: domicilio.localidad ?? "", // string
        condIva: parseCondIva(cliente.tipoContribuyente), // int
        tablaBonifId: cliente.codigoCliente?.toString() ?? "", // string
        topeVenta: typeof cliente.topeVenta === "number" ? cliente.topeVenta : null, // decimal
        margen: typeof cliente.margen === "number" ? cliente.margen : 0, // decimal
        cobraIB: cliente.aplicaIngresosBrutos !== undefined ? cliente.aplicaIngresosBrutos.toString() : "", // string
        cuit: cliente.numeroCuit?.toString() ?? "", // string
        percepId: cliente.codigoCliente?.toString() ?? "", // string
        email: cliente.email ?? "", // string
        condicionDePago: cliente.formaPago?.toString() ?? "", // string
        coordenadas: cliente.coordenadas ?? "", // string
        listasASeleccionar: cliente.listasASeleccionar ?? "", // string
        empresa: "", // string
        codigoPostal: domicilio.codigoPostal?.toString() ?? "", // string
        pais: domicilio.pais ?? "ARGENTINA", // string
        provincia: domicilio.provincia ?? "", // string
        ciudad: domicilio.localidad ?? "", // string
        repartidor: cliente.repartidor ?? "", // string
        estado, // string
        subramo: segmento.descripcionSegmentoMkt ?? "", // string
        minVenta: typeof cliente.minVenta === "number" ? cliente.minVenta : null, // decimal
        esFoco: cliente.focoVenta !== undefined ? cliente.focoVenta.toString() : "", // string
        segmentacion: segmento.descripcionSegmentoVta ?? "" // string
    };
}

function mapPadronToPercepcionJson(padronCliente, cliente, minimoImponible, tasa) {
    return {
        codigo: padronCliente.codigoCliente?.toString() || cliente?.codigoCliente?.toString() || "",
        minIB: Number(minimoImponible) || 0,
        percepIB: tasa === 0 ? 0 : Number(tasa.toFixed(3)),
        des: "",
        codigoArticulo: "",
        linea: "",
        rubro: "",
    };
}

function mapPadronToPercepcionCsv(padronCliente, cliente, minimoImponible, tasa) {
    return {
        codigo: padronCliente.codigoCliente?.toString() || cliente?.codigoCliente?.toString() || "",
        minib: Number(minimoImponible).toFixed(2),
        percepib: tasa === 0 ? "0" : Number(tasa).toFixed(3),
        des: "",
    };
}

module.exports = {
    findPercepcionIIBB,
    getTasa,
    mapClienteToCustomFormat,
    parseCondIva,
    mapPadronToPercepcionJson,
    mapPadronToPercepcionCsv
};