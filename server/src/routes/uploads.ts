import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import type { FileStorage } from '../storage/index.js'

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
])

export function createUploadsRouter(storage: FileStorage) {
  const router = Router()
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    fileFilter(_request, file, callback) {
      callback(null, allowedMimeTypes.has(file.mimetype))
    },
  })

  router.post(
    '/',
    requireAuth(['ADMIN', 'OWNER']),
    upload.single('file'),
    async (request, response, next) => {
      try {
        if (!request.file) {
          response.status(400).json({ error: 'IMAGE_FILE_REQUIRED' })
          return
        }
        response.status(201).json({ file: await storage.put(request.file) })
      } catch (error) {
        next(error)
      }
    },
  )

  return router
}
