import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { PRICES_URL, PriceResult, PricesSearchResult } from './types.js';
import { logger } from '../transport/transports.js';

// Schema definitions
const productPricesSchema = {
    barcode: z.string().describe('Product barcode to get prices for'),
    page: z.number().default(1),
    pageSize: z.number().default(20)
};

const locationPricesSchema = {
    locationOsmId: z.number().optional().describe('OpenStreetMap location ID'),
    locationOsmType: z.enum(['NODE', 'WAY', 'RELATION']).optional().describe('OpenStreetMap location type'),
    currency: z.string().optional().describe('Filter by currency (e.g., "EUR", "USD")'),
    page: z.number().default(1),
    pageSize: z.number().default(20)
};

const priceSearchSchema = {
    barcode: z.string().optional().describe('Filter by product barcode'),
    currency: z.string().optional().describe('Filter by currency'),
    country: z.string().optional().describe('Filter by country'),
    orderBy: z.string().optional().describe('Order by field (e.g., "-date" for newest first)'),
    page: z.number().default(1),
    pageSize: z.number().default(20)
};

/**
 * Get prices for a specific product
 */
async function getProductPrices(barcode: string, page: number, pageSize: number): Promise<PricesSearchResult> {
    const url = new URL(`${PRICES_URL}/prices`);
    url.searchParams.set('product_code', barcode);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('size', pageSize.toString());
    url.searchParams.set('order_by', '-date');

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to get prices: ${response.status}`);
    }

    const data = await response.json();

    const prices = (data.items || []).map((p: any): PriceResult => ({
        productCode: p.product_code,
        price: p.price,
        currency: p.currency,
        locationName: p.location?.osm_display_name || 'Unknown location',
        locationId: p.location_id,
        date: p.date,
        proofId: p.proof_id
    }));

    return {
        prices,
        count: data.total || prices.length,
        page,
        pageSize
    };
}

/**
 * Search for prices with filters
 */
async function searchPrices(params: {
    barcode?: string;
    currency?: string;
    country?: string;
    orderBy?: string;
    page: number;
    pageSize: number;
}): Promise<PricesSearchResult> {
    const url = new URL(`${PRICES_URL}/prices`);

    if (params.barcode) url.searchParams.set('product_code', params.barcode);
    if (params.currency) url.searchParams.set('currency', params.currency);
    if (params.orderBy) url.searchParams.set('order_by', params.orderBy);
    url.searchParams.set('page', params.page.toString());
    url.searchParams.set('size', params.pageSize.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to search prices: ${response.status}`);
    }

    const data = await response.json();

    const prices = (data.items || []).map((p: any): PriceResult => ({
        productCode: p.product_code,
        price: p.price,
        currency: p.currency,
        locationName: p.location?.osm_display_name || 'Unknown location',
        locationId: p.location_id,
        date: p.date,
        proofId: p.proof_id
    }));

    return {
        prices,
        count: data.total || prices.length,
        page: params.page,
        pageSize: params.pageSize
    };
}

/**
 * Get recent prices (for discovering what's available)
 */
async function getRecentPrices(page: number, pageSize: number): Promise<PricesSearchResult> {
    const url = new URL(`${PRICES_URL}/prices`);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('size', pageSize.toString());
    url.searchParams.set('order_by', '-date');

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to get recent prices: ${response.status}`);
    }

    const data = await response.json();

    const prices = (data.items || []).map((p: any): PriceResult => ({
        productCode: p.product_code,
        price: p.price,
        currency: p.currency,
        locationName: p.location?.osm_display_name || 'Unknown location',
        locationId: p.location_id,
        date: p.date,
        proofId: p.proof_id
    }));

    return {
        prices,
        count: data.total || prices.length,
        page,
        pageSize
    };
}

export function registerPriceTools(server: McpServer): void {
    server.registerTool('getProductPrices', {
        description: 'Get crowd-sourced price data for a specific product - see where it costs less',
        inputSchema: productPricesSchema
    }, async ({ barcode, page, pageSize }) => {
        try {
            const result = await getProductPrices(barcode, page ?? 1, pageSize ?? 20);

            if (result.prices.length === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: `No price data available for product ${barcode}. Price data is crowd-sourced and may not be available for all products.`
                    }]
                };
            }

            let message = `Found ${result.count} price records for product ${barcode}:\n\n`;
            result.prices.forEach((p, i) => {
                message += `${i + 1}. ${p.price} ${p.currency} at ${p.locationName}\n`;
                message += `   Date: ${p.date}\n\n`;
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

    server.registerTool('searchPrices', {
        description: 'Search for crowd-sourced price data with filters (barcode, currency, etc.)',
        inputSchema: priceSearchSchema
    }, async ({ barcode, currency, country, orderBy, page, pageSize }) => {
        try {
            const result = await searchPrices({
                barcode,
                currency,
                country,
                orderBy: orderBy ?? '-date',
                page: page ?? 1,
                pageSize: pageSize ?? 20
            });

            if (result.prices.length === 0) {
                return {
                    content: [{
                        type: 'text' as const,
                        text: 'No price data found matching your criteria.'
                    }]
                };
            }

            let message = `Found ${result.count} price records:\n\n`;
            result.prices.forEach((p, i) => {
                message += `${i + 1}. [${p.productCode}] ${p.price} ${p.currency}\n`;
                message += `   Location: ${p.locationName}\n`;
                message += `   Date: ${p.date}\n\n`;
            });

            return { content: [{ type: 'text' as const, text: message }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    server.registerTool('getRecentPrices', {
        description: 'Get the most recently added price data from the community',
        inputSchema: { page: z.number().default(1), pageSize: z.number().default(20) }
    }, async ({ page, pageSize }) => {
        try {
            const result = await getRecentPrices(page ?? 1, pageSize ?? 20);

            let message = `Recent price contributions (${result.count} total):\n\n`;
            result.prices.forEach((p, i) => {
                message += `${i + 1}. [${p.productCode}] ${p.price} ${p.currency}\n`;
                message += `   Location: ${p.locationName}\n`;
                message += `   Date: ${p.date}\n\n`;
            });

            return { content: [{ type: 'text' as const, text: message }] };
        } catch (error: any) {
            return { content: [{ type: 'text' as const, text: `Error: ${error.message}` }], isError: true };
        }
    });

    logger.info("Price tools registered: getProductPrices, searchPrices, getRecentPrices");
}
