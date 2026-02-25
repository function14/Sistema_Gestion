const express = require('express');
const prisma = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// Listar productos
router.get('/', async (req, res) => {
  try {
    const { buscar, categoriaId, activo } = req.query;
    const where = {};
    if (buscar) {
      where.OR = [
        { nombre: { contains: buscar } },
        { sku: { contains: buscar } }
      ];
    }
    if (categoriaId) where.categoriaId = parseInt(categoriaId);
    if (activo !== undefined) where.activo = activo === 'true';

    const productos = await prisma.producto.findMany({
      where,
      include: { categoria: true },
      orderBy: { nombre: 'asc' }
    });
    res.json(productos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un producto
router.get('/:id', async (req, res) => {
  try {
    const producto = await prisma.producto.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { categoria: true }
    });
    if (!producto) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const producto = await prisma.producto.create({
      data: req.body,
      include: { categoria: true }
    });
    res.status(201).json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Actualizar producto
router.put('/:id', async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
      include: { categoria: true }
    });
    res.json(producto);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Eliminar (desactivar) producto
router.delete('/:id', async (req, res) => {
  try {
    await prisma.producto.update({
      where: { id: parseInt(req.params.id) },
      data: { activo: false }
    });
    res.json({ message: 'Producto desactivado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Categorías
router.get('/categorias/all', async (req, res) => {
  try {
    const categorias = await prisma.categoria.findMany({ orderBy: { nombre: 'asc' } });
    res.json(categorias);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categorias', async (req, res) => {
  try {
    const categoria = await prisma.categoria.create({ data: req.body });
    res.status(201).json(categoria);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
