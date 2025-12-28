import { handleTaxonomy } from "./taxonomy.js";
import { handleStaticResource } from "./static-resources.js";

/**
 * Resource descriptor interface
 */
export interface ResourceDescriptor {
  uri: string;
  name: string;
  description: string;
  mimeType?: string;
}

/**
 * List of available food-related resources in the MCP server
 */
export const availableResources: ResourceDescriptor[] = [
  {
    uri: "openfoodfacts://info",
    name: "Project Information",
    description: "Overview of the Open Food Facts project",
    mimeType: "application/json"
  },
  {
    uri: "openfoodfacts://schema",
    name: "Database Schema",
    description: "Information about the Open Food Facts data model"
  },
  {
    uri: "openfoodfacts://taxonomy/categories",
    name: "Categories Taxonomy",
    description: "Food categories taxonomy used in Open Food Facts"
  }
];

/**
 * Route a resource request to the appropriate handler
 * @param uri The resource URI
 * @returns Response for the requested resource
 */
export async function routeResourceRequest(uri: string) {
  const url = new URL(uri);

  try {
    if (uri === "openfoodfacts://info") {
      return handleStaticResource(uri);
    }
    if (url.protocol === "openfoodfacts:" && url.pathname.startsWith("//taxonomy/")) {
      if (uri === "openfoodfacts://taxonomy/categories") {
        return handleStaticResource(uri);
      }
      return await handleTaxonomy(uri, url);
    }
    if (uri === "openfoodfacts://schema") {
      return handleStaticResource(uri);
    }
    throw new Error(`Resource not found: ${uri}`);
  } catch (error) {
    return {
      contents: [{
        uri,
        text: `Error processing request: ${error instanceof Error ? error.message : String(error)}`,
        isError: true
      }]
    };
  }
}