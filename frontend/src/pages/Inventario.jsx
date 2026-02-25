import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Inventario() {
  const [productos, setProductos] = useState([])
  const [alertas, setAlertas] = useState([])
  const [movimientos, setMovimientos] = useState([])
  const [tab, setTab] = useState('stock')
  const [modalAjuste, setModalAjuste] = useState(false)
  const [ajuste, setAjuste] = useState({ productoId: '', tipo: 'entrada', cantidad: '', referencia: '' })

  const cargar = () => {
    api.get('/inventario/stock').then(r => setProductos(r.data))
    api.get('/inventario/alertas').then(r => setAlertas(r.data))
    api.get('/inventario/movimientos').then(r => setMovimientos(r.data))
  }

  useEffect(() => { cargar() }, [])

  const realizarAjuste = async (e) => {
    e.preventDefault()
    await api.post('/inventario/ajuste', { ...ajuste, productoId: parseInt(ajuste.productoId), cantidad: parseInt(ajuste.cantidad) })
    setModalAjuste(false)
    setAjuste({ productoId: '', tipo: 'entrada', cantidad: '', referencia: '' })
    cargar()
  }

  const tabs = [
    { id: 'stock', label: 'Stock Actual' },
    { id: 'alertas', label: `Alertas (${alertas.length})` },
    { id: 'movimientos', label: 'Movimientos' },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Inventario</h1>
        <button onClick={() => setModalAjuste(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Ajuste de Inventario</button>
      </div>

      <div className="flex gap-1 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`px-4 py-2 rounded-t text-sm font-medium ${tab === t.id ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>{t.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {tab === 'stock' && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-left py-3 px-4">Categoría</th>
                <th className="text-center py-3 px-4">Stock Actual</th>
                <th className="text-center py-3 px-4">Stock Mínimo</th>
                <th className="text-center py-3 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{p.nombre}</td>
                  <td className="py-3 px-4">{p.categoria?.nombre}</td>
                  <td className="py-3 px-4 text-center font-bold">{p.stockActual}</td>
                  <td className="py-3 px-4 text-center">{p.stockMinimo}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${p.stockActual <= p.stockMinimo ? 'bg-red-100 text-red-700' : p.stockActual <= p.stockMinimo * 2 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.stockActual <= p.stockMinimo ? 'Bajo' : p.stockActual <= p.stockMinimo * 2 ? 'Medio' : 'OK'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === 'alertas' && (
          <div>
            {alertas.length === 0 ? (
              <p className="text-center py-8 text-gray-400">No hay alertas de stock bajo</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-red-50">
                  <tr>
                    <th className="text-left py-3 px-4">Producto</th>
                    <th className="text-center py-3 px-4">Stock Actual</th>
                    <th className="text-center py-3 px-4">Stock Mínimo</th>
                    <th className="text-center py-3 px-4">Faltante</th>
                  </tr>
                </thead>
                <tbody>
                  {alertas.map(p => (
                    <tr key={p.id} className="border-t">
                      <td className="py-3 px-4 font-medium text-red-700">{p.nombre}</td>
                      <td className="py-3 px-4 text-center font-bold text-red-600">{p.stockActual}</td>
                      <td className="py-3 px-4 text-center">{p.stockMinimo}</td>
                      <td className="py-3 px-4 text-center font-bold">{p.stockMinimo - p.stockActual}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'movimientos' && (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4">Fecha</th>
                <th className="text-left py-3 px-4">Producto</th>
                <th className="text-center py-3 px-4">Tipo</th>
                <th className="text-center py-3 px-4">Cantidad</th>
                <th className="text-left py-3 px-4">Referencia</th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map(m => (
                <tr key={m.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">{new Date(m.fecha).toLocaleString('es-MX')}</td>
                  <td className="py-3 px-4">{m.producto?.nombre}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : m.tipo === 'salida' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{m.tipo}</span>
                  </td>
                  <td className="py-3 px-4 text-center font-medium">{m.cantidad}</td>
                  <td className="py-3 px-4 text-gray-500">{m.referencia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Ajuste */}
      {modalAjuste && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Ajuste de Inventario</h2>
            <form onSubmit={realizarAjuste} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Producto</label>
                <select required value={ajuste.productoId} onChange={e => setAjuste({ ...ajuste, productoId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} (Stock: {p.stockActual})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tipo</label>
                <select value={ajuste.tipo} onChange={e => setAjuste({ ...ajuste, tipo: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="entrada">Entrada</option>
                  <option value="salida">Salida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cantidad</label>
                <input type="number" min="1" required value={ajuste.cantidad} onChange={e => setAjuste({ ...ajuste, cantidad: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Referencia</label>
                <input value={ajuste.referencia} onChange={e => setAjuste({ ...ajuste, referencia: e.target.value })} placeholder="Motivo del ajuste" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setModalAjuste(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Aplicar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
