ALTER TABLE "questionnaire_responses" ADD COLUMN "dify_results" json;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD COLUMN "dify_job_id" varchar(100);--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD COLUMN "dify_processed_at" timestamp;