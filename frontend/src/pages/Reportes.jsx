import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../api/axios'

export default function Reportes() {
  const [kpis, setKpis] = useState(null)
  const [topProductos, setTopProductos] = useState([])
  const [ventasDiarias, setVentasDiarias] = useState([])
  const [alertas, setAlertas] = useState([])

  useEffect(() => {
    api.get('/reportes/dashboard').then(r => setKpis(r.data)).catch(() => {})
    api.get('/reportes/top-productos?limite=10').then(r => setTopProductos(r.data)).catch(() => {})
    api.get('/reportes/ventas-diarias').then(r => setVentasDiarias(r.data)).catch(() => {})
    api.get('/inventario/alertas').then(r => setAlertas(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes</h1>

      {/* Resumen */}
      {kpis && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Ventas del Día</div>
            <div className="text-3xl font-bold text-blue-600">${kpis.ventasHoy.total.toLocaleString()}</div>
            <div className="text-sm text-gray-400">{kpis.ventasHoy.cantidad} transacciones</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Ventas del Mes</div>
            <div className="text-3xl font-bold text-green-600">${kpis.ventasMes.total.toLocaleString()}</div>
            <div className="text-sm text-gray-400">{kpis.ventasMes.cantidad} transacciones</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Productos con Stock Bajo</div>
            <div className={`text-3xl font-bold ${kpis.stockBajo > 0 ? 'text-red-600' : 'text-green-600'}`}>{kpis.stockBajo}</div>
            <div className="text-sm text-gray-400">requieren atención</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tendencia de ventas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tendencia de Ventas (30 días)</h2>
          {ventasDiarias.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ventasDiarias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
                <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Top 10 Productos Más Vendidos</h2>
          {topProductos.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProductos} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="producto" width={120} tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="cantidadVendida" fill="#10B981" name="Unidades" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-10">Sin datos</p>
          )}
        </div>
      </div>

      {/* Alertas de inventario */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Alertas de Inventario Bajo</h2>
        {alertas.length > 0 ? (
          <table className="w-full text-sm">
            <thead className="bg-red-50">
              <tr>
                <th className="text-left py-2 px-4">Producto</th>
                <th className="text-left py-2 px-4">Categoría</th>
                <th className="text-center py-2 px-4">Stock Actual</th>
                <th className="text-center py-2 px-4">Stock Mínimo</th>
                <th className="text-center py-2 px-4">Faltante</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2 px-4 font-medium">{p.nombre}</td>
                  <td className="py-2 px-4">{p.categoria?.nombre}</td>
                  <td className="py-2 px-4 text-center text-red-600 font-bold">{p.stockActual}</td>
                  <td className="py-2 px-4 text-center">{p.stockMinimo}</td>
                  <td className="py-2 px-4 text-center font-bold">{p.stockMinimo - p.stockActual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-400 text-center py-6">Todos los productos tienen stock suficiente</p>
        )}
      </div>
    </div>
  )
}
