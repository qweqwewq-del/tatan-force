import { useState, type FormEvent } from 'react'
import type { Customer } from '../../models/inquiry'
import { IndustrialButton } from '../common/IndustrialButton'

export interface CustomerFormProps {
  initialValue?: Partial<Customer>
  onSubmit: (customer: Customer) => void
  submitLabel?: string
}

type CustomerErrors = Partial<Record<keyof Customer, string>>

const emptyCustomer: Customer = {
  name: '',
  phone: '',
  wechat: '',
  company: '',
  address: '',
  email: '',
  note: '',
}

function validateCustomer(customer: Customer): CustomerErrors {
  const errors: CustomerErrors = {}

  if (customer.name.trim().length < 2) {
    errors.name = '请输入至少 2 个字符的姓名'
  }

  if (!/^1\d{10}$/.test(customer.phone.replaceAll(/\s|-/g, ''))) {
    errors.phone = '请输入有效的 11 位手机号码'
  }

  if (
    customer.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)
  ) {
    errors.email = '请输入有效的邮箱地址'
  }

  return errors
}

export function CustomerForm({
  initialValue,
  onSubmit,
  submitLabel = '确认客户资料',
}: CustomerFormProps) {
  const [customer, setCustomer] = useState<Customer>({
    ...emptyCustomer,
    ...initialValue,
  })
  const [errors, setErrors] = useState<CustomerErrors>({})

  const updateField = (field: keyof Customer, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const validationErrors = validateCustomer(customer)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        ...customer,
        name: customer.name.trim(),
        phone: customer.phone.trim(),
      })
    }
  }

  const fields: Array<{
    key: keyof Customer
    label: string
    required?: boolean
    type?: string
    autoComplete?: string
  }> = [
    { key: 'name', label: '姓名', required: true, autoComplete: 'name' },
    { key: 'phone', label: '手机', required: true, type: 'tel', autoComplete: 'tel' },
    { key: 'wechat', label: '微信' },
    { key: 'company', label: '公司', autoComplete: 'organization' },
    { key: 'address', label: '地址', autoComplete: 'street-address' },
    { key: 'email', label: '邮箱', type: 'email', autoComplete: 'email' },
  ]

  return (
    <form className="customer-form" noValidate onSubmit={handleSubmit}>
      <div className="customer-form__grid">
        {fields.map((field) => (
          <label className="form-field" key={field.key}>
            <span>
              {field.label}
              {field.required && <b aria-hidden="true"> *</b>}
            </span>
            <input
              aria-invalid={Boolean(errors[field.key])}
              aria-required={field.required}
              autoComplete={field.autoComplete}
              name={field.key}
              onChange={(event) => updateField(field.key, event.target.value)}
              type={field.type ?? 'text'}
              value={customer[field.key] ?? ''}
            />
            {errors[field.key] && (
              <small role="alert">{errors[field.key]}</small>
            )}
          </label>
        ))}
      </div>
      <label className="form-field form-field--wide">
        <span>备注</span>
        <textarea
          name="note"
          onChange={(event) => updateField('note', event.target.value)}
          rows={5}
          value={customer.note ?? ''}
        />
      </label>
      <IndustrialButton type="submit">{submitLabel}</IndustrialButton>
    </form>
  )
}
