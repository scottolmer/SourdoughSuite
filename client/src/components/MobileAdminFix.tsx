import React, { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * This component applies aggressive mobile fixes to the admin page
 * It injects CSS styles directly into the document head when on admin pages
 */
export default function MobileAdminFix() {
  const [location] = useLocation();
  
  useEffect(() => {
    // Only apply fixes when on admin pages
    if (location.startsWith('/admin')) {
      // Create style element
      const styleElement = document.createElement('style');
      styleElement.id = 'mobile-admin-fix';
      
      // Add aggressive mobile fixes
      styleElement.textContent = `
        /* Force everything to be contained */
        * {
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Prevent horizontal scrolling */
        body,
        html,
        #root,
        #root > div {
          overflow-x: hidden !important;
          width: 100% !important;
          max-width: 100vw !important;
        }
        
        /* Force containment on admin components */
        .admin-content,
        .card,
        textarea,
        pre,
        code,
        .overflow-visible,
        .overflow-x-auto,
        [role="tablist"],
        [role="tabpanel"],
        .tabs-content {
          max-width: 100% !important;
          overflow-x: hidden !important;
          word-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        
        /* Text content wrapping */
        textarea,
        pre,
        code {
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          font-size: 12px !important;
        }
        
        /* Admin page layout */
        .admin-content {
          width: 92vw !important;
          padding-left: 0 !important;
          padding-right: 0 !important;
          margin-left: auto !important;
          margin-right: auto !important;
        }
        
        /* Recipe import fixes */
        #json-content {
          width: 95% !important;
          font-size: 12px !important;
        }
        
        /* Card layout fixes */
        .card {
          padding: 10px !important;
          width: 100% !important;
        }
        
        /* Navigation tabs fixes */
        .overflow-x-auto {
          overflow-x: auto !important;
        }
        
        /* Fix the TabsList specifically */
        [role="tablist"] {
          display: flex !important;
          flex-wrap: wrap !important;
          overflow-x: hidden !important;
          max-width: 90vw !important;
        }
        
        /* Make tab triggers smaller and wrapped */
        [role="tab"] {
          padding: 5px !important;
          font-size: 11px !important;
          flex: 0 0 auto !important;
          white-space: normal !important;
          max-width: fit-content !important;
        }
        
        /* Force all components to be contained */
        div[class*="max-w-"] {
          max-width: 100% !important;
        }
      `;
      
      // Add to document
      document.head.appendChild(styleElement);
      
      // Cleanup on unmount
      return () => {
        const existingStyle = document.getElementById('mobile-admin-fix');
        if (existingStyle) {
          document.head.removeChild(existingStyle);
        }
      };
    }
  }, [location]);
  
  // This component doesn't render anything visual
  return null;
}