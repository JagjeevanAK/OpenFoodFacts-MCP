/**
 * MCP Sampling Service
 * 
 * Provides AI completion capabilities via connected LLM clients.
 * Used for product analysis, comparisons, and recipe suggestions.
 */

import { CreateMessageResult } from "@modelcontextprotocol/sdk/types.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export interface SamplingRequest {
  messages: Array<{
    role: "user" | "assistant";
    content: {
      type: "text" | "image";
      text?: string;
      data?: string;
      mimeType?: string;
    }
  }>;
  modelPreferences?: {
    hints?: Array<{ name?: string }>;
    costPriority?: number;
    speedPriority?: number;
    intelligencePriority?: number;
  };
  systemPrompt?: string;
  includeContext?: "none" | "thisServer" | "allServers";
  temperature?: number;
  maxTokens: number;
  stopSequences?: string[];
  metadata?: Record<string, unknown>;
}

const CreateMessageResultSchema = z.object({
  model: z.string(),
  stopReason: z.string().optional(),
  role: z.enum(["user", "assistant"]),
  content: z.object({
    type: z.enum(["text", "image"]),
    text: z.string().optional(),
    data: z.string().optional(),
    mimeType: z.string().optional(),
  }),
});

/**
 * Request a completion from an LLM via the connected client
 */
export async function requestSampling(
  mcpServer: McpServer,
  request: SamplingRequest
): Promise<CreateMessageResult> {
  try {
    const response = await mcpServer.server.request({
      method: "sampling/createMessage",
      params: {
        messages: request.messages,
        modelPreferences: request.modelPreferences,
        systemPrompt: request.systemPrompt,
        includeContext: request.includeContext,
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        stopSequences: request.stopSequences,
        metadata: request.metadata
      }
    }, CreateMessageResultSchema);

    return response as CreateMessageResult;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Sampling request failed: ${errorMessage}`);
  }
}

/**
 * Extract text from a sampling response
 */
export function getResponseText(response: CreateMessageResult): string {
  if (response.content.type === 'text') {
    return response.content.text;
  }
  return '';
}

/**
 * Creates a recipe suggestion request for a product
 */
export function createRecipeSuggestionRequest(productData: any): SamplingRequest {
  const productName = productData.product_name || "this product";
  const category = productData.categories || "food item";
  const ingredients = productData.ingredients_text || "";
  const nutriments = productData.nutriments || {};
  const allergens = productData.allergens || "";
  const brands = productData.brands || "";

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: `Generate recipe suggestions for ${productName} (${brands}). ` +
            `Nutritional profile: Energy ${nutriments.energy_100g || "unknown"} kcal, ` +
            `Fat ${nutriments.fat_100g || "unknown"}g, ` +
            `Proteins ${nutriments.proteins_100g || "unknown"}g, ` +
            `Carbs ${nutriments.carbohydrates_100g || "unknown"}g.\n\n` +
            `Category: ${category}\nIngredients: ${ingredients}\nAllergens: ${allergens}`
        }
      }
    ],
    modelPreferences: {
      hints: [{ name: "claude-3" }, { name: "gpt-4o" }],
      intelligencePriority: 0.8,
      speedPriority: 0.5
    },
    systemPrompt: `You are a creative culinary nutritionist. Generate 4 recipe suggestions:
1. LOW-CALORIE: Light meal focusing on weight management
2. PROTEIN-RICH: Recipe for fitness enthusiasts  
3. QUICK & EASY: Minimal prep and cooking time
4. FAMILY-FRIENDLY: Balanced meal for all ages

For each recipe, provide:
- Recipe name
- Ingredient list with measurements
- Brief preparation steps
- Approximate nutrition per serving
- Health benefit highlight`,
    includeContext: "thisServer",
    temperature: 0.7,
    maxTokens: 3500
  };
}