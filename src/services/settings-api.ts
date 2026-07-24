import type { SiteSettings } from '../data/settings.mock'
import type { SystemConfig } from '../models/admin'
import { apiRequest } from './api-client'

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const response = await apiRequest<{ settings: SiteSettings }>('/settings')
  return response.settings
}

export async function updateSiteSettings(
  settings: SiteSettings,
): Promise<SiteSettings> {
  const response = await apiRequest<{ settings: SiteSettings }>('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  })
  return response.settings
}

export async function fetchSystemConfig(): Promise<SystemConfig> {
  const response = await apiRequest<{ config: SystemConfig }>('/settings/system')
  return response.config
}

export async function updateSystemConfig(
  config: Omit<SystemConfig, 'updatedAt'>,
): Promise<SystemConfig> {
  const response = await apiRequest<{ config: SystemConfig }>('/settings/system', {
    method: 'PUT',
    body: JSON.stringify(config),
  })
  return response.config
}
