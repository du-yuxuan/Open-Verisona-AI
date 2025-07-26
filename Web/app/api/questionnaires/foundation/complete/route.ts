import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { questionnaires, questions, questionnaireResponses, questionResponses, QuestionType, QuestionnaireType } from '@/lib/db/schema';
import { difyFoundationService, type FoundationQuestionnaireResponse } from '@/lib/services/dify-foundation-service';
import { eq, and } from 'drizzle-orm';

/**
 * Convert response value to string for Dify API
 * Handles various response formats: paragraph objects, schedule objects, etc.
 */
function convertResponseToString(response: any): string {
  if (typeof response === 'string') {
    return response;
  }
  
  if (typeof response === 'object' && response !== null) {
    // Handle schedule objects (e.g., weekly schedule input)
    if (isDaysOfWeekObject(response)) {
      return convertScheduleToString(response);
    }
    
    // Handle paragraph objects from rich text editors
    if (response.type === 'paragraph' || response.type === 'doc') {
      // Extract text from paragraph content
      if (response.content && Array.isArray(response.content)) {
        return response.content
          .map((item: any) => {
            if (item.type === 'text' && item.text) {
              return item.text;
            }
            return '';
          })
          .join('');
      }
      // Handle direct text property
      if (response.text) {
        return response.text;
      }
    }
    
    // Handle other object types - try to extract meaningful text
    if (response.content && typeof response.content === 'string') {
      return response.content;
    }
    
    if (response.value && typeof response.value === 'string') {
      return response.value;
    }
    
    // Last resort - stringify the object
    return JSON.stringify(response);
  }
  
  // Convert other types to string
  return String(response || '');
}

/**
 * Check if the object represents a days-of-week schedule
 */
function isDaysOfWeekObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }
  
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const objKeys = Object.keys(obj);
  
  // Check if at least one day of the week is present
  return daysOfWeek.some(day => objKeys.includes(day));
}

/**
 * Convert a schedule object to a descriptive string
 */
function convertScheduleToString(schedule: any): string {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const activities = [];
  
  for (const day of daysOfWeek) {
    if (schedule[day] && typeof schedule[day] === 'object') {
      const dayActivities = Object.values(schedule[day]).filter(activity => activity && activity !== '');
      if (dayActivities.length > 0) {
        activities.push(`${day}: ${dayActivities.join(', ')}`);
      }
    }
  }
  
  if (activities.length === 0) {
    return 'No specific weekly schedule provided.';
  }
  
  return `Weekly Schedule: ${activities.join('; ')}`;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId, responses } = await request.json();

    if (!sessionId || !responses) {
      return NextResponse.json({ error: 'Session ID and responses are required' }, { status: 400 });
    }

    // Verify that the session belongs to the user
    const session = await db.query.questionnaireResponses.findFirst({
      where: and(
        eq(questionnaireResponses.sessionId, sessionId),
        eq(questionnaireResponses.userId, user.id)
      ),
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get the foundation questionnaire to verify it's completed
    const foundationQuestionnaire = await db.query.questionnaires.findFirst({
      where: eq(questionnaires.title, 'Verisona AI Foundation Questionnaire'),
    });

    if (!foundationQuestionnaire) {
      return NextResponse.json({ error: 'Foundation questionnaire not found' }, { status: 404 });
    }

    // Get all questions for the foundation questionnaire
    const foundationQuestions = await db.query.questions.findMany({
      where: eq(questions.questionnaireId, foundationQuestionnaire.id),
      orderBy: (questions, { asc }) => [asc(questions.order)],
    });

    // Get all user responses for this session
    const userResponses = await db.query.questionResponses.findMany({
      where: eq(questionResponses.sessionId, sessionId),
      with: {
        question: true,
      },
    });

    // Verify all required questions are answered
    const answeredQuestionIds = new Set(userResponses.map(r => r.questionId));
    const requiredQuestions = foundationQuestions.filter(q => q.isRequired);
    const missingAnswers = requiredQuestions.filter(q => !answeredQuestionIds.has(q.id));

    if (missingAnswers.length > 0) {
      return NextResponse.json({ 
        error: 'Foundation questionnaire is not complete',
        missingQuestions: missingAnswers.map(q => q.questionText)
      }, { status: 400 });
    }

    // Map responses to the expected format for Dify
    const responseMap = new Map();
    userResponses.forEach(response => {
      const questionOrder = response.question.order;
      responseMap.set(questionOrder, response);
    });

    // Extract responses in the correct order for Dify workflow
    // Foundation questionnaire mapping to Dify parameters:
    // Order 5 (FILE_UPLOAD 成绩单或简历文件) -> Dify Q1
    // Order 1 (个人生活陈述 weekly schedule) -> Dify Q2
    // Order 2 (个人爱好陈述 interests/hobbies) -> Dify Q3
    // Order 3 (个人品质陈述 challenges/growth) -> Dify Q4
    // Order 4 (未来展望陈述 future contributions) -> Dify Q5
    // Debug: Check what we're getting from the database
    console.log('Response debugging before conversion:');
    console.log('Q1 (Order 5) raw:', responseMap.get(5)?.responseValue);
    console.log('Q2 (Order 1) raw:', responseMap.get(1)?.responseValue);
    console.log('Q3 (Order 2) raw:', responseMap.get(2)?.responseValue);
    console.log('Q4 (Order 3) raw:', responseMap.get(3)?.responseValue);
    console.log('Q5 (Order 4) raw:', responseMap.get(4)?.responseValue);
    
    // Force string conversion for all responses
    const q1Raw = responseMap.get(5)?.responseText || responseMap.get(5)?.responseValue || '';
    const q2Raw = responseMap.get(1)?.responseText || responseMap.get(1)?.responseValue || '';
    const q3Raw = responseMap.get(2)?.responseText || responseMap.get(2)?.responseValue || '';
    const q4Raw = responseMap.get(3)?.responseText || responseMap.get(3)?.responseValue || '';
    const q5Raw = responseMap.get(4)?.responseText || responseMap.get(4)?.responseValue || '';
    
    // Direct string conversion to ensure all responses are strings
    const difyResponses: FoundationQuestionnaireResponse = {
      Q1: typeof q1Raw === 'string' ? q1Raw : JSON.stringify(q1Raw), // 成绩单或简历文件 (FILE_UPLOAD)
      Q2: typeof q2Raw === 'string' ? q2Raw : String(q2Raw || ''), // 个人生活陈述 (现在是普通文本输入，与其他问题相同)
      Q3: typeof q3Raw === 'string' ? q3Raw : String(q3Raw || ''), // 个人爱好陈述
      Q4: typeof q4Raw === 'string' ? q4Raw : String(q4Raw || ''), // 个人品质陈述
      Q5: typeof q5Raw === 'string' ? q5Raw : String(q5Raw || ''), // 未来展望陈述
    };
    
    console.log('Response debugging after conversion:');
    console.log('Q1 converted:', typeof difyResponses.Q1, difyResponses.Q1);
    console.log('Q2 converted:', typeof difyResponses.Q2, difyResponses.Q2);
    console.log('Q3 converted:', typeof difyResponses.Q3, difyResponses.Q3);
    console.log('Q4 converted:', typeof difyResponses.Q4, difyResponses.Q4);
    console.log('Q5 converted:', typeof difyResponses.Q5, difyResponses.Q5);

    // Handle file uploads from question order 5 (transcript) which maps to Dify Q1
    const transcriptResponse = responseMap.get(5); // Question order 5 is the transcript upload
    let hasUploadedFiles = false;
    
    if (transcriptResponse && transcriptResponse.question.questionType === QuestionType.FILE_UPLOAD) {
      try {
        let fileData;
        if (typeof transcriptResponse.responseValue === 'string') {
          fileData = JSON.parse(transcriptResponse.responseValue || '[]');
        } else {
          fileData = transcriptResponse.responseValue || [];
        }
        if (Array.isArray(fileData) && fileData.length > 0) {
          console.log('Files found in transcript response:', fileData.length);
          
          // Upload files to Dify
          const uploadedFileIds = [];
          for (const file of fileData) {
            try {
              // Read the file from uploads directory
              const { readFile } = await import('fs/promises');
              const { join } = await import('path');
              
              const uploadDir = join(process.cwd(), 'uploads');
              const fileName = `${file.id}.${file.name.split('.').pop()}`;
              const filePath = join(uploadDir, fileName);
              
              console.log('Attempting to read file:', filePath);
              const fileBuffer = await readFile(filePath);
              
              // Upload to Dify
              const difyFileId = await difyFoundationService.uploadFile(
                fileBuffer,
                file.name,
                user.id.toString()
              );
              
              uploadedFileIds.push(difyFileId);
              console.log('File uploaded to Dify:', file.name, 'ID:', difyFileId);
              
            } catch (fileError) {
              console.error('Failed to upload file to Dify:', file.name, fileError);
              // Continue with other files even if one fails
            }
          }
          
          // Set Q1 as file object for Dify (this is the correct format)
          if (uploadedFileIds.length > 0) {
            difyResponses.Q1 = {
              transfer_method: 'local_file',
              upload_file_id: uploadedFileIds[0], // Use the first uploaded file
              type: 'document'
            };
            hasUploadedFiles = true;
            console.log('Set Q1 as file object with ID:', uploadedFileIds[0]);
          } else {
            // If file upload failed, set Q1 to text description
            const fileNames = fileData.map(file => file.name || 'transcript').join(', ');
            difyResponses.Q1 = `Transcript files uploaded: ${fileNames}`;
          }
        }
      } catch (error) {
        console.error('Error parsing file data from transcript (order 5):', error);
      }
    }
    
    // If no files were uploaded, provide a placeholder for Q1
    if (!hasUploadedFiles) {
      difyResponses.Q1 = 'No transcript file uploaded';
    }

    // Debug: Log raw response data to understand format
    console.log('Raw response debugging:');
    console.log('Q1 (Order 5):', JSON.stringify(responseMap.get(5)?.responseValue, null, 2));
    console.log('Q2 (Order 1):', JSON.stringify(responseMap.get(1)?.responseValue, null, 2));
    console.log('Q3 (Order 2):', JSON.stringify(responseMap.get(2)?.responseValue, null, 2));
    console.log('Q4 (Order 3):', JSON.stringify(responseMap.get(3)?.responseValue, null, 2));
    console.log('Q5 (Order 4):', JSON.stringify(responseMap.get(4)?.responseValue, null, 2));
    
    // Send to Dify workflow
    console.log('Sending to Dify Foundation Service:', JSON.stringify(difyResponses, null, 2));
    
    let difyResults;
    try {
      difyResults = await difyFoundationService.processFoundationResponses(
        difyResponses,
        user.id.toString()
      );
      console.log('Dify Foundation Service processing successful. Answer data:', difyResults);
      
      // Validate that we received an array of questions
      if (!Array.isArray(difyResults) || difyResults.length === 0) {
        throw new Error('Dify returned invalid Answer data - expected array of questions');
      }
      
    } catch (difyError) {
      console.error('Dify Foundation Service processing failed:', difyError);
      // Force real API usage - throw error instead of using fallback
      throw new Error(`Dify Foundation Service failed: ${difyError.message}`);
    }

    // Store Dify Answer results
    await db.update(questionnaireResponses)
      .set({
        difyResults: difyResults, // This stores the Answer array from Dify
        difyProcessedAt: new Date(),
        status: 'completed',
        completedAt: new Date(),
        lastActivityAt: new Date(),
        metadata: {
          difyAnswerCount: difyResults.length,
          difyProcessedSuccessfully: true,
          originalResponses: {
            Q1: typeof difyResponses.Q1 === 'object' ? 'FILE_UPLOADED' : String(difyResponses.Q1 || '').substring(0, 100) + '...',
            Q2: typeof difyResponses.Q2 === 'object' ? JSON.stringify(difyResponses.Q2).substring(0, 100) + '...' : String(difyResponses.Q2 || '').substring(0, 100) + '...',
            Q3: typeof difyResponses.Q3 === 'object' ? JSON.stringify(difyResponses.Q3).substring(0, 100) + '...' : String(difyResponses.Q3 || '').substring(0, 100) + '...',
            Q4: typeof difyResponses.Q4 === 'object' ? JSON.stringify(difyResponses.Q4).substring(0, 100) + '...' : String(difyResponses.Q4 || '').substring(0, 100) + '...',
            Q5: typeof difyResponses.Q5 === 'object' ? JSON.stringify(difyResponses.Q5).substring(0, 100) + '...' : String(difyResponses.Q5 || '').substring(0, 100) + '...',
          }
        }
      })
      .where(eq(questionnaireResponses.sessionId, sessionId));

    // Create new "Verisona AI Questionnaire" based on Dify Answer results
    const newQuestionnaire = await createVerisonaAIQuestionnaire(difyResults, difyResponses);

    return NextResponse.json({
      success: true,
      difyResults, // This is the Answer array from Dify
      difyAnswerCount: difyResults.length,
      newQuestionnaire: {
        id: newQuestionnaire.id,
        title: newQuestionnaire.title,
        description: newQuestionnaire.description,
        estimatedDuration: newQuestionnaire.estimatedDuration,
      },
      message: 'Foundation questionnaire completed and new Verisona AI Questionnaire created successfully from Dify Answer data',
    });

  } catch (error) {
    console.error('Error completing foundation questionnaire:', error);
    return NextResponse.json({ 
      error: 'Failed to complete foundation questionnaire',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function createVerisonaAIQuestionnaire(difyResults: Array<string>, originalResponses: FoundationQuestionnaireResponse) {
  // Create new questionnaire
  const [newQuestionnaire] = await db
    .insert(questionnaires)
    .values({
      title: 'Verisona AI Questionnaire',
      description: 'AI-generated personalized questionnaire based on your foundation responses to help you discover your authentic persona for college applications.',
      type: QuestionnaireType.PERSONALITY,
      category: 'ai_generated',
      isActive: true,
      estimatedDuration: 20,
      isAiGenerated: true,
      metadata: {
        version: '1.0',
        generatedAt: new Date().toISOString(),
        source: 'dify_foundation_workflow',
        questionCount: difyResults.length,
        difyAnswerData: difyResults,
        originalFoundationResponses: {
          Q1: typeof originalResponses.Q1 === 'object' ? 'FILE_UPLOADED' : String(originalResponses.Q1 || '').substring(0, 200) + '...',
          Q2: typeof originalResponses.Q2 === 'object' ? JSON.stringify(originalResponses.Q2).substring(0, 200) + '...' : String(originalResponses.Q2 || '').substring(0, 200) + '...',
          Q3: typeof originalResponses.Q3 === 'object' ? JSON.stringify(originalResponses.Q3).substring(0, 200) + '...' : String(originalResponses.Q3 || '').substring(0, 200) + '...',
          Q4: typeof originalResponses.Q4 === 'object' ? JSON.stringify(originalResponses.Q4).substring(0, 200) + '...' : String(originalResponses.Q4 || '').substring(0, 200) + '...',
          Q5: typeof originalResponses.Q5 === 'object' ? JSON.stringify(originalResponses.Q5).substring(0, 200) + '...' : String(originalResponses.Q5 || '').substring(0, 200) + '...',
        }
      },
    })
    .returning();

  // Create questions from Dify Answer results
  const questionsData = difyResults.map((questionText, index) => ({
    questionnaireId: newQuestionnaire.id,
    questionText: questionText,
    questionType: QuestionType.LONG_TEXT, // Default to long text for AI-generated questions
    category: 'ai_generated',
    order: index + 1,
    isRequired: true,
    isAiGenerated: true,
    aiPrompt: `Generated from foundation questionnaire analysis using Dify Answer data`,
    metadata: {
      generatedAt: new Date().toISOString(),
      source: 'dify_foundation_workflow_answer',
      originalIndex: index,
      difyAnswerText: questionText,
    },
  }));

  // Insert questions
  await db.insert(questions).values(questionsData);

  console.log(`Created new Verisona AI Questionnaire with ${difyResults.length} AI-generated questions from Dify Answer data`);
  
  return newQuestionnaire;
}