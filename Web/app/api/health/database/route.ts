import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if environment variables are set
    const postgresqlConfigured = !!process.env.POSTGRES_URL;
    const redisConfigured = !!process.env.REDIS_URL;
    
    const status = {
      postgresql: {
        configured: postgresqlConfigured,
        url: process.env.POSTGRES_URL ? 'postgresql://[configured]' : 'not configured',
      },
      redis: {
        configured: redisConfigured,
        url: process.env.REDIS_URL ? 'redis://[configured]' : 'not configured',
      },
    };
    
    const healthy = postgresqlConfigured && redisConfigured;
    
    return NextResponse.json({
      status: healthy ? 'configured' : 'not configured',
      timestamp: new Date().toISOString(),
      services: status,
    }, { status: healthy ? 200 : 503 });
    
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

