import { useMemo, useState } from 'react'
import { ProductEditorForm } from '../../components/admin/ProductEditorForm'
import { IndustrialButton } from '../../components/common/IndustrialButton'
import { Modal } from '../../components/common/Modal'
import { Toast } from '../../components/common/Toast'
import { useProducts } from '../../features/catalog/useProducts'
import { centToYuan } from '../../features/inquiry/money'
import type { Product } from '../../models/product'
import {
  createProduct,
  removeProduct,
  saveProduct,
} from '../../services/product-api'
import { ApiError } from '../../services/api-client'

function productRequestMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.code === 'VALIDATION_ERROR') {
      return '产品资料不符合要求：请检查名称、SKU、规格、价格与图片后重新保存。'
    }
    if (error.code === 'DUPLICATE_RECORD') {
      return 'SKU 或产品链接已存在，请修改 SKU 后重试。'
    }
    if (error.code === 'UNAUTHENTICATED') {
      return '登录状态已失效，请重新登录后台。'
    }
  }
  return '产品保存失败，请检查网络后重试。'
}

export function AdminProductsPage() {
  const { products, setProducts } = useProducts(true)
  const [editingProduct, setEditingProduct] = useState<Product | null | undefined>()
  const [query, setQuery] = useState('')
  const [message, setMessage] = useState('')
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        `${product.name}${product.sku}${product.category}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [products, query],
  )

  function closeEditor() {
    setEditingProduct(undefined)
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="eyebrow">CATALOG CONTROL / 01</p>
          <h1>商品管理</h1>
          <span>高级工业设备目录管理</span>
        </div>
        <IndustrialButton onClick={() => setEditingProduct(null)}>
          新增商品
        </IndustrialButton>
      </header>

      <div className="admin-toolbar">
        <label className="admin-search">
          <span>搜索商品</span>
          <input
            placeholder="名称 / SKU / 分类"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <p><strong>{filteredProducts.length}</strong> 项设备</p>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>分类</th>
              <th>价格</th>
              <th>规格摘要</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="admin-product-cell">
                    <img src={product.images[0]} alt="" />
                    <div><strong>{product.name}</strong><span>{product.sku}</span></div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>¥{centToYuan(product.price)}</td>
                <td>{product.material}<br />{product.dimensions}</td>
                <td>
                  <button
                    className={`status-switch status-switch--${product.status}`}
                    onClick={async () => {
                      const nextStatus =
                        product.status === 'active' ? 'draft' : 'active'
                      try {
                        const saved = await saveProduct({ ...product, status: nextStatus })
                        setProducts((current) =>
                          current.map((item) => item.id === saved.id ? saved : item),
                        )
                        setMessage(nextStatus === 'active' ? '产品已上架。' : '产品已下架。')
                      } catch (error) {
                        setMessage(productRequestMessage(error))
                      }
                    }}
                    type="button"
                  >
                    {product.status === 'active' ? '已上架' : '已下架'}
                  </button>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button onClick={() => setEditingProduct(product)} type="button">编辑</button>
                    <button
                      onClick={async () => {
                        if (window.confirm(`确认删除“${product.name}”？`)) {
                          try {
                            await removeProduct(product.id)
                            setProducts((current) =>
                              current.filter((item) => item.id !== product.id),
                            )
                            setMessage('产品已删除。')
                          } catch (error) {
                            setMessage(productRequestMessage(error))
                          }
                        }
                      }}
                      type="button"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        onClose={closeEditor}
        open={editingProduct !== undefined}
        title={editingProduct ? `编辑：${editingProduct.name}` : '新增商品'}
      >
        <ProductEditorForm
          product={editingProduct ?? null}
          onCancel={closeEditor}
          onSave={async (product) => {
            try {
              const exists = products.some((item) => item.id === product.id)
              const saved = exists
                ? await saveProduct(product)
                : await createProduct(product)
              setProducts((current) => exists
                ? current.map((item) => item.id === saved.id ? saved : item)
                : [...current, saved])
              setMessage('产品资料已保存。')
              closeEditor()
            } catch (error) {
              throw new Error(productRequestMessage(error))
            }
          }}
        />
      </Modal>
      {message && <div className="admin-toast"><Toast message={message} onDismiss={() => setMessage('')} /></div>}
    </section>
  )
}
