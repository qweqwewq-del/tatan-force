import { useState, type ChangeEvent, type FormEvent } from 'react'
import { centToYuan, yuanToCent } from '../../features/inquiry/money'
import type { Product, SpecItem } from '../../models/product'
import { uploadImage } from '../../services/upload-api'
import { IndustrialButton } from '../common/IndustrialButton'

interface ProductEditorFormProps {
  product: Product | null
  onCancel: () => void
  onSave: (product: Product) => Promise<void> | void
}

function slugify(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return normalized || `product-${Date.now()}`
}

function parseLines(value: string) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function parseSpecifications(value: string): SpecItem[] {
  return parseLines(value).map((line, index) => {
    const [label, ...rest] = line.split('=')
    return {
      id: `spec-${index + 1}`,
      label: label.trim(),
      value: rest.join('=').trim() || '待补充',
    }
  })
}

export function ProductEditorForm({
  product,
  onCancel,
  onSave,
}: ProductEditorFormProps) {
  const [name, setName] = useState(product?.name ?? '')
  const [sku, setSku] = useState(product?.sku ?? '')
  const [category, setCategory] = useState(product?.category ?? '力量训练设备')
  const [summary, setSummary] = useState(product?.summary ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [material, setMaterial] = useState(product?.material ?? '')
  const [dimensions, setDimensions] = useState(product?.dimensions ?? '')
  const [weight, setWeight] = useState(product?.weight ?? '')
  const [price, setPrice] = useState(
    product ? centToYuan(product.price) : '0.00',
  )
  const [leadTime, setLeadTime] = useState(product?.leadTime ?? '')
  const [status, setStatus] = useState<Product['status']>(
    product?.status ?? 'draft',
  )
  const [image, setImage] = useState(product?.images[0] ?? '')
  const [specifications, setSpecifications] = useState(
    product?.specifications
      .map((item) => `${item.label}=${item.value}${item.unit ?? ''}`)
      .join('\n') ?? '',
  )
  const [features, setFeatures] = useState(product?.features.join('\n') ?? '')
  const [useCases, setUseCases] = useState(product?.useCases.join('\n') ?? '')
  const [error, setError] = useState('')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) {
      setError('请选择 JPG、PNG 或 WebP 格式且不超过 8MB 的图片文件。')
      return
    }

    setUploadingImage(true)
    setError('')
    try {
      setImage(await uploadImage(file))
    } catch {
      setError('图片上传失败，请确认已登录后台后重试。')
    } finally {
      setUploadingImage(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      if (uploadingImage) {
        setError('图片正在上传，请稍候再保存产品。')
        return
      }

      const parsedSpecs = parseSpecifications(specifications)

      if (!image || parsedSpecs.length === 0) {
        setError('请提供产品图片，并至少填写一项规格参数。')
        return
      }

      if (image.startsWith('data:')) {
        setError('请重新选择图片上传，不支持把图片直接写入产品资料。')
        return
      }

      setSaving(true)
      await onSave({
        id: product?.id ?? `product-${Date.now()}`,
        slug: product?.slug ?? slugify(`${sku}-${name}`),
        sku: sku.trim(),
        name: name.trim(),
        brand: product?.brand ?? 'TATAN FORCE',
        category,
        summary: summary.trim(),
        description: description.trim(),
        images: [image, ...(product?.images.slice(1) ?? [])],
        material: material.trim(),
        dimensions: dimensions.trim(),
        weight: weight.trim(),
        specifications: parsedSpecs,
        features: parseLines(features),
        useCases: parseLines(useCases),
        price: yuanToCent(price),
        priceVisible: product?.priceVisible ?? true,
        leadTime: leadTime.trim(),
        status,
      })
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : '产品保存失败，请检查必填字段后重试。',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="admin-form product-editor" onSubmit={handleSubmit}>
      <div className="admin-form__grid">
        <label className="admin-field">
          <span>产品名称</span>
          <input required value={name} onChange={(event) => setName(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>SKU</span>
          <input required value={sku} onChange={(event) => setSku(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>产品分类</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option>力量训练设备</option>
            <option>自由重量</option>
            <option>杠铃片</option>
            <option>训练架</option>
            <option>商业设备</option>
            <option>存储设备</option>
          </select>
        </label>
        <label className="admin-field">
          <span>状态</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as Product['status'])}
          >
            <option value="active">已上架</option>
            <option value="draft">已下架</option>
          </select>
        </label>
        <label className="admin-field">
          <span>材质</span>
          <input required value={material} onChange={(event) => setMaterial(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>尺寸</span>
          <input required value={dimensions} onChange={(event) => setDimensions(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>重量</span>
          <input required value={weight} onChange={(event) => setWeight(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>参考价格（元）</span>
          <input inputMode="decimal" required value={price} onChange={(event) => setPrice(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>交付周期</span>
          <input required value={leadTime} onChange={(event) => setLeadTime(event.target.value)} />
        </label>
        <label className="admin-field">
          <span>产品图片 URL</span>
          <input value={image} onChange={(event) => setImage(event.target.value)} />
        </label>
      </div>
      <label className="admin-field">
        <span>上传产品图片（JPG / PNG / WebP，不超过 8MB）</span>
        <input accept="image/jpeg,image/png,image/webp" disabled={uploadingImage || saving} onChange={handleImageFile} type="file" />
      </label>
      {uploadingImage && <p className="admin-form__notice" role="status">图片上传中，请稍候。</p>}
      {image && <img className="product-editor__preview" src={image} alt="产品图片预览" />}
      <label className="admin-field">
        <span>产品简介</span>
        <textarea required rows={2} value={summary} onChange={(event) => setSummary(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>详细描述</span>
        <textarea required rows={4} value={description} onChange={(event) => setDescription(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>规格参数（每行：名称=数值）</span>
        <textarea required rows={5} value={specifications} onChange={(event) => setSpecifications(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>产品优势（每行一项）</span>
        <textarea rows={4} value={features} onChange={(event) => setFeatures(event.target.value)} />
      </label>
      <label className="admin-field">
        <span>应用场景（每行一项）</span>
        <textarea rows={3} value={useCases} onChange={(event) => setUseCases(event.target.value)} />
      </label>
      {error && <p className="admin-form__error" role="alert">{error}</p>}
      <div className="admin-form__actions">
        <IndustrialButton disabled={uploadingImage || saving} type="submit">{saving ? '保存中…' : '保存产品'}</IndustrialButton>
        <IndustrialButton disabled={uploadingImage || saving} onClick={onCancel} variant="outline">取消</IndustrialButton>
      </div>
    </form>
  )
}
