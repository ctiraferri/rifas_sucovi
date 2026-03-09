import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import AdminLayout from './components/AdminLayout'
import Home from './pages/Home'
import VentaForm from './pages/VentaForm'
import AdminLogin from './pages/AdminLogin'
import AdminRifas from './pages/AdminRifas'
import AdminVentas from './pages/AdminVentas'
import './index.css'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/venta" element={<VentaForm />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<PrivateRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/rifas" element={<AdminRifas />} />
              <Route path="/admin/ventas" element={<AdminVentas />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
