const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Stock actual de todos los productos
router.get('/stock', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: { nombre: 'asc' }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Productos con stock bajo
router.get('/alertas', async (req, res) => {
  try {
    const productos = await prisma.producto.findMany({
      where: {
        activo: true,
        stockActual: { lte: prisma.producto.fields?.stockMinimo }
      },
      include: { categoria: true }
    });
    // Filter in JS since Prisma SQLite doesn't support field comparison
    const alertas = (await prisma.producto.findMany({
      where: { activo: true },
      include: { categoria: true }
    })).filter(p => p.stockActual <= p.stockMinimo);
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Movimientos de inventario
router.get('/movimientos', async (req, res) => {
  try {
    const { productoId, tipo, desde, hasta } = req.query;
    const where = {};
    if (productoId) where.productoId = parseInt(productoId);
    if (tipo) where.tipo = tipo;
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta + 'T23:59:59');
    }

    const movimientos = await prisma.movimientoInventario.findMany({
      where,
      include: { producto: true },
      orderBy: { fecha: 'desc' }
    });
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ajuste de inventario
router.post('/ajuste', async (req, res) => {
  try {
    const { productoId, cantidad, tipo, referencia } = req.body;

    await prisma.$transaction(async (tx) => {
      const incremento = tipo === 'entrada' ? cantidad : -cantidad;
      await tx.producto.update({
        where: { id: productoId },
        data: { stockActual: { increment: incremento } }
      });
      await tx.movimientoInventario.create({
        data: { productoId, tipo, cantidad, referencia: referencia || 'Ajuste manual' }
      });
    });

    res.json({ message: 'Ajuste realizado correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
