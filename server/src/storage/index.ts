import { createHash, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { AppConfig } from '../config.js'

export interface StoredFile {
  key: string
  url: string
  checksum: string
}

export interface FileStorage {
  put(file: Express.Multer.File): Promise<StoredFile>
}

const extensionByMime: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
}

export function createFileStorage(config: AppConfig): FileStorage {
  if (config.STORAGE_DRIVER === 's3') {
    const client = new S3Client({
      endpoint: config.S3_ENDPOINT,
      region: config.S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.S3_ACCESS_KEY_ID!,
        secretAccessKey: config.S3_SECRET_ACCESS_KEY!,
      },
    })

    return {
      async put(file) {
        const key = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extensionByMime[file.mimetype] ?? ''}`
        await client.send(new PutObjectCommand({
          Bucket: config.S3_BUCKET!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }))
        return {
          key,
          url: `${config.S3_PUBLIC_BASE_URL!.replace(/\/$/, '')}/${key}`,
          checksum: createHash('sha256').update(file.buffer).digest('hex'),
        }
      },
    }
  }

  return {
    async put(file) {
      const extension = extensionByMime[file.mimetype] ?? ''
      const key = `${new Date().toISOString().slice(0, 10)}/${randomUUID()}${extension}`
      const absolutePath = path.resolve(config.UPLOAD_DIR, key)
      await mkdir(path.dirname(absolutePath), { recursive: true })
      await writeFile(absolutePath, file.buffer, { flag: 'wx' })
      return {
        key,
        url: `/uploads/${key.replaceAll('\\', '/')}`,
        checksum: createHash('sha256').update(file.buffer).digest('hex'),
      }
    },
  }
}
