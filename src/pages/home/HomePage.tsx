import { Link } from 'react-router-dom'
import heroImage from '../../assets/figma/homepage-hero.png'
import { SectionHeader } from '../../components/common/SectionHeader'
import { ProductCard } from '../../components/product/ProductCard'
import { ProductSceneSection } from '../../components/product/ProductSceneSection'
import { useDocumentMeta } from '../../app/useDocumentMeta'
import { useProducts } from '../../features/catalog/useProducts'
import { useSiteSettings } from '../../features/settings/useSiteSettings'

const advantages = [
  {
    code: '01',
    title: '专业制造',
    description: '从结构设计、焊接工艺到整机装配，建立稳定的商业级制造标准。',
  },
  {
    code: '02',
    title: '高强度材料',
    description: '精选厚壁钢材、耐磨橡胶与高强度连接件，应对高频训练负荷。',
  },
  {
    code: '03',
    title: '商业级设备',
    description: '围绕健身房日常运营与安全要求，提供耐用、易维护的设备方案。',
  },
  {
    code: '04',
    title: '定制解决方案',
    description: '根据空间、预算与训练目标，完成设备组合和场地配置建议。',
  },
]

const proofPoints = [
  ['100+', '产品系列'],
  ['3000+', '合作健身房'],
  ['50+', '国家和地区'],
  ['10万+ m²', '生产制造基地'],
  ['ISO / CE', '国际认证标准'],
]

export function HomePage() {
  const { products: allProducts } = useProducts()
  const products = allProducts.slice(0, 5)
  const { settings: siteSettings } = useSiteSettings()
  useDocumentMeta(
    'TATAN FORCE｜专业力量训练装备',
    'TATAN FORCE 泰坦引擎体育，为家庭训练空间、商业健身房与专业体能中心提供高性能力量训练装备。',
  )

  return (
    <div className="home-page page-enter">
      <section className="home-hero" aria-labelledby="home-hero-title">
        <div className="home-hero__visual" aria-hidden="true">
          <img src={heroImage} alt="" fetchPriority="high" />
        </div>
        <div className="container home-hero__inner">
          <div className="home-hero__copy">
            <p className="home-hero__brand">TATAN FORCE</p>
            <h1 id="home-hero-title">专业力量训练装备</h1>
            <span className="home-hero__rule" aria-hidden="true" />
            <p className="home-hero__description">
              专业健身器材解决方案。
              <br />
              为家庭健身空间、商业健身房及专业体育场景提供可靠装备。
            </p>
            <div className="home-hero__actions">
              <Link className="industrial-link industrial-link--primary" to="/products">
                浏览产品 <span aria-hidden="true">→</span>
              </Link>
              <Link className="industrial-link industrial-link--outline" to="/inquiry">
                立即询价 <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="home-hero__assurances" aria-label="品牌服务优势">
              <li><strong>专业品质</strong><span>严格制造标准</span></li>
              <li><strong>高强商用</strong><span>更长使用寿命</span></li>
              <li><strong>场景方案</strong><span>覆盖多元需求</span></li>
              <li><strong>全国服务</strong><span>专业交付保障</span></li>
            </ul>
          </div>
        </div>
      </section>

      <section className="home-products section-shell" aria-labelledby="featured-title">
        <div className="container">
          <SectionHeader
            eyebrow="CORE EQUIPMENT / 核心产品"
            title="为高强度训练而生"
            description="五个核心品类覆盖自由重量、训练架、卧推与专业收纳。"
            action={
              <Link className="section-text-link" to="/products">
                查看全部产品 →
              </Link>
            }
          />
          <div className="home-featured-grid" id="featured-title">
            {products.map((product, index) => (
              <ProductCard key={product.id} priority={index < 2} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="home-proof" aria-label="品牌规模">
        <div className="container home-proof__grid">
          {proofPoints.map(([value, label]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="section-shell" aria-labelledby="advantages-title">
        <div className="container">
          <SectionHeader
            eyebrow="ENGINEERING / 品牌优势"
            title="从材料到交付的工程标准"
            description="围绕强度、耐用性与场景适配，建立可长期使用的专业装备体系。"
          />
          <div className="advantage-grid" id="advantages-title">
            {advantages.map((advantage) => (
              <article key={advantage.code}>
                <span>{advantage.code}</span>
                <h3>{advantage.title}</h3>
                <p>{advantage.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell home-scenes" aria-labelledby="scenes-title">
        <div className="container">
          <SectionHeader
            eyebrow="APPLICATION / 应用场景"
            title="匹配不同训练空间"
            description="从个人训练到商业运营，让设备配置与真实使用需求保持一致。"
          />
          <div id="scenes-title">
            <ProductSceneSection
              image={products.at(-1)?.images[0] ?? heroImage}
              scenes={['家庭训练空间', '商业健身房', '专业训练中心']}
            />
          </div>
        </div>
      </section>

      <section className="home-contact section-shell" aria-labelledby="contact-title">
        <div className="container home-contact__panel">
          <div>
            <p className="eyebrow">CONTACT / 商务咨询</p>
            <h2 id="contact-title">为你的训练空间配置专业装备</h2>
            <p>提供产品选型、空间配置与项目报价支持。</p>
          </div>
          <dl>
            <div><dt>电话</dt><dd><a href={`tel:${siteSettings.phone}`}>{siteSettings.phone}</a></dd></div>
            <div><dt>微信</dt><dd>{siteSettings.wechat}</dd></div>
            <div><dt>邮箱</dt><dd><a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a></dd></div>
          </dl>
          <figure>
            <img src={siteSettings.qrCodeUrl} alt="TATAN FORCE 微信咨询二维码" />
            <figcaption>扫码联系销售顾问</figcaption>
          </figure>
        </div>
      </section>
    </div>
  )
}
