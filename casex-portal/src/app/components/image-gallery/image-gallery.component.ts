import { Component, Input, OnChanges } from '@angular/core';
import { DynamicBlock, StrapiMedia } from '../../services/content.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  templateUrl: './image-gallery.component.html',
  styles: [`
    /* ── Section wrapper ── */
    .image-gallery {
      padding: 4rem 2rem;
      background: var(--color-white);
    }

    /* ── Section heading ── */
    .gallery-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }
    .gallery-header h2 {
      font-size: clamp(1.5rem, 3vw, 2rem);
      font-weight: 700;
      color: var(--color-primary-dark);
      position: relative;
      display: inline-block;
      padding-bottom: 0.6rem;
    }
    .gallery-header h2::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 48px;
      height: 3px;
      border-radius: 2px;
      background: var(--color-accent);
    }

    /* ── Grid ── */
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1.25rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* ── Card ── */
    .gallery-card {
      position: relative;
      border-radius: var(--radius-md);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      aspect-ratio: 4/3;
      background: var(--color-border);
      transition: box-shadow var(--transition), transform var(--transition);
    }
    .gallery-card:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-4px);
    }

    .gallery-card img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 380ms ease;
    }
    .gallery-card:hover img {
      transform: scale(1.06);
    }

    /* ── Caption overlay ── */
    .gallery-caption {
      position: absolute;
      inset: auto 0 0;
      padding: 0.6rem 0.9rem;
      background: linear-gradient(transparent, rgba(15,52,96,.75));
      color: var(--color-white);
      font-size: 0.8rem;
      font-weight: 500;
      opacity: 0;
      transition: opacity var(--transition);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .gallery-card:hover .gallery-caption {
      opacity: 1;
    }

    /* ── Responsive ── */
    @media (max-width: 600px) {
      .image-gallery { padding: 2.5rem 1rem; }
      .gallery-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.75rem; }
    }
  `],
})
export class ImageGalleryComponent implements OnChanges {
  @Input() data!: DynamicBlock;
  galleryImages: StrapiMedia[] = [];

  ngOnChanges(): void {
    this.galleryImages = this.data?.media_gallery ?? this.data?.Images ?? [];
  }

  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${environment.strapiUrl}${url}`;
  }
}
