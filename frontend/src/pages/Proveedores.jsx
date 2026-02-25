import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([])
  const [buscar, setBuscar] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', email: '', telefono: '', direccion: '', rfc: '' })

  const cargar = () => {
    const params = buscar ? `?buscar=${buscar}` : ''
    api.get(`/proveedores${params}`).then(r => setProveedores(r.data))
  }

  useEffect(() => { cargar() }, [buscar])

  const abrirModal = (prov = null) => {
    if (prov) {
      setEditando(prov.id)
      setForm({ nombre: prov.nombre, email: prov.email || '', telefono: prov.telefono || '', direccion: prov.direccion || '', rfc: prov.rfc || '' })
    } else {
      setEditando(null)
      setForm({ nombre: '', email: '', telefono: '', direccion: '', rfc: '' })
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    if (editando) {
      await api.put(`/proveedores/${editando}`, form)
    } else {
      await api.post('/proveedores', form)
    }
    setModal(false)
    cargar()
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return
    await api.delete(`/proveedores/${id}`)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Proveedores</h1>
        <button onClick={() => abrirModal()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Proveedor</button>
      </div>

      <input type="text" placeholder="Buscar proveedores..." value={buscar} onChange={e => setBuscar(e.target.value)} className="w-full border rounded px-4 py-2 mb-4" />

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-left py-3 px-4">Teléfono</th>
              <th className="text-left py-3 px-4">RFC</th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {proveedores.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{p.nombre}</td>
                <td className="py-3 px-4">{p.email || '-'}</td>
                <td className="py-3 px-4">{p.telefono || '-'}</td>
                <td className="py-3 px-4">{p.rfc || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => abrirModal(p)} className="text-blue-600 hover:underline mr-2">Editar</button>
                  <button onClick={() => eliminar(p.id)} className="text-red-600 hover:underline">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {proveedores.length === 0 && <p className="text-center py-8 text-gray-400">No hay proveedores registrados</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
            <form onSubmit={guardar} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Nombre</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Teléfono</label><input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">RFC</label><input value={form.rfc} onChange={e => setForm({ ...form, rfc: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Dirección</label><input value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div className="flex justify-end gap-3 pt-3">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-gray-600">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
