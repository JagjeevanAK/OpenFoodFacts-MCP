// Search result types
export interface SearchProductResult {
    id: string;
    name: string;
    brand: string;
    barcode: string;
    imageUrl: string;
    nutriScore: string;
    ecoScore: string;
    novaGroup: number;
    categories: string;
}

export interface SearchResult {
    products: SearchProductResult[];
    count: number;
    page: number;
    pageSize: number;
    pageCount: number;
}

// Nutrition tool types
export interface NutriScoreResult {
    barcode: string;
    productName: string;
    brand: string;
    nutriScoreGrade: string;
    nutriScoreScore: number | null;
    explanation: string;
}

export interface EcoScoreResult {
    barcode: string;
    productName: string;
    brand: string;
    ecoScoreGrade: string;
    ecoScoreScore: number | null;
    packaging: string;
    origins: string;
    explanation: string;
}

export interface AdditivesResult {
    barcode: string;
    productName: string;
    additives: Array<{
        tag: string;
        name: string;
    }>;
    count: number;
    novaGroup: number;
    novaExplanation: string;
}

export interface AllergenResult {
    barcode: string;
    productName: string;
    allergenFound: boolean;
    allergenChecked: string;
    allAllergens: string[];
    allergensTags: string[];
    traces: string[];
}

export interface MultiAllergenResult {
    barcode: string;
    productName: string;
    checkResults: Array<{
        allergen: string;
        found: boolean;
        inTraces: boolean;
    }>;
    safeToConsume: boolean;
    allAllergens: string[];
    traces: string[];
}

// Robotoff/Insights types
export interface RobotoffQuestion {
    barcode: string;
    type: string;
    value: string;
    question: string;
    insightId: string;
    insightType: string;
    imageUrl: string;
}

export interface RobotoffInsight {
    id: string;
    barcode: string;
    type: string;
    value: string;
    valueTag: string;
    confidence: number;
    latestEvent: string;
    predictor: string;
}

export interface QuestionsResult {
    status: string;
    questions: RobotoffQuestion[];
    count: number;
}

export interface InsightsResult {
    status: string;
    insights: RobotoffInsight[];
    count: number;
}

// Price types
export interface PriceResult {
    productCode: string;
    price: number;
    currency: string;
    locationName: string;
    locationId: number;
    date: string;
    proofId: number;
}

export interface PricesSearchResult {
    prices: PriceResult[];
    count: number;
    page: number;
    pageSize: number;
}

// Constants
export const BASE_URL = 'https://world.openfoodfacts.org';
export const SEARCH_API_URL = 'https://search.openfoodfacts.org';
export const ROBOTOFF_URL = 'https://robotoff.openfoodfacts.org/api/v1';
export const PRICES_URL = 'https://prices.openfoodfacts.org/api/v1';

// Grade explanation mappings
export const NUTRI_SCORE_EXPLANATIONS: Record<string, string> = {
    'a': 'Excellent nutritional quality - This is a very healthy choice!',
    'b': 'Good nutritional quality - A healthy option.',
    'c': 'Average nutritional quality - Consume in moderation.',
    'd': 'Poor nutritional quality - Consider healthier alternatives.',
    'e': 'Very poor nutritional quality - Best to avoid or consume rarely.',
    'unknown': 'Nutri-Score not available for this product.'
};

export const ECO_SCORE_EXPLANATIONS: Record<string, string> = {
    'a': 'Very low environmental impact - Excellent eco choice!',
    'b': 'Low environmental impact - Good for the planet.',
    'c': 'Moderate environmental impact - Consider the environment.',
    'd': 'High environmental impact - Consider eco-friendlier options.',
    'e': 'Very high environmental impact - Significant environmental footprint.',
    'unknown': 'Eco-Score not available for this product.'
};

export const NOVA_EXPLANATIONS: Record<number, string> = {
    1: 'Unprocessed or minimally processed foods',
    2: 'Processed culinary ingredients',
    3: 'Processed foods',
    4: 'Ultra-processed foods - contains industrial additives'
};

export const INSIGHT_TYPES = [
    { type: 'label', description: 'Detected product labels (organic, fair-trade, etc.)' },
    { type: 'category', description: 'Product category suggestions' },
    { type: 'product_weight', description: 'Detected product weight/quantity' },
    { type: 'brand', description: 'Brand name detection' },
    { type: 'expiration_date', description: 'Expiration date detection from images' },
    { type: 'packaging', description: 'Packaging material and type' },
    { type: 'store', description: 'Store/retailer information' },
    { type: 'nutrient', description: 'Nutritional value detection' },
    { type: 'ingredient_spellcheck', description: 'Ingredient spellings corrections' },
    { type: 'nutrition_image', description: 'Nutrition table image detection' }
];
