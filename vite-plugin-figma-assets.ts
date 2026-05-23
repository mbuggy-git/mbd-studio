import { Plugin } from 'vite';

/**
 * Vite plugin to handle figma:asset imports for local development
 * In production/Figma Make, these are resolved by the Figma runtime
 * For local dev, we return a placeholder data URL
 */
export function figmaAssetsPlugin(): Plugin {
  const FIGMA_ASSET_PREFIX = 'figma:asset/';

  // Simple 1x1 transparent PNG as placeholder
  const PLACEHOLDER_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  return {
    name: 'vite-plugin-figma-assets',
    enforce: 'pre',

    resolveId(id) {
      if (id.startsWith(FIGMA_ASSET_PREFIX)) {
        // Return a virtual module ID
        return '\0' + id;
      }
      return null;
    },

    load(id) {
      if (id.startsWith('\0' + FIGMA_ASSET_PREFIX)) {
        // Return the placeholder as the default export
        return `export default "${PLACEHOLDER_IMAGE}";`;
      }
      return null;
    }
  };
}
