import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  json,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './schema';

// Email notifications tracking
export const emailNotifications = pgTable('email_notifications', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id),
  
  // Email details
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }).notNull(),
  templateType: varchar('template_type', { length: 100 }).notNull(), // 'welcome', 'reminder', 'report_ready', 'progress_update'
  
  // Email content and metadata
  htmlContent: text('html_content'),
  textContent: text('text_content'),
  templateData: json('template_data'), // Data used to populate the template
  
  // Delivery tracking
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'sent', 'delivered', 'failed', 'bounced'
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  failureReason: text('failure_reason'),
  
  // Email service metadata
  externalId: varchar('external_id', { length: 100 }), // ID from email service provider
  attemptCount: integer('attempt_count').default(0),
  maxAttempts: integer('max_attempts').default(3),
  
  // Scheduling
  scheduledFor: timestamp('scheduled_for'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('email_notifications_user_id_idx').on(table.userId),
  statusIdx: index('email_notifications_status_idx').on(table.status),
  templateTypeIdx: index('email_notifications_template_type_idx').on(table.templateType),
  scheduledForIdx: index('email_notifications_scheduled_for_idx').on(table.scheduledFor),
  createdAtIdx: index('email_notifications_created_at_idx').on(table.createdAt),
}));

// User notification preferences
export const notificationPreferences = pgTable('notification_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id)
    .unique(),
    
  // Email notification preferences
  emailEnabled: boolean('email_enabled').default(true),
  welcomeEmails: boolean('welcome_emails').default(true),
  progressUpdates: boolean('progress_updates').default(true),
  reportNotifications: boolean('report_notifications').default(true),
  reminderEmails: boolean('reminder_emails').default(true),
  marketingEmails: boolean('marketing_emails').default(false),
  
  // Reminder frequency preferences
  reminderFrequency: varchar('reminder_frequency', { length: 20 }).default('weekly'), // 'daily', 'weekly', 'monthly', 'never'
  progressUpdateFrequency: varchar('progress_update_frequency', { length: 20 }).default('weekly'),
  
  // Communication preferences
  preferredLanguage: varchar('preferred_language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  
  // Timestamps
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index('notification_preferences_user_id_idx').on(table.userId),
}));

// Email campaign tracking (for bulk emails)
export const emailCampaigns = pgTable('email_campaigns', {
  id: serial('id').primaryKey(),
  
  // Campaign details
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  templateType: varchar('template_type', { length: 100 }).notNull(),
  
  // Targeting
  targetUserSegment: json('target_user_segment'), // Criteria for selecting users
  estimatedRecipients: integer('estimated_recipients'),
  
  // Campaign status
  status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled'
  scheduledFor: timestamp('scheduled_for'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // Campaign metrics
  totalSent: integer('total_sent').default(0),
  totalDelivered: integer('total_delivered').default(0),
  totalFailed: integer('total_failed').default(0),
  totalOpens: integer('total_opens').default(0),
  totalClicks: integer('total_clicks').default(0),
  
  // Template and content
  subject: varchar('subject', { length: 500 }),
  htmlContent: text('html_content'),
  textContent: text('text_content'),
  templateData: json('template_data'),
  
  // Metadata
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  statusIdx: index('email_campaigns_status_idx').on(table.status),
  scheduledForIdx: index('email_campaigns_scheduled_for_idx').on(table.scheduledFor),
  createdByIdx: index('email_campaigns_created_by_idx').on(table.createdBy),
}));

// Email templates
export const emailTemplates = pgTable('email_templates', {
  id: serial('id').primaryKey(),
  
  // Template identification
  name: varchar('name', { length: 200 }).notNull(),
  templateType: varchar('template_type', { length: 100 }).notNull().unique(),
  description: text('description'),
  
  // Template content
  subject: varchar('subject', { length: 500 }).notNull(),
  htmlContent: text('html_content').notNull(),
  textContent: text('text_content'),
  
  // Template configuration
  requiredVariables: json('required_variables'), // List of required template variables
  optionalVariables: json('optional_variables'), // List of optional template variables
  
  // Template status
  isActive: boolean('is_active').default(true),
  version: varchar('version', { length: 20 }).default('1.0'),
  
  // Metadata
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  templateTypeIdx: index('email_templates_template_type_idx').on(table.templateType),
  isActiveIdx: index('email_templates_is_active_idx').on(table.isActive),
}));

// Relations
export const emailNotificationsRelations = relations(emailNotifications, ({ one }) => ({
  user: one(users, {
    fields: [emailNotifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

export const emailCampaignsRelations = relations(emailCampaigns, ({ one }) => ({
  createdByUser: one(users, {
    fields: [emailCampaigns.createdBy],
    references: [users.id],
  }),
}));

export const emailTemplatesRelations = relations(emailTemplates, ({ one }) => ({
  createdByUser: one(users, {
    fields: [emailTemplates.createdBy],
    references: [users.id],
  }),
}));

// Type exports
export type EmailNotification = typeof emailNotifications.$inferSelect;
export type NewEmailNotification = typeof emailNotifications.$inferInsert;
export type NotificationPreferences = typeof notificationPreferences.$inferSelect;
export type NewNotificationPreferences = typeof notificationPreferences.$inferInsert;
export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type NewEmailCampaign = typeof emailCampaigns.$inferInsert;
export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type NewEmailTemplate = typeof emailTemplates.$inferInsert;

// Enums
export enum EmailTemplateType {
  WELCOME = 'welcome',
  QUESTIONNAIRE_REMINDER = 'questionnaire_reminder',
  REPORT_READY = 'report_ready',
  PROGRESS_UPDATE = 'progress_update',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  WEEKLY_DIGEST = 'weekly_digest',
  COLLEGE_APPLICATION_REMINDER = 'college_application_reminder',
  SCHOLARSHIP_NOTIFICATION = 'scholarship_notification',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}