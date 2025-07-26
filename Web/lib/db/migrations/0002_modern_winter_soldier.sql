CREATE TABLE "college_recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"report_id" integer,
	"college_name" varchar(200) NOT NULL,
	"college_id" varchar(100),
	"match_score" real NOT NULL,
	"personality_match" real,
	"academic_match" real,
	"cultural_match" real,
	"reasons" json,
	"highlights" json,
	"considerations" json,
	"is_bookmarked" boolean DEFAULT false,
	"application_status" varchar(50),
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "question_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" uuid NOT NULL,
	"question_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"response_text" text,
	"response_value" json,
	"response_score" real,
	"time_spent_seconds" integer,
	"is_revised" boolean DEFAULT false,
	"revision_count" integer DEFAULT 0,
	"answered_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"questionnaire_id" integer NOT NULL,
	"session_id" uuid NOT NULL,
	"status" varchar(20) DEFAULT 'in_progress' NOT NULL,
	"current_question_id" integer,
	"total_questions" integer,
	"answered_questions" integer DEFAULT 0,
	"progress_percentage" real DEFAULT 0,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"last_activity_at" timestamp DEFAULT now() NOT NULL,
	"responses" json,
	"metadata" json,
	CONSTRAINT "questionnaire_responses_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"category" varchar(100),
	"version" varchar(20) DEFAULT '1.0',
	"is_active" boolean DEFAULT true,
	"estimated_duration" integer,
	"dify_workflow_id" varchar(100),
	"dify_configuration" json,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionnaire_id" integer NOT NULL,
	"question_text" text NOT NULL,
	"question_type" varchar(50) NOT NULL,
	"category" varchar(100),
	"options" json,
	"is_required" boolean DEFAULT true,
	"order" integer NOT NULL,
	"conditions" json,
	"is_ai_generated" boolean DEFAULT false,
	"ai_prompt" text,
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"session_id" uuid,
	"title" varchar(200) NOT NULL,
	"type" varchar(50) NOT NULL,
	"status" varchar(20) DEFAULT 'generating' NOT NULL,
	"summary" text,
	"content" json,
	"insights" json,
	"scores" json,
	"dify_job_id" varchar(100),
	"dify_response" json,
	"processing_log" json,
	"is_shared" boolean DEFAULT false,
	"share_token" varchar(64),
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_viewed_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "college_recommendations" ADD CONSTRAINT "college_recommendations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "college_recommendations" ADD CONSTRAINT "college_recommendations_report_id_reports_id_fk" FOREIGN KEY ("report_id") REFERENCES "public"."reports"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_session_id_questionnaire_responses_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."questionnaire_responses"("session_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_responses" ADD CONSTRAINT "question_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_current_question_id_questions_id_fk" FOREIGN KEY ("current_question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_session_id_questionnaire_responses_session_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."questionnaire_responses"("session_id") ON DELETE no action ON UPDATE no action;