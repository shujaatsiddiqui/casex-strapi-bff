import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';
import { IMAGE_LOADER, ImageLoaderConfig } from '@angular/common';

import { routes } from './app.routes';
import { environment } from '../environments/environment';

const strapiImageLoader = (config: ImageLoaderConfig): string =>
  config.src.startsWith('http') ? config.src : `${environment.strapiUrl}${config.src}`;

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    { provide: IMAGE_LOADER, useValue: strapiImageLoader },
  ],
};