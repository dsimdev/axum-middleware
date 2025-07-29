const axios = require('axios');

class Client {
    constructor(apiUrl, user, password) {
        if (!apiUrl) {
            throw new Error('API_URL no está definido. Verifica tus variables de entorno.');
        }
        this.apiUrl = apiUrl;
        this.user = user;
        this.password = password;
        this.token = '';
        console.log("API_URL usado por Client:", this.apiUrl);
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

    async fetchClientData({ pagina, registrosPorPagina, distribuidor, sucursal }) {
        if (!this.token) await this.login();
        if (distribuidor === undefined) {
            throw new Error('Falta el parámetro obligatorio: distribuidor');
        }
        let url = `${this.apiUrl}/Ventas/obtenerCliente?distribuidor=${distribuidor}`;
        if (sucursal !== undefined) url += `&sucursal=${sucursal}`;
        if (pagina !== undefined) url += `&pagina=${pagina}`;
        if (registrosPorPagina !== undefined) url += `&registrosPorPagina=${registrosPorPagina}`;

        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchPadroniibbData({ pagina, registrosPorPagina, distribuidor, sucursal }) {
        if (!this.token) await this.login();
        if (distribuidor === undefined) {
            throw new Error('Falta el parámetro obligatorio: distribuidor');
        }
        let url = `${this.apiUrl}/Ventas/obtenerPadronIIBB?distribuidor=${distribuidor}`;
        if (sucursal !== undefined) url += `&sucursal=${sucursal}`;
        if (pagina !== undefined) url += `&pagina=${pagina}`;
        if (registrosPorPagina !== undefined) url += `&registrosPorPagina=${registrosPorPagina}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchPercepcioniibbData({ pagina, registrosPorPagina, distribuidor, sucursal }) {
        if (!this.token) await this.login();
        if (distribuidor === undefined) {
            throw new Error('Falta el parámetro obligatorio: distribuidor');
        }
        let url = `${this.apiUrl}/Ventas/obtenerPercepcionIIBB?distribuidor=${distribuidor}`;
        if (sucursal !== undefined) url += `&sucursal=${sucursal}`;
        if (pagina !== undefined) url += `&pagina=${pagina}`;
        if (registrosPorPagina !== undefined) url += `&registrosPorPagina=${registrosPorPagina}`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }

    async fetchRutasVentasData({ distribuidor, sucursal }) {
        if (!this.token) await this.login();
        if (
            distribuidor === undefined ||
            sucursal === undefined
        ) {
            throw new Error('Faltan parámetros obligatorios en fetchRutasVentasData');
        }
        const url = `${this.apiUrl}/Ventas/obtenerRutasVentas?distribuidor=${distribuidor}&sucursal=${sucursal}&modoAtencion=PRE`;
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${this.token}` }
        });
        return response.data;
    }
}

module.exports = Client;

