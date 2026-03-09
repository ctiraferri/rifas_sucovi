import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function AdminLogin() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', { user, password })
      login(data.token)
      navigate('/admin/rifas')
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-red-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-sm border-t-4 border-[#008C45]">
        <div className="flex justify-center gap-1 mb-4">
          <div className="w-6 h-1.5 rounded-full bg-[#008C45]"></div>
          <div className="w-6 h-1.5 rounded-full bg-white border border-gray-200"></div>
          <div className="w-6 h-1.5 rounded-full bg-[#CD212A]"></div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Admin</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
              required
            />
          </div>
          {error && <p className="text-[#CD212A] text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008C45] text-white py-2 rounded-md hover:bg-[#006d36] disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}
