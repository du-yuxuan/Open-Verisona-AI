// Production-ready Dify API Service for AI-powered questionnaire generation and analysis
// Integrates with Dify workflows for dynamic question generation and response analysis

import { 
  difyConfig, 
  buildDifyApiUrl,
  DIFY_REQUEST_CONFIG,
  DIFY_WORKFLOWS,
  DifyApiError,
  DifyTimeoutError,
  DifyQuotaError,
  type DifyApiRequest,
  type DifyApiResponse,
  type DifyQuestionRequest,
  type DifyAnalysisRequest,
  difyQuestionRequestSchema,
  difyAnalysisRequestSchema
} from '@/lib/config/dify-config';

export interface DifyWorkflowConfig {
  workflowId: string;
  apiKey: string;
  baseUrl: string;
  version?: string;
}

export interface DifyQuestionRequest {
  userId: number;
  sessionId: string;
  previousResponses: Array<{
    questionId: number;
    questionText: string;
    response: any;
    category: string;
  }>;
  userProfile: {
    firstName?: string;
    lastName?: string;
    graduationYear?: number;
    schoolName?: string;
    preferences?: any;
    equityEligible: boolean;
  };
  context: {
    questionnaireType: string;
    category: string;
    currentQuestionCount: number;
    maxQuestions: number;
  };
}

export interface DifyQuestionResponse {
  question: {
    text: string;
    type: 'multiple_choice' | 'text' | 'scale' | 'boolean' | 'textarea' | 'ranking';
    category: string;
    options?: any;
    reasoning: string;
    importance: number; // 1-10 scale
  };
  followUpSuggestions?: string[];
  confidenceScore: number; // 0-1 scale
  metadata: {
    generatedAt: string;
    modelVersion: string;
    processingTime: number;
  };
}

export interface DifyAnalysisRequest {
  userId: number;
  sessionId: string;
  responses: Array<{
    questionId: number;
    questionText: string;
    questionType: string;
    response: any;
    category: string;
    timeSpent?: number;
  }>;
  userProfile: any;
  analysisType: 'personality' | 'academic' | 'college_match' | 'comprehensive';
}

export interface DifyAnalysisResponse {
  analysis: {
    summary: string;
    insights: Array<{
      category: string;
      title: string;
      description: string;
      confidence: number;
      impact: 'high' | 'medium' | 'low';
    }>;
    scores: Array<{
      dimension: string;
      score: number;
      percentile: number;
      description: string;
    }>;
    recommendations: Array<{
      type: 'college' | 'major' | 'activity' | 'skill';
      title: string;
      description: string;
      priority: 'high' | 'medium' | 'low';
      actionItems?: string[];
    }>;
  };
  metadata: {
    analysisId: string;
    generatedAt: string;
    modelVersion: string;
    processingTime: number;
  };
}

class DifyService {
  private config: DifyWorkflowConfig;
  private requestQueue: Map<string, Promise<any>> = new Map();
  private retryAttempts: Map<string, number> = new Map();

  constructor(config: DifyWorkflowConfig) {
    this.config = config;
  }

  /**
   * Make authenticated request to Dify API with retry logic
   */
  private async makeRequest(
    endpoint: string, 
    data: DifyApiRequest,
    requestId?: string
  ): Promise<DifyApiResponse> {
    const url = buildDifyApiUrl(endpoint);
    const requestKey = requestId || `${endpoint}-${Date.now()}`;
    
    // Prevent duplicate requests
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey)!;
    }

    const requestPromise = this.executeRequest(url, data, requestKey);
    this.requestQueue.set(requestKey, requestPromise);
    
    try {
      const result = await requestPromise;
      this.requestQueue.delete(requestKey);
      this.retryAttempts.delete(requestKey);
      return result;
    } catch (error) {
      this.requestQueue.delete(requestKey);
      throw error;
    }
  }

  private async executeRequest(
    url: string, 
    data: DifyApiRequest, 
    requestKey: string
  ): Promise<DifyApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DIFY_REQUEST_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: DIFY_REQUEST_CONFIG.headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response, requestKey);
      }

      // Handle streaming responses
      if (data.response_mode === 'streaming') {
        return this.handleStreamingResponse(response, data);
      }

      const result: DifyApiResponse = await response.json();
      
      // Validate response structure
      if (!result.data || !result.workflow_run_id) {
        throw new DifyApiError('Invalid response format from Dify API', response.status, result);
      }

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new DifyTimeoutError(data.workflow_id, DIFY_REQUEST_CONFIG.timeout);
      }

      // Retry logic for certain errors
      if (this.shouldRetry(error, requestKey)) {
        return this.retryRequest(url, data, requestKey);
      }

      throw error;
    }
  }

  /**
   * Make streaming request with progress callback
   */
  private async makeStreamingRequest(
    endpoint: string,
    data: DifyApiRequest,
    requestId: string,
    onProgress?: (progress: {
      stage: string;
      progress: number;
      message: string;
      details?: any;
    }) => void
  ): Promise<DifyApiResponse> {
    const url = buildDifyApiUrl(endpoint);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DIFY_REQUEST_CONFIG.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: DIFY_REQUEST_CONFIG.headers,
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        await this.handleErrorResponse(response, requestId);
      }

      return this.handleStreamingResponse(response, data, onProgress);
    } catch (error) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new DifyTimeoutError(data.workflow_id, DIFY_REQUEST_CONFIG.timeout);
      }

      throw error;
    }
  }

  private async handleStreamingResponse(
    response: Response, 
    data: DifyApiRequest,
    onProgress?: (progress: {
      stage: string;
      progress: number;
      message: string;
      details?: any;
    }) => void
  ): Promise<DifyApiResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new DifyApiError('No response body available for streaming');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let workflowRunId = '';
    let finalResult: DifyApiResponse | null = null;
    let currentProgress = 30;

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the incomplete line in buffer

        for (const line of lines) {
          if (line.trim() === '') continue;
          
          try {
            // Parse streaming event
            if (line.startsWith('data: ')) {
              const eventData = JSON.parse(line.substring(6));
              
              // Track workflow run ID
              if (eventData.workflow_run_id) {
                workflowRunId = eventData.workflow_run_id;
              }
              
              // Handle different event types
              if (eventData.event) {
                switch (eventData.event) {
                  case 'workflow_started':
                    onProgress?.({
                      stage: 'processing',
                      progress: 35,
                      message: 'Workflow started, processing your responses...',
                      details: eventData
                    });
                    break;
                  case 'node_started':
                    currentProgress = Math.min(currentProgress + 5, 85);
                    onProgress?.({
                      stage: getStageFromProgress(currentProgress),
                      progress: currentProgress,
                      message: `Processing node: ${eventData.data?.title || 'Unknown'}`,
                      details: eventData
                    });
                    break;
                  case 'node_finished':
                    currentProgress = Math.min(currentProgress + 10, 85);
                    onProgress?.({
                      stage: getStageFromProgress(currentProgress),
                      progress: currentProgress,
                      message: `Completed: ${eventData.data?.title || 'Processing step'}`,
                      details: eventData
                    });
                    break;
                  case 'workflow_finished':
                    if (eventData.data) {
                      finalResult = {
                        workflow_run_id: workflowRunId,
                        task_id: eventData.task_id || '',
                        data: eventData.data,
                        metadata: eventData.metadata
                      };
                      onProgress?.({
                        stage: 'finalizing',
                        progress: 95,
                        message: 'Workflow completed, finalizing results...',
                        details: eventData
                      });
                    }
                    break;
                  case 'error':
                    throw new DifyApiError(
                      `Workflow error: ${eventData.data?.error || 'Unknown error'}`,
                      500,
                      eventData
                    );
                }
              }
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming event:', line, parseError);
          }
        }

        if (finalResult) break;
      }
    } finally {
      reader.releaseLock();
    }

    if (!finalResult) {
      throw new DifyApiError('No final result received from streaming response');
    }

    // Validate response structure
    if (!finalResult.data || !finalResult.workflow_run_id) {
      throw new DifyApiError('Invalid response format from Dify streaming API', response.status, finalResult);
    }

    return finalResult;
  }

  private async handleErrorResponse(response: Response, requestKey: string): Promise<never> {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    
    switch (response.status) {
      case 401:
        throw new DifyApiError('Unauthorized: Invalid API key', response.status, errorData);
      case 429:
        throw new DifyQuotaError(`Rate limit exceeded: ${errorData.error || 'Too many requests'}`);
      case 400:
        throw new DifyApiError(`Bad request: ${errorData.error || 'Invalid input'}`, response.status, errorData);
      case 500:
      case 502:
      case 503:
        // Server errors - these should be retried
        const error = new DifyApiError(`Server error: ${errorData.error || 'Internal server error'}`, response.status, errorData);
        if (this.shouldRetry(error, requestKey)) {
          // Will be handled by retry logic
        }
        throw error;
      default:
        throw new DifyApiError(`HTTP ${response.status}: ${errorData.error || 'Unknown error'}`, response.status, errorData);
    }
  }

  private shouldRetry(error: any, requestKey: string): boolean {
    const attempts = this.retryAttempts.get(requestKey) || 0;
    if (attempts >= DIFY_REQUEST_CONFIG.maxRetries) {
      return false;
    }

    // Retry on network errors, timeouts, and server errors
    return (
      error instanceof DifyTimeoutError ||
      error.code === 'ECONNRESET' ||
      error.code === 'ENOTFOUND' ||
      (error instanceof DifyApiError && error.statusCode && error.statusCode >= 500)
    );
  }

  private async retryRequest(
    url: string, 
    data: DifyApiRequest, 
    requestKey: string
  ): Promise<DifyApiResponse> {
    const attempts = (this.retryAttempts.get(requestKey) || 0) + 1;
    this.retryAttempts.set(requestKey, attempts);

    // Exponential backoff
    const delay = DIFY_REQUEST_CONFIG.retryDelay * Math.pow(2, attempts - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    console.log(`🔄 Retrying Dify request (attempt ${attempts}/${DIFY_REQUEST_CONFIG.maxRetries}) after ${delay}ms`);
    return this.executeRequest(url, data, requestKey);
  }

  /**
   * Generate a dynamic question based on user context and previous responses
   */
  async generateDynamicQuestion(request: DifyQuestionRequest): Promise<DifyQuestionResponse> {
    try {
      // Validate request
      const validatedRequest = difyQuestionRequestSchema.parse(request);
      
      // Make actual API call to Dify
      const difyRequest: DifyApiRequest = {
        workflow_id: difyConfig.DIFY_QUESTION_WORKFLOW_ID,
        inputs: {
          user_id: validatedRequest.userId.toString(),
          session_id: validatedRequest.sessionId,
          previous_responses: JSON.stringify(validatedRequest.previousResponses),
          user_profile: JSON.stringify(validatedRequest.userProfile),
          context: JSON.stringify(validatedRequest.context),
          max_questions: validatedRequest.context.maxQuestions,
          focus_areas: validatedRequest.context.focusAreas?.join(',') || '',
        },
        response_mode: 'blocking',
        user: `user_${validatedRequest.userId}`,
      };

      const response = await this.makeRequest(
        'workflows/run', 
        difyRequest,
        `question_gen_${validatedRequest.sessionId}`
      );

      // Transform Dify response to our format
      return this.transformDifyQuestionResponse(response);
    } catch (error) {
      console.error('Error generating dynamic question:', error);
      
      // Force real API usage - throw error instead of using fallback
      if (error instanceof DifyApiError || error instanceof DifyTimeoutError) {
        console.log('❌ Dify API error - no fallback, throwing error');
        throw error;
      }
      
      throw new Error(`Failed to generate dynamic question: ${error.message}`);
    }
  }

  /**
   * Analyze user responses and generate insights (blocking mode)
   */
  async analyzeResponses(request: DifyAnalysisRequest): Promise<DifyAnalysisResponse> {
    try {
      // Validate request
      const validatedRequest = difyAnalysisRequestSchema.parse(request);
      
      // Enhanced logging for debugging
      console.log('📊 Preparing Dify analysis request:', {
        userId: validatedRequest.userId,
        sessionId: validatedRequest.sessionId,
        analysisType: validatedRequest.analysisType,
        responseCount: validatedRequest.responses.length,
        workflowId: difyConfig.DIFY_ANALYSIS_WORKFLOW_ID
      });

      // Validate responses data
      if (!validatedRequest.responses || validatedRequest.responses.length === 0) {
        throw new Error('No responses provided for analysis');
      }

      // Make actual API call to Dify in blocking mode
      const difyRequest: DifyApiRequest = {
        workflow_id: difyConfig.DIFY_ANALYSIS_WORKFLOW_ID,
        inputs: {
          user_id: validatedRequest.userId.toString(),
          session_id: validatedRequest.sessionId,
          responses: JSON.stringify(validatedRequest.responses),
          user_profile: JSON.stringify(validatedRequest.userProfile),
          analysis_type: validatedRequest.analysisType,
          options: JSON.stringify(validatedRequest.options || {}),
          response_count: validatedRequest.responses.length.toString(),
        },
        response_mode: 'blocking', // Use blocking mode for immediate response
        user: `user_${validatedRequest.userId}`,
      };

      console.log('🚀 Sending request to Dify API:', {
        workflow_id: difyRequest.workflow_id,
        user: difyRequest.user,
        response_mode: difyRequest.response_mode,
        inputKeys: Object.keys(difyRequest.inputs)
      });

      const response = await this.makeRequest(
        'workflows/run', 
        difyRequest,
        `analysis_${validatedRequest.sessionId}`
      );

      console.log('✅ Dify API response received:', {
        workflow_run_id: response.workflow_run_id,
        status: response.data.status,
        outputKeys: Object.keys(response.data.outputs || {})
      });

      // Transform Dify response to our format
      return this.transformDifyAnalysisResponse(response);
    } catch (error) {
      console.error('❌ Error analyzing responses:', error);
      
      // Enhanced error logging
      if (error instanceof DifyApiError) {
        console.error('📌 Dify API Error Details:', {
          message: error.message,
          statusCode: error.statusCode,
          response: error.response,
          workflowId: error.workflowId
        });
      }
      
      // Force real API usage - throw error instead of using fallback
      if (error instanceof DifyApiError || error instanceof DifyTimeoutError) {
        console.log('❌ Dify API error - no fallback, throwing error');
        throw error;
      }
      
      throw new Error(`Failed to analyze responses: ${error.message}`);
    }
  }

  /**
   * Analyze user responses with real-time streaming progress
   */
  async analyzeResponsesWithStreaming(
    request: DifyAnalysisRequest,
    onProgress?: (progress: {
      stage: string;
      progress: number;
      message: string;
      details?: any;
    }) => void
  ): Promise<DifyAnalysisResponse> {
    try {
      // Validate request
      const validatedRequest = difyAnalysisRequestSchema.parse(request);
      
      // Enhanced logging for debugging
      console.log('📊 Preparing Dify streaming analysis request:', {
        userId: validatedRequest.userId,
        sessionId: validatedRequest.sessionId,
        analysisType: validatedRequest.analysisType,
        responseCount: validatedRequest.responses.length,
        workflowId: difyConfig.DIFY_ANALYSIS_WORKFLOW_ID
      });

      // Validate responses data
      if (!validatedRequest.responses || validatedRequest.responses.length === 0) {
        throw new Error('No responses provided for streaming analysis');
      }

      // Make actual API call to Dify in streaming mode
      const difyRequest: DifyApiRequest = {
        workflow_id: difyConfig.DIFY_ANALYSIS_WORKFLOW_ID,
        inputs: {
          user_id: validatedRequest.userId.toString(),
          session_id: validatedRequest.sessionId,
          responses: JSON.stringify(validatedRequest.responses),
          user_profile: JSON.stringify(validatedRequest.userProfile),
          analysis_type: validatedRequest.analysisType,
          options: JSON.stringify(validatedRequest.options || {}),
          response_count: validatedRequest.responses.length.toString(),
        },
        response_mode: 'streaming', // Use streaming mode for real-time progress
        user: `user_${validatedRequest.userId}`,
      };

      console.log('🚀 Sending streaming request to Dify API:', {
        workflow_id: difyRequest.workflow_id,
        user: difyRequest.user,
        response_mode: difyRequest.response_mode,
        inputKeys: Object.keys(difyRequest.inputs)
      });

      const response = await this.makeStreamingRequest(
        'workflows/run', 
        difyRequest,
        `analysis_${validatedRequest.sessionId}`,
        onProgress
      );

      console.log('✅ Dify streaming API response received:', {
        workflow_run_id: response.workflow_run_id,
        status: response.data.status,
        outputKeys: Object.keys(response.data.outputs || {})
      });

      // Transform Dify response to our format
      return this.transformDifyAnalysisResponse(response);
    } catch (error) {
      console.error('❌ Error analyzing responses with streaming:', error);
      
      // Enhanced error logging
      if (error instanceof DifyApiError) {
        console.error('📌 Dify Streaming API Error Details:', {
          message: error.message,
          statusCode: error.statusCode,
          response: error.response,
          workflowId: error.workflowId
        });
      }
      
      // Force real API usage - throw error instead of using fallback
      if (error instanceof DifyApiError || error instanceof DifyTimeoutError) {
        console.log('❌ Dify API error - no fallback, throwing error');
        throw error;
      }
      
      throw new Error(`Failed to analyze responses: ${error.message}`);
    }
  }

  /**
   * Test connection to Dify API
   */
  async testConnection(): Promise<{ connected: boolean; mode: string; error?: string }> {
    try {
      // Only test real API connection - no simulation mode

      // Test with a minimal request
      const testRequest: DifyApiRequest = {
        workflow_id: 'health-check',
        inputs: { test: 'connection' },
        response_mode: 'blocking',
        user: 'health-check-user',
      };

      const response = await fetch(buildDifyApiUrl('workflows/run'), {
        method: 'POST',
        headers: DIFY_REQUEST_CONFIG.headers,
        body: JSON.stringify(testRequest),
        signal: AbortSignal.timeout(5000), // 5 second timeout for health check
      });

      return { 
        connected: response.ok || response.status === 404, // 404 is OK (workflow not found)
        mode: 'production',
        error: response.ok ? undefined : `HTTP ${response.status}`
      };
    } catch (error) {
      console.error('Dify connection test failed:', error);
      return { 
        connected: false, 
        mode: 'production',
        error: error.message 
      };
    }
  }

  /**
   * Transform Dify API response to our question format
   */
  private transformDifyQuestionResponse(response: DifyApiResponse): DifyQuestionResponse {
    const outputs = response.data.outputs;
    
    return {
      question: {
        text: outputs.question_text || 'Generated question text',
        type: outputs.question_type || 'textarea',
        category: outputs.category || 'general',
        options: outputs.options ? JSON.parse(outputs.options) : {},
        reasoning: outputs.reasoning || 'AI-generated based on user responses',
        importance: outputs.importance || 7,
      },
      followUpSuggestions: outputs.follow_up_suggestions ? 
        JSON.parse(outputs.follow_up_suggestions) : [],
      confidenceScore: outputs.confidence_score || 0.85,
      metadata: {
        generatedAt: new Date().toISOString(),
        modelVersion: outputs.model_version || 'dify-production',
        processingTime: response.data.elapsed_time || 0,
        workflowRunId: response.workflow_run_id,
        totalTokens: response.metadata?.usage?.total_tokens || 0,
      },
    };
  }

  /**
   * Transform Dify API response to our analysis format
   */
  private transformDifyAnalysisResponse(response: DifyApiResponse): DifyAnalysisResponse {
    const outputs = response.data.outputs;
    
    return {
      analysis: {
        summary: outputs.summary || 'Analysis summary generated by AI',
        insights: outputs.insights ? JSON.parse(outputs.insights) : [],
        scores: outputs.scores ? JSON.parse(outputs.scores) : [],
        recommendations: outputs.recommendations ? JSON.parse(outputs.recommendations) : [],
      },
      metadata: {
        analysisId: response.workflow_run_id,
        generatedAt: new Date().toISOString(),
        modelVersion: outputs.model_version || 'dify-production',
        processingTime: response.data.elapsed_time || 0,
        totalTokens: response.metadata?.usage?.total_tokens || 0,
      },
    };
  }




}

// Export singleton instance with production configuration
// Helper function to map progress to stage
function getStageFromProgress(progress: number): string {
  if (progress < 45) return 'processing';
  if (progress < 65) return 'analyzing';
  if (progress < 85) return 'generating';
  return 'finalizing';
}

export const difyService = new DifyService({
  workflowId: difyConfig.DIFY_QUESTION_WORKFLOW_ID,
  apiKey: difyConfig.DIFY_API_KEY,
  baseUrl: difyConfig.DIFY_API_BASE_URL,
  version: difyConfig.DIFY_API_VERSION,
});

// Export health check function
export async function checkDifyHealth() {
  return difyService.testConnection();
}

// Export error types for better error handling
export { DifyApiError, DifyTimeoutError, DifyQuotaError } from '@/lib/config/dify-config';

export default difyService;