import { Router } from 'express'
import { requireAuth } from '../middleware/auth.js'
import { siteSettingsSchema, systemConfigSchema } from '../domain.js'
import type { Database } from '../types.js'

interface SettingsRow {
  brand_name: string
  legal_name: string
  logo_url: string
  phone: string
  wechat: string
  email: string
  qr_code_url: string
  quote_title: string
  quote_validity_days: number
  default_sales_note: string
}

function mapSettings(row: SettingsRow) {
  return {
    brandName: row.brand_name,
    legalName: row.legal_name,
    logoUrl: row.logo_url,
    phone: row.phone,
    wechat: row.wechat,
    email: row.email,
    qrCodeUrl: row.qr_code_url,
    quoteTitle: row.quote_title,
    quoteValidityDays: row.quote_validity_days,
    defaultSalesNote: row.default_sales_note,
  }
}

export function createSettingsRouter(db: Database) {
  const router = Router()

  router.get('/', async (_request, response, next) => {
    try {
      const result = await db.query<SettingsRow>('SELECT * FROM site_settings WHERE id = 1')
      if (!result.rows[0]) {
        response.status(503).json({ error: 'SETTINGS_NOT_INITIALIZED' })
        return
      }
      response.json({ settings: mapSettings(result.rows[0]) })
    } catch (error) {
      next(error)
    }
  })

  router.put(
    '/',
    requireAuth(['ADMIN', 'OWNER']),
    async (request, response, next) => {
      try {
        const settings = siteSettingsSchema.parse(request.body)
        const result = await db.query<SettingsRow>(
          `UPDATE site_settings SET
            brand_name=$1, legal_name=$2, logo_url=$3, phone=$4, wechat=$5,
            email=$6, qr_code_url=$7, quote_title=$8, quote_validity_days=$9,
            default_sales_note=$10, updated_at=now()
          WHERE id=1 RETURNING *`,
          [
            settings.brandName, settings.legalName, settings.logoUrl,
            settings.phone, settings.wechat, settings.email,
            settings.qrCodeUrl, settings.quoteTitle,
            settings.quoteValidityDays, settings.defaultSalesNote,
          ],
        )
        response.json({ settings: mapSettings(result.rows[0]!) })
      } catch (error) {
        next(error)
      }
    },
  )

  router.get(
    '/system',
    requireAuth(['OWNER']),
    async (_request, response, next) => {
      try {
        const result = await db.query<{
          maintenance_mode: boolean
          environment_label: string
          api_base_url: string
          updated_at: Date
        }>('SELECT * FROM system_config WHERE id = 1')
        const row = result.rows[0]
        response.json({
          config: row ? {
            maintenanceMode: row.maintenance_mode,
            environmentLabel: row.environment_label,
            apiBaseUrl: row.api_base_url,
            updatedAt: row.updated_at.toISOString(),
          } : null,
        })
      } catch (error) {
        next(error)
      }
    },
  )

  router.put(
    '/system',
    requireAuth(['OWNER']),
    async (request, response, next) => {
      try {
        const config = systemConfigSchema.parse(request.body)
        const result = await db.query<{ updated_at: Date }>(
          `UPDATE system_config SET maintenance_mode=$1, environment_label=$2,
            api_base_url=$3, updated_at=now() WHERE id=1 RETURNING updated_at`,
          [config.maintenanceMode, config.environmentLabel, config.apiBaseUrl],
        )
        response.json({
          config: { ...config, updatedAt: result.rows[0]!.updated_at.toISOString() },
        })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
