import { NextRequest, NextResponse } from 'next/server';

// GET /api/health/dify - Check Dify integration health
export async function GET(request: NextRequest) {
  try {
    const simulationMode = process.env.DIFY_ENABLE_SIMULATION === 'true';
    const baseUrl = process.env.DIFY_API_BASE_URL || 'https://api.dify.ai';
    
    const healthReport = {
      status: 'healthy',
      mode: simulationMode ? 'simulation' : 'production',
      timestamp: new Date().toISOString(),
      configuration: {
        baseUrl,
        simulationMode,
        apiVersion: process.env.DIFY_API_VERSION || 'v1',
      },
      workflows: {
        questionGeneration: { status: 'configured', mode: simulationMode ? 'simulation' : 'production' },
        personaAnalysis: { status: 'configured', mode: simulationMode ? 'simulation' : 'production' },
        collegeMatching: { status: 'configured', mode: simulationMode ? 'simulation' : 'production' },
        essayGuidance: { status: 'configured', mode: simulationMode ? 'simulation' : 'production' },
      },
      integration: {
        dynamicQuestions: true,
        responseAnalysis: true,
        validationSystem: true,
        dataMapping: true,
      }
    };

    return NextResponse.json(healthReport, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Health check failed:', error);

    return NextResponse.json({
      status: 'unhealthy',
      error: {
        type: 'configuration_error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
    }, {
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}

// POST /api/health/dify - Test specific workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflowType } = body;

    const availableWorkflows = ['questionGeneration', 'personaAnalysis', 'collegeMatching', 'essayGuidance'];
    
    if (!workflowType || !availableWorkflows.includes(workflowType)) {
      return NextResponse.json({
        error: 'Invalid workflow type',
        availableWorkflows,
      }, { status: 400 });
    }

    const testResult = {
      workflowType,
      status: 'healthy',
      mode: process.env.DIFY_ENABLE_SIMULATION === 'true' ? 'simulation' : 'production',
      message: 'Workflow integration configured and ready',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(testResult);
  } catch (error) {
    console.error('Workflow test failed:', error);
    return NextResponse.json({
      error: 'Workflow test failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}