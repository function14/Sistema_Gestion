const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { buscar } = req.query;
    const where = {};
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { email: { contains: buscar } }
      ];
    }
    const proveedores = await prisma.proveedor.findMany({ where, orderBy: { nombre: 'asc' } });
    res.json(proveedores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const proveedor = await prisma.proveedor.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { compras: { orderBy: { fecha: 'desc' }, take: 20 } }
    });
    if (!proveedor) return res.status(404).json({ error: 'Proveedor no encontrado' });
    res.json(proveedor);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const proveedor = await prisma.proveedor.create({ data: req.body });
    res.status(201).json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const proveedor = await prisma.proveedor.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(proveedor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.proveedor.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Proveedor eliminado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
