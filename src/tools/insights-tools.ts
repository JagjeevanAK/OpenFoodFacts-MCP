import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
    getQuestions,
    getInsights,
    getProductQuestions
} from './helpers.js';
import { INSIGHT_TYPES } from './types.js';
import { logger } from '../transport/transports.js';

// Schema definitions
const barcodeSchema = {
    barcode: z.string().describe('Product barcode (EAN/UPC)')
};

const insightsQuerySchema = {
    barcode: z.string().optional().describe('Filter by product barcode'),
    insightType: z.enum([
        'label', 'category', 'product_weight', 'brand', 'expiration_date',
        'packaging', 'store', 'nutrient', 'ingredient_spellcheck', 'nutrition_image'
    ]).optional().describe('Type of insight to retrieve'),
    country: z.string().optional().describe('Filter by country'),
    count: z.number().default(10).describe('Number of insights to return'),
    page: z.number().default(1).describe('Page number')
};

const questionsQuerySchema = {
    barcode: z.string().optional().describe('Filter by product barcode'),
    insightType: z.enum([
        'label', 'category', 'product_weight', 'brand', 'expiration_date',
        'packaging', 'store', 'nutrient', 'ingredient_spellcheck'
    ]).optional().describe('Type of question to retrieve'),
    lang: z.string().default('en').describe('Language for questions'),
    count: z.number().default(10).describe('Number of questions to return')
};

export function registerInsightsTools(server: McpServer): void {
    server.registerTool('getProductAIQuestions', {
        description: 'Get AI-generated questions about a product that need human verification (e.g., "Is this product organic?", "Does this contain gluten?")',
        inputSchema: barcodeSchema
    }, async ({ barcode }) => {
        try {
            const result = await getProductQuestions(barcode);

            if (result.count === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `No AI questions pending for product ${barcode}. The product data may be complete or not yet analyzed.`
                    }]
                };
            }

            let message = `Found ${result.count} AI-generated questions for product ${barcode}:\n\n`;
            result.questions.forEach((q, i) => {
                message += `${i + 1}. ${q.question}\n`;
                message += `   Suggested answer: ${q.value}\n`;
                message += `   Type: ${q.insightType}\n\n`;
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: message + `\n\nRaw data:\n${JSON.stringify(result, null, 2)}`
                }]
            };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getRandomAIQuestions', {
        description: 'Get random AI-generated questions from Robotoff that need human verification - great for community contribution',
        inputSchema: questionsQuerySchema
    }, async ({ barcode, insightType, lang, count }) => {
        try {
            const result = await getQuestions({
                barcode,
                insightType,
                lang: lang ?? 'en',
                count: count ?? 10
            });

            if (result.count === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: 'No AI questions available at this time.'
                    }]
                };
            }

            let message = `Found ${result.count} AI-generated questions:\n\n`;
            result.questions.forEach((q, i) => {
                message += `${i + 1}. [${q.barcode}] ${q.question}\n`;
                message += `   Suggested: ${q.value} (${q.insightType})\n\n`;
            });

            return { content: [{ type: 'text' as const, text: message }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getProductInsights', {
        description: 'Get AI-generated insights about products (detected labels, categories, ingredients issues, etc.)',
        inputSchema: insightsQuerySchema
    }, async ({ barcode, insightType, country, count, page }) => {
        try {
            const result = await getInsights({
                barcode,
                insightType,
                country,
                count: count ?? 10,
                page: page ?? 1
            });

            if (result.count === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: 'No insights available matching your criteria.'
                    }]
                };
            }

            let message = `Found ${result.count} AI insights:\n\n`;
            result.insights.forEach((i, idx) => {
                message += `${idx + 1}. [${i.barcode}] ${i.type}: ${i.value}\n`;
                message += `   Confidence: ${(i.confidence * 100).toFixed(1)}%\n`;
                message += `   Predictor: ${i.predictor}\n\n`;
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: message + `\n\nRaw data:\n${JSON.stringify(result, null, 2)}`
                }]
            };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getInsightTypes', {
        description: 'Get a summary of available AI insight types in Robotoff',
        inputSchema: {}
    }, async () => {
        let message = '# Robotoff AI Insight Types\n\n';
        message += 'Robotoff is the AI system that analyzes product images and data.\n\n';
        INSIGHT_TYPES.forEach(t => {
            message += `- **${t.type}**: ${t.description}\n`;
        });

        return { content: [{ type: 'text' as const, text: message }] };
    });

    logger.info("Insights tools registered: getProductAIQuestions, getRandomAIQuestions, getProductInsights, getInsightTypes");
}
