import { db } from './drizzle';
import { questions } from './schema';
import { eq } from 'drizzle-orm';

// Update script to convert Verisona AI questionnaire questions to English
export async function updateQuestionsToEnglish() {
  console.log('🔄 Starting to update questions to English...');

  const englishQuestions = [
    {
      id: 27, // Question 1 - Calendar Schedule
      questionText: 'Show us what a typical week looks like for you - school, sleep, homework, activities, family time, work, chores, and free time.',
      options: {
        calendar: {
          type: 'weekly',
          format: 'visual',
          categories: [
            { name: 'School', color: '#4f46e5' },
            { name: 'Sleep', color: '#7c3aed' },
            { name: 'Homework', color: '#dc2626' },
            { name: 'Activities', color: '#059669' },
            { name: 'Family Time', color: '#d97706' },
            { name: 'Work', color: '#0891b2' },
            { name: 'Chores', color: '#64748b' },
            { name: 'Free Time', color: '#ec4899' }
          ],
          instructions: 'A visual, 24-hour/7-day weekly calendar or pie chart',
          totalHours: 168 // 24 hours × 7 days
        }
      },
      metadata: {
        instructions: 'Create a visual representation of your typical week. You can use either a calendar format or pie chart to show how you spend your time.',
        helpText: 'Think about your regular weekly routine and allocate time for each activity category.',
        estimatedTime: '5-10 minutes'
      }
    },
    {
      id: 28, // Question 2 - Hobby Description
      questionText: 'Describe a hobby that brings you joy. What does it feel like when you\'re engaged in it?',
      options: {
        characterLimit: {
          min: 50,
          max: 1000,
          recommended: 200
        },
        placeholder: 'Share a hobby or activity that truly brings you happiness. Describe not just what you do, but how it makes you feel...'
      },
      metadata: {
        instructions: 'Write about a hobby or activity that genuinely brings you joy and fulfillment.',
        helpText: 'Focus on both the activity itself and your emotional experience while doing it.',
        estimatedTime: '10-15 minutes'
      }
    },
    {
      id: 29, // Question 3 - Challenge/Failure Experience
      questionText: 'Describe a time you faced a significant challenge, failure, or setback. It could be academic, personal, or social. What was the situation, what actions did you take, and most importantly, what did you learn about yourself or the world as a result?',
      options: {
        characterLimit: {
          min: 100,
          max: 1500,
          recommended: 400
        },
        placeholder: 'Think of a meaningful challenge you\'ve faced. Describe the situation, your response, and what you learned from the experience...'
      },
      metadata: {
        instructions: 'Reflect on a significant challenge or setback that taught you something important about yourself or life.',
        helpText: 'Focus on your growth and learning from the experience rather than just the difficulty itself.',
        estimatedTime: '15-20 minutes'
      }
    },
    {
      id: 30, // Question 4 - Future Contribution
      questionText: 'How do you imagine you will contribute to the lives of your future classmates and your community?',
      options: {
        characterLimit: {
          min: 75,
          max: 1000,
          recommended: 250
        },
        placeholder: 'Share your vision for how you want to make a positive impact on others and your community...'
      },
      metadata: {
        instructions: 'Envision your future role in contributing to your academic community and beyond.',
        helpText: 'Think about your unique strengths and how you can use them to help others.',
        estimatedTime: '10-15 minutes'
      }
    },
    {
      id: 31, // Question 5 - Transcript Upload
      questionText: 'Please upload your recent transcript (provide file).',
      options: {
        fileUpload: {
          acceptedTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
          maxSize: 10485760, // 10MB
          required: true
        },
        instructions: 'Upload your most recent academic transcript'
      },
      metadata: {
        instructions: 'Please provide your most recent academic transcript for review.',
        helpText: 'Accepted file formats: PDF, JPG, PNG. Maximum file size: 10MB.',
        estimatedTime: '2-5 minutes'
      }
    }
  ];

  try {
    // Update each question
    for (const question of englishQuestions) {
      await db
        .update(questions)
        .set({
          questionText: question.questionText,
          options: question.options,
          metadata: question.metadata
        })
        .where(eq(questions.id, question.id));
      
      console.log(`✅ Updated question ${question.id}`);
    }

    console.log('🎉 Successfully updated all questions to English!');
    
    // Verify the updates
    const updatedQuestions = await db
      .select()
      .from(questions)
      .where(eq(questions.questionnaireId, 9));
    
    console.log(`📊 Verification: Found ${updatedQuestions.length} questions in questionnaire 9`);
    
    return {
      success: true,
      message: 'Questions updated successfully to English',
      questionsUpdated: englishQuestions.length
    };
    
  } catch (error) {
    console.error('❌ Error updating questions:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run the update if this file is executed directly
if (require.main === module) {
  updateQuestionsToEnglish()
    .then(result => {
      console.log('Update result:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('Update failed:', error);
      process.exit(1);
    });
}