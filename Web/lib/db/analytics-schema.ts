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
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users, questionnaires, questionnaireResponses } from './schema';

// User behavior analytics - detailed tracking of user interactions
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  
  // Session identification
  sessionId: uuid('session_id').notNull().unique(),
  deviceType: varchar('device_type', { length: 20 }), // 'desktop', 'mobile', 'tablet'
  browser: varchar('browser', { length: 50 }),
  os: varchar('os', { length: 50 }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  // Geographic data (privacy-compliant)
  country: varchar('country', { length: 2 }), // ISO country code
  region: varchar('region', { length: 100 }),
  city: varchar('city', { length: 100 }),
  
  // Session timing
  startedAt: timestamp('started_at').notNull().defaultNow(),
  endedAt: timestamp('ended_at'),
  duration: integer('duration'), // in seconds
  
  // Session quality metrics
  pageViews: integer('page_views').default(0),
  interactions: integer('interactions').default(0),
  isEngaged: boolean('is_engaged').default(false), // Spent meaningful time
  
  // Accessibility usage
  accessibilityModeUsed: boolean('accessibility_mode_used').default(false),
  textToSpeechUsed: boolean('text_to_speech_used').default(false),
  highContrastUsed: boolean('high_contrast_used').default(false),
}, (table) => ({
  userIdIdx: index('user_sessions_user_id_idx').on(table.userId),
  sessionIdIdx: index('user_sessions_session_id_idx').on(table.sessionId),
  startTimeIdx: index('user_sessions_start_time_idx').on(table.startedAt),
}));

// Page/route analytics
export const pageViews = pgTable('page_views', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.sessionId),
  
  // Page information
  path: varchar('path', { length: 500 }).notNull(),
  title: varchar('title', { length: 200 }),
  referrer: varchar('referrer', { length: 500 }),
  
  // Timing metrics
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  timeOnPage: integer('time_on_page'), // in seconds
  loadTime: integer('load_time'), // in milliseconds
  
  // Interaction metrics
  scrollDepth: real('scroll_depth'), // 0-1 percentage
  clickCount: integer('click_count').default(0),
  formInteractions: integer('form_interactions').default(0),
  
  // Performance metrics
  isPageError: boolean('is_page_error').default(false),
  errorMessage: text('error_message'),
}, (table) => ({
  userIdIdx: index('page_views_user_id_idx').on(table.userId),
  pathIdx: index('page_views_path_idx').on(table.path),
  timestampIdx: index('page_views_timestamp_idx').on(table.timestamp),
}));

// Event tracking for specific user actions
export const userEvents = pgTable('user_events', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.sessionId),
  
  // Event details
  eventType: varchar('event_type', { length: 50 }).notNull(), // 'click', 'form_submit', 'questionnaire_start', etc.
  eventCategory: varchar('event_category', { length: 50 }), // 'navigation', 'engagement', 'conversion'
  eventAction: varchar('event_action', { length: 100 }).notNull(),
  eventLabel: varchar('event_label', { length: 200 }),
  
  // Context
  pageUrl: varchar('page_url', { length: 500 }),
  elementId: varchar('element_id', { length: 100 }),
  elementClass: varchar('element_class', { length: 200 }),
  elementText: text('element_text'),
  
  // Value and metadata
  eventValue: real('event_value'), // Numerical value if applicable
  properties: json('properties'), // Additional event properties
  
  // Timing
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('user_events_user_id_idx').on(table.userId),
  eventTypeIdx: index('user_events_type_idx').on(table.eventType),
  timestampIdx: index('user_events_timestamp_idx').on(table.timestamp),
}));

// Questionnaire analytics - detailed metrics about questionnaire usage
export const questionnaireAnalytics = pgTable('questionnaire_analytics', {
  id: serial('id').primaryKey(),
  questionnaireId: integer('questionnaire_id')
    .notNull()
    .references(() => questionnaires.id),
  userId: integer('user_id')
    .references(() => users.id),
  sessionId: uuid('session_id')
    .references(() => questionnaireResponses.sessionId),
  
  // Timing metrics
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  totalDuration: integer('total_duration'), // in seconds
  avgQuestionTime: real('avg_question_time'), // average time per question
  
  // Completion metrics
  questionsAnswered: integer('questions_answered').default(0),
  questionsSkipped: integer('questions_skipped').default(0),
  questionsRevised: integer('questions_revised').default(0),
  completionRate: real('completion_rate'), // 0-1
  
  // Engagement metrics
  pauseCount: integer('pause_count').default(0), // How many times user paused
  totalPauseTime: integer('total_pause_time').default(0), // Total time spent paused
  backtrackCount: integer('backtrack_count').default(0), // Going back to previous questions
  
  // AI features usage
  dynamicQuestionsGenerated: integer('dynamic_questions_generated').default(0),
  aiHelpUsed: integer('ai_help_used').default(0),
  
  // Quality metrics
  responseQualityScore: real('response_quality_score'), // 0-100 average quality
  engagementScore: real('engagement_score'), // 0-100 calculated engagement
  
  // Device and context
  deviceType: varchar('device_type', { length: 20 }),
  completedOn: varchar('completed_on', { length: 20 }), // 'desktop', 'mobile', 'tablet'
  
  // Results
  finalStatus: varchar('final_status', { length: 20 }), // 'completed', 'abandoned', 'partial'
  droppedAtQuestion: integer('dropped_at_question'), // Question number where user stopped
}, (table) => ({
  questionnaireIdIdx: index('questionnaire_analytics_qid_idx').on(table.questionnaireId),
  userIdIdx: index('questionnaire_analytics_user_id_idx').on(table.userId),
  startTimeIdx: index('questionnaire_analytics_start_time_idx').on(table.startTime),
}));

// Feature usage analytics - track usage of specific platform features
export const featureUsage = pgTable('feature_usage', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  
  // Feature identification
  featureName: varchar('feature_name', { length: 100 }).notNull(),
  featureCategory: varchar('feature_category', { length: 50 }), // 'core', 'accessibility', 'ai', 'social'
  
  // Usage metrics
  usageCount: integer('usage_count').default(1),
  firstUsed: timestamp('first_used').notNull().defaultNow(),
  lastUsed: timestamp('last_used').notNull().defaultNow(),
  totalTimeUsed: integer('total_time_used').default(0), // in seconds
  
  // Context
  deviceType: varchar('device_type', { length: 20 }),
  browserType: varchar('browser_type', { length: 50 }),
  
  // Success metrics
  successfulUses: integer('successful_uses').default(0),
  errorCount: integer('error_count').default(0),
  abandonmentCount: integer('abandonment_count').default(0),
  
  // User satisfaction (if collected)
  satisfactionRating: real('satisfaction_rating'), // 1-5 scale
  
  // Metadata
  metadata: json('metadata'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('feature_usage_user_id_idx').on(table.userId),
  featureNameIdx: index('feature_usage_name_idx').on(table.featureName),
  lastUsedIdx: index('feature_usage_last_used_idx').on(table.lastUsed),
}));

// Performance metrics for platform optimization
export const performanceMetrics = pgTable('performance_metrics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  sessionId: uuid('session_id').references(() => userSessions.sessionId),
  
  // Page/route
  path: varchar('path', { length: 500 }).notNull(),
  
  // Core Web Vitals
  lcp: real('lcp'), // Largest Contentful Paint (seconds)
  fid: real('fid'), // First Input Delay (milliseconds)
  cls: real('cls'), // Cumulative Layout Shift
  fcp: real('fcp'), // First Contentful Paint (seconds)
  ttfb: real('ttfb'), // Time to First Byte (milliseconds)
  
  // Network metrics
  connectionType: varchar('connection_type', { length: 20 }), // '4g', 'wifi', etc.
  downloadSpeed: real('download_speed'), // Mbps
  
  // Device metrics
  deviceMemory: real('device_memory'), // GB
  hardwareConcurrency: integer('hardware_concurrency'), // CPU cores
  
  // Browser metrics
  jsHeapSizeUsed: integer('js_heap_size_used'), // bytes
  jsHeapSizeLimit: integer('js_heap_size_limit'), // bytes
  
  // Timing
  timestamp: timestamp('timestamp').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('performance_metrics_user_id_idx').on(table.userId),
  pathIdx: index('performance_metrics_path_idx').on(table.path),
  timestampIdx: index('performance_metrics_timestamp_idx').on(table.timestamp),
}));

// User demographic and equity analytics (privacy-compliant)
export const userDemographics = pgTable('user_demographics', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
  
  // Voluntary demographic information for equity analysis
  ageRange: varchar('age_range', { length: 20 }), // '13-15', '16-18', '19-21', etc.
  schoolType: varchar('school_type', { length: 50 }), // 'public', 'private', 'charter', 'homeschool'
  
  // Socioeconomic indicators (voluntary)
  firstGeneration: boolean('first_generation'), // First generation college student
  householdIncomeRange: varchar('household_income_range', { length: 30 }), // Income brackets
  eligibleForFreeReduced: boolean('eligible_for_free_reduced'), // Free/reduced lunch eligibility
  
  // Geographic context
  ruralUrbanSuburban: varchar('rural_urban_suburban', { length: 20 }),
  stateCode: varchar('state_code', { length: 2 }), // US state or country code
  
  // Educational context
  gpaRange: varchar('gpa_range', { length: 20 }), // GPA brackets for analysis
  collegeIntent: varchar('college_intent', { length: 50 }), // '4year', '2year', 'vocational', 'undecided'
  
  // Accessibility needs
  hasAccessibilityNeeds: boolean('has_accessibility_needs').default(false),
  accessibilityTypes: json('accessibility_types'), // Types of accessibility needs
  
  // Usage patterns relevant to equity
  primaryDevice: varchar('primary_device', { length: 20 }), // 'smartphone', 'tablet', 'laptop', 'desktop'
  internetAccess: varchar('internet_access', { length: 30 }), // 'home_broadband', 'mobile_only', 'public_wifi', 'limited'
  
  // Consent and privacy
  analyticsConsent: boolean('analytics_consent').default(false),
  demographicsConsent: boolean('demographics_consent').default(false),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Aggregated daily/weekly/monthly stats for performance
export const analyticsAggregates = pgTable('analytics_aggregates', {
  id: serial('id').primaryKey(),
  
  // Time period
  aggregateType: varchar('aggregate_type', { length: 20 }).notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp('period_start').notNull(),
  periodEnd: timestamp('period_end').notNull(),
  
  // User metrics
  totalUsers: integer('total_users').default(0),
  newUsers: integer('new_users').default(0),
  activeUsers: integer('active_users').default(0),
  returningUsers: integer('returning_users').default(0),
  
  // Session metrics
  totalSessions: integer('total_sessions').default(0),
  avgSessionDuration: real('avg_session_duration'), // seconds
  bounceRate: real('bounce_rate'), // 0-1
  
  // Questionnaire metrics
  questionnairesStarted: integer('questionnaires_started').default(0),
  questionnairesCompleted: integer('questionnaires_completed').default(0),
  avgCompletionRate: real('avg_completion_rate'), // 0-1
  avgQuestionnaireTime: real('avg_questionnaire_time'), // seconds
  
  // Feature usage
  accessibilityUsage: integer('accessibility_usage').default(0),
  aiFeatureUsage: integer('ai_feature_usage').default(0),
  mobileUsage: integer('mobile_usage').default(0),
  
  // Equity metrics
  equityEligibleUsers: integer('equity_eligible_users').default(0),
  firstGenUsers: integer('first_gen_users').default(0),
  lowIncomeUsers: integer('low_income_users').default(0),
  
  // Performance metrics
  avgLoadTime: real('avg_load_time'), // milliseconds
  avgLcp: real('avg_lcp'), // seconds
  errorRate: real('error_rate'), // 0-1
  
  // Computed at
  computedAt: timestamp('computed_at').notNull().defaultNow(),
}, (table) => ({
  periodIdx: index('analytics_aggregates_period_idx').on(table.aggregateType, table.periodStart),
}));

// Relations
export const userSessionsRelations = relations(userSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
  pageViews: many(pageViews),
  userEvents: many(userEvents),
  performanceMetrics: many(performanceMetrics),
}));

export const pageViewsRelations = relations(pageViews, ({ one }) => ({
  user: one(users, {
    fields: [pageViews.userId],
    references: [users.id],
  }),
  session: one(userSessions, {
    fields: [pageViews.sessionId],
    references: [userSessions.sessionId],
  }),
}));

export const userEventsRelations = relations(userEvents, ({ one }) => ({
  user: one(users, {
    fields: [userEvents.userId],
    references: [users.id],
  }),
  session: one(userSessions, {
    fields: [userEvents.sessionId],
    references: [userSessions.sessionId],
  }),
}));

export const questionnaireAnalyticsRelations = relations(questionnaireAnalytics, ({ one }) => ({
  questionnaire: one(questionnaires, {
    fields: [questionnaireAnalytics.questionnaireId],
    references: [questionnaires.id],
  }),
  user: one(users, {
    fields: [questionnaireAnalytics.userId],
    references: [users.id],
  }),
  session: one(questionnaireResponses, {
    fields: [questionnaireAnalytics.sessionId],
    references: [questionnaireResponses.sessionId],
  }),
}));

export const featureUsageRelations = relations(featureUsage, ({ one }) => ({
  user: one(users, {
    fields: [featureUsage.userId],
    references: [users.id],
  }),
}));

export const performanceMetricsRelations = relations(performanceMetrics, ({ one }) => ({
  user: one(users, {
    fields: [performanceMetrics.userId],
    references: [users.id],
  }),
  session: one(userSessions, {
    fields: [performanceMetrics.sessionId],
    references: [userSessions.sessionId],
  }),
}));

export const userDemographicsRelations = relations(userDemographics, ({ one }) => ({
  user: one(users, {
    fields: [userDemographics.userId],
    references: [users.id],
  }),
}));

// Type exports
export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
export type PageView = typeof pageViews.$inferSelect;
export type NewPageView = typeof pageViews.$inferInsert;
export type UserEvent = typeof userEvents.$inferSelect;
export type NewUserEvent = typeof userEvents.$inferInsert;
export type QuestionnaireAnalytics = typeof questionnaireAnalytics.$inferSelect;
export type NewQuestionnaireAnalytics = typeof questionnaireAnalytics.$inferInsert;
export type FeatureUsage = typeof featureUsage.$inferSelect;
export type NewFeatureUsage = typeof featureUsage.$inferInsert;
export type PerformanceMetrics = typeof performanceMetrics.$inferSelect;
export type NewPerformanceMetrics = typeof performanceMetrics.$inferInsert;
export type UserDemographics = typeof userDemographics.$inferSelect;
export type NewUserDemographics = typeof userDemographics.$inferInsert;
export type AnalyticsAggregates = typeof analyticsAggregates.$inferSelect;
export type NewAnalyticsAggregates = typeof analyticsAggregates.$inferInsert;