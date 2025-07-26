import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { EmailCampaign } from '@/lib/services/email-service';

// In a real application, these would be stored in a database
let campaigns: EmailCampaign[] = [
  {
    id: 'camp_welcome_series',
    name: 'Welcome Email Series',
    templateId: 'welcome',
    status: 'active',
    targetAudience: 'new_users',
    scheduledAt: new Date('2024-12-01T09:00:00Z'),
    recipientCount: 2847,
    sentCount: 2834,
    openCount: 2331,
    clickCount: 967,
    metadata: {
      description: 'Automated welcome series for new users',
      frequency: 'immediate'
    }
  },
  {
    id: 'camp_questionnaire_reminder',
    name: 'Questionnaire Completion Campaign',
    templateId: 'questionnaire_reminder',
    status: 'active',
    targetAudience: 'incomplete_questionnaires',
    scheduledAt: new Date('2024-12-01T10:00:00Z'),
    recipientCount: 1234,
    sentCount: 1189,
    openCount: 781,
    clickCount: 342,
    metadata: {
      description: 'Reminds users to complete their questionnaires',
      frequency: 'daily'
    }
  },
  {
    id: 'camp_weekly_progress',
    name: 'Weekly Progress Updates',
    templateId: 'weekly_progress',
    status: 'active',
    targetAudience: 'all',
    scheduledAt: new Date('2024-12-01T18:00:00Z'),
    recipientCount: 2847,
    sentCount: 2820,
    openCount: 1926,
    clickCount: 658,
    metadata: {
      description: 'Weekly progress updates for all active users',
      frequency: 'weekly'
    }
  },
  {
    id: 'camp_motivation_boost',
    name: 'Motivation Boost Campaign',
    templateId: 'motivation_boost',
    status: 'paused',
    targetAudience: 'inactive_users',
    scheduledAt: new Date('2024-12-05T15:00:00Z'),
    recipientCount: 456,
    sentCount: 0,
    openCount: 0,
    clickCount: 0,
    metadata: {
      description: 'Motivational messages for inactive users',
      frequency: 'weekly'
    }
  }
];

// Get all campaigns
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const audience = searchParams.get('audience');

    let filteredCampaigns = campaigns;

    if (status) {
      filteredCampaigns = filteredCampaigns.filter(c => c.status === status);
    }

    if (audience) {
      filteredCampaigns = filteredCampaigns.filter(c => c.targetAudience === audience);
    }

    // Add calculated metrics
    const campaignsWithMetrics = filteredCampaigns.map(campaign => ({
      ...campaign,
      metrics: {
        openRate: campaign.sentCount > 0 ? ((campaign.openCount / campaign.sentCount) * 100).toFixed(1) : '0',
        clickRate: campaign.sentCount > 0 ? ((campaign.clickCount / campaign.sentCount) * 100).toFixed(1) : '0',
        deliveryRate: campaign.recipientCount > 0 ? ((campaign.sentCount / campaign.recipientCount) * 100).toFixed(1) : '0'
      }
    }));

    return NextResponse.json({
      campaigns: campaignsWithMetrics,
      total: campaignsWithMetrics.length,
      summary: {
        active: campaigns.filter(c => c.status === 'active').length,
        completed: campaigns.filter(c => c.status === 'completed').length,
        paused: campaigns.filter(c => c.status === 'paused').length,
        draft: campaigns.filter(c => c.status === 'draft').length,
        totalRecipients: campaigns.reduce((sum, c) => sum + c.recipientCount, 0),
        totalSent: campaigns.reduce((sum, c) => sum + c.sentCount, 0),
        totalOpens: campaigns.reduce((sum, c) => sum + c.openCount, 0),
        totalClicks: campaigns.reduce((sum, c) => sum + c.clickCount, 0)
      }
    });
  } catch (error) {
    console.error('Error getting campaigns:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new campaign
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, templateId, targetAudience, scheduledAt, metadata } = body;

    if (!name || !templateId || !targetAudience) {
      return NextResponse.json(
        { error: 'Missing required fields: name, templateId, targetAudience' },
        { status: 400 }
      );
    }

    const campaignId = `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate recipient count based on target audience (simulated)
    const recipientCounts = {
      'all': 2847,
      'new_users': 145,
      'inactive_users': 456,
      'completed_questionnaires': 1234,
      'incomplete_questionnaires': 1613,
      'low_income': 1189,
      'custom': 0
    };

    const newCampaign: EmailCampaign = {
      id: campaignId,
      name,
      templateId,
      status: scheduledAt ? 'scheduled' : 'draft',
      targetAudience,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      recipientCount: recipientCounts[targetAudience as keyof typeof recipientCounts] || 0,
      sentCount: 0,
      openCount: 0,
      clickCount: 0,
      metadata: metadata || {}
    };

    campaigns.push(newCampaign);

    return NextResponse.json({
      campaign: newCampaign,
      message: 'Campaign created successfully'
    });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update campaign
export async function PUT(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaignIndex = campaigns.findIndex(c => c.id === id);
    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[campaignIndex];
    
    // Don't allow updating completed campaigns
    if (campaign.status === 'completed') {
      return NextResponse.json(
        { error: 'Cannot update completed campaigns' },
        { status: 400 }
      );
    }

    campaigns[campaignIndex] = {
      ...campaign,
      ...updates,
      id // Ensure ID doesn't change
    };

    return NextResponse.json({
      campaign: campaigns[campaignIndex],
      message: 'Campaign updated successfully'
    });
  } catch (error) {
    console.error('Error updating campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete campaign
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('id');

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign ID is required' },
        { status: 400 }
      );
    }

    const campaignIndex = campaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex === -1) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const campaign = campaigns[campaignIndex];
    
    // Don't allow deleting active campaigns
    if (campaign.status === 'active') {
      return NextResponse.json(
        { error: 'Cannot delete active campaigns. Pause it first.' },
        { status: 400 }
      );
    }

    campaigns.splice(campaignIndex, 1);

    return NextResponse.json({
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}