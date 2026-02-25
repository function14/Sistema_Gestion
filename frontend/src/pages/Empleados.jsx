import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Empleados() {
  const [empleados, setEmpleados] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState({ nombre: '', puesto: '', salario: '', telefono: '', email: '' })

  const cargar = () => api.get('/empleados').then(r => setEmpleados(r.data))
  useEffect(() => { cargar() }, [])

  const abrirModal = (emp = null) => {
    if (emp) {
      setEditando(emp.id)
      setForm({ nombre: emp.nombre, puesto: emp.puesto, salario: emp.salario, telefono: emp.telefono || '', email: emp.email || '' })
    } else {
      setEditando(null)
      setForm({ nombre: '', puesto: '', salario: '', telefono: '', email: '' })
    }
    setModal(true)
  }

  const guardar = async (e) => {
    e.preventDefault()
    const data = { ...form, salario: parseFloat(form.salario) }
    if (editando) {
      await api.put(`/empleados/${editando}`, data)
    } else {
      await api.post('/empleados', data)
    }
    setModal(false)
    cargar()
  }

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este empleado?')) return
    await api.delete(`/empleados/${id}`)
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
        <button onClick={() => abrirModal()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Empleado</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Nombre</th>
              <th className="text-left py-3 px-4">Puesto</th>
              <th className="text-right py-3 px-4">Salario</th>
              <th className="text-left py-3 px-4">Teléfono</th>
              <th className="text-left py-3 px-4">Email</th>
              <th className="text-center py-3 px-4">Estado</th>
              <th className="text-center py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {empleados.map(e => (
              <tr key={e.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4 font-medium">{e.nombre}</td>
                <td className="py-3 px-4">{e.puesto}</td>
                <td className="py-3 px-4 text-right">${e.salario.toLocaleString()}</td>
                <td className="py-3 px-4">{e.telefono || '-'}</td>
                <td className="py-3 px-4">{e.email || '-'}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${e.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{e.activo ? 'Activo' : 'Inactivo'}</span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button onClick={() => abrirModal(e)} className="text-blue-600 hover:underline mr-2">Editar</button>
                  {e.activo && <button onClick={() => desactivar(e.id)} className="text-red-600 hover:underline">Desactivar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {empleados.length === 0 && <p className="text-center py-8 text-gray-400">No hay empleados registrados</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{editando ? 'Editar Empleado' : 'Nuevo Empleado'}</h2>
            <form onSubmit={guardar} className="space-y-3">
              <div><label className="block text-sm font-medium mb-1">Nombre</label><input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Puesto</label><input required value={form.puesto} onChange={e => setForm({ ...form, puesto: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Salario</label><input type="number" step="0.01" required value={form.salario} onChange={e => setForm({ ...form, salario: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Teléfono</label><input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
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
