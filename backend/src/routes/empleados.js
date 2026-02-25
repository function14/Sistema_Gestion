const express = require('express');
const prisma = require('../config/db');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};
    if (activo !== undefined) where.activo = activo === 'true';
    const empleados = await prisma.empleado.findMany({ where, orderBy: { nombre: 'asc' } });
    res.json(empleados);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const empleado = await prisma.empleado.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
    res.json(empleado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('admin'), async (req, res) => {
  try {
    const empleado = await prisma.empleado.create({ data: req.body });
    res.status(201).json(empleado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const empleado = await prisma.empleado.update({
      where: { id: parseInt(req.params.id) },
      data: req.body
    });
    res.json(empleado);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await prisma.empleado.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: false }
    });
    res.json({ message: 'Empleado desactivado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
