import { pgTable, foreignKey, uuid, timestamp, text, boolean, varchar, json, integer, jsonb, vector, primaryKey } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"




export const suggestion = pgTable("Suggestion", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	documentId: uuid().notNull(),
	documentCreatedAt: timestamp({ mode: 'string' }).notNull(),
	originalText: text().notNull(),
	suggestedText: text().notNull(),
	description: text(),
	isResolved: boolean().default(false).notNull(),
	userId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		suggestionUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Suggestion_userId_User_id_fk"
		}),
		suggestionDocumentIdDocumentCreatedAtDocumentIdCreatedAtF: foreignKey({
			columns: [table.documentId, table.documentCreatedAt],
			foreignColumns: [document.id, document.createdAt],
			name: "Suggestion_documentId_documentCreatedAt_Document_id_createdAt_f"
		}),
	}
});

export const user = pgTable("User", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 64 }).notNull(),
	password: varchar({ length: 64 }),
	persona: varchar({ length: 32 }).default('default'),
	name: varchar({ length: 128 }),
	image: text(),
	emailVerified: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

// NextAuth tables
export const account = pgTable("Account", {
	id: text().primaryKey().notNull(),
	userId: uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refresh_token: text(),
	access_token: text(),
	expires_at: integer(),
	token_type: text(),
	scope: text(),
	id_token: text(),
	session_state: text(),
});

export const session = pgTable("Session", {
	id: text().primaryKey().notNull(),
	sessionToken: text().notNull().unique(),
	userId: uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const verificationToken = pgTable("VerificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (vt) => ({
	compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
}));

// Invite table for email invite system
export const invite = pgTable("Invite", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	code: varchar({ length: 255 }).notNull().unique(),
	email: varchar({ length: 255 }).notNull(),
	invitedBy: uuid().notNull().references(() => user.id, { onDelete: "cascade" }),
	used: boolean().default(false).notNull(),
	usedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	maxUses: integer().default(1).notNull(),
	usageCount: integer().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const message = pgTable("Message", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	content: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_chatId_Chat_id_fk"
		}),
	}
});

export const chat = pgTable("Chat", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	userId: uuid().notNull(),
	title: text().notNull(),
	visibility: varchar().default('private').notNull(),
},
(table) => {
	return {
		chatUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Chat_userId_User_id_fk"
		}),
	}
});

export const messageV2 = pgTable("Message_v2", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	role: varchar().notNull(),
	parts: json().notNull(),
	attachments: json().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		messageV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Message_v2_chatId_Chat_id_fk"
		}),
	}
});

export const stream = pgTable("Stream", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => {
	return {
		streamChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Stream_chatId_Chat_id_fk"
		}),
	}
});

export const emailTemplates = pgTable("EmailTemplates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: varchar().notNull(),
	subject: text().notNull(),
	htmlContent: text().notNull(),
	dayNumber: integer(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
});

export const adminUser = pgTable("AdminUser", {
	userId: uuid().primaryKey().notNull(),
	role: varchar({ length: 32 }).default('admin').notNull(),
	permissions: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		adminUserUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "AdminUser_userId_User_id_fk"
		}),
	}
});

export const knowledgeBase = pgTable("KnowledgeBase", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	personaId: varchar({ length: 32 }).notNull(),
	title: text().notNull(),
	content: text().notNull(),
	contentType: varchar({ length: 16 }).notNull(),
	fileUrl: text(),
	embedding: vector({ dimensions: 1536 }),
	metadata: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdBy: uuid().notNull(),
},
(table) => {
	return {
		knowledgeBaseCreatedByUserIdFk: foreignKey({
			columns: [table.createdBy],
			foreignColumns: [user.id],
			name: "KnowledgeBase_createdBy_User_id_fk"
		}),
	}
});

export const knowledgeChunk = pgTable("KnowledgeChunk", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	knowledgeBaseId: uuid().notNull(),
	chunkIndex: integer().notNull(),
	content: text().notNull(),
	embedding: vector({ dimensions: 1536 }),
	metadata: jsonb(),
},
(table) => {
	return {
		knowledgeChunkKnowledgeBaseIdKnowledgeBaseIdFk: foreignKey({
			columns: [table.knowledgeBaseId],
			foreignColumns: [knowledgeBase.id],
			name: "KnowledgeChunk_knowledgeBaseId_KnowledgeBase_id_fk"
		}).onDelete("cascade"),
	}
});

export const vote = pgTable("Vote", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_chatId_Chat_id_fk"
		}),
		voteMessageIdMessageIdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [message.id],
			name: "Vote_messageId_Message_id_fk"
		}),
		voteChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_chatId_messageId_pk"}),
	}
});

export const voteV2 = pgTable("Vote_v2", {
	chatId: uuid().notNull(),
	messageId: uuid().notNull(),
	isUpvoted: boolean().notNull(),
},
(table) => {
	return {
		voteV2ChatIdChatIdFk: foreignKey({
			columns: [table.chatId],
			foreignColumns: [chat.id],
			name: "Vote_v2_chatId_Chat_id_fk"
		}),
		voteV2MessageIdMessageV2IdFk: foreignKey({
			columns: [table.messageId],
			foreignColumns: [messageV2.id],
			name: "Vote_v2_messageId_Message_v2_id_fk"
		}),
		voteV2ChatIdMessageIdPk: primaryKey({ columns: [table.chatId, table.messageId], name: "Vote_v2_chatId_messageId_pk"}),
	}
});

export const document = pgTable("Document", {
	id: uuid().defaultRandom().notNull(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	title: text().notNull(),
	content: text(),
	userId: uuid().notNull(),
	text: varchar().default('text').notNull(),
},
(table) => {
	return {
		documentUserIdUserIdFk: foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "Document_userId_User_id_fk"
		}),
		documentIdCreatedAtPk: primaryKey({ columns: [table.id, table.createdAt], name: "Document_id_createdAt_pk"}),
	}
});
