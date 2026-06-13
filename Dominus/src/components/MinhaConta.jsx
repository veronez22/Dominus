import { useState, useEffect, useRef } from 'react'
import { X, ShoppingBag } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { getExtrasLinhas } from '../lib/formatExtras'
import './MinhaConta.css'

function MinhaConta({ mesa, onFechar, onAbrirCarrinho }) {
  const [etapa,            setEtapa]            = useState('scanner')
  const [comanda,          setComanda]          = useState(null)
  const [erroMsg,          setErroMsg]          = useState('')
  const [pedidos,          setPedidos]          = useState([])
  const [loadingPedidos,   setLoadingPedidos]   = useState(false)
  const scannerRef  = useRef(null)
  const rodandoRef  = useRef(false)

  const totalGasto = pedidos.reduce((s, p) => s + Number(p.total), 0)
  const totalItens = pedidos.reduce((s, p) =>
    s + (p.itens_pedido || []).reduce((si, i) => si + i.quantidade, 0), 0)

  // ── Scanner ──
  useEffect(() => {
    if (etapa !== 'scanner') return

    const scanner = new Html5Qrcode('qr-conta-container')
    scannerRef.current = scanner

    scanner.start(
      { facingMode: 'user' },
      { fps: 10, qrbox: { width: 220, height: 220 } },
      (texto) => {
        if (!rodandoRef.current) return
        if (/^CMD-\d{4}$/.test(texto)) {
          rodandoRef.current = false
          scanner.stop().catch(() => {})
          setComanda(texto)
          setEtapa('conta')
        } else {
          setErroMsg('QR Code inválido. Use a comanda do estabelecimento.')
          setTimeout(() => setErroMsg(''), 2500)
        }
      },
      () => {}
    ).then(() => { rodandoRef.current = true }).catch(() => setEtapa('erro'))

    return () => {
      if (rodandoRef.current) {
        rodandoRef.current = false
        scanner.stop().catch(() => {})
      }
    }
  }, [etapa])

  // ── Busca pedidos do caixa atual por comanda ──
  useEffect(() => {
    if (!comanda) return
    async function buscar() {
      setLoadingPedidos(true)

      const { data: rest } = await supabase
        .from('restaurantes').select('id').eq('slug', 'dominus').single()

      const { data: caixa } = await supabase
        .from('caixas')
        .select('id')
        .eq('restaurante_id', rest.id)
        .is('fechado_em', null)
        .single()

      let query = supabase
        .from('pedidos')
        .select('*, itens_pedido(*)')
        .eq('comanda', comanda)
        .neq('status', 'baixa')
        .order('criado_em', { ascending: true })

      if (caixa) query = query.eq('caixa_id', caixa.id)

      const { data } = await query
      setPedidos(data || [])
      setLoadingPedidos(false)
    }
    buscar()
  }, [comanda])

  const fmtPreco = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <div className="modal-overlay conta-overlay" onClick={onFechar}>
      <div className={`conta-modal ${etapa === 'scanner' ? 'conta-modal--scan' : ''}`} onClick={(e) => e.stopPropagation()}>

        {/* ══ SCANNER ══ */}
        {etapa === 'scanner' && (
          <>
            <button className="conta-fechar-scan" onClick={onFechar}><X size={20} /></button>
            <div className="conta-scanner-info">
              <div className="conta-scanner-icone">
                <img src="/icones/iconeQR.png" alt="" />
              </div>
              <h2>Minha Conta</h2>
              <p>Aponte a câmera para o QR Code impresso na sua comanda para ver os pedidos e o total da sua mesa.</p>
              {erroMsg && <p className="conta-erro">{erroMsg}</p>}
            </div>
            <div className="conta-camera-wrapper">
              <div id="qr-conta-container" className="conta-camera-inner" />
              <div className="conta-frame">
                <span className="frame-tl" /><span className="frame-tr" />
                <span className="frame-bl" /><span className="frame-br" />
              </div>
              <div className="conta-scanline" />
            </div>
          </>
        )}

        {/* ══ CONTA ══ */}
        {etapa === 'conta' && (
          <>
            {/* Header */}
            <div className="conta-header">
              <div className="conta-header-info">
                <h2>Minha Conta</h2>
                <span>{comanda}{mesa ? ` · Mesa ${mesa}` : ''}</span>
              </div>
              <button className="conta-btn-fechar" onClick={onFechar}><X size={20} /></button>
            </div>

            {/* Conteúdo */}
            <div className="conta-corpo">
              {loadingPedidos ? (
                <div className="conta-vazio"><p>Carregando...</p></div>

              ) : pedidos.length === 0 ? (
                <div className="conta-vazio">
                  <ShoppingBag size={48} strokeWidth={1.2} color="var(--texto-terciario)" />
                  <p>Nenhum pedido nesta comanda ainda.</p>
                  <button className="conta-btn-pedir" onClick={() => { onFechar(); onAbrirCarrinho() }}>
                    Fazer pedido
                  </button>
                </div>

              ) : (
                <div className="conta-recibo">
                  {pedidos.flatMap(p => p.itens_pedido || []).map(item => (
                    <div key={item.id} className="conta-item">
                      <span className="conta-item-qtd">{item.quantidade}x</span>
                      <div className="conta-item-info">
                        <span className="conta-item-nome">{item.nome_snapshot}</span>
                        {item.observacao && (
                          <span className="conta-item-obs">{item.observacao}</span>
                        )}
                        {getExtrasLinhas(item.extras).map((linha, idx) => (
                          <span key={idx} className="conta-item-obs">{linha}</span>
                        ))}
                      </div>
                      <span className="conta-item-preco">
                        {fmtPreco(Number(item.preco_snapshot) * item.quantidade)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Total fixo no rodapé */}
            {pedidos.length > 0 && (
              <div className="conta-rodape">
                <div className="conta-rodape-total">
                  <span>Total</span>
                  <strong>{fmtPreco(totalGasto)}</strong>
                </div>
              </div>
            )}
          </>
        )}

        {/* ══ ERRO CÂMERA ══ */}
        {etapa === 'erro' && (
          <div className="conta-camera-erro">
            <X size={64} strokeWidth={1.5} color="#f55" />
            <h2>Câmera indisponível</h2>
            <p>Não foi possível acessar a câmera. Verifique as permissões do navegador.</p>
            <button className="conta-btn-pedir" onClick={onFechar}>Fechar</button>
          </div>
        )}

      </div>
    </div>
  )
}

export default MinhaConta
