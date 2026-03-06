/** A single field descriptor returned by the Strapi Content-Type Builder API */
export interface StrapiAttribute {
  type: string;
  components?: string[];  // dynamiczone → list of component UIDs
  component?: string;     // component field → component UID
  repeatable?: boolean;
}

/** Response from GET /api/content-type-builder/content-types/{uid} */
export interface CollectionSchemaResponse {
  data: {
    schema: {
      // In Strapi v5 pluralName sits directly on schema (e.g. "index-pages")
      pluralName: string;
      attributes: Record<string, StrapiAttribute>;
    };
  };
}

/** Response from GET /api/content-type-builder/components/{uid} */
export interface ComponentSchemaResponse {
  data: {
    schema: { attributes: Record<string, StrapiAttribute> };
  };
}

/** Derived from the live schema: REST endpoint + fully-built populate query */
export interface QueryConfig {
  apiPath: string;   // e.g. /api/index-pages
  populate: string;  // e.g. populate[dz_header][on][banner.banner][populate]=*&...
}
