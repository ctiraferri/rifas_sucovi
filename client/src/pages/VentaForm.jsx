import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

const initialForm = {
  rifa_id: '',
  nombre_alumno: '',
  apellido_alumno: '',
  nombre_comprador: '',
  apellido_comprador: '',
  dni: '',
  whatsapp: '',
  email: '',
  metodo_pago: 'efectivo',
}

export default function VentaForm() {
  const [rifas, setRifas] = useState([])
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/rifas/activas').then(({ data }) => setRifas(data)).catch(console.error)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'dni' && value && !/^\d*$/.test(value)) return
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (!form.rifa_id) return 'Seleccioná una rifa'
    if (!form.nombre_alumno.trim()) return 'Nombre del alumno requerido'
    if (!form.apellido_alumno.trim()) return 'Apellido del alumno requerido'
    if (!form.nombre_comprador.trim()) return 'Nombre del comprador requerido'
    if (!form.apellido_comprador.trim()) return 'Apellido del comprador requerido'
    if (!form.dni.trim()) return 'DNI requerido'
    if (!form.whatsapp.trim()) return 'WhatsApp requerido'
    if (!form.email.trim() || !form.email.includes('@')) return 'Email inválido'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validate()
    if (err) { setError(err); return }

    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/ventas', { ...form, rifa_id: Number(form.rifa_id) })
      setResult(data.numero_rifa)
      setForm(initialForm)
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Error al registrar la venta'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-t-4 border-[#008C45]">
          <img src={`${import.meta.env.BASE_URL}logoSUCOVI.jpeg`} alt="SUCOVI 2027" className="w-24 h-24 mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Compra registrada!</h2>
          <p className="text-gray-600 mb-6">Tu número de rifa es:</p>
          <div className="bg-green-50 rounded-xl py-6 px-4 mb-6">
            <span className="text-5xl font-bold text-[#008C45] tracking-widest">{result}</span>
          </div>
          <p className="text-gray-500 text-sm mb-6">Te enviamos un email con tu número. Revisá tu bandeja de entrada.</p>
          <button
            onClick={() => setResult(null)}
            className="bg-[#008C45] text-white px-6 py-2 rounded-md hover:bg-[#006d36] cursor-pointer"
          >
            Registrar otra compra
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">&larr; Volver al inicio</Link>
        </div>
        <div className="text-center mb-8">
          <img src={`${import.meta.env.BASE_URL}logoSUCOVI.jpeg`} alt="SUCOVI 2027" className="w-28 h-28 mx-auto mb-2 object-contain" />
          <h1 className="text-3xl font-bold text-gray-800">Rifas SUCOVI 2027</h1>
          <p className="text-gray-500 mt-2">Completá el formulario para registrar tu compra</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-5 border-t-4 border-[#008C45]">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rifa *</label>
            <select
              name="rifa_id"
              value={form.rifa_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]"
              required
            >
              <option value="">Seleccionar rifa...</option>
              {rifas.map((r) => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {form.rifa_id && (() => {
              const rifa = rifas.find(r => String(r.id) === form.rifa_id)
              return rifa ? (
                <p className="mt-2 text-sm font-semibold text-[#008C45]">
                  Valor por número: ${Number(rifa.valor).toLocaleString('es-AR')}
                </p>
              ) : null
            })()}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del alumno *</label>
              <input type="text" name="nombre_alumno" value={form.nombre_alumno} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido del alumno *</label>
              <input type="text" name="apellido_alumno" value={form.apellido_alumno} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del comprador *</label>
              <input type="text" name="nombre_comprador" value={form.nombre_comprador} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido del comprador *</label>
              <input type="text" name="apellido_comprador" value={form.apellido_comprador} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">DNI *</label>
              <input type="text" name="dni" value={form.dni} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required placeholder="Solo números" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp *</label>
              <input type="text" name="whatsapp" value={form.whatsapp} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#008C45]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Método de pago *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="metodo_pago" value="efectivo" checked={form.metodo_pago === 'efectivo'} onChange={handleChange} className="accent-[#008C45]" />
                <span className="text-gray-700">Efectivo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="metodo_pago" value="transferencia" checked={form.metodo_pago === 'transferencia'} onChange={handleChange} className="accent-[#008C45]" />
                <span className="text-gray-700">Transferencia</span>
              </label>
            </div>
          </div>

          {error && <p className="text-[#CD212A] text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#008C45] text-white py-3 rounded-md text-lg font-semibold hover:bg-[#006d36] disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Registrando...
              </span>
            ) : 'Registrar Compra'}
          </button>
        </form>
      </div>
    </div>
  )
}
