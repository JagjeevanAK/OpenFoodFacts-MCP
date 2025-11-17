#!/usr/bin/env node

import { startServer } from './server.js';
import { logger } from './transport/transports.js';

const args = process.argv.slice(2);
const options: Record<string, any> = {};

for (const arg of args) {
  if (arg.startsWith('--')) {
    const [key, value] = arg.substring(2).split('=');
    options[key] = value === undefined ? true : value;
  }
}

if (options.transport) {
  process.env.TRANSPORT = options.transport;
}

if (options.port) {
  process.env.PORT = options.port;
}

const developerMode = !!options.developer;
if (developerMode) {
  process.env.DEVELOPER_MODE = 'true'; 
}

logger.info('Starting Open Food Facts MCP server...');
if (options.transport) {
  logger.info(`Transport mode: ${options.transport}`);
}

logger.info('Enabled capabilities:');
logger.info('- Resources: Food product data access');
logger.info('- Tools: Food product search and information');
logger.info('- Prompts: Food product analysis templates');
logger.info('- Sampling: AI-powered food product analysis');
logger.info('- Roots: Resource boundary management');

startServer().catch((error: Error) => {
  logger.error('Failed to start MCP server:', error);
  process.exit(1);
});