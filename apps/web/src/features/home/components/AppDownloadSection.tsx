"use client";
/**
 * App download CTA — sits directly under the hero (below the stats strip that
 * overlaps it) so visitors landing on the site are offered the mobile app
 * before they scroll into the listings.
 *
 * Desktop: copy, a large QR card and the whole 3D app render.
 * Mobile: one centred column — copy, the render cropped at the bottom, then a
 * Google Play button. The QR is dropped because a phone cannot scan its own
 * screen.
 *
 * The mockups and the QR codes are locale-specific static assets built by
 * scripts/make-download-assets.mjs from the renders in apps/mobile/assets/images
 * (app-photo-ar.png, and app-photo.png for English).
 */
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/config/navigation";
import { PLAY_STORE_URL } from "@/config/site";

export function AppDownloadSection() {
  const t = useTranslations("home");
  const locale = useLocale() === "ar" ? "ar" : "en";

  return (
    // Deliberately no z-index: one here would out-paint the hero search
    // dropdown (z-50), which can expand down past the stats strip into this
    // section. `relative` alone keeps this below it.
    // No overflow-hidden: the phone's drop shadow extends past the bottom
    // padding and would be cut off in a hard line.
    <section className="relative pt-14 lg:pt-20 pb-0 lg:pb-14">
      {/* px-30 is a desktop gutter; on a ~400px phone it would leave barely
          half the screen for content, so small screens keep the site's px-4. */}
      <div className="container mx-auto px-4 lg:px-4">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="w-full lg:flex-1 text-center lg:text-start"
          >
            <h2 className="text-[1.4rem] sm:text-3xl lg:text-[2.5rem] font-bold leading-snug text-foreground/90 mb-2 lg:mb-4 max-w-md sm:max-w-xl lg:max-w-2xl mx-auto lg:mx-0">
              {t("appTitle")}
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
              {t("appSubtitle")}
            </p>

            <Link
              href="/download"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline lg:text-base"
            >
              {t("appLearnMore")}
              <ArrowLeft className="size-4 rtl:rotate-180" />
            </Link>
          </motion.div>

          <div className="flex items-center gap-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex flex-col items-center gap-3 bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
            >
              <Image
                src={`/app-download/qr-${locale}.svg`}
                alt={t("appQrHint")}
                width={176}
                height={176}
                className="size-44"
                unoptimized
              />
              <span className="text-sm text-neutral-600">{t("appQrHint")}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              aria-hidden="true"
            >
              <AppMockup locale={locale} />
            </motion.div>
          </div>

          {/* Below lg only — a phone cannot scan its own screen, so the QR
              gives way to the store badge. Drawn to match Google's official
              "GET IT ON Google Play" badge, which stays English and LTR in
              every locale. */}
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("appGooglePlay")}
            dir="ltr"
            // Same width as the phone above it at each breakpoint (w-52 / sm:w-60)
            // so the badge and the mockup read as one column.
            className="lg:hidden flex h-16 w-52 sm:w-60 items-center justify-center gap-3 rounded-xl border border-[#a6a6a6] bg-black px-4 text-white transition-transform active:scale-[0.97]"
          >
            <GooglePlayGlyph className="size-8 shrink-0" />
            <span className="flex flex-col items-start font-sans leading-none">
              <span className="text-[0.68rem] font-medium tracking-wider">
                GET IT ON
              </span>
              <span className="mt-1 text-[1.45rem] font-medium tracking-[-0.01em]">
                Google Play
              </span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

/**
 * 3D Android render of the app for the current locale (transparent webp).
 * Shown whole on large screens; below lg it is cropped at the bottom so the
 * handset stays compact in a single-column layout. The Arabic and English
 * renders tilt in opposite directions, so the screen faces the copy in both
 * reading directions.
 */
function AppMockup({ locale }: { locale: "ar" | "en" }) {
  const width = 640;
  const height = locale === "ar" ? 1151 : 1198;

  return (
    // Both aspect ratios come from each render's own size, so the mobile crop
    // lands at the same point on the phone in both locales. overflow-hidden
    // does the cropping (and stops the aspect-ratio box from growing to fit the
    // taller image), so it is only applied while a crop is actually in effect —
    // otherwise it would also clip the phone's drop shadow.
    <div
      className={`w-52 sm:w-60 lg:w-64 xl:w-72 aspect-(--mockup-cropped) lg:aspect-(--mockup-full) lg:overflow-visible ${
        MOBILE_VISIBLE_FRACTION < 1 ? "overflow-hidden" : ""
      }`}
      style={
        {
          "--mockup-cropped": `${width} / ${height * MOBILE_VISIBLE_FRACTION}`,
          "--mockup-full": `${width} / ${height}`,
        } as React.CSSProperties
      }
    >
      {/* Plain <img>, not next/image: the webp is already sized and compressed
          by scripts/make-download-assets.mjs, so routing it through Vercel's
          image optimizer would only spend optimization quota. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/app-download/app-mockup-${locale}.webp`}
        alt=""
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        // drop-shadow (not box-shadow) follows the render's alpha, so the
        // shadow takes the tilted phone's outline rather than the image box.
        className="w-full h-auto filter-[drop-shadow(0_22px_28px_rgba(15,23,42,0.22))_drop-shadow(0_6px_10px_rgba(15,23,42,0.12))]"
      />
    </div>
  );
}

/** Below lg: share of the phone left visible above the crop (1 = whole phone). */
const MOBILE_VISIBLE_FRACTION = 1;

/** Google Play mark — inlined so the button needs no remote asset. */
function GooglePlayGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} role="presentation">
      <path
        fill="#00D9FF"
        d="M3.6 1.8a1.5 1.5 0 0 0-.5 1.14v18.12c0 .46.19.87.5 1.14l.1.08L13.8 12.1v-.2L3.7 1.72l-.1.08Z"
      />
      <path
        fill="#FFCE00"
        d="m17.2 15.5-3.4-3.4v-.2l3.4-3.4.08.04 4.02 2.29c1.15.65 1.15 1.72 0 2.38l-4.02 2.28-.08.05Z"
      />
      <path
        fill="#FF3A44"
        d="m17.28 15.46-3.48-3.48-10.2 10.2c.38.4 1 .45 1.71.05l11.97-6.77Z"
      />
      <path
        fill="#00F076"
        d="M17.28 8.5 5.31 1.74C4.6 1.34 3.98 1.39 3.6 1.8l10.2 10.18 3.48-3.48Z"
      />
    </svg>
  );
}
