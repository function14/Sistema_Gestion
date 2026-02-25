import { useState, useEffect, useRef } from 'react'
import api from '../api/axios'

const filaVacia = () => ({ productoId: '', nombre: '', cantidad: 1, precioUnitario: 0, subtotal: 0 })

export default function POS() {
  const [items, setItems] = useState([filaVacia()])
  const [productos, setProductos] = useState([])
  const [clientes, setClientes] = useState([])
  const [clienteId, setClienteId] = useState('')
  const [metodoPago, setMetodoPago] = useState('efectivo')
  const [pagoRecibido, setPagoRecibido] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [ticketData, setTicketData] = useState(null)
  const [sugerencias, setSugerencias] = useState({ fila: -1, lista: [] })
  const inputRefs = useRef([])

  useEffect(() => {
    api.get('/productos?activo=true').then(r => setProductos(r.data)).catch(() => {})
    api.get('/clientes').then(r => setClientes(r.data)).catch(() => {})
  }, [])

  const total = items.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const cambio = pagoRecibido ? parseFloat(pagoRecibido) - total : 0

  const actualizarFila = (index, campo, valor) => {
    const nuevos = [...items]
    nuevos[index] = { ...nuevos[index], [campo]: valor }

    if (campo === 'cantidad' || campo === 'precioUnitario') {
      const cant = campo === 'cantidad' ? parseFloat(valor) || 0 : parseFloat(nuevos[index].cantidad) || 0
      const precio = campo === 'precioUnitario' ? parseFloat(valor) || 0 : parseFloat(nuevos[index].precioUnitario) || 0
      nuevos[index].subtotal = Math.round(cant * precio * 100) / 100
    }

    setItems(nuevos)
  }

  const buscarProducto = (index, texto) => {
    actualizarFila(index, 'nombre', texto)
    if (texto.length >= 1) {
      const filtrados = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto.toLowerCase()) ||
        p.sku.toLowerCase().includes(texto.toLowerCase())
      )
      setSugerencias({ fila: index, lista: filtrados.slice(0, 8) })
    } else {
      setSugerencias({ fila: -1, lista: [] })
    }
  }

  const seleccionarProducto = (index, producto) => {
    const nuevos = [...items]
    nuevos[index] = {
      productoId: producto.id,
      nombre: producto.nombre,
      cantidad: 1,
      precioUnitario: producto.precioVenta,
      subtotal: producto.precioVenta
    }
    setItems(nuevos)
    setSugerencias({ fila: -1, lista: [] })
  }

  const agregarFila = () => {
    setItems([...items, filaVacia()])
  }

  const eliminarFila = (index) => {
    if (items.length === 1) {
      setItems([filaVacia()])
      return
    }
    setItems(items.filter((_, i) => i !== index))
  }

  const limpiar = () => {
    setItems([filaVacia()])
    setClienteId('')
    setMetodoPago('efectivo')
    setPagoRecibido('')
    setMensaje(null)
    setTicketData(null)
  }

  const procesarVenta = async () => {
    const itemsValidos = items.filter(item => item.nombre && item.cantidad > 0 && item.precioUnitario > 0)
    if (itemsValidos.length === 0) {
      setMensaje({ tipo: 'error', texto: 'Agrega al menos un producto con precio y cantidad' })
      return
    }

    if (metodoPago === 'efectivo' && parseFloat(pagoRecibido) < total) {
      setMensaje({ tipo: 'error', texto: 'El pago recibido es menor al total' })
      return
    }

    try {
      const ventaItems = itemsValidos.map(item => ({
        productoId: item.productoId || null,
        cantidad: parseInt(item.cantidad),
        precioUnitario: parseFloat(item.precioUnitario)
      }))

      const { data } = await api.post('/ventas', {
        clienteId: clienteId ? parseInt(clienteId) : null,
        metodoPago,
        items: ventaItems
      })

      setTicketData({
        ...data,
        pagoRecibido: parseFloat(pagoRecibido) || total,
        cambio: metodoPago === 'efectivo' ? cambio : 0,
        itemsManual: itemsValidos
      })
      setMensaje({ tipo: 'exito', texto: `Venta #${data.id} registrada correctamente` })
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.response?.data?.error || 'Error al procesar la venta' })
    }
  }

  const imprimirTicket = () => {
    window.print()
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Punto de Venta</h1>
        <button onClick={limpiar} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Nueva Venta
        </button>
      </div>

      {mensaje && (
        <div className={`mb-4 px-4 py-3 rounded ${mensaje.tipo === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* Ticket / Recibo */}
      {ticketData ? (
        <div className="bg-white rounded-lg shadow-lg p-8 print:shadow-none" id="ticket">
          <div className="text-center border-b pb-4 mb-4">
            <h2 className="text-xl font-bold">TICKET DE VENTA</h2>
            <p className="text-gray-500">Venta #{ticketData.id}</p>
            <p className="text-sm text-gray-500">{new Date(ticketData.fecha).toLocaleString('es-MX')}</p>
            {ticketData.cliente && <p className="text-sm">Cliente: {ticketData.cliente.nombre}</p>}
            <p className="text-sm">Atendió: {ticketData.usuario?.nombre}</p>
          </div>

          <table className="w-full mb-4 text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Producto</th>
                <th className="text-center py-2">Cant.</th>
                <th className="text-right py-2">P.Unit.</th>
                <th className="text-right py-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {(ticketData.detalles || ticketData.itemsManual || []).map((item, i) => (
                <tr key={i} className="border-b border-dashed">
                  <td className="py-2">{item.producto?.nombre || item.nombre}</td>
                  <td className="text-center">{item.cantidad}</td>
                  <td className="text-right">${parseFloat(item.precioUnitario).toFixed(2)}</td>
                  <td className="text-right">${(item.subtotal || item.cantidad * item.precioUnitario).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t pt-4 space-y-1">
            <div className="flex justify-between text-lg font-bold">
              <span>TOTAL:</span>
              <span>${ticketData.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Método de pago:</span>
              <span className="capitalize">{ticketData.metodoPago}</span>
            </div>
            {ticketData.metodoPago === 'efectivo' && (
              <>
                <div className="flex justify-between text-sm">
                  <span>Recibido:</span>
                  <span>${ticketData.pagoRecibido.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-green-600">
                  <span>Cambio:</span>
                  <span>${Math.max(0, ticketData.cambio).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <div className="text-center mt-6 text-sm text-gray-400">
            ¡Gracias por su compra!
          </div>

          <div className="mt-6 flex gap-3 print:hidden">
            <button onClick={imprimirTicket} className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Imprimir Ticket
            </button>
            <button onClick={limpiar} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Nueva Venta
            </button>
          </div>
        </div>
      ) : (
        /* Formulario de Factura */
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Encabezado factura */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente (opcional)</label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Público General --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Método de Pago</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="text"
                value={new Date().toLocaleDateString('es-MX')}
                disabled
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>

          {/* Tabla de productos editable */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-sm text-gray-600">
                  <th className="text-left py-3 px-2 w-8">#</th>
                  <th className="text-left py-3 px-2">Producto / Descripción</th>
                  <th className="text-center py-3 px-2 w-24">Cantidad</th>
                  <th className="text-right py-3 px-2 w-32">Precio Unit.</th>
                  <th className="text-right py-3 px-2 w-32">Subtotal</th>
                  <th className="text-center py-3 px-2 w-12"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-blue-50/30">
                    <td className="py-2 px-2 text-sm text-gray-400">{index + 1}</td>
                    <td className="py-2 px-2 relative">
                      <input
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        value={item.nombre}
                        onChange={(e) => buscarProducto(index, e.target.value)}
                        onFocus={() => { if (item.nombre) buscarProducto(index, item.nombre) }}
                        onBlur={() => setTimeout(() => setSugerencias({ fila: -1, lista: [] }), 200)}
                        placeholder="Escribe el nombre del producto o SKU..."
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {/* Dropdown sugerencias */}
                      {sugerencias.fila === index && sugerencias.lista.length > 0 && (
                        <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {sugerencias.lista.map(prod => (
                            <button
                              key={prod.id}
                              onMouseDown={() => seleccionarProducto(index, prod)}
                              className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex justify-between"
                            >
                              <span>{prod.nombre} <span className="text-gray-400">({prod.sku})</span></span>
                              <span className="text-green-600 font-medium">${prod.precioVenta.toFixed(2)}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        value={item.cantidad}
                        onChange={(e) => actualizarFila(index, 'cantidad', e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-center focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.precioUnitario}
                        onChange={(e) => actualizarFila(index, 'precioUnitario', e.target.value)}
                        className="w-full border border-gray-200 rounded px-3 py-2 text-sm text-right focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="py-2 px-2 text-right text-sm font-medium">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => eliminarFila(index)}
                        className="text-red-400 hover:text-red-600 text-lg"
                        title="Eliminar fila"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={agregarFila}
            className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
          >
            + Agregar línea
          </button>

          {/* Totales y pago */}
          <div className="mt-6 pt-4 border-t flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            {metodoPago === 'efectivo' && (
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Pago Recibido</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={pagoRecibido}
                  onChange={(e) => setPagoRecibido(e.target.value)}
                  placeholder="0.00"
                  className="border border-gray-300 rounded px-4 py-2 text-lg w-48 focus:ring-2 focus:ring-blue-500"
                />
                {pagoRecibido && (
                  <p className={`text-sm mt-1 font-medium ${cambio >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Cambio: ${Math.max(0, cambio).toFixed(2)}
                  </p>
                )}
              </div>
            )}

            <div className="text-right space-y-2">
              <div className="text-3xl font-bold text-gray-800">
                Total: ${total.toFixed(2)}
              </div>
              <button
                onClick={procesarVenta}
                disabled={total <= 0}
                className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cobrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
