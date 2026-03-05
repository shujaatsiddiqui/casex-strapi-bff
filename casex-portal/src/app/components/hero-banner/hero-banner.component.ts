import { Component, Input, OnChanges } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { DynamicBlock } from '../../services/content.service';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: './hero-banner.component.html',
  styleUrl: './hero-banner.component.css',
})
export class HeroBannerComponent implements OnChanges {
  @Input() data!: DynamicBlock;
  bannerImageSrc: string | null = null;

  ngOnChanges(): void {
    this.bannerImageSrc = this.data?.Banner?.url ?? null;
  }
}
