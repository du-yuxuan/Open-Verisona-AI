CREATE TABLE "analytics_aggregates" (
	"id" serial PRIMARY KEY NOT NULL,
	"aggregate_type" varchar(20) NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"total_users" integer DEFAULT 0,
	"new_users" integer DEFAULT 0,
	"active_users" integer DEFAULT 0,
	"returning_users" integer DEFAULT 0,
	"total_sessions" integer DEFAULT 0,
	"avg_session_duration" real,
	"bounce_rate" real,
	"questionnaires_started" integer DEFAULT 0,
	"questionnaires_completed" integer DEFAULT 0,
	"avg_completion_rate" real,
	"avg_questionnaire_time" real,
	"accessibility_usage" integer DEFAULT 0,
	"ai_feature_usage" integer DEFAULT 0,
	"mobile_usage" integer DEFAULT 0,
	"equity_eligible_users" integer DEFAULT 0,
	"first_gen_users" integer DEFAULT 0,
	"low_income_users" integer DEFAULT 0,
	"avg_load_time" real,
	"avg_lcp" real,
	"error_rate" real,
	"computed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_usage" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"feature_name" varchar(100) NOT NULL,
	"feature_category" varchar(50),
	"usage_count" integer DEFAULT 1,
	"first_used" timestamp DEFAULT now() NOT NULL,
	"last_used" timestamp DEFAULT now() NOT NULL,
	"total_time_used" integer DEFAULT 0,
	"device_type" varchar(20),
	"browser_type" varchar(50),
	"successful_uses" integer DEFAULT 0,
	"error_count" integer DEFAULT 0,
	"abandonment_count" integer DEFAULT 0,
	"satisfaction_rating" real,
	"metadata" json,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_views" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" uuid,
	"path" varchar(500) NOT NULL,
	"title" varchar(200),
	"referrer" varchar(500),
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"time_on_page" integer,
	"load_time" integer,
	"scroll_depth" real,
	"click_count" integer DEFAULT 0,
	"form_interactions" integer DEFAULT 0,
	"is_page_error" boolean DEFAULT false,
	"error_message" text
);
--> statement-breakpoint
CREATE TABLE "performance_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" uuid,
	"path" varchar(500) NOT NULL,
	"lcp" real,
	"fid" real,
	"cls" real,
	"fcp" real,
	"ttfb" real,
	"connection_type" varchar(20),
	"download_speed" real,
	"device_memory" real,
	"hardware_concurrency" integer,
	"js_heap_size_used" integer,
	"js_heap_size_limit" integer,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionnaire_id" integer NOT NULL,
	"user_id" integer,
	"session_id" uuid,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"total_duration" integer,
	"avg_question_time" real,
	"questions_answered" integer DEFAULT 0,
	"questions_skipped" integer DEFAULT 0,
	"questions_revised" integer DEFAULT 0,
	"completion_rate" real,
	"pause_count" integer DEFAULT 0,
	"total_pause_time" integer DEFAULT 0,
	"backtrack_count" integer DEFAULT 0,
	"dynamic_questions_generated" integer DEFAULT 0,
	"ai_help_used" integer DEFAULT 0,
	"response_quality_score" real,
	"engagement_score" real,
	"device_type" varchar(20),
	"completed_on" varchar(20),
	"final_status" varchar(20),
	"dropped_at_question" integer
);
--> statement-breakpoint
CREATE TABLE "user_demographics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"age_range" varchar(20),
	"school_type" varchar(50),
	"first_generation" boolean,
	"household_income_range" varchar(30),
	"eligible_for_free_reduced" boolean,
	"rural_urban_suburban" varchar(20),
	"state_code" varchar(2),
	"gpa_range" varchar(20),
	"college_intent" varchar(50),
	"has_accessibility_needs" boolean DEFAULT false,
	"accessibility_types" json,
	"primary_device" varchar(20),
	"internet_access" varchar(30),
	"analytics_consent" boolean DEFAULT false,
	"demographics_consent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_demographics_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"session_id" uuid,
	"event_type" varchar(50) NOT NULL,
	"event_category" varchar(50),
	"event_action" varchar(100) NOT NULL,
	"event_label" varchar(200),
	"page_url" varchar(500),
	"element_id" varchar(100),
	"element_class" varchar(200),
	"element_text" text,
	"event_value" real,
	"properties" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" uuid NOT NULL,
	"device_type" varchar(20),
	"browser" varchar(50),
	"os" varchar(50),
	"ip_address" varchar(45),
	"user_agent" text,
	"country" varchar(2),
	"region" varchar(100),
	"city" varchar(100),
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration" integer,
	"page_views" integer DEFAULT 0,
	"interactions" integer DEFAULT 0,
	"is_engaged" boolean DEFAULT false,
	"accessibility_mode_used" boolean DEFAULT false,
	"text_to_speech_used" boolean DEFAULT false,
	"high_contrast_used" boolean DEFAULT false,
	CONSTRAINT "user_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "demographic_info" json;--> statement-breakpoint
ALTER TABLE "feature_usage" ADD CONSTRAINT "feature_usage_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "page_views" ADD CONSTRAINT "page_views_session_id_user_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_metrics" ADD CONSTRAINT "performance_metrics_session_id_user_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_analytics" ADD CONSTRAINT "questionnaire_analytics_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_analytics" ADD CONSTRAINT "questionnaire_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_analytics" ADD CONSTRAINT "questionnaire_analytics_session_id_questionnaire_responses_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."questionnaire_responses"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_demographics" ADD CONSTRAINT "user_demographics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_events" ADD CONSTRAINT "user_events_session_id_user_sessions_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."user_sessions"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "analytics_aggregates_period_idx" ON "analytics_aggregates" USING btree ("aggregate_type","period_start");--> statement-breakpoint
CREATE INDEX "feature_usage_user_id_idx" ON "feature_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "feature_usage_name_idx" ON "feature_usage" USING btree ("feature_name");--> statement-breakpoint
CREATE INDEX "feature_usage_last_used_idx" ON "feature_usage" USING btree ("last_used");--> statement-breakpoint
CREATE INDEX "page_views_user_id_idx" ON "page_views" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "page_views_path_idx" ON "page_views" USING btree ("path");--> statement-breakpoint
CREATE INDEX "page_views_timestamp_idx" ON "page_views" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "performance_metrics_user_id_idx" ON "performance_metrics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "performance_metrics_path_idx" ON "performance_metrics" USING btree ("path");--> statement-breakpoint
CREATE INDEX "performance_metrics_timestamp_idx" ON "performance_metrics" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "questionnaire_analytics_qid_idx" ON "questionnaire_analytics" USING btree ("questionnaire_id");--> statement-breakpoint
CREATE INDEX "questionnaire_analytics_user_id_idx" ON "questionnaire_analytics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "questionnaire_analytics_start_time_idx" ON "questionnaire_analytics" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "user_events_user_id_idx" ON "user_events" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_events_type_idx" ON "user_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "user_events_timestamp_idx" ON "user_events" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_sessions_session_id_idx" ON "user_sessions" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_sessions_start_time_idx" ON "user_sessions" USING btree ("started_at");