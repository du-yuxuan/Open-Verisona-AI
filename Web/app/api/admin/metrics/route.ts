import { NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { getSystemMetrics } from '@/lib/db/admin-queries';

export async function GET() {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // In a real application, you would check for admin permissions here
    // For now, we'll allow all authenticated users to access admin metrics
    
    const metrics = await getSystemMetrics();
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}