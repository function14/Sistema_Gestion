const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/productos', require('./routes/productos'));
app.use('/api/ventas', require('./routes/ventas'));
app.use('/api/inventario', require('./routes/inventario'));
app.use('/api/compras', require('./routes/compras'));
app.use('/api/clientes', require('./routes/clientes'));
app.use('/api/proveedores', require('./routes/proveedores'));
app.use('/api/empleados', require('./routes/empleados'));
app.use('/api/contabilidad', require('./routes/contabilidad'));
app.use('/api/reportes', require('./routes/reportes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Servidor POS/ERP corriendo en http://localhost:${PORT}`);
});
