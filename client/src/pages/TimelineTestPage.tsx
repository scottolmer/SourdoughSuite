import React, { useEffect } from 'react';
import { MobileLayout } from '@/components/mobile-layout';
import TimelineIntegrationTest from '@/components/tests/TimelineIntegrationTest';
import { SEO } from '@/components/SEO';
import { generateWebpageSEO } from '@/lib/schema';
import { trackEvent } from '@/lib/analytics';

export default function TimelineTestPage() {
  // Track page view when component mounts
  useEffect(() => {
    trackEvent('page_view', 'testing', 'timeline_test_page');
  }, []);
  
  // Generate SEO data
  const seoData = generateWebpageSEO({
    title: 'Timeline Integration Test | Bakehouse Breads',
    description: 'Test the baking timeline integration feature',
    canonicalUrl: '/timeline-test',
    type: 'website',
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: 'Tools', url: '/tools' },
      { name: 'Timeline Test', url: '/timeline-test' }
    ]
  });
  
  return (
    <>
      <SEO 
        title="Timeline Integration Test | Bakehouse Breads"
        description="Test the baking timeline integration feature"
        canonicalUrl="/timeline-test"
        structuredData={seoData}
      />
      <MobileLayout 
        title="Timeline Test" 
        showBackButton
      >
        <TimelineIntegrationTest />
      </MobileLayout>
    </>
  );
}