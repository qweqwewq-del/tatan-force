import { Link, useParams } from 'react-router-dom'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { ErrorState } from '../../components/common/ErrorState'
import { SectionHeader } from '../../components/common/SectionHeader'
import { InquiryAddButton } from '../../components/product/InquiryAddButton'
import { ProductFeatureList } from '../../components/product/ProductFeatureList'
import { ProductImageGallery } from '../../components/product/ProductImageGallery'
import { ProductSceneSection } from '../../components/product/ProductSceneSection'
import { ProductSpecTable } from '../../components/product/ProductSpecTable'
import { centToYuan } from '../../features/inquiry/money'
import { useProduct } from '../../features/catalog/useProducts'
import type { SpecItem } from '../../models/product'

export function ProductDetailPage() {
  const { slug = '' } = useParams()
  const { product, loading } = useProduct(slug)

  useDocumentMeta(
    product ? `${product.name}｜TATAN FORCE` : '产品未找到｜TATAN FORCE',
    product?.summary ?? '未找到对应的 TATAN FORCE 产品。',
  )

  if (!product && loading) {
    return <div className="container product-not-found">正在加载产品数据…</div>
  }

  if (!product) {
    return (
      <div className="container product-not-found">
        <ErrorState
          title="未找到该产品"
          message="产品链接可能已变更，请返回产品中心查看当前设备目录。"
        />
        <Link className="industrial-link industrial-link--primary" to="/products">
          返回产品中心
        </Link>
      </div>
    )
  }

  const technicalSpecs: SpecItem[] = [
    { id: 'material', label: '材质', value: product.material },
    { id: 'dimensions', label: '尺寸', value: product.dimensions },
    { id: 'weight', label: '重量', value: product.weight },
    ...product.specifications,
  ]

  return (
    <article className="product-detail-page page-enter">
      <header className="product-detail-hero">
        <div className="container product-detail-hero__grid">
          <div className="product-detail-hero__gallery">
            <ProductImageGallery images={product.images} productName={product.name} />
          </div>
          <div className="product-detail-hero__content">
            <div className="product-detail-hero__index">
              <span>{product.category}</span>
              <span>{product.sku}</span>
            </div>
            <p className="eyebrow">{product.brand} / PROFESSIONAL EQUIPMENT</p>
            <h1>{product.name}</h1>
            <p className="product-detail-hero__summary">{product.summary}</p>
            <p className="product-detail-hero__description">{product.description}</p>
            <dl className="product-detail-quick-specs">
              <div><dt>材质</dt><dd>{product.material}</dd></div>
              <div><dt>尺寸</dt><dd>{product.dimensions}</dd></div>
              <div><dt>重量</dt><dd>{product.weight}</dd></div>
              <div><dt>交付周期</dt><dd>{product.leadTime}</dd></div>
            </dl>
            <div className="product-detail-hero__purchase">
              <div>
                <span>{product.priceVisible ? '参考价格' : '项目价格'}</span>
                <strong>
                  {product.priceVisible ? `¥${centToYuan(product.price)}` : '询价获取'}
                </strong>
              </div>
              <InquiryAddButton fullWidth product={product} />
            </div>
            <p className="product-detail-hero__note">
              最终价格根据规格、数量、运输与安装需求核算。
            </p>
          </div>
        </div>
      </header>

      <section className="section-shell" aria-labelledby="specifications-title">
        <div className="container product-detail-section">
          <SectionHeader
            eyebrow="TECHNICAL DATA / 技术参数"
            title="设备规格"
            description="结构、材料与关键性能参数均来自产品数据模型。"
          />
          <div id="specifications-title">
            <ProductSpecTable specifications={technicalSpecs} />
          </div>
        </div>
      </section>

      <section className="section-shell product-detail-features" aria-labelledby="features-title">
        <div className="container product-detail-section">
          <SectionHeader
            eyebrow="ENGINEERED ADVANTAGES / 产品优势"
            title="为高频训练环境设计"
          />
          <div id="features-title">
            <ProductFeatureList features={product.features} />
          </div>
        </div>
      </section>

      <section className="section-shell" aria-labelledby="product-scenes-title">
        <div className="container product-detail-section">
          <SectionHeader
            eyebrow="APPLICATION / 应用场景"
            title="适配专业训练空间"
          />
          <div id="product-scenes-title">
            <ProductSceneSection image={product.images[0]} scenes={product.useCases} />
          </div>
        </div>
      </section>

      <section className="product-detail-cta">
        <div className="container product-detail-cta__inner">
          <div>
            <p className="eyebrow">PROJECT INQUIRY</p>
            <h2>需要完整规格或项目报价？</h2>
            <p>将产品加入询价清单，我们会根据数量和交付需求联系你。</p>
          </div>
          <InquiryAddButton product={product} />
        </div>
      </section>
    </article>
  )
}
