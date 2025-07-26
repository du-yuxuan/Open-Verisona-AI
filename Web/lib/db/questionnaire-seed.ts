import { db } from './drizzle';
import { questionnaires, questions, questionnaireResponses, questionResponses, QuestionnaireType, QuestionType } from './schema';
import { eq } from 'drizzle-orm';

export async function seedVerisonaQuestionnaire() {
  try {
    // First delete all related response data
    await db.delete(questionResponses);
    await db.delete(questionnaireResponses);
    
    // Then delete questions and questionnaires
    await db.delete(questions);
    await db.delete(questionnaires);
    
    // Create Verisona AI Foundation Questionnaire
    const [questionnaire] = await db
      .insert(questionnaires)
      .values({
        title: 'Verisona AI Foundation Questionnaire',
        description: 'A comprehensive questionnaire designed to help students develop their authentic persona for college applications through AI-powered insights and personalized guidance.',
        type: QuestionnaireType.PERSONALITY,
        category: 'personality',
        isActive: true,
        estimatedDuration: 30,
        metadata: {
          version: '1.0',
          language: 'zh-CN',
          purpose: 'comprehensive_assessment'
        }
      })
      .returning();

    // Create questionnaire questions
    const questionsData = [
      {
        questionnaireId: questionnaire.id,
        questionText: '您的一周时间分配：请描述您典型的一周是怎样的，包括上学、睡觉、做作业、活动、家庭时间、工作、家务和自由时间。请具体说明您如何平衡这些不同的活动，以及哪些活动对您最重要。',
        questionType: QuestionType.LONG_TEXT,
        category: 'schedule',
        order: 1,
        isRequired: true,
        metadata: {
          minLength: 150,
          maxLength: 1000,
          placeholder: '请详细描述您的典型一周，包括：1) 学校课程和学习时间的安排；2) 课外活动和兴趣爱好的时间分配；3) 家庭时间和个人时间的平衡；4) 您如何管理时间和设定优先级；5) 这样的时间分配如何反映您的价值观和目标。',
          tips: [
            '请具体描述您的时间分配模式',
            '说明您如何在不同活动之间取得平衡',
            '分享您的时间管理策略和技巧',
            '反思这样的安排如何帮助您实现目标'
          ]
        }
      },
      {
        questionnaireId: questionnaire.id,
        questionText: '您的兴趣爱好：描述一种带给您快乐的爱好。当您投入其中时感觉如何？',
        questionType: QuestionType.LONG_TEXT,
        category: 'interests',
        order: 2,
        isRequired: true,
        metadata: {
          minLength: 100,
          maxLength: 1000,
          placeholder: '请详细描述您的爱好，包括：1) 这个爱好是什么；2) 您是如何开始的；3) 当您投入其中时的感受；4) 这个爱好如何影响您的生活或成长。',
          tips: [
            '请具体描述您的感受和体验',
            '可以包括具体的例子或场景',
            '思考这个爱好对您的意义'
          ]
        }
      },
      {
        questionnaireId: questionnaire.id,
        questionText: '挑战与成长经历：描述一次您面临重大挑战、失败或挫折的经历。这可能是学术上的、个人的或社交上的。情况是怎样的，您采取了什么行动，最重要的是，您从中学到了关于自己或这个世界的什么？',
        questionType: QuestionType.LONG_TEXT,
        category: 'experience',
        order: 3,
        isRequired: true,
        metadata: {
          minLength: 200,
          maxLength: 1500,
          placeholder: '请按以下结构回答：1) 具体情况和挑战是什么；2) 您当时的感受和反应；3) 您采取了哪些具体行动；4) 结果如何；5) 您从中学到了什么重要的经验或教训。',
          tips: [
            '诚实地分享您的经历，包括困难和挫折',
            '重点关注您的学习和成长',
            '展示您的韧性和适应能力',
            '反思这个经历如何塑造了现在的您'
          ]
        }
      },
      {
        questionnaireId: questionnaire.id,
        questionText: '未来贡献与愿景：您想象您将如何为未来同学和社区的生活做出贡献？',
        questionType: QuestionType.LONG_TEXT,
        category: 'future',
        order: 4,
        isRequired: true,
        metadata: {
          minLength: 150,
          maxLength: 1000,
          placeholder: '请描述：1) 您希望在大学校园中如何参与和贡献；2) 您计划如何利用自己的技能和经验帮助他人；3) 您对未来社区参与的具体想法或计划。',
          tips: [
            '思考您独特的技能和经验',
            '考虑您关心的社会问题',
            '展示您的领导潜力和服务精神',
            '可以包括具体的活动或项目想法'
          ]
        }
      },
      {
        questionnaireId: questionnaire.id,
        questionText: '成绩单上传：请您上传您的近期成绩单，该成绩单需为英文版本。',
        questionType: QuestionType.FILE_UPLOAD,
        category: 'documents',
        order: 5,
        isRequired: true,
        metadata: {
          acceptedFileTypes: ['.pdf', '.jpg', '.jpeg', '.png'],
          maxFileSize: 5242880, // 5MB
          allowMultiple: true,
          maxFiles: 3,
          instructions: [
            '请确保成绩单为英文版本',
            '如果原始成绩单不是英文，请提供官方翻译版本',
            '文件格式支持：PDF、JPG、PNG',
            '单个文件大小不超过5MB',
            '最多可上传3个文件'
          ],
          validation: {
            required: true,
            language: 'english'
          }
        }
      }
    ];

    // Insert questions
    await db.insert(questions).values(questionsData);

    console.log('Verisona AI Foundation Questionnaire created successfully!');
    console.log(`Questionnaire ID: ${questionnaire.id}`);
    console.log(`Number of questions: ${questionsData.length}`);
    
    return {
      questionnaire,
      questionsCount: questionsData.length
    };
    
  } catch (error) {
    console.error('Failed to create questionnaire:', error);
    throw error;
  }
}

// If running this file directly, execute seed data
if (require.main === module) {
  seedVerisonaQuestionnaire()
    .then((result) => {
      console.log('Questionnaire seed data creation completed:', result);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seed data creation failed:', error);
      process.exit(1);
    });
}