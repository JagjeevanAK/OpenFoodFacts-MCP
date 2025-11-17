import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs';
import { logger } from '../transport/transports.js';

// Create SDK client instance
const client = new OpenFoodFacts(globalThis.fetch);

// Interface for the mapped product in search results
export interface SearchProductItem {
    id: string;
    name: string;
    brand: string;
    barcode: string;
    imageUrl: string;
    nutriScore: string;
    ingredients: string;
    categories: string;
}

// Interface for the return value of searchProducts function
export interface SearchProductsResult {
    products: SearchProductItem[];
    count: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

/**
 * Search products in Open Food Facts database
 * @param query Search query
 * @param page Page number
 * @param pageSize Number of results per page
 * @returns Search results with pagination info
 */
export async function searchProducts(query: string, page: number = 1, pageSize: number = 20): Promise<SearchProductsResult> {
  try {
    // Check if the query looks like a barcode (8-14 digits)
    const isBarcode = /^[0-9]{8,14}$/.test(query.trim());
    
    if (isBarcode) {
      // If it's a barcode, use the direct product lookup API first
      try {
        const product = await getProductByBarcode(query.trim());
        
        // Convert the single product to the expected search results format
        return {
          products: [{
            id: product.id,
            name: product.name,
            brand: product.brands || 'Unknown brand',
            barcode: product.barcode,
            imageUrl: product.imageUrl || '',
            nutriScore: product.nutriScore || '',
            ingredients: product.ingredients || '',
            categories: product.categories || ''
          }],
          count: 1,
          page: 1,
          pageSize: 1,
          pageCount: 1
        };
      } catch (barcodeError) {
        logger.info(`Barcode lookup failed for ${query}, falling back to search API: ${barcodeError}`);
        // If direct lookup fails, fall back to regular search
      }
    }

    // For general text search, use fetch directly with the search API
    // The SDK doesn't expose search_terms parameter in its TypeScript types
    const searchUrl = new URL('https://world.openfoodfacts.org/cgi/search.pl');
    searchUrl.searchParams.set('search_terms', query);
    searchUrl.searchParams.set('page', page.toString());
    searchUrl.searchParams.set('page_size', pageSize.toString());
    searchUrl.searchParams.set('json', '1');
    
    const response = await fetch(searchUrl.toString());
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();

    // Check if the response is valid
    if (!data || !Array.isArray(data.products)) {
      throw new Error('Invalid response from Open Food Facts API');
    }

    // Return the products from the response with pagination info
    return {
      products: data.products.map((product: any): SearchProductItem => ({
        id: product.id || product._id,
        name: product.product_name || 'Unknown product',
        brand: product.brands || 'Unknown brand',
        barcode: product.code || '',
        imageUrl: product.image_url || '',
        nutriScore: product.nutriscore_grade || '',
        ingredients: product.ingredients_text || '',
        categories: product.categories || ''
      })),
      count: data.count || 0,
      page,
      pageSize,
      pageCount: Math.ceil((data.count || 0) / pageSize)
    } as SearchProductsResult;
  } catch (error) {
    logger.error('Error searching products:', error);
    throw new Error(`Failed to search products: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get detailed product information by barcode
 * @param barcode The product barcode
 * @returns Detailed product information
 */
export async function getProductByBarcode(barcode: string) {
  try {
    // Validate barcode format
    if (!barcode.match(/^[0-9]{8,14}$/)) {
      throw new Error('Invalid barcode format. Expected 8-14 digits.');
    }

    // Use the SDK's getProduct method (V3 API) - using 'all' to get all fields
    const result = await client.getProductV3(barcode, {
      fields: ['all']
    });

    // Check if product was found - check for error or no data
    if (result.error || !result.data || result.data.status === 'failure') {
      throw new Error(`Product with barcode ${barcode} not found`);
    }

    // Cast to any for easier access to fields since the SDK typing is complex
    const product: any = result.data;

    // Return the product information with selected fields
    return {
      id: product._id || barcode,
      barcode: product.code || barcode,
      name: product.product_name || 'Unknown product',
      brands: product.brands,
      ingredients: product.ingredients_text,
      allergens: product.allergens,
      nutriScore: product.nutriscore_grade,
      novaGroup: product.nova_group,
      imageUrl: product.selected_images?.front?.display?.en || product.image_url || '',
      nutritionFacts: {
        energy: product.nutriments?.['energy-kcal_100g'],
        fat: product.nutriments?.fat_100g,
        saturatedFat: product.nutriments?.['saturated-fat_100g'],
        carbohydrates: product.nutriments?.carbohydrates_100g,
        sugars: product.nutriments?.sugars_100g,
        fiber: product.nutriments?.fiber_100g,
        proteins: product.nutriments?.proteins_100g,
        salt: product.nutriments?.salt_100g
      },
      labels: product.labels,
      categories: product.categories,
      countries: product.countries
    };
  } catch (error) {
    logger.error('Error fetching product:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to get product details');
  }
}