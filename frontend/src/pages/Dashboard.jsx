import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../api/axios'

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

export default function Dashboard() {
  const [kpis, setKpis] = useState(null)
  const [topProductos, setTopProductos] = useState([])
  const [ventasDiarias, setVentasDiarias] = useState([])

  useEffect(() => {
    api.get('/reportes/dashboard').then(r => setKpis(r.data)).catch(() => {})
    api.get('/reportes/top-productos?limite=6').then(r => setTopProductos(r.data)).catch(() => {})
    api.get('/reportes/ventas-diarias').then(r => setVentasDiarias(r.data)).catch(() => {})
  }, [])

  if (!kpis) return <div className="text-center py-10 text-gray-500">Cargando dashboard...</div>

  const cards = [
    { label: 'Ventas Hoy', value: `$${kpis.ventasHoy.total.toLocaleString()}`, sub: `${kpis.ventasHoy.cantidad} ventas`, color: 'bg-blue-500' },
    { label: 'Ventas Semana', value: `$${kpis.ventasSemana.total.toLocaleString()}`, sub: `${kpis.ventasSemana.cantidad} ventas`, color: 'bg-green-500' },
    { label: 'Ventas Mes', value: `$${kpis.ventasMes.total.toLocaleString()}`, sub: `${kpis.ventasMes.cantidad} ventas`, color: 'bg-purple-500' },
    { label: 'Stock Bajo', value: kpis.stockBajo, sub: 'productos', color: kpis.stockBajo > 0 ? 'bg-red-500' : 'bg-gray-500' },
    { label: 'Productos', value: kpis.totalProductos, sub: 'activos', color: 'bg-yellow-500' },
    { label: 'Clientes', value: kpis.totalClientes, sub: 'registrados', color: 'bg-indigo-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-lg shadow p-4">
            <div className={`${card.color} text-white text-xs font-medium px-2 py-1 rounded inline-block mb-2`}>
              {card.label}
            </div>
            <div className="text-2xl font-bold text-gray-800">{card.value}</div>
            <div className="text-sm text-gray-500">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas Diarias */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ventas Últimos 30 Días</h2>
          {ventasDiarias.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos de ventas</p>
          )}
        </div>

        {/* Top Productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Productos Más Vendidos</h2>
          {topProductos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={topProductos} dataKey="cantidadVendida" nameKey="producto" cx="50%" cy="50%" outerRadius={100} label={({ producto }) => producto}>
                  {topProductos.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos de productos</p>
          )}
        </div>
      </div>
    </div>
  )
}
