import type { TokenPayload } from './auth.types'

/**
 * Define the structure of the JWT user payload for @fastify/jwt
 * This ensures that FastifyRequest.user has the correct type throughout the application
 */
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: TokenPayload
    user: TokenPayload
  }
}

/**
 * Marker type for routes that require authentication
 * Used to indicate that a route handler expects the user to be authenticated
 */
export type AuthenticatedRequest = {
  user: TokenPayload
}
