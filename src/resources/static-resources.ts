/**
 * Consumer-friendly static resources for Open Food Facts MCP
 * These resources provide helpful guides and references for everyday use
 */

/**
 * Handle requests for static resources
 */
export function handleStaticResource(uri: string) {
  switch (uri) {
    case "openfoodfacts://help":
      return { contents: [{ uri, text: getHelpGuide(), mimeType: "text/markdown" }] };

    case "openfoodfacts://nutriscore-guide":
      return { contents: [{ uri, text: getNutriScoreGuide(), mimeType: "text/markdown" }] };

    case "openfoodfacts://ecoscore-guide":
      return { contents: [{ uri, text: getEcoScoreGuide(), mimeType: "text/markdown" }] };

    case "openfoodfacts://allergens-list":
      return { contents: [{ uri, text: getAllergensGuide(), mimeType: "text/markdown" }] };

    case "openfoodfacts://additives-guide":
      return { contents: [{ uri, text: getAdditivesGuide(), mimeType: "text/markdown" }] };

    case "openfoodfacts://nova-guide":
      return { contents: [{ uri, text: getNovaGuide(), mimeType: "text/markdown" }] };

    default:
      throw new Error(`Resource not found: ${uri}`);
  }
}

function getHelpGuide(): string {
  return `# Open Food Facts MCP - Quick Help

## Finding Products

| What you want | Tool to use |
|---------------|-------------|
| Search by name | \`searchProducts\` - "chocolate", "orange juice" |
| Search by barcode | \`getProductByBarcode\` - "5000112546415" |
| Find by brand | \`searchByBrand\` - "Nestle", "Coca-Cola" |
| Find by category | \`searchByCategory\` - "beverages", "snacks" |

## Health & Nutrition

| What you want | Tool to use |
|---------------|-------------|
| Quick health rating | \`getNutriScore\` - A is best, E is worst |
| Environmental impact | \`getEcoScore\` - A is best, E is worst |
| Check for allergens | \`getAllergenCheck\` - gluten, milk, nuts, etc. |
| Check multiple allergens | \`checkMultipleAllergens\` - check several at once |
| See additives | \`getAdditivesInfo\` - E-numbers and processing level |

## AI Features

| What you want | Tool to use |
|---------------|-------------|
| Detailed analysis | \`analyzeProduct\` - AI nutritional breakdown |
| Compare products | \`compareProducts\` - which is healthier? |
| Recipe ideas | \`suggestRecipes\` - what can I make? |

## Prices

| What you want | Tool to use |
|---------------|-------------|
| Product prices | \`getProductPrices\` - crowd-sourced prices |
| Recent prices | \`getRecentPrices\` - latest price updates |

## Reference Guides

- \`openfoodfacts://nutriscore-guide\` - Understanding Nutri-Score
- \`openfoodfacts://ecoscore-guide\` - Understanding Eco-Score  
- \`openfoodfacts://allergens-list\` - Common food allergens
- \`openfoodfacts://additives-guide\` - Food additives explained
- \`openfoodfacts://nova-guide\` - Food processing levels
`;
}

function getNutriScoreGuide(): string {
  return `# Nutri-Score Guide

Nutri-Score is a nutrition label that rates food from **A** (healthiest) to **E** (least healthy).

## The Grades

### Grade A - Excellent
Best nutritional quality. Examples:
- Fresh fruits and vegetables
- Plain water
- Unsweetened whole grains

### Grade B - Good  
Good nutritional quality. Examples:
- Olive oil
- Unsweetened fruit juices
- Most fish

### Grade C - Average
Moderate nutritional quality. Examples:
- Breakfast cereals with some sugar
- Processed cheese
- Meat products

### Grade D - Poor
Poor nutritional quality. Examples:
- Sweetened beverages
- Processed meats
- Sugary snacks

### Grade E - Very Poor
Lowest nutritional quality. Examples:
- Candy and sweets
- Soft drinks
- High-fat snacks

## How It's Calculated

**Negative points** for:
- Energy (calories)
- Sugars
- Saturated fat
- Sodium (salt)

**Positive points** for:
- Fiber
- Protein
- Fruits, vegetables, nuts

## Tips
- Choose **A and B** rated products when possible
- **C** rated foods are okay in moderation
- Limit **D and E** rated foods
`;
}

function getEcoScoreGuide(): string {
  return `# Eco-Score Guide

Eco-Score rates the environmental impact of food from **A** (lowest impact) to **E** (highest impact).

## The Grades

### Grade A - Very Low Impact
Minimal environmental footprint. Examples:
- Local seasonal produce
- Tap water
- Bulk legumes

### Grade B - Low Impact
Small environmental footprint. Examples:
- Locally sourced products
- Minimal packaging
- Plant-based proteins

### Grade C - Moderate Impact
Average environmental footprint. Examples:
- Standard packaged foods
- Mixed origin products

### Grade D - High Impact
Significant environmental footprint. Examples:
- Air-freighted produce
- Heavily packaged items
- Some meat products

### Grade E - Very High Impact
Major environmental footprint. Examples:
- Out-of-season air-freighted foods
- Products with deforestation links
- Excessive packaging

## What Affects Eco-Score

- **Production method** - Organic, conventional, intensive
- **Transportation** - Local vs imported, air vs ship
- **Packaging** - Recyclable, plastic, glass
- **Seasonality** - In-season vs greenhouse/imported
- **Biodiversity** - Palm oil, deforestation risk

## Tips
- Buy **local and seasonal** when possible
- Choose products with **less packaging**
- Prefer **plant-based** options
- Look for **organic** and **fair-trade** labels
`;
}

function getAllergensGuide(): string {
  return `# Common Food Allergens

The 14 major allergens that must be declared on food labels:

## Gluten
Found in: Wheat, barley, rye, oats (unless certified gluten-free)
Hidden in: Soy sauce, beer, some processed foods

## Milk (Dairy)
Found in: Milk, cheese, butter, cream, yogurt
Hidden in: Bread, chocolate, processed meats

## Eggs
Found in: Mayonnaise, pasta, cakes, meringue
Hidden in: Some wines, vaccines, shampoos

## Peanuts
Found in: Peanut butter, satay sauce, some oils
Hidden in: Chocolate, ice cream, Asian dishes

## Tree Nuts
Includes: Almonds, cashews, walnuts, hazelnuts, pistachios
Hidden in: Marzipan, praline, pesto

## Fish
Found in: Fresh fish, fish sauce, Worcestershire sauce
Hidden in: Some salad dressings, pizza toppings

## Shellfish (Crustaceans)
Includes: Shrimp, crab, lobster, crayfish
Hidden in: Some Asian sauces, fish stock

## Soy
Found in: Tofu, soy sauce, miso, edamame
Hidden in: Bread, processed foods, chocolate

## Celery
Found in: Celery sticks, celery salt, celeriac
Hidden in: Stocks, soups, some salads

## Mustard
Found in: Mustard, curry powder, salad dressings
Hidden in: Marinades, sauces, pickles

## Sesame
Found in: Sesame seeds, tahini, hummus
Hidden in: Bread, Asian dishes, some oils

## Lupin
Found in: Lupin flour, lupin seeds
Hidden in: Some breads, pastries

## Molluscs
Includes: Mussels, oysters, squid, snails
Hidden in: Oyster sauce, some Asian dishes

## Sulphites
Found in: Dried fruits, wine, some processed foods
Hidden in: Pickled foods, sausages

---

**Tip**: Use \`getAllergenCheck\` or \`checkMultipleAllergens\` to check products!
`;
}

function getAdditivesGuide(): string {
  return `# Food Additives Guide

Understanding E-numbers and food additives.

## What Are E-Numbers?

E-numbers are codes for food additives approved in the EU. They're grouped by function:

## Categories

### E100-E199: Colors
- **E100** - Curcumin (turmeric) - Natural
- **E120** - Carmine (from insects) 
- **E150** - Caramel color
- **E171** - Titanium dioxide - Controversial

### E200-E299: Preservatives
- **E200** - Sorbic acid - Generally safe
- **E211** - Sodium benzoate - Some concerns
- **E250** - Sodium nitrite - In processed meats
- **E270** - Lactic acid - Natural

### E300-E399: Antioxidants
- **E300** - Vitamin C - Natural
- **E306** - Vitamin E - Natural
- **E330** - Citric acid - Natural

### E400-E499: Thickeners & Stabilizers
- **E401** - Sodium alginate - From seaweed
- **E412** - Guar gum - Natural
- **E415** - Xanthan gum - Generally safe
- **E471** - Mono/diglycerides - May contain trans fats

### E500-E599: Acidity Regulators
- **E500** - Sodium bicarbonate - Baking soda
- **E503** - Ammonium carbonate - Natural

### E600-E699: Flavor Enhancers  
- **E621** - MSG - Some sensitivity
- **E631** - Disodium inosinate

### E900-E999: Sweeteners & Others
- **E901** - Beeswax - Natural
- **E950** - Acesulfame K (artificial sweetener)
- **E951** - Aspartame (artificial sweetener)
- **E967** - Xylitol - Natural alternative

## NOVA Processing Groups

| Group | Description | Examples |
|-------|-------------|----------|
| **1** | Unprocessed/minimal | Fresh fruits, vegetables, eggs |
| **2** | Processed ingredients | Oils, butter, sugar, flour |
| **3** | Processed foods | Canned vegetables, cheese, bread |
| **4** | Ultra-processed | Soft drinks, chips, instant noodles |

---

**Tip**: Use \`getAdditivesInfo\` to see what's in a product!
`;
}

function getNovaGuide(): string {
  return `# NOVA Food Processing Guide

NOVA classifies foods by their degree of processing.

## Group 1: Unprocessed or Minimally Processed

**What**: Natural foods with minimal alteration
**Processing**: Cleaning, removing inedible parts, drying, freezing, pasteurization

**Examples**:
- Fresh fruits and vegetables
- Eggs
- Fresh meat and fish
- Plain milk
- Plain nuts and seeds
- Dried beans and lentils
- Fresh herbs and spices

## Group 2: Processed Culinary Ingredients

**What**: Ingredients extracted from Group 1 foods
**Purpose**: Used for cooking and seasoning

**Examples**:
- Vegetable oils (olive, sunflower)
- Butter
- Sugar and honey
- Salt
- Flour
- Vinegar

## Group 3: Processed Foods

**What**: Group 1 foods with Group 2 ingredients added
**Purpose**: Preservation, enhance flavor

**Examples**:
- Canned vegetables
- Cheese
- Simple breads
- Salted/cured meats
- Canned fish
- Dried fruits with sugar

## Group 4: Ultra-Processed Foods

**What**: Industrial formulations with little whole food
**Characteristics**: Long ingredient lists, additives, designed for convenience

**Examples**:
- Soft drinks
- Packaged snacks (chips, cookies)
- Instant noodles
- Frozen pizzas
- Hot dogs, chicken nuggets
- Ice cream
- Breakfast cereals (most)
- Packaged bread
- Energy bars

## Health Implications

| Group | Recommendation |
|-------|----------------|
| **1** | Base your diet on these |
| **2** | Use for cooking Group 1 foods |
| **3** | Consume in moderation |
| **4** | Limit consumption |

## Why Limit Ultra-Processed Foods?

- Often high in sugar, salt, unhealthy fats
- Low in fiber and nutrients
- Associated with obesity, heart disease, diabetes
- Designed to be over-consumed

---

**Tip**: Use \`getAdditivesInfo\` to see the NOVA group of any product!
`;
}