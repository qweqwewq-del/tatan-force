import { useEffect } from 'react'

export function useDocumentMeta(title: string, description: string) {
  useEffect(() => {
    const previousTitle = document.title
    const descriptionElement =
      document.querySelector<HTMLMetaElement>('meta[name="description"]')
    const previousDescription = descriptionElement?.content
    const meta =
      descriptionElement ?? document.head.appendChild(document.createElement('meta'))

    meta.name = 'description'
    document.title = title
    meta.content = description

    return () => {
      document.title = previousTitle

      if (descriptionElement && previousDescription !== undefined) {
        descriptionElement.content = previousDescription
      } else {
        meta.remove()
      }
    }
  }, [description, title])
}
