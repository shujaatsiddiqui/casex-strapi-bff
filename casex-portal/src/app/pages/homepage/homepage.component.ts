import { Component, OnInit, inject } from '@angular/core';
import { StrapiService, HomePage } from '../../services/strapi.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DynamicZoneComponent],
  template: `
    @if (homepage) {
      <app-dynamic-zone [blocks]="homepage.dynamic_component" />
    } @else if (error) {
      <p class="error">{{ error }}</p>
    } @else {
      <p class="loading">Loading...</p>
    }
  `,
  styles: [`
    .loading { text-align: center; padding: 4rem; color: #888; }
    .error { color: #991b1b; padding: 2rem; }
  `],
})
export class HomepageComponent implements OnInit {
  private strapiService = inject(StrapiService);
  homepage: HomePage | null = null;
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
