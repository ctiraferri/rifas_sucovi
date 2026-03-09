import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center">
        <img src={`${import.meta.env.BASE_URL}logoSUCOVI.jpeg`} alt="SUCOVI 2027" className="w-40 h-40 mx-auto mb-6 object-contain" />
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">Sistema de Rifas</h1>
        <h2 className="text-xl sm:text-2xl font-semibold text-[#008C45] mb-10">SUCOVI 2027</h2>

        <div className="flex flex-col items-center gap-4">
          <Link
            to="/venta"
            className="w-64 bg-[#008C45] text-white py-4 rounded-xl text-xl font-bold hover:bg-[#006d36] shadow-lg transition-all"
          >
            VENDER
          </Link>
          <Link
            to="/admin/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Administración
          </Link>
        </div>
      </div>
    </div>
  )
}
