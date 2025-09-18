ALTER TABLE "User" ADD COLUMN "clerkId" varchar(128);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "name" varchar(128);--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;