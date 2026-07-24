import { useMemo, useState } from 'react'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { EmptyState } from '../../components/common/EmptyState'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ProductCard } from '../../components/product/ProductCard'
import { ProductCategoryFilter } from '../../components/product/ProductCategoryFilter'
import { useProducts } from '../../features/catalog/useProducts'

const allProducts = '全部产品'
const categories = [allProducts, '力量训练设备', '自由重量', '杠铃片', '训练架']

function matchesCategory(productCategory: string, selectedCategory: string) {
  if (selectedCategory === allProducts) {
    return true
  }

  if (selectedCategory === '自由重量') {
    return productCategory === '杠铃片'
  }

  return productCategory === selectedCategory
}

export function ProductListingPage() {
  const { products } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState(allProducts)
  const filteredProducts = useMemo(
    () =>
      products.filter((product) =>
        matchesCategory(product.category, selectedCategory),
      ),
    [products, selectedCategory],
  )

  useDocumentMeta(
    '产品中心｜TATAN FORCE',
    '浏览 TATAN FORCE 力量训练设备、杠铃片、训练架与专业健身器材。',
  )

  return (
    <div className="product-listing-page page-enter">
      <header className="catalog-masthead">
        <div className="container">
          <p>CATALOG / 2026</p>
          <h1>产品中心</h1>
          <span>工业级力量训练装备目录</span>
        </div>
      </header>

      <section className="section-shell catalog-section" aria-labelledby="catalog-title">
        <div className="container">
          <SectionHeader
            eyebrow="EQUIPMENT INDEX"
            title="按训练需求筛选"
            description={`当前显示 ${filteredProducts.length} / ${products.length} 项产品`}
          />
          <div className="catalog-toolbar" id="catalog-title">
            <ProductCategoryFilter
              categories={categories}
              value={selectedCategory}
              onChange={setSelectedCategory}
            />
            <p aria-live="polite">
              <span>{String(filteredProducts.length).padStart(2, '0')}</span>
              项结果
            </p>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="catalog-grid" data-testid="product-grid">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} priority={index < 3} product={product} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="该分类暂无产品"
              description="当前筛选条件下没有可展示的设备，请切换其他分类。"
            />
          )}
        </div>
      </section>
    </div>
  )
}
