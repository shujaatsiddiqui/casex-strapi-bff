import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { environment } from '../../environments/environment';

export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText: string | null;
  url: string;
  width: number;
  height: number;
  formats?: {
    large?: { url: string; width: number; height: number };
    medium?: { url: string; width: number; height: number };
    small?: { url: string; width: number; height: number };
    thumbnail?: { url: string; width: number; height: number };
  };
}

export interface DynamicBlock {
  __component: string;
  id: number;
  // menu.menu
  Active?: boolean;
  Path?: string;
  Name?: string;
  SubMenu?: DynamicBlock[];
  // banner.banner
  MainHeading?: string;
  Caption?: string;
  Description?: string;
  RegisterButtonName?: string;
  FileFormButtonName?: string;
  FileFormButtonLink?: string;
  Banner?: StrapiMedia;
  // gallery.gallery
  media_gallery?: StrapiMedia[];
  // footer.footer
  footerText?: string;
  // sections.hero-banner (legacy)
  ButtonLabelBeforeLogin?: string;
  // sections.image-gallery / sections.rich-text (legacy)
  Title?: string;
  Images?: StrapiMedia[];
  Content?: any[];
  [key: string]: any;
}

export interface PageData {
  id: number;
  documentId: string;
  Title: string;
  dz_header?: DynamicBlock[];
  dz_body?: DynamicBlock[];
  dz_footer?: DynamicBlock[];
  /** @deprecated use dz_header / dz_body / dz_footer */
  dz_section?: DynamicBlock[];
}

/**
 * Populate query for all 3 named zones.
 * When you add a new Strapi component, add its populate entry here:
 *   'populate[dz_body][on][sections.testimonial][populate]=*'
 */
const DEMO_HOME_POPULATE = [
  // Header zone
  'populate[dz_header][on][banner.banner][populate]=*',
  // Body zone
  'populate[dz_body][on][gallery.gallery][populate]=*',
  'populate[dz_body][on][sections.rich-text][populate]=*',
  // Footer zone
  'populate[dz_footer][on][footer.links-column][populate]=*',
  'populate[dz_footer][on][footer.contact-info][populate]=*',
  'populate[dz_footer][on][footer.social-links][populate]=*',
  'populate[dz_footer][on][footer.copyright][populate]=*',
].join('&');

const INDEX_PAGE_POPULATE = [
  'populate[dz_header][on][banner.banner][populate]=*',
  'populate[dz_header][on][menu.menu][populate][SubMenu][populate]=*',
  'populate[dz_header][on][submenu.sub-menu][populate]=*',
  'populate[dz_body][on][gallery.gallery][populate]=*',
  'populate[dz_footer][on][footer.footer][populate]=*',
].join('&');

@Injectable({ providedIn: 'root' })
export class ContentService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.strapiUrl;

  getPage(_documentId: string): Observable<PageData> {
    const key = makeStateKey<PageData>('demo-home-page');

    if (this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(cached);
    }

    return this.http
      .get<{ data: PageData[] }>(`${this.baseUrl}/api/demo-home-pages?${DEMO_HOME_POPULATE}`)
      .pipe(
        map((res) => res.data[0]),
        tap((data) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(key, data);
          }
        })
      );
  }

  getIndexPage(): Observable<PageData> {
    const key = makeStateKey<PageData>('index-page');

    if (this.transferState.hasKey(key)) {
      const cached = this.transferState.get(key, null)!;
      this.transferState.remove(key);
      return of(cached);
    }

    return this.http
      .get<{ data: PageData[] }>(`${this.baseUrl}/api/index-pages?${INDEX_PAGE_POPULATE}`)
      .pipe(
        map((res) => res.data[0]),
        tap((data) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(key, data);
          }
        })
      );
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url}`;
  }
}
