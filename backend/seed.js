const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Sembrando datos iniciales...');

  // Usuarios
  const passHash = await bcrypt.hash('admin123', 10);
  const cajeroHash = await bcrypt.hash('cajero123', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@pos.com' },
    update: {},
    create: { nombre: 'Administrador', email: 'admin@pos.com', password: passHash, rol: 'admin' }
  });

  await prisma.usuario.upsert({
    where: { email: 'cajero@pos.com' },
    update: {},
    create: { nombre: 'María García', email: 'cajero@pos.com', password: cajeroHash, rol: 'cajero' }
  });

  await prisma.usuario.upsert({
    where: { email: 'almacen@pos.com' },
    update: {},
    create: { nombre: 'Carlos López', email: 'almacen@pos.com', password: cajeroHash, rol: 'almacen' }
  });

  // Categorías
  const categorias = ['Bebidas', 'Alimentos', 'Limpieza', 'Electrónica', 'Papelería'];
  const cats = {};
  for (const nombre of categorias) {
    cats[nombre] = await prisma.categoria.upsert({
      where: { nombre },
      update: {},
      create: { nombre }
    });
  }

  // Productos
  const productos = [
    { nombre: 'Coca-Cola 600ml', sku: 'BEB-001', precioCompra: 12, precioVenta: 18, categoriaId: cats['Bebidas'].id, stockActual: 50, stockMinimo: 10 },
    { nombre: 'Agua Natural 1L', sku: 'BEB-002', precioCompra: 6, precioVenta: 12, categoriaId: cats['Bebidas'].id, stockActual: 80, stockMinimo: 15 },
    { nombre: 'Jugo de Naranja 1L', sku: 'BEB-003', precioCompra: 15, precioVenta: 25, categoriaId: cats['Bebidas'].id, stockActual: 30, stockMinimo: 8 },
    { nombre: 'Café Soluble 200g', sku: 'BEB-004', precioCompra: 45, precioVenta: 75, categoriaId: cats['Bebidas'].id, stockActual: 20, stockMinimo: 5 },
    { nombre: 'Galletas Surtido 400g', sku: 'ALI-001', precioCompra: 20, precioVenta: 35, categoriaId: cats['Alimentos'].id, stockActual: 40, stockMinimo: 10 },
    { nombre: 'Pan de Caja', sku: 'ALI-002', precioCompra: 25, precioVenta: 42, categoriaId: cats['Alimentos'].id, stockActual: 25, stockMinimo: 8 },
    { nombre: 'Arroz 1kg', sku: 'ALI-003', precioCompra: 18, precioVenta: 28, categoriaId: cats['Alimentos'].id, stockActual: 60, stockMinimo: 15 },
    { nombre: 'Aceite Vegetal 1L', sku: 'ALI-004', precioCompra: 30, precioVenta: 48, categoriaId: cats['Alimentos'].id, stockActual: 35, stockMinimo: 10 },
    { nombre: 'Detergente Líquido 1L', sku: 'LIM-001', precioCompra: 35, precioVenta: 55, categoriaId: cats['Limpieza'].id, stockActual: 20, stockMinimo: 5 },
    { nombre: 'Jabón en Barra 3 pack', sku: 'LIM-002', precioCompra: 22, precioVenta: 38, categoriaId: cats['Limpieza'].id, stockActual: 30, stockMinimo: 8 },
    { nombre: 'Cloro 1L', sku: 'LIM-003', precioCompra: 12, precioVenta: 20, categoriaId: cats['Limpieza'].id, stockActual: 3, stockMinimo: 5 },
    { nombre: 'Cable USB-C', sku: 'ELE-001', precioCompra: 50, precioVenta: 99, categoriaId: cats['Electrónica'].id, stockActual: 15, stockMinimo: 5 },
    { nombre: 'Audífonos Básicos', sku: 'ELE-002', precioCompra: 40, precioVenta: 79, categoriaId: cats['Electrónica'].id, stockActual: 10, stockMinimo: 3 },
    { nombre: 'Cuaderno 100 hojas', sku: 'PAP-001', precioCompra: 15, precioVenta: 28, categoriaId: cats['Papelería'].id, stockActual: 50, stockMinimo: 10 },
    { nombre: 'Plumas (paquete 10)', sku: 'PAP-002', precioCompra: 20, precioVenta: 35, categoriaId: cats['Papelería'].id, stockActual: 2, stockMinimo: 5 },
  ];

  for (const prod of productos) {
    await prisma.producto.upsert({
      where: { sku: prod.sku },
      update: {},
      create: prod
    });
  }

  // Clientes
  const clientes = [
    { nombre: 'Público General', email: 'general@pos.com', telefono: '0000000000' },
    { nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '5551234567', rfc: 'PEPJ900101ABC' },
    { nombre: 'Ana Martínez', email: 'ana@email.com', telefono: '5559876543', direccion: 'Calle Reforma 123' },
    { nombre: 'Empresa ABC S.A.', email: 'compras@abc.com', telefono: '5551112233', rfc: 'EAB200301XYZ', direccion: 'Av. Industrial 456' },
  ];
  for (const c of clientes) {
    const exists = await prisma.cliente.findFirst({ where: { email: c.email } });
    if (!exists) await prisma.cliente.create({ data: c });
  }

  // Proveedores
  const proveedores = [
    { nombre: 'Distribuidora Nacional', email: 'ventas@distnac.com', telefono: '5550001111', rfc: 'DNA200101ABC' },
    { nombre: 'Productos del Valle', email: 'info@prodvalle.com', telefono: '5550002222', rfc: 'PVA190501XYZ' },
    { nombre: 'Tech Supply México', email: 'ventas@techsupply.mx', telefono: '5550003333' },
  ];
  for (const p of proveedores) {
    const exists = await prisma.proveedor.findFirst({ where: { email: p.email } });
    if (!exists) await prisma.proveedor.create({ data: p });
  }

  // Empleados
  const empleados = [
    { nombre: 'Administrador General', puesto: 'Gerente', salario: 25000, telefono: '5551110000', email: 'admin@pos.com' },
    { nombre: 'María García', puesto: 'Cajera', salario: 12000, telefono: '5552220000', email: 'maria@pos.com' },
    { nombre: 'Carlos López', puesto: 'Almacenista', salario: 11000, telefono: '5553330000', email: 'carlos@pos.com' },
    { nombre: 'Laura Sánchez', puesto: 'Vendedora', salario: 10000, telefono: '5554440000', email: 'laura@pos.com' },
  ];
  for (const e of empleados) {
    const exists = await prisma.empleado.findFirst({ where: { email: e.email } });
    if (!exists) await prisma.empleado.create({ data: e });
  }

  console.log('Datos iniciales creados correctamente');
  console.log('Usuarios de prueba:');
  console.log('  admin@pos.com / admin123 (Administrador)');
  console.log('  cajero@pos.com / cajero123 (Cajero)');
  console.log('  almacen@pos.com / cajero123 (Almacén)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
