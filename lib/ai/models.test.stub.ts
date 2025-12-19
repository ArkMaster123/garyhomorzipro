// Stub file for test models - used in production builds to avoid bundling test dependencies
// This file provides empty stubs that won't be used in production (isTestEnvironment will be false)

import type { LanguageModel } from 'ai';

// Stub models that won't be used in production
export const chatModel = null as any as LanguageModel;
export const reasoningModel = null as any as LanguageModel;
export const titleModel = null as any as LanguageModel;
export const artifactModel = null as any as LanguageModel;
