import { Component, Input, Type } from '@angular/core';
import { NgComponentOutlet } from '@angular/common';
import type { DynamicBlock } from '../../models/strapi.models';
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
 *
 * Set group: 'nav' on any entry whose blocks should be grouped into a
 * horizontal flex nav bar when they appear consecutively in a zone.
 */
interface RegistryEntry {
  component: Type<unknown>;
  group?: string;
}

const BLOCK_REGISTRY: Record<string, RegistryEntry> = {
  // ── Header components ──────────────────────────────────
  'banner.banner':          { component: HeroBannerComponent },
  'menu.menu':              { component: MenuItemComponent, group: 'nav' },

  // ── Body components ────────────────────────────────────
  'gallery.gallery':        { component: ImageGalleryComponent },
  'sections.rich-text':     { component: RichTextComponent },

  // ── Footer components ──────────────────────────────────
  'footer.footer':          { component: FooterComponent },

  // ── Legacy component names (kept for backward compat) ──
  'sections.hero-banner':   { component: HeroBannerComponent },
  'sections.image-gallery': { component: ImageGalleryComponent },
};

interface RenderGroup {
  navGroup: string | null;
  blocks: DynamicBlock[];
}

@Component({
  selector: 'app-dynamic-zone',
  standalone: true,
  imports: [NgComponentOutlet],
  templateUrl: './dynamic-zone.component.html',
  styleUrl: './dynamic-zone.component.css',
})
export class DynamicZoneComponent {
  @Input() blocks: DynamicBlock[] = [];

  get renderGroups(): RenderGroup[] {
    // Pre-collect all blocks that belong to a named group
    const groupedBlocks = new Map<string, DynamicBlock[]>();
    for (const block of this.blocks) {
      const g = BLOCK_REGISTRY[block.__component]?.group;
      if (g) {
        if (!groupedBlocks.has(g)) groupedBlocks.set(g, []);
        groupedBlocks.get(g)!.push(block);
      }
    }

    // Build render list in document order.
    // When the first block of a named group is encountered, emit the full group.
    // Subsequent blocks of that group are skipped (already emitted).
    const emitted = new Set<string>();
    const groups: RenderGroup[] = [];
    for (const block of this.blocks) {
      const navGroup = BLOCK_REGISTRY[block.__component]?.group ?? null;
      if (navGroup) {
        if (!emitted.has(navGroup)) {
          groups.push({ navGroup, blocks: groupedBlocks.get(navGroup)! });
          emitted.add(navGroup);
        }
      } else {
        groups.push({ navGroup: null, blocks: [block] });
      }
    }
    return groups;
  }

  resolveComponent(type: string): Type<unknown> {
    return BLOCK_REGISTRY[type]?.component ?? UnknownBlockComponent;
  }
}
