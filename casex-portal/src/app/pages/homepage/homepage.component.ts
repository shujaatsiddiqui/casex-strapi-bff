import { Component, OnInit, inject } from '@angular/core';
import { StrapiService, HomePage } from '../../services/strapi.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [DynamicZoneComponent],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
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
