import { Component, OnInit, inject } from '@angular/core';
import { ContentService } from '../../services/content.service';
import type { PageData } from '../../models/strapi.models';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

const HOME_PAGE_DOC_ID = 'cp5vo8z23lk9d4xp2oailb7t';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [DynamicZoneComponent],
  templateUrl: './page.component.html',
  styleUrl: './page.component.css',
})
export class PageComponent implements OnInit {
  private contentService = inject(ContentService);
  page: PageData | null = null;
  error: string | null = null;

  get pageZones() {
    if (!this.page) return [];
    return Object.entries(this.page.zones).map(([name, blocks]) => ({ name, blocks }));
  }

  ngOnInit() {
    this.contentService.getPage(HOME_PAGE_DOC_ID).subscribe({
      next: (data) => (this.page = data),
      error: (err) => {
        this.error = err.message || 'Failed to load page content';
        console.error('Content error:', err);
      },
    });
  }
}
