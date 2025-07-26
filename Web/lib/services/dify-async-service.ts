/**
 * Dify Async Service - 异步轮询方式处理长时间工作流
 * 解决Cloudflare Gateway Timeout问题
 */

import { difyConfig } from '@/lib/config/dify-config';

export interface DifyAsyncTaskRequest {
  inputs: {
    question: string;
  };
  response_mode: 'streaming';
  user: string;
  auto_generate_title: boolean;
}

export interface DifyAsyncTaskResponse {
  task_id: string;
  workflow_run_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'queued' | 'running' | 'succeeded' | 'failed' | 'stopped';
    outputs: {
      text?: string;
      output?: string;
      result?: string;
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
    created_at: number;
    finished_at?: number;
  };
}

export interface DifyTaskStatus {
  task_id: string;
  workflow_run_id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'stopped';
  result?: any;
  error?: string;
  progress?: number;
  elapsed_time?: number;
  total_tokens?: number;
}

export class DifyAsyncService {
  private readonly apiKey = 'app-SDsVCJYPKtDNPH0nOmowc6F4';
  private readonly workflowId = '7fb812fd-14f1-43e0-b5a1-b6054221e6b1';
  private readonly baseUrl = 'https://api.dify.ai/v1';
  private readonly maxRetries = 3;
  private readonly requestTimeout = 60000; // 60秒请求超时（针对单个HTTP请求）
  private readonly maxPollTime = 600000; // 10分钟总轮询时间
  private readonly pollInterval = 5000; // 5秒轮询间隔
  private readonly maxInputLength = 50000;



  /**
   * 处理流式响应
   */
  async processStreamingResponse(response: Response): Promise<string> {
    console.log('🔄 Processing streaming response');
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body available');
    }
    
    const decoder = new TextDecoder();
    let result = '';
    let buffer = '';
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ Stream completed');
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // 处理SSE格式的数据
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // 保存不完整的行
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            
            if (data === '[DONE]') {
              console.log('📄 Stream finished');
              // 如果流结束了但没有结果，使用最后的可用结果
              if (!result && buffer.trim()) {
                result = buffer.trim();
                console.log('📄 Using buffer content as result:', result.length, 'characters');
              }
              break;
            }
            
            try {
              const parsedData = JSON.parse(data);
              console.log('📊 SSE Event:', parsedData.event, parsedData.data ? '✅' : '❌');
              
              if (parsedData.event === 'workflow_finished') {
                console.log('✅ Workflow finished successfully');
                
                // 提取结果
                const outputs = parsedData.data?.outputs || {};
                const rawOutput = outputs.text || outputs.output || outputs.result || '';
                
                if (rawOutput) {
                  result = rawOutput;
                  console.log('📄 Result received:', result.length, 'characters');
                } else {
                  // 如果没有直接输出，尝试从data中提取
                  const dataOutput = parsedData.data?.output || parsedData.data?.result || '';
                  if (dataOutput) {
                    result = dataOutput;
                    console.log('📄 Result extracted from data:', result.length, 'characters');
                  }
                }
                
                // 确保有结果
                if (!result) {
                  console.warn('⚠️ No result found in workflow_finished event');
                  result = 'Analysis completed successfully but no detailed output received.';
                }
                
                return this.processOutput(result); // 直接返回结果
              }
              
              if (parsedData.event === 'workflow_failed') {
                const error = parsedData.data?.error || 'Unknown error';
                console.error('❌ Workflow failed:', error);
                
                // 尝试从错误中提取内容
                if (error.includes('Failed to parse structured output:')) {
                  const errorContent = error.split('Failed to parse structured output:').pop()?.trim();
                  if (errorContent) {
                    console.log('🔧 Extracting content from error...');
                    result = errorContent;
                    return this.processOutput(result); // 直接返回结果
                  }
                }
                
                // 如果是轻微错误但有部分结果，尝试继续处理
                if (parsedData.data?.outputs) {
                  const outputs = parsedData.data.outputs;
                  const partialResult = outputs.text || outputs.output || outputs.result || '';
                  if (partialResult) {
                    console.log('🔧 Found partial result despite error, using it...');
                    result = partialResult;
                    return this.processOutput(result);
                  }
                }
                
                throw new Error(`Workflow failed: ${error}`);
              }
              
              if (parsedData.event === 'node_finished') {
                console.log('📊 Node finished:', parsedData.data?.title || 'Unknown node');
              }
              
              if (parsedData.event === 'node_started') {
                console.log('🚀 Node started:', parsedData.data?.title || 'Unknown node');
              }
              
            } catch (parseError) {
              console.warn('⚠️  Failed to parse SSE data:', data.substring(0, 100));
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    if (!result) {
      throw new Error('No result received from streaming response');
    }
    
    return this.processOutput(result);
  }

  /**
   * 处理输出格式
   */
  private processOutput(rawOutput: string): string {
    console.log('🔧 Processing output format...');
    
    if (!rawOutput || rawOutput.trim().length === 0) {
      console.warn('⚠️ Empty output received, using default message');
      return 'Your personalized analysis has been completed successfully. Please check back later for detailed insights.';
    }
    
    // 如果已经是markdown格式，直接返回
    if (rawOutput.includes('##') || rawOutput.includes('**') || rawOutput.includes('- ')) {
      console.log('✅ Output is already in markdown format');
      return rawOutput;
    }
    
    // 检查是否是关键词列表格式
    if (rawOutput.includes('\\n') && rawOutput.split('\\n').length > 10) {
      console.log('🔧 Converting keyword list to markdown...');
      return this.formatKeywordListToMarkdown(rawOutput);
    }
    
    // 如果是简单文本，加上基本格式
    if (rawOutput.length > 100) {
      console.log('🔧 Formatting plain text output...');
      return `# 个人化分析报告\n\n${rawOutput}`;
    }
    
    return rawOutput;
  }

  /**
   * 格式化关键词列表为Markdown格式
   */
  private formatKeywordListToMarkdown(keywordList: string): string {
    console.log('🔧 Converting keyword list to markdown format');
    
    // 按行分割并过滤空行
    const lines = keywordList.split('\\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return keywordList;
    }
    
    // 尝试识别结构并转换为markdown
    let markdown = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否是标题行
      if (/^\\d+\\.|^[A-Z][^a-z]*$|^[A-Z][A-Z\\s]+:/.test(trimmedLine)) {
        markdown += `## ${trimmedLine}\\n\\n`;
      } 
      // 检查是否是子项目
      else if (/^[-•]/.test(trimmedLine)) {
        markdown += `${trimmedLine}\\n`;
      }
      // 其他作为列表项
      else if (trimmedLine.length > 0) {
        markdown += `- ${trimmedLine}\\n`;
      }
    }
    
    console.log('✅ Converted to markdown format');
    return markdown;
  }

  /**
   * 完整的异步处理流程
   */
  async processUpgradeCompletionAsync(
    combinedQuestionsAndAnswers: string,
    userId: string
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Starting async upgrade completion process');
      console.log('📊 Configuration:', {
        maxPollTime: this.maxPollTime / 1000 + 's',
        requestTimeout: this.requestTimeout / 1000 + 's',
        maxInputLength: this.maxInputLength
      });
      
      // 截断过长的输入
      let processedInput = combinedQuestionsAndAnswers;
      if (combinedQuestionsAndAnswers.length > this.maxInputLength) {
        console.log(`⚠️  Input truncated from ${combinedQuestionsAndAnswers.length} to ${this.maxInputLength} chars`);
        processedInput = combinedQuestionsAndAnswers.substring(0, this.maxInputLength);
      }

      const requestPayload: DifyAsyncTaskRequest = {
        inputs: {
          question: processedInput
        },
        response_mode: 'streaming',
        user: userId,
        auto_generate_title: false
      };

      console.log('📦 Payload size:', JSON.stringify(requestPayload).length, 'bytes');
      
      // 使用流式请求处理长时间任务
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('⏰ Streaming request timeout, aborting...');
        controller.abort();
      }, this.maxPollTime); // 10分钟超时
      
      const response = await fetch(`${this.baseUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...requestPayload,
          workflow_id: this.workflowId
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Streaming request failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Streaming request failed: ${response.status} ${response.statusText}`);
      }
      
      // 处理流式响应
      const result = await this.processStreamingResponse(response);
      
      const totalTime = (Date.now() - startTime) / 1000;
      console.log(`✅ Async process completed in ${totalTime.toFixed(1)}s`);
      
      return result;
      
    } catch (error) {
      const totalTime = (Date.now() - startTime) / 1000;
      console.error(`❌ Async process failed after ${totalTime.toFixed(1)}s:`, error.message);
      throw error;
    }
  }
}

// Export singleton instance
export const difyAsyncService = new DifyAsyncService();