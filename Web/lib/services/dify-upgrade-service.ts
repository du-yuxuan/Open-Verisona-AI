// Upgrade Questionnaire Dify Integration Service
// Handles final analysis after completing AI-generated upgrade questionnaire

import { difyConfig } from '@/lib/config/dify-config';
import { difyAsyncService } from './dify-async-service';

export interface DifyUpgradeRequest {
  inputs: {
    question: string; // Combined foundation + upgrade questions and answers as string
  };
  response_mode: 'blocking';
  user: string;
}

export interface DifyUpgradeResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'succeeded' | 'failed' | 'running' | 'stopped';
    outputs: {
      text?: string; // The markdown output from Dify
      output?: string; // Alternative output field
      result?: string; // Another possible output field
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
  };
}

export class DifyUpgradeService {
  private readonly apiKey = 'app-SDsVCJYPKtDNPH0nOmowc6F4';
  private readonly workflowId = '7fb812fd-14f1-43e0-b5a1-b6054221e6b1';
  private readonly baseUrl = 'https://api.dify.ai/v1';
  private readonly maxRetries = 3;
  private readonly timeout = 200000; // 200秒超时
  private readonly maxInputLength = 50000; // 最大输入长度（约50KB）
  private readonly progressCallback: ((message: string) => void) | null = null;
  

  
  /**
   * Process final analysis with combined foundation + upgrade questionnaire responses
   */
  async processUpgradeCompletion(
    combinedQuestionsAndAnswers: string,
    userId: string
  ): Promise<string> {
    const startTime = Date.now();
    
    try {
      console.log('🚀 Processing upgrade completion with string input:', {
        dataLength: combinedQuestionsAndAnswers.length,
        preview: combinedQuestionsAndAnswers.substring(0, 200) + '...'
      });
      
      console.log('⚙️ Configuration:', {
        maxRetries: this.maxRetries,
        timeoutSeconds: this.timeout / 1000,
        maxInputLength: this.maxInputLength
      });
      
      // 截断过长的输入以避免超时
      let processedInput = combinedQuestionsAndAnswers;
      if (combinedQuestionsAndAnswers.length > this.maxInputLength) {
        console.log(`Input too large (${combinedQuestionsAndAnswers.length} chars), truncating to ${this.maxInputLength} chars`);
        processedInput = combinedQuestionsAndAnswers.substring(0, this.maxInputLength);
      }
      
      // 清理输入数据，移除可能导致问题的特殊字符
      processedInput = processedInput
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ') // 移除控制字符
        .replace(/\s+/g, ' ') // 合并多余空格
        .trim();
      
      // Prepare request payload with direct string input
      const requestPayload: DifyUpgradeRequest = {
        inputs: {
          question: processedInput // Direct string input to "question" field
        },
        response_mode: 'blocking',
        user: `user_${userId}`
      };
      
      console.log('Dify upgrade request payload size:', JSON.stringify(requestPayload).length, 'bytes');

      // 使用重试机制发送请求
      let response;
      let retries = 0;
      
      while (retries <= this.maxRetries) {
        try {
          const attemptMessage = `📡 Sending request to Dify workflow (attempt ${retries + 1}/${this.maxRetries + 1})`;
          console.log(attemptMessage);
          
          // 使用AbortController设置超时
          const controller = new AbortController();
          const timeoutId = setTimeout(() => {
            console.log(`⏰ Request timeout after ${this.timeout / 1000} seconds, aborting...`);
            controller.abort();
          }, this.timeout);
          
          // 添加进度指示器
          const progressInterval = setInterval(() => {
            console.log(`⏳ Still waiting for Dify response... (${Math.floor((Date.now() - startTime) / 1000)}s elapsed)`);
          }, 10000); // 每10秒显示进度
          
          try {
            response = await fetch(`${this.baseUrl}/workflows/run`, {
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
            clearInterval(progressInterval);
            
            // 如果请求成功，停止重试
            if (response.ok) {
              break;
            }
            
            // 如果是400错误，记录错误信息但不重试
            if (response.status === 400) {
              const errorData = await response.text();
              console.error('🔧 400 Bad Request Details:', errorData);
              break;
            }
            
            // 如果是504错误，检查是否应该切换到异步模式
            if (response.status === 504) {
              console.log('🔄 Detected Cloudflare Gateway Timeout (504)');
              
              // 在第2次或以后的重试中切换到异步模式
              if (retries >= 1) {
                console.log('🔄 Switching to async polling mode to handle long-running workflow...');
                try {
                  const asyncResult = await difyAsyncService.processUpgradeCompletionAsync(
                    combinedQuestionsAndAnswers,
                    userId
                  );
                  console.log('✅ Async mode completed successfully');
                  return asyncResult;
                } catch (asyncError) {
                  console.error('❌ Async mode also failed:', asyncError.message);
                  // 继续原有的重试逻辑
                }
              }
              
              const waitTime = Math.pow(2, retries) * 1000;
              console.log(`⏸️ Gateway timeout, retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retries++;
              continue;
            }
            
            // 其他错误，直接退出重试
            break;
            
          } catch (fetchError) {
            clearTimeout(timeoutId);
            clearInterval(progressInterval);
            if (fetchError.name === 'AbortError') {
              console.error(`⏰ Request timeout reached after ${this.timeout / 1000}s, retrying...`);
              const waitTime = Math.pow(2, retries) * 1000;
              console.log(`⏸️ Waiting ${waitTime / 1000}s before retry...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retries++;
              continue;
            }
            throw fetchError;
          }
          
        } catch (error) {
          console.error(`❌ Attempt ${retries + 1} failed:`, error.message);
          retries++;
          if (retries > this.maxRetries) {
            console.error(`🚫 All ${this.maxRetries + 1} attempts failed. Giving up.`);
            throw error;
          }
          const waitTime = Math.pow(2, retries) * 1000;
          console.log(`⏸️ Waiting ${waitTime / 1000}s before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Dify workflow request failed after retries:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });
        
        // 400错误特殊处理
        if (response.status === 400) {
          console.log('🔄 400 error detected, trying async mode as fallback...');
          try {
            const asyncResult = await difyAsyncService.processUpgradeCompletionAsync(
              processedInput,
              userId
            );
            console.log('✅ Async mode succeeded as fallback for 400 error');
            return asyncResult;
          } catch (asyncError) {
            console.error('❌ Async mode fallback also failed:', asyncError.message);
            throw new Error(`Request format error. Both sync and async modes failed. Please try again later or contact support.`);
          }
        }
        
        // 504错误提供更友好的错误信息，并尝试异步模式
        if (response.status === 504) {
          console.log('🔄 Final attempt: Trying async mode for 504 timeout...');
          try {
            const asyncResult = await difyAsyncService.processUpgradeCompletionAsync(
              processedInput,
              userId
            );
            console.log('✅ Async mode succeeded as fallback');
            return asyncResult;
          } catch (asyncError) {
            console.error('❌ Async mode fallback also failed:', asyncError.message);
            throw new Error(`Dify workflow timed out. Both sync and async modes failed. The request may contain too much data or the service is currently busy. Try submitting a shorter response.`);
          }
        } else {
          throw new Error(`Dify workflow request failed: ${response.status} ${response.statusText}`);
        }
      }

      const result: DifyUpgradeResponse = await response.json();
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ Dify workflow completed successfully in ${processingTime / 1000}s`);
      console.log('📊 Workflow statistics:', {
        workflow_id: result.data.workflow_id,
        status: result.data.status,
        elapsed_time: result.data.elapsed_time,
        total_tokens: result.data.total_tokens,
        total_steps: result.data.total_steps || 'N/A'
      });

      // Check workflow status
      if (result.data.status !== 'succeeded') {
        console.error('❌ Dify upgrade workflow failed:', result.data.error || 'Unknown error');
        
        // 如果是结构化输出解析错误，但有内容，我们仍然尝试处理
        if (result.data.error && result.data.error.includes('Failed to parse structured output')) {
          console.log('🔧 Attempting to extract content from parsing error...');
          // 尝试从错误信息中提取实际内容
          const errorContent = result.data.error.split('Failed to parse structured output: ').pop();
          if (errorContent && errorContent.trim()) {
            console.log('✅ Found content in error message, proceeding with extraction');
            return this.formatKeywordListToMarkdown(errorContent.trim());
          }
        }
        
        throw new Error(`Dify upgrade workflow failed: ${result.data.error || 'Unknown error'}`);
      }

      // Extract output from various possible fields
      let rawOutput = result.data.outputs.text || result.data.outputs.output || result.data.outputs.result || '';
      
      if (!rawOutput) {
        console.error('❌ No output received from Dify upgrade workflow');
        throw new Error('No output received from Dify');
      }

      console.log(`📄 Raw output received: ${rawOutput.length} characters`);
      console.log('📝 Raw output type:', typeof rawOutput);
      
      // 处理不同类型的输出格式
      let processedOutput: string;
      
      if (typeof rawOutput === 'string') {
        // 检查是否是关键词列表格式
        if (rawOutput.includes('\n') && rawOutput.split('\n').length > 10) {
          console.log('🔧 Detected keyword list format, converting to markdown...');
          processedOutput = this.formatKeywordListToMarkdown(rawOutput);
        } else {
          processedOutput = rawOutput;
        }
      } else if (Array.isArray(rawOutput)) {
        console.log('🔧 Detected array format, converting to markdown...');
        processedOutput = this.formatArrayToMarkdown(rawOutput);
      } else if (typeof rawOutput === 'object') {
        console.log('🔧 Detected object format, converting to markdown...');
        processedOutput = this.formatObjectToMarkdown(rawOutput);
      } else {
        processedOutput = String(rawOutput);
      }
      
      console.log(`📄 Processed output: ${processedOutput.length} characters`);
      if (processedOutput.length > 1000) {
        console.log('📝 Preview:', processedOutput.substring(0, 500) + '...');
      } else {
        console.log('📝 Full result:', processedOutput);
      }
      
      return processedOutput;

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Error processing upgrade completion with Dify after ${processingTime / 1000}s:`, error.message);
      
      // 提供更详细的错误信息
      if (error.message.includes('timeout')) {
        console.error('💡 Suggestion: The request may be too complex or the service is experiencing high load');
      } else if (error.message.includes('not published')) {
        console.error('💡 Suggestion: The Dify workflow may not be published or the API key may be incorrect');
      } else if (error.message.includes('Gateway')) {
        console.error('💡 Suggestion: Network or server issues detected, try again later');
      }
      
      throw error;
    }
  }

  /**
   * Process upgrade questionnaire - alias for processUpgradeCompletion
   */
  async processUpgradeQuestionnaire(combinedQuestionsAndAnswers: string): Promise<{success: boolean, data?: string, error?: string}> {
    console.log('🔄 Starting upgrade questionnaire processing (legacy method)');
    try {
      const result = await this.processUpgradeCompletion(combinedQuestionsAndAnswers, `user-${Date.now()}`);
      console.log('✅ Legacy method completed successfully');
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('❌ Legacy method failed:', error.message);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 格式化关键词列表为Markdown格式
   */
  private formatKeywordListToMarkdown(keywordList: string): string {
    console.log('🔧 Converting keyword list to markdown format');
    
    // 如果已经是markdown格式，直接返回
    if (keywordList.includes('##') || keywordList.includes('**') || keywordList.includes('- ')) {
      console.log('✅ Already in markdown format');
      return keywordList;
    }
    
    // 按行分割并过滤空行
    const lines = keywordList.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      return keywordList;
    }
    
    // 尝试识别结构并转换为markdown
    let markdown = '';
    let currentSection = '';
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // 检查是否是标题行（通常以数字或大写字母开头）
      if (/^\d+\.|^[A-Z][^a-z]*$|^[A-Z][A-Z\s]+:/.test(trimmedLine)) {
        if (currentSection) {
          markdown += '\n';
        }
        markdown += `## ${trimmedLine}\n\n`;
        currentSection = trimmedLine;
      } 
      // 检查是否是子项目（以-或•开头）
      else if (/^[-•]/.test(trimmedLine)) {
        markdown += `${trimmedLine}\n`;
      }
      // 检查是否是关键词（短词或短语）
      else if (trimmedLine.length < 100 && !trimmedLine.includes('。') && !trimmedLine.includes('.')) {
        markdown += `- ${trimmedLine}\n`;
      }
      // 其他情况作为段落处理
      else {
        markdown += `\n${trimmedLine}\n\n`;
      }
    }
    
    console.log('✅ Converted to markdown format');
    return markdown;
  }
  
  /**
   * 格式化数组为Markdown格式
   */
  private formatArrayToMarkdown(array: any[]): string {
    console.log('🔧 Converting array to markdown format');
    
    if (!Array.isArray(array) || array.length === 0) {
      return '';
    }
    
    let markdown = '';
    
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      
      if (typeof item === 'string') {
        markdown += `- ${item}\n`;
      } else if (typeof item === 'object' && item !== null) {
        markdown += `## 项目 ${i + 1}\n\n`;
        markdown += this.formatObjectToMarkdown(item);
        markdown += '\n';
      } else {
        markdown += `- ${String(item)}\n`;
      }
    }
    
    console.log('✅ Converted array to markdown format');
    return markdown;
  }
  
  /**
   * 格式化对象为Markdown格式
   */
  private formatObjectToMarkdown(obj: any): string {
    console.log('🔧 Converting object to markdown format');
    
    if (typeof obj !== 'object' || obj === null) {
      return String(obj);
    }
    
    let markdown = '';
    
    for (const [key, value] of Object.entries(obj)) {
      markdown += `**${key}**: `;
      
      if (Array.isArray(value)) {
        markdown += '\n';
        for (const item of value) {
          markdown += `- ${String(item)}\n`;
        }
      } else if (typeof value === 'object' && value !== null) {
        markdown += '\n';
        markdown += this.formatObjectToMarkdown(value);
      } else {
        markdown += `${String(value)}\n`;
      }
      
      markdown += '\n';
    }
    
    console.log('✅ Converted object to markdown format');
    return markdown;
  }
}

// Export singleton instance
export const difyUpgradeService = new DifyUpgradeService();