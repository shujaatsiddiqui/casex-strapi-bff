import { Component, OnInit, inject } from '@angular/core';
import { ContentService, PageData } from '../../services/content.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

const HOME_PAGE_DOC_ID = 'cp5vo8z23lk9d4xp2oailb7t';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [DynamicZoneComponent],
  templateUrl: './page.component.html',
  styles: [`
    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      min-height: 60vh;
      color: var(--color-text-muted);
      font-size: 1rem;
    }
    .spinner {
      width: 22px;
      height: 22px;
      border: 3px solid var(--color-border);
      border-top-color: var(--color-primary);
      border-radius: 50%;
      animation: spin .7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 2rem auto;
      max-width: 600px;
      padding: 1rem 1.25rem;
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-radius: var(--radius-md);
      color: #991b1b;
      font-size: 0.95rem;
    }
  `],
})
export class PageComponent implements OnInit {
  private contentService = inject(ContentService);
  page: PageData | null = null;
  error: string | null = null;

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
