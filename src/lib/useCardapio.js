import { useState, useEffect } from 'react'
import { supabase } from './supabase'

/**
 * Hook que busca o cardápio do Supabase.
 * Retorna { produtos, categorias, loading, error }
 * com fallback para os dados estáticos do cardapio.js caso esteja offline.
 */
export function useCardapio() {
  const [produtos,   setProdutos]   = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true)

        // Busca categorias ordenadas
        const { data: cats, error: errCats } = await supabase
          .from('categorias')
          .select('*')
          .eq('ativo', true)
          .order('ordem')

        if (errCats) throw errCats

        // Busca produtos disponíveis com a categoria embutida
        const { data: prods, error: errProds } = await supabase
          .from('produtos')
          .select(`
            *,
            categorias ( slug, nome )
          `)
          .order('ordem')

        if (errProds) throw errProds

        // Normaliza para o mesmo formato que o app já usa
        const produtosNormalizados = prods.map(p => ({
          id:        p.id,
          nome:      p.nome,
          descricao: p.descricao,
          preco:     Number(p.preco),
          imagem:    p.imagem_url,
          categoria: p.categorias?.slug,
          badge:     p.badge,
          destaque:  p.destaque,
          disponivel: p.disponivel,
          formatos:  p.formatos ?? undefined,
        }))

        const categoriasNormalizadas = cats.map(c => ({
          id:    c.slug,
          label: c.nome,
        }))

        setProdutos(produtosNormalizados)
        setCategorias(categoriasNormalizadas)

        // Salva em cache local para offline
        localStorage.setItem('cardapio_cache', JSON.stringify({
          produtos: produtosNormalizados,
          categorias: categoriasNormalizadas,
          timestamp: Date.now(),
        }))

      } catch (err) {
        console.warn('Supabase indisponível, usando cache local:', err.message)

        // Tenta o cache do localStorage (modo offline)
        const cache = localStorage.getItem('cardapio_cache')
        if (cache) {
          const { produtos: cp, categorias: cc } = JSON.parse(cache)
          setProdutos(cp)
          setCategorias(cc)
        } else {
          // Último fallback: dados estáticos
          const { cardapio, categorias: catsEstaticas } = await import('../data/cardapio')
          setProdutos(cardapio)
          setCategorias(catsEstaticas)
        }

        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    carregar()
  }, [])

  return { produtos, categorias, loading, error }
}
