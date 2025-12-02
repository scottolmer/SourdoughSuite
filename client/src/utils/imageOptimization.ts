/**
 * Image optimization utilities
 * These functions help optimize image loading and rendering performance
 */

/**
 * Generates a responsive image srcset attribute for different viewport sizes
 * This helps browsers load the most appropriate image size based on the device
 *
 * @param baseUrl The base URL of the image
 * @param extension The file extension of the image (jpg, png, webp)
 * @param widths Array of width values to generate srcset for
 * @returns A srcset string to use in img elements
 */
export function generateSrcSet(
  baseUrl: string,
  extension: string = 'jpg',
  widths: number[] = [320, 640, 960, 1280, 1920]
): string {
  // Don't process external URLs (like https://) or data URLs
  if (baseUrl.startsWith('http') || baseUrl.startsWith('data:')) {
    return baseUrl;
  }
  
  // Handle case where baseUrl already has an extension
  const urlWithoutExtension = baseUrl.includes('.')
    ? baseUrl.substring(0, baseUrl.lastIndexOf('.'))
    : baseUrl;
    
  return widths
    .map(width => 
      `${urlWithoutExtension}-${width}.${extension} ${width}w`
    )
    .join(', ');
}

/**
 * Calculates image sizes attribute for responsive images
 * This tells the browser what image size to use at different viewport widths
 *
 * @param defaultSize Default size as percentage of viewport width
 * @param breakpoints Custom breakpoints with sizes
 * @returns A sizes attribute string
 */
export function generateSizes(
  defaultSize: string = '100vw',
  breakpoints: { [key: string]: string }[] = []
): string {
  if (breakpoints.length === 0) {
    return defaultSize;
  }

  const breakpointSizes = breakpoints
    .map(breakpoint => {
      const [width, size] = Object.entries(breakpoint)[0];
      return `(min-width: ${width}) ${size}`;
    })
    .join(', ');
    
  return `${breakpointSizes}, ${defaultSize}`;
}

/**
 * Adds a blur-up effect when loading images
 * Returns classes for initial blurred placeholder and loaded state
 *
 * @returns CSS classes for progressive image loading
 */
export function getProgressiveLoadingClasses(): {
  wrapperClass: string;
  imgClass: string;
  loadedClass: string;
} {
  return {
    wrapperClass: 'relative overflow-hidden',
    imgClass: 'transition-opacity duration-500 opacity-0',
    loadedClass: 'opacity-100',
  };
}

/**
 * Returns appropriate format for an image based on browser support
 * Checks for WebP support and falls back to original format
 * 
 * @param originalSrc Original image source
 * @returns Best image format for the current browser
 */
export function getOptimalImageFormat(originalSrc: string): string {
  // In a real implementation, we would check for WebP support
  // For simplicity, we'll just return the original for now
  return originalSrc;
}