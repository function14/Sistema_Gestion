const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Crear orden de compra
router.post('/', async (req, res) => {
  try {
    const { proveedorId, items } = req.body;
    const total = items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);

    const compra = await prisma.compra.create({
      data: {
        proveedorId,
        usuarioId: req.usuario.id,
        total,
        detalles: {
          create: items.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            subtotal: item.precioUnitario * item.cantidad
          }))
        }
      },
      include: { detalles: { include: { producto: true } }, proveedor: true }
    });
    res.status(201).json(compra);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar compras
router.get('/', async (req, res) => {
  try {
    const { estado, proveedorId } = req.query;
    const where = {};
    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = parseInt(proveedorId);

    const compras = await prisma.compra.findMany({
      where,
      include: { proveedor: true, usuario: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(compras);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una compra
router.get('/:id', async (req, res) => {
  try {
    const compra = await prisma.compra.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { proveedor: true, usuario: true, detalles: { include: { producto: true } } }
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    res.json(compra);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Recibir compra (actualiza inventario)
router.put('/:id/recibir', async (req, res) => {
  try {
    const compraId = parseInt(req.params.id);
    const compra = await prisma.compra.findUnique({
      where: { id: compraId },
      include: { detalles: true }
    });
    if (!compra) return res.status(404).json({ error: 'Compra no encontrada' });
    if (compra.estado !== 'pendiente') return res.status(400).json({ error: 'La compra no está pendiente' });

    await prisma.$transaction(async (tx) => {
      await tx.compra.update({ where: { id: compraId }, data: { estado: 'recibida' } });

      for (const detalle of compra.detalles) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: { increment: detalle.cantidad } }
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'entrada',
            cantidad: detalle.cantidad,
            referencia: `Compra #${compraId}`
          }
        });
      }

      await tx.movimientoContable.create({
        data: {
          tipo: 'egreso',
          categoria: 'compras',
          monto: compra.total,
          descripcion: `Compra #${compraId}`,
          referencia: `compra-${compraId}`
        }
      });
    });

    res.json({ message: 'Compra recibida y stock actualizado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancelar compra
router.put('/:id/cancelar', async (req, res) => {
  try {
    const compraId = parseInt(req.params.id);
    await prisma.compra.update({
      where: { id: compraId },
      data: { estado: 'cancelada' }
    });
    res.json({ message: 'Compra cancelada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
