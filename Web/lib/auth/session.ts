import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';
import { sessionManager } from '@/lib/redis/client';
import { randomUUID } from 'crypto';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { id: number };
  expires: string;
  sessionId?: string;
};

type RedisSessionData = {
  userId: number;
  email: string;
  name?: string;
  loginTime: string;
  lastActivity: string;
  ipAddress?: string;
  userAgent?: string;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  return await verifyToken(session);
}

export async function setSession(user: NewUser, request?: Request) {
  const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const sessionId = randomUUID();
  
  // Store session in Redis
  const redisSessionData: RedisSessionData = {
    userId: user.id!,
    email: user.email,
    name: user.name || undefined,
    loginTime: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
    userAgent: request?.headers.get('user-agent') || undefined,
  };
  
  // Store session in Redis with 24-hour expiration
  await sessionManager.setSession(sessionId, redisSessionData, 24 * 60 * 60);
  
  // Create JWT with session ID
  const session: SessionData = {
    user: { id: user.id! },
    expires: expiresInOneDay.toISOString(),
    sessionId,
  };
  
  const encryptedSession = await signToken(session);
  (await cookies()).set('session', encryptedSession, {
    expires: expiresInOneDay,
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
  });
  
  return sessionId;
}

// Enhanced session validation with Redis
export async function validateSession(sessionToken: string) {
  try {
    const sessionData = await verifyToken(sessionToken);
    
    // If session has sessionId, validate it in Redis
    if (sessionData.sessionId) {
      const redisSession = await sessionManager.getSession(sessionData.sessionId);
      if (!redisSession) {
        // Session expired or invalid in Redis
        return null;
      }
      
      // Update last activity
      redisSession.lastActivity = new Date().toISOString();
      await sessionManager.setSession(sessionData.sessionId, redisSession, 24 * 60 * 60);
      
      return {
        ...sessionData,
        redisSession
      };
    }
    
    return sessionData;
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

// Logout and cleanup session
export async function destroySession() {
  const sessionData = await getSession();
  
  if (sessionData?.sessionId) {
    // Remove from Redis
    await sessionManager.deleteSession(sessionData.sessionId);
  }
  
  // Remove cookie
  (await cookies()).delete('session');
}

// Get all active sessions for a user
export async function getUserSessions(userId: number) {
  return await sessionManager.getUserSessions(userId);
}

// Cleanup expired sessions
export async function cleanupExpiredSessions() {
  // Redis automatically handles expiration, but we can add additional cleanup logic here
  console.log('Session cleanup completed');
}

// Get current user - alias for getUser for backward compatibility
export async function getCurrentUser() {
  const { getUser } = await import('@/lib/db/queries');
  return getUser();
}
