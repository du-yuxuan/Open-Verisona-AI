import { Redis } from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL environment variable is not set');
}

// Create Redis client with reconnection settings
export const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  lazyConnect: true,
  
  // Connection options
  connectTimeout: 60000,
  commandTimeout: 5000,
  
  // Reconnection settings
  retryDelayOnClusterDown: 300,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: null,
  
  // Health check
  keepAlive: 30000,
});

// Connection event handlers
redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis reconnecting...');
});

redis.on('close', () => {
  console.log('🔒 Redis connection closed');
});

// Session management helpers
export const sessionManager = {
  // Store session data
  setSession: async (sessionId: string, data: any, expirationSeconds: number = 3600) => {
    const sessionKey = `session:${sessionId}`;
    await redis.setex(sessionKey, expirationSeconds, JSON.stringify(data));
  },

  // Get session data
  getSession: async (sessionId: string) => {
    const sessionKey = `session:${sessionId}`;
    const data = await redis.get(sessionKey);
    return data ? JSON.parse(data) : null;
  },

  // Delete session
  deleteSession: async (sessionId: string) => {
    const sessionKey = `session:${sessionId}`;
    await redis.del(sessionKey);
  },

  // Update session expiration
  extendSession: async (sessionId: string, expirationSeconds: number = 3600) => {
    const sessionKey = `session:${sessionId}`;
    await redis.expire(sessionKey, expirationSeconds);
  },

  // Get all sessions for a user
  getUserSessions: async (userId: number) => {
    const pattern = `session:*`;
    const keys = await redis.keys(pattern);
    const sessions = [];
    
    for (const key of keys) {
      const data = await redis.get(key);
      if (data) {
        const sessionData = JSON.parse(data);
        if (sessionData.userId === userId) {
          sessions.push({
            sessionId: key.replace('session:', ''),
            data: sessionData,
            ttl: await redis.ttl(key)
          });
        }
      }
    }
    
    return sessions;
  }
};

// Cache helpers for general use
export const cacheManager = {
  // Set cache with expiration
  set: async (key: string, value: any, expirationSeconds: number = 3600) => {
    await redis.setex(key, expirationSeconds, JSON.stringify(value));
  },

  // Get cache value
  get: async (key: string) => {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Delete cache
  delete: async (key: string) => {
    await redis.del(key);
  },

  // Check if key exists
  exists: async (key: string) => {
    return await redis.exists(key);
  },

  // Set expiration for existing key
  expire: async (key: string, expirationSeconds: number) => {
    await redis.expire(key, expirationSeconds);
  },

  // Get multiple keys
  mget: async (keys: string[]) => {
    const values = await redis.mget(...keys);
    return values.map(val => val ? JSON.parse(val) : null);
  },

  // Clear all cache with pattern
  clearPattern: async (pattern: string) => {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};

// Analytics cache helpers
export const analyticsCache = {
  // Cache dashboard metrics
  setDashboardMetrics: async (userId: number, metrics: any) => {
    const key = `dashboard:metrics:${userId}`;
    await redis.setex(key, 300, JSON.stringify(metrics)); // 5 minutes
  },

  getDashboardMetrics: async (userId: number) => {
    const key = `dashboard:metrics:${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Cache questionnaire analytics
  setQuestionnaireAnalytics: async (questionnaireId: number, analytics: any) => {
    const key = `questionnaire:analytics:${questionnaireId}`;
    await redis.setex(key, 600, JSON.stringify(analytics)); // 10 minutes
  },

  getQuestionnaireAnalytics: async (questionnaireId: number) => {
    const key = `questionnaire:analytics:${questionnaireId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  },

  // Cache user reports
  setUserReports: async (userId: number, reports: any) => {
    const key = `user:reports:${userId}`;
    await redis.setex(key, 1800, JSON.stringify(reports)); // 30 minutes
  },

  getUserReports: async (userId: number) => {
    const key = `user:reports:${userId}`;
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }
};

export default redis;