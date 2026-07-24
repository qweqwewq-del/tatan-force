import {
  siteSettings as defaultSiteSettings,
  type SiteSettings,
} from '../data/settings.mock'
import type { SystemConfig } from '../models/admin'

export const SITE_SETTINGS_STORAGE_KEY = 'tatan-force-site-settings'
export const SYSTEM_CONFIG_STORAGE_KEY = 'tatan-force-system-config'
const STORAGE_VERSION = 1

interface StoredSettings {
  version: typeof STORAGE_VERSION
  settings: SiteSettings
}

interface StoredSystemConfig {
  version: typeof STORAGE_VERSION
  config: SystemConfig
}

const defaultSystemConfig: SystemConfig = {
  maintenanceMode: false,
  environmentLabel: 'LOCAL FRONTEND',
  apiBaseUrl: '/api',
  updatedAt: new Date(0).toISOString(),
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage
  } catch {
    return null
  }
}

function isSiteSettings(value: unknown): value is SiteSettings {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const settings = value as Record<string, unknown>
  return (
    typeof settings.brandName === 'string' &&
    typeof settings.legalName === 'string' &&
    typeof settings.logoUrl === 'string' &&
    typeof settings.phone === 'string' &&
    typeof settings.wechat === 'string' &&
    typeof settings.email === 'string' &&
    typeof settings.qrCodeUrl === 'string' &&
    typeof settings.quoteTitle === 'string' &&
    Number.isSafeInteger(settings.quoteValidityDays) &&
    typeof settings.defaultSalesNote === 'string'
  )
}

function isSystemConfig(value: unknown): value is SystemConfig {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const config = value as Record<string, unknown>
  return (
    typeof config.maintenanceMode === 'boolean' &&
    typeof config.environmentLabel === 'string' &&
    typeof config.apiBaseUrl === 'string' &&
    typeof config.updatedAt === 'string'
  )
}

export function readSiteSettings(): SiteSettings {
  const storage = getStorage()

  if (!storage) {
    return { ...defaultSiteSettings }
  }

  try {
    const raw = storage.getItem(SITE_SETTINGS_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    const record =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null

    return record?.version === STORAGE_VERSION &&
      isSiteSettings(record.settings)
      ? { ...record.settings }
      : { ...defaultSiteSettings }
  } catch {
    return { ...defaultSiteSettings }
  }
}

export function saveSiteSettings(settings: SiteSettings): boolean {
  const storage = getStorage()

  if (!storage || !isSiteSettings(settings)) {
    return false
  }

  try {
    storage.setItem(
      SITE_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        version: STORAGE_VERSION,
        settings,
      } satisfies StoredSettings),
    )
    return true
  } catch {
    return false
  }
}

export function readSystemConfig(): SystemConfig {
  const storage = getStorage()

  if (!storage) {
    return { ...defaultSystemConfig }
  }

  try {
    const raw = storage.getItem(SYSTEM_CONFIG_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    const record =
      typeof parsed === 'object' && parsed !== null
        ? (parsed as Record<string, unknown>)
        : null
    return record?.version === STORAGE_VERSION &&
      isSystemConfig(record.config)
      ? { ...record.config }
      : { ...defaultSystemConfig }
  } catch {
    return { ...defaultSystemConfig }
  }
}

export function saveSystemConfig(
  config: Omit<SystemConfig, 'updatedAt'>,
): SystemConfig {
  const nextConfig: SystemConfig = {
    ...config,
    updatedAt: new Date().toISOString(),
  }
  const storage = getStorage()

  if (storage) {
    try {
      storage.setItem(
        SYSTEM_CONFIG_STORAGE_KEY,
        JSON.stringify({
          version: STORAGE_VERSION,
          config: nextConfig,
        } satisfies StoredSystemConfig),
      )
    } catch {
      return readSystemConfig()
    }
  }

  return nextConfig
}
