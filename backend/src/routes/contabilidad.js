const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Listar movimientos contables
router.get('/', async (req, res) => {
  try {
    const { tipo, categoria, desde, hasta } = req.query;
    const where = {};
    if (tipo) where.tipo = tipo;
    if (categoria) where.categoria = categoria;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta + 'T23:59:59');
    }

    const movimientos = await prisma.movimientoContable.findMany({
      where,
      orderBy: { fecha: 'desc' }
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear movimiento manual
router.post('/', async (req, res) => {
  try {
    const movimiento = await prisma.movimientoContable.create({ data: req.body });
    res.status(201).json(movimiento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Balance general
router.get('/balance', async (req, res) => {
  try {
    const ingresos = await prisma.movimientoContable.aggregate({
      where: { tipo: 'ingreso' },
      _sum: { monto: true }
    });
    const egresos = await prisma.movimientoContable.aggregate({
      where: { tipo: 'egreso' },
      _sum: { monto: true }
    });

    const totalIngresos = ingresos._sum.monto || 0;
    const totalEgresos = egresos._sum.monto || 0;

    res.json({
      ingresos: totalIngresos,
      egresos: totalEgresos,
      balance: totalIngresos - totalEgresos
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
