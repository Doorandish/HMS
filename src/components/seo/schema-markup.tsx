import React from 'react';

export function SchemaMarkup({ tenant }: { tenant: any }) {
  if (!tenant) return null;

  const schema = {
    "@context": "https://schema.org",
    "@type": "Hotel",
    "name": tenant.name,
    "description": tenant.brandingConfig?.heroSubtitle || `Welcome to ${tenant.name}`,
    "url": `https://${tenant.customDomain || `${tenant.subdomain}.hms.app`}`,
    "telephone": tenant.phone,
    "email": tenant.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": tenant.address,
      "addressLocality": tenant.city,
      "postalCode": tenant.postalCode,
      "addressCountry": tenant.country
    },
    "image": tenant.brandingConfig?.heroImage || "https://images.unsplash.com/photo-1566073771259-6a8506099945"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
