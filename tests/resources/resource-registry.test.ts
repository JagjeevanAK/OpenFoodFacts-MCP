import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeResourceRequest, availableResources } from '../../src/resources/resource-registry';
import { handleTaxonomy } from '../../src/resources/taxonomy';
import { handleStaticResource } from '../../src/resources/static-resources';

// Mock resource handlers
vi.mock('../../src/resources/taxonomy', () => ({
    handleTaxonomy: vi.fn()
}));

vi.mock('../../src/resources/static-resources', () => ({
    handleStaticResource: vi.fn()
}));

describe('Resource Registry', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('availableResources', () => {
        it('should define all required consumer resources', () => {
            expect(availableResources).toBeInstanceOf(Array);
            const resourceUris = availableResources.map(r => r.uri);

            // Consumer-focused resources
            expect(resourceUris).toContain('openfoodfacts://info');
            expect(resourceUris).toContain('openfoodfacts://schema');
            expect(resourceUris).toContain('openfoodfacts://taxonomy/categories');

            availableResources.forEach(resource => {
                expect(resource).toHaveProperty('uri');
                expect(resource).toHaveProperty('name');
                expect(resource).toHaveProperty('description');
            });
        });
    });

    describe('routeResourceRequest', () => {
        it('should route project info resource requests correctly', async () => {
            const uri = 'openfoodfacts://info';
            const mockResponse = { contents: [{ uri, text: 'project info' }] };

            vi.mocked(handleStaticResource).mockReturnValue(mockResponse);

            const result = await routeResourceRequest(uri);

            expect(handleStaticResource).toHaveBeenCalledWith(uri);
            expect(result).toBe(mockResponse);
        });

        it('should route schema resource requests correctly', async () => {
            const uri = 'openfoodfacts://schema';
            const mockResponse = { contents: [{ uri, text: 'schema content' }] };

            vi.mocked(handleStaticResource).mockReturnValue(mockResponse);

            const result = await routeResourceRequest(uri);

            expect(handleStaticResource).toHaveBeenCalledWith(uri);
            expect(result).toBe(mockResponse);
        });

        it('should route categories taxonomy as static resource', async () => {
            const uri = 'openfoodfacts://taxonomy/categories';
            const mockResponse = { contents: [{ uri, text: 'taxonomy content' }] };

            vi.mocked(handleStaticResource).mockReturnValue(mockResponse);

            const result = await routeResourceRequest(uri);

            expect(handleStaticResource).toHaveBeenCalledWith(uri);
            expect(result).toBe(mockResponse);
        });

        it('should route other taxonomy resource requests to taxonomy handler', async () => {
            const uri = 'openfoodfacts://taxonomy/allergens';
            const mockResponse = { contents: [{ uri, text: 'allergens taxonomy' }] };

            vi.mocked(handleTaxonomy).mockResolvedValue(mockResponse);

            const result = await routeResourceRequest(uri);

            expect(handleTaxonomy).toHaveBeenCalledWith(uri, expect.any(URL));
            expect(result).toBe(mockResponse);
        });

        it('should handle errors for unknown resources', async () => {
            const uri = 'openfoodfacts://unknown';

            const result = await routeResourceRequest(uri);

            expect(result).toEqual({
                contents: [{
                    uri,
                    text: 'Error processing request: Resource not found: openfoodfacts://unknown',
                    isError: true
                }]
            });
        });

        it('should handle invalid URIs', async () => {
            const uri = 'invalid-uri:///';

            const result = await routeResourceRequest(uri);

            expect(result.contents[0]).toHaveProperty('isError', true);
            expect(result.contents[0].text).toContain('Error processing request:');
        });
    });
});