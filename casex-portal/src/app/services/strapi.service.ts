import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { isPlatformServer } from '@angular/common';
import { makeStateKey, TransferState } from '@angular/core';
import { environment } from '../../environments/environment';

export interface SubMenuItem {
  id: number;
  Name: string;
  Path: string;
  Active: boolean;
  QueryParams: Record<string, any> | null;
  Permission: string | null;
}

export interface MenuItem {
  __component: 'menu.menu';
  id: number;
  Name: string;
  Path: string;
  Active: boolean;
  QueryParams: Record<string, any>;
  Permission: string | null;
  SubMenu: SubMenuItem[];
}

export interface MainBanner {
  id: number;
  MainHeading: string;
  Caption: string;
  Description: string;
  ButtonLabelBeforeLogin: string;
  PathBeforeLogin: string;
  FileFormButtonName: string;
  FileFormButtonLink: string;
  QueryParams: Record<string, any>;
  QueryParamsBeforeLogin: Record<string, any>;
}

export interface HomePageSection {
  id: number;
  Title: string;
  Description: string;
  Short_description: string;
  slug: string;
}

export interface HomePage {
  id: number;
  documentId: string;
  HomePageTitle: string;
  HomeFeatureTitle: string;
  HomePageSection_heading: string;
  News_heading: string;
  Events_heading: string;
  home_features: any[];
  Home_page_section: HomePageSection[];
  news: any[];
  Events: any[];
  main_banners: MainBanner[];
  dynamic_component: MenuItem[];
}

const HOME_PAGE_KEY = makeStateKey<HomePage>('home-page');

const HOME_PAGE_DOC_ID = 'cp5vo8z23lk9d4xp2oailb7t';
const POPULATE_QUERY = 'populate[dynamic_component][populate]=*';

@Injectable({ providedIn: 'root' })
export class StrapiService {
  private http = inject(HttpClient);
  private transferState = inject(TransferState);
  private platformId = inject(PLATFORM_ID);
  private baseUrl = environment.strapiUrl;

  getHomepage(): Observable<HomePage> {
    if (this.transferState.hasKey(HOME_PAGE_KEY)) {
      const cached = this.transferState.get(HOME_PAGE_KEY, null)!;
      this.transferState.remove(HOME_PAGE_KEY);
      return of(cached);
    }

    return this.http
      .get<{ data: HomePage }>(`${this.baseUrl}/api/home-pages/${HOME_PAGE_DOC_ID}?${POPULATE_QUERY}`)
      .pipe(
        map((res) => res.data),
        tap((data) => {
          if (isPlatformServer(this.platformId)) {
            this.transferState.set(HOME_PAGE_KEY, data);
          }
        })
      );
  }
}
