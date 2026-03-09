import { useState, useEffect, useRef } from 'react'
import api from '../services/api'

function SlotDigit({ target, spinning, delay }) {
  const [display, setDisplay] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (spinning) {
      setDisplay(Math.floor(Math.random() * 10))
      intervalRef.current = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 10))
      }, 60)
    }
  }, [spinning])

  useEffect(() => {
    if (!spinning && target !== null) {
      const timeout = setTimeout(() => {
        clearInterval(intervalRef.current)
        setDisplay(target)
      }, delay)
      return () => clearTimeout(timeout)
    }
  }, [spinning, target, delay])

  useEffect(() => {
    return () => clearInterval(intervalRef.current)
  }, [])

  return (
    <div className="relative w-16 h-24 sm:w-24 sm:h-36 bg-white rounded-xl shadow-lg border-2 border-yellow-400 flex items-center justify-center overflow-hidden">
      <span className="text-4xl sm:text-6xl font-black text-[#008C45] tabular-nums">
        {display}
      </span>
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-yellow-400/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-yellow-400/30 to-transparent"></div>
    </div>
  )
}

function Confetti() {
  const colors = ['#008C45', '#CD212A', '#FFD700', '#FF6B6B', '#4ECDC4', '#FFE66D', '#FF8C00']
  const pieces = Array.from({ length: 80 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 3,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 10,
    type: Math.random() > 0.5 ? 'circle' : 'rect',
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute animate-confetti"
          style={{
            left: `${p.left}%`,
            top: '-20px',
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.type === 'circle' ? (
            <div style={{ width: p.size, height: p.size, borderRadius: '50%', backgroundColor: p.color }} />
          ) : (
            <div style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color, transform: `rotate(${Math.random() * 360}deg)` }} />
          )}
        </div>
      ))}
    </div>
  )
}

export default function AdminSorteo() {
  const [rifas, setRifas] = useState([])
  const [selectedRifa, setSelectedRifa] = useState('')
  const [spinning, setSpinning] = useState(false)
  const [ganador, setGanador] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [error, setError] = useState('')
  const [historial, setHistorial] = useState([])

  useEffect(() => {
    api.get('/rifas').then(({ data }) => setRifas(data)).catch(console.error)
  }, [])

  useEffect(() => {
    if (selectedRifa) {
      api.get(`/sorteos/${selectedRifa}`).then(({ data }) => setHistorial(data)).catch(console.error)
    } else {
      setHistorial([])
    }
  }, [selectedRifa, ganador])

  const handleSortear = async () => {
    if (!selectedRifa) return
    setError('')
    setGanador(null)
    setShowResult(false)
    setSpinning(true)

    try {
      const { data } = await api.post(`/sorteos/${selectedRifa}`)

      // Dejar girar 3 segundos antes de frenar
      setTimeout(() => {
        setGanador(data)
        setSpinning(false)
        // Mostrar datos del ganador después de que frenen los dígitos
        setTimeout(() => {
          setShowResult(true)
        }, 2500)
      }, 3000)
    } catch (err) {
      setSpinning(false)
      setError(err.response?.data?.error || 'Error al sortear')
    }
  }

  const digits = ganador
    ? String(ganador.numero_rifa).split('').map(Number)
    : [0, 0, 0, 0, 0, 0]

  return (
    <div className="min-h-[80vh] flex flex-col items-center">
      {showResult && <Confetti />}

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Sorteo</h1>

      <div className="mb-8">
        <select
          value={selectedRifa}
          onChange={(e) => { setSelectedRifa(e.target.value); setGanador(null); setShowResult(false); setError('') }}
          className="border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-[#008C45]"
        >
          <option value="">Seleccionar rifa...</option>
          {rifas.map((r) => (
            <option key={r.id} value={r.id}>{r.nombre}</option>
          ))}
        </select>
      </div>

      {/* Slot Machine */}
      <div className="bg-gradient-to-b from-[#CD212A] to-[#a01a22] rounded-2xl p-6 sm:p-10 shadow-2xl mb-8">
        <div className="bg-gray-900 rounded-xl p-4 sm:p-6 mb-6">
          <div className="flex gap-2 sm:gap-3 justify-center">
            {digits.map((d, i) => (
              <SlotDigit
                key={i}
                target={ganador ? d : null}
                spinning={spinning}
                delay={300 + i * 400}
              />
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleSortear}
            disabled={!selectedRifa || spinning}
            className="bg-gradient-to-b from-yellow-400 to-yellow-500 text-gray-900 px-12 py-4 rounded-xl text-2xl font-black shadow-lg hover:from-yellow-300 hover:to-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all active:scale-95"
          >
            {spinning ? 'SORTEANDO...' : 'SORTEAR'}
          </button>
        </div>
      </div>

      {error && <p className="text-[#CD212A] text-lg font-semibold mb-4">{error}</p>}

      {/* Resultado */}
      {showResult && ganador && (
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 text-center max-w-lg w-full animate-fade-in mb-8">
          <div className="text-6xl sm:text-7xl font-black text-[#008C45] tracking-widest mb-6">
            {ganador.numero_rifa}
          </div>
          <div className="space-y-2 mb-6">
            <p className="text-2xl sm:text-3xl font-bold text-gray-800">
              {ganador.nombre_comprador} {ganador.apellido_comprador}
            </p>
            <p className="text-lg text-gray-500">DNI: {ganador.dni}</p>
          </div>
          <div className="relative">
            <h2 className="text-4xl sm:text-5xl font-black text-[#CD212A] animate-bounce">
              ¡¡GANASTE!!
            </h2>
          </div>
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div className="w-full max-w-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">Historial de sorteos</h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Número</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Ganador</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">DNI</th>
                  <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {historial.map((s) => (
                  <tr key={s.id}>
                    <td className="px-4 py-2 font-bold text-[#008C45]">{s.numero_rifa}</td>
                    <td className="px-4 py-2">{s.nombre_comprador} {s.apellido_comprador}</td>
                    <td className="px-4 py-2">{s.dni}</td>
                    <td className="px-4 py-2">{new Date(s.created_at).toLocaleDateString('es-AR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
