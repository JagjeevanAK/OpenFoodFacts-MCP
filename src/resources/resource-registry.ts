/**
 * Resource registry for consumer-friendly MCP resources
 */

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
 * List of available consumer-friendly resources
 */
export const availableResources: ResourceDescriptor[] = [
  {
    uri: "openfoodfacts://help",
    name: "Quick Help Guide",
    description: "How to use the Open Food Facts tools - quick reference",
    mimeType: "text/markdown"
  },
  {
    uri: "openfoodfacts://nutriscore-guide",
    name: "Nutri-Score Guide",
    description: "Understanding Nutri-Score health ratings (A-E)",
    mimeType: "text/markdown"
  },
  {
    uri: "openfoodfacts://ecoscore-guide",
    name: "Eco-Score Guide",
    description: "Understanding Eco-Score environmental ratings (A-E)",
    mimeType: "text/markdown"
  },
  {
    uri: "openfoodfacts://allergens-list",
    name: "Allergens Reference",
    description: "Common food allergens and where they hide",
    mimeType: "text/markdown"
  },
  {
    uri: "openfoodfacts://additives-guide",
    name: "Food Additives Guide",
    description: "Understanding E-numbers and food additives",
    mimeType: "text/markdown"
  },
  {
    uri: "openfoodfacts://nova-guide",
    name: "NOVA Processing Guide",
    description: "Understanding food processing levels (1-4)",
    mimeType: "text/markdown"
  }
];

/**
 * Route a resource request to the appropriate handler
 */
export async function routeResourceRequest(uri: string) {
  try {
    return handleStaticResource(uri);
  } catch (error) {
    return {
      contents: [{
        uri,
        text: `Resource not found: ${uri}\n\nAvailable resources:\n${availableResources.map(r => `- ${r.uri}: ${r.description}`).join('\n')}`,
        isError: true
      }]
    };
  }
}