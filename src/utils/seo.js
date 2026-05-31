import { useEffect } from "react";

const DEFAULT_TITLE =
  "কৃষিঘর - বাংলাদেশের সেরা কৃষি ও কৃষিপণ্য প্ল্যাটফর্ম";
const DEFAULT_DESCRIPTION =
  "কৃষিঘর বাংলাদেশের শীর্ষ কৃষি ডিজিটাল প্ল্যাটফর্ম। কৃষক, পাইকার ও ক্রেতাদের জন্য বিশ্বাসযোগ্য কৃষি মার্কেটপ্লেস।";
const SITE_URL = "https://krishighar.com";
const DEFAULT_IMAGE = `${SITE_URL}/photos/consumer/banner/cover.jpg`;

const upsertMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertLink = (selector, attributes) => {
  let element = document.head.querySelector(selector);

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
};

const upsertJsonLd = (id, schema) => {
  let element = document.head.querySelector(`#${id}`);

  if (!element) {
    element = document.createElement("script");
    element.type = "application/ld+json";
    element.id = id;
    document.head.appendChild(element);
  }

  element.textContent = JSON.stringify(schema);
};

const buildAbsoluteUrl = (path = "") => {
  if (!path) return SITE_URL;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

export const usePageSeo = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  keywords,
  path = "",
  image = DEFAULT_IMAGE,
  robots = "index, follow",
  schema,
} = {}) => {
  useEffect(() => {
    const canonical = buildAbsoluteUrl(path || window.location.pathname + window.location.search);
    const resolvedImage = buildAbsoluteUrl(image);

    document.title = title;
    document.documentElement.lang = "bn";

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: description,
    });
    upsertMeta('meta[name="robots"]', { name: "robots", content: robots });
    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: title,
    });
    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: description,
    });
    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: canonical,
    });
    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: resolvedImage,
    });
    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: title,
    });
    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: description,
    });
    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: resolvedImage,
    });

    if (keywords) {
      upsertMeta('meta[name="keywords"]', {
        name: "keywords",
        content: keywords,
      });
    }

    upsertLink('link[rel="canonical"]', {
      rel: "canonical",
      href: canonical,
    });

    if (schema) {
      upsertJsonLd("page-seo-schema", schema);
    }
  }, [description, image, keywords, path, robots, schema, title]);
};

export const seoSiteUrl = SITE_URL;
export const seoDefaultImage = DEFAULT_IMAGE;
export const toAbsoluteSeoUrl = buildAbsoluteUrl;
