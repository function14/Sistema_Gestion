const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Crear venta (POS)
router.post('/', async (req, res) => {
  try {
    const { clienteId, metodoPago, items } = req.body;
    // items: [{ productoId, cantidad, precioUnitario }]

    const total = items.reduce((sum, item) => sum + item.precioUnitario * item.cantidad, 0);

    const venta = await prisma.$transaction(async (tx) => {
      const v = await tx.venta.create({
        data: {
          clienteId: clienteId || null,
          usuarioId: req.usuario.id,
          total,
          metodoPago,
          detalles: {
            create: items.map(item => ({
              productoId: item.productoId,
              cantidad: item.cantidad,
              precioUnitario: item.precioUnitario,
              subtotal: item.precioUnitario * item.cantidad
            }))
          }
        },
        include: { detalles: { include: { producto: true } }, cliente: true, usuario: true }
      });

      // Actualizar stock y registrar movimientos
      for (const item of items) {
        await tx.producto.update({
          where: { id: item.productoId },
          data: { stockActual: { decrement: item.cantidad } }
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: item.productoId,
            tipo: 'salida',
            cantidad: item.cantidad,
            referencia: `Venta #${v.id}`
          }
        });
      }

      // Registrar ingreso contable
      await tx.movimientoContable.create({
        data: {
          tipo: 'ingreso',
          categoria: 'ventas',
          monto: total,
          descripcion: `Venta #${v.id}`,
          referencia: `venta-${v.id}`
        }
      });

      return v;
    });

    res.status(201).json(venta);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Listar ventas
router.get('/', async (req, res) => {
  try {
    const { desde, hasta, clienteId, estado } = req.query;
    const where = {};
    if (desde || hasta) {
      where.fecha = {};
      if (desde) where.fecha.gte = new Date(desde);
      if (hasta) where.fecha.lte = new Date(hasta + 'T23:59:59');
    }
    if (clienteId) where.clienteId = parseInt(clienteId);
    if (estado) where.estado = estado;

    const ventas = await prisma.venta.findMany({
      where,
      include: { cliente: true, usuario: true, detalles: { include: { producto: true } } },
      orderBy: { fecha: 'desc' }
    });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una venta
router.get('/:id', async (req, res) => {
  try {
    const venta = await prisma.venta.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { cliente: true, usuario: true, detalles: { include: { producto: true } } }
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    res.json(venta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Anular venta
router.put('/:id/anular', async (req, res) => {
  try {
    const ventaId = parseInt(req.params.id);
    const venta = await prisma.venta.findUnique({
      where: { id: ventaId },
      include: { detalles: true }
    });
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });
    if (venta.estado === 'anulada') return res.status(400).json({ error: 'La venta ya está anulada' });

    await prisma.$transaction(async (tx) => {
      await tx.venta.update({ where: { id: ventaId }, data: { estado: 'anulada' } });

      for (const detalle of venta.detalles) {
        await tx.producto.update({
          where: { id: detalle.productoId },
          data: { stockActual: { increment: detalle.cantidad } }
        });
        await tx.movimientoInventario.create({
          data: {
            productoId: detalle.productoId,
            tipo: 'entrada',
            cantidad: detalle.cantidad,
            referencia: `Anulación Venta #${ventaId}`
          }
        });
      }

      await tx.movimientoContable.create({
        data: {
          tipo: 'egreso',
          categoria: 'ventas',
          monto: venta.total,
          descripcion: `Anulación Venta #${ventaId}`,
          referencia: `anulacion-venta-${ventaId}`
        }
      });
    });

    res.json({ message: 'Venta anulada correctamente' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
