CREATE TABLE "email_campaigns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"template_type" varchar(100) NOT NULL,
	"target_user_segment" json,
	"estimated_recipients" integer,
	"status" varchar(50) DEFAULT 'draft',
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_sent" integer DEFAULT 0,
	"total_delivered" integer DEFAULT 0,
	"total_failed" integer DEFAULT 0,
	"total_opens" integer DEFAULT 0,
	"total_clicks" integer DEFAULT 0,
	"subject" varchar(500),
	"html_content" text,
	"text_content" text,
	"template_data" json,
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"recipient_email" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"template_type" varchar(100) NOT NULL,
	"html_content" text,
	"text_content" text,
	"template_data" json,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"failure_reason" text,
	"external_id" varchar(100),
	"attempt_count" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 3,
	"scheduled_for" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"template_type" varchar(100) NOT NULL,
	"description" text,
	"subject" varchar(500) NOT NULL,
	"html_content" text NOT NULL,
	"text_content" text,
	"required_variables" json,
	"optional_variables" json,
	"is_active" boolean DEFAULT true,
	"version" varchar(20) DEFAULT '1.0',
	"created_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email_templates_template_type_unique" UNIQUE("template_type")
);
--> statement-breakpoint
CREATE TABLE "notification_preferences" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"email_enabled" boolean DEFAULT true,
	"welcome_emails" boolean DEFAULT true,
	"progress_updates" boolean DEFAULT true,
	"report_notifications" boolean DEFAULT true,
	"reminder_emails" boolean DEFAULT true,
	"marketing_emails" boolean DEFAULT false,
	"reminder_frequency" varchar(20) DEFAULT 'weekly',
	"progress_update_frequency" varchar(20) DEFAULT 'weekly',
	"preferred_language" varchar(10) DEFAULT 'en',
	"timezone" varchar(50) DEFAULT 'UTC',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_notifications" ADD CONSTRAINT "email_notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "email_campaigns_status_idx" ON "email_campaigns" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_campaigns_scheduled_for_idx" ON "email_campaigns" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "email_campaigns_created_by_idx" ON "email_campaigns" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "email_notifications_user_id_idx" ON "email_notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_notifications_status_idx" ON "email_notifications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_notifications_template_type_idx" ON "email_notifications" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "email_notifications_scheduled_for_idx" ON "email_notifications" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "email_notifications_created_at_idx" ON "email_notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_templates_template_type_idx" ON "email_templates" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "email_templates_is_active_idx" ON "email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences" USING btree ("user_id");