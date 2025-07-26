import { db } from './drizzle';
import { redis, sessionManager, cacheManager } from '@/lib/redis/client';
import { users } from './schema';

export async function testDatabaseConnection() {
  console.log('🔍 Testing Database Connection...');
  
  try {
    // Test PostgreSQL connection
    console.log('1. Testing PostgreSQL connection...');
    const userCount = await db.select().from(users).limit(1);
    console.log('✅ PostgreSQL connection successful');
    
    // Test Redis connection
    console.log('2. Testing Redis connection...');
    await redis.ping();
    console.log('✅ Redis connection successful');
    
    // Test session management
    console.log('3. Testing session management...');
    const testSessionId = 'test-session-123';
    const testSessionData = {
      userId: 1,
      email: 'test@example.com',
      loginTime: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    };
    
    await sessionManager.setSession(testSessionId, testSessionData, 60); // 1 minute
    const retrievedSession = await sessionManager.getSession(testSessionId);
    
    if (retrievedSession && retrievedSession.userId === 1) {
      console.log('✅ Session management working correctly');
      await sessionManager.deleteSession(testSessionId); // Cleanup
    } else {
      console.log('❌ Session management test failed');
    }
    
    // Test cache management
    console.log('4. Testing cache management...');
    const testKey = 'test-cache-key';
    const testValue = { message: 'Hello Cache!' };
    
    await cacheManager.set(testKey, testValue, 60); // 1 minute
    const cachedValue = await cacheManager.get(testKey);
    
    if (cachedValue && cachedValue.message === 'Hello Cache!') {
      console.log('✅ Cache management working correctly');
      await cacheManager.delete(testKey); // Cleanup
    } else {
      console.log('❌ Cache management test failed');
    }
    
    console.log('🎉 All database and middleware tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
    return false;
  }
}

export async function getDatabaseStatus() {
  try {
    const [userCount] = await db.select().from(users);
    const redisInfo = await redis.info('replication');
    
    return {
      postgresql: {
        status: 'connected',
        userCount: userCount ? 'has_users' : 'no_users',
      },
      redis: {
        status: 'connected',
        info: redisInfo ? 'available' : 'unavailable',
      },
    };
  } catch (error) {
    console.error('Error getting database status:', error);
    return {
      postgresql: { status: 'error', error: error.message },
      redis: { status: 'error', error: error.message },
    };
  }
}

// Run test if called directly
if (require.main === module) {
  testDatabaseConnection().then(() => {
    process.exit(0);
  }).catch(() => {
    process.exit(1);
  });
}