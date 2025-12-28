import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
    searchByCategory,
    searchByBrand,
    advancedSearch,
    getAutocomplete
} from './helpers.js';
import { logger } from '../transport/transports.js';

const categorySchema = {
    category: z.string().describe('Food category (e.g., "beverages", "snacks", "dairy", "organic")'),
    page: z.number().default(1),
    pageSize: z.number().default(10)
};

const brandSchema = {
    brand: z.string().describe('Brand name to search for'),
    page: z.number().default(1),
    pageSize: z.number().default(10)
};

const advancedSearchSchema = {
    query: z.string().optional().describe('Search query (product name, ingredients, etc.)'),
    category: z.string().optional().describe('Filter by category'),
    brand: z.string().optional().describe('Filter by brand'),
    nutriscoreGrade: z.enum(['a', 'b', 'c', 'd', 'e']).optional().describe('Filter by Nutri-Score grade'),
    ecoscoreGrade: z.enum(['a', 'b', 'c', 'd', 'e']).optional().describe('Filter by Eco-Score grade'),
    novaGroup: z.enum(['1', '2', '3', '4']).optional().describe('Filter by NOVA group (food processing level)'),
    allergenFree: z.string().optional().describe('Filter by allergen-free (e.g., "gluten", "milk", "eggs")'),
    labels: z.string().optional().describe('Filter by labels (e.g., "organic", "fair-trade", "vegan")'),
    countries: z.string().optional().describe('Filter by country (e.g., "united-states", "france")'),
    sortBy: z.enum(['popularity', 'nutriscore_score', 'ecoscore_score', 'created_t', 'last_modified_t']).optional(),
    page: z.number().default(1),
    pageSize: z.number().default(10)
};

const autocompleteSchema = {
    query: z.string().describe('Autocomplete query'),
    taxonomyType: z.enum(['categories', 'brands', 'labels', 'countries', 'ingredients', 'allergens', 'additives'])
        .describe('Type of taxonomy to search'),
    lang: z.string().default('en').describe('Language code'),
    limit: z.number().default(10).describe('Maximum number of suggestions')
};

export function registerCategoryTools(server: McpServer): void {
    server.registerTool('searchByCategory', {
        description: 'Search products within a specific food category (e.g., beverages, snacks, dairy, cereals)',
        inputSchema: categorySchema
    }, async ({ category, page, pageSize }) => {
        try {
            const results = await searchByCategory(category, page ?? 1, pageSize ?? 10);
            return { content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('searchByBrand', {
        description: 'Find all products from a specific brand',
        inputSchema: brandSchema
    }, async ({ brand, page, pageSize }) => {
        try {
            const results = await searchByBrand(brand, page ?? 1, pageSize ?? 10);
            return { content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('advancedSearch', {
        description: 'Advanced product search with multiple filters: category, brand, nutri-score, eco-score, NOVA group, allergen-free, labels, country',
        inputSchema: advancedSearchSchema
    }, async (params) => {
        try {
            const results = await advancedSearch({
                query: params.query,
                category: params.category,
                brand: params.brand,
                nutriscoreGrade: params.nutriscoreGrade,
                ecoscoreGrade: params.ecoscoreGrade,
                novaGroup: params.novaGroup,
                allergenFree: params.allergenFree,
                labels: params.labels,
                countries: params.countries,
                sortBy: params.sortBy,
                page: params.page ?? 1,
                pageSize: params.pageSize ?? 10
            });
            return { content: [{ type: 'text' as const, text: JSON.stringify(results, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('autocomplete', {
        description: 'Get autocomplete suggestions for categories, brands, labels, ingredients, allergens, or additives',
        inputSchema: autocompleteSchema
    }, async ({ query, taxonomyType, lang, limit }) => {
        try {
            const suggestions = await getAutocomplete(query, taxonomyType, lang ?? 'en', limit ?? 10);
            return { content: [{ type: 'text' as const, text: JSON.stringify(suggestions, null, 2) }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    logger.info("Category tools registered: searchByCategory, searchByBrand, advancedSearch, autocomplete");
}
