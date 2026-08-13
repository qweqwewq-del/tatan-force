import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ProductEditorForm } from './ProductEditorForm'

describe('ProductEditorForm', () => {
  it('uploads an image before submitting the product record', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn().mockResolvedValue(undefined)
    const fetchMock = vi.mocked(fetch)

    render(
      <ProductEditorForm
        product={null}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    )

    await user.type(screen.getByLabelText('产品名称'), '测试深蹲架')
    await user.type(screen.getByLabelText('SKU'), 'TF-TEST-001')
    await user.type(screen.getByLabelText('材质'), '高强度钢材')
    await user.type(screen.getByLabelText('尺寸'), '1200 × 800 × 2200mm')
    await user.type(screen.getByLabelText('重量'), '约 120kg')
    const priceInput = screen.getByLabelText('参考价格（元）')
    await user.clear(priceInput)
    await user.type(priceInput, '12000')
    await user.type(screen.getByLabelText('交付周期'), '15 天')
    await user.type(screen.getByLabelText('产品简介'), '商用测试训练架')
    await user.type(screen.getByLabelText('详细描述'), '用于回归验证的完整商品描述。')
    await user.type(screen.getByLabelText('规格参数（每行：名称=数值）'), '承重=600kg')

    const file = new File(['test-image'], 'rack.png', { type: 'image/png' })
    await user.upload(
      screen.getByLabelText(/上传产品图片/),
      file,
    )

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/uploads',
      expect.objectContaining({
        body: expect.any(FormData),
        credentials: 'include',
        method: 'POST',
      }),
    )

    await waitFor(() => {
      expect(screen.queryByText('图片上传中，请稍候。')).not.toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: '保存产品' }))

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.objectContaining({
        images: ['/uploads/2026-08/test-product-image.png'],
        sku: 'TF-TEST-001',
      }))
    })
  })

  it('rejects direct browser image data instead of trying to save it', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <ProductEditorForm
        product={{
          id: 'product-direct-data',
          slug: 'product-direct-data',
          sku: 'TF-DATA-001',
          name: '测试产品',
          brand: 'TATAN FORCE',
          category: '训练架',
          summary: '测试简介',
          description: '测试详细描述',
          images: ['data:image/png;base64,unsafe'],
          material: '钢材',
          dimensions: '1000mm',
          weight: '100kg',
          specifications: [{ id: 'capacity', label: '承重', value: '500kg' }],
          features: [],
          useCases: [],
          price: 100000,
          priceVisible: true,
          leadTime: '15 天',
          status: 'active',
        }}
        onCancel={vi.fn()}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByRole('button', { name: '保存产品' }))

    expect(screen.getByRole('alert')).toHaveTextContent('请重新选择图片上传')
    expect(onSave).not.toHaveBeenCalled()
  })
})
