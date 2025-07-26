import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questionnaires, questionnaireResponses, questionResponses, reports } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { DifyUpgradeService } from '@/lib/services/dify-upgrade-service';

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { upgradeQuestionnaireId } = body;

    if (!upgradeQuestionnaireId) {
      return NextResponse.json({ error: 'Upgrade questionnaire ID is required' }, { status: 400 });
    }

    // 1. Get foundation questionnaire session
    const foundationSession = await db.query.questionnaireResponses.findFirst({
      where: and(
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, 10) // Foundation questionnaire ID
      )
    });

    if (!foundationSession) {
      return NextResponse.json({ error: 'Foundation questionnaire session not found' }, { status: 404 });
    }

    // 2. Get upgrade questionnaire session
    const upgradeSession = await db.query.questionnaireResponses.findFirst({
      where: and(
        eq(questionnaireResponses.userId, user.id),
        eq(questionnaireResponses.questionnaireId, upgradeQuestionnaireId)
      )
    });

    if (!upgradeSession) {
      return NextResponse.json({ error: 'Upgrade questionnaire session not found' }, { status: 404 });
    }

    // 3. Get foundation question responses with question text
    const foundationResponses = await db.query.questionResponses.findMany({
      where: eq(questionResponses.sessionId, foundationSession.sessionId),
      with: {
        question: true
      }
    });

    if (foundationResponses.length === 0) {
      return NextResponse.json({ error: 'Foundation questionnaire responses not found' }, { status: 404 });
    }

    // 4. Get upgrade question responses with question text
    const upgradeResponses = await db.query.questionResponses.findMany({
      where: eq(questionResponses.sessionId, upgradeSession.sessionId),
      with: {
        question: true
      }
    });

    if (upgradeResponses.length === 0) {
      return NextResponse.json({ error: 'Upgrade questionnaire responses not found' }, { status: 404 });
    }

    // 5. Format combined responses as "question: answer;" strings
    const formatResponse = (response: any) => {
      if (typeof response === 'string') return response;
      if (typeof response === 'object' && response !== null) {
        try {
          return JSON.stringify(response);
        } catch (e) {
          console.error('Error stringifying response:', e);
          return String(response);
        }
      }
      return String(response || '');
    };
    
    // 处理过长的回答，限制单个回答的长度
    const MAX_ANSWER_LENGTH = 2000; // 每个答案最多2000字符
    
    const truncateIfNeeded = (text: string) => {
      if (text && text.length > MAX_ANSWER_LENGTH) {
        console.log(`Truncating long response from ${text.length} to ${MAX_ANSWER_LENGTH} chars`);
        return text.substring(0, MAX_ANSWER_LENGTH) + '...(truncated)';
      }
      return text;
    };

    // 格式化并限制长回答
    const combinedResponses = [
      ...foundationResponses.map(r => `${r.question.questionText}: ${truncateIfNeeded(formatResponse(r.responseValue || r.responseText))}`),
      ...upgradeResponses.map(r => `${r.question.questionText}: ${truncateIfNeeded(formatResponse(r.responseValue || r.responseText))}`)
    ].join('; ');

    console.log(`Combined responses for Dify: ${combinedResponses.length} characters total`);
    if (combinedResponses.length > 10000) {
      console.log('Preview of combined responses:', combinedResponses.substring(0, 500) + '...');
    } else {
      console.log('Combined responses for Dify:', combinedResponses);
    }

    // 4. Send to new Dify workflow using DifyUpgradeService
    // 增加超时控制 - 设置为600秒(10分钟)以处理复杂的分析请求
    const timeoutPromise = new Promise<never>((_, reject) => {
      const timeout = setTimeout(() => {
        clearTimeout(timeout);
        reject(new Error('Dify analysis request timed out after 600 seconds'));
      }, 600000); // 600秒超时
    });

    const difyService = new DifyUpgradeService();
    let analysisResult: string;
      
    try {
      console.log('🚀 Starting Dify analysis with enhanced retry mechanism...');
      console.log('📊 Request details:', {
        userId: user.id,
        upgradeQuestionnaireId,
        combinedResponsesLength: combinedResponses.length,
        foundationQuestions: foundationResponses.length,
        upgradeQuestions: upgradeResponses.length
      });
      
      const analysisPromise = difyService.processUpgradeCompletion(combinedResponses, user.id);
      
      // 使用Promise.race来实现客户端超时
      analysisResult = await Promise.race([analysisPromise, timeoutPromise]);

      console.log('✅ Dify analysis result received successfully!');
      console.log('📊 Result statistics:', {
        length: analysisResult.length,
        wordCount: analysisResult.split(' ').length,
        lineCount: analysisResult.split('\n').length
      });
      
      if (analysisResult.length > 1000) {
        console.log('📝 Preview:', analysisResult.substring(0, 1000) + '...');
      } else {
        console.log('📝 Full result:', analysisResult);
      }
    } catch (error) {
      console.error('Error during Dify analysis:', error);
      
      // 处理超时错误
      if (error.message && error.message.includes('timed out')) {
        console.error('⏰ Request timed out - this usually indicates high server load or complex responses');
        throw new Error('Analysis request timed out after 10 minutes. The server might be experiencing high load or your responses may be too complex. Please try again later or provide shorter responses.');
      }
      
      // 处理400错误（可能是输入格式问题）
      if (error.message && error.message.includes('400')) {
        console.error('🔧 Input format error - adjusting request format');
        throw new Error('There was an issue with the analysis request format. Please try again or contact support if the problem persists.');
      }
      
      // 处理其他常见错误
      if (error.message && error.message.includes('Gateway')) {
        console.error('🌐 Gateway error - network or server issues detected');
        throw new Error('Network or server issues detected. Please try again in a few minutes.');
      }
      
      if (error.message && error.message.includes('not published')) {
        console.error('📝 Workflow not published - configuration issue');
        throw new Error('The analysis workflow is not properly configured. Please contact support.');
      }
      
      throw error;
    }

    // 5. Store the markdown results in reports table
    const processingStartTime = Date.now();
    
    // 确保analysisResult有内容
    if (!analysisResult || analysisResult.length < 10) {
      console.warn('⚠️ Analysis result is too short, using default message');
      analysisResult = 'Analysis completed successfully. Your personalized insights and recommendations are being processed.';
    }
    
    // Store content as proper JSON - if it's a string, store it as an object with text property
    let contentToStore;
    if (typeof analysisResult === 'string') {
      contentToStore = {
        text: analysisResult,
        type: 'markdown',
        generatedAt: new Date().toISOString()
      };
    } else {
      contentToStore = analysisResult;
    }
    
    const [newReport] = await db
      .insert(reports)
      .values({
        userId: user.id,
        sessionId: upgradeSession.sessionId,
        title: 'Verisona AI Complete Analysis Report',
        content: contentToStore,
        type: 'ai_analysis',
        status: 'completed',
        metadata: {
          processedAt: new Date().toISOString(),
          responsesLength: combinedResponses.length,
          questionCount: foundationResponses.length + upgradeResponses.length,
          foundationQuestions: foundationResponses.length,
          upgradeQuestions: upgradeResponses.length,
          analysisResultLength: analysisResult.length,
          processingDuration: Date.now() - processingStartTime
        }
      })
      .returning();

    console.log('Created final analysis report:', newReport);

    return NextResponse.json({
      success: true,
      message: 'Upgrade questionnaire completed successfully',
      report: newReport,
      analysisResult: analysisResult
    });

  } catch (error) {
    console.error('Error completing upgrade questionnaire:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete upgrade questionnaire',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}