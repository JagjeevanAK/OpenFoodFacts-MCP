export async function processTaxonomy(taxonomyId: string): Promise<{
  formattedContent: string;
  taxonomyId: string;
  filepath: string;
} | null> {
  if (taxonomyId === 'categories') {
    return {
      formattedContent: `This taxonomy is available as a static resource at openfoodfacts://taxonomy/categories\n\nFor full taxonomy data, please visit:\nhttps://github.com/openfoodfacts/openfoodfacts-server/tree/main/taxonomies`,
      taxonomyId,
      filepath: 'static/categories'
    };
  }
  
  return null;
}