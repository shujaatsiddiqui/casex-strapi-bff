import { Component, OnInit, inject } from '@angular/core';
import { ContentService, PageData } from '../../services/content.service';
import { DynamicZoneComponent } from '../../components/dynamic-zone/dynamic-zone.component';

@Component({
  selector: 'app-index-page',
  standalone: true,
  imports: [DynamicZoneComponent],
  templateUrl: './index-page.component.html',
  styles: [`
    /* ── Page layout ── */
    .page-header { width: 100%; }
    .page-body   { width: 100%; min-height: 40vh; }
    .page-footer {
      width: 100%;
      background: var(--color-primary-dark);
      color: rgba(255,255,255,.85);
    }

    /* ── @defer placeholders ── */
    .body-placeholder  { min-height: 40vh; background: var(--color-surface); }
    .footer-placeholder { height: 80px; background: var(--color-primary-dark); }

    /* ── Loading state ── */
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

    /* ── Error state ── */
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
