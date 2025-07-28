const axios = require('axios');
const { DISTRIBUTOR, BRANCH, RECORDS_PER_PAGE, PAGE } = require('../utils/constants');

class Client {
    constructor(apiUrl, user, password) {
        this.apiUrl = apiUrl;
        this.user = user;
        this.password = password;
        this.token = '';
    }

    async login() {
        const url = `${this.apiUrl}/Usuario/login`;
        const body = {
            usuario: this.user,
            contrasenia: this.password
        };
        const response = await axios.post(url, body);
        const json = response.data;
        this.token = json.data?.token || json.token;
        if (!this.token) throw new Error('Token no recibido');
    }

    async fetchClientData(pagina = PAGE, registrosPorPagina = RECORDS_PER_PAGE) {
        if (!this.token) await this.login();
        const url = `${this.apiUrl}/Ventas/obtenerCliente?distribuidor=${DISTRIBUTOR}&sucursal=${BRANCH}&pagina=${PAGE}&registrosPorPagina=${RECORDS_PER_PAGE}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchPadroniibbData() {
        if (!this.token) await this.login();
        const url = `${this.apiUrl}/Ventas/obtenerPadronIIBB?distribuidor=${DISTRIBUTOR}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchPercepcioniibbData() {
        if (!this.token) await this.login();
        const url = `${this.apiUrl}/Ventas/obtenerPercepcionIIBB?distribuidor=${DISTRIBUTOR}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchRutasVentasData() {
        if (!this.token) await this.login();
        const url = `${this.apiUrl}/Ventas/obtenerRutasVentas?distribuidor=${DISTRIBUTOR}&sucursal=${BRANCH}&modoAtencion=PRE`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }
}

module.exports = Client;

