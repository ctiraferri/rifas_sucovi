import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminRifas() {
  const [rifas, setRifas] = useState([])
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [valor, setValor] = useState('')
  const [fechaSorteo, setFechaSorteo] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchRifas = async () => {
    try {
      const { data } = await api.get('/rifas')
      setRifas(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRifas() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!nombre.trim()) return
    setSaving(true)
    try {
      await api.post('/rifas', { nombre, descripcion, valor: Number(valor), fecha_sorteo: fechaSorteo || null })
      setNombre('')
      setDescripcion('')
      setValor('')
      setFechaSorteo('')
      fetchRifas()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al crear rifa')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      await api.patch(`/rifas/${id}/toggle`)
      fetchRifas()
    } catch (err) {
      alert(err.response?.data?.error || 'Error')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta rifa?')) return
    try {
      await api.delete(`/rifas/${id}`)
      fetchRifas()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestión de Rifas</h1>

      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Crear Nueva Rifa</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Valor por número ($) *</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del sorteo</label>
            <input
              type="date"
              value={fechaSorteo}
              onChange={(e) => setFechaSorteo(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 bg-[#008C45] text-white px-6 py-2 rounded-md hover:bg-[#006d36] disabled:opacity-50 cursor-pointer"
        >
          {saving ? 'Creando...' : 'Crear Rifa'}
        </button>
      </form>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Cargando...</p>
        ) : rifas.length === 0 ? (
          <p className="p-6 text-gray-500">No hay rifas creadas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Sorteo</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ventas</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rifas.map((rifa) => (
                  <tr key={rifa.id}>
                    <td className="px-6 py-4 font-medium text-gray-900">{rifa.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{rifa.descripcion || '-'}</td>
                    <td className="px-6 py-4 text-gray-600">${Number(rifa.valor).toLocaleString('es-AR')}</td>
                    <td className="px-6 py-4 text-gray-600">{rifa.fecha_sorteo ? new Date(rifa.fecha_sorteo).toLocaleDateString('es-AR') : '-'}</td>
                    <td className="px-6 py-4 text-gray-600">{rifa.ventas_count}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${rifa.activa ? 'bg-green-100 text-[#008C45]' : 'bg-red-100 text-[#CD212A]'}`}>
                        {rifa.activa ? 'Activa' : 'Inactiva'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggle(rifa.id)}
                          className="text-sm text-[#008C45] hover:text-[#006d36] cursor-pointer"
                        >
                          {rifa.activa ? 'Desactivar' : 'Activar'}
                        </button>
                        <button
                          onClick={() => handleDelete(rifa.id)}
                          disabled={rifa.ventas_count > 0}
                          title={rifa.ventas_count > 0 ? 'No se puede eliminar una rifa con ventas' : 'Eliminar rifa'}
                          className="text-sm text-[#CD212A] hover:text-[#a01a22] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
