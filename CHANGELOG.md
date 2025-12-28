# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-12-28

### Added

#### Category & Search Tools
- `searchByCategory` - Search products within specific food categories (e.g., beverages, snacks, dairy, cereals)
- `searchByBrand` - Find all products from a specific brand
- `advancedSearch` - Advanced product search with multiple filters including category, brand, Nutri-Score, Eco-Score, NOVA group, allergen-free options, labels, and country
- `autocomplete` - Get autocomplete suggestions for categories, brands, labels, ingredients, allergens, or additives

#### Nutrition & Health Tools
- `getNutriScore` - Get the Nutri-Score grade (A-E) for a product - quick health assessment at a glance
- `getEcoScore` - Get the Eco-Score (environmental impact rating A-E) for a product
- `getAdditivesInfo` - List all additives in a product with their E-numbers and NOVA processing level
- `getAllergenCheck` - Check if a product contains a specific allergen (gluten, milk, eggs, nuts, etc.)
- `checkMultipleAllergens` - Check if a product contains any of multiple allergens at once

#### AI Insights Tools
- `getProductAIQuestions` - Get AI-generated questions about a product that need human verification
- `getRandomAIQuestions` - Get random AI-generated questions from Robotoff that need human verification
- `getProductInsights` - Get AI-generated insights about products (detected labels, categories, ingredients issues)
- `getInsightTypes` - Get a summary of available AI insight types in Robotoff

#### Price Tools
- `getProductPrices` - Get price history and current prices for a product from Open Prices
- `searchPrices` - Search for prices with filters (currency, country, date range)
- `getRecentPrices` - Get recently added prices to discover what's available

### Changed

- **Architecture Refactoring**: Reorganized tools into modular files for better maintainability
  - `category-tools.ts` - Category and brand search tools
  - `nutrition-tools.ts` - Nutrition scores, allergen checks, and additive information
  - `insights-tools.ts` - AI-generated insights from Robotoff
  - `price-tools.ts` - Product pricing data from Open Prices
  - `types.ts` - Shared type definitions and interfaces
  - `helpers.ts` - Reusable helper functions for all tools

- **Documentation**: Comprehensive README update
  - Documented all 23 tools organized by category
  - Added example conversations for new tool categories
  - Updated Server Architecture section to reflect modular structure
  - Updated Resources and Prompts sections

### Removed

- Removed emoji usage throughout codebase for better compatibility and professional appearance
- Removed legacy prompt registry files (`src/prompts/`)
- Removed taxonomy utilities that were replaced by helpers

## [1.0.3] - 2025-12-27

### Changed
- Updated MCP server architecture
- Removed developer tools

## [1.0.2] - 2025-12-27

### Changed
- Updated minor things
- Untracked files now in .gitignore

---

[1.1.0]: https://github.com/JagjeevanAK/OpenFoodFacts-MCP/compare/v1.0.3...v1.1.0
[1.0.3]: https://github.com/JagjeevanAK/OpenFoodFacts-MCP/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/JagjeevanAK/OpenFoodFacts-MCP/releases/tag/v1.0.2
