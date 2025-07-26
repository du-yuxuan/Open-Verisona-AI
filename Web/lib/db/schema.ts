import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  real,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified'),
  passwordHash: text('password_hash').notNull(),
  
  // Student-specific fields
  firstName: varchar('first_name', { length: 50 }),
  lastName: varchar('last_name', { length: 50 }),
  graduationYear: integer('graduation_year'),
  schoolName: varchar('school_name', { length: 200 }),
  
  // Profile completion and preferences
  profileCompleted: boolean('profile_completed').default(false),
  preferences: json('preferences'), // JSON field for user preferences
  demographicInfo: json('demographic_info'), // JSON field for demographic information
  
  // Equity program eligibility
  equityEligible: boolean('equity_eligible').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  lastLoginAt: timestamp('last_login_at'),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
  metadata: text('metadata'), // JSON field for additional sharing-related data
});

// Questionnaires table - defines the structure of different questionnaires
export const questionnaires = pgTable('questionnaires', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  type: varchar('type', { length: 50 }).notNull(), // 'standardized', 'dynamic', 'adaptive'
  category: varchar('category', { length: 100 }), // 'personality', 'academic', 'career', etc.
  version: varchar('version', { length: 20 }).default('1.0'),
  isActive: boolean('is_active').default(true),
  estimatedDuration: integer('estimated_duration'), // in minutes
  
  // Dify integration fields
  difyWorkflowId: varchar('dify_workflow_id', { length: 100 }),
  difyConfiguration: json('dify_configuration'),
  
  // Metadata and timestamps
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdBy: integer('created_by').references(() => users.id),
});

// Questions table - individual questions within questionnaires
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  questionnaireId: integer('questionnaire_id')
    .notNull()
    .references(() => questionnaires.id),
  
  // Question content
  questionText: text('question_text').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(), // 'multiple_choice', 'text', 'scale', 'boolean', 'ranking'
  category: varchar('category', { length: 100 }), // 'values', 'interests', 'skills', etc.
  
  // Question configuration
  options: json('options'), // For multiple choice, scale ranges, etc.
  isRequired: boolean('is_required').default(true),
  order: integer('order').notNull(),
  
  // Conditional logic for dynamic questions
  conditions: json('conditions'), // Rules for when this question should appear
  
  // AI generation metadata
  isAiGenerated: boolean('is_ai_generated').default(false),
  aiPrompt: text('ai_prompt'), // The prompt used to generate this question
  
  // Metadata
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User questionnaire sessions - tracks user progress through questionnaires
export const questionnaireResponses = pgTable('questionnaire_responses', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  questionnaireId: integer('questionnaire_id')
    .notNull()
    .references(() => questionnaires.id),
  
  // Session information
  sessionId: uuid('session_id').notNull().unique(),
  status: varchar('status', { length: 20 }).notNull().default('in_progress'), // 'in_progress', 'completed', 'abandoned'
  
  // Progress tracking
  currentQuestionId: integer('current_question_id').references(() => questions.id),
  totalQuestions: integer('total_questions'),
  answeredQuestions: integer('answered_questions').default(0),
  progressPercentage: real('progress_percentage').default(0),
  
  // Session metadata
  startedAt: timestamp('started_at').notNull().defaultNow(),
  completedAt: timestamp('completed_at'),
  lastActivityAt: timestamp('last_activity_at').notNull().defaultNow(),
  
  // Response data
  responses: json('responses'), // All user responses in JSON format
  metadata: json('metadata'),
  
  // Dify integration
  difyResults: json('dify_results'), // Results from Dify workflow (Array<string>)
  difyJobId: varchar('dify_job_id', { length: 100 }),
  difyProcessedAt: timestamp('dify_processed_at'),
});

// Individual question responses
export const questionResponses = pgTable('question_responses', {
  id: serial('id').primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => questionnaireResponses.sessionId),
  questionId: integer('question_id')
    .notNull()
    .references(() => questions.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  
  // Response data
  responseText: text('response_text'), // For text responses
  responseValue: json('response_value'), // For structured responses (arrays, objects)
  responseScore: real('response_score'), // Numerical score if applicable
  
  // Response metadata
  timeSpentSeconds: integer('time_spent_seconds'),
  isRevised: boolean('is_revised').default(false),
  revisionCount: integer('revision_count').default(0),
  
  // Timestamps
  answeredAt: timestamp('answered_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// AI-generated reports based on questionnaire responses
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  sessionId: uuid('session_id')
    .references(() => questionnaireResponses.sessionId),
  
  // Report metadata
  title: varchar('title', { length: 200 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'personality_analysis', 'college_match', 'career_guidance', etc.
  status: varchar('status', { length: 20 }).notNull().default('generating'), // 'generating', 'completed', 'failed'
  
  // Report content
  summary: text('summary'),
  content: json('content'), // Structured report data
  insights: json('insights'), // Key insights and recommendations
  scores: json('scores'), // Various personality/compatibility scores
  
  // Dify integration
  difyJobId: varchar('dify_job_id', { length: 100 }),
  difyResponse: json('dify_response'),
  processingLog: json('processing_log'),
  
  // Access and sharing
  isShared: boolean('is_shared').default(false),
  shareToken: varchar('share_token', { length: 64 }),
  
  // Metadata
  metadata: json('metadata'),
  
  // Timestamps
  generatedAt: timestamp('generated_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastViewedAt: timestamp('last_viewed_at'),
});

// College recommendations based on user profile and questionnaire responses
export const collegeRecommendations = pgTable('college_recommendations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  reportId: integer('report_id')
    .references(() => reports.id),
  
  // College information
  collegeName: varchar('college_name', { length: 200 }).notNull(),
  collegeId: varchar('college_id', { length: 100 }), // External ID if integrated with college database
  
  // Matching scores
  matchScore: real('match_score').notNull(), // 0-100 compatibility score
  personalityMatch: real('personality_match'),
  academicMatch: real('academic_match'),
  culturalMatch: real('cultural_match'),
  
  // Recommendation details
  reasons: json('reasons'), // Why this college is recommended
  highlights: json('highlights'), // Key features that match user
  considerations: json('considerations'), // Things to consider
  
  // Status
  isBookmarked: boolean('is_bookmarked').default(false),
  applicationStatus: varchar('application_status', { length: 50 }), // 'interested', 'applied', 'accepted', etc.
  
  // Metadata
  metadata: json('metadata'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Database relations
export const usersRelations = relations(users, ({ many }) => ({
  activityLogs: many(activityLogs),
  questionnaireResponses: many(questionnaireResponses),
  questionResponses: many(questionResponses),
  reports: many(reports),
  collegeRecommendations: many(collegeRecommendations),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const questionnairesRelations = relations(questionnaires, ({ many, one }) => ({
  questions: many(questions),
  questionnaireResponses: many(questionnaireResponses),
  createdBy: one(users, {
    fields: [questionnaires.createdBy],
    references: [users.id],
  }),
}));

export const questionsRelations = relations(questions, ({ one, many }) => ({
  questionnaire: one(questionnaires, {
    fields: [questions.questionnaireId],
    references: [questionnaires.id],
  }),
  questionResponses: many(questionResponses),
}));

export const questionnaireResponsesRelations = relations(questionnaireResponses, ({ one, many }) => ({
  user: one(users, {
    fields: [questionnaireResponses.userId],
    references: [users.id],
  }),
  questionnaire: one(questionnaires, {
    fields: [questionnaireResponses.questionnaireId],
    references: [questionnaires.id],
  }),
  currentQuestion: one(questions, {
    fields: [questionnaireResponses.currentQuestionId],
    references: [questions.id],
  }),
  questionResponses: many(questionResponses),
  reports: many(reports),
}));

export const questionResponsesRelations = relations(questionResponses, ({ one }) => ({
  session: one(questionnaireResponses, {
    fields: [questionResponses.sessionId],
    references: [questionnaireResponses.sessionId],
  }),
  question: one(questions, {
    fields: [questionResponses.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [questionResponses.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  session: one(questionnaireResponses, {
    fields: [reports.sessionId],
    references: [questionnaireResponses.sessionId],
  }),
  collegeRecommendations: many(collegeRecommendations),
}));

export const collegeRecommendationsRelations = relations(collegeRecommendations, ({ one }) => ({
  user: one(users, {
    fields: [collegeRecommendations.userId],
    references: [users.id],
  }),
  report: one(reports, {
    fields: [collegeRecommendations.reportId],
    references: [reports.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;

export type Questionnaire = typeof questionnaires.$inferSelect;
export type NewQuestionnaire = typeof questionnaires.$inferInsert;
export type Question = typeof questions.$inferSelect;
export type NewQuestion = typeof questions.$inferInsert;
export type QuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type NewQuestionnaireResponse = typeof questionnaireResponses.$inferInsert;
export type QuestionResponse = typeof questionResponses.$inferSelect;
export type NewQuestionResponse = typeof questionResponses.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type CollegeRecommendation = typeof collegeRecommendations.$inferSelect;
export type NewCollegeRecommendation = typeof collegeRecommendations.$inferInsert;

// Enums
export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  UPDATE_PROFILE = 'UPDATE_PROFILE',
  QUESTIONNAIRE_STARTED = 'QUESTIONNAIRE_STARTED',
  QUESTION_ANSWERED = 'QUESTION_ANSWERED',
  QUESTIONNAIRE_COMPLETED = 'QUESTIONNAIRE_COMPLETED',
  REPORT_GENERATED = 'REPORT_GENERATED',
  REPORT_VIEWED = 'REPORT_VIEWED',
  PROFILE_COMPLETED = 'PROFILE_COMPLETED',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT = 'text',
  SCALE = 'scale',
  BOOLEAN = 'boolean',
  RANKING = 'ranking',
  SLIDER = 'slider',
  TEXTAREA = 'textarea',
  LONG_TEXT = 'long_text',
  FILE_UPLOAD = 'file_upload',
  CALENDAR_SCHEDULE = 'calendar_schedule',
}

export enum QuestionnaireType {
  STANDARDIZED = 'standardized',
  DYNAMIC = 'dynamic',
  ADAPTIVE = 'adaptive',
  PERSONALITY = 'personality',
}

export enum ResponseStatus {
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export enum ReportType {
  PERSONALITY_ANALYSIS = 'personality_analysis',
  COLLEGE_MATCH = 'college_match',
  CAREER_GUIDANCE = 'career_guidance',
  STRENGTHS_ASSESSMENT = 'strengths_assessment',
  VALUES_EXPLORATION = 'values_exploration',
  PERSONALITY = 'personality',
  ACADEMIC = 'academic',
  COMPREHENSIVE = 'comprehensive',
}

export enum ReportStatus {
  GENERATING = 'generating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// Utility types for questionnaire system
export interface QuestionOption {
  value: string | number;
  label: string;
  description?: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  step?: number;
  labels?: { [key: number]: string };
}

export interface ConditionalLogic {
  dependsOn: number; // question ID
  condition: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
  value: any;
}

export interface QuestionnaireProgress {
  sessionId: string;
  currentQuestion: number;
  totalQuestions: number;
  percentage: number;
  timeSpent: number;
}

export interface PersonalityScore {
  dimension: string;
  score: number;
  percentile: number;
  description: string;
}

export interface CollegeMatchCriteria {
  academicFit: number;
  culturalFit: number;
  personalityFit: number;
  valuesFit: number;
  overallScore: number;
}