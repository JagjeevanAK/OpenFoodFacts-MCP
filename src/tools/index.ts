import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { searchProducts, getProductByBarcode } from "./product-search.js";
import { requestSampling, createRecipeSuggestionRequest, getResponseText } from "../sampling/sampling-service.js";
import { logger } from '../transport/transports.js';

/**
 * Flexible product lookup - accepts either barcode or product name.
 * If barcode provided, fetches directly. Otherwise, searches by name
 * and retrieves the first matching product's full details.
 */
async function findProduct(nameOrBarcode: string): Promise<any> {
  if (!nameOrBarcode?.trim()) return null;

  const query = nameOrBarcode.trim();
  const isBarcode = /^\d+$/.test(query);

  if (isBarcode) {
    try {
      const product = await getProductByBarcode(query);
      if (product) return { product };
    } catch (error) {
      logger.error(`Barcode lookup failed: ${error}`);
    }
  }

  try {
    const results = await searchProducts(query, 1, 1);
    const barcode = results?.products?.[0]?.barcode;
    if (barcode) {
      const product = await getProductByBarcode(barcode);
      return { product };
    }
  } catch (error) {
    logger.error(`Search failed: ${error}`);
  }

  return null;
}

// Schema definitions
const searchSchema = { query: z.string(), page: z.number().default(1), pageSize: z.number().default(10) };
const barcodeSchema = { barcode: z.string() };
const productSchema = { nameOrBarcode: z.string() };
const compareSchema = { nameOrBarcode1: z.string(), nameOrBarcode2: z.string() };

export function registerTools(server: McpServer): void {
  server.registerTool('searchProducts', {
    description: 'Search products by name, brand, or category',
    inputSchema: searchSchema
  }, async ({ query, page, pageSize }) => {
    try {
      const results = await searchProducts(query, page ?? 1, pageSize ?? 10);
      return { content: [{ type: 'text' as const, text: JSON.stringify(results) }] };
    } catch (error: any) {
      return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
    }
  });

  // getProductByBarcode - direct barcode lookup
  server.registerTool('getProductByBarcode', {
    description: 'Get product details by barcode (EAN/UPC)',
    inputSchema: barcodeSchema
  }, async ({ barcode }) => {
    try {
      const product = await getProductByBarcode(barcode);
      return { content: [{ type: 'text' as const, text: JSON.stringify(product) }] };
    } catch (error: any) {
      return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
    }
  });

  /**
   * AI-powered analysis via MCP sampling.
   * Sends product data to connected LLM for nutritional insights.
   * Falls back to basic info if sampling unavailable.
   */
  server.registerTool('analyzeProduct', {
    description: 'Get AI nutritional analysis of a product',
    inputSchema: productSchema
  }, async ({ nameOrBarcode }) => {
    if (!nameOrBarcode?.trim()) {
      return { content: [{ type: 'text' as const, text: 'Provide a product name or barcode.' }], isError: true };
    }

    const productData = await findProduct(nameOrBarcode);
    if (!productData?.product) {
      return { content: [{ type: 'text' as const, text: `"${nameOrBarcode}" not found. Try searchProducts first.` }], isError: true };
    }

    const p = productData.product;
    try {
      const res = await requestSampling(server, {
        messages: [{ role: "user" as const, content: { type: "text" as const, text: `Analyze:\n\n${JSON.stringify(p, null, 2)}` } }],
        systemPrompt: "Nutritional expert. Provide: 1) Overview 2) Nutrition 3) Ingredients 4) Allergens 5) Health 6) Recommendations",
        modelPreferences: { hints: [{ name: "claude-3" }], intelligencePriority: 0.9 },
        includeContext: "thisServer" as const,
        temperature: 0.3,
        maxTokens: 1500
      });
      const header = `# ${p.product_name || "Product"} (${p.brands || "Unknown"})\n`;
      return { content: [{ type: 'text' as const, text: header + getResponseText(res) }] };
    } catch {
      return { content: [{ type: 'text' as const, text: `# ${p.product_name}\nBrand: ${p.brands}\nNutri-Score: ${p.nutriscore_grade}\nIngredients: ${p.ingredients_text}` }] };
    }
  });

  /**
   * AI-powered comparison via MCP sampling.
   * Fetches both products in parallel, then requests comparative analysis.
   */
  server.registerTool('compareProducts', {
    description: 'Compare two products using AI',
    inputSchema: compareSchema
  }, async ({ nameOrBarcode1, nameOrBarcode2 }) => {
    if (!nameOrBarcode1?.trim() || !nameOrBarcode2?.trim()) {
      return { content: [{ type: 'text' as const, text: 'Provide both products.' }], isError: true };
    }

    const [d1, d2] = await Promise.all([findProduct(nameOrBarcode1), findProduct(nameOrBarcode2)]);
    if (!d1?.product) return { content: [{ type: 'text' as const, text: `"${nameOrBarcode1}" not found.` }], isError: true };
    if (!d2?.product) return { content: [{ type: 'text' as const, text: `"${nameOrBarcode2}" not found.` }], isError: true };

    try {
      const res = await requestSampling(server, {
        messages: [{ role: "user" as const, content: { type: "text" as const, text: `Compare:\n\n1:\n${JSON.stringify(d1.product)}\n\n2:\n${JSON.stringify(d2.product)}` } }],
        systemPrompt: "Compare: 1) Overview 2) Nutrition 3) Ingredients 4) Health 5) Recommendation",
        modelPreferences: { hints: [{ name: "claude-3" }], intelligencePriority: 0.9 },
        includeContext: "thisServer" as const,
        temperature: 0.2,
        maxTokens: 2000
      });
      return { content: [{ type: 'text' as const, text: `# ${d1.product.product_name} vs ${d2.product.product_name}\n\n${getResponseText(res)}` }] };
    } catch {
      return { content: [{ type: 'text' as const, text: `# ${d1.product.product_name} vs ${d2.product.product_name}\nNutri-Score: ${d1.product.nutriscore_grade} vs ${d2.product.nutriscore_grade}` }] };
    }
  });

  /**
   * AI-powered recipe generation via MCP sampling.
   */
  server.registerTool('suggestRecipes', {
    description: 'Get AI recipe suggestions using a product',
    inputSchema: productSchema
  }, async ({ nameOrBarcode }) => {
    if (!nameOrBarcode?.trim()) {
      return { content: [{ type: 'text' as const, text: 'Provide a product.' }], isError: true };
    }

    const productData = await findProduct(nameOrBarcode);
    if (!productData?.product) {
      return { content: [{ type: 'text' as const, text: `"${nameOrBarcode}" not found.` }], isError: true };
    }

    try {
      const res = await requestSampling(server, createRecipeSuggestionRequest(productData.product));
      return { content: [{ type: 'text' as const, text: `# Recipes using ${productData.product.product_name}\n\n${getResponseText(res)}` }] };
    } catch (e: any) {
      return { content: [{ type: 'text' as const, text: `Recipe generation failed: ${e.message}` }], isError: true };
    }
  });

  logger.info("OpenFoodFacts tools registered");
}
