import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Ventas() {
  const [ventas, setVentas] = useState([])
  const [desde, setDesde] = useState('')
  const [hasta, setHasta] = useState('')
  const [detalle, setDetalle] = useState(null)

  const cargar = () => {
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    api.get(`/ventas?${params}`).then(r => setVentas(r.data))
  }

  useEffect(() => { cargar() }, [])

  const buscar = () => cargar()

  const anular = async (id) => {
    if (!confirm('¿Anular esta venta? Se revertirá el inventario.')) return
    await api.put(`/ventas/${id}/anular`)
    cargar()
    setDetalle(null)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Historial de Ventas</h1>

      <div className="flex gap-4 mb-4 items-end">
        <div>
          <label className="block text-sm font-medium mb-1">Desde</label>
          <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hasta</label>
          <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <button onClick={buscar} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Filtrar</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4"># Venta</th>
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Cliente</th>
              <th className="text-left py-3 px-4">Vendedor</th>
              <th className="text-center py-3 px-4">Pago</th>
              <th className="text-right py-3 px-4">Total</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">#{v.id}</td>
                <td className="py-3 px-4">{new Date(v.fecha).toLocaleString('es-MX')}</td>
                <td className="py-3 px-4">{v.cliente?.nombre || 'Público General'}</td>
                <td className="py-3 px-4">{v.usuario?.nombre}</td>
                <td className="py-3 px-4 text-center capitalize">{v.metodoPago}</td>
                <td className="py-3 px-4 text-right font-bold">${v.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${v.estado === 'completada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{v.estado}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => setDetalle(v)} className="text-blue-600 hover:underline mr-2">Ver</button>
                  {v.estado === 'completada' && <button onClick={() => anular(v.id)} className="text-red-600 hover:underline">Anular</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {ventas.length === 0 && <p className="text-center py-8 text-gray-400">No hay ventas registradas</p>}
      </div>

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Venta #{detalle.id}</h2>
            <div className="text-sm space-y-1 mb-4">
              <p><strong>Fecha:</strong> {new Date(detalle.fecha).toLocaleString('es-MX')}</p>
              <p><strong>Cliente:</strong> {detalle.cliente?.nombre || 'Público General'}</p>
              <p><strong>Vendedor:</strong> {detalle.usuario?.nombre}</p>
              <p><strong>Método:</strong> {detalle.metodoPago}</p>
              <p><strong>Estado:</strong> {detalle.estado}</p>
            </div>
            <table className="w-full text-sm mb-4">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3">Producto</th>
                  <th className="text-center py-2 px-3">Cant.</th>
                  <th className="text-right py-2 px-3">Precio</th>
                  <th className="text-right py-2 px-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detalle.detalles?.map(d => (
                  <tr key={d.id} className="border-t">
                    <td className="py-2 px-3">{d.producto?.nombre}</td>
                    <td className="py-2 px-3 text-center">{d.cantidad}</td>
                    <td className="py-2 px-3 text-right">${d.precioUnitario.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right">${d.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right text-lg font-bold border-t pt-2">Total: ${detalle.total.toFixed(2)}</div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setDetalle(null)} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
