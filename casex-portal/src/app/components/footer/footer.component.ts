import { Component, Input } from '@angular/core';
import type { DynamicBlock } from '../../models/strapi.models';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  @Input() data!: DynamicBlock;
}
