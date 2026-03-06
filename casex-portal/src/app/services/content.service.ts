import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, forkJoin } from 'rxjs';
import { map, tap, switchMap, shareReplay } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { environment } from '../../environments/environment';
import { DynamicBlock, PageData } from '../models/strapi.models';
import {
  CollectionSchemaResponse,
  ComponentSchemaResponse,
  QueryConfig,
  StrapiAttribute,
} from '../models/strapi-schema.types';

export type { StrapiMedia, DynamicBlock, PageData } from '../models/strapi.models';

// ── Helper ─────────────────────────────────────────────────────────────────

/**
 * Scans a raw Strapi page object and collects every field that is a
 * dynamic zone (array whose items each carry a __component string).
 */
function extractZones(raw: Record<string, unknown>): Record<string, DynamicBlock[]> {
  const zones: Record<string, DynamicBlock[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value) && value.length > 0 && typeof value[0]?.__component === 'string') {
      zones[key] = value as DynamicBlock[];
    }
  }
  return zones;
}

// ── Service ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.strapiUrl;
  private adminToken = environment.strapiAdminToken;

  /** Per-process cache: collectionUid → QueryConfig observable */
  private queryConfigCache = new Map<string, Observable<QueryConfig>>();

  // ── Schema API calls ────────────────────────────────────────────────────

  private get authHeaders() {
    return { Authorization: `Bearer ${this.adminToken}` };
  }

  private fetchCollectionSchema(uid: string): Observable<CollectionSchemaResponse> {
    return this.http.get<CollectionSchemaResponse>(
      `${this.baseUrl}/api/content-type-builder/content-types/${uid}`,
      { headers: this.authHeaders }
    );
  }

  private fetchComponentSchema(uid: string): Observable<ComponentSchemaResponse> {
    return this.http.get<ComponentSchemaResponse>(
      `${this.baseUrl}/api/content-type-builder/components/${uid}`,
      { headers: this.authHeaders }
    );
  }

  // ── BFS component schema loader ─────────────────────────────────────────

  /**
   * Fetches all component schemas reachable from `initialUids` via BFS.
   * Discovers nested component UIDs in each fetched schema and queues them.
   * Returns a Map of uid → schema for every component in the graph.
   */
  private fetchAllComponentSchemas(
    initialUids: string[]
  ): Observable<Map<string, ComponentSchemaResponse>> {
    const allSchemas = new Map<string, ComponentSchemaResponse>();

    const fetchBatch = (uids: string[]): Observable<Map<string, ComponentSchemaResponse>> => {
      const toFetch = uids.filter((uid) => !allSchemas.has(uid));
      if (toFetch.length === 0) return of(allSchemas);

      return forkJoin(
        Object.fromEntries(toFetch.map((uid) => [uid, this.fetchComponentSchema(uid)]))
      ).pipe(
        switchMap((batch) => {
          for (const [uid, schema] of Object.entries(batch)) {
            allSchemas.set(uid, schema as ComponentSchemaResponse);
          }

          // Queue any nested component UIDs found inside the fetched schemas
          const nextUids: string[] = [];
          for (const schema of Object.values(batch) as ComponentSchemaResponse[]) {
            for (const attr of Object.values(schema.data.schema.attributes)) {
              if (attr.type === 'component' && attr.component && !allSchemas.has(attr.component)) {
                nextUids.push(attr.component);
              }
            }
          }

          return fetchBatch(nextUids);
        })
      );
    };

    return fetchBatch(initialUids);
  }

  // ── Populate query builder ──────────────────────────────────────────────

  /**
   * Recursively builds populate params for a component's attributes.
   *
   * Rules:
   *  - component field  → recurse with prefix[populate][fieldName]
   *  - relation field   → add prefix[populate][fieldName][populate]=*
   *  - media / scalars  → handled by leaf fallback
   *  - no params added  → add prefix[populate]=* (leaf: media & plain scalars)
   *
   * `visited` prevents infinite loops on circular component references.
   */
  private buildComponentParams(
    attributes: Record<string, StrapiAttribute>,
    prefix: string,
    allSchemas: Map<string, ComponentSchemaResponse>,
    visited: Set<string>
  ): string[] {
    const params: string[] = [];

    for (const [fieldName, attr] of Object.entries(attributes)) {
      if (attr.type === 'component' && attr.component && !visited.has(attr.component)) {
        const compSchema = allSchemas.get(attr.component);
        if (compSchema) {
          const newVisited = new Set(visited);
          newVisited.add(attr.component);
          params.push(
            ...this.buildComponentParams(
              compSchema.data.schema.attributes,
              `${prefix}[populate][${fieldName}]`,
              allSchemas,
              newVisited
            )
          );
        }
      } else if (attr.type === 'relation') {
        params.push(`${prefix}[populate][${fieldName}][populate]=*`);
      }
    }

    // Leaf node: no component/relation fields → wildcard populate covers media & scalars
    if (params.length === 0) {
      params.push(`${prefix}[populate]=*`);
    }

    return params;
  }

  /**
   * Builds the full list of populate params for all dynamic zones in a collection.
   */
  private buildZoneParams(
    collectionAttrs: Record<string, StrapiAttribute>,
    allSchemas: Map<string, ComponentSchemaResponse>
  ): string[] {
    const params: string[] = [];

    for (const [fieldName, attr] of Object.entries(collectionAttrs)) {
      if (attr.type === 'dynamiczone' && attr.components) {
        for (const compUid of attr.components) {
          const compSchema = allSchemas.get(compUid);
          if (compSchema) {
            params.push(
              ...this.buildComponentParams(
                compSchema.data.schema.attributes,
                `populate[${fieldName}][on][${compUid}]`,
                allSchemas,
                new Set([compUid])
              )
            );
          }
        }
      }
    }

    return params;
  }

  // ── Query config orchestrator ───────────────────────────────────────────

  /**
   * Generates the full QueryConfig for a collection:
   *  1. Fetch collection schema → pluralName + attributes
   *  2. BFS-fetch all component schemas referenced in dynamic zones
   *  3. Recursively build populate query
   *  4. Return { apiPath, populate }
   *
   * Cached per collectionUid for the lifetime of this service instance.
   */
  private buildQueryConfig(collectionUid: string): Observable<QueryConfig> {
    if (this.queryConfigCache.has(collectionUid)) {
      return this.queryConfigCache.get(collectionUid)!;
    }

    const obs$ = this.fetchCollectionSchema(collectionUid).pipe(
      switchMap((collectionSchema) => {
        const { pluralName } = collectionSchema.data.schema;
        const attrs = collectionSchema.data.schema.attributes;

        const initialUids = [
          ...new Set(
            Object.values(attrs)
              .filter((a) => a.type === 'dynamiczone' && a.components)
              .flatMap((a) => a.components!)
          ),
        ];

        if (initialUids.length === 0) {
          return of<QueryConfig>({ apiPath: `/api/${pluralName}`, populate: '' });
        }

        return this.fetchAllComponentSchemas(initialUids).pipe(
          map((allSchemas) => ({
            apiPath: `/api/${pluralName}`,
            populate: this.buildZoneParams(attrs, allSchemas).join('&'),
          }))
        );
      }),
      shareReplay(1)
    );

    this.queryConfigCache.set(collectionUid, obs$);
    return obs$;
  }

  // ── Generic page fetcher ────────────────────────────────────────────────

  /**
   * Fetches a page for any Strapi collection.
   * Derives the REST endpoint and populate query from the live schema.
   * Handles TransferState for SSR → browser hydration.
   */
  private fetchPageData(collectionUid: string, cacheKey: string): Observable<PageData> {
    const key = makeStateKey<PageData>(cacheKey);

    if (this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(cached);
    }

    return this.buildQueryConfig(collectionUid).pipe(
      switchMap(({ apiPath, populate }) =>
        this.http.get<{ data: Record<string, unknown>[] }>(
          `${this.baseUrl}${apiPath}${populate ? '?' + populate : ''}`
        )
      ),
      map((res) => {
        const raw = res.data[0];
        return {
          id: raw['id'],
          documentId: raw['documentId'],
          Title: raw['Title'],
          zones: extractZones(raw),
        } as PageData;
      }),
      tap((data) => {
        if (isPlatformServer(this.platformId)) {
          this.transferState.set(key, data);
        }
      })
    );
  }

  // ── Public API ──────────────────────────────────────────────────────────

  getPage(_documentId: string): Observable<PageData> {
    return this.fetchPageData('api::demo-home-page.demo-home-page', 'demo-home-page');
  }

  getIndexPage(): Observable<PageData> {
    return this.fetchPageData('api::index-page.index-page', 'index-page');
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url}`;
  }
}
