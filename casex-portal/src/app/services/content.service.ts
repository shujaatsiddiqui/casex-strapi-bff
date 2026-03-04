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
  dz_section: DynamicBlock[];
}

const DEMO_HOME_POPULATE =
  'populate[dz_section][on][banner.banner][populate]=*' +
  '&populate[dz_section][on][gallery.gallery][populate]=*';

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

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${this.baseUrl}${url}`;
  }
}
