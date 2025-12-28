import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock McpServer with correct method names from src/server.ts
const mockServer = {
  registerResource: vi.fn(),
  registerTool: vi.fn(),
  registerPrompt: vi.fn(),
  connect: vi.fn().mockResolvedValue(undefined),
  server: { request: vi.fn() }
};

vi.mock('@modelcontextprotocol/sdk/server/mcp.js', () => ({
  McpServer: vi.fn().mockImplementation(() => mockServer)
}));

vi.mock('../src/transport/transports.js', () => ({
  setupStdioTransport: vi.fn().mockResolvedValue(undefined),
  setupHttpTransport: vi.fn().mockResolvedValue(undefined),
  logger: { log: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() }
}));

vi.mock('../src/tools/index.js', () => ({
  registerTools: vi.fn()
}));

vi.mock('../src/resources/static-resources.js', () => ({
  handleStaticResource: vi.fn().mockReturnValue({ contents: [] })
}));

vi.mock('express', () => ({
  default: vi.fn(() => ({ use: vi.fn(), get: vi.fn(), post: vi.fn(), listen: vi.fn() }))
}));

// Import after mocks
import { startServer } from '../src/server';
import { setupStdioTransport, setupHttpTransport } from '../src/transport/transports.js';

describe('Server', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
    delete process.env.TRANSPORT;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should create and return server', async () => {
    const server = await startServer();
    expect(server).toBeDefined();
  });

  it('should register resources', async () => {
    await startServer();
    expect(mockServer.registerResource).toHaveBeenCalled();
  });

  it('should register prompts', async () => {
    await startServer();
    expect(mockServer.registerPrompt).toHaveBeenCalled();
  });

  it('should use stdio transport when TRANSPORT=stdio', async () => {
    process.env.TRANSPORT = 'stdio';
    await startServer();
    expect(setupStdioTransport).toHaveBeenCalled();
  });

  it('should use HTTP transport by default', async () => {
    await startServer();
    expect(setupHttpTransport).toHaveBeenCalled();
  });
});