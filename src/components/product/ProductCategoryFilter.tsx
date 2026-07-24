export interface ProductCategoryFilterProps {
  categories: string[]
  value: string
  onChange: (category: string) => void
}

export function ProductCategoryFilter({
  categories,
  value,
  onChange,
}: ProductCategoryFilterProps) {
  return (
    <div className="category-filter" aria-label="产品分类筛选" role="group">
      {categories.map((category) => (
        <button
          aria-pressed={value === category}
          key={category}
          onClick={() => onChange(category)}
          type="button"
        >
          {category}
        </button>
      ))}
    </div>
  )
}
