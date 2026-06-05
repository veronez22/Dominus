import { useState, useEffect } from 'react'
import { supabase } from './supabase'

export function useCardapio() {
  const [produtos,   setProdutos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  function normalizar(prods, cats) {
    const produtosNormalizados = prods.map(p => ({
      id:               p.id,
      nome:             p.nome,
      descricao:        p.descricao,
      preco:            Number(p.preco),
      precoPromo:       p.preco_promocional ? Number(p.preco_promocional) : null,
      imagem:           p.imagem_url,
      categoria:        p.categorias?.slug,
      badge:            p.badge,
      destaque:         p.destaque,
      disponivel:       p.disponivel,
      formatos:         p.formatos ?? undefined,
    }))

    const categoriasNormalizadas = [
      { id: 'destaques', label: 'Destaques' },
      ...cats.map(c => ({ id: c.slug, label: c.nome })),
    ]

    return { produtosNormalizados, categoriasNormalizadas }
  }

  useEffect(() => {
    async function carregar(exibirLoading = false) {
      try {
        if (exibirLoading) setLoading(true)

        const [{ data: cats, error: errCats }, { data: prods, error: errProds }] = await Promise.all([
          supabase.from('categorias').select('*').eq('ativo', true).order('ordem'),
          supabase.from('produtos').select('*, categorias(slug, nome)').order('ordem'),
        ])

        if (errCats) throw errCats
        if (errProds) throw errProds

        const { produtosNormalizados, categoriasNormalizadas } = normalizar(prods, cats)

        setProdutos(produtosNormalizados)
        setCategorias(categoriasNormalizadas)

        localStorage.setItem('cardapio_cache', JSON.stringify({
          produtos: produtosNormalizados,
          categorias: categoriasNormalizadas,
          timestamp: Date.now(),
        }))

      } catch (err) {
        console.warn('Supabase indisponível, usando cache local:', err.message)
        const cache = localStorage.getItem('cardapio_cache')
        if (cache) {
          const { produtos: cp, categorias: cc } = JSON.parse(cache)
          setProdutos(cp)
          const temDestaques = cc.some(c => c.id === 'destaques')
          setCategorias(temDestaques ? cc : [{ id: 'destaques', label: 'Destaques' }, ...cc])
        } else {
          const { cardapio, categorias: catsEstaticas } = await import('../data/cardapio')
          setProdutos(cardapio)
          setCategorias(catsEstaticas)
        }
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    carregar(true) // primeira carga mostra o loading

    // ── Realtime: atualiza o tablet quando o admin muda o cardápio ──
    const canal = supabase
      .channel('cardapio-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'produtos' }, payload => {
        setProdutos(prev => prev.map(p =>
          p.id === payload.new.id
            ? { ...p, disponivel: payload.new.disponivel, preco: Number(payload.new.preco), badge: payload.new.badge }
            : p
        ))
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'produtos' }, () => carregar())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'produtos' }, payload => {
        setProdutos(prev => prev.filter(p => p.id !== payload.old.id))
      })
      .subscribe()

    return () => supabase.removeChannel(canal)
  }, [])

  return { produtos, categorias, loading, error }
}
