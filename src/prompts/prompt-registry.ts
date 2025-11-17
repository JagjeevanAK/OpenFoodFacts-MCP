import { Prompt } from "@modelcontextprotocol/sdk/types.js";

export const PROMPTS: Record<string, Prompt> = {
  "analyze-product": {
    name: "analyze-product",
    description: "Analyze a food product based on its barcode",
    arguments: [
      {
        name: "barcode",
        description: "The product barcode (EAN, UPC, etc.)",
        required: true
      }
    ]
  },
  "compare-products": {
    name: "compare-products",
    description: "Compare nutrition information between two products",
    arguments: [
      {
        name: "barcode1",
        description: "First product barcode",
        required: true
      },
      {
        name: "barcode2",
        description: "Second product barcode",
        required: true
      }
    ]
  },
  "check-additives": {
    name: "check-additives",
    description: "Check if a product contains questionable additives",
    arguments: [
      {
        name: "barcode",
        description: "The product barcode (EAN, UPC, etc.)",
        required: true
      }
    ]
  },
  "api-usage-example": {
    name: "api-usage-example",
    description: "Get example code for using the Open Food Facts API",
    arguments: [
      {
        name: "endpoint",
        description: "The API endpoint you want to use (e.g., /product, /search)",
        required: true
      },
      {
        name: "language",
        description: "Programming language for the example (e.g., JavaScript, Python)",
        required: true
      }
    ]
  }
};

export const availablePrompts = Object.values(PROMPTS);

export async function getPromptMessages(promptName: string, args: Record<string, string> | undefined) {
  const prompt = PROMPTS[promptName];
  
  if (!prompt) {
    throw new Error(`Prompt not found: ${promptName}`);
  }

  // Validate required arguments
  const requiredArgs = prompt.arguments?.filter(arg => arg.required) || [];
  for (const arg of requiredArgs) {
    if (!args || !args[arg.name]) {
      throw new Error(`Missing required argument: ${arg.name}`);
    }
  }

  // Generate prompt messages based on the prompt type
  const messages: Array<{ role: "user" | "assistant"; content: { type: "text"; text: string } }> = [];

  switch (promptName) {
    case "analyze-product":
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Please analyze the food product with barcode ${args?.barcode}. Use the getProductByBarcode tool to fetch product details, then provide a comprehensive nutritional analysis including health implications, ingredient quality, and dietary considerations.`
        }
      });
      break;

    case "compare-products":
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Please compare the two food products with barcodes ${args?.barcode1} and ${args?.barcode2}. Use the getProductByBarcode tool for each product, then provide a detailed comparison of their nutritional values, ingredients, health scores, and help me understand which is the better choice for different dietary needs.`
        }
      });
      break;

    case "check-additives":
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Please check the food product with barcode ${args?.barcode} for any questionable additives or ingredients. Use the getProductByBarcode tool to fetch the product details, then analyze the additives list and highlight any ingredients that may be concerning from a health perspective.`
        }
      });
      break;

    case "api-usage-example":
      messages.push({
        role: "user",
        content: {
          type: "text",
          text: `Please provide a code example for using the Open Food Facts API endpoint "${args?.endpoint}" in ${args?.language}. Include proper error handling, authentication if needed, and explain how to parse the response.`
        }
      });
      break;

    default:
      throw new Error(`Unknown prompt: ${promptName}`);
  }

  return messages;
}
