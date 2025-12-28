import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routeResourceRequest, availableResources } from '../../src/resources/resource-registry';
import { handleStaticResource } from '../../src/resources/static-resources';

vi.mock('../../src/resources/static-resources', () => ({
    handleStaticResource: vi.fn()
}));

describe('Resource Registry', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('availableResources', () => {
        it('should list all consumer-friendly resources', () => {
            const uris = availableResources.map(r => r.uri);

            expect(uris).toContain('openfoodfacts://help');
            expect(uris).toContain('openfoodfacts://nutriscore-guide');
            expect(uris).toContain('openfoodfacts://ecoscore-guide');
            expect(uris).toContain('openfoodfacts://allergens-list');
            expect(uris).toContain('openfoodfacts://additives-guide');
            expect(uris).toContain('openfoodfacts://nova-guide');
            expect(availableResources.length).toBe(6);
        });

        it('should have required properties on each resource', () => {
            availableResources.forEach(resource => {
                expect(resource).toHaveProperty('uri');
                expect(resource).toHaveProperty('name');
                expect(resource).toHaveProperty('description');
            });
        });
    });

    describe('routeResourceRequest', () => {
        it('should route valid URIs to static resource handler', async () => {
            const mockResponse = { contents: [{ uri: 'openfoodfacts://help' as const, text: 'content', mimeType: 'text/markdown' }] };
            vi.mocked(handleStaticResource).mockReturnValue(mockResponse);

            const result = await routeResourceRequest('openfoodfacts://help');

            expect(handleStaticResource).toHaveBeenCalledWith('openfoodfacts://help');
            expect(result).toBe(mockResponse);
        });

        it('should return error response for unknown URIs', async () => {
            vi.mocked(handleStaticResource).mockImplementation(() => {
                throw new Error('Resource not found');
            });

            const result = await routeResourceRequest('openfoodfacts://unknown');

            expect(result.contents[0]).toHaveProperty('isError', true);
            expect(result.contents[0].text).toContain('Resource not found');
        });
    });
});