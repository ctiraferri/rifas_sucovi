require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://ctiraferri.github.io'],
}));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rifas', require('./routes/rifas'));
app.use('/api/ventas', require('./routes/ventas'));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
