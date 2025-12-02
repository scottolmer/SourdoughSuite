// Subdomain detection and routing utilities
export function getSubdomain(): string {
  if (typeof window === 'undefined') return 'app';
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  // For local development, check for localhost variations
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for query parameter for testing: ?subdomain=store
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('subdomain') || 'app';
  }
  
  // For production domains like store.bakehousebreads.com
  if (parts.length > 2) {
    return parts[0];
  }
  
  return 'app';
}

export function isStoreSubdomain(): boolean {
  return getSubdomain() === 'store';
}

export function isBlogSubdomain(): boolean {
  return getSubdomain() === 'blog';
}

export function isAppSubdomain(): boolean {
  const subdomain = getSubdomain();
  return subdomain === 'app' || subdomain === 'www' || subdomain === '';
}

// Get the correct API endpoint based on subdomain
export function getApiEndpoint(path: string): string {
  const subdomain = getSubdomain();
  
  if (subdomain === 'store') {
    return `/api/store${path}`;
  } else if (subdomain === 'blog') {
    return `/api/blog${path}`;
  }
  
  return `/api${path}`;
}

// Redirect to appropriate subdomain
export function redirectToSubdomain(targetSubdomain: string, path: string = '') {
  if (typeof window === 'undefined') return;
  
  const currentSubdomain = getSubdomain();
  if (currentSubdomain === targetSubdomain) return;
  
  const hostname = window.location.hostname;
  
  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const url = new URL(window.location.href);
    url.searchParams.set('subdomain', targetSubdomain);
    if (path) {
      url.pathname = path;
    }
    window.location.href = url.toString();
    return;
  }
  
  // For production
  const baseDomain = hostname.includes('.') ? hostname.split('.').slice(-2).join('.') : hostname;
  const newUrl = `https://${targetSubdomain}.${baseDomain}${path}`;
  window.location.href = newUrl;
}