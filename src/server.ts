import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { ListResourcesRequestSchema, ReadResourceRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import express from 'express';
import { setupStdioTransport, setupHttpTransport, logger } from './transport/transports.js';
import { serverConfig } from './config/server-config.js';
import { availableResources, routeResourceRequest } from './resources/resource-registry.js';
import { registerTools } from './tools/index.js';
import { availablePrompts, getPromptMessages } from './prompts/index.js';
import { setupRoots } from './roots/index.js';

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
      prompts: {},
      sampling: {},
      roots: {}
    }
  });

  // Setup roots handling
  setupRoots(server);

  // Register food-related MCP tools
  registerTools(server);

  // Set up resource listing handler
  server.server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: availableResources
    };
  });

  // Set up resource reading handler
  server.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    return await routeResourceRequest(uri);
  });

  // Set up prompts listing handler
  server.server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: availablePrompts
    };
  });

  // Set up prompt retrieval handler
  server.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const promptName = request.params.name;
    const args = request.params.arguments;
    
    try {
      const messages = await getPromptMessages(promptName, args);
      return {
        messages
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get prompt: ${errorMessage}`);
    }
  });

  // Check if we should use stdio or HTTP transport
  // Stdio is used for VS Code extension
  if (process.env.TRANSPORT === 'stdio') {
    await setupStdioTransport(server);
  } else {
    // HTTP is default, used for browser clients
    const app = express();
    await setupHttpTransport(server, app);
  }

  return server;
}