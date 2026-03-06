import { Component, Input } from '@angular/core';
import type { DynamicBlock } from '../../models/strapi.models';

@Component({
  selector: 'app-menu-item',
  standalone: true,
  imports: [],
  templateUrl: './menu-item.component.html',
  styleUrl: './menu-item.component.css',
})
export class MenuItemComponent {
  @Input() data!: DynamicBlock;

  get hasSubmenu(): boolean {
    return Array.isArray(this.data.SubMenu) && this.data.SubMenu.length > 0;
  }
}
