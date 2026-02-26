import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gallery">
      <h2 *ngIf="data?.Title">{{ data.Title }}</h2>
      <div class="gallery-image" *ngIf="data?.Picture">
        <img
          [src]="getImageUrl(data.Picture)"
          [alt]="data.Picture.alternativeText || data.Title || 'Gallery image'"
        />
      </div>
    </div>
  `,
  styles: [`
    .gallery {
      margin-bottom: 2rem;
      padding: 1rem;
    }
    h2 {
      color: #333;
      margin-bottom: 1rem;
    }
    .gallery-image img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
    }
  `],
})
export class GalleryComponent {
  @Input() data: any;

  getImageUrl(picture: any): string {
    if (!picture?.url) return '';
    if (picture.url.startsWith('http')) return picture.url;
    return `${environment.strapiUrl}${picture.url}`;
  }
}
