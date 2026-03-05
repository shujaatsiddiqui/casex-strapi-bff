import { Component, Input, OnChanges } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DynamicBlock, StrapiMedia } from '../../services/content.service';

@Component({
  selector: 'app-image-gallery',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './image-gallery.component.html',
  styleUrl: './image-gallery.component.css',
})
export class ImageGalleryComponent implements OnChanges {
  @Input() data!: DynamicBlock;
  galleryImages: StrapiMedia[] = [];

  ngOnChanges(): void {
    this.galleryImages = this.data?.media_gallery ?? this.data?.Images ?? [];
  }
}
