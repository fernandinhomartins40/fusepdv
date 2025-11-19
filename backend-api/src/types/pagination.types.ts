import { z } from 'zod'

/**
 * Standard pagination query parameters schema
 */
export const paginationQuerySchema = z.object({
  page: z.string().transform(Number).default('1').optional(),
  limit: z.string().transform(Number).default('10').optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
})

export type PaginationQuery = z.infer<typeof paginationQuerySchema>

/**
 * Standard pagination response metadata
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

/**
 * Standard paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number = 1,
  limit: number = 10
): PaginationMeta {
  const totalPages = Math.ceil(total / limit)

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/**
 * Calculate skip for Prisma queries
 */
export function calculateSkip(page: number = 1, limit: number = 10): number {
  return (page - 1) * limit
}
