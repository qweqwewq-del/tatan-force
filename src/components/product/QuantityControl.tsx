export interface QuantityControlProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  label?: string
}

export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 99,
  label = '数量',
}: QuantityControlProps) {
  const updateValue = (nextValue: number) => {
    if (Number.isSafeInteger(nextValue) && nextValue >= min && nextValue <= max) {
      onChange(nextValue)
    }
  }

  return (
    <div className="quantity-control">
      <span className="sr-only">{label}</span>
      <button
        aria-label={`减少${label}`}
        disabled={value <= min}
        onClick={() => updateValue(value - 1)}
        type="button"
      >
        −
      </button>
      <output aria-live="polite" aria-label={`${label} ${value}`}>
        {String(value).padStart(2, '0')}
      </output>
      <button
        aria-label={`增加${label}`}
        disabled={value >= max}
        onClick={() => updateValue(value + 1)}
        type="button"
      >
        +
      </button>
    </div>
  )
}
