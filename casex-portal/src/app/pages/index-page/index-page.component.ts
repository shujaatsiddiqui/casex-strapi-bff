import { Component, OnInit, inject } from '@angular/core';
import { ContentService, PageData } from '../../services/content.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [DynamicZoneComponent],
  templateUrl: './index-page.component.html',
  styleUrl: './index-page.component.css',
})
export class IndexPageComponent implements OnInit {
  private contentService = inject(ContentService);
  page: PageData | null = null;
  error: string | null = null;

  ngOnInit() {
    this.contentService.getIndexPage().subscribe({
      next: (data) => (this.page = data),
      error: (err) => {
        this.error = err.message || 'Failed to load page content';
        console.error('Content error:', err);
      },
    });
  }
}
