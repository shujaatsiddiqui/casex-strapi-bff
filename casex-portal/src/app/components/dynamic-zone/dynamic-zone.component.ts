import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextBlockComponent } from '../text-block/text-block.component';
import { GalleryComponent } from '../gallery/gallery.component';

@Component({
  selector: 'app-dynamic-zone',
  standalone: true,
  imports: [CommonModule, TextBlockComponent, GalleryComponent],
  template: `
    <ng-container *ngFor="let block of blocks">
      <ng-container [ngSwitch]="block.__component">
        <app-text-block
          *ngSwitchCase="'text-block.text-block'"
          [data]="block"
        ></app-text-block>
        <app-gallery
          *ngSwitchCase="'gallery.gallery'"
          [data]="block"
        ></app-gallery>
        <div *ngSwitchDefault class="unknown-block">
          Unknown component: {{ block.__component }}
        </div>
      </ng-container>
    </ng-container>
  `,
  styles: [`
    .unknown-block {
      padding: 1rem;
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      margin-bottom: 1rem;
    }
  `],
})
export class DynamicZoneComponent {
  @Input() blocks: any[] = [];
}
