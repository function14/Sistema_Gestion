import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/pos', label: 'Punto de Venta', icon: '🛒' },
  { path: '/productos', label: 'Productos', icon: '📦' },
  { path: '/inventario', label: 'Inventario', icon: '🏪' },
  { path: '/ventas', label: 'Ventas', icon: '💰' },
  { path: '/compras', label: 'Compras', icon: '📋' },
  { path: '/clientes', label: 'Clientes', icon: '👥' },
  { path: '/proveedores', label: 'Proveedores', icon: '🚚' },
  { path: '/empleados', label: 'Empleados', icon: '👷' },
  { path: '/contabilidad', label: 'Contabilidad', icon: '📒' },
  { path: '/reportes', label: 'Reportes', icon: '📈' },
]

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-lg font-bold">POS/ERP</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white text-xl">
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm hover:bg-gray-800 transition-colors ${isActive ? 'bg-gray-800 text-blue-400 border-r-2 border-blue-400' : 'text-gray-300'}`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {sidebarOpen && <span className="ml-3">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-700">
          {sidebarOpen && (
            <div className="mb-2 text-sm text-gray-400">
              {usuario?.nombre} ({usuario?.rol})
            </div>
          )}
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-400 hover:text-red-300">
            {sidebarOpen ? 'Cerrar Sesión' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
