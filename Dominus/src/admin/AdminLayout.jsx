import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import AdminDashboard from './pages/AdminDashboard'
import AdminProdutos from './pages/AdminProdutos'
import AdminBanners from './pages/AdminBanners'
import AdminAvaliacoes from './pages/AdminAvaliacoes'
import AdminPedidos from './pages/AdminPedidos'
import AdminRelatorios from './pages/AdminRelatorios'
import './AdminLayout.css'

const NAV_GERAL = [
  { to: '/admin',          label: 'Dashboard', end: true, icon: <IconDashboard /> },
  { to: '/admin/pedidos',  label: 'Comandas',             icon: <IconOrders /> },
]

const NAV_CARDAPIO = [
  { to: '/admin/produtos', label: 'Produtos',  icon: <IconPizza /> },
  { to: '/admin/banners',  label: 'Banners',   icon: <IconImage /> },
]

const NAV_GESTAO = [
  { to: '/admin/avaliacoes', label: 'Avaliações',  icon: <IconStar /> },
  { to: '/admin/relatorios', label: 'Relatórios',  icon: <IconChart /> },
]

export default function AdminLayout() {
  const navigate = useNavigate()

  async function sair() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  return (
    <div className="admin-wrap">
      <aside className="admin-side">
        <div className="admin-side-logo">
          <div className="al-logo-icon">D</div>
          <div>
            <div className="al-logo-nome">Dominus</div>
            <div className="al-logo-sub">Painel Admin</div>
          </div>
        </div>

        <nav className="admin-side-nav">
          <div className="al-nav-section">Geral</div>
          {NAV_GERAL.map(n => (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}>
              {n.icon} {n.label}
            </NavLink>
          ))}
          <div className="al-nav-section">Cardápio</div>
          {NAV_CARDAPIO.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}>
              {n.icon} {n.label}
            </NavLink>
          ))}
          <div className="al-nav-section">Gestão</div>
          {NAV_GESTAO.map(n => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}>
              {n.icon} {n.label}
            </NavLink>
          ))}
          <div className="al-nav-section">Sistema</div>
          <NavLink to="/admin/configuracoes" className={({ isActive }) => `al-nav-item${isActive ? ' active' : ''}`}>
            <IconSettings /> Configurações
          </NavLink>
        </nav>

        <button className="al-sair" onClick={sair}>
          <IconLogout /> Sair
        </button>
      </aside>

      <main className="admin-main-area">
        <Routes>
          <Route index           element={<AdminDashboard />} />
          <Route path="produtos" element={<AdminProdutos />} />
          <Route path="banners"  element={<AdminBanners />} />
          <Route path="pedidos"    element={<AdminPedidos />} />
          <Route path="avaliacoes" element={<AdminAvaliacoes />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
          <Route path="configuracoes" element={<EmBreve titulo="Configurações" />} />
        </Routes>
      </main>
    </div>
  )
}

function EmBreve({ titulo }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:12, color:'#A0A0A0' }}>
      <span style={{ fontSize:48 }}>🚧</span>
      <h2 style={{ color:'#fff' }}>{titulo}</h2>
      <p>Em desenvolvimento...</p>
    </div>
  )
}

/* ── Ícones SVG Lucide ── */
function IconDashboard() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> }
function IconPizza()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1010 10"/><path d="M12 2a15.3 15.3 0 014 10"/><path d="M12 2a15.3 15.3 0 00-4 10"/><circle cx="12" cy="12" r="3"/></svg> }
function IconOrders()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> }
function IconTable()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="4" rx="1"/><path d="M6 7v13M18 7v13M6 12h12"/></svg> }
function IconChart()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> }
function IconStar()      { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> }
function IconSettings()  { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> }
function IconLogout()    { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> }
function IconImage()     { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> }
