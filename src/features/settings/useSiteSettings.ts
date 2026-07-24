import { useCallback, useEffect, useState } from 'react'
import {
  siteSettings as defaultSettings,
  type SiteSettings,
} from '../../data/settings.mock'
import { fetchSiteSettings } from '../../services/settings-api'

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    setLoading(true)
    try {
      setSettings(await fetchSiteSettings())
      setError('')
    } catch {
      setError('网站设置加载失败。')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    fetchSiteSettings()
      .then((nextSettings) => {
        if (active) {
          setSettings(nextSettings)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('网站设置加载失败。')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return { settings, setSettings, loading, error, reload }
}
