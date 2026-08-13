import { Router } from 'express'
import multer from 'multer'
import { requireAuth } from '../middleware/auth.js'
import type { FileStorage } from '../storage/index.js'

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

function hasSafeImageSignature(file: Express.Multer.File) {
  const { buffer, mimetype } = file
  if (mimetype === 'image/jpeg') {
    return buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
  }
  if (mimetype === 'image/png') {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  }
  if (mimetype === 'image/webp') {
    return buffer.length >= 12 && buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  }
  return false
}

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
        if (!hasSafeImageSignature(request.file)) {
          response.status(400).json({ error: 'INVALID_IMAGE_FILE' })
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
