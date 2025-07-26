import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { defaultEmailTemplates, EmailTemplate } from '@/lib/services/email-service';

// In a real application, these would be stored in a database
let customTemplates: EmailTemplate[] = [];

// Get all email templates
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allTemplates = [...defaultEmailTemplates, ...customTemplates];

    // Add usage statistics (simulated)
    const templatesWithStats = allTemplates.map(template => ({
      ...template,
      usage: {
        totalSent: Math.floor(Math.random() * 1000) + 100,
        openRate: Math.floor(Math.random() * 30) + 60, // 60-90%
        clickRate: Math.floor(Math.random() * 20) + 20, // 20-40%
        lastUsed: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    }));

    return NextResponse.json({
      templates: templatesWithStats,
      total: templatesWithStats.length,
      default: defaultEmailTemplates.length,
      custom: customTemplates.length
    });
  } catch (error) {
    console.error('Error getting templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create new email template
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, subject, type, htmlContent, textContent, variables } = body;

    if (!name || !subject || !type || !htmlContent) {
      return NextResponse.json(
        { error: 'Missing required fields: name, subject, type, htmlContent' },
        { status: 400 }
      );
    }

    const templateId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newTemplate: EmailTemplate = {
      id: templateId,
      name,
      subject,
      type,
      htmlContent,
      textContent: textContent || htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      variables: variables || []
    };

    customTemplates.push(newTemplate);

    return NextResponse.json({
      template: newTemplate,
      message: 'Template created successfully'
    });
  } catch (error) {
    console.error('Error creating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update email template
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
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Only allow updating custom templates
    const templateIndex = customTemplates.findIndex(t => t.id === id);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found or cannot be modified' },
        { status: 404 }
      );
    }

    customTemplates[templateIndex] = {
      ...customTemplates[templateIndex],
      ...updates,
      id // Ensure ID doesn't change
    };

    return NextResponse.json({
      template: customTemplates[templateIndex],
      message: 'Template updated successfully'
    });
  } catch (error) {
    console.error('Error updating template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete email template
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('id');

    if (!templateId) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    // Only allow deleting custom templates
    const templateIndex = customTemplates.findIndex(t => t.id === templateId);
    if (templateIndex === -1) {
      return NextResponse.json(
        { error: 'Template not found or cannot be deleted' },
        { status: 404 }
      );
    }

    customTemplates.splice(templateIndex, 1);

    return NextResponse.json({
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}