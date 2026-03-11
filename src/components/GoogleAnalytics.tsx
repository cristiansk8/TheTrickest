'use client';

import Script from 'next/script';
import { useEffect } from 'react';

// Extend Window interface to include gtag and dataLayer
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics component using gtag.js
 * Uses Next.js Script component for optimal loading performance
 */
const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  useEffect(() => {
    console.log('🔍 [GA DEBUG] Component mounted');
    console.log('🔍 [GA DEBUG] Measurement ID:', measurementId);
    console.log('🔍 [GA DEBUG] Process env check:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  }, [measurementId]);

  if (!measurementId) {
    if (typeof window !== 'undefined') {
      console.warn('❌ [GA ERROR] No measurement ID provided');
      console.warn('❌ [GA ERROR] NEXT_PUBLIC_GA_MEASUREMENT_ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
    }
    return null;
  }

  if (typeof window !== 'undefined') {
    console.log('✅ [GA INFO] Initializing with ID:', measurementId);
    console.log('✅ [GA INFO] Current URL:', window.location.href);
  }

  return (
    <>
      {/* Load gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
        onLoad={() => {
          console.log('✅ [GA SUCCESS] gtag.js script loaded');
          setTimeout(() => {
            console.log('📊 [GA CHECK] gtag function exists:', typeof window.gtag === 'function');
            console.log('📊 [GA CHECK] dataLayer:', window.dataLayer);
            console.log('📊 [GA CHECK] dataLayer length:', window.dataLayer?.length || 0);
          }, 500);
        }}
        onError={(e) => {
          console.error('❌ [GA ERROR] Failed to load gtag.js:', e);
        }}
      />

      {/* Initialize gtag */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          (function() {
            console.log('🚀 [GA INIT] Setting up dataLayer and gtag');
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;

            console.log('⏰ [GA INIT] Configuring GA with ID: ${measurementId}');
            gtag('js', new Date());
            gtag('config', '${measurementId}', {
              debug_mode: true,
              send_page_view: true
            });

            console.log('✅ [GA INIT] Configuration complete');
            console.log('📊 [GA DATA] dataLayer after config:', window.dataLayer);
            console.log('🔗 [GA URL] Page URL:', window.location.href);
          })();
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
