import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Compras() {
  const [compras, setCompras] = useState([])
  const [proveedores, setProveedores] = useState([])
  const [productos, setProductos] = useState([])
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ proveedorId: '', items: [{ productoId: '', cantidad: '', precioUnitario: '' }] })

  const cargar = () => api.get('/compras').then(r => setCompras(r.data))

  useEffect(() => {
    cargar()
    api.get('/proveedores').then(r => setProveedores(r.data))
    api.get('/productos?activo=true').then(r => setProductos(r.data))
  }, [])

  const agregarItem = () => setForm({ ...form, items: [...form.items, { productoId: '', cantidad: '', precioUnitario: '' }] })
  const removeItem = (i) => setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) })
  const updateItem = (i, campo, valor) => {
    const items = [...form.items]
    items[i] = { ...items[i], [campo]: valor }
    setForm({ ...form, items })
  }

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/compras', {
      proveedorId: parseInt(form.proveedorId),
      items: form.items.map(i => ({ productoId: parseInt(i.productoId), cantidad: parseInt(i.cantidad), precioUnitario: parseFloat(i.precioUnitario) }))
    })
    setModal(false)
    setForm({ proveedorId: '', items: [{ productoId: '', cantidad: '', precioUnitario: '' }] })
    cargar()
  }

  const recibir = async (id) => {
    if (!confirm('¿Marcar como recibida? Se actualizará el inventario.')) return
    await api.put(`/compras/${id}/recibir`)
    cargar()
  }

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar esta orden de compra?')) return
    await api.put(`/compras/${id}/cancelar`)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes de Compra</h1>
        <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nueva Compra</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4"># Compra</th>
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-left py-3 px-4">Proveedor</th>
              <th className="text-right py-3 px-4">Total</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {compras.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">#{c.id}</td>
                <td className="py-3 px-4">{new Date(c.fecha).toLocaleDateString('es-MX')}</td>
                <td className="py-3 px-4">{c.proveedor?.nombre}</td>
                <td className="py-3 px-4 text-right font-bold">${c.total.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${c.estado === 'recibida' ? 'bg-green-100 text-green-700' : c.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{c.estado}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  {c.estado === 'pendiente' && (
                    <>
                      <button onClick={() => recibir(c.id)} className="text-green-600 hover:underline mr-2">Recibir</button>
                      <button onClick={() => cancelar(c.id)} className="text-red-600 hover:underline">Cancelar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {compras.length === 0 && <p className="text-center py-8 text-gray-400">No hay compras registradas</p>}
      </div>

      {/* Modal nueva compra */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-bold mb-4">Nueva Orden de Compra</h2>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proveedor</label>
                <select required value={form.proveedorId} onChange={e => setForm({ ...form, proveedorId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                  <option value="">Seleccionar...</option>
                  {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Productos</label>
                {form.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2 items-center">
                    <select required value={item.productoId} onChange={e => updateItem(i, 'productoId', e.target.value)} className="flex-1 border rounded px-3 py-2 text-sm">
                      <option value="">Producto...</option>
                      {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                    </select>
                    <input type="number" min="1" required placeholder="Cant." value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)} className="w-20 border rounded px-3 py-2 text-sm" />
                    <input type="number" step="0.01" required placeholder="Precio" value={item.precioUnitario} onChange={e => updateItem(i, 'precioUnitario', e.target.value)} className="w-28 border rounded px-3 py-2 text-sm" />
                    {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700">✕</button>}
                  </div>
                ))}
                <button type="button" onClick={agregarItem} className="text-blue-600 text-sm hover:underline">+ Agregar producto</button>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Crear Orden</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
