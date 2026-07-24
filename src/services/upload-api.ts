import { apiRequest } from './api-client'

export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', file)
  const response = await apiRequest<{ file: { url: string } }>('/uploads', {
    method: 'POST',
    body,
  })
  return response.file.url
}
