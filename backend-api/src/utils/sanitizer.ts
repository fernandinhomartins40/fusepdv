/**
 * Input sanitization utilities
 * Protects against XSS and injection attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .trim()
    .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 10000) // Limit length to prevent DoS
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return ''

  return email
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9@._-]/g, '') // Only allow valid email characters
    .slice(0, 255)
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: any): number | null {
  const num = Number(input)
  return isNaN(num) || !isFinite(num) ? null : num
}

/**
 * Sanitize boolean input
 */
export function sanitizeBoolean(input: any): boolean {
  if (typeof input === 'boolean') return input
  if (typeof input === 'string') {
    return input.toLowerCase() === 'true' || input === '1'
  }
  return Boolean(input)
}

/**
 * Sanitize object by removing null/undefined values
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): Partial<T> {
  const result: any = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined) {
      result[key] = value
    }
  }

  return result
}

/**
 * Sanitize SQL input (basic protection - use Prisma parameterized queries instead)
 */
export function sanitizeSQL(input: string): string {
  if (typeof input !== 'string') return ''

  return input
    .replace(/['";\\]/g, '') // Remove SQL injection characters
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .trim()
}
