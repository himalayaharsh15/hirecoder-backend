/**
 * ============================================================
 * JWT Payload Type
 * ============================================================
 *
 * Represents the payload stored inside
 * the access token.
 */
export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}
