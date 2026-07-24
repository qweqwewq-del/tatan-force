export interface ProductSceneSectionProps {
  scenes: string[]
  image?: string
}

export function ProductSceneSection({
  scenes,
  image,
}: ProductSceneSectionProps) {
  return (
    <section className="product-scenes">
      {image && (
        <div className="product-scenes__media">
          <img src={image} alt="" />
        </div>
      )}
      <div className="product-scenes__content">
        <p>APPLICATION / 应用场景</p>
        <ul>
          {scenes.map((scene) => (
            <li key={scene}>{scene}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
