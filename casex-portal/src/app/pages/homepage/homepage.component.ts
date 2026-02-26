import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StrapiService, Homepage } from '../../services/strapi.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, DynamicZoneComponent],
  template: `
    <div class="homepage" *ngIf="homepage; else loading">
      <h1>{{ homepage.Title }}</h1>
      <app-dynamic-zone [blocks]="homepage.Body"></app-dynamic-zone>
    </div>
    <ng-template #loading>
      <div class="loading" *ngIf="!error">Loading...</div>
      <div class="error" *ngIf="error">
        <h2>Error loading content</h2>
        <p>{{ error }}</p>
        <p>Make sure Strapi is running on <code>http://localhost:1337</code> and the Homepage content is published.</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .homepage {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1 {
      color: #1a1a2e;
      border-bottom: 2px solid #e94560;
      padding-bottom: 0.5rem;
      margin-bottom: 2rem;
    }
    .loading {
      text-align: center;
      padding: 4rem;
      font-size: 1.2rem;
      color: #888;
    }
    .error {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: #fef2f2;
      border: 1px solid #ef4444;
      border-radius: 8px;
      color: #991b1b;
    }
    code {
      background: #fee2e2;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
    }
  `],
})
export class HomepageComponent implements OnInit {
  private strapiService = inject(StrapiService);
  homepage: Homepage | null = null;
  error: string | null = null;

  ngOnInit() {
    this.strapiService.getHomepage().subscribe({
      next: (data) => (this.homepage = data),
      error: (err) => {
        this.error = err.message || 'Failed to load homepage content';
        console.error('Strapi error:', err);
      },
    });
  }
}
