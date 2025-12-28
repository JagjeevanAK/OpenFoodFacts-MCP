import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
    findProduct,
    getNutriScore,
    getEcoScore,
    getAdditivesInfo,
    checkAllergen,
    checkMultipleAllergens
} from './helpers.js';
import { logger } from '../transport/transports.js';

// Schema definitions
const productIdentifierSchema = {
    nameOrBarcode: z.string().describe('Product name or barcode (EAN/UPC)')
};

const allergenCheckSchema = {
    nameOrBarcode: z.string().describe('Product name or barcode'),
    allergen: z.string().describe('Allergen to check for (e.g., "gluten", "milk", "eggs", "nuts", "peanuts", "soy", "fish", "shellfish")')
};

const multiAllergenSchema = {
    nameOrBarcode: z.string().describe('Product name or barcode'),
    allergens: z.array(z.string()).describe('List of allergens to check (e.g., ["gluten", "milk", "eggs"])')
};

export function registerNutritionTools(server: McpServer): void {
    server.registerTool('getNutriScore', {
        description: 'Get the Nutri-Score grade (A-E) for a product - quick health assessment at a glance',
        inputSchema: productIdentifierSchema
    }, async ({ nameOrBarcode }) => {
        try {
            const product = await findProduct(nameOrBarcode);
            if (!product) {
                return { content: [{ type: 'text' as const, text: `Product "${nameOrBarcode}" not found.` }], isError: true };
            }
            const result = getNutriScore(product);
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getEcoScore', {
        description: 'Get the Eco-Score (environmental impact rating A-E) for a product',
        inputSchema: productIdentifierSchema
    }, async ({ nameOrBarcode }) => {
        try {
            const product = await findProduct(nameOrBarcode);
            if (!product) {
                return { content: [{ type: 'text' as const, text: `Product "${nameOrBarcode}" not found.` }], isError: true };
            }
            const result = getEcoScore(product);
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getAdditivesInfo', {
        description: 'List all additives in a product with their E-numbers and NOVA processing level',
        inputSchema: productIdentifierSchema
    }, async ({ nameOrBarcode }) => {
        try {
            const product = await findProduct(nameOrBarcode);
            if (!product) {
                return { content: [{ type: 'text' as const, text: `Product "${nameOrBarcode}" not found.` }], isError: true };
            }
            const result = getAdditivesInfo(product);
            return { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getAllergenCheck', {
        description: 'Check if a product contains a specific allergen (gluten, milk, eggs, nuts, peanuts, soy, fish, shellfish, etc.)',
        inputSchema: allergenCheckSchema
    }, async ({ nameOrBarcode, allergen }) => {
        try {
            const product = await findProduct(nameOrBarcode);
            if (!product) {
                return { content: [{ type: 'text' as const, text: `Product "${nameOrBarcode}" not found.` }], isError: true };
            }
            const result = checkAllergen(product, allergen);

            let message = result.allergenFound
                ? `WARNING: ${result.allergenChecked.toUpperCase()} found in this product!`
                : `${result.allergenChecked.toUpperCase()} not detected in this product.`;

            if (result.traces.length > 0) {
                message += `\n\nNote: May contain traces of: ${result.traces.join(', ')}`;
            }

            return {
                content: [{
                    type: 'text' as const,
                    text: `${message}\n\n${JSON.stringify(result, null, 2)}`
                }]
            };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('checkMultipleAllergens', {
        description: 'Check if a product contains any of multiple allergens at once',
        inputSchema: multiAllergenSchema
    }, async ({ nameOrBarcode, allergens }) => {
        try {
            const product = await findProduct(nameOrBarcode);
            if (!product) {
                return { content: [{ type: 'text' as const, text: `Product "${nameOrBarcode}" not found.` }], isError: true };
            }
            const result = checkMultipleAllergens(product, allergens);

            let message = result.safeToConsume
                ? `Product appears safe - none of the checked allergens were found.`
                : `WARNING: Some allergens were detected!`;

            result.checkResults.forEach(r => {
                const status = r.found ? 'FOUND' : (r.inTraces ? 'TRACES' : 'NOT FOUND');
                message += `\n  • ${r.allergen}: ${status}`;
            });

            return {
                content: [{
                    type: 'text' as const,
                    text: `${message}\n\n${JSON.stringify(result, null, 2)}`
                }]
            };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    logger.info("Nutrition tools registered: getNutriScore, getEcoScore, getAdditivesInfo, getAllergenCheck, checkMultipleAllergens");
}
