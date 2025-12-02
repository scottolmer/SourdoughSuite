// AI Service Switcher
// This file decides which AI service implementation to use based on configuration

import * as openAIService from './ai-service';
import * as geminiService from './gemini-service';

// Configure which service to use
const ACTIVE_SERVICE = 'openai'; // Options: 'openai' or 'gemini'

// Export all functions from the active service
export const makeAIRequest = ACTIVE_SERVICE === 'gemini' ? geminiService.makeAIRequest : openAIService.makeAIRequest;
export const testConnection = ACTIVE_SERVICE === 'gemini' ? geminiService.testConnection : openAIService.testConnection;
export const generateRecipe = ACTIVE_SERVICE === 'gemini' ? geminiService.generateRecipe : openAIService.generateRecipe;
export const generateBlogPost = ACTIVE_SERVICE === 'gemini' ? geminiService.generateBlogPost : openAIService.generateBlogPost;
export const generateFaqs = ACTIVE_SERVICE === 'gemini' ? geminiService.generateFaqs : openAIService.generateFaqs;
export const analyzeRecipe = ACTIVE_SERVICE === 'gemini' ? geminiService.analyzeRecipe : openAIService.analyzeRecipe;
export const recommendStarter = ACTIVE_SERVICE === 'gemini' ? geminiService.recommendStarter : openAIService.recommendStarter;
export const generateBakingTimeline = ACTIVE_SERVICE === 'gemini' ? geminiService.generateBakingTimeline : openAIService.generateBakingTimeline;
export const suggestSubstitutions = ACTIVE_SERVICE === 'gemini' ? geminiService.suggestSubstitutions : openAIService.suggestSubstitutions;
export const troubleshootBaking = ACTIVE_SERVICE === 'gemini' ? geminiService.troubleshootBaking : openAIService.troubleshootBaking;