ALTER TABLE "users" ADD COLUMN "first_name" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" varchar(50);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "graduation_year" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "school_name" varchar(200);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_completed" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "preferences" json;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "equity_eligible" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;