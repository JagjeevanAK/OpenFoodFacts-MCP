import {
    SearchProductResult,
    SearchResult,
    NutriScoreResult,
    EcoScoreResult,
    AdditivesResult,
    AllergenResult,
    MultiAllergenResult,
    QuestionsResult,
    InsightsResult,
    RobotoffQuestion,
    RobotoffInsight,
    BASE_URL,
    SEARCH_API_URL,
    ROBOTOFF_URL,
    NUTRI_SCORE_EXPLANATIONS,
    ECO_SCORE_EXPLANATIONS,
    NOVA_EXPLANATIONS
} from './types.js';
import { getProductByBarcode, searchProducts } from './product-search.js';
import { logger } from '../transport/transports.js';

/**
 * Flexible product lookup - accepts either barcode or product name
 */
export async function findProduct(nameOrBarcode: string): Promise<any> {
    if (!nameOrBarcode?.trim()) return null;

    const query = nameOrBarcode.trim();
    const isBarcode = /^\d+$/.test(query);

    if (isBarcode) {
        try {
            return await getProductByBarcode(query);
        } catch (error) {
            logger.error(`Barcode lookup failed: ${error}`);
        }
    }

    // Search by name and get first result
    try {
        const results = await searchProducts(query, 1, 1);
        const barcode = results?.products?.[0]?.barcode;
        if (barcode) {
            return await getProductByBarcode(barcode);
        }
    } catch (error) {
        logger.error(`Search failed: ${error}`);
    }

    return null;
}

/**
 * Map raw product data to SearchProductResult
 */
export function mapToSearchProduct(p: any): SearchProductResult {
    return {
        id: p._id || p.code,
        name: p.product_name || 'Unknown',
        brand: p.brands || 'Unknown',
        barcode: p.code || '',
        imageUrl: p.image_url || '',
        nutriScore: p.nutriscore_grade || '',
        ecoScore: p.ecoscore_grade || '',
        novaGroup: p.nova_group || 0,
        categories: p.categories || ''
    };
}

// ============ Category Search Helpers ============

/**
 * Search products by category using the Open Food Facts facets API
 */
export async function searchByCategory(category: string, page: number, pageSize: number): Promise<SearchResult> {
    const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
    const url = `${BASE_URL}/category/${categorySlug}/${page}.json`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to search by category: ${response.status}`);
    }

    const data = await response.json();

    return {
        products: (data.products || []).map(mapToSearchProduct),
        count: data.count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((data.count || 0) / pageSize)
    };
}

/**
 * Search products by brand using the Open Food Facts facets API
 */
export async function searchByBrand(brand: string, page: number, pageSize: number): Promise<SearchResult> {
    const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
    const url = `${BASE_URL}/brand/${brandSlug}/${page}.json`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to search by brand: ${response.status}`);
    }

    const data = await response.json();

    return {
        products: (data.products || []).map(mapToSearchProduct),
        count: data.count || 0,
        page,
        pageSize,
        pageCount: Math.ceil((data.count || 0) / pageSize)
    };
}

/**
 * Advanced search using Search-a-licious API with multiple filters
 */
export async function advancedSearch(params: {
    query?: string;
    category?: string;
    brand?: string;
    nutriscoreGrade?: string;
    ecoscoreGrade?: string;
    novaGroup?: string;
    allergenFree?: string;
    labels?: string;
    countries?: string;
    sortBy?: string;
    page: number;
    pageSize: number;
}): Promise<SearchResult> {
    // Build Lucene query from filters
    const queryParts: string[] = [];

    if (params.query) queryParts.push(params.query);
    if (params.category) queryParts.push(`categories_tags:"en:${params.category}"`);
    if (params.brand) queryParts.push(`brands:"${params.brand}"`);
    if (params.nutriscoreGrade) queryParts.push(`nutriscore_grade:${params.nutriscoreGrade}`);
    if (params.ecoscoreGrade) queryParts.push(`ecoscore_grade:${params.ecoscoreGrade}`);
    if (params.novaGroup) queryParts.push(`nova_group:${params.novaGroup}`);
    if (params.labels) queryParts.push(`labels_tags:"en:${params.labels}"`);
    if (params.countries) queryParts.push(`countries_tags:"en:${params.countries}"`);

    // Handle allergen-free filter (search for products WITHOUT the allergen)
    if (params.allergenFree) {
        queryParts.push(`-allergens_tags:"en:${params.allergenFree}"`);
    }

    const searchQuery = queryParts.join(' ');

    const url = new URL(`${SEARCH_API_URL}/search`);
    url.searchParams.set('q', searchQuery || '*');
    url.searchParams.set('page', params.page.toString());
    url.searchParams.set('page_size', params.pageSize.toString());
    if (params.sortBy) url.searchParams.set('sort_by', params.sortBy);

    const response = await fetch(url.toString());
    if (!response.ok) {
        logger.warn('Search-a-licious failed, falling back to standard API');
        return fallbackSearch(params);
    }

    const data = await response.json();

    if (data.errors) {
        logger.warn('Search-a-licious returned errors, falling back to standard API');
        return fallbackSearch(params);
    }

    return {
        products: (data.hits || []).map(mapToSearchProduct),
        count: data.count || 0,
        page: data.page || params.page,
        pageSize: data.page_size || params.pageSize,
        pageCount: data.page_count || Math.ceil((data.count || 0) / params.pageSize)
    };
}

/**
 * Fallback to standard search API
 */
export async function fallbackSearch(params: {
    query?: string;
    page: number;
    pageSize: number;
}): Promise<SearchResult> {
    const url = new URL(`${BASE_URL}/cgi/search.pl`);
    url.searchParams.set('search_terms', params.query || '');
    url.searchParams.set('page', params.page.toString());
    url.searchParams.set('page_size', params.pageSize.toString());
    url.searchParams.set('json', '1');

    const response = await fetch(url.toString());
    const data = await response.json();

    return {
        products: (data.products || []).map(mapToSearchProduct),
        count: data.count || 0,
        page: params.page,
        pageSize: params.pageSize,
        pageCount: Math.ceil((data.count || 0) / params.pageSize)
    };
}

/**
 * Autocomplete for taxonomy fields using Search-a-licious
 */
export async function getAutocomplete(query: string, taxonomyType: string, lang: string, limit: number) {
    const url = new URL(`${SEARCH_API_URL}/autocomplete`);
    url.searchParams.set('q', query);
    url.searchParams.set('taxonomy_names', taxonomyType);
    url.searchParams.set('lang', lang);
    url.searchParams.set('size', limit.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Autocomplete failed: ${response.status}`);
    }

    return await response.json();
}

// ============ Nutrition Helpers ============

/**
 * Get Nutri-Score for a product
 */
export function getNutriScore(product: any): NutriScoreResult {
    const grade = product.nutriScore || product.nutriscore_grade || 'unknown';
    const score = product.nutriscore_score ?? null;

    return {
        barcode: product.barcode || product.code,
        productName: product.name || product.product_name || 'Unknown',
        brand: product.brands || 'Unknown',
        nutriScoreGrade: grade.toUpperCase(),
        nutriScoreScore: score,
        explanation: NUTRI_SCORE_EXPLANATIONS[grade.toLowerCase()] || NUTRI_SCORE_EXPLANATIONS['unknown']
    };
}

/**
 * Get Eco-Score for a product
 */
export function getEcoScore(product: any): EcoScoreResult {
    const grade = product.ecoscore_grade || 'unknown';
    const score = product.ecoscore_score ?? null;

    return {
        barcode: product.barcode || product.code,
        productName: product.name || product.product_name || 'Unknown',
        brand: product.brands || 'Unknown',
        ecoScoreGrade: grade.toUpperCase(),
        ecoScoreScore: score,
        packaging: product.packaging || 'Not specified',
        origins: product.origins || 'Not specified',
        explanation: ECO_SCORE_EXPLANATIONS[grade.toLowerCase()] || ECO_SCORE_EXPLANATIONS['unknown']
    };
}

/**
 * Get additives information for a product
 */
export function getAdditivesInfo(product: any): AdditivesResult {
    const additivesTags = product.additives_tags || [];
    const additivesOriginalTags = product.additives_original_tags || [];
    const novaGroup = product.novaGroup || product.nova_group || 0;

    const additives = (additivesTags.length > 0 ? additivesTags : additivesOriginalTags).map((tag: string) => {
        const match = tag.match(/en:(e\d+[a-z]?)/i);
        return {
            tag: tag,
            name: match ? match[1].toUpperCase() : tag.replace('en:', '').toUpperCase()
        };
    });

    return {
        barcode: product.barcode || product.code,
        productName: product.name || product.product_name || 'Unknown',
        additives,
        count: additives.length,
        novaGroup,
        novaExplanation: NOVA_EXPLANATIONS[novaGroup] || 'NOVA group not available'
    };
}

/**
 * Check if a product contains a specific allergen
 */
export function checkAllergen(product: any, allergen: string): AllergenResult {
    const allergensTags = product.allergens_tags || [];
    const allergensHierarchy = product.allergens_hierarchy || [];
    const tracesTags = product.traces_tags || [];

    const allergenLower = allergen.toLowerCase();

    const allAllergenTags = [...new Set([...allergensTags, ...allergensHierarchy])];
    const allergenFound = allAllergenTags.some(tag =>
        tag.toLowerCase().includes(allergenLower)
    );

    const inTraces = tracesTags.some((tag: string) =>
        tag.toLowerCase().includes(allergenLower)
    );

    const allAllergens = allAllergenTags.map((tag: string) =>
        tag.replace('en:', '').replace(/-/g, ' ')
    );

    const traces = tracesTags.map((tag: string) =>
        tag.replace('en:', '').replace(/-/g, ' ')
    );

    return {
        barcode: product.barcode || product.code,
        productName: product.name || product.product_name || 'Unknown',
        allergenFound: allergenFound || inTraces,
        allergenChecked: allergen,
        allAllergens,
        allergensTags: allAllergenTags,
        traces
    };
}

/**
 * Check multiple allergens at once
 */
export function checkMultipleAllergens(product: any, allergens: string[]): MultiAllergenResult {
    const allergensTags = product.allergens_tags || [];
    const allergensHierarchy = product.allergens_hierarchy || [];
    const tracesTags = product.traces_tags || [];

    const allAllergenTags = [...new Set([...allergensTags, ...allergensHierarchy])];

    const checkResults = allergens.map(allergen => {
        const allergenLower = allergen.toLowerCase();
        const found = allAllergenTags.some(tag => tag.toLowerCase().includes(allergenLower));
        const inTraces = tracesTags.some((tag: string) => tag.toLowerCase().includes(allergenLower));

        return { allergen, found, inTraces };
    });

    const allAllergens = allAllergenTags.map((tag: string) =>
        tag.replace('en:', '').replace(/-/g, ' ')
    );

    const traces = tracesTags.map((tag: string) =>
        tag.replace('en:', '').replace(/-/g, ' ')
    );

    const safeToConsume = !checkResults.some(r => r.found || r.inTraces);

    return {
        barcode: product.barcode || product.code,
        productName: product.name || product.product_name || 'Unknown',
        checkResults,
        safeToConsume,
        allAllergens,
        traces
    };
}

// ============ Robotoff/Insights Helpers ============

/**
 * Get AI-generated questions about products from Robotoff
 */
export async function getQuestions(params: {
    barcode?: string;
    insightType?: string;
    lang?: string;
    count?: number;
}): Promise<QuestionsResult> {
    let url: string;

    if (params.barcode) {
        url = `${ROBOTOFF_URL}/questions/${params.barcode}`;
    } else {
        url = `${ROBOTOFF_URL}/questions/random`;
    }

    const searchParams = new URLSearchParams();
    if (params.insightType) searchParams.set('insight_types', params.insightType);
    if (params.lang) searchParams.set('lang', params.lang);
    if (params.count) searchParams.set('count', params.count.toString());

    const fullUrl = `${url}?${searchParams.toString()}`;

    const response = await fetch(fullUrl);
    if (!response.ok) {
        throw new Error(`Failed to get questions: ${response.status}`);
    }

    const data = await response.json();

    const questions = (data.questions || []).map((q: any): RobotoffQuestion => ({
        barcode: q.barcode,
        type: q.type,
        value: q.value,
        question: q.question,
        insightId: q.insight_id,
        insightType: q.insight_type,
        imageUrl: q.source_image_url || ''
    }));

    return {
        status: data.status || 'found',
        questions,
        count: questions.length
    };
}

/**
 * Get AI-generated insights about products from Robotoff
 */
export async function getInsights(params: {
    barcode?: string;
    insightType?: string;
    country?: string;
    count?: number;
    page?: number;
}): Promise<InsightsResult> {
    const url = new URL(`${ROBOTOFF_URL}/insights`);

    if (params.barcode) url.searchParams.set('barcode', params.barcode);
    if (params.insightType) url.searchParams.set('insight_types', params.insightType);
    if (params.country) url.searchParams.set('countries', params.country);
    if (params.count) url.searchParams.set('count', params.count.toString());
    if (params.page) url.searchParams.set('page', params.page.toString());

    url.searchParams.set('annotated', '0');

    const response = await fetch(url.toString());
    if (!response.ok) {
        throw new Error(`Failed to get insights: ${response.status}`);
    }

    const data = await response.json();

    const insights = (data.insights || []).map((i: any): RobotoffInsight => ({
        id: i.id,
        barcode: i.barcode,
        type: i.type,
        value: i.value,
        valueTag: i.value_tag,
        confidence: i.confidence || 0,
        latestEvent: i.latest_event || '',
        predictor: i.predictor || ''
    }));

    return {
        status: data.status || 'found',
        insights,
        count: data.count || insights.length
    };
}

/**
 * Get product questions by barcode
 */
export async function getProductQuestions(barcode: string, lang: string = 'en'): Promise<QuestionsResult> {
    const barcodeNum = parseInt(barcode.replace(/\D/g, ''), 10);
    if (isNaN(barcodeNum)) {
        throw new Error('Invalid barcode format');
    }

    const url = `${ROBOTOFF_URL}/questions/${barcodeNum}?lang=${lang}&count=25`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to get product questions: ${response.status}`);
    }

    const data = await response.json();

    const questions = (data.questions || []).map((q: any): RobotoffQuestion => ({
        barcode: q.barcode,
        type: q.type,
        value: q.value,
        question: q.question,
        insightId: q.insight_id,
        insightType: q.insight_type,
        imageUrl: q.source_image_url || ''
    }));

    return {
        status: data.status || (questions.length > 0 ? 'found' : 'no_questions'),
        questions,
        count: questions.length
    };
}
