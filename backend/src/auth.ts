import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from './supabaseAdmin.js';
import type { UserRole } from './types.js';

export interface AuthedRequest extends Request {
  userId?: string;
  userRole?: UserRole;
}

/**
 * Verifies the `Authorization: Bearer <supabase-jwt>` header, then loads the
 * caller's role from the profiles table (service role, bypassing RLS).
 */
export async function authenticate(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing bearer token.' });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: 'Invalid or expired session.' });
    return;
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  req.userId = data.user.id;
  req.userRole = (profile?.role as UserRole) ?? 'customer';
  next();
}

/** Restrict a route to specific roles. Use after `authenticate`. */
export function requireRole(...roles: UserRole[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: 'Forbidden: insufficient role.' });
      return;
    }
    next();
  };
}
