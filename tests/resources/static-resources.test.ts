import { describe, it, expect } from 'vitest';
import { handleStaticResource } from '../../src/resources/static-resources';

describe('Static Resources Handler', () => {
  it('should return help guide content', () => {
    const result = handleStaticResource('openfoodfacts://help');

    expect(result.contents[0].uri).toBe('openfoodfacts://help');
    expect(result.contents[0].text).toContain('Quick Help');
    expect(result.contents[0].mimeType).toBe('text/markdown');
  });

  it('should return nutriscore guide', () => {
    const result = handleStaticResource('openfoodfacts://nutriscore-guide');

    expect(result.contents[0].text).toContain('Nutri-Score');
  });

  it('should return ecoscore guide', () => {
    const result = handleStaticResource('openfoodfacts://ecoscore-guide');

    expect(result.contents[0].text).toContain('Eco-Score');
  });

  it('should return allergens list', () => {
    const result = handleStaticResource('openfoodfacts://allergens-list');

    expect(result.contents[0].text).toContain('Allergens');
  });

  it('should return additives guide', () => {
    const result = handleStaticResource('openfoodfacts://additives-guide');

    expect(result.contents[0].text).toContain('Additives');
  });

  it('should return nova guide', () => {
    const result = handleStaticResource('openfoodfacts://nova-guide');

    expect(result.contents[0].text).toContain('NOVA');
  });

  it('should throw for unknown resource', () => {
    expect(() => handleStaticResource('openfoodfacts://unknown'))
      .toThrow('Resource not found: openfoodfacts://unknown');
  });
});