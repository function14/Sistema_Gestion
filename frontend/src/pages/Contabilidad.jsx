import { useState, useEffect } from 'react'
import api from '../api/axios'

export default function Contabilidad() {
  const [movimientos, setMovimientos] = useState([])
  const [balance, setBalance] = useState(null)
  const [filtroTipo, setFiltroTipo] = useState('')
  const [filtroCat, setFiltroCat] = useState('')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ tipo: 'ingreso', categoria: 'otros', monto: '', descripcion: '', referencia: '' })

  const cargar = () => {
    const params = new URLSearchParams()
    if (filtroTipo) params.set('tipo', filtroTipo)
    if (filtroCat) params.set('categoria', filtroCat)
    api.get(`/contabilidad?${params}`).then(r => setMovimientos(r.data))
    api.get('/contabilidad/balance').then(r => setBalance(r.data))
  }

  useEffect(() => { cargar() }, [filtroTipo, filtroCat])

  const guardar = async (e) => {
    e.preventDefault()
    await api.post('/contabilidad', { ...form, monto: parseFloat(form.monto) })
    setModal(false)
    setForm({ tipo: 'ingreso', categoria: 'otros', monto: '', descripcion: '', referencia: '' })
    cargar()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Contabilidad</h1>
        <button onClick={() => setModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">+ Nuevo Movimiento</button>
      </div>

      {/* Balance */}
      {balance && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-medium">Ingresos</div>
            <div className="text-2xl font-bold text-green-700">${balance.ingresos.toLocaleString()}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-medium">Egresos</div>
            <div className="text-2xl font-bold text-red-700">${balance.egresos.toLocaleString()}</div>
          </div>
          <div className={`${balance.balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'} border rounded-lg p-4`}>
            <div className="text-sm font-medium text-gray-600">Balance</div>
            <div className={`text-2xl font-bold ${balance.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>${balance.balance.toLocaleString()}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="border rounded px-3 py-2 text-sm">
          <option value="">Todos los tipos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
        <select value={filtroCat} onChange={e => setFiltroCat(e.target.value)} className="border rounded px-3 py-2 text-sm">
          <option value="">Todas las categorías</option>
          <option value="ventas">Ventas</option>
          <option value="compras">Compras</option>
          <option value="nomina">Nómina</option>
          <option value="gastos">Gastos</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4">Fecha</th>
              <th className="text-center py-3 px-4">Tipo</th>
              <th className="text-left py-3 px-4">Categoría</th>
              <th className="text-left py-3 px-4">Descripción</th>
              <th className="text-right py-3 px-4">Monto</th>
              <th className="text-left py-3 px-4">Referencia</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map(m => (
              <tr key={m.id} className="border-t hover:bg-gray-50">
                <td className="py-3 px-4">{new Date(m.fecha).toLocaleDateString('es-MX')}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${m.tipo === 'ingreso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{m.tipo}</span>
                </td>
                <td className="py-3 px-4 capitalize">{m.categoria}</td>
                <td className="py-3 px-4">{m.descripcion}</td>
                <td className={`py-3 px-4 text-right font-bold ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                  {m.tipo === 'ingreso' ? '+' : '-'}${m.monto.toLocaleString()}
                </td>
                <td className="py-3 px-4 text-gray-500">{m.referencia || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movimientos.length === 0 && <p className="text-center py-8 text-gray-400">No hay movimientos contables</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Nuevo Movimiento Contable</h2>
            <form onSubmit={guardar} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="ingreso">Ingreso</option>
                    <option value="egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })} className="w-full border rounded px-3 py-2 text-sm">
                    <option value="ventas">Ventas</option>
                    <option value="compras">Compras</option>
                    <option value="nomina">Nómina</option>
                    <option value="gastos">Gastos</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>
              <div><label className="block text-sm font-medium mb-1">Monto</label><input type="number" step="0.01" required value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Descripción</label><input required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
              <div><label className="block text-sm font-medium mb-1">Referencia</label><input value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" /></div>
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
