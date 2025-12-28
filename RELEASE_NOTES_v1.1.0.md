# Release Notes - v1.1.0

## 🎉 Major Feature Release

This release introduces significant enhancements to the OpenFoodFacts MCP server with a modular architecture and many new tools for comprehensive food product analysis.

## ✨ New Features

### New Tool Categories (18+ new tools added!)

#### Category & Search Tools
- **searchByCategory**: Search products within specific food categories
- **searchByBrand**: Find all products from a specific brand
- **advancedSearch**: Multi-filter search (category, brand, Nutri-Score, Eco-Score, NOVA, allergens, labels, country)
- **autocomplete**: Get suggestions for categories, brands, labels, ingredients, allergens, or additives

#### Nutrition & Health Tools
- **getNutriScore**: Quick health assessment (A-E grade)
- **getEcoScore**: Environmental impact rating (A-E grade)
- **getAdditivesInfo**: List additives with E-numbers and NOVA processing levels
- **getAllergenCheck**: Check for specific allergens
- **checkMultipleAllergens**: Check multiple allergens at once

#### AI Insights Tools
- **getProductAIQuestions**: AI-generated questions needing verification
- **getRandomAIQuestions**: Random AI questions for community contribution
- **getProductInsights**: AI insights about products (labels, categories, ingredients)
- **getInsightTypes**: Summary of available AI insight types

#### Price Tools
- **getProductPrices**: Get price history from Open Prices
- **searchPrices**: Search prices with filters
- **getRecentPrices**: See recently added prices

### Architecture Improvements

- **Modular Tool Organization**: Tools separated into logical categories
  - `category-tools.ts`: Category and search functionality
  - `nutrition-tools.ts`: Nutrition and allergen tools
  - `insights-tools.ts`: Robotoff AI insights
  - `price-tools.ts`: Open Prices integration
- **Shared Utilities**: New `types.ts` and `helpers.ts` for reusable code
- **Better Separation of Concerns**: Cleaner, more maintainable codebase

### Documentation Updates

- Comprehensive README with all 23 tools documented
- Updated example conversations for new tools
- Detailed architecture documentation
- Updated resources and prompts sections

## 🔧 Improvements

- Removed emoji usage throughout codebase for better compatibility
- Enhanced resource guides (Nutri-Score, Eco-Score, Allergens, Additives, NOVA)
- Better error handling and type safety
- Improved code organization and modularity

## 📦 What's Changed

- Total tools increased from 5 to 23
- Modular architecture for better maintainability
- Integration with Robotoff AI system
- Integration with Open Prices database
- Professional, emoji-free documentation

## 🚀 Upgrade Guide

No breaking changes! Simply update to v1.1.0 and enjoy the new tools. All existing tools remain compatible.

## 📝 Full Changelog

See commit history for detailed changes:
- feat: updated MCP architecture and added more tools to use with AI
- docs: Updated README to reflect new architecture
- refactor: Removed emoji usage from codebase

---

**Contributors**: @JagjeevanAK
