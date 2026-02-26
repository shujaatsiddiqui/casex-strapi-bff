import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface StrapiResponse<T> {
  data: T;
  meta: any;
}

export interface Homepage {
  id: number;
  documentId: string;
  Title: string;
  Body: DynamicZoneBlock[];
}

export interface DynamicZoneBlock {
  __component: string;
  id: number;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class StrapiService {
  private http = inject(HttpClient);
  private baseUrl = environment.strapiUrl;

  getHomepage(): Observable<Homepage> {
    return this.http
      .get<StrapiResponse<Homepage>>(
        `${this.baseUrl}/api/homepage?populate[Body][populate]=*`
      )
      .pipe(map((res) => res.data));
  }
}
