require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rifas', require('./routes/rifas'));
app.use('/api/ventas', require('./routes/ventas'));

// Servir frontend estático
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback: cualquier ruta no-API devuelve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'));
});

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
