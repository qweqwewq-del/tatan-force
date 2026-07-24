export interface ProductFeatureListProps {
  features: string[]
}

export function ProductFeatureList({ features }: ProductFeatureListProps) {
  return (
    <ol className="feature-list">
      {features.map((feature, index) => (
        <li key={feature}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{feature}</strong>
        </li>
      ))}
    </ol>
  )
}
