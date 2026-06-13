import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import App from './App'
import AdminLogin from './admin/AdminLogin'
import AdminLayout from './admin/AdminLayout'

/**
 * Rota protegida — redireciona para /admin/login se não autenticado
 */
function RotaProtegida({ children }) {
  const [sessao, setSessao] = useState(undefined) // undefined = carregando

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSessao(s))
    return () => subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#1a1a1a', color:'#FFB84D', fontSize:18, gap:12 }}>
      <span style={{ fontSize:28 }}>⏳</span> Verificando acesso...
    </div>
  )

  return sessao ? children : <Navigate to="/admin/login" replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── App do tablet (cliente) ── */}
      <Route path="/*" element={<App />} />

      {/* ── Login do admin ── */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* ── Painel Admin (protegido) ── */}
      <Route path="/admin/*" element={
        <RotaProtegida>
          <AdminLayout />
        </RotaProtegida>
      } />
    </Routes>
  )
}
