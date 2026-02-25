import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Productos() {
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [filtro, setFiltro] = useState('')
  const [catFiltro, setCatFiltro] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', sku: '', precioCompra: '', precioVenta: '', categoriaId: '', stockMinimo: 5, imagen: '' })

  const cargar = () => {
    const params = new URLSearchParams()
    if (filtro) params.set('buscar', filtro)
    if (catFiltro) params.set('categoriaId', catFiltro)
    api.get(`/productos?${params}`).then(r => setProductos(r.data))
  }

  useEffect(() => { cargar() }, [filtro, catFiltro])
  useEffect(() => { api.get('/productos/categorias/all').then(r => setCategorias(r.data)) }, [])

  const abrirModal = (producto = null) => {
    if (producto) {
      setEditando(producto.id)
      setForm({ nombre: producto.nombre, sku: producto.sku, precioCompra: producto.precioCompra, precioVenta: producto.precioVenta, categoriaId: producto.categoriaId, stockMinimo: producto.stockMinimo, imagen: producto.imagen || '' })
    } else {
      setEditando(null)
      setForm({ nombre: '', sku: '', precioCompra: '', precioVenta: '', categoriaId: categorias[0]?.id || '', stockMinimo: 5, imagen: '' })
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    const data = { ...form, precioCompra: parseFloat(form.precioCompra), precioVenta: parseFloat(form.precioVenta), categoriaId: parseInt(form.categoriaId), stockMinimo: parseInt(form.stockMinimo) }
    if (editando) {
      await api.put(`/productos/${editando}`, data)
    } else {
      await api.post('/productos', data)
    }
    setModal(false)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return
    await api.delete(`/productos/${id}`)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button onClick={() => abrirModal()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Producto</button>
      </div>

      <div className="flex gap-4 mb-4">
        <input type="text" placeholder="Buscar por nombre o SKU..." value={filtro} onChange={e => setFiltro(e.target.value)} className="flex-1 border rounded px-4 py-2" />
        <select value={catFiltro} onChange={e => setCatFiltro(e.target.value)} className="border rounded px-4 py-2">
          <option value="">Todas las categorías</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">SKU</th>
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Categoría</th>
              <th className="text-right py-3 px-4">P. Compra</th>
              <th className="text-right py-3 px-4">P. Venta</th>
              <th className="text-center py-3 px-4">Stock</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-mono text-xs">{p.sku}</td>
                <td className="py-3 px-4 font-medium">{p.nombre}</td>
                <td className="py-3 px-4">{p.categoria?.nombre}</td>
                <td className="py-3 px-4 text-right">${p.precioCompra.toFixed(2)}</td>
                <td className="py-3 px-4 text-right">${p.precioVenta.toFixed(2)}</td>
                <td className={`py-3 px-4 text-center font-medium ${p.stockActual <= p.stockMinimo ? 'text-red-600' : 'text-green-600'}`}>{p.stockActual}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => abrirModal(p)} className="text-blue-600 hover:underline mr-2">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productos.length === 0 && <p className="text-center py-8 text-gray-400">No hay productos</p>}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar Producto' : 'Nuevo Producto'}</h2>
            <form onSubmit={guardar} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre</label>
                  <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <input required value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Compra</label>
                  <input type="number" step="0.01" required value={form.precioCompra} onChange={e => setForm({ ...form, precioCompra: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio Venta</label>
                  <input type="number" step="0.01" required value={form.precioVenta} onChange={e => setForm({ ...form, precioVenta: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select required value={form.categoriaId} onChange={e => setForm({ ...form, categoriaId: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="">Seleccionar...</option>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                  <input type="number" value={form.stockMinimo} onChange={e => setForm({ ...form, stockMinimo: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL Imagen (opcional)</label>
                <input value={form.imagen} onChange={e => setForm({ ...form, imagen: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
