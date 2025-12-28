# Open Food Facts MCP Server

This is a Model Context Protocol (MCP) server implementation for Open Food Facts. It enables AI assistants to access food product information, providing nutritional analysis, product comparisons, and recipe suggestions using the official [Model Context Protocol](https://modelcontextprotocol.io/) specification.

### Benefits for Food-Aware Consumers

This MCP server enables:

1. **Nutritional Intelligence**: Get AI-powered analysis of food products and their health implications
2. **Informed Choices**: Compare products to make better dietary decisions
3. **Recipe Ideas**: Discover recipes based on products you have
4. **Dietary Support**: Understand allergens, additives, and dietary compatibility

## Available Tools

### Core Product Tools

- **searchProducts**: Search for products in the Open Food Facts database by name, brand, category, or other keywords
- **getProductByBarcode**: Get detailed information about a product by its barcode (EAN, UPC, etc.)
- **analyzeProduct**: Get AI-powered nutritional analysis of a food product
- **compareProducts**: Compare two products with AI-powered insights
- **suggestRecipes**: Get AI-powered recipe suggestions using a product

### Category & Search Tools

- **searchByCategory**: Search products within a specific food category (e.g., beverages, snacks, dairy, cereals)
- **searchByBrand**: Find all products from a specific brand
- **advancedSearch**: Advanced product search with multiple filters including category, brand, Nutri-Score, Eco-Score, NOVA group, allergen-free options, labels, and country
- **autocomplete**: Get autocomplete suggestions for categories, brands, labels, ingredients, allergens, or additives

### Nutrition & Health Tools

- **getNutriScore**: Get the Nutri-Score grade (A-E) for a product - quick health assessment at a glance
- **getEcoScore**: Get the Eco-Score (environmental impact rating A-E) for a product
- **getAdditivesInfo**: List all additives in a product with their E-numbers and NOVA processing level
- **getAllergenCheck**: Check if a product contains a specific allergen (gluten, milk, eggs, nuts, peanuts, soy, fish, shellfish, etc.)
- **checkMultipleAllergens**: Check if a product contains any of multiple allergens at once

### AI Insights Tools

- **getProductAIQuestions**: Get AI-generated questions about a product that need human verification
- **getRandomAIQuestions**: Get random AI-generated questions from Robotoff that need human verification - great for community contribution
- **getProductInsights**: Get AI-generated insights about products (detected labels, categories, ingredients issues, etc.)
- **getInsightTypes**: Get a summary of available AI insight types in Robotoff

### Price Tools

- **getProductPrices**: Get price history and current prices for a product from Open Prices
- **searchPrices**: Search for prices with filters (currency, country, date range)
- **getRecentPrices**: Get recently added prices to discover what's available

## Getting Started

### Prerequisites

- Node.js (v16.x or higher)
- npm or yarn

### Installation

1. Clone or download this repository

2. Install dependencies:

```bash
npm install
```

3. Build the server:

```bash
npm run build
```

4. Start the server:

```bash
npm start
```

## Using with AI Assistants

### Claude Desktop

1. Start the MCP server:
```bash
npm start
```

2. Add to your Claude Desktop configuration (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "openfoodfacts": {
      "command": "node",
      "args": ["/path/to/OpenFoodFacts-MCP/dist/index.js"],
      "env": {
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### VS Code with GitHub Copilot

1. Install the "Model Context Protocol" extension for VS Code

2. Create `.vscode/mcp.json`:

```json
{
  "servers": {
    "openfoodfacts": {
      "command": "node",
      "args": ["${workspaceFolder}/dist/cli.js"],
      "env": {
        "TRANSPORT": "stdio"
      }
    }
  }
}
```

### Other AI Tools

The server supports HTTP/SSE transport for browser-based AI tools:

```bash
TRANSPORT=http PORT=3000 npm start
```

Then connect your AI tool to `http://localhost:3000/sse`

## Example Conversations

Here are natural ways to ask your AI assistant to use the Open Food Facts tools:

### Searching for Products

- "Search for chocolate cereals in the Open Food Facts database"
- "Find products that contain almond milk"
- "Look for organic yogurt products"

### Getting Product Details

- "Get information about the product with barcode 3017620422003"
- "What's in the product with EAN 5000159407236?"
- "Show me nutritional data for barcode 8076809513326"

### Analyzing Products

- "Can you analyze Nutella nutritionally?"
- "Analyze Cheerios cereal and tell me if it's healthy"
- "Give me a health analysis of Oreo cookies"
- "Is the product with barcode 3017620422003 healthy?"

### Comparing Products

- "Compare Nutella and Nocciolata"
- "Which is healthier: Coke or Pepsi?"
- "Compare almond milk and soy milk nutritionally"
- "Compare the products with barcodes 3017620422003 and 5000159407236"

### Recipe Suggestions

- "What can I make with Greek yogurt?"
- "Suggest some recipes using chickpeas"
- "Give me recipe ideas for quinoa"
- "What recipes can I make with the product 3017620422003?"

### Category & Brand Searches

- "Show me all products in the beverages category"
- "Find all Nestlé products"
- "Search for organic products with Nutri-Score A"
- "Find vegan snacks with good Eco-Score"

### Allergen Checks

- "Does Nutella contain gluten?"
- "Check if this product is safe for someone allergic to milk and eggs"
- "Is barcode 3017620422003 peanut-free?"
- "What allergens are in Cheerios?"

### Price Lookups

- "What's the current price of Nutella?"
- "Show me recent prices for products in France"
- "Compare prices for barcode 3017620422003"

## Resources and Prompts

The MCP server provides helpful resources and prompts:

### Resources

The server provides educational resources to help you understand food data:

- **Quick Help Guide**: How to use the Open Food Facts tools - quick reference
- **Nutri-Score Guide**: Understanding Nutri-Score health ratings (A-E)
- **Eco-Score Guide**: Understanding Eco-Score environmental ratings (A-E)
- **Allergens Reference**: Common food allergens and where they hide
- **Food Additives Guide**: Understanding E-numbers and food additives
- **NOVA Processing Guide**: Understanding food processing levels (1-4)

### Prompts

Pre-configured prompts help you get started quickly:

- **analyze-product**: Get detailed nutritional analysis
- **compare-products**: Compare two products side-by-side
- **find-healthy-alternatives**: Find healthier alternatives to a product
- **check-allergens**: Check if a product is safe for your allergies
- **whats-for-dinner**: Get recipe ideas using a product

## How It Works

The MCP server acts as a bridge between AI assistants and the Open Food Facts database:

1. **Your Question**: You ask your AI assistant about food products
2. **Tool Detection**: The AI recognizes it needs Open Food Facts data
3. **MCP Request**: The AI calls the appropriate MCP tool
4. **Data Retrieval**: The server fetches data from Open Food Facts
5. **AI Analysis**: The AI processes the data and responds to you

## Example Workflows

### Making Healthier Choices

```
You: "Is Nutella healthy?"

AI Assistant uses:
1. searchProducts to find Nutella
2. getProductByBarcode with the barcode
3. analyzeProduct for nutritional assessment

Response: Detailed analysis of Nutella's nutritional profile,
health scores, ingredients, and dietary considerations
```

### Comparing Options

```
You: "Which is better for me, Nutella or almond butter?"

AI Assistant uses:
1. searchProducts for both products
2. compareProducts with both barcodes

Response: Side-by-side comparison with recommendations
based on your dietary needs
```

### Recipe Planning

```
You: "What can I make with Greek yogurt?"

AI Assistant uses:
1. searchProducts to find Greek yogurt
2. suggestRecipes with the product

Response: Recipe suggestions that use Greek yogurt
as an ingredient
```

## Technical Details

### Server Architecture

The server follows a modular architecture for maintainability and scalability:

**Core Server**
- `src/index.ts`: Entry point
- `src/server.ts`: Core MCP server implementation with resource and prompt registration
- `src/cli.ts`: CLI interface for development

**Tools (Modular Design)**
- `src/tools/index.ts`: Tool registration orchestrator and core product tools
- `src/tools/product-search.ts`: Product search and barcode lookup utilities
- `src/tools/category-tools.ts`: Category and brand search tools
- `src/tools/nutrition-tools.ts`: Nutrition scores, allergen checks, and additive information
- `src/tools/insights-tools.ts`: AI-generated insights from Robotoff
- `src/tools/price-tools.ts`: Product pricing data from Open Prices
- `src/tools/types.ts`: Shared type definitions and interfaces
- `src/tools/helpers.ts`: Reusable helper functions for all tools

**Resources & Services**
- `src/resources/`: Resource handlers for guides and documentation
  - `resource-registry.ts`: Resource registration system
  - `static-resources.ts`: Static resource content (guides, references)
- `src/sampling/`: AI model integration for analysis and recipe generation
  - `sampling-service.ts`: MCP sampling integration for AI-powered features

**Infrastructure**
- `src/transport/`: Communication layer (stdio for CLI/editors, HTTP for browsers)
- `src/config/`: Server configuration

### Data Source

All product data comes from [Open Food Facts](https://world.openfoodfacts.org/), a free, open, collaborative database of food products from around the world.

## Troubleshooting

### Server Won't Start

- Ensure Node.js v16+ is installed
- Run `npm install` to install dependencies
- Check that port 3000 is available (for HTTP mode)

### AI Can't Find Tools

- Verify the MCP server is running
- Check your AI assistant's MCP configuration
- Ensure the transport type matches (stdio vs HTTP)

### Product Not Found

- Try searching first with `searchProducts`
- Verify the barcode is correct (8-14 digits)
- Some products may not be in the database yet

### Slow Responses

- The server fetches real-time data from Open Food Facts
- First requests may be slower as data is retrieved
- Internet connection speed affects performance

## Contributing

We welcome contributions! You can help by:

- Adding support for more food databases
- Improving AI analysis prompts
- Enhancing error handling
- Adding new tools for dietary tracking
- Improving documentation

## About Open Food Facts

Open Food Facts is a food products database made by everyone, for everyone. It's a collaborative project that collects information about food products from around the world, including:

- Ingredients
- Nutritional facts
- Allergens
- Environmental impact
- Health scores (Nutri-Score, NOVA)

Learn more at [https://world.openfoodfacts.org/](https://world.openfoodfacts.org/)

## License

This project is licensed under the GNU Affero General Public License v3.0, consistent with the Open Food Facts project.

## Support

- Open Food Facts Website: https://world.openfoodfacts.org/
- Open Food Facts GitHub: https://github.com/openfoodfacts
- Model Context Protocol: https://modelcontextprotocol.io/

---

**Made with care for food-aware consumers everywhere**

