import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-[#006d36] text-white' : 'text-green-100 hover:bg-[#006d36]'}`

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#008C45] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">Rifas Admin</span>
              <div className="flex gap-1 ml-6">
                <NavLink to="/admin/rifas" className={linkClass}>Rifas</NavLink>
                <NavLink to="/admin/ventas" className={linkClass}>Ventas</NavLink>
                <NavLink to="/admin/sorteo" className={linkClass}>Sorteo</NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <NavLink to="/" className="text-green-100 hover:text-white text-sm">Inicio</NavLink>
              <button onClick={handleLogout} className="text-green-100 hover:text-white text-sm cursor-pointer">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
