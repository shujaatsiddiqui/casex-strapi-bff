import { Component, Input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import { DynamicBlock } from '../../services/content.service';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';
import { MenuItemComponent } from '../menu-item/menu-item.component';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';
import { RichTextComponent } from '../rich-text/rich-text.component';
import { FooterComponent } from '../footer/footer.component';
import { UnknownBlockComponent } from '../unknown-block/unknown-block.component';

/**
 * BLOCK_REGISTRY — maps every Strapi __component string to its Angular component.
 *
 * To support a new Strapi component type:
 *   1. Create the Angular component (e.g. TestimonialComponent)
 *   2. Add one line here:  'sections.testimonial': TestimonialComponent
 *   DynamicZoneComponent itself never needs to change.
 */
const BLOCK_REGISTRY: Record<string, Type<unknown>> = {
  // ── Header components ──────────────────────────────────
  'banner.banner':            HeroBannerComponent,
  'menu.menu':                MenuItemComponent,

  // ── Body components ────────────────────────────────────
  'gallery.gallery':          ImageGalleryComponent,
  'sections.rich-text':       RichTextComponent,

  // ── Footer components ──────────────────────────────────
  'footer.footer':            FooterComponent,

  // ── Legacy component names (kept for backward compat) ──
  'sections.hero-banner':     HeroBannerComponent,
  'sections.image-gallery':   ImageGalleryComponent,
};

@Component({
  selector: 'app-dynamic-zone',
  standalone: true,
  imports: [NgComponentOutlet],
  template: `
    @for (block of blocks; track block.id) {
      <ng-container
        [ngComponentOutlet]="resolve(block.__component)"
        [ngComponentOutletInputs]="{ data: block }">
      </ng-container>
    }
  `,
})
export class DynamicZoneComponent {
  @Input() blocks: DynamicBlock[] = [];

  resolve(type: string): Type<unknown> {
    return BLOCK_REGISTRY[type] ?? UnknownBlockComponent;
  }
}
