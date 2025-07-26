// Dify configuration and environment management
import { z } from 'zod';

// Environment variable schema for Dify configuration
const difyConfigSchema = z.object({
  DIFY_API_BASE_URL: z.string().url('Invalid Dify API base URL'),
  DIFY_API_KEY: z.string().min(1, 'Dify API key is required'),
  DIFY_QUESTION_WORKFLOW_ID: z.string().min(1, 'Question generation workflow ID is required'),
  DIFY_ANALYSIS_WORKFLOW_ID: z.string().min(1, 'Analysis workflow ID is required'),
  DIFY_API_VERSION: z.string().default('v1'),
  DIFY_TIMEOUT_MS: z.coerce.number().min(1000).max(600000).default(15000), // Allow up to 10 minutes for long-running workflows
  DIFY_MAX_RETRIES: z.coerce.number().min(0).max(5).default(3),
  DIFY_ENABLE_SIMULATION: z.coerce.boolean().default(false), // Force real API calls
});

// Parse and validate environment variables
function getDifyConfig() {
  try {
    return difyConfigSchema.parse({
      DIFY_API_BASE_URL: process.env.DIFY_API_BASE_URL || 'https://api.dify.ai',
      DIFY_API_KEY: process.env.DIFY_API_KEY || 'simulation-key',
      DIFY_QUESTION_WORKFLOW_ID: process.env.DIFY_QUESTION_WORKFLOW_ID || 'question-gen-workflow',
      DIFY_ANALYSIS_WORKFLOW_ID: process.env.DIFY_ANALYSIS_WORKFLOW_ID || 'analysis-workflow',
      DIFY_API_VERSION: process.env.DIFY_API_VERSION,
      DIFY_TIMEOUT_MS: process.env.DIFY_TIMEOUT_MS,
      DIFY_MAX_RETRIES: process.env.DIFY_MAX_RETRIES,
      DIFY_ENABLE_SIMULATION: process.env.DIFY_ENABLE_SIMULATION,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Dify configuration error:', error.errors);
      throw new Error(`Invalid Dify configuration: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

// Workflow-specific configurations
export const DIFY_WORKFLOWS = {
  QUESTION_GENERATION: {
    id: 'persona-question-generator',
    name: 'Persona Question Generator',
    description: 'Generates personalized questions based on user responses and profile',
    maxQuestions: 10,
    categories: ['personality', 'values', 'academic', 'career', 'social', 'personal_growth'],
  },
  PERSONA_ANALYSIS: {
    id: 'persona-analyzer',
    name: 'Persona Analysis Engine',
    description: 'Analyzes user responses to generate comprehensive persona insights',
    outputFormats: ['summary', 'detailed', 'recommendations'],
    analysisTypes: ['personality', 'academic_fit', 'career_alignment', 'college_match'],
  },
  COLLEGE_MATCHING: {
    id: 'college-matcher',
    name: 'College Matching Algorithm',
    description: 'Matches user persona with suitable colleges and programs',
    matchingFactors: ['academic_profile', 'personal_values', 'career_goals', 'cultural_fit', 'financial_considerations'],
  },
  ESSAY_GUIDANCE: {
    id: 'essay-guide',
    name: 'Essay Guidance Generator',
    description: 'Provides personalized essay prompts and guidance based on user persona',
    essayTypes: ['personal_statement', 'supplemental', 'scholarship', 'activity_description'],
  }
} as const;

export type DifyWorkflowType = keyof typeof DIFY_WORKFLOWS;

// Export configuration
export const difyConfig = getDifyConfig();

// Helper functions for configuration management
export function isDifySimulationMode(): boolean {
  return difyConfig.DIFY_ENABLE_SIMULATION;
}

export function getDifyWorkflowConfig(workflowType: DifyWorkflowType) {
  return DIFY_WORKFLOWS[workflowType];
}

export function buildDifyApiUrl(endpoint: string): string {
  return `${difyConfig.DIFY_API_BASE_URL}/${difyConfig.DIFY_API_VERSION}/${endpoint}`;
}

// Dify API request configuration
export const DIFY_REQUEST_CONFIG = {
  timeout: difyConfig.DIFY_TIMEOUT_MS,
  maxRetries: difyConfig.DIFY_MAX_RETRIES,
  retryDelay: 1000, // Base delay in ms, will use exponential backoff
  headers: {
    'Authorization': `Bearer ${difyConfig.DIFY_API_KEY}`,
    'Content-Type': 'application/json',
    'User-Agent': 'Verisona-AI/1.0',
  },
} as const;

// Request/Response types for Dify API
export interface DifyApiRequest {
  workflow_id: string;
  inputs: Record<string, any>;
  response_mode: 'blocking' | 'streaming';
  user: string;
  conversation_id?: string;
  files?: Array<{
    type: 'image' | 'document';
    transfer_method: 'remote_url' | 'local_file';
    url?: string;
    upload_file_id?: string;
  }>;
}

export interface DifyApiResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs: Record<string, any>;
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    total_steps: number;
    created_at: number;
    finished_at: number;
  };
  metadata?: {
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
}

// Error types for better error handling
export class DifyApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any,
    public workflowId?: string
  ) {
    super(message);
    this.name = 'DifyApiError';
  }
}

export class DifyTimeoutError extends DifyApiError {
  constructor(workflowId: string, timeout: number) {
    super(`Dify workflow ${workflowId} timed out after ${timeout}ms`);
    this.name = 'DifyTimeoutError';
  }
}

export class DifyQuotaError extends DifyApiError {
  constructor(message: string) {
    super(message);
    this.name = 'DifyQuotaError';
  }
}

// Validation schemas for Dify requests
export const difyQuestionRequestSchema = z.object({
  userId: z.number(),
  sessionId: z.string().uuid(),
  previousResponses: z.array(z.object({
    questionId: z.number(),
    questionText: z.string(),
    response: z.any(),
    category: z.string(),
    timestamp: z.string().optional(),
  })),
  userProfile: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    graduationYear: z.number().optional(),
    schoolName: z.string().optional(),
    preferences: z.any().optional(),
    equityEligible: z.boolean().default(false),
  }),
  context: z.object({
    questionnaireType: z.string(),
    category: z.string(),
    currentQuestionCount: z.number(),
    maxQuestions: z.number().max(50),
    focusAreas: z.array(z.string()).optional(),
    urgency: z.enum(['low', 'medium', 'high']).optional(),
  }),
});

export const difyAnalysisRequestSchema = z.object({
  userId: z.number(),
  sessionId: z.string().uuid(),
  responses: z.array(z.object({
    questionId: z.number(),
    questionText: z.string(),
    questionType: z.string(),
    response: z.any(),
    category: z.string(),
    timeSpent: z.number().optional(),
    qualityScore: z.number().optional(),
    metadata: z.any().optional(),
  })),
  userProfile: z.any(),
  analysisType: z.enum(['personality', 'academic', 'college_match', 'comprehensive']),
  options: z.object({
    includeRecommendations: z.boolean().default(true),
    includeCollegeMatches: z.boolean().default(true),
    includeEssayGuidance: z.boolean().default(false),
    detailLevel: z.enum(['summary', 'detailed', 'comprehensive']).default('detailed'),
  }).optional(),
});

export type DifyQuestionRequest = z.infer<typeof difyQuestionRequestSchema>;
export type DifyAnalysisRequest = z.infer<typeof difyAnalysisRequestSchema>;