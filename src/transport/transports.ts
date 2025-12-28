import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { PORT } from "../config/server-config.js";
import fs from 'fs';
import path from 'path';

// Create a logger that won't interfere with stdio transport
export const logger = {
  _stdioMode: process.env.TRANSPORT === 'stdio',
  _logFile: process.env.LOG_FILE || './mcp-server.log',
  
  _writeToFile(message: string) {
    try {
      fs.appendFileSync(this._logFile, `${new Date().toISOString()} - ${message}\n`);
    } catch (err) {
      process.stderr.write(`${message}\n`);
    }
  },

  log: (message: string) => {
    if (logger._stdioMode) {
      logger._writeToFile(`[LOG] ${message}`);
    } else {
      console.log(message);
    }
  },
  
  info: (message: string) => {
    if (logger._stdioMode) {
      logger._writeToFile(`[INFO] ${message}`);
    } else {
      console.log(message);
    }
  },
  
  warn: (message: string) => {
    if (logger._stdioMode) {
      logger._writeToFile(`[WARN] ${message}`);
    } else {
      console.warn(message);
    }
  },
  
  error: (message: string, error?: unknown) => {
    let errorMsg = message;
    if (error instanceof Error) {
      errorMsg += ` ${error.stack || error.message}`;
    } else if (error !== undefined) {
      errorMsg += ` ${String(error)}`;
    }
    
    if (logger._stdioMode) {
      logger._writeToFile(`[ERROR] ${errorMsg}`);
    } else {
      console.error(errorMsg);
    }
  }
};

/**
 * Setup stdio transport for command line usage
 * @param server MCP server instance
 */
export function setupStdioTransport(server: McpServer): Promise<void> {
  const transport = new StdioServerTransport();
  
  return server.connect(transport).then(() => {
    logger.info("Open Food Facts MCP Server started with stdio transport");
  }).catch(error => {
    logger.error("Error starting MCP server with stdio transport:", error);
    process.exit(1);
  });
}

/**
 * Setup HTTP transport using StreamableHTTP for web-based clients
 * @param server MCP server instance
 * @param app Express application
 */
export function setupHttpTransport(server: McpServer, app: express.Application): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      app.use(express.json());

      // StreamableHTTP endpoint (modern MCP transport)
      app.post("/mcp", async (req, res) => {
        try {
          // Create a new transport for each request to prevent request ID collisions
          const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: undefined,
            enableJsonResponse: true
          });

          res.on('close', () => {
            transport.close();
          });

          await server.connect(transport);
          await transport.handleRequest(req, res, req.body);
        } catch (error) {
          logger.error('Error handling MCP request:', error);
          if (!res.headersSent) {
            res.status(500).json({
              jsonrpc: '2.0',
              error: {
                code: -32603,
                message: 'Internal server error'
              },
              id: null
            });
          }
        }
      });

      app.get('/', (_, res) => {
        res.send('Open Food Facts MCP Server is running');
      });

      app.get('/health', (_, res) => {
        res.json({ status: 'UP', version: '1.0.0' });
      });

      app.listen(PORT, () => {
        logger.info(`Open Food Facts MCP Server running on HTTP port ${PORT}`);
        logger.info(`Use StreamableHTTP endpoint at http://localhost:${PORT}/mcp`);
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}