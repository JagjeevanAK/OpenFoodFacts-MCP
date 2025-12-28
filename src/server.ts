import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import express from 'express';
import { setupStdioTransport, setupHttpTransport, logger } from './transport/transports.js';
import { serverConfig } from './config/server-config.js';
import { handleStaticResource } from './resources/static-resources.js';
import { handleTaxonomy } from './resources/taxonomy.js';
import { registerTools } from './tools/index.js';

/**
 * Start the MCP server with configured transports for food-aware consumers
 * The server can use either stdio (for VS Code extension) or HTTP (for browser clients)
 */
export async function startServer() {
  // Initialize the MCP server with our config using McpServer
  const server = new McpServer(serverConfig, {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  });

  // Register food-related MCP tools using new registerTool API
  registerTools(server);

  // Register static resources using new registerResource API
  server.registerResource(
    'info',
    'openfoodfacts://info',
    {
      title: 'Project Information',
      description: 'Overview of the Open Food Facts project',
      mimeType: 'application/json'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'schema',
    'openfoodfacts://schema',
    {
      title: 'Database Schema',
      description: 'Information about the Open Food Facts data model',
      mimeType: 'text/plain'
    },
    async (uri) => handleStaticResource(uri.href)
  );



  server.registerResource(
    'categories-taxonomy',
    'openfoodfacts://taxonomy/categories',
    {
      title: 'Categories Taxonomy',
      description: 'Food categories taxonomy used in Open Food Facts',
      mimeType: 'text/plain'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  // Register dynamic taxonomy resources
  server.registerResource(
    'taxonomy',
    new ResourceTemplate('openfoodfacts://taxonomy/{type}', { list: undefined }),
    {
      title: 'Taxonomy Data',
      description: 'Access various Open Food Facts taxonomies (allergens, additives, ingredients, etc.)',
      mimeType: 'application/json'
    },
    async (uri, { type }) => {
      // Skip categories as it's handled above
      if (type === 'categories') {
        return handleStaticResource(uri.href);
      }
      return await handleTaxonomy(uri.href, uri);
    }
  );

  // Register prompts using new registerPrompt API
  server.registerPrompt(
    'analyze-product',
    {
      title: 'Analyze Product',
      description: 'Analyze a food product based on its barcode',
      argsSchema: {
        barcode: z.string().describe('The product barcode (EAN, UPC, etc.)')
      }
    },
    ({ barcode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please analyze the food product with barcode ${barcode}. Use the getProductByBarcode tool to fetch product details, then provide a comprehensive nutritional analysis including health implications, ingredient quality, and dietary considerations.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'compare-products',
    {
      title: 'Compare Products',
      description: 'Compare nutrition information between two products',
      argsSchema: {
        barcode1: z.string().describe('First product barcode'),
        barcode2: z.string().describe('Second product barcode')
      }
    },
    ({ barcode1, barcode2 }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please compare the two food products with barcodes ${barcode1} and ${barcode2}. Use the getProductByBarcode tool for each product, then provide a detailed comparison of their nutritional values, ingredients, health scores, and help me understand which is the better choice for different dietary needs.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'check-additives',
    {
      title: 'Check Additives',
      description: 'Check if a product contains questionable additives',
      argsSchema: {
        barcode: z.string().describe('The product barcode (EAN, UPC, etc.)')
      }
    },
    ({ barcode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please check the food product with barcode ${barcode} for any questionable additives or ingredients. Use the getProductByBarcode tool to fetch the product details, then analyze the additives list and highlight any ingredients that may be concerning from a health perspective.`
          }
        }
      ]
    })
  );



  if (process.env.TRANSPORT === 'stdio') {
    await setupStdioTransport(server);
  } else {
    const app = express();
    await setupHttpTransport(server, app);
  }

  return server;
}