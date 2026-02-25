const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Dashboard KPIs
router.get('/dashboard', async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());

    // Ventas del día
    const ventasHoy = await prisma.venta.aggregate({
      where: { fecha: { gte: hoy }, estado: 'completada' },
      _sum: { total: true },
      _count: true
    });

    // Ventas de la semana
    const ventasSemana = await prisma.venta.aggregate({
      where: { fecha: { gte: inicioSemana }, estado: 'completada' },
      _sum: { total: true },
      _count: true
    });

    // Ventas del mes
    const ventasMes = await prisma.venta.aggregate({
      where: { fecha: { gte: inicioMes }, estado: 'completada' },
      _sum: { total: true },
      _count: true
    });

    // Productos con stock bajo
    const todosProductos = await prisma.producto.findMany({ where: { activo: true } });
    const stockBajo = todosProductos.filter(p => p.stockActual <= p.stockMinimo);

    // Total productos y clientes
    const totalProductos = await prisma.producto.count({ where: { activo: true } });
    const totalClientes = await prisma.cliente.count();

    res.json({
      ventasHoy: { total: ventasHoy._sum.total || 0, cantidad: ventasHoy._count },
      ventasSemana: { total: ventasSemana._sum.total || 0, cantidad: ventasSemana._count },
      ventasMes: { total: ventasMes._sum.total || 0, cantidad: ventasMes._count },
      stockBajo: stockBajo.length,
      totalProductos,
      totalClientes
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Productos más vendidos
router.get('/top-productos', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    const detalles = await prisma.detalleVenta.groupBy({
      by: ['productoId'],
      _sum: { cantidad: true, subtotal: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: parseInt(limite)
    });

    const productos = await Promise.all(
      detalles.map(async (d) => {
        const producto = await prisma.producto.findUnique({ where: { id: d.productoId } });
        return {
          producto: producto?.nombre || 'Desconocido',
          cantidadVendida: d._sum.cantidad,
          totalVentas: d._sum.subtotal
        };
      })
    );

    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ventas por día (últimos 30 días)
router.get('/ventas-diarias', async (req, res) => {
  try {
    const hace30 = new Date();
    hace30.setDate(hace30.getDate() - 30);

    const ventas = await prisma.venta.findMany({
      where: { fecha: { gte: hace30 }, estado: 'completada' },
      select: { fecha: true, total: true }
    });

    const porDia = {};
    ventas.forEach(v => {
      const dia = v.fecha.toISOString().split('T')[0];
      porDia[dia] = (porDia[dia] || 0) + v.total;
    });

    const resultado = Object.entries(porDia)
      .map(([fecha, total]) => ({ fecha, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
