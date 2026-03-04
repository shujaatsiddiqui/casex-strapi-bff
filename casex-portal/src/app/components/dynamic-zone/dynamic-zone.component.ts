import { Component, Input } from '@angular/core';
import { DynamicBlock } from '../../services/content.service';
import { HeroBannerComponent } from '../hero-banner/hero-banner.component';
import { RichTextComponent } from '../rich-text/rich-text.component';
import { ImageGalleryComponent } from '../image-gallery/image-gallery.component';

@Component({
  selector: 'app-dynamic-zone',
  standalone: true,
  imports: [HeroBannerComponent, RichTextComponent, ImageGalleryComponent],
  template: `
    @for (block of blocks; track block.id) {
      @switch (block.__component) {
        @case ('banner.banner') {
          <app-hero-banner [data]="block" />
        }
        @case ('gallery.gallery') {
          <app-image-gallery [data]="block" />
        }
        @case ('menu.menu') {
          @if (block.Active) {
            <nav class="nav-item">
              <a class="nav-link" [href]="block.Path">{{ block.Name }}</a>
              @if (block.SubMenu?.length) {
                <ul class="submenu">
                  @for (sub of block.SubMenu; track sub.id) {
                    @if (sub.Active) {
                      <li><a [href]="sub.Path">{{ sub.Name }}</a></li>
                    }
                  }
                </ul>
              }
            </nav>
          }
        }
        @case ('sections.hero-banner') {
          <app-hero-banner [data]="block" />
        }
        @case ('sections.rich-text') {
          <app-rich-text [data]="block" />
        }
        @case ('sections.image-gallery') {
          <app-image-gallery [data]="block" />
        }
      }
    }
  `,
  styles: [`
    .nav-item { position: relative; display: inline-block; }
    .nav-link { color: #1a1a2e; text-decoration: none; font-weight: 500; padding: 0.5rem 1rem; display: block; }
    .submenu { list-style: none; margin: 0; padding: 0.5rem 0; background: white; border: 1px solid #eee; border-radius: 4px; min-width: 160px; }
    .submenu li a { display: block; padding: 0.4rem 1rem; color: #333; text-decoration: none; }
    .submenu li a:hover { background: #f5f5f5; }
  `],
})
export class DynamicZoneComponent {
  @Input() blocks: DynamicBlock[] = [];
}
