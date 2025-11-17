import path from "path";

export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 28375;

export const projectRoot = path.resolve(process.cwd(), "..");

export const serverConfig = {
  name: "OpenFoodFacts-MCP",
  version: "1.0.1",
  description: "MCP server for Open Food Facts project"
};