'use client';

import Script from 'next/script';

interface GoogleAnalyticsProps {
  measurementId: string;
}

/**
 * Google Analytics component using gtag.js
 * Uses Next.js Script component for optimal loading performance
 */
const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  if (!measurementId) {
    return null;
  }

  return (
    <>
      {/* Load gtag.js script */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />

      {/* Initialize gtag */}
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}');
        `}
      </Script>
    </>
  );
};

export default GoogleAnalytics;
