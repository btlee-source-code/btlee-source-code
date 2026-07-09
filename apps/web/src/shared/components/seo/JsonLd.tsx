/**
 * Renders a schema.org JSON-LD block. Use inside Server Components so the markup
 * ships in the initial HTML for crawlers. JSON-LD is data (type
 * application/ld+json), never executed in the browser.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe; escape `<` to avoid breaking out of the tag.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}
