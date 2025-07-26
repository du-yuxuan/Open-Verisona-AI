// Foundation Questionnaire Dify Integration Service
// Handles sending foundation questionnaire responses to Dify and creating new AI questionnaires

import { difyConfig } from '@/lib/config/dify-config';

export interface FoundationQuestionnaireResponse {
  Q1: string | {
    transfer_method: 'local_file';
    upload_file_id: string;
    type: 'document';
  }; // 成绩单或简历文件 (File Upload or text)
  Q2: string; // 个人生活陈述 (Long Text)
  Q3: string; // 个人爱好陈述 (Long Text)
  Q4: string; // 个人品质陈述 (Long Text)
  Q5: string; // 未来展望陈述 (Long Text)
}

export interface DifyFoundationRequest {
  inputs: {
    Q1: string | {
      transfer_method: 'local_file';
      upload_file_id: string;
      type: 'document';
    };
    Q2: string;
    Q3: string;
    Q4: string;
    Q5: string;
  };
  response_mode: 'blocking';
  user: string;
}

export interface DifyFoundationResponse {
  workflow_run_id: string;
  task_id: string;
  data: {
    id: string;
    workflow_id: string;
    status: 'succeeded' | 'failed' | 'running' | 'stopped';
    outputs: {
      result?: Array<string>; // The Array<String> output from Dify
      Answer?: Array<string>; // The Answer array from Dify workflow
      output?: Array<string>; // The actual output field from Dify workflow
    };
    error?: string;
    elapsed_time: number;
    total_tokens: number;
  };
}

export class DifyFoundationService {
  private readonly apiKey = 'app-WVb62JtcIeouf5M64otjippS';
  private readonly workflowId = '4ab76426-bd0e-481c-8744-7e410f2644ed';
  private readonly baseUrl = 'https://api.dify.ai/v1';

  /**
   * Get MIME type based on file extension
   */
  private getMimeType(extension: string): string {
    const mimeTypes: { [key: string]: string } = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'xls': 'application/vnd.ms-excel',
      'csv': 'text/csv',
      'html': 'text/html',
      'xml': 'application/xml',
      'json': 'application/json'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Upload file to Dify
   */
  async uploadFile(fileData: Blob | Buffer, fileName: string, user: string): Promise<string> {
    const uploadUrl = `${this.baseUrl}/files/upload`;
    
    const formData = new FormData();
    
    // Convert Buffer to Blob if needed
    let fileBlob: Blob;
    if (fileData instanceof Buffer) {
      // Get file extension to determine MIME type
      const extension = fileName.split('.').pop()?.toLowerCase();
      const mimeType = this.getMimeType(extension || '');
      fileBlob = new Blob([fileData], { type: mimeType });
    } else {
      fileBlob = fileData;
    }
    
    formData.append('file', fileBlob, fileName);
    formData.append('user', user);
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.id; // Return the upload file ID
  }

  /**
   * Send foundation questionnaire responses to Dify workflow
   */
  async processFoundationResponses(
    responses: FoundationQuestionnaireResponse,
    userId: string
  ): Promise<Array<string>> {
    try {
      // Prepare request payload according to Dify documentation
      // Files should be passed as file objects in inputs, not in a separate files array
      const requestPayload: DifyFoundationRequest = {
        inputs: {
          Q1: responses.Q1, // This can be either a string or a file object
          Q2: responses.Q2,
          Q3: responses.Q3,
          Q4: responses.Q4,
          Q5: responses.Q5,
        },
        response_mode: 'blocking',
        user: userId,
      };

      console.log('Dify request payload:', JSON.stringify(requestPayload, null, 2));

      // Make request to Dify workflow
      const response = await fetch(`${this.baseUrl}/workflows/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Dify API error response:', errorData);
        
        // If the error is about Q1 needing to be a file, provide a helpful error message
        if (errorData.message && errorData.message.includes('Q1 in input form must be a file')) {
          throw new Error('Dify workflow requires Q1 to be a file upload. Please ensure a file is uploaded for the transcript question.');
        }
        
        throw new Error(`Dify workflow failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`);
      }

      const result: DifyFoundationResponse = await response.json();
      console.log('Dify workflow result:', JSON.stringify(result, null, 2));

      if (result.data.status === 'failed') {
        throw new Error(`Dify workflow execution failed: ${result.data.error || 'Unknown error'}`);
      }

      if (result.data.status === 'succeeded') {
        // 优先使用Answer数据，如果没有则使用result数据，最后使用output数据
        const answer = result.data.outputs?.Answer || result.data.outputs?.result || result.data.outputs?.output;
        if (answer && Array.isArray(answer)) {
          console.log('Dify返回的问题数据:', answer);
          return answer;
        }
      }

      throw new Error('Dify workflow completed but no valid Answer or result received');

    } catch (error) {
      console.error('Error processing foundation questionnaire with Dify:', error);
      throw error;
    }
  }

  /**
   * Check workflow run status
   */
  async getWorkflowStatus(workflowRunId: string): Promise<DifyFoundationResponse> {
    const response = await fetch(`${this.baseUrl}/workflows/run/${workflowRunId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get workflow status: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

// Export singleton instance
export const difyFoundationService = new DifyFoundationService();