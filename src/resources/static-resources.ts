/**
 * Handle requests for static text resources
 * @param uri Resource URI
 * @returns Response with appropriate static content
 */
export function handleStaticResource(uri: string) {
  // Project info resource
  if (uri === "openfoodfacts://info") {
    return {
      contents: [{
        uri,
        text: getProjectInfoText(),
        mimeType: "application/json"
      }]
    };
  }
  
  // Database schema resource
  if (uri === "openfoodfacts://schema") {
    return {
      contents: [{
        uri,
        text: getDatabaseSchemaText()
      }]
    };
  }
  
  // API documentation resource
  if (uri === "openfoodfacts://api-docs") {
    return {
      contents: [{
        uri,
        text: getApiDocumentationText()
      }]
    };
  }
  
  // Categories taxonomy resource - static implementation
  if (uri === "openfoodfacts://taxonomy/categories") {
    return {
      contents: [{
        uri,
        text: getCategoriesTaxonomyText(),
        metadata: {
          taxonomyId: "categories",
          contentType: "text/plain"
        }
      }]
    };
  }
  
  throw new Error(`Static resource not found: ${uri}`);
}

function getProjectInfoText(): string {
  return JSON.stringify({
    name: "Open Food Facts",
    description: "Open Food Facts is a food products database made by everyone, for everyone. You can use it to make better food choices.",
    website: "https://world.openfoodfacts.org",
    api: {
      base_url: "https://world.openfoodfacts.org/api/v3",
      documentation: "https://openfoodfacts.github.io/openfoodfacts-server/api/"
    },
    database: {
      products: "Over 2 million food products",
      contributors: "Tens of thousands of contributors worldwide",
      countries: "Available in 190+ countries"
    },
    features: [
      "Product search and barcode scanning",
      "Nutrition facts and Nutri-Score",
      "Ingredient analysis",
      "Allergen detection",
      "NOVA food processing classification",
      "Eco-Score environmental impact"
    ]
  }, null, 2);
}

/**
 * Get the database schema text
 */
function getDatabaseSchemaText(): string {
  return `
Open Food Facts Database Schema Overview:

1. Products Collection:
   - Primary collection with food product data
   - Contains fields like:
     * code (barcode, primary key)
     * product_name
     * brands
     * categories
     * ingredients_text
     * nutrition_facts (nested object)
     * images (references to image files)
     * packaging
     * origins

2. Taxonomies:
   - Hierarchical classifications for various product attributes:
     * categories taxonomy
     * ingredients taxonomy
     * additives taxonomy
     * labels taxonomy
     * countries taxonomy

3. User Collection:
   - User account information
   - Contribution statistics

4. Products History:
   - Change history and audit logs for products

5. Image storage:
   - Product images in various formats and sizes

The system uses MongoDB for the main database, and files are stored in the filesystem.
  `;
}

function getApiDocumentationText(): string {
  return `
# Open Food Facts API Documentation

## Core API Endpoints

1. Product Data:
   - GET /api/v2/product/{barcode} - Get product by barcode
   - GET /api/v2/search - Search products with parameters

2. Taxonomies:
   - GET /api/v2/taxonomies - List available taxonomies
   - GET /api/v2/taxonomy/{taxonomy_id} - Get taxonomy details

3. Product Images:
   - GET /images/products/{barcode}/{image_id}.{ext} - Get product image

4. Authentication:
   - POST /cgi/session.pl - Create a new session

## Data Formats

Products are returned in JSON format with various fields depending on the product completeness.

## Search Parameters

- brands: Filter by brand
- categories: Filter by category
- labels: Filter by label
- packaging: Filter by packaging
- origins: Filter by origin
- ingredients: Filter by ingredient
- nutrition_grades: Filter by Nutri-Score

## Additional Features

- Folksonomy API for user-defined tags and properties
- Export API for bulk data access
- Image upload API for contributing photos
  `;
}

function getCategoriesTaxonomyText(): string {
  return `
# Taxonomy: categories

## Food Categories

food:en:Food
  plant_based_food:en:Plant-based foods
    fruits:en:Fruits
      citrus:en:Citrus fruits
        - orange:en:Oranges
        - lemon:en:Lemons
        - lime:en:Limes
      berries:en:Berries
        - strawberry:en:Strawberries
        - blueberry:en:Blueberries
        - raspberry:en:Raspberries
      tropical_fruits:en:Tropical fruits
        - banana:en:Bananas
        - pineapple:en:Pineapples
        - mango:en:Mangoes
    vegetables:en:Vegetables
      root_vegetables:en:Root vegetables
        - carrot:en:Carrots
        - potato:en:Potatoes
      leafy_vegetables:en:Leafy vegetables
        - spinach:en:Spinach
        - lettuce:en:Lettuce
    grains:en:Grains
      - wheat:en:Wheat
      - rice:en:Rice
      - oats:en:Oats
  animal_based_food:en:Animal-based foods
    dairy:en:Dairy products
      - milk:en:Milk
      - cheese:en:Cheese
      - yogurt:en:Yogurt
    meat:en:Meat
      - beef:en:Beef
      - pork:en:Pork
      - chicken:en:Chicken
    seafood:en:Seafood
      - fish:en:Fish
      - shellfish:en:Shellfish
  processed_food:en:Processed foods
    sweets:en:Sweets
      - chocolate:en:Chocolate
      - candy:en:Candy
    snacks:en:Snacks
      - chips:en:Chips
      - crackers:en:Crackers
    beverages:en:Beverages
      - water:en:Water
      - juice:en:Fruit juices
      - soda:en:Soft drinks

## Navigation
- Use openfoodfacts://taxonomy/{taxonomy_id} to view other taxonomies
- For raw taxonomy data, contact the Open Food Facts maintainers
  `;
}