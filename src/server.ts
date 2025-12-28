import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import express from 'express';
import { setupStdioTransport, setupHttpTransport, logger } from './transport/transports.js';
import { serverConfig } from './config/server-config.js';
import { handleStaticResource } from './resources/static-resources.js';
import { registerTools } from './tools/index.js';

/**
 * Start the MCP server with configured transports for food-aware consumers
 * The server can use either stdio (for VS Code extension) or HTTP (for browser clients)
 */
export async function startServer() {
  const server = new McpServer(serverConfig, {
    capabilities: {
      resources: {},
      tools: {},
      prompts: {}
    }
  });

  registerTools(server);

  server.registerResource(
    'help',
    'openfoodfacts://help',
    {
      title: 'Quick Help Guide',
      description: 'How to use the Open Food Facts tools - quick reference',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'nutriscore-guide',
    'openfoodfacts://nutriscore-guide',
    {
      title: 'Nutri-Score Guide',
      description: 'Understanding Nutri-Score health ratings (A-E)',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'ecoscore-guide',
    'openfoodfacts://ecoscore-guide',
    {
      title: 'Eco-Score Guide',
      description: 'Understanding Eco-Score environmental ratings (A-E)',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'allergens-list',
    'openfoodfacts://allergens-list',
    {
      title: 'Allergens Reference',
      description: 'Common food allergens and where they hide',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'additives-guide',
    'openfoodfacts://additives-guide',
    {
      title: 'Food Additives Guide',
      description: 'Understanding E-numbers and food additives',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerResource(
    'nova-guide',
    'openfoodfacts://nova-guide',
    {
      title: 'NOVA Processing Guide',
      description: 'Understanding food processing levels (1-4)',
      mimeType: 'text/markdown'
    },
    async (uri) => handleStaticResource(uri.href)
  );

  server.registerPrompt(
    'analyze-product',
    {
      title: 'Analyze Product',
      description: 'Get a detailed health analysis of any food product',
      argsSchema: {
        barcode: z.string().describe('Product barcode or name')
      }
    },
    ({ barcode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Analyze the food product "${barcode}". Provide a comprehensive nutritional analysis including health implications, ingredient quality, allergens, and dietary considerations.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'compare-products',
    {
      title: 'Compare Products',
      description: 'Compare two products to find the healthier option',
      argsSchema: {
        product1: z.string().describe('First product (barcode or name)'),
        product2: z.string().describe('Second product (barcode or name)')
      }
    },
    ({ product1, product2 }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Compare "${product1}" and "${product2}". Tell me which is healthier and why, comparing nutritional values, ingredients, and health scores.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'find-healthy-alternatives',
    {
      title: 'Find Healthy Alternatives',
      description: 'Find healthier alternatives to a product',
      argsSchema: {
        product: z.string().describe('Product to find alternatives for')
      }
    },
    ({ product }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `I want healthier alternatives to "${product}". Search for similar products with better Nutri-Score ratings and fewer additives.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'check-allergens',
    {
      title: 'Check Allergens',
      description: 'Check if a product is safe for your allergies',
      argsSchema: {
        product: z.string().describe('Product barcode or name'),
        allergens: z.string().describe('Your allergens (comma-separated)')
      }
    },
    ({ product, allergens }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Check if "${product}" is safe for someone allergic to: ${allergens}. Include any traces warnings.`
          }
        }
      ]
    })
  );

  server.registerPrompt(
    'whats-for-dinner',
    {
      title: "What's for Dinner?",
      description: 'Get recipe ideas using a product',
      argsSchema: {
        product: z.string().describe('Main ingredient or product')
      }
    },
    ({ product }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Suggest healthy recipe ideas using "${product}" as a main ingredient. Include nutritional tips.`
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