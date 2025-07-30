const axios = require('axios');
axios.get('https://api.ipify.org?format=json').then(res => console.log("IP pública Railway:", res.data));

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');
const apiRoutes = require('./api/routes');

const app = express();
const port = process.env.PORT || 3000;

// Asegura que la carpeta logs exista
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Función para obtener la fecha en GMT-3
function getGMT3Date() {
    const date = new Date();
    // GMT-3 es UTC-3, así que restamos 3 horas
    date.setHours(date.getHours() - 3);
    return date.toISOString().replace('T', ' ').split('.')[0];
}

// Formato personalizado de Morgan
morgan.token('gmt3date', getGMT3Date);

const customFormat = ':remote-addr - :remote-user [:gmt3date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';

// Crear un stream para escribir en un archivo
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, '../logs/access.log'), { flags: 'a' }
);

// Loguear en consola y archivo
app.use(morgan(customFormat)); // consola
app.use(morgan(customFormat, { stream: accessLogStream })); // archivo

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use('/api/v1', apiRoutes);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
