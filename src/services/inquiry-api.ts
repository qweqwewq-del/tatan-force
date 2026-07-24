import type { Customer, Inquiry, InquiryItem, InquiryStatus } from '../models/inquiry'
import { apiRequest } from './api-client'

export async function submitInquiry(
  customer: Customer,
  items: readonly InquiryItem[],
): Promise<Inquiry> {
  const response = await apiRequest<{ inquiry: Inquiry }>('/inquiries', {
    method: 'POST',
    body: JSON.stringify({
      customer,
      items: items.map(({ productId, quantity, specification, note }) => ({
        productId,
        quantity,
        ...(specification ? { specification } : {}),
        ...(note ? { note } : {}),
      })),
    }),
  })
  return response.inquiry
}

export async function fetchAdminInquiries(): Promise<Inquiry[]> {
  const response = await apiRequest<{ inquiries: Inquiry[] }>('/inquiries/admin')
  return response.inquiries
}

export async function changeInquiryStatus(
  id: string,
  status: InquiryStatus,
): Promise<void> {
  await apiRequest(`/inquiries/admin/${encodeURIComponent(id)}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  })
}
