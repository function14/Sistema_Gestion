# POS/ERP - Sistema de Gestión Empresarial

Sistema completo de Punto de Venta (POS) con módulos ERP para la gestión integral de un negocio. Interfaz en español.

## Tecnologías

| Componente | Tecnología |
|------------|------------|
| Backend | Node.js + Express |
| Frontend | React 18 + Vite |
| Base de datos | SQLite (via Prisma ORM) |
| Estilos | Tailwind CSS |
| Gráficas | Recharts |
| Autenticación | JWT + bcrypt |

## Requisitos Previos

- **Node.js** v18 o superior — [https://nodejs.org](https://nodejs.org)
- **npm** (incluido con Node.js)
- **Git** (opcional, para clonar el repositorio)

## Instalación

### 1. Clonar o copiar el proyecto

```bash
cd C:\Users\TU_USUARIO
git clone <url-del-repositorio> pos-erp
```

### 2. Instalar dependencias del Backend

```bash
cd pos-erp/backend
npm install
```

Esto instalará las siguientes dependencias:

| Paquete | Uso |
|---------|-----|
| `express` | Servidor web y API REST |
| `@prisma/client` | ORM para la base de datos |
| `bcryptjs` | Encriptación de contraseñas |
| `jsonwebtoken` | Tokens de autenticación JWT |
| `cors` | Permitir peticiones del frontend |
| `prisma` (dev) | Herramienta CLI para migraciones |
| `nodemon` (dev) | Recarga automática en desarrollo |

### 3. Crear la base de datos

```bash
npx prisma db push
```

Esto crea el archivo `prisma/dev.db` (SQLite) con todas las tablas del sistema.

### 4. Cargar datos iniciales (seed)

```bash
node seed.js
```

Crea usuarios de prueba, categorías, 15 productos, clientes, proveedores y empleados de ejemplo.

### 5. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

Esto instalará las siguientes dependencias:

| Paquete | Uso |
|---------|-----|
| `react` | Librería de UI |
| `react-dom` | Renderizado en el navegador |
| `react-router-dom` | Navegación entre páginas (v6) |
| `axios` | Cliente HTTP para las API |
| `recharts` | Gráficas para dashboard y reportes |
| `tailwindcss` (dev) | Framework CSS utilitario |
| `postcss` (dev) | Procesador de CSS |
| `autoprefixer` (dev) | Compatibilidad entre navegadores |
| `@vitejs/plugin-react` (dev) | Plugin de React para Vite |
| `vite` (dev) | Bundler y servidor de desarrollo |

## Ejecución

Se necesitan **dos terminales** abiertas simultáneamente:

### Terminal 1 — Backend (API)

```bash
cd pos-erp/backend
node src/index.js
```

El servidor inicia en **http://localhost:3001**

Para desarrollo con recarga automática:

```bash
npm run dev
```

### Terminal 2 — Frontend (UI)

```bash
cd pos-erp/frontend
npm run dev
```

La aplicación inicia en **http://localhost:5173**

## Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@pos.com | admin123 | Administrador |
| cajero@pos.com | cajero123 | Cajero |
| almacen@pos.com | cajero123 | Almacén |

## Módulos del Sistema

### Punto de Venta (POS)
- Factura editable: escribe productos, cantidades y precios manualmente
- Autocompletado de productos del catálogo
- Métodos de pago: efectivo, tarjeta, transferencia
- Cálculo automático de cambio
- Ticket de venta imprimible

### Productos
- CRUD completo con categorías
- Código SKU, precios de compra y venta
- Estado activo/inactivo
- Filtros por nombre, SKU y categoría

### Inventario
- Stock actual por producto
- Alertas de stock bajo (mínimo configurable)
- Ajustes manuales de entrada/salida
- Historial de movimientos

### Ventas
- Historial completo de ventas
- Filtros por fecha
- Detalle de cada venta (productos, cantidades, precios)
- Anulación de ventas (revierte inventario)

### Compras
- Órdenes de compra a proveedores
- Estados: pendiente, recibida, cancelada
- Recepción de mercancía (actualiza stock automáticamente)

### Clientes
- Registro con datos de contacto y RFC
- Historial de compras por cliente

### Proveedores
- Registro con datos de contacto y RFC
- Historial de órdenes de compra

### Empleados (RRHH)
- Registro con puesto, salario y datos de contacto
- Activar/desactivar empleados
- Solo administradores pueden gestionar empleados

### Contabilidad
- Ingresos y egresos (automáticos por ventas/compras + manuales)
- Categorías: ventas, compras, nómina, gastos, otros
- Balance general (ingresos - egresos)

### Dashboard y Reportes
- KPIs: ventas del día, semana y mes
- Gráfica de ventas diarias (últimos 30 días)
- Top 10 productos más vendidos
- Alertas de inventario bajo

## Estructura del Proyecto

```
pos-erp/
├── backend/
│   ├── package.json
│   ├── seed.js                    # Datos iniciales
│   ├── prisma/
│   │   └── schema.prisma          # Modelos de datos (12 tablas)
│   └── src/
│       ├── index.js               # Servidor Express
│       ├── config/
│       │   └── db.js              # Conexión Prisma
│       ├── middleware/
│       │   └── auth.js            # JWT + control de roles
│       ├── routes/
│       │   ├── auth.js            # Login
│       │   ├── productos.js       # CRUD productos y categorías
│       │   ├── ventas.js          # POS y ventas
│       │   ├── inventario.js      # Stock y movimientos
│       │   ├── compras.js         # Órdenes de compra
│       │   ├── clientes.js        # CRUD clientes
│       │   ├── proveedores.js     # CRUD proveedores
│       │   ├── empleados.js       # RRHH
│       │   ├── contabilidad.js    # Movimientos contables
│       │   └── reportes.js        # Dashboard y KPIs
│       └── utils/
│           └── helpers.js
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx                # Router principal
        ├── index.css              # Tailwind imports
        ├── api/
        │   └── axios.js           # Cliente HTTP configurado
        ├── context/
        │   └── AuthContext.jsx    # Estado de autenticación
        ├── components/
        │   └── Layout.jsx         # Sidebar + navegación
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── POS.jsx
            ├── Productos.jsx
            ├── Inventario.jsx
            ├── Ventas.jsx
            ├── Compras.jsx
            ├── Clientes.jsx
            ├── Proveedores.jsx
            ├── Empleados.jsx
            ├── Contabilidad.jsx
            └── Reportes.jsx
```

## API REST — Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/me` | Usuario actual |
| GET/POST | `/api/productos` | Listar / Crear productos |
| GET/PUT/DELETE | `/api/productos/:id` | Obtener / Editar / Desactivar |
| GET | `/api/productos/categorias/all` | Listar categorías |
| POST | `/api/productos/categorias` | Crear categoría |
| GET/POST | `/api/ventas` | Listar / Crear venta |
| GET | `/api/ventas/:id` | Detalle de venta |
| PUT | `/api/ventas/:id/anular` | Anular venta |
| GET | `/api/inventario/stock` | Stock actual |
| GET | `/api/inventario/alertas` | Productos con stock bajo |
| GET | `/api/inventario/movimientos` | Historial de movimientos |
| POST | `/api/inventario/ajuste` | Ajuste manual |
| GET/POST | `/api/compras` | Listar / Crear orden de compra |
| PUT | `/api/compras/:id/recibir` | Recibir mercancía |
| PUT | `/api/compras/:id/cancelar` | Cancelar orden |
| GET/POST | `/api/clientes` | Listar / Crear clientes |
| GET/PUT/DELETE | `/api/clientes/:id` | Obtener / Editar / Eliminar |
| GET/POST | `/api/proveedores` | Listar / Crear proveedores |
| GET/PUT/DELETE | `/api/proveedores/:id` | Obtener / Editar / Eliminar |
| GET/POST | `/api/empleados` | Listar / Crear empleados |
| GET/PUT/DELETE | `/api/empleados/:id` | Obtener / Editar / Desactivar |
| GET/POST | `/api/contabilidad` | Listar / Crear movimiento contable |
| GET | `/api/contabilidad/balance` | Balance general |
| GET | `/api/reportes/dashboard` | KPIs del dashboard |
| GET | `/api/reportes/top-productos` | Productos más vendidos |
| GET | `/api/reportes/ventas-diarias` | Ventas por día (30 días) |

## Migrar a PostgreSQL

Para usar PostgreSQL en lugar de SQLite, edita `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = "postgresql://usuario:password@localhost:5432/pos_erp"
}
```

Luego ejecuta:

```bash
npx prisma db push
node seed.js
```

## Comandos Útiles

```bash
# Ver la base de datos en el navegador
cd backend && npx prisma studio

# Regenerar el cliente Prisma después de cambiar el schema
npx prisma generate

# Build de producción del frontend
cd frontend && npm run build
```
