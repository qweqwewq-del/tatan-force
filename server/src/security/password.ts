import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const KEY_LENGTH = 64

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt-v1:${salt.toString('base64')}:${derived.toString('base64')}`
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const [version, saltValue, hashValue] = encoded.split(':')
  if (version !== 'scrypt-v1' || !saltValue || !hashValue) return false

  try {
    const salt = Buffer.from(saltValue, 'base64')
    const expected = Buffer.from(hashValue, 'base64')
    const actual = (await scrypt(password, salt, expected.length)) as Buffer
    return actual.length === expected.length && timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
