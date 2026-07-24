import { useState } from 'react'

export interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export function ProductImageGallery({
  images,
  productName,
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeImage = images[activeIndex]

  if (!activeImage) {
    return null
  }

  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <img src={activeImage} alt={`${productName} - 图片 ${activeIndex + 1}`} />
        <span>
          {String(activeIndex + 1).padStart(2, '0')} /{' '}
          {String(images.length).padStart(2, '0')}
        </span>
      </div>
      <div className="product-gallery__thumbnails" aria-label="产品图片选择">
        {images.map((image, index) => (
          <button
            aria-label={`查看第 ${index + 1} 张图片`}
            aria-pressed={index === activeIndex}
            key={`${image}-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <img src={image} alt="" />
          </button>
        ))}
      </div>
    </div>
  )
}
