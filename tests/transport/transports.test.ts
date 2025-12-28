import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupStdioTransport, setupHttpTransport, logger } from '../../src/transport/transports';

// Mock dependencies
vi.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: vi.fn().mockImplementation(() => ({}))
}));

vi.mock('@modelcontextprotocol/sdk/server/streamableHttp.js', () => ({
  StreamableHTTPServerTransport: vi.fn().mockImplementation(() => ({
    close: vi.fn(),
    handleRequest: vi.fn().mockResolvedValue(undefined)
  }))
}));

describe('Transport Setup', () => {
  describe('logger', () => {
    it('should have log, info, warn, error methods', () => {
      expect(logger).toHaveProperty('log');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
    });
  });

  describe('setupStdioTransport', () => {
    it('should connect server with stdio transport', async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined)
      };

      await setupStdioTransport(mockServer as any);

      expect(mockServer.connect).toHaveBeenCalled();
    });
  });

  describe('setupHttpTransport', () => {
    it('should set up express app with MCP endpoint', async () => {
      const mockServer = {
        connect: vi.fn().mockResolvedValue(undefined)
      };

      const mockApp = {
        use: vi.fn(),
        post: vi.fn(),
        get: vi.fn(),
        listen: vi.fn((port, callback) => { callback?.(); return { close: vi.fn() }; })
      };

      await setupHttpTransport(mockServer as any, mockApp as any);

      expect(mockApp.use).toHaveBeenCalled(); // express.json()
      expect(mockApp.post).toHaveBeenCalledWith('/mcp', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/', expect.any(Function));
      expect(mockApp.get).toHaveBeenCalledWith('/health', expect.any(Function));
      expect(mockApp.listen).toHaveBeenCalled();
    });

    it('should return UP status on health check', async () => {
      const mockServer = { connect: vi.fn().mockResolvedValue(undefined) };
      let healthHandler: any;

      const mockApp = {
        use: vi.fn(),
        post: vi.fn(),
        get: vi.fn((path, handler) => { if (path === '/health') healthHandler = handler; }),
        listen: vi.fn((port, cb) => { cb?.(); return { close: vi.fn() }; })
      };

      await setupHttpTransport(mockServer as any, mockApp as any);

      const mockRes = { json: vi.fn() };
      healthHandler({}, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({ status: 'UP', version: '1.0.0' });
    });
  });
});