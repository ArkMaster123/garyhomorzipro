CREATE TABLE IF NOT EXISTS "EmailTemplates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"type" varchar NOT NULL,
	"subject" text NOT NULL,
	"htmlContent" text NOT NULL,
	"dayNumber" integer,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
