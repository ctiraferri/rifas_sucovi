import { useState, useEffect } from 'react'
import api from '../services/api'

export default function AdminVentas() {
  const [ventas, setVentas] = useState([])
  const [rifas, setRifas] = useState([])
  const [filtroRifa, setFiltroRifa] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/rifas').then(({ data }) => setRifas(data)).catch(console.error)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = filtroRifa ? { rifa_id: filtroRifa } : {}
    api.get('/ventas', { params })
      .then(({ data }) => setVentas(data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filtroRifa])

  const formatDate = (d) => new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ventas</h1>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="text-sm font-medium text-gray-700 mr-3">Filtrar por rifa:</label>
        <select
          value={filtroRifa}
          onChange={(e) => setFiltroRifa(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
        >
          <option value="">Todas</option>
          {rifas.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500">Cargando...</p>
        ) : ventas.length === 0 ? (
          <p className="p-6 text-gray-500">No hay ventas registradas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Rifa</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Alumno</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Comprador</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">WhatsApp</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Pago</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ventas.map((v) => (
                  <tr key={v.id}>
                    <td className="px-4 py-3 font-bold text-[#008C45]">{v.numero_rifa}</td>
                    <td className="px-4 py-3">{v.rifa_nombre}</td>
                    <td className="px-4 py-3">{v.nombre_alumno} {v.apellido_alumno}</td>
                    <td className="px-4 py-3">{v.nombre_comprador} {v.apellido_comprador}</td>
                    <td className="px-4 py-3">{v.dni}</td>
                    <td className="px-4 py-3">{v.whatsapp}</td>
                    <td className="px-4 py-3">{v.email}</td>
                    <td className="px-4 py-3 capitalize">{v.metodo_pago}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(v.created_at)}</td>
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
