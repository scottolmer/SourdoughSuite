import React, { useState, useEffect } from 'react';
import { 
  generateSrcSet, 
  generateSizes, 
  getProgressiveLoadingClasses 
} from '@/utils/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  progressive?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * OptimizedImage component for better performance and user experience
 * 
 * Features:
 * - Responsive image loading with srcset and sizes
 * - Lazy loading with progressive enhancement
 * - Blur-up loading effect
 * - Proper accessibility attributes
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes,
  loading = 'lazy',
  priority = false,
  progressive = true,
  objectFit = 'cover',
  quality = 80,
  onLoad,
  onError,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  // Extension detection (default to jpg)
  const extension = src?.split('.')?.pop() || 'jpg';
  
  // For now, just use the source directly for static images
  // We'll implement proper srcset generation in the future
  const srcSet = src.startsWith('/images') ? undefined : generateSrcSet(src, extension);
  
  // Default sizes if not provided
  const imageSizes = sizes || generateSizes('100vw', [
    { '768px': '50vw' },
    { '1024px': '33vw' },
  ]);
  
  // Get classes for progressive loading effect
  const { wrapperClass, imgClass, loadedClass } = getProgressiveLoadingClasses();
  
  // Combine classes based on loading state
  const imageClasses = [
    className,
    progressive ? imgClass : '',
    isLoaded && progressive ? loadedClass : '',
    `object-${objectFit}`,
  ].filter(Boolean).join(' ');
  
  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  // Handle image error
  const handleError = () => {
    setError(true);
    onError?.();
  };
  
  // Reset state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setError(false);
  }, [src]);
  
  if (error) {
    return (
      <div 
        className={`bg-muted/30 flex items-center justify-center ${className}`}
        style={{ width, height }}
        role="img"
        aria-label={alt}
      >
        <span className="text-sm text-muted-foreground">Failed to load image</span>
      </div>
    );
  }
  
  const imageElement = (
    <img
      src={src}
      srcSet={srcSet}
      sizes={imageSizes}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      onLoad={handleLoad}
      onError={handleError}
      className={imageClasses}
    />
  );
  
  // Apply progressive loading wrapper if needed
  if (progressive) {
    return (
      <div className={wrapperClass} style={{ width, height }}>
        {imageElement}
      </div>
    );
  }
  
  return imageElement;
};