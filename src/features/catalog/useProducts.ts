import { useCallback, useEffect, useState } from 'react'
import { products as mockProducts } from '../../data/products.mock'
import type { Product } from '../../models/product'
import { fetchProduct, fetchProducts } from '../../services/product-api'

const testProducts = import.meta.env.MODE === 'test' ? mockProducts : []

export function useProducts(admin = false) {
  const [products, setProducts] = useState<Product[]>(testProducts)
  const [loading, setLoading] = useState(testProducts.length === 0)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setProducts(await fetchProducts(admin))
      setError('')
    } catch {
      setError('产品数据加载失败，请稍后重试。')
    } finally {
      setLoading(false)
    }
  }, [admin])

  useEffect(() => {
    let active = true
    fetchProducts(admin)
      .then((nextProducts) => {
        if (active) {
          setProducts(nextProducts)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('产品数据加载失败，请稍后重试。')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [admin])

  return { products, setProducts, loading, error, reload }
}

export function useProduct(slug: string) {
  const isTest = import.meta.env.MODE === 'test'
  const initial = isTest
    ? mockProducts.find((product) => product.slug === slug) ?? null
    : null
  const [product, setProduct] = useState<Product | null>(initial)
  const [loading, setLoading] = useState(isTest ? false : !initial)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchProduct(slug)
      .then((nextProduct) => {
        if (active) {
          setProduct(nextProduct)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('产品数据加载失败。')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slug])

  return { product, loading, error }
}
