/**
 * Meta (Facebook) Pixel — the base snippet, in one place.
 *
 * No route-change hook here on purpose. fbevents.js patches history.pushState
 * itself (`fbq.disablePushState` is falsy), so it already sends a PageView for
 * every in-app navigation; firing one from a route effect as well would double
 * every PageView. Verified against production: a landing hit and a client-side
 * navigation each produced exactly one /tr?ev=PageView beacon.
 *
 * afterInteractive, not beforeInteractive: this renders inside the [locale]
 * layout, which re-renders on the client when the language changes, and
 * beforeInteractive would be emitted there as a literal <script> element —
 * something React 19 rejects.
 */
import Script from 'next/script';

export const META_PIXEL_ID = '2612465362522284';

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
