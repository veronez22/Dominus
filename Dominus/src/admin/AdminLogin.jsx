import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AdminLogin.css'

export default function AdminLogin() {
  const [email, setEmail]       = useState('')
  const [senha, setSenha]       = useState('')
  const [erro, setErro]         = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error) {
      setErro('E-mail ou senha incorretos.')
    } else {
      navigate('/admin')
    }
    setLoading(false)
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">D</div>
          <div>
            <div className="login-logo-nome">Dominus</div>
            <div className="login-logo-sub">Painel Administrativo</div>
          </div>
        </div>

        <h1 className="login-titulo">Entrar</h1>
        <p className="login-subtitulo">Acesso restrito a administradores</p>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-campo">
            <label>E-mail</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="login-campo">
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
          </div>

          {erro && <div className="login-erro">⚠️ {erro}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar no painel'}
          </button>
        </form>

        <div className="login-footer">
          Esqueceu a senha? Contate o suporte Dominus.
        </div>
      </div>
    </div>
  )
}
