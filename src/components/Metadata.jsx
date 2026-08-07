// src/components/Metadata.jsx
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getRouteMetadata, resolvePageKey } from "@/lib/metadata";

/**
 * Universal metadata component for all pages.
 * Pass userRole prop to get role-specific metadata.
 */
export default function Metadata({ page, overrides = {}, userRole = null }) {
  const pathname = usePathname();
  
  // Use provided role or null
  const role = userRole || null;
  
  const routeKey = page || resolvePageKey(pathname, role);
  const meta = getRouteMetadata(pathname, role, {
    ...overrides,
    title: overrides.title,
    description: overrides.description,
  });

  // Debug log - remove in production
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 Metadata Debug:', {
      pathname,
      routeKey,
      role,
      title: meta.title,
      description: meta.description,
    });
  }

  useEffect(() => {
    if (typeof document === "undefined") return;

    document.title = meta.title;

    const setMetaTag = (attribute, value, content) => {
      let tag = document.head.querySelector(`meta[${attribute}="${value}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attribute, value);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    setMetaTag("name", "description", meta.description);
    if (meta.keywords) {
      setMetaTag("name", "keywords", meta.keywords);
    }

    setMetaTag("property", "og:type", meta.type || "website");
    setMetaTag("property", "og:url", meta.openGraph.url);
    setMetaTag("property", "og:title", meta.title);
    setMetaTag("property", "og:description", meta.description);
    setMetaTag("property", "og:image", meta.openGraph.images[0].url);
    setMetaTag("property", "og:site_name", meta.openGraph.siteName);

    setMetaTag("name", "twitter:card", "summary_large_image");
    setMetaTag("name", "twitter:title", meta.title);
    setMetaTag("name", "twitter:description", meta.description);
    setMetaTag("name", "twitter:image", meta.twitter.images[0]);

    const robotsTag = document.head.querySelector('meta[name="robots"]');
    if (robotsTag) {
      robotsTag.setAttribute(
        "content",
        meta.noIndex ? "noindex, nofollow" : "index, follow",
      );
    } else {
      const tag = document.createElement("meta");
      tag.setAttribute("name", "robots");
      tag.setAttribute(
        "content",
        meta.noIndex ? "noindex, nofollow" : "index, follow",
      );
      document.head.appendChild(tag);
    }

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", meta.openGraph.url);
  }, [meta, pathname, routeKey]);

  return null;
}