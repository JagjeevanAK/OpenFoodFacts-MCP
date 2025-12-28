import { describe, it, expect } from 'vitest';
import { handleStaticResource } from '../../src/resources/static-resources';

describe('Static Resources Handler', () => {
  describe('handleStaticResource', () => {
    it('should return project info for info URI', () => {
      const uri = 'openfoodfacts://info';
      const result = handleStaticResource(uri);

      expect(result).toEqual({
        contents: [{
          uri,
          text: expect.stringContaining('Open Food Facts'),
          mimeType: 'application/json'
        }]
      });

      expect(result.contents[0].text).toContain('database');
    });

    it('should return database schema documentation for schema URI', () => {
      const uri = 'openfoodfacts://schema';
      const result = handleStaticResource(uri);

      expect(result).toEqual({
        contents: [{
          uri,
          text: expect.stringContaining('Open Food Facts Database Schema Overview')
        }]
      });

      expect(result.contents[0].text).toContain('Products Collection');
      expect(result.contents[0].text).toContain('Taxonomies');
    });

    it('should return categories taxonomy for taxonomy/categories URI', () => {
      const uri = 'openfoodfacts://taxonomy/categories';
      const result = handleStaticResource(uri);

      expect(result).toEqual({
        contents: [{
          uri,
          text: expect.stringContaining('Taxonomy: categories'),
          metadata: {
            taxonomyId: 'categories',
            contentType: 'text/plain'
          }
        }]
      });

      expect(result.contents[0].text).toContain('Food Categories');
    });

    it('should throw error for unknown static resource URI', () => {
      const uri = 'openfoodfacts://unknown';

      expect(() => handleStaticResource(uri)).toThrow(`Static resource not found: ${uri}`);
    });
  });
});